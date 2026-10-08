import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/auth/AuthProvider';
import { ApiError } from '../src/api/client';
import { AuthScreen, FormError } from '../src/components/auth/AuthScreen';
import { Button } from '../src/components/rnr-ui/button';
import { Input } from '../src/components/rnr-ui/input';
import { Label } from '../src/components/rnr-ui/label';
import { Text } from '../src/components/rnr-ui/text';

export default function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth(); const [email, setEmail] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!email.includes('@')) { setError('Vui lòng nhập email hợp lệ.'); return; }
    setLoading(true); setError('');
    try { const testOtp = await forgotPassword(email.trim()); router.push({ pathname: '/verify-otp', params: { email: email.trim(), testOtp: testOtp ?? '' } }); }
    catch (value) { setError(value instanceof ApiError ? value.message : 'Không thể gửi OTP.'); }
    finally { setLoading(false); }
  };
  return <AuthScreen title="Quên mật khẩu" subtitle="Chúng tôi sẽ gửi mã OTP đến email của bạn">
    <FormError message={error} />
    <View className="gap-1.5">
      <Label nativeID="forgot-password-email-label">Email</Label>
      <Input
        accessibilityLabel="Email"
        aria-labelledby="forgot-password-email-label"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholder="name@example.com"
        onSubmitEditing={submit}
        className="h-[52px] rounded-xl bg-muted px-4 text-[15px]"
      />
    </View>
    <Button
      accessibilityLabel="Gửi mã OTP"
      disabled={loading}
      onPress={() => void submit()}
      size="lg"
      className="h-[52px] w-full rounded-2xl"
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-bold">Gửi mã OTP</Text>}
    </Button>
    <Button
      accessibilityLabel="Quay lại đăng nhập"
      disabled={loading}
      onPress={() => router.back()}
      variant="ghost"
      className="w-full"
    >
      <Text>Quay lại đăng nhập</Text>
    </Button>
  </AuthScreen>;
}
