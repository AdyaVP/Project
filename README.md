
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
├── /backend                     
│   ├─   /src
│


✅ **Estructura limpia** - Sin archivos legacy

## 🚀 Características principales

- ✅ **React 18** con TypeScript y Functional Components
- ✅ **TailwindCSS** para diseño moderno y responsivo
- ✅ **React Router** para navegación entre módulos
- ✅ **Context API** para manejo de autenticación y roles
- ✅ **Arquitectura modular** y escalable
- ✅ **Sistema de permisos** por roles
- ✅ **Validación de formularios** en frontend
- ✅ **Componentes reutilizables** y custom hooks

## 📊 Estado

- **Frontend:** ✅ 100% funcional (con datos mock)


## 🚀 Inicio Rápido

### Frontend
```bash
cd frontend
npm install
npm run dev
```



## 🔐 Sistema de Autenticación

El proyecto incluye un sistema de login simulado para demostración:

1. Navega a `/login`
2. Selecciona un rol (Super Admin, Admin, Operador o Cliente)
3. El sistema cargará los permisos correspondientes
4. Serás redirigido al dashboard con acceso a los módulos permitidos

**Nota:** No requiere credenciales, es una simulación para frontend.


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


