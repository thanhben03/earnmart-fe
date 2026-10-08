// EarnMart Types & Data Models
// Spec Reference: docs/specs/AGENT_SPEC_Virtual_Shop_React_Native.docx

export type VirtualType = 'AVATAR_ACCESSORY' | 'OUTFIT' | 'PET' | 'DECORATION' | 'BADGE' | 'MYSTERY_BOX';

export interface User {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string;
  isGuest: boolean;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  level: number;
  streakDays: number;
  lastCheckinDate: string | null;
  totalQuizzesPassed: number;
  totalWordsMatched: number;
  totalKmWalked: number;
}

export interface Wallet {
  userId: string;
  balance: number; // EC (Earn Coins) - strictly integer
  lifetimeEarned: number;
  lifetimeSpent: number;
  updatedAt: string;
}

export type TransactionType =
  | 'WELCOME'
  | 'DAILY_CHECKIN'
  | 'ENGLISH_QUIZ'
  | 'WORD_MATCH'
  | 'WALK_REWARD'
  | 'SHOP_PURCHASE'
  | 'DEMO_RESET';

export interface WalletTransaction {
  id: string;
  userId: string;
  delta: number; // positive for earn, negative for spend
  type: TransactionType;
  title: string;
  description?: string;
  referenceType?: string;
  referenceId?: string;
  idempotencyKey?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  usageDescription: string;
  priceCoins: number;
  stock: number | null; // null means unlimited virtual supply
  imageUrl: string;
  badge?: string;
  isActive: boolean;
  virtualType: VirtualType;
  isPopular?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPriceCoins: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  totalCoins: number;
  status: 'COMPLETED' | 'CANCELLED';
  isVirtual: true;
  createdAt: string;
  items: OrderItem[];
}

export interface InventoryItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  quantity: number;
  isEquipped: boolean;
  acquiredAt: string;
}

export interface LearningQuestion {
  id: string;
  topic: 'DAILY_LIFE' | 'OFFICE' | 'TRAVEL';
  topicLabel: string;
  prompt: string;
  choices: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface WordPair {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string;
}

export interface DailyMission {
  id: string;
  key: string;
  title: string;
  description: string;
  target: number;
  rewardCoins: number;
  icon: string;
}

export interface UserMissionProgress {
  missionId: string;
  progress: number;
  isClaimed: boolean;
}

export interface ActivitySession {
  id: string;
  activityType: 'QUIZ' | 'WORD_MATCH' | 'WALK';
  score?: number;
  distanceMeters?: number;
  durationSeconds?: number;
  coinsEarned: number;
  isSimulated?: boolean;
  completedAt: string;
}
