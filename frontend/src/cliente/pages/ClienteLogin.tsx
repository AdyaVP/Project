import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@crm/context/AuthContext';

const ClienteLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    // Simular login de cliente
    login('CLIENTE');
    navigate('/cliente/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl shadow-lg mb-4">
              <span className="text-4xl">🚗</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Alpha Car Rental
            </h1>
            <p className="text-gray-600">
              Portal de Cliente
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button onClick={handleLogin} className="btn-primary w-full">
              Iniciar Sesión
            </button>
          </div>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <button className="text-sm text-primary-600 hover:text-primary-700">
              ¿Olvidaste tu contraseña?
            </button>
            <p className="text-sm text-gray-600">
              ¿Eres administrador?{' '}
              <a href="/crm/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Acceder al CRM
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteLogin;
