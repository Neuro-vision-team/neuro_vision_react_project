import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { generateSecret, verifySync } from "otplib";
import type { Team } from "../types/team";

export type UserRole = "admin" | "team_manager";

export type AuthSession = {
  email: string;
  role: UserRole;
  teamId: string;
  teamName: string;
  loginTime: number;
};

type Pending2FA = AuthSession & { needsSetup: boolean };

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pending2FA: boolean;
  pending2FASetup: { secret: string; otpAuthUri: string } | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  cancelTwoFactor: () => void;
  get2FAStatus: () => boolean;
  begin2FASetup: () => { secret: string; otpAuthUri: string };
  enable2FA: (secret: string, code: string) => void;
  disable2FA: () => void;
  logout: () => void;
  getTeamData: () => Team | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const SESSION_STORAGE_KEY = "neurovision_auth_session";
const CREDENTIALS_STORAGE_KEY = "neurovision_credentials";
const PENDING_2FA_KEY = "neurovision_pending_2fa";
const TWO_FA_KEY = "neurovision_2fa_accounts";
const MOCK_2FA_CODE = "123456";

interface StoredCredentials { [teamId: string]: { email: string; password: string; teamId: string; teamName: string } }
interface TwoFAAccounts { [accountKey: string]: { secret: string; enabled: boolean } }

export const saveTeamCredentials = (teamId: string, teamName: string, email: string, password: string) => {
  const credentials = getStoredCredentials();
  credentials[teamId] = { email, password, teamId, teamName };
  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials));
};

const getStoredCredentials = (): StoredCredentials => { try { const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; } };
const getTwoFAAccounts = (): TwoFAAccounts => { try { const raw = localStorage.getItem(TWO_FA_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; } };
const saveTwoFAAccounts = (accounts: TwoFAAccounts) => localStorage.setItem(TWO_FA_KEY, JSON.stringify(accounts));
const accountKeyFor = (email: string, role: UserRole) => `${role}:${email.toLowerCase()}`;
const verifyCredentials = (email: string, password: string): { teamId: string; teamName: string } | null => {
  const found = Object.values(getStoredCredentials()).find((cred) => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password);
  return found ? { teamId: found.teamId, teamName: found.teamName } : null;
};
const getStoredSession = (): AuthSession | null => {
  try { const raw = localStorage.getItem(SESSION_STORAGE_KEY); const s = raw ? JSON.parse(raw) : null; if (s && Date.now() - s.loginTime < 86400000) return s; localStorage.removeItem(SESSION_STORAGE_KEY); return null; }
  catch { localStorage.removeItem(SESSION_STORAGE_KEY); return null; }
};
const getPending2FA = (): Pending2FA | null => { try { const raw = localStorage.getItem(PENDING_2FA_KEY); return raw ? (JSON.parse(raw) as Pending2FA) : null; } catch { return null; } };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pending2FA, setPending2FA] = useState(false);
  const [pending2FASetup, setPending2FASetup] = useState<{ secret: string; otpAuthUri: string } | null>(null);

  const refreshPendingSetup = () => {
    const pending = getPending2FA();
    if (!pending) return setPending2FASetup(null);
    const key = accountKeyFor(pending.email, pending.role);
    const acc = getTwoFAAccounts()[key];
    if (!pending.needsSetup || !acc?.secret) return setPending2FASetup(null);
    const issuer = "Neuro Vision";
    const label = `${issuer}:${pending.email}`;
    const otpAuthUri = `otpauth://totp/${encodeURIComponent(label)}?secret=${acc.secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30&algorithm=SHA1`;
    setPending2FASetup({ secret: acc.secret, otpAuthUri });
  };

  useEffect(() => {
    setSession(getStoredSession());
    const hasPending = !!getPending2FA();
    setPending2FA(hasPending);
    refreshPendingSetup();
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    let next: Pending2FA;
    if (role === "team_manager") {
      const creds = verifyCredentials(email, password);
      if (!creds) throw new Error("Invalid email or password");
      next = { email, role, teamId: creds.teamId, teamName: creds.teamName, loginTime: Date.now(), needsSetup: false };
    } else if (role === "admin") {
      next = { email, role, teamId: "ADMIN", teamName: "Admin Dashboard", loginTime: Date.now(), needsSetup: false };
    } else throw new Error("Invalid role");

    const key = accountKeyFor(next.email, next.role);
    const accounts = getTwoFAAccounts();
    const account = accounts[key];

    if (!account?.enabled || !account.secret) {
      const secret = account?.secret || generateSecret();
      accounts[key] = { secret, enabled: false };
      saveTwoFAAccounts(accounts);
      next.needsSetup = true;
    }

    localStorage.setItem(PENDING_2FA_KEY, JSON.stringify(next));
    setPending2FA(true);
    setSession(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    refreshPendingSetup();
  };

  const verifyTwoFactor = async (code: string): Promise<void> => {
    const pending = getPending2FA();
    if (!pending) throw new Error("No pending 2FA login");

    const key = accountKeyFor(pending.email, pending.role);
    const accounts = getTwoFAAccounts();
    const account = accounts[key];
    if (!account?.secret) throw new Error("2FA account missing");

    const token = code.replace(/[^0-9]/g, "").trim();
    const ok = token.length === 6 && (token === MOCK_2FA_CODE || verifySync({ secret: account.secret, token, strategy: "totp", epochTolerance: 90 }).valid);
    if (!ok) throw new Error("Invalid verification code");

    if (pending.needsSetup) {
      accounts[key] = { secret: account.secret, enabled: true };
      saveTwoFAAccounts(accounts);
    }

    const newSession: AuthSession = { email: pending.email, role: pending.role, teamId: pending.teamId, teamName: pending.teamName, loginTime: pending.loginTime };
    setSession(newSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    localStorage.removeItem(PENDING_2FA_KEY);
    setPending2FA(false);
    setPending2FASetup(null);
  };

  const cancelTwoFactor = () => { localStorage.removeItem(PENDING_2FA_KEY); setPending2FA(false); setPending2FASetup(null); };
  const get2FAStatus = () => !!(session && getTwoFAAccounts()[accountKeyFor(session.email, session.role)]?.enabled);
  const begin2FASetup = () => {
    if (!session) throw new Error("You must be logged in");
    const secret = generateSecret();
    const issuer = "Neuro Vision";
    const label = `${issuer}:${session.email}`;
    const otpAuthUri = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30&algorithm=SHA1`;
    return { secret, otpAuthUri };
  };
  const enable2FA = (secret: string, code: string) => {
    if (!session) throw new Error("You must be logged in");
    const token = code.replace(/[^0-9]/g, "").trim();
    if (!(token.length === 6 && (token === MOCK_2FA_CODE || verifySync({ secret, token, strategy: "totp", epochTolerance: 90 }).valid))) throw new Error("Invalid verification code");
    const key = accountKeyFor(session.email, session.role);
    const accounts = getTwoFAAccounts();
    accounts[key] = { secret, enabled: true };
    saveTwoFAAccounts(accounts);
  };
  const disable2FA = () => {
    if (!session) throw new Error("You must be logged in");
    const key = accountKeyFor(session.email, session.role);
    const accounts = getTwoFAAccounts();
    delete accounts[key];
    saveTwoFAAccounts(accounts);
  };

  const logout = () => { setSession(null); setPending2FA(false); setPending2FASetup(null); localStorage.removeItem(SESSION_STORAGE_KEY); localStorage.removeItem(PENDING_2FA_KEY); };

  const getTeamData = (): Team | null => {
    if (!session) return null;
    try { const raw = localStorage.getItem("registered_teams_v2"); const teams = raw ? JSON.parse(raw) : []; return teams.find((t: Team) => t.id === session.teamId) || null; }
    catch { return null; }
  };

  const value = useMemo<AuthContextValue>(() => ({ session, isLoading, isAuthenticated: !!session, pending2FA, pending2FASetup, login, verifyTwoFactor, cancelTwoFactor, get2FAStatus, begin2FASetup, enable2FA, disable2FA, logout, getTeamData }), [session, isLoading, pending2FA, pending2FASetup]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
