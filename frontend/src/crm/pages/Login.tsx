import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';


export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (role: Role) => {
    login(role);
    navigate('/dashboard');
  };

  const roles: { role: Role; label: string; icon: string; description: string }[] = [
    {
      role: 'SUPER_ADMIN',
      label: 'Super Admin',
      icon: '👑',
      description: 'Acceso total al sistema',
    },
    {
      role: 'ADMIN',
      label: 'Administrador',
      icon: '⚡',
      description: 'Gestión de vehículos y clientes',
    },
    {
      role: 'OPERADOR',
      label: 'Operador',
      icon: '📋',
      description: 'Pre-reservas y atención al cliente',
    },
    {
      role: 'CLIENTE',
      label: 'Cliente',
      icon: '👤',
      description: 'Consulta de reservas propias',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">🏢</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Sistema de Gestión - CRM
          </h1>
          <p className="text-primary-100 text-lg">
            Selecciona un rol para acceder al sistema
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((roleInfo) => (
            <div
              key={roleInfo.role}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group"
              onClick={() => handleLogin(roleInfo.role)}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {roleInfo.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {roleInfo.label}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {roleInfo.description}
                  </p>
                  <div className="flex items-center text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
                    <span>Acceder</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
            <p className="text-white text-sm">
              ℹ️ Simulación de login - No requiere credenciales
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
