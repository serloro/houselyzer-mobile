# HouseLyzer Mobile

Una aplicación móvil completa para gestionar y analizar propiedades inmobiliarias, construida con Expo y React Native.

## Características Principales

### 🏠 Gestión de Propiedades
- Importación automática desde URLs de sitios inmobiliarios
- Edición completa de datos de propiedades
- Sistema de favoritos
- Búsqueda y filtrado avanzado
- Vista en cuadrícula responsiva

### 🧮 Calculadora Hipotecaria
- Cálculo de pagos mensuales
- Comparación de tipos de hipoteca (fija, variable, mixta)
- Soporte para múltiples monedas (USD, EUR)
- Configuración personalizable

### 🔧 Importación Inteligente
- **Scraping directo**: Intenta obtener contenido directamente
- **ScraperAPI fallback**: Usa ScraperAPI cuando el scraping directo falla
- **Procesamiento con IA**: Extrae datos estructurados usando OpenAI
- **Progreso en tiempo real**: Muestra el estado de la importación

### ⚙️ Configuración Avanzada
- Soporte multiidioma (Español/Inglés)
- Modo oscuro/claro
- Múltiples monedas
- Gestión de datos

## Configuración del Proyecto

### 1. Instalación
```bash
npm install
```

### 2. Variables de Entorno
Copia `.env.example` a `.env` y configura:

```env
# Supabase (Requerido para importación avanzada)
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# OpenAI (Opcional - para extracción mejorada de datos)
EXPO_PUBLIC_OPENAI_API_KEY=tu_clave_de_openai

# ScraperAPI (Configurar en Supabase Edge Function)
SCRAPER_API_KEY=tu_clave_de_scraperapi
```

### 3. Configuración de Supabase

#### Edge Function
La función de scraping debe desplegarse en Supabase:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Desplegar la función
supabase functions deploy scrape-property
```

#### Variables de Entorno en Supabase
Configura en el dashboard de Supabase:
- `SCRAPER_API_KEY`: Tu clave de ScraperAPI

### 4. Ejecutar la Aplicación
```bash
# Desarrollo
npm run dev

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Arquitectura del Sistema de Importación

### Flujo de Importación
1. **Validación de URL**: Verifica que la URL sea válida
2. **Scraping Directo**: Intenta obtener el contenido directamente
3. **Fallback ScraperAPI**: Si falla, usa ScraperAPI
4. **Procesamiento IA**: Extrae datos estructurados con OpenAI
5. **Fallback Básico**: Genera datos básicos si todo falla

### Componentes Clave

#### `PropertyImporter` (`utils/propertyImporter.ts`)
- Maneja el flujo completo de importación
- Proporciona callbacks de progreso
- Maneja errores y fallbacks

#### `ImportModal` (`components/ImportModal.tsx`)
- Interfaz de usuario para importación
- Muestra progreso en tiempo real
- Indica métodos utilizados (directo, ScraperAPI, OpenAI)

#### Edge Function (`supabase/functions/scrape-property/index.ts`)
- Ejecuta el scraping de forma segura en el servidor
- Maneja múltiples estrategias de scraping
- Procesa contenido con OpenAI

## Servicios Externos

### ScraperAPI
- **Propósito**: Scraping de sitios web que bloquean requests directos
- **Configuración**: Clave API en variables de entorno de Supabase
- **Costo**: Plan gratuito disponible con límites

### OpenAI
- **Propósito**: Extracción inteligente de datos de propiedades
- **Modelo**: GPT-3.5-turbo para eficiencia de costos
- **Configuración**: Clave API opcional en variables de entorno

## Estructura del Proyecto

```
├── app/                    # Rutas de la aplicación (Expo Router)
│   ├── (tabs)/            # Navegación por pestañas
│   │   ├── index.tsx      # Lista de propiedades
│   │   ├── calculator.tsx # Calculadora hipotecaria
│   │   └── settings.tsx   # Configuración
│   └── _layout.tsx        # Layout raíz
├── components/            # Componentes reutilizables
│   ├── PropertyCard.tsx   # Tarjeta de propiedad
│   └── ImportModal.tsx    # Modal de importación
├── store/                 # Estado global (Zustand)
├── utils/                 # Utilidades
│   ├── propertyImporter.ts # Lógica de importación
│   ├── calculations.ts    # Cálculos hipotecarios
│   └── translations.ts    # Sistema de traducciones
├── supabase/             # Funciones de Supabase
│   └── functions/
│       └── scrape-property/ # Edge function de scraping
└── types/                # Definiciones de TypeScript
```

## Desarrollo

### Agregar Nuevos Sitios de Importación
1. Actualizar la lógica de detección en `extractBasicPropertyData`
2. Ajustar el prompt de OpenAI si es necesario
3. Probar con URLs del nuevo sitio

### Personalizar Extracción de Datos
Modifica el prompt en la función `extractPropertyDataWithOpenAI` para:
- Agregar nuevos campos
- Mejorar la precisión de extracción
- Soportar nuevos tipos de propiedades

### Agregar Nuevos Idiomas
1. Actualizar `utils/translations.ts`
2. Agregar el idioma en `types/index.ts`
3. Actualizar la configuración en `app/(tabs)/settings.tsx`

## Despliegue

### Expo Application Services (EAS)
```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Configurar proyecto
eas build:configure

# Build para producción
eas build --platform all
```

### Variables de Entorno en Producción
Configura las variables de entorno en:
- EAS Secrets para la aplicación móvil
- Supabase Dashboard para las Edge Functions

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## Soporte

Para soporte y preguntas:
- Abre un issue en GitHub
- Consulta la documentación de Expo
- Revisa la documentación de Supabase