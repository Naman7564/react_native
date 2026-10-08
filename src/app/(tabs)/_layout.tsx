import React from 'react';
import { Tabs } from 'expo-router';
import { BottomTabBar } from '@/components/BottomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="todo"
        options={{
          title: 'To-Do',
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
        }}
      />
    </Tabs>
  );
}
