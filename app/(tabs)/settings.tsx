import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Switch, Button, Menu, Divider, Snackbar } from 'react-native-paper';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/utils/translations';

export default function SettingsTab() {
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

        {/* Data Management */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('dataManagement')}</Text>
            
            <View style={styles.buttonGrid}>
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
}

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