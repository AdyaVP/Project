import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useForm } from '../hooks/useForm';
import { Card, Table, Button, Modal, Input, Select, SearchBar, Badge } from '../components/common';
import { mockVehiculos } from '../data/mockData';
import { Vehiculo } from '../types';
import { validateForm } from '../utils/validation';
import { formatCurrency, convertUSDtoHNL } from '../utils/formatters';

export const Vehiculos: React.FC = () => {
  const { currentUser } = useAuth();
  const { canCreate, canEdit } = usePermissions('vehiculos');
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(mockVehiculos);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Forzar recarga de datos actualizados
  useEffect(() => {
    setVehiculos(mockVehiculos);
    console.log('Vehículos cargados:', mockVehiculos.length);
  }, []);

  const { values, errors, handleChange, handleSubmit, resetForm, setFieldValue } = useForm<Partial<Vehiculo>>({
    initialValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      type: 'sedan',
      status: 'available',
      dailyRate: 0,
      features: [],
    },
    onSubmit: (formValues) => {
      if (editingVehiculo) {
        setVehiculos(prev =>
          prev.map(v => v.id === editingVehiculo.id ? { ...v, ...formValues } : v)
        );
      } else {
        const newVehiculo: Vehiculo = {
          id: `veh-${Date.now()}`,
          brand: formValues.brand!,
          model: formValues.model!,
          year: Number(formValues.year!),
          plate: formValues.plate!.toUpperCase(),
          type: formValues.type as any,
          status: formValues.status as any,
          dailyRate: Number(formValues.dailyRate!),
          features: formValues.features || [],
          createdAt: new Date().toISOString().split('T')[0],
        };
        setVehiculos(prev => [...prev, newVehiculo]);
      }
      setShowModal(false);
      resetForm();
      setEditingVehiculo(null);
    },
    validate: (values) => {
      const validation = validateForm({
        brand: { value: values.brand, rules: { required: true } },
        model: { value: values.model, rules: { required: true } },
        year: { value: values.year, rules: { required: true } },
        plate: { value: values.plate, rules: { required: true, minLength: 5 } },
        dailyRate: { value: values.dailyRate, rules: { required: true, positive: true } },
      });
      return validation.errors;
    },
  });

  const openCreateModal = () => {
    resetForm();
    setEditingVehiculo(null);
    setShowModal(true);
  };

  const openEditModal = (vehiculo: Vehiculo) => {
    setEditingVehiculo(vehiculo);
    setFieldValue('brand', vehiculo.brand);
    setFieldValue('model', vehiculo.model);
    setFieldValue('year', vehiculo.year);
    setFieldValue('plate', vehiculo.plate);
    setFieldValue('type', vehiculo.type);
    setFieldValue('status', vehiculo.status);
    setFieldValue('dailyRate', vehiculo.dailyRate);
    setFieldValue('features', vehiculo.features || []);
    setPreviewImage(vehiculo.image || null);
    setShowModal(true);
  };

  const openDetailsModal = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setShowDetailsModal(true);
  };

  // Manejar drag & drop de imágenes
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageFile(files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleImageFile(files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    // Validar tamaño máximo de 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }
    
    if (file.size > maxSize) {
      alert(`La imagen es demasiado grande. Tamaño máximo: 10MB\nTamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      // En producción aquí subirías la imagen al backend
      alert(`✅ Imagen cargada correctamente\n📦 Tamaño: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    };
    reader.readAsDataURL(file);
  };

  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter(vehiculo => {
      const matchesSearch = vehiculo.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehiculo.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehiculo.plate.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || vehiculo.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [vehiculos, searchQuery, filterStatus]);

  const canViewRates = currentUser?.role !== 'OPERADOR'; // Operador NO ve tarifas

  const columns = [
    {
      key: 'vehicle',
      label: 'Vehículo',
      render: (vehiculo: Vehiculo) => (
        <div className="flex items-center gap-4">
          {/* Imagen del vehículo */}
          <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
            {vehiculo.image ? (
              <img 
                src={vehiculo.image} 
                alt={`${vehiculo.brand} ${vehiculo.model}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x100?text=No+Image';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                🚗
              </div>
            )}
          </div>
          {/* Información del vehículo */}
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{vehiculo.brand} {vehiculo.model}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{vehiculo.plate}</p>
          </div>
        </div>
      ),
    },
    { key: 'year', label: 'Año' },
    {
      key: 'type',
      label: 'Tipo',
      render: (vehiculo: Vehiculo) => (
        <span className="capitalize">{vehiculo.type}</span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (vehiculo: Vehiculo) => {
        const statusConfig = {
          available: { variant: 'success' as const, label: 'Disponible' },
          reserved: { variant: 'warning' as const, label: 'Reservado' },
          rented: { variant: 'info' as const, label: 'Rentado' },
          maintenance: { variant: 'danger' as const, label: 'Mantenimiento' },
        };
        const config = statusConfig[vehiculo.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    ...(canViewRates ? [{
      key: 'dailyRate',
      label: 'Tarifa Diaria',
      render: (vehiculo: Vehiculo) => (
        <div className="text-sm">
          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(vehiculo.dailyRate)} USD</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(convertUSDtoHNL(vehiculo.dailyRate), 'HNL')} HNL</p>
        </div>
      ),
    }] : []),
    {
      key: 'actions',
      label: 'Acciones',
      render: (vehiculo: Vehiculo) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(vehiculo);
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Editar
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDetailsModal(vehiculo);
            }}
            className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium"
          >
            Ver detalles
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Vehículos</h1>
          <p className="text-gray-600">Gestión de flota de vehículos</p>
        </div>
        {canCreate && (
          <Button onClick={openCreateModal} icon="➕">
            Nuevo Vehículo
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['available', 'reserved', 'rented', 'maintenance'].map(status => {
          const count = vehiculos.filter(v => v.status === status).length;
          const statusLabels = {
            available: { label: 'Disponibles', icon: '✅', color: 'bg-green-100 text-green-700' },
            reserved: { label: 'Reservados', icon: '⏳', color: 'bg-yellow-100 text-yellow-700' },
            rented: { label: 'Rentados', icon: '🚗', color: 'bg-blue-100 text-blue-700' },
            maintenance: { label: 'Mantenimiento', icon: '🔧', color: 'bg-red-100 text-red-700' },
          };
          const config = statusLabels[status as keyof typeof statusLabels];
          return (
            <Card key={status}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center text-xl`}>
                  {config.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por marca, modelo o placa..."
            className="flex-1"
          />
          <Select
            name="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'available', label: 'Disponibles' },
              { value: 'reserved', label: 'Reservados' },
              { value: 'rented', label: 'Rentados' },
              { value: 'maintenance', label: 'Mantenimiento' },
            ]}
            className="w-48"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          data={filteredVehiculos}
          columns={columns}
          emptyMessage="No se encontraron vehículos"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
          setEditingVehiculo(null);
        }}
        title={editingVehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { handleSubmit({ preventDefault: () => {} } as any); }}>
              {editingVehiculo ? 'Guardar Cambios' : 'Crear Vehículo'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="brand"
              label="Marca"
              value={values.brand || ''}
              onChange={handleChange}
              error={errors.brand}
              required
              placeholder="Ej: Toyota"
            />
            <Input
              name="model"
              label="Modelo"
              value={values.model || ''}
              onChange={handleChange}
              error={errors.model}
              required
              placeholder="Ej: Corolla"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="year"
              label="Año"
              type="number"
              value={values.year || ''}
              onChange={handleChange}
              error={errors.year}
              required
              min={2000}
              max={new Date().getFullYear() + 1}
            />
            <Input
              name="plate"
              label="Placa"
              value={values.plate || ''}
              onChange={handleChange}
              error={errors.plate}
              required
              placeholder="ABC123"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              name="type"
              label="Tipo"
              value={values.type || 'sedan'}
              onChange={handleChange}
              options={[
                { value: 'sedan', label: 'Sedán' },
                { value: 'suv', label: 'SUV' },
                { value: 'truck', label: 'Camioneta' },
                { value: 'van', label: 'Van' },
              ]}
            />
            <Select
              name="status"
              label="Estado"
              value={values.status || 'available'}
              onChange={handleChange}
              options={[
                { value: 'available', label: 'Disponible' },
                { value: 'reserved', label: 'Reservado' },
                { value: 'rented', label: 'Rentado' },
                { value: 'maintenance', label: 'Mantenimiento' },
              ]}
            />
          </div>
          <Input
            name="dailyRate"
            label="Tarifa Diaria (USD)"
            type="number"
            value={values.dailyRate || ''}
            onChange={handleChange}
            error={errors.dailyRate}
            required
            min={0}
            step={0.01}
            placeholder="45.00"
          />
          
          {/* Campo de imagen con drag & drop y URL */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Imagen del Vehículo
            </label>
            
            {/* Drag & Drop área */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('vehicle-image')?.click()}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="vehicle-image"
                onChange={handleImageChange}
              />
              {previewImage ? (
                <div className="space-y-2">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="mx-auto h-32 w-auto rounded-lg object-contain"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Haz clic o arrastra otra imagen para cambiar
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl">{isDragging ? '📥' : '📷'}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium">
                      {isDragging ? 'Suelta la imagen aquí' : 'Haz clic o arrastra una imagen'}
                    </p>
                    <p className="text-xs mt-1">Formatos: JPG, PNG, GIF, WebP. Máx: 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Campo de URL */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                🔗
              </div>
              <input
                type="url"
                placeholder="O pega la URL de la imagen aquí..."
                className="w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    const url = input.value.trim();
                    if (url) {
                      setPreviewImage(url);
                      input.value = '';
                    }
                  }
                }}
                id="image-url-input"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('image-url-input') as HTMLInputElement;
                  const url = input.value.trim();
                  if (url) {
                    setPreviewImage(url);
                    input.value = '';
                  }
                }}
                className="absolute inset-y-0 right-0 px-3 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
              >
                Aplicar
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Puedes subir un archivo (máx. 10MB), arrastrar una imagen o pegar una URL
            </p>
          </div>

          {/* Características */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Características del Vehículo
            </label>
            
            {/* Características predefinidas */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'Aire acondicionado', label: 'Aire acondicionado' },
                { value: 'GPS', label: 'GPS' },
                { value: 'Bluetooth', label: 'Bluetooth' },
                { value: 'Cámara trasera', label: 'Cámara trasera' },
                { value: '4x4', label: '4x4' },
                { value: 'Asientos de cuero', label: 'Asientos de cuero' },
                { value: 'USB', label: 'Puerto USB' },
                { value: 'Control de crucero', label: 'Control de crucero' },
              ].map(feature => (
                <label key={feature.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={values.features?.includes(feature.value) || false}
                    onChange={(e) => {
                      const currentFeatures = values.features || [];
                      if (e.target.checked) {
                        setFieldValue('features', [...currentFeatures, feature.value]);
                      } else {
                        setFieldValue('features', currentFeatures.filter(f => f !== feature.value));
                      }
                    }}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature.label}</span>
                </label>
              ))}
            </div>

            {/* Agregar característica personalizada */}
            <div className="border-t dark:border-gray-700 pt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Agregar característica personalizada..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !(values.features || []).includes(value)) {
                        setFieldValue('features', [...(values.features || []), value]);
                        input.value = '';
                      }
                    }
                  }}
                  id="custom-feature-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('custom-feature-input') as HTMLInputElement;
                    const value = input.value.trim();
                    if (value && !(values.features || []).includes(value)) {
                      setFieldValue('features', [...(values.features || []), value]);
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Características seleccionadas */}
            {(values.features && values.features.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {values.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => {
                        setFieldValue('features', values.features?.filter((_, i) => i !== idx));
                      }}
                      className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Modal de Detalles del Vehículo */}
      {selectedVehiculo && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedVehiculo(null);
          }}
          title={`🚗 ${selectedVehiculo.brand} ${selectedVehiculo.model}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Imagen del vehículo */}
            {selectedVehiculo.image && (
              <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img 
                  src={selectedVehiculo.image} 
                  alt={`${selectedVehiculo.brand} ${selectedVehiculo.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Marca</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedVehiculo.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Modelo</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedVehiculo.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Año</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedVehiculo.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Placa</p>
                <p className="font-semibold text-gray-900 dark:text-white font-mono">{selectedVehiculo.plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tipo</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">{selectedVehiculo.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                <div className="mt-1">
                  {(() => {
                    const statusConfig = {
                      available: { variant: 'success' as const, label: 'Disponible' },
                      reserved: { variant: 'warning' as const, label: 'Reservado' },
                      rented: { variant: 'info' as const, label: 'Rentado' },
                      maintenance: { variant: 'danger' as const, label: 'Mantenimiento' },
                    };
                    const config = statusConfig[selectedVehiculo.status];
                    return <Badge variant={config.variant}>{config.label}</Badge>;
                  })()}
                </div>
              </div>
            </div>

            {/* Tarifa */}
            {canViewRates && (
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tarifa Diaria</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(selectedVehiculo.dailyRate)} USD
                </p>
                <p className="text-lg font-semibold text-primary-500 dark:text-primary-300">
                  {formatCurrency(convertUSDtoHNL(selectedVehiculo.dailyRate), 'HNL')} HNL
                </p>
              </div>
            )}

            {/* Características */}
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Características</p>
              <div className="flex flex-wrap gap-2">
                {selectedVehiculo.features.map((feature, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Fecha de registro */}
            <div className="pt-4 border-t dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Registrado el: {new Date(selectedVehiculo.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
