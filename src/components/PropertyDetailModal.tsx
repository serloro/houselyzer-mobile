import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
import { Modal, Portal, Text, Button, Chip, Card, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Property } from '../types';
import { useStore } from '../store/useStore';
import { formatCurrency, formatNumber, calculateMortgage } from '../utils/calculations';
import { useTranslation } from '../utils/translations';

interface PropertyDetailModalProps {
  property: Property;
  visible: boolean;
  onDismiss: () => void;
}

const { width } = Dimensions.get('window');

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  visible,
  onDismiss,
}) => {
  const { settings } = useStore();
  const t = useTranslation(settings.language);
  const [activeTab, setActiveTab] = useState<'overview' | 'mortgage'>('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const allImages = [property.imageUrl, ...(property.additionalImages || [])];

  const mortgageScenarios = [
    { name: 'Conservative (20% down)', downPayment: 20, rate: property.currency === 'EUR' ? 2.5 : 6.5, term: 30 },
    { name: 'Moderate (15% down)', downPayment: 15, rate: property.currency === 'EUR' ? 2.75 : 6.75, term: 30 },
    { name: 'Aggressive (10% down)', downPayment: 10, rate: property.currency === 'EUR' ? 3.0 : 7.0, term: 30 },
  ].map(scenario => ({
    ...scenario,
    calculation: calculateMortgage(property.price, scenario.downPayment, scenario.rate, scenario.term, 6000, 1200)
  }));

  const handleMapPress = async () => {
    if (property.mapUrl) {
      await WebBrowser.openBrowserAsync(property.mapUrl);
    }
  };

  const handleVirtualTourPress = async () => {
    if (property.virtualTourUrl) {
      await WebBrowser.openBrowserAsync(property.virtualTourUrl);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text variant="headlineSmall" style={styles.title} numberOfLines={2}>
              {property.title}
            </Text>
            <View style={styles.priceContainer}>
              <Text variant="headlineMedium" style={styles.price}>
                {formatCurrency(property.price, property.currency)}
              </Text>
              <Chip mode="flat" style={[styles.currencyChip, { 
                backgroundColor: property.currency === 'EUR' ? '#10b981' : '#8b5cf6' 
              }]}>
                {property.currency}
              </Chip>
            </View>
          </View>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <View style={styles.tabContainer}>
          <Button
            mode={activeTab === 'overview' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('overview')}
            style={styles.tabButton}
          >
            {t('overview')}
          </Button>
          <Button
            mode={activeTab === 'mortgage' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('mortgage')}
            style={styles.tabButton}
          >
            {t('mortgageOptions')}
          </Button>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'overview' && (
            <View>
              {/* Image Gallery */}
              <View style={styles.imageContainer}>
                <Image source={{ uri: allImages[selectedImageIndex] }} style={styles.mainImage} />
                {property.virtualTourUrl && (
                  <Button
                    mode="contained"
                    style={styles.virtualTourButton}
                    onPress={handleVirtualTourPress}
                    icon="play"
                  >
                    Tour Virtual
                  </Button>
                )}
              </View>

              {allImages.length > 1 && (
                <ScrollView horizontal style={styles.thumbnailContainer} showsHorizontalScrollIndicator={false}>
                  {allImages.map((imageUrl, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImageIndex(index)}
                      style={[
                        styles.thumbnail,
                        selectedImageIndex === index && styles.selectedThumbnail
                      ]}
                    >
                      <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Property Stats */}
              <Card style={styles.statsCard}>
                <Card.Content>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text variant="headlineSmall" style={styles.statValue}>{property.bedrooms}</Text>
                      <Text variant="bodySmall" style={styles.statLabel}>{t('bedrooms')}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text variant="headlineSmall" style={styles.statValue}>{property.bathrooms}</Text>
                      <Text variant="bodySmall" style={styles.statLabel}>{t('bathrooms')}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text variant="headlineSmall" style={styles.statValue}>{formatNumber(property.sqft)}</Text>
                      <Text variant="bodySmall" style={styles.statLabel}>{t('sqft')}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text variant="headlineSmall" style={styles.statValue}>{property.yearBuilt}</Text>
                      <Text variant="bodySmall" style={styles.statLabel}>{t('yearBuilt')}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              {/* Property Details */}
              <Card style={styles.detailsCard}>
                <Card.Content>
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium" style={styles.detailLabel}>{t('propertyType')}:</Text>
                    <Text variant="bodyMedium" style={styles.detailValue}>{t(property.propertyType)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium" style={styles.detailLabel}>{t('neighborhood')}:</Text>
                    <Text variant="bodyMedium" style={styles.detailValue}>{property.neighborhood}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium" style={styles.detailLabel}>{t('listingAgent')}:</Text>
                    <Text variant="bodyMedium" style={styles.detailValue}>{property.listingAgent}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text variant="bodyMedium" style={styles.detailLabel}>{t('daysOnMarket')}:</Text>
                    <Text variant="bodyMedium" style={styles.detailValue}>{property.daysOnMarket} {t('days')}</Text>
                  </View>
                </Card.Content>
              </Card>

              {/* Description */}
              <Card style={styles.descriptionCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionTitle}>{t('description')}</Text>
                  <Text variant="bodyMedium" style={styles.description}>{property.description}</Text>
                </Card.Content>
              </Card>

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <Card style={styles.featuresCard}>
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.sectionTitle}>{t('features')}</Text>
                    <View style={styles.featuresContainer}>
                      {property.features.map((feature, index) => (
                        <Chip key={index} mode="outlined" style={styles.featureChip}>
                          {feature}
                        </Chip>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              )}

              {/* Map Button */}
              {property.mapUrl && (
                <Button
                  mode="contained"
                  style={styles.mapButton}
                  onPress={handleMapPress}
                  icon="map"
                >
                  {t('viewOnMap')}
                </Button>
              )}
            </View>
          )}

          {activeTab === 'mortgage' && (
            <View>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                {t('mortgageProposals')} ({property.currency})
              </Text>
              
              {mortgageScenarios.map((scenario, index) => (
                <Card key={index} style={styles.mortgageCard}>
                  <Card.Content>
                    <View style={styles.mortgageHeader}>
                      <Text variant="titleMedium">{scenario.name}</Text>
                      <View style={styles.mortgageDetails}>
                        <Text variant="bodySmall">{scenario.downPayment}% down</Text>
                        <Text variant="bodySmall">{scenario.rate}% rate</Text>
                        <Text variant="bodySmall">{scenario.term} years</Text>
                      </View>
                    </View>

                    <View style={styles.mortgageStats}>
                      <View style={styles.mortgageStat}>
                        <Text variant="bodySmall" style={styles.mortgageStatLabel}>{t('monthlyPayment')}:</Text>
                        <Text variant="titleMedium" style={styles.mortgageStatValue}>
                          {formatCurrency(scenario.calculation.monthlyPayment, property.currency)}
                        </Text>
                      </View>
                      <View style={styles.mortgageStat}>
                        <Text variant="bodySmall" style={styles.mortgageStatLabel}>{t('downPayment')}:</Text>
                        <Text variant="bodyMedium" style={styles.mortgageStatValue}>
                          {formatCurrency(scenario.calculation.downPayment, property.currency)}
                        </Text>
                      </View>
                      <View style={styles.mortgageStat}>
                        <Text variant="bodySmall" style={styles.mortgageStatLabel}>{t('totalInterest')}:</Text>
                        <Text variant="bodyMedium" style={styles.mortgageStatValue}>
                          {formatCurrency(scenario.calculation.totalInterest, property.currency)}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    maxHeight: '95%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  currencyChip: {
    alignSelf: 'flex-start',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  virtualTourButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  thumbnailContainer: {
    marginBottom: 16,
  },
  thumbnail: {
    marginRight: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  thumbnailImage: {
    width: 60,
    height: 45,
    resizeMode: 'cover',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6b7280',
    marginTop: 4,
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#6b7280',
  },
  detailValue: {
    fontWeight: '500',
  },
  descriptionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  description: {
    lineHeight: 20,
  },
  featuresCard: {
    marginBottom: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    marginBottom: 4,
  },
  mapButton: {
    marginBottom: 16,
  },
  mortgageCard: {
    marginBottom: 16,
  },
  mortgageHeader: {
    marginBottom: 12,
  },
  mortgageDetails: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  mortgageStats: {
    gap: 8,
  },
  mortgageStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mortgageStatLabel: {
    color: '#6b7280',
  },
  mortgageStatValue: {
    fontWeight: '500',
  },
});