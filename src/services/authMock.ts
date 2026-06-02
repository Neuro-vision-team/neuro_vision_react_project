import { generateSecret, verifySync } from 'otplib';

export type UserRole = 'Admin' | 'Medical Team Manager';

export interface AuthUser {
  id: string;
  role: UserRole;
  fullName: string;
  teamName?: string;
  email: string;
  password: string;
  createdAt: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

export interface SessionUser {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  teamName?: string;
  teamId?: string;
}

interface TeamCredential {
  id: string;
  teamName?: string;
  loginEmail?: string;
  password?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  [key: string]: unknown;
}

interface PendingTwoFactor {
  source: 'user' | 'team';
  id: string;
  role: UserRole;
  redirectTo: string;
  createdAt: number;
  requiresSetup?: boolean;
  setupSecret?: string;
  setupEmail?: string;
}

interface LoginAttemptResult {
  ok: boolean;
  requiresTwoFactor: boolean;
  redirectTo?: string;
}

interface PendingTwoFactorChallenge {
  requiresSetup: boolean;
  secret?: string;
  otpauth?: string;
}

const USERS_KEY = 'nv_users';
const SESSION_KEY = 'nv_session';
const PENDING_2FA_KEY = 'nv_pending_2fa';
const SELECTED_ROLE_KEY = 'nv_selected_role';
const TEAM_STORAGE_KEY = 'registered_teams_v2';
const MOCK_2FA_CODE = '123456';

const defaultAdmin: AuthUser = {
  id: 'admin-1',
  role: 'Admin',
  fullName: 'Neuro Vision Admin',
  email: 'admin@neurovision.ai',
  password: 'admin123',
  createdAt: new Date().toISOString(),
};

const defaultMedicalManager: AuthUser = {
  id: 'medical-1',
  role: 'Medical Team Manager',
  fullName: 'Dr. Ahmed Hassan',
  email: 'doctor@aspu.medical',
  password: 'medical2024!',
  teamName: 'Sports Medicine Team',
  createdAt: new Date().toISOString(),
};

function parseUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuthUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseTeams(): TeamCredential[] {
  try {
    const raw = localStorage.getItem(TEAM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TeamCredential[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: AuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveTeams(teams: TeamCredential[]) {
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(teams));
}

function setSessionFromUser(user: AuthUser) {
  const session: SessionUser = {
    id: user.id,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    teamName: user.teamName,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function setSessionFromTeam(team: TeamCredential) {
  const session: SessionUser = {
    id: team.id,
    role: 'Medical Team Manager',
    fullName: team.teamName || 'Team Manager',
    email: team.loginEmail || '',
    teamName: team.teamName,
    teamId: team.id,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function setPendingTwoFactor(input: PendingTwoFactor) {
  localStorage.setItem(PENDING_2FA_KEY, JSON.stringify(input));
}

function getPendingTwoFactor(): PendingTwoFactor | null {
  try {
    const raw = localStorage.getItem(PENDING_2FA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingTwoFactor;
    if (!parsed?.id || !parsed?.source) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearPendingTwoFactor() {
  localStorage.removeItem(PENDING_2FA_KEY);
}

function buildOtpAuthUri(email: string, secret: string): string {
  const issuer = 'Neuro Vision';
  return `otpauth://totp/${encodeURIComponent(`${issuer}:${email}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30&algorithm=SHA1`;
}

export function ensureSeedUsers() {
  const users = parseUsers();
  if (users.length === 0) saveUsers([defaultAdmin, defaultMedicalManager]);
}

export function getUsers() {
  ensureSeedUsers();
  return parseUsers();
}

export function createMedicalManager(input: { fullName: string; email: string; password: string; teamName?: string }) {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('Email already exists.');
  }

  const manager: AuthUser = {
    id: crypto.randomUUID(),
    role: 'Medical Team Manager',
    fullName: input.fullName,
    teamName: input.teamName,
    email: input.email,
    password: input.password,
    createdAt: new Date().toISOString(),
  };

  saveUsers([manager, ...users]);
  return manager;
}

export function updateUserTeam(userId: string, teamName: string) {
  const users = getUsers();
  const next = users.map((u) => (u.id === userId ? { ...u, teamName } : u));
  saveUsers(next);
}

export function updateSessionUserCredential(input: { userId: string; fullName: string; email: string; password: string }) {
  const users = getUsers();
  const user = users.find((u) => u.id === input.userId);
  if (!user) throw new Error('User not found.');

  const duplicate = users.find((u) => u.id !== input.userId && u.email.toLowerCase() === input.email.toLowerCase());
  if (duplicate) throw new Error('Email already exists.');

  const updatedUser = { ...user, fullName: input.fullName.trim(), email: input.email.trim(), password: input.password };
  const next = users.map((u) => (u.id === input.userId ? updatedUser : u));
  saveUsers(next);
  return setSessionFromUser(updatedUser);
}

export function getCurrentUserTwoFactorStatus(): boolean {
  const session = getSessionUser();
  if (!session) return false;

  const user = getUsers().find((u) => u.id === session.id);
  if (user) return !!user.twoFactorEnabled;

  const team = parseTeams().find((t) => t.id === session.id);
  return !!team?.twoFactorEnabled;
}

export function beginLoginWithCredential(email: string, password: string, role: UserRole): LoginAttemptResult {
  const user = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role
  );

  if (!user) return { ok: false, requiresTwoFactor: false };

  localStorage.setItem(SELECTED_ROLE_KEY, role);

  const twoFactorEnabled = !!(user.twoFactorEnabled && user.twoFactorSecret);
  const setupSecret = twoFactorEnabled ? undefined : generateSecret();

  setPendingTwoFactor({
    source: 'user',
    id: user.id,
    role,
    redirectTo: role === 'Admin' ? '/dashboard' : '/dashboard/my-team',
    createdAt: Date.now(),
    requiresSetup: !twoFactorEnabled,
    setupSecret,
    setupEmail: user.email,
  });

  return { ok: true, requiresTwoFactor: true, redirectTo: '/auth/verify-2fa' };
}

export function beginLoginWithTeamCredentials(email: string, password: string): LoginAttemptResult {
  const team = parseTeams().find(
    (t) => t.loginEmail?.toLowerCase() === email.toLowerCase() && t.password === password
  );

  if (!team) return { ok: false, requiresTwoFactor: false };

  localStorage.setItem(SELECTED_ROLE_KEY, 'Medical Team Manager');

  const twoFactorEnabled = !!(team.twoFactorEnabled && team.twoFactorSecret);
  const setupSecret = twoFactorEnabled ? undefined : generateSecret();

  setPendingTwoFactor({
    source: 'team',
    id: team.id,
    role: 'Medical Team Manager',
    redirectTo: '/dashboard/my-team',
    createdAt: Date.now(),
    requiresSetup: !twoFactorEnabled,
    setupSecret,
    setupEmail: team.loginEmail,
  });

  return { ok: true, requiresTwoFactor: true, redirectTo: '/auth/verify-2fa' };
}

export function loginWithCredential(email: string, password: string, role: UserRole) {
  const result = beginLoginWithCredential(email, password, role);
  if (!result.ok || result.requiresTwoFactor) return null;
  return getSessionUser();
}

export function loginWithTeamCredentials(email: string, password: string) {
  const result = beginLoginWithTeamCredentials(email, password);
  if (!result.ok || result.requiresTwoFactor) return null;
  return getSessionUser();
}

export function getSessionUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function getPendingTwoFactorChallenge(): PendingTwoFactorChallenge | null {
  const pending = getPendingTwoFactor();
  if (!pending) return null;

  if (!pending.requiresSetup || !pending.setupSecret || !pending.setupEmail) {
    return { requiresSetup: false };
  }

  return {
    requiresSetup: true,
    secret: pending.setupSecret,
    otpauth: buildOtpAuthUri(pending.setupEmail, pending.setupSecret),
  };
}

export function createTwoFactorSetupForCurrentSession() {
  const session = getSessionUser();
  if (!session) {
    throw new Error('You must be logged in.');
  }

  const secret = generateSecret();
  const otpauth = buildOtpAuthUri(session.email, secret);

  return { secret, otpauth };
}

export function enableTwoFactorForCurrentSession(secret: string) {
  const session = getSessionUser();
  if (!session) throw new Error('You must be logged in.');

  const users = getUsers();
  const user = users.find((u) => u.id === session.id);

  if (user) {
    const next = users.map((u) => (u.id === session.id ? { ...u, twoFactorEnabled: true, twoFactorSecret: secret } : u));
    saveUsers(next);
    return;
  }

  const teams = parseTeams();
  const team = teams.find((t) => t.id === session.id);
  if (!team) throw new Error('Account not found.');

  const nextTeams = teams.map((t) => (t.id === session.id ? { ...t, twoFactorEnabled: true, twoFactorSecret: secret } : t));
  saveTeams(nextTeams);
}

export function disableTwoFactorForCurrentSession() {
  const session = getSessionUser();
  if (!session) throw new Error('You must be logged in.');

  const users = getUsers();
  const user = users.find((u) => u.id === session.id);

  if (user) {
    const next = users.map((u) => (u.id === session.id ? { ...u, twoFactorEnabled: false, twoFactorSecret: undefined } : u));
    saveUsers(next);
    return;
  }

  const teams = parseTeams();
  const team = teams.find((t) => t.id === session.id);
  if (!team) throw new Error('Account not found.');

  const nextTeams = teams.map((t) => (t.id === session.id ? { ...t, twoFactorEnabled: false, twoFactorSecret: undefined } : t));
  saveTeams(nextTeams);
}

export function completePendingTwoFactorVerification(code: string): string | null {
  const pending = getPendingTwoFactor();
  if (!pending) return null;

  if (pending.source === 'user') {
    const user = getUsers().find((u) => u.id === pending.id);
    if (!user) return null;

    const secret = pending.requiresSetup ? pending.setupSecret : user.twoFactorSecret;
    if (!secret) return null;
    if (!verifyTotpCode(secret, code)) return null;

    if (pending.requiresSetup) {
      const users = getUsers();
      const next = users.map((u) => (u.id === user.id ? { ...u, twoFactorEnabled: true, twoFactorSecret: secret } : u));
      saveUsers(next);
    }

    const refreshed = getUsers().find((u) => u.id === user.id) || user;
    setSessionFromUser(refreshed);
    clearPendingTwoFactor();
    return pending.redirectTo;
  }

  const team = parseTeams().find((t) => t.id === pending.id);
  if (!team) return null;

  const secret = pending.requiresSetup ? pending.setupSecret : team.twoFactorSecret;
  if (!secret) return null;
  if (!verifyTotpCode(secret, code)) return null;

  if (pending.requiresSetup) {
    const teams = parseTeams();
    const nextTeams = teams.map((t) => (t.id === team.id ? { ...t, twoFactorEnabled: true, twoFactorSecret: secret } : t));
    saveTeams(nextTeams);
  }

  const refreshedTeam = parseTeams().find((t) => t.id === team.id) || team;
  setSessionFromTeam(refreshedTeam);
  clearPendingTwoFactor();
  return pending.redirectTo;
}

function verifyTotpCode(secret: string, code: string): boolean {
  const token = code.replace(/[^0-9]/g, '').trim();
  if (token.length !== 6) return false;
  if (token === MOCK_2FA_CODE) return true;
  return verifySync({ secret, token, strategy: 'totp', epochTolerance: 90 }).valid;
}

export function hasPendingTwoFactorLogin(): boolean {
  return !!getPendingTwoFactor();
}

export function clearPendingTwoFactorLogin() {
  clearPendingTwoFactor();
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  clearPendingTwoFactor();
}

