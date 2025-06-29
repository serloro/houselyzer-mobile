import { Property } from '@/types';

export interface ImportProgress {
  step: 'fetching' | 'processing' | 'complete' | 'error';
  message: string;
  progress: number;
}

export interface ImportResult {
  success: boolean;
  property?: Property;
  error?: string;
  metadata?: {
    scrapingMethod: string;
    contentLength: number;
    extractionMethod: string;
  };
}

export class PropertyImporter {
  private supabaseUrl: string;
  private supabaseAnonKey: string;
  private openaiApiKey?: string;

  constructor(supabaseUrl: string, supabaseAnonKey: string, openaiApiKey?: string) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseAnonKey = supabaseAnonKey;
    this.openaiApiKey = openaiApiKey;
  }

  async importProperty(
    url: string, 
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResult> {
    try {
      // Validate URL
      new URL(url);

      // Step 1: Start scraping
      onProgress?.({
        step: 'fetching',
        message: 'Obteniendo contenido de la página...',
        progress: 25
      });

      const scrapeResponse = await fetch(
        `${this.supabaseUrl}/functions/v1/scrape-property`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            openaiApiKey: this.openaiApiKey
          })
        }
      );

      if (!scrapeResponse.ok) {
        throw new Error(`Error del servidor: ${scrapeResponse.status}`);
      }

      // Step 2: Processing
      onProgress?.({
        step: 'processing',
        message: 'Procesando datos de la propiedad...',
        progress: 75
      });

      const result = await scrapeResponse.json();

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido al procesar la propiedad');
      }

      // Step 3: Create Property object
      const property: Property = {
        id: Date.now().toString(),
        title: result.data.title,
        address: result.data.address,
        price: result.data.price,
        currency: result.data.currency as 'USD' | 'EUR',
        bedrooms: result.data.bedrooms,
        bathrooms: result.data.bathrooms,
        sqft: result.data.sqft,
        yearBuilt: result.data.yearBuilt || 2020,
        propertyType: result.data.propertyType as any,
        imageUrl: result.data.imageUrl,
        description: result.data.description,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        features: result.data.features || [],
        neighborhood: result.data.neighborhood || 'Por definir',
        pricePerSqft: Math.round(result.data.price / result.data.sqft),
        listingAgent: 'Importado automáticamente',
        daysOnMarket: 0,
      };

      // Step 4: Complete
      onProgress?.({
        step: 'complete',
        message: 'Propiedad importada exitosamente',
        progress: 100
      });

      return {
        success: true,
        property,
        metadata: result.metadata
      };

    } catch (error) {
      onProgress?.({
        step: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido',
        progress: 0
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Static method for basic import (fallback)
  static createBasicProperty(url: string): Property {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const isEuropean = domain.includes('idealista') || 
                      domain.includes('fotocasa') || 
                      domain.includes('.es');
    
    const currency = isEuropean ? 'EUR' : 'USD';
    const basePrice = isEuropean ? 450000 : 500000;
    
    return {
      id: Date.now().toString(),
      title: `Propiedad desde ${domain}`,
      address: url,
      price: basePrice,
      currency,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      yearBuilt: 2020,
      propertyType: 'apartment',
      imageUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      description: `Propiedad importada desde ${url}. Datos básicos generados automáticamente.`,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      features: ['Importada desde URL', 'Requiere verificación'],
      neighborhood: 'Por definir',
      pricePerSqft: Math.round(basePrice / 1200),
      listingAgent: 'Importado automáticamente',
      daysOnMarket: 0,
    };
  }
}