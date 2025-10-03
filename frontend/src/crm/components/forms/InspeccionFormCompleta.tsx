import React, { useState, useRef } from 'react';
import { Inspeccion, ChecklistInterior, ChecklistExterior, Vehiculo } from '../../types';
import { Button, Card } from '../common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InspeccionFormCompletaProps {
  reservaId: string;
  vehiculo: Vehiculo;
  tipo: 'entrega' | 'devolucion';
  inspeccionPrevia?: Inspeccion;
  onSubmit: (inspeccion: Partial<Inspeccion>) => void;
  onCancel: () => void;
}

export const InspeccionFormCompleta: React.FC<InspeccionFormCompletaProps> = ({
  reservaId,
  vehiculo,
  tipo,
  inspeccionPrevia,
  onSubmit,
  onCancel,
}) => {
  const [unidad, setUnidad] = useState('');
  const [kilometraje, setKilometraje] = useState(inspeccionPrevia?.kilometraje || '');
  const [kilometrajeSalida, setKilometrajeSalida] = useState('');
  const [hora, setHora] = useState(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
  const [observaciones, setObservaciones] = useState('');
  
  // Checklist Interior
  const [checklistInterior, setChecklistInterior] = useState<ChecklistInterior>({
    marcadorCombustible: false,
    encendedor: false,
    radioDiscos: false,
    radioCassette: false,
    radio: false,
    alfombrasPiso: false,
    tacometro: false,
    luzAdvertencia: false,
    vidriosManuales: false,
    botonEncendido: false,
    botonPuerta: false,
  });

  // Checklist Exterior
  const [checklistExterior, setChecklistExterior] = useState<ChecklistExterior>({
    antena: false,
    copas: false,
    retrovisores: false,
    emblemas: false,
    taponGasolina: false,
    tapasBatea: false,
    llantaRepuesto: false,
    llantaMantenera: false,
    llantaPasax: false,
    puertaElevatriz: false,
    frenoMano: false,
  });

  const [danosVisuales] = useState({
    ladoConductor: [] as string[],
    ladoPasajero: [] as string[],
    frente: [] as string[],
    atras: [] as string[],
    parabrisas: [] as string[],
  });

  // Estados para firmas digitales
  const canvasRefCliente = useRef<HTMLCanvasElement>(null);
  const canvasRefRepresentante = useRef<HTMLCanvasElement>(null);
  const [isDrawingCliente, setIsDrawingCliente] = useState(false);
  const [isDrawingRepresentante, setIsDrawingRepresentante] = useState(false);
  const [firmaCliente, setFirmaCliente] = useState<string>('');
  const [firmaRepresentante, setFirmaRepresentante] = useState<string>('');

  // Funciones para firma del cliente
  const startDrawingCliente = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawingCliente(true);
    const canvas = canvasRefCliente.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawCliente = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingCliente) return;
    const canvas = canvasRefCliente.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingCliente = () => {
    setIsDrawingCliente(false);
    const canvas = canvasRefCliente.current;
    if (canvas) setFirmaCliente(canvas.toDataURL());
  };

  const clearSignatureCliente = () => {
    const canvas = canvasRefCliente.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFirmaCliente('');
  };

  // Funciones para firma del representante
  const startDrawingRepresentante = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawingRepresentante(true);
    const canvas = canvasRefRepresentante.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawRepresentante = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRepresentante) return;
    const canvas = canvasRefRepresentante.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingRepresentante = () => {
    setIsDrawingRepresentante(false);
    const canvas = canvasRefRepresentante.current;
    if (canvas) setFirmaRepresentante(canvas.toDataURL());
  };

  const clearSignatureRepresentante = () => {
    const canvas = canvasRefRepresentante.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFirmaRepresentante('');
  };

  // Función para convertir imagen a base64
  const getImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('No se pudo obtener el contexto del canvas');
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  // Función para descargar PDF
  const downloadPDF = async () => {
    const element = document.getElementById('inspeccion-form-content');
    if (!element) return;

    try {
      // Convertir la imagen Car.png a base64 primero
      let carImageBase64 = '';
      try {
        carImageBase64 = await getImageAsBase64('/Car.png');
      } catch (error) {
        console.warn('No se pudo cargar la imagen Car.png:', error);
      }

      // Reemplazar temporalmente la imagen con la versión base64
      const imgElement = element.querySelector('img[src="/Car.png"]') as HTMLImageElement;
      const originalSrc = imgElement?.src;
      if (imgElement && carImageBase64) {
        imgElement.src = carImageBase64;
      }

      // Esperar un momento para que se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Mejorar la renderización del documento clonado
          const clonedImg = clonedDoc.querySelector('img[src*="data:image"]') as HTMLImageElement;
          if (clonedImg && carImageBase64) {
            clonedImg.src = carImageBase64;
            clonedImg.style.maxWidth = '100%';
            clonedImg.style.height = 'auto';
          }
          
          // Mejorar estilos para PDF
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * { 
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body { 
              background: white !important;
              font-family: Arial, sans-serif !important;
            }
            .border-gray-800 { 
              border-color: #000 !important; 
              border-width: 2px !important;
            }
            canvas {
              background: white !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      // Restaurar la imagen original
      if (imgElement && originalSrc) {
        imgElement.src = originalSrc;
      }
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`inspeccion-${reservaId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, intente de nuevo.');
    }
  };

  const handleChecklistInteriorChange = (campo: keyof ChecklistInterior) => {
    setChecklistInterior(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  const handleChecklistExteriorChange = (campo: keyof ChecklistExterior) => {
    setChecklistExterior(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inspeccion: Partial<Inspeccion> = {
      reservaId,
      vehiculoId: vehiculo.id,
      vehiculoMarca: vehiculo.brand,
      vehiculoModelo: vehiculo.model,
      vehiculoPlaca: vehiculo.plate,
      unidad,
      tipo,
      fecha: new Date().toISOString().split('T')[0],
      hora,
      kilometraje: kilometraje ? Number(kilometraje) : 0,
      nivelCombustible: 100,
      checklistInterior,
      checklistExterior,
      danos: [],
      danosVisuales,
      observaciones,
      inspeccionadoPor: 'current-user',
      firmaCliente,
      firmaRepresentante,
    };

    onSubmit(inspeccion);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto">
      {/* Número de Pre-reserva */}
      <div className="bg-primary-600 text-white p-4 rounded-lg text-center">
        <h2 className="text-2xl font-bold">
          Pre-Reserva No. {reservaId}
        </h2>
      </div>

      {/* Botón de descarga PDF */}
      <div className="flex justify-end gap-2 mb-4">
        <Button 
          type="button" 
          onClick={downloadPDF} 
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={!firmaCliente || !firmaRepresentante}
        >
          📄 Descargar PDF
        </Button>
      </div>
      
      {(!firmaCliente || !firmaRepresentante) && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">⚠️ Atención</p>
          <p>Complete ambas firmas antes de descargar el PDF.</p>
        </div>
      )}

      {/* Contenido para PDF */}
      <div id="inspeccion-form-content">
        {/* Header con información del contacto */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
          <p className="text-center font-bold text-lg text-gray-900 dark:text-white">
            CEL: 3174-4269 / 3174-4717
          </p>
        </div>

      {/* Información del Vehículo */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <table className="w-full border-collapse border-2 border-gray-800 dark:border-gray-300">
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2 font-bold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                    MARCA Y MODELO
                  </td>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2 text-gray-900 dark:text-white">
                    {vehiculo.brand} {vehiculo.model}
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2 font-bold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                    UNIDAD <span className="text-xs font-normal">(UNIT)</span>
                  </td>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2">
                    <input
                      type="text"
                      value={unidad}
                      onChange={(e) => setUnidad(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                      placeholder="Número de unidad"
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2 font-bold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                    PLACA N° <span className="text-xs font-normal">(PLATE)</span>
                  </td>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2 text-gray-900 dark:text-white">
                    {vehiculo.plate}
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2 font-bold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                    KM ENTRADA
                  </td>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-medium">KM</span>
                      <input
                        type="text"
                        value={kilometraje || ''}
                        onChange={(e) => setKilometraje(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                        placeholder="0000"
                        required
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2 font-bold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                    KM SALIDA
                  </td>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-medium">KM</span>
                      <input
                        type="text"
                        value={kilometrajeSalida}
                        onChange={(e) => setKilometrajeSalida(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                        placeholder="0000"
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2 font-bold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                    DAY AND A HOUR
                  </td>
                  <td className="border-2 border-gray-800 dark:border-gray-300 px-3 py-2">
                    <input
                      type="time"
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                      required
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div className="border-2 border-gray-800 dark:border-gray-300 h-full">
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 border-b-2 border-gray-800 dark:border-gray-300">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  OBSERVACIONES <span className="text-xs font-normal">(OBSERVATIONS)</span>
                </h3>
              </div>
              <div className="p-3">
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={8}
                  className="w-full bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-white"
                  placeholder="Escriba observaciones aquí..."
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Checklists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* INTERIOR */}
        <Card>
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">INTERIOR</h2>
          <div className="border-2 border-gray-800 dark:border-gray-300 rounded-lg p-4">
            <div className="space-y-2">
              {[
                { key: 'marcadorCombustible', label: 'MARCADOR COMBUSTIBLE', sublabel: '(FUEL MAPPER)' },
                { key: 'encendedor', label: 'ENCENDEDOR', sublabel: '(ARHTRAV)' },
                { key: 'radioDiscos', label: 'RADIO DISCOS', sublabel: '(CD)' },
                { key: 'radioCassette', label: 'RADIO DISCOS COMPACTOS', sublabel: 'RADIO (CASSETTE)' },
                { key: 'radio', label: 'RADIO', sublabel: '(RADIO)' },
                { key: 'alfombrasPiso', label: 'ALFOMBRAS PISO/OR', sublabel: '(MATS)' },
                { key: 'tacometro', label: 'TACOMETRO', sublabel: '(DREC EAON RPM)' },
                { key: 'luzAdvertencia', label: 'LUZ DE ADVERTENCIA', sublabel: '' },
                { key: 'vidriosManuales', label: 'VIDRIOS MANUALES', sublabel: '(EE)' },
                { key: 'botonEncendido', label: 'BOTON ENCENDIDO', sublabel: '(START BUT TON)' },
                { key: 'botonPuerta', label: 'BOTON PUERTA DESCANTE', sublabel: '(ALONDDORTUPH)' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={checklistInterior[item.key as keyof ChecklistInterior]}
                    onChange={() => handleChecklistInteriorChange(item.key as keyof ChecklistInterior)}
                    className="w-5 h-5 border-2 border-gray-800 dark:border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.label} {item.sublabel && <span className="text-xs">{item.sublabel}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* EXTERIOR */}
        <Card>
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">EXTERIOR</h2>
          <div className="border-2 border-gray-800 dark:border-gray-300 rounded-lg p-4">
            <div className="space-y-2">
              {[
                { key: 'antena', label: 'ANTENA', sublabel: '(ANTENNA)' },
                { key: 'copas', label: 'COPAS', sublabel: '(HUBZARS)' },
                { key: 'retrovisores', label: 'RETROVISORES', sublabel: '(BEAR V. MIRROR)' },
                { key: 'emblemas', label: 'EMBLEMAS', sublabel: '(EMBLEMS)' },
                { key: 'taponGasolina', label: 'TAPON DE GASOLINA', sublabel: '(FUEL CAP)' },
                { key: 'tapasBatea', label: 'TAPAS BATEA', sublabel: '(BED. LIMER)' },
                { key: 'llantaRepuesto', label: 'LLANTA REPUESTO', sublabel: '(SPARE TIREI)' },
                { key: 'llantaMantenera', label: 'LLANTA MANTENERA', sublabel: '(LIFT: SPARE WHEEL)' },
                { key: 'llantaPasax', label: 'LLANTA PASAX', sublabel: '(REAR SPACE WHEEL)' },
                { key: 'puertaElevatriz', label: 'PUERTA ELEVATRIZ', sublabel: '(LIFT CATE)' },
                { key: 'frenoMano', label: 'FRENO DE MANO', sublabel: '(HAND BRAKE)' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={checklistExterior[item.key as keyof ChecklistExterior]}
                    onChange={() => handleChecklistExteriorChange(item.key as keyof ChecklistExterior)}
                    className="w-5 h-5 border-2 border-gray-800 dark:border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.label} {item.sublabel && <span className="text-xs">{item.sublabel}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Sección de Salida/OUT - Diagrama del Vehículo */}
      <Card>
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">SALIDA / OUT</h2>
        
        <div className="bg-white border-2 border-gray-800 p-4" style={{ pageBreakInside: 'avoid' }}>
          <img 
            src="/Car.png" 
            alt="Diagrama de inspección del vehículo"
            style={{ 
              width: '100%', 
              maxWidth: '800px', 
              height: 'auto',
              display: 'block',
              margin: '0 auto'
            }}
          />
        </div>
      </Card>

      {/* Firmas */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Firma del Representante */}
          <div className="text-center">
            <div className="border-2 border-gray-800 p-4 h-40 bg-white mb-2">
              <canvas
                ref={canvasRefRepresentante}
                width={300}
                height={120}
                className="cursor-crosshair bg-white w-full h-full"
                onMouseDown={startDrawingRepresentante}
                onMouseMove={drawRepresentante}
                onMouseUp={stopDrawingRepresentante}
                onMouseLeave={stopDrawingRepresentante}
              />
            </div>
            <div className="mt-2">
              <h4 className="font-bold text-gray-900 text-sm">
                REPRESENTANTE ALPHA
              </h4>
              <p className="text-xs text-gray-600">(ALPHA REPRESENTATIVE)</p>
            </div>
          </div>

          {/* Firma del Cliente */}
          <div className="text-center">
            <div className="border-2 border-gray-800 p-4 h-40 bg-white mb-2">
              <canvas
                ref={canvasRefCliente}
                width={300}
                height={120}
                className="cursor-crosshair bg-white w-full h-full"
                onMouseDown={startDrawingCliente}
                onMouseMove={drawCliente}
                onMouseUp={stopDrawingCliente}
                onMouseLeave={stopDrawingCliente}
              />
            </div>
            <div className="mt-2">
              <h4 className="font-bold text-gray-900 text-sm">
                FIRMA DEL CLIENTE
              </h4>
              <p className="text-xs text-gray-600">(CUSTOMER SIGNATURE)</p>
            </div>
          </div>
        </div>
      </Card>
      </div> {/* Fin del contenido para PDF */}

      {/* Botones de limpiar firmas (solo para edición, no en PDF) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 -mt-4 mb-4">
        {/* Botón limpiar Representante */}
        <div className="text-center">
          <button
            type="button"
            onClick={clearSignatureRepresentante}
            className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mb-1"
          >
            🗑️ Limpiar
          </button>
        </div>

        {/* Botón limpiar Cliente */}
        <div className="text-center">
          <button
            type="button"
            onClick={clearSignatureCliente}
            className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mb-1"
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4">
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
