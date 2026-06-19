import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { claimRepository } from '@/repositories/claim.repository';

export interface ImportResult {
  total: number;
  success: number;
  errors: Array<{ row: number; message: string }>;
}

export const importService = {
  /**
   * Processes an Excel or CSV file for claim imports
   */
  async processImport(file: File, caseId: string, userId: string): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet);

          const results: ImportResult = {
            total: json.length,
            success: 0,
            errors: []
          };

          // Record import start
          const { data: importRec } = await supabase
            .from('imports')
            .insert({
              file_name: file.name,
              total_records: json.length,
              created_by: userId,
              status: 'PROCESSING'
            } as any)
            .select()
            .single();

          for (let i = 0; i < json.length; i++) {
            const row = json[i];
            try {
              // Basic validation
              if (!row.claim_number || !row.patient_name || !row.total_amount) {
                throw new Error('Missing mandatory fields');
              }

              // Duplicate detection (database level check)
              const { data: existing } = await supabase
                .from('claims')
                .select('id')
                .eq('claim_number', row.claim_number)
                .maybeSingle();

              if (existing) {
                throw new Error(`Duplicate claim number: ${row.claim_number}`);
              }

              // Transform row to claim schema
              const claimData = {
                case_id: caseId,
                claim_number: String(row.claim_number),
                patient_name: row.patient_name,
                patient_id: String(row.patient_id || 'UNKNOWN'),
                total_amount: Number(row.total_amount),
                insurance_copayment: Number(row.insurance_amount || (row.total_amount * 0.85)),
                status: 'UNREVIEWED',
                facility_id: row.facility_id, // Assumes mapping provided in file
                dispensing_date: row.date ? new Date(row.date).toISOString().split('T')[0] : null,
              };

              await claimRepository.create(claimData as any);
              results.success++;

            } catch (err: any) {
              results.errors.push({ row: i + 2, message: err.message });

              if (importRec) {
                await supabase.from('import_errors').insert({
                    import_id: (importRec as any).id,
                    row_number: i + 2,
                    error_message: err.message,
                    raw_data: row
                } as any);
              }
            }
          }

          // Update import completion
          if (importRec) {
            await supabase.from('imports').update({
                status: results.errors.length === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS',
                processed_records: results.success,
                error_count: results.errors.length,
                completed_at: new Date().toISOString()
            } as any).eq('id', (importRec as any).id);
          }

          resolve(results);

        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  }
};
