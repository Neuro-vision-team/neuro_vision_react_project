import { apiGet, apiPost } from './client';
import type { LoginPayload, LoginResponseRaw, Verify2FAPayload, LoginSuccessRaw, AuthUserRaw } from '../../types/auth';

export function loginApi(payload: LoginPayload): Promise<LoginResponseRaw> {
  return apiPost<LoginResponseRaw>('/auth/login', payload);
}

export function verify2FAApi(payload: Verify2FAPayload): Promise<LoginSuccessRaw> {
  return apiPost<LoginSuccessRaw>('/auth/2fa/verify', payload);
}

export function getMeApi(): Promise<AuthUserRaw> {
  return apiGet<AuthUserRaw>('/auth/me');
}

export function logoutApi(): Promise<void> {
  return apiPost<void>('/auth/logout');
}

// ─── 2FA management (requires bearer token) ───────────────────────────────────
export type TwoFactorSetupResponse = {
  secret:      string;
  otpauth_url: string;
};

export function setup2FAApi(): Promise<TwoFactorSetupResponse> {
  return apiPost<TwoFactorSetupResponse>('/auth/2fa/setup');
}

export function enable2FAApi(code: string): Promise<void> {
  return apiPost<void>('/auth/2fa/enable', { code });
}

export function disable2FAApi(code: string): Promise<void> {
  return apiPost<void>('/auth/2fa/disable', { code });
}
