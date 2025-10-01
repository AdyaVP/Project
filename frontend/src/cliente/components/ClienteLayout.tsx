import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@crm/context/AuthContext';

const ClienteLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const menuItems = [
    { path: '/cliente/dashboard', icon: '🏠', label: 'Inicio' },
    { path: '/cliente/reservas', icon: '📅', label: 'Mis Reservas' },
    { path: '/cliente/facturas', icon: '💰', label: 'Mis Facturas' },
    { path: '/cliente/contratos', icon: '📄', label: 'Mis Contratos' },
    { path: '/cliente/perfil', icon: '👤', label: 'Mi Perfil' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl">
                  🚗
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Alpha Car Rental</h1>
                  <p className="text-xs text-gray-500">Portal de Cliente</p>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                  {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-8">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ClienteLayout;
