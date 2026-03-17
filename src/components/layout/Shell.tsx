import { Outlet, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/controls': 'Controls',
  '/controls/create': 'Create Control',
  '/agents': 'Agents',
  '/libraries': 'Library',
  '/libraries/healthcare': 'Healthcare / Insurance Template',
  '/tprm': 'Third Party Risk Management',
  '/risk-threat': 'Risk Threat',
  '/audit-logs': 'Audit Logs',
  '/documents': 'Document RAG',
  '/roles': 'Roles + Access',
  '/settings': 'Settings',
};

export function Shell() {
  const location = useLocation();
  const title = routeTitles[location.pathname] ?? 'TPRM Platform';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-[Inter,sans-serif]">
      <Sidebar />
      {/* Offset for fixed sidebar */}
      <div className="w-60 shrink-0" />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto py-6 px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
