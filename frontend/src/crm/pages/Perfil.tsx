import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { Card, Input, Button } from '../components/common';
import { validateForm } from '../utils/validation';

export const Perfil: React.FC = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const { values, errors, handleChange, handleSubmit, resetForm } = useForm({
    initialValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
    },
    onSubmit: () => {
      // En producción, aquí se enviaría al backend
      setIsEditing(false);
      alert('Perfil actualizado correctamente');
    },
    validate: (values) => {
      const validation = validateForm({
        name: { value: values.name, rules: { required: true, minLength: 3 } },
        email: { value: values.email, rules: { required: true, email: true } },
      });
      return validation.errors;
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    onSubmit: (formValues) => {
      if (formValues.newPassword !== formValues.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      // En producción, aquí se enviaría al backend
      alert('Contraseña actualizada correctamente');
      setShowPasswordChange(false);
      passwordForm.resetForm();
    },
    validate: (values) => {
      const validation = validateForm({
        currentPassword: { value: values.currentPassword, rules: { required: true, minLength: 6 } },
        newPassword: { value: values.newPassword, rules: { required: true, minLength: 6 } },
        confirmPassword: { value: values.confirmPassword, rules: { required: true, minLength: 6 } },
      });
      return validation.errors;
    },
  });

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal y configuración</p>
      </div>

      {/* Profile Header */}
      <Card>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-3xl">
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
            <p className="text-gray-600 mb-2">{currentUser.email}</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
                {currentUser.role.toLowerCase().replace('_', ' ')}
              </span>
              <span className="px-3 py-1 bg-success-light text-success-dark rounded-full text-sm font-medium">
                {currentUser.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
          </Button>
        </div>
      </Card>

      {/* Personal Information */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="name"
              label="Nombre Completo"
              value={values.name}
              onChange={handleChange}
              error={errors.name}
              disabled={!isEditing}
              required
            />
            <Input
              name="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="phone"
              label="Teléfono"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <input
                type="text"
                value={currentUser.role.replace('_', ' ')}
                disabled
                className="input-field bg-gray-100 capitalize"
              />
            </div>
          </div>
          {isEditing && (
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Guardar Cambios
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Security */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Seguridad</h3>
            <p className="text-sm text-gray-600">Actualiza tu contraseña</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowPasswordChange(!showPasswordChange)}
          >
            {showPasswordChange ? 'Cancelar' : 'Cambiar Contraseña'}
          </Button>
        </div>

        {showPasswordChange && (
          <form onSubmit={passwordForm.handleSubmit} className="space-y-4 pt-4 border-t">
            <Input
              name="currentPassword"
              label="Contraseña Actual"
              type="password"
              value={passwordForm.values.currentPassword}
              onChange={passwordForm.handleChange}
              error={passwordForm.errors.currentPassword}
              required
            />
            <Input
              name="newPassword"
              label="Nueva Contraseña"
              type="password"
              value={passwordForm.values.newPassword}
              onChange={passwordForm.handleChange}
              error={passwordForm.errors.newPassword}
              required
            />
            <Input
              name="confirmPassword"
              label="Confirmar Nueva Contraseña"
              type="password"
              value={passwordForm.values.confirmPassword}
              onChange={passwordForm.handleChange}
              error={passwordForm.errors.confirmPassword}
              required
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowPasswordChange(false);
                  passwordForm.resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Actualizar Contraseña
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Account Info */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Cuenta</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Fecha de Registro</span>
            <span className="font-medium text-gray-900">
              {new Date(currentUser.createdAt).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">ID de Usuario</span>
            <span className="font-mono text-gray-900">{currentUser.id}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Estado de la Cuenta</span>
            <span className="font-medium text-success">Verificada</span>
          </div>
        </div>
      </Card>

      {/* Danger Zone - Only for demo */}
      <Card className="border-2 border-danger">
        <h3 className="text-lg font-semibold text-danger mb-2">Zona de Peligro</h3>
        <p className="text-sm text-gray-600 mb-4">
          Acciones irreversibles en tu cuenta
        </p>
        <Button variant="danger" onClick={() => alert('En producción, esto desactivaría la cuenta')}>
          Desactivar Cuenta
        </Button>
      </Card>
    </div>
  );
};
