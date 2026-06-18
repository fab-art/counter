import { Metadata } from 'next';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Audit Logs | RSSB ERP',
};

const mockLogs = [
  {
    id: '1',
    userId: '101',
    userName: 'John Doe',
    action: 'LOGIN',
    entity: 'AUTH',
    details: 'User logged in from 192.168.1.1',
    timestamp: new Date(),
  },
  {
    id: '2',
    userId: '101',
    userName: 'John Doe',
    action: 'CREATE_CASE',
    entity: 'CASE',
    details: 'Created case CV-2024-001 for ABC Pharmacy',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    userId: '102',
    userName: 'Jane Smith',
    action: 'UPDATE_SETTINGS',
    entity: 'SYSTEM',
    details: 'Modified maintenance mode settings',
    timestamp: new Date(Date.now() - 7200000),
  },
];

export default function AuditLogsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-1 flex-col transition-all duration-300 ml-64">
        <Header />
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Audit Logs
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Complete history of system activities
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Entity</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {mockLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {format(log.timestamp, 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 font-medium">{log.userName}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{log.action}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{log.entity}</td>
                    <td className="px-6 py-4 text-gray-500">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
