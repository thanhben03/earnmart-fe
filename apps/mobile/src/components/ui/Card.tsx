// Reusable Card and Virtual Notice Banner Components
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { Info, ShieldAlert } from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, elevated = false }) => {
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={[styles.card, elevated ? Shadows.md : Shadows.card, style]}
    >
      {children}
    </CardContainer>
  );
};

interface VirtualNoticeBannerProps {
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export const VirtualNoticeBanner: React.FC<VirtualNoticeBannerProps> = ({ style, compact = false }) => {
  return (
    <View style={[styles.noticeContainer, compact && styles.noticeCompact, style]}>
      <Info size={compact ? 14 : 16} color="#6366F1" strokeWidth={2.2} />
      <Text style={[styles.noticeText, compact && styles.noticeTextCompact]}>
        Vật phẩm ảo & Xu EC chỉ dùng trong app EarnMart. Không có giá trị tiền mặt hoặc quy đổi VND.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  noticeCompact: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#3730A3',
    lineHeight: 16,
    fontWeight: '500',
  },
  noticeTextCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
});
