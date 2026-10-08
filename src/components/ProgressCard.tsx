import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TodoStats } from '@/types/todo';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ProgressCardProps {
  stats: TodoStats;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ stats }) => {
  const { total, completed, remaining, completionRate } = stats;
  const progressAnim = useSharedValue(0);

  useEffect(() => {
    progressAnim.value = withTiming(completionRate, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
  }, [completionRate, progressAnim]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${Math.round(progressAnim.value * 100)}%`,
    };
  });

  const percentage = Math.round(completionRate * 100);

  const getMotivationalMessage = () => {
    if (total === 0) return 'Add your first task to start your day';
    if (percentage === 100) return 'All caught up! Outstanding job today 🎉';
    if (percentage >= 75) return 'Almost there! Finish the last stretch 🚀';
    if (percentage >= 50) return 'Halfway through, keep up the momentum 💪';
    if (percentage > 0) return 'Great start! One step at a time ✨';
    return "Ready to make progress today? Let's go!";
  };

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Daily Progress</Text>
          <Text style={styles.subtitle}>{getMotivationalMessage()}</Text>
        </View>
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      </View>

      {/* Progress Bar Container */}
      <View style={styles.progressBarTrack}>
        <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
      </View>

      {/* Stats Counter Breakdown */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIconBadge, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="checkbox-outline" size={14} color={Palette.primary} />
          </View>
          <View>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIconBadge, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="checkmark-circle-outline" size={14} color={Palette.success} />
          </View>
          <View>
            <Text style={styles.statNumber}>{completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIconBadge, { backgroundColor: '#FFFBEB' }]}>
            <Ionicons name="time-outline" size={14} color="#D97706" />
          </View>
          <View>
            <Text style={styles.statNumber}>{remaining}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleSection: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.light.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.light.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  percentageBadge: {
    backgroundColor: Palette.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Palette.primary,
    borderRadius: BorderRadius.full,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.light.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Palette.light.textMuted,
  },
});
