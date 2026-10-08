import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '@/types/todo';
import { Palette } from '@/constants/colors';
import { BorderRadius } from '@/constants/theme';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

const PRIORITY_CONFIG = {
  high: {
    label: 'High',
    color: Palette.priority.high.color,
    bg: Palette.priority.high.bg,
    border: Palette.priority.high.border,
  },
  medium: {
    label: 'Medium',
    color: Palette.priority.medium.color,
    bg: Palette.priority.medium.bg,
    border: Palette.priority.medium.border,
  },
  low: {
    label: 'Low',
    color: Palette.priority.low.color,
    bg: Palette.priority.low.bg,
    border: Palette.priority.low.border,
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'small',
  showLabel = true,
}) => {
  const config = PRIORITY_CONFIG[priority];
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 8 : 10,
        },
      ]}
      accessibilityLabel={`Priority ${config.label}`}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: config.color,
              fontSize: isSmall ? 11 : 12,
            },
          ]}
        >
          {config.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
