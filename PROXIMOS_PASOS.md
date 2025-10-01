# 🎯 PRÓXIMOS PASOS - Completar Flujo de Renta

## ✅ LO QUE YA TIENES

### **Backend/Tipos** 
- ✅ Todos los tipos TypeScript implementados
- ✅ Estados de reserva extendidos
- ✅ Tipos: Anticipo, Inspeccion, Devolucion, Extra, Dano
- ✅ Sistema de permisos completo

### **Frontend Base**
- ✅ Layout responsive con sidebar
- ✅ Dark mode completo
- ✅ Componentes comunes (Table, Modal, Input, etc.)
- ✅ Custom hooks (useAuth, useForm, usePermissions, useSidebar)
- ✅ Módulos: Clientes, Vehículos, Usuarios, Reservas, Facturación

### **Componentes Nuevos**
- ✅ `InspeccionForm` - Formulario de inspección completo

---

## 🔴 PASO 1: Formulario de Anticipo (30 min)

### Crear: `components/forms/AnticipoForm.tsx`

```typescript
interface AnticipoFormProps {
  reservaId: string;
  onSubmit: (anticipo: Partial<Anticipo>) => void;
  onCancel: () => void;
}

// Campos:
- Monto (number)
- Concepto (select: deposito | anticipo)
- Método de pago (select: efectivo | tarjeta | transferencia)
- Notas (textarea)
```

**Agregar a:** `Reservas.tsx`
- Botón "Registrar Anticipo" cuando reserva está `confirmed`
- Modal con AnticipoForm

---

## 🔴 PASO 2: Formulario de Devolución (1 hora)

### Crear: `components/forms/DevolucionForm.tsx`

```typescript
interface DevolucionFormProps {
  reserva: Reserva;
  inspeccionEntrega: Inspeccion;
  onSubmit: (devolucion: Partial<Devolucion>) => void;
  onCancel: () => void;
}

// Incluye:
1. InspeccionForm (tipo: devolucion)
2. Cálculo automático de extras:
   - Días adicionales
   - Kilometraje excedido
   - Combustible faltante
   - Costo de daños
3. Resumen de totales
4. Observaciones
```

**Características:**
```typescript
// Cálculo de días extras
const diasExtras = diasReales - diasProgramados;
if (diasExtras > 0) {
  extras.push({
    tipo: 'dias_extra',
    cantidad: diasExtras,
    precioUnitario: vehiculo.dailyRate,
    total: diasExtras * vehiculo.dailyRate
  });
}

// Cálculo de kilometraje
const kmExtra = kmFinal - kmInicial - kmPermitido;
if (kmExtra > 0) {
  extras.push({
    tipo: 'kilometraje',
    cantidad: kmExtra,
    precioUnitario: 0.10, // $0.10 por km
    total: kmExtra * 0.10
  });
}

// Cálculo de combustible
const combustibleFaltante = nivelInicial - nivelFinal;
if (combustibleFaltante > 0) {
  const costoTanque = 50; // Ejemplo
  extras.push({
    tipo: 'combustible',
    cantidad: combustibleFaltante,
    precioUnitario: costoTanque / 100,
    total: (combustibleFaltante / 100) * costoTanque
  });
}

// Suma de daños de la inspección
const costosDanos = inspeccion.danos.reduce((sum, d) => 
  sum + (d.costoEstimado || 0), 0
);
```

**Agregar a:** `Reservas.tsx`
- Botón "Registrar Devolución" cuando reserva está `en_uso`
- Modal con DevolucionForm

---

## 🔴 PASO 3: Actualizar Módulo de Reservas (30 min)

### Modificar: `pages/Reservas.tsx`

#### **En el Formulario de Creación:**
```typescript
// Agregar campos:
<Select
  name="vehiculoAlternativoId"
  label="Vehículo Alternativo (Opcional)"
  value={values.vehiculoAlternativoId}
  onChange={handleChange}
  options={vehiculosDisponibles}
/>
```

#### **En la Tabla:**
```typescript
// Nueva columna de acciones según estado:
{
  key: 'actions',
  label: 'Acciones',
  render: (reserva: Reserva) => {
    switch (reserva.status) {
      case 'pending':
        return canApprove && (
          <>
            <Button onClick={() => handleApprove(reserva)}>
              Aprobar
            </Button>
            <Button variant="danger" onClick={() => handleReject(reserva)}>
              Rechazar
            </Button>
          </>
        );
      
      case 'confirmed':
        return (
          <>
            {!reserva.anticipoMonto && (
              <Button onClick={() => openAnticipoModal(reserva)}>
                Registrar Anticipo
              </Button>
            )}
            <Button onClick={() => openEntregaModal(reserva)}>
              Entregar Vehículo
            </Button>
          </>
        );
      
      case 'en_uso':
        return (
          <Button onClick={() => openDevolucionModal(reserva)}>
            Registrar Devolución
          </Button>
        );
      
      case 'devuelto':
        return (
          <Button onClick={() => generarFactura(reserva)}>
            Generar Factura
          </Button>
        );
      
      default:
        return <span>-</span>;
    }
  }
}
```

#### **Modal de Aprobación para Admin:**
```typescript
const AprobarReservaModal = ({ reserva, onSubmit }) => {
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(
    reserva.vehiculoId
  );
  
  return (
    <Modal>
      <h3>Aprobar Pre-reserva</h3>
      
      {/* Si hay vehículo alternativo, mostrar ambos */}
      {reserva.vehiculoAlternativoId && (
        <div>
          <p>Selecciona el vehículo definitivo:</p>
          <div className="grid grid-cols-2 gap-4">
            <Card 
              onClick={() => setVehiculoSeleccionado(reserva.vehiculoId)}
              className={vehiculoSeleccionado === reserva.vehiculoId ? 'border-primary' : ''}
            >
              <h4>Opción 1</h4>
              <p>{reserva.vehiculoInfo}</p>
            </Card>
            
            <Card 
              onClick={() => setVehiculoSeleccionado(reserva.vehiculoAlternativoId)}
              className={vehiculoSeleccionado === reserva.vehiculoAlternativoId ? 'border-primary' : ''}
            >
              <h4>Opción 2</h4>
              <p>{reserva.vehiculoAlternativoInfo}</p>
            </Card>
          </div>
        </div>
      )}
      
      <Button onClick={() => onSubmit(vehiculoSeleccionado)}>
        Aprobar Reserva
      </Button>
    </Modal>
  );
};
```

---

## 🟡 PASO 4: Actualizar Módulo de Facturación (30 min)

### Modificar: `pages/Facturacion.tsx`

#### **En la Tabla:**
```typescript
{
  key: 'monto',
  label: 'Monto',
  render: (factura: Factura) => (
    <div className="text-sm">
      <p className="text-gray-600 dark:text-gray-400">
        Base: {formatCurrency(factura.amount)}
      </p>
      <p className="text-gray-600 dark:text-gray-400">
        IVA: {formatCurrency(factura.tax)}
      </p>
      {factura.extras > 0 && (
        <p className="text-warning">
          + Extras: {formatCurrency(factura.extras)}
        </p>
      )}
      {factura.anticipo > 0 && (
        <p className="text-success">
          - Anticipo: {formatCurrency(factura.anticipo)}
        </p>
      )}
      <p className="font-semibold text-gray-900 dark:text-gray-100 border-t pt-1 mt-1">
        Total: {formatCurrency(factura.total)}
      </p>
      <p className="font-bold text-primary-600">
        A Pagar: {formatCurrency(factura.montoPendiente)}
      </p>
    </div>
  )
}
```

#### **Función para generar factura desde devolución:**
```typescript
const generarFacturaDesdeDevolucion = (reserva: Reserva, devolucion: Devolucion) => {
  const subtotal = reserva.totalAmount;
  const iva = subtotal * 0.16;
  const totalBase = subtotal + iva;
  const totalExtras = devolucion.totalExtras;
  const total = totalBase + totalExtras;
  const anticipo = reserva.anticipoMonto || 0;
  const montoPendiente = total - anticipo;
  
  const factura: Partial<Factura> = {
    reservaId: reserva.id,
    clienteId: reserva.clienteId,
    clienteName: reserva.clienteName,
    amount: subtotal,
    tax: iva,
    total: total,
    anticipo: anticipo,
    extras: totalExtras,
    montoPendiente: montoPendiente,
    status: 'pending',
    issueDate: new Date().toISOString(),
    dueDate: addDays(new Date(), 15).toISOString(),
    createdBy: currentUser.id
  };
  
  // Crear factura...
};
```

---

## 🟡 PASO 5: Dashboard Mejorado (1 hora)

### Modificar: `pages/Dashboard.tsx`

#### **Widget de Pre-reservas Pendientes (para Admin):**
```typescript
{currentUser.role === 'ADMIN' && (
  <Card>
    <h3>📋 Pre-reservas Pendientes</h3>
    <div className="space-y-2">
      {preReservasPendientes.map(reserva => (
        <div key={reserva.id} className="p-3 bg-warning-light rounded-lg">
          <p className="font-semibold">{reserva.clienteName}</p>
          <p className="text-sm text-gray-600">
            {reserva.vehiculoInfo}
            {reserva.vehiculoAlternativoInfo && (
              <span> + {reserva.vehiculoAlternativoInfo}</span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(reserva.createdAt)}
          </p>
          <Button size="sm" onClick={() => navigate('/crm/reservas')}>
            Revisar
          </Button>
        </div>
      ))}
    </div>
  </Card>
)}
```

#### **Widget de Devoluciones Próximas:**
```typescript
<Card>
  <h3>🚗 Devoluciones Próximas (48h)</h3>
  <div className="space-y-2">
    {devolucionesProximas.map(reserva => (
      <div key={reserva.id} className="p-3 bg-blue-50 rounded-lg">
        <p className="font-semibold">{reserva.clienteName}</p>
        <p className="text-sm">{reserva.vehiculoInfo}</p>
        <p className="text-xs text-danger font-semibold">
          Vence: {formatDate(reserva.endDate)}
        </p>
      </div>
    ))}
  </div>
</Card>
```

#### **Estadísticas Actualizadas:**
```typescript
const stats = {
  reservasActivas: reservas.filter(r => r.status === 'en_uso').length,
  preReservasPendientes: reservas.filter(r => r.status === 'pending').length,
  devolucionesHoy: reservas.filter(r => 
    r.status === 'en_uso' && 
    isSameDay(new Date(r.endDate), new Date())
  ).length,
  ingresosMesActual: facturas
    .filter(f => isSameMonth(new Date(f.paidDate), new Date()))
    .reduce((sum, f) => sum + f.montoPendiente, 0),
};
```

---

## 🟢 PASO 6: Módulo de Reportes (Opcional)

### Crear: `pages/Reportes.tsx`

```typescript
export const Reportes = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  const reporteIngresos = useMemo(() => {
    // Filtrar facturas por período
    // Agrupar por día
    // Calcular totales
  }, [fechaInicio, fechaFin]);
  
  return (
    <div className="space-y-6">
      <h1>📊 Reportes</h1>
      
      {/* Filtros de fecha */}
      <Card>
        <Input type="date" label="Desde" />
        <Input type="date" label="Hasta" />
        <Button>Generar Reporte</Button>
      </Card>
      
      {/* Conteo diario */}
      <Card>
        <h3>💰 Ingresos Diarios</h3>
        <Table data={reporteIngresos} />
        <p>Total del período: ${total}</p>
      </Card>
      
      {/* Extras más comunes */}
      <Card>
        <h3>📈 Extras Más Comunes</h3>
        {/* Gráfico o lista */}
      </Card>
    </div>
  );
};
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1 - Crítico (2-3 horas)**
- [ ] Crear `AnticipoForm.tsx`
- [ ] Crear `DevolucionForm.tsx`
- [ ] Actualizar `Reservas.tsx`:
  - [ ] Campo de vehículo alternativo
  - [ ] Modal de aprobación con selección
  - [ ] Botones según estado
  - [ ] Modal de entrega con InspeccionForm
  - [ ] Modal de devolución con DevolucionForm
- [ ] Actualizar `Facturacion.tsx`:
  - [ ] Mostrar anticipo y extras
  - [ ] Función de generación desde devolución

### **Fase 2 - Importante (1-2 horas)**
- [ ] Dashboard con widgets de alertas
- [ ] Estadísticas actualizadas
- [ ] Notificaciones visuales

### **Fase 3 - Opcional (2-3 horas)**
- [ ] Módulo de reportes
- [ ] Exportar a PDF
- [ ] Gráficos

---

## 🚀 ORDEN SUGERIDO

**DÍA 1:**
1. Crear AnticipoForm (30 min)
2. Crear DevolucionForm (1 hora)
3. ☕ Break

**DÍA 2:**
4. Actualizar Reservas.tsx (1 hora)
5. Actualizar Facturacion.tsx (30 min)
6. ☕ Break

**DÍA 3:**
7. Dashboard mejorado (1 hora)
8. Testing completo del flujo (1 hora)

---

## 📦 ARCHIVOS A CREAR

```
frontend/src/crm/
├── components/forms/
│   ├── InspeccionForm.tsx     ✅ YA EXISTE
│   ├── AnticipoForm.tsx        🔴 CREAR
│   └── DevolucionForm.tsx      🔴 CREAR
│
└── pages/
    ├── Reservas.tsx            🟡 ACTUALIZAR
    ├── Facturacion.tsx         🟡 ACTUALIZAR
    ├── Dashboard.tsx           🟡 ACTUALIZAR
    └── Reportes.tsx            🟢 OPCIONAL
```

---

## ✨ RESULTADO FINAL

Al completar estos pasos tendrás:

✅ **Flujo completo de renta de principio a fin**
✅ **Sistema de inspecciones con registro de daños**
✅ **Cálculo automático de extras**
✅ **Sistema de anticipos separado de facturación**
✅ **Facturación final con todos los detalles**
✅ **Dashboard con alertas en tiempo real**
✅ **Sistema profesional y completo**

**¡Empecemos! 🚀**
