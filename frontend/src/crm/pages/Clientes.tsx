import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useForm } from '../hooks/useForm';
import { Card, Table, Button, Modal, Input, Select, SearchBar, Badge } from '../components/common';
import { mockClientes } from '../data/mockData';
import { Cliente } from '../types';
import { validateForm } from '../utils/validation';

export const Clientes: React.FC = () => {
  const { currentUser } = useAuth();
  const { canCreate, canEdit, canApprove } = usePermissions('clientes');
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { values, errors, handleChange, handleSubmit, resetForm, setFieldValue } = useForm<Partial<Cliente>>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      country: '',
      status: 'active',
    },
    onSubmit: (formValues) => {
      if (editingCliente) {
        // Editar cliente
        setClientes(prev =>
          prev.map(c => c.id === editingCliente.id ? { ...c, ...formValues } : c)
        );
      } else {
        // Crear nuevo cliente
        const newCliente: Cliente = {
          id: `cli-${Date.now()}`,
          name: formValues.name!,
          email: formValues.email!,
          phone: formValues.phone!,
          company: formValues.company,
          country: formValues.country!,
          // Operador siempre crea clientes en estado 'pending', Admin/Super Admin pueden elegir
          status: currentUser?.role === 'OPERADOR' ? 'pending' : (formValues.status as 'active' | 'inactive' | 'pending'),
          createdAt: new Date().toISOString().split('T')[0],
          createdBy: currentUser?.id || 'current-user',
        };
        setClientes(prev => [...prev, newCliente]);
      }
      setShowModal(false);
      resetForm();
      setEditingCliente(null);
    },
    validate: (values) => {
      const validation = validateForm({
        name: { value: values.name, rules: { required: true, minLength: 3 } },
        email: { value: values.email, rules: { required: true, email: true } },
        phone: { value: values.phone, rules: { required: true, phone: true } },
        country: { value: values.country, rules: { required: true } },
      });
      return validation.errors;
    },
  });

  const openCreateModal = () => {
    resetForm();
    setEditingCliente(null);
    setShowModal(true);
  };

  const openEditModal = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFieldValue('name', cliente.name);
    setFieldValue('email', cliente.email);
    setFieldValue('phone', cliente.phone);
    setFieldValue('company', cliente.company || '');
    setFieldValue('country', cliente.country);
    setFieldValue('status', cliente.status);
    setShowModal(true);
  };

  const handleApprove = (id: string) => {
    setClientes(prev =>
      prev.map(c => c.id === id ? { ...c, status: 'active' as const, approvedBy: 'current-user' } : c)
    );
  };


  // Filtrado de clientes
  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const matchesSearch = cliente.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cliente.company?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || cliente.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [clientes, searchQuery, filterStatus]);

  const columns = [
    { key: 'name', label: 'Customer Name' },
    { key: 'company', label: 'Company' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'email', label: 'Email' },
    { key: 'country', label: 'Country' },
    {
      key: 'status',
      label: 'Status',
      render: (cliente: Cliente) => (
        <Badge variant={cliente.status === 'active' ? 'success' : cliente.status === 'pending' ? 'warning' : 'danger'}>
          {cliente.status === 'active' ? 'Active' : cliente.status === 'pending' ? 'Pending' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (cliente: Cliente) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(cliente);
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Editar
            </button>
          )}
          {canApprove && cliente.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(cliente.id);
              }}
              className="text-success hover:text-success-dark text-sm font-medium"
            >
              Aprobar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Clientes</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestión de clientes del sistema</p>
        </div>
        {canCreate && (
          <Button onClick={openCreateModal} icon="➕">
            Nuevo Cliente
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nombre, email o empresa..."
            className="flex-1"
          />
          <Select
            name="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'active', label: 'Activos' },
              { value: 'inactive', label: 'Inactivos' },
              { value: 'pending', label: 'Pendientes' },
            ]}
            className="w-48"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Todos los clientes</h3>
          <p className="text-sm text-primary-600">Miembros Activos</p>
        </div>
        <Table
          data={filteredClientes}
          columns={columns}
          emptyMessage="No se encontraron clientes"
        />
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Mostrando {filteredClientes.length} de {clientes.length} clientes
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
          setEditingCliente(null);
        }}
        title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { handleSubmit({ preventDefault: () => {} } as any); }}>
              {editingCliente ? 'Guardar Cambios' : 'Crear Cliente'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            label="Nombre Completo"
            value={values.name || ''}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="Ej: Juan Pérez"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="email"
              label="Email"
              type="email"
              value={values.email || ''}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="email@ejemplo.com"
            />
            <Input
              name="phone"
              label="Teléfono"
              type="tel"
              value={values.phone || ''}
              onChange={handleChange}
              error={errors.phone}
              required
              placeholder="(123) 456-7890"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="company"
              label="Empresa"
              value={values.company || ''}
              onChange={handleChange}
              placeholder="Opcional"
            />
            <Input
              name="country"
              label="País"
              value={values.country || ''}
              onChange={handleChange}
              error={errors.country}
              required
              placeholder="México"
            />
          </div>
          {/* Solo Admin/Super Admin pueden elegir estado, Operador NO */}
          {currentUser?.role !== 'OPERADOR' && (
            <Select
              name="status"
              label="Estado"
              value={values.status || 'active'}
              onChange={handleChange}
              options={[
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
                { value: 'pending', label: 'Pendiente' },
              ]}
            />
          )}
          {currentUser?.role === 'OPERADOR' && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ℹ️ El cliente será creado en estado <strong>Pendiente</strong> y requiere aprobación de Admin.
              </p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
