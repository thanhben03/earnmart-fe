// S05 — Checkout Success Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Package, ShoppingBag, ReceiptText } from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../src/theme';
import { Button } from '../src/components/ui/Button';
import { Card, VirtualNoticeBanner } from '../src/components/ui/Card';
import { useInventoryStore } from '../src/store';

export default function CheckoutSuccessScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const latestOrder = useInventoryStore((state) =>
    state.orders.find((order) => order.id === orderId)
  );

  if (!latestOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Không tìm thấy hóa đơn</Text>
          <Text style={styles.subtitle}>Vui lòng xem lại lịch sử đơn hàng ảo của bạn.</Text>
          <Button title="Xem đơn hàng" onPress={() => router.replace('/orders')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Celebratory Icon */}
        <View style={styles.iconCircle}>
          <CheckCircle2 size={54} color="#16A34A" strokeWidth={2.4} />
        </View>

        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.subtitle}>
          Đơn hàng ảo đã hoàn tất. Vật phẩm của bạn đã được thêm vào kho đồ.
        </Text>

        <VirtualNoticeBanner style={styles.notice} compact />

        {/* Order Card Preview */}
          <Card style={styles.orderCard} elevated>
            <View style={styles.orderHeader}>
              <Text style={styles.orderLabel}>Mã đơn hàng:</Text>
              <Text style={styles.orderId}>{latestOrder.id}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Đã thanh toán:</Text>
              <Text style={styles.summaryValue}>{latestOrder.totalCoins} EC</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phương thức:</Text>
              <Text style={styles.summaryValue}>Ví xu EarnMart</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Trạng thái đơn:</Text>
              <Text style={styles.statusCompleted}>Hoàn thành</Text>
            </View>

            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vật phẩm trong đơn:</Text>
              <Text style={styles.summaryValue}>{latestOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</Text>
            </View>

            <View style={styles.virtualReminder}>
              <Text style={styles.virtualReminderText}>
                ✨ Vật phẩm có thể trang bị ngay cho avatar hoặc trang trí hồ sơ cá nhân.
              </Text>
            </View>
          </Card>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button
          title="Xem hóa đơn"
          onPress={() => router.replace('/orders')}
          variant="primary"
          size="lg"
          fullWidth
          icon={<ReceiptText size={18} color="#FFFFFF" />}
        />
        <Button
          title="Xem kho đồ sưu tầm"
          onPress={() => router.replace('/inventory')}
          variant="outline"
          size="lg"
          fullWidth
          icon={<Package size={18} color={Colors.darkInk} />}
        />

        <Button
          title="Tiếp tục mua sắm"
          onPress={() => router.replace('/(tabs)/shop')}
          variant="ghost"
          size="md"
          fullWidth
          icon={<ShoppingBag size={18} color={Colors.textSecondary} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: Radius.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.darkInk,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
    marginBottom: Spacing.xl,
  },
  notice: {
    marginBottom: Spacing.base,
  },
  orderCard: {
    width: '100%',
    padding: Spacing.base,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  statusCompleted: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  virtualReminder: {
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  virtualReminderText: {
    fontSize: 11,
    color: '#4338CA',
    lineHeight: 16,
    fontWeight: '500',
  },
  footer: {
    gap: 8,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
  },
});
