import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AgentDashboardScreen } from '../screens/agent/AgentDashboardScreen';
import { ListingFormScreen } from '../screens/agent/ListingFormScreen';
import { ManageListingsScreen } from '../screens/agent/ManageListingsScreen';
import { ChatListScreen } from '../screens/user/ChatListScreen';
import { ChatScreen } from '../screens/user/ChatScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import type { AgentStackParamList } from './types';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AgentStackParamList>();

function AgentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 4,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'grid-outline',
            ManageListings: 'list-outline',
            ChatList: 'chatbubbles-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AgentDashboardScreen as React.ComponentType} options={{ title: 'Home' }} />
      <Tab.Screen
        name="ManageListings"
        component={ManageListingsScreen as React.ComponentType}
        options={{ title: 'Listings' }}
      />
      <Tab.Screen name="ChatList" component={ChatListScreen as React.ComponentType} options={{ title: 'Messages' }} />
      <Tab.Screen name="Profile" component={ProfileScreen as React.ComponentType} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function AgentNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Dashboard" component={AgentTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddListing"
        component={ListingFormScreen}
        options={{ title: 'New Listing' }}
      />
      <Stack.Screen
        name="EditListing"
        component={ListingFormScreen}
        options={{ title: 'Edit Listing' }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
    </Stack.Navigator>
  );
}
