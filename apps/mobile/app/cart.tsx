// S05 — Cart & Checkout Screen (Pure Virtual Goods Checkout)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Coins,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../src/theme';
import { Header } from '../src/components/ui/Header';
import { CoinBadge } from '../src/components/ui/CoinBadge';
import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';
import { Card, VirtualNoticeBanner } from '../src/components/ui/Card';
import { EmptyState } from '../src/components/ui/EmptyState';
import { useCartStore, useWalletStore } from '../src/store';

export default function CartScreen() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const totalCoins = useCartStore((state) => state.getTotalCoins());
  const balance = useWalletStore((state) => state.balance);

  const canAfford = balance >= totalCoins;
  const remainingCoins = balance - totalCoins;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header
        title="Giỏ Hàng Ảo"
        subtitle={`${cartItems.length} loại vật phẩm`}
        showBack
        showCoins
        showCart={false}
      />

      {cartItems.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={40} color={Colors.textMuted} />}
          title="Giỏ hàng đang trống"
          description="Khám phá các phụ kiện avatar và thú cưng ảo độc đáo trong Cửa hàng để thêm vào giỏ nhé!"
          actionTitle="Đến Cửa Hàng"
          onAction={() => router.push('/(tabs)/shop')}
        />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Virtual Goods Banner */}
            <VirtualNoticeBanner compact style={styles.bannerMargin} />

            {/* List of Cart Items */}
            <View style={styles.itemsList}>
              {cartItems.map((item) => {
                return (
                  <Card key={item.id} style={styles.itemCard}>
                    <Image source={{ uri: item.product.imageUrl }} style={styles.itemImage} />

                    <View style={styles.itemDetails}>
                      <View style={styles.itemTopRow}>
                        <Badge label="ẢO" variant="virtual" size="sm" />
                        <TouchableOpacity
                          onPress={() => removeFromCart(item.product.id)}
                          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                        >
                          <Trash2 size={16} color={Colors.textMuted} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.product.name}
                      </Text>

                      <View style={styles.itemBottomRow}>
                        <CoinBadge amount={item.product.priceCoins} size="sm" />

                        <View style={styles.stepperContainer}>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                            style={styles.stepBtn}
                          >
                            <Minus size={14} color={Colors.darkInk} />
                          </TouchableOpacity>
                          <Text style={styles.stepText}>{item.quantity}</Text>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                            style={styles.stepBtn}
                          >
                            <Plus size={14} color={Colors.darkInk} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>

            {/* Order Summary Card */}
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Tóm tắt thanh toán</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tổng giá trị vật phẩm ảo</Text>
                <CoinBadge amount={totalCoins} size="md" />
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí giao hàng vật lý</Text>
                <Text style={styles.freeText}>0 EC (Không áp dụng giao hàng)</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Tổng thanh toán</Text>
                <Text style={styles.summaryTotalCoins}>{totalCoins} EC</Text>
              </View>

              {/* Wallet Balance Verification */}
              <View style={[styles.balanceBox, !canAfford && styles.balanceBoxWarning]}>
                <View style={styles.balanceRow}>
                  <View style={styles.balanceLeft}>
                    <Coins size={16} color={canAfford ? '#D97706' : Colors.error} />
                    <Text style={styles.balanceText}>Số dư khả dụng: {balance} EC</Text>
                  </View>
                  <Text
                    style={[
                      styles.balanceStatus,
                      canAfford ? styles.balanceOk : styles.balanceShort,
                    ]}
                  >
                    {canAfford ? 'Đủ xu' : `Thiếu ${totalCoins - balance} EC`}
                  </Text>
                </View>

                {canAfford ? (
                  <Text style={styles.balanceSub}>Sau khi mua sẽ còn: {remainingCoins} EC</Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/earn')}
                    style={styles.earnMoreTouch}
                  >
                    <Text style={styles.earnMoreText}>→ Chuyển đến mục Kiếm Xu để tích lũy thêm</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          </ScrollView>

          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomTotal}>
              <Text style={styles.bottomTotalLabel}>Tổng cộng:</Text>
              <Text style={styles.bottomTotalValue}>{totalCoins} EC</Text>
            </View>

            <Button
              title={canAfford ? 'Tiếp tục thanh toán' : 'Không đủ xu — Kiếm xu'}
              onPress={canAfford ? () => router.push({ pathname: '/checkout', params: { source: 'cart' } }) : () => router.push('/(tabs)/earn')}
              variant={canAfford ? 'primary' : 'secondary'}
              size="lg"
              style={styles.checkoutBtn}
            />
          </View>
        </>
      )}

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
    paddingBottom: 110,
  },
  bannerMargin: {
    marginBottom: Spacing.base,
  },
  itemsList: {
    gap: 12,
    marginBottom: Spacing.base,
  },
  itemCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: 12,
  },
  itemImage: {
    width: 74,
    height: 74,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceSubtle,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkInk,
    marginVertical: 4,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    color: Colors.darkInk,
  },
  summaryCard: {
    marginBottom: Spacing.base,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkInk,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  freeText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  summaryTotalCoins: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  balanceBox: {
    backgroundColor: '#FEF9C3',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  balanceBoxWarning: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  balanceStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  balanceOk: {
    color: '#15803D',
  },
  balanceShort: {
    color: Colors.error,
  },
  balanceSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  earnMoreTouch: {
    marginTop: 4,
  },
  earnMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
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
  bottomTotal: {
    justifyContent: 'center',
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  bottomTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  checkoutBtn: {
    flex: 1,
  },

});

