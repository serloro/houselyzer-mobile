import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert, FlatList, Dimensions, useWindowDimensions } from 'react-native';
import { Text, Searchbar, Button, Menu, Chip, FAB, Snackbar } from 'react-native-paper';
import { Heart, Zap } from 'lucide-react-native';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/utils/translations';
import { PropertyCard } from '@/components/PropertyCard';
import { ImportModal } from '@/components/ImportModal';
import { Property } from '@/types';

// Environment variables (these would be set in your Expo app)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export default function PropertiesTab() {
  const {
    properties,
    searchTerm,
    filterType,
    sortBy,
    setSearchTerm,
    setFilterType,
    setSortBy,
    addProperty,
    isLoading,
    error,
    settings,
  } = useStore();

  const t = useTranslation(settings.language);
  const { width: screenWidth } = useWindowDimensions();
  const [favoriteFilter, setFavoriteFilter] = useState('all');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Calcular número de columnas basado en el ancho de pantalla
  const getNumColumns = () => {
    if (screenWidth >= 1200) return 6; // Desktop grande
    if (screenWidth >= 900) return 4;  // Desktop
    if (screenWidth >= 600) return 3;  // Tablet
    if (screenWidth >= 400) return 2;  // Mobile grande
    return 1; // Mobile pequeño
  };

  const numColumns = getNumColumns();

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

  const handleImportSuccess = (property: Property) => {
    addProperty(property);
    setSnackbarMessage('¡Propiedad importada exitosamente!');
    setSnackbarVisible(true);
  };

  const handleImportPress = () => {
    setImportModalVisible(true);
  };

  const renderPropertyCard = ({ item }: { item: Property }) => (
    <PropertyCard 
      property={item} 
      showEditButton={true}
      showFavoriteButton={true}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
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
  );

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={styles.appHeaderContent}>
          <View style={styles.appTitleContainer}>
            <Text variant="headlineSmall" style={styles.appTitle}>HouseLyzer</Text>
            <View style={styles.boltContainer}>
              <Zap size={16} color="#f59e0b" fill="#f59e0b" />
              <Text variant="bodySmall" style={styles.boltText}>Made with bolt.new</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text variant="bodyMedium" style={styles.subtitle}>{t('manageAnalyze')}</Text>
        {favoritesCount > 0 && (
          <View style={styles.favoritesInfo}>
            <Heart size={16} color="#ef4444" />
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

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text variant="bodyMedium" style={styles.resultsText}>
          {filteredAndSortedProperties.length} {filteredAndSortedProperties.length === 1 ? t('propertyFound') : t('propertiesFound')}
          {favoriteFilter === 'favorites' && ` (${t('favorites')})`}
        </Text>
        <Text variant="bodySmall" style={styles.gridInfo}>
          Grid: {numColumns} columna{numColumns > 1 ? 's' : ''} ({screenWidth}px)
        </Text>
      </View>

      {/* Properties Grid */}
      <FlatList
        data={filteredAndSortedProperties}
        renderItem={renderPropertyCard}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns} // Forzar re-render cuando cambia el número de columnas
        contentContainerStyle={styles.propertiesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      />

      <FAB
        icon="link"
        style={styles.fab}
        onPress={handleImportPress}
        label={t('importFromUrl')}
      />

      {/* Enhanced Import Modal */}
      <ImportModal
        visible={importModalVisible}
        onDismiss={() => setImportModalVisible(false)}
        onSuccess={handleImportSuccess}
        supabaseUrl={SUPABASE_URL}
        supabaseAnonKey={SUPABASE_ANON_KEY}
        openaiApiKey={OPENAI_API_KEY}
      />

      {/* Success Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={styles.snackbar}
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
  appHeader: {
    backgroundColor: '#f59e0b',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitleContainer: {
    flex: 1,
  },
  appTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 4,
  },
  boltContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  boltText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
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
    flexWrap: 'wrap',
    gap: 8,
  },
  favoriteChip: {
    flex: 1,
  },
  resultsHeader: {
    padding: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    color: '#6b7280',
  },
  gridInfo: {
    color: '#9ca3af',
    fontSize: 12,
  },
  propertiesList: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
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
  snackbar: {
    backgroundColor: '#10b981',
  },
});