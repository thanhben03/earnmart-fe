// S07 — English Quiz Mini Game Screen
import React, { useState } from 'react';
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
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  Briefcase,
  Compass,
  Smile,
} from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, VirtualNoticeBanner } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { CoinBadge } from '../../src/components/ui/CoinBadge';
import { SEED_QUESTIONS } from '../../src/constants/seedData';
import { useEarnStore } from '../../src/store';
import { LearningQuestion } from '../../src/types';

type TopicKey = 'DAILY_LIFE' | 'OFFICE' | 'TRAVEL';

export default function EnglishQuizScreen() {
  const router = useRouter();

  const [selectedTopic, setSelectedTopic] = useState<TopicKey>('DAILY_LIFE');
  const [sessionActive, setSessionActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; isCorrect: boolean }[]>([]);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [rewardResult, setRewardResult] = useState<{ success: boolean; coins: number; message: string } | null>(null);

  const awardQuizReward = useEarnStore((state) => state.awardQuizReward);
  const todayQuizCount = useEarnStore((state) => state.todayQuizCount);

  // Filter 5 questions for this topic session
  const topicQuestions = SEED_QUESTIONS.filter((q) => q.topic === selectedTopic).slice(0, 5);
  const currentQuestion = topicQuestions[currentQuestionIndex];

  const handleStartSession = (topic: TopicKey) => {
    setSelectedTopic(topic);
    setSessionActive(true);
    setCurrentQuestionIndex(0);
    setSelectedChoiceIndex(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setIsSessionFinished(false);
    setRewardResult(null);
  };

  const handleSelectChoice = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedChoiceIndex(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedChoiceIndex === null || isAnswerSubmitted) return;

    const isCorrect = selectedChoiceIndex === currentQuestion.correctAnswerIndex;
    setIsAnswerSubmitted(true);
    setUserAnswers((prev) => [...prev, { questionId: currentQuestion.id, isCorrect }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < topicQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedChoiceIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      // Calculate score and finish
      finishSession();
    }
  };

  const finishSession = () => {
    const totalCorrect = userAnswers.filter((a) => a.isCorrect).length + (selectedChoiceIndex === currentQuestion.correctAnswerIndex ? 1 : 0);
    const reward = awardQuizReward(totalCorrect, topicQuestions.length);
    setRewardResult(reward);
    setIsSessionFinished(true);
  };

  // ---------------------------------------------
  // Render: Topic Selection Screen
  // ---------------------------------------------
  if (!sessionActive) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="English Quiz"
          subtitle="Học tiếng Anh nhận xu EC"
          showBack
          showCoins
          showCart
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <VirtualNoticeBanner compact style={styles.bannerMargin} />

          <Card style={styles.introCard} elevated>
            <View style={styles.introIconCircle}>
              <BookOpen size={30} color={Colors.primary} />
            </View>
            <Text style={styles.introTitle}>Thử Thách 5 Câu Tiếng Anh</Text>
            <Text style={styles.introDesc}>
              Hoàn thành 5 câu trắc nghiệm với kết quả đúng từ 3 câu trở lên để nhận thưởng{' '}
              <Text style={styles.bold}>+20 EC</Text> vào ví!
            </Text>

            <View style={styles.capNotice}>
              <Text style={styles.capNoticeText}>
                Hôm nay bạn đã nhận thưởng: {todayQuizCount}/3 phiên
              </Text>
            </View>
          </Card>

          <Text style={styles.topicHeader}>Chọn chủ đề bài học:</Text>

          {/* Topic 1: Daily Life */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleStartSession('DAILY_LIFE')}
            style={[styles.topicCard, { borderColor: '#BFDBFE' }]}
          >
            <View style={[styles.topicIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Smile size={24} color="#2563EB" />
            </View>
            <View style={styles.topicDetails}>
              <Text style={styles.topicTitle}>Đời Sống Hằng Ngày</Text>
              <Text style={styles.topicSubtitle}>Từ vựng, thói quen và giao tiếp thông dụng</Text>
              <Badge label="5 câu • +20 EC" variant="new" size="sm" style={styles.topicBadge} />
            </View>
            <ArrowRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Topic 2: Office */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleStartSession('OFFICE')}
            style={[styles.topicCard, { borderColor: '#BBF7D0' }]}
          >
            <View style={[styles.topicIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Briefcase size={24} color="#16A34A" />
            </View>
            <View style={styles.topicDetails}>
              <Text style={styles.topicTitle}>Công Sở & Công Việc</Text>
              <Text style={styles.topicSubtitle}>Họp hành, báo cáo, đàm phán và email công việc</Text>
              <Badge label="5 câu • +20 EC" variant="success" size="sm" style={styles.topicBadge} />
            </View>
            <ArrowRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Topic 3: Travel */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleStartSession('TRAVEL')}
            style={[styles.topicCard, { borderColor: '#FDE68A' }]}
          >
            <View style={[styles.topicIconBox, { backgroundColor: '#FEF9C3' }]}>
              <Compass size={24} color="#D97706" />
            </View>
            <View style={styles.topicDetails}>
              <Text style={styles.topicTitle}>Du Lịch & Khám Phá</Text>
              <Text style={styles.topicSubtitle}>Sân bay, khách sạn, chỉ đường và đặt món</Text>
              <Badge label="5 câu • +20 EC" variant="warning" size="sm" style={styles.topicBadge} />
            </View>
            <ArrowRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------
  // Render: Session Completed Result Screen
  // ---------------------------------------------
  if (isSessionFinished && rewardResult) {
    const totalCorrect = userAnswers.filter((a) => a.isCorrect).length;
    const isPassed = totalCorrect >= 3;

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Kết Quả Bài Học" showBack={false} showCoins showCart={false} />

        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.resultIconBox}>
            {isPassed ? (
              <Trophy size={54} color="#D97706" />
            ) : (
              <HelpCircle size={54} color={Colors.primary} />
            )}
          </View>

          <Text style={styles.resultTitle}>
            {isPassed ? 'Xuất Sắc! Hoàn Thành Bài Học' : 'Cần Cố Gắng Thêm Một Chút!'}
          </Text>

          <Text style={styles.resultScoreText}>
            Bạn đã trả lời đúng <Text style={styles.bold}>{totalCorrect}/5</Text> câu
          </Text>

          {/* Reward Status Box */}
          <Card
            style={[
              styles.rewardCard,
              rewardResult.success ? styles.rewardCardSuccess : styles.rewardCardNeutral,
            ]}
          >
            <View style={styles.rewardHeader}>
              <Sparkles size={20} color={rewardResult.success ? '#15803D' : '#92400E'} />
              <Text style={styles.rewardTitle}>
                {rewardResult.success ? `+${rewardResult.coins} EC Đã Cộng Vào Ví!` : 'Thông báo phần thưởng'}
              </Text>
            </View>
            <Text style={styles.rewardMessage}>{rewardResult.message}</Text>
          </Card>

          {/* Action Buttons */}
          <View style={styles.resultActions}>
            <Button
              title="Làm lại chủ đề này"
              onPress={() => handleStartSession(selectedTopic)}
              variant="outline"
              size="lg"
              fullWidth
              icon={<RotateCcw size={18} color={Colors.darkInk} />}
            />

            <Button
              title="Chọn chủ đề khác"
              onPress={() => setSessionActive(false)}
              variant="secondary"
              size="lg"
              fullWidth
            />

            <Button
              title="Quay lại Trung Tâm Kiếm Xu"
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

  // ---------------------------------------------
  // Render: Active Question Screen
  // ---------------------------------------------
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Quiz Header with progress */}
      <Header
        title={`Câu ${currentQuestionIndex + 1}/5`}
        subtitle={currentQuestion.topicLabel}
        showBack
        onBackPress={() => {
          Alert.alert('Thoát bài học?', 'Tiến độ của phiên làm bài hiện tại sẽ không được lưu.', [
            { text: 'Tiếp tục làm', style: 'cancel' },
            { text: 'Thoát', style: 'destructive', onPress: () => setSessionActive(false) },
          ]);
        }}
        showCoins
        showCart={false}
      />

      <ScrollView contentContainerStyle={styles.questionScroll} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / topicQuestions.length) * 100}%` },
            ]}
          />
        </View>

        {/* Question Prompt Card */}
        <Card style={styles.promptCard} elevated>
          <View style={styles.promptHeader}>
            <Text style={styles.promptNumber}>Câu hỏi {currentQuestionIndex + 1}</Text>
            <Badge label="CHỌN 1 ĐÁP ÁN" variant="muted" size="sm" />
          </View>
          <Text style={styles.promptText}>{currentQuestion.prompt}</Text>
        </Card>

        {/* Choices List */}
        <View style={styles.choicesList}>
          {currentQuestion.choices.map((choice, idx) => {
            const isSelected = selectedChoiceIndex === idx;
            const isCorrect = idx === currentQuestion.correctAnswerIndex;

            let choiceStyle: StyleProp<ViewStyle> = styles.choiceBtn;
            let textStyle: StyleProp<TextStyle> = styles.choiceText;

            if (isAnswerSubmitted) {
              if (isCorrect) {
                choiceStyle = [styles.choiceBtn, styles.choiceCorrect];
                textStyle = [styles.choiceText, styles.choiceTextCorrect];
              } else if (isSelected) {
                choiceStyle = [styles.choiceBtn, styles.choiceWrong];
                textStyle = [styles.choiceText, styles.choiceTextWrong];
              }
            } else if (isSelected) {
              choiceStyle = [styles.choiceBtn, styles.choiceSelected];
              textStyle = [styles.choiceText, styles.choiceTextSelected];
            }

            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => handleSelectChoice(idx)}
                disabled={isAnswerSubmitted}
                style={choiceStyle}
              >
                <View style={styles.choiceLeft}>
                  <View style={styles.choiceAlphabet}>
                    <Text style={styles.alphabetText}>{String.fromCharCode(65 + idx)}</Text>
                  </View>
                  <Text style={textStyle}>{choice}</Text>
                </View>

                {isAnswerSubmitted && isCorrect && (
                  <CheckCircle2 size={20} color="#15803D" strokeWidth={2.5} />
                )}
                {isAnswerSubmitted && isSelected && !isCorrect && (
                  <XCircle size={20} color="#DC2626" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation Card (Appears immediately after submission) */}
        {isAnswerSubmitted && (
          <Card
            style={[
              styles.explanationCard,
              selectedChoiceIndex === currentQuestion.correctAnswerIndex
                ? styles.explanationCorrect
                : styles.explanationWrong,
            ]}
          >
            <Text style={styles.explanationTitle}>
              {selectedChoiceIndex === currentQuestion.correctAnswerIndex
                ? '🎉 Chính xác!'
                : '❌ Chưa đúng rồi!'}
            </Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        {!isAnswerSubmitted ? (
          <Button
            title="Kiểm tra đáp án"
            onPress={handleSubmitAnswer}
            disabled={selectedChoiceIndex === null}
            variant="primary"
            size="lg"
            fullWidth
          />
        ) : (
          <Button
            title={currentQuestionIndex < topicQuestions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả & Nhận xu'}
            onPress={handleNextQuestion}
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />}
            iconPosition="right"
          />
        )}
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
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  bannerMargin: {
    marginBottom: Spacing.base,
  },
  introCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  introIconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.darkInk,
    marginBottom: 6,
    textAlign: 'center',
  },
  introDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  bold: {
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  capNotice: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  capNoticeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  topicHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkInk,
    marginBottom: Spacing.sm,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: 12,
    ...Shadows.sm,
  },
  topicIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topicDetails: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkInk,
    marginBottom: 2,
  },
  topicSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  topicBadge: {
    alignSelf: 'flex-start',
  },
  questionScroll: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  promptCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  promptText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkInk,
    lineHeight: 26,
  },
  choicesList: {
    gap: 10,
    marginBottom: Spacing.base,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  choiceSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  choiceCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  choiceWrong: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  choiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  choiceAlphabet: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alphabetText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.darkInk,
  },
  choiceText: {
    fontSize: 15,
    color: Colors.darkInk,
    fontWeight: '500',
    flex: 1,
  },
  choiceTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  choiceTextCorrect: {
    color: '#15803D',
    fontWeight: '700',
  },
  choiceTextWrong: {
    color: '#DC2626',
    fontWeight: '700',
  },
  explanationCard: {
    padding: Spacing.base,
    marginTop: Spacing.xs,
  },
  explanationCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  explanationWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkInk,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.modal,
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
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.darkInk,
    textAlign: 'center',
    marginBottom: 6,
  },
  resultScoreText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  rewardCard: {
    width: '100%',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
  },
  rewardCardSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  rewardCardNeutral: {
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
  rewardMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  resultActions: {
    width: '100%',
    gap: 12,
  },
});
