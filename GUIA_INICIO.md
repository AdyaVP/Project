# 🚀 Guía de Inicio Rápido

## Instalación y Primer Inicio

### 1. Instalar dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias:
- React 18.2.0
- React Router DOM 6.20.0
- TypeScript 5.3.0
- TailwindCSS 3.3.6
- Y todas las dependencias de desarrollo

### 2. Iniciar el servidor de desarrollo

```bash
npm start
```

El navegador se abrirá automáticamente en `http://localhost:3000`

### 3. Probar el sistema

Una vez iniciado, verás la pantalla de login con 4 opciones de roles:

#### 👑 **Super Admin** - Acceso Total
- Haz clic para iniciar sesión como Super Admin
- Tendrás acceso a todos los módulos
- Podrás crear usuarios de cualquier rol

#### ⚡ **Admin** - Gestión Operativa
- Haz clic para iniciar sesión como Admin
- Podrás gestionar vehículos, clientes y reservas
- No podrás modificar Super Admins

#### 📋 **Operador** - Operaciones Básicas
- Haz clic para iniciar sesión como Operador
- Podrás crear pre-reservas y agregar clientes
- Verás vehículos pero sin tarifas

#### 👤 **Cliente** - Vista Personal
- Haz clic para iniciar sesión como Cliente
- Solo verás tu información personal
- Podrás consultar tus reservas y facturas

## 📱 Navegación del Sistema

### Sidebar (Panel Izquierdo)
- **Logo**: Sistema de Gestión
- **Menú dinámico**: Cambia según tu rol
- **Perfil de usuario**: En la parte inferior

### Navbar (Parte Superior)
- **Saludo personalizado**: "Hola [Tu Nombre]"
- **Buscador**: Para búsqueda rápida
- **Notificaciones**: Placeholder para futuras notificaciones
- **Menú de perfil**: Acceso a perfil y cerrar sesión

### Módulos Principales

#### 📊 Dashboard
Vista general con estadísticas del sistema:
- Total de clientes
- Miembros activos
- Usuarios en línea
- Vehículos disponibles
- Reservas pendientes
- Ingresos mensuales

#### 👥 Usuarios (Solo Super Admin y Admin)
Gestión completa de usuarios:
- Crear nuevo usuario
- Editar información
- Cambiar roles
- Desactivar usuarios
- Buscar y filtrar

#### 🚗 Vehículos
Gestión de flota:
- Agregar vehículos (Admin/Super Admin)
- Ver estado (disponible, reservado, mantenimiento)
- Editar información
- Ver tarifas (no visible para Operadores)
- Filtrar por estado

#### 👤 Clientes
Gestión de clientes:
- Agregar clientes
- Aprobar clientes pendientes (Admin/Super Admin)
- Editar información
- Ver historial
- Estados: activo, inactivo, pendiente

#### 📅 Reservas
Sistema de reservas:
- Crear nueva reserva
- Pre-reservas (Operadores, requieren aprobación)
- Aprobar/rechazar reservas
- Ver detalles y calcular costos
- Estados: pendiente, confirmada, completada, cancelada

#### 💰 Facturación
Gestión de facturas:
- Ver facturas
- Crear nueva factura (Admin/Super Admin)
- Registrar pagos
- Estados: pagada, pendiente, vencida
- Cálculo de IVA automático

#### 📄 Contratos
Gestión de contratos:
- Ver contratos
- Estados: borrador, activo, completado
- Términos y condiciones
- Fechas de vigencia

#### ⚙️ Perfil
Tu perfil personal:
- Editar información personal
- Cambiar contraseña
- Ver información de cuenta
- Zona de peligro (desactivar cuenta)

## 🎨 Personalización

### Cambiar Iconos

Los iconos actuales son emojis placeholder. Para cambiar:

1. **Instala tu librería de iconos preferida**:
```bash
npm install lucide-react
# o
npm install react-icons
```

2. **Busca los emojis** en los archivos:
```
🏢 📊 👥 🚗 👤 📅 💰 📄 ⚙️
```

3. **Reemplaza** con tus componentes:
```tsx
import { Car } from 'lucide-react';

// Antes
<span>🚗</span>

// Después
<Car className="w-5 h-5" />
```

### Cambiar Colores

Edita `tailwind.config.js`:

```js
colors: {
  primary: {
    500: '#TU_COLOR',
    600: '#TU_COLOR_OSCURO',
    // ...
  },
}
```

## 🔧 Comandos Útiles

### Desarrollo
```bash
npm start              # Inicia servidor de desarrollo
npm run build         # Crea build de producción
npm test              # Ejecuta tests
```

### Limpiar y reinstalar
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Datos de Prueba

El sistema incluye datos simulados. Puedes modificarlos en:
- `src/data/mockData.ts`

### Usuarios disponibles:
- **Super Admin**: Valeria Rodríguez
- **Admin**: Carlos Administrador
- **Operador**: Ana Operadora
- **Cliente**: Juan Cliente

### Datos incluidos:
- 9 clientes
- 6 vehículos
- 5 reservas
- 4 facturas
- 3 contratos

## 🔒 Seguridad

### Validaciones implementadas:
- ✅ Validación de email
- ✅ Validación de teléfono
- ✅ Sanitización de inputs
- ✅ Control de longitud
- ✅ Campos requeridos

### Control de acceso:
- ✅ Rutas protegidas por rol
- ✅ Sidebar dinámico
- ✅ Acciones bloqueadas según permisos
- ✅ Mensajes de acceso denegado

## 🐛 Solución de Problemas Comunes

### Error: "Module not found"
```bash
npm install
```

### Error: "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [numero_proceso] /F

# O cambia el puerto
set PORT=3001 && npm start
```

### Los estilos no se aplican
```bash
npm run build
# Luego reinicia
npm start
```

### Cambios no se reflejan
- Limpia caché: Ctrl + Shift + R (Chrome/Edge)
- Reinicia el servidor: Ctrl + C, luego npm start

## 📚 Recursos Adicionales

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **TailwindCSS**: https://tailwindcss.com
- **React Router**: https://reactrouter.com

## 💡 Tips de Desarrollo

1. **Usa los custom hooks** para mantener código limpio
2. **Valida siempre** los inputs de usuario
3. **Sigue la estructura** de carpetas establecida
4. **Comenta** código complejo
5. **Mantén componentes pequeños** y reutilizables

## 🎯 Siguiente: Conectar Backend

Cuando estés listo para conectar un backend:

1. Crea tu API REST o GraphQL
2. Reemplaza mock data con llamadas fetch/axios
3. Implementa JWT para autenticación real
4. Agrega variables de entorno (.env)
5. Maneja estados de loading y errores

---

**¡Listo para empezar!** 🚀

Ejecuta `npm install` y luego `npm start` para ver tu CRM en acción.
