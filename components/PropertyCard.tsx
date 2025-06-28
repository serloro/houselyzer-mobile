import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Card, IconButton, Chip, Button } from 'react-native-paper';
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

  return (
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
                onPress={() => {}}
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
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  topActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 2,
  },
  mapButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  viewButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 12,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  priceIndicator: {
    fontSize: 20,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  address: {
    marginLeft: 4,
    color: '#6b7280',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  agentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  daysOnMarket: {
    fontSize: 14,
    color: '#6b7280',
  },
  featuresContainer: {
    marginTop: 8,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  featureChip: {
    marginRight: 4,
    marginBottom: 4,
  },
});