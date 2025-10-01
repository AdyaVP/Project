import React from 'react';
import { mockReservas } from '@crm/data/mockData';
import { formatShortDate, formatCurrency } from '@crm/utils/formatters';

const ClienteReservas: React.FC = () => {
  // En producción, filtrar por currentUser.id
  const reservas = mockReservas.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Mis Reservas</h1>
        <p className="text-gray-600">Consulta el historial de tus reservas</p>
      </div>

      <div className="space-y-4">
        {reservas.map((reserva) => (
          <div key={reserva.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{reserva.vehiculoInfo}</h3>
                <p className="text-sm text-gray-500">ID: {reserva.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                reserva.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                reserva.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {reserva.status === 'confirmed' ? 'Confirmada' : 
                 reserva.status === 'pending' ? 'Pendiente' : 'Completada'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Fecha de inicio</p>
                <p className="font-semibold">{formatShortDate(reserva.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">Fecha de fin</p>
                <p className="font-semibold">{formatShortDate(reserva.endDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-semibold text-primary-600">{formatCurrency(reserva.totalAmount)}</p>
              </div>
            </div>
            {reserva.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600"><strong>Notas:</strong> {reserva.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClienteReservas;
