import { createBrowserRouter, Navigate } from 'react-router';
import { Shell } from '../components/layout/Shell';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

import { LoginPage }             from '../features/auth/pages/LoginPage';
import { RegisterPage }          from '../features/auth/pages/RegisterPage';
import { DashboardPage }         from '../features/dashboard/pages/DashboardPage';
import { ControlsPage }          from '../features/controls/pages/ControlsPage';
import { CreateControlPage }     from '../features/controls/pages/CreateControlPage';
import { ViewControlPage }       from '../features/controls/pages/ViewControlPage';
import { AgentsPage }            from '../features/agents/pages/AgentsPage';
import { AgentDetailPage }       from '../features/agents/pages/AgentDetailPage';
import { LibraryPage }           from '../features/library/pages/LibraryPage';
import { LibraryHealthcarePage } from '../features/library/pages/LibraryHealthcarePage';
import { VendorsPage }           from '../features/vendors/pages/VendorsPage';
import { RiskThreatPage }        from '../features/risk-assessment/pages/RiskThreatPage';
import { AuditLogsPage }         from '../features/audit-logs/pages/AuditLogsPage';
import { DocumentsPage }         from '../features/documents/pages/DocumentsPage';
import { RolesPage }             from '../features/roles/pages/RolesPage';
import { SettingsPage }          from '../features/settings/pages/SettingsPage';
import { TemplatesPage }         from '../features/templates/pages/TemplatesPage';

// Supplier portal — public route, no auth required
import { SupplierPortalPage }    from '../features/portal/pages/SupplierPortalPage';
import { AgentLogsPage } from '../features/agents/pages/AgentLogPage';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <h1 className="text-[48px] font-bold text-slate-900">404</h1>
      <p className="text-slate-500 text-base">Page not found</p>
    </div>
  );
}

function ProtectedShell() {
  return (
    <ProtectedRoute>
      <Shell />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  // Auth routes (public)
  { path: '/login',    Component: LoginPage },
  { path: '/register', Component: RegisterPage },

  // Supplier portal — public, no login needed
  // Supplier receives a link like: https://yourdomain.com/portal/abc123token
  { path: '/portal/:token/*', Component: SupplierPortalPage },

  // Protected app routes
  {
    path: '/',
    Component: ProtectedShell,
    children: [
      { index: true,                   Component: DashboardPage },
      { path: 'controls',              Component: ControlsPage },
      { path: 'controls/create',       Component: CreateControlPage },
      { path: 'controls/:id',          Component: ViewControlPage },
      { path: 'agents',                Component: AgentsPage },
      { path: 'agents/logs',           Component: AgentLogsPage },
      { path: 'agents/:id',            Component: AgentDetailPage },
      { path: 'agents/:id/logs',       Component: AgentLogsPage },
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