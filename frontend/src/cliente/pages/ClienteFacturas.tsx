import React from 'react';
import { mockFacturas } from '@crm/data/mockData';
import { formatShortDate, formatCurrency } from '@crm/utils/formatters';

const ClienteFacturas: React.FC = () => {
  const facturas = mockFacturas.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Mis Facturas</h1>
        <p className="text-gray-600">Consulta tus facturas y pagos</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Facturado</p>
          <p className="text-2xl font-bold text-gray-900">$2,850.00</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Pagado</p>
          <p className="text-2xl font-bold text-green-600">$1,600.00</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Pendiente</p>
          <p className="text-2xl font-bold text-yellow-600">$1,250.00</p>
        </div>
      </div>

      {/* Lista de Facturas */}
      <div className="space-y-4">
        {facturas.map((factura) => (
          <div key={factura.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Factura {factura.id}</h3>
                <p className="text-sm text-gray-500">Emitida: {formatShortDate(factura.issueDate)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                factura.status === 'paid' ? 'bg-green-100 text-green-700' :
                factura.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {factura.status === 'paid' ? 'Pagada' : 
                 factura.status === 'pending' ? 'Pendiente' : 'Vencida'}
              </span>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(factura.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IVA (16%):</span>
                <span className="font-medium">{formatCurrency(factura.tax)}</span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-primary-600">{formatCurrency(factura.total)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-primary">
                Descargar PDF
              </button>
              {factura.status === 'pending' && (
                <button className="btn-secondary">
                  Pagar Ahora
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClienteFacturas;
