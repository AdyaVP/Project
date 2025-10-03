import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchResult {
  id: string;
  type: 'vehiculo' | 'cliente' | 'reserva' | 'factura';
  title: string;
  subtitle: string;
  route: string;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  performSearch: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    // Simular búsqueda (aquí conectarías con tu API)
    setTimeout(() => {
      const mockResults: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      // Buscar en vehículos
      const vehiculos = [
        { id: '1', marca: 'Toyota', modelo: 'Corolla', placa: 'ABC123' },
        { id: '2', marca: 'Honda', modelo: 'Civic', placa: 'DEF456' },
        { id: '3', marca: 'Ford', modelo: 'Mustang', placa: 'GHI789' },
      ];

      vehiculos.forEach(v => {
        if (v.marca.toLowerCase().includes(lowerQuery) || 
            v.modelo.toLowerCase().includes(lowerQuery) || 
            v.placa.toLowerCase().includes(lowerQuery)) {
          mockResults.push({
            id: v.id,
            type: 'vehiculo',
            title: `${v.marca} ${v.modelo}`,
            subtitle: `Placa: ${v.placa}`,
            route: '/crm/vehiculos'
          });
        }
      });

      // Buscar en clientes
      const clientes = [
        { id: '1', nombre: 'Juan Pérez', email: 'juan@email.com' },
        { id: '2', nombre: 'María García', email: 'maria@email.com' },
        { id: '3', nombre: 'Carlos López', email: 'carlos@email.com' },
      ];

      clientes.forEach(c => {
        if (c.nombre.toLowerCase().includes(lowerQuery) || 
            c.email.toLowerCase().includes(lowerQuery)) {
          mockResults.push({
            id: c.id,
            type: 'cliente',
            title: c.nombre,
            subtitle: c.email,
            route: '/crm/clientes'
          });
        }
      });

      // Buscar en reservas
      const reservas = [
        { id: '1', cliente: 'Juan Pérez', vehiculo: 'Toyota Corolla', codigo: 'RES001' },
        { id: '2', cliente: 'María García', vehiculo: 'Honda Civic', codigo: 'RES002' },
      ];

      reservas.forEach(r => {
        if (r.cliente.toLowerCase().includes(lowerQuery) || 
            r.vehiculo.toLowerCase().includes(lowerQuery) ||
            r.codigo.toLowerCase().includes(lowerQuery)) {
          mockResults.push({
            id: r.id,
            type: 'reserva',
            title: `Reserva ${r.codigo}`,
            subtitle: `${r.cliente} - ${r.vehiculo}`,
            route: '/crm/reservas'
          });
        }
      });

      setResults(mockResults);
      setIsSearching(false);
    }, 300);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        results,
        isSearching,
        showResults,
        setShowResults,
        performSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};
