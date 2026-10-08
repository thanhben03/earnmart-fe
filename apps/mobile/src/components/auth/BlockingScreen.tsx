import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleAlert } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { Colors, Radius, Spacing } from '../../theme';

export function BlockingScreen({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return <SafeAreaView style={styles.safe}><View style={styles.card}><View style={styles.icon}><CircleAlert size={34} color={Colors.primary} /></View><Text style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text>{actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} fullWidth size="lg" /> : null}</View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, justifyContent: 'center', padding: Spacing.xl, backgroundColor: Colors.background }, card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.borderLight, padding: Spacing.xl, gap: Spacing.base, alignItems: 'center' }, icon: { width: 64, height: 64, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 24, fontWeight: '800', color: Colors.darkInk, textAlign: 'center' }, message: { color: Colors.textSecondary, lineHeight: 21, textAlign: 'center' } });

