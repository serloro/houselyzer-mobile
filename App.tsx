import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from './src/store/useStore';
import { Properties } from './src/pages/Properties';
import { MortgageCalculator } from './src/pages/MortgageCalculator';
import { Settings } from './src/pages/Settings';
import { useTranslation } from './src/utils/translations';

const Tab = createBottomTabNavigator();

export default function App() {
  const { settings } = useStore();
  const t = useTranslation(settings.language);

  const theme = settings.darkMode ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style={settings.darkMode ? 'light' : 'dark'} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Properties') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Calculator') {
                iconName = focused ? 'calculator' : 'calculator-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              } else {
                iconName = 'home-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff',
            },
            headerTintColor: settings.darkMode ? '#ffffff' : '#000000',
            tabBarStyle: {
              backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff',
            },
          })}
        >
          <Tab.Screen 
            name="Properties" 
            component={Properties}
            options={{
              title: t('properties'),
              headerTitle: 'Houselyzer'
            }}
          />
          <Tab.Screen 
            name="Calculator" 
            component={MortgageCalculator}
            options={{
              title: t('calculator'),
              headerTitle: t('mortgageCalculator')
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={Settings}
            options={{
              title: t('settings'),
              headerTitle: t('settings')
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}