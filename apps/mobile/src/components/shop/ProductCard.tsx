// ProductCard Component — 2-Column Responsive Card with Virtual Notice & Wishlist
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Plus } from 'lucide-react-native';
import { Product } from '../../types';
import { Colors, Radius, Spacing, Shadows } from '../../theme';
import { CoinBadge } from '../ui/CoinBadge';
import { Badge } from '../ui/Badge';
import { useShopStore, useCartStore } from '../../store';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const wishlist = useShopStore((state) => state.wishlist);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const addToCart = useCartStore((state) => state.addToCart);

  const isLiked = wishlist.includes(product.id);

  const handlePress = () => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id },
    });
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation?.();
    addToCart(product, 1);
  };

  const handleToggleLike = (e: any) => {
    e.stopPropagation?.();
    toggleWishlist(product.id);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.card}
    >
      {/* Product Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Badges */}
        <View style={styles.badgeRow}>
          <Badge label="ẢO" variant="virtual" size="sm" />
          {product.badge && (
            <Badge
              label={product.badge}
              variant={product.badge === 'HOT' ? 'hot' : product.badge === 'MỚI' ? 'new' : 'rare'}
              size="sm"
            />
          )}
        </View>

        {/* Wishlist Heart Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleToggleLike}
          style={styles.wishlistBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Heart
            size={16}
            color={isLiked ? Colors.error : Colors.textMuted}
            fill={isLiked ? Colors.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <CoinBadge amount={product.priceCoins} size="sm" />
          
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleAddToCart}
            style={styles.addCartBtn}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.surfaceSubtle,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    gap: 4,
  },
  wishlistBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  infoContainer: {
    padding: Spacing.sm + 2,
    justifyContent: 'space-between',
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.darkInk,
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  addCartBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

