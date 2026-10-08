import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FinanceSummaryStats } from '@/types/finance';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { formatRupees, getCurrentMonthLabel } from '@/utils/financeCalculations';

interface HomeFinanceCardProps {
  stats: FinanceSummaryStats;
}

export const HomeFinanceCard: React.FC<HomeFinanceCardProps> = ({ stats }) => {
  const router = useRouter();
  const currentMonth = getCurrentMonthLabel();

  const handleNavigateToFinance = () => {
    router.push('/(tabs)/finance');
  };

  const isNetPositive = stats.net >= 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={handleNavigateToFinance}
      accessibilityRole="button"
      accessibilityLabel="Finance summary, tap to view finance tab"
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet-outline" size={16} color={Palette.primary} />
          </View>
          <View>
            <Text style={styles.title}>Finance</Text>
            <Text style={styles.subtitle}>{currentMonth}</Text>
          </View>
        </View>

        <View style={styles.actionButton}>
          <Text style={styles.actionText}>View Finance</Text>
          <Ionicons name="chevron-forward" size={14} color={Palette.primary} />
        </View>
      </View>

      {/* Figures Row */}
      <View style={styles.figuresRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatRupees(stats.totalExpenses)}
          </Text>
          <Text style={styles.statLabel}>spent this month</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#D97706' }]}>
            {formatRupees(stats.totalCashback, { showSign: true })}
          </Text>
          <Text style={styles.statLabel}>cashback</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              { color: isNetPositive ? Palette.success : Palette.danger },
            ]}
          >
            {formatRupees(stats.net, { showSign: true })}
          </Text>
          <Text style={styles.statLabel}>Net result</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  cardPressed: {
    backgroundColor: Palette.light.surfaceSubtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.light.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: Palette.light.textMuted,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Palette.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.primary,
  },
  figuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Palette.light.cardBorder,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.light.text,
  },
  statLabel: {
    fontSize: 10,
    color: Palette.light.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
});
