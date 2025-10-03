import React, { useRef } from 'react';
import { Factura } from '../../types';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface FacturaPDFProps {
  factura: Factura & {
    rfc?: string;
    direccion?: string;
    ciudad?: string;
    telefono?: string;
    conceptos?: Array<{
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      total: number;
    }>;
    observaciones?: string;
    formaPago?: string;
    metodoPago?: string;
  };
  onClose: () => void;
}

export const FacturaPDF: React.FC<FacturaPDFProps> = ({ factura, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    const element = contentRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`factura-${factura.id}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header con botones */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900">Vista Previa - Factura {factura.id}</h2>
          <div className="flex gap-2">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              📄 Descargar PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Contenido de la factura */}
        <div ref={contentRef} className="p-8 bg-white">
          {/* Header de la factura */}
          <div className="border-b-4 border-primary-600 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">FACTURA</h1>
                <p className="text-lg text-gray-600">Alpha Car Rental</p>
                <p className="text-sm text-gray-500">RFC: ACR123456789</p>
                <p className="text-sm text-gray-500">Av. Principal #123, Ciudad</p>
                <p className="text-sm text-gray-500">Tel: (555) 123-4567</p>
              </div>
              <div className="text-right">
                <div className="bg-primary-100 px-4 py-2 rounded-lg mb-2">
                  <p className="text-sm text-gray-600">Folio</p>
                  <p className="text-xl font-bold text-primary-600">{factura.id}</p>
                </div>
                <p className="text-sm text-gray-600">Fecha: {formatShortDate(factura.issueDate)}</p>
                <p className="text-sm text-gray-600">Vencimiento: {formatShortDate(factura.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">CLIENTE</h3>
            <p className="font-medium text-gray-900">{factura.clienteName}</p>
            {factura.rfc && <p className="text-sm text-gray-600">RFC: {factura.rfc}</p>}
            {factura.direccion && <p className="text-sm text-gray-600">{factura.direccion}</p>}
            {factura.ciudad && <p className="text-sm text-gray-600">{factura.ciudad}</p>}
            {factura.telefono && <p className="text-sm text-gray-600">Tel: {factura.telefono}</p>}
          </div>

          {/* Conceptos */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Concepto</th>
                  <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">Cant.</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-700">P. Unitario</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {factura.conceptos && factura.conceptos.length > 0 ? (
                  factura.conceptos.map((concepto, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{concepto.descripcion}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">{concepto.cantidad}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right text-sm">{formatCurrency(concepto.precioUnitario)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">{formatCurrency(concepto.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm">Servicio de renta de vehículo</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-sm">1</td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-sm">{formatCurrency(factura.amount)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">{formatCurrency(factura.amount)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(factura.amount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">IVA (16%):</span>
                <span className="font-medium">{formatCurrency(factura.tax)}</span>
              </div>
              <div className="flex justify-between py-3 bg-primary-50 px-3 rounded-lg mt-2">
                <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(factura.total)}</span>
              </div>
            </div>
          </div>

          {/* Información de pago */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">INFORMACIÓN DE PAGO</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Forma de Pago:</p>
                <p className="font-medium">{factura.formaPago || 'Efectivo / Transferencia'}</p>
              </div>
              <div>
                <p className="text-gray-600">Método de Pago:</p>
                <p className="font-medium">{factura.metodoPago || 'PUE - Pago en una sola exhibición'}</p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {factura.observaciones && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">OBSERVACIONES</h3>
              <p className="text-sm text-gray-600">{factura.observaciones}</p>
            </div>
          )}

          {/* Estado */}
          <div className="text-center pt-6 border-t">
            <div className="inline-block">
              {factura.status === 'paid' && (
                <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold text-lg">
                  ✓ PAGADA
                </div>
              )}
              {factura.status === 'pending' && (
                <div className="bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full font-bold text-lg">
                  ⏱ PENDIENTE DE PAGO
                </div>
              )}
              {factura.status === 'overdue' && (
                <div className="bg-red-100 text-red-800 px-6 py-2 rounded-full font-bold text-lg">
                  ⚠ VENCIDA
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
            <p>Gracias por su preferencia</p>
            <p>Alpha Car Rental - Sistema de Gestión</p>
          </div>
        </div>
      </div>
    </div>
  );
};
