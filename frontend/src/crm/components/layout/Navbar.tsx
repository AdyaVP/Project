import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
import { SearchBar } from '../common';
import { SearchResults } from '../common/SearchResults';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { currentUser, logout } = useAuth();
  const { searchQuery, setSearchQuery, performSearch } = useSearch();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    performSearch(value);
  };

  if (!currentUser) return null;

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40 transition-all duration-300">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Mobile Menu & Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <span className="text-2xl">☰</span>
          </button>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Hola {currentUser.name.split(' ')[0]} 👋
          </h2>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative hidden md:block">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar vehiculos, clientes, reservas..."
              className="w-64 lg:w-80"
            />
            <SearchResults />
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 font-semibold text-sm">
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // Navigate to profile
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <span>⚙️</span>
                      Mi Perfil
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger-light dark:hover:bg-danger/20 flex items-center gap-2"
                    >
                      <span>🚪</span>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
