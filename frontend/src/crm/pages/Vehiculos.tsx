import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useForm } from '../hooks/useForm';
import { Card, Table, Button, Modal, Input, Select, SearchBar, Badge } from '../components/common';
import { mockVehiculos } from '../data/mockData';
import { Vehiculo } from '../types';
import { validateForm } from '../utils/validation';
import { formatCurrency } from '../utils/formatters';

export const Vehiculos: React.FC = () => {
  const { currentUser } = useAuth();
  const { canCreate, canEdit } = usePermissions('vehiculos');
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(mockVehiculos);
  const [showModal, setShowModal] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { values, errors, handleChange, handleSubmit, resetForm, setFieldValue } = useForm<Partial<Vehiculo>>({
    initialValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      type: 'sedan',
      status: 'available',
      dailyRate: 0,
      features: [],
    },
    onSubmit: (formValues) => {
      if (editingVehiculo) {
        setVehiculos(prev =>
          prev.map(v => v.id === editingVehiculo.id ? { ...v, ...formValues } : v)
        );
      } else {
        const newVehiculo: Vehiculo = {
          id: `veh-${Date.now()}`,
          brand: formValues.brand!,
          model: formValues.model!,
          year: Number(formValues.year!),
          plate: formValues.plate!.toUpperCase(),
          type: formValues.type as any,
          status: formValues.status as any,
          dailyRate: Number(formValues.dailyRate!),
          features: formValues.features || [],
          createdAt: new Date().toISOString().split('T')[0],
        };
        setVehiculos(prev => [...prev, newVehiculo]);
      }
      setShowModal(false);
      resetForm();
      setEditingVehiculo(null);
    },
    validate: (values) => {
      const validation = validateForm({
        brand: { value: values.brand, rules: { required: true } },
        model: { value: values.model, rules: { required: true } },
        year: { value: values.year, rules: { required: true } },
        plate: { value: values.plate, rules: { required: true, minLength: 5 } },
        dailyRate: { value: values.dailyRate, rules: { required: true, positive: true } },
      });
      return validation.errors;
    },
  });

  const openCreateModal = () => {
    resetForm();
    setEditingVehiculo(null);
    setShowModal(true);
  };

  const openEditModal = (vehiculo: Vehiculo) => {
    setEditingVehiculo(vehiculo);
    setFieldValue('brand', vehiculo.brand);
    setFieldValue('model', vehiculo.model);
    setFieldValue('year', vehiculo.year);
    setFieldValue('plate', vehiculo.plate);
    setFieldValue('type', vehiculo.type);
    setFieldValue('status', vehiculo.status);
    setFieldValue('dailyRate', vehiculo.dailyRate);
    setShowModal(true);
  };

  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter(vehiculo => {
      const matchesSearch = vehiculo.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehiculo.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehiculo.plate.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || vehiculo.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [vehiculos, searchQuery, filterStatus]);

  const canViewRates = currentUser?.role !== 'OPERADOR'; // Operador NO ve tarifas

  const columns = [
    {
      key: 'vehicle',
      label: 'Vehículo',
      render: (vehiculo: Vehiculo) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{vehiculo.brand} {vehiculo.model}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{vehiculo.plate}</p>
        </div>
      ),
    },
    { key: 'year', label: 'Año' },
    {
      key: 'type',
      label: 'Tipo',
      render: (vehiculo: Vehiculo) => (
        <span className="capitalize">{vehiculo.type}</span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (vehiculo: Vehiculo) => {
        const statusConfig = {
          available: { variant: 'success' as const, label: 'Disponible' },
          reserved: { variant: 'warning' as const, label: 'Reservado' },
          rented: { variant: 'info' as const, label: 'Rentado' },
          maintenance: { variant: 'danger' as const, label: 'Mantenimiento' },
        };
        const config = statusConfig[vehiculo.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    ...(canViewRates ? [{
      key: 'dailyRate',
      label: 'Tarifa Diaria',
      render: (vehiculo: Vehiculo) => formatCurrency(vehiculo.dailyRate),
    }] : []),
    {
      key: 'actions',
      label: 'Acciones',
      render: (vehiculo: Vehiculo) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(vehiculo);
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Editar
            </button>
          )}
          <button
            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Ver detalles
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Vehículos</h1>
          <p className="text-gray-600">Gestión de flota de vehículos</p>
        </div>
        {canCreate && (
          <Button onClick={openCreateModal} icon="➕">
            Nuevo Vehículo
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['available', 'reserved', 'rented', 'maintenance'].map(status => {
          const count = vehiculos.filter(v => v.status === status).length;
          const statusLabels = {
            available: { label: 'Disponibles', icon: '✅', color: 'bg-green-100 text-green-700' },
            reserved: { label: 'Reservados', icon: '⏳', color: 'bg-yellow-100 text-yellow-700' },
            rented: { label: 'Rentados', icon: '🚗', color: 'bg-blue-100 text-blue-700' },
            maintenance: { label: 'Mantenimiento', icon: '🔧', color: 'bg-red-100 text-red-700' },
          };
          const config = statusLabels[status as keyof typeof statusLabels];
          return (
            <Card key={status}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center text-xl`}>
                  {config.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
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
            placeholder="Buscar por marca, modelo o placa..."
            className="flex-1"
          />
          <Select
            name="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'available', label: 'Disponibles' },
              { value: 'reserved', label: 'Reservados' },
              { value: 'rented', label: 'Rentados' },
              { value: 'maintenance', label: 'Mantenimiento' },
            ]}
            className="w-48"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          data={filteredVehiculos}
          columns={columns}
          emptyMessage="No se encontraron vehículos"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
          setEditingVehiculo(null);
        }}
        title={editingVehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { handleSubmit({ preventDefault: () => {} } as any); }}>
              {editingVehiculo ? 'Guardar Cambios' : 'Crear Vehículo'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="brand"
              label="Marca"
              value={values.brand || ''}
              onChange={handleChange}
              error={errors.brand}
              required
              placeholder="Ej: Toyota"
            />
            <Input
              name="model"
              label="Modelo"
              value={values.model || ''}
              onChange={handleChange}
              error={errors.model}
              required
              placeholder="Ej: Corolla"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="year"
              label="Año"
              type="number"
              value={values.year || ''}
              onChange={handleChange}
              error={errors.year}
              required
              min={2000}
              max={new Date().getFullYear() + 1}
            />
            <Input
              name="plate"
              label="Placa"
              value={values.plate || ''}
              onChange={handleChange}
              error={errors.plate}
              required
              placeholder="ABC123"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              name="type"
              label="Tipo"
              value={values.type || 'sedan'}
              onChange={handleChange}
              options={[
                { value: 'sedan', label: 'Sedán' },
                { value: 'suv', label: 'SUV' },
                { value: 'truck', label: 'Camioneta' },
                { value: 'van', label: 'Van' },
              ]}
            />
            <Select
              name="status"
              label="Estado"
              value={values.status || 'available'}
              onChange={handleChange}
              options={[
                { value: 'available', label: 'Disponible' },
                { value: 'reserved', label: 'Reservado' },
                { value: 'rented', label: 'Rentado' },
                { value: 'maintenance', label: 'Mantenimiento' },
              ]}
            />
          </div>
          <Input
            name="dailyRate"
            label="Tarifa Diaria (USD)"
            type="number"
            value={values.dailyRate || ''}
            onChange={handleChange}
            error={errors.dailyRate}
            required
            min={0}
            step={0.01}
            placeholder="45.00"
          />
        </form>
      </Modal>
    </div>
  );
};
