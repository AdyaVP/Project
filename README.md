# 🏢 Sistema de Gestión - CRM Profesional

Sistema CRM completo con panel administrativo, portal de cliente y backend API. Desarrollado con React + TypeScript (Vite), Node.js + Express y arquitectura modular profesional.

## 📁 Estructura del Proyecto (Limpia y Organizada)

```
/Project
├── /frontend                    # ⚛️ Aplicación React con Vite
│   ├── /src
│   │   ├── /crm                # Panel administrativo (CRM)
│   │   ├── /cliente            # Portal del cliente
│   │   ├── /components         # Componentes compartidos
│   │   ├── App.tsx             # App principal con router
│   │   └── main.tsx            # Entry point
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── /backend                     # 🔧 API REST con Node.js
│   ├── /src
│   │   ├── /routes             # Rutas de la API
│   │   ├── /middleware         # Middleware (auth, validation)
│   │   ├── /utils              # Utilidades (JWT, password)
│   │   ├── /types              # Tipos TypeScript
│   │   └── index.ts            # Servidor Express
│   ├── /prisma
│   │   └── schema.prisma       # Schema de base de datos
│   ├── tsconfig.json
│   └── package.json
│
└── 📚 Documentación
    ├── README.md                # Este archivo
    ├── ARQUITECTURA.md          # Documentación técnica
    ├── INICIO_RAPIDO.md         # Setup rápido
    ├── ESTRUCTURA_PROYECTO.md   # Árbol completo
    ├── COMANDOS_UTILES.md       # Referencia comandos
    ├── PULIR_FRONTEND.md        # Guía de mejoras UI
    └── PROYECTO_COMPLETADO.md   # Resumen final
```

✅ **Estructura limpia** - Sin archivos legacy

## 🚀 Características Principales

- ✅ **React 18** con TypeScript y Functional Components
- ✅ **TailwindCSS** para diseño moderno y responsivo
- ✅ **React Router** para navegación entre módulos
- ✅ **Context API** para manejo de autenticación y roles
- ✅ **Arquitectura modular** y escalable
- ✅ **Sistema de permisos** por roles
- ✅ **Validación de formularios** en frontend
- ✅ **Componentes reutilizables** y custom hooks
- ✅ **Seguridad frontend** implementada

## 📋 Requisitos Previos

- Node.js 16.x o superior
- npm o yarn

## 🛠️ Instalación y Configuración

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Backend (Node.js + Express)

```bash
cd backend

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus configuraciones
# Especialmente DATABASE_URL y JWT_SECRET

# Instalar dependencias
npm install

# Configurar base de datos (Prisma)
npx prisma generate
npx prisma migrate dev

# Iniciar servidor
npm run dev
```

El backend estará disponible en `http://localhost:5000`

### Rutas de Acceso

- **Panel CRM (Admin)**: `http://localhost:3000/crm`
- **Portal Cliente**: `http://localhost:3000/cliente`
- **API Backend**: `http://localhost:5000/api`

## 👥 Roles de Usuario

El sistema cuenta con 4 roles diferentes, cada uno con permisos específicos:

### 1. 👑 Super Admin
- CRUD completo de usuarios (incluyendo crear Admins)
- Acceso total a todos los módulos
- Puede modificar cualquier registro

### 2. ⚡ Admin
- CRUD de clientes y vehículos
- Aprobar/rechazar reservas
- Gestionar facturación
- **NO** puede modificar al Super Admin

### 3. 📋 Operador
- Crear pre-reservas (requieren aprobación)
- Agregar clientes (quedan en estado pendiente)
- Ver vehículos (solo lectura)
- **NO** puede ver tarifas de vehículos

### 4. 👤 Cliente
- Ver su perfil personal
- Consultar historial de reservas
- Ver contratos propios
- Ver facturas propias
- **NO** puede gestionar otros registros

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── auth/            # Componentes de autenticación
│   │   └── ProtectedRoute.tsx
│   ├── common/          # Componentes UI comunes
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── StatCard.tsx
│   │   └── SearchBar.tsx
│   └── layout/          # Componentes de layout
│       ├── Sidebar.tsx
│       ├── Navbar.tsx
│       └── MainLayout.tsx
├── config/              # Configuraciones
│   └── permissions.ts   # Configuración de permisos por rol
├── context/             # Context API
│   └── AuthContext.tsx  # Contexto de autenticación
├── data/                # Datos simulados
│   └── mockData.ts      # Mock data para desarrollo
├── hooks/               # Custom Hooks
│   ├── useForm.ts       # Hook para manejo de formularios
│   └── usePermissions.ts # Hook para verificar permisos
├── pages/               # Páginas principales
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Usuarios.tsx
│   ├── Vehiculos.tsx
│   ├── Clientes.tsx
│   ├── Reservas.tsx
│   ├── Facturacion.tsx
│   ├── Contratos.tsx
│   └── Perfil.tsx
├── routes/              # Configuración de rutas
│   └── index.tsx
├── types/               # Tipos TypeScript
│   └── index.ts
├── utils/               # Utilidades
│   ├── validation.ts    # Funciones de validación
│   └── formatters.ts    # Funciones de formato
├── App.tsx              # Componente principal
├── index.tsx            # Entry point
└── index.css            # Estilos globales
```

## 🔐 Sistema de Autenticación

El proyecto incluye un sistema de login simulado para demostración:

1. Navega a `/login`
2. Selecciona un rol (Super Admin, Admin, Operador o Cliente)
3. El sistema cargará los permisos correspondientes
4. Serás redirigido al dashboard con acceso a los módulos permitidos

**Nota:** No requiere credenciales, es una simulación para frontend.

## 🎨 Personalización de Iconos

Los iconos actualmente usan emojis como placeholders. Para reemplazarlos con iconos de Flaticon u otra librería:

1. Localiza los archivos donde se usan iconos (busca emojis como 🏢, 📊, etc.)
2. Reemplaza con tu componente de icono preferido:

```tsx
// Antes (placeholder)
<span className="text-xl">🚗</span>

// Después (con tu librería de iconos)
<CarIcon className="w-5 h-5" />
```

Archivos principales con iconos:
- `src/components/layout/Sidebar.tsx`
- `src/config/permissions.ts`
- `src/pages/Dashboard.tsx`
- Todos los archivos en `src/pages/`

## 🔒 Seguridad Frontend Implementada

### 1. Validación de Inputs
- Sanitización automática de inputs de usuario
- Validación de formato (email, teléfono, etc.)
- Validación de longitud mínima/máxima
- Validación de campos requeridos

### 2. Control de Acceso por Rol
- Rutas protegidas con `ProtectedRoute`
- Verificación de permisos antes de renderizar componentes
- Sidebar dinámico según rol del usuario
- Bloqueo de acciones no permitidas

### 3. Manejo Seguro de Estado
- No se exponen datos sensibles en el código
- LocalStorage solo para datos necesarios
- Estado global con Context API

### 4. Prevención de Acciones Peligrosas
- Confirmaciones para acciones destructivas
- Validación doble en formularios críticos
- Mensajes de error claros y seguros

## 📊 Módulos del Sistema

### Dashboard
Vista general con estadísticas adaptadas según el rol del usuario.

### Usuarios (Super Admin / Admin)
- Crear, editar y eliminar usuarios
- Asignar roles
- Gestionar estados (activo/inactivo)

### Vehículos
- CRUD completo de vehículos
- Gestión de estados (disponible, reservado, en mantenimiento)
- Control de tarifas (oculto para Operadores)

### Clientes
- Gestión de información de clientes
- Aprobación de clientes agregados por Operadores
- Estados: activo, inactivo, pendiente

### Reservas
- Crear pre-reservas (Operadores)
- Crear reservas confirmadas (Admin/Super Admin)
- Aprobar/rechazar pre-reservas
- Cálculo automático de costos

### Facturación
- Gestión de facturas
- Estados: pagada, pendiente, vencida
- Cálculo de impuestos
- Registro de pagos

### Contratos
- Visualización de contratos de alquiler
- Estados: borrador, activo, completado
- Términos y condiciones

### Perfil
- Edición de información personal
- Cambio de contraseña
- Información de la cuenta

## 🧪 Datos de Prueba

El sistema incluye datos simulados en `src/data/mockData.ts`:
- 4 usuarios (uno por cada rol)
- 9 clientes
- 6 vehículos
- 5 reservas
- 4 facturas
- 3 contratos

Puedes modificar estos datos para tus pruebas.

## 🔄 Preparación para Backend

El código está diseñado para facilitar la integración con un backend:

1. **Custom Hooks**: `useForm` y otros hooks están listos para integrar llamadas API
2. **Separación de datos**: Los mock data pueden reemplazarse fácilmente con llamadas fetch/axios
3. **Validaciones**: Las validaciones frontend pueden reutilizarse
4. **Tipos TypeScript**: Ya definidos para facilitar la integración

### Ejemplo de integración:

```tsx
// Antes (mock)
const [clientes, setClientes] = useState(mockClientes);

// Después (con API)
const [clientes, setClientes] = useState([]);
useEffect(() => {
  fetch('/api/clientes')
    .then(res => res.json())
    .then(data => setClientes(data));
}, []);
```

## 🎯 Próximos Pasos Recomendados

1. **Integrar Backend**
   - Conectar con API REST o GraphQL
   - Implementar autenticación real (JWT)
   - Sincronizar estado con base de datos

2. **Mejorar UI/UX**
   - Reemplazar iconos placeholder
   - Agregar animaciones con Framer Motion
   - Implementar tema oscuro

3. **Testing**
   - Agregar tests unitarios (Jest)
   - Tests de integración (React Testing Library)
   - Tests E2E (Cypress/Playwright)

4. **Optimizaciones**
   - Code splitting
   - Lazy loading de rutas
   - Optimización de imágenes

5. **Features Adicionales**
   - Notificaciones en tiempo real
   - Exportación a PDF/Excel
   - Dashboard con gráficas
   - Sistema de mensajería

## 📝 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Crear build de producción
npm run build

# Ejecutar tests
npm test

# Eject (no recomendado)
npm run eject
```

## 🐛 Solución de Problemas

### El servidor no inicia
- Verifica que Node.js esté instalado: `node --version`
- Elimina `node_modules` y reinstala: `rm -rf node_modules && npm install`

### Errores de TypeScript
- Verifica que `tsconfig.json` esté correctamente configurado
- Ejecuta `npm install typescript --save-dev`

### Estilos no se aplican
- Verifica que Tailwind esté configurado correctamente
- Asegúrate de que `tailwind.config.js` y `postcss.config.js` existan

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo y comercial.

## 👨‍💻 Autor

Desarrollado con ❤️ para demostrar arquitectura profesional en React + TypeScript

---

**¿Necesitas ayuda?** Revisa la documentación de React en [reactjs.org](https://reactjs.org)
"# Proyecto"  
"# Proyecto"  
"# Project" 
"# Project" 
