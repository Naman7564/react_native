import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FinanceSummaryStats } from '@/types/finance';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { formatRupees } from '@/utils/financeCalculations';

interface FinanceSummaryProps {
  stats: FinanceSummaryStats;
}

export const FinanceSummary: React.FC<FinanceSummaryProps> = ({ stats }) => {
  const { totalExpenses, totalCashback, totalProfit, net } = stats;
  const isNetPositive = net > 0;
  const isNetZero = net === 0;

  return (
    <View style={styles.container}>
      {/* 2x2 Grid of Summary Cards */}
      <View style={styles.gridRow}>
        {/* 1. Total Expenses Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="arrow-up-circle-outline" size={16} color={Palette.danger} />
            </View>
            <Text style={styles.cardLabel}>Expenses</Text>
          </View>
          <Text style={[styles.amountText, { color: Palette.light.text }]}>
            {formatRupees(totalExpenses)}
          </Text>
          <Text style={styles.subtext}>Money spent</Text>
        </View>

        {/* 2. Cashback Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="sparkles-outline" size={16} color="#D97706" />
            </View>
            <Text style={styles.cardLabel}>Cashback</Text>
          </View>
          <Text style={[styles.amountText, { color: '#D97706' }]}>
            {formatRupees(totalCashback, { showSign: true })}
          </Text>
          <Text style={styles.subtext}>Rewards earned</Text>
        </View>
      </View>

      <View style={styles.gridRow}>
        {/* 3. Profit / Earnings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="trending-up-outline" size={16} color={Palette.success} />
            </View>
            <Text style={styles.cardLabel}>Profit</Text>
          </View>
          <Text style={[styles.amountText, { color: Palette.success }]}>
            {formatRupees(totalProfit, { showSign: true })}
          </Text>
          <Text style={styles.subtext}>Income & gains</Text>
        </View>

        {/* 4. Net Result Card */}
        <View
          style={[
            styles.card,
            styles.netCard,
            isNetPositive
              ? styles.netCardPositive
              : isNetZero
              ? styles.netCardNeutral
              : styles.netCardNegative,
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: isNetPositive
                    ? '#DCFCE7'
                    : isNetZero
                    ? Palette.light.surfaceSubtle
                    : '#FEE2E2',
                },
              ]}
            >
              <Ionicons
                name={
                  isNetPositive
                    ? 'shield-checkmark-outline'
                    : isNetZero
                    ? 'reorder-two-outline'
                    : 'alert-circle-outline'
                }
                size={16}
                color={
                  isNetPositive
                    ? Palette.success
                    : isNetZero
                    ? Palette.light.textMuted
                    : Palette.danger
                }
              />
            </View>
            <View style={styles.netLabelBadge}>
              <Text style={styles.cardLabel}>Net</Text>
              <Text
                style={[
                  styles.statusPill,
                  {
                    color: isNetPositive
                      ? Palette.success
                      : isNetZero
                      ? Palette.light.textMuted
                      : Palette.danger,
                  },
                ]}
              >
                {isNetPositive ? 'Surplus' : isNetZero ? 'Even' : 'Deficit'}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.amountText,
              {
                color: isNetPositive
                  ? Palette.success
                  : isNetZero
                  ? Palette.light.text
                  : Palette.danger,
              },
            ]}
          >
            {formatRupees(net, { showSign: true })}
          </Text>
          <Text style={styles.subtext}>Profit + Cashback - Exp</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: Spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    ...Shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.light.textMuted,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subtext: {
    fontSize: 11,
    color: Palette.light.textPlaceholder,
    fontWeight: '500',
  },
  netCard: {
    borderWidth: 1.5,
  },
  netCardPositive: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  netCardNeutral: {
    borderColor: Palette.light.cardBorder,
    backgroundColor: Palette.light.card,
  },
  netCardNegative: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  netLabelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  statusPill: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
