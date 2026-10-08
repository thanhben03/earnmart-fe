import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/auth/AuthProvider';
import { ApiError } from '../src/api/client';
import { AuthField, AuthScreen, FormError } from '../src/components/auth/AuthScreen';
import { Button } from '../src/components/ui/Button';
import { Colors, Spacing } from '../src/theme';

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.includes('@') || password.length < 8) { setError('Vui lòng kiểm tra email và mật khẩu.'); return; }
    setLoading(true); setError('');
    try { await login(email.trim(), password); router.replace('/(tabs)/home'); }
    catch (value) { setError(value instanceof ApiError ? value.message : 'Không thể đăng nhập.'); }
    finally { setLoading(false); }
  };

  const google = async () => {
    setLoading(true); setError('');
    try { await loginWithGoogle(); router.replace('/(tabs)/home'); }
    catch (value) { setError(value instanceof Error ? value.message : 'Không thể đăng nhập Google.'); }
    finally { setLoading(false); }
  };

  return <AuthScreen title="Chào mừng trở lại" subtitle="Đăng nhập để tiếp tục hành trình Learn • Move • Earn • Shop">
    <FormError message={error} />
    <AuthField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" placeholder="name@example.com" />
    <AuthField label="Mật khẩu" value={password} onChangeText={setPassword} password autoComplete="current-password" textContentType="password" placeholder="Nhập mật khẩu" onSubmitEditing={submit} />
    <Button title="Đăng nhập" onPress={submit} loading={loading} fullWidth size="lg" />
    <Button title="Đăng nhập với Google" onPress={google} disabled={loading} fullWidth size="lg" variant="outline" />
    <Button title="Quên mật khẩu?" onPress={() => router.push('/forgot-password')} variant="ghost" />
    <View style={styles.row}><Text style={styles.muted}>Chưa có tài khoản?</Text><Text onPress={() => router.push('/register')} style={styles.link}> Đăng ký</Text></View>
  </AuthScreen>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xs }, muted: { color: Colors.textSecondary }, link: { color: Colors.primary, fontWeight: '700' } });
