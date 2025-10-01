import React from 'react';
import { useAuth } from '../context/AuthContext';
import { StatCard, Card } from '../components/common';
import { mockDashboardStats } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const stats = mockDashboardStats;

  // Estadísticas según el rol
  const renderStatsByRole = () => {
    if (currentUser.role === 'CLIENTE') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon="📅"
            iconBg="bg-blue-100"
            title="Mis Reservas"
            value="3"
            subtitle="Activas"
          />
          <StatCard
            icon="💰"
            iconBg="bg-green-100"
            title="Facturas"
            value="$1,250"
            subtitle="Pendientes"
          />
          <StatCard
            icon="📄"
            iconBg="bg-purple-100"
            title="Contratos"
            value="2"
            subtitle="Vigentes"
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon="👥"
          iconBg="bg-green-100"
          title="Total Clientes"
          value={stats.totalCustomers.toLocaleString()}
          trend={{
            value: stats.customersTrend,
            isPositive: stats.customersTrend > 0,
          }}
          subtitle="este mes"
        />
        <StatCard
          icon="👤"
          iconBg="bg-blue-100"
          title="Miembros"
          value={stats.totalMembers.toLocaleString()}
          trend={{
            value: stats.membersTrend,
            isPositive: stats.membersTrend > 0,
          }}
          subtitle="este mes"
        />
        <StatCard
          icon="💻"
          iconBg="bg-purple-100"
          title="Activos Ahora"
          value={stats.activeNow}
          extra={
            <div className="flex -space-x-2">
              {stats.activeUsers.slice(0, 4).map((user, i) => (
                <div
                  key={user.id}
                  className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-primary-600"
                  title={user.name}
                >
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              ))}
            </div>
          }
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema</p>
      </div>

      {/* Stats */}
      {renderStatsByRole()}

      {/* Additional Stats for Admin/Super Admin/Operador */}
      {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'OPERADOR') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                🚗
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehículos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                ✅
              </div>
              <div>
                <p className="text-sm text-gray-500">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableVehicles}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                ⏳
              </div>
              <div>
                <p className="text-sm text-gray-500">Reservas Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReservations}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                💵
              </div>
              <div>
                <p className="text-sm text-gray-500">Ingreso Mensual</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentUser.role !== 'CLIENTE' && (
            <>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-3xl">➕</span>
                <span className="text-sm font-medium text-gray-700">Nueva Reserva</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-3xl">👤</span>
                <span className="text-sm font-medium text-gray-700">Agregar Cliente</span>
              </button>
            </>
          )}
          {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
            <>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-3xl">🚗</span>
                <span className="text-sm font-medium text-gray-700">Agregar Vehículo</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-3xl">📄</span>
                <span className="text-sm font-medium text-gray-700">Nueva Factura</span>
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
