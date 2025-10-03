import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Table, SearchBar, Badge, Button, Modal } from '../components/common';
import { ContratoArrendamiento } from '../components/forms';
import { Contrato, Reserva } from '../types';
import { mockReservas } from '../data/mockData';
import { formatShortDate } from '../utils/formatters';

export const Contratos: React.FC = () => {
  const { currentUser } = useAuth();
  const isOperador = currentUser?.role === 'OPERADOR';
  
  // Si NO es OPERADOR, redirigir o mostrar error
  if (!isOperador) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Restringido</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Esta sección es exclusiva para OPERADORES.
          </p>
        </div>
      </div>
    );
  }
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);

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

  const [contratos, setContratos] = useState<Contrato[]>(mockContratos);

  // Obtener reservas confirmadas que no tienen contrato
  const reservasConfirmadas = useMemo(() => {
    return mockReservas.filter(r => 
      r.status === 'confirmed' && 
      !contratos.some(c => c.reservaId === r.id)
    );
  }, [contratos]);

  // Función para crear contrato
  const handleCrearContrato = (contratoData: any) => {
    if (!selectedReserva) return;

    const nuevoContrato: Contrato = {
      id: `CTR-${Date.now()}`,
      reservaId: selectedReserva.id,
      clienteId: selectedReserva.clienteId,
      clienteName: selectedReserva.clienteName,
      vehiculoInfo: selectedReserva.vehiculoInfo,
      startDate: selectedReserva.startDate,
      endDate: selectedReserva.endDate,
      terms: ['Contrato de arrendamiento completo'],
      status: 'active',
      createdAt: new Date().toISOString(),
      ...contratoData,
    };

    setContratos([nuevoContrato, ...contratos]);
    setShowModal(false);
    setSelectedReserva(null);
    alert('✅ Contrato creado exitosamente');
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Contratos de Arrendamiento</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona contratos para reservas confirmadas
          </p>
        </div>
      </div>

      {/* Alerta si hay reservas confirmadas sin contrato */}
      {reservasConfirmadas.length > 0 ? (
        <Card>
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 rounded-lg p-4">
            <p className="font-semibold text-green-800 dark:text-green-200">
              ✅ Tienes {reservasConfirmadas.length} reserva(s) aprobada(s) lista(s) para contrato
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Las reservas han pasado la inspección y fueron aprobadas por el Admin. Puedes crear sus contratos.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-lg p-4 text-center">
            <p className="font-semibold text-blue-800 dark:text-blue-200">
              📋 No hay reservas pendientes de contrato
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Todas las reservas confirmadas ya tienen su contrato generado.
            </p>
          </div>
        </Card>
      )}

      {/* Lista de Reservas Confirmadas sin Contrato */}
      {reservasConfirmadas.length > 0 && (
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reservas Listas para Contrato</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Haz click en "Crear Contrato" para generar el documento</p>
          </div>
          <div className="space-y-3">
            {reservasConfirmadas.map(reserva => (
              <div
                key={reserva.id}
                className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-500 dark:hover:border-primary-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{reserva.clienteName}</h4>
                      <Badge variant="success">✅ Aprobada</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      🚗 {reserva.vehiculoInfo}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      📅 {formatShortDate(reserva.startDate)} → {formatShortDate(reserva.endDate)} ({reserva.days} días)
                    </p>
                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                      💰 Total: L. {reserva.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <Button onClick={() => {
                    setSelectedReserva(reserva);
                    setShowModal(true);
                  }}>
                    📄 Crear Contrato
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stats de Contratos Existentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
              📝
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Borradores</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.draft}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completados</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contratos</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Listado de todos los contratos</p>
        </div>
        <Table
          data={filteredContratos}
          columns={columns}
          emptyMessage="No se encontraron contratos"
        />
      </Card>

      {/* Modal para crear contrato */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedReserva(null);
        }}
        title={selectedReserva ? `Contrato - ${selectedReserva.clienteName}` : "Crear Contrato"}
        size="xl"
      >
        {selectedReserva && (
          <ContratoArrendamiento
            reservaId={selectedReserva.id}
            clienteName={selectedReserva.clienteName}
            vehiculoInfo={selectedReserva.vehiculoInfo}
            startDate={selectedReserva.startDate}
            endDate={selectedReserva.endDate}
            onSubmit={handleCrearContrato}
            onCancel={() => {
              setShowModal(false);
              setSelectedReserva(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};
