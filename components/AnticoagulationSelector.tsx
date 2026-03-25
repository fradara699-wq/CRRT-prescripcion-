
import React, { useState, useMemo } from 'react';
import { AnticoagulationType, PrescriptionData } from '../types';

interface AnticoagulationSelectorProps {
  prescription: PrescriptionData;
  setPrescription: React.Dispatch<React.SetStateAction<PrescriptionData>>;
  patientWeight?: number;
}

const AnticoagulationSelector: React.FC<AnticoagulationSelectorProps> = ({ prescription, setPrescription, patientWeight = 0 }) => {
  // Estados para Citrato
  const [postFilterCa, setPostFilterCa] = useState<number>(0);
  const [systemicCa, setSystemicCa] = useState<number>(0);
  const [isInitialPhase, setIsInitialPhase] = useState<boolean>(true);

  // Estados para Heparina (v22.0)
  const [currentHeparinDose, setCurrentHeparinDose] = useState<number>(0);
  const [apttResult, setApttResult] = useState<number>(0);

  // --- CÁLCULOS CITRATO (ACD-A) ---
  const citrateCalculations = useMemo(() => {
    const qb = prescription.bloodFlow;
    const initialPBP = Math.round(qb * 60 * 0.03);
    
    let pbpAdjustmentText = "Ingrese Ca++ Pos-filtro";
    let pbpAlert = null;
    let pbpClass = "text-slate-400";

    if (postFilterCa > 0) {
      if (postFilterCa < 0.20) {
        pbpAdjustmentText = "DISMINUIR flujo PBP en 30 ml/h";
        pbpAlert = "⚠️ AVISAR A MÉDICO - Calcio Post-filtro críticamente bajo";
        pbpClass = "text-red-600 font-black";
      } else if (postFilterCa <= 0.24) {
        pbpAdjustmentText = "DISMINUIR flujo PBP en 20 ml/h";
        pbpClass = "text-amber-600 font-bold";
      } else if (postFilterCa <= 0.30) {
        pbpAdjustmentText = "MANTENER flujo (Rango Óptimo)";
        pbpClass = "text-green-600 font-bold";
      } else if (postFilterCa <= 0.40) {
        pbpAdjustmentText = "AUMENTAR flujo PBP en 20 ml/h";
        pbpClass = "text-blue-600 font-bold";
      } else if (postFilterCa <= 0.45) {
        pbpAdjustmentText = "AUMENTAR flujo PBP en 30 ml/h";
        pbpClass = "text-blue-700 font-bold";
      } else {
        pbpAdjustmentText = "AUMENTAR flujo PBP en 40 ml/h";
        pbpAlert = "⚠️ AVISAR A MÉDICO - Anticoagulación insuficiente";
        pbpClass = "text-red-600 font-black";
      }
    }

    let systemicInfusion = "Pendiente valor Ca++";
    let systemicAlert = null;
    let systemicClass = "text-slate-400";

    if (systemicCa > 0) {
      if (isInitialPhase) {
        if (systemicCa < 0.8) {
          systemicInfusion = "AVISO MÉDICO INMEDIATO";
          systemicClass = "text-red-600 font-black";
        } else if (systemicCa <= 0.89) {
          systemicInfusion = "Infusión a 5 ml/h";
          systemicClass = "text-amber-600 font-bold";
        } else if (systemicCa <= 1.0) {
          systemicInfusion = "Infusión a 4 ml/h";
          systemicClass = "text-emerald-600 font-bold";
        } else {
          systemicInfusion = "INFUSIÓN CERRADA";
          systemicClass = "text-slate-500 font-bold";
        }
      } else {
        if (systemicCa < 0.8) {
          systemicInfusion = "AVISO MÉDICO + BOLO";
          systemicAlert = "⚠️ Sugerir BOLO: 0.5 amp (5ml) en 10cc SF previo paso a bomba.";
          systemicClass = "text-red-600 font-black";
        } else if (systemicCa <= 0.89) {
          systemicInfusion = "Infusión a 8 ml/h";
          systemicClass = "text-amber-600 font-bold";
        } else if (systemicCa <= 1.0) {
          systemicInfusion = "Infusión a 6 ml/h";
          systemicClass = "text-emerald-600 font-bold";
        } else {
          systemicInfusion = "INFUSIÓN CERRADA";
          systemicClass = "text-slate-500 font-bold";
        }
      }
    }

    return { initialPBP, pbpAdjustmentText, pbpAlert, pbpClass, systemicInfusion, systemicAlert, systemicClass };
  }, [prescription.bloodFlow, postFilterCa, systemicCa, isInitialPhase]);

  // --- CÁLCULOS HEPARINA v22.0 (Nomograma Basado en Peso) ---
  const heparinCalculations = useMemo(() => {
    const w = patientWeight || 0;
    const initialBolus = Math.round(w * 50);
    const initialMnt = Math.round(w * 15);

    let action = "Esperando KPTT";
    let controlTime = "---";
    let nextDose = currentHeparinDose;
    let statusClass = "text-slate-400";
    let alert = null;

    if (apttResult > 0 && w > 0) {
      if (apttResult < 35) {
        action = `RE-BOLUS ${Math.round(w * 50)} UI y Aumentar infusión +${Math.round(w * 4)} UI/h`;
        nextDose = currentHeparinDose + (w * 4);
        controlTime = "3h";
        statusClass = "text-red-600 font-black";
      } else if (apttResult <= 45) {
        action = `RE-BOLUS ${Math.round(w * 20)} UI y Aumentar infusión +${Math.round(w * 2)} UI/h`;
        nextDose = currentHeparinDose + (w * 2);
        controlTime = "3h";
        statusClass = "text-amber-600 font-bold";
      } else if (apttResult <= 60) {
        action = `Aumentar infusión +${Math.round(w * 2)} UI/h`;
        nextDose = currentHeparinDose + (w * 2);
        controlTime = "3h";
        statusClass = "text-blue-600 font-bold";
      } else if (apttResult <= 70) {
        action = "RANGO META: Mantener infusión actual";
        nextDose = currentHeparinDose;
        controlTime = "4h";
        statusClass = "text-green-600 font-black";
      } else if (apttResult <= 90) {
        action = `Reducir infusión -${Math.round(w * 2)} UI/h`;
        nextDose = Math.max(0, currentHeparinDose - (w * 2));
        controlTime = "3h";
        statusClass = "text-amber-700 font-bold";
      } else {
        action = `SUSPENDER 60 min. Reiniciar reduciendo -${Math.round(w * 3)} UI/h`;
        nextDose = Math.max(0, currentHeparinDose - (w * 3));
        controlTime = "2h";
        alert = "⚠️ Riesgo de sangrado elevado";
        statusClass = "text-red-700 font-black";
      }
    }

    return { initialBolus, initialMnt, action, controlTime, nextDose, statusClass, alert };
  }, [patientWeight, apttResult, currentHeparinDose]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="space-y-8">
      {/* Selector Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(AnticoagulationType).map(type => (
          <button
            key={type}
            onClick={() => setPrescription(prev => ({ ...prev, anticoagulation: type }))}
            className={`py-4 px-6 rounded-2xl border-2 transition-all font-bold flex items-center gap-4 ${
              prescription.anticoagulation === type
                ? (type === AnticoagulationType.CITRATE ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-md' : 'bg-blue-50 border-blue-500 text-blue-700 shadow-md')
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
              prescription.anticoagulation === type ? (type === AnticoagulationType.CITRATE ? 'bg-rose-100' : 'bg-blue-100') : 'bg-slate-50'
            }`}>
              {type === AnticoagulationType.CITRATE && <i className="fas fa-lemon"></i>}
              {type === AnticoagulationType.HEPARIN && <i className="fas fa-syringe"></i>}
              {type === AnticoagulationType.NONE && <i className="fas fa-ban"></i>}
            </div>
            <span className="uppercase tracking-wider text-sm">{type}</span>
          </button>
        ))}
      </div>

      {/* --- PANEL CITRATO (ACD-A) --- */}
      {prescription.anticoagulation === AnticoagulationType.CITRATE && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><i className="fas fa-calculator text-8xl"></i></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                  <i className="fas fa-bolt"></i> Protocolo ACD-A
                </div>
                <h4 className="text-2xl font-black mb-1">Cálculo Inicial PBP</h4>
                <p className="text-slate-400 text-sm italic">Constante 0.03 (Qb {prescription.bloodFlow} ml/min)</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md px-10 py-6 rounded-3xl border border-white/10 text-center min-w-[200px]">
                <span className="block text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Flujo de Citrato</span>
                <span className="text-4xl font-black text-white">{citrateCalculations.initialPBP} <small className="text-sm font-bold text-slate-400">ml/h</small></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><i className="fas fa-filter"></i></div>
                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajuste Bomba PBP</h5>
                  <p className="text-sm font-bold text-slate-800">Ca++ Iónico Pos-filtro</p>
                </div>
              </div>
              <div className="relative">
                <input type="number" step="0.01" value={isNaN(postFilterCa) || !postFilterCa ? '' : postFilterCa} onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                  setPostFilterCa(isNaN(val) ? 0 : val);
                }} onFocus={handleFocus} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-3xl font-black text-center outline-none focus:border-blue-500 transition-all" placeholder="0.00"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">mmol/L</span>
              </div>
              <div className={`p-5 rounded-2xl text-center border-2 transition-all ${postFilterCa > 0 ? 'bg-white shadow-lg' : 'bg-slate-50 border-dashed border-slate-200'}`}>
                <span className={`text-sm tracking-tight ${citrateCalculations.pbpClass}`}>{citrateCalculations.pbpAdjustmentText}</span>
                {citrateCalculations.pbpAlert && <p className="mt-3 text-[10px] text-red-600 font-black animate-pulse">{citrateCalculations.pbpAlert}</p>}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><i className="fas fa-hand-holding-medical"></i></div>
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cloruro Calcio 10%</h5>
                    <p className="text-sm font-bold text-slate-800">Ca++ Iónico Sistémico</p>
                  </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  <button onClick={() => setIsInitialPhase(true)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${isInitialPhase ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Inicio</button>
                  <button onClick={() => setIsInitialPhase(false)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${!isInitialPhase ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>En Curso</button>
                </div>
              </div>
              <div className="relative">
                <input type="number" step="0.01" value={isNaN(systemicCa) || !systemicCa ? '' : systemicCa} onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                  setSystemicCa(isNaN(val) ? 0 : val);
                }} onFocus={handleFocus} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-3xl font-black text-center outline-none focus:border-emerald-500 transition-all" placeholder="0.00"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">mmol/L</span>
              </div>
              <div className={`p-5 rounded-2xl text-center border-2 transition-all ${systemicCa > 0 ? 'bg-white shadow-lg' : 'bg-slate-50 border-dashed border-slate-200'}`}>
                <span className={`text-sm tracking-tight ${citrateCalculations.systemicClass}`}>{citrateCalculations.systemicInfusion}</span>
                {citrateCalculations.systemicAlert && <p className="mt-3 text-[10px] text-rose-600 font-black animate-bounce">{citrateCalculations.systemicAlert}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PANEL HEPARINA v22.0 --- */}
      {prescription.anticoagulation === AnticoagulationType.HEPARIN && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Prescripción Inicial (HNF)</h4>
               <div className="space-y-4">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Bolo de Carga (50 UI/kg)</span>
                    <span className="text-3xl font-black text-white">{heparinCalculations.initialBolus} <small className="text-xs">UI</small></span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Mantenimiento (15 UI/kg/h)</span>
                    <span className="text-3xl font-black text-blue-400">{heparinCalculations.initialMnt} <small className="text-xs">UI/h</small></span>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><i className="fas fa-clock"></i></div>
                  <h5 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Monitoreo y Ajuste</h5>
               </div>
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Infusión Actual (UI/h)</label>
                    <input type="number" value={isNaN(currentHeparinDose) || !currentHeparinDose ? '' : currentHeparinDose} onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      setCurrentHeparinDose(isNaN(val) ? 0 : val);
                    }} onFocus={handleFocus} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-2xl font-black text-center focus:border-blue-500 transition-all"/>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">KPTT / aPTT Encontrado (seg)</label>
                    <input type="number" value={isNaN(apttResult) || !apttResult ? '' : apttResult} onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      setApttResult(isNaN(val) ? 0 : val);
                    }} onFocus={handleFocus} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-2xl font-black text-center focus:border-blue-500 transition-all"/>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-8 rounded-[2rem] border border-slate-200">
             <div className="flex flex-col md:flex-row items-center gap-8">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 ${apttResult > 0 ? 'bg-white shadow-lg' : 'bg-slate-100'}`}>
                  <i className={`fas fa-bolt text-2xl ${heparinCalculations.statusClass}`}></i>
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acción Sugerida v22.0</h4>
                   <p className={`text-lg leading-tight ${heparinCalculations.statusClass}`}>{heparinCalculations.action}</p>
                   <div className="flex gap-4 pt-2">
                      <div className="bg-white px-4 py-2 rounded-xl border border-slate-200">
                        <span className="text-[8px] font-black text-slate-400 uppercase block">Próximo Control</span>
                        <span className="text-sm font-black text-slate-700">{heparinCalculations.controlTime}</span>
                      </div>
                      {heparinCalculations.nextDose !== currentHeparinDose && (
                        <div className="bg-slate-900 px-4 py-2 rounded-xl text-white">
                          <span className="text-[8px] font-black text-blue-400 uppercase block">Nueva Tasa Estimada</span>
                          <span className="text-sm font-black">{heparinCalculations.nextDose} UI/h</span>
                        </div>
                      )}
                   </div>
                   {heparinCalculations.alert && <p className="text-[10px] text-red-600 font-black animate-pulse uppercase mt-2">{heparinCalculations.alert}</p>}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* PANEL NINGUNA */}
      {prescription.anticoagulation === AnticoagulationType.NONE && (
        <div className="p-12 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-ban text-slate-300 text-4xl"></i>
          </div>
          <h4 className="text-xl font-black text-slate-800 mb-2">Sin Anticoagulación Regional</h4>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">Se recomienda lavado intermitente con SF o uso de flujos altos para minimizar riesgo de coagulación del filtro.</p>
        </div>
      )}
    </div>
  );
};

export default AnticoagulationSelector;
