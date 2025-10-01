import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@crm/context/AuthContext';
import ClienteLayout from './components/ClienteLayout';
import ClienteDashboard from './pages/ClienteDashboard';
import ClienteReservas from './pages/ClienteReservas';
import ClienteFacturas from './pages/ClienteFacturas';
import ClienteContratos from './pages/ClienteContratos';
import ClientePerfil from './pages/ClientePerfil';
import ClienteLogin from './pages/ClienteLogin';

const ClienteApp: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();

  // Si no está autenticado, mostrar login de cliente
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<ClienteLogin />} />
      </Routes>
    );
  }

  // Si está autenticado pero no es cliente, redirigir al CRM
  if (currentUser?.role !== 'CLIENTE') {
    return <Navigate to="/crm" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<ClienteLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClienteDashboard />} />
        <Route path="reservas" element={<ClienteReservas />} />
        <Route path="facturas" element={<ClienteFacturas />} />
        <Route path="contratos" element={<ClienteContratos />} />
        <Route path="perfil" element={<ClientePerfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/cliente" replace />} />
    </Routes>
  );
};

export default ClienteApp;
