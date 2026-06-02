import { Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Skeleton } from '../components/ui';
import { RequireAuth } from './RequireAuth';
import { getSessionUser } from '../services/authMock';


const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const LiveSessionsPage = lazy(() => import('../pages/LiveSessionsPage'));
const AssessmentMedicalPage = lazy(() => import('../pages/AssessmentMedicalPage'));
const MyTeamPage = lazy(() => import('../pages/MyTeamPage'));
const MedicalTeamPage = lazy(() => import('../pages/MedicalTeamPage'));
const BaselinePage = lazy(() => import('../pages/BaselinePage'));
const AiPage = lazy(() => import('../pages/AiPage'));
const ScatPage = lazy(() => import('../pages/ScatPage'));
const PlrPage = lazy(() => import('../pages/PlrPage'));
const EmergencyPage = lazy(() => import('../pages/EmergencyPage'));
const TeamsPage = lazy(() => import('../pages/TeamsPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const Verify2FAPage = lazy(() => import('../pages/auth/Verify2FAPage'));

const withSuspense = (node: React.ReactNode) => <Suspense fallback={<div className="p-6"><Skeleton className="h-32 w-full" /></div>}>{node}</Suspense>;


const DashboardIndex = () => {
  const user = getSessionUser();
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role === 'Medical Team Manager') return <Navigate to="my-team" replace />;
  return withSuspense(<DashboardPage />);
};

export const router = createBrowserRouter([
 { path: '/', element: withSuspense(<LoginPage />) },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/dashboard',
        element: <MainLayout />,
        children: [
          { index: true, element: <DashboardIndex /> },
          { path: 'assessments', element: withSuspense(<AssessmentMedicalPage />) },
          { path: 'my-team', element: withSuspense(<MyTeamPage />) },
          { path: 'medical-team', element: withSuspense(<MedicalTeamPage />) },
          { path: 'baseline', element: withSuspense(<BaselinePage />) },
          { path: 'live-sessions', element: withSuspense(<LiveSessionsPage />) },
          { path: 'ai-analysis', element: withSuspense(<AiPage />) },
          { path: 'scat5', element: withSuspense(<ScatPage />) },
          { path: 'plr', element: withSuspense(<PlrPage />) },
          { path: 'emergency', element: withSuspense(<EmergencyPage />) },
          { path: 'teams', element: withSuspense(<TeamsPage />) },
          { path: 'analytics', element: withSuspense(<AnalyticsPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
        ],
      },
    ],
  },
  { path: '/auth/login', element: withSuspense(<LoginPage />) },
  { path: '/auth/register', element: withSuspense(<RegisterPage />) },
  { path: '/auth/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
  { path: '/auth/verify-2fa', element: withSuspense(<Verify2FAPage />) },
]);

