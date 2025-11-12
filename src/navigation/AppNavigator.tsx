import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { useTheme } from '../theme';
import { useAuthStore } from '../state/auth';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { PostDetailScreen } from '../screens/post-detail/PostDetailScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import type { Post } from '../services/posts';

export type RootStackParamList = {
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  PostDetail: { post: Post };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { mode, tokens } = useTheme();
  const { user, loading, initialized } = useAuthStore();

  const screenOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerShown: false,
      contentStyle: {
        backgroundColor: tokens.background,
      },
      animation: 'fade',
    }),
    [tokens.background],
  );

  const theme = useMemo<Theme>(() => {
    const baseTheme = mode === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: tokens.accent,
        background: tokens.background,
        card: tokens.surface,
        text: tokens.textPrimary,
        border: tokens.border,
        notification: tokens.accentSoft,
      },
    };
  }, [
    mode,
    tokens.accent,
    tokens.accentSoft,
    tokens.background,
    tokens.border,
    tokens.surface,
    tokens.textPrimary,
  ]);

  // Show loading screen while checking auth state
  if (!initialized || loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: tokens.background }]}>
        <ActivityIndicator size="large" color={tokens.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={screenOptions}
        initialRouteName={user ? 'MainTabs' : 'Onboarding'}
      >
        {user ? (
          // Main app screens - user is authenticated
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          </>
        ) : (
          // Auth flow - user is not authenticated
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

