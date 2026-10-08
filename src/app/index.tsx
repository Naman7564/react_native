import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTodos } from '@/hooks/useTodos';
import { ProgressCard } from '@/components/ProgressCard';
import { FilterTabs } from '@/components/FilterTabs';
import { TodoCard } from '@/components/TodoCard';
import { EmptyState, EmptyStateType } from '@/components/EmptyState';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { SortModal } from '@/components/SortModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { getGreeting, formatHeaderDate } from '@/utils/date';

export default function HomeScreen() {
  const router = useRouter();
  const {
    filteredTodos,
    stats,
    filter,
    setFilter,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    filterCounts,
    toggleTodo,
    deleteTodo,
    isLoading,
  } = useTodos();

  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const greeting = getGreeting();
  const { dayName, formattedDate } = formatHeaderDate();

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 400);
  };

  const handlePressTodo = (id: string) => {
    router.push({
      pathname: '/edit-todo',
      params: { id },
    });
  };

  const handleConfirmDelete = async () => {
    if (todoToDelete) {
      await deleteTodo(todoToDelete);
      setTodoToDelete(null);
    }
  };

  const getEmptyStateType = (): EmptyStateType => {
    if (searchQuery.trim().length > 0) return 'search';
    if (filter === 'active') return 'active';
    if (filter === 'completed') return 'completed';
    if (filter === 'high') return 'high';
    return 'all';
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Top Greeting Bar */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.dateLabel}>
            {dayName}, {formattedDate}
          </Text>
          <Text style={styles.greetingTitle}>{greeting}</Text>
        </View>
        <View style={styles.avatarBadge}>
          <Ionicons name="sparkles" size={18} color={Palette.primary} />
        </View>
      </View>

      {/* Progress Dashboard Card */}
      <View style={styles.progressSection}>
        <ProgressCard stats={stats} />
      </View>

      {/* Search & Sort Controls Row */}
      <View style={styles.controlsRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Palette.light.textPlaceholder}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={Palette.light.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search tasks"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
              style={styles.searchClearBtn}
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={16}
                color={Palette.light.textPlaceholder}
              />
            </Pressable>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.sortButton,
            pressed && styles.sortButtonPressed,
          ]}
          onPress={() => setIsSortModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Sort tasks"
        >
          <Ionicons name="swap-vertical" size={18} color={Palette.light.text} />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersSection}>
        <FilterTabs
          currentFilter={filter}
          onSelectFilter={setFilter}
          counts={filterCounts}
        />
      </View>

      {/* Section Header: Tasks summary */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {filter === 'all'
            ? 'All Tasks'
            : filter === 'active'
            ? 'Active Tasks'
            : filter === 'completed'
            ? 'Completed'
            : 'High Priority'}
        </Text>
        <Text style={styles.sectionCountBadge}>
          {filteredTodos.length} {filteredTodos.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoCard
            todo={item}
            onToggle={toggleTodo}
            onPress={handlePressTodo}
            onDelete={(id) => setTodoToDelete(id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              type={getEmptyStateType()}
              searchQuery={searchQuery}
              onActionPress={() => {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  router.push('/add-todo');
                }
              }}
            />
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.primary}
            colors={[Palette.primary]}
          />
        }
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => router.push('/add-todo')} />

      {/* Sort Selection Bottom Modal */}
      <SortModal
        visible={isSortModalVisible}
        currentSort={sortOption}
        onSelectSort={setSortOption}
        onClose={() => setIsSortModalVisible(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={todoToDelete !== null}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTodoToDelete(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.light.background,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100, // Room for FAB
  },
  listHeader: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.light.text,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primaryLight,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    marginBottom: Spacing.lg,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.light.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    paddingHorizontal: Spacing.md,
    height: 44,
    ...Shadows.subtle,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Palette.light.text,
    padding: 0,
  },
  searchClearBtn: {
    padding: 4,
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.light.card,
    borderWidth: 1,
    borderColor: Palette.light.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  sortButtonPressed: {
    backgroundColor: Palette.light.surfaceSubtle,
  },
  filtersSection: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.light.text,
    letterSpacing: -0.2,
  },
  sectionCountBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.light.textMuted,
  },
});
