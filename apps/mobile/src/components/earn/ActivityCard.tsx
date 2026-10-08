// ActivityCard for Earn Hub
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ChevronRight, Sparkles, Clock } from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../theme';
import { CoinBadge } from '../ui/CoinBadge';
import { Badge } from '../ui/Badge';

interface ActivityCardProps {
  title: string;
  subtitle: string;
  expectedReward: number;
  dailyCapText: string;
  imageUri: string;
  onPress: () => void;
  accentColor?: string;
  badgeLabel?: string;
  isSimulatedNotice?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  subtitle,
  expectedReward,
  dailyCapText,
  imageUri,
  onPress,
  accentColor = Colors.primary,
  badgeLabel,
  isSimulatedNotice = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.contentRow}>
        <Image
          source={{ uri: imageUri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <View style={styles.textDetails}>
          <View style={styles.topRow}>
            {badgeLabel ? (
              <Badge label={badgeLabel} variant="new" size="sm" />
            ) : null}
            {isSimulatedNotice ? (
              <Badge label="MÔ PHỎNG" variant="warning" size="sm" />
            ) : null}
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>

          <View style={styles.footerRow}>
            <CoinBadge amount={expectedReward} size="sm" showSign={expectedReward > 0} />
            <View style={styles.capPill}>
              <Clock size={11} color={Colors.textSecondary} />
              <Text style={styles.capText}>{dailyCapText}</Text>
            </View>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <ChevronRight size={20} color={Colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 76,
    height: 76,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceSubtle,
  },
  textDetails: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkInk,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  capPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  capText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  arrowContainer: {
    paddingLeft: 4,
  },
});

