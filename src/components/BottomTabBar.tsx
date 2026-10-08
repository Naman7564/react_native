import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Palette } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';

export type CustomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

interface TabConfig {
  name: string;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TAB_CONFIGS: Record<string, TabConfig> = {
  index: {
    name: 'index',
    label: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  todo: {
    name: 'todo',
    label: 'To-Do',
    activeIcon: 'checkbox',
    inactiveIcon: 'checkbox-outline',
  },
  finance: {
    name: 'finance',
    label: 'Finance',
    activeIcon: 'wallet',
    inactiveIcon: 'wallet-outline',
  },
};

export const BottomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 10 : 8);

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const config = TAB_CONFIGS[route.name] || {
            name: route.name,
            label: route.name,
            activeIcon: 'ellipse',
            inactiveIcon: 'ellipse-outline',
          };

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tabButton,
                pressed && styles.tabButtonPressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={`${config.label} tab`}
            >
              <View
                style={[
                  styles.indicatorPill,
                  isFocused && styles.indicatorPillActive,
                ]}
              >
                <Ionicons
                  name={isFocused ? config.activeIcon : config.inactiveIcon}
                  size={20}
                  color={isFocused ? Palette.primary : Palette.light.textMuted}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                >
                  {config.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    backgroundColor: Palette.light.card,
    borderTopWidth: 1,
    borderTopColor: Palette.light.cardBorder,
    paddingTop: 6,
    ...Shadows.subtle,
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabButtonPressed: {
    opacity: 0.8,
  },
  indicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
  },
  indicatorPillActive: {
    backgroundColor: Palette.primaryLight,
  },
  tabLabel: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: Palette.primary,
  },
  tabLabelInactive: {
    fontWeight: '500',
    color: Palette.light.textMuted,
  },
});
