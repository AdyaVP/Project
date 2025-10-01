import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SIDEBAR_MODULES, MODULE_INFO } from '../../config/permissions';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile, onClose }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const allowedModules = SIDEBAR_MODULES[currentUser.role];

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 z-50 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } ${isMobile ? '' : 'lg:translate-x-0'}`}>
      {/* Logo/Brand */}
      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 dark:bg-primary-700 rounded-xl flex items-center justify-center text-white text-xl">
            🏢
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Sistema de</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gestión</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {allowedModules.map((moduleId) => {
            const module = MODULE_INFO[moduleId];
            if (!module) return null;

            return (
              <NavLink
                key={module.id}
                to={module.path}
                onClick={() => isMobile && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                <span className="text-xl">{module.iconPlaceholder}</span>
                <span className="font-medium">{module.name}</span>
                <span className="ml-auto text-sm">›</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 font-semibold">
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {currentUser.role.toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
