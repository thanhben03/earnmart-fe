import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/auth/AuthProvider';
import { ApiError } from '../src/api/client';
import { AuthField, AuthScreen, FormError } from '../src/components/auth/AuthScreen';
import { Button } from '../src/components/ui/Button';

export default function ResetPasswordScreen() {
  const { ticket } = useLocalSearchParams<{ ticket: string }>(); const { resetPassword } = useAuth(); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async () => { if (password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự.'); return; } if (password !== confirm) { setError('Mật khẩu xác nhận không khớp.'); return; } setLoading(true); setError(''); try { await resetPassword(ticket, password); router.replace('/login'); } catch (value) { setError(value instanceof ApiError ? value.message : 'Không thể đặt lại mật khẩu.'); } finally { setLoading(false); } };
  return <AuthScreen title="Đặt mật khẩu mới" subtitle="Mật khẩu mới sẽ đăng xuất mọi phiên đang hoạt động"><FormError message={error} /><AuthField label="Mật khẩu mới" value={password} onChangeText={setPassword} password autoComplete="new-password" textContentType="newPassword" placeholder="Tối thiểu 8 ký tự" /><AuthField label="Xác nhận mật khẩu" value={confirm} onChangeText={setConfirm} password autoComplete="new-password" textContentType="newPassword" placeholder="Nhập lại mật khẩu" onSubmitEditing={submit} /><Button title="Cập nhật mật khẩu" onPress={submit} loading={loading} fullWidth size="lg" /></AuthScreen>;
}

