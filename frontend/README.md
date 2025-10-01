# 🎨 Frontend - Sistema de Gestión CRM

Aplicación React con TypeScript construida con Vite, que incluye el panel administrativo (CRM) y el portal del cliente.

## 🚀 Tecnologías

- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router** - Enrutamiento
- **TailwindCSS** - Estilos
- **Context API** - Estado global

## 📁 Estructura

```
/frontend
├── /src
│   ├── /crm                     # Panel Administrativo
│   │   ├── /components          # Componentes del CRM
│   │   ├── /pages               # Páginas del CRM
│   │   ├── /context             # Context API
│   │   ├── /hooks               # Custom hooks
│   │   ├── /utils               # Utilidades
│   │   ├── /types               # Tipos TypeScript
│   │   ├── /config              # Configuración de permisos
│   │   ├── /data                # Mock data
│   │   └── CRMApp.tsx           # App principal del CRM
│   │
│   ├── /cliente                 # Portal del Cliente
│   │   ├── /components          # Componentes del cliente
│   │   ├── /pages               # Páginas del cliente
│   │   └── ClienteApp.tsx       # App principal del cliente
│   │
│   ├── /components              # Componentes compartidos
│   │   └── /common              # Button, Input, Modal, etc.
│   │
│   ├── App.tsx                  # Router principal
│   ├── main.tsx                 # Entry point
│   └── index.css                # Estilos globales
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## ⚙️ Configuración

### Instalación

```bash
cd frontend
npm install
```

### Variables de Entorno (opcional)

Crea `.env` en `/frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃 Comandos

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🗺️ Rutas

### Panel CRM (Administración)
- `/crm/login` - Login de administradores
- `/crm/dashboard` - Dashboard principal
- `/crm/usuarios` - Gestión de usuarios
- `/crm/vehiculos` - Gestión de vehículos
- `/crm/clientes` - Gestión de clientes
- `/crm/reservas` - Gestión de reservas
- `/crm/facturacion` - Gestión de facturas
- `/crm/contratos` - Gestión de contratos
- `/crm/perfil` - Perfil de usuario

### Portal Cliente
- `/cliente/login` - Login de clientes
- `/cliente/dashboard` - Dashboard del cliente
- `/cliente/reservas` - Mis reservas
- `/cliente/facturas` - Mis facturas
- `/cliente/contratos` - Mis contratos
- `/cliente/perfil` - Mi perfil

## 👥 Sistema de Roles

### Super Admin
- Acceso completo a todos los módulos
- CRUD de usuarios (incluye crear Admins)

### Admin
- Gestión de vehículos, clientes y reservas
- Aprobar/rechazar reservas
- NO puede modificar Super Admins

### Operador
- Crear pre-reservas (requieren aprobación)
- Agregar clientes (quedan pendientes)
- Ver vehículos (sin tarifas)

### Cliente
- Ver solo su información
- Consultar reservas propias
- Ver facturas y contratos propios

## 🎨 Path Aliases

Configurados en `vite.config.ts`:

```typescript
import Button from '@shared/common/Button';
import { useAuth } from '@crm/context/AuthContext';
import ClienteLayout from '@cliente/components/ClienteLayout';
```

## 🔒 Rutas Protegidas

Componente `ProtectedRoute`:

```tsx
<Route
  path="usuarios"
  element={
    <ProtectedRoute module="usuarios">
      <Usuarios />
    </ProtectedRoute>
  }
/>
```

## 🎭 Context API

### AuthContext

```tsx
import { useAuth } from '@crm/context/AuthContext';

const { currentUser, isAuthenticated, login, logout } = useAuth();
```

## 🪝 Custom Hooks

### useForm
```tsx
const { values, errors, handleChange, handleSubmit } = useForm({
  initialValues: { name: '', email: '' },
  onSubmit: (data) => console.log(data),
  validate: (data) => ({ /* errors */ })
});
```

### usePermissions
```tsx
const { canCreate, canEdit, canDelete } = usePermissions('vehiculos');
```

## 🎨 Componentes Reutilizables

En `/src/components/common`:

- **Button** - Botones con variantes
- **Input** - Inputs con validación
- **Select** - Selectores
- **Modal** - Modales
- **Table** - Tablas con datos
- **Card** - Tarjetas
- **Badge** - Etiquetas de estado
- **SearchBar** - Barra de búsqueda
- **StatCard** - Tarjetas de estadísticas

Ejemplo:
```tsx
import { Button, Input, Modal } from '@shared/common';

<Button variant="primary" onClick={handleClick}>
  Guardar
</Button>
```

## 🎨 TailwindCSS

### Clases Personalizadas

Definidas en `index.css`:

```css
.btn-primary      /* Botón primario */
.btn-secondary    /* Botón secundario */
.input-field      /* Input estilizado */
.card             /* Tarjeta */
.badge-success    /* Badge verde */
```

### Colores del Tema

```javascript
primary: {
  500: '#8b5cf6',
  600: '#7c3aed',
  // ...
}
```

## 🔄 Integración con Backend

### Configuración de API

```typescript
// src/utils/api.ts (pendiente crear)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  get: (endpoint: string) => fetch(`${API_URL}${endpoint}`),
  // ...
};
```

### Migrar de Mock a API Real

```tsx
// Antes (mock)
const [clientes, setClientes] = useState(mockClientes);

// Después (con API)
const [clientes, setClientes] = useState([]);
useEffect(() => {
  fetch('/api/clientes', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setClientes(data));
}, []);
```

## 📦 Build y Deploy

### Build de Producción

```bash
npm run build
```

El build se genera en `/dist`

### Deploy

Compatible con:
- **Vercel** - `vercel deploy`
- **Netlify** - Arrastra `/dist`
- **GitHub Pages** - Configura `base` en vite.config.ts

## 🎯 Estado del Proyecto

### ✅ Completado
- [x] Panel CRM completo (9 módulos)
- [x] Portal Cliente (5 páginas)
- [x] Sistema de autenticación simulado
- [x] Sistema de permisos por rol
- [x] Componentes reutilizables
- [x] Rutas protegidas
- [x] Validación de formularios
- [x] Diseño responsivo

### 🚧 Pendiente
- [ ] Integración con backend real
- [ ] Tests (Jest + React Testing Library)
- [ ] Lazy loading de rutas
- [ ] Optimización de imágenes
- [ ] PWA (Progressive Web App)
- [ ] Internacionalización (i18n)
- [ ] Theme switcher (dark mode)

## 🎨 Personalización

### Cambiar Iconos

Actualmente usa emojis como placeholders:

```tsx
// Instalar librería de iconos
npm install lucide-react

// Reemplazar
import { Car } from 'lucide-react';
<Car className="w-5 h-5" />
```

### Cambiar Colores

Edita `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* tus colores */ }
    }
  }
}
```

## 📚 Recursos

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

---

**Nota**: El frontend está completamente funcional con datos simulados. Para producción, conectar con el backend API.
