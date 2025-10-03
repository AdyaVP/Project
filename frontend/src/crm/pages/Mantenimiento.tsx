import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Card, Table, Button, Modal, SearchBar, Badge } from '../components/common';
import { mockVehiculos, mockDamageReports } from '../data/mockData';
import { Vehiculo, DamageReport, DamageDetail, DamageSeverity } from '../types';
import { formatCurrency, formatShortDate, convertUSDtoHNL } from '../utils/formatters';

export const Mantenimiento: React.FC = () => {
  const { currentUser } = useAuth();
  const { canCreate, canEdit } = usePermissions('mantenimiento');
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'vehiculos' | 'reportes'>('reportes');
  const [searchQuery, setSearchQuery] = useState('');
  const [damageReports, setDamageReports] = useState<DamageReport[]>(mockDamageReports);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [originalReportId, setOriginalReportId] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [editingDamages, setEditingDamages] = useState<DamageDetail[]>([]);
  const [newReport, setNewReport] = useState({
    vehiculoId: '',
    clienteId: '',
    clienteName: '',
    danos: [] as DamageDetail[],
  });

  // Filtrar reportes
  const filteredReports = useMemo(() => {
    return damageReports.filter(report => {
      const searchLower = searchQuery.toLowerCase();
      return (
        report.id.toLowerCase().includes(searchLower) ||
        report.vehiculoInfo.toLowerCase().includes(searchLower) ||
        report.clienteName.toLowerCase().includes(searchLower)
      );
    });
  }, [damageReports, searchQuery]);

  // Vehículos en mantenimiento
  const vehiculosEnMantenimiento = mockVehiculos.filter(v => v.status === 'maintenance');

  const getStatusBadge = (estado: string) => {
    const config = {
      en_revision: { variant: 'info' as const, label: 'En Revisión' },
      reparado: { variant: 'success' as const, label: 'Reparado' },
    };
    return config[estado as keyof typeof config];
  };

  const getSeverityBadge = (severidad: DamageSeverity) => {
    const config = {
      leve: { variant: 'success' as const, label: 'Leve', color: 'bg-green-100 text-green-700' },
      moderado: { variant: 'warning' as const, label: 'Moderado', color: 'bg-yellow-100 text-yellow-700' },
      grave: { variant: 'danger' as const, label: 'Grave', color: 'bg-red-100 text-red-700' },
    };
    return config[severidad];
  };

  const openDetailsModal = (report: DamageReport) => {
    setSelectedReport({...report});
    setOriginalReportId(report.id); // Guardar ID original
    setEditingDamages(JSON.parse(JSON.stringify(report.danos))); // Deep copy
    setShowDetailsModal(true);
  };

  const handleUpdateBasicInfo = (field: keyof DamageReport, value: any) => {
    if (selectedReport) {
      setSelectedReport({ ...selectedReport, [field]: value });
    }
  };

  const handleMarcarReparado = () => {
    if (selectedReport && confirm('¿Marcar este reporte como reparado?')) {
      setDamageReports(prev =>
        prev.map(r =>
          r.id === selectedReport.id
            ? { ...r, estado: 'reparado', reparadoFecha: new Date().toISOString().split('T')[0] }
            : r
        )
      );
      setShowDetailsModal(false);
      alert('Reporte marcado como reparado');
    }
  };

  const handleGenerarFactura = () => {
    if (selectedReport) {
      // Navegar a facturación con los datos pre-cargados
      alert(`Generando factura por ${formatCurrency(selectedReport.totalEstimado)}`);
      navigate('/crm/facturacion');
      setShowDetailsModal(false);
    }
  };

  const handleUpdateDamages = () => {
    if (selectedReport) {
      const totalEstimado = editingDamages.reduce((sum, d) => sum + d.costo, 0);
      const updatedReport = { 
        ...selectedReport, 
        danos: editingDamages, 
        totalEstimado 
      };
      
      // Usar originalReportId para encontrar el reporte correcto en caso de que hayan cambiado el ID
      setDamageReports(prev =>
        prev.map(r => r.id === originalReportId ? updatedReport : r)
      );
      setSelectedReport(updatedReport);
      setOriginalReportId(updatedReport.id); // Actualizar el ID original
      alert('Reporte actualizado correctamente');
    }
  };

  const handleAddDamage = () => {
    const newDamage: DamageDetail = {
      id: `dmg-${Date.now()}`,
      descripcion: '',
      tipo: 'Rayón',
      severidad: 'leve',
      costo: 0,
    };
    setEditingDamages([...editingDamages, newDamage]);
  };

  const handleRemoveDamage = (id: string) => {
    setEditingDamages(editingDamages.filter(d => d.id !== id));
  };

  const handleDamageChange = (id: string, field: keyof DamageDetail, value: any) => {
    setEditingDamages(prev =>
      prev.map(d => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  // Funciones para nuevo reporte
  const handleAddDamageToNewReport = () => {
    const newDamage: DamageDetail = {
      id: `dmg-${Date.now()}`,
      descripcion: '',
      tipo: 'Rayón',
      severidad: 'leve',
      costo: 0,
    };
    setNewReport(prev => ({ ...prev, danos: [...prev.danos, newDamage] }));
  };

  const handleRemoveDamageFromNewReport = (id: string) => {
    setNewReport(prev => ({ ...prev, danos: prev.danos.filter(d => d.id !== id) }));
  };

  const handleNewDamageChange = (id: string, field: keyof DamageDetail, value: any) => {
    setNewReport(prev => ({
      ...prev,
      danos: prev.danos.map(d => (d.id === id ? { ...d, [field]: value } : d)),
    }));
  };

  const handleCreateReport = () => {
    if (!newReport.vehiculoId || !newReport.clienteName || newReport.danos.length === 0) {
      alert('Por favor completa todos los campos y agrega al menos un daño');
      return;
    }

    const selectedVehiculo = mockVehiculos.find(v => v.id === newReport.vehiculoId);
    if (!selectedVehiculo) return;

    const totalEstimado = newReport.danos.reduce((sum, d) => sum + d.costo, 0);
    
    const report: DamageReport = {
      id: `rep-${Date.now().toString().slice(-3)}`,
      vehiculoId: newReport.vehiculoId,
      vehiculoInfo: `${selectedVehiculo.brand} ${selectedVehiculo.model} ${selectedVehiculo.year} (${selectedVehiculo.plate})`,
      clienteId: newReport.clienteId || 'cli-temp',
      clienteName: newReport.clienteName,
      fecha: new Date().toISOString().split('T')[0],
      danos: newReport.danos,
      totalEstimado,
      estado: 'en_revision',
      createdBy: currentUser?.id || 'admin',
    };

    setDamageReports(prev => [report, ...prev]);
    setShowAddReportModal(false);
    setNewReport({ vehiculoId: '', clienteId: '', clienteName: '', danos: [] });
    alert('Reporte creado exitosamente');
  };

  // Columnas para tabla de reportes
  const reportColumns = [
    {
      key: 'id',
      label: 'ID REPORTE',
      width: '10%',
      render: (report: DamageReport) => (
        <p className="font-mono text-sm text-gray-900 dark:text-white">{report.id}</p>
      ),
    },
    {
      key: 'fecha',
      label: 'FECHA',
      render: (report: DamageReport) => formatShortDate(report.fecha),
    },
    {
      key: 'vehiculo',
      label: 'VEHÍCULO',
      render: (report: DamageReport) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {report.vehiculoInfo.split('(')[0].trim()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Cliente: {report.clienteName}
          </p>
        </div>
      ),
    },
    {
      key: 'danos',
      label: 'DAÑOS REPORTADOS',
      render: (report: DamageReport) => (
        <div className="space-y-1">
          {report.danos.slice(0, 2).map((dano, idx) => (
            <p key={idx} className="text-sm text-gray-700 dark:text-gray-300">
              {report.danos.length > 1 ? `${idx + 1}.` : ''} {dano.descripcion.substring(0, 30)}
              {dano.descripcion.length > 30 ? '...' : ''}
            </p>
          ))}
          {report.danos.length > 2 && (
            <p className="text-xs text-gray-500">+{report.danos.length - 2} más</p>
          )}
        </div>
      ),
    },
    {
      key: 'costo',
      label: 'COSTO ESTIMADO',
      render: (report: DamageReport) => (
        <div className="text-sm">
          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(report.totalEstimado)} USD</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(convertUSDtoHNL(report.totalEstimado), 'HNL')} HNL</p>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'ESTADO',
      render: (report: DamageReport) => {
        const config = getStatusBadge(report.estado);
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'ACCIONES',
      render: (report: DamageReport) => (
        <button
          onClick={() => openDetailsModal(report)}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
        >
          Ver Detalles
        </button>
      ),
    },
  ];

  // Columnas para tabla de vehículos
  const vehiculoColumns = [
    {
      key: 'vehiculo',
      label: 'Vehículo',
      render: (vehiculo: Vehiculo) => (
        <div className="flex items-center gap-3">
          {vehiculo.image && (
            <img
              src={vehiculo.image}
              alt={`${vehiculo.brand} ${vehiculo.model}`}
              className="w-16 h-12 rounded object-cover"
            />
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {vehiculo.brand} {vehiculo.model}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{vehiculo.plate}</p>
          </div>
        </div>
      ),
    },
    { key: 'year', label: 'Año' },
    {
      key: 'type',
      label: 'Tipo',
      render: (v: Vehiculo) => <span className="capitalize">{v.type}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Mantenimiento</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestión de vehículos dañados y reportes</p>
        </div>
        {canCreate && activeTab === 'reportes' && (
          <Button onClick={() => setShowAddReportModal(true)} icon="➕">
            Nuevo Reporte
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('vehiculos')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'vehiculos'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            🚗 Vehículos ({vehiculosEnMantenimiento.length})
          </button>
          <button
            onClick={() => setActiveTab('reportes')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reportes'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            📋 Reportes de Daños ({damageReports.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'vehiculos' ? (
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vehículos en Mantenimiento
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lista de vehículos actualmente fuera de servicio
            </p>
          </div>
          <Table
            data={vehiculosEnMantenimiento}
            columns={vehiculoColumns}
            emptyMessage="No hay vehículos en mantenimiento"
          />
        </Card>
      ) : (
        <>
          {/* Search */}
          <Card>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por vehículo, cliente o ID..."
              className="w-full"
            />
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center text-2xl">
                  ⏳
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">En Revisión</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {damageReports.filter(r => r.estado === 'en_revision').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reparados</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {damageReports.filter(r => r.estado === 'reparado').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center text-2xl">
                  💰
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Estimado</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(damageReports.reduce((sum, r) => sum + r.totalEstimado, 0))} USD
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    {formatCurrency(convertUSDtoHNL(damageReports.reduce((sum, r) => sum + r.totalEstimado, 0)), 'HNL')} HNL
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Reportes Table */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reportes de Daños</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Daños reportados por Operadores durante inspecciones
              </p>
            </div>
            <Table
              data={filteredReports}
              columns={reportColumns}
              emptyMessage="No se encontraron reportes de daños"
            />
          </Card>
        </>
      )}

      {/* Modal de Detalles del Reporte */}
      {selectedReport && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedReport(null);
          }}
          title="📋 Detalle del Reporte de Daños"
          size="lg"
          footer={
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Cerrar
              </Button>
              {selectedReport.estado === 'en_revision' && canEdit && (
                <>
                  <Button onClick={handleMarcarReparado} className="bg-purple-600 hover:bg-purple-700">
                    🔧 Marcar como Reparado
                  </Button>
                  <Button onClick={handleGenerarFactura} className="bg-green-600 hover:bg-green-700">
                    💵 Generar Factura
                  </Button>
                </>
              )}
            </div>
          }
        >
          <div className="space-y-4">
            {/* Información básica - SIEMPRE EDITABLE */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  ID Reporte
                </label>
                <input
                  type="text"
                  value={selectedReport.id}
                  onChange={(e) => handleUpdateBasicInfo('id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-mono focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedReport.fecha}
                  onChange={(e) => handleUpdateBasicInfo('fecha', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Vehículo
                </label>
                <select
                  value={selectedReport.vehiculoId}
                  onChange={(e) => {
                    const vehiculo = mockVehiculos.find(v => v.id === e.target.value);
                    if (vehiculo) {
                      handleUpdateBasicInfo('vehiculoId', e.target.value);
                      handleUpdateBasicInfo('vehiculoInfo', `${vehiculo.brand} ${vehiculo.model} ${vehiculo.year} (${vehiculo.plate})`);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                >
                  {mockVehiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} {v.year} ({v.plate})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={selectedReport.clienteName}
                  onChange={(e) => handleUpdateBasicInfo('clienteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Estado
                </label>
                <select
                  value={selectedReport.estado}
                  onChange={(e) => handleUpdateBasicInfo('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="en_revision">En Revisión</option>
                  <option value="reparado">Reparado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Total Estimado
                </label>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(editingDamages.reduce((sum, d) => sum + d.costo, 0))} USD
                </p>
                <p className="text-lg font-semibold text-primary-500 dark:text-primary-300">
                  {formatCurrency(convertUSDtoHNL(editingDamages.reduce((sum, d) => sum + d.costo, 0)), 'HNL')} HNL
                </p>
              </div>
            </div>

            {/* Daños Detallados */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Daños Detallados</h4>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button onClick={handleAddDamage}>
                      ➕ Agregar Daño
                    </Button>
                    <Button variant="secondary" onClick={handleUpdateDamages}>
                      💾 Guardar Cambios
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {editingDamages.map((dano, idx) => (
                  <div
                    key={dano.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {canEdit ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-700 dark:text-gray-300">Daño #{idx + 1}</p>
                          <button
                            onClick={() => handleRemoveDamage(dano.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            ✕ Eliminar
                          </button>
                        </div>
                        <input
                          type="text"
                          value={dano.descripcion}
                          onChange={(e) => handleDamageChange(dano.id, 'descripcion', e.target.value)}
                          placeholder="Descripción del daño"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={dano.tipo}
                            onChange={(e) => handleDamageChange(dano.id, 'tipo', e.target.value)}
                            placeholder="Tipo"
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                          />
                          <select
                            value={dano.severidad}
                            onChange={(e) => handleDamageChange(dano.id, 'severidad', e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                          >
                            <option value="leve">Leve</option>
                            <option value="moderado">Moderado</option>
                            <option value="grave">Grave</option>
                          </select>
                          <input
                            type="number"
                            value={dano.costo}
                            onChange={(e) => handleDamageChange(dano.id, 'costo', parseFloat(e.target.value) || 0)}
                            placeholder="Costo"
                            step="0.01"
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{dano.descripcion}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{dano.tipo}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              getSeverityBadge(dano.severidad).color
                            }`}
                          >
                            {getSeverityBadge(dano.severidad).label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{formatCurrency(dano.costo)} USD</p>
                          <p className="text-sm font-semibold text-primary-500 dark:text-primary-300">{formatCurrency(convertUSDtoHNL(dano.costo), 'HNL')} HNL</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Nuevo Reporte */}
      <Modal
        isOpen={showAddReportModal}
        onClose={() => {
          setShowAddReportModal(false);
          setNewReport({ vehiculoId: '', clienteId: '', clienteName: '', danos: [] });
        }}
        title="➕ Nuevo Reporte de Daños"
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAddReportModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateReport}>
              Crear Reporte
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Seleccionar Vehículo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seleccionar Vehículo *
            </label>
            <select
              value={newReport.vehiculoId}
              onChange={(e) => setNewReport(prev => ({ ...prev, vehiculoId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">-- Seleccionar vehículo --</option>
              {mockVehiculos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} {v.year} - {v.plate}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre del Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              value={newReport.clienteName}
              onChange={(e) => setNewReport(prev => ({ ...prev, clienteName: e.target.value }))}
              placeholder="Ej: Juan Pérez"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Daños */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Daños Reportados *
              </label>
              <Button onClick={handleAddDamageToNewReport}>
                ➕ Agregar Daño
              </Button>
            </div>

            <div className="space-y-3">
              {newReport.danos.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  No hay daños agregados. Haz clic en "➕ Agregar Daño" para empezar
                </p>
              ) : (
                newReport.danos.map((dano, idx) => (
                  <div
                    key={dano.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-medium text-gray-700 dark:text-gray-300">Daño #{idx + 1}</p>
                      <button
                        onClick={() => handleRemoveDamageFromNewReport(dano.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        ✕ Eliminar
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={dano.descripcion}
                        onChange={(e) => handleNewDamageChange(dano.id, 'descripcion', e.target.value)}
                        placeholder="Descripción del daño"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={dano.tipo}
                          onChange={(e) => handleNewDamageChange(dano.id, 'tipo', e.target.value)}
                          placeholder="Tipo (Rayón, Golpe...)"
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                        <select
                          value={dano.severidad}
                          onChange={(e) => handleNewDamageChange(dano.id, 'severidad', e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                        >
                          <option value="leve">Leve</option>
                          <option value="moderado">Moderado</option>
                          <option value="grave">Grave</option>
                        </select>
                        <input
                          type="number"
                          value={dano.costo}
                          onChange={(e) => handleNewDamageChange(dano.id, 'costo', parseFloat(e.target.value) || 0)}
                          placeholder="Costo $"
                          step="0.01"
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Total Preview */}
          {newReport.danos.length > 0 && (
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Estimado:</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(newReport.danos.reduce((sum, d) => sum + d.costo, 0))} USD
                </p>
                <p className="text-lg font-semibold text-primary-500 dark:text-primary-300">
                  {formatCurrency(convertUSDtoHNL(newReport.danos.reduce((sum, d) => sum + d.costo, 0)), 'HNL')} HNL
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
