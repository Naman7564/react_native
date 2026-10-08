import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SortOption } from '@/types/todo';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';

interface SortModalProps {
  visible: boolean;
  currentSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  onClose: () => void;
}

interface SortItem {
  id: SortOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const SORT_OPTIONS: SortItem[] = [
  {
    id: 'newest',
    label: 'Newest first',
    icon: 'time-outline',
    description: 'Recently created tasks appear at the top',
  },
  {
    id: 'oldest',
    label: 'Oldest first',
    icon: 'hourglass-outline',
    description: 'Earliest created tasks appear at the top',
  },
  {
    id: 'priority',
    label: 'Priority',
    icon: 'flag-outline',
    description: 'High priority tasks take highest precedence',
  },
  {
    id: 'dueDate',
    label: 'Due date',
    icon: 'calendar-outline',
    description: 'Upcoming deadlines appear first',
  },
];

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  currentSort,
  onSelectSort,
  onClose,
}) => {
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
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Sort Tasks</Text>
                <Pressable
                  onPress={onClose}
                  hitSlop={12}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={20} color={Palette.light.textMuted} />
                </Pressable>
              </View>

              <View style={styles.list}>
                {SORT_OPTIONS.map((item) => {
                  const isSelected = currentSort === item.id;

                  return (
                    <Pressable
                      key={item.id}
                      style={({ pressed }) => [
                        styles.sortRow,
                        isSelected && styles.sortRowSelected,
                        pressed && styles.sortRowPressed,
                      ]}
                      onPress={() => {
                        onSelectSort(item.id);
                        onClose();
                      }}
                    >
                      <View
                        style={[
                          styles.iconCircle,
                          isSelected && styles.iconCircleSelected,
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={isSelected ? Palette.primary : Palette.light.textSecondary}
                        />
                      </View>

                      <View style={styles.textContainer}>
                        <Text
                          style={[
                            styles.sortLabel,
                            isSelected && styles.sortLabelSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text style={styles.sortDescription}>
                          {item.description}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </Pressable>
                  );
                })}
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
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Palette.light.card,
    borderTopLeftRadius: BorderRadius.xl * 1.2,
    borderTopRightRadius: BorderRadius.xl * 1.2,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    ...Shadows.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.light.text,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  list: {
    gap: 10,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    backgroundColor: Palette.light.card,
  },
  sortRowSelected: {
    borderColor: '#C7D2FE',
    backgroundColor: Palette.primaryLight,
  },
  sortRowPressed: {
    opacity: 0.8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.light.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconCircleSelected: {
    backgroundColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
  },
  sortLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.light.text,
  },
  sortLabelSelected: {
    color: Palette.primary,
  },
  sortDescription: {
    fontSize: 12,
    color: Palette.light.textMuted,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Palette.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.primary,
  },
});
