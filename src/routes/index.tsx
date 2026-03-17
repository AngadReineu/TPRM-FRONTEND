import { createBrowserRouter } from 'react-router';
import { Shell } from '../components/layout/Shell';

import { DashboardPage }        from '../features/dashboard/pages/DashboardPage';
import { ControlsPage }         from '../features/controls/pages/ControlsPage';
import { CreateControlPage }    from '../features/controls/pages/CreateControlPage';
import { AgentsPage }           from '../features/agents/pages/AgentsPage';
import { AgentDetailPage }      from '../features/agents/pages/AgentDetailPage';
import { LibraryPage }          from '../features/library/pages/LibraryPage';
import { LibraryHealthcarePage } from '../features/library/pages/LibraryHealthcarePage';
import { VendorsPage }          from '../features/vendors/pages/VendorsPage';
import { RiskThreatPage }       from '../features/risk-assessment/pages/RiskThreatPage';
import { AuditLogsPage }        from '../features/audit-logs/pages/AuditLogsPage';
import { DocumentsPage }        from '../features/documents/pages/DocumentsPage';
import { RolesPage }            from '../features/roles/pages/RolesPage';
import { SettingsPage }         from '../features/settings/pages/SettingsPage';
import { TemplatesPage }        from '../features/templates/pages/TemplatesPage';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <h1 className="text-[48px] font-bold text-slate-900">404</h1>
      <p className="text-slate-500 text-base">Page not found</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Shell,
    children: [
      { index: true,                   Component: DashboardPage },
      { path: 'controls',              Component: ControlsPage },
      { path: 'controls/create',       Component: CreateControlPage },
      { path: 'agents',                Component: AgentsPage },
      { path: 'agents/:id',            Component: AgentDetailPage },
      { path: 'libraries',             Component: LibraryPage },
      { path: 'libraries/healthcare',  Component: LibraryHealthcarePage },
      { path: 'tprm',                  Component: VendorsPage },
      { path: 'risk-threat',           Component: RiskThreatPage },
      { path: 'audit-logs',            Component: AuditLogsPage },
      { path: 'documents',             Component: DocumentsPage },
      { path: 'roles',                 Component: RolesPage },
      { path: 'settings',              Component: SettingsPage },
      { path: 'templates',             Component: TemplatesPage },
      { path: '*',                     Component: NotFound },
    ],
  },
]);
