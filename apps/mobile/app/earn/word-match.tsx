// S08 — Word Match Mini Game Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Zap,
  CheckCircle2,
  Trophy,
  RotateCcw,
  Sparkles,
  Timer,
  ArrowRight,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, VirtualNoticeBanner } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { SEED_WORD_PAIRS } from '../../src/constants/seedData';
import { useEarnStore } from '../../src/store';
import { WordPair } from '../../src/types';

interface CardItem {
  id: string; // unique card id
  pairId: string;
  text: string;
  lang: 'EN' | 'VI';
  isMatched: boolean;
}

const createCards = (): CardItem[] => {
  const shuffledPool = [...SEED_WORD_PAIRS].sort(() => 0.5 - Math.random()).slice(0, 6);
  const generatedCards: CardItem[] = [];
  shuffledPool.forEach((pair) => {
    generatedCards.push({ id: `en-${pair.id}`, pairId: pair.id, text: pair.english, lang: 'EN', isMatched: false });
    generatedCards.push({ id: `vi-${pair.id}`, pairId: pair.id, text: pair.vietnamese, lang: 'VI', isMatched: false });
  });
  return generatedCards.sort(() => 0.5 - Math.random());
};

export default function WordMatchScreen() {
  const router = useRouter();

  const [cards, setCards] = useState<CardItem[]>(createCards);
  const [selectedCards, setSelectedCards] = useState<CardItem[]>([]);
  const [mismatchedCards, setMismatchedCards] = useState<string[]>([]);
  const [matchedPairCount, setMatchedPairCount] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [gameFinished, setGameFinished] = useState(false);
  const [rewardResult, setRewardResult] = useState<{ success: boolean; coins: number; message: string } | null>(null);

  const awardWordMatchReward = useEarnStore((state) => state.awardWordMatchReward);
  const todayWordMatchCount = useEarnStore((state) => state.todayWordMatchCount);

  // Initialize a round with 6 pairs
  const initGame = () => {
    setCards(createCards());
    setSelectedCards([]);
    setMismatchedCards([]);
    setMatchedPairCount(0);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    setGameFinished(false);
    setRewardResult(null);
  };

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !gameFinished) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameFinished]);

  const handleCardPress = (card: CardItem) => {
    if (card.isMatched || selectedCards.find((c) => c.id === card.id) || selectedCards.length >= 2) {
      return;
    }

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;

      // Check if they match
      if (first.pairId === second.pairId && first.lang !== second.lang) {
        // Matched!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.pairId === first.pairId ? { ...c, isMatched: true } : c))
          );
          setSelectedCards([]);
          setMatchedPairCount((prev) => {
            const nextCount = prev + 1;
            if (nextCount === 6) {
              handleGameFinish();
            }
            return nextCount;
          });
        }, 300);
      } else {
        // Mismatch!
        setMismatchedCards([first.id, second.id]);
        setTimeout(() => {
          setSelectedCards([]);
          setMismatchedCards([]);
        }, 700);
      }
    }
  };

  const handleGameFinish = () => {
    setIsTimerRunning(false);
    setGameFinished(true);
    const reward = awardWordMatchReward();
    setRewardResult(reward);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  if (gameFinished && rewardResult) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Hoàn Thành Mini Game" showBack={false} showCoins showCart={false} />

        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.resultIconBox}>
            <Trophy size={54} color="#7C3AED" />
          </View>

          <Text style={styles.resultTitle}>Chúc Mừng Chiến Thắng!</Text>
          <Text style={styles.resultSubtitle}>
            Bạn đã ghép đúng tất cả 6 cặp từ trong thời gian{' '}
            <Text style={styles.boldTimer}>{formatTimer(secondsElapsed)}</Text>
          </Text>

          <Card
            style={[
              styles.rewardCard,
              rewardResult.success ? styles.rewardSuccess : styles.rewardNeutral,
            ]}
          >
            <View style={styles.rewardHeader}>
              <Sparkles size={20} color={rewardResult.success ? '#15803D' : '#92400E'} />
              <Text style={styles.rewardTitle}>
                {rewardResult.success ? `+${rewardResult.coins} EC Đã Cộng Vào Ví!` : 'Thông báo phần thưởng'}
              </Text>
            </View>
            <Text style={styles.rewardText}>{rewardResult.message}</Text>
          </Card>

          <View style={styles.resultActions}>
            <Button
              title="Chơi ván mới"
              onPress={initGame}
              variant="outline"
              size="lg"
              fullWidth
              icon={<RotateCcw size={18} color={Colors.darkInk} />}
            />
            <Button
              title="Về Trung Tâm Kiếm Xu"
              onPress={() => router.back()}
              variant="primary"
              size="lg"
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Word Match (Ghép từ)"
        subtitle={`Đã ghép: ${matchedPairCount}/6 cặp`}
        showBack
        showCoins
        showCart={false}
      />

      <ScrollView contentContainerStyle={styles.gameScroll} showsVerticalScrollIndicator={false}>
        {/* Top Info Bar */}
        <View style={styles.statsBar}>
          <View style={styles.timerBox}>
            <Timer size={16} color={Colors.primary} />
            <Text style={styles.timerText}>{formatTimer(secondsElapsed)}</Text>
          </View>

          <View style={styles.dailyCapBox}>
            <Text style={styles.dailyCapText}>Đã dùng: {todayWordMatchCount}/5 phiên</Text>
          </View>

          <TouchableOpacity onPress={initGame} style={styles.restartBtn}>
            <RotateCcw size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.instructions}>
          Chạm vào 1 từ tiếng Anh và 1 nghĩa tiếng Việt tương ứng để ghép cặp:
        </Text>

        {/* 12 Cards Grid */}
        <View style={styles.cardsGrid}>
          {cards.map((card) => {
            const isSelected = selectedCards.find((c) => c.id === card.id);
            const isMismatched = mismatchedCards.includes(card.id);

            let cardContainerStyle: StyleProp<ViewStyle> = styles.cardItem;
            let cardTextStyle: StyleProp<TextStyle> = styles.cardText;

            if (card.isMatched) {
              cardContainerStyle = [styles.cardItem, styles.cardMatched];
              cardTextStyle = [styles.cardText, styles.cardTextMatched];
            } else if (isMismatched) {
              cardContainerStyle = [styles.cardItem, styles.cardMismatched];
              cardTextStyle = [styles.cardText, styles.cardTextMismatched];
            } else if (isSelected) {
              cardContainerStyle = [styles.cardItem, styles.cardSelected];
              cardTextStyle = [styles.cardText, styles.cardTextSelected];
            }

            return (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.8}
                onPress={() => handleCardPress(card)}
                disabled={card.isMatched}
                style={cardContainerStyle}
              >
                <Badge
                  label={card.lang}
                  variant={card.lang === 'EN' ? 'new' : 'muted'}
                  size="sm"
                  style={styles.langBadge}
                />
                <Text style={cardTextStyle} numberOfLines={2}>
                  {card.text}
                </Text>
                {card.isMatched && (
                  <View style={styles.matchCheck}>
                    <CheckCircle2 size={16} color="#16A34A" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gameScroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.darkInk,
  },
  dailyCapBox: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  dailyCapText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  restartBtn: {
    padding: 6,
  },
  instructions: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardItem: {
    width: '48%',
    minHeight: 84,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: 'relative',
    ...Shadows.sm,
  },
  cardSelected: {
    width: '48%',
    minHeight: 84,
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  cardMatched: {
    width: '48%',
    minHeight: 84,
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderRadius: Radius.md,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
    opacity: 0.75,
  },
  cardMismatched: {
    width: '48%',
    minHeight: 84,
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
    borderRadius: Radius.md,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  langBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkInk,
    textAlign: 'center',
  },
  cardTextSelected: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  cardTextMatched: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'center',
  },
  cardTextMismatched: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
  },
  matchCheck: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  resultScroll: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  resultIconBox: {
    width: 90,
    height: 90,
    borderRadius: Radius.full,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.darkInk,
    marginBottom: 6,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  boldTimer: {
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  rewardCard: {
    width: '100%',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
  },
  rewardSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  rewardNeutral: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FDE047',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  rewardText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  resultActions: {
    width: '100%',
    gap: 12,
  },
});
