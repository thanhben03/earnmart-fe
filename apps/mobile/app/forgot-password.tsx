import React, { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../src/auth/AuthProvider';
import { ApiError } from '../src/api/client';
import { AuthField, AuthScreen, FormError } from '../src/components/auth/AuthScreen';
import { Button } from '../src/components/ui/Button';

export default function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth(); const [email, setEmail] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!email.includes('@')) { setError('Vui lòng nhập email hợp lệ.'); return; }
    setLoading(true); setError('');
    try { const testOtp = await forgotPassword(email.trim()); router.push({ pathname: '/verify-otp', params: { email: email.trim(), testOtp: testOtp ?? '' } }); }
    catch (value) { setError(value instanceof ApiError ? value.message : 'Không thể gửi OTP.'); }
    finally { setLoading(false); }
  };
  return <AuthScreen title="Quên mật khẩu" subtitle="Chúng tôi sẽ gửi mã OTP đến email của bạn"><FormError message={error} /><AuthField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="name@example.com" onSubmitEditing={submit} /><Button title="Gửi mã OTP" onPress={submit} loading={loading} fullWidth size="lg" /><Button title="Quay lại đăng nhập" onPress={() => router.back()} variant="ghost" /></AuthScreen>;
}

