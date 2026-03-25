
import React, { useState } from 'react';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import Markdown from 'react-markdown';
import { PatientInfo, PrescriptionData, BalanceData, SodiumData } from '../types';

interface GeminiAdvisorProps {
  patient: PatientInfo;
  prescription: PrescriptionData;
  balance: BalanceData;
  sodium: SodiumData;
  deliveredDose: number;
}

const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ patient, prescription, balance, sodium, deliveredDose }) => {
  const [advice, setAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getAdvice = async () => {
    setIsLoading(true);
    try {
      // Corrected: Initialize GoogleGenAI with a named parameter as per the coding guidelines.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Corrected: Use prescription.filterModel which is available in the type definition.
      const prompt = `
        # ROL: ASISTENTE TÉCNICO DE PRESCRIPCIÓN MÉDICA
        Eres un experto en nefrología crítica. Tu función es recibir parámetros de diálisis y generar una prescripción médica formal lista para ser exportada a PDF.

        # REGLAS DE ESTRUCTURACIÓN:
        1. NO MODIFICAR ningún cálculo previo de dosis o flujos.
        2. FORMATO DE SALIDA: Utiliza tablas de Markdown para que el PDF se vea profesional y organizado.
        3. SECCIONES OBLIGATORIAS:
           - Datos del Paciente.
           - Parámetros de la Terapia (CRRT o SLED).
           - Insumos Específicos (NUEVO).
           - Balance Hídrico y Anticoagulación.

        # ESPECIFICACIONES DE INSUMOS (SLED):
        Cuando la modalidad sea SLED, debes incluir estrictamente estos campos en una tabla limpia:
        - Concentrado Ácido: Solo utilizar línea Fresenius Serie SK-F (211, 212, 213, 203).
        - Amortiguador: bibag o Sol-Cart B.
        - Celda de Bicarbonato: Valor en mEq/L (ajuste de conductividad).

        # DATOS DE LA SESIÓN:
        - Paciente: ${patient.name || 'N/A'}, ${patient.weight}kg, ${patient.age} años, ${patient.sex}.
        - Terapia: ${prescription.category} (${prescription.modality}).
        - Máquina/Filtro: ${prescription.machine}, ${prescription.filterModel} (${prescription.filterSurface} m²).
        - Flujos: Qb=${prescription.bloodFlow} mL/min, Qd=${prescription.dialysateFlow} ${prescription.category === 'SLED-Híbrida' ? 'mL/min' : 'mL/h'}, QrPre=${prescription.replacementFlowPre} mL/h, QrPost=${prescription.replacementFlowPost} mL/h.
        - Sodio: Actual ${sodium.currentNa} mEq/L, Objetivo ${sodium.targetNa24h} mEq/L.
        - Dosis Entregada: ${deliveredDose} mL/kg/h.
        - Anticoagulación: ${prescription.anticoagulation}.
        ${prescription.category === 'SLED-Híbrida' ? `
        - Concentrado Ácido SLED: ${prescription.sledAcidConcentrate || 'No especificado'}
        - Amortiguador SLED: ${prescription.sledBicarbonateType || 'No especificado'}
        - Celda Bicarbonato: ${prescription.sledBicarbonateCell || 'No especificada'} mEq/L
        ` : ''}

        # INSTRUCCIÓN:
        Genera un título central: "ORDEN DE PRESCRIPCIÓN DE TERAPIA DE REEMPLAZO RENAL".
        Utiliza separadores horizontales (---) entre secciones.
        Proporciona el informe formal en ESPAÑOL.
      `;

      // Corrected: Use ai.models.generateContent directly to perform the request.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.1,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      // Corrected: Access the text directly via the .text property (not a method).
      setAdvice(response.text || 'No se pudo generar el análisis.');
    } catch (error) {
      console.error('Gemini error:', error);
      setAdvice('Error al conectar con el Asesor IA.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
             <i className="fas fa-robot text-white text-xs"></i>
           </div>
           <h4 className="text-sm font-bold text-slate-800">Asesor Clínico IA</h4>
        </div>
        <button 
          onClick={getAdvice}
          disabled={isLoading}
          className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full font-bold transition-colors disabled:opacity-50"
        >
          {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sync-alt mr-2"></i>}
          Validar Seguridad
        </button>
      </div>

      <div className="markdown-body text-slate-600 text-[11px] leading-relaxed">
        {advice ? (
          <div className="border-l-2 border-blue-500 pl-3">
            <Markdown>{advice}</Markdown>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 italic">
            Haz clic en 'Validar Seguridad' para generar la prescripción formal y análisis.
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiAdvisor;
