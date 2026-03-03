import { createBrowserRouter } from 'react-router';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { Controls } from './pages/Controls';
import { CreateControl } from './pages/CreateControl';
import { Agents } from './pages/Agents';
import { AgentDetail } from './pages/AgentDetail';
import { Library } from './pages/Library';
import { LibraryHealthcare } from './pages/LibraryHealthcare';
import { TPRM } from './pages/TPRM';
import { RiskThreat } from './pages/RiskThreat';
import { AuditLogs } from './pages/AuditLogs';
import { Documents } from './pages/Documents';
import { Roles } from './pages/Roles';
import { Settings } from './pages/Settings';
import { Templates } from './pages/Templates';

function NotFound() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, color: '#0F172A' }}>404</h1>
      <p style={{ color: '#64748B', fontSize: 16 }}>Page not found</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Shell,
    children: [
      { index: true, Component: Dashboard },
      { path: 'controls', Component: Controls },
      { path: 'controls/create', Component: CreateControl },
      { path: 'agents', Component: Agents },
      { path: 'agents/:id', Component: AgentDetail },
      { path: 'libraries', Component: Library },
      { path: 'libraries/healthcare', Component: LibraryHealthcare },
      { path: 'tprm', Component: TPRM },
      { path: 'risk-threat', Component: RiskThreat },
      { path: 'audit-logs', Component: AuditLogs },
      { path: 'documents', Component: Documents },
      { path: 'roles', Component: Roles },
      { path: 'settings', Component: Settings },
      { path: 'templates', Component: Templates },
      { path: '*', Component: NotFound },
    ],
  },
]);