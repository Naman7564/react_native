import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { getQuickDatePresets, isSameDay } from '@/utils/date';

interface DatePickerModalProps {
  visible: boolean;
  selectedDate?: string; // ISO date string
  onSelectDate: (dateStr?: string) => void;
  onClose: () => void;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
}) => {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth());
  const [activeDate, setActiveDate] = useState<Date | null>(
    selectedDate ? new Date(selectedDate) : null
  );

  const presets = getQuickDatePresets();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays: { day: number | null; date?: Date }[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: null });
  }
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarDays.push({
      day: d,
      date: new Date(currentYear, currentMonth, d, 12, 0, 0),
    });
  }

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleSave = () => {
    if (activeDate) {
      onSelectDate(activeDate.toISOString());
    } else {
      onSelectDate(undefined);
    }
    onClose();
  };

  const handleClear = () => {
    setActiveDate(null);
    onSelectDate(undefined);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Select Due Date</Text>
                <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={Palette.light.textMuted} />
                </Pressable>
              </View>

              {/* Quick Presets */}
              <View style={styles.presetsRow}>
                {presets.map((p) => {
                  const isPresetActive = activeDate && isSameDay(activeDate, p.date);
                  return (
                    <Pressable
                      key={p.label}
                      style={[
                        styles.presetChip,
                        isPresetActive && styles.presetChipActive,
                      ]}
                      onPress={() => {
                        setActiveDate(p.date);
                        setCurrentMonth(p.date.getMonth());
                        setCurrentYear(p.date.getFullYear());
                      }}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          isPresetActive && styles.presetChipTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Calendar Navigator */}
              <View style={styles.calendarNav}>
                <Pressable onPress={handlePrevMonth} style={styles.navArrow} hitSlop={10}>
                  <Ionicons name="chevron-back" size={20} color={Palette.light.text} />
                </Pressable>
                <Text style={styles.monthTitle}>{monthName}</Text>
                <Pressable onPress={handleNextMonth} style={styles.navArrow} hitSlop={10}>
                  <Ionicons name="chevron-forward" size={20} color={Palette.light.text} />
                </Pressable>
              </View>

              {/* Day of Week Headers */}
              <View style={styles.weekHeader}>
                {DAYS_OF_WEEK.map((day) => (
                  <Text key={day} style={styles.weekDayText}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.grid}>
                {calendarDays.map((cell, idx) => {
                  if (cell.day === null || !cell.date) {
                    return <View key={`empty-${idx}`} style={styles.dayCell} />;
                  }

                  const isSelected = activeDate && isSameDay(activeDate, cell.date);
                  const isToday = isSameDay(new Date(), cell.date);

                  return (
                    <Pressable
                      key={`day-${cell.day}`}
                      style={[
                        styles.dayCell,
                        isToday && styles.todayCell,
                        isSelected && styles.selectedCell,
                      ]}
                      onPress={() => setActiveDate(cell.date!)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && styles.todayText,
                          isSelected && styles.selectedDayText,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <Pressable style={styles.clearBtn} onPress={handleClear}>
                  <Text style={styles.clearBtnText}>No Due Date</Text>
                </Pressable>
                <Pressable style={styles.doneBtn} onPress={handleSave}>
                  <Text style={styles.doneBtnText}>Apply</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    ...Shadows.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.light.text,
  },
  closeBtn: {
    padding: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  presetChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
  },
  presetChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Palette.light.textSecondary,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  navArrow: {
    padding: 6,
    borderRadius: BorderRadius.sm,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.light.text,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Palette.light.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 4,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    borderWidth: 1,
    borderColor: Palette.primary,
  },
  selectedCell: {
    backgroundColor: Palette.primary,
  },
  dayText: {
    fontSize: 13,
    color: Palette.light.text,
    fontWeight: '500',
  },
  todayText: {
    color: Palette.primary,
    fontWeight: '700',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.light.surfaceSubtle,
  },
  clearBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.light.textMuted,
  },
  doneBtn: {
    backgroundColor: Palette.primary,
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
