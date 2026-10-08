// TransactionItem Component for Wallet History
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  BookOpen,
  Zap,
  ShoppingBag,
  Gift,
  Footprints,
  Sparkles,
  CalendarCheck,
  RefreshCw,
} from 'lucide-react-native';
import { WalletTransaction } from '../../types';
import { Colors, Radius, Spacing } from '../../theme';

interface TransactionItemProps {
  transaction: WalletTransaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isPositive = transaction.delta > 0;

  const getIcon = () => {
    switch (transaction.type) {
      case 'WELCOME':
        return <Gift size={18} color="#D97706" />;
      case 'DAILY_CHECKIN':
        return <CalendarCheck size={18} color="#16B8A6" />;
      case 'ENGLISH_QUIZ':
        return <BookOpen size={18} color="#2563EB" />;
      case 'WORD_MATCH':
        return <Zap size={18} color="#7C3AED" />;
      case 'WALK_REWARD':
        return <Footprints size={18} color="#059669" />;
      case 'SHOP_PURCHASE':
        return <ShoppingBag size={18} color="#DC2626" />;
      default:
        return <Sparkles size={18} color={Colors.primary} />;
    }
  };

  const getIconBg = () => {
    switch (transaction.type) {
      case 'WELCOME':
        return '#FEF3C7';
      case 'DAILY_CHECKIN':
        return '#CCFBF1';
      case 'ENGLISH_QUIZ':
        return '#DBEAFE';
      case 'WORD_MATCH':
        return '#EDE9FE';
      case 'WALK_REWARD':
        return '#D1FAE5';
      case 'SHOP_PURCHASE':
        return '#FEE2E2';
      default:
        return Colors.primaryLight;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${hours}:${mins} • ${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: getIconBg() }]}>
        {getIcon()}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={styles.time}>{formatDate(transaction.createdAt)}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            isPositive ? styles.amountPositive : styles.amountNegative,
          ]}
        >
          {isPositive ? `+${transaction.delta}` : transaction.delta} EC
        </Text>
        <Text style={styles.status}>Thành công</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkInk,
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  amountPositive: {
    color: Colors.success,
  },
  amountNegative: {
    color: Colors.error,
  },
  status: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});

