// S11 — Inventory & Avatar Equipment Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Package,
  CheckCircle,
  Sparkles,
  ShoppingBag,
  Shirt,
  Smile,
  Dog,
  Palette,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../src/theme';
import { Header } from '../src/components/ui/Header';
import { Badge } from '../src/components/ui/Badge';
import { Card, VirtualNoticeBanner } from '../src/components/ui/Card';
import { EmptyState } from '../src/components/ui/EmptyState';
import { Button } from '../src/components/ui/Button';
import { useInventoryStore, useAuthStore } from '../src/store';
import { VirtualType } from '../src/types';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - Spacing.base * 2 - 12) / 2;

export default function InventoryScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const user = useAuthStore((state) => state.user);
  const inventory = useInventoryStore((state) => state.inventory);
  const toggleEquip = useInventoryStore((state) => state.toggleEquip);

  const equippedItems = inventory.filter((item) => item.isEquipped);

  const filteredInventory = inventory.filter((item) => {
    if (selectedFilter === 'ALL') return true;
    return item.product.virtualType === selectedFilter;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Kho Đồ Sưu Tầm"
        subtitle={`${inventory.length} vật phẩm đã mở khóa`}
        showBack
        showCoins
        showCart
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <VirtualNoticeBanner compact style={styles.bannerMargin} />

        {/* 1. Avatar Showcase Preview */}
        <Card style={styles.showcaseCard} elevated>
          <View style={styles.showcaseHeader}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: user?.avatarUrl }} style={styles.avatarImg} />
              {equippedItems.length > 0 && (
                <View style={styles.equippedSparkle}>
                  <Sparkles size={16} color="#F59E0B" />
                </View>
              )}
            </View>

            <View style={styles.showcaseInfo}>
              <Text style={styles.showcaseTitle}>Avatar của bạn</Text>
              <Text style={styles.showcaseSub}>
                {equippedItems.length > 0
                  ? `Đang trang bị ${equippedItems.length} vật phẩm ảo`
                  : 'Chưa trang bị vật phẩm nào'}
              </Text>

              {/* Equipped Badges */}
              <View style={styles.equippedBadgesRow}>
                {equippedItems.map((item) => (
                  <View key={item.id} style={styles.equippedPill}>
                    <Text style={styles.equippedPillText} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Card>

        {/* 2. Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            onPress={() => setSelectedFilter('ALL')}
            style={[styles.filterChip, selectedFilter === 'ALL' && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, selectedFilter === 'ALL' && styles.filterTextActive]}>
              Tất cả ({inventory.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedFilter('AVATAR_ACCESSORY')}
            style={[styles.filterChip, selectedFilter === 'AVATAR_ACCESSORY' && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, selectedFilter === 'AVATAR_ACCESSORY' && styles.filterTextActive]}>
              Phụ kiện
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedFilter('OUTFIT')}
            style={[styles.filterChip, selectedFilter === 'OUTFIT' && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, selectedFilter === 'OUTFIT' && styles.filterTextActive]}>
              Trang phục
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedFilter('PET')}
            style={[styles.filterChip, selectedFilter === 'PET' && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, selectedFilter === 'PET' && styles.filterTextActive]}>
              Pet ảo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedFilter('DECORATION')}
            style={[styles.filterChip, selectedFilter === 'DECORATION' && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, selectedFilter === 'DECORATION' && styles.filterTextActive]}>
              Trang trí
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 3. Inventory Grid */}
        {filteredInventory.length > 0 ? (
          <View style={styles.gridContainer}>
            {filteredInventory.map((item) => (
              <View key={item.id} style={styles.gridCol}>
                <Card style={[styles.itemCard, item.isEquipped && styles.itemCardEquipped]}>
                  <View style={styles.itemImageContainer}>
                    <Image source={{ uri: item.product.imageUrl }} style={styles.itemImage} />
                    <Badge label="ẢO" variant="virtual" size="sm" style={styles.virtualBadge} />
                    {item.isEquipped && (
                      <View style={styles.equippedBadge}>
                        <CheckCircle size={14} color="#16A34A" />
                        <Text style={styles.equippedText}>Đang dùng</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemQty}>Số lượng sở hữu: {item.quantity}</Text>

                  <Button
                    title={item.isEquipped ? 'Tháo bỏ' : 'Trang bị'}
                    onPress={() => toggleEquip(item.id)}
                    variant={item.isEquipped ? 'outline' : 'primary'}
                    size="sm"
                    style={styles.equipBtn}
                  />
                </Card>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon={<Package size={36} color={Colors.textMuted} />}
            title="Kho đồ trống"
            description="Bạn chưa sở hữu vật phẩm thuộc mục này. Hãy ghé Cửa Hàng để đổi xu nhé!"
            actionTitle="Khám phá Cửa Hàng"
            onAction={() => router.push('/(tabs)/shop')}
          />
        )}
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
  showcaseCard: {
    marginBottom: Spacing.base,
    backgroundColor: '#1E293B',
    borderWidth: 0,
  },
  showcaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  equippedSparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FEF3C7',
    borderRadius: Radius.full,
    padding: 3,
  },
  showcaseInfo: {
    flex: 1,
  },
  showcaseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  showcaseSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
  },
  equippedBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  equippedPill: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  equippedPillText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
  },
  filterScroll: {
    marginBottom: Spacing.base,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCol: {
    width: GRID_ITEM_WIDTH,
  },
  itemCard: {
    padding: Spacing.sm + 2,
    alignItems: 'center',
  },
  itemCardEquipped: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  itemImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceSubtle,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  virtualBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  equippedBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  equippedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkInk,
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 34,
  },
  itemQty: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  equipBtn: {
    width: '100%',
  },
});

