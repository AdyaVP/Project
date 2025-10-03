import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Card, Table, SearchBar, Badge, Select, Button, Modal, Input } from '../components/common';
import { FacturaPDF } from '../components/forms/FacturaPDF';
import { mockFacturas } from '../data/mockData';
import { Factura } from '../types';
import { formatCurrency, formatShortDate, convertUSDtoHNL } from '../utils/formatters';

export const Facturacion: React.FC = () => {
  const { currentUser } = useAuth();
  const { canCreate } = usePermissions('facturacion');
  const [facturas, setFacturas] = useState<Factura[]>(mockFacturas);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<any>(null);
  const [editingFactura, setEditingFactura] = useState<Factura | null>(null);
  const [formValues, setFormValues] = useState({
    clienteName: '',
    rfc: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    email: '',
    subtotal: '',
    observaciones: '',
    formaPago: 'Cash',
    metodoPago: 'PUE',
  });

  // Verificar si puede editar (Admin o Super Admin)
  const canEditInvoice = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  const filteredFacturas = useMemo(() => {
    let filtered = facturas;

    // Si es cliente, solo ver sus propias facturas
    if (currentUser?.role === 'CLIENTE') {
      // En producción: filtered = facturas.filter(f => f.clienteId === currentUser.id);
    }

    return filtered.filter(factura => {
      const matchesSearch = factura.clienteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        factura.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || factura.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [facturas, searchQuery, filterStatus, currentUser]);

  const getStatusBadge = (status: string) => {
    const config = {
      paid: { variant: 'success' as const, label: 'Pagada' },
      pending: { variant: 'warning' as const, label: 'Pendiente' },
      overdue: { variant: 'danger' as const, label: 'Vencida' },
      cancelled: { variant: 'default' as const, label: 'Cancelada' },
    };
    return config[status as keyof typeof config];
  };

  const openCreateModal = () => {
    setEditingFactura(null);
    setFormValues({
      clienteName: '',
      rfc: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      email: '',
      subtotal: '',
      observaciones: '',
      formaPago: 'Cash',
      metodoPago: 'PUE',
    });
    setShowModal(true);
  };

  const openEditModal = (factura: Factura) => {
    setEditingFactura(factura);
    setFormValues({
      clienteName: factura.clienteName,
      rfc: (factura as any).rfc || '',
      direccion: (factura as any).direccion || '',
      ciudad: (factura as any).ciudad || '',
      telefono: (factura as any).telefono || '',
      email: (factura as any).email || '',
      subtotal: factura.amount.toString(),
      observaciones: (factura as any).observaciones || '',
      formaPago: (factura as any).formaPago || 'Cash',
      metodoPago: (factura as any).metodoPago || 'PUE',
    });
    setShowModal(true);
  };

  const handleViewPDF = (factura: Factura) => {
    setSelectedFactura(factura);
    setShowPDFModal(true);
  };

  const handleSaveFactura = () => {
    const subtotal = parseFloat(formValues.subtotal) || 0;
    const tax = subtotal * 0.16; // IVA 16%
    const total = subtotal + tax;

    if (editingFactura) {
      // Editar factura existente
      setFacturas(prev =>
        prev.map(f =>
          f.id === editingFactura.id
            ? {
                ...f,
                clienteName: formValues.clienteName,
                amount: subtotal,
                tax,
                total,
                rfc: formValues.rfc,
                direccion: formValues.direccion,
                ciudad: formValues.ciudad,
                telefono: formValues.telefono,
                email: formValues.email,
                observaciones: formValues.observaciones,
                formaPago: formValues.formaPago,
                metodoPago: formValues.metodoPago,
              } as any
            : f
        )
      );
    } else {
      // Crear nueva factura - SIEMPRE en estado "pending"
      const nuevaFactura: Factura = {
        id: `FAC-${Date.now()}`,
        clienteId: 'cli-001',
        clienteName: formValues.clienteName,
        reservaId: `res-${Date.now()}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: subtotal,
        tax,
        total,
        montoPendiente: total,
        status: 'pending', // SIEMPRE pendiente para nuevas facturas
        createdBy: currentUser?.id || 'admin',
        rfc: formValues.rfc,
        direccion: formValues.direccion,
        ciudad: formValues.ciudad,
        telefono: formValues.telefono,
        email: formValues.email,
        observaciones: formValues.observaciones,
        formaPago: formValues.formaPago,
        metodoPago: formValues.metodoPago,
        conceptos: [
          {
            descripcion: 'Servicio de renta de vehículo',
            cantidad: 1,
            precioUnitario: subtotal,
            total: subtotal,
          },
        ],
      } as any;
      
      setFacturas(prev => [nuevaFactura, ...prev]);
    }
    
    setShowModal(false);
    setEditingFactura(null);
    setFormValues({
      clienteName: '',
      rfc: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      email: '',
      subtotal: '',
      observaciones: '',
      formaPago: 'Cash',
      metodoPago: 'PUE',
    });
  };

  const handleRegistrarPago = (factura: Factura) => {
    if (confirm(`¿Confirmar pago de ${formatCurrency(factura.total)}?`)) {
      setFacturas(prev =>
        prev.map(f =>
          f.id === factura.id
            ? { ...f, status: 'paid' as any, montoPendiente: 0 }
            : f
        )
      );
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Factura #',
      width: '12%',
      render: (factura: Factura) => (
        <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{factura.id}</p>
      ),
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (factura: Factura) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{factura.clienteName}</p>
          {(factura as any).rfc && (
            <p className="text-xs text-gray-500">RFC: {(factura as any).rfc}</p>
          )}
        </div>
      ),
    },
    {
      key: 'issueDate',
      label: 'Fecha de Emisión',
      render: (factura: Factura) => formatShortDate(factura.issueDate),
    },
    {
      key: 'dueDate',
      label: 'Fecha de Vencimiento',
      render: (factura: Factura) => formatShortDate(factura.dueDate),
    },
    {
      key: 'amount',
      label: 'Monto',
      render: (factura: Factura) => (
        <div className="text-sm">
          <p className="text-gray-600 dark:text-gray-400">Subtotal: {formatCurrency(factura.amount)} USD / {formatCurrency(convertUSDtoHNL(factura.amount), 'HNL')}</p>
          <p className="text-gray-600 dark:text-gray-400">IVA: {formatCurrency(factura.tax)} USD / {formatCurrency(convertUSDtoHNL(factura.tax), 'HNL')}</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">Total: {formatCurrency(factura.total)} USD / {formatCurrency(convertUSDtoHNL(factura.total), 'HNL')}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (factura: Factura) => {
        const config = getStatusBadge(factura.status);
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (factura: Factura) => (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleViewPDF(factura)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            📄 Ver PDF
          </button>
          {/* Solo Admin y Super Admin pueden editar si no está pagada */}
          {canEditInvoice && (factura.status === 'pending' || factura.status === 'overdue') && (
            <button
              onClick={() => openEditModal(factura)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ✏️ Editar
            </button>
          )}
          {/* Registrar pago solo si está pendiente o vencida */}
          {canEditInvoice && (factura.status === 'pending' || factura.status === 'overdue') && (
            <button
              onClick={() => handleRegistrarPago(factura)}
              className="text-success hover:text-success-dark text-sm font-medium"
            >
              ✓ Registrar Pago
            </button>
          )}
        </div>
      ),
    },
  ];

  const stats = {
    total: facturas.reduce((sum, f) => sum + f.total, 0),
    paid: facturas.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.total, 0),
    pending: facturas.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.total, 0),
    overdue: facturas.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.total, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Facturación</h1>
          <p className="text-gray-600">
            {currentUser?.role === 'CLIENTE' 
              ? 'Consulta tus facturas' 
              : 'Gestión de facturas y pagos'}
          </p>
        </div>
        {canCreate && (
          <Button icon="➕" onClick={openCreateModal}>
            Nueva Factura
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Facturado</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.total)} USD</p>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">{formatCurrency(convertUSDtoHNL(stats.total), 'HNL')} HNL</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {facturas.length} factura{facturas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pagado</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.paid)} USD</p>
            <p className="text-lg font-semibold text-green-500 dark:text-green-300">{formatCurrency(convertUSDtoHNL(stats.paid), 'HNL')} HNL</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {facturas.filter(f => f.status === 'paid').length} factura{facturas.filter(f => f.status === 'paid').length !== 1 ? 's' : ''}
            </p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pendiente</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(stats.pending)} USD</p>
            <p className="text-lg font-semibold text-orange-500 dark:text-orange-300">{formatCurrency(convertUSDtoHNL(stats.pending), 'HNL')} HNL</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {facturas.filter(f => f.status === 'pending').length} factura{facturas.filter(f => f.status === 'pending').length !== 1 ? 's' : ''}
            </p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vencido</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(stats.overdue)} USD</p>
            <p className="text-lg font-semibold text-red-500 dark:text-red-300">{formatCurrency(convertUSDtoHNL(stats.overdue), 'HNL')} HNL</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {facturas.filter(f => f.status === 'overdue').length} factura{facturas.filter(f => f.status === 'overdue').length !== 1 ? 's' : ''}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por ID o cliente..."
            className="flex-1"
          />
          <Select
            name="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'paid', label: 'Pagadas' },
              { value: 'pending', label: 'Pendientes' },
              { value: 'overdue', label: 'Vencidas' },
            ]}
            className="w-48"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Facturas</h3>
          <p className="text-sm text-gray-600">Listado de todas las facturas</p>
        </div>
        <Table
          data={filteredFacturas}
          columns={columns}
          emptyMessage="No se encontraron facturas"
        />
      </Card>

      {/* Modal Nueva/Editar Factura */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingFactura(null);
        }}
        title={editingFactura ? '✏️ Editar Factura' : '💰 Nueva Factura'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setShowModal(false);
              setEditingFactura(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFactura}>
              {editingFactura ? 'Actualizar Factura' : 'Crear Factura'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              📋 Complete la información de la factura
            </p>
          </div>

          {/* Información del Cliente */}
          <div className="border-t pt-4">
            <h3 className="text-md font-semibold text-gray-900 mb-3">📋 Información del Cliente</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="clienteName"
                label="Nombre del Cliente *"
                value={formValues.clienteName}
                onChange={(e) => setFormValues(prev => ({ ...prev, clienteName: e.target.value }))}
                required
                placeholder="Ej: Juan Pérez García"
              />
              
              <Input
                name="rfc"
                label="RFC"
                value={formValues.rfc}
                onChange={(e) => setFormValues(prev => ({ ...prev, rfc: e.target.value.toUpperCase() }))}
                placeholder="Ej: PEGJ900101ABC"
              />
            </div>

            <Input
              name="email"
              label="Email"
              type="email"
              value={formValues.email}
              onChange={(e) => setFormValues(prev => ({ ...prev, email: e.target.value }))}
              placeholder="cliente@email.com"
            />

            <Input
              name="telefono"
              label="Teléfono"
              type="tel"
              value={formValues.telefono}
              onChange={(e) => setFormValues(prev => ({ ...prev, telefono: e.target.value }))}
              placeholder="(555) 123-4567"
            />

            <Input
              name="direccion"
              label="Dirección"
              value={formValues.direccion}
              onChange={(e) => setFormValues(prev => ({ ...prev, direccion: e.target.value }))}
              placeholder="Calle, Número, Colonia"
            />

            <Input
              name="ciudad"
              label="Ciudad / Estado"
              value={formValues.ciudad}
              onChange={(e) => setFormValues(prev => ({ ...prev, ciudad: e.target.value }))}
              placeholder="Ciudad de México, CDMX"
            />
          </div>
          
          {/* Información de la Factura */}
          <div className="border-t pt-4">
            <h3 className="text-md font-semibold text-gray-900 mb-3">💵 Información de la Factura</h3>
            
            <Input
              name="subtotal"
              label="Subtotal (antes de IVA) *"
              type="number"
              step="0.01"
              value={formValues.subtotal}
              onChange={(e) => setFormValues(prev => ({ ...prev, subtotal: e.target.value }))}
              required
              placeholder="1000.00"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                name="formaPago"
                label="Forma de Pago"
                value={formValues.formaPago}
                onChange={(e) => setFormValues(prev => ({ ...prev, formaPago: e.target.value }))}
                options={[
                  { value: 'Cash', label: 'Cash (Efectivo)' },
                  { value: 'Master', label: 'Master Card' },
                  { value: 'Visa', label: 'Visa' },
                  { value: 'Amex', label: 'American Express' },
                  { value: 'Dinners', label: 'Dinners Club' },
                  { value: 'Purchase Order', label: 'Purchase Order' },
                  { value: 'Transferencia', label: 'Transferencia Bancaria' },
                  { value: 'Cheque', label: 'Cheque' },
                ]}
              />

              <Select
                name="metodoPago"
                label="Método de Pago"
                value={formValues.metodoPago}
                onChange={(e) => setFormValues(prev => ({ ...prev, metodoPago: e.target.value }))}
                options={[
                  { value: 'PUE', label: 'PUE - Pago en una exhibición' },
                  { value: 'PPD', label: 'PPD - Pago en parcialidades' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea
                name="observaciones"
                value={formValues.observaciones}
                onChange={(e) => setFormValues(prev => ({ ...prev, observaciones: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Observaciones o notas adicionales..."
              />
            </div>
          </div>
          
          {/* Preview */}
          {formValues.subtotal && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💰 Vista Previa del Total</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(parseFloat(formValues.subtotal) || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">IVA (16%):</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency((parseFloat(formValues.subtotal) || 0) * 0.16)}
                  </span>
                </div>
                <div className="border-t-2 border-gray-300 dark:border-gray-600 mt-2 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900 dark:text-white text-lg">TOTAL:</span>
                  <span className="font-bold text-primary-600 text-lg">
                    {formatCurrency((parseFloat(formValues.subtotal) || 0) * 1.16)}
                  </span>
                </div>
              </div>
              {!editingFactura && (
                <p className="text-xs text-gray-500 mt-3">
                  ℹ️ La factura se creará en estado <strong>PENDIENTE</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal PDF Viewer */}
      {showPDFModal && selectedFactura && (
        <FacturaPDF
          factura={selectedFactura}
          onClose={() => {
            setShowPDFModal(false);
            setSelectedFactura(null);
          }}
        />
      )}
    </div>
  );
};
