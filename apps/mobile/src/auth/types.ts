export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'DISABLED';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  status: AccountStatus;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  user: AuthUser;
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
}

export interface DeviceInfo {
  device_id: string;
  device_name: string;
  platform: string;
}

export type AuthStatus =
  | 'booting'
  | 'unauthenticated'
  | 'authenticated'
  | 'maintenance'
  | 'offline'
  | 'blocked';

export interface BootstrapResponse {
  maintenance: boolean;
  maintenance_message: string;
  terms_version: string;
}

