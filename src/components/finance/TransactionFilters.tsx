import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionFilterType, TransactionSortOption } from '@/types/finance';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';

interface TransactionFiltersProps {
  currentFilter: TransactionFilterType;
  onSelectFilter: (filter: TransactionFilterType) => void;
  currentSort: TransactionSortOption;
  onSelectSort: (sort: TransactionSortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: {
    all: number;
    expense: number;
    cashback: number;
    profit: number;
  };
}

const FILTER_ITEMS: { id: TransactionFilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'expense', label: 'Expenses' },
  { id: 'cashback', label: 'Cashback' },
  { id: 'profit', label: 'Profit' },
];

const SORT_OPTIONS: {
  id: TransactionSortOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}[] = [
  {
    id: 'newest',
    label: 'Newest First',
    icon: 'time-outline',
    description: 'Most recent transactions first',
  },
  {
    id: 'oldest',
    label: 'Oldest First',
    icon: 'hourglass-outline',
    description: 'Earliest transactions first',
  },
  {
    id: 'highest',
    label: 'Highest Amount',
    icon: 'arrow-up-circle-outline',
    description: 'Largest rupee values first',
  },
  {
    id: 'lowest',
    label: 'Lowest Amount',
    icon: 'arrow-down-circle-outline',
    description: 'Smallest rupee values first',
  },
];

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  currentFilter,
  onSelectFilter,
  currentSort,
  onSelectSort,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Search & Sort Controls Row */}
      <View style={styles.controlsRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Palette.light.textPlaceholder}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={Palette.light.textPlaceholder}
            value={searchQuery}
            onChangeText={onSearchChange}
            accessibilityLabel="Search transactions"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => onSearchChange('')}
              hitSlop={8}
              style={styles.searchClearBtn}
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={16}
                color={Palette.light.textPlaceholder}
              />
            </Pressable>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.sortButton,
            pressed && styles.sortButtonPressed,
          ]}
          onPress={() => setIsSortModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Sort transactions"
        >
          <Ionicons name="swap-vertical" size={18} color={Palette.light.text} />
        </Pressable>
      </View>

      {/* Filter Tabs Row */}
      <View style={styles.tabsRow}>
        {FILTER_ITEMS.map((item) => {
          const isSelected = currentFilter === item.id;
          const count = counts[item.id];

          return (
            <Pressable
              key={item.id}
              style={[
                styles.tab,
                isSelected && styles.tabSelected,
              ]}
              onPress={() => onSelectFilter(item.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isSelected && styles.tabLabelSelected,
                ]}
              >
                {item.label}
              </Text>
              <View
                style={[
                  styles.badge,
                  isSelected ? styles.badgeSelected : styles.badgeDefault,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isSelected ? styles.badgeTextSelected : styles.badgeTextDefault,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Sort Selection Bottom Modal */}
      <Modal
        visible={isSortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsSortModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Sort Transactions</Text>
                  <Pressable
                    onPress={() => setIsSortModalVisible(false)}
                    hitSlop={10}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={20} color={Palette.light.textMuted} />
                  </Pressable>
                </View>

                <View style={styles.optionsList}>
                  {SORT_OPTIONS.map((opt) => {
                    const isChosen = currentSort === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        style={[
                          styles.optionItem,
                          isChosen && styles.optionItemChosen,
                        ]}
                        onPress={() => {
                          onSelectSort(opt.id);
                          setIsSortModalVisible(false);
                        }}
                      >
                        <View style={styles.optionLeft}>
                          <View
                            style={[
                              styles.optionIconBadge,
                              isChosen && styles.optionIconBadgeChosen,
                            ]}
                          >
                            <Ionicons
                              name={opt.icon}
                              size={18}
                              color={isChosen ? '#FFFFFF' : Palette.light.textMuted}
                            />
                          </View>
                          <View>
                            <Text
                              style={[
                                styles.optionLabel,
                                isChosen && styles.optionLabelChosen,
                              ]}
                            >
                              {opt.label}
                            </Text>
                            <Text style={styles.optionDescription}>
                              {opt.description}
                            </Text>
                          </View>
                        </View>
                        {isChosen && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={Palette.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    paddingHorizontal: Spacing.md,
    height: 44,
    ...Shadows.subtle,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Palette.light.text,
    padding: 0,
  },
  searchClearBtn: {
    padding: 4,
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.light.card,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  sortButtonPressed: {
    backgroundColor: Palette.light.surfaceSubtle,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.light.card,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
  },
  tabSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.light.textSecondary,
  },
  tabLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDefault: {
    backgroundColor: Palette.light.surfaceSubtle,
  },
  badgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextDefault: {
    color: Palette.light.textMuted,
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Palette.light.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    ...Shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.light.text,
  },
  closeBtn: {
    padding: 4,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.light.card,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
  },
  optionItemChosen: {
    backgroundColor: Palette.primaryLight,
    borderColor: '#C7D2FE',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.light.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconBadgeChosen: {
    backgroundColor: Palette.primary,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.light.text,
  },
  optionLabelChosen: {
    color: Palette.primary,
    fontWeight: '700',
  },
  optionDescription: {
    fontSize: 12,
    color: Palette.light.textMuted,
    marginTop: 1,
  },
});
