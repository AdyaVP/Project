import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, module }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const { hasAccess } = usePermissions(module || '');

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/crm/login" replace />;
  }

  // Si se especifica un módulo y no tiene acceso, mostrar error
  if (module && !hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a este módulo.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
