import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

export type EmptyStateType = 'all' | 'active' | 'completed' | 'high' | 'search';

interface EmptyStateProps {
  type: EmptyStateType;
  searchQuery?: string;
  onActionPress?: () => void;
}

const CONFIG: Record<
  EmptyStateType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
    title: string;
    description: string;
    actionLabel?: string;
  }
> = {
  all: {
    icon: 'checkbox-outline',
    iconColor: Palette.primary,
    iconBg: Palette.primaryLight,
    title: 'No tasks yet',
    description: 'Start your productive day by adding your first task with the button below.',
    actionLabel: 'Create a task',
  },
  active: {
    icon: 'checkmark-done-circle-outline',
    iconColor: Palette.success,
    iconBg: Palette.successLight,
    title: 'All tasks completed!',
    description: 'Outstanding job! You have conquered all your pending items.',
    actionLabel: 'Add another task',
  },
  completed: {
    icon: 'sparkles-outline',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
    title: 'No completed tasks',
    description: 'When you finish tasks, they will appear here as part of your accomplishments.',
  },
  high: {
    icon: 'flag-outline',
    iconColor: Palette.priority.high.color,
    iconBg: Palette.priority.high.bg,
    title: 'No high priority tasks',
    description: 'You have no urgent tasks pending. Focus on your other goals!',
  },
  search: {
    icon: 'search-outline',
    iconColor: Palette.light.textMuted,
    iconBg: Palette.light.surfaceSubtle,
    title: 'No tasks found',
    description: 'We couldn’t find any tasks matching your search. Try a different keyword.',
    actionLabel: 'Clear search',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onActionPress,
}) => {
  const current = CONFIG[type] || CONFIG.all;

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: current.iconBg }]}>
        <Ionicons name={current.icon} size={36} color={current.iconColor} />
      </View>

      <Text style={styles.title}>{current.title}</Text>
      <Text style={styles.description}>{current.description}</Text>

      {current.actionLabel && onActionPress && (
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={onActionPress}
        >
          <Text style={styles.actionButtonText}>{current.actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge,
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.light.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: Palette.light.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.full,
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
