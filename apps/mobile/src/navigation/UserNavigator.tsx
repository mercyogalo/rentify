import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/user/HomeScreen';
import { HouseDetailScreen } from '../screens/user/HouseDetailScreen';
import { AgentProfileScreen } from '../screens/user/AgentProfileScreen';
import { ChatListScreen } from '../screens/user/ChatListScreen';
import { ChatScreen } from '../screens/user/ChatScreen';
import { FavoritesScreen } from '../screens/user/FavoritesScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import type { UserStackParamList } from './types';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<UserStackParamList>();

function UserTabs() {
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
            Home: 'home-outline',
            Favorites: 'heart-outline',
            ChatList: 'chatbubbles-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen as React.ComponentType} options={{ title: 'Discover' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen as React.ComponentType} options={{ title: 'Saved' }} />
      <Tab.Screen name="ChatList" component={ChatListScreen as React.ComponentType} options={{ title: 'Messages' }} />
      <Tab.Screen name="Profile" component={ProfileScreen as React.ComponentType} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function UserNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={UserTabs} options={{ headerShown: false }} />
      <Stack.Screen name="HouseDetail" component={HouseDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="AgentProfile" component={AgentProfileScreen} options={{ title: 'Agent' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
    </Stack.Navigator>
  );
}
