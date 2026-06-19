import { useEffect } from 'react';
import { toast } from 'sonner';
import { verificationService } from '@/services/verification';
import { dataService } from '@/services/data';

export function useOfflineSync(onSyncComplete?: () => void) {
  useEffect(() => {
    const handleSync = async () => {
      if (!navigator.onLine) return;

      let syncPerformed = false;

      // Sync Findings
      const offlineFindings = JSON.parse(localStorage.getItem('offline_findings_queue') || '[]');
      if (offlineFindings.length > 0) {
        toast.info('Back online. Synchronizing findings...');
        const remainingFindings = [];
        for (const finding of offlineFindings) {
          try {
            await verificationService.createFinding(finding);
            syncPerformed = true;
          } catch (e) {
            console.error('Failed to sync finding:', e);
            remainingFindings.push(finding);
          }
        }
        if (remainingFindings.length > 0) {
          localStorage.setItem('offline_findings_queue', JSON.stringify(remainingFindings));
        } else {
          localStorage.removeItem('offline_findings_queue');
        }
      }

      // Sync Status Updates
      const offlineUpdates = JSON.parse(localStorage.getItem('offline_status_updates') || '{}');
      const remainingUpdates: Record<string, string> = {};
      const updateEntries = Object.entries(offlineUpdates);

      if (updateEntries.length > 0) {
        toast.info('Synchronizing status updates...');
        for (const [id, status] of updateEntries) {
          try {
            await verificationService.updateClaimStatus(id, status as any);
            syncPerformed = true;
          } catch (e) {
            console.error('Failed to sync status update:', e);
            remainingUpdates[id] = status as string;
          }
        }
        if (Object.keys(remainingUpdates).length > 0) {
          localStorage.setItem('offline_status_updates', JSON.stringify(remainingUpdates));
        } else {
          localStorage.removeItem('offline_status_updates');
        }
      }

      if (syncPerformed) {
        toast.success('Offline data synchronized');
        if (onSyncComplete) onSyncComplete();
      }

      // Also cache reference data when online
      if (navigator.onLine) {
        try {
          const [facilities, dashboard] = await Promise.all([
             verificationService.getVerificationQueue('all'), // Simple way to trigger data fetch
             dataService.getVerificationDashboard()
          ]);
          if (facilities || dashboard) {
             console.log('Reference data refreshed in background');
          }
        } catch (e) {
          // Ignore background refresh errors
        }
      }
    };

    window.addEventListener('online', handleSync);
    // Also try to sync on mount if online
    if (navigator.onLine) handleSync();

    return () => window.removeEventListener('online', handleSync);
  }, [onSyncComplete]);

  const queueFinding = (finding: any) => {
    const offlineQueue = JSON.parse(localStorage.getItem('offline_findings_queue') || '[]');
    offlineQueue.push(finding);
    localStorage.setItem('offline_findings_queue', JSON.stringify(offlineQueue));
    toast.info('Finding saved locally (offline mode)');
  };

  const queueStatusUpdate = (claimId: string, status: string) => {
    const offlineUpdates = JSON.parse(localStorage.getItem('offline_status_updates') || '{}');
    offlineUpdates[claimId] = status;
    localStorage.setItem('offline_status_updates', JSON.stringify(offlineUpdates));
    toast.info('Status update saved locally (offline mode)');
  };

  return { queueFinding, queueStatusUpdate };
}
