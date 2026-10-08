import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useAuth } from '../src/auth/AuthProvider';
import { ApiError } from '../src/api/client';
import { AuthField, AuthScreen, FormError } from '../src/components/auth/AuthScreen';
import { Button } from '../src/components/ui/Button';
import { Colors, Radius, Spacing } from '../src/theme';

export default function RegisterScreen() {
  const { register, termsVersion } = useAuth();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (name.trim().length < 2 || !email.includes('@') || password.length < 8) { setError('Vui lòng nhập đầy đủ thông tin hợp lệ.'); return; }
    if (password !== confirm) { setError('Mật khẩu xác nhận không khớp.'); return; }
    if (!accepted || !termsVersion) { setError('Bạn cần đọc và đồng ý với điều khoản sử dụng.'); return; }
    setLoading(true); setError('');
    try { await register(name.trim(), email.trim(), password, termsVersion); router.replace('/(tabs)/home'); }
    catch (value) { setError(value instanceof ApiError ? value.message : 'Không thể đăng ký.'); }
    finally { setLoading(false); }
  };
  return <AuthScreen title="Tạo tài khoản" subtitle="Bắt đầu tích lũy EC từ những thói quen tích cực">
    <FormError message={error} />
    <AuthField label="Tên hiển thị" value={name} onChangeText={setName} autoComplete="name" textContentType="name" placeholder="Tên của bạn" />
    <AuthField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" placeholder="name@example.com" />
    <AuthField label="Mật khẩu" value={password} onChangeText={setPassword} password autoComplete="new-password" textContentType="newPassword" placeholder="Tối thiểu 8 ký tự" />
    <AuthField label="Xác nhận mật khẩu" value={confirm} onChangeText={setConfirm} password autoComplete="new-password" textContentType="newPassword" placeholder="Nhập lại mật khẩu" />
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted((value) => !value)} style={styles.termsRow}>
      <View style={[styles.checkbox, accepted && styles.checked]}>{accepted ? <Check size={16} color="#fff" /> : null}</View>
      <Text style={styles.termsText}>Tôi đồng ý với <Text onPress={() => router.push('/terms')} style={styles.link}>Điều khoản sử dụng</Text>.</Text>
    </Pressable>
    <Button title="Đăng ký" onPress={submit} loading={loading} fullWidth size="lg" />
    <Button title="Đã có tài khoản? Đăng nhập" onPress={() => router.replace('/login')} variant="ghost" />
  </AuthScreen>;
}

const styles = StyleSheet.create({ termsRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: Spacing.md }, checkbox: { width: 24, height: 24, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: Colors.primary, borderColor: Colors.primary }, termsText: { flex: 1, color: Colors.textSecondary, lineHeight: 20 }, link: { color: Colors.primary, fontWeight: '700' } });

