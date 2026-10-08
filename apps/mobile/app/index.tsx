import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag } from 'lucide-react-native';
import { useAuth } from '../src/auth/AuthProvider';
import { Colors, Radius, Spacing } from '../src/theme';

export default function EntryScreen() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'booting') return;
    const target = {
      authenticated: '/(tabs)/home', unauthenticated: '/login', maintenance: '/maintenance',
      offline: '/connection-required', blocked: '/account-blocked',
    }[status];
    if (target) router.replace(target as never);
  }, [status]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logo} accessibilityElementsHidden>
        <ShoppingBag size={42} color="#FFFFFF" strokeWidth={2.3} />
      </View>
      <Text style={styles.brand}>EarnMart</Text>
      <Text style={styles.tagline}>Learn • Move • Earn • Shop</Text>
      <ActivityIndicator color={Colors.primary} style={styles.loader} />
      <Text style={styles.loading}>Đang xác thực phiên đăng nhập...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, padding: Spacing.xl },
  logo: { width: 88, height: 88, borderRadius: Radius.xl, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  brand: { fontSize: 32, fontWeight: '800', color: Colors.darkInk },
  tagline: { marginTop: 6, color: Colors.accent, fontWeight: '700', letterSpacing: 1 },
  loader: { marginTop: Spacing.xl },
  loading: { marginTop: Spacing.sm, color: Colors.textSecondary, fontSize: 13 },
});
