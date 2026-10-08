import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/rnr-ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/rnr-ui/card';
import { Checkbox } from '@/components/rnr-ui/checkbox';
import { Input } from '@/components/rnr-ui/input';
import { Label } from '@/components/rnr-ui/label';
import { Separator } from '@/components/rnr-ui/separator';
import { Text } from '@/components/rnr-ui/text';
import { SocialConnections } from '@/components/social-connections';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Pressable, type TextInput, View } from 'react-native';

type LoadingMethod = 'password' | 'google' | null;

export function SignUpForm() {
  const { register, loginWithGoogle, termsVersion } = useAuth();
  const emailInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmInputRef = React.useRef<TextInput>(null);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [accepted, setAccepted] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loadingMethod, setLoadingMethod] = React.useState<LoadingMethod>(null);
  const isLoading = loadingMethod !== null;

  async function onSubmit() {
    if (isLoading) return;

    if (name.trim().length < 2 || !email.includes('@') || password.length < 8) {
      setError('Vui lòng nhập đầy đủ thông tin hợp lệ.');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!accepted || !termsVersion) {
      setError('Bạn cần đọc và đồng ý với điều khoản sử dụng.');
      return;
    }

    setLoadingMethod('password');
    setError('');
    try {
      await register(name.trim(), email.trim(), password, termsVersion);
      router.replace('/(tabs)/home');
    } catch (value) {
      setError(value instanceof ApiError ? value.message : 'Không thể đăng ký.');
    } finally {
      setLoadingMethod(null);
    }
  }

  async function onGooglePress() {
    if (isLoading) return;

    setLoadingMethod('google');
    setError('');
    try {
      await loginWithGoogle();
      router.replace('/(tabs)/home');
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Không thể đăng ký với Google.');
    } finally {
      setLoadingMethod(null);
    }
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Tạo tài khoản EarnMart</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Điền thông tin bên dưới để bắt đầu
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          {error ? (
            <Text
              accessibilityRole="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </Text>
          ) : null}

          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="name">Tên hiển thị</Label>
              <Input
                id="name"
                accessibilityLabel="Tên hiển thị"
                value={name}
                onChangeText={setName}
                placeholder="Tên của bạn"
                autoComplete="name"
                textContentType="name"
                editable={!isLoading}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => emailInputRef.current?.focus()}
              />
            </View>

            <View className="gap-1.5">
              <Label htmlFor="register-email">Email</Label>
              <Input
                ref={emailInputRef}
                id="register-email"
                accessibilityLabel="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                editable={!isLoading}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>

            <View className="gap-1.5">
              <Label htmlFor="register-password">Mật khẩu</Label>
              <Input
                ref={passwordInputRef}
                id="register-password"
                accessibilityLabel="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                placeholder="Tối thiểu 8 ký tự"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!isLoading}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => confirmInputRef.current?.focus()}
              />
            </View>

            <View className="gap-1.5">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <Input
                ref={confirmInputRef}
                id="confirm-password"
                accessibilityLabel="Xác nhận mật khẩu"
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!isLoading}
                returnKeyType="send"
                onSubmitEditing={() => void onSubmit()}
              />
            </View>

            <View className="flex-row items-center gap-3">
              <Checkbox
                id="accept-terms"
                accessibilityLabel="Đồng ý với điều khoản sử dụng"
                checked={accepted}
                disabled={isLoading}
                onCheckedChange={setAccepted}
              />
              <View className="flex-1 flex-row flex-wrap items-center">
                <Label htmlFor="accept-terms" className="font-normal leading-5">
                  Tôi đồng ý với{' '}
                </Label>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel="Xem điều khoản sử dụng"
                  disabled={isLoading}
                  onPress={() => router.push('/terms')}
                >
                  <Text className="text-sm font-medium underline underline-offset-4">
                    Điều khoản sử dụng
                  </Text>
                </Pressable>
                <Text className="text-sm">.</Text>
              </View>
            </View>

            <Button
              accessibilityLabel="Đăng ký"
              disabled={isLoading}
              className="w-full"
              onPress={() => void onSubmit()}
            >
              {loadingMethod === 'password' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text>Đăng ký</Text>
              )}
            </Button>
          </View>

          <Text className="text-center text-sm">
            Đã có tài khoản?{' '}
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Đi đến màn đăng nhập"
              disabled={isLoading}
              onPress={() => router.replace('/login')}
            >
              <Text className="text-sm underline underline-offset-4">Đăng nhập</Text>
            </Pressable>
          </Text>

          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="px-4 text-sm text-muted-foreground">hoặc</Text>
            <Separator className="flex-1" />
          </View>

          <SocialConnections
            disabled={isLoading}
            loading={loadingMethod === 'google'}
            onGooglePress={() => void onGooglePress()}
          />
        </CardContent>
      </Card>
    </View>
  );
}
