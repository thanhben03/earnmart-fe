// Onboarding Screen — 3 Interactive Slides
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Footprints, ShoppingBag, ArrowRight, Check } from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '../src/theme';
import { Button } from '../src/components/ui/Button';
import { useAuthStore } from '../src/store';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Học Tiếng Anh Mỗi Ngày',
    subtitle: 'Nâng cao vốn từ vựng và phản xạ ngữ pháp qua các bài học trắc nghiệm 5 câu thú vị. Hoàn thành để nhận ngay xu ảo EC!',
    icon: <BookOpen size={48} color={Colors.primary} strokeWidth={2.2} />,
    color: Colors.primaryLight,
    tag: 'BÀI HỌC THỰC TẾ',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Vận Động & Rèn Luyện',
    subtitle: 'Mô phỏng thói quen đi bộ và chạy bộ mỗi ngày. Duy trì streak tích cực để mở khóa thêm các thử thách nhận xu phong phú.',
    icon: <Footprints size={48} color={Colors.accent} strokeWidth={2.2} />,
    color: Colors.accentLight,
    tag: 'LỐI SỐNG LÀNH MẠNH',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Mua Sắm Vật Phẩm Ảo',
    subtitle: 'Dùng xu EC đã tích lũy để đổi phụ kiện avatar, thú cưng ảo và đồ trang trí hồ sơ độc đáo. Không cần nạp tiền thật!',
    icon: <ShoppingBag size={48} color="#D97706" strokeWidth={2.2} />,
    color: '#FEF3C7',
    tag: '100% XU ẢO',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    completeOnboarding();
    router.replace('/login');
  };

  const slide = SLIDES[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <Text style={styles.brandLogo}>EarnMart</Text>
        <TouchableOpacity
          onPress={handleFinish}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Content */}
      <View style={styles.slideContainer}>
        <View style={styles.imageCard}>
          <Image
            source={{ uri: slide.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={[styles.floatingIconBadge, { backgroundColor: slide.color }]}>
            {slide.icon}
          </View>
        </View>

        <View style={styles.textContainer}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{slide.tag}</Text>
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </View>
      </View>

      {/* Footer with Progress Dots & CTA */}
      <View style={styles.footer}>
        {/* Progress Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Bắt đầu ngay' : 'Tiếp tục'}
          onPress={handleNext}
          variant="primary"
          size="lg"
          fullWidth
          icon={
            currentIndex === SLIDES.length - 1 ? (
              <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
            )
          }
          iconPosition="right"
        />

        <Text style={styles.legalDisclaimer}>
          Vật phẩm và xu trong EarnMart hoàn toàn mang tính chất ảo & rèn luyện thói quen.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  brandLogo: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  slideContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  imageCard: {
    width: '100%',
    height: 250,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingIconBadge: {
    position: 'absolute',
    bottom: -15,
    right: 20,
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
    ...Shadows.card,
  },
  textContainer: {
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
  },
  tagBadge: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.darkInk,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.base,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.border,
  },
  legalDisclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});

