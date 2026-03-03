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
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <Sidebar />
      {/* Offset for fixed sidebar */}
      <div style={{ width: 240, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar title={title} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
