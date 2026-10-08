// S09 — Walk & Run Tracking Screen (Simulated Mode)
import React, { useState, useEffect } from 'react';
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
  Footprints,
  Play,
  Pause,
  RotateCcw,
  Square,
  Flame,
  Clock,
  Gauge,
  Sparkles,
  Info,
  FastForward,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, VirtualNoticeBanner } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import {
  activityTracker,
  TrackingState,
} from '../../src/services/activityTracking';
import { useEarnStore } from '../../src/store';

export default function WalkScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<'WALK' | 'RUN'>('WALK');
  const [trackingState, setTrackingState] = useState<TrackingState>({
    isActive: false,
    isPaused: false,
    distanceMeters: 0,
    durationSeconds: 0,
    currentPaceSecPerKm: 600,
    caloriesEstimated: 0,
    mode: 'WALK',
  });

  const recordSimulatedWalk = useEarnStore((state) => state.recordSimulatedWalk);
  const simulatedSessions = useEarnStore((state) => state.simulatedSessions);

  useEffect(() => {
    return () => {
      if (trackingState.isActive) {
        activityTracker.stopTracking();
      }
    };
  }, []);

  const handleStart = () => {
    activityTracker.startTracking(mode, (state) => {
      setTrackingState(state);
    });
  };

  const handlePause = () => {
    activityTracker.pauseTracking();
  };

  const handleResume = () => {
    activityTracker.resumeTracking();
  };

  const handleFinish = async () => {
    const finalState = await activityTracker.stopTracking();
    if (finalState.distanceMeters > 50) {
      recordSimulatedWalk(
        Math.round(finalState.distanceMeters),
        finalState.durationSeconds
      );
      Alert.alert(
        'Hoàn thành phiên vận động',
        `Bạn đã hoàn thành ${(finalState.distanceMeters / 1000).toFixed(2)} km trong ${formatDuration(finalState.durationSeconds)}.\n\n⚠️ Lưu ý: Trong bản thử nghiệm MVP, đây là dữ liệu mô phỏng nhằm kiểm thử luồng ứng dụng.`
      );
    }
  };

  const handleSimulateBoost = () => {
    activityTracker.simulateJump(500); // add 500m for quick testing
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const distanceKm = (trackingState.distanceMeters / 1000).toFixed(2);
  const targetKm = 1.0;
  const progressRatio = Math.min(1, trackingState.distanceMeters / (targetKm * 1000));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Vận Động Walk & Run"
        subtitle="Rèn luyện thói quen thể thao"
        showBack
        showCoins
        showCart={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Strict Simulation Notice */}
        <View style={styles.simulationBanner}>
          <Info size={18} color="#D97706" />
          <View style={styles.simTextGroup}>
            <Text style={styles.simTitle}>Chế độ mô phỏng thử nghiệm</Text>
            <Text style={styles.simDesc}>
              Bản MVP sử dụng `ActivityTrackingProvider` mô phỏng. Dữ liệu vận động không kết nối GPS thực tế và không phát sinh xu thưởng thật.
            </Text>
          </View>
        </View>

        {/* Mode Selector (Walk vs Run) */}
        {!trackingState.isActive && (
          <View style={styles.modeSelector}>
            <TouchableOpacity
              onPress={() => setMode('WALK')}
              style={[styles.modeBtn, mode === 'WALK' && styles.modeBtnActive]}
            >
              <Footprints size={18} color={mode === 'WALK' ? '#FFFFFF' : Colors.darkInk} />
              <Text style={[styles.modeBtnText, mode === 'WALK' && styles.modeBtnTextActive]}>
                Đi bộ (Walk)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMode('RUN')}
              style={[styles.modeBtn, mode === 'RUN' && styles.modeBtnActive]}
            >
              <Flame size={18} color={mode === 'RUN' ? '#FFFFFF' : Colors.darkInk} />
              <Text style={[styles.modeBtnText, mode === 'RUN' && styles.modeBtnTextActive]}>
                Chạy bộ (Run)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 1. Main Distance Hero Circle */}
        <Card style={styles.metricCard} elevated>
          <View style={styles.metricHeader}>
            <Badge
              label={trackingState.mode === 'RUN' ? 'CHẠY BỘ' : 'ĐI BỘ'}
              variant="new"
              size="sm"
            />
            {trackingState.isActive && (
              <Badge
                label={trackingState.isPaused ? 'TẠM DỪNG' : 'ĐANG GHI NHẬN'}
                variant={trackingState.isPaused ? 'warning' : 'success'}
                size="sm"
              />
            )}
          </View>

          <View style={styles.distanceBox}>
            <Text style={styles.distanceValue}>{distanceKm}</Text>
            <Text style={styles.distanceUnit}>KM</Text>
          </View>

          {/* Progress to target */}
          <View style={styles.targetProgress}>
            <View style={styles.targetBarTrack}>
              <View style={[styles.targetBarFill, { width: `${progressRatio * 100}%` }]} />
            </View>
            <Text style={styles.targetLabel}>
              Mục tiêu phiên: {distanceKm} / {targetKm.toFixed(1)} km
            </Text>
          </View>

          {/* Sub Metrics (Duration, Pace, Calories) */}
          <View style={styles.subMetricsRow}>
            <View style={styles.subMetricCol}>
              <View style={styles.subMetricHeader}>
                <Clock size={14} color={Colors.textSecondary} />
                <Text style={styles.subMetricLabel}>Thời gian</Text>
              </View>
              <Text style={styles.subMetricVal}>
                {formatDuration(trackingState.durationSeconds)}
              </Text>
            </View>

            <View style={styles.subDivider} />

            <View style={styles.subMetricCol}>
              <View style={styles.subMetricHeader}>
                <Gauge size={14} color={Colors.textSecondary} />
                <Text style={styles.subMetricLabel}>Tốc độ</Text>
              </View>
              <Text style={styles.subMetricVal}>
                {trackingState.mode === 'RUN' ? '5:40 /km' : '9:50 /km'}
              </Text>
            </View>

            <View style={styles.subDivider} />

            <View style={styles.subMetricCol}>
              <View style={styles.subMetricHeader}>
                <Flame size={14} color="#EA580C" />
                <Text style={styles.subMetricLabel}>Calo</Text>
              </View>
              <Text style={styles.subMetricVal}>
                {Math.round(trackingState.caloriesEstimated)} kcal
              </Text>
            </View>
          </View>
        </Card>

        {/* 2. Controls */}
        <View style={styles.controlsSection}>
          {!trackingState.isActive ? (
            <Button
              title="Bắt đầu vận động"
              onPress={handleStart}
              variant="primary"
              size="lg"
              fullWidth
              icon={<Play size={20} color="#FFFFFF" fill="#FFFFFF" />}
            />
          ) : (
            <View style={styles.activeControlsRow}>
              {trackingState.isPaused ? (
                <Button
                  title="Tiếp tục"
                  onPress={handleResume}
                  variant="primary"
                  size="lg"
                  style={styles.flexBtn}
                  icon={<Play size={18} color="#FFFFFF" fill="#FFFFFF" />}
                />
              ) : (
                <Button
                  title="Tạm dừng"
                  onPress={handlePause}
                  variant="secondary"
                  size="lg"
                  style={styles.flexBtn}
                  icon={<Pause size={18} color={Colors.primaryDark} fill={Colors.primaryDark} />}
                />
              )}

              <Button
                title="Kết thúc"
                onPress={handleFinish}
                variant="danger"
                size="lg"
                style={styles.flexBtn}
                icon={<Square size={18} color="#FFFFFF" fill="#FFFFFF" />}
              />
            </View>
          )}

          {/* Test Control: Simulated Jump */}
          {trackingState.isActive && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSimulateBoost}
              style={styles.simulateBoostBtn}
            >
              <FastForward size={16} color={Colors.accentDark} />
              <Text style={styles.simulateBoostText}>+500m Thử nghiệm (Test control)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. Session History Preview */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Lịch sử mô phỏng gần đây</Text>
        </View>

        <Card style={styles.historyCard}>
          {simulatedSessions.length > 0 ? (
            simulatedSessions.map((sess, idx) => (
              <View
                key={sess.id}
                style={[
                  styles.historyRow,
                  idx < simulatedSessions.length - 1 && styles.historyBorder,
                ]}
              >
                <View style={styles.historyIconBox}>
                  <Footprints size={18} color={Colors.accent} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDistance}>
                    {((sess.distanceMeters || 0) / 1000).toFixed(2)} km
                  </Text>
                  <Text style={styles.historyTime}>
                    Thời gian: {formatDuration(sess.durationSeconds || 0)}
                  </Text>
                </View>
                <Badge label="MÔ PHỎNG" variant="warning" size="sm" />
              </View>
            ))
          ) : (
            <Text style={styles.noHistoryText}>Chưa có phiên vận động nào được ghi nhận.</Text>
          )}
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
  simulationBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 10,
    marginBottom: Spacing.base,
  },
  simTextGroup: {
    flex: 1,
  },
  simTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  simDesc: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.base,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 6,
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  metricCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.base,
  },
  metricHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  distanceBox: {
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  distanceValue: {
    fontSize: 54,
    fontWeight: '900',
    color: Colors.darkInk,
    letterSpacing: -1,
  },
  distanceUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  targetProgress: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  targetBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceSubtle,
    overflow: 'hidden',
    marginBottom: 6,
  },
  targetBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  targetLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  subMetricsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.md,
    padding: Spacing.md,
    justifyContent: 'space-around',
  },
  subMetricCol: {
    alignItems: 'center',
  },
  subMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  subMetricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  subMetricVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  subDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  controlsSection: {
    marginBottom: Spacing.xl,
    gap: 10,
  },
  activeControlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexBtn: {
    flex: 1,
  },
  simulateBoostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accentLight,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  simulateBoostText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentDark,
  },
  historyHeader: {
    marginBottom: Spacing.sm,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  historyCard: {
    padding: Spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  historyBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  historyIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyDistance: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  historyTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  noHistoryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: Spacing.md,
  },
});

