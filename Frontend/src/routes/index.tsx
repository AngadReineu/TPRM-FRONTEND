import { createBrowserRouter, Navigate } from 'react-router';
import { Shell } from '../components/layout/Shell';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

import { LoginPage }             from '../features/auth/pages/LoginPage';
import { RegisterPage }          from '../features/auth/pages/RegisterPage';
import { DashboardPage }         from '../features/dashboard/pages/DashboardPage';
import { LibraryPage }           from '../features/library/pages/LibraryPage';
import { LibraryHealthcarePage } from '../features/library/pages/LibraryHealthcarePage';
import { VendorsPage }           from '../features/vendors/pages/VendorsPage';
import { RiskThreatPage }        from '../features/risk-assessment/pages/RiskThreatPage';
import { AuditLogsPage }         from '../features/audit-logs/pages/AuditLogsPage';
import { RolesPage }             from '../features/roles/pages/RolesPage';
import { SettingsPage }          from '../features/settings/pages/SettingsPage';

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

  // Protected app routes
  {
    path: '/',
    Component: ProtectedShell,
    children: [
      { index: true,                   Component: DashboardPage },
      { path: 'libraries',             Component: LibraryPage },
      { path: 'libraries/healthcare',  Component: LibraryHealthcarePage },
      { path: 'tprm',                  Component: VendorsPage },
      { path: 'risk-threat',           Component: RiskThreatPage },
      { path: 'audit-logs',            Component: AuditLogsPage },
      { path: 'roles',                 Component: RolesPage },
      { path: 'settings',              Component: SettingsPage },
      { path: '*',                     Component: NotFound },
    ],
  },
]);