import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Card, Table, SearchBar, Badge, Select, Button, Modal, Input } from '../components/common';
import { mockFacturas } from '../data/mockData';
import { Factura } from '../types';
import { formatCurrency, formatShortDate } from '../utils/formatters';

export const Facturacion: React.FC = () => {
  const { currentUser } = useAuth();
  const { canCreate } = usePermissions('facturacion');
  const [facturas, setFacturas] = useState<Factura[]>(mockFacturas);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState({
    clienteName: '',
    subtotal: '',
    cargoDanos: '',
    cargoAdicional: '',
    deposito: '',
  });

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
        <p className="font-medium text-gray-900 dark:text-gray-100">{factura.clienteName}</p>
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
          <p className="text-gray-600 dark:text-gray-400">Subtotal: {formatCurrency(factura.amount)}</p>
          <p className="text-gray-600 dark:text-gray-400">IVA: {formatCurrency(factura.tax)}</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">Total: {formatCurrency(factura.total)}</p>
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
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Ver PDF
          </button>
          {factura.status === 'pending' && canCreate && (
            <button className="text-success hover:text-success-dark text-sm font-medium">
              Registrar Pago
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
          <Button icon="➕" onClick={() => setShowModal(true)}>
            Nueva Factura
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Facturado</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.total)}</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm text-gray-500 mb-1">Pagado</p>
            <p className="text-3xl font-bold text-success">{formatCurrency(stats.paid)}</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm text-gray-500 mb-1">Pendiente</p>
            <p className="text-3xl font-bold text-warning">{formatCurrency(stats.pending)}</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm text-gray-500 mb-1">Vencido</p>
            <p className="text-3xl font-bold text-danger">{formatCurrency(stats.overdue)}</p>
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
              { value: 'cancelled', label: 'Canceladas' },
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

      {/* Modal Nueva Factura */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormValues({
            clienteName: '',
            subtotal: '',
            cargoDanos: '',
            cargoAdicional: '',
            deposito: '',
          });
        }}
        title="💰 Nueva Factura"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              const subtotal = parseFloat(formValues.subtotal) || 0;
              const cargoDanos = parseFloat(formValues.cargoDanos) || 0;
              const cargoAdicional = parseFloat(formValues.cargoAdicional) || 0;
              const deposito = parseFloat(formValues.deposito) || 0;
              
              const amount = subtotal;
              const tax = amount * 0.16; // IVA 16%
              const total = amount + cargoDanos + cargoAdicional + tax - deposito;
              
              const nuevaFactura: Factura = {
                id: `fac-${Date.now()}`,
                clienteId: 'cli-001',
                clienteName: formValues.clienteName,
                reservaId: `res-${Date.now()}`,
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                amount,
                tax,
                total,
                status: 'pending',
                createdBy: currentUser?.id || 'admin',
              };
              
              setFacturas(prev => [nuevaFactura, ...prev]);
              setShowModal(false);
              setFormValues({
                clienteName: '',
                subtotal: '',
                cargoDanos: '',
                cargoAdicional: '',
                deposito: '',
              });
            }}>
              Crear Factura
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            name="clienteName"
            label="Nombre del Cliente"
            value={formValues.clienteName}
            onChange={(e) => setFormValues(prev => ({ ...prev, clienteName: e.target.value }))}
            required
            placeholder="Ej: Juan Pérez"
          />
          
          <div className="border-t pt-4">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Desglose de Costos</h3>
            
            <Input
              name="subtotal"
              label="Tarifa base (Total días)"
              type="number"
              value={formValues.subtotal}
              onChange={(e) => setFormValues(prev => ({ ...prev, subtotal: e.target.value }))}
              required
              placeholder="225.00"
            />
            
            <Input
              name="cargoDanos"
              label="🔴 Cargos por daños"
              type="number"
              value={formValues.cargoDanos}
              onChange={(e) => setFormValues(prev => ({ ...prev, cargoDanos: e.target.value }))}
              placeholder="0.00"
            />
            
            <Input
              name="cargoAdicional"
              label="🟠 Cargos adicionales"
              type="number"
              value={formValues.cargoAdicional}
              onChange={(e) => setFormValues(prev => ({ ...prev, cargoAdicional: e.target.value }))}
              placeholder="0.00"
            />
            
            <Input
              name="deposito"
              label="🟢 Depósito aplicado"
              type="number"
              value={formValues.deposito}
              onChange={(e) => setFormValues(prev => ({ ...prev, deposito: e.target.value }))}
              placeholder="50.00"
            />
          </div>
          
          {/* Preview */}
          {formValues.subtotal && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Vista Previa</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tarifa base:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(parseFloat(formValues.subtotal) || 0)}
                  </span>
                </div>
                {parseFloat(formValues.cargoDanos) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Cargos por daños:</span>
                    <span className="font-medium">+{formatCurrency(parseFloat(formValues.cargoDanos))}</span>
                  </div>
                )}
                {parseFloat(formValues.cargoAdicional) > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Cargos adicionales:</span>
                    <span className="font-medium">+{formatCurrency(parseFloat(formValues.cargoAdicional))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">IVA (16%):</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency((parseFloat(formValues.subtotal) || 0) * 0.16)}
                  </span>
                </div>
                {parseFloat(formValues.deposito) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Depósito aplicado:</span>
                    <span className="font-medium">-{formatCurrency(parseFloat(formValues.deposito))}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 dark:border-gray-600 mt-2 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900 dark:text-white text-lg">TOTAL A PAGAR:</span>
                  <span className="font-bold text-primary-600 text-lg">
                    {formatCurrency(
                      (parseFloat(formValues.subtotal) || 0) + 
                      (parseFloat(formValues.cargoDanos) || 0) + 
                      (parseFloat(formValues.cargoAdicional) || 0) + 
                      ((parseFloat(formValues.subtotal) || 0) * 0.16) - 
                      (parseFloat(formValues.deposito) || 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
