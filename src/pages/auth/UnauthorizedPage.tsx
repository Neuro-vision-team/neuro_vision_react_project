import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clearSession } from '../../services/api/auth-session';

/**
 * Shown when a Medical Staff user tries to access the dashboard.
 * Medical Staff must use the Flutter mobile application.
 */
export default function UnauthorizedPage() {
  function handleLogout() {
    clearSession();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-4 text-slate-100">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10">
        <ShieldX size={40} className="text-rose-400" />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-50">Dashboard Access Restricted</h1>
        <p className="mt-3 max-w-md text-slate-400">
          Dashboard access is not available for Medical Staff. Please use the mobile application.
        </p>
      </div>

      <Link
        to="/auth/login"
        onClick={handleLogout}
        className="rounded-xl border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-slate-100"
      >
        Back to Login
      </Link>
    </div>
  );
}
