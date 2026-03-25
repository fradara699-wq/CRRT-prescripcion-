
import React, { useMemo, useEffect } from 'react';
import { 
  PrescriptionData, 
  MachineType, 
  ModalityType, 
  TreatmentCategory, 
  FILTER_CATALOG, 
  SLED_SURFACES,
  CrrtLiquidBrand,
  LIQUID_COMPOSITIONS,
  FilterFluxType,
  SledBicarbonateType,
  SLED_ACIDS
} from '../types';

interface ConfigurationGridProps {
  prescription: PrescriptionData;
  setPrescription: React.Dispatch<React.SetStateAction<PrescriptionData>>;
  patientWeight: number;
  netUF: number;
}

const ConfigurationGrid: React.FC<ConfigurationGridProps> = ({ prescription, setPrescription, patientWeight, netUF }) => {
  const isSled = prescription.category === TreatmentCategory.SLED;
  
  const suggestedEffluent = useMemo(() => {
    if (patientWeight <= 0) return 0;
    return Math.round(prescription.targetDose * patientWeight);
  }, [prescription.targetDose, patientWeight]);

  // Automatización instantánea de efluentes
  useEffect(() => {
    if (!isSled && suggestedEffluent > 0) {
      let dFlow = 0;
      let rPre = 0;
      let rPost = 0;

      switch (prescription.modality) {
        case ModalityType.CVVHDF:
          dFlow = Math.round(suggestedEffluent * 0.5);
          rPost = Math.round(suggestedEffluent * 0.5);
          rPre = 0;
          break;
        case ModalityType.CVVHD:
          dFlow = suggestedEffluent;
          rPre = 0;
          rPost = 0;
          break;
        case ModalityType.CVVH:
          rPre = Math.round(suggestedEffluent * 0.3);
          rPost = Math.round(suggestedEffluent * 0.7);
          dFlow = 0;
          break;
        default:
          dFlow = suggestedEffluent;
      }

      setPrescription(prev => ({
        ...prev,
        dialysateFlow: dFlow,
        replacementFlowPre: rPre,
        replacementFlowPost: rPost
      }));
    }
  }, [prescription.modality, suggestedEffluent, isSled, setPrescription]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'machine') {
      const machineValue = value as MachineType;
      setPrescription(prev => ({ 
        ...prev, 
        machine: machineValue, 
        filterModel: isSled ? 'SLED-Filter' : 'ST Set 100',
        filterSurface: isSled ? 1.5 : 1.0,
        filterFluxType: isSled ? FilterFluxType.LOW : FilterFluxType.HIGH
      }));
    } else if (name === 'crrtLiquidBrand') {
      const brand = value as CrrtLiquidBrand;
      const defaultKey = brand === CrrtLiquidBrand.HBIOFLUIDS ? 'HB_2.5' : (brand === CrrtLiquidBrand.MULTIBIC ? 'MB_2.0' : '');
      setPrescription(prev => ({ ...prev, crrtLiquidBrand: brand, crrtLiquidKey: defaultKey }));
    } else {
      const numValue = value === '' ? 0 : Number(value);
      const safeValue = isNaN(numValue) ? 0 : numValue;
      setPrescription(prev => ({ 
        ...prev, 
        [name]: (name.includes('Flow') || name === 'targetDose' || name === 'treatmentTime' || name === 'filterSurface' || name === 'filterKuf') ? safeValue : value 
      }));
    }
  };

  const labelClass = "text-[10px] font-black text-[#2C3E50] uppercase tracking-widest mb-2 block opacity-70";
  const inputClass = "w-full p-3 bg-white border border-[#E0E0E0] rounded focus:border-[#A80000] outline-none font-semibold text-sm transition-all shadow-sm";

  return (
    <div className="space-y-8">
      {/* 1. Hardware y Modalidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Hardware / Máquina</label>
          <select name="machine" value={prescription.machine} onChange={handleChange} className={inputClass}>
            {Object.values(MachineType).filter(m => {
              const isSledMachine = m.includes('4008') || m.includes('5008') || m.includes('Dialog');
              return isSled ? isSledMachine : !isSledMachine;
            }).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Modalidad</label>
          <select name="modality" value={prescription.modality} onChange={handleChange} className={inputClass}>
             {isSled ? (
               <>
                 <option value={ModalityType.SLED_HD}>SLED HD</option>
                 <option value={ModalityType.SLED_HDF}>SLED-HDF</option>
               </>
             ) : (
               <>
                 <option value={ModalityType.CVVHDF}>CVVHDF (Híbrida)</option>
                 <option value={ModalityType.CVVH}>CVVH (Convectiva)</option>
                 <option value={ModalityType.CVVHD}>CVVHD (Difusiva)</option>
                 <option value={ModalityType.SCUF}>SCUF (Ultrafiltración)</option>
               </>
             )}
          </select>
        </div>
      </div>

      {/* 2. Composición Electrolítica (Solo CRRT) o Insumos SLED */}
      {!isSled ? (
        <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm space-y-6">
          <h3 className="text-[10px] font-black text-[#A80000] uppercase tracking-[0.2em] border-b pb-2">🧪 Composición Electrolítica de Líquidos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Marca / Fabricante</label>
              <select name="crrtLiquidBrand" value={prescription.crrtLiquidBrand} onChange={handleChange} className={inputClass}>
                <option value={CrrtLiquidBrand.HBIOFLUIDS}>HBiofluids</option>
                <option value={CrrtLiquidBrand.MULTIBIC}>MultiBic (Fresenius)</option>
                <option value={CrrtLiquidBrand.OTHER}>Otras</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Perfil Electrolítico (K/Bic/Cl)</label>
              <select name="crrtLiquidKey" value={prescription.crrtLiquidKey} onChange={handleChange} className={inputClass}>
                {Object.entries(LIQUID_COMPOSITIONS)
                  .filter(([key]) => {
                    if (prescription.crrtLiquidBrand === CrrtLiquidBrand.HBIOFLUIDS) return key.startsWith('HB');
                    if (prescription.crrtLiquidBrand === CrrtLiquidBrand.MULTIBIC) return key.startsWith('MB');
                    return false;
                  })
                  .map(([key, comp]) => (
                    <option key={key} value={key}>{comp.desc}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm space-y-6">
          <h3 className="text-[10px] font-black text-[#A80000] uppercase tracking-[0.2em] border-b pb-2">📦 Insumos Específicos SLED (Fresenius)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Concentrado Ácido (SK-F / Kdial)</label>
              <select name="sledAcidConcentrate" value={prescription.sledAcidConcentrate || ''} onChange={handleChange} className={inputClass}>
                <option value="">Seleccionar...</option>
                {SLED_ACIDS.map(acid => (
                  <option key={acid.id} value={acid.id}>{acid.desc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Amortiguador (Bicarbonato)</label>
              <select name="sledBicarbonateType" value={prescription.sledBicarbonateType || ''} onChange={handleChange} className={inputClass}>
                <option value="">Seleccionar...</option>
                {Object.values(SledBicarbonateType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Celda de Bicarbonato (mS/cm)</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="sledBicarbonateCell" 
                  placeholder="Ej. 32"
                  value={prescription.sledBicarbonateCell || ''} 
                  onChange={handleChange} 
                  className={inputClass}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">mEq/L</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Filtro y Qb */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isSled ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tipo de Flujo</label>
              <select name="filterFluxType" value={prescription.filterFluxType} onChange={handleChange} className={inputClass}>
                <option value={FilterFluxType.LOW}>Bajo Flujo</option>
                <option value={FilterFluxType.HIGH}>Alto Flujo</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Superficie (m²)</label>
              <select name="filterSurface" value={prescription.filterSurface} onChange={handleChange} className={inputClass}>
                {SLED_SURFACES.map(s => <option key={s} value={s}>{s} m²</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>KUF (ml/h/mmHg)</label>
              <input 
                type="number" 
                name="filterKuf" 
                value={isNaN(prescription.filterKuf!) || !prescription.filterKuf ? '' : prescription.filterKuf} 
                onChange={handleChange} 
                className={inputClass}
                placeholder="Ej. 40"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className={labelClass}>Filtro / Membrana Seleccionada</label>
            <select name="filterModel" value={prescription.filterModel} onChange={(e) => {
              const val = e.target.value;
              const catalog = Object.values(FILTER_CATALOG).flat();
              const info = catalog.find(m => m.name === val);
              setPrescription(prev => ({ ...prev, filterModel: val, filterSurface: info?.surface || 0 }));
            }} className={inputClass}>
              {Object.entries(FILTER_CATALOG).map(([category, filters]) => (
                  <optgroup key={category} label={category}>
                    {filters.map(f => (
                      <option key={f.name} value={f.name}>{f.name} ({f.surface} m²)</option>
                    ))}
                  </optgroup>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={labelClass}>Flujo Sangre (Qb)</label>
          <div className="relative">
             <input type="number" name="bloodFlow" value={isNaN(prescription.bloodFlow) || !prescription.bloodFlow ? '' : prescription.bloodFlow} onChange={handleChange} className={inputClass}/>
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">mL/min</span>
          </div>
        </div>
      </div>

      {/* 4. Parámetros de Flujo y Dosis (Final de la configuración) */}
      <div className="bg-[#F8F9FA] p-6 rounded-lg border border-[#E0E0E0] space-y-6 shadow-inner">
        <div className="flex justify-between items-center border-b border-[#E0E0E0] pb-4">
           <h3 className="text-[11px] font-black text-[#A80000] uppercase tracking-[0.2em]">Cálculo de Flujos & Dosimetría</h3>
           {!isSled && <span className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black uppercase">Auto-Sincronizado</span>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className={labelClass}>{isSled ? 'Tiempo Tratamiento (Horas)' : 'Dosis Objetivo (mL/kg/h)'}</label>
              <input 
                type="number" 
                name={isSled ? 'treatmentTime' : 'targetDose'} 
                value={(isSled ? (isNaN(prescription.treatmentTime) || !prescription.treatmentTime ? '' : prescription.treatmentTime) : (isNaN(prescription.targetDose) || !prescription.targetDose ? '' : prescription.targetDose))} 
                onChange={handleChange} 
                className={inputClass}
              />
           </div>
           <div className="flex flex-col justify-center items-center bg-white border border-[#E0E0E0] rounded-lg p-4 shadow-sm">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{isSled ? 'Dosimetría Estimada' : 'Efluente Total'}</span>
               <span className="text-2xl font-black text-[#2C3E50]">
                  {isSled ? '---' : `${suggestedEffluent} mL/h`}
               </span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>{isSled ? 'Q. Dializado (mL/min)' : '💧 Q. Dializado (Qd) (mL/h)'}</label>
            <input type="number" name="dialysateFlow" value={isNaN(prescription.dialysateFlow) || !prescription.dialysateFlow ? '' : prescription.dialysateFlow} onChange={handleChange} className={`${inputClass} font-black`}/>
          </div>
          {!isSled && (
            <>
              <div>
                <label className={labelClass}>💉 Reposición PRE (mL/h)</label>
                <input type="number" name="replacementFlowPre" value={isNaN(prescription.replacementFlowPre) || !prescription.replacementFlowPre ? '' : prescription.replacementFlowPre} onChange={handleChange} className={`${inputClass} font-black`}/>
              </div>
              <div>
                <label className={labelClass}>💉 Reposición POST (mL/h)</label>
                <input type="number" name="replacementFlowPost" value={isNaN(prescription.replacementFlowPost) || !prescription.replacementFlowPost ? '' : prescription.replacementFlowPost} onChange={handleChange} className={`${inputClass} font-black`}/>
              </div>
            </>
          )}
          {isSled && prescription.modality === ModalityType.SLED_HDF && (
            <div>
              <label className={labelClass}>Reposición HDF (mL/h)</label>
              <input type="number" name="replacementFlowPost" value={isNaN(prescription.replacementFlowPost) || !prescription.replacementFlowPost ? '' : prescription.replacementFlowPost} onChange={handleChange} className={inputClass}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationGrid;
