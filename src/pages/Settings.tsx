import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Switch, Button, Menu, Divider, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useStore } from '../store/useStore';
import { useTranslation } from '../utils/translations';

export const Settings: React.FC = () => {
  const { settings, updateSettings, clearData, clearMarketDataCache } = useStore();
  const t = useTranslation(settings.language);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);
  const [measurementMenuVisible, setMeasurementMenuVisible] = useState(false);
  const [loanTermMenuVisible, setLoanTermMenuVisible] = useState(false);
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleSave = () => {
    showSnackbar(t('settingsSaved'));
  };

  const handleClearData = () => {
    Alert.alert(
      t('clearAllData'),
      `${t('clearDataWarning')}. ${t('cannotBeUndone')}.`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('clearAllData'),
          style: 'destructive',
          onPress: () => {
            clearData();
            showSnackbar(t('dataCleared'));
          },
        },
      ]
    );
  };

  const handleClearMarketCache = () => {
    clearMarketDataCache();
    showSnackbar(t('marketCacheCleared'));
  };

  const handleExportData = async () => {
    try {
      const data = {
        properties: useStore.getState().properties,
        favorites: useStore.getState().favorites,
        settings: useStore.getState().settings,
        marketData: useStore.getState().marketData,
        exportDate: new Date().toISOString(),
      };
      
      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `houselyzer-datos-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        showSnackbar(t('dataExported'));
      } else {
        showSnackbar('Sharing not available on this device');
      }
    } catch (error) {
      showSnackbar('Error exporting data');
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        // In a real implementation, you would parse and validate the data
        showSnackbar('¡Funcionalidad de importación lista! (Versión demo)');
      }
    } catch (error) {
      showSnackbar('Error importing data');
    }
  };

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ];

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' },
  ];

  const measurementUnits = [
    { value: 'sqft', label: t('squareFeetUnit') },
    { value: 'sqm', label: t('squareMetersUnit') },
  ];

  const loanTerms = [
    { value: 15, label: `15 ${t('years')}` },
    { value: 20, label: `20 ${t('years')}` },
    { value: 25, label: `25 ${t('years')}` },
    { value: 30, label: `30 ${t('years')}` },
  ];

  const locations = [
    { value: 'New York, NY', label: 'New York, NY' },
    { value: 'Los Angeles, CA', label: 'Los Angeles, CA' },
    { value: 'Miami, FL', label: 'Miami, FL' },
    { value: 'Madrid, Spain', label: 'Madrid, España' },
    { value: 'Barcelona, Spain', label: 'Barcelona, España' },
    { value: 'Valencia, Spain', label: 'Valencia, España' },
    { value: 'London, UK', label: 'London, UK' },
    { value: 'Paris, France', label: 'Paris, France' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text variant="bodyMedium" style={styles.subtitle}>{t('customizeExperience')}</Text>
        </View>

        {/* General Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('generalSettings')}</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text variant="bodyMedium">{t('language')}</Text>
              </View>
              <Menu
                visible={languageMenuVisible}
                onDismiss={() => setLanguageMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setLanguageMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    {languages.find(l => l.value === settings.language)?.label}
                  </Button>
                }
              >
                {languages.map((lang) => (
                  <Menu.Item
                    key={lang.value}
                    onPress={() => {
                      updateSettings({ language: lang.value as 'es' | 'en' });
                      setLanguageMenuVisible(false);
                    }}
                    title={lang.label}
                  />
                ))}
              </Menu>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text variant="bodyMedium">{t('currency')}</Text>
              </View>
              <Menu
                visible={currencyMenuVisible}
                onDismiss={() => setCurrencyMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setCurrencyMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    {currencies.find(c => c.value === settings.currency)?.label}
                  </Button>
                }
              >
                {currencies.map((currency) => (
                  <Menu.Item
                    key={currency.value}
                    onPress={() => {
                      updateSettings({ currency: currency.value });
                      setCurrencyMenuVisible(false);
                    }}
                    title={currency.label}
                  />
                ))}
              </Menu>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text variant="bodyMedium">{t('measurementUnit')}</Text>
              </View>
              <Menu
                visible={measurementMenuVisible}
                onDismiss={() => setMeasurementMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMeasurementMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    {measurementUnits.find(m => m.value === settings.measurementUnit)?.label}
                  </Button>
                }
              >
                {measurementUnits.map((unit) => (
                  <Menu.Item
                    key={unit.value}
                    onPress={() => {
                      updateSettings({ measurementUnit: unit.value as 'sqft' | 'sqm' });
                      setMeasurementMenuVisible(false);
                    }}
                    title={unit.label}
                  />
                ))}
              </Menu>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text variant="bodyMedium">{t('marketDataLocation')}</Text>
              </View>
              <Menu
                visible={locationMenuVisible}
                onDismiss={() => setLocationMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setLocationMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    {locations.find(l => l.value === settings.marketDataLocation)?.label}
                  </Button>
                }
              >
                {locations.map((location) => (
                  <Menu.Item
                    key={location.value}
                    onPress={() => {
                      updateSettings({ marketDataLocation: location.value });
                      setLocationMenuVisible(false);
                    }}
                    title={location.label}
                  />
                ))}
              </Menu>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text variant="bodyMedium">{t('enableNotifications')}</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSettings({ notifications: value })}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text variant="bodyMedium">{t('darkMode')}</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => updateSettings({ darkMode: value })}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Mortgage Calculator Defaults */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('mortgageDefaults')}</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text variant="bodyMedium">{t('defaultLoanTerm')} ({t('years')})</Text>
              </View>
              <Menu
                visible={loanTermMenuVisible}
                onDismiss={() => setLoanTermMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setLoanTermMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    {loanTerms.find(t => t.value === settings.defaultLoanTerm)?.label}
                  </Button>
                }
              >
                {loanTerms.map((term) => (
                  <Menu.Item
                    key={term.value}
                    onPress={() => {
                      updateSettings({ defaultLoanTerm: term.value });
                      setLoanTermMenuVisible(false);
                    }}
                    title={term.label}
                  />
                ))}
              </Menu>
            </View>
          </Card.Content>
        </Card>

        {/* Data Management */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('dataManagement')}</Text>
            
            <View style={styles.buttonGrid}>
              <Button
                mode="contained"
                onPress={handleExportData}
                style={styles.actionButton}
                icon="download"
              >
                {t('exportData')}
              </Button>

              <Button
                mode="contained"
                onPress={handleImportData}
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                icon="upload"
              >
                {t('importData')}
              </Button>

              <Button
                mode="contained"
                onPress={handleClearMarketCache}
                style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                icon="refresh"
              >
                {t('clearCache')}
              </Button>

              <Button
                mode="contained"
                onPress={handleClearData}
                style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                icon="delete"
              >
                {t('clearAllData')}
              </Button>
            </View>

            <Text variant="bodySmall" style={styles.dataManagementNote}>
              {t('dataManagementDescription')}
            </Text>
          </Card.Content>
        </Card>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            icon="content-save"
          >
            {t('saveSettings')}
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
  },
  subtitle: {
    color: '#6b7280',
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
  },
  menuButton: {
    minWidth: 120,
  },
  divider: {
    marginVertical: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  dataManagementNote: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  saveContainer: {
    padding: 16,
  },
  saveButton: {
    paddingVertical: 8,
  },
});