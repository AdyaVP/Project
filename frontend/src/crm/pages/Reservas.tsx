import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useForm } from '../hooks/useForm';
import { Card, Table, Button, Modal, Input, Select, SearchBar, Badge } from '../components/common';
import { InspeccionFormCompleta, ContratoArrendamiento } from '../components/forms';
import { mockReservas, mockClientes, mockVehiculos, mockContratos } from '../data/mockData';
import { Reserva, ReservaStatus, Vehiculo, Inspeccion, Contrato } from '../types';
import { validateForm } from '../utils/validation';
import { formatCurrency, formatShortDate, calculateDays, convertUSDtoHNL } from '../utils/formatters';

export const Reservas: React.FC = () => {
  const { currentUser } = useAuth();
  const { canCreate, canApprove } = usePermissions('reservas');
  
  // Detectar si es OPERADOR
  const isOperador = currentUser?.role === 'OPERADOR';
  
  const [reservas, setReservas] = useState<Reserva[]>(mockReservas);
  const [contratos, setContratos] = useState<Contrato[]>(mockContratos);
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'prereservas' | 'contratos'>('prereservas');
  
  // Estados para el flujo del OPERADOR (2 pasos)
  const [step, setStep] = useState<'datos' | 'inspeccion'>('datos');
  const [reservaTemp, setReservaTemp] = useState<Reserva | null>(null);
  
  // Estados para crear contrato desde reservas confirmadas
  const [reservaParaContrato, setReservaParaContrato] = useState<Reserva | null>(null);
  
  // Estados para ver detalles de reserva
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [reservaDetalle, setReservaDetalle] = useState<Reserva | null>(null);

  const { values, errors, handleChange, handleSubmit, resetForm } = useForm<{
    clienteId: string;
    vehiculoId: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    initialValues: {
      clienteId: '',
      vehiculoId: '',
      startDate: '',
      endDate: '',
      notes: '',
    },
    onSubmit: (formValues) => {
      const cliente = mockClientes.find(c => c.id === formValues.clienteId);
      const vehiculo = mockVehiculos.find(v => v.id === formValues.vehiculoId);
      
      if (!cliente || !vehiculo) return;

      const days = calculateDays(formValues.startDate, formValues.endDate);
      const totalAmount = days * vehiculo.dailyRate;

      // Generar número de pre-reserva secuencial
      const ultimoNumero = reservas.length > 0 
        ? Math.max(...reservas.map(r => {
            const match = r.id.match(/PRE-(\d+)/);
            return match ? parseInt(match[1]) : 0;
          }))
        : 99;
      const nuevoNumero = ultimoNumero + 1;

      const newReserva: Reserva = {
        id: `PRE-${nuevoNumero}`,
        clienteId: formValues.clienteId,
        clienteName: cliente.name,
        vehiculoId: formValues.vehiculoId,
        vehiculoInfo: `${vehiculo.brand} ${vehiculo.model} (${vehiculo.plate})`,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        days,
        totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id || '',
        notes: formValues.notes,
      };

      // Si es OPERADOR, pasar al paso 2 (inspección)
      if (isOperador) {
        setReservaTemp(newReserva);
        setStep('inspeccion');
      } else {
        // Si es ADMIN/SUPER_ADMIN, guardar directamente
        setReservas(prev => [newReserva, ...prev]);
        setShowModal(false);
        resetForm();
      }
    },
    validate: (values) => {
      const validation = validateForm({
        clienteId: { value: values.clienteId, rules: { required: true } },
        vehiculoId: { value: values.vehiculoId, rules: { required: true } },
        startDate: { value: values.startDate, rules: { required: true } },
        endDate: { value: values.endDate, rules: { required: true } },
      });

      if (values.startDate && values.endDate && new Date(values.startDate) > new Date(values.endDate)) {
        validation.errors.endDate = 'La fecha final debe ser posterior a la inicial';
      }

      return validation.errors;
    },
  });

  // Guardar inspección y finalizar pre-reserva (OPERADOR)
  const handleGuardarReservaConInspeccion = (inspeccion: Partial<Inspeccion>) => {
    if (!reservaTemp) return;

    // Guardar inspección
    const nuevaInspeccion: Inspeccion = {
      ...inspeccion,
      id: `INS-${Date.now()}`,
      reservaId: reservaTemp.id,
    } as Inspeccion;

    setInspecciones([...inspecciones, nuevaInspeccion]);

    // Guardar pre-reserva con datos de inspección para que Admin/Super Admin puedan verlos
    const reservaConInspeccion: Reserva = {
      ...reservaTemp,
      inspeccionData: {
        kilometraje: inspeccion.kilometraje ? inspeccion.kilometraje.toString() : '',
        nivelCombustible: inspeccion.nivelCombustible ? inspeccion.nivelCombustible.toString() : '',
        observaciones: inspeccion.observaciones || '',
        checklistInterior: inspeccion.checklistInterior || {},
        checklistExterior: inspeccion.checklistExterior || {},
      },
    };

    // Guardar pre-reserva (status: pending - requiere aprobación de Admin/Super Admin)
    setReservas([reservaConInspeccion, ...reservas]);

    // Limpiar y volver al inicio
    setReservaTemp(null);
    setStep('datos');
    resetForm();
    setShowModal(false);
    alert('✅ Pre-reserva creada exitosamente.\n\n📋 La pre-reserva ha sido enviada a Admin/Super Admin para su revisión y aprobación.\n\n⏳ Estado: Pendiente');
  };

  // Abrir modal para crear contrato (solo para reservas confirmadas)
  const handleCrearContrato = (reserva: Reserva) => {
    setReservaParaContrato(reserva);
    setShowContratoModal(true);
  };

  // Guardar contrato
  const handleGuardarContrato = (contratoData: any) => {
    if (!reservaParaContrato) return;

    const nuevoContrato: Contrato = {
      id: `CTR-${Date.now()}`,
      reservaId: reservaParaContrato.id,
      clienteId: reservaParaContrato.clienteId,
      clienteName: reservaParaContrato.clienteName,
      vehiculoInfo: reservaParaContrato.vehiculoInfo,
      startDate: reservaParaContrato.startDate,
      endDate: reservaParaContrato.endDate,
      terms: [
        'El vehículo debe devolverse con el mismo nivel de combustible',
        'El cliente es responsable de cualquier daño durante el alquiler',
        'Se requiere licencia de conducir válida y vigente',
        'Seguro completo incluido para daños a terceros',
        'Kilometraje ilimitado dentro del territorio nacional',
        'Asistencia en carretera disponible 24 horas, 7 días',
        'Prohibido fumar dentro del vehículo',
        'Reportar cualquier incidente de forma inmediata',
        'Multas de tránsito son responsabilidad del cliente',
        'Devolución obligatoria en la ubicación acordada',
      ],
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      // Guardar TODOS los datos del formulario del Operador
      contratoData: contratoData,
      firmaCliente: contratoData.firmaCliente,
      firmaRepresentante: contratoData.firmaRepresentante,
    };

    setContratos([nuevoContrato, ...contratos]);
    setShowContratoModal(false);
    setReservaParaContrato(null);
    alert('✅ Contrato creado exitosamente.\n\n📋 Todos los datos han sido guardados correctamente.\n👁️ Admin/Super Admin podrán ver toda la información registrada.');
  };

  // Obtener vehículo por ID
  const getVehiculo = (id?: string): Vehiculo | undefined => {
    if (!id) return undefined;
    return mockVehiculos.find(v => v.id === id);
  };

  const handleApprove = (id: string) => {
    const reserva = reservas.find(r => r.id === id);
    if (!reserva) return;

    // Actualizar reserva a confirmada
    setReservas(prev =>
      prev.map(r => r.id === id ? {
        ...r,
        status: 'confirmed' as ReservaStatus,
        approvedBy: currentUser?.id,
        approvedAt: new Date().toISOString().split('T')[0],
      } : r)
    );

    // Crear contrato automáticamente
    const nuevoContrato: Contrato = {
      id: `ctr-${Date.now()}`,
      reservaId: reserva.id,
      clienteId: reserva.clienteId,
      clienteName: reserva.clienteName,
      vehiculoInfo: reserva.vehiculoInfo,
      startDate: reserva.startDate,
      endDate: reserva.endDate,
      terms: [
        'El vehículo debe devolverse con el mismo nivel de combustible',
        'El cliente es responsable de cualquier daño durante el alquiler',
        'Se requiere licencia de conducir válida y vigente',
        'Seguro completo incluido para daños a terceros',
        'Kilometraje ilimitado dentro del territorio nacional',
        'Asistencia en carretera disponible 24 horas, 7 días',
        'Prohibido fumar dentro del vehículo',
        'Reportar cualquier incidente de forma inmediata',
        'Multas de tránsito son responsabilidad del cliente',
        'Devolución obligatoria en la ubicación acordada',
      ],
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setContratos(prev => [...prev, nuevoContrato]);
    alert(`✅ PRE-RESERVA APROBADA EXITOSAMENTE\n\n━━━━━━━━━━━━━━━━━━━━━━\n📋 Pre-Reserva: ${reserva.id}\n👤 Cliente: ${reserva.clienteName}\n🚗 Vehículo: ${reserva.vehiculoInfo}\n\n📄 Contrato Generado: ${nuevoContrato.id}\n✓ Estado: Activo\n✓ Términos: 10 cláusulas incluidas\n\n📧 El operador y cliente serán notificados`);
  };

  const handleReject = (id: string) => {
    const reserva = reservas.find(r => r.id === id);
    setReservas(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'cancelled' as ReservaStatus } : r)
    );
    alert(`❌ PRE-RESERVA RECHAZADA\n\n━━━━━━━━━━━━━━━━━━━━━━\n📋 Pre-Reserva: ${reserva?.id}\n👤 Cliente: ${reserva?.clienteName}\n\n✗ Estado: Cancelada\n📧 El operador será notificado del rechazo`);
  };

  const filteredReservas = useMemo(() => {
    return reservas.filter(reserva => {
      // Si es cliente, solo ver sus propias reservas
      if (currentUser?.role === 'CLIENTE') {
        // En producción, filtrar por currentUser.id === reserva.clienteId
        return true; // Mock: mostrar todas para demo
      }

      const matchesSearch = reserva.clienteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reserva.vehiculoInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reserva.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || reserva.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [reservas, searchQuery, filterStatus, currentUser]);

  const getStatusBadge = (status: ReservaStatus) => {
    const config = {
      pending: { variant: 'warning' as const, label: 'Pendiente' },
      confirmed: { variant: 'success' as const, label: 'Confirmada' },
      cancelled: { variant: 'danger' as const, label: 'Cancelada' },
    };
    return config[status];
  };

  const columns = [
    {
      key: 'id',
      label: 'Reserva #',
      width: '15%',
      render: (reserva: Reserva) => (
        <div>
          <p className="font-mono text-xs text-gray-900 dark:text-gray-100">{reserva.id}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Creada: {formatShortDate(reserva.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (reserva: Reserva) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{reserva.clienteName}</p>
        </div>
      ),
    },
    {
      key: 'vehiculo',
      label: 'Vehículo',
      render: (reserva: Reserva) => (
        <p className="text-sm text-gray-900 dark:text-gray-100">{reserva.vehiculoInfo}</p>
      ),
    },
    {
      key: 'periodo',
      label: 'Período de Alquiler',
      render: (reserva: Reserva) => (
        <div className="text-sm">
          <p className="text-gray-900 dark:text-gray-100">Inicio: {formatShortDate(reserva.startDate)}</p>
          <p className="text-gray-900 dark:text-gray-100">Fin: {formatShortDate(reserva.endDate)}</p>
          <p className="text-gray-600 dark:text-gray-400">{reserva.days} días</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(reserva.totalAmount)} USD / {formatCurrency(convertUSDtoHNL(reserva.totalAmount), 'HNL')} HNL</p>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (reserva: Reserva) => (
        <div className="text-sm">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(reserva.totalAmount)} USD</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(convertUSDtoHNL(reserva.totalAmount), 'HNL')} HNL</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (reserva: Reserva) => {
        const config = getStatusBadge(reserva.status);
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (reserva: Reserva) => {
        const contrato = contratos.find(c => c.reservaId === reserva.id);
        return (
          <div className="flex flex-col gap-2">
            {/* Botones de Aprobar/Rechazar para Admin/Super Admin */}
            {canApprove && reserva.status === 'pending' && (
              <div className="flex gap-2 mb-1">
                <button
                  onClick={() => {
                    if (confirm(`¿Aprobar pre-reserva?\n\n✅ Se creará un contrato automáticamente\n✅ El cliente será notificado\n✅ El vehículo quedará reservado`)) {
                      handleApprove(reserva.id);
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm"
                  title="Aprobar reserva"
                >
                  <span>✓</span>
                  <span>Aprobar</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Rechazar pre-reserva?\n\n❌ La pre-reserva será marcada como rechazada\n❌ El operador será notificado`)) {
                      handleReject(reserva.id);
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm"
                  title="Rechazar reserva"
                >
                  <span>✕</span>
                  <span>Rechazar</span>
                </button>
              </div>
            )}

            {/* Botón CREAR CONTRATO para OPERADOR (solo reservas confirmadas sin contrato) */}
            {isOperador && reserva.status === 'confirmed' && !contrato && (
              <button
                onClick={() => handleCrearContrato(reserva)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
              >
                📄 Crear Contrato
              </button>
            )}
            
            {/* Botón Ver Contrato */}
            {reserva.status === 'confirmed' && contrato && (
              <button
                onClick={() => {
                  setSelectedContrato(contrato);
                  setShowContratoModal(true);
                }}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
              >
                📄 Ver Contrato
              </button>
            )}
            
            {/* Botón Ver Detalles - siempre visible */}
            <button 
              onClick={() => {
                setReservaDetalle(reserva);
                setShowDetallesModal(true);
              }}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium flex items-center gap-1"
            >
              <span>👁️</span>
              <span>Ver detalles</span>
            </button>
          </div>
        );
      },
    },
  ];

  const vehiculosDisponibles = mockVehiculos.filter(v => v.status === 'available');

  // Vista diferente para OPERADOR
  if (isOperador) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reservas y Contratos</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestión de pre-reservas y contratos de arrendamiento
            </p>
          </div>
        </div>

        {/* Tabs para OPERADOR */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('prereservas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'prereservas'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              📅 Pre-Reservas
            </button>
            <button
              onClick={() => setActiveTab('contratos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'contratos'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              📄 Contratos ({contratos.length})
            </button>
          </nav>
        </div>

        {/* Contenido Pre-Reservas */}
        {activeTab === 'prereservas' && step === 'datos' ? (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Datos Básicos de la Pre-Reserva
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                name="clienteId"
                label="Cliente"
                value={values.clienteId}
                onChange={handleChange}
                error={errors.clienteId}
                options={mockClientes
                  .filter(c => c.status === 'active')
                  .map(c => ({ value: c.id, label: `${c.name} - ${c.email}` }))}
                placeholder="Seleccionar cliente"
                required
              />
              <Select
                name="vehiculoId"
                label="Vehículo"
                value={values.vehiculoId}
                onChange={handleChange}
                error={errors.vehiculoId}
                options={vehiculosDisponibles.map(v => ({
                  value: v.id,
                  label: `${v.brand} ${v.model} (${v.plate}) - ${formatCurrency(v.dailyRate)}/día`,
                }))}
                placeholder="Seleccionar vehículo"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="startDate"
                  label="Fecha de Inicio"
                  type="date"
                  value={values.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  name="endDate"
                  label="Fecha de Fin"
                  type="date"
                  value={values.endDate}
                  onChange={handleChange}
                  error={errors.endDate}
                  required
                  min={values.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas (Opcional)
                </label>
                <textarea
                  name="notes"
                  value={values.notes}
                  onChange={handleChange as any}
                  rows={3}
                  className="input-field"
                  placeholder="Agregar notas o requerimientos especiales..."
                />
              </div>
              {values.startDate && values.endDate && (
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Resumen</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      Días: {calculateDays(values.startDate, values.endDate)}
                    </p>
                    {values.vehiculoId && (
                      <div>
                        <p className="font-semibold text-lg text-primary-700 dark:text-primary-400">
                          Total estimado: {formatCurrency(
                            calculateDays(values.startDate, values.endDate) * 
                            (vehiculosDisponibles.find(v => v.id === values.vehiculoId)?.dailyRate || 0)
                          )} USD
                        </p>
                        <p className="font-semibold text-md text-primary-600 dark:text-primary-300">
                          {formatCurrency(
                            convertUSDtoHNL(calculateDays(values.startDate, values.endDate) * 
                            (vehiculosDisponibles.find(v => v.id === values.vehiculoId)?.dailyRate || 0)), 'HNL'
                          )} HNL
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="submit">
                  Siguiente: Inspección del Vehículo →
                </Button>
              </div>
            </form>
          </Card>
        ) : activeTab === 'prereservas' && step === 'inspeccion' ? (
          // Paso 2: Formulario de Inspección
          reservaTemp && getVehiculo(reservaTemp.vehiculoId) ? (
            <div>
              <Button 
                variant="secondary" 
                onClick={() => setStep('datos')}
                className="mb-4"
              >
                ← Volver a Datos Básicos
              </Button>
              <InspeccionFormCompleta
                reservaId={reservaTemp.id}
                vehiculo={getVehiculo(reservaTemp.vehiculoId)!}
                tipo="entrega"
                onSubmit={handleGuardarReservaConInspeccion}
                onCancel={() => setStep('datos')}
              />
            </div>
          ) : null
        ) : null}

        {/* Tab de Contratos para OPERADOR */}
        {activeTab === 'contratos' && (
          <>
            {/* Alerta si hay reservas confirmadas sin contrato */}
            {reservas.filter(r => r.status === 'confirmed' && !contratos.some(c => c.reservaId === r.id)).length > 0 ? (
              <Card>
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 rounded-lg p-4">
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    ✅ Tienes {reservas.filter(r => r.status === 'confirmed' && !contratos.some(c => c.reservaId === r.id)).length} reserva(s) aprobada(s) lista(s) para contrato
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Las reservas han pasado la inspección y fueron aprobadas. Puedes crear sus contratos.
                  </p>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-lg p-4 text-center">
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    📋 No hay reservas pendientes de contrato
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Todas las reservas confirmadas ya tienen su contrato generado.
                  </p>
                </div>
              </Card>
            )}

            {/* Lista de Reservas Confirmadas sin Contrato */}
            {reservas.filter(r => r.status === 'confirmed' && !contratos.some(c => c.reservaId === r.id)).length > 0 && (
              <Card>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reservas Listas para Contrato</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Haz click en "Crear Contrato" para generar el documento</p>
                </div>
                <div className="space-y-3">
                  {reservas.filter(r => r.status === 'confirmed' && !contratos.some(c => c.reservaId === r.id)).map(reserva => (
                    <div
                      key={reserva.id}
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-500 dark:hover:border-primary-600 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{reserva.clienteName}</h4>
                            <Badge variant="success">✅ Aprobada</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            🚗 {reserva.vehiculoInfo}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            📅 {formatShortDate(reserva.startDate)} → {formatShortDate(reserva.endDate)} ({reserva.days} días)
                          </p>
                          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                            💰 Total: L. {reserva.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <Button onClick={() => {
                          setReservaParaContrato(reserva);
                          setShowContratoModal(true);
                        }}>
                          📄 Crear Contrato
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* Modal para crear contrato (OPERADOR) */}
        {reservaParaContrato && (
          <Modal
            isOpen={showContratoModal}
            onClose={() => {
              setShowContratoModal(false);
              setReservaParaContrato(null);
            }}
            title={`Contrato de Arrendamiento - ${reservaParaContrato.clienteName}`}
            size="xl"
          >
            <ContratoArrendamiento
              reservaId={reservaParaContrato.id}
              clienteName={reservaParaContrato.clienteName}
              vehiculoInfo={reservaParaContrato.vehiculoInfo}
              startDate={reservaParaContrato.startDate}
              endDate={reservaParaContrato.endDate}
              onSubmit={handleGuardarContrato}
              onCancel={() => {
                setShowContratoModal(false);
                setReservaParaContrato(null);
              }}
            />
          </Modal>
        )}
      </div>
    );
  }

  // Vista normal para ADMIN/SUPER_ADMIN
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reservas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestión completa de reservas y contratos de alquiler
          </p>
        </div>
        {/* Solo OPERADOR puede crear pre-reservas */}
        {isOperador && canCreate && activeTab === 'prereservas' && (
          <Button onClick={() => setShowModal(true)} icon="➕">
            Nueva Pre-Reserva
          </Button>
        )}
      </div>

      {/* Tabs - Admin/Super Admin solo ven Pre-Reservas y Contratos en modo lectura */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('prereservas')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'prereservas'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            📅 Reservas ({filteredReservas.length})
          </button>
          <button
            onClick={() => setActiveTab('contratos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'contratos'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            📄 Contratos ({contratos.length})
          </button>
        </nav>
      </div>

      {/* Contenido de Pre-Reservas */}
      {activeTab === 'prereservas' && (
        <>
          {/* Alerta de Pre-Reservas Pendientes */}
          {canApprove && reservas.filter(r => r.status === 'pending').length > 0 && (
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    ¡Pre-Reservas Pendientes de Aprobación!
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Tienes {reservas.filter(r => r.status === 'pending').length} pre-reserva(s) creada(s) por operadores que requieren tu revisión y aprobación.
                  </p>
                </div>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  Ver Pendientes
                </button>
              </div>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['pending', 'confirmed', 'cancelled'].map(status => {
          const count = reservas.filter(r => r.status === status).length;
          const config = getStatusBadge(status as ReservaStatus);
          return (
            <Card key={status}>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 capitalize">{config.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{count}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por ID, cliente, placa..."
            className="flex-1"
          />
          <Select
            name="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'pending', label: 'Pendientes' },
              { value: 'confirmed', label: 'Confirmadas' },
              { value: 'cancelled', label: 'Canceladas' },
            ]}
            className="w-48"
          />
        </div>
      </Card>

          {/* Table */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lista de Reservas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gestiona las reservas de vehículos</p>
            </div>
            <Table
              data={filteredReservas}
              columns={columns}
              emptyMessage="No se encontraron reservas"
            />
          </Card>
        </>
      )}

      {/* Contenido de Contratos - Admin/Super Admin */}
      {activeTab === 'contratos' && (
        <>

          {/* Lista de Contratos Existentes (Solo lectura) - NO mostrar botón crear */}
          {false && reservas.filter(r => r.status === 'confirmed' && !contratos.some(c => c.reservaId === r.id)).length > 0 && (
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reservas Listas para Contrato</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Haz click en "Crear Contrato" para generar el documento</p>
              </div>
              <div className="space-y-3">
                {reservas.filter(r => r.status === 'confirmed' && !contratos.some(c => c.reservaId === r.id)).map(reserva => (
                  <div
                    key={reserva.id}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-500 dark:hover:border-primary-600 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{reserva.clienteName}</h4>
                          <Badge variant="success">✅ Aprobada</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          🚗 {reserva.vehiculoInfo}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          📅 {formatShortDate(reserva.startDate)} → {formatShortDate(reserva.endDate)} ({reserva.days} días)
                        </p>
                        <div className="text-sm">
                          <p className="font-semibold text-primary-600 dark:text-primary-400">💰 {formatCurrency(reserva.totalAmount)} USD</p>
                          <p className="text-xs text-primary-500 dark:text-primary-300">{formatCurrency(convertUSDtoHNL(reserva.totalAmount), 'HNL')} HNL</p>
                        </div>
                      </div>
                      <Button onClick={() => {
                        setReservaParaContrato(reserva);
                        setShowContratoModal(true);
                      }}>
                        📄 Crear Contrato
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Contratos Existentes */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contratos Generados</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Historial de contratos creados</p>
            </div>
          {contratos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay contratos todavía</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Los contratos se crean automáticamente al aprobar reservas</p>
              <Button onClick={() => setActiveTab('prereservas')} variant="primary">Ir a Pre-Reservas</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contratos.map((contrato) => (
                <div
                  key={contrato.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedContrato(contrato);
                    setShowContratoModal(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{contrato.id}</span>
                        <Badge variant={contrato.status === 'active' ? 'success' : 'default'}>
                          {contrato.status === 'active' ? '✅ Activo' : '📝 Borrador'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Cliente</p>
                          <p className="font-medium text-gray-900 dark:text-white">{contrato.clienteName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Vehículo</p>
                          <p className="font-medium text-gray-900 dark:text-white">{contrato.vehiculoInfo}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Período</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatShortDate(contrato.startDate)} - {formatShortDate(contrato.endDate)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Reserva: {contrato.reservaId}</p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Ver →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setStep('datos');
          setReservaTemp(null);
          resetForm();
        }}
        title={
          isOperador 
            ? (step === 'datos' ? 'Nueva Pre-Reserva - Datos Básicos' : 'Nueva Pre-Reserva - Inspección del Vehículo')
            : 'Nueva Reserva'
        }
        size={step === 'inspeccion' ? "xl" : "lg"}
      >
        {step === 'datos' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            name="clienteId"
            label="Cliente"
            value={values.clienteId}
            onChange={handleChange}
            error={errors.clienteId}
            options={mockClientes
              .filter(c => c.status === 'active')
              .map(c => ({ value: c.id, label: `${c.name} - ${c.email}` }))}
            placeholder="Seleccionar cliente"
            required
          />
          <Select
            name="vehiculoId"
            label="Vehículo"
            value={values.vehiculoId}
            onChange={handleChange}
            error={errors.vehiculoId}
            options={vehiculosDisponibles.map(v => ({
              value: v.id,
              label: `${v.brand} ${v.model} (${v.plate}) - ${formatCurrency(v.dailyRate)}/día`,
            }))}
            placeholder="Seleccionar vehículo"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="startDate"
              label="Fecha de Inicio"
              type="date"
              value={values.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
              min={new Date().toISOString().split('T')[0]}
            />
            <Input
              name="endDate"
              label="Fecha de Fin"
              type="date"
              value={values.endDate}
              onChange={handleChange}
              error={errors.endDate}
              required
              min={values.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (Opcional)
            </label>
            <textarea
              name="notes"
              value={values.notes}
              onChange={handleChange as any}
              rows={3}
              className="input-field"
              placeholder="Agregar notas o requerimientos especiales..."
            />
          </div>
          {values.startDate && values.endDate && (
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Resumen de la Reserva</p>
              <div className="mt-2 space-y-1 text-sm">
                <p className="text-gray-600 dark:text-gray-400">Días: {calculateDays(values.startDate, values.endDate)}</p>
                {values.vehiculoId && (
                  <div>
                    <p className="font-semibold text-lg text-primary-700 dark:text-primary-400">
                      Total estimado: {formatCurrency(
                        calculateDays(values.startDate, values.endDate) * 
                        (vehiculosDisponibles.find(v => v.id === values.vehiculoId)?.dailyRate || 0)
                      )} USD
                    </p>
                    <p className="font-semibold text-md text-primary-600 dark:text-primary-300">
                      {formatCurrency(
                        convertUSDtoHNL(calculateDays(values.startDate, values.endDate) * 
                        (vehiculosDisponibles.find(v => v.id === values.vehiculoId)?.dailyRate || 0)), 'HNL'
                      )} HNL
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isOperador ? 'Siguiente: Inspección →' : 'Crear Reserva'}
            </Button>
          </div>
        </form>
        ) : (
          // Paso 2: Inspección (solo OPERADOR)
          reservaTemp && (
            <InspeccionFormCompleta
              reservaId={reservaTemp.id}
              vehiculo={getVehiculo(values.vehiculoId)!}
              tipo="entrega"
              onSubmit={handleGuardarReservaConInspeccion}
              onCancel={() => setStep('datos')}
            />
          )
        )}
      </Modal>

      {/* Modal para crear contrato (OPERADOR - solo reservas confirmadas) O ver contrato (Admin) */}
      {((isOperador && reservaParaContrato) || (!isOperador && selectedContrato)) && (
        <Modal
          isOpen={showContratoModal}
          onClose={() => {
            setShowContratoModal(false);
            setReservaParaContrato(null);
            setSelectedContrato(null);
          }}
          title={isOperador ? `Contrato de Arrendamiento - ${reservaParaContrato?.clienteName}` : `Ver Contrato - ${selectedContrato?.id}`}
          size="xl"
        >
          <ContratoArrendamiento
            reservaId={isOperador ? reservaParaContrato!.id : selectedContrato!.reservaId}
            clienteName={isOperador ? reservaParaContrato!.clienteName : selectedContrato!.clienteName}
            vehiculoInfo={isOperador ? reservaParaContrato!.vehiculoInfo : selectedContrato!.vehiculoInfo}
            startDate={isOperador ? reservaParaContrato!.startDate : selectedContrato!.startDate}
            endDate={isOperador ? reservaParaContrato!.endDate : selectedContrato!.endDate}
            initialData={!isOperador && selectedContrato?.contratoData ? selectedContrato.contratoData : undefined}
            onSubmit={handleGuardarContrato}
            onCancel={() => {
              setShowContratoModal(false);
              setReservaParaContrato(null);
              setSelectedContrato(null);
            }}
          />
        </Modal>
      )}

      {/* Modal de Detalles de Reserva */}
      {reservaDetalle && (
        <Modal
          isOpen={showDetallesModal}
          onClose={() => {
            setShowDetallesModal(false);
            setReservaDetalle(null);
          }}
          title={`📋 Pre-Reserva No. ${reservaDetalle.id}`}
          size="xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Header con información de contacto */}
            <div className="flex justify-between items-start pb-4 border-b dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Pre-Reserva No. {reservaDetalle.id}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CEL: 3174-4269 / 3174-4717
                </p>
              </div>
              <Button variant="secondary" onClick={() => alert('Función de descarga PDF próximamente')}>
                📄 Descargar PDF
              </Button>
            </div>

            {/* Información del Vehículo y Cliente */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    CLIENTE
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">{reservaDetalle.clienteName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {reservaDetalle.clienteId}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    FECHA DE INICIO
                  </label>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatShortDate(reservaDetalle.startDate)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    DURACIÓN
                  </label>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">{reservaDetalle.days} días</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    MARCA Y MODELO
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">{reservaDetalle.vehiculoInfo}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    FECHA DE FIN
                  </label>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatShortDate(reservaDetalle.endDate)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    MONTO TOTAL
                  </label>
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(reservaDetalle.totalAmount)} USD
                    </p>
                    <p className="text-lg font-semibold text-primary-500 dark:text-primary-300 mt-1">
                      {formatCurrency(convertUSDtoHNL(reservaDetalle.totalAmount), 'HNL')} HNL
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos de Inspección del Vehículo */}
            {reservaDetalle.inspeccionData && (
              <>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      MARCA Y MODELO
                    </label>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {reservaDetalle.vehiculoInfo.split('(')[0].trim()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      UNIDAD (UNIT)
                    </label>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                      <input 
                        type="text" 
                        placeholder="Número de unidad"
                        className="w-full text-center bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      PLACA N° (PLATE)
                    </label>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                        {getVehiculo(reservaDetalle.vehiculoId)?.plate || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      KM ENTRADA
                    </label>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">KM</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {reservaDetalle.inspeccionData.kilometraje || '0000'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      KM SALIDA
                    </label>
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">KM</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        0000
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      DAY AND A HOUR
                    </label>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-center">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        --:-- --
                      </p>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    OBSERVACIONES (OBSERVATIONS)
                  </label>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg min-h-[100px]">
                    <p className="text-gray-900 dark:text-white">
                      {reservaDetalle.inspeccionData.observaciones || 'Sin observaciones'}
                    </p>
                  </div>
                </div>

                {/* Checklist INTERIOR y EXTERIOR - Lado a lado */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Checklist INTERIOR */}
                  {reservaDetalle.inspeccionData.checklistInterior && (
                    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <h3 className="text-center text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600">
                        INTERIOR
                      </h3>
                      <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistInterior.marcadorCombustible}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">MARCADOR COMBUSTIBLE</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistInterior.encendedor}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">ENCENDEDOR</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistInterior.radioDiscos}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">RADIO DISCOS (CD)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistInterior.radioCassette}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">RADIO (CASSETTE)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistInterior.radio}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">RADIO</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistInterior.alfombrasPiso}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">ALFOMBRAS PISO</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistInterior.tacometro}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">TACOMETRO</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistInterior.luzAdvertencia}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">LUZ DE ADVERTENCIA</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistInterior.vidriosManuales}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">VIDRIOS MANUALES</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistInterior.botonEncendido}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">BOTON ENCENDIDO</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistInterior.botonPuerta}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">BOTON PUERTA</span>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Checklist EXTERIOR */}
                  {reservaDetalle.inspeccionData.checklistExterior && (
                    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <h3 className="text-center text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600">
                        EXTERIOR
                      </h3>
                      <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistExterior.antena}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">ANTENA</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistExterior.copas}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">COPAS</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistExterior.retrovisores}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">RETROVISORES</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistExterior.emblemas}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">EMBLEMAS</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistExterior.taponGasolina}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">TAPON DE GASOLINA</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistExterior.tapasBatea}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">TAPAS BATEA</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistExterior.llantaRepuesto}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">LLANTA REPUESTO</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistExterior.llantaMantenera}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">LLANTA MANTENERA</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistExterior.llantaPasax}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">LLANTA PASAX</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistExterior.puertaElevatriz}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">PUERTA ELEVATRIZ</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input 
                          type="checkbox" 
                          checked={reservaDetalle.inspeccionData.checklistExterior.frenoMano}
                          readOnly
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">FRENO DE MANO</span>
                      </div>
                    </div>
                  </div>
                  )}
                </div>

                {/* Sección SALIDA/OUT con diagramas del vehículo */}
                <div className="pt-4 border-t dark:border-gray-700">
                  <h3 className="text-center text-xl font-bold text-gray-900 dark:text-white mb-4">
                    SALIDA / OUT
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-600">
                    <img 
                      src="/Car.png" 
                      alt="Diagrama de inspección del vehículo" 
                      className="w-full h-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.innerHTML = '<p class="text-gray-400 italic text-center py-8">Diagrama de inspección no disponible</p>';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Sección de Firmas */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      REPRESENTANTE ALPHA
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800">
                      <p className="text-gray-400 italic">Firma del representante</p>
                      <p className="text-xs text-gray-500 mt-2">{reservaDetalle.createdBy}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      FIRMA DEL CLIENTE
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800">
                      <p className="text-gray-400 italic">Firma del cliente</p>
                      <p className="text-xs text-gray-500 mt-2">{reservaDetalle.clienteName}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Información de Estado */}
            <div className="pt-4 border-t dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estado Actual</p>
                  <Badge variant={getStatusBadge(reservaDetalle.status).variant}>
                    {getStatusBadge(reservaDetalle.status).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Creado el</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatShortDate(reservaDetalle.createdAt)}
                  </p>
                </div>
                {reservaDetalle.approvedBy && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aprobado por</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {reservaDetalle.approvedBy}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de Cerrar */}
            <div className="flex justify-end pt-4 border-t dark:border-gray-700">
              <Button
                onClick={() => {
                  setShowDetallesModal(false);
                  setReservaDetalle(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
