import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { logoutApi } from '../../services/api/auth.api';
import { clearSession } from '../../services/api/auth-session';
import { useI18n } from '../../hooks/useI18n';

export function MainLayout() {
  const { isArabic } = useI18n();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Swallow — always clear client state
    } finally {
      clearSession();
      navigate('/auth/login', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100" dir={isArabic ? 'rtl' : 'ltr'}>
      <Sidebar />
      <div className={isArabic ? 'md:pr-[17rem]' : 'md:pl-[17rem]'} style={{ flex: 1 }}>
        <Topbar onLogout={onLogout} />
        <main className="min-h-screen space-y-6 px-4 pb-10 pt-24 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
