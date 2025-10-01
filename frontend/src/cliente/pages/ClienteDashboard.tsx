import React from 'react';
import { useAuth } from '@crm/context/AuthContext';

const ClienteDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Bienvenido, {currentUser?.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600">
          Este es tu panel personal donde puedes gestionar tus reservas, facturas y contratos.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">
              📅
            </div>
            <div>
              <p className="text-sm text-gray-500">Reservas Activas</p>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl">
              💰
            </div>
            <div>
              <p className="text-sm text-gray-500">Facturas Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">$1,250</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl">
              📄
            </div>
            <div>
              <p className="text-sm text-gray-500">Contratos Vigentes</p>
              <p className="text-3xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reserva Actual */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reserva Actual</h2>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                🚗
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Toyota Corolla 2023</h3>
                <p className="text-gray-600 text-sm mb-2">Placa: ABC-123</p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Inicio</p>
                    <p className="font-semibold">24/09/2025</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fin</p>
                    <p className="font-semibold">26/09/2025</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-semibold text-primary-600">$135.00</p>
                  </div>
                </div>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Confirmada
            </span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-primary-600 hover:bg-primary-50 transition-all">
            <span className="text-3xl">🚗</span>
            <span className="text-sm font-medium text-gray-700">Nueva Reserva</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-primary-600 hover:bg-primary-50 transition-all">
            <span className="text-3xl">💳</span>
            <span className="text-sm font-medium text-gray-700">Pagar Factura</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-primary-600 hover:bg-primary-50 transition-all">
            <span className="text-3xl">📄</span>
            <span className="text-sm font-medium text-gray-700">Ver Contratos</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-primary-600 hover:bg-primary-50 transition-all">
            <span className="text-3xl">💬</span>
            <span className="text-sm font-medium text-gray-700">Contacto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteDashboard;
