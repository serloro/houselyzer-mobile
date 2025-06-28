import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Searchbar, Button, Menu, Chip, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { useTranslation } from '../utils/translations';
import { PropertyCard } from '../components/PropertyCard';

export const Properties: React.FC = () => {
  const {
    properties,
    searchTerm,
    filterType,
    sortBy,
    setSearchTerm,
    setFilterType,
    setSortBy,
    isLoading,
    error,
    settings,
  } = useStore();

  const t = useTranslation(settings.language);
  const [favoriteFilter, setFavoriteFilter] = useState('all');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const propertyTypes = [
    { value: 'all', label: t('allTypes') },
    { value: 'house', label: t('house') },
    { value: 'condo', label: t('condo') },
    { value: 'townhouse', label: t('townhouse') },
    { value: 'apartment', label: t('apartment') },
  ];

  const sortOptions = [
    { value: 'price-desc', label: t('priceHighToLow') },
    { value: 'price-asc', label: t('priceLowToHigh') },
    { value: 'sqft-desc', label: t('sizeHighToLow') },
    { value: 'sqft-asc', label: t('sizeLowToHigh') },
    { value: 'newest', label: t('newest') },
    { value: 'oldest', label: t('oldest') },
  ];

  const filterOptions = [
    { value: 'all', label: t('allProperties') },
    { value: 'favorites', label: t('onlyFavorites') },
  ];

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = properties.filter((property) => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || property.propertyType === filterType;
      const matchesFavorite = favoriteFilter === 'all' || (favoriteFilter === 'favorites' && property.isFavorite);
      return matchesSearch && matchesType && matchesFavorite;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-desc':
          return b.price - a.price;
        case 'price-asc':
          return a.price - b.price;
        case 'sqft-desc':
          return b.sqft - a.sqft;
        case 'sqft-asc':
          return a.sqft - b.sqft;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [properties, searchTerm, filterType, sortBy, favoriteFilter]);

  const favoritesCount = properties.filter(p => p.isFavorite).length;

  const handleImportPress = () => {
    Alert.alert(
      t('importFromUrl'),
      'Import functionality will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="bodyMedium" style={styles.subtitle}>{t('manageAnalyze')}</Text>
        {favoritesCount > 0 && (
          <View style={styles.favoritesInfo}>
            <Ionicons name="heart" size={16} color="#ef4444" />
            <Text variant="bodySmall" style={styles.favoritesText}>
              {favoritesCount} {favoritesCount === 1 ? t('favorite') : t('favorites')}
            </Text>
          </View>
        )}
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('processingImport')}</Text>
        </View>
      )}

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('searchProperties')}
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchbar}
        />
        
        <View style={styles.filtersRow}>
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setFilterMenuVisible(true)}
                icon="filter"
                style={styles.filterButton}
              >
                {propertyTypes.find(t => t.value === filterType)?.label}
              </Button>
            }
          >
            {propertyTypes.map((type) => (
              <Menu.Item
                key={type.value}
                onPress={() => {
                  setFilterType(type.value);
                  setFilterMenuVisible(false);
                }}
                title={type.label}
              />
            ))}
          </Menu>

          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setSortMenuVisible(true)}
                icon="sort"
                style={styles.filterButton}
              >
                {sortOptions.find(s => s.value === sortBy)?.label}
              </Button>
            }
          >
            {sortOptions.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  setSortBy(option.value);
                  setSortMenuVisible(false);
                }}
                title={option.label}
              />
            ))}
          </Menu>
        </View>

        <View style={styles.favoriteFilters}>
          {filterOptions.map((option) => (
            <Chip
              key={option.value}
              selected={favoriteFilter === option.value}
              onPress={() => setFavoriteFilter(option.value)}
              style={styles.favoriteChip}
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text variant="bodyMedium" style={styles.resultsText}>
          {filteredAndSortedProperties.length} {filteredAndSortedProperties.length === 1 ? t('propertyFound') : t('propertiesFound')}
          {favoriteFilter === 'favorites' && ` (${t('favorites')})`}
        </Text>
      </View>

      {filteredAndSortedProperties.length > 0 ? (
        <ScrollView style={styles.propertiesList} showsVerticalScrollIndicator={false}>
          {filteredAndSortedProperties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              showEditButton={true}
              showFavoriteButton={true}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color="#9ca3af" />
          <Text variant="titleMedium" style={styles.emptyTitle}>{t('noPropertiesFound')}</Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            {t('adjustSearchCriteria')}
          </Text>
          <Button
            mode="contained"
            onPress={handleImportPress}
            style={styles.importButton}
            icon="link"
          >
            {t('importProperty')}
          </Button>
        </View>
      )}

      <FAB
        icon="link"
        style={styles.fab}
        onPress={handleImportPress}
        label={t('importFromUrl')}
      />
    </View>
  );
};

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
    marginBottom: 8,
  },
  favoritesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  favoritesText: {
    color: '#2563eb',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
  },
  loadingContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  loadingText: {
    color: '#1d4ed8',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchbar: {
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
  },
  favoriteFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  favoriteChip: {
    flex: 1,
  },
  resultsHeader: {
    padding: 16,
    backgroundColor: 'white',
  },
  resultsText: {
    color: '#6b7280',
  },
  propertiesList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  importButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});