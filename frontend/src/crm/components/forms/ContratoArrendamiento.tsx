import React, { useState, useRef } from 'react';
import { Button } from '../common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { EXCHANGE_RATE } from '../../utils/formatters';

interface ContratoArrendamientoProps {
  reservaId: string;
  clienteName: string;
  vehiculoInfo: string;
  startDate: string;
  endDate: string;
  onSubmit: (contrato: any) => void;
  onCancel: () => void;
  initialData?: any; // Datos previamente guardados por el Operador
}

export const ContratoArrendamiento: React.FC<ContratoArrendamientoProps> = ({
  reservaId, clienteName, startDate, endDate, onSubmit, onCancel, initialData,
}) => {
  // Generar número de contrato legible (ej: 20251001-1234)
  const generateContratoNo = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const numCorto = reservaId.substring(0, 4).toUpperCase();
    return `${año}${mes}${dia}-${numCorto}`;
  };

  const [d, setD] = useState(initialData || {
    contratoNo: generateContratoNo(),
    marca: '', carNo: '', placa: '', kmsIn: '', kmsSalida: '', deposit: '', entradaFecha: startDate, entradaHora: '',
    salidaFecha: endDate, salidaHora: '', gasEntrada: '', gasSalida: '', vencimiento: '', extendido: '',
    lugarApertura: '', lugarCierre: '', horasS: '', diasS: '', semanasS: '', mesS: '', descuento: '',
    subTotalS: '', cobertura: '', horasO: '', diasO: '', semanasO: '', mesO: '', subTotalO: '',
    subTotal: '', impuesto: '', condAdicional: '', gasolina: '', danos: '', traslado: '', otros: '',
    totalL: '', totalD: '', tasa: '', creditCard: '', tarjeta: '', venc: '', codigo: '',
    master: false, visa: false, amex: false, dinners: false, purchase: false, cash: false,
    nombre: clienteName, tel: '', direccion: '', pasaporte: '', pais: '', licencia: '', issued: '',
    expires: '', iniciales: '', deducEsp: '', deducEng: '', acepto: false, accept: false,
  });

  const h = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setD({ ...d, [name]: type === 'checkbox' ? checked : value });
  };

  // Estados para firmas digitales
  const canvasRefCliente = useRef<HTMLCanvasElement>(null);
  const canvasRefRepresentante = useRef<HTMLCanvasElement>(null);
  const [isDrawingCliente, setIsDrawingCliente] = useState(false);
  const [isDrawingRepresentante, setIsDrawingRepresentante] = useState(false);
  const [firmaCliente, setFirmaCliente] = useState<string>(initialData?.firmaCliente || '');
  const [firmaRepresentante, setFirmaRepresentante] = useState<string>(initialData?.firmaRepresentante || '');

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

  // Función para descargar PDF
  const downloadPDF = async () => {
    const element = document.getElementById('contrato-content');
    if (!element) {
      alert('No se encontró el contenido del contrato');
      return;
    }

    try {
      // Mostrar indicador de carga
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'pdf-loading';
      loadingDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
      loadingDiv.innerHTML = '<div style="background: white; padding: 20px; border-radius: 8px; font-size: 18px;">Generando PDF...</div>';
      document.body.appendChild(loadingDiv);
      
      // PASO 1: Capturar TODOS los valores de inputs
      const inputValues = new Map<Element, string>();
      const allInputs = element.querySelectorAll('input, textarea, select');
      allInputs.forEach(input => {
        const inputEl = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        if (inputEl.type === 'checkbox') {
          inputValues.set(input, (inputEl as HTMLInputElement).checked ? 'checked' : 'unchecked');
        } else if (inputEl.type === 'radio') {
          inputValues.set(input, (inputEl as HTMLInputElement).checked ? 'checked' : 'unchecked');
        } else {
          inputValues.set(input, inputEl.value || '');
        }
      });
      
      // Crear un clon temporal para capturar sin afectar el original
      const clonedElement = element.cloneNode(true) as HTMLElement;
      clonedElement.id = 'contrato-content-clone';
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      clonedElement.style.width = '800px';
      clonedElement.style.maxWidth = '800px';
      document.body.appendChild(clonedElement);
      
      // Copiar manualmente el contenido de los canvas (firmas)
      const originalCanvases = element.querySelectorAll('canvas');
      const clonedCanvases = clonedElement.querySelectorAll('canvas');
      originalCanvases.forEach((originalCanvas, index) => {
        if (clonedCanvases[index]) {
          const origCanvas = originalCanvas as HTMLCanvasElement;
          const clonCanvas = clonedCanvases[index] as HTMLCanvasElement;
          const origCtx = origCanvas.getContext('2d');
          const clonCtx = clonCanvas.getContext('2d');
          
          if (origCtx && clonCtx) {
            // Copiar dimensiones
            clonCanvas.width = origCanvas.width;
            clonCanvas.height = origCanvas.height;
            // Copiar contenido pixel por pixel
            clonCtx.drawImage(origCanvas, 0, 0);
          }
        }
      });
      
      // Esperar a que se renderice el clon
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Captura con mayor escala para mejor calidad del CLON
      const canvas = await html2canvas(clonedElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 800,
        windowWidth: 900,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('contrato-content-clone');
          if (!clonedElement) return;
          
          // PASO 2: Reemplazar inputs con divs que contengan los valores
          const clonedInputs = clonedElement.querySelectorAll('input, textarea, select');
          clonedInputs.forEach((clonedInput, index) => {
            const originalInput = Array.from(allInputs)[index];
            const value = inputValues.get(originalInput) || '';
            
            if ((clonedInput as HTMLInputElement).type === 'checkbox' || (clonedInput as HTMLInputElement).type === 'radio') {
              // Reemplazar checkbox/radio con símbolo
              const span = clonedDoc.createElement('span');
              span.textContent = value === 'checked' ? '☑' : '☐';
              span.style.fontSize = '16px';
              span.style.fontWeight = 'bold';
              span.style.color = '#000000';
              span.style.display = 'inline-block';
              span.style.marginRight = '4px';
              clonedInput.parentNode?.replaceChild(span, clonedInput);
            } else {
              // Reemplazar input con div
              const div = clonedDoc.createElement('div');
              div.textContent = value;
              div.style.padding = '8px';
              div.style.minHeight = '24px';
              div.style.border = '1px solid #ccc';
              div.style.borderRadius = '4px';
              div.style.backgroundColor = '#ffffff';
              div.style.color = '#000000';
              div.style.fontSize = '14px';
              div.style.fontFamily = 'Arial, sans-serif';
              div.style.lineHeight = '1.5';
              div.style.display = 'block';
              div.style.width = '100%';
              div.style.boxSizing = 'border-box';
              clonedInput.parentNode?.replaceChild(div, clonedInput);
            }
          });
        }
      });
      
      // Limpiar el clon
      document.body.removeChild(clonedElement);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Usar márgenes pequeños para aprovechar el espacio
      const margin = 5;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = margin;
      
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`contrato-${d.contratoNo}.pdf`);
      
      // Limpiar loading
      const loading = document.getElementById('pdf-loading');
      if (loading) document.body.removeChild(loading);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el PDF');
      
      // Limpiar clon si existe
      const clone = document.getElementById('contrato-content-clone');
      if (clone) document.body.removeChild(clone);
      
      // Limpiar loading en caso de error
      const loading = document.getElementById('pdf-loading');
      if (loading) document.body.removeChild(loading);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 max-h-[85vh] overflow-y-auto">
      {/* Botón de descarga PDF */}
      <div className="flex justify-end mb-4">
        <Button 
          type="button" 
          onClick={downloadPDF} 
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          📄 Descargar PDF
        </Button>
      </div>
      
      {(!firmaCliente || !firmaRepresentante) && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 mb-4">
          <p className="font-bold">⚠️ Atención</p>
          <p>Se recomienda completar ambas firmas antes de descargar el PDF para que el documento esté completo.</p>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...d, firmaCliente, firmaRepresentante }); }} className="space-y-4">
        
        {/* Contenido del contrato para PDF */}
        <div id="contrato-content">
        {/* Header */}
        <div className="border-b-2 pb-3 flex items-start gap-4">
          {/* Logo de la empresa */}
          <div className="flex-shrink-0">
            <img src="/logo-ACR-1.png" alt="Alpha Car Rental Logo" className="w-24 h-24 object-contain" />
          </div>
          
          {/* Información de la empresa */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Alpha Car Rental</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">Comayagua. Base Aerea Soto Cano</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">WEB: <a href="https://alphacarrentalhn.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">https://alphacarrentalhn.com</a></p>
            <p className="text-sm text-gray-700 dark:text-gray-300">CEL: 3174-7429 | 3174-4717</p>
          </div>
          
          {/* Número de contrato */}
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">CONTRATO N°</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{d.contratoNo}</p>
          </div>
        </div>

        {/* SECCIÓN 1: INFORMACIÓN DEL CLIENTE (PRIMERO) */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">INFORMACIÓN DEL CLIENTE / CUSTOMER INFORMATION</h3>
          
          {/* Tarjeta de Crédito */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Credit Card N°</label>
              <input name="creditCard" value={d.creditCard} onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Tarjeta de Crédito N°</label>
              <input name="tarjeta" value={d.tarjeta} onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Vencimiento (Expiration)</label>
              <input name="venc" value={d.venc} onChange={h} placeholder="MM/YY" className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Código Seguridad (Security Code)</label>
              <input name="codigo" value={d.codigo} onChange={h} placeholder="CVV" className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
            </div>
          </div>

          {/* Tipos de tarjeta */}
          <div className="mb-3">
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tipo de Tarjeta / Card Type</label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="master" checked={d.master} onChange={h} /> Master</label>
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="visa" checked={d.visa} onChange={h} /> Visa</label>
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="amex" checked={d.amex} onChange={h} /> Amex</label>
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="dinners" checked={d.dinners} onChange={h} /> Dinners</label>
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="purchase" checked={d.purchase} onChange={h} /> Purchase Order</label>
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="cash" checked={d.cash} onChange={h} /> Cash</label>
            </div>
          </div>

          {/* Info Personal */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Nombre del Representante (Customer Name)</label>
              <input name="nombre" value={d.nombre} onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Tel. (Phone)</label>
              <input name="tel" value={d.tel} onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Dirección Local (Local Address)</label>
            <input name="direccion" value={d.direccion} onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Pasaporte (Passport N°)</label>
              <input name="pasaporte" value={d.pasaporte} onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">País (Country)</label>
              <input name="pais" value={d.pais} onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Licencia N° (License N°)</label>
              <input name="licencia" value={d.licencia} onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Extendida en (Issued in)</label>
              <input name="issued" value={d.issued} onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Vence (Expires on)</label>
              <input type="date" name="expires" value={d.expires} onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: CONDUCTORES ADICIONALES */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">CONDUCTORES ADICIONALES / ADITIONAL DRIVERS</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Nombre:</label>
                <input name="cond1" onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Licencia N° (Drivers Lic):</label>
                <input name="lic1" onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Vence (Expiration date):</label>
                <input type="date" name="v1" onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Nombre:</label>
                <input name="cond2" onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Licencia N° (Drivers Lic):</label>
                <input name="lic2" onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Vence (Expiration date):</label>
                <input type="date" name="v2" onChange={h} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: DETALLES DEL CONTRATO DE ARRENDAMIENTO */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">DETALLES DEL CONTRATO DE ARRENDAMIENTO</h3>

        {/* Tabla Principal - 2 Columnas como imagen */}
        <div className="border-2 border-gray-800 dark:border-gray-600">
          <table className="w-full border-collapse text-xs">
            <tbody>
              {/* Primera fila */}
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Marca (Type)</b><input name="marca" value={d.marca} onChange={h} className="w-full border-b mt-1 px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" colSpan={2}><b>Entrada (in) Fecha (Date)</b><input type="date" name="entradaFecha" value={d.entradaFecha} onChange={h} className="w-full px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Hora (Hour)</b><input type="time" name="entradaHora" value={d.entradaHora} onChange={h} className="w-full px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Car N°</b><input name="carNo" value={d.carNo} onChange={h} className="w-full border-b mt-1 px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Salida(out) Fecha(Date)</b><input type="date" name="salidaFecha" value={d.salidaFecha} onChange={h} className="w-full px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" colSpan={2}><b>Hora (Hour)</b><input type="time" name="salidaHora" value={d.salidaHora} onChange={h} className="w-full px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Placa (plate)</b><input name="placa" value={d.placa} onChange={h} className="w-full border-b mt-1 px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Gas Entrada (In)</b><input name="gasEntrada" value={d.gasEntrada} onChange={h} className="w-full border-b mt-1 px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" colSpan={2}><b>Gas Salida (Out)</b><input name="gasSalida" value={d.gasSalida} onChange={h} className="w-full border-b mt-1 px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Kms. In</b><input name="kmsIn" value={d.kmsIn} onChange={h} className="w-full border-b mt-1 px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" rowSpan={3} colSpan={3}><b>Vencimiento del Contrato (Contract Due)</b><input type="date" name="vencimiento" value={d.vencimiento} onChange={h} className="w-full px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Kms salida</b><input name="kmsSalida" value={d.kmsSalida} onChange={h} className="w-full border-b mt-1 px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Ruin-Recomendacion</b><input name="ruin" onChange={h} className="w-full border-b mt-1 px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2" rowSpan={2}><b>Recibido N°</b><input name="recibidoNo" onChange={h} className="w-full border-b mt-1 px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" rowSpan={2}><b>Deposit</b><input name="deposit" value={d.deposit} onChange={h} className="w-full border-b mt-1 px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" colSpan={2}><b>Extensión</b><input name="extendido" value={d.extendido} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2" colSpan={2}><b>Lugar de Apertura (Opening Place)</b><input name="lugarApertura" value={d.lugarApertura} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2" colSpan={2}></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" colSpan={2}><b>Lugar de cierre (Closing Place)</b><input name="lugarCierre" value={d.lugarCierre} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              {/* SEGUNDO AUTOMOVIL | AUTOMOVIL ORIGINAL */}
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2" colSpan={2}><b>SEGUNDO AUTOMOVIL (SECOND VEHICLE)</b></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" colSpan={2}><b>AUTOMOVIL ORIGINAL (ORIGINAL VEHICLE)</b></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Horas (Hours)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="horasS" value={d.horasS} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Horas (Hours)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="horasO" value={d.horasO} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Días (Days)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="diasS" value={d.diasS} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Días (Days)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="diasO" value={d.diasO} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Semanas (Weeks)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="semanasS" value={d.semanasS} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Semanas (Weeks)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="semanasO" value={d.semanasO} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Mes (Month)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="mesS" value={d.mesS} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Mes (Month)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="mesO" value={d.mesO} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Descuento (Discount)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="descuentoS" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
                
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Sub-total (Renta)</b></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="subTotalRentaS" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Sub-total (Renta)</b></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="subTotalRentaO" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Cobertura contra daños (Coverage / Damages)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="coberturaS" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Sub-Total</b></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="subTotalO" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Sub-total</b></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="subTotal2S" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" rowSpan={3}>Impuesto (tax)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" rowSpan={3}><input name="impuesto" value={d.impuesto} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Impuestos (Tax)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="impuestosS" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Conductor Adicional (Additional Driver)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="condAdicionalS" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Gasolina (Gas)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="gasolinaS" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Daños al vehículo (Damages to the vehicle)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="danosVehiculoS" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" rowSpan={3}>Cargo de Traslado (Drop off)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" rowSpan={3}><input name="cargoTraslado" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Otros</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="otrosS" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Sub-total</b></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="subTotal3S" onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2" rowSpan={6}>
                  <div className="text-xs">
                    <p><b>Por medio de iniciales me declaro de acuerdo con un deducible de $ <input name="deducEsp" value={d.deducEsp} onChange={h} className="w-16 border-b mx-1 dark:bg-gray-800" /> en caso de accidente</b></p>
                  </div>
                </td>
                <td className="border border-gray-400 dark:border-gray-600 p-2" rowSpan={6}>
                  <div className="text-xs">
                    <p><b>I agree by initials with a deductible of $ <input name="deducEng" value={d.deducEng} onChange={h} className="w-16 border-b mx-1 dark:bg-gray-800" /> p/day with a deductible case of accident</b></p>
                  </div>
                </td>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Conductor Adicional (Additional Driver)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="condAdicional" value={d.condAdicional} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Gasolina (Gas)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="gasolina" value={d.gasolina} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Daños al Vehículo (Damages in Vehicle)</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="danos" value={d.danos} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2">Otros</td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="otros" value={d.otros} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Sub-Total</b></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="subTotal" value={d.subTotal} onChange={h} className="w-full border-b px-1 dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Total Lempiras (L.)</b></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="totalL" value={d.totalL} onChange={h} className="w-full border-b-2 border-gray-800 px-1 font-bold dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2 text-center">
                  <label className="flex items-center justify-center gap-2">
                    <input type="checkbox" name="acepto" checked={d.acepto} onChange={h} />
                    <span>Acepto</span>
                  </label>
                </td>
                <td className="border border-gray-400 dark:border-gray-600 p-2 text-center">
                  <label className="flex items-center justify-center gap-2">
                    <input type="checkbox" name="accept" checked={d.accept} onChange={h} />
                    <span>Accept</span>
                  </label>
                </td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>Total Dollars ($)</b></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="totalD" value={d.totalD} onChange={h} className="w-full border-b-2 border-gray-800 px-1 font-bold dark:bg-gray-800" /></td>
              </tr>
              <tr>
                <td className="border border-gray-400 dark:border-gray-600 p-2" colSpan={2}></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><b>(Exchange Rate)</b></td>
                <td className="border border-gray-400 dark:border-gray-600 p-2"><input name="tasa" value={d.tasa} onChange={h} className="w-full border-b-2 border-gray-800 px-1 font-bold dark:bg-gray-800" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>

        {/* Advertencias */}
        <div className="bg-red-100 border-2 border-red-600 p-2 mb-2 text-[12px]">
          <h3 className="font-bold text-center text-red-800 mb-1">SI EL VEHICULO ES ROBADO DEBE SER REPORTADO AL ARRENDADOR ANTES QUE PASE 12 HORAS</h3>
          <p className="mb-1">
            El seguro no cubre robo o daño a las ruedas, a los accesorios, radios herramientas llantas, etc. por lo tanto se acuerda que 
            el cliente es responsable de estos si fueran dañados o robados, también se acuerda que el cliente es responsable 
            por todo daño o gasto que cause el vehículo debido a su mal uso o negligencia ya que estos daños no están cubiertos por ningún seguro
          </p>
          <h3 className="font-bold text-center text-red-800 mb-1">IF CAR IS STOLEN IT MUST BE REPORT TO LESSOR WITHIN 12 HOURS</h3>
          <p className="mb-1">
            Insurance does not cover theft on hubcaps, accessories radios, tools, or tires for which the costumer 
            is fully responsible it is also agreed all damages and expenses 
            caused by negligence or poor driving of the vehicle, shall run for the customer account. Such expenses not covered by insurance.
            </p>
          <p className="mb-1 text-justify">
            En caso de daños mecánicos cualquier reemplazo hecho por el cliente ( llantas gastadas etc ) 
            la pieza debe presentarse ante nuestra oficina con su recibo para obtener crédito in case of mechanical failure any mechanical parts replaced by the customer all parts replaced ( tires, battery ) the parts replace must be returned with their tiket in order to get credit. el arrendatario no utilizara el vehículo fuera del pais sin autorización previa por escrito del arrendador mismo que sera solicitada con antelación del caso y por escrito. No podrán conducir personas menores de 25 años,
            no conducirán con mas personas que las establecidos por el vehículo. en vehiculo pick up se prohibe transportar personas fuera de la cabina.
            </p>
          <p className="text-justify">
            The lessor will not use the vehicle outside of the temitory of the Republic of Honduras without written authorization requested with 3 day sof advance the lessor 
            that should be solicited with anticipation and in a written form no person younger than 25 years is permitted to drive rented vehicle only with 
            permission of the lessor the vehicle wich not be driven with more passengers than the established capacity of the vehicle. in case of the cabin.
            In case of pick-ups lessor is not allow to transport people 
            the bed no one En caso de colision y vuelco el arrendatario deberá presentar el parte de transito y el documento extendido por la fuerza de seguridad publica. 
            In case of collision and over timinng the less 
            must show the tiket from the police and the report from the public security force. in case of accident or overturn the must call 911.
          </p>
        </div>

        {/* Condiciones y Firma */}
        <div className="border-2 border-gray-900 p-2 mb-2 text-[12px]">
          <h3 className="font-bold mb-1">Condiciones para la Renta (Conditions for the Rent)</h3>
          <p className="mb-1"><b>Edad mínima de 25 años, licencia vigente, tarjeta de crédito / Minimum 25 year, driver license and credit card</b></p>
          <p className="text-justify">
            "He leído los términos y condiciones del contrato de renta de cuyas 
             cláusulas recibo una versión en ingles y español y que todos los importes de multas, allegas, infracción de transito, deducible cualquier otro daño que no
             cubra el seguro derivados de este contrato siendo o no culpable, pueden ser cargados en el voucher de la tarjeta de crédito o de cargo que presento en este acto."
          </p>
          <br/>
          <p className="text-justify">
            I had read the terms and conditions of the rental agreement which, 
            I had read two versions in English and Spanish and that any rental conditions, plates, violation of traffic law deductibles, any other damage on the vehicle etc. The insurance does not covered whether it is 
            my fault or not and any other rental agreement expense can be charged to the credit card voucher that customer use the opening of the rental agreement.
          </p>   
        </div>

        {/* Espaciador y título de firmas */}
        <div className="mt-20 mb-8 pt-12 border-t-2 border-gray-300">
          <h3 className="text-center font-bold text-lg mb-8">FIRMAS / SIGNATURES</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          {/* Firma del Cliente */}
          <div className="text-center">
            <div className="border-2 border-gray-400 dark:border-gray-600 rounded mb-2">
              <canvas
                ref={canvasRefCliente}
                width={300}
                height={150}
                className="cursor-crosshair bg-white w-full"
                onMouseDown={startDrawingCliente}
                onMouseMove={drawCliente}
                onMouseUp={stopDrawingCliente}
                onMouseLeave={stopDrawingCliente}
              />
            </div>
            <div><b>Firma (Signature)</b></div>
          </div>

          {/* Firma del Representante */}
          <div className="text-center">
            <div className="border-2 border-gray-400 dark:border-gray-600 rounded mb-2">
              <canvas
                ref={canvasRefRepresentante}
                width={300}
                height={150}
                className="cursor-crosshair bg-white w-full"
                onMouseDown={startDrawingRepresentante}
                onMouseMove={drawRepresentante}
                onMouseUp={stopDrawingRepresentante}
                onMouseLeave={stopDrawingRepresentante}
              />
            </div>
            <div><b>REPRESENTANTE ALPHA CAR RENTAL</b></div>
          </div>
        </div>
        </div> {/* Fin del contenido para PDF */}

        {/* Botones de limpiar firmas (solo para edición, no en PDF) */}
        <div className="grid grid-cols-2 gap-4 mb-3 -mt-2">
          <div className="text-center">
            <button
              type="button"
              onClick={clearSignatureCliente}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              🗑️ Limpiar Firma Cliente
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={clearSignatureRepresentante}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              🗑️ Limpiar Firma Representante
            </button>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">💾 Guardar Contrato</Button>
        </div>
      </form>
    </div>
  );
};
