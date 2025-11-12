import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
export type ThemeMode = 'light' | 'dark';

type ThemeTokens = {
  background: string;
  surface: string;
  elevated: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  border: string;
};

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  tokens: ThemeTokens;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const THEME_PALETTES: Record<ThemeMode, ThemeTokens> = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    elevated: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    accent: '#7C3AED',
    accentSoft: '#A855F7',
    border: '#CBD5F5',
  },
  dark: {
    background: '#020617',
    surface: '#0F172A',
    elevated: '#111C34',
    textPrimary: '#E2E8F0',
    textSecondary: '#94A3B8',
    accent: '#38BDF8',
    accentSoft: '#7C3AED',
    border: '#1E293B',
  },
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  isDark: true,
  tokens: THEME_PALETTES.dark,
  setMode: () => undefined,
  toggleMode: () => undefined,
});

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemScheme = useSystemColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    (systemScheme as ThemeMode | null) ?? 'dark',
  );

  useEffect(() => {
    if (systemScheme) {
      setMode(systemScheme as ThemeMode);
    }
  }, [systemScheme]);
  const setModeAndPersist = useCallback((nextMode: ThemeMode) => {
    setMode(nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark: mode === 'dark',
      tokens: THEME_PALETTES[mode],
      setMode: setModeAndPersist,
      toggleMode,
    }),
    [mode, setModeAndPersist, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export const themeTokens = THEME_PALETTES;

