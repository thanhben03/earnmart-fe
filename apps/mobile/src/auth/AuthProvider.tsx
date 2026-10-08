import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { ApiError, getBootstrap, publicRequest, sessionClient } from '../api/client';
import { getGoogleIDToken } from './googleSignIn';
import type { AuthResult, AuthStatus, AuthUser, DeviceInfo } from './types';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  message: string;
  termsVersion: string;
  retryBootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, termsVersion: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string | null>;
  verifyOTP: (email: string, otp: string) => Promise<string>;
  resetPassword: (ticket: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const device: DeviceInfo = {
  device_id: `${Platform.OS}-earnmart`,
  device_name: Platform.OS,
  platform: Platform.OS,
};

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('booting');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState('');
  const [termsVersion, setTermsVersion] = useState('');

  const bootstrap = useCallback(async () => {
    setStatus('booting');
    setMessage('');
    try {
      const app = await getBootstrap();
      setTermsVersion(app.terms_version);
      if (app.maintenance) {
        setMessage(app.maintenance_message);
        setStatus('maintenance');
        return;
      }
      const result = await sessionClient.bootstrap();
      if (!result) {
        setUser(null);
        setStatus('unauthenticated');
        return;
      }
      setUser(result.user);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && ['ACCOUNT_LOCKED', 'ACCOUNT_DISABLED'].includes(error.code)) {
        setMessage(error.message);
        setStatus('blocked');
      } else if (error instanceof ApiError && ['SESSION_EXPIRED', 'SESSION_REVOKED', 'TOKEN_REUSE_DETECTED'].includes(error.code)) {
        setUser(null);
        setMessage(error.message);
        setStatus('unauthenticated');
      } else {
        setMessage(error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ');
        setStatus('offline');
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void bootstrap(), 0);
    return () => clearTimeout(timer);
  }, [bootstrap]);

  const acceptAuthResult = useCallback(async (result: AuthResult) => {
    await sessionClient.establish(result);
    setUser(result.user);
    setMessage('');
    setStatus('authenticated');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await publicRequest<AuthResult>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password, device }),
    });
    await acceptAuthResult(result);
  }, [acceptAuthResult]);

  const register = useCallback(async (name: string, email: string, password: string, currentTermsVersion: string) => {
    const result = await publicRequest<AuthResult>('/auth/register', {
      method: 'POST', body: JSON.stringify({ name, email, password, terms_version: currentTermsVersion, device }),
    });
    await acceptAuthResult(result);
  }, [acceptAuthResult]);

  const loginWithGoogle = useCallback(async () => {
    const idToken = await getGoogleIDToken();
    const result = await publicRequest<AuthResult>('/auth/google', {
      method: 'POST', body: JSON.stringify({ id_token: idToken, device }),
    });
    await acceptAuthResult(result);
  }, [acceptAuthResult]);

  const logout = useCallback(async () => {
    try { await sessionClient.request('/auth/logout', { method: 'POST' }); } finally {
      await sessionClient.clear();
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const response = await publicRequest<{ test_otp?: string }>('/auth/password/forgot', {
      method: 'POST', body: JSON.stringify({ email }),
    });
    return response.test_otp ?? null;
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    const response = await publicRequest<{ reset_ticket: string }>('/auth/password/verify-otp', {
      method: 'POST', body: JSON.stringify({ email, otp }),
    });
    return response.reset_ticket;
  }, []);

  const resetPassword = useCallback(async (ticket: string, password: string) => {
    await publicRequest('/auth/password/reset', {
      method: 'POST', body: JSON.stringify({ reset_ticket: ticket, new_password: password }),
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    status, user, message, termsVersion, retryBootstrap: bootstrap, login, register,
    loginWithGoogle, logout, forgotPassword, verifyOTP, resetPassword,
  }), [status, user, message, termsVersion, bootstrap, login, register, loginWithGoogle, logout, forgotPassword, verifyOTP, resetPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
