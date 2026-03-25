
import React, { useState } from 'react';
import { 
  CrrtJustificationData, 
  KDIGO_CRITERIA, 
  PrescriptionData, 
  PatientInfo, 
  BalanceData, 
  LIQUID_COMPOSITIONS,
  AnticoagulationType
} from '../types';

interface CrrtJustificationProps {
  data: CrrtJustificationData;
  setData: React.Dispatch<React.SetStateAction<CrrtJustificationData>>;
  prescription: PrescriptionData;
  patient: PatientInfo;
  balance: BalanceData;
  calculatedNetUF: number;
}

const CrrtJustification: React.FC<CrrtJustificationProps> = ({ 
  data, 
  setData,
  prescription,
  patient,
  balance,
  calculatedNetUF
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({
    summary: '',
    justification: '',
    biblio: ''
  });

  const handleConditionChange = (condition: keyof CrrtJustificationData['conditions']) => {
    setData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [condition]: !prev.conditions[condition]
      }
    }));
  };

  const handleObjectiveChange = (objective: keyof CrrtJustificationData['objectives']) => {
    setData(prev => ({
      ...prev,
      objectives: {
        ...prev.objectives,
        [objective]: !prev.objectives[objective]
      }
    }));
  };

  const generateJustification = () => {
    const liquid = LIQUID_COMPOSITIONS[prescription.crrtLiquidKey];
    const citrateFlow = prescription.anticoagulation === AnticoagulationType.CITRATE 
      ? Math.round(prescription.bloodFlow * 60 * 0.03) 
      : 0;

    // 1️⃣ DATOS SELECCIONADOS DE LA PLANTILLA
    const summary = `Datos clínicos seleccionados
Diagnóstico principal: ${data.diagnosis || 'No consignado'}
Vasopresores: ${data.vasopressor || 'No consignado'}
Estadio KDIGO: ${data.kdigoStage ? `Estadio ${data.kdigoStage}` : 'No consignado'}
Indicación KDIGO: ${data.selectedCriterion || 'No consignado'}

Configuración CRRT
Modalidad: ${prescription.modality || 'No consignado'}
Máquina: ${prescription.machine || 'No consignado'}
Membrana: ${prescription.filterModel || 'No consignado'}
Flujo sangre (Qb): ${prescription.bloodFlow || 0} ml/min
Dosis objetivo: ${prescription.targetDose || 0} ml/kg/h
UF neta programada: ${calculatedNetUF || 0} ml/h

Perfil de líquidos
K+: ${liquid ? liquid.k : 'No consignado'}
Bicarbonato: ${liquid ? liquid.hco3 : 'No consignado'}
Cloro: ${liquid ? liquid.cl : 'No consignado'}

Anticoagulación
Tipo: ${prescription.anticoagulation || 'No consignado'}
Flujo citrato: ${citrateFlow} ml/h`;

    // 2️⃣ JUSTIFICATIVO CLÍNICO
    const justificationText = `Paciente crítico internado en la Unidad de Cuidados Intensivos, con enfermedad crítica y requerimiento de soporte multiorgánico avanzado. En el contexto de shock séptico secundario a ${data.diagnosis || 'No consignado'}, en tratamiento con antibióticos de amplio espectro y medidas de control de foco, presenta compromiso hemodinámico severo, con requerimientos elevados de vasopresores ${data.vasopressor || 'No consignado'}, para mantener una presión arterial media adecuada. Se asocia hipoperfusión tisular con hiperlactatemia persistente, insuficiencia respiratoria en ventilación mecánica y lesión renal aguda, en estadio ${data.kdigoStage ? `Estadio ${data.kdigoStage}` : 'No consignado'}, con alteraciones metabólicas y sobrecarga hídrica.
El cuadro clínico se acompaña de encefalopatía séptica, alteraciones hematológicas y compromiso hepático en el marco de una respuesta inflamatoria sistémica severa. El puntaje SOFA estimado es mayor que 12, lo que refleja una falla multiorgánica avanzada y un elevado riesgo de mortalidad. A pesar de las medidas terapéuticas aplicadas, el paciente presenta progresión de la disfunción orgánica. En este contexto, y de acuerdo con cuadro de ${data.selectedCriterion || 'No consignado'}, se indica inicio de Terapia de Reemplazo Renal Continua bajo Protocolo CRRT – HP, priorizando modalidad continua para permitir estabilidad hemodinámica, control progresivo del medio interno y manejo preciso del balance hídrico.`;

    // 3️⃣ BIBLIOGRAFÍA
    const biblio = `Bibliografía
KDIGO Clinical Practice Guideline for Acute Kidney Injury.
Kidney Int Suppl. 2012;2(1):1–138.
KDIGO 2012 Acute Kidney Injury Work Group.
Section 5: Dialysis Interventions for Treatment of AKI.`;

    setPreviewData({ summary, justification: justificationText, biblio });
    setShowPreview(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Justificativo copiado al portapapeles');
  };

  const pasteToReport = (text: string) => {
    setData(prev => ({ ...prev, aiJustification: text }));
    setShowPreview(false);
  };

  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block";
  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none";
  const checkboxLabelClass = "flex items-center gap-3 cursor-pointer group";
  const checkboxClass = "w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all";

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <section className="bg-white p-8 rounded-lg border border-[#E0E0E0] premium-shadow">
        <h2 className="text-[10px] font-black mb-8 text-[#A80000] uppercase tracking-[0.3em] flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#A80000] text-white flex items-center justify-center text-[10px]">🩺</span>
          Vista Previa – Justificación de CRRT
        </h2>

        <div className="space-y-8">
          {/* 1. Cuadro Clínico Actual */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px]">1️⃣</span>
              Cuadro Clínico Actual
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className={labelClass}>Diagnóstico Principal</label>
                <input 
                  type="text" 
                  value={data.diagnosis} 
                  onChange={e => setData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  className={inputClass}
                  placeholder="Ej. Sepsis de foco abdominal"
                />
              </div>
              <div>
                <label className={labelClass}>Lesión Renal Aguda Estadio (KDIGO)</label>
                <select 
                  value={data.kdigoStage} 
                  onChange={e => setData(prev => ({ ...prev, kdigoStage: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Seleccionar...</option>
                  <option value="1">Estadio 1</option>
                  <option value="2">Estadio 2</option>
                  <option value="3">Estadio 3</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Diuresis (ml/kg/h)</label>
                <input 
                  type="text" 
                  value={data.diuresis} 
                  onChange={e => setData(prev => ({ ...prev, diuresis: e.target.value }))}
                  className={inputClass}
                  placeholder="Ej. 0.2"
                />
              </div>
              <div>
                <label className={labelClass}>Creatinina Actual (mg/dL)</label>
                <input 
                  type="text" 
                  value={data.creatinine} 
                  onChange={e => setData(prev => ({ ...prev, creatinine: e.target.value }))}
                  className={inputClass}
                  placeholder="Ej. 3.4"
                />
              </div>
              <div>
                <label className={labelClass}>Balance Hídrico Acumulado (L)</label>
                <input 
                  type="text" 
                  value={data.accumulatedBalance} 
                  onChange={e => setData(prev => ({ ...prev, accumulatedBalance: e.target.value }))}
                  className={inputClass}
                  placeholder="Ej. +5.2"
                />
              </div>
              <div>
                <label className={labelClass}>Requerimiento Vasopresor (Sí/No – Dosis)</label>
                <input 
                  type="text" 
                  value={data.vasopressor} 
                  onChange={e => setData(prev => ({ ...prev, vasopressor: e.target.value }))}
                  className={inputClass}
                  placeholder="Ej. Norepinefrina 0.5 mcg/kg/min"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <label className={labelClass}>Presencia de:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(data.conditions).map(([key, value]) => (
                  <label key={key} className={checkboxLabelClass}>
                    <input 
                      type="checkbox" 
                      checked={value} 
                      onChange={() => handleConditionChange(key as keyof CrrtJustificationData['conditions'])}
                      className={checkboxClass}
                    />
                    <span className="text-xs text-slate-600 font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace('10', ' >10%')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Desplegable – Criterio de Inicio CRRT */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px]">2️⃣</span>
              Criterio de Inicio CRRT
            </h3>
            <label className={labelClass}>▼ Indicación según criterio KDIGO:</label>
            <select 
              value={data.selectedCriterion} 
              onChange={e => setData(prev => ({ ...prev, selectedCriterion: e.target.value }))}
              className={inputClass}
            >
              <option value="">Seleccionar criterio...</option>
              {KDIGO_CRITERIA.map(criterion => (
                <option key={criterion} value={criterion}>{criterion}</option>
              ))}
            </select>
          </div>

          {/* 3. Justificación Clínica Automática */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px]">3️⃣</span>
                Justificación Clínica Automática
              </h3>
              <button 
                onClick={generateJustification}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <i className="fas fa-magic"></i>
                Generar justificativo
              </button>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-xl">
              <textarea 
                value={data.aiJustification}
                onChange={e => setData(prev => ({ ...prev, aiJustification: e.target.value }))}
                className="w-full bg-transparent text-xs text-slate-700 leading-relaxed italic border-none focus:ring-0 resize-none min-h-[200px]"
                placeholder="Presione 'Generar justificativo' para crear el texto automático, o pegue su propio texto aquí."
              />
            </div>
          </div>

          {/* 4. Modalidad Propuesta */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px]">4️⃣</span>
              Modalidad Propuesta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className={labelClass}>Modalidad</label>
                <select 
                  value={data.proposedModality} 
                  onChange={e => setData(prev => ({ ...prev, proposedModality: e.target.value }))}
                  className={inputClass}
                >
                  <option value="CVVHDF">CVVHDF</option>
                  <option value="CVVH">CVVH</option>
                  <option value="CVVHD">CVVHD</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Dosis de Efluente (ml/kg/h)</label>
                <input 
                  type="text" 
                  value={data.proposedDose} 
                  onChange={e => setData(prev => ({ ...prev, proposedDose: e.target.value }))}
                  className={inputClass}
                  placeholder="Ej. 25-30"
                />
              </div>
              <div>
                <label className={labelClass}>Anticoagulación</label>
                <select 
                  value={data.proposedAnticoagulation} 
                  onChange={e => setData(prev => ({ ...prev, proposedAnticoagulation: e.target.value }))}
                  className={inputClass}
                >
                  <option value="Citrato regional">Citrato regional</option>
                  <option value="Heparina">Heparina</option>
                  <option value="Sin anticoagulación">Sin anticoagulación</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <label className={labelClass}>Objetivo:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(data.objectives).map(([key, value]) => (
                  <label key={key} className={checkboxLabelClass}>
                    <input 
                      type="checkbox" 
                      checked={value} 
                      onChange={() => handleObjectiveChange(key as keyof CrrtJustificationData['objectives'])}
                      className={checkboxClass}
                    />
                    <span className="text-xs text-slate-600 font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Nota Final para Prescripción */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px]">5️⃣</span>
              Nota Final para Prescripción
            </h3>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                Se indica inicio de CRRT de acuerdo con criterios KDIGO y contexto clínico actual, priorizando modalidad continua debido a inestabilidad hemodinámica.
              </p>
            </div>
          </div>

          {/* Bibliografía */}
          <div className="pt-8 border-t border-slate-100">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span>📚</span> Bibliografía
            </h4>
            <div className="text-[9px] text-slate-400 space-y-1 font-medium">
              <p>KDIGO Clinical Practice Guideline for Acute Kidney Injury.</p>
              <p>Kidney Int Suppl. 2012;2(1):1–138.</p>
              <p>KDIGO 2012 Acute Kidney Injury Work Group.</p>
              <p>Section 5: Dialysis Interventions for Treatment of AKI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vista Previa Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-sm font-bold text-slate-800">Vista previa justificativo clínico – CRRT</h2>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              {/* 1️⃣ Datos Seleccionados */}
              <div>
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">1️⃣ Datos seleccionados de la plantilla</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-[10px] text-slate-600 font-mono whitespace-pre-wrap">
                  {previewData.summary}
                </div>
              </div>

              {/* 2️⃣ Justificativo clínico */}
              <div>
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">2️⃣ Justificativo clínico</h3>
                <textarea 
                  value={previewData.justification}
                  onChange={e => setPreviewData(prev => ({ ...prev, justification: e.target.value }))}
                  className="w-full h-[300px] bg-slate-50 border border-slate-200 rounded-xl p-6 text-xs text-slate-700 leading-relaxed font-serif focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* 3️⃣ Bibliografía */}
              <div>
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">3️⃣ Bibliografía KDIGO</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-[10px] text-slate-500 font-medium whitespace-pre-wrap">
                  {previewData.biblio}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-end gap-3 flex-shrink-0">
              <button 
                onClick={() => copyToClipboard(`${previewData.justification}\n\n${previewData.biblio}`)}
                className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <i className="fas fa-copy"></i>
                📋 Copiar justificativo
              </button>
              <button 
                onClick={() => pasteToReport(previewData.justification)}
                className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <i className="fas fa-file-import"></i>
                📌 Pegar justificativo
              </button>
              <button 
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <i className="fas fa-edit"></i>
                ✏ Editar
              </button>
              <button 
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all"
              >
                ❌ Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrrtJustification;
