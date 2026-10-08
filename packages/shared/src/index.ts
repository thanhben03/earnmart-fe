// Shared DTOs, Enums, and Coin Economy Constants
// Spec Reference: Section 6 & Section 7.3

export const COIN_ECONOMY = {
  WELCOME_BONUS: 150,
  DAILY_CHECKIN: 5,
  QUIZ_PASS_REWARD: 20,
  WORD_MATCH_REWARD: 10,
  WALK_REWARD_PER_KM: 15, // Future verified walking policy
  
  // Daily caps
  MAX_QUIZ_REWARDS_PER_DAY: 3,
  MAX_WORD_MATCH_REWARDS_PER_DAY: 5,
  MAX_WALK_KM_PER_DAY: 5,
} as const;

export type VirtualItemCategory =
  | 'AVATAR_ACCESSORY'
  | 'OUTFIT'
  | 'PET'
  | 'DECORATION'
  | 'BADGE'
  | 'MYSTERY_BOX';

export type TransactionType =
  | 'WELCOME'
  | 'DAILY_CHECKIN'
  | 'ENGLISH_QUIZ'
  | 'WORD_MATCH'
  | 'WALK_REWARD'
  | 'SHOP_PURCHASE'
  | 'DEMO_RESET';

export interface ApiResponse<T = any> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface CheckoutRequest {
  cartItemIds: string[];
  idempotencyKey: string;
}

export interface ActivitySubmissionRequest {
  activityType: 'QUIZ' | 'WORD_MATCH' | 'WALK';
  score?: number;
  totalQuestions?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  idempotencyKey: string;
}

export interface CheckinRequest {
  dateUtc: string;
  idempotencyKey: string;
}

