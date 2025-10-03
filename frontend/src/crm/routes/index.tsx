import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Usuarios } from '../pages/Usuarios';
import { Vehiculos } from '../pages/Vehiculos';
import { Clientes } from '../pages/Clientes';
import { Reservas } from '../pages/Reservas';
import { Facturacion } from '../pages/Facturacion';
import { Perfil } from '../pages/Perfil';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública - Login */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/crm/dashboard" replace /> : <Login />}
        />
        <Route
          path="/crm/login"
          element={isAuthenticated ? <Navigate to="/crm/dashboard" replace /> : <Login />}
        />

        {/* Rutas protegidas con prefijo /crm */}
        <Route
          path="/crm"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirect raíz a dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

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

          {/* Vehículos - Super Admin, Admin y Operador (limitado) */}
          <Route
            path="vehiculos"
            element={
              <ProtectedRoute module="vehiculos">
                <Vehiculos />
              </ProtectedRoute>
            }
          />

          {/* Clientes - Super Admin, Admin y Operador (limitado) */}
          <Route
            path="clientes"
            element={
              <ProtectedRoute module="clientes">
                <Clientes />
              </ProtectedRoute>
            }
          />

          {/* Reservas - Todos excepto algunos permisos limitados */}
          <Route
            path="reservas"
            element={
              <ProtectedRoute module="reservas">
                <Reservas />
              </ProtectedRoute>
            }
          />

          {/* Facturación - Super Admin, Admin y Cliente (solo sus facturas) */}
          <Route
            path="facturacion"
            element={
              <ProtectedRoute module="facturacion">
                <Facturacion />
              </ProtectedRoute>
            }
          />

          {/* Perfil - Todos los roles */}
          <Route
            path="perfil"
            element={
              <ProtectedRoute module="perfil">
                <Perfil />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Redirect raíz a /crm */}
        <Route path="/" element={<Navigate to="/crm/dashboard" replace />} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<Navigate to="/crm/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
