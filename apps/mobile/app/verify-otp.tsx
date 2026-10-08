import React, { useState } from 'react';
import { Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/auth/AuthProvider';
import { ApiError } from '../src/api/client';
import { AuthField, AuthScreen, FormError } from '../src/components/auth/AuthScreen';
import { Button } from '../src/components/ui/Button';
import { Colors } from '../src/theme';

export default function VerifyOTPScreen() {
  const params = useLocalSearchParams<{ email: string; testOtp?: string }>(); const { verifyOTP, forgotPassword } = useAuth();
  const [otp, setOtp] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [hint, setHint] = useState(params.testOtp ? `OTP môi trường test: ${params.testOtp}` : '');
  const submit = async () => { if (!/^\d{6}$/.test(otp)) { setError('OTP phải gồm 6 chữ số.'); return; } setLoading(true); setError(''); try { const ticket = await verifyOTP(params.email, otp); router.replace({ pathname: '/reset-password', params: { ticket } }); } catch (value) { setError(value instanceof ApiError ? value.message : 'OTP không hợp lệ.'); } finally { setLoading(false); } };
  const resend = async () => { setLoading(true); setError(''); try { const testOtp = await forgotPassword(params.email); setHint(testOtp ? `OTP môi trường test: ${testOtp}` : 'Mã OTP mới đã được gửi.'); } catch (value) { setError(value instanceof Error ? value.message : 'Không thể gửi lại OTP.'); } finally { setLoading(false); } };
  return <AuthScreen title="Nhập mã OTP" subtitle={`Mã gồm 6 chữ số đã được gửi đến ${params.email}`}><FormError message={error} />{hint ? <Text style={{ color: Colors.textSecondary }}>{hint}</Text> : null}<AuthField label="Mã OTP" value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={6} placeholder="000000" onSubmitEditing={submit} /><Button title="Xác nhận OTP" onPress={submit} loading={loading} fullWidth size="lg" /><Button title="Gửi lại mã" onPress={resend} disabled={loading} variant="ghost" /></AuthScreen>;
}

