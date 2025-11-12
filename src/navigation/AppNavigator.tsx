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
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';

export type RootStackParamList = {
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { mode, tokens } = useTheme();

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

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

