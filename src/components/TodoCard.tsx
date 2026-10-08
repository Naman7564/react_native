import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '@/types/todo';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { formatDisplayDate, isOverdue, isDueToday } from '@/utils/date';

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}

const SWIPE_THRESHOLD = 75;

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onToggle,
  onPress,
  onDelete,
}) => {
  const [panX] = useState(() => new Animated.Value(0));
  const isCompleted = todo.completed;
  const overdue = isOverdue(todo.dueDate, isCompleted);
  const dueToday = isDueToday(todo.dueDate);

  // PanResponder for smooth swipe gestures
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dy) < 15;
        },
        onPanResponderMove: (_, gestureState) => {
          panX.setValue(gestureState.dx);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > SWIPE_THRESHOLD) {
            // Swiped right -> Toggle complete
            Animated.spring(panX, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 8,
            }).start(() => {
              onToggle(todo.id);
            });
          } else if (gestureState.dx < -SWIPE_THRESHOLD) {
            // Swiped left -> Trigger delete
            Animated.spring(panX, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 8,
            }).start(() => {
              onDelete(todo.id);
            });
          } else {
            // Snap back
            Animated.spring(panX, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 8,
            }).start();
          }
        },
      }),
    [panX, onToggle, onDelete, todo.id]
  );

  // Background action icons opacity and scale
  const { rightActionOpacity, leftActionOpacity, leftActionScale, rightActionScale } = useMemo(() => {
    return {
      rightActionOpacity: panX.interpolate({
        inputRange: [-SWIPE_THRESHOLD, -20, 0],
        outputRange: [1, 0.4, 0],
        extrapolate: 'clamp',
      }),
      leftActionOpacity: panX.interpolate({
        inputRange: [0, 20, SWIPE_THRESHOLD],
        outputRange: [0, 0.4, 1],
        extrapolate: 'clamp',
      }),
      leftActionScale: panX.interpolate({
        inputRange: [0, SWIPE_THRESHOLD],
        outputRange: [0.7, 1.1],
        extrapolate: 'clamp',
      }),
      rightActionScale: panX.interpolate({
        inputRange: [-SWIPE_THRESHOLD, 0],
        outputRange: [1.1, 0.7],
        extrapolate: 'clamp',
      }),
    };
  }, [panX]);

  const displayDate = formatDisplayDate(todo.dueDate);

  return (
    <View style={styles.outerContainer}>
      {/* Background Swipe Actions Layer */}
      <View style={styles.backgroundLayer}>
        {/* Left background: Toggle Complete */}
        <Animated.View
          style={[
            styles.actionLeft,
            { opacity: leftActionOpacity, transform: [{ scale: leftActionScale }] },
          ]}
        >
          <Ionicons
            name={isCompleted ? 'arrow-undo' : 'checkmark-circle'}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.actionText}>
            {isCompleted ? 'Undo' : 'Complete'}
          </Text>
        </Animated.View>

        {/* Right background: Delete */}
        <Animated.View
          style={[
            styles.actionRight,
            { opacity: rightActionOpacity, transform: [{ scale: rightActionScale }] },
          ]}
        >
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Delete</Text>
        </Animated.View>
      </View>

      {/* Foreground Interactive Card Layer */}
      <Animated.View
        style={[
          styles.card,
          isCompleted && styles.cardCompleted,
          { transform: [{ translateX: panX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          style={styles.cardContent}
          onPress={() => onPress(todo.id)}
          accessibilityRole="button"
          accessibilityLabel={`Task: ${todo.title}. Status: ${isCompleted ? 'completed' : 'active'}`}
        >
          {/* Checkbox Button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggle(todo.id);
            }}
            style={({ pressed }) => [
              styles.checkbox,
              isCompleted && styles.checkboxChecked,
              pressed && styles.checkboxPressed,
            ]}
            hitSlop={10}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isCompleted }}
            accessibilityLabel={`Mark "${todo.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </Pressable>

          {/* Text and Metadata */}
          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <Text
                style={[
                  styles.title,
                  isCompleted && styles.titleCompleted,
                ]}
                numberOfLines={2}
              >
                {todo.title}
              </Text>
            </View>

            {todo.description ? (
              <Text
                style={[
                  styles.description,
                  isCompleted && styles.descriptionCompleted,
                ]}
                numberOfLines={2}
              >
                {todo.description}
              </Text>
            ) : null}

            {/* Badges and Due Date Footer */}
            <View style={styles.footerRow}>
              <PriorityBadge priority={todo.priority} size="small" />

              {displayDate ? (
                <View
                  style={[
                    styles.dueDateBadge,
                    overdue && styles.overdueBadge,
                    dueToday && !overdue && styles.dueTodayBadge,
                  ]}
                >
                  <Ionicons
                    name={overdue ? 'alert-circle-outline' : 'calendar-outline'}
                    size={12}
                    color={
                      overdue
                        ? Palette.danger
                        : dueToday
                        ? '#D97706'
                        : Palette.light.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.dueDateText,
                      overdue && styles.overdueText,
                      dueToday && !overdue && styles.dueTodayText,
                    ]}
                  >
                    {overdue ? `Overdue (${displayDate})` : displayDate}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Edit Chevron */}
          <View style={styles.chevronContainer}>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: 5,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.xl,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.danger,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    ...Shadows.subtle,
  },
  cardCompleted: {
    backgroundColor: '#FAFBFD',
    borderColor: '#ECEFF4',
    opacity: 0.85,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md + 2,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  checkboxPressed: {
    transform: [{ scale: 0.9 }],
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.light.text,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Palette.light.textMuted,
  },
  description: {
    fontSize: 13,
    color: Palette.light.textMuted,
    lineHeight: 18,
    marginTop: 4,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.light.surfaceSubtle,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
  },
  dueDateText: {
    fontSize: 11,
    fontWeight: '500',
    color: Palette.light.textMuted,
  },
  overdueBadge: {
    backgroundColor: Palette.dangerLight,
    borderColor: '#FECACA',
  },
  overdueText: {
    color: Palette.danger,
    fontWeight: '600',
  },
  dueTodayBadge: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  dueTodayText: {
    color: '#D97706',
    fontWeight: '600',
  },
  chevronContainer: {
    alignSelf: 'center',
    paddingLeft: 4,
  },
});
