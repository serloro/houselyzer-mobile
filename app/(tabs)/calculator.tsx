import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Text, Card, TextInput, Button, SegmentedButtons, Chip } from 'react-native-paper';
import Slider from '@react-native-community/slider';

// Importaciones con manejo de errores
let useStore: any;
let useTranslation: any;
let calculateMortgage: any;
let formatCurrency: any;

try {
  useStore = require('@/store/useStore').useStore;
} catch (error) {
  console.error('Error importing useStore:', error);
  useStore = () => ({ settings: { currency: 'USD', language: 'es', defaultLoanTerm: 30 } });
}

try {
  useTranslation = require('@/utils/translations').useTranslation;
} catch (error) {
  console.error('Error importing useTranslation:', error);
  useTranslation = () => (key: string) => key;
}

try {
  const calculations = require('@/utils/calculations');
  calculateMortgage = calculations.calculateMortgage;
  formatCurrency = calculations.formatCurrency;
} catch (error) {
  console.error('Error importing calculations:', error);
  calculateMortgage = () => ({ monthlyPayment: 0, loanAmount: 0, totalInterest: 0, totalPayment: 0 });
  formatCurrency = (amount: number) => `$${amount}`;
}

export default function CalculatorTab() {
  console.log('CalculatorTab component rendering...');
  const { width: screenWidth } = useWindowDimensions();
  
  try {
    const { settings } = useStore();
    const t = useTranslation(settings.language);
    
    const [homePrice, setHomePrice] = useState(settings.currency === 'EUR' ? 400000 : 500000);
    const [downPayment, setDownPayment] = useState(20);
    const [loanTerm, setLoanTerm] = useState(settings.defaultLoanTerm);
    const [propertyTax, setPropertyTax] = useState(settings.currency === 'EUR' ? 4000 : 6000);
    const [insurance, setInsurance] = useState(settings.currency === 'EUR' ? 800 : 1200);

    const mortgageTypes = useMemo(() => {
      if (settings.currency === 'EUR') {
        return [
          { 
            id: 'fixed', 
            name: t('fixedMortgage'), 
            rate: 2.50, 
            description: `2,50% ${t('fixedRateDescription')}`,
            color: '#10B981'
          },
          { 
            id: 'variable', 
            name: t('variableMortgage'), 
            rate: 4.12,
            description: `${t('euribor')} + 0,49% (${t('currently')} 4,12%)`,
            color: '#F59E0B'
          },
          { 
            id: 'mixed', 
            name: t('mixedMortgage'), 
            rate: 1.75, 
            description: `1,75% ${t('mixedRateDescription')}`,
            color: '#8B5CF6'
          }
        ];
      } else {
        return [
          { 
            id: 'fixed', 
            name: t('fixedMortgage'), 
            rate: 6.50, 
            description: `6.50% ${t('fixedRateDescription')}`,
            color: '#10B981'
          },
          { 
            id: 'variable', 
            name: t('variableMortgage'), 
            rate: 6.25, 
            description: `${t('variableRateDescription')} 6.25%`,
            color: '#F59E0B'
          },
          { 
            id: 'mixed', 
            name: t('mixedMortgage'), 
            rate: 5.75, 
            description: `5.75% ${t('mixedRateDescription')}`,
            color: '#8B5CF6'
          }
        ];
      }
    }, [settings.currency, t]);

    const [selectedMortgageType, setSelectedMortgageType] = useState(mortgageTypes[0].id);

    const currentMortgageType = mortgageTypes.find(mt => mt.id === selectedMortgageType) || mortgageTypes[0];

    const mortgageCalculations = useMemo(() => {
      return mortgageTypes.map(type => ({
        ...type,
        calculation: calculateMortgage(
          homePrice,
          downPayment,
          type.rate,
          loanTerm,
          propertyTax,
          insurance
        )
      }));
    }, [homePrice, downPayment, loanTerm, propertyTax, insurance, mortgageTypes]);

    const selectedCalculation = mortgageCalculations.find(mc => mc.id === selectedMortgageType)?.calculation;

    const loanTermOptions = [
      { value: '15', label: `15 ${t('years')}` },
      { value: '20', label: `20 ${t('years')}` },
      { value: '25', label: `25 ${t('years')}` },
      { value: '30', label: `30 ${t('years')}` },
    ];

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text variant="bodyMedium" style={styles.subtitle}>{t('calculatePayments')}</Text>
        </View>

        {/* Input Form */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('loanDetails')}</Text>
            
            <TextInput
              label={t('homePrice')}
              value={homePrice.toString()}
              onChangeText={(text) => setHomePrice(Number(text) || 0)}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="currency-usd" />}
            />

            <View style={styles.sliderContainer}>
              <Text variant="bodyMedium" style={styles.sliderLabel}>
                {t('downPayment')} ({downPayment}%)
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={30}
                step={0.5}
                value={downPayment}
                onValueChange={setDownPayment}
                minimumTrackTintColor="#2563eb"
                maximumTrackTintColor="#e5e7eb"
              />
              <Text variant="bodySmall" style={styles.sliderValue}>
                {formatCurrency((homePrice * downPayment) / 100, settings.currency)}
              </Text>
            </View>

            <View style={styles.segmentedContainer}>
              <Text variant="bodyMedium" style={styles.sectionLabel}>
                {t('loanTerm')} ({t('years')})
              </Text>
              <SegmentedButtons
                value={loanTerm.toString()}
                onValueChange={(value) => setLoanTerm(Number(value))}
                buttons={loanTermOptions}
                style={styles.segmentedButtons}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label={`${t('propertyTax')} (${t('annual')})`}
                value={propertyTax.toString()}
                onChangeText={(text) => setPropertyTax(Number(text) || 0)}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, styles.halfWidth]}
              />
              <TextInput
                label={`${t('insurance')} (${t('annual')})`}
                value={insurance.toString()}
                onChangeText={(text) => setInsurance(Number(text) || 0)}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, styles.halfWidth]}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Results */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('monthlyPayment')}</Text>
            <View style={styles.resultContainer}>
              <Text variant="displaySmall" style={styles.monthlyPayment}>
                {selectedCalculation ? formatCurrency(selectedCalculation.monthlyPayment, settings.currency) : '---'}
              </Text>
              <Text variant="bodyMedium" style={styles.resultSubtitle}>{t('totalMonthlyPayment')}</Text>
              <Text variant="bodySmall" style={styles.resultDetails}>
                {currentMortgageType.name} • {currentMortgageType.rate}% TIN
              </Text>
            </View>
          </Card.Content>
        </Card>

        {selectedCalculation && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>{t('loanSummary')}</Text>
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>{t('loanAmount')}:</Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {formatCurrency(selectedCalculation.loanAmount, settings.currency)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>{t('totalInterest')}:</Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {formatCurrency(selectedCalculation.totalInterest, settings.currency)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>{t('totalPayment')}:</Text>
                  <Text variant="bodyMedium" style={styles.summaryValue}>
                    {formatCurrency(selectedCalculation.totalPayment, settings.currency)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    );
  } catch (error) {
    console.error('Error in CalculatorTab:', error);
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall" style={styles.errorTitle}>Error en la Calculadora</Text>
        <Text variant="bodyMedium" style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'Error desconocido'}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  sectionLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  halfWidth: {
    flex: 1,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 4,
  },
  segmentedContainer: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  monthlyPayment: {
    color: '#2563eb',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultSubtitle: {
    color: '#6b7280',
    marginBottom: 4,
  },
  resultDetails: {
    color: '#6b7280',
  },
  summaryContainer: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#6b7280',
  },
  summaryValue: {
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    marginBottom: 16,
    color: '#dc2626',
  },
  errorMessage: {
    textAlign: 'center',
    color: '#6b7280',
  },
});