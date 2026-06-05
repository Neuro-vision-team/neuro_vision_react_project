/**
 * Central HTTP client.
 * - Reads base URL from VITE_API_BASE_URL (never hardcoded).
 * - Injects Bearer token from the auth session automatically.
 * - Parses the { success, message, data, errors } envelope.
 * - Throws ApiError with status + field errors on failure.
 */
import { ApiError } from '../../types/api';
import { getStoredToken } from './auth-session';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export function getApiBaseUrl(): string {
  if (!BASE_URL) throw new ApiError('VITE_API_BASE_URL is not set.', 0);
  return BASE_URL.replace(/\/+$/, '');
}

export function buildApiUrl(path: string): string {
  return `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildApiHeaders(hasBody = false): Headers {
  const headers = new Headers();
  headers.set('Accept', 'application/json');
  if (hasBody) headers.set('Content-Type', 'application/json');
  const token = getStoredToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

function flattenErrors(errors?: Record<string, string[]>): string {
  if (!errors) return '';
  return Object.entries(errors)
    .flatMap(([field, msgs]) => msgs.map(m => `${field}: ${m}`))
    .join('\n');
}

type Envelope<T> = { success: boolean; message: string; data: T; errors?: Record<string, string[]> };

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const hasBody = body !== undefined;
  const url = buildApiUrl(path);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: buildApiHeaders(hasBody),
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : 'Network request failed.',
      0,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) throw new ApiError(`Server error (HTTP ${response.status}).`, response.status);
    return undefined as T;
  }

  let envelope: Envelope<T>;
  try {
    envelope = (await response.json()) as Envelope<T>;
  } catch {
    throw new ApiError('Server returned an invalid response. Please try again.', response.status);
  }

  if (!response.ok || envelope.success === false) {
    const msg =
      flattenErrors(envelope.errors) ||
      envelope.message?.trim() ||
      `Request failed (HTTP ${response.status}).`;
    throw new ApiError(msg, response.status, envelope.errors);
  }

  return envelope.data;
}

export const apiGet    = <T>(path: string) => request<T>('GET', path);
export const apiPost   = <T>(path: string, body?: unknown) => request<T>('POST', path, body);
export const apiPut    = <T>(path: string, body?: unknown) => request<T>('PUT', path, body);
export const apiPatch  = <T>(path: string, body?: unknown) => request<T>('PATCH', path, body);
export const apiDelete = <T>(path: string) => request<T>('DELETE', path);
