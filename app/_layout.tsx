import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useStore } from '@/store/useStore';

export default function RootLayout() {
  useFrameworkReady();
  
  const { settings } = useStore();
  const theme = settings.darkMode ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={settings.darkMode ? 'light' : 'dark'} />
    </PaperProvider>
  );
}