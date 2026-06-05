/* eslint-disable react-refresh/only-export-components -- route config module, not a fast-refresh component file */
import { Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { RequireAuth } from './RequireAuth';
import { BlockMedicalStaff } from './BlockMedicalStaff';
import { RoleGuard } from './RoleGuard';
import { getStoredSessionUser } from '../../services/api/auth-session';

// ─── Auth pages ───────────────────────────────────────────────────────────────
const LoginPage        = lazy(() => import('../../pages/auth/LoginPage'));
const Verify2FAPage    = lazy(() => import('../../pages/auth/Verify2FAPage'));
const UnauthorizedPage = lazy(() => import('../../pages/auth/UnauthorizedPage'));

// ─── Admin pages ──────────────────────────────────────────────────────────────
const AdminDashboardPage = lazy(() => import('../../pages/admin/DashboardPage'));
const TeamsPage          = lazy(() => import('../../pages/admin/TeamsPage'));
const TeamDetailsPage    = lazy(() => import('../../pages/admin/TeamDetailsPage'));
const TeamAssignmentPage = lazy(() => import('../../pages/admin/TeamAssignmentPage'));
const AuditLogsPage      = lazy(() => import('../../pages/admin/AuditLogsPage'));
const SettingsPage       = lazy(() => import('../../pages/admin/SettingsPage'));

// ─── Manager pages ────────────────────────────────────────────────────────────
const ManagerOverviewPage = lazy(() => import('../../pages/manager/ManagerOverviewPage'));
const ManagerStaffPage    = lazy(() => import('../../pages/manager/ManagerStaffPage'));

// ─── Shared pages (both roles) ────────────────────────────────────────────────
const PlayersPage             = lazy(() => import('../../pages/shared/PlayersPage'));
const PlayerDetailsPage       = lazy(() => import('../../pages/shared/PlayerDetailsPage'));
const PlayerTimelinePage      = lazy(() => import('../../pages/shared/PlayerTimelinePage'));
const AssessmentsPage         = lazy(() => import('../../pages/shared/AssessmentsPage'));
const AssessmentDetailsPage   = lazy(() => import('../../pages/shared/AssessmentDetailsPage'));
const AssessmentComparisonPage = lazy(() => import('../../pages/shared/AssessmentComparisonPage'));
const ReportsPage             = lazy(() => import('../../pages/shared/ReportsPage'));
const ReportDetailsPage       = lazy(() => import('../../pages/shared/ReportDetailsPage'));
const AnalyticsPage           = lazy(() => import('../../pages/shared/AnalyticsPage'));
const SecurityPage            = lazy(() => import('../../pages/shared/SecurityPage'));

// ─── Suspense wrapper ─────────────────────────────────────────────────────────
function s(node: React.ReactNode) {
  return (
    <Suspense fallback={
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    }>
      {node}
    </Suspense>
  );
}

// ─── Dashboard index — role-based resolution ──────────────────────────────────
function DashboardIndex() {
  const user = getStoredSessionUser();
  if (!user)                                  return <Navigate to="/auth/login" replace />;
  if (user.role === 'Medical Staff')          return <Navigate to="/unauthorized-dashboard-access" replace />;
  if (user.role === 'Medical Team Manager')   return <Navigate to="my-team" replace />;
  return s(<AdminDashboardPage />);
}

// ─── Role guard helpers ───────────────────────────────────────────────────────
const adminOnly  = (node: React.ReactNode) =>
  <RoleGuard roles={['Admin']} fallback="/dashboard/my-team">{s(node)}</RoleGuard>;
const managerOnly = (node: React.ReactNode) =>
  <RoleGuard roles={['Medical Team Manager']} fallback="/dashboard">{s(node)}</RoleGuard>;
const bothRoles  = (node: React.ReactNode) =>
  <RoleGuard roles={['Admin', 'Medical Team Manager']}>{s(node)}</RoleGuard>;

export const router = createBrowserRouter([
  // ─── Public ─────────────────────────────────────────────────────────────────
  { path: '/',                              element: s(<LoginPage />) },
  { path: '/auth/login',                    element: s(<LoginPage />) },
  { path: '/auth/verify-2fa',               element: s(<Verify2FAPage />) },
  { path: '/unauthorized-dashboard-access', element: s(<UnauthorizedPage />) },

  // ─── Protected ───────────────────────────────────────────────────────────────
  {
    element: <RequireAuth />,            // Layer 1: token + user
    children: [
      {
        element: <BlockMedicalStaff />,  // Layer 2: block medical_staff
        children: [
          {
            path: '/dashboard',
            element: <MainLayout />,
            children: [
              { index: true, element: <DashboardIndex /> },

              // Admin only
              { path: 'teams',                  element: adminOnly(<TeamsPage />) },
              { path: 'teams/:id',              element: adminOnly(<TeamDetailsPage />) },
              { path: 'teams/:id/assignment',   element: adminOnly(<TeamAssignmentPage />) },
              { path: 'audit-logs',             element: adminOnly(<AuditLogsPage />) },
              { path: 'settings',               element: adminOnly(<SettingsPage />) },

              // Manager only
              { path: 'my-team',                element: managerOnly(<ManagerOverviewPage />) },
              { path: 'medical-staff',           element: managerOnly(<ManagerStaffPage />) },

              // Both roles
              { path: 'players',                element: bothRoles(<PlayersPage />) },
              { path: 'players/:id',            element: bothRoles(<PlayerDetailsPage />) },
              { path: 'players/:id/timeline',   element: bothRoles(<PlayerTimelinePage />) },
              { path: 'assessments',            element: bothRoles(<AssessmentsPage />) },
              { path: 'assessments/compare',    element: bothRoles(<AssessmentComparisonPage />) },
              { path: 'assessments/:id',        element: bothRoles(<AssessmentDetailsPage />) },
              { path: 'reports',                element: bothRoles(<ReportsPage />) },
              { path: 'reports/:id',            element: bothRoles(<ReportDetailsPage />) },
              { path: 'analytics',              element: bothRoles(<AnalyticsPage />) },
              { path: 'security',               element: bothRoles(<SecurityPage />) },
            ],
          },
        ],
      },
    ],
  },
]);
