export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  currency: 'USD' | 'EUR';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  propertyType: 'house' | 'condo' | 'townhouse' | 'apartment';
  imageUrl: string;
  description: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  features: string[];
  neighborhood: string;
  pricePerSqft: number;
  listingAgent: string;
  daysOnMarket: number;
  
  // Additional fields for enhanced property data
  additionalImages?: string[];
  mapUrl?: string | null;
  virtualTourUrl?: string | null;
  lotSize?: string | null;
  parkingSpaces?: number | null;
  heating?: string | null;
  cooling?: string | null;
  flooring?: string | null;
  appliances?: string[];
  utilities?: string | null;
  hoa?: string | null;
  taxes?: string | null;
  
  // New: Comments system
  comments?: PropertyComment[];
  
  // New: User-controlled price indicator
  priceIndicator?: 'good' | 'expensive' | null;
}

export interface PropertyComment {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  type: 'note' | 'reminder' | 'observation' | 'question';
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface MortgageCalculation {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  downPayment: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}

export interface MarketData {
  averagePrice: number;
  priceChange: number;
  totalListings: number;
  averageDaysOnMarket: number;
  mostPopularType: string;
  trendData: Array<{date: string; price: number}>;
  location?: string;
  currency?: string;
  lastUpdated?: string;
  sources?: number;
  isFallback?: boolean;
}

export interface Settings {
  currency: string;
  defaultLoanTerm: number;
  defaultInterestRate: number;
  notifications: boolean;
  darkMode: boolean;
  measurementUnit: 'sqft' | 'sqm';
  language: 'es' | 'en';
  marketDataLocation: string;
  rapidApiKey?: string;
}

export interface AppState {
  properties: Property[];
  favorites: Property[];
  settings: Settings;
  searchTerm: string;
  filterType: string;
  sortBy: string;
  isLoading: boolean;
  error: string | null;
  marketData: MarketData | null;
  marketDataLoading: boolean;
}