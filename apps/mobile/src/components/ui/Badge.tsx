// Badge and Tag Component — EarnMart Design System
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'virtual' | 'hot' | 'new' | 'rare' | 'success' | 'warning' | 'muted';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'virtual',
  size = 'md',
  style,
  textStyle,
}) => {
  const containerVariants = {
    virtual: styles.bgVirtual,
    hot: styles.bgHot,
    new: styles.bgNew,
    rare: styles.bgRare,
    success: styles.bgSuccess,
    warning: styles.bgWarning,
    muted: styles.bgMuted,
  };

  const textVariants = {
    virtual: styles.textVirtual,
    hot: styles.textHot,
    new: styles.textNew,
    rare: styles.textRare,
    success: styles.textSuccess,
    warning: styles.textWarning,
    muted: styles.textMuted,
  };

  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        containerVariants[variant],
        style,
      ]}
    >
      <Text
        style={[
          styles.textBase,
          size === 'sm' ? styles.textSm : styles.textMd,
          textVariants[variant],
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.xs,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeSm: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  sizeMd: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  textBase: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 9,
  },
  textMd: {
    fontSize: 11,
  },

  // Color mappings
  bgVirtual: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  textVirtual: {
    color: '#4338CA',
  },

  bgHot: {
    backgroundColor: '#FEE2E2',
  },
  textHot: {
    color: '#DC2626',
  },

  bgNew: {
    backgroundColor: '#E0F2FE',
  },
  textNew: {
    color: '#0284C7',
  },

  bgRare: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  textRare: {
    color: '#B45309',
  },

  bgSuccess: {
    backgroundColor: '#DCFCE7',
  },
  textSuccess: {
    color: '#15803D',
  },

  bgWarning: {
    backgroundColor: '#FEF3C7',
  },
  textWarning: {
    color: '#D97706',
  },

  bgMuted: {
    backgroundColor: Colors.surfaceSubtle,
  },
  textMuted: {
    color: Colors.textSecondary,
  },
});

