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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTodos } from '@/hooks/useTodos';
import { Priority } from '@/types/todo';
import { TodoInput } from '@/components/TodoInput';
import { DatePickerModal } from '@/components/DatePickerModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
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

export default function EditTodoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTodo, updateTodo, deleteTodo } = useTodos();

  const todo = id ? getTodo(id) : undefined;

  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [priority, setPriority] = useState<Priority>(todo?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState<string | undefined>(todo?.dueDate);
  const [completed, setCompleted] = useState<boolean>(todo?.completed ?? false);
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('Task title is required');
      return;
    }

    if (!id) return;

    try {
      setIsSubmitting(true);
      await updateTodo(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate,
        completed,
      });
      router.back();
    } catch (error) {
      console.error('Failed to update todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await deleteTodo(id);
      setIsDeleteModalVisible(false);
      router.back();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  if (!todo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Palette.danger} />
          <Text style={styles.notFoundTitle}>Task Not Found</Text>
          <Text style={styles.notFoundSubtitle}>
            This task may have already been removed or does not exist.
          </Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Return to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
            accessibilityLabel="Cancel editing"
          >
            <Ionicons name="close" size={24} color={Palette.light.text} />
          </Pressable>

          <Text style={styles.headerTitle}>Edit Task</Text>

          <Pressable
            onPress={handleSave}
            disabled={!title.trim() || isSubmitting}
            style={[
              styles.headerSaveButton,
              (!title.trim() || isSubmitting) && styles.headerSaveDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Save task changes"
          >
            <Text
              style={[
                styles.headerSaveText,
                (!title.trim() || isSubmitting) && styles.headerSaveTextDisabled,
              ]}
            >
              Done
            </Text>
          </Pressable>
        </View>

        {/* Form Body */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Status Toggle Card */}
          <Pressable
            style={[
              styles.statusCard,
              completed ? styles.statusCardCompleted : styles.statusCardActive,
            ]}
            onPress={() => setCompleted(!completed)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: completed }}
            accessibilityLabel={`Task is ${completed ? 'completed' : 'in progress'}. Tap to toggle.`}
          >
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.statusIconCircle,
                  completed ? styles.statusIconCompleted : styles.statusIconActive,
                ]}
              >
                <Ionicons
                  name={completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={completed ? Palette.success : Palette.light.textMuted}
                />
              </View>
              <View>
                <Text style={styles.statusTitle}>
                  {completed ? 'Task Completed' : 'Task In Progress'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {completed
                    ? 'Tap to mark as pending again'
                    : 'Tap to mark as finished'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusPill,
                completed ? styles.statusPillCompleted : styles.statusPillActive,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  completed && { color: Palette.success },
                ]}
              >
                {completed ? 'Completed' : 'Active'}
              </Text>
            </View>
          </Pressable>

          {/* Title Input */}
          <TodoInput
            label="Title"
            placeholder="Task title"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError(undefined);
            }}
            onClear={() => setTitle('')}
            error={titleError}
            required
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

          {/* Delete Action Button */}
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
            onPress={() => setIsDeleteModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Delete task"
          >
            <Ionicons name="trash-outline" size={18} color={Palette.danger} />
            <Text style={styles.deleteButtonText}>Delete Task</Text>
          </Pressable>
        </ScrollView>

        {/* Primary Bottom Action */}
        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              (!title.trim() || isSubmitting) && styles.saveButtonDisabled,
              pressed && styles.saveButtonPressed,
            ]}
            onPress={handleSave}
            disabled={!title.trim() || isSubmitting}
          >
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
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

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          visible={isDeleteModalVisible}
          title="Delete Task?"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalVisible(false)}
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  statusCardActive: {
    backgroundColor: Palette.light.card,
    borderColor: Palette.light.cardBorder,
  },
  statusCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconActive: {
    backgroundColor: Palette.light.surfaceSubtle,
  },
  statusIconCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.light.text,
  },
  statusSubtitle: {
    fontSize: 12,
    color: Palette.light.textMuted,
    marginTop: 2,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  statusPillActive: {
    backgroundColor: Palette.light.surfaceSubtle,
  },
  statusPillCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.light.textSecondary,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    backgroundColor: Palette.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: Spacing.sm,
  },
  deleteButtonPressed: {
    opacity: 0.8,
  },
  deleteButtonText: {
    color: Palette.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Palette.light.card,
    borderTopWidth: 1,
    borderTopColor: Palette.light.cardBorder,
    ...Shadows.subtle,
  },
  saveButton: {
    backgroundColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    ...Shadows.card,
  },
  saveButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.light.text,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: Palette.light.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    marginTop: Spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.primary,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
