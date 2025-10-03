import React, { useState } from 'react';
import { Anticipo } from '../../types';
import { Input, Select, Button, Card } from '../common';

interface AnticipoFormProps {
  reservaId: string;
  clienteName: string;
  totalReserva: number;
  onSubmit: (anticipo: Partial<Anticipo>) => void;
  onCancel: () => void;
}

export const AnticipoForm: React.FC<AnticipoFormProps> = ({
  reservaId,
  clienteName,
  totalReserva,
  onSubmit,
  onCancel,
}) => {
  const [monto, setMonto] = useState(totalReserva * 0.3); // 30% por defecto
  const [concepto, setConcepto] = useState<'deposito' | 'anticipo'>('deposito');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [notas, setNotas] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (monto <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    if (monto > totalReserva) {
      alert('El anticipo no puede ser mayor al total de la reserva');
      return;
    }

    const anticipo: Partial<Anticipo> = {
      reservaId,
      monto,
      fecha: new Date().toISOString(),
      concepto,
      metodoPago,
      recibidoPor: 'current-user', // Obtener del contexto de usuario
      notas,
    };

    onSubmit(anticipo);
  };

  const porcentaje = ((monto / totalReserva) * 100).toFixed(1);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Registrar Anticipo/Depósito
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cliente: <span className="font-semibold">{clienteName}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total de la reserva: <span className="font-semibold">${totalReserva.toLocaleString()}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              name="monto"
              label="Monto del Anticipo/Depósito (USD)"
              type="number"
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              required
              min={1}
              step="0.01"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {porcentaje}% del total de la reserva
            </p>
          </div>

          <Select
            name="concepto"
            label="Concepto"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value as any)}
            options={[
              { value: 'deposito', label: 'Depósito de Garantía' },
              { value: 'anticipo', label: 'Anticipo de Renta' },
            ]}
            required
          />

          <Select
            name="metodoPago"
            label="Método de Pago"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value as any)}
            options={[
              { value: 'efectivo', label: 'Efectivo' },
              { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
              { value: 'transferencia', label: 'Transferencia Bancaria' },
            ]}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha
            </label>
            <input
              type="text"
              value={new Date().toLocaleDateString('es-MX')}
              disabled
              className="input-field bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas Adicionales (Opcional)
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Observaciones sobre el pago..."
          />
        </div>

        {/* Resumen */}
        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
            📋 Resumen del Anticipo
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Concepto:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {concepto === 'deposito' ? 'Depósito de Garantía' : 'Anticipo de Renta'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Monto:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                ${monto.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Método:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {metodoPago === 'efectivo' ? 'Efectivo' : 
                 metodoPago === 'tarjeta' ? 'Tarjeta' : 'Transferencia'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-primary-200 dark:border-primary-800">
              <span className="text-gray-600 dark:text-gray-400">Saldo Pendiente:</span>
              <span className="font-bold text-primary-600 dark:text-primary-400">
                ${(totalReserva - monto).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Nota:</strong> Este anticipo NO genera factura. 
            Se registrará como pago adelantado y se restará del total al momento de la facturación final.
          </p>
        </div>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Registrar Anticipo
        </Button>
      </div>
    </form>
  );
};
