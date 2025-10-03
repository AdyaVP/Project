import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';

export const SearchResults: React.FC = () => {
  const { results, isSearching, showResults, setShowResults, searchQuery } = useSearch();
  const navigate = useNavigate();

  if (!showResults) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'vehiculo': return '🚗';
      case 'cliente': return '👤';
      case 'reserva': return '📅';
      case 'factura': return '💰';
      default: return '📄';
    }
  };

  const handleResultClick = (route: string) => {
    navigate(route);
    setShowResults(false);
  };

  return (
    <>
      {/* Overlay para cerrar al hacer click fuera */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => setShowResults(false)}
      />
      
      {/* Resultados */}
      <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
        {isSearching ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
            <p className="mt-2">Buscando...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-6 text-center">
            <span className="text-4xl mb-2 block">🔍</span>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No se encontró lo que buscabas
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Intenta con otro término de búsqueda
            </p>
            {searchQuery && (
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                Búsqueda: "{searchQuery}"
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result.route)}
                  className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3 text-left transition-colors"
                >
                  <span className="text-2xl flex-shrink-0">{getIcon(result.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {result.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {result.subtitle}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">
                      {result.type}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
