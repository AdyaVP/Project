import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useForm } from '../hooks/useForm';
import { Card, Table, Button, Modal, Input, Select, SearchBar, Badge } from '../components/common';
import { mockUsers } from '../data/mockData';
import { User, Role } from '../types';
import { validateForm } from '../utils/validation';
import { formatShortDate } from '../utils/formatters';
import { canManageUser, ADMIN_ALLOWED_ROLES, SUPERADMIN_ALLOWED_ROLES } from '../config/permissions';

export const Usuarios: React.FC = () => {
  const { currentUser } = useAuth();
  const { canCreate, canEdit } = usePermissions('usuarios');
  const [usuarios, setUsuarios] = useState<User[]>(mockUsers);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { values, errors, handleChange, handleSubmit, resetForm, setFieldValue } = useForm<Partial<User>>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      role: 'OPERADOR',
      status: 'active',
    },
    onSubmit: (formValues) => {
      if (editingUser) {
        setUsuarios(prev =>
          prev.map(u => u.id === editingUser.id ? { ...u, ...formValues } : u)
        );
      } else {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: formValues.name!,
          email: formValues.email!,
          phone: formValues.phone,
          role: formValues.role as Role,
          status: formValues.status as 'active' | 'inactive',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setUsuarios(prev => [...prev, newUser]);
      }
      setShowModal(false);
      resetForm();
      setEditingUser(null);
    },
    validate: (values) => {
      const validation = validateForm({
        name: { value: values.name, rules: { required: true, minLength: 3 } },
        email: { value: values.email, rules: { required: true, email: true } },
        role: { value: values.role, rules: { required: true } },
      });
      return validation.errors;
    },
  });

  const openCreateModal = () => {
    resetForm();
    setEditingUser(null);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    // Verificar si puede gestionar este usuario
    if (!currentUser || !canManageUser(currentUser.role, user)) {
      const message = currentUser?.role === 'ADMIN' 
        ? 'No tienes permisos para editar Admins o Super Admins. Solo puedes gestionar Operadores y Clientes.'
        : 'No tienes permisos para editar este usuario.';
      alert(message);
      return;
    }

    setEditingUser(user);
    setFieldValue('name', user.name);
    setFieldValue('email', user.email);
    setFieldValue('phone', user.phone || '');
    setFieldValue('role', user.role);
    setFieldValue('status', user.status);
    setShowModal(true);
  };

  const handleDelete = (user: User) => {
    // Verificar si puede gestionar este usuario
    if (!currentUser || !canManageUser(currentUser.role, user)) {
      const message = currentUser?.role === 'ADMIN' 
        ? 'No tienes permisos para eliminar Admins o Super Admins. Solo puedes gestionar Operadores y Clientes.'
        : 'No tienes permisos para eliminar este usuario.';
      alert(message);
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar al usuario ${user.name}?`)) {
      setUsuarios(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(usuario => {
      const matchesSearch = usuario.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [usuarios, searchQuery]);

  const getRoleBadge = (role: Role) => {
    const config = {
      SUPER_ADMIN: { variant: 'danger' as const, label: 'Super Admin', icon: '👑' },
      ADMIN: { variant: 'warning' as const, label: 'Admin', icon: '⚡' },
      OPERADOR: { variant: 'info' as const, label: 'Operador', icon: '📋' },
      CLIENTE: { variant: 'default' as const, label: 'Cliente', icon: '👤' },
    };
    return config[role];
  };

  // Roles disponibles según el rol del usuario actual
  const availableRoles = currentUser?.role === 'SUPER_ADMIN'
    ? SUPERADMIN_ALLOWED_ROLES  // Super Admin puede crear todos los roles
    : ADMIN_ALLOWED_ROLES;      // Admin solo puede crear Operadores y Clientes

  const columns = [
    {
      key: 'user',
      label: 'Usuario',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Teléfono',
      render: (user: User) => user.phone || 'N/A',
    },
    {
      key: 'role',
      label: 'Rol',
      render: (user: User) => {
        const config = getRoleBadge(user.role);
        return (
          <Badge variant={config.variant}>
            <span className="mr-1">{config.icon}</span>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Estado',
      render: (user: User) => (
        <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
          {user.status === 'active' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Fecha de Registro',
      render: (user: User) => formatShortDate(user.createdAt),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => openEditModal(user)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              disabled={currentUser?.role === 'ADMIN' && user.role === 'SUPER_ADMIN'}
            >
              Editar
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => handleDelete(user)}
              className="text-danger hover:text-danger-dark text-sm font-medium"
              disabled={currentUser?.role === 'ADMIN' && user.role === 'SUPER_ADMIN'}
            >
              Eliminar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Usuarios</h1>
          <p className="text-gray-600">Gestión de usuarios del sistema</p>
        </div>
        {canCreate && (
          <Button onClick={openCreateModal} icon="➕">
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Stats by Role */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['SUPER_ADMIN', 'ADMIN', 'OPERADOR', 'CLIENTE'].map(role => {
          const count = usuarios.filter(u => u.role === role).length;
          const config = getRoleBadge(role as Role);
          return (
            <Card key={role}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{config.icon}</span>
                <div>
                  <p className="text-sm text-gray-500">{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <Card>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre o email..."
        />
      </Card>

      {/* Table */}
      <Card>
        <Table
          data={filteredUsuarios}
          columns={columns}
          emptyMessage="No se encontraron usuarios"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
          setEditingUser(null);
        }}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { handleSubmit({ preventDefault: () => {} } as any); }}>
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
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
            placeholder="(123) 456-7890"
          />
          <Select
            name="role"
            label="Rol"
            value={values.role || 'OPERADOR'}
            onChange={handleChange}
            error={errors.role}
            options={availableRoles.map(role => {
              const config = getRoleBadge(role as Role);
              return { value: role, label: config.label };
            })}
            required
          />
          <Select
            name="status"
            label="Estado"
            value={values.status || 'active'}
            onChange={handleChange}
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' },
            ]}
          />
          {!editingUser && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ En producción, se enviaría un email al usuario con sus credenciales de acceso.
              </p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
