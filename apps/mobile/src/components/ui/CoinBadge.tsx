// CoinBadge Component — displays Earn Coins (EC) with iconic coin styling
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Coins } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '../../theme';

interface CoinBadgeProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showSign?: boolean;
  style?: ViewStyle;
  variant?: 'gold' | 'dark' | 'outline';
}

export const CoinBadge: React.FC<CoinBadgeProps> = ({
  amount,
  size = 'md',
  showSign = false,
  style,
  variant = 'gold',
}) => {
  const isPositive = amount > 0;
  const isNegative = amount < 0;

  const getSign = () => {
    if (!showSign) return '';
    if (isPositive) return '+';
    if (isNegative) return '-';
    return '';
  };

  const formattedAmount = `${getSign()}${Math.abs(amount).toLocaleString('vi-VN')} EC`;

  const iconSizes = {
    sm: 12,
    md: 15,
    lg: 18,
  };

  const textStyles = {
    sm: styles.textSm,
    md: styles.textMd,
    lg: styles.textLg,
  };

  const variantContainerStyles = {
    gold: styles.variantGold,
    dark: styles.variantDark,
    outline: styles.variantOutline,
  };

  const variantTextStyles = {
    gold: styles.textVariantGold,
    dark: styles.textVariantDark,
    outline: styles.textVariantOutline,
  };

  return (
    <View style={[styles.container, variantContainerStyles[variant], style]}>
      <Coins
        size={iconSizes[size]}
        color={variant === 'dark' ? Colors.goldCoin : Colors.goldCoinDark}
        strokeWidth={2.5}
      />
      <Text style={[styles.textBase, textStyles[size], variantTextStyles[variant]]}>
        {formattedAmount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    gap: 4,
  },
  variantGold: {
    backgroundColor: Colors.goldCoinLight,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  variantDark: {
    backgroundColor: Colors.darkInk,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textBase: {
    fontWeight: '700',
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 13,
  },
  textLg: {
    fontSize: 16,
  },
  textVariantGold: {
    color: '#92400E',
  },
  textVariantDark: {
    color: '#FEF3C7',
  },
  textVariantOutline: {
    color: Colors.textPrimary,
  },
});

