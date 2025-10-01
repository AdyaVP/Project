import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Table, SearchBar, Badge } from '../components/common';
import { Contrato } from '../types';
import { formatShortDate } from '../utils/formatters';

export const Contratos: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data de contratos
  const mockContratos: Contrato[] = [
    {
      id: 'ctr-001',
      reservaId: '0f6602b4-7f21-4591-abd8-e8f5bc40aa62',
      clienteId: 'cli-005',
      clienteName: 'Robert Johnson',
      vehiculoInfo: 'Chevrolet Spark (XYZ789)',
      startDate: '2024-09-23',
      endDate: '2024-09-26',
      terms: ['Seguro completo incluido', 'Kilometraje ilimitado', 'Entrega en aeropuerto'],
      signedDate: '2024-09-23',
      status: 'completed',
      createdAt: '2024-09-23',
    },
    {
      id: 'ctr-002',
      reservaId: 'a5abafcb-e7b5-4346-8acd-dba2b46ed81d',
      clienteId: 'cli-004',
      clienteName: 'Juan Carlos Pérez',
      vehiculoInfo: 'Toyota Corolla (ABC123)',
      startDate: '2024-09-24',
      endDate: '2024-09-26',
      terms: ['Seguro básico', 'Kilometraje limitado a 300km'],
      signedDate: '2024-09-24',
      status: 'active',
      createdAt: '2024-09-24',
    },
    {
      id: 'ctr-003',
      reservaId: 'res-004',
      clienteId: 'cli-006',
      clienteName: 'Kathryn Murphy',
      vehiculoInfo: 'Honda CR-V (DEF456)',
      startDate: '2024-10-01',
      endDate: '2024-10-05',
      terms: ['Seguro completo', 'GPS incluido', 'Asientos de bebé disponibles'],
      status: 'draft',
      createdAt: '2024-09-28',
    },
  ];

  const [contratos] = useState<Contrato[]>(mockContratos);

  const filteredContratos = useMemo(() => {
    let filtered = contratos;

    // Si es cliente, solo ver sus propios contratos
    if (currentUser?.role === 'CLIENTE') {
      // En producción: filtered = contratos.filter(c => c.clienteId === currentUser.id);
    }

    return filtered.filter(contrato => {
      const matchesSearch = contrato.clienteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contrato.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contrato.vehiculoInfo.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [contratos, searchQuery, currentUser]);

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'default' as const, label: 'Borrador' },
      active: { variant: 'success' as const, label: 'Activo' },
      completed: { variant: 'info' as const, label: 'Completado' },
      terminated: { variant: 'danger' as const, label: 'Terminado' },
    };
    return config[status as keyof typeof config];
  };

  const columns = [
    {
      key: 'id',
      label: 'Contrato #',
      width: '12%',
      render: (contrato: Contrato) => (
        <p className="font-mono text-sm text-gray-900">{contrato.id}</p>
      ),
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (contrato: Contrato) => (
        <div>
          <p className="font-medium text-gray-900">{contrato.clienteName}</p>
          <p className="text-sm text-gray-500">{contrato.vehiculoInfo}</p>
        </div>
      ),
    },
    {
      key: 'periodo',
      label: 'Período',
      render: (contrato: Contrato) => (
        <div className="text-sm">
          <p className="text-gray-900">{formatShortDate(contrato.startDate)}</p>
          <p className="text-gray-500">hasta</p>
          <p className="text-gray-900">{formatShortDate(contrato.endDate)}</p>
        </div>
      ),
    },
    {
      key: 'terms',
      label: 'Términos',
      render: (contrato: Contrato) => (
        <ul className="text-sm text-gray-600 list-disc list-inside">
          {contrato.terms.slice(0, 2).map((term, i) => (
            <li key={i} className="truncate">{term}</li>
          ))}
          {contrato.terms.length > 2 && (
            <li className="text-primary-600">+{contrato.terms.length - 2} más</li>
          )}
        </ul>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (contrato: Contrato) => {
        const config = getStatusBadge(contrato.status);
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'signedDate',
      label: 'Fecha de Firma',
      render: (contrato: Contrato) => 
        contrato.signedDate ? formatShortDate(contrato.signedDate) : 'Sin firmar',
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (contrato: Contrato) => (
        <div className="flex flex-col gap-1">
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Ver PDF
          </button>
          {contrato.status === 'draft' && currentUser?.role !== 'CLIENTE' && (
            <button className="text-success hover:text-success-dark text-sm font-medium">
              Enviar para firma
            </button>
          )}
        </div>
      ),
    },
  ];

  const stats = {
    draft: contratos.filter(c => c.status === 'draft').length,
    active: contratos.filter(c => c.status === 'active').length,
    completed: contratos.filter(c => c.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Contratos</h1>
          <p className="text-gray-600">
            {currentUser?.role === 'CLIENTE' 
              ? 'Consulta tus contratos de alquiler' 
              : 'Gestión de contratos de alquiler'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
              📝
            </div>
            <div>
              <p className="text-sm text-gray-500">Borradores</p>
              <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <p className="text-sm text-gray-500">Completados</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por ID, cliente o vehículo..."
        />
      </Card>

      {/* Table */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contratos</h3>
          <p className="text-sm text-gray-600">Listado de todos los contratos</p>
        </div>
        <Table
          data={filteredContratos}
          columns={columns}
          emptyMessage="No se encontraron contratos"
        />
      </Card>
    </div>
  );
};
