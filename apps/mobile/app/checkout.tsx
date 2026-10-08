import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Coins, LockKeyhole, ShieldCheck, ShoppingBag } from 'lucide-react-native';
import { Header } from '../src/components/ui/Header';
import { Button } from '../src/components/ui/Button';
import { Card, VirtualNoticeBanner } from '../src/components/ui/Card';
import { Colors, Radius, Shadows, Spacing } from '../src/theme';
import { useCartStore, useInventoryStore, useShopStore, useWalletStore } from '../src/store';

type CheckoutStep = 'review' | 'payment' | 'processing';

export default function CheckoutScreen() {
  const router = useRouter();
  const { source, productId, quantity: quantityParam } = useLocalSearchParams<{
    source?: string;
    productId?: string;
    quantity?: string;
  }>();
  const [step, setStep] = useState<CheckoutStep>('review');
  const [processingStage, setProcessingStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cartItems = useCartStore((state) => state.items);
  const products = useShopStore((state) => state.products);
  const balance = useWalletStore((state) => state.balance);
  const checkoutCart = useInventoryStore((state) => state.checkoutCart);
  const buyNow = useInventoryStore((state) => state.buyNow);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const isBuyNow = source === 'buy-now';
  const product = products.find((item) => item.id === productId);
  const parsedQuantity = Number(quantityParam);
  const quantity = Number.isInteger(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
  const items = isBuyNow
    ? product ? [{ id: product.id, product, quantity }] : []
    : cartItems;
  const totalCoins = items.reduce((sum, item) => sum + item.product.priceCoins * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const canAfford = totalCoins > 0 && balance >= totalCoins;

  const handlePayment = () => {
    if (submitting.current || !canAfford || items.length === 0) return;
    submitting.current = true;
    setError(null);
    setProcessingStage(0);
    setStep('processing');

    timers.current = [
      setTimeout(() => setProcessingStage(1), 550),
      setTimeout(() => setProcessingStage(2), 1100),
      setTimeout(() => {
        const result = isBuyNow && product
          ? buyNow(product, quantity)
          : checkoutCart();
        submitting.current = false;
        if (result.success && result.orderId) {
          router.replace({ pathname: '/checkout-success', params: { orderId: result.orderId } });
        } else {
          setError(result.error || 'Không thể hoàn tất thanh toán. Vui lòng thử lại.');
          setStep('payment');
        }
      }, 1700),
    ];
  };

  const handleBack = () => {
    if (step === 'payment') {
      setError(null);
      setStep('review');
    } else {
      router.back();
    }
  };

  if (items.length === 0 && step !== 'processing') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header title="Thanh toán" showBack />
        <View style={styles.emptyState}>
          <ShoppingBag size={38} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Chưa có vật phẩm để thanh toán</Text>
          <Button title="Đến cửa hàng" onPress={() => router.replace('/(tabs)/shop')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header title="Thanh toán đơn hàng" showBack={step !== 'processing'} onBackPress={handleBack} showCoins={false} />

      <View style={styles.stepper} accessibilityLabel={`Bước ${step === 'review' ? 1 : step === 'payment' ? 2 : 3} trên 3`}>
        {['Kiểm tra đơn', 'Thanh toán', 'Hoàn tất'].map((label, index) => {
          const activeIndex = step === 'review' ? 0 : step === 'payment' ? 1 : 2;
          return (
            <React.Fragment key={label}>
              {index > 0 && <View style={[styles.stepLine, index <= activeIndex && styles.stepLineActive]} />}
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, index <= activeIndex && styles.stepCircleActive]}>
                  {index < activeIndex ? <Check size={14} color={Colors.surface} /> : (
                    <Text style={[styles.stepNumber, index <= activeIndex && styles.stepNumberActive]}>{index + 1}</Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, index === activeIndex && styles.stepLabelActive]}>{label}</Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {step === 'processing' ? (
        <View style={styles.processingContainer}>
          <View style={styles.processingIcon}><ActivityIndicator size="large" color={Colors.primary} /></View>
          <Text style={styles.processingTitle}>Đang hoàn tất đơn hàng</Text>
          <Text style={styles.processingSubtitle}>Vui lòng chờ trong giây lát</Text>
          {['Kiểm tra số dư ví EC', 'Xác nhận thanh toán mô phỏng', 'Tạo hóa đơn và thêm vật phẩm'].map((label, index) => (
            <View key={label} style={styles.progressRow}>
              <View style={[styles.progressDot, index <= processingStage && styles.progressDotActive]}>
                {index < processingStage && <Check size={13} color={Colors.surface} />}
              </View>
              <Text style={[styles.progressText, index <= processingStage && styles.progressTextActive]}>{label}</Text>
            </View>
          ))}
          <Text style={styles.processingNote}>Không có tiền thật hoặc giao hàng vật lý.</Text>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <VirtualNoticeBanner style={styles.notice} />

            {step === 'review' ? (
              <>
                <Text style={styles.pageTitle}>Kiểm tra đơn hàng</Text>
                <Text style={styles.pageSubtitle}>Xem lại vật phẩm trước khi chọn thanh toán.</Text>
                <Card style={styles.card}>
                  <Text style={styles.cardTitle}>{itemCount} vật phẩm ảo</Text>
                  {items.map((item) => (
                    <View key={item.id} style={styles.productRow}>
                      <Image source={{ uri: item.product.imageUrl }} style={styles.productImage} />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>{item.product.name}</Text>
                        <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
                      </View>
                      <Text style={styles.productPrice}>{item.product.priceCoins * item.quantity} EC</Text>
                    </View>
                  ))}
                </Card>
                <Card style={styles.card}>
                  <Text style={styles.cardTitle}>Tóm tắt đơn hàng</Text>
                  <View style={styles.summaryRow}><Text style={styles.muted}>Tạm tính</Text><Text style={styles.value}>{totalCoins} EC</Text></View>
                  <View style={styles.summaryRow}><Text style={styles.muted}>Phí giao hàng</Text><Text style={styles.value}>Không áp dụng</Text></View>
                  <View style={styles.divider} />
                  <View style={styles.summaryRow}><Text style={styles.totalLabel}>Tổng thanh toán</Text><Text style={styles.totalValue}>{totalCoins} EC</Text></View>
                </Card>
              </>
            ) : (
              <>
                <Text style={styles.pageTitle}>Phương thức thanh toán</Text>
                <Text style={styles.pageSubtitle}>Xác nhận số xu sẽ dùng cho đơn hàng ảo.</Text>
                <Card style={styles.paymentCard}>
                  <View style={styles.paymentRow}>
                    <View style={styles.walletIcon}><Coins size={24} color={Colors.goldCoinDark} /></View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentTitle}>Ví xu EarnMart</Text>
                      <Text style={styles.muted}>Thanh toán mô phỏng bằng EC</Text>
                    </View>
                    <View style={styles.selectedRadio}><View style={styles.radioCenter} /></View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.summaryRow}><Text style={styles.muted}>Số dư hiện tại</Text><Text style={styles.value}>{balance} EC</Text></View>
                  <View style={styles.summaryRow}><Text style={styles.muted}>Thanh toán đơn hàng</Text><Text style={styles.value}>−{totalCoins} EC</Text></View>
                  <View style={styles.summaryRow}><Text style={styles.totalLabel}>Còn lại sau mua</Text><Text style={styles.totalValue}>{balance - totalCoins} EC</Text></View>
                </Card>
                <View style={styles.assurance}>
                  <ShieldCheck size={20} color={Colors.accentDark} />
                  <Text style={styles.assuranceText}>Sau khi xác nhận, EC được trừ một lần và vật phẩm được thêm vào kho đồ.</Text>
                </View>
                {error && <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>}
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerTotal}><Text style={styles.muted}>Tổng cộng</Text><Text style={styles.totalValue}>{totalCoins} EC</Text></View>
            {!canAfford ? (
              <>
                <Text style={styles.shortfall}>Thiếu {totalCoins - balance} EC để thanh toán</Text>
                <Button title="Kiếm thêm xu" onPress={() => router.push('/(tabs)/earn')} fullWidth size="lg" />
              </>
            ) : step === 'review' ? (
              <Button title="Tiếp tục thanh toán" onPress={() => setStep('payment')} fullWidth size="lg" />
            ) : (
              <>
                <Button title={`Xác nhận thanh toán ${totalCoins} EC`} onPress={handlePayment} fullWidth size="lg" icon={<LockKeyhole size={17} color={Colors.surface} />} />
                <Pressable onPress={handleBack} style={styles.backButton} accessibilityRole="button">
                  <Text style={styles.backText}>Quay lại kiểm tra đơn</Text>
                </Pressable>
              </>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  stepper: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: Spacing.base, paddingVertical: Spacing.base, backgroundColor: Colors.surface },
  stepItem: { alignItems: 'center', width: 92 },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.border, marginTop: 14 },
  stepLineActive: { backgroundColor: Colors.primary },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceSubtle, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepNumber: { color: Colors.textSecondary, fontWeight: '700', fontSize: 12 },
  stepNumberActive: { color: Colors.surface },
  stepLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 5, textAlign: 'center' },
  stepLabelActive: { color: Colors.darkInk, fontWeight: '700' },
  scrollContent: { padding: Spacing.base, paddingBottom: Spacing.xxl },
  notice: { marginBottom: Spacing.lg },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.darkInk },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.lg },
  card: { marginBottom: Spacing.base },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.darkInk, marginBottom: Spacing.sm },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  productImage: { width: 52, height: 52, borderRadius: Radius.sm, backgroundColor: Colors.surfaceSubtle },
  productInfo: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '600', color: Colors.darkInk },
  productQuantity: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  productPrice: { fontSize: 13, fontWeight: '700', color: Colors.primaryDark },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5, gap: Spacing.sm },
  muted: { color: Colors.textSecondary, fontSize: 13 },
  value: { color: Colors.darkInk, fontSize: 13, fontWeight: '600' },
  totalLabel: { color: Colors.darkInk, fontSize: 15, fontWeight: '700' },
  totalValue: { color: Colors.primaryDark, fontSize: 18, fontWeight: '800' },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
  paymentCard: { marginBottom: Spacing.base },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 56 },
  walletIcon: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.goldCoinLight, alignItems: 'center', justifyContent: 'center' },
  paymentInfo: { flex: 1 },
  paymentTitle: { color: Colors.darkInk, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  selectedRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  radioCenter: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  assurance: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.accentLight },
  assuranceText: { flex: 1, color: Colors.accentDark, fontSize: 12, lineHeight: 18 },
  errorText: { color: Colors.error, fontSize: 13, marginTop: Spacing.md, fontWeight: '600' },
  footer: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.borderLight, padding: Spacing.base, gap: Spacing.sm, ...Shadows.card },
  footerTotal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  shortfall: { color: Colors.error, fontSize: 12, fontWeight: '600' },
  backButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  processingContainer: { flex: 1, padding: Spacing.xl, justifyContent: 'center', alignItems: 'center' },
  processingIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  processingTitle: { color: Colors.darkInk, fontSize: 21, fontWeight: '800', textAlign: 'center' },
  processingSubtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 5, marginBottom: Spacing.xl },
  progressRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  progressDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.surfaceSubtle, alignItems: 'center', justifyContent: 'center' },
  progressDotActive: { backgroundColor: Colors.accent },
  progressText: { color: Colors.textMuted, fontSize: 13 },
  progressTextActive: { color: Colors.darkInk, fontWeight: '600' },
  processingNote: { color: Colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: Spacing.xl },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.base, padding: Spacing.xl },
  emptyTitle: { color: Colors.darkInk, fontSize: 17, fontWeight: '700', textAlign: 'center' },
});
