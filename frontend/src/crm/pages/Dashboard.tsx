import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatCard, Card } from '../components/common';
import { mockUsers, mockVehiculos, mockReservas, mockFacturas, mockClientes } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  // Calcular estadísticas reales basadas en los datos
  const stats = useMemo(() => {
    const totalClientes = mockClientes.length;
    const totalUsuarios = mockUsers.length;
    const usuariosActivos = mockUsers.filter(u => u.status === 'active').length;
    
    const totalVehiculos = mockVehiculos.length;
    const vehiculosDisponibles = mockVehiculos.filter(v => v.status === 'disponible').length;
    
    const reservasPendientes = mockReservas.filter(r => r.status === 'pendiente' || r.status === 'pre-reserva').length;
    
    // Calcular ingreso mensual (facturas pagadas del mes actual)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const ingresoMensual = mockFacturas
      .filter(f => {
        const facturaDate = new Date(f.issueDate);
        return f.status === 'paid' && 
               facturaDate.getMonth() === currentMonth && 
               facturaDate.getFullYear() === currentYear;
      })
      .reduce((sum, f) => sum + f.total, 0);

    // Calcular tendencias (simuladas - en producción vendrían del backend)
    const clientesTrend = 16; // +16%
    const usuariosTrend = -1; // -1%

    return {
      totalClientes,
      totalUsuarios,
      usuariosActivos,
      clientesTrend,
      usuariosTrend,
      totalVehiculos,
      vehiculosDisponibles,
      reservasPendientes,
      ingresoMensual,
      activeUsers: mockUsers.filter(u => u.status === 'active').slice(0, 4),
    };
  }, []);

  // Acciones rápidas
  const handleNuevaReserva = () => navigate('/crm/reservas');
  const handleAgregarCliente = () => navigate('/crm/clientes');
  const handleAgregarVehiculo = () => navigate('/crm/vehiculos');
  const handleNuevaFactura = () => navigate('/crm/facturacion');

  // Estadísticas según el rol
  const renderStatsByRole = () => {
    if (currentUser.role === 'CLIENTE') {
      // Para clientes - mostrar sus propias estadísticas
      const misReservas = mockReservas.filter(r => r.clienteName === currentUser.name);
      const misFacturas = mockFacturas.filter(f => f.clienteName === currentUser.name);
      const facturasPendientes = misFacturas.filter(f => f.status === 'pending' || f.status === 'overdue');
      const totalPendiente = facturasPendientes.reduce((sum, f) => sum + f.total, 0);

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon="📅"
            iconBg="bg-blue-100"
            title="Mis Reservas"
            value={misReservas.length.toString()}
            subtitle="Total"
          />
          <StatCard
            icon="💰"
            iconBg="bg-green-100"
            title="Facturas Pendientes"
            value={`$${totalPendiente.toLocaleString()}`}
            subtitle={`${facturasPendientes.length} factura${facturasPendientes.length !== 1 ? 's' : ''}`}
          />
          <StatCard
            icon="📄"
            iconBg="bg-purple-100"
            title="Facturas Totales"
            value={misFacturas.length.toString()}
            subtitle="Historial"
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
          value={stats.totalClientes.toLocaleString()}
          trend={{
            value: stats.clientesTrend,
            isPositive: stats.clientesTrend > 0,
          }}
          subtitle="este mes"
        />
        <StatCard
          icon="👤"
          iconBg="bg-blue-100"
          title="Miembros"
          value={stats.totalUsuarios.toLocaleString()}
          trend={{
            value: stats.usuariosTrend,
            isPositive: stats.usuariosTrend > 0,
          }}
          subtitle="este mes"
        />
        <StatCard
          icon="💻"
          iconBg="bg-purple-100"
          title="Activos Ahora"
          value={stats.usuariosActivos.toString()}
          extra={
            <div className="flex -space-x-2">
              {stats.activeUsers.map((user) => (
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Resumen general del sistema</p>
      </div>

      {/* Stats */}
      {renderStatsByRole()}

      {/* Additional Stats for Admin/Super Admin/Operador */}
      {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'OPERADOR') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center text-2xl">
                🚗
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vehículos Totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalVehiculos}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center text-2xl">
                ✅
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.vehiculosDisponibles}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center text-2xl">
                ⏳
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reservas Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reservasPendientes}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center text-2xl">
                💵
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ingreso Mensual</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.ingresoMensual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentUser.role !== 'CLIENTE' && (
            <>
              <button 
                onClick={handleNuevaReserva}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-primary-500"
              >
                <span className="text-3xl">➕</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nueva Reserva</span>
              </button>
              <button 
                onClick={handleAgregarCliente}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-primary-500"
              >
                <span className="text-3xl">👤</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agregar Cliente</span>
              </button>
            </>
          )}
          {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
            <>
              <button 
                onClick={handleAgregarVehiculo}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-primary-500"
              >
                <span className="text-3xl">🚗</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agregar Vehículo</span>
              </button>
              <button 
                onClick={handleNuevaFactura}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-primary-500"
              >
                <span className="text-3xl">📄</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nueva Factura</span>
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
