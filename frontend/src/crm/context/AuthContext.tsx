import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, Permission } from '../types';
import { ROLE_PERMISSIONS } from '../config/permissions';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (role: Role) => void;
  logout: () => void;
  hasPermission: (module: string, action: keyof Permission) => boolean;
  getPermission: (module: string) => Permission | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios simulados para cada rol
const MOCK_USERS: Record<Role, User> = {
  SUPER_ADMIN: {
    id: 'sa-001',
    name: 'Valeria Rodríguez',
    email: 'valeria@sistema.com',
    role: 'SUPER_ADMIN',
    phone: '+1 234 567 8900',
    avatar: '',
    createdAt: '2024-01-15',
    status: 'active',
  },
  ADMIN: {
    id: 'adm-001',
    name: 'Carlos Administrador',
    email: 'carlos@sistema.com',
    role: 'ADMIN',
    phone: '+1 234 567 8901',
    avatar: '',
    createdAt: '2024-02-20',
    status: 'active',
  },
  OPERADOR: {
    id: 'op-001',
    name: 'Ana García',
    email: 'ana@sistema.com',
    role: 'OPERADOR',
    phone: '+1 234 567 8902',
    avatar: '',
    createdAt: '2024-03-10',
    status: 'active',
  },
  CLIENTE: {
    id: 'cli-001',
    name: 'Juan Cliente',
    email: 'juan@cliente.com',
    role: 'CLIENTE',
    phone: '+1 234 567 8903',
    avatar: '',
    createdAt: '2024-04-05',
    status: 'active',
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = (role: Role) => {
    const user = MOCK_USERS[role];
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (module: string, action: keyof Permission): boolean => {
    if (!currentUser) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[currentUser.role];
    const modulePermission = rolePermissions[module];
    
    if (!modulePermission) return false;

    // Para acciones booleanas directas
    if (typeof modulePermission[action] === 'boolean') {
      return modulePermission[action] as boolean;
    }

    return false;
  };

  const getPermission = (module: string): Permission | null => {
    if (!currentUser) return null;
    
    const rolePermissions = ROLE_PERMISSIONS[currentUser.role];
    return rolePermissions[module] || null;
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    getPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
