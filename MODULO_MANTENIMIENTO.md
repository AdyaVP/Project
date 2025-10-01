# 🔧 Módulo de Mantenimiento

## ✅ Implementado

Nuevo módulo exclusivo para **Super Admin** y **Admin** para gestionar vehículos en mantenimiento y reportes de daños.

---

## 🎯 Acceso

### Quién puede acceder:
- ✅ **Super Admin** - Acceso completo
- ✅ **Admin** - Acceso completo
- ❌ **Operador** - Sin acceso (solo reporta daños)
- ❌ **Cliente** - Sin acceso

### Ubicación en Sidebar:
```
📊 Dashboard
👥 Usuarios
🚗 Vehículos
👤 Clientes
📅 Reservas
💰 Facturación
🔧 Mantenimiento  ← NUEVO
⚙️ Perfil
```

---

## 📊 Vista General

El módulo tiene **2 tabs principales**:

### Tab 1: 🚗 Vehículos en Mantenimiento
- Lista de vehículos con estado "Mantenimiento"
- Ver historial de reparaciones
- Marcar vehículo como "Disponible" cuando se repara

### Tab 2: 📋 Reportes de Daños
- Reportes generados por Operadores durante inspecciones
- Detalle de cada daño
- Costos estimados
- Estados del proceso

---

## 📊 Estadísticas (Cards Superiores)

```
┌──────────────────────────────────────────────────────────┐
│ 🔧 En Mantenimiento  📋 Reportes de Daños  🔍 En Revisión  ✅ Reparados │
│        2                   5                    2              3       │
└──────────────────────────────────────────────────────────┘
```

**Métricas:**
- **En Mantenimiento**: Vehículos actualmente en reparación
- **Reportes de Daños**: Total de reportes generados
- **En Revisión**: Reportes pendientes de evaluar
- **Reparados**: Vehículos ya reparados y listos

---

## 🚗 Tab: Vehículos en Mantenimiento

### Qué Muestra:
Tabla con todos los vehículos que tienen estado `maintenance`:

| Vehículo | Año | Tipo | Estado | Acciones |
|----------|-----|------|--------|----------|
| Toyota Corolla (ABC-123) | 2024 | Sedan | 🔧 Mantenimiento | [Ver Historial] [Marcar Disponible] |
| Ford F-150 (XYZ-789) | 2024 | Truck | 🔧 Mantenimiento | [Ver Historial] [Marcar Disponible] |

### Acciones Disponibles:

#### 1. **Ver Historial**
- Muestra todas las reparaciones anteriores
- Fechas de entrada/salida
- Tipo de mantenimiento realizado
- Costo de cada reparación

#### 2. **Marcar Disponible**
- Cambia estado del vehículo a "Disponible"
- Vehículo queda listo para nuevas reservas
- Se registra fecha de reparación completada

### Si No Hay Vehículos:
```
┌─────────────────────────────────────┐
│            ✅                        │
│                                      │
│  No hay vehículos en mantenimiento  │
│                                      │
│  Todos los vehículos están          │
│  disponibles o en uso               │
└─────────────────────────────────────┘
```

---

## 📋 Tab: Reportes de Daños

### Qué Muestra:
Lista completa de reportes de daños generados por Operadores después de inspecciones de devolución.

### Tabla de Reportes:

| ID | Fecha | Vehículo | Daños | Costo | Estado | Acciones |
|----|-------|----------|-------|-------|--------|----------|
| rep-001 | 15/10/2024 | Toyota Corolla<br>Cliente: Juan Pérez | 2 daño(s)<br>- Puerta trasera<br>- Cajuela | $1,300 | 🔍 En Revisión | [Ver Detalles] |
| rep-002 | 20/10/2024 | Honda CR-V<br>Cliente: María G. | 1 daño(s)<br>- Parachoques | $350 | ✅ Reparado | [Ver Detalles] |

### Estados de Reporte:

| Estado | Badge | Descripción |
|--------|-------|-------------|
| **Reportado** | 📋 Reportado | Operador acaba de crear el reporte |
| **En Revisión** | 🔍 En Revisión | Admin está evaluando el reporte |
| **Reparado** | ✅ Reparado | Daño reparado, listo para facturar |
| **Facturado** | 💰 Facturado | Costo ya agregado a factura del cliente |

---

## 🔍 Detalle de Reporte (Modal)

Al hacer click en **"Ver Detalles"**, se abre un modal con información completa:

### Información General:
```
┌────────────────────────────────────────┐
│ 📋 Detalle del Reporte de Daños       │
├────────────────────────────────────────┤
│ ID Reporte:  rep-001                   │
│ Fecha:       15/10/2024                │
│ Vehículo:    Toyota Corolla (ABC-123)  │
│ Cliente:     Juan Pérez                │
│ Estado:      🔍 En Revisión            │
│ Total:       $1,300.00                 │
└────────────────────────────────────────┘
```

### Daños Detallados:

Cada daño incluye:

```
┌────────────────────────────────────────┐
│ Puerta trasera derecha      🟡 Moderado│
│ Tipo: Rayón                            │
│                                         │
│ Rayón profundo de 15cm en pintura     │
│                                         │
│ Costo Estimado: $500.00                │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Cajuela                     🟢 Leve    │
│ Tipo: Faltante                         │
│                                         │
│ No se encontró gato hidráulico         │
│                                         │
│ Costo Estimado: $800.00                │
└────────────────────────────────────────┘
```

### Niveles de Gravedad:

| Badge | Significado | Color |
|-------|-------------|-------|
| 🟢 Leve | Daño menor, reparación simple | Verde |
| 🟡 Moderado | Daño medio, requiere atención | Amarillo |
| 🔴 Grave | Daño severo, reparación costosa | Rojo |

### Acciones en Modal:

**Si el reporte está "En Revisión":**
- ✅ **Marcar como Reparado** - Cuando la reparación se completa
- 💰 **Generar Factura** - Crea cargo extra en factura del cliente

---

## 🔄 Flujo Completo de Gestión de Daños

### Paso 1: Operador Reporta Daño
```
Cliente devuelve vehículo
↓
Operador hace inspección de devolución
↓
Detecta daños
↓
Crea Reporte de Daños:
├─ Documenta cada daño
├─ Toma fotos
├─ Marca gravedad
└─ Cliente firma reconociendo
↓
Reporte enviado → Estado: "Reportado" 📋
```

### Paso 2: Admin Revisa en Mantenimiento
```
Admin → Mantenimiento → Reportes de Daños
↓
Ve nuevo reporte
↓
Click "Ver Detalles"
↓
Revisa:
├─ Fotos del daño
├─ Descripción detallada
├─ Gravedad estimada
└─ Firma del cliente
↓
Cambia estado → "En Revisión" 🔍
```

### Paso 3: Evaluar y Costear
```
Admin evalúa daño real
↓
Si costo estimado es correcto:
└─ Procede con reparación

Si costo es diferente:
├─ Ajusta monto
└─ Agrega notas
```

### Paso 4: Reparación
```
Vehículo enviado a taller
↓
Reparación completada
↓
Admin → Mantenimiento
├─ Vehículo en tab "Vehículos"
└─ Marca como "Disponible"
↓
Reporte → "Reparado" ✅
```

### Paso 5: Facturación
```
Admin → "Generar Factura"
↓
Sistema crea cargo extra en factura del cliente:
├─ Concepto: Reparación de daños
├─ Detalle: Lista de daños
├─ Monto: Total del reporte
└─ Cliente debe pagar
↓
Reporte → "Facturado" 💰
```

---

## 📊 Datos Mock Incluidos

### Vehículos en Mantenimiento:
Se filtran automáticamente de `mockVehiculos` con `status === 'maintenance'`

### Reportes de Daños (Mock):

**Reporte 1:**
```typescript
{
  id: 'rep-001',
  vehiculoInfo: 'Toyota Corolla 2024 (ABC-123)',
  clienteNombre: 'Juan Pérez',
  fecha: '2024-10-15',
  danos: [
    {
      ubicacion: 'Puerta trasera derecha',
      tipo: 'Rayón',
      descripcion: 'Rayón profundo de 15cm en pintura',
      gravedad: 'moderado',
      costoEstimado: 500,
    },
    {
      ubicacion: 'Cajuela',
      tipo: 'Faltante',
      descripcion: 'No se encontró gato hidráulico',
      gravedad: 'leve',
      costoEstimado: 800,
    },
  ],
  estado: 'en-revision',
  totalEstimado: 1300,
}
```

**Reporte 2:**
```typescript
{
  id: 'rep-002',
  vehiculoInfo: 'Honda CR-V 2023 (XYZ-456)',
  clienteNombre: 'María González',
  fecha: '2024-10-20',
  danos: [
    {
      ubicacion: 'Parachoques delantero',
      tipo: 'Abolladura',
      descripcion: 'Abolladura pequeña en esquina',
      gravedad: 'leve',
      costoEstimado: 350,
    },
  ],
  estado: 'reparado',
  totalEstimado: 350,
}
```

---

## 🎨 UI/UX

### Responsive
- ✅ Desktop: Vista completa con tabs
- ✅ Tablet: Adaptación de tablas
- ✅ Mobile: Tarjetas apiladas

### Dark Mode
- ✅ Todos los componentes compatibles
- ✅ Transiciones suaves
- ✅ Colores adaptativos

### Búsqueda
- 🔍 Buscar por vehículo
- 🔍 Buscar por cliente
- 🔍 Buscar por ID de reporte

---

## 🚀 Para Probar

### 1. Login como Admin/Super Admin
```
http://localhost:3000/crm/login
↓
Selecciona: ⚡ Admin o 👑 Super Admin
```

### 2. Ver Módulo en Sidebar
```
Sidebar → 🔧 Mantenimiento
```

### 3. Explorar Tabs
```
Tab Vehículos:
- Ver vehículos en mantenimiento
- Probar botón "Marcar Disponible"

Tab Reportes:
- Ver lista de reportes
- Click "Ver Detalles" en un reporte
- Ver modal completo con daños
```

---

## 📝 Funcionalidades Futuras

### Por Implementar:

- [ ] **Historial de Reparaciones**
  - Ver todas las reparaciones pasadas de un vehículo
  - Costos históricos
  - Talleres utilizados

- [ ] **Integración con Operador**
  - Operador crea reportes desde inspección
  - Subida de fotos real
  - Firma digital del cliente

- [ ] **Gestión de Talleres**
  - Lista de talleres asociados
  - Enviar vehículo a taller específico
  - Tracking de reparación

- [ ] **Facturación Automática**
  - Al marcar "Facturado" → se agrega a factura del cliente
  - Cálculo automático de totales
  - Notificación al cliente

- [ ] **Estadísticas Avanzadas**
  - Gráficas de daños por tipo
  - Vehículos más dañados
  - Costos promedio de reparación
  - Tiempo promedio en mantenimiento

- [ ] **Notificaciones**
  - Admin recibe notificación de nuevo reporte
  - Operador notificado cuando reparación completa
  - Cliente notificado de cargo extra

---

## ✅ Archivos Actualizados

1. **✅ config/permissions.ts**
   - Agregado permiso `mantenimiento` para Super Admin y Admin
   - Agregado al sidebar
   - Agregado info del módulo con icono 🔧

2. **✅ pages/Mantenimiento.tsx**
   - Componente completo creado
   - Tabs, tablas, modal
   - Mock data incluido

3. **✅ CRMApp.tsx**
   - Importado componente
   - Agregada ruta `/crm/mantenimiento`
   - ProtectedRoute configurado

---

## 🎯 Resumen

**Módulo de Mantenimiento** completo con:

✅ Acceso exclusivo Admin/Super Admin
✅ 2 tabs (Vehículos + Reportes)
✅ 4 estadísticas en cards
✅ Tabla de vehículos en mantenimiento
✅ Tabla de reportes de daños
✅ Modal detallado de reporte
✅ Badges de estado y gravedad
✅ Mock data para pruebas
✅ Dark mode compatible
✅ Responsive design
✅ Búsqueda funcional

**¡Módulo listo para gestionar vehículos dañados y mantenimiento!** 🔧🚗
