
import React from 'react';
import { BalanceData, ModalityType, TreatmentCategory } from '../types';

interface BalanceCalculatorProps {
  balance: BalanceData;
  setBalance: React.Dispatch<React.SetStateAction<BalanceData>>;
  netUF: number;
  modality: ModalityType;
  totalSledUF: number;
  setPrescription: any;
  category: TreatmentCategory;
}

const BalanceCalculator: React.FC<BalanceCalculatorProps> = ({ 
  balance, 
  setBalance, 
  netUF, 
  modality, 
  totalSledUF,
  setPrescription,
  category
}) => {
  const isSled = category === TreatmentCategory.SLED;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : Number(value);
    const safeValue = isNaN(numValue) ? 0 : numValue;
    
    if (name === 'totalSledUF') {
      setPrescription((prev: any) => ({ ...prev, totalSledUF: safeValue }));
    } else {
      setBalance(prev => ({ ...prev, [name]: safeValue }));
    }
  };

  const labelClass = "text-[10px] font-black text-[#2C3E50] uppercase tracking-widest mb-3 block opacity-70 text-center";
  const inputClass = "w-full p-4 bg-white border border-[#E0E0E0] rounded focus:border-[#A80000] outline-none font-black text-3xl text-center transition-all";

  if (isSled) {
    return (
      <div className="p-8 bg-[#2C3E50] rounded-lg text-white shadow-lg border-l-8 border-[#A80000]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-[#A80000] border border-white/10">
            <i className="fas fa-droplet-slash text-2xl"></i>
          </div>
          
          <div className="w-full max-w-xs text-center space-y-4">
            <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Remoción Total SLED</h3>
            <input
              type="number"
              name="totalSledUF"
              value={isNaN(totalSledUF) || !totalSledUF ? '' : totalSledUF}
              onChange={handleChange}
              className="w-full py-6 bg-white/5 border-2 border-white/10 rounded text-5xl font-black text-white text-center focus:border-[#A80000] outline-none"
              placeholder="0"
            />
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Ultrafiltración neta por sesión (mL)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={labelClass}>Aportes Horarios Totales (mL/h)</label>
          <input
            type="number"
            name="intakeHourly"
            value={isNaN(balance.intakeHourly) || !balance.intakeHourly ? '' : balance.intakeHourly}
            onChange={handleChange}
            className={inputClass}
            placeholder="0"
          />
          <p className="mt-2 text-[9px] text-center text-slate-400 font-bold uppercase tracking-tighter">Suma de infusiones, drogas y dieta</p>
        </div>
        <div>
          <label className={labelClass}>Meta Balance Negativo 24h (mL)</label>
          <input
            type="number"
            name="desiredBalance24h"
            value={isNaN(balance.desiredBalance24h) || !balance.desiredBalance24h ? '' : balance.desiredBalance24h}
            onChange={handleChange}
            className={inputClass}
            placeholder="0"
          />
          <p className="mt-2 text-[9px] text-center text-[#A80000] font-bold uppercase tracking-tighter">Volumen extra a extraer en 1 día</p>
        </div>
      </div>

      <div className="p-8 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0] flex flex-col md:flex-row items-center justify-between premium-shadow gap-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-[#A80000]/5 text-[#A80000] rounded-full flex items-center justify-center border border-[#A80000]/10">
            <i className="fas fa-water text-xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-[#2C3E50] uppercase tracking-widest opacity-60">Programación UF Neta</p>
            <p className="text-xs text-slate-500 font-bold uppercase">Meta Horaria v18.0</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-[#A80000]">{netUF}</span>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">mL/h</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase mt-1">Sugerido para bomba</span>
        </div>
      </div>
    </div>
  );
};

export default BalanceCalculator;
