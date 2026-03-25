
import React, { useMemo } from 'react';
import { SodiumData } from '../types';

interface SodiumCalculatorProps {
  sodium: SodiumData;
  setSodium: React.Dispatch<React.SetStateAction<SodiumData>>;
}

const SodiumCalculator: React.FC<SodiumCalculatorProps> = ({ sodium, setSodium }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : Number(value);
    const safeValue = isNaN(numValue) ? 0 : numValue;
    setSodium(prev => ({ ...prev, [name]: safeValue }));
  };

  const results = useMemo(() => {
    if (sodium.currentNa === 0 || sodium.targetNa24h === 0) return null;

    const naChange = sodium.targetNa24h - sodium.currentNa;
    const isHyponatremia = naChange > 0;
    const absChange = Math.abs(naChange);
    const requiredFluidNa = sodium.targetNa24h;

    // --- SUBIR SODIO (Bolsa < Objetivo) ---
    let hypernatremiaInstruction = null;
    if (requiredFluidNa > sodium.fluidNaBase) {
      const extraNaNeededPerLiter = requiredFluidNa - sodium.fluidNaBase;
      const totalExtraNaPer5L = extraNaNeededPerLiter * 5;
      const mlNaCl20 = totalExtraNaPer5L / 3.42; 
      const amps20cc = mlNaCl20 / 20;
      
      hypernatremiaInstruction = {
        totalMl: mlNaCl20.toFixed(1),
        totalAmps: amps20cc.toFixed(2),
        text: `Adición de concentrado de Sodio al 20% (NaCl)`
      };
    }

    // --- BAJAR SODIO (Bolsa > Objetivo) ---
    let hyponatremiaInstructions = null;
    if (requiredFluidNa < sodium.fluidNaBase) {
      const finalVolMethod1 = (5 * sodium.fluidNaBase) / requiredFluidNa; 
      const waterToAddMethod1 = (finalVolMethod1 - 5) * 1000; 
      const volumeToExchangeMethod2 = 5000 * (1 - (requiredFluidNa / sodium.fluidNaBase));

      hyponatremiaInstructions = {
        method1: {
          waterMl: waterToAddMethod1.toFixed(0),
          finalVol: (finalVolMethod1 * 1000).toFixed(0),
        },
        method2: {
          exchangeMl: volumeToExchangeMethod2.toFixed(0),
        }
      };
    }

    return {
      naChange,
      absChange,
      isHyponatremia,
      isFluidDilution: requiredFluidNa < sodium.fluidNaBase,
      isFluidConcentration: requiredFluidNa > sodium.fluidNaBase,
      requiredFluidNa,
      hypernatremiaInstruction,
      hyponatremiaInstructions,
      warning: (isHyponatremia && absChange > 8) || (!isHyponatremia && absChange > 10)
    };
  }, [sodium]);

  return (
    <div className="space-y-10 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Na+ Paciente (Actual)</label>
          <div className="relative group">
            <input
              type="number"
              name="currentNa"
              value={isNaN(sodium.currentNa) || sodium.currentNa === 0 ? '' : sodium.currentNa}
              onChange={handleChange}
              className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-3xl font-black text-slate-800 focus:border-blue-500 outline-none text-center shadow-inner transition-all group-hover:scale-[1.01]"
              placeholder="000"
            />
            <span className="absolute bottom-[-1.5rem] left-0 right-0 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">mEq/L</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block text-center">Na+ Objetivo (24h)</label>
          <div className="relative group">
            <input
              type="number"
              name="targetNa24h"
              value={isNaN(sodium.targetNa24h) || sodium.targetNa24h === 0 ? '' : sodium.targetNa24h}
              onChange={handleChange}
              className="w-full px-6 py-5 bg-indigo-50/30 border-2 border-indigo-100 rounded-[1.5rem] text-3xl font-black text-indigo-900 focus:border-indigo-500 outline-none text-center shadow-inner transition-all group-hover:scale-[1.01]"
              placeholder="000"
            />
            <span className="absolute bottom-[-1.5rem] left-0 right-0 text-center text-[9px] font-bold text-indigo-400 uppercase tracking-widest">mEq/L</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Na+ Base Bolsa Comercial</label>
          <div className="relative group">
            <input
              type="number"
              name="fluidNaBase"
              value={isNaN(sodium.fluidNaBase) ? '' : sodium.fluidNaBase}
              onChange={handleChange}
              className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-3xl font-black text-slate-400 focus:border-slate-300 outline-none text-center shadow-inner opacity-60 transition-all"
            />
            <span className="absolute bottom-[-1.5rem] left-0 right-0 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estándar 140 mEq/L</span>
          </div>
        </div>
      </div>

      {results && (
        <div className={`mt-12 p-8 rounded-[2rem] border-2 transition-all ${results.warning ? 'bg-red-50 border-red-200 shadow-2xl shadow-red-100' : 'bg-blue-50/50 border-blue-100'}`}>
          <div className="flex flex-col md:flex-row gap-8">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 mx-auto md:mx-0 ${results.warning ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'bg-blue-600 text-white shadow-xl shadow-blue-200 animate-pulse'}`}>
              <i className={`fas ${results.warning ? 'fa-triangle-exclamation' : 'fa-vial-circle-check'} text-3xl`}></i>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="mb-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-2">
                  Plan de Preparación del Líquido
                  {results.warning && <span className="text-[9px] bg-red-600 text-white px-2 py-1 rounded font-bold uppercase tracking-tight">¡Límite Excedido!</span>}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Sodio Plasmático Programado: <span className="text-slate-900 font-bold">{sodium.targetNa24h} mEq/L</span> (Cambio: {results.absChange} mEq/L/24h)
                </p>
              </div>

              {results.isFluidConcentration && results.hypernatremiaInstruction && (
                <div className="bg-white p-6 rounded-[1.5rem] border border-blue-100 shadow-sm inline-block w-full">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Manejo de Hipernatremia: Concentración de Bolsa</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <span className="block text-[9px] text-blue-600 font-black uppercase mb-1">Volumen NaCl 20%</span>
                      <span className="text-3xl font-black text-blue-900">{results.hypernatremiaInstruction.totalMl} <small className="text-sm font-bold">ml</small></span>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <span className="block text-[9px] text-blue-600 font-black uppercase mb-1">Ampollas (20cc)</span>
                      <span className="text-3xl font-black text-blue-900">{results.hypernatremiaInstruction.totalAmps}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-[11px] text-blue-800 font-medium italic">Instrucción: Inyectar el volumen calculado de NaCl al 20% en la bolsa de 5L y agitar suavemente.</p>
                </div>
              )}

              {results.isFluidDilution && results.hyponatremiaInstructions && (
                <div className="space-y-6">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Manejo de Hiponatremia: Dilución de Bolsa</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Método A */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-indigo-100 shadow-sm group">
                      <div className="flex items-center gap-2 mb-3">
                         <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">A</div>
                         <h4 className="text-[11px] font-black text-slate-800 uppercase">Sin Retirar Volumen</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-4 leading-snug">Se añade agua directamente. Volumen final de la bolsa: {results.hyponatremiaInstructions.method1.finalVol} ml.</p>
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                        <span className="block text-[9px] text-indigo-600 font-black uppercase mb-1">Agua Destilada Extra</span>
                        <span className="text-2xl font-black text-indigo-900">{results.hyponatremiaInstructions.method1.waterMl} ml</span>
                      </div>
                    </div>

                    {/* Método B */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                         <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px] font-bold">B</div>
                         <h4 className="text-[11px] font-black text-slate-800 uppercase">Retirar y Sustituir</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-4 leading-snug">Se mantiene el volumen en 5000 ml mediante intercambio. Técnica más precisa para bombas.</p>
                      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-center">
                        <span className="block text-[9px] text-slate-500 font-black uppercase mb-1">Volumen a Intercambiar</span>
                        <span className="text-2xl font-black text-slate-900">{results.hyponatremiaInstructions.method2.exchangeMl} ml</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SodiumCalculator;
