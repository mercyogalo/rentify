import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { OnboardingScreen } from './screens/auth/OnboardingScreen';
import { AuthNavigator } from './navigation/AuthNavigator';
import { UserNavigator } from './navigation/UserNavigator';
import { AgentNavigator } from './navigation/AgentNavigator';
import { useAuthStore } from './store/authStore';
import type { RootStackParamList } from './navigation/types';
import { colors } from './theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, isInitialized, hasSeenOnboarding, initialize, setHasSeenOnboarding } =
    useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding && !user && (
          <Stack.Screen name="Onboarding">
            {() => (
              <OnboardingScreen onComplete={() => setHasSeenOnboarding(true)} />
            )}
          </Stack.Screen>
        )}
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user.role === 'agent' ? (
          <Stack.Screen name="AgentApp" component={AgentNavigator} />
        ) : (
          <Stack.Screen name="UserApp" component={UserNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
