// S03 — Shop Catalog Screen
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  ShoppingBag,
  Search,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { VirtualNoticeBanner } from '../../src/components/ui/Card';
import { SearchBar, CategoryBar } from '../../src/components/shop/CategoryBar';
import { ProductCard } from '../../src/components/shop/ProductCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useShopStore } from '../../src/store';
import { Product } from '../../src/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.base * 2 - 12) / 2;

const SORT_OPTIONS = [
  { id: 'popular', label: 'Phổ biến nhất' },
  { id: 'cost-asc', label: 'Giá xu: Thấp đến cao' },
  { id: 'cost-desc', label: 'Giá xu: Cao đến thấp' },
  { id: 'newest', label: 'Mới ra mắt' },
];

export default function ShopScreen() {
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const products = useShopStore((state) => state.products);
  const selectedCategoryId = useShopStore((state) => state.selectedCategoryId);
  const setSelectedCategoryId = useShopStore((state) => state.setSelectedCategoryId);
  const searchQuery = useShopStore((state) => state.searchQuery);
  const setSearchQuery = useShopStore((state) => state.setSearchQuery);
  const sortBy = useShopStore((state) => state.sortBy);
  const setSortBy = useShopStore((state) => state.setSortBy);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategoryId !== 'cat-all') {
      result = result.filter((p) => p.categoryId === selectedCategoryId);
    }

    // Search query filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.virtualType.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'cost-asc':
        result.sort((a, b) => a.priceCoins - b.priceCoins);
        break;
      case 'cost-desc':
        result.sort((a, b) => b.priceCoins - a.priceCoins);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }

    return result;
  }, [products, selectedCategoryId, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategoryId('cat-all');
    setSearchQuery('');
    setSortBy('popular');
  };

  const currentSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Phổ biến';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Title, Balance, Cart Badge */}
      <Header
        title="Cửa Hàng Ảo"
        subtitle="Dùng xu EC để sở hữu vật phẩm"
        showBack={false}
        showCoins={true}
        showCart={true}
      />

      {/* Sticky Search Bar */}
      <SearchBar onFilterPress={() => setSortModalVisible(true)} />

      {/* Category Horizontal Filter */}
      <CategoryBar />

      {/* Sort Info Bar */}
      <View style={styles.filterBar}>
        <Text style={styles.resultsCount}>
          Tìm thấy <Text style={styles.boldText}>{filteredProducts.length}</Text> vật phẩm ảo
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSortModalVisible(true)}
          style={styles.sortTrigger}
        >
          <ArrowUpDown size={14} color={Colors.primary} />
          <Text style={styles.sortLabel}>{currentSortLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <VirtualNoticeBanner compact style={styles.bannerMargin} />
        }
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <ProductCard product={item} />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Search size={32} color={Colors.primary} />}
            title="Không tìm thấy vật phẩm"
            description="Hãy thử tìm từ khóa khác hoặc thiết lập lại bộ lọc để xem toàn bộ danh mục."
            actionTitle="Đặt lại bộ lọc"
            onAction={handleResetFilters}
          />
        }
      />

      {/* Sort Options Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sắp xếp vật phẩm</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Text style={styles.modalCloseText}>Đóng</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalOptions}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = opt.id === sortBy;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSortBy(opt.id as any);
                      setSortModalVisible(false);
                    }}
                    style={[styles.sortOptionRow, isSelected && styles.sortOptionRowActive]}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        isSelected && styles.sortOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <Check size={18} color={Colors.primary} strokeWidth={2.5} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  resultsCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.darkInk,
  },
  sortTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
  },
  bannerMargin: {
    marginBottom: Spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 32, 51, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
    ...Shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  modalCloseText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalOptions: {
    paddingTop: Spacing.sm,
  },
  sortOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
  },
  sortOptionRowActive: {
    backgroundColor: Colors.primaryLight,
  },
  sortOptionText: {
    fontSize: 14,
    color: Colors.darkInk,
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
});
