import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Usuarios } from './pages/Usuarios';
import { Vehiculos } from './pages/Vehiculos';
import { Clientes } from './pages/Clientes';
import { Reservas } from './pages/Reservas';
import { Facturacion } from './pages/Facturacion';
import { Mantenimiento } from './pages/Mantenimiento';
import { Perfil } from './pages/Perfil';

const CRMRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <SearchProvider>
      <Routes>
      {/* Ruta pública - Login */}
      <Route
        path="login"
        element={isAuthenticated ? <Navigate to="/crm/dashboard" replace /> : <Login />}
      />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect raíz a dashboard */}
        <Route index element={<Navigate to="/crm/dashboard" replace />} />

        {/* Dashboard - Todos los roles */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute module="dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Usuarios - Solo Super Admin y Admin */}
        <Route
          path="usuarios"
          element={
            <ProtectedRoute module="usuarios">
              <Usuarios />
            </ProtectedRoute>
          }
        />

        {/* Vehículos */}
        <Route
          path="vehiculos"
          element={
            <ProtectedRoute module="vehiculos">
              <Vehiculos />
            </ProtectedRoute>
          }
        />

        {/* Clientes */}
        <Route
          path="clientes"
          element={
            <ProtectedRoute module="clientes">
              <Clientes />
            </ProtectedRoute>
          }
        />

        {/* Reservas */}
        <Route
          path="reservas"
          element={
            <ProtectedRoute module="reservas">
              <Reservas />
            </ProtectedRoute>
          }
        />

        {/* Facturación */}
        <Route
          path="facturacion"
          element={
            <ProtectedRoute module="facturacion">
              <Facturacion />
            </ProtectedRoute>
          }
        />

        {/* Mantenimiento */}
        <Route
          path="mantenimiento"
          element={
            <ProtectedRoute module="mantenimiento">
              <Mantenimiento />
            </ProtectedRoute>
          }
        />

        {/* Perfil */}
        <Route
          path="perfil"
          element={
            <ProtectedRoute module="perfil">
              <Perfil />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 - Not Found */}
      <Route path="*" element={<Navigate to="/crm/login" replace />} />
    </Routes>
    </SearchProvider>
  );
};

const CRMApp: React.FC = () => {
  return <CRMRoutes />;
};

export default CRMApp;
