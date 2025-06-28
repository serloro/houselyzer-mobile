import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Card, IconButton, Chip, Button, TextInput, Modal, Portal, SegmentedButtons, Text } from 'react-native-paper';
import { MapPin, Heart, Edit, Trash2, Eye, Map } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { Property } from '@/types';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { useTranslation } from '@/utils/translations';

interface PropertyCardProps {
  property: Property;
  showFavoriteButton?: boolean;
  showEditButton?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  showFavoriteButton = true,
  showEditButton = false
}) => {
  const { toggleFavorite, deleteProperty, updateProperty, settings } = useStore();
  const t = useTranslation(settings.language);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property>(property);

  const handleFavoritePress = () => {
    toggleFavorite(property.id);
  };

  const handleDeletePress = () => {
    Alert.alert(
      t('deletePropertyConfirm'),
      `${t('deletePropertyWarning')} "${property.title}"? ${t('deletePropertyDescription')}`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => deleteProperty(property.id),
        },
      ]
    );
  };

  const handleEditPress = () => {
    setEditingProperty(property);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    updateProperty(property.id, editingProperty);
    setEditModalVisible(false);
    Alert.alert('Éxito', 'Propiedad actualizada correctamente');
  };

  const handleCancelEdit = () => {
    setEditingProperty(property);
    setEditModalVisible(false);
  };

  const handleMapPress = async () => {
    if (property.mapUrl) {
      await WebBrowser.openBrowserAsync(property.mapUrl);
    }
  };

  const handlePriceIndicatorPress = () => {
    let newIndicator: 'good' | 'expensive' | null = null;
    
    if (!property.priceIndicator) {
      newIndicator = 'good';
    } else if (property.priceIndicator === 'good') {
      newIndicator = 'expensive';
    } else {
      newIndicator = null;
    }
    
    updateProperty(property.id, { priceIndicator: newIndicator });
  };

  const getPriceIndicatorDisplay = () => {
    if (!property.priceIndicator) return null;
    
    if (property.priceIndicator === 'good') {
      return { 
        type: 'good', 
        color: '#10b981',
        label: t('goodPrice')
      };
    } else {
      return { 
        type: 'expensive', 
        color: '#ef4444',
        label: t('expensive')
      };
    }
  };

  const priceIndicatorDisplay = getPriceIndicatorDisplay();

  const propertyTypeOptions = [
    { value: 'house', label: t('house') },
    { value: 'condo', label: t('condo') },
    { value: 'townhouse', label: t('townhouse') },
    { value: 'apartment', label: t('apartment') },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
  ];

  return (
    <>
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: property.imageUrl }} style={styles.image} />
          
          <View style={styles.topBadges}>
            <Chip mode="flat" style={[styles.chip, { backgroundColor: '#2563eb' }]} textStyle={{ color: 'white' }}>
              {t(property.propertyType)}
            </Chip>
            <Chip 
              mode="flat" 
              style={[styles.chip, { backgroundColor: property.currency === 'EUR' ? '#10b981' : '#8b5cf6' }]} 
              textStyle={{ color: 'white' }}
            >
              {property.currency}
            </Chip>
            {priceIndicatorDisplay && (
              <Chip 
                mode="flat" 
                style={[styles.chip, { backgroundColor: priceIndicatorDisplay.color }]} 
                textStyle={{ color: 'white' }}
              >
                {priceIndicatorDisplay.label}
              </Chip>
            )}
          </View>

          <View style={styles.topActions}>
            {showEditButton && (
              <>
                <IconButton
                  icon={() => <Edit size={20} color="#2563eb" />}
                  style={styles.actionButton}
                  onPress={handleEditPress}
                />
                <IconButton
                  icon={() => <Trash2 size={20} color="#ef4444" />}
                  style={styles.actionButton}
                  onPress={handleDeletePress}
                />
              </>
            )}
            {showFavoriteButton && (
              <IconButton
                icon={() => <Heart size={20} color={property.isFavorite ? "#ef4444" : "#6b7280"} fill={property.isFavorite ? "#ef4444" : "none"} />}
                style={styles.actionButton}
                onPress={handleFavoritePress}
              />
            )}
          </View>

          <View style={styles.bottomActions}>
            {property.mapUrl && (
              <Button
                mode="contained"
                compact
                style={styles.mapButton}
                labelStyle={styles.mapButtonText}
                icon={() => <Map size={16} color="white" />}
                onPress={handleMapPress}
              >
                {t('map')}
              </Button>
            )}
            <Button
              mode="contained"
              compact
              style={styles.viewButton}
              labelStyle={styles.viewButtonText}
              icon={() => <Eye size={16} color="white" />}
              onPress={() => {}}
            >
              {t('viewDetails')}
            </Button>
          </View>
        </View>

        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {formatCurrency(property.price, property.currency)}
              </Text>
              <TouchableOpacity onPress={handlePriceIndicatorPress}>
                <Text style={styles.priceIndicator}>💰</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.addressContainer}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.address} numberOfLines={1}>{property.address}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{property.bedrooms}</Text>
              <Text style={styles.statLabel}>{t('bedrooms')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{property.bathrooms}</Text>
              <Text style={styles.statLabel}>{t('bathrooms')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatNumber(property.sqft)}</Text>
              <Text style={styles.statLabel}>{t('sqft')}</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailText}>{t('builtYear')} {property.yearBuilt}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailText}>
                {formatCurrency(property.pricePerSqft, property.currency)}{t('perSqft')}
              </Text>
            </View>
          </View>

          <View style={styles.agentContainer}>
            <View style={styles.agentInfo}>
              <Text style={styles.agentText}>{property.listingAgent}</Text>
            </View>
            <Text style={styles.daysOnMarket}>
              {property.daysOnMarket} {property.daysOnMarket === 1 ? t('day') : t('days')} {t('onMarket')}
            </Text>
          </View>

          {property.features && property.features.length > 0 && (
            <View style={styles.featuresContainer}>
              <View style={styles.featuresRow}>
                {property.features.slice(0, 3).map((feature, index) => (
                  <Chip key={index} mode="outlined" compact style={styles.featureChip}>
                    {feature}
                  </Chip>
                ))}
                {property.features.length > 3 && (
                  <Chip mode="outlined" compact style={styles.featureChip}>
                    +{property.features.length - 3} {t('more')}
                  </Chip>
                )}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Edit Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={handleCancelEdit}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView style={styles.modalScroll}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {t('editProperty')}
            </Text>

            <TextInput
              label={t('propertyTitle')}
              value={editingProperty.title}
              onChangeText={(text) => setEditingProperty({...editingProperty, title: text})}
              mode="outlined"
              style={styles.modalInput}
            />

            <TextInput
              label={t('address')}
              value={editingProperty.address}
              onChangeText={(text) => setEditingProperty({...editingProperty, address: text})}
              mode="outlined"
              style={styles.modalInput}
            />

            <View style={styles.modalRow}>
              <TextInput
                label={t('price')}
                value={editingProperty.price.toString()}
                onChangeText={(text) => setEditingProperty({...editingProperty, price: Number(text) || 0})}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.modalInput, styles.halfWidth]}
              />
              <View style={[styles.modalInput, styles.halfWidth]}>
                <Text variant="bodySmall" style={styles.modalLabel}>{t('currency')}</Text>
                <SegmentedButtons
                  value={editingProperty.currency}
                  onValueChange={(value) => setEditingProperty({...editingProperty, currency: value as 'USD' | 'EUR'})}
                  buttons={currencyOptions}
                />
              </View>
            </View>

            <View style={styles.modalRow}>
              <TextInput
                label={t('bedrooms')}
                value={editingProperty.bedrooms.toString()}
                onChangeText={(text) => setEditingProperty({...editingProperty, bedrooms: Number(text) || 0})}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.modalInput, styles.halfWidth]}
              />
              <TextInput
                label={t('bathrooms')}
                value={editingProperty.bathrooms.toString()}
                onChangeText={(text) => setEditingProperty({...editingProperty, bathrooms: Number(text) || 0})}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.modalInput, styles.halfWidth]}
              />
            </View>

            <View style={styles.modalRow}>
              <TextInput
                label={t('squareFeet')}
                value={editingProperty.sqft.toString()}
                onChangeText={(text) => setEditingProperty({...editingProperty, sqft: Number(text) || 0})}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.modalInput, styles.halfWidth]}
              />
              <TextInput
                label={t('yearBuilt')}
                value={editingProperty.yearBuilt.toString()}
                onChangeText={(text) => setEditingProperty({...editingProperty, yearBuilt: Number(text) || 0})}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.modalInput, styles.halfWidth]}
              />
            </View>

            <View style={styles.modalInput}>
              <Text variant="bodySmall" style={styles.modalLabel}>{t('propertyType')}</Text>
              <SegmentedButtons
                value={editingProperty.propertyType}
                onValueChange={(value) => setEditingProperty({...editingProperty, propertyType: value as any})}
                buttons={propertyTypeOptions}
              />
            </View>

            <TextInput
              label={t('imageUrl')}
              value={editingProperty.imageUrl}
              onChangeText={(text) => setEditingProperty({...editingProperty, imageUrl: text})}
              mode="outlined"
              style={styles.modalInput}
            />

            <TextInput
              label={t('description')}
              value={editingProperty.description}
              onChangeText={(text) => setEditingProperty({...editingProperty, description: text})}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.modalInput}
            />

            <TextInput
              label={t('neighborhood')}
              value={editingProperty.neighborhood}
              onChangeText={(text) => setEditingProperty({...editingProperty, neighborhood: text})}
              mode="outlined"
              style={styles.modalInput}
            />

            <TextInput
              label={t('listingAgent')}
              value={editingProperty.listingAgent}
              onChangeText={(text) => setEditingProperty({...editingProperty, listingAgent: text})}
              mode="outlined"
              style={styles.modalInput}
            />

            <TextInput
              label={t('daysOnMarket')}
              value={editingProperty.daysOnMarket.toString()}
              onChangeText={(text) => setEditingProperty({...editingProperty, daysOnMarket: Number(text) || 0})}
              keyboardType="numeric"
              mode="outlined"
              style={styles.modalInput}
            />

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={handleCancelEdit}
                style={styles.modalButton}
              >
                {t('cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveEdit}
                style={styles.modalButton}
              >
                {t('saveChanges')}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 4,
    elevation: 4,
    flex: 1,
    minWidth: 250,
    maxWidth: 400,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  topActions: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    marginRight: 2,
    marginBottom: 2,
    height: 24,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 1,
    width: 32,
    height: 32,
  },
  mapButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    height: 28,
  },
  viewButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    height: 28,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 10,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 10,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  priceIndicator: {
    fontSize: 18,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    marginLeft: 4,
    color: '#6b7280',
    flex: 1,
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  agentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  daysOnMarket: {
    fontSize: 12,
    color: '#6b7280',
  },
  featuresContainer: {
    marginTop: 6,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  featureChip: {
    marginRight: 4,
    marginBottom: 4,
    height: 24,
    paddingHorizontal: 8,
  },
  // Modal styles
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalScroll: {
    padding: 20,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  modalLabel: {
    marginBottom: 8,
    color: '#6b7280',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});