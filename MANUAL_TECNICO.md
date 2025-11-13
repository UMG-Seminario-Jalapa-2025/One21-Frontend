# Manual Técnico - One21 ERP Frontend

## Tabla de Contenidos

1. [Información General del Proyecto](#1-información-general-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Configuración del Proyecto](#5-configuración-del-proyecto)
6. [Sistema de Autenticación](#6-sistema-de-autenticación)
7. [Sistema de Layouts](#7-sistema-de-layouts)
8. [Sistema de Navegación](#8-sistema-de-navegación)
9. [Gestión de Estado](#9-gestión-de-estado)
10. [Sistema de Temas](#10-sistema-de-temas)
11. [Componentes Principales](#11-componentes-principales)
12. [APIs y Servicios](#12-apis-y-servicios)
13. [Módulos Funcionales](#13-módulos-funcionales)
14. [Sistema de Testing](#14-sistema-de-testing)
15. [Despliegue y DevOps](#15-despliegue-y-devops)
16. [Scripts y Comandos](#16-scripts-y-comandos)

---

## 1. Información General del Proyecto

### 1.1 Descripción
**One21-Frontend** es una aplicación web ERP (Enterprise Resource Planning) construida con Next.js 15 que proporciona una interfaz de administración completa. El sistema está basado en la plantilla Vuexy-MUI y personalizado para gestionar empleados, tickets, personas y configuraciones empresariales.

### 1.2 Metadata del Proyecto
```json
{
  "nombre": "vuexy-mui-nextjs-admin-template",
  "versión": "4.0.0",
  "licencia": "Commercial",
  "tipo": "private"
}
```

### 1.3 Características Principales
- Sistema de autenticación con JWT
- Gestión de empleados y recursos humanos
- Sistema de tickets con Kanban board
- Control de roles y permisos
- Interfaz responsive y adaptable
- Múltiples layouts configurables (Vertical/Horizontal)
- Tema personalizable (Light/Dark/System)

---

## 2. Arquitectura del Sistema

### 2.1 Patrón Arquitectónico
El proyecto utiliza una arquitectura basada en **Next.js App Router** con las siguientes características:

- **SSR (Server-Side Rendering)**: Renderizado en servidor para páginas protegidas
- **CSR (Client-Side Rendering)**: Componentes interactivos en el cliente
- **API Routes**: Endpoints internos que actúan como proxy al backend
- **Middleware**: Validación de autenticación en cada request

### 2.2 Flujo de Autenticación
```
Usuario → /login → API Route (/api/login) → Keycloak Auth
                                          ↓
                              JWT Token (httpOnly cookie)
                                          ↓
                              Middleware valida token
                                          ↓
                              Dashboard (/inicio)
```

### 2.3 Diagrama de Componentes
```
RootLayout (app/layout.tsx)
  ├── InitColorSchemeScript (MUI)
  ├── LoadingProvider (UI)
  └── AlertProvider (UI)

DashboardLayout (app/(dashboard)/layout.tsx)
  ├── Providers
  │   ├── VerticalNavProvider
  │   ├── SettingsProvider
  │   └── ThemeProvider
  ├── LayoutWrapper
  │   ├── VerticalLayout
  │   │   ├── Navigation
  │   │   ├── Navbar
  │   │   └── Footer
  │   └── HorizontalLayout
  │       ├── Header
  │       └── Footer
  └── ScrollToTop
```

---

## 3. Stack Tecnológico

### 3.1 Framework y Librerías Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 15.1.2 | Framework principal con App Router y SSR |
| React | 18.3.1 | Librería de componentes UI |
| TypeScript | 5.5.4 | Tipado estático y seguridad de tipos |
| Material-UI (MUI) | 6.2.1 | Sistema de componentes UI y diseño |
| Emotion | 11.14.0 | CSS-in-JS para estilos dinámicos |
| Tailwind CSS | 3.4.17 | Utilidades CSS para estilos rápidos |

### 3.2 Gestión de Estado y Formularios

| Librería | Versión | Uso |
|----------|---------|-----|
| React Context API | - | Estado global de settings |
| React Hook Form | 7.54.1 | Gestión de formularios |
| @hookform/resolvers | 3.9.1 | Validación de formularios |
| Valibot | 0.42.1 | Esquemas de validación |

### 3.3 Tablas y Visualización de Datos

| Librería | Versión | Propósito |
|----------|---------|-----------|
| @tanstack/react-table | 8.20.6 | Tablas avanzadas con paginación |
| ApexCharts | 3.49.0 | Gráficos y visualizaciones |
| react-apexcharts | 1.4.1 | Wrapper de React para ApexCharts |

### 3.4 UI/UX Adicionales

| Librería | Versión | Funcionalidad |
|----------|---------|---------------|
| react-perfect-scrollbar | 1.5.8 | Scroll personalizado |
| react-toastify | 10.0.6 | Notificaciones toast |
| keen-slider | 6.8.6 | Carruseles y sliders |
| @tiptap/react | 2.10.4 | Editor de texto enriquecido |
| react-datepicker | 7.3.0 | Selector de fechas |
| react-dropzone | 14.3.5 | Subida de archivos |

### 3.5 Autenticación y Seguridad

| Librería | Versión | Uso |
|----------|---------|-----|
| jose | 6.0.13 | Manejo de JWT |
| cookie | 1.0.2 | Gestión de cookies |
| next-auth | 4.24.11 | Autenticación Next.js |

---

## 4. Estructura del Proyecto

### 4.1 Organización de Directorios

```
One21-Frontend/
├── src/
│   ├── @core/              # Funcionalidades centrales reutilizables
│   │   ├── components/     # Componentes base (TextField, Scroll, etc.)
│   │   ├── contexts/       # SettingsContext para configuración global
│   │   ├── hooks/          # useImageVariant, useLayoutInit
│   │   ├── styles/         # Estilos específicos del core
│   │   ├── theme/          # Configuración del tema MUI
│   │   ├── types.ts        # Tipos centrales (Mode, Skin, Layout, etc.)
│   │   └── utils/          # Utilidades compartidas
│   │
│   ├── @layouts/           # Sistema de layouts
│   │   ├── components/     # Componentes de layout (Navbar, Footer)
│   │   ├── styles/         # Estilos específicos de layouts
│   │   ├── BlankLayout.tsx
│   │   ├── VerticalLayout.tsx
│   │   ├── HorizontalLayout.tsx
│   │   └── LayoutWrapper.tsx
│   │
│   ├── @menu/              # Sistema de menús y navegación
│   │   ├── components/     # MenuItem, SubMenu, MenuSection
│   │   ├── contexts/       # VerticalNavContext, HorizontalNavContext
│   │   ├── hooks/          # useVerticalNav, useHorizontalNav
│   │   ├── vertical-menu/
│   │   └── horizontal-menu/
│   │
│   ├── app/                # Next.js App Router
│   │   ├── (dashboard)/    # Rutas protegidas con layout completo
│   │   │   ├── Empleados/
│   │   │   ├── ticket/
│   │   │   ├── inicio/
│   │   │   └── layout.tsx
│   │   ├── (blank-layout-pages)/  # Login y páginas sin layout
│   │   ├── api/            # API Routes (proxy al backend)
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/         # Componentes de la aplicación
│   │   ├── empleados/
│   │   ├── layout/
│   │   ├── ui/             # AlertProvider, LoadingModal, ConfirmDialog
│   │   ├── GenerateMenu.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleBasedRoute.tsx
│   │   └── Providers.tsx
│   │
│   ├── configs/            # Archivos de configuración
│   │   ├── menuConfig.ts   # Configuración del menú con roles
│   │   ├── themeConfig.ts
│   │   └── primaryColorConfig.ts
│   │
│   ├── data/
│   │   └── navigation/     # verticalMenuData.tsx
│   │
│   ├── lib/
│   │   └── auth.ts         # Constantes de autenticación
│   │
│   ├── types/
│   │   └── menuTypes.ts    # Tipos de menú
│   │
│   ├── utils/              # Utilidades
│   │   ├── getInitials.ts
│   │   └── string.ts
│   │
│   └── views/              # Componentes de vistas completas
│       ├── Login.tsx
│       ├── NotFound.tsx
│       └── apps/
│           ├── empleados/
│           └── ticket/
│
├── charts/                 # Helm charts para Kubernetes
│   ├── templates/
│   ├── Chart.yaml
│   └── values.yaml
│
├── cypress/                # Tests E2E
│   ├── e2e/
│   │   ├── empleados/
│   │   ├── login/
│   │   └── tickets/
│   └── support/
│
├── public/
│   └── images/
│
├── Dockerfile
├── middleware.ts           # Middleware de autenticación
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### 4.2 Convenciones de Nomenclatura

#### Archivos y Carpetas
- **Componentes React**: PascalCase → `EmpleadoModal.tsx`
- **Páginas Next.js**: lowercase → `page.tsx`
- **API Routes**: lowercase → `route.ts`
- **Hooks**: camelCase con prefijo 'use' → `useVerticalNav.ts`
- **Tipos**: PascalCase con sufijo Type → `menuTypes.ts`
- **Utilidades**: camelCase → `getInitials.ts`
- **Estilos**: camelCase con extensión → `table.module.css`

#### Carpetas Especiales Next.js
- **(dashboard)**: Grupo de rutas con layout protegido
- **(blank-layout-pages)**: Grupo de rutas sin navegación
- **[...not-found]**: Catch-all para 404
- **api/**: API Routes

---

## 5. Configuración del Proyecto

### 5.1 Variables de Entorno

El proyecto utiliza las siguientes variables de entorno configuradas en `next.config.ts`:

```typescript
env: {
  AUTH_API_BASE: process.env.AUTH_API_BASE,
  AUTH_STATIC_BEARER: process.env.AUTH_STATIC_BEARER,
  AUTH_TENANT: process.env.AUTH_TENANT,
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME
}
```

**Archivo `.env.local` requerido:**
```bash
# Autenticación Keycloak
AUTH_API_BASE=https://dev.one21.app
AUTH_STATIC_BEARER=tu_bearer_token
AUTH_TENANT=one21
AUTH_COOKIE_NAME=one21_token
AUTH_COOKIE_MAX_AGE=604800

# Base URL de servicios
NEXT_PUBLIC_API_BASE_URL_SERVICE=https://api.one21.app/
NEXT_PUBLIC_API_BASE_URL_EMPLOYEE=http://localhost:8091

# Next.js
BASEPATH=
NODE_ENV=development
```

### 5.2 Configuración de Next.js

**Archivo: `next.config.ts`**
```typescript
const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  reactStrictMode: true,
  
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
        locale: false
      }
    ]
  },
  
  i18n: {
    locales: ['en'],
    defaultLocale: 'en'
  }
}
```

**Características:**
- **basePath**: Permite desplegar en subdirectorios
- **redirects**: Redirige raíz a login
- **i18n**: Configuración de internacionalización (actualmente solo inglés)

### 5.3 Configuración de TypeScript

**Archivo: `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "strict": true,
    "moduleResolution": "Bundler",
    
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/@core/*"],
      "@layouts/*": ["./src/@layouts/*"],
      "@menu/*": ["./src/@menu/*"],
      "@assets/*": ["./src/assets/*"],
      "@components/*": ["./src/components/*"],
      "@configs/*": ["./src/configs/*"],
      "@views/*": ["./src/views/*"]
    }
  }
}
```

**Path Aliases configurados:**
- `@/*` → `src/*`
- `@core/*` → `src/@core/*`
- `@layouts/*` → `src/@layouts/*`
- `@menu/*` → `src/@menu/*`
- `@components/*` → `src/components/*`
- `@configs/*` → `src/configs/*`
- `@views/*` → `src/views/*`

### 5.4 Configuración del Tema

**Archivo: `src/configs/themeConfig.ts`**
```typescript
const themeConfig: Config = {
  templateName: 'Vuexy',
  homePageUrl: '/inicio',
  settingsCookieName: 'vuexy-mui-next-demo-1',
  
  // Configuración de apariencia
  mode: 'system',        // 'system' | 'light' | 'dark'
  skin: 'default',       // 'default' | 'bordered'
  semiDark: false,
  layout: 'vertical',    // 'vertical' | 'collapsed' | 'horizontal'
  layoutPadding: 24,
  compactContentWidth: 1440,
  
  // Configuración del Navbar
  navbar: {
    type: 'fixed',       // 'fixed' | 'static'
    contentWidth: 'compact', // 'compact' | 'wide'
    floating: true,
    detached: true,
    blur: true
  },
  
  contentWidth: 'compact',
  
  // Configuración del Footer
  footer: {
    type: 'static',
    contentWidth: 'compact',
    detached: true
  },
  
  disableRipple: false
}
```

### 5.5 Configuración de Tailwind CSS

**Archivo: `tailwind.config.ts`**
```typescript
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  corePlugins: {
    preflight: false  // Deshabilitado para no conflictuar con MUI
  },
  important: '#__next',  // Prioridad sobre estilos de MUI
  plugins: [
    tailwindcssLogical,
    tailwindPlugin  // Plugin personalizado en src/@core/tailwind/plugin
  ]
}
```

**Integración MUI + Tailwind:**
El proyecto utiliza un plugin personalizado que sincroniza variables CSS de MUI con Tailwind:
- Colores primary, secondary, etc.
- Border radius
- Spacing
- Breakpoints

---

## 6. Sistema de Autenticación

### 6.1 Middleware de Autenticación

**Archivo: `middleware.ts`**
```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('one21_token')?.value
  const pathname = request.nextUrl.pathname

  // Redirigir a login si no hay token
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirigir a inicio si ya tiene token en login
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/inicio', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|images|api|static).*)']
}
```

**Funcionamiento:**
1. Se ejecuta en cada request antes de la página
2. Valida presencia del token en cookie `one21_token`
3. Excluye archivos estáticos y APIs de la validación
4. Redirige según estado de autenticación

### 6.2 API de Login

**Archivo: `src/app/api/login/route.ts`**

#### Flujo de Autenticación
```
1. Usuario envía credenciales → POST /api/login
2. API Route → Keycloak (AUTH_API_BASE/auth/login)
3. Keycloak responde con access_token
4. Verificación de token → /auth/verifyToken
5. Búsqueda de Partner por email
6. Respuesta con múltiples cookies:
   - one21_token (httpOnly) → JWT token
   - one21_roles → Lista de roles
   - one21_email → Email del usuario
   - one21_partner → ID del partner
```

#### Cookies Establecidas

| Cookie | HttpOnly | Propósito |
|--------|----------|-----------|
| `one21_token` | ✅ Sí | JWT de autenticación (no accesible desde JS) |
| `one21_roles` | ❌ No | Roles del usuario para control de acceso |
| `one21_email` | ❌ No | Email para mostrar en UI |
| `one21_partner` | ❌ No | ID del business partner |

**Configuración de cookies:**
```typescript
serialize('one21_token', token, {
  httpOnly: true,  // Seguridad contra XSS
  secure: process.env.NODE_ENV === 'production',  // Solo HTTPS en producción
  maxAge: 604800,  // 7 días
  path: '/',
  sameSite: 'lax'  // Protección CSRF
})
```

### 6.3 Vista de Login

**Archivo: `src/views/Login.tsx`**

**Características:**
- Formulario con validación
- Estados de carga con `LoadingProvider`
- Notificaciones con `AlertProvider`
- Responsive design con ilustración condicional
- Integración con tema (light/dark)

**Función de Submit:**
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  esperar()  // Mostrar loading global
  
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (!res.ok) {
      showAlert("error", "Credenciales inválidas")
      throw new Error('Error de autenticación')
    }

    showAlert("success", "Login exitoso")
    router.replace('/inicio')
  } finally {
    finEspera()
  }
}
```

### 6.4 Protección de Rutas

**Server Component: `ProtectedRoute.tsx`**
```typescript
export default async function ProtectedRouteServer({ children }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('one21_token')

  if (!token?.value) {
    redirect('/login')
  }

  return <>{children}</>
}
```

**Client Component: `RoleBasedRoute.tsx`**
```typescript
interface RoleBasedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requiredPermissions?: string[]
  showFallback?: boolean
}
```

**Uso:**
```tsx
<RoleBasedRoute allowedRoles={['admin', 'manager']}>
  <ComponenteProtegido />
</RoleBasedRoute>
```

### 6.5 Constantes de Autenticación

**Archivo: `src/lib/auth.ts`**
```typescript
export const AUTH_COOKIE_NAME = 
  process.env.AUTH_COOKIE_NAME || 'one21_token'

export const AUTH_COOKIE_MAX_AGE = 
  Number(process.env.AUTH_COOKIE_MAX_AGE || 60 * 60 * 24 * 7) // 7 días

export const AUTH_API_BASE = 
  process.env.AUTH_API_BASE || 'https://dev.one21.app'

export const AUTH_STATIC_BEARER = 
  process.env.AUTH_STATIC_BEARER || ''

export const AUTH_TENANT = 
  process.env.AUTH_TENANT || 'one21'
```

---

## 7. Sistema de Layouts

### 7.1 Layout Wrapper

**Archivo: `src/@layouts/LayoutWrapper.tsx`**

```typescript
const LayoutWrapper = (props: LayoutWrapperProps) => {
  const { systemMode, verticalLayout, horizontalLayout } = props
  const { settings } = useSettings()

  useLayoutInit(systemMode)

  return (
    <div className='flex flex-col flex-auto' data-skin={settings.skin}>
      {settings.layout === 'horizontal' ? horizontalLayout : verticalLayout}
    </div>
  )
}
```

**Responsabilidad:**
- Determinar qué layout renderizar según configuración
- Aplicar skin (default/bordered) mediante data-attribute
- Inicializar sistema de layout

### 7.2 Layout Vertical

**Archivo: `src/@layouts/VerticalLayout.tsx`**

```typescript
const VerticalLayout = (props: VerticalLayoutProps) => {
  const { navbar, footer, navigation, children } = props

  return (
    <div className={classnames(verticalLayoutClasses.root, 'flex flex-auto')}>
      {navigation}
      <StyledContentWrapper>
        {navbar}
        <LayoutContent>{children}</LayoutContent>
        {footer}
      </StyledContentWrapper>
    </div>
  )
}
```

**Estructura:**
```
┌─────────────────────────────────┐
│  Navigation (Sidebar)           │
├─────────────────────────────────┤
│  Navbar (Header)                │
├─────────────────────────────────┤
│  Content                        │
│  (children)                     │
│                                 │
├─────────────────────────────────┤
│  Footer                         │
└─────────────────────────────────┘
```

### 7.3 Layout Horizontal

**Archivo: `src/@layouts/HorizontalLayout.tsx`**

**Estructura:**
```
┌─────────────────────────────────┐
│  Header (con navegación)        │
├─────────────────────────────────┤
│  Content                        │
│  (children)                     │
│                                 │
├─────────────────────────────────┤
│  Footer                         │
└─────────────────────────────────┘
```

### 7.4 Layout del Dashboard

**Archivo: `src/app/(dashboard)/layout.tsx`**

```typescript
const Layout = async (props: ChildrenType) => {
  const { children } = props

  // Validación de autenticación
  const cookieStore = await cookies()
  const token = cookieStore.get('one21_token')
  const rolesCookie = cookieStore.get('one21_roles')

  if (!token) {
    redirect('/login')
  }

  const roles: string[] = rolesCookie ? JSON.parse(rolesCookie.value) : []

  return (
    <Providers direction="ltr">
      <LayoutWrapper
        systemMode={systemMode}
        verticalLayout={
          <VerticalLayout
            navigation={<Navigation mode={mode} roles={roles} />}
            navbar={<Navbar />}
            footer={<VerticalFooter />}
          >
            {children}
          </VerticalLayout>
        }
        horizontalLayout={
          <HorizontalLayout 
            header={<Header />} 
            footer={<HorizontalFooter />}
          >
            {children}
          </HorizontalLayout>
        }
      />
      <ScrollToTop />
    </Providers>
  )
}
```

**Características:**
- Validación de token a nivel de servidor
- Extracción de roles para el menú
- Configuración de providers globales
- Renderizado condicional de layout

### 7.5 Layout Root

**Archivo: `src/app/layout.tsx`**

```typescript
const RootLayout = async (props: ChildrenType) => {
  const { children } = props
  const systemMode = await getSystemMode()
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction} suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        <LoadingProvider>
          {children}
          <AlertProvider />
        </LoadingProvider>
      </body>
    </html>
  )
}
```

**Metadata:**
```typescript
export const metadata = {
  title: 'One21 ERP - Bienvenido',
  description: 'One21 ERP - Sistema de gestión empresarial...'
}
```

---

## 8. Sistema de Navegación

### 8.1 Configuración del Menú

**Archivo: `src/configs/menuConfig.ts`**

```typescript
export const menuConfig = [
  {
    type: 'item',
    label: 'Inicio',
    icon: 'tabler-smart-home',
    href: '/inicio',
    roles: ['app-admin', 'patient', 'default-roles-master', 
            'uma_authorization', 'client']
  },
  {
    type: 'section',
    label: 'Módulos ERP',
    children: [
      {
        type: 'item',
        label: 'Empleados',
        href: '/Empleados',
        icon: 'tabler-user',
        roles: ['app-admin']
      },
      {
        type: 'submenu',
        label: 'Ticket',
        icon: 'tabler-box',
        roles: ['app-admin', 'uma_authorization', 'client', 'employee'],
        children: [
          { 
            type: 'item', 
            label: 'Crear Ticket', 
            href: '/ticket/crear', 
            roles: ['app-admin', 'client', 'employee']
          },
          {
            type: 'item',
            label: 'Ver Todos los Tickets',
            href: '/ticket/ver-todos',
            roles: ['app-admin']
          }
        ]
      }
    ]
  }
]
```

**Tipos de items:**
- **item**: Elemento de menú simple con link
- **section**: Sección agrupadora
- **submenu**: Submenú expandible

**Control de acceso:**
Cada item tiene un array `roles` que determina qué roles pueden verlo.

### 8.2 Componente de Menú Vertical

**Archivo: `src/components/layout/vertical/VerticalMenu.tsx`**

```typescript
const VerticalMenu = ({ scrollMenu, roles }: Props) => {
  const hasAccess = (itemRoles?: string[]) => {
    if (!itemRoles || itemRoles.length === 0) return true
    return roles.some(r => itemRoles.includes(r))
  }

  return (
    <ScrollWrapper>
      <Menu>
        {menuConfig.map((item, index) => {
          if (item.type === 'item' && hasAccess(item.roles)) {
            return (
              <MenuItem key={index} href={item.href} icon={...}>
                {item.label}
              </MenuItem>
            )
          }
          
          if (item.type === 'submenu' && hasAccess(item.roles)) {
            return (
              <SubMenu key={index} label={item.label} icon={...}>
                {item.children?.map((sub, sIndex) =>
                  hasAccess(sub.roles) ? (
                    <MenuItem key={sIndex} href={sub.href}>
                      {sub.label}
                    </MenuItem>
                  ) : null
                )}
              </SubMenu>
            )
          }
          
          return null
        })}
      </Menu>
    </ScrollWrapper>
  )
}
```

**Características:**
- Filtrado de items por roles
- Soporte para secciones, items y submenús
- Scroll personalizado con Perfect Scrollbar
- Iconos de Tabler Icons

### 8.3 Componente de Navegación

**Archivo: `src/components/layout/vertical/Navigation.tsx`**

```typescript
const Navigation = (props: Props) => {
  const { mode, roles } = props
  const { isCollapsed, isHovered, collapseVerticalNav } = useVerticalNav()
  const { settings } = useSettings()

  useEffect(() => {
    if (settings.layout === 'collapsed') {
      collapseVerticalNav(true)
    }
  }, [settings.layout])

  return (
    <VerticalNav
      customStyles={navigationCustomStyles(verticalNavOptions, theme)}
      collapsedWidth={71}
      backgroundColor='var(--mui-palette-background-paper)'
    >
      <NavHeader>
        <Link href='/'><Logo /></Link>
        {!(isCollapsed && !isHovered) && (
          <NavCollapseIcons
            onClick={() => updateSettings({ 
              layout: !isCollapsed ? 'collapsed' : 'vertical' 
            })}
          />
        )}
      </NavHeader>
      
      <VerticalMenu scrollMenu={scrollMenu} roles={roles} />
    </VerticalNav>
  )
}
```

**Estados del menú:**
- **expanded**: Menú completo visible (default)
- **collapsed**: Menú colapsado (solo iconos)
- **hovered**: Menú temporal al pasar el mouse

### 8.4 Context de Navegación Vertical

**Archivo: `src/@menu/contexts/verticalNavContext.tsx`**

```typescript
interface VerticalNavContextProps {
  isCollapsed: boolean
  isHovered: boolean
  isBreakpointReached: boolean
  collapseVerticalNav: (collapsed: boolean) => void
  toggleVerticalNav: () => void
  // ... más propiedades
}
```

**Proporciona:**
- Estado de colapso/expansión
- Estado de hover
- Detección de breakpoints responsive
- Funciones de control del menú

### 8.5 GenerateMenu Component

**Archivo: `src/components/GenerateMenu.tsx`**

Componente genérico para generar menús verticales y horizontales a partir de datos:

```typescript
export const GenerateVerticalMenu = ({ menuData }) => {
  const renderMenuItems = (data: VerticalMenuDataType[]) => {
    return data.map((item, index) => {
      if (menuSectionItem.isSection) {
        return (
          <MenuSection key={index} {...rest}>
            {children && renderMenuItems(children)}
          </MenuSection>
        )
      }
      
      if (subMenuItem.children) {
        return (
          <VerticalSubMenu key={index} {...rest}>
            {children && renderMenuItems(children)}
          </VerticalSubMenu>
        )
      }
      
      return <VerticalMenuItem key={index} {...rest} />
    })
  }
  
  return <>{renderMenuItems(menuData)}</>
}
```

---

## 9. Gestión de Estado

### 9.1 Settings Context

**Archivo: `src/@core/contexts/settingsContext.tsx`**

```typescript
export type Settings = {
  mode?: Mode                      // 'system' | 'light' | 'dark'
  skin?: Skin                      // 'default' | 'bordered'
  semiDark?: boolean
  layout?: Layout                  // 'vertical' | 'collapsed' | 'horizontal'
  navbarContentWidth?: LayoutComponentWidth
  contentWidth?: LayoutComponentWidth
  footerContentWidth?: LayoutComponentWidth
  primaryColor?: string
}

interface SettingsContextProps {
  settings: Settings
  updateSettings: (settings: Partial<Settings>, options?) => void
  isSettingsChanged: boolean
  resetSettings: () => void
  updatePageSettings: (settings: Partial<Settings>) => () => void
}
```

**Características:**
- Persistencia en cookies
- Sincronización con configuración inicial
- Actualización reactiva de componentes
- Reset a valores por defecto

**Hook de uso:**
```typescript
const { settings, updateSettings } = useSettings()

// Cambiar tema
updateSettings({ mode: 'dark' })

// Cambiar layout
updateSettings({ layout: 'horizontal' })
```

### 9.2 Vertical Nav Context

**Archivo: `src/@menu/contexts/verticalNavContext.tsx`**

```typescript
interface VerticalNavContextProps {
  isCollapsed: boolean
  isHovered: boolean
  isBreakpointReached: boolean
  transitionDuration: number
  collapseVerticalNav: (collapsed: boolean) => void
  toggleVerticalNav: () => void
}
```

**Hook:**
```typescript
const { isCollapsed, collapseVerticalNav } = useVerticalNav()
```

### 9.3 Loading Provider

**Archivo: `src/components/ui/LoadingModal.tsx`**

```typescript
type LoadingContextType = {
  esperar: () => void
  finEspera: () => void
}

export function LoadingProvider({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <LoadingContext.Provider value={{ esperar, finEspera }}>
      {children}
      <Backdrop open={open}>
        <CircularProgress />
        <Typography>Esperar por favor...</Typography>
      </Backdrop>
    </LoadingContext.Provider>
  )
}
```

**Uso:**
```typescript
const { esperar, finEspera } = useLoading()

const handleSubmit = async () => {
  esperar()
  try {
    await fetch(...)
  } finally {
    finEspera()
  }
}
```

### 9.4 Alert Provider

**Archivo: `src/components/ui/AlertProvider.tsx`**

```typescript
export const showAlert = (
  type: 'success' | 'error' | 'info' | 'warning', 
  message: string
) => {
  toast[type](message)
}

export default function AlertProvider() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={4000}
      hideProgressBar={false}
      theme="colored"
    />
  )
}
```

**Uso:**
```typescript
showAlert("success", "Operación exitosa")
showAlert("error", "Error al guardar")
```

---

## 10. Sistema de Temas

### 10.1 Configuración de Colores

**Archivo: `src/@core/theme/colorSchemes.ts`**

El tema soporta dos esquemas de color:

```typescript
colorSchemes: {
  light: {
    palette: {
      primary: { main: '#7367f0', ... },
      secondary: { main: '#a8aaae', ... },
      error: { main: '#ea5455', ... },
      warning: { main: '#ff9f43', ... },
      info: { main: '#00cfe8', ... },
      success: { main: '#28c76f', ... },
      background: {
        default: '#f8f7fa',
        paper: '#ffffff'
      }
    }
  },
  dark: {
    palette: {
      primary: { main: '#7367f0', ... },
      background: {
        default: '#25293c',
        paper: '#2f3349'
      }
    }
  }
}
```

### 10.2 Tipografía

**Archivo: `src/@core/theme/typography.ts`**

```typescript
const typography: ThemeOptions['typography'] = {
  fontFamily: [
    'Public Sans',
    'sans-serif',
    '-apple-system',
    'BlinkMacSystemFont'
  ].join(','),
  
  fontSize: 13.125,  // Base font size
  
  h1: { fontSize: '2.375rem', fontWeight: 500 },
  h2: { fontSize: '2rem', fontWeight: 500 },
  h3: { fontSize: '1.75rem', fontWeight: 500 },
  h4: { fontSize: '1.5rem', fontWeight: 500 },
  h5: { fontSize: '1.25rem', fontWeight: 500 },
  h6: { fontSize: '1.0625rem', fontWeight: 500 },
  
  body1: { fontSize: '0.9375rem' },
  body2: { fontSize: '0.8125rem' },
  button: { textTransform: 'none' }
}
```

### 10.3 Sombras Personalizadas

**Archivo: `src/@core/theme/customShadows.ts`**

```typescript
customShadows: {
  xs: '0px 1px 2px rgba(0, 0, 0, 0.08)',
  sm: '0px 2px 4px rgba(0, 0, 0, 0.10)',
  md: '0px 4px 8px rgba(0, 0, 0, 0.12)',
  lg: '0px 8px 16px rgba(0, 0, 0, 0.14)',
  xl: '0px 16px 32px rgba(0, 0, 0, 0.16)',
  
  primary: {
    sm: '0px 2px 4px rgba(115, 103, 240, 0.4)',
    md: '0px 4px 8px rgba(115, 103, 240, 0.5)',
    lg: '0px 8px 16px rgba(115, 103, 240, 0.6)'
  }
}
```

### 10.4 Overrides de Componentes

**Archivo: `src/@core/theme/overrides/index.ts`**

El tema incluye overrides para personalizar componentes MUI:

```typescript
const overrides = (skin: Skin): Theme['components'] => ({
  MuiButton,
  MuiCard,
  MuiTextField,
  MuiTabs,
  MuiChip,
  MuiDialog,
  MuiTable,
  MuiPagination,
  // ... más componentes
})
```

**Ejemplo de override (Button):**
```typescript
MuiButton: {
  styleOverrides: {
    root: {
      borderRadius: 8,
      textTransform: 'none',
      fontWeight: 500
    },
    containedPrimary: {
      boxShadow: 'var(--mui-customShadows-primary-sm)'
    }
  }
}
```

### 10.5 Integración Tailwind

**Archivo: `src/@core/tailwind/plugin.ts`**

Plugin personalizado que sincroniza variables MUI con Tailwind:

```typescript
plugin(({ addUtilities, theme }) => {
  addUtilities({
    '.flex-center': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  })
}),

theme: {
  extend: {
    colors: {
      primary: 'var(--mui-palette-primary-main)',
      secondary: 'var(--mui-palette-secondary-main)',
      error: 'var(--mui-palette-error-main)',
      // ... más colores sincronizados
    },
    borderRadius: {
      xs: 'var(--mui-shape-customBorderRadius-xs)',
      sm: 'var(--mui-shape-customBorderRadius-sm)',
      // ...
    }
  }
}
```

---

## 11. Componentes Principales

### 11.1 Componentes UI Globales

#### LoadingModal
**Archivo: `src/components/ui/LoadingModal.tsx`**

Backdrop global para operaciones asíncronas:
```typescript
<LoadingProvider>
  {children}
</LoadingProvider>

// Uso:
const { esperar, finEspera } = useLoading()
```

#### AlertProvider
**Archivo: `src/components/ui/AlertProvider.tsx`**

Sistema de notificaciones toast:
```typescript
showAlert("success", "Guardado correctamente")
showAlert("error", "Error al procesar")
```

#### ConfirmDialog
**Archivo: `src/components/ui/ConfirmDialog.tsx`**

Diálogo de confirmación reutilizable para acciones críticas.

### 11.2 Componentes de Layout

#### Navbar
Barra superior en layout vertical con:
- Breadcrumbs
- Notificaciones
- Perfil de usuario
- Búsqueda global

#### Footer
Pie de página con información de copyright y links.

#### Logo
**Archivo: `src/components/layout/shared/Logo.tsx`**

Componente de logo adaptable al tema (light/dark).

### 11.3 Componentes Core

#### CustomTextField
**Archivo: `src/@core/components/mui/TextField.tsx`**

TextField de MUI con estilos personalizados y variantes.

#### ScrollToTop
**Archivo: `src/@core/components/scroll-to-top/index.tsx`**

Botón flotante para scroll al inicio:
```typescript
<ScrollToTop className="mui-fixed">
  <Button variant="contained">
    <i className="tabler-arrow-up" />
  </Button>
</ScrollToTop>
```

### 11.4 Componentes de Datos

#### DataGrid
Tablas avanzadas con:
- Paginación
- Ordenamiento
- Filtros
- Acciones por fila

**Ejemplo de uso:**
```typescript
const table = useReactTable({
  data: empleadosFiltrados,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 5 } }
})
```

---

## 12. APIs y Servicios

### 12.1 Estructura de API Routes

Todas las API Routes están en `src/app/api/`:

```
api/
├── login/
│   └── route.ts
├── logout/
│   └── route.ts
├── empleados/
│   ├── route.ts
│   ├── crear/
│   ├── listar/
│   ├── status/
│   └── [id]/
│       └── route.ts
├── tickets/
│   ├── ticket/
│   ├── categorias/
│   ├── prioridades/
│   └── status/
├── pather/
│   └── obtener/
│       └── [id]/
└── admin/
```

### 12.2 API de Empleados

#### GET /api/empleados
**Archivo: `src/app/api/empleados/route.ts`**

```typescript
export async function GET(req: NextRequest) {
  const token = req.cookies.get('one21_token')?.value
  
  if (!token) {
    return NextResponse.json(
      { message: 'Token no encontrado' },
      { status: 401 }
    )
  }

  const employeesRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL_EMPLOYEE}/employees`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  )

  const employeesData = await employeesRes.json()

  return NextResponse.json(employeesData, { status: 200 })
}
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "businessPartnerId": 123,
    "hireDate": "2024-01-01",
    "status": "ACTIVE",
    "positionTitle": "Developer",
    "baseSalary": 50000,
    "currencyCode": "USD"
  }
]
```

#### PATCH /api/empleados/[id]
Actualizar estado del empleado (ACTIVE/INACTIVE).

#### PUT /api/empleados/[id]
Actualizar información completa del empleado.

### 12.3 Helpers de API

**Función de validación de token:**
```typescript
function getTokenFromCookies(req: NextRequest) {
  const token = req.cookies.get('one21_token')?.value

  if (!token) {
    return NextResponse.json(
      { message: 'Token no encontrado' },
      { status: 401 }
    )
  }

  return token
}
```

**Función de parseo de respuesta:**
```typescript
async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return await response.json()
  }

  return { message: await response.text() }
}
```

### 12.4 Manejo de Errores

Todas las API Routes implementan manejo de errores consistente:

```typescript
try {
  // Lógica de la API
} catch (err) {
  console.error('Error en /api/empleados:', err)

  return NextResponse.json(
    { step: 'server', message: 'Error interno del servidor' },
    { status: 500 }
  )
}
```

**Estructura de error:**
```json
{
  "step": "auth|employees|server",
  "error": "error_code",
  "message": "Descripción del error"
}
```

---

## 13. Módulos Funcionales

### 13.1 Módulo de Empleados

#### Vista Principal
**Archivo: `src/views/apps/empleados/empleados.tsx`**

**Características:**
- Listado de empleados con tabla paginada
- Búsqueda en tiempo real
- Toggle de estado (Activo/Inactivo)
- Modal de edición
- Integración con API de puestos

**Estados:**
```typescript
const [empleados, setEmpleados] = useState<Empleado[]>([])
const [loading, setLoading] = useState(true)
const [query, setQuery] = useState('')
const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)
const [openModal, setOpenModal] = useState(false)
```

**Flujo de carga:**
```typescript
const fetchData = async () => {
  // 1. Obtener empleados
  const empleadosData = await fetch('/api/empleados')
  
  // 2. Por cada empleado, obtener datos del partner
  const empleadosNormalizados = await Promise.all(
    empleadosData.map(async (emp) => {
      const socio = await fetch(`/api/pather/obtener/${emp.businessPartnerId}`)
      return {
        id: emp.id,
        nombre: socio?.name,
        email: socio?.email,
        telefono: socio?.phone,
        fecha: emp.hireDate,
        activo: emp.status === 'ACTIVE'
      }
    })
  )
}
```

**Columnas de la tabla:**
```typescript
const columns = [
  columnHelper.accessor('nombre', { header: 'Nombre' }),
  columnHelper.accessor('email', { header: 'Correo Electrónico' }),
  columnHelper.accessor('telefono', { header: 'Teléfono' }),
  columnHelper.accessor('fecha', {
    header: 'Fecha',
    cell: info => new Date(info.getValue()).toLocaleDateString()
  }),
  columnHelper.accessor('activo', {
    header: 'Estado',
    cell: info => (
      <Switch 
        checked={info.getValue()} 
        onChange={e => toggleActivo(info.row.original.id, e.target.checked)} 
      />
    )
  }),
  columnHelper.display({
    id: 'acciones',
    header: 'Acciones',
    cell: info => (
      <IconButton onClick={() => handleEditar(info.row.original)}>
        <i className='tabler-edit' />
      </IconButton>
    )
  })
]
```

#### Ruta de Página
**Archivo: `src/app/(dashboard)/Empleados/page.tsx`**

```typescript
export default function ClientesPage() {
  return <Empleados />
}
```

### 13.2 Módulo de Tickets

#### Estructura
```
ticket/
├── crear/           # Creación de tickets
├── ver-todos/       # Lista completa (admin)
├── ver-cliente/     # Tickets del cliente actual
└── asignar/         # Asignación de tickets
```

#### Configuración de Menú
```typescript
{
  type: 'submenu',
  label: 'Ticket',
  icon: 'tabler-box',
  roles: ['app-admin', 'uma_authorization', 'client', 'employee'],
  children: [
    { 
      label: 'Crear Ticket', 
      href: '/ticket/crear', 
      roles: ['app-admin', 'client', 'employee'] 
    },
    { 
      label: 'Ver Todos los Tickets', 
      href: '/ticket/ver-todos', 
      roles: ['app-admin'] 
    },
    { 
      label: 'Seguimiento de Tickets', 
      href: '/kanban', 
      roles: ['employee'] 
    }
  ]
}
```

### 13.3 Módulo de Configuración

Incluye mantenimiento de tablas:
- **Países** (`/countries`)
- **Roles** (`/roles`)
- **Puestos de trabajo** (`/job_position`)
- **Departamentos de trabajo** (`/employee_departaments`)
- **Departamentos** (`/departments`)
- **Municipios** (`/municipalities`)

**Acceso:** Solo `app-admin`

---

## 14. Sistema de Testing

### 14.1 Configuración de Cypress

**Archivo: `cypress.config.js`**
```javascript
module.exports = defineConfig({
  projectId: 'byko7n',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
```

### 14.2 Tests E2E

#### Tests de Login
**Archivo: `cypress/e2e/login/login-exitoso.cy.js`**
- Login con credenciales válidas
- Verificación de redirección
- Validación de token en cookies

**Archivo: `cypress/e2e/login/login-fallido.cy.js`**
- Login con credenciales inválidas
- Verificación de mensajes de error

#### Tests de Empleados
```
empleados/
├── empleados-actualizacion.cy.js
├── empleados-busqueda.js
├── empleados-busquedav2.cy.js
├── empleados-carga.spec.js
├── empleados-crear.spec.js
└── empleados-eliminacion.cy.js
```

#### Tests de Tickets
```
tickets/
├── ticket-asignar.spec.js
└── ticket-validation.cy.js
```

### 14.3 Comandos Personalizados

**Archivo: `cypress/support/commands.js`**
Comandos reutilizables para:
- Login automático
- Navegación común
- Verificaciones de elementos

---

## 15. Despliegue y DevOps

### 15.1 Dockerfile

**Archivo: `Dockerfile`**

#### Stage 1: Build
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY . .
RUN npm run build:icons
RUN npm run build
```

#### Stage 2: Runtime
```dockerfile
FROM node:18-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "start"]
```

**Optimizaciones:**
- Build multi-stage para reducir tamaño de imagen
- Solo dependencias de producción en runtime
- Cache de node_modules

### 15.2 Helm Chart

**Archivo: `charts/Chart.yaml`**
```yaml
apiVersion: v2
name: one21-frontend
description: A Helm chart for Kubernetes
type: application
version: 0.1.0
appVersion: "1.16.0"
```

**Archivo: `charts/values.yaml`**

```yaml
replicaCount: 1
namespace: one21
containerPort: 3000

image:
  repository: seminariojalapa/dev-one21-frontend
  tag: '8'
  pullPolicy: Always

ingress:
  enabled: true
  host: one21.app
  tlsSecretName: frontend-tls-secret

service:
  type: ClusterIP
  port: 3003

resources:
  requests:
    cpu: '30m'
    memory: '100Mi'

livenessProbe:
  tcpSocket:
    port: 3000
readinessProbe:
  tcpSocket:
    port: 3000
  initialDelaySeconds: 3

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
```

### 15.3 Deployment

**Archivo: `charts/templates/deployment.yaml`**

Incluye:
- Health checks (liveness, readiness, startup)
- Resource limits
- Security context
- Environment variables
- Pod anti-affinity para alta disponibilidad

### 15.4 Ingress

**Archivo: `charts/templates/ingress.yaml`**

Configuración de:
- TLS con Let's Encrypt
- Routing a servicios
- Annotations de Nginx

### 15.5 ConfigMap

**Archivo: `charts/templates/configmap.yaml`**

Variables de entorno para:
- URLs de APIs backend
- Configuración de autenticación
- Tenant y credenciales

---

## 16. Scripts y Comandos

### 16.1 Scripts de Package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx}\"",
    "build:icons": "tsx src/assets/iconify-icons/bundle-icons-css.ts"
  }
}
```

### 16.2 Desarrollo

```bash
# Instalar dependencias
npm install

# Modo desarrollo (con Turbopack)
npm run dev

# Compilar iconos
npm run build:icons

# Ejecutar linter
npm run lint
npm run lint:fix

# Formatear código
npm run format
```

### 16.3 Producción

```bash
# Build de producción
npm run build

# Iniciar servidor
npm start
```

### 16.4 Docker

```bash
# Construir imagen
docker build -t one21-frontend:latest .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e AUTH_API_BASE=https://dev.one21.app \
  -e AUTH_COOKIE_NAME=one21_token \
  one21-frontend:latest
```

### 16.5 Kubernetes

```bash
# Desplegar con Helm
helm install one21-frontend ./charts \
  --namespace one21 \
  --create-namespace

# Actualizar deployment
helm upgrade one21-frontend ./charts \
  --namespace one21

# Ver estado
kubectl get pods -n one21
kubectl logs -f <pod-name> -n one21
```

### 16.6 Cypress

```bash
# Abrir Cypress UI
npx cypress open

# Ejecutar tests en modo headless
npx cypress run

# Ejecutar test específico
npx cypress run --spec cypress/e2e/login/login-exitoso.cy.js
```

---

## Apéndices

### A. Tipos TypeScript Principales

#### Config Types
```typescript
export type Mode = 'system' | 'light' | 'dark'
export type Skin = 'default' | 'bordered'
export type Layout = 'vertical' | 'collapsed' | 'horizontal'
export type LayoutComponentWidth = 'compact' | 'wide'
export type LayoutComponentPosition = 'fixed' | 'static'
```

#### Menu Types
```typescript
export type VerticalMenuItemDataType = {
  label: ReactNode
  href?: string
  icon?: string
  excludeLang?: boolean
  prefix?: ReactNode | ChipProps
  suffix?: ReactNode | ChipProps
}

export type VerticalSubMenuDataType = {
  label: string
  children: VerticalMenuDataType[]
  icon?: string
}

export type VerticalSectionDataType = {
  isSection: boolean
  label: string
  children: VerticalMenuDataType[]
}
```

### B. Variables CSS Personalizadas

```css
:root {
  /* Colores principales */
  --mui-palette-primary-main: #7367f0;
  --mui-palette-secondary-main: #a8aaae;
  
  /* Background */
  --mui-palette-background-default: #f8f7fa;
  --mui-palette-background-paper: #ffffff;
  
  /* Border radius */
  --mui-shape-customBorderRadius-xs: 2px;
  --mui-shape-customBorderRadius-sm: 4px;
  
  /* Shadows */
  --mui-customShadows-xs: 0px 1px 2px rgba(0, 0, 0, 0.08);
}
```

### C. Estructura de Cookies

| Cookie | Valor | Seguridad |
|--------|-------|-----------|
| `one21_token` | JWT string | httpOnly, secure, sameSite: lax |
| `one21_roles` | JSON array | secure, sameSite: lax |
| `one21_email` | string | secure, sameSite: lax |
| `one21_partner` | number string | secure, sameSite: lax |
| `vuexy-mui-next-demo-1` | Settings JSON | sameSite: lax |

### D. Roles del Sistema

| Role | Descripción | Acceso |
|------|-------------|--------|
| `app-admin` | Administrador | Acceso completo |
| `employee` | Empleado | Módulo de tickets, kanban |
| `client` | Cliente | Ver tickets propios, crear tickets |
| `uma_authorization` | Usuario autorizado | Acceso limitado |

---

**Versión del Manual:** 1.0  
**Fecha:** 30 de Octubre de 2025  
**Proyecto:** One21 ERP Frontend  
**Framework:** Next.js 15.1.2

---

**Fin del Manual Técnico**
