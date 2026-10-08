// Central Zustand Stores for EarnMart
// Spec Reference: Section 6 (Coin Economy) & Section 7.1

import { create } from 'zustand';
import {
  User,
  UserProfile,
  WalletTransaction,
  Product,
  Category,
  CartItem,
  Order,
  InventoryItem,
  DailyMission,
  ActivitySession,
} from '../types';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_MISSIONS,
} from '../constants/seedData';

// ----------------------------------------------------
// 1. AUTH STORE
// ----------------------------------------------------
interface AuthState {
  user: User | null;
  profile: UserProfile;
  isOnboarded: boolean;
  loginAsGuest: () => void;
  loginWithEmail: (email: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
  claimDailyCheckin: () => { success: boolean; coins: number; message: string };
}

const DEFAULT_USER: User = {
  id: 'usr-demo-01',
  email: 'learner@earnmart.local',
  displayName: 'Bạn Học Viên',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  isGuest: true,
  createdAt: new Date().toISOString(),
};

const DEFAULT_PROFILE: UserProfile = {
  userId: 'usr-demo-01',
  level: 2,
  streakDays: 3,
  lastCheckinDate: null,
  totalQuizzesPassed: 6,
  totalWordsMatched: 4,
  totalKmWalked: 3.2,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEFAULT_USER,
  profile: DEFAULT_PROFILE,
  isOnboarded: true, // Default true so demo can be explored immediately, can be reset in settings

  loginAsGuest: () => {
    set({
      user: {
        id: `usr-guest-${Date.now()}`,
        email: null,
        displayName: 'Khách Trải Nghiệm',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        isGuest: true,
        createdAt: new Date().toISOString(),
      },
    });
  },

  loginWithEmail: (email: string) => {
    set({
      user: {
        id: `usr-email-${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        isGuest: false,
        createdAt: new Date().toISOString(),
      },
    });
  },

  logout: () => {
    set({ user: null });
  },

  completeOnboarding: () => {
    set({ isOnboarded: true });
  },

  claimDailyCheckin: () => {
    const today = new Date().toISOString().slice(0, 10);
    const { profile } = get();

    if (profile.lastCheckinDate === today) {
      return { success: false, coins: 0, message: 'Bạn đã điểm danh hôm nay rồi!' };
    }

    // Award 5 EC via wallet store
    useWalletStore.getState().addTransaction(
      5,
      'DAILY_CHECKIN',
      'Điểm danh hằng ngày',
      'Thưởng mở ứng dụng mỗi ngày +5 EC'
    );

    set((state) => ({
      profile: {
        ...state.profile,
        streakDays: state.profile.streakDays + 1,
        lastCheckinDate: today,
      },
    }));

    // Update mission progress for DAILY_LOGIN
    useEarnStore.getState().updateMissionProgress('DAILY_LOGIN', 1);

    return { success: true, coins: 5, message: 'Điểm danh thành công! +5 EC' };
  },
}));

// ----------------------------------------------------
// 2. WALLET STORE (Server-Authoritative Mock Ledger)
// ----------------------------------------------------
interface WalletState {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  transactions: WalletTransaction[];
  addTransaction: (
    delta: number,
    type: WalletTransaction['type'],
    title: string,
    description?: string,
    referenceId?: string
  ) => boolean;
  canAfford: (cost: number) => boolean;
  resetToDefault: () => void;
}

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-welcome',
    userId: 'usr-demo-01',
    delta: 150,
    type: 'WELCOME',
    title: 'Quà tặng tân thủ',
    description: 'Thưởng khởi tạo tài khoản trải nghiệm EarnMart',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'tx-quiz-prev',
    userId: 'usr-demo-01',
    delta: 20,
    type: 'ENGLISH_QUIZ',
    title: 'Học tiếng Anh: Đời Sống Hằng Ngày',
    description: 'Vượt qua 5/5 câu hỏi xuất sắc',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 170, // 150 welcome + 20 quiz
  lifetimeEarned: 170,
  lifetimeSpent: 0,
  transactions: INITIAL_TRANSACTIONS,

  canAfford: (cost: number) => {
    return get().balance >= cost;
  },

  addTransaction: (delta, type, title, description, referenceId) => {
    const currentBalance = get().balance;
    const newBalance = currentBalance + delta;

    if (newBalance < 0) {
      return false; // Prevent negative balance
    }

    const tx: WalletTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: useAuthStore.getState().user?.id || 'usr-demo',
      delta,
      type,
      title,
      description,
      referenceId,
      idempotencyKey: `idem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      balance: newBalance,
      lifetimeEarned: delta > 0 ? state.lifetimeEarned + delta : state.lifetimeEarned,
      lifetimeSpent: delta < 0 ? state.lifetimeSpent + Math.abs(delta) : state.lifetimeSpent,
      transactions: [tx, ...state.transactions],
    }));

    return true;
  },

  resetToDefault: () => {
    set({
      balance: 150,
      lifetimeEarned: 150,
      lifetimeSpent: 0,
      transactions: [
        {
          id: `tx-welcome-${Date.now()}`,
          userId: 'usr-demo-01',
          delta: 150,
          type: 'WELCOME',
          title: 'Quà tặng tân thủ',
          description: 'Thưởng khởi tạo tài khoản trải nghiệm EarnMart',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  },
}));

// ----------------------------------------------------
// 3. SHOP STORE
// ----------------------------------------------------
interface ShopState {
  products: Product[];
  categories: Category[];
  selectedCategoryId: string;
  searchQuery: string;
  sortBy: 'popular' | 'cost-asc' | 'cost-desc' | 'newest';
  wishlist: string[];
  setSelectedCategoryId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'popular' | 'cost-asc' | 'cost-desc' | 'newest') => void;
  toggleWishlist: (productId: string) => void;
  getProductById: (id: string) => Product | undefined;
}

export const useShopStore = create<ShopState>((set, get) => ({
  products: SEED_PRODUCTS,
  categories: SEED_CATEGORIES,
  selectedCategoryId: 'cat-all',
  searchQuery: '',
  sortBy: 'popular',
  wishlist: ['prod-01', 'prod-04'],

  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sortBy) => set({ sortBy }),

  toggleWishlist: (productId) => {
    set((state) => {
      const exists = state.wishlist.includes(productId);
      return {
        wishlist: exists
          ? state.wishlist.filter((id) => id !== productId)
          : [...state.wishlist, productId],
      };
    });
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  },
}));

// ----------------------------------------------------
// 4. CART STORE
// ----------------------------------------------------
interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getTotalCoins: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [
    {
      id: 'cart-init-01',
      product: SEED_PRODUCTS[1], // Cozy Blue Hat (80 EC)
      quantity: 1,
    },
  ],

  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: `ci-${Date.now()}`,
            product,
            quantity,
          },
        ],
      };
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  removeFromCart: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalCoins: () => {
    return get().items.reduce((sum, item) => sum + item.product.priceCoins * item.quantity, 0);
  },

  getTotalCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

// ----------------------------------------------------
// 5. INVENTORY & ORDERS STORE
// ----------------------------------------------------
interface InventoryState {
  inventory: InventoryItem[];
  orders: Order[];
  checkoutCart: () => { success: boolean; orderId?: string; error?: string };
  buyNow: (product: Product, quantity?: number) => { success: boolean; orderId?: string; error?: string };
  toggleEquip: (inventoryItemId: string) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: [
    {
      id: 'inv-init-01',
      userId: 'usr-demo-01',
      productId: 'prod-05',
      product: SEED_PRODUCTS[4], // Chậu Sen Đá Mini
      quantity: 1,
      isEquipped: true,
      acquiredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  orders: [
    {
      id: 'ord-demo-001',
      userId: 'usr-demo-01',
      totalCoins: 65,
      status: 'COMPLETED',
      isVirtual: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      items: [
        {
          id: 'item-001',
          orderId: 'ord-demo-001',
          productId: 'prod-05',
          productName: 'Chậu Sen Đá Mini (Mini Room Plant)',
          unitPriceCoins: 65,
          quantity: 1,
          imageUrl: SEED_PRODUCTS[4].imageUrl,
        },
      ],
    },
  ],

  checkoutCart: () => {
    const cartItems = useCartStore.getState().items;
    if (cartItems.length === 0) {
      return { success: false, error: 'Giỏ hàng đang trống' };
    }

    const totalCoins = useCartStore.getState().getTotalCoins();
    const wallet = useWalletStore.getState();

    if (!wallet.canAfford(totalCoins)) {
      return {
        success: false,
        error: `Số dư xu ảo không đủ. Bạn đang có ${wallet.balance} EC, cần ${totalCoins} EC.`,
      };
    }

    // Deduct EC atomically
    const deducted = wallet.addTransaction(
      -totalCoins,
      'SHOP_PURCHASE',
      `Mua ${cartItems.length} vật phẩm ảo`,
      `Đơn hàng ảo #${Date.now().toString().slice(-6)}`
    );

    if (!deducted) {
      return { success: false, error: 'Giao dịch thất bại' };
    }

    const orderId = `EM-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      userId: useAuthStore.getState().user?.id || 'usr-demo',
      totalCoins,
      status: 'COMPLETED',
      isVirtual: true,
      createdAt: new Date().toISOString(),
      items: cartItems.map((ci) => ({
        id: `oi-${Math.random().toString(36).substring(2, 7)}`,
        orderId,
        productId: ci.product.id,
        productName: ci.product.name,
        unitPriceCoins: ci.product.priceCoins,
        quantity: ci.quantity,
        imageUrl: ci.product.imageUrl,
      })),
    };

    // Add items to inventory
    const newInventoryItems: InventoryItem[] = cartItems.map((ci) => ({
      id: `inv-${Date.now()}-${ci.product.id}`,
      userId: useAuthStore.getState().user?.id || 'usr-demo',
      productId: ci.product.id,
      product: ci.product,
      quantity: ci.quantity,
      isEquipped: false,
      acquiredAt: new Date().toISOString(),
    }));

    set((state) => ({
      orders: [newOrder, ...state.orders],
      inventory: [...newInventoryItems, ...state.inventory],
    }));

    // Clear cart after checkout
    useCartStore.getState().clearCart();

    return { success: true, orderId };
  },

  buyNow: (product, quantity = 1) => {
    const totalCoins = product.priceCoins * quantity;
    const wallet = useWalletStore.getState();

    if (!wallet.canAfford(totalCoins)) {
      return {
        success: false,
        error: `Số dư xu ảo không đủ. Cần ${totalCoins} EC, bạn có ${wallet.balance} EC.`,
      };
    }

    const deducted = wallet.addTransaction(
      -totalCoins,
      'SHOP_PURCHASE',
      `Mua vật phẩm ảo: ${product.name}`,
      `Vật phẩm ảo #${product.id}`
    );

    if (!deducted) {
      return { success: false, error: 'Giao dịch thất bại' };
    }

    const orderId = `EM-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      userId: useAuthStore.getState().user?.id || 'usr-demo',
      totalCoins,
      status: 'COMPLETED',
      isVirtual: true,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `oi-${Math.random().toString(36).substring(2, 7)}`,
          orderId,
          productId: product.id,
          productName: product.name,
          unitPriceCoins: product.priceCoins,
          quantity,
          imageUrl: product.imageUrl,
        },
      ],
    };

    const newInventoryItem: InventoryItem = {
      id: `inv-${Date.now()}-${product.id}`,
      userId: useAuthStore.getState().user?.id || 'usr-demo',
      productId: product.id,
      product,
      quantity,
      isEquipped: false,
      acquiredAt: new Date().toISOString(),
    };

    set((state) => ({
      orders: [newOrder, ...state.orders],
      inventory: [newInventoryItem, ...state.inventory],
    }));

    return { success: true, orderId };
  },

  toggleEquip: (inventoryItemId) => {
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === inventoryItemId
          ? { ...item, isEquipped: !item.isEquipped }
          : item
      ),
    }));
  },
}));

// ----------------------------------------------------
// 6. EARN & GAMIFICATION STORE
// ----------------------------------------------------
interface EarnState {
  todayQuizCount: number; // max 3/day
  todayWordMatchCount: number; // max 5/day
  missions: DailyMission[];
  missionProgress: Record<string, { progress: number; isClaimed: boolean }>;
  simulatedSessions: ActivitySession[];
  
  awardQuizReward: (score: number, total: number) => { success: boolean; coins: number; message: string };
  awardWordMatchReward: () => { success: boolean; coins: number; message: string };
  recordSimulatedWalk: (distanceMeters: number, durationSeconds: number) => void;
  updateMissionProgress: (missionKey: string, delta: number) => void;
  claimMissionReward: (missionId: string) => { success: boolean; coins: number; message: string };
}

export const useEarnStore = create<EarnState>((set, get) => ({
  todayQuizCount: 1, // 1 used out of 3 for demo realism
  todayWordMatchCount: 0,
  missions: SEED_MISSIONS,
  missionProgress: {
    ms_01: { progress: 1, isClaimed: true },
    ms_02: { progress: 1, isClaimed: false },
    ms_03: { progress: 0, isClaimed: false },
    ms_04: { progress: 0, isClaimed: false },
    ms_05: { progress: 2, isClaimed: false },
  },
  simulatedSessions: [
    {
      id: 'sess-walk-prev',
      activityType: 'WALK',
      distanceMeters: 1250,
      durationSeconds: 930,
      coinsEarned: 0, // MVP simulated tracking: 0 production reward
      isSimulated: true,
      completedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
  ],

  awardQuizReward: (score, total) => {
    const { todayQuizCount } = get();
    const passed = score >= 3;

    if (!passed) {
      return {
        success: false,
        coins: 0,
        message: `Bạn đạt ${score}/${total} câu đúng. Cần đúng ít nhất 3 câu để nhận xu. Hãy thử lại nhé!`,
      };
    }

    if (todayQuizCount >= 3) {
      return {
        success: false,
        coins: 0,
        message: 'Bạn đã đạt giới hạn 3 phiên nhận xu Quiz hôm nay! Mai tiếp tục nhé.',
      };
    }

    // Award 20 EC
    useWalletStore.getState().addTransaction(
      20,
      'ENGLISH_QUIZ',
      'Hoàn thành bài học tiếng Anh',
      `Đạt kết quả ${score}/${total} câu đúng (+20 EC)`
    );

    set((state) => ({
      todayQuizCount: state.todayQuizCount + 1,
    }));

    // Update mission
    get().updateMissionProgress('QUIZ_SESSION', 1);

    return {
      success: true,
      coins: 20,
      message: 'Chúc mừng bạn đã hoàn thành bài học! Nhận được +20 EC.',
    };
  },

  awardWordMatchReward: () => {
    const { todayWordMatchCount } = get();

    if (todayWordMatchCount >= 5) {
      return {
        success: false,
        coins: 0,
        message: 'Bạn đã đạt giới hạn 5 phiên ghép từ hôm nay! Mai tiếp tục nhé.',
      };
    }

    useWalletStore.getState().addTransaction(
      10,
      'WORD_MATCH',
      'Chiến thắng Word Match',
      'Ghép đúng toàn bộ các cặp từ vựng (+10 EC)'
    );

    set((state) => ({
      todayWordMatchCount: state.todayWordMatchCount + 1,
    }));

    get().updateMissionProgress('WORD_MATCH', 1);

    return {
      success: true,
      coins: 10,
      message: 'Tuyệt vời! Bạn ghép đúng tất cả từ vựng và nhận +10 EC.',
    };
  },

  recordSimulatedWalk: (distanceMeters, durationSeconds) => {
    const session: ActivitySession = {
      id: `walk-${Date.now()}`,
      activityType: 'WALK',
      distanceMeters,
      durationSeconds,
      coinsEarned: 0, // MVP policy: simulated data does not emit real coins
      isSimulated: true,
      completedAt: new Date().toISOString(),
    };

    set((state) => ({
      simulatedSessions: [session, ...state.simulatedSessions],
    }));

    get().updateMissionProgress('WALK_CHALLENGE', 1);
  },

  updateMissionProgress: (missionKey, delta) => {
    const mission = get().missions.find((m) => m.key === missionKey);
    if (!mission) return;

    set((state) => {
      const current = state.missionProgress[mission.id] || { progress: 0, isClaimed: false };
      const newProgress = Math.min(mission.target, current.progress + delta);
      return {
        missionProgress: {
          ...state.missionProgress,
          [mission.id]: {
            ...current,
            progress: newProgress,
          },
        },
      };
    });
  },

  claimMissionReward: (missionId) => {
    const mission = get().missions.find((m) => m.id === missionId);
    const progress = get().missionProgress[missionId];

    if (!mission || !progress) {
      return { success: false, coins: 0, message: 'Nhiệm vụ không tồn tại' };
    }

    if (progress.progress < mission.target) {
      return { success: false, coins: 0, message: 'Chưa đạt đủ mục tiêu nhiệm vụ' };
    }

    if (progress.isClaimed) {
      return { success: false, coins: 0, message: 'Đã nhận thưởng nhiệm vụ này' };
    }

    useWalletStore.getState().addTransaction(
      mission.rewardCoins,
      'DAILY_CHECKIN',
      `Nhiệm vụ: ${mission.title}`,
      `Hoàn thành mục tiêu nhiệm vụ (+${mission.rewardCoins} EC)`
    );

    set((state) => ({
      missionProgress: {
        ...state.missionProgress,
        [missionId]: {
          ...progress,
          isClaimed: true,
        },
      },
    }));

    return {
      success: true,
      coins: mission.rewardCoins,
      message: `Nhận thưởng thành công! +${mission.rewardCoins} EC`,
    };
  },
}));

