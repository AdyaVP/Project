import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './crm/context/AuthContext';
import { ThemeProvider } from './crm/context/ThemeContext';

// Lazy load de aplicaciones
import CRMApp from './crm/CRMApp';
import ClienteApp from './cliente/ClienteApp';

const AppRouter: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Ruta para el CRM (Panel Administrativo) */}
      <Route path="/crm/*" element={<CRMApp />} />

      {/* Ruta para la vista de Cliente */}
      <Route path="/cliente/*" element={<ClienteApp />} />

      {/* Redireccionamiento por defecto según rol */}
      <Route 
        path="/" 
        element={
          isAuthenticated
            ? currentUser?.role === 'CLIENTE' 
              ? <Navigate to="/cliente/dashboard" replace /> 
              : <Navigate to="/crm/dashboard" replace />
            : <Navigate to="/crm/login" replace />
        } 
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/crm/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
