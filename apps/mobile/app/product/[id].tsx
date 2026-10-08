// S04 — Product Detail Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Coins,
  Info,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { CoinBadge } from '../../src/components/ui/CoinBadge';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import {
  useShopStore,
  useCartStore,
  useWalletStore,
} from '../../src/store';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const product = useShopStore((state) => state.getProductById(id || ''));
  const wishlist = useShopStore((state) => state.wishlist);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const addToCart = useCartStore((state) => state.addToCart);
  const balance = useWalletStore((state) => state.balance);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack title="Chi tiết sản phẩm" />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Không tìm thấy sản phẩm này.</Text>
          <Button title="Quay lại Cửa Hàng" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const isLiked = wishlist.includes(product.id);
  const totalCost = product.priceCoins * quantity;
  const canAfford = balance >= totalCost;
  const maxStock = product.stock !== null ? product.stock : 99;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setSuccessToast(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header
        title="Chi Tiết Vật Phẩm"
        showBack
        showCoins
        showCart
        rightAction={
          <TouchableOpacity
            onPress={() => toggleWishlist(product.id)}
            style={styles.wishlistHeaderBtn}
          >
            <Heart
              size={20}
              color={isLiked ? Colors.error : Colors.darkInk}
              fill={isLiked ? Colors.error : 'transparent'}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.floatingBadges}>
            <Badge label="VẬT PHẨM ẢO" variant="virtual" size="md" />
            {product.badge && (
              <Badge
                label={product.badge}
                variant={product.badge === 'HOT' ? 'hot' : product.badge === 'MỚI' ? 'new' : 'rare'}
                size="md"
              />
            )}
          </View>
        </View>

        {/* Success Toast */}
        {successToast && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{successToast}</Text>
          </View>
        )}

        {/* 2. Main Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productTitle}>{product.name}</Text>

          <View style={styles.priceRow}>
            <CoinBadge amount={product.priceCoins} size="lg" />
            <Text style={styles.stockText}>
              {product.stock !== null ? `Còn ${product.stock} lượt sở hữu` : 'Vô hạn'}
            </Text>
          </View>

          {/* Balance Preview Card */}
          <View style={[styles.balanceCard, !canAfford && styles.balanceCardWarning]}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceInfoLeft}>
                <Coins size={16} color={canAfford ? '#D97706' : Colors.error} />
                <Text style={styles.balanceLabel}>Số dư của bạn: {balance} EC</Text>
              </View>
              {!canAfford && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/earn')}>
                  <Text style={styles.earnMoreLink}>+ Kiếm thêm xu</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.balanceSub}>
              {canAfford
                ? `Sau khi mua còn lại: ${balance - totalCost} EC`
                : `Còn thiếu ${totalCost - balance} EC để thanh toán`}
            </Text>
          </View>
        </View>

        {/* 3. Virtual Goods Transparency Box */}
        <View style={styles.disclaimerBox}>
          <Info size={18} color="#4338CA" />
          <View style={styles.disclaimerTextGroup}>
            <Text style={styles.disclaimerTitle}>Thông báo tính chất ảo</Text>
            <Text style={styles.disclaimerContent}>
              Đây là vật phẩm kỹ thuật số dùng để trang trí hồ sơ/avatar trong EarnMart. Ứng dụng không hỗ trợ giao hàng vật lý và không quy đổi thành tiền mặt.
            </Text>
          </View>
        </View>

        {/* 4. Description & In-app Usage */}
        <Card style={styles.detailCard}>
          <Text style={styles.sectionHeader}>Mô tả vật phẩm</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Công dụng trong ứng dụng</Text>
          <Text style={styles.usageText}>{product.usageDescription}</Text>
        </Card>

        {/* 5. Quantity Selector */}
        <Card style={styles.quantityCard}>
          <View style={styles.quantityRow}>
            <View>
              <Text style={styles.quantityTitle}>Số lượng</Text>
              <Text style={styles.quantitySub}>Tổng: {totalCost} EC</Text>
            </View>

            <View style={styles.stepperContainer}>
              <TouchableOpacity
                onPress={handleDecrease}
                disabled={quantity <= 1}
                style={[styles.stepperBtn, quantity <= 1 && styles.stepperDisabled]}
              >
                <Minus size={16} color={quantity <= 1 ? Colors.textMuted : Colors.darkInk} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{quantity}</Text>
              <TouchableOpacity
                onPress={handleIncrease}
                disabled={quantity >= maxStock}
                style={[styles.stepperBtn, quantity >= maxStock && styles.stepperDisabled]}
              >
                <Plus size={16} color={quantity >= maxStock ? Colors.textMuted : Colors.darkInk} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* 6. Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddToCart}
          style={styles.cartActionBtn}
        >
          <ShoppingBag size={20} color={Colors.primary} />
          <Text style={styles.cartActionText}>Thêm giỏ</Text>
        </TouchableOpacity>

        <Button
          title={canAfford ? `Mua ngay (${totalCost} EC)` : 'Không đủ xu — Kiếm xu'}
          onPress={canAfford ? () => router.push({ pathname: '/checkout', params: { source: 'buy-now', productId: product.id, quantity: String(quantity) } }) : () => router.push('/(tabs)/earn')}
          variant={canAfford ? 'primary' : 'secondary'}
          size="lg"
          style={styles.buyNowBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  wishlistHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: Colors.surfaceSubtle,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingBadges: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.base,
    flexDirection: 'row',
    gap: 8,
  },
  toast: {
    backgroundColor: '#DCFCE7',
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  toastText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoSection: {
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.darkInk,
    lineHeight: 26,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  stockText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  balanceCard: {
    backgroundColor: '#FEF9C3',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  balanceCardWarning: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balanceInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  earnMoreLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  balanceSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    margin: Spacing.base,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 10,
  },
  disclaimerTextGroup: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3730A3',
    marginBottom: 2,
  },
  disclaimerContent: {
    fontSize: 11,
    color: '#4338CA',
    lineHeight: 16,
  },
  detailCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkInk,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  usageText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  quantityCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  quantitySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDisabled: {
    opacity: 0.3,
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkInk,
    paddingHorizontal: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
    ...Shadows.modal,
  },
  cartActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cartActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  buyNowBtn: {
    flex: 1,
  },
});

