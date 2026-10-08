import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../theme';

export function AuthScreen({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle: string }>) {
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}><View style={styles.logo} accessibilityElementsHidden><ShoppingBag size={30} color="#fff" /></View><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text><View style={styles.card}>{children}</View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

export function AuthField({ label, error, password, ...props }: TextInputProps & { label: string; error?: string; password?: boolean }) {
  const [hidden, setHidden] = useState(Boolean(password));
  return <View style={styles.fieldGroup}><Text style={styles.label}>{label}</Text><View style={[styles.inputWrap, error ? styles.inputError : null]}><TextInput {...props} secureTextEntry={password ? hidden : props.secureTextEntry} style={styles.input} placeholderTextColor={Colors.textMuted} accessibilityLabel={label} />{password ? <Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'Hiện mật khẩu' : 'Ẩn mật khẩu'} hitSlop={12} onPress={() => setHidden((value) => !value)} style={styles.eyeButton}>{hidden ? <Eye size={20} color={Colors.textSecondary} /> : <EyeOff size={20} color={Colors.textSecondary} />}</Pressable> : null}</View>{error ? <Text accessibilityLiveRegion="polite" style={styles.fieldError}>{error}</Text> : null}</View>;
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return <Text accessibilityRole="alert" style={styles.formError}>{message}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background }, flex: { flex: 1 }, content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl, paddingVertical: Spacing.xxl },
  logo: { width: 60, height: 60, alignSelf: 'center', borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.base },
  title: { fontSize: 26, fontWeight: '800', color: Colors.darkInk, textAlign: 'center' }, subtitle: { color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: 6, marginBottom: Spacing.xl },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.base, borderWidth: 1, borderColor: Colors.borderLight }, fieldGroup: { gap: 6 }, label: { color: Colors.darkInk, fontSize: 13, fontWeight: '700' },
  inputWrap: { minHeight: 52, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceSubtle, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base }, inputError: { borderColor: Colors.error }, input: { flex: 1, color: Colors.darkInk, fontSize: 15, paddingVertical: 12 },
  eyeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -12 }, fieldError: { color: Colors.error, fontSize: 12 }, formError: { color: Colors.error, backgroundColor: Colors.errorLight, padding: Spacing.md, borderRadius: Radius.md, lineHeight: 18 },
});
