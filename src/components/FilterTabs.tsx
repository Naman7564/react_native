import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { FilterStatus } from '@/types/todo';
import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

interface FilterTabsProps {
  currentFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
    high: number;
  };
}

interface TabItem {
  id: FilterStatus;
  label: string;
  countKey: keyof FilterTabsProps['counts'];
}

const TABS: TabItem[] = [
  { id: 'all', label: 'All', countKey: 'all' },
  { id: 'active', label: 'Active', countKey: 'active' },
  { id: 'completed', label: 'Completed', countKey: 'completed' },
  { id: 'high', label: 'High Priority', countKey: 'high' },
];

export const FilterTabs: React.FC<FilterTabsProps> = ({
  currentFilter,
  onSelectFilter,
  counts,
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TABS.map((tab) => {
          const isSelected = currentFilter === tab.id;
          const count = counts[tab.countKey];

          return (
            <Pressable
              key={tab.id}
              onPress={() => onSelectFilter(tab.id)}
              style={({ pressed }) => [
                styles.tabButton,
                isSelected ? styles.tabButtonActive : styles.tabButtonInactive,
                pressed && styles.tabButtonPressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${tab.label} filter, ${count} tasks`}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isSelected ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isSelected ? styles.countBadgeActive : styles.countBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isSelected ? styles.countTextActive : styles.countTextInactive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.xs,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: Spacing.lg,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabButtonActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  tabButtonInactive: {
    backgroundColor: Palette.light.card,
    borderColor: Palette.light.cardBorder,
  },
  tabButtonPressed: {
    opacity: 0.85,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  tabLabelInactive: {
    color: Palette.light.textSecondary,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  countTextInactive: {
    color: Palette.light.textMuted,
  },
});
