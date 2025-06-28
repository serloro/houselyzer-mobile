import { Property, MarketData } from '@/types';

export const mockProperties: Property[] = [];

export const mockMarketData: MarketData = {
  averagePrice: 612500,
  priceChange: 5.2,
  totalListings: 1247,
  averageDaysOnMarket: 28,
  mostPopularType: 'house',
  trendData: [
    { date: '2024-01', price: 580000 },
    { date: '2024-02', price: 585000 },
    { date: '2024-03', price: 592000 },
    { date: '2024-04', price: 598000 },
    { date: '2024-05', price: 605000 },
    { date: '2024-06', price: 612500 },
  ],
};