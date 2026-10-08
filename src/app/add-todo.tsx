import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTodos } from '@/hooks/useTodos';
import { Priority } from '@/types/todo';
import { TodoInput } from '@/components/TodoInput';
import { DatePickerModal } from '@/components/DatePickerModal';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { formatDisplayDate } from '@/utils/date';

const PRIORITIES: {
  id: Priority;
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'low',
    label: 'Low',
    color: Palette.priority.low.color,
    bg: Palette.priority.low.bg,
    border: Palette.priority.low.border,
    icon: 'arrow-down',
  },
  {
    id: 'medium',
    label: 'Medium',
    color: Palette.priority.medium.color,
    bg: Palette.priority.medium.bg,
    border: Palette.priority.medium.border,
    icon: 'remove',
  },
  {
    id: 'high',
    label: 'High',
    color: Palette.priority.high.color,
    bg: Palette.priority.high.bg,
    border: Palette.priority.high.border,
    icon: 'arrow-up',
  },
];

export default function AddTodoScreen() {
  const router = useRouter();
  const { addTodo } = useTodos();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('Task title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await addTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate,
      });
      router.back();
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDueDate = formatDisplayDate(dueDate);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Navigation Bar Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.headerButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Ionicons name="close" size={24} color={Palette.light.text} />
          </Pressable>

          <Text style={styles.headerTitle}>New Task</Text>

          <Pressable
            onPress={handleSave}
            disabled={!title.trim() || isSubmitting}
            style={[
              styles.headerSaveButton,
              (!title.trim() || isSubmitting) && styles.headerSaveDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Save task"
          >
            <Text
              style={[
                styles.headerSaveText,
                (!title.trim() || isSubmitting) && styles.headerSaveTextDisabled,
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>

        {/* Form Body */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <TodoInput
            label="Title"
            placeholder="What needs to be done?"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError(undefined);
            }}
            onClear={() => setTitle('')}
            error={titleError}
            required
            autoFocus
            maxLength={100}
            characterLimit={100}
          />

          {/* Description Input */}
          <TodoInput
            label="Description"
            placeholder="Add extra details, notes, or subtasks (optional)"
            value={description}
            onChangeText={setDescription}
            onClear={() => setDescription('')}
            multiline
            numberOfLines={4}
            maxLength={500}
            characterLimit={500}
          />

          {/* Priority Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setPriority(p.id)}
                    style={[
                      styles.priorityOption,
                      isSelected && {
                        backgroundColor: p.bg,
                        borderColor: p.border,
                        shadowColor: p.color,
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${p.label} priority`}
                  >
                    <View
                      style={[
                        styles.priorityIconBadge,
                        { backgroundColor: isSelected ? p.color : '#F1F5F9' },
                      ]}
                    >
                      <Ionicons
                        name={p.icon}
                        size={14}
                        color={isSelected ? '#FFFFFF' : Palette.light.textMuted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.priorityText,
                        isSelected && { color: p.color, fontWeight: '700' },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Due Date Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Due Date</Text>
            <Pressable
              style={styles.dueDateButton}
              onPress={() => setIsDatePickerVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Select due date"
            >
              <View style={styles.dueDateLeft}>
                <View style={styles.calendarIconCircle}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={dueDate ? Palette.primary : Palette.light.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.dueDateValueText,
                    !dueDate && styles.dueDatePlaceholder,
                  ]}
                >
                  {dueDate ? formattedDueDate : 'Set deadline (optional)'}
                </Text>
              </View>

              {dueDate ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setDueDate(undefined);
                  }}
                  hitSlop={10}
                  style={styles.clearDateBtn}
                  accessibilityLabel="Remove due date"
                >
                  <Ionicons name="close-circle" size={18} color={Palette.light.textMuted} />
                </Pressable>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Palette.light.textPlaceholder}
                />
              )}
            </Pressable>
          </View>
        </ScrollView>

        {/* Primary Bottom Action */}
        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              (!title.trim() || isSubmitting) && styles.createButtonDisabled,
              pressed && styles.createButtonPressed,
            ]}
            onPress={handleSave}
            disabled={!title.trim() || isSubmitting}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Text>
          </Pressable>
        </View>

        {/* Date Picker Modal */}
        <DatePickerModal
          visible={isDatePickerVisible}
          selectedDate={dueDate}
          onSelectDate={(newDate) => setDueDate(newDate)}
          onClose={() => setIsDatePickerVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.light.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.light.cardBorder,
    backgroundColor: Palette.light.card,
  },
  headerButton: {
    padding: 6,
    borderRadius: BorderRadius.full,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.light.text,
  },
  headerSaveButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.primary,
  },
  headerSaveDisabled: {
    backgroundColor: Palette.light.surfaceSubtle,
  },
  headerSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSaveTextDisabled: {
    color: Palette.light.textPlaceholder,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.light.text,
    marginBottom: Spacing.sm,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Palette.light.cardBorder,
    backgroundColor: Palette.light.card,
  },
  priorityIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.light.textSecondary,
  },
  dueDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Palette.light.cardBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  dueDateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.light.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueDateValueText: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.light.text,
  },
  dueDatePlaceholder: {
    fontSize: 14,
    fontWeight: '400',
    color: Palette.light.textPlaceholder,
  },
  clearDateBtn: {
    padding: 4,
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Palette.light.card,
    borderTopWidth: 1,
    borderTopColor: Palette.light.cardBorder,
    ...Shadows.subtle,
  },
  createButton: {
    backgroundColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    ...Shadows.card,
  },
  createButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonPressed: {
    opacity: 0.9,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
