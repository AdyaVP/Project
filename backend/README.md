# 🔧 Backend API - Sistema de Gestión CRM

API REST construida con Node.js, Express y TypeScript para el sistema de gestión CRM.

## 🚀 Tecnologías

- **Node.js** + **Express** - Framework web
- **TypeScript** - Tipado estático
- **Prisma** - ORM para base de datos
- **JWT** - Autenticación con tokens
- **Bcrypt** - Hash de contraseñas
- **Express Validator** - Validación de datos
- **Helmet** - Seguridad HTTP

## 📁 Estructura

```
/backend
├── /src
│   ├── /routes              # Definición de rutas API
│   ├── /controllers         # Lógica de negocio (pendiente)
│   ├── /middleware          # Middleware (auth, validation)
│   ├── /services            # Servicios de lógica (pendiente)
│   ├── /utils               # Utilidades (JWT, password)
│   ├── /types               # Tipos TypeScript
│   └── index.ts             # Entry point del servidor
├── /prisma
│   └── schema.prisma        # Schema de base de datos
├── .env.example             # Variables de entorno ejemplo
├── tsconfig.json
└── package.json
```

## ⚙️ Configuración

### 1. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

Variables importantes:
- `DATABASE_URL` - URL de conexión a la base de datos
- `JWT_SECRET` - Clave secreta para JWT (¡cambiar en producción!)
- `PORT` - Puerto del servidor (default: 5000)

### 2. Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# Ver base de datos en navegador
npx prisma studio
```

## 🏃 Comandos Disponibles

```bash
# Desarrollo (con hot reload)
npm run dev

# Compilar TypeScript
npm run build

# Producción
npm start

# Linting
npm run lint
```

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación.

### Endpoints de Auth

```
POST /api/auth/register     # Registrar usuario
POST /api/auth/login        # Login
POST /api/auth/refresh      # Refrescar token
POST /api/auth/logout       # Logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Formato de Token

```
Authorization: Bearer <token>
```

## 📡 Endpoints API

### Usuarios
```
GET    /api/users           # Listar usuarios
GET    /api/users/:id       # Obtener usuario
POST   /api/users           # Crear usuario
PUT    /api/users/:id       # Actualizar usuario
DELETE /api/users/:id       # Eliminar usuario
```

### Vehículos
```
GET    /api/vehicles        # Listar vehículos
GET    /api/vehicles/:id    # Obtener vehículo
POST   /api/vehicles        # Crear vehículo (Admin)
PUT    /api/vehicles/:id    # Actualizar vehículo (Admin)
DELETE /api/vehicles/:id    # Eliminar vehículo (Admin)
```

### Clientes
```
GET    /api/clients         # Listar clientes
POST   /api/clients         # Crear cliente
PUT    /api/clients/:id     # Actualizar cliente
PUT    /api/clients/:id/approve  # Aprobar cliente (Admin)
```

### Reservas
```
GET    /api/reservations    # Listar reservas
POST   /api/reservations    # Crear reserva
PUT    /api/reservations/:id/approve   # Aprobar (Admin)
PUT    /api/reservations/:id/reject    # Rechazar (Admin)
```

### Facturas y Contratos
```
GET    /api/invoices        # Listar facturas
GET    /api/contracts       # Listar contratos
```

## 🔒 Middleware de Seguridad

### Autenticación
```typescript
import { authenticateToken } from './middleware/auth.middleware';

router.get('/protected', authenticateToken, handler);
```

### Autorización por Rol
```typescript
import { authorize } from './middleware/auth.middleware';

router.post(
  '/admin-only',
  authenticateToken,
  authorize('SUPER_ADMIN', 'ADMIN'),
  handler
);
```

### Validación de Datos
```typescript
import { validate } from './middleware/validation.middleware';
import { body } from 'express-validator';

router.post(
  '/create',
  validate([
    body('email').isEmail(),
    body('name').notEmpty()
  ]),
  handler
);
```

## 🗃️ Base de Datos (Prisma)

### Modelos Principales

- **User** - Usuarios del sistema
- **Client** - Clientes de la empresa
- **Vehicle** - Vehículos disponibles
- **Reservation** - Reservas de vehículos
- **Invoice** - Facturas
- **Contract** - Contratos de alquiler

### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear base de datos (¡cuidado!)
npx prisma migrate reset
```

## 🧪 Testing (Pendiente)

```bash
npm test
```

## 📝 Estado del Proyecto

### ✅ Completado
- [x] Estructura base del proyecto
- [x] Configuración TypeScript
- [x] Middleware de autenticación (JWT)
- [x] Middleware de validación
- [x] Schema de Prisma
- [x] Rutas base (auth, vehicles)
- [x] Utilidades (JWT, password)

### 🚧 Pendiente (Para implementar)
- [ ] Controladores completos
- [ ] Servicios de lógica de negocio
- [ ] Conexión real a base de datos
- [ ] Tests unitarios e integración
- [ ] Manejo de errores centralizado
- [ ] Rate limiting
- [ ] Logging avanzado
- [ ] Documentación Swagger/OpenAPI
- [ ] Envío de emails
- [ ] Upload de archivos

## 🔄 Integración con Frontend

El frontend (en `/frontend`) consume esta API:

```typescript
// Ejemplo de fetch desde frontend
const response = await fetch('http://localhost:5000/api/vehicles', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🌐 CORS

Por defecto, CORS está configurado para:
- Origen: `http://localhost:3000` (frontend)

Modificar en `.env`:
```
CORS_ORIGIN=http://localhost:3000
```

## 📦 Deployment

### Variables de Entorno en Producción

Asegúrate de configurar:
- `NODE_ENV=production`
- `DATABASE_URL` con tu BD de producción
- `JWT_SECRET` con valor único y seguro
- `CORS_ORIGIN` con tu dominio frontend

### Build

```bash
npm run build
npm start
```

## 🛡️ Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT para autenticación
- ✅ Helmet para headers HTTP seguros
- ✅ Validación de inputs
- ✅ CORS configurado
- ⚠️ Pendiente: Rate limiting
- ⚠️ Pendiente: Sanitización avanzada

## 📚 Recursos

- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT.io](https://jwt.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Nota**: Este backend está preparado con la estructura base. Los controladores y servicios completos deben ser implementados según las necesidades específicas del proyecto.
