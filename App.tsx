import './globals.css';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme';
import { AppNavigator } from './src/navigation/AppNavigator';

const Root = () => {
  const { mode } = useTheme();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}