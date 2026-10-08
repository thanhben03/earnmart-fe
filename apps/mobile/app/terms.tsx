import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { publicRequest } from '../src/api/client';
import { Button } from '../src/components/ui/Button';
import { Colors, Spacing } from '../src/theme';

export default function TermsScreen() {
  const [terms, setTerms] = useState<{ version: string; content: string } | null>(null); const [error, setError] = useState('');
  useEffect(() => { publicRequest<{ version: string; content: string }>('/legal/terms/current').then(setTerms).catch((value) => setError(value instanceof Error ? value.message : 'Không thể tải điều khoản.')); }, []);
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>Điều khoản sử dụng</Text>{!terms && !error ? <ActivityIndicator color={Colors.primary} /> : null}{error ? <Text style={styles.error}>{error}</Text> : null}{terms ? <><Text style={styles.version}>Phiên bản {terms.version}</Text><Text style={styles.body}>{terms.content}</Text></> : null}<Button title="Quay lại" onPress={() => router.back()} fullWidth /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Colors.background }, content: { padding: Spacing.xl, gap: Spacing.base }, title: { fontSize: 26, fontWeight: '800', color: Colors.darkInk }, version: { color: Colors.textSecondary, fontWeight: '600' }, body: { color: Colors.textPrimary, lineHeight: 24 }, error: { color: Colors.error } });
