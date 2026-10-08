// S02 — Home Screen (EarnMart)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShoppingBag,
  BookOpen,
  Footprints,
  Gamepad2,
  CalendarCheck,
  ChevronRight,
  Flame,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { CoinBadge } from '../../src/components/ui/CoinBadge';
import { Badge } from '../../src/components/ui/Badge';
import { Card, VirtualNoticeBanner } from '../../src/components/ui/Card';
import { ProductCard } from '../../src/components/shop/ProductCard';
import {
  useAuthStore,
  useWalletStore,
  useCartStore,
  useShopStore,
  useEarnStore,
} from '../../src/store';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const claimDailyCheckin = useAuthStore((state) => state.claimDailyCheckin);
  const balance = useWalletStore((state) => state.balance);
  const cartCount = useCartStore((state) => state.getTotalCount());
  const products = useShopStore((state) => state.products);
  const missions = useEarnStore((state) => state.missions);
  const missionProgress = useEarnStore((state) => state.missionProgress);

  const today = new Date().toISOString().slice(0, 10);
  const isCheckinClaimed = profile.lastCheckinDate === today;

  // Recommended products (top 4)
  const recommendedProducts = products.filter((p) => p.isPopular || p.isNew).slice(0, 4);

  // Completed missions count
  const completedMissionsCount = missions.filter(
    (m) => (missionProgress[m.id]?.progress || 0) >= m.target
  ).length;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleCheckin = () => {
    const res = claimDailyCheckin();
    setCheckinMessage(res.message);
    setTimeout(() => {
      setCheckinMessage(null);
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 1. App Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/profile')}
          style={styles.userInfo}
        >
          <Image
            source={{ uri: user?.avatarUrl }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.displayName || 'Khách'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/wallet')}
          >
            <CoinBadge amount={balance} size="md" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/cart')}
            style={styles.cartBtn}
          >
            <ShoppingBag size={20} color={Colors.darkInk} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* 2. Virtual Goods Transparency Banner */}
        <VirtualNoticeBanner compact style={styles.noticeBanner} />

        {/* 3. Search Bar Shortcut */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/shop')}
          style={styles.searchBar}
        >
          <Search size={18} color={Colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Bạn muốn khám phá vật phẩm gì hôm nay?</Text>
        </TouchableOpacity>

        {/* 4. Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <View style={styles.heroPill}>
              <Flame size={14} color="#FFFFFF" />
              <Text style={styles.heroPillText}>Thói quen mỗi ngày</Text>
            </View>
            <Text style={styles.heroTitle}>Học 5 phút — Nhận xu ảo mua sắm thả ga</Text>
            <Text style={styles.heroSub}>
              Tích lũy xu EC qua bài học tiếng Anh và các bước chạy bộ
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/earn')}
              style={styles.heroBtn}
            >
              <Text style={styles.heroBtnText}>Khám phá ngay</Text>
              <ChevronRight size={16} color={Colors.primaryDark} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Daily Check-in Card */}
        <Card style={styles.checkinCard}>
          <View style={styles.checkinHeader}>
            <View style={styles.checkinIconBox}>
              <CalendarCheck size={22} color={Colors.accent} />
            </View>
            <View style={styles.checkinText}>
              <Text style={styles.checkinTitle}>Điểm danh hằng ngày</Text>
              <Text style={styles.checkinSub}>
                Chuỗi hiện tại: <Text style={styles.streakHighlight}>{profile.streakDays} ngày liên tiếp</Text>
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCheckin}
              disabled={isCheckinClaimed}
              style={[
                styles.checkinBtn,
                isCheckinClaimed ? styles.checkinBtnClaimed : styles.checkinBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.checkinBtnText,
                  isCheckinClaimed ? styles.checkinBtnTextClaimed : styles.checkinBtnTextActive,
                ]}
              >
                {isCheckinClaimed ? 'Đã nhận' : '+5 EC'}
              </Text>
            </TouchableOpacity>
          </View>

          {checkinMessage && (
            <View style={styles.checkinToast}>
              <Text style={styles.checkinToastText}>{checkinMessage}</Text>
            </View>
          )}
        </Card>

        {/* 6. Quick Action Cards (3 Pillars) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hoạt động tích lũy xu</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/earn')}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionCardsRow}>
          {/* Card 1: Learn English */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/earn/quiz')}
            style={[styles.actionCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#DBEAFE' }]}>
              <BookOpen size={22} color="#2563EB" strokeWidth={2.3} />
            </View>
            <Text style={styles.actionCardTitle}>Học Tiếng Anh</Text>
            <Text style={styles.actionCardSub}>Quiz 5 câu</Text>
            <Badge label="+20 EC" variant="new" size="sm" style={styles.actionBadge} />
          </TouchableOpacity>

          {/* Card 2: Walk & Run */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/earn/walk')}
            style={[styles.actionCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Footprints size={22} color="#16A34A" strokeWidth={2.3} />
            </View>
            <Text style={styles.actionCardTitle}>Đi Bộ & Chạy</Text>
            <Text style={styles.actionCardSub}>Mô phỏng MVP</Text>
            <Badge label="MÔ PHỎNG" variant="warning" size="sm" style={styles.actionBadge} />
          </TouchableOpacity>

          {/* Card 3: Mini Games */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/earn/word-match')}
            style={[styles.actionCard, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Gamepad2 size={22} color="#9333EA" strokeWidth={2.3} />
            </View>
            <Text style={styles.actionCardTitle}>Word Match</Text>
            <Text style={styles.actionCardSub}>Ghép 6 cặp từ</Text>
            <Badge label="+10 EC" variant="hot" size="sm" style={styles.actionBadge} />
          </TouchableOpacity>
        </View>

        {/* 7. Mission Progress Snapshot */}
        <Card style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <View style={styles.missionTitleBox}>
              <Trophy size={18} color="#D97706" />
              <Text style={styles.missionTitle}>Nhiệm vụ hôm nay</Text>
            </View>
            <Text style={styles.missionRatio}>
              {completedMissionsCount}/{missions.length} hoàn thành
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(completedMissionsCount / missions.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.missionTip}>
            Hoàn thành các mục tiêu để rèn luyện thói quen và nhận thêm xu thưởng!
          </Text>
        </Card>

        {/* 8. Recommended Virtual Products (2 Columns) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vật phẩm ảo nổi bật</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/shop')}>
            <Text style={styles.seeAllText}>Đến Cửa hàng</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {recommendedProducts.map((product) => (
            <View key={product.id} style={styles.productCol}>
              <ProductCard product={product} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  greeting: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  noticeBanner: {
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  heroBanner: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.base + 2,
    marginBottom: Spacing.base,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.md,
  },
  heroContent: {
    zIndex: 2,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginBottom: 8,
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 25,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  heroBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  checkinCard: {
    marginBottom: Spacing.base,
  },
  checkinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkinIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkinText: {
    flex: 1,
  },
  checkinTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  checkinSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  streakHighlight: {
    fontWeight: '700',
    color: Colors.accentDark,
  },
  checkinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  checkinBtnActive: {
    backgroundColor: Colors.accent,
  },
  checkinBtnClaimed: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkinBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  checkinBtnTextActive: {
    color: '#FFFFFF',
  },
  checkinBtnTextClaimed: {
    color: Colors.textMuted,
  },
  checkinToast: {
    marginTop: Spacing.sm,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  checkinToastText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.base,
  },
  actionCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    ...Shadows.sm,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkInk,
    textAlign: 'center',
    marginBottom: 2,
  },
  actionCardSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  actionBadge: {
    marginTop: 'auto',
  },
  missionCard: {
    marginBottom: Spacing.base,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  missionTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  missionRatio: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceSubtle,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  missionTip: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCol: {
    width: (width - Spacing.base * 2 - 12) / 2,
  },
});

