# 🏗️ Arquitectura del Sistema CRM

## Visión General

Este documento describe la arquitectura técnica del Sistema de Gestión CRM, sus patrones de diseño, decisiones arquitectónicas y mejores prácticas implementadas.

## 📐 Arquitectura de Capas

```
┌─────────────────────────────────────────────┐
│           Capa de Presentación              │
│  (Components, Pages, Layout)                │
├─────────────────────────────────────────────┤
│           Capa de Lógica de Negocio         │
│  (Custom Hooks, Context API, Utils)         │
├─────────────────────────────────────────────┤
│           Capa de Datos                     │
│  (Mock Data, Types, Validations)            │
├─────────────────────────────────────────────┤
│           Capa de Configuración             │
│  (Permissions, Routes, Tailwind Config)     │
└─────────────────────────────────────────────┘
```

## 🔧 Patrones de Diseño Implementados

### 1. **Context API Pattern**
- **Ubicación**: `src/context/AuthContext.tsx`
- **Propósito**: Gestión de estado global de autenticación
- **Beneficios**: 
  - Evita prop drilling
  - Estado centralizado
  - Fácil acceso desde cualquier componente

```tsx
// Uso
const { currentUser, login, logout } = useAuth();
```

### 2. **Custom Hooks Pattern**
- **Ubicación**: `src/hooks/`
- **Hooks creados**:
  - `useForm`: Manejo de formularios con validación
  - `usePermissions`: Verificación de permisos por rol

```tsx
// Ejemplo useForm
const { values, errors, handleChange, handleSubmit } = useForm({
  initialValues,
  onSubmit,
  validate
});
```

### 3. **Component Composition Pattern**
- **Componentes reutilizables**: `src/components/common/`
- **Componentes especializados**: `src/pages/`

### 4. **Protected Routes Pattern**
- **Implementación**: `ProtectedRoute` component
- **Seguridad**: Verificación de rol antes de renderizar

### 5. **Container/Presentational Pattern**
- **Container**: Páginas con lógica (src/pages)
- **Presentational**: Componentes puros (src/components/common)

## 🔐 Sistema de Seguridad

### Niveles de Seguridad Implementados

#### 1. **Seguridad de Rutas**
```tsx
<ProtectedRoute module="usuarios">
  <Usuarios />
</ProtectedRoute>
```

#### 2. **Seguridad de Componentes**
```tsx
{canCreate && (
  <Button onClick={openModal}>Crear</Button>
)}
```

#### 3. **Validación de Inputs**
```tsx
const validation = validateForm({
  email: { value, rules: { required: true, email: true } }
});
```

#### 4. **Sanitización de Datos**
```tsx
const sanitizedValue = sanitizeInput(userInput);
```

### Matriz de Permisos

| Módulo       | Super Admin | Admin | Operador | Cliente |
|--------------|-------------|-------|----------|---------|
| Dashboard    | ✅ Ver      | ✅ Ver | ✅ Ver   | ✅ Ver  |
| Usuarios     | ✅ CRUD     | 👁️ Ver/Edit | ❌     | ❌      |
| Vehículos    | ✅ CRUD     | ✅ CRUD | 👁️ Ver  | ❌      |
| Clientes     | ✅ CRUD+Aprobar | ✅ CRUD+Aprobar | ➕ Crear | ❌ |
| Reservas     | ✅ CRUD+Aprobar | ✅ CRUD+Aprobar | ➕ Pre-reserva | 👁️ Ver propias |
| Facturación  | ✅ CRUD     | ✅ CRUD | ❌       | 👁️ Ver propias |
| Contratos    | ✅ CRUD     | ✅ CRUD | ❌       | 👁️ Ver propios |
| Perfil       | ✅ Edit     | ✅ Edit | ✅ Edit  | ✅ Edit |

## 📊 Flujo de Datos

### Flujo de Autenticación
```
Usuario selecciona rol
    ↓
AuthContext.login(role)
    ↓
Cargar usuario mock
    ↓
Guardar en localStorage
    ↓
Actualizar estado global
    ↓
Redirigir a Dashboard
    ↓
Renderizar sidebar según permisos
```

### Flujo de Formularios
```
Usuario ingresa datos
    ↓
onChange → sanitizeInput
    ↓
Actualizar estado local
    ↓
onSubmit → validate
    ↓
¿Válido?
├─ Sí → Guardar/Actualizar datos
└─ No → Mostrar errores
```

### Flujo de Permisos
```
Usuario intenta acceder a módulo
    ↓
ProtectedRoute verifica autenticación
    ↓
¿Autenticado?
├─ No → Redirigir a Login
└─ Sí ↓
    Verificar permisos del módulo
    ↓
    ¿Tiene acceso?
    ├─ Sí → Renderizar componente
    └─ No → Mostrar "Acceso Denegado"
```

## 🗂️ Organización de Archivos

### Principios de Organización

1. **Separación por Responsabilidad**
   - Components: Solo UI
   - Pages: Lógica de página
   - Hooks: Lógica reutilizable
   - Utils: Funciones utilitarias

2. **Nomenclatura**
   - Componentes: PascalCase (Button.tsx)
   - Hooks: camelCase con 'use' (useForm.ts)
   - Utils: camelCase (validation.ts)
   - Types: PascalCase (index.ts exports)

3. **Index Files**
   - Barrel exports en `components/common/index.ts`
   - Simplifica imports

## 🎨 Estrategia de Estilos

### TailwindCSS + Clases Utilitarias

```css
/* Clases personalizadas en index.css */
.btn-primary { @apply bg-primary-600 hover:bg-primary-700 ... }
.input-field { @apply w-full px-4 py-2 border ... }
```

### Diseño Responsivo
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Grid system con Tailwind

### Tema de Colores
```js
primary: {
  50-900: Paleta de morados
}
success: Verde
danger: Rojo
warning: Amarillo
```

## 🔄 Estado y Gestión de Datos

### Estado Local (useState)
- Uso: Datos específicos de componente
- Ejemplo: Modal abierto/cerrado, filtros locales

### Estado Global (Context API)
- Uso: Usuario autenticado, permisos
- Beneficio: Acceso desde cualquier componente

### Estado de Formularios (useForm)
- Valores, errores, touched
- Validación integrada
- Sanitización automática

## 🧪 Datos Mock

### Estructura
```ts
mockData.ts
├── mockUsers[]
├── mockClientes[]
├── mockVehiculos[]
├── mockReservas[]
├── mockFacturas[]
└── mockDashboardStats{}
```

### Migración a Backend
```tsx
// Paso 1: Crear servicio API
const api = {
  getClientes: () => fetch('/api/clientes')
};

// Paso 2: Reemplazar en componente
const [clientes, setClientes] = useState([]);
useEffect(() => {
  api.getClientes()
    .then(res => res.json())
    .then(setClientes);
}, []);
```

## 📱 Componentes Reutilizables

### Componentes Base (Atomic Design)

#### Átomos
- Button
- Input
- Select
- Badge

#### Moléculas
- SearchBar
- StatCard
- Modal

#### Organismos
- Table
- Card (con contenido)
- Sidebar
- Navbar

### Props Pattern
```tsx
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}
```

## 🚀 Optimizaciones Implementadas

### 1. **useMemo para Filtrado**
```tsx
const filteredData = useMemo(() => {
  return data.filter(/* filtros */);
}, [data, searchQuery, filters]);
```

### 2. **Validación Optimizada**
- Validación solo en onChange/onBlur
- Debouncing de búsquedas (pendiente)

### 3. **Code Splitting (Preparado)**
```tsx
// Futuro: Lazy loading de rutas
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

## 🔒 Mejores Prácticas de Seguridad

### Frontend Security Checklist

✅ **Validación de Inputs**
- Sanitización de strings
- Validación de formato
- Límites de longitud

✅ **Control de Acceso**
- Rutas protegidas
- Permisos por rol
- Verificación doble (UI + lógica)

✅ **Prevención XSS**
- Sanitización de inputs
- No usar dangerouslySetInnerHTML
- Escapado automático de React

✅ **Gestión de Sesión**
- LocalStorage para persistencia
- Logout limpia datos
- No almacenar datos sensibles

⚠️ **Pendiente (Backend)**
- CSRF tokens
- Rate limiting
- JWT con refresh tokens
- HTTPS obligatorio

## 📈 Escalabilidad

### Preparado para Escalar

1. **Estructura Modular**
   - Fácil agregar nuevos módulos
   - Componentes reutilizables
   - Hooks compartidos

2. **TypeScript**
   - Tipos estrictos
   - Autocompletado
   - Refactoring seguro

3. **Configuración Centralizada**
   - Permisos en config/
   - Rutas centralizadas
   - Constantes globales

### Recomendaciones para Escalar

1. **State Management**
   - Para apps grandes: considerar Redux Toolkit
   - O Zustand para simplicidad

2. **API Layer**
   - Crear carpeta `src/services/`
   - Axios con interceptors
   - React Query para cache

3. **Testing**
   - Jest para unit tests
   - React Testing Library
   - Cypress para E2E

4. **Performance**
   - React.memo para componentes pesados
   - Virtualización de listas largas
   - Lazy loading de imágenes

## 🛣️ Sistema de Rutas

### Estructura de Rutas
```tsx
/
├── /login (público)
└── / (protegido - MainLayout)
    ├── /dashboard
    ├── /usuarios
    ├── /vehiculos
    ├── /clientes
    ├── /reservas
    ├── /facturacion
    ├── /contratos
    └── /perfil
```

### Navegación Programática
```tsx
const navigate = useNavigate();
navigate('/dashboard');
```

## 🎯 Decisiones Arquitectónicas

### ¿Por qué Context API y no Redux?

**Ventajas Context API**:
- ✅ Built-in, no dependencias extra
- ✅ Simple para proyectos medianos
- ✅ Menos boilerplate
- ✅ Suficiente para autenticación

**Cuándo migrar a Redux**:
- App con >10 contextos
- Estado muy complejo
- Necesidad de DevTools avanzados
- Time-travel debugging

### ¿Por qué TailwindCSS?

- ✅ Desarrollo rápido
- ✅ Diseño consistente
- ✅ Purge CSS automático
- ✅ Responsive fácil
- ✅ No hay CSS modules que mantener

### ¿Por qué Mock Data en Frontend?

- ✅ Desarrollo independiente del backend
- ✅ Testing sin API
- ✅ Demos y prototipos
- ✅ Fácil migración a API real

## 📚 Documentación del Código

### Convenciones de Comentarios

```tsx
// ==================== SECCIÓN PRINCIPAL ====================

/**
 * Descripción del componente
 * @param props - Descripción de props
 * @returns JSX Element
 */

// TODO: Implementar feature X
// FIXME: Corregir bug Y
// NOTE: Información importante
```

## 🔄 Ciclo de Vida del Proyecto

### Fase 1: Desarrollo Frontend ✅
- Setup inicial
- Componentes base
- Páginas principales
- Mock data
- Seguridad frontend

### Fase 2: Backend Integration (Siguiente)
- API REST/GraphQL
- Autenticación JWT
- Base de datos
- Endpoints CRUD

### Fase 3: Testing
- Unit tests
- Integration tests
- E2E tests

### Fase 4: Deployment
- Build optimizado
- CI/CD pipeline
- Hosting (Vercel/Netlify)

---

Esta arquitectura está diseñada para ser:
- ✅ **Mantenible**: Código limpio y organizado
- ✅ **Escalable**: Fácil de crecer
- ✅ **Segura**: Validaciones y permisos
- ✅ **Profesional**: Mejores prácticas de la industria
