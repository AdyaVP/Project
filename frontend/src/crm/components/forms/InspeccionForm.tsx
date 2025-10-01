import React, { useState } from 'react';
import { Inspeccion, Dano } from '../../types';
import { Input, Button, Card } from '../common';

interface InspeccionFormProps {
  reservaId: string;
  vehiculoId: string;
  tipo: 'entrega' | 'devolucion';
  inspeccionPrevia?: Inspeccion; // Para comparar en devolución
  onSubmit: (inspeccion: Partial<Inspeccion>) => void;
  onCancel: () => void;
}

export const InspeccionForm: React.FC<InspeccionFormProps> = ({
  reservaId,
  vehiculoId,
  tipo,
  inspeccionPrevia,
  onSubmit,
  onCancel,
}) => {
  const [kilometraje, setKilometraje] = useState(inspeccionPrevia?.kilometraje || 0);
  const [nivelCombustible, setNivelCombustible] = useState(inspeccionPrevia?.nivelCombustible || 100);
  const [observaciones, setObservaciones] = useState('');
  const [danos, setDanos] = useState<Dano[]>([]);
  const [showDanoForm, setShowDanoForm] = useState(false);

  // Formulario de daño
  const [nuevoDano, setNuevoDano] = useState<Partial<Dano>>({
    tipo: 'rayadura',
    gravedad: 'leve',
  });

  const agregarDano = () => {
    if (!nuevoDano.ubicacion || !nuevoDano.descripcion) return;

    const dano: Dano = {
      id: `dano-${Date.now()}`,
      tipo: nuevoDano.tipo as any,
      ubicacion: nuevoDano.ubicacion,
      descripcion: nuevoDano.descripcion,
      gravedad: nuevoDano.gravedad as any,
      costoEstimado: nuevoDano.costoEstimado,
    };

    setDanos([...danos, dano]);
    setNuevoDano({ tipo: 'rayadura', gravedad: 'leve' });
    setShowDanoForm(false);
  };

  const eliminarDano = (id: string) => {
    setDanos(danos.filter(d => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inspeccion: Partial<Inspeccion> = {
      reservaId,
      vehiculoId,
      tipo,
      fecha: new Date().toISOString(),
      kilometraje,
      nivelCombustible,
      danos,
      observaciones,
      inspeccionadoPor: 'current-user', // TODO: obtener del contexto
    };

    onSubmit(inspeccion);
  };

  const totalCostosDanos = danos.reduce((sum, d) => sum + (d.costoEstimado || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Inspección de {tipo === 'entrega' ? 'Entrega' : 'Devolución'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="kilometraje"
            label="Kilometraje Actual"
            type="number"
            value={kilometraje}
            onChange={(e) => setKilometraje(Number(e.target.value))}
            required
            min={0}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nivel de Combustible: {nivelCombustible}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={nivelCombustible}
              onChange={(e) => setNivelCombustible(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Vacío</span>
              <span>1/4</span>
              <span>1/2</span>
              <span>3/4</span>
              <span>Lleno</span>
            </div>
          </div>
        </div>

        {/* Comparación con inspección previa (solo en devolución) */}
        {tipo === 'devolucion' && inspeccionPrevia && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              📊 Comparación con Entrega
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Kilometraje inicial:</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {inspeccionPrevia.kilometraje.toLocaleString()} km
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Kilometraje actual:</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {kilometraje.toLocaleString()} km
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Recorrido:</p>
                <p className="font-semibold text-primary-600 dark:text-primary-400">
                  {(kilometraje - inspeccionPrevia.kilometraje).toLocaleString()} km
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Combustible:</p>
                <p className={`font-semibold ${nivelCombustible >= inspeccionPrevia.nivelCombustible ? 'text-success' : 'text-warning'}`}>
                  {inspeccionPrevia.nivelCombustible}% → {nivelCombustible}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Observaciones Generales
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Observaciones adicionales..."
          />
        </div>
      </Card>

      {/* Registro de Daños */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Daños Detectados ({danos.length})
            </h3>
            {totalCostosDanos > 0 && (
              <p className="text-sm text-danger">
                Costo estimado total: ${totalCostosDanos.toLocaleString()}
              </p>
            )}
          </div>
          <Button
            type="button"
            onClick={() => setShowDanoForm(true)}
            variant="secondary"
            icon="➕"
          >
            Agregar Daño
          </Button>
        </div>

        {/* Daños previos (solo lectura en devolución) */}
        {tipo === 'devolucion' && inspeccionPrevia && inspeccionPrevia.danos.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ⚠️ Daños Preexistentes (Inspección de Entrega)
            </h4>
            <div className="space-y-2">
              {inspeccionPrevia.danos.map((dano) => (
                <div key={dano.id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span className="capitalize">{dano.tipo}</span> - {dano.ubicacion}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de daños nuevos */}
        {danos.length > 0 ? (
          <div className="space-y-3">
            {danos.map((dano) => (
              <div key={dano.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-danger-light dark:bg-danger/20 text-danger-dark dark:text-danger-light text-xs font-medium rounded">
                        {dano.tipo}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        dano.gravedad === 'leve' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                        dano.gravedad === 'moderado' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' :
                        'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      }`}>
                        {dano.gravedad}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{dano.ubicacion}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{dano.descripcion}</p>
                    {dano.costoEstimado && (
                      <p className="text-sm font-semibold text-danger mt-2">
                        Costo estimado: ${dano.costoEstimado.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarDano(dano.id)}
                    className="text-danger hover:text-danger-dark"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            {tipo === 'entrega' ? '✓ Sin daños detectados' : 'No se han registrado nuevos daños'}
          </p>
        )}

        {/* Formulario de nuevo daño */}
        {showDanoForm && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-primary-300 dark:border-primary-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Registrar Nuevo Daño</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Daño *
                </label>
                <select
                  value={nuevoDano.tipo}
                  onChange={(e) => setNuevoDano({...nuevoDano, tipo: e.target.value as any})}
                  className="input-field"
                >
                  <option value="rayadura">Rayadura</option>
                  <option value="abolladura">Abolladura</option>
                  <option value="rotura">Rotura</option>
                  <option value="faltante">Faltante</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gravedad *
                </label>
                <select
                  value={nuevoDano.gravedad}
                  onChange={(e) => setNuevoDano({...nuevoDano, gravedad: e.target.value as any})}
                  className="input-field"
                >
                  <option value="leve">Leve</option>
                  <option value="moderado">Moderado</option>
                  <option value="grave">Grave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ubicación *
                </label>
                <input
                  type="text"
                  value={nuevoDano.ubicacion || ''}
                  onChange={(e) => setNuevoDano({...nuevoDano, ubicacion: e.target.value})}
                  className="input-field"
                  placeholder="Ej: Puerta delantera izquierda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Costo Estimado (USD)
                </label>
                <input
                  type="number"
                  value={nuevoDano.costoEstimado || ''}
                  onChange={(e) => setNuevoDano({...nuevoDano, costoEstimado: Number(e.target.value)})}
                  className="input-field"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción *
                </label>
                <textarea
                  value={nuevoDano.descripcion || ''}
                  onChange={(e) => setNuevoDano({...nuevoDano, descripcion: e.target.value})}
                  rows={2}
                  className="input-field"
                  placeholder="Describe el daño detalladamente..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button type="button" onClick={agregarDano}>
                Agregar Daño
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowDanoForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Completar Inspección
        </Button>
      </div>
    </form>
  );
};
