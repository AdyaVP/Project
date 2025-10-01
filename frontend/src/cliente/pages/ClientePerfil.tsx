import React, { useState } from 'react';
import { useAuth } from '@crm/context/AuthContext';

const ClientePerfil: React.FC = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal</p>
      </div>

      {/* Información Personal */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-3xl">
            {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{currentUser?.name}</h2>
            <p className="text-gray-600">{currentUser?.email}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary"
          >
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              className="input-field"
              value={currentUser?.name || ''}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="input-field"
              value={currentUser?.email || ''}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              className="input-field"
              value={currentUser?.phone || ''}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Registro
            </label>
            <input
              type="text"
              className="input-field bg-gray-100"
              value={currentUser?.createdAt || ''}
              disabled
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button className="btn-secondary" onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={() => setIsEditing(false)}>
              Guardar Cambios
            </button>
          </div>
        )}
      </div>

      {/* Cambiar Contraseña */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seguridad</h3>
        <button className="btn-secondary">
          Cambiar Contraseña
        </button>
      </div>
    </div>
  );
};

export default ClientePerfil;
