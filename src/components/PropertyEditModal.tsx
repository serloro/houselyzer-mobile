import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, Chip, SegmentedButtons } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Property } from '../types';
import { useStore } from '../store/useStore';
import { useTranslation } from '../utils/translations';

interface PropertyEditModalProps {
  property: Property;
  visible: boolean;
  onDismiss: () => void;
}

export const PropertyEditModal: React.FC<PropertyEditModalProps> = ({
  property,
  visible,
  onDismiss,
}) => {
  const { updateProperty, settings } = useStore();
  const t = useTranslation(settings.language);
  const [formData, setFormData] = useState({
    title: property.title,
    address: property.address,
    price: property.price.toString(),
    currency: property.currency,
    bedrooms: property.bedrooms.toString(),
    bathrooms: property.bathrooms.toString(),
    sqft: property.sqft.toString(),
    yearBuilt: property.yearBuilt.toString(),
    propertyType: property.propertyType,
    description: property.description,
    features: property.features.join(', '),
    neighborhood: property.neighborhood,
    listingAgent: property.listingAgent,
    imageUrl: property.imageUrl,
    mapUrl: property.mapUrl || '',
    priceIndicator: property.priceIndicator || null,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);

    const updatedProperty = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseFloat(formData.bathrooms) || 0,
      sqft: parseInt(formData.sqft) || 0,
      yearBuilt: parseInt(formData.yearBuilt) || 2000,
      features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      pricePerSqft: Math.round((parseFloat(formData.price) || 0) / (parseInt(formData.sqft) || 1)),
      mapUrl: formData.mapUrl.trim() || null,
      priceIndicator: formData.priceIndicator,
    };

    updateProperty(property.id, updatedProperty);
    
    setTimeout(() => {
      setIsSaving(false);
      onDismiss();
    }, 500);
  };

  const priceIndicatorOptions = [
    { value: '', label: t('noPriceIndicator') },
    { value: 'good', label: t('goodPrice') },
    { value: 'expensive', label: t('expensive') },
  ];

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <ScrollView style={styles.scrollView}>
          <Text variant="headlineSmall" style={styles.title}>{t('editProperty')}</Text>
          
          <TextInput
            label={t('propertyTitle')}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label={t('address')}
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
            style={styles.input}
            mode="outlined"
            multiline
          />

          <View style={styles.row}>
            <TextInput
              label={t('price')}
              value={formData.price}
              onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
              style={[styles.input, styles.halfWidth]}
              mode="outlined"
              keyboardType="numeric"
            />

            <View style={[styles.halfWidth, styles.pickerContainer]}>
              <Text variant="bodySmall" style={styles.pickerLabel}>{t('currency')}</Text>
              <Picker
                selectedValue={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                style={styles.picker}
              >
                <Picker.Item label="USD ($)" value="USD" />
                <Picker.Item label="EUR (€)" value="EUR" />
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              label={t('bedrooms')}
              value={formData.bedrooms}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bedrooms: text }))}
              style={[styles.input, styles.halfWidth]}
              mode="outlined"
              keyboardType="numeric"
            />

            <TextInput
              label={t('bathrooms')}
              value={formData.bathrooms}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bathrooms: text }))}
              style={[styles.input, styles.halfWidth]}
              mode="outlined"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label={t('squareFeet')}
              value={formData.sqft}
              onChangeText={(text) => setFormData(prev => ({ ...prev, sqft: text }))}
              style={[styles.input, styles.halfWidth]}
              mode="outlined"
              keyboardType="numeric"
            />

            <TextInput
              label={t('yearBuilt')}
              value={formData.yearBuilt}
              onChangeText={(text) => setFormData(prev => ({ ...prev, yearBuilt: text }))}
              style={[styles.input, styles.halfWidth]}
              mode="outlined"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.pickerContainer}>
            <Text variant="bodySmall" style={styles.pickerLabel}>{t('propertyType')}</Text>
            <Picker
              selectedValue={formData.propertyType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
              style={styles.picker}
            >
              <Picker.Item label={t('house')} value="house" />
              <Picker.Item label={t('condo')} value="condo" />
              <Picker.Item label={t('townhouse')} value="townhouse" />
              <Picker.Item label={t('apartment')} value="apartment" />
            </Picker>
          </View>

          <TextInput
            label={t('neighborhood')}
            value={formData.neighborhood}
            onChangeText={(text) => setFormData(prev => ({ ...prev, neighborhood: text }))}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label={t('listingAgent')}
            value={formData.listingAgent}
            onChangeText={(text) => setFormData(prev => ({ ...prev, listingAgent: text }))}
            style={styles.input}
            mode="outlined"
          />

          <View style={styles.priceIndicatorContainer}>
            <Text variant="bodySmall" style={styles.pickerLabel}>{t('priceIndicator')}</Text>
            <SegmentedButtons
              value={formData.priceIndicator || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priceIndicator: value || null }))}
              buttons={priceIndicatorOptions}
              style={styles.segmentedButtons}
            />
          </View>

          <TextInput
            label={t('imageUrl')}
            value={formData.imageUrl}
            onChangeText={(text) => setFormData(prev => ({ ...prev, imageUrl: text }))}
            style={styles.input}
            mode="outlined"
            placeholder="https://example.com/image.jpg"
          />

          <TextInput
            label={`${t('mapUrl')} (${t('optional')})`}
            value={formData.mapUrl}
            onChangeText={(text) => setFormData(prev => ({ ...prev, mapUrl: text }))}
            style={styles.input}
            mode="outlined"
            placeholder="https://maps.google.com/..."
          />

          <TextInput
            label={t('featuresCommaSeparated')}
            value={formData.features}
            onChangeText={(text) => setFormData(prev => ({ ...prev, features: text }))}
            style={styles.input}
            mode="outlined"
            placeholder="Garage, Garden, Modern Kitchen, Fireplace"
            multiline
          />

          <TextInput
            label={t('description')}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
            placeholder={t('describeProperty')}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.button}
            >
              {t('cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSaving}
              disabled={isSaving}
              style={styles.button}
            >
              {isSaving ? t('saving') : t('saveChanges')}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  scrollView: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
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
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    marginBottom: 4,
    color: '#666',
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  priceIndicatorContainer: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});