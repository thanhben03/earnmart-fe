// S11 — Virtual Orders History Screen
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
import { FileText, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../src/theme';
import { Header } from '../src/components/ui/Header';
import { Card, VirtualNoticeBanner } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { CoinBadge } from '../src/components/ui/CoinBadge';
import { EmptyState } from '../src/components/ui/EmptyState';
import { useInventoryStore } from '../src/store';

export default function OrdersScreen() {
  const router = useRouter();
  const orders = useInventoryStore((state) => state.orders);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${mins} • ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Lịch Sử Đơn Hàng Ảo"
        subtitle={`${orders.length} hóa đơn đã tạo`}
        showBack
        showCoins
        showCart
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <VirtualNoticeBanner compact style={styles.bannerMargin} />

        {orders.length > 0 ? (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                {/* Order Top Bar */}
                <View style={styles.orderTopBar}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <CheckCircle2 size={13} color="#15803D" />
                    <Text style={styles.statusText}>Hoàn thành</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Items in this order */}
                <View style={styles.itemsList}>
                  {order.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Image source={{ uri: item.imageUrl }} style={styles.itemThumb} />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.productName}
                        </Text>
                        <Text style={styles.itemQty}>Số lượng: x{item.quantity}</Text>
                      </View>
                      <CoinBadge amount={item.unitPriceCoins * item.quantity} size="sm" />
                    </View>
                  ))}
                </View>

                <Text style={styles.paymentMethod}>Thanh toán: Ví xu EarnMart · Mô phỏng</Text>

                <View style={styles.divider} />

                {/* Order Footer Total */}
                <View style={styles.orderFooter}>
                  <Badge label="ĐƠN HÀNG ẢO" variant="virtual" size="sm" />
                  <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
                    <Text style={styles.totalValue}>{order.totalCoins} EC</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState
            icon={<FileText size={36} color={Colors.textMuted} />}
            title="Chưa có đơn hàng nào"
            description="Bạn chưa thực hiện giao dịch mua vật phẩm ảo nào. Ghé ngay Cửa Hàng để lựa chọn nhé!"
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
  ordersList: {
    gap: 12,
  },
  orderCard: {
    padding: Spacing.base,
  },
  orderTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.darkInk,
  },
  orderDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceSubtle,
  },
  itemInfo: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.darkInk,
  },
  itemQty: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
});
