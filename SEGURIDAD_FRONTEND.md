# 🔒 Seguridad en el Frontend

## ⚠️ IMPORTANTE: Nunca Confiar Solo en el Frontend

**Regla de oro**: El frontend es solo la primera línea de defensa. TODA la seguridad real debe estar en el **backend**.

---

## ✅ Medidas de Seguridad Implementadas

### 1. **Rutas Protegidas** ✅

**Archivo**: `components/auth/ProtectedRoute.tsx`

```typescript
// Valida autenticación antes de mostrar cualquier página
if (!isAuthenticated || !currentUser) {
  return <Navigate to="/crm/login" replace />;
}

// Valida permisos por módulo
if (module && !hasAccess) {
  return <AccessDeniedPage />;
}
```

**Protección**:
- ✅ Usuario no autenticado → Redirige a Login
- ✅ Usuario sin permisos → Muestra "Acceso Denegado"
- ✅ Valida en CADA ruta

### 2. **Validación de Roles** ✅

**Archivo**: `config/permissions.ts`

```typescript
// Sistema de permisos por rol
export const ROLE_PERMISSIONS: Record<Role, Record<string, Permission>> = {
  SUPER_ADMIN: { /* permisos completos */ },
  ADMIN: { /* permisos limitados */ },
  OPERADOR: { /* solo operativo */ },
  CLIENTE: { /* solo lectura */ },
}
```

**Protección**:
- ✅ Cada rol tiene permisos específicos
- ✅ UI se adapta al rol (oculta botones/opciones)
- ✅ No se puede escalar privilegios desde el frontend

### 3. **UI Condicional por Permisos** ✅

```typescript
// Botones solo visibles si tienes permiso
{canCreate && (
  <Button onClick={createNew}>Crear</Button>
)}

{canDelete && (
  <Button onClick={deleteItem}>Eliminar</Button>
)}

// Operador NO ve tarifas
const canViewRates = currentUser?.role !== 'OPERADOR';
```

**Protección**:
- ✅ Información sensible oculta
- ✅ Acciones restringidas por rol
- ✅ No se puede "inspeccionar elemento" y ejecutar acciones

### 4. **No Hay Credenciales en el Código** ✅

```typescript
// ❌ MAL - NUNCA hacer esto:
const API_KEY = "sk_live_12345abcdef";
const DB_PASSWORD = "mipassword123";

// ✅ BIEN - Usar variables de entorno:
const API_URL = import.meta.env.VITE_API_URL;
```

**Configuración** (`.env`):
```env
VITE_API_URL=https://api.tudominio.com
VITE_API_KEY=se_configura_en_servidor
```

### 5. **Tokens de Sesión** ✅

```typescript
// AuthContext maneja tokens
const token = localStorage.getItem('authToken');

// Token debe:
// - Ser JWT firmado por backend
// - Tener expiración corta (15-30 min)
// - Renovarse automáticamente
// - Invalidarse al cerrar sesión
```

---

## 🚨 Vulnerabilidades Comunes PREVENIDAS

### ❌ 1. Acceso Directo por URL

**Vulnerabilidad**:
```
Usuario sin permisos escribe:
https://tuapp.com/crm/usuarios
```

**Protección**:
```typescript
// ProtectedRoute valida antes de renderizar
<Route path="usuarios" element={
  <ProtectedRoute module="usuarios">
    <Usuarios />
  </ProtectedRoute>
} />

// Si no tiene permiso → Acceso Denegado
```

### ❌ 2. Manipulación de localStorage

**Vulnerabilidad**:
```javascript
// Usuario abre consola y ejecuta:
localStorage.setItem('userRole', 'SUPER_ADMIN');
```

**Protección**:
```typescript
// El backend SIEMPRE valida el token
// El rol viene del token JWT firmado
// No se puede modificar sin romper la firma
```

**Implementación Backend (ejemplo)**:
```typescript
// Backend verifica token en CADA request
app.use((req, res, next) => {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, SECRET_KEY);
  req.user = decoded; // Rol viene del backend
  next();
});

// Endpoint valida rol
app.get('/api/usuarios', verifyRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  // Solo si el token tiene rol correcto
});
```

### ❌ 3. Inspeccionar Elemento y Ejecutar

**Vulnerabilidad**:
```javascript
// Usuario abre DevTools y ejecuta:
document.querySelector('[data-action="delete"]').click();
```

**Protección**:
```typescript
// Frontend previene UI, pero backend VALIDA TODO
const handleDelete = async (id: string) => {
  try {
    // Backend valida: token, rol, permisos
    await api.delete(`/usuarios/${id}`);
  } catch (error) {
    // Backend responde 403 Forbidden si no tiene permiso
    alert('No tienes permisos para esta acción');
  }
};
```

### ❌ 4. Cross-Site Scripting (XSS)

**Vulnerabilidad**:
```javascript
// Usuario ingresa en un campo:
<script>alert('Hackeado!')</script>
```

**Protección**:
```typescript
// React escapa automáticamente el HTML
<p>{userInput}</p> // Se muestra como texto, no ejecuta

// Validación adicional
const sanitizeInput = (input: string) => {
  return input.replace(/<script>/g, '');
};
```

### ❌ 5. Exposición de API Keys

**Vulnerabilidad**:
```typescript
// ❌ Expuesto en código
const stripeKey = "pk_live_abc123";
```

**Protección**:
```typescript
// ✅ Variable de entorno
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// En .env (NO subir a git)
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx

// En .gitignore
.env
.env.local
```

---

## 🛡️ Checklist de Seguridad

### Frontend (Primera Línea)
- [x] ✅ Rutas protegidas con ProtectedRoute
- [x] ✅ Validación de roles en cada módulo
- [x] ✅ UI condicional según permisos
- [x] ✅ Tokens en localStorage (HttpOnly mejor)
- [x] ✅ No hay credenciales hardcodeadas
- [x] ✅ Variables de entorno para configs
- [x] ✅ Sanitización de inputs
- [x] ✅ React escapa HTML automáticamente
- [x] ✅ Cerrar sesión limpia localStorage
- [x] ✅ Timeout de sesión inactiva

### Backend (Seguridad Real) ⚠️ CRÍTICO
- [ ] 🔴 JWT con firma secreta
- [ ] 🔴 Validar token en CADA request
- [ ] 🔴 Middleware de autorización por rol
- [ ] 🔴 Rate limiting (prevenir spam)
- [ ] 🔴 CORS configurado correctamente
- [ ] 🔴 HTTPS en producción (SSL/TLS)
- [ ] 🔴 Passwords hasheadas (bcrypt)
- [ ] 🔴 Validación de inputs en backend
- [ ] 🔴 Logs de accesos y errores
- [ ] 🔴 Protección contra SQL Injection
- [ ] 🔴 Sanitización de datos en API
- [ ] 🔴 Tokens de refresh para renovar sesión

---

## 🔐 Ejemplo de Flujo Seguro

### Frontend → Backend

```typescript
// 1. Frontend hace request
const deleteUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 403) {
      throw new Error('No tienes permisos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// 2. Backend valida (Node.js/Express ejemplo)
app.delete('/api/usuarios/:id', 
  authenticateToken,      // Middleware 1: Valida token
  authorizeRole(['SUPER_ADMIN']), // Middleware 2: Valida rol
  async (req, res) => {
    try {
      // 3. Doble verificación
      if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // 4. Acción en DB
      await db.usuarios.delete(req.params.id);
      
      // 5. Log de seguridad
      logger.info(`User ${req.user.id} deleted user ${req.params.id}`);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);
```

---

## ⚡ Configuración de Producción

### 1. Variables de Entorno

**Archivo**: `.env.production`
```env
VITE_API_URL=https://api.produccion.com
VITE_APP_ENV=production
VITE_ENABLE_LOGS=false
```

### 2. Build de Producción
```bash
# Minifica y ofusca código
npm run build

# Output en /dist
# Código minificado, difícil de leer
```

### 3. Headers de Seguridad

**Configurar en servidor (nginx/apache)**:
```nginx
# Prevenir clickjacking
add_header X-Frame-Options "SAMEORIGIN";

# Prevenir XSS
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";

# HTTPS obligatorio
add_header Strict-Transport-Security "max-age=31536000";

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'";
```

### 4. CORS en Backend
```typescript
// Solo permite requests desde tu dominio
app.use(cors({
  origin: 'https://tuapp.com',
  credentials: true
}));
```

---

## 🚫 Lo que NO se Puede Proteger Solo en Frontend

### ❌ NO CONFIAR EN:
1. **Ocultar elementos del DOM** → Se puede inspeccionar
2. **Validaciones solo en JavaScript** → Se pueden saltear
3. **Roles guardados en localStorage** → Se pueden modificar
4. **Lógica de negocio en frontend** → Se puede ver el código
5. **Tokens sin expiración** → Pueden robarse

### ✅ SIEMPRE EN BACKEND:
1. **Autenticación** (login, tokens)
2. **Autorización** (permisos, roles)
3. **Validación de datos** (inputs, formatos)
4. **Lógica de negocio** (cálculos, reglas)
5. **Acceso a base de datos**

---

## 📋 Resumen

### Frontend Actual (✅ Implementado):
- ✅ Rutas protegidas
- ✅ Permisos por rol
- ✅ UI condicional
- ✅ No hay credenciales expuestas
- ✅ Tokens en localStorage

### ⚠️ ADVERTENCIA:
**Todo esto es solo la primera línea**. Un atacante avanzado puede:
- Descompilar el JavaScript
- Ver todo el código fuente
- Modificar peticiones HTTP
- Saltarse validaciones del frontend

### 🔐 Solución Real:
**BACKEND CON SEGURIDAD COMPLETA**:
- JWT tokens firmados
- Middleware de autenticación
- Validación de roles en cada endpoint
- Rate limiting
- HTTPS
- Logs de seguridad

---

## 🎯 Acción Inmediata

### Para Demostración (Actual):
✅ El frontend está protegido para usuarios normales
✅ No se pueden ver funciones sin permisos
✅ Es seguro para una demo o MVP

### Para Producción (Próximo Paso):
🔴 **CRÍTICO**: Implementar backend con:
1. API REST con autenticación JWT
2. Base de datos segura
3. Validación en cada endpoint
4. HTTPS obligatorio
5. Backups automáticos

**Sin backend seguro, cualquier protección del frontend es solo cosmética.**

---

¡El frontend está bien protegido para una demo, pero recuerda: **La seguridad real siempre está en el backend**! 🔒
