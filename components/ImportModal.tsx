import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { Property } from '@/types';

interface ImportModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: (property: Property) => void;
}

export function ImportModal({ visible, onDismiss, onSuccess }: ImportModalProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate property import from URL
      // In a real app, this would make an API call to extract property data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock property data
      const mockProperty: Property = {
        id: Date.now().toString(),
        title: 'Imported Property',
        address: '123 Main Street',
        neighborhood: 'Downtown',
        price: 450000,
        sqft: 1800,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: 'house',
        yearBuilt: 2010,
        lotSize: 0.25,
        images: [
          'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        description: 'Beautiful property imported from URL',
        features: ['Hardwood Floors', 'Updated Kitchen', 'Garage'],
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pricePerSqft: 250,
        daysOnMarket: 15,
        propertyTax: 5400,
        hoaFees: 0,
        walkScore: 85,
        schoolRating: 8,
        crimeRating: 'Low',
        floodRisk: 'Minimal',
        marketTrend: 'Stable',
        comparableProperties: [],
        investmentMetrics: {
          capRate: 0,
          cashFlow: 0,
          roi: 0,
          appreciation: 0
        }
      };

      onSuccess(mockProperty);
      setUrl('');
      onDismiss();
    } catch (error) {
      Alert.alert('Error', 'Failed to import property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUrl('');
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Import Property from URL
          </Text>
          
          <Text variant="bodyMedium" style={styles.description}>
            Enter a property listing URL to automatically import property details.
          </Text>

          <TextInput
            label="Property URL"
            value={url}
            onChangeText={setUrl}
            mode="outlined"
            style={styles.input}
            placeholder="https://example.com/property/123"
            disabled={isLoading}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.button}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleImport}
              style={styles.button}
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                'Import'
              )}
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    elevation: 5,
  },
  content: {
    padding: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#6b7280',
  },
  input: {
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});