# 📋 Flujo Completo: Pre-Reserva → Inspección → Contrato → Reserva Aprobada

## 🎯 Resumen del Flujo

```
Cliente solicita alquiler
    ↓
1. Operador crea PRE-RESERVA (pendiente)
    ↓
2. Operador realiza INSPECCIÓN FÍSICA (entrega)
    ↓
3. Sistema genera CONTRATO PRELIMINAR
    ↓
4. Cliente firma contrato
    ↓
5. Operador envía a ADMIN para aprobación
    ↓
6. Admin APRUEBA
    ↓
7. Pre-reserva → RESERVA CONFIRMADA ✅
    ↓
8. Se asigna # DE RESERVA
    ↓
Cliente recoge vehículo
    ↓
9. Cliente usa vehículo
    ↓
10. Cliente devuelve vehículo
    ↓
11. Operador realiza INSPECCIÓN DE RETORNO
    ↓
12. ¿Hay daños? → Reporte de daños → RECARGOS EXTRA
    ↓
13. Admin genera FACTURA FINAL (con recargos si hay)
    ↓
14. Cliente paga
    ↓
FIN
```

---

## PASO 1: Pre-Reserva (Estado: Pendiente)

### Operador Crea Pre-Reserva

**Ubicación**: Módulo Reservas → [+ Nueva Pre-Reserva]

**Datos a ingresar**:
```
Cliente: [Seleccionar cliente aprobado]
Vehículo: [Seleccionar vehículo disponible]
  → Puede elegir hasta 2 vehículos opcionales
Fecha inicio: [DD/MM/AAAA]
Fecha fin: [DD/MM/AAAA]
Notas: [Observaciones adicionales]
```

**Sistema calcula automáticamente**:
- Días totales
- Total estimado (sin mostrar tarifa al operador)

**Al guardar**:
```
Pre-reserva creada:
ID: pre-res-001
Estado: ⏳ Pendiente
Cliente: Juan Pérez
Vehículo: Toyota Corolla (ABC-123)
Fechas: 15/10/2024 - 18/10/2024
Días: 3
```

---

## PASO 2: Inspección Física de Entrega

### Operador Realiza Inspección

**Objetivo**: Documentar el estado INICIAL del vehículo antes de entregarlo.

**Checklist Completo**:

#### A. Estado Exterior
```
□ Parachoques delantero: [OK / Dañado]
□ Capó: [OK / Dañado]
□ Techo: [OK / Dañado]
□ Puertas (ambos lados): [OK / Dañado]
□ Parachoques trasero: [OK / Dañado]
□ Espejos laterales: [OK / Dañado]
□ Llantas: [OK / Dañado]
```

#### B. Estado Interior
```
□ Asientos delanteros: [OK / Dañado]
□ Asientos traseros: [OK / Dañado]
□ Tablero: [OK / Dañado]
□ Volante: [OK / Dañado]
□ Alfombras: [OK / Dañado]
□ Cinturones: [OK / Dañado]
```

#### C. Mecánico
```
□ Nivel de combustible: [75%] ← IMPORTANTE
□ Llantas (presión): [32 PSI]
□ Luces: [Todas OK]
□ Limpiaparabrisas: [OK]
□ Aire acondicionado: [OK]
□ Radio/Audio: [OK]
```

#### D. Accesorios
```
□ Gato hidráulico: [✓]
□ Llave de ruedas: [✓]
□ Triángulos de seguridad: [✓]
□ Llanta de refacción: [✓]
□ Manual del vehículo: [✓]
□ Extintor: [✓]
```

#### E. Fotos Obligatorias (Futuro)
```
📸 Vista frontal
📸 Vista trasera
📸 Lado izquierdo
📸 Lado derecho
📸 Tablero (kilometraje: 45,000 km)
📸 Nivel de combustible (3/4 lleno)
📸 Cualquier daño pre-existente
```

**Resultado de Inspección**:
```
Inspección #INS-001
Tipo: Entrega
Vehículo: Toyota Corolla (ABC-123)
Fecha: 15/10/2024 10:30 AM
Operador: Ana García

Estado General: ✅ EXCELENTE
Combustible: 75% (3/4 lleno)
Kilometraje: 45,000 km
Accesorios: Todos presentes
Observaciones: Vehículo en perfectas condiciones

Firma Cliente: ✅ Juan Pérez
```

---

## PASO 3: Contrato Preliminar

### Sistema Genera Contrato Automático

Al completar la inspección, el sistema genera:

```
╔══════════════════════════════════════════════╗
║     CONTRATO DE ALQUILER - PRELIMINAR       ║
╚══════════════════════════════════════════════╝

Contrato #: CTR-2024-001
Estado: 📝 BORRADOR
Fecha: 15/10/2024

CLIENTE:
Nombre: Juan Pérez
Email: juan@email.com
Teléfono: (123) 456-7890
Licencia: ABC123456

VEHÍCULO:
Marca/Modelo: Toyota Corolla 2024
Placa: ABC-123
Kilometraje inicio: 45,000 km

PERÍODO DE ALQUILER:
Inicio: 15/10/2024 a las 10:00 AM
Fin: 18/10/2024 a las 10:00 AM
Días: 3 días

TARIFA:
Tarifa diaria: $45.00
Total días: $135.00
Depósito: $50.00
TOTAL: $185.00

TÉRMINOS Y CONDICIONES:
1. El vehículo debe devolverse con el mismo nivel 
   de combustible (75%)
2. El cliente es responsable de cualquier daño
3. Se requiere licencia de conducir válida
4. Seguro completo incluido
5. Kilometraje ilimitado
6. Asistencia 24/7
7. Prohibido fumar
8. Reportar incidentes inmediatamente
9. Multas son responsabilidad del cliente
10. Devolución en ubicación acordada

INSPECCIÓN DE ENTREGA:
Vinculada: INS-001
Estado: ✅ Aprobada
Combustible entregado: 75%
Accesorios completos: ✅

FIRMAS:
Cliente: ________________________
         Juan Pérez
         Fecha: 15/10/2024

Operador: ________________________
          Ana García
          Fecha: 15/10/2024
╚══════════════════════════════════════════════╝
```

---

## PASO 4: Firma del Cliente

**Operador**:
1. Imprime contrato (o muestra en tablet)
2. Explica términos y condiciones
3. Cliente lee cuidadosamente
4. Cliente firma preliminarmente
5. Operador toma fotos del contrato firmado

**Evidencia guardada**:
```
Contrato CTR-2024-001
Estado: 📝 Borrador Firmado
Fotos: 3 imágenes
  - Página 1 con firma
  - Página 2 con términos
  - Identificación del cliente
Fecha firma: 15/10/2024 10:45 AM
```

---

## PASO 5: Envío a Admin

**Operador** → Botón "Enviar a Admin"

```
Pre-reserva #pre-res-001 actualizada:
Estado: ⏳ Pendiente Aprobación

Incluye:
✅ Pre-reserva con datos completos
✅ Inspección de entrega completa
✅ Contrato preliminar firmado
✅ Fotos de evidencia

Notificación enviada a Admin ✉️
```

---

## PASO 6: Admin Aprueba

**Admin** → Módulo Reservas → Pre-reservas Pendientes

**Revisa**:
1. Datos del cliente
2. Disponibilidad real del vehículo
3. Inspección completada correctamente
4. Contrato firmado
5. Si hay 2 vehículos opcionales → Elige cuál asignar

**Admin** → Click "✅ Aprobar"

```
Confirmación:
¿Aprobar pre-reserva #pre-res-001?

Cliente: Juan Pérez
Vehículo: Toyota Corolla (ABC-123)
Fechas: 15/10/2024 - 18/10/2024
Inspección: ✅ Completa
Contrato: ✅ Firmado

[Cancelar]  [✅ Aprobar Reserva]
```

---

## PASO 7: Reserva Confirmada

**Al aprobar**:

```
✅ PRE-RESERVA APROBADA

Cambios aplicados:
1. Pre-reserva → Reserva Confirmada
2. Estado: ✅ Confirmada
3. # de Reserva asignado: RES-2024-001
4. Contrato Preliminar → Contrato Activo
5. Vehículo marcado como: Reservado

Notificación enviada a:
✉️ Operador Ana García
✉️ Cliente Juan Pérez (email/SMS)

Reserva RES-2024-001:
Cliente: Juan Pérez
Vehículo: Toyota Corolla (ABC-123)
Estado: ✅ CONFIRMADA
Inicio: 15/10/2024
Fin: 18/10/2024
Contrato: CTR-2024-001 (Activo)
```

---

## PASO 8: # de Reserva Visible

**Cliente puede consultar**:
```
Su reserva está confirmada:

# DE RESERVA: RES-2024-001

Vehículo: Toyota Corolla 2024 (ABC-123)
Recogida: 15/10/2024 a las 10:00 AM
Devolución: 18/10/2024 a las 10:00 AM
Ubicación: Sucursal Principal

Estado: ✅ CONFIRMADA

[Ver Contrato] [Ver Inspección] [Contactar]
```

---

## PASO 9-10: Uso del Vehículo

Cliente usa el vehículo durante el período acordado (3 días).

---

## PASO 11: Inspección de Retorno

### Cliente Devuelve Vehículo

**Fecha**: 18/10/2024 10:00 AM

**Operador** → Nueva Inspección (Devolución)

**Mismo Checklist que entrega**:
- Compara con inspección inicial (INS-001)
- Busca diferencias
- Documenta cualquier cambio

#### Ejemplo: Inspección con Daños

```
Inspección #INS-002
Tipo: ⚠️ DEVOLUCIÓN
Vehículo: Toyota Corolla (ABC-123)
Fecha: 18/10/2024 10:15 AM
Operador: Ana García

Compara con: INS-001 (Entrega)

DIFERENCIAS DETECTADAS:

❌ 1. Puerta trasera derecha
   Estado Entrega: OK
   Estado Devolución: DAÑADO
   Tipo: Rayón
   Descripción: Rayón de 15cm en pintura
   Gravedad: 🟡 Moderado
   📸 Foto: [ver imagen]

❌ 2. Cajuela
   Estado Entrega: Gato hidráulico ✓
   Estado Devolución: Gato hidráulico ✗ FALTANTE
   Tipo: Faltante
   Gravedad: 🟢 Leve
   📸 Foto: [ver cajuela vacía]

⚠️ 3. Combustible
   Entregado: 75% (3/4 lleno)
   Devuelto: 50% (1/2 lleno)
   Faltante: 25% (aprox 10 litros)

✅ 4. Kilometraje
   Entregado: 45,000 km
   Devuelto: 45,350 km
   Recorrido: 350 km (Normal)

Cliente Reconoce Daños: ✅ SÍ
Firma: ✅ Juan Pérez
```

---

## PASO 12: Reporte de Daños → Recargos Extra

### Operador Genera Reporte

```
╔══════════════════════════════════════════════╗
║        REPORTE DE DAÑOS                      ║
╚══════════════════════════════════════════════╝

Reporte #: REP-DAÑ-001
Reserva: RES-2024-001
Vehículo: Toyota Corolla (ABC-123)
Cliente: Juan Pérez
Fecha: 18/10/2024
Operador: Ana García

DAÑOS DETECTADOS:

1. 🟡 Rayón en puerta trasera derecha
   Ubicación: Puerta trasera derecha
   Tipo: Rayón profundo
   Longitud: 15cm
   Gravedad: Moderado
   📸 Fotos: 3 imágenes
   💰 Costo Estimado: $75.00

2. 🟢 Gato hidráulico faltante
   Ubicación: Cajuela
   Tipo: Accesorio faltante
   Gravedad: Leve
   📸 Fotos: 2 imágenes
   💰 Costo Reposición: $25.00

3. ⛽ Combustible faltante
   Entregado: 75%
   Devuelto: 50%
   Faltante: 25% (10 litros aprox)
   💰 Costo: $10.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL RECARGOS POR DAÑOS: $110.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estado: 🔍 En Revisión por Admin
Cliente Firmó: ✅ SÍ

[Enviar a Admin]
╚══════════════════════════════════════════════╝
```

**Operador** → Envía reporte a Admin

---

## PASO 13: Factura Final con Recargos

### Admin Genera Factura

**Admin** → Módulo Facturación → Nueva Factura

**Sistema calcula automáticamente**:

```
╔══════════════════════════════════════════════╗
║           FACTURA #FAC-2024-001              ║
╚══════════════════════════════════════════════╝

Cliente: Juan Pérez
Reserva: RES-2024-001
Vehículo: Toyota Corolla (ABC-123)
Fecha: 18/10/2024

─────────────────────────────────────────────

DESGLOSE DE COSTOS:

Tarifa base por día              $45.00
Total días (3)                  $135.00
                                ─────────
Subtotal Alquiler:              $135.00

CARGOS POR DAÑOS:               +$75.00  🔴
  • Rayón puerta trasera           $75.00

CARGOS ADICIONALES:             +$35.00  🟠
  • Gato hidráulico faltante       $25.00
  • Combustible faltante           $10.00

Depósito aplicado:              -$50.00  🟢

─────────────────────────────────────────────
TOTAL A PAGAR:                  $195.00  💰
═════════════════════════════════════════════

TÉRMINOS Y CONDICIONES:
• El pago debe realizarse dentro de 15 días
• Los daños están sujetos a inspección técnica
• Esta factura incluye todos los impuestos

Estado: ⏳ Pendiente de Pago
Vencimiento: 02/11/2024

[Descargar PDF]  [Reenviar Email]  [Marcar Pagada]
╚══════════════════════════════════════════════╝
```

**Desglose Visible al Cliente**:
```
✅ Alquiler 3 días: $135.00
🔴 Cargos por daños: +$75.00
   └─ Reparación rayón puerta
🟠 Cargos adicionales: +$35.00
   └─ Gato hidráulico: $25.00
   └─ Combustible: $10.00
🟢 Depósito aplicado: -$50.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 TOTAL A PAGAR: $195.00
```

---

## PASO 14: Cliente Paga

Cliente recibe factura y paga:
- Efectivo
- Tarjeta
- Transferencia

**Admin** → Marca factura como "Pagada"

```
Factura #FAC-2024-001
Estado: ✅ PAGADA
Fecha de pago: 20/10/2024
Método: Tarjeta de crédito
Monto: $195.00

Reserva RES-2024-001: CERRADA
Proceso completado ✅
```

---

## 📊 Resumen del Flujo

| Paso | Acción | Responsable | Sistema | Estado |
|------|--------|-------------|---------|--------|
| 1 | Crear pre-reserva | Operador | Pre-reserva | Pendiente |
| 2 | Inspección entrega | Operador | Inspección #1 | Completada |
| 3 | Generar contrato | Sistema | Contrato | Borrador |
| 4 | Firmar contrato | Cliente | Contrato | Firmado |
| 5 | Enviar a Admin | Operador | Pre-reserva | Pendiente Aprobación |
| 6 | Aprobar | Admin | Reserva | Confirmada ✅ |
| 7 | Asignar # Reserva | Sistema | RES-2024-001 | Activa |
| 8 | Cliente usa vehículo | Cliente | - | En curso |
| 9 | Inspección retorno | Operador | Inspección #2 | Completada |
| 10 | Reporte daños | Operador | Reporte | En revisión |
| 11 | Revisar daños | Admin | Reporte | Aprobado |
| 12 | Generar factura | Admin | Factura | Pendiente |
| 13 | Cliente paga | Cliente | Factura | Pagada ✅ |

---

## ✅ Estado Actual vs Por Implementar

### ✅ YA IMPLEMENTADO:
- [x] Crear pre-reservas (estado pendiente)
- [x] Admin aprueba/rechaza
- [x] Contrato se genera automáticamente
- [x] Asignación de # de reserva
- [x] Tab de contratos en Reservas
- [x] Módulo de Mantenimiento para reportes

### 📝 POR IMPLEMENTAR (Futuro):
- [ ] Sistema completo de inspecciones con checklist
- [ ] Subida de fotos en inspecciones
- [ ] Comparación automática entrega vs devolución
- [ ] Reporte de daños integrado
- [ ] Cálculo automático de recargos
- [ ] Factura con desglose detallado
- [ ] Notificaciones automáticas

---

¡Flujo completo documentado desde pre-reserva hasta factura final! 🎉
