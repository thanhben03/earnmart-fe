import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/AuthProvider';
import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/rnr-ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/rnr-ui/card';
import { Input } from '@/components/rnr-ui/input';
import { Label } from '@/components/rnr-ui/label';
import { Separator } from '@/components/rnr-ui/separator';
import { Text } from '@/components/rnr-ui/text';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Pressable, type TextInput, View } from 'react-native';

type LoadingMethod = 'password' | 'google' | null;

export function SignInForm() {
  const { login, loginWithGoogle } = useAuth();
  const passwordInputRef = React.useRef<TextInput>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loadingMethod, setLoadingMethod] = React.useState<LoadingMethod>(null);
  const isLoading = loadingMethod !== null;

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    if (isLoading) return;

    if (!email.includes('@') || password.length < 8) {
      setError('Vui lòng kiểm tra email và mật khẩu.');
      return;
    }

    setLoadingMethod('password');
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (value) {
      setError(value instanceof ApiError ? value.message : 'Không thể đăng nhập.');
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
      setError(value instanceof Error ? value.message : 'Không thể đăng nhập Google.');
    } finally {
      setLoadingMethod(null);
    }
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            Đăng nhập vào EarnMart
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            Chào mừng bạn trở lại! Đăng nhập để tiếp tục
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                accessibilityLabel="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                editable={!isLoading}
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>

            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Mật khẩu</Label>
                <Button
                  accessibilityLabel="Quên mật khẩu"
                  disabled={isLoading}
                  variant="link"
                  size="sm"
                  className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                  onPress={() => router.push('/forgot-password')}
                >
                  <Text className="font-normal leading-4">Quên mật khẩu?</Text>
                </Button>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                accessibilityLabel="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="current-password"
                textContentType="password"
                editable={!isLoading}
                returnKeyType="send"
                onSubmitEditing={() => void onSubmit()}
              />
            </View>

            <Button
              accessibilityLabel="Đăng nhập"
              disabled={isLoading}
              className="w-full"
              onPress={() => void onSubmit()}
            >
              {loadingMethod === 'password' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text>Đăng nhập</Text>
              )}
            </Button>
          </View>

          <Text className="text-center text-sm">
            Chưa có tài khoản?{' '}
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Đăng ký tài khoản"
              disabled={isLoading}
              onPress={() => router.push('/register')}
            >
              <Text className="text-sm underline underline-offset-4">Đăng ký</Text>
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
