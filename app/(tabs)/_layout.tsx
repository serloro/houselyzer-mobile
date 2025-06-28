import { Tabs } from 'expo-router';
import { Home, Calculator, Settings } from 'lucide-react-native';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/utils/translations';

export default function TabLayout() {
  const { settings } = useStore();
  const t = useTranslation(settings.language);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff',
        },
        headerTintColor: settings.darkMode ? '#ffffff' : '#000000',
        tabBarStyle: {
          backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('properties'),
          headerTitle: 'Houselyzer',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: t('calculator'),
          headerTitle: t('mortgageCalculator'),
          tabBarIcon: ({ color, size }) => (
            <Calculator color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          headerTitle: t('settings'),
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}