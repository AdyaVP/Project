# 📋 Flujo Completo del Operador

## 🎯 Rol del Operador

El Operador es el encargado de la **atención directa al cliente** y las **operaciones del día a día**, pero siempre bajo supervisión y aprobación del Admin.

---

## 1. 👤 CLIENTES

### ✅ Agregar Nuevo Cliente

**Proceso:**
```
Operador → Clientes → [+ Agregar Cliente]
↓
Llena formulario:
- Nombre completo
- Email
- Teléfono
- Empresa (opcional)
- País
↓
❌ NO puede elegir estado (campo oculto)
↓
Click "Crear Cliente"
↓
Cliente creado en estado: "Pendiente" ⏳
↓
Mensaje: "Cliente requiere aprobación de Admin"
```

**Características:**
- ✅ Operador agrega cliente
- 🔒 **Estado siempre "Pendiente"** (sin opción de elegir)
- ℹ️ Se muestra mensaje informativo
- ⏳ Espera aprobación de Admin/Super Admin

**UI para Operador:**
```
┌─────────────────────────────────────┐
│ Nuevo Cliente                       │
├─────────────────────────────────────┤
│ Nombre: [_______________]           │
│ Email:  [_______________]           │
│ Tel:    [_______________]           │
│ País:   [_______________]           │
│                                      │
│ ┌───────────────────────────────┐  │
│ │ ℹ️ El cliente será creado en  │  │
│ │ estado Pendiente y requiere   │  │
│ │ aprobación de Admin.          │  │
│ └───────────────────────────────┘  │
│                                      │
│     [Cancelar]  [Crear Cliente]    │
└─────────────────────────────────────┘
```

### ❌ No Puede:
- Editar clientes existentes
- Eliminar clientes
- Aprobar clientes pendientes
- Cambiar estado de clientes

---

## 2. 🚗 VEHÍCULOS

### ✅ Ver Vehículos Disponibles

**Proceso:**
```
Operador → Vehículos
↓
Ve lista de vehículos:
- Marca y modelo
- Año
- Placa
- Tipo
- Estado
↓
❌ NO ve tarifas diarias (columna oculta)
↓
Solo lectura
```

**Características:**
- ✅ Ver vehículos disponibles
- ❌ NO ve tarifas (info confidencial)
- ❌ Sin botones Crear/Editar/Eliminar

---

## 3. 📅 RESERVAS / PRE-RESERVAS

### ✅ Flujo Completo de Pre-Reserva

#### **Paso 1: Crear Pre-Reserva**

```
Cliente llega a oficina
↓
Operador → Reservas → [+ Nueva Pre-Reserva]
↓
Selecciona:
- Cliente (debe estar aprobado)
- Vehículo(s): PUEDE ELEGIR HASTA 2 OPCIONES
- Fecha inicio
- Fecha fin
- Notas
↓
Sistema calcula:
- Días totales
- Total estimado (sin mostrar tarifa al operador)
↓
Click "Crear Reserva"
↓
Pre-reserva creada en estado: "Pendiente" ⏳
```

**Características Especiales:**
- ✅ **Hasta 2 vehículos opcionales**
  - Cliente puede estar interesado en 2 opciones
  - Admin decidirá cuál asignar finalmente

```typescript
// Futuro: Implementación de 2 vehículos
interface PreReserva {
  vehiculoOpcion1: string;  // Primer vehículo
  vehiculoOpcion2?: string; // Segundo vehículo (opcional)
  vehiculoFinal?: string;   // Elegido por Admin
}
```

#### **Paso 2: Inspección Inicial**

```
Pre-reserva creada
↓
Operador lleva a cliente a ver vehículo
↓
Realiza inspección inicial:
├─ Estado exterior
├─ Estado interior
├─ Nivel de combustible
├─ Llantas y presión
├─ Luces funcionales
├─ Accesorios (gato, llave, triángulo, etc.)
├─ Documentos del vehículo
└─ 📸 Toma FOTOS de evidencia
↓
Guarda inspección:
- Checklist completo
- Fotos subidas
- Notas adicionales
- Firma del cliente (opcional)
```

**Sistema de Inspección (Futuro):**
```typescript
interface Inspeccion {
  id: string;
  reservaId: string;
  tipo: 'entrega' | 'devolucion';
  fecha: string;
  operadorId: string;
  vehiculoId: string;
  checklist: {
    exterior: 'ok' | 'dañado';
    interior: 'ok' | 'dañado';
    combustible: number; // 0-100
    llantas: 'ok' | 'dañado';
    luces: 'ok' | 'no funcionan';
    accesorios: string[]; // ['gato', 'llave', 'triángulo']
  };
  fotos: string[]; // URLs de fotos
  observaciones: string;
  firmaCliente?: string; // Firma digital
}
```

#### **Paso 3: Contrato Preliminar**

```
Inspección completada
↓
Sistema genera contrato preliminar:
├─ Datos del cliente
├─ Vehículo(s) propuesto(s)
├─ Fechas de alquiler
├─ Términos y condiciones (10 cláusulas)
└─ Estado: "Borrador"
↓
Operador imprime/muestra contrato
↓
Cliente lee y firma preliminarmente
↓
Operador sube evidencia:
└─ 📸 FOTOS del contrato firmado
```

**Sistema de Evidencia (Futuro):**
```typescript
interface EvidenciaContrato {
  contratoId: string;
  reservaId: string;
  fotos: Array<{
    url: string;
    tipo: 'firma' | 'pagina_completa' | 'identificacion';
    fecha: string;
  }>;
  operadorId: string;
  notas: string;
}
```

#### **Paso 4: Envío a Admin**

```
Contrato firmado (preliminar)
↓
Operador → "Enviar a Admin para Aprobación"
↓
Pre-reserva marcada como: "Pendiente Aprobación"
↓
Admin recibe notificación (futuro)
↓
Operador espera decisión
```

#### **Paso 5: Admin Aprueba/Rechaza**

**Si Admin APRUEBA:**
```
Admin revisa pre-reserva
↓
Ve inspección y fotos
↓
Ve contrato firmado
↓
Si hay 2 vehículos → Elige cuál asignar
↓
Click "Aprobar"
↓
Pre-reserva → "Confirmada" ✅
Contrato → "Activo"
↓
Operador recibe notificación (futuro)
```

**Si Admin RECHAZA:**
```
Admin → Click "Rechazar"
↓
Agrega motivo
↓
Pre-reserva → "Rechazada" ❌
↓
Operador recibe notificación
↓
Operador informa al cliente
```

#### **Paso 6: Entrega del Vehículo**

```
Reserva aprobada
↓
Cliente llega a recoger
↓
Operador verifica:
- Reserva confirmada
- Inspección inicial guardada
- Contrato firmado
↓
Entrega llaves y documentos
↓
Registra entrega en sistema
↓
Cliente se va con vehículo
```

---

## 4. 🔍 INSPECCIONES

### 🟢 Primera Inspección (Antes de Entrega)

**Objetivo:** Documentar el estado del vehículo ANTES de entregarlo al cliente.

**Checklist Completo:**
```
📋 Estado Exterior:
  □ Parachoques delantero
  □ Capó
  □ Techo
  □ Puertas (ambos lados)
  □ Parachoques trasero
  □ Espejos laterales
  
📋 Estado Interior:
  □ Asientos delanteros
  □ Asientos traseros
  □ Tablero
  □ Volante
  □ Alfombras
  □ Cinturones de seguridad
  
📋 Mecánico:
  □ Nivel de combustible: ___/100
  □ Llantas (presión y estado)
  □ Luces (delanteras, traseras, intermitentes)
  □ Limpiaparabrisas
  □ Aire acondicionado
  □ Radio/Audio
  
📋 Accesorios:
  □ Gato hidráulico
  □ Llave de ruedas
  □ Triángulos de seguridad
  □ Llanta de refacción
  □ Manual del vehículo
  □ Extintor
  
📸 Fotos Obligatorias:
  □ Vista frontal
  □ Vista trasera
  □ Lado izquierdo
  □ Lado derecho
  □ Tablero (kilometraje)
  □ Nivel de combustible
  □ Cualquier daño existente
```

**Proceso:**
```
1. Operador abre app/sistema de inspección
2. Selecciona vehículo
3. Completa checklist
4. Toma fotos (mínimo 7)
5. Agrega observaciones
6. Cliente firma digitalmente (acepta estado)
7. Guarda inspección
8. Inspección queda vinculada a reserva
```

### 🔴 Segunda Inspección (Devolución)

**Objetivo:** Verificar el estado del vehículo al recibirlo de vuelta y detectar daños.

**Proceso:**
```
Cliente devuelve vehículo
↓
Operador realiza inspección completa:
├─ Usa MISMO checklist que inspección inicial
├─ Compara con fotos anteriores
├─ Detecta diferencias
└─ 📸 Toma fotos de CUALQUIER daño nuevo
↓
Si encuentra daños:
├─ Documenta cada daño:
│  ├─ Ubicación exacta
│  ├─ Tipo de daño
│  ├─ Gravedad
│  └─ Fotos detalladas
├─ Cliente firma reconociendo daños
└─ Genera REPORTE DE DAÑOS
↓
Sin daños:
└─ Proceso normal continúa
```

### 📋 Reporte de Daños

**Estructura:**
```typescript
interface ReporteDaño {
  id: string;
  reservaId: string;
  vehiculoId: string;
  inspeccionId: string;
  operadorId: string;
  fecha: string;
  danos: Array<{
    ubicacion: string; // "Puerta delantera izquierda"
    tipo: 'rayón' | 'abolladura' | 'rotura' | 'faltante' | 'otro';
    descripcion: string;
    gravedad: 'leve' | 'moderado' | 'grave';
    fotos: string[];
    costoEstimado?: number; // Admin lo llena después
  }>;
  combustibleFaltante?: {
    nivel: number;
    costoEstimado?: number;
  };
  clienteFirmo: boolean;
  firmaCliente?: string;
  estado: 'reportado' | 'en-revision' | 'facturado';
}
```

**Proceso de Reporte:**
```
Operador detecta daño
↓
Crea reporte en sistema:
├─ Selecciona ubicación
├─ Selecciona tipo de daño
├─ Describe detalladamente
├─ Toma múltiples fotos
├─ Marca gravedad
└─ Cliente firma reconociendo
↓
Envía reporte a Admin
↓
Admin revisa:
├─ Ve fotos y descripción
├─ Calcula costo de reparación
├─ Actualiza factura con cargo extra
└─ Notifica al cliente
↓
Cliente debe pagar diferencia
```

**Ejemplo de Reporte:**
```
🚗 Vehículo: Toyota Corolla (ABC-123)
👤 Cliente: Juan Pérez
📅 Fecha devolución: 15/10/2024

DAÑOS DETECTADOS:

1. 🔴 Rayón en puerta trasera derecha
   - Gravedad: Moderado
   - Longitud: ~15cm
   - Profundidad: Hasta pintura
   - 📸 Fotos: [Ver 3 fotos]
   - Estimado: $500 MXN

2. 🟡 Faltante: Gato hidráulico
   - Gravedad: Leve
   - No está en cajuela
   - 📸 Fotos: [Ver 2 fotos]
   - Estimado: $800 MXN

3. 🔴 Combustible faltante
   - Entregado: 100% lleno
   - Devuelto: 75%
   - Faltante: 25% (~ 10 litros)
   - Estimado: $250 MXN

TOTAL ESTIMADO: $1,550 MXN

Firma cliente: ✅ Firmado
Estado: En revisión por Admin
```

---

## 5. 📄 CONTRATOS

### ✅ Contrato Preliminar

**Qué hace el Operador:**
1. Sistema genera contrato automático al crear pre-reserva
2. Operador imprime/muestra en pantalla
3. Explica términos y condiciones al cliente
4. Cliente firma preliminarmente
5. Operador toma fotos del contrato firmado
6. Sube evidencia al sistema

### ✅ Contrato Final

**Cuando Admin aprueba:**
- Contrato preliminar → Contrato activo
- Cliente firma versión final (presencial o digital)
- Operador archiva contrato
- Sistema guarda todo electrónicamente

---

## 6. 🔔 SEGUIMIENTO

### ✅ Dashboard del Operador

**Qué ve:**
```
📊 Mis Pre-Reservas:
├─ Pendientes de aprobación: 3
├─ Aprobadas hoy: 5
├─ Rechazadas: 1
└─ Entregas programadas hoy: 2

👤 Mis Clientes:
├─ Pendientes de aprobación: 2
├─ Aprobados esta semana: 8
└─ Total clientes agregados: 45

🔍 Inspecciones:
├─ Pendientes de realizar: 2
├─ Completadas hoy: 3
└─ Reportes de daños: 1

📋 Tareas Pendientes:
├─ Pre-reserva #123 - Esperando aprobación Admin
├─ Inspección entrega - Cliente: María G. - Hoy 3pm
└─ Inspección devolución - Cliente: Juan P. - Hoy 5pm
```

### ✅ Notificaciones (Futuro)

```
🔔 Admin aprobó pre-reserva #123
   → Contactar a cliente para entrega

🔔 Admin rechazó pre-reserva #124
   → Ver motivo y contactar cliente

🔔 Cliente Juan P. debe devolver hoy
   → Preparar inspección de devolución

🔔 Admin aprobó cliente pendiente
   → Cliente María G. ahora activo
```

---

## 7. 📱 UI/UX del Operador

### Vista de Reservas

```
┌─────────────────────────────────────────┐
│ 📅 Reservas  [+ Nueva Pre-Reserva]      │
├─────────────────────────────────────────┤
│                                          │
│ MIS PRE-RESERVAS:                       │
│                                          │
│ ┌──────────────────────────────────┐   │
│ │ #123 - Juan Pérez                │   │
│ │ Toyota Corolla                   │   │
│ │ 15-18 Oct • 3 días               │   │
│ │ Estado: ⏳ Pendiente Aprobación  │   │
│ │                                   │   │
│ │ Inspección: ✅ Completada        │   │
│ │ Contrato: ✅ Firmado (2 fotos)   │   │
│ │                                   │   │
│ │        [Ver Detalles]            │   │
│ └──────────────────────────────────┘   │
│                                          │
│ ┌──────────────────────────────────┐   │
│ │ #124 - María González            │   │
│ │ Honda CR-V o Ford F-150          │   │
│ │ 20-25 Oct • 5 días               │   │
│ │ Estado: ✅ Aprobada (CR-V)       │   │
│ │                                   │   │
│ │ [Programar Entrega]              │   │
│ └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 8. ✅ Implementación Actual vs Futuro

### ✅ YA IMPLEMENTADO:

- [x] Operador crea clientes en estado "Pendiente" automático
- [x] No puede elegir estado (campo oculto)
- [x] Mensaje informativo al crear cliente
- [x] Pre-reservas quedan pendientes
- [x] Tarifas ocultas para Operador
- [x] Contrato se genera al aprobar reserva
- [x] Admin aprueba/rechaza pre-reservas

### 📝 POR IMPLEMENTAR (Futuro):

- [ ] Sistema de inspecciones con checklist
- [ ] Subida de fotos (inspección y contratos)
- [ ] Selección de 2 vehículos opcionales
- [ ] Reportes de daños
- [ ] Notificaciones en tiempo real
- [ ] Dashboard personalizado para Operador
- [ ] Firma digital de clientes
- [ ] Historial completo de inspecciones

---

## 🎯 Resumen del Rol

El Operador es el **punto de contacto directo** con el cliente:

✅ **Puede:**
- Agregar clientes (automáticamente pendientes)
- Ver vehículos (sin tarifas)
- Crear pre-reservas
- Hacer inspecciones
- Generar contratos preliminares
- Reportar daños
- Dar seguimiento

❌ **NO Puede:**
- Aprobar clientes
- Aprobar pre-reservas
- Ver tarifas
- Modificar/eliminar registros críticos
- Generar facturas
- Tomar decisiones finales

**El Admin siempre tiene la última palabra** ✅

---

¡Flujo completo del Operador documentado! 🎉
