import React from 'react';
import { formatShortDate } from '@crm/utils/formatters';

const ClienteContratos: React.FC = () => {
  const contratos = [
    {
      id: 'ctr-001',
      vehiculo: 'Toyota Corolla (ABC-123)',
      startDate: '2024-09-24',
      endDate: '2024-09-26',
      status: 'active',
      terms: ['Seguro completo incluido', 'Kilometraje ilimitado', 'Asistencia en carretera 24/7']
    },
    {
      id: 'ctr-002',
      vehiculo: 'Honda CR-V (DEF-456)',
      startDate: '2024-10-01',
      endDate: '2024-10-05',
      status: 'completed',
      terms: ['Seguro básico', 'Kilometraje limitado 300km', 'GPS incluido']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Mis Contratos</h1>
        <p className="text-gray-600">Consulta tus contratos de alquiler</p>
      </div>

      <div className="space-y-4">
        {contratos.map((contrato) => (
          <div key={contrato.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{contrato.vehiculo}</h3>
                <p className="text-sm text-gray-500">Contrato #{contrato.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                contrato.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {contrato.status === 'active' ? 'Activo' : 'Completado'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-500">Fecha de inicio</p>
                <p className="font-semibold">{formatShortDate(contrato.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">Fecha de fin</p>
                <p className="font-semibold">{formatShortDate(contrato.endDate)}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Términos y Condiciones:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {contrato.terms.map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
              </ul>
            </div>

            <button className="btn-primary">
              Descargar Contrato PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClienteContratos;
