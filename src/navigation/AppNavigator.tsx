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
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export type RootStackParamList = {
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  // Main app screens will be added later
  // Home: undefined;
  // Profile: undefined;
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
        initialRouteName="Onboarding"
      >
        {/* Always register auth screens - navigation will handle access */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        {/* Main app screens will be added here when user is authenticated */}
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

