// S06 — Earn Hub Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Footprints,
  Gamepad2,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Gift,
  Coins,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { CoinBadge } from '../../src/components/ui/CoinBadge';
import { Badge } from '../../src/components/ui/Badge';
import { Card, VirtualNoticeBanner } from '../../src/components/ui/Card';
import { ActivityCard } from '../../src/components/earn/ActivityCard';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore, useWalletStore, useEarnStore } from '../../src/store';

export default function EarnScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const balance = useWalletStore((state) => state.balance);
  const todayQuizCount = useEarnStore((state) => state.todayQuizCount);
  const todayWordMatchCount = useEarnStore((state) => state.todayWordMatchCount);
  const missions = useEarnStore((state) => state.missions);
  const missionProgress = useEarnStore((state) => state.missionProgress);
  const claimMissionReward = useEarnStore((state) => state.claimMissionReward);

  const [claimToast, setClaimToast] = useState<string | null>(null);

  const handleClaimMission = (missionId: string) => {
    const res = claimMissionReward(missionId);
    setClaimToast(res.message);
    setTimeout(() => {
      setClaimToast(null);
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Trung Tâm Kiếm Xu"
        subtitle="Rèn luyện thói quen nhận thưởng EC"
        showBack={false}
        showCoins={true}
        showCart={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Transparency Notice */}
        <VirtualNoticeBanner compact style={styles.bannerMargin} />

        {/* 1. Hero Stats Card */}
        <Card style={styles.heroCard} elevated>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Coins size={16} color={Colors.goldCoinDark} />
                <Text style={styles.statLabel}>Số dư xu ảo</Text>
              </View>
              <Text style={styles.statValueLarge}>{balance.toLocaleString('vi-VN')} EC</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Flame size={16} color={Colors.primary} />
                <Text style={styles.statLabel}>Chuỗi kiên trì</Text>
              </View>
              <Text style={styles.statValueLarge}>{profile.streakDays} ngày</Text>
            </View>
          </View>

          <View style={styles.statsFooter}>
            <Text style={styles.statsFooterText}>
              Hoàn thành các hoạt động bên dưới để tích lũy xu mua vật phẩm avatar!
            </Text>
          </View>
        </Card>

        {claimToast && (
          <View style={styles.toastBox}>
            <Text style={styles.toastText}>{claimToast}</Text>
          </View>
        )}

        {/* 2. Primary Activities (3 Cards) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hoạt động kiếm xu</Text>
          <Text style={styles.sectionSub}>3 thử thách chính hằng ngày</Text>
        </View>

        {/* Activity 1: English Quiz */}
        <ActivityCard
          title="English Quiz (Trắc nghiệm)"
          subtitle="Học từ vựng & ngữ pháp 5 câu theo chủ đề. Đúng >= 3 câu nhận +20 EC."
          expectedReward={20}
          dailyCapText={`Đã dùng: ${todayQuizCount}/3 lần`}
          imageUri="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=80"
          badgeLabel="KHUYÊN DÙNG"
          onPress={() => router.push('/earn/quiz')}
        />

        {/* Activity 2: Word Match */}
        <ActivityCard
          title="Word Match (Ghép từ vựng)"
          subtitle="Mini game ghép 6 cặp từ Anh - Việt. Nhanh mắt nhanh tay nhận +10 EC."
          expectedReward={10}
          dailyCapText={`Đã dùng: ${todayWordMatchCount}/5 lần`}
          imageUri="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80"
          onPress={() => router.push('/earn/word-match')}
        />

        {/* Activity 3: Walk & Run Challenge */}
        <ActivityCard
          title="Thử thách Đi bộ & Chạy bộ"
          subtitle="Mô phỏng quãng đường vận động thể thao (Dữ liệu mô phỏng trong MVP)."
          expectedReward={0}
          dailyCapText="Mô phỏng MVP"
          imageUri="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=80"
          isSimulatedNotice
          onPress={() => router.push('/earn/walk')}
        />

        {/* 3. Daily Missions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nhiệm vụ hằng ngày</Text>
          <Text style={styles.sectionSub}>Hoàn thành nhận thêm xu thưởng</Text>
        </View>

        <Card style={styles.missionsCard}>
          {missions.map((mission, index) => {
            const prog = missionProgress[mission.id] || { progress: 0, isClaimed: false };
            const isCompleted = prog.progress >= mission.target;
            const isClaimed = prog.isClaimed;

            return (
              <View
                key={mission.id}
                style={[
                  styles.missionRow,
                  index < missions.length - 1 && styles.missionBorder,
                ]}
              >
                <View style={styles.missionContent}>
                  <Text style={styles.missionItemTitle}>{mission.title}</Text>
                  <Text style={styles.missionItemDesc}>{mission.description}</Text>

                  <View style={styles.missionMetaRow}>
                    <CoinBadge amount={mission.rewardCoins} size="sm" showSign />
                    <Text style={styles.missionProgText}>
                      Tiến độ: {Math.min(prog.progress, mission.target)}/{mission.target}
                    </Text>
                  </View>
                </View>

                {isClaimed ? (
                  <View style={styles.claimedBadge}>
                    <CheckCircle2 size={16} color={Colors.textMuted} />
                    <Text style={styles.claimedText}>Đã nhận</Text>
                  </View>
                ) : isCompleted ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleClaimMission(mission.id)}
                    style={styles.claimBtn}
                  >
                    <Text style={styles.claimBtnText}>Nhận thưởng</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.inProgressBadge}>
                    <Text style={styles.inProgressText}>Chưa xong</Text>
                  </View>
                )}
              </View>
            );
          })}
        </Card>

        {/* 4. Anti-Abuse Rules & Guidelines */}
        <Card style={styles.rulesCard}>
          <View style={styles.rulesHeader}>
            <ShieldAlert size={18} color="#D97706" />
            <Text style={styles.rulesTitle}>Quy định nhận xu & Giới hạn hằng ngày</Text>
          </View>
          <Text style={styles.rulesText}>
            • Mỗi tài khoản có giới hạn lượt nhận xu hằng ngày để đảm bảo thói quen học tập bền vững.{'\n'}
            • English Quiz: Tối đa 3 phiên thưởng/ngày (+20 EC/phiên).{'\n'}
            • Word Match: Tối đa 5 phiên thưởng/ngày (+10 EC/phiên).{'\n'}
            • Vận động Walk & Run trong bản MVP là dữ liệu mô phỏng, không cộng xu vào ví.{'\n'}
            • Xu EC là tiền tệ nội bộ, không có chức năng rút tiền hoặc quy đổi sang VND.
          </Text>
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
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 0,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statValueLarge: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  statsFooter: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statsFooterText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  toastBox: {
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  toastText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  missionsCard: {
    marginBottom: Spacing.base,
    padding: Spacing.md,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
  },
  missionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  missionContent: {
    flex: 1,
    marginRight: 10,
  },
  missionItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkInk,
    marginBottom: 2,
  },
  missionItemDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  missionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionProgText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  claimBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  claimedText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  inProgressBadge: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  inProgressText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  rulesCard: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FEF08A',
    marginBottom: Spacing.base,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  rulesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#854D0E',
  },
  rulesText: {
    fontSize: 12,
    color: '#713F12',
    lineHeight: 18,
  },
});

