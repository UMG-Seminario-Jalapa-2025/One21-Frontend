# One21-Frontend - Documentación Técnica

## Tabla de Contenidos

- [Introducción](#introducción)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración](#configuración)
- [Layouts](#layouts)
- [Enrutamiento](#enrutamiento)
- [Temas y Estilos](#temas-y-estilos)
- [Componentes](#componentes)
- [Navegación](#navegación)
- [Instalación y Configuración](#instalación-y-configuración)
- [Scripts Disponibles](#scripts-disponibles)
- [Consideraciones de Desarrollo](#consideraciones-de-desarrollo)

## Introducción

One21-Frontend es una aplicación de panel de administración ERP desarrollada con Next.js 15, React 18 y Material-UI (MUI) v6. La aplicación está construida como un template altamente personalizable con soporte para múltiples layouts, temas dinámicos y navegación adaptable.

## Arquitectura

### Patrón de Arquitectura
- **Framework**: Next.js 15 con App Router
- **Arquitectura de Componentes**: Componentes funcionales con React Hooks
- **Gestión de Estado**: Context API para configuraciones globales
- **Estilos**: Sistema híbrido MUI + Tailwind CSS
- **Estructura Modular**: Organización por características y responsabilidades

### Principios de Diseño
- Separación de responsabilidades por dominios
- Componentes reutilizables y configurables
- Configuración centralizada
- Soporte para múltiples layouts
- Tema dinámico y personalizable

## Tecnologías

### Core Technologies
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 15.1.2 | Framework de React con SSR/SSG |
| React | 18.3.1 | Librería de UI |
| TypeScript | 5.5.4 | Tipado estático |
| Material-UI | 6.2.1 | Sistema de componentes UI |
| Tailwind CSS | 3.4.17 | Framework de CSS utilitario |

### Dependencias Principales
```json
{
  "@emotion/cache": "11.14.0",
  "@emotion/react": "11.14.0", 
  "@emotion/styled": "11.14.0",
  "@floating-ui/react": "0.27.2",
  "@mui/lab": "6.0.0-beta.19",
  "@mui/material": "6.2.1",
  "classnames": "2.5.1",
  "react-perfect-scrollbar": "1.5.8",
  "react-use": "17.6.0"
}
```

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **Stylelint**: Linting de estilos CSS
- **PostCSS**: Procesamiento de CSS
- **Iconify**: Sistema de iconos

## Estructura del Proyecto

```
src/
├── @core/                    # Funcionalidades centrales
│   ├── components/          # Componentes base reutilizables
│   ├── contexts/           # Contextos de React (Settings)
│   ├── hooks/              # Hooks personalizados
│   ├── styles/             # Estilos específicos del core
│   ├── theme/              # Configuración del tema MUI
│   ├── types.ts            # Tipos TypeScript centrales
│   └── utils/              # Utilidades compartidas
│
├── @layouts/               # Sistema de layouts
│   ├── components/         # Componentes específicos de layout
│   ├── styles/            # Estilos de layouts
│   ├── utils/             # Utilidades de layout
│   ├── BlankLayout.tsx    # Layout en blanco
│   ├── HorizontalLayout.tsx
│   ├── VerticalLayout.tsx
│   └── LayoutWrapper.tsx  # Wrapper principal
│
├── @menu/                  # Sistema de navegación
│   ├── components/         # Componentes de menú
│   ├── contexts/          # Contextos de navegación
│   ├── hooks/             # Hooks para menús
│   ├── styles/            # Estilos de menús
│   ├── utils/             # Utilidades de menú
│   ├── horizontal-menu/   # Menú horizontal
│   └── vertical-menu/     # Menú vertical
│
├── app/                    # App Router de Next.js
│   ├── (dashboard)/       # Grupo de rutas con layout principal
│   ├── (blank-layout-pages)/ # Rutas con layout en blanco
│   ├── [...not-found]/    # Página 404
│   ├── globals.css        # Estilos globales
│   └── layout.tsx         # Layout raíz
│
├── components/             # Componentes de la aplicación
│   ├── layout/            # Componentes específicos de layout
│   ├── theme/             # Configuración de tema
│   ├── Link.tsx           # Componente Link personalizado
│   └── Providers.tsx      # Proveedores de contexto
│
├── configs/               # Archivos de configuración
│   ├── primaryColorConfig.ts
│   └── themeConfig.ts     # Configuración principal del tema
│
├── data/                  # Datos estáticos
│   └── navigation/        # Datos de navegación
│
├── types/                 # Definiciones de tipos
│   └── menuTypes.ts
│
├── utils/                 # Utilidades de la aplicación
│   ├── getInitials.ts
│   └── string.ts
│
└── views/                 # Componentes de vistas/páginas
    ├── Login.tsx
    └── NotFound.tsx
```

## Configuración

### Configuración Principal (`themeConfig.ts`)

```typescript
const themeConfig: Config = {
  templateName: 'Vuexy',
  homePageUrl: '/login',
  settingsCookieName: 'vuexy-mui-next-demo-1',
  mode: 'system',           // 'system', 'light', 'dark'
  skin: 'default',          // 'default', 'bordered'
  semiDark: false,
  layout: 'vertical',       // 'vertical', 'collapsed', 'horizontal'
  layoutPadding: 24,
  compactContentWidth: 1440,
  navbar: {
    type: 'fixed',          // 'fixed', 'static'
    contentWidth: 'compact', // 'compact', 'wide'
    floating: true,
    detached: true,
    blur: true
  },
  contentWidth: 'compact',
  footer: {
    type: 'static',
    contentWidth: 'compact',
    detached: true
  },
  disableRipple: false
}
```

### Configuración de Next.js (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => [
    {
      source: '/',
      destination: '/login',
      permanent: true,
      locale: false
    }
  ]
}
```

## Layouts

### 1. Layout Vertical (`VerticalLayout.tsx`)
- **Navegación lateral**: Menú vertical expandible/colapsable
- **Header superior**: Barra de navegación fija o estática
- **Área de contenido**: Contenido principal de la aplicación
- **Footer**: Pie de página opcional

### 2. Layout Horizontal (`HorizontalLayout.tsx`)
- **Header con navegación**: Menú horizontal en la parte superior
- **Área de contenido**: Contenido principal
- **Footer**: Pie de página

### 3. Layout en Blanco (`BlankLayout.tsx`)
- **Diseño minimalista**: Sin navegación ni elementos adicionales
- **Uso**: Páginas de login, 404, etc.

### Layout Wrapper (`LayoutWrapper.tsx`)
Componente que determina qué layout usar basado en la configuración:

```typescript
const LayoutWrapper = ({ 
  systemMode, 
  verticalLayout, 
  horizontalLayout 
}: LayoutWrapperProps) => {
  const { settings } = useSettings()
  
  return (
    <>
      {settings.layout === 'horizontal' ? horizontalLayout : verticalLayout}
    </>
  )
}
```

## Enrutamiento

### Estructura de App Router

```
app/
├── layout.tsx                    # Layout raíz
├── (dashboard)/                  # Grupo de rutas principales
│   ├── layout.tsx               # Layout del dashboard
│   ├── login/page.tsx            # Página principal
│   └── about/page.tsx           # Página sobre
├── (blank-layout-pages)/        # Rutas con layout en blanco
│   ├── layout.tsx               # Layout en blanco
│   └── login/page.tsx           # Página de login
└── [...not-found]/page.tsx      # Página 404 catch-all
```

### Configuración de Rutas

#### Redirecciones Automáticas
- `/` → `/home` (configurado en `next.config.ts`)

#### Grupos de Rutas
- **(dashboard)**: Rutas que usan el layout principal con navegación
- **(blank-layout-pages)**: Rutas que usan layout minimalista

## Temas y Estilos

### Sistema de Temas

#### 1. Configuración de Colores
```typescript
// Esquemas de color dinámicos
colorSchemes: {
  light: { /* configuración modo claro */ },
  dark: { /* configuración modo oscuro */ }
}

// Variables CSS personalizadas
:root {
  --primary-color: var(--mui-palette-primary-main);
  --background-color: var(--mui-palette-background-default);
  --border-color: var(--mui-palette-divider);
}
```

#### 2. Tipografía
- **Fuente principal**: Public Sans (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700, 800, 900
- **Configuración responsive** para diferentes tamaños de pantalla

#### 3. Sombras Personalizadas
```typescript
customShadows: {
  xs: string,
  sm: string,
  md: string,
  lg: string,
  xl: string,
  primary: { sm, md, lg },
  secondary: { sm, md, lg },
  // ... otros colores
}
```

### Integración Tailwind + MUI

#### Plugin Personalizado de Tailwind
```typescript
// src/@core/tailwind/plugin.ts
extend: {
  colors: {
    primary: 'var(--mui-palette-primary-main)',
    secondary: 'var(--mui-palette-secondary-main)',
    // Sincronización con variables MUI
  },
  borderRadius: {
    xs: 'var(--mui-shape-customBorderRadius-xs)',
    sm: 'var(--mui-shape-customBorderRadius-sm)',
    // Radio de borde sincronizado con MUI
  }
}
```

### Overrides de Componentes MUI

Los overrides están organizados por componente:

```typescript
// src/@core/theme/overrides/index.ts
const overrides = (skin: Skin): Theme['components'] => ({
  // Imports de overrides específicos
  ...button,
  ...card,
  ...input,
  ...tabs,
  // ... más componentes
})
```

## Componentes

### Core Components (`@core/components/`)

#### 1. Custom Inputs
- **CustomTextField**: Campo de texto personalizado con estilos MUI
- **Inputs Horizontales/Verticales**: Variantes de layout para formularios

#### 2. Customizer
- **Theme Customizer**: Panel para personalizar tema en tiempo real
- **Configuración dinámica**: Cambio de colores, layouts, modos

#### 3. Scroll to Top
- **Botón flotante**: Scroll suave al inicio de página
- **Configuración automática**: Aparece/desaparece según scroll

### Layout Components (`@layouts/components/`)

#### Componentes Verticales
- **Navbar**: Barra de navegación superior
- **LayoutContent**: Contenedor principal del contenido
- **Footer**: Pie de página del layout vertical

#### Componentes Horizontales
- **Header**: Encabezado con navegación horizontal
- **LayoutContent**: Contenedor de contenido horizontal
- **Footer**: Pie de página del layout horizontal

### Menu Components (`@menu/components/`)

#### Menú Vertical
- **VerticalNav**: Contenedor principal del menú vertical
- **Menu**: Componente raíz del menú
- **MenuItem**: Elemento individual del menú
- **SubMenu**: Submenú expandible
- **MenuSection**: Sección separadora del menú
- **NavHeader**: Encabezado del menú con logo
- **NavCollapseIcons**: Iconos de colapso/expansión

#### Menú Horizontal
- **HorizontalMenu**: Menú de navegación horizontal
- **MenuItem**: Elemento del menú horizontal
- **SubMenu**: Submenú dropdown horizontal

## Navegación

### Configuración de Menú Vertical

```typescript
// src/data/navigation/verticalMenuData.tsx
const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Home',
    href: '/home',
    icon: 'tabler-smart-home'
  },
  {
    label: 'About',
    href: '/about', 
    icon: 'tabler-info-circle'
  }
]
```

### Tipos de Menú

```typescript
// src/types/menuTypes.ts
export type VerticalMenuDataType = {
  label: string
  href?: string
  icon?: string
  children?: VerticalMenuDataType[]
}
```

### Hooks de Navegación

#### `useVerticalNav`
```typescript
const {
  isCollapsed,
  isHovered,
  collapseVerticalNav,
  isBreakpointReached
} = useVerticalNav()
```

#### `useHorizontalNav`
```typescript
const {
  isBreakpointReached,
  // ... otras propiedades
} = useHorizontalNav()
```

### Contextos de Navegación

#### VerticalNavContext
- **Estado global** del menú vertical
- **Funciones de control**: colapsar, expandir, hover
- **Breakpoints responsive**

#### HorizontalNavContext
- **Estado global** del menú horizontal
- **Control de responsive**: adaptación a diferentes pantallas

## Instalación y Configuración

### Requisitos Previos
- Node.js >= 18
- npm, yarn o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd One21-Frontend

# Instalar dependencias
npm install
# o
pnpm install
```

### Variables de Entorno

```bash
# .env.local (opcional)
BASEPATH=                    # Base path para la aplicación
```

### Configuración Inicial

1. **Configurar tema**: Modificar `src/configs/themeConfig.ts`
2. **Personalizar colores**: Editar `src/configs/primaryColorConfig.ts`
3. **Configurar navegación**: Actualizar `src/data/navigation/verticalMenuData.tsx`
4. **Ajustar metadata**: Modificar `src/app/layout.tsx`

## Scripts Disponibles

```json
{
  "dev": "next dev --turbopack",           // Servidor de desarrollo
  "build": "next build",                   // Build de producción
  "start": "next start",                   // Servidor de producción
  "lint": "next lint",                     // Linting
  "lint:fix": "next lint --fix",          // Auto-fix de linting
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx}\"", // Formateo
  "build:icons": "tsx src/assets/iconify-icons/bundle-icons-css.ts", // Generación de iconos
  "postinstall": "npm run build:icons"    // Post-instalación
}
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

### Producción

```bash
# Crear build de producción
npm run build

# Iniciar servidor de producción
npm run start
```

## Consideraciones de Desarrollo

### Estructura de Archivos
- **Componentes**: Un componente por archivo
- **Estilos**: Co-ubicación de estilos específicos
- **Tipos**: Definición centralizada en archivos `.ts`
- **Utilidades**: Funciones reutilizables en carpeta `utils/`

### Convenciones de Naming
- **Componentes**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase con prefijo 'use' (`useMyHook.ts`)
- **Tipos**: PascalCase con sufijo 'Type' (`MenuDataType`)
- **Utilidades**: camelCase (`formatString.ts`)

### Gestión de Estado
- **Configuraciones globales**: Context API (`SettingsContext`)
- **Estado local**: useState/useReducer hooks
- **Persistencia**: Cookies para configuraciones de usuario

### Responsive Design
- **Breakpoints MUI**: sm(600px), md(900px), lg(1200px), xl(1536px)
- **Mobile-first approach**: Diseño adaptable desde móvil
- **Menús adaptativos**: Cambio automático según resolución

### Performance
- **Code splitting**: Importaciones dinámicas donde sea apropiado
- **Tree shaking**: Importaciones específicas de librerías
- **Image optimization**: Next.js Image component
- **CSS-in-JS optimizado**: Emotion con MUI

### Accessibility
- **Navegación por teclado**: Soporte completo
- **ARIA labels**: Etiquetas semánticas
- **Contraste de colores**: Cumplimiento WCAG
- **Focus management**: Gestión adecuada del foco

### SEO
- **Metadata**: Configuración en layouts
- **Structured data**: Implementación según necesidad
- **Server-side rendering**: Aprovechamiento de Next.js
- **Sitemap**: Generación automática

---

## Soporte y Contribución

Para contribuir al proyecto o reportar problemas, seguir las guías de contribución del repositorio.

**Versión de la documentación**: 1.0  
**Última actualización**: Agosto 2025
