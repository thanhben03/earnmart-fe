// S10 — Wallet & Transaction History Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Info,
  Clock,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { Card, VirtualNoticeBanner } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { TransactionItem } from '../../src/components/wallet/TransactionItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useWalletStore } from '../../src/store';

type TabFilter = 'ALL' | 'EARNED' | 'SPENT';

export default function WalletScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<TabFilter>('ALL');

  const balance = useWalletStore((state) => state.balance);
  const lifetimeEarned = useWalletStore((state) => state.lifetimeEarned);
  const lifetimeSpent = useWalletStore((state) => state.lifetimeSpent);
  const transactions = useWalletStore((state) => state.transactions);
  const resetToDefault = useWalletStore((state) => state.resetToDefault);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'EARNED') return tx.delta > 0;
    if (filter === 'SPENT') return tx.delta < 0;
    return true;
  });

  const handleResetDemo = () => {
    Alert.alert(
      'Khôi phục ví Demo?',
      'Số dư sẽ được đặt lại về 150 EC ban đầu để kiểm thử.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt lại',
          style: 'destructive',
          onPress: () => resetToDefault(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Ví Xu Ảo"
        subtitle="Quản lý số dư Earn Coins (EC)"
        showBack={false}
        showCoins={false}
        showCart={true}
        rightAction={
          <TouchableOpacity
            onPress={handleResetDemo}
            style={styles.resetBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <RotateCcw size={16} color={Colors.textSecondary} />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Virtual Currency Notice */}
        <VirtualNoticeBanner style={styles.bannerMargin} />

        {/* 1. Hero Balance Card */}
        <Card style={styles.heroCard} elevated>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconCircle}>
              <Coins size={26} color="#D97706" strokeWidth={2.4} />
            </View>
            <View style={styles.virtualTag}>
              <Text style={styles.virtualTagText}>VÍ NỘI BỘ</Text>
            </View>
          </View>

          <Text style={styles.balanceLabel}>Tổng số dư khả dụng</Text>
          <View style={styles.balanceAmountRow}>
            <Text style={styles.balanceAmount}>{balance.toLocaleString('vi-VN')}</Text>
            <Text style={styles.balanceUnit}>EC</Text>
          </View>

          {/* Lifetime Earned & Spent */}
          <View style={styles.lifetimeGrid}>
            <View style={styles.lifetimeCol}>
              <View style={styles.lifetimeLabelBox}>
                <ArrowDownLeft size={14} color={Colors.success} />
                <Text style={styles.lifetimeLabel}>Tổng xu đã kiếm</Text>
              </View>
              <Text style={styles.lifetimeEarned}>+{lifetimeEarned.toLocaleString('vi-VN')} EC</Text>
            </View>

            <View style={styles.lifetimeDivider} />

            <View style={styles.lifetimeCol}>
              <View style={styles.lifetimeLabelBox}>
                <ArrowUpRight size={14} color={Colors.error} />
                <Text style={styles.lifetimeLabel}>Tổng xu đã dùng</Text>
              </View>
              <Text style={styles.lifetimeSpent}>-{lifetimeSpent.toLocaleString('vi-VN')} EC</Text>
            </View>
          </View>

          {/* Quick Action CTAs */}
          <View style={styles.heroActionsRow}>
            <Button
              title="Kiếm thêm xu"
              onPress={() => router.push('/(tabs)/earn')}
              variant="primary"
              size="md"
              icon={<Sparkles size={16} color="#FFFFFF" />}
              style={styles.actionBtn}
            />
            <Button
              title="Đổi vật phẩm"
              onPress={() => router.push('/(tabs)/shop')}
              variant="secondary"
              size="md"
              icon={<ShoppingBag size={16} color={Colors.primaryDark} />}
              style={styles.actionBtn}
            />
          </View>
        </Card>

        {/* 2. Transaction Filter Tabs */}
        <View style={styles.tabsHeader}>
          <Text style={styles.sectionTitle}>Lịch sử biến động xu</Text>

          <View style={styles.filterPills}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setFilter('ALL')}
              style={[styles.pill, filter === 'ALL' && styles.pillActive]}
            >
              <Text style={[styles.pillText, filter === 'ALL' && styles.pillTextActive]}>Tất cả</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setFilter('EARNED')}
              style={[styles.pill, filter === 'EARNED' && styles.pillActive]}
            >
              <Text style={[styles.pillText, filter === 'EARNED' && styles.pillTextActive]}>Đã nhận</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setFilter('SPENT')}
              style={[styles.pill, filter === 'SPENT' && styles.pillActive]}
            >
              <Text style={[styles.pillText, filter === 'SPENT' && styles.pillTextActive]}>Đã dùng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Transaction Items List */}
        <Card style={styles.transactionsCard}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))
          ) : (
            <EmptyState
              icon={<Clock size={28} color={Colors.textMuted} />}
              title="Chưa có giao dịch"
              description="Các hoạt động nhận xu và mua sắm sẽ được ghi lại chi tiết tại đây."
            />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  resetText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  bannerMargin: {
    marginBottom: Spacing.base,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: Radius.xl,
    padding: Spacing.base + 4,
    marginBottom: Spacing.base,
    borderWidth: 0,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  virtualTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  virtualTagText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: Spacing.base,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  balanceUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.goldCoin,
  },
  lifetimeGrid: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  lifetimeCol: {
    flex: 1,
    alignItems: 'center',
  },
  lifetimeLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  lifetimeLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  lifetimeEarned: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34D399',
  },
  lifetimeSpent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F87171',
  },
  lifetimeDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
  },
  tabsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pillTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  transactionsCard: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
  },
});

