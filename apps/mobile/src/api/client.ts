import { clearRefreshToken, getRefreshToken, setRefreshToken } from '../auth/tokenStorage';
import type { AuthResult, BootstrapResponse } from '../auth/types';

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '');

interface ApiEnvelope<T> {
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function decode<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const envelope = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || envelope.error) {
    throw new ApiError(
      envelope.error?.code ?? 'HTTP_ERROR',
      envelope.error?.message ?? 'Không thể kết nối đến máy chủ',
      response.status,
      envelope.error?.details,
    );
  }
  return envelope.data as T;
}

export async function publicRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Không thể kết nối đến máy chủ', 0);
  }
  return decode<T>(response);
}

class SessionClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<AuthResult> | null = null;

  async bootstrap(): Promise<AuthResult | null> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;
    return this.refresh(refreshToken);
  }

  async establish(result: AuthResult): Promise<void> {
    this.accessToken = result.access_token;
    await setRefreshToken(result.refresh_token);
  }

  async clear(): Promise<void> {
    this.accessToken = null;
    await clearRefreshToken();
  }

  async request<T>(path: string, init?: RequestInit, canRetry = true): Promise<T> {
    if (!this.accessToken) throw new ApiError('AUTH_REQUIRED', 'Bạn cần đăng nhập', 401);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        ...init?.headers,
      },
    });
    if (response.status === 401 && canRetry) {
      await this.refresh();
      return this.request<T>(path, init, false);
    }
    return decode<T>(response);
  }

  async refresh(explicitToken?: string): Promise<AuthResult> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      const refreshToken = explicitToken ?? (await getRefreshToken());
      if (!refreshToken) throw new ApiError('SESSION_EXPIRED', 'Phiên đăng nhập đã hết hạn', 401);
      try {
        const result = await publicRequest<AuthResult>('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        await this.establish(result);
        return result;
      } catch (error) {
        await this.clear();
        throw error;
      }
    })().finally(() => {
      this.refreshPromise = null;
    });
    return this.refreshPromise;
  }
}

export const sessionClient = new SessionClient();

export function getBootstrap(): Promise<BootstrapResponse> {
  return publicRequest('/app/bootstrap');
}

