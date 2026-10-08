// S11 — Profile, Inventory, and Settings Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Package,
  FileText,
  Award,
  Settings,
  LogOut,
  ChevronRight,
  Flame,
  Sparkles,
  ShieldAlert,
  Trash2,
  Globe,
  Bell,
  CheckCircle,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { Card, VirtualNoticeBanner } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { useAuth as useSessionAuth } from '../../src/auth/AuthProvider';
import {
  useAuthStore,
  useInventoryStore,
  useWalletStore,
} from '../../src/store';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useSessionAuth();
  const profile = useAuthStore((state) => state.profile);
  const inventory = useInventoryStore((state) => state.inventory);
  const orders = useInventoryStore((state) => state.orders);
  const balance = useWalletStore((state) => state.balance);

  const equippedItems = inventory.filter((item) => item.isEquipped);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          void logout().then(() => router.replace('/login'));
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xóa dữ liệu tài khoản?',
      'Đây là bản thử nghiệm MVP. Toàn bộ thông tin ví xu và vật phẩm ảo của tài khoản sẽ được giải phóng khỏi phiên làm việc.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa dữ liệu',
          style: 'destructive',
          onPress: () => {
            void logout().then(() => router.replace('/login'));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Hồ Sơ Cá Nhân"
        subtitle="Quản lý kho đồ & cài đặt"
        showBack={false}
        showCoins={true}
        showCart={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Virtual Goods Notice */}
        <VirtualNoticeBanner compact style={styles.bannerMargin} />

        {/* 1. Profile Avatar Card */}
        <Card style={styles.profileCard} elevated>
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' }} style={styles.avatar} />
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv.{profile.level}</Text>
              </View>
            </View>

            <View style={styles.nameDetails}>
              <View style={styles.nameTopRow}>
                <Text style={styles.displayName}>{user?.name || 'Người dùng'}</Text>
              </View>
              <Text style={styles.emailText}>{user?.email || ''}</Text>

              <View style={styles.streakBadge}>
                <Flame size={14} color="#EA580C" />
                <Text style={styles.streakText}>Streak {profile.streakDays} ngày liên tiếp</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{inventory.length}</Text>
              <Text style={styles.statLabel}>Vật phẩm ảo</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.totalQuizzesPassed}</Text>
              <Text style={styles.statLabel}>Quiz đã qua</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{orders.length}</Text>
              <Text style={styles.statLabel}>Đơn hàng ảo</Text>
            </View>
          </View>
        </Card>

        {/* 2. Virtual Inventory Showcase Shortcut */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kho đồ sưu tầm ảo</Text>
          <TouchableOpacity onPress={() => router.push('/inventory')}>
            <Text style={styles.seeAllText}>Xem tất cả ({inventory.length})</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.inventoryCard}>
          <View style={styles.inventoryHeader}>
            <Package size={20} color={Colors.primary} />
            <Text style={styles.inventoryTitle}>
              Đang trang bị: <Text style={styles.boldText}>{equippedItems.length} vật phẩm</Text>
            </Text>
          </View>

          {inventory.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemScroll}>
              {inventory.slice(0, 6).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => router.push('/inventory')}
                  style={[styles.itemPill, item.isEquipped && styles.itemPillEquipped]}
                >
                  <Image source={{ uri: item.product.imageUrl }} style={styles.itemThumb} />
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  {item.isEquipped && (
                    <View style={styles.equippedDot}>
                      <CheckCircle size={12} color="#16A34A" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noItemText}>
              Chưa sở hữu vật phẩm nào. Hãy ghé Cửa Hàng để đổi xu nhé!
            </Text>
          )}

          <Button
            title="Mở tủ đồ trang bị Avatar"
            onPress={() => router.push('/inventory')}
            variant="outline"
            size="md"
            style={styles.invBtn}
          />
        </Card>

        {/* 3. Orders & Navigation Links */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quản lý & Tiện ích</Text>
        </View>

        <Card style={styles.menuCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/orders')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
              <FileText size={18} color="#2563EB" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Lịch sử đơn hàng ảo</Text>
              <Text style={styles.menuDesc}>{orders.length} hóa đơn đã hoàn tất</Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/wallet')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
              <Sparkles size={18} color="#D97706" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Lịch sử biến động ví xu</Text>
              <Text style={styles.menuDesc}>Xem chi tiết cộng & trừ xu EC</Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Ngôn ngữ', 'Ứng dụng đang hiển thị Tiếng Việt (Nội dung câu hỏi bài học bằng Tiếng Anh).')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#F0FDF4' }]}>
              <Globe size={18} color="#16A34A" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Ngôn ngữ ứng dụng</Text>
              <Text style={styles.menuDesc}>Tiếng Việt (Mặc định)</Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* 4. Settings & Account Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
        </View>

        <Card style={styles.menuCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
              <LogOut size={18} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: Colors.primaryDark }]}>Đăng xuất</Text>
              <Text style={styles.menuDesc}>Thoát phiên đăng nhập hiện tại</Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
              <Trash2 size={18} color={Colors.error} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: Colors.error }]}>Xóa tài khoản Demo</Text>
              <Text style={styles.menuDesc}>Giải phóng dữ liệu người dùng thử nghiệm</Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
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
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  bannerMargin: {
    marginBottom: Spacing.base,
  },
  profileCard: {
    marginBottom: Spacing.base,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: Spacing.base,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.darkInk,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  nameDetails: {
    flex: 1,
  },
  nameTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.darkInk,
  },
  emailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEDD5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.darkInk,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  sectionHeader: {
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
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  inventoryCard: {
    marginBottom: Spacing.base,
  },
  inventoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  inventoryTitle: {
    fontSize: 14,
    color: Colors.darkInk,
  },
  boldText: {
    fontWeight: '700',
  },
  itemScroll: {
    marginVertical: Spacing.sm,
  },
  itemPill: {
    alignItems: 'center',
    width: 76,
    marginRight: 10,
    backgroundColor: Colors.surfaceSubtle,
    padding: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  itemPillEquipped: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 11,
    color: Colors.darkInk,
    fontWeight: '500',
    textAlign: 'center',
  },
  equippedDot: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  noItemText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginVertical: Spacing.md,
    textAlign: 'center',
  },
  invBtn: {
    marginTop: Spacing.xs,
  },
  menuCard: {
    padding: 0,
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkInk,
  },
  menuDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 66,
  },
});
