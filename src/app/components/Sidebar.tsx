import { NavLink, useNavigate } from "react-router";
import { Users, FileText, Settings, BrainCircuit, Languages, Moon, Sun, LogOut } from "lucide-react";
import { useLanguage } from "../language-context";
import { useTheme } from "../theme-context";
import { useI18n } from "../i18n";
import { useAuth } from "../auth/auth-context";

export const Sidebar = () => {
  const { isArabic, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useI18n();
  const { logout, session } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { name: t("Team Registration"), icon: Users, path: "/" },
    { name: t("Teams Management"), icon: FileText, path: "/teams-management" },
    { name: t("Settings"), icon: Settings, path: "/settings" },
  ];

  return (
    <aside
      className={`w-64 h-screen fixed top-0 flex flex-col transition-colors ${
        isDark
          ? "bg-slate-950 text-white border-slate-800"
          : "theme-surface text-slate-900 border border-slate-200/70 shadow-[0_18px_45px_rgba(31,74,116,0.08)]"
      } ${isArabic ? "right-0 border-l" : "left-0 border-r"}`}
    >
      <div className={`p-4 border-b ${isDark ? "border-slate-800" : "border-slate-200/70"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-lg tracking-tight truncate">
            {t("Dashboard")}
          </span>
        </div>
        {session && (
          <div className={`mt-3 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            <p className="truncate">{session.email}</p>
            <p className="text-teal-500 font-semibold">{session.teamName}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                  : isDark
                    ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                    : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${isDark ? "bg-teal-500/15 border-teal-400/40 text-teal-300" : "theme-surface-soft border-slate-200 text-slate-700"}`}
            title={isDark ? t("Disable dark mode") : t("Enable dark mode")}
            aria-label={isDark ? t("Disable dark mode") : t("Enable dark mode")}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleLanguage}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
              isDark ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white" : "theme-surface-soft hover:bg-white border-slate-200 text-slate-900"
            }`}
            title={isArabic ? t("Switch to English") : t("Switch to Arabic")}
          >
            <Languages className="w-4 h-4" />
            {isArabic ? "EN" : "AR"}
          </button>
        </div>

        {session && (
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
              isDark ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400" : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600 shadow-sm"
            }`}
            title={t("Logout")}
          >
            <LogOut className="w-4 h-4" />
            {t("Logout")}
          </button>
        )}
      </div>
    </aside>
  );
};

