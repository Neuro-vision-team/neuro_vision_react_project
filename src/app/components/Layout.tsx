import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router";
import { useLanguage } from "../language-context";
import { useTheme } from "../theme-context";
import { useAuth } from "../auth/auth-context";
import { useEffect, useState } from "react";
import type { Team } from "../types/team";

export const Layout = () => {
  const { isArabic } = useLanguage();
  const { isDark } = useTheme();
  const { getTeamData, session } = useAuth();
  const [teamData, setTeamData] = useState<Team | null>(null);

  useEffect(() => {
    const data = getTeamData();
    setTeamData(data);
  }, [session, getTeamData]);

  return (
    <div
      className={`flex min-h-screen transition-colors ${
        isDark ? "bg-slate-950" : "bg-[linear-gradient(180deg,#fbfdff_0%,#f1f6fb_100%)]"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Sidebar />
      <main
        className={`flex-1 p-8 transition-colors ${
          isDark ? "text-slate-100" : "text-slate-900"
        } ${isArabic ? "mr-64" : "ml-64"}`}
      >
        <div className="max-w-6xl mx-auto">
          <Outlet context={{ teamData }} />
        </div>
      </main>
    </div>
  );
};
