// CategoryBar and SearchBar for Catalog Filtering
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../theme';
import { useShopStore } from '../../store';

export const CategoryBar: React.FC = () => {
  const categories = useShopStore((state) => state.categories);
  const selectedCategoryId = useShopStore((state) => state.selectedCategoryId);
  const setSelectedCategoryId = useShopStore((state) => state.setSelectedCategoryId);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryScroll}
      style={styles.categoryBar}
    >
      {categories.map((cat) => {
        const isSelected = cat.id === selectedCategoryId;
        return (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.75}
            onPress={() => setSelectedCategoryId(cat.id)}
            style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
          >
            <Text
              style={[
                styles.categoryText,
                isSelected && styles.categoryTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

interface SearchBarProps {
  onFilterPress?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onFilterPress,
  placeholder = 'Tìm kiếm vật phẩm ảo (nón, pet, áo)...',
}) => {
  const searchQuery = useShopStore((state) => state.searchQuery);
  const setSearchQuery = useShopStore((state) => state.setSearchQuery);

  return (
    <View style={styles.searchWrapper}>
      <View style={styles.searchInputContainer}>
        <Search size={18} color={Colors.textSecondary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {onFilterPress && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onFilterPress}
          style={styles.filterBtn}
        >
          <SlidersHorizontal size={18} color={Colors.darkInk} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryBar: {
    backgroundColor: Colors.surface,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.darkInk,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

