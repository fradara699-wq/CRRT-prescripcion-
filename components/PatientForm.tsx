
import React, { useEffect } from 'react';
import { PatientInfo, PatientType, PatientSex, AccessType, AccessSide } from '../types';

interface PatientFormProps {
  patient: PatientInfo;
  setPatient: React.Dispatch<React.SetStateAction<PatientInfo>>;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, setPatient }) => {
  useEffect(() => {
    if (patient.weight > 0 && patient.height > 0 && patient.age > 0) {
      let v = 0;
      if (patient.sex === PatientSex.MALE) {
        v = 2.447 - (0.09156 * patient.age) + (0.1074 * patient.height) + (0.3362 * patient.weight);
      } else {
        v = -2.097 + (0.1069 * patient.height) + (0.2466 * patient.weight);
      }
      
      // BSA calculation (Mosteller)
      const bsa = Math.sqrt((patient.height * patient.weight) / 3600);
      
      setPatient(prev => ({ 
        ...prev, 
        actV: Number(v.toFixed(2)),
        bsa: Number(bsa.toFixed(2))
      }));
    }
  }, [patient.weight, patient.height, patient.age, patient.sex, setPatient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatient(prev => {
      let newValue: any = value;
      if (name !== 'name' && name !== 'accessType' && name !== 'accessSide') {
        newValue = value === '' ? 0 : Number(value);
        if (isNaN(newValue)) newValue = 0;
      }
      return { ...prev, [name]: newValue };
    });
  };

  const labelClass = "text-[10px] font-black text-[#2C3E50] uppercase tracking-widest mb-2 block opacity-70";
  const inputClass = "w-full p-3 bg-white border border-[#E0E0E0] rounded focus:border-[#A80000] outline-none font-semibold text-sm transition-all";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Identificación Paciente</label>
          <input type="text" name="name" value={patient.name} onChange={handleChange} className={inputClass} placeholder="ID / CAMA"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Vía de Acceso</label>
            <select name="accessType" value={patient.accessType} onChange={handleChange} className={inputClass}>
              <option value="">Seleccionar</option>
              <option value="Yugular">Yugular</option>
              <option value="Femoral">Femoral</option>
              <option value="Subclavia">Subclavia</option>
              <option value="Fístula A/V">Fístula A/V</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Lado / Ubic.</label>
            <select name="accessSide" value={patient.accessSide} onChange={handleChange} className={inputClass}>
              <option value="">Seleccionar</option>
              <option value="Derecho">Derecho</option>
              <option value="Derecha">Derecha</option>
              <option value="Izquierdo">Izquierdo</option>
              <option value="Izquierda">Izquierda</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className={labelClass}>Edad</label>
          <input type="number" name="age" value={isNaN(patient.age) || !patient.age ? '' : patient.age} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className={labelClass}>Peso (kg)</label>
          <input type="number" name="weight" value={isNaN(patient.weight) || !patient.weight ? '' : patient.weight} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className={labelClass}>Peso Ideal (kg)</label>
          <input type="number" name="idealWeight" value={isNaN(patient.idealWeight!) || !patient.idealWeight ? '' : patient.idealWeight} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className={labelClass}>Talla (cm)</label>
          <input type="number" name="height" value={isNaN(patient.height) || !patient.height ? '' : patient.height} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className={labelClass}>Sexo Biol.</label>
          <select name="sex" value={patient.sex} onChange={handleChange} className={inputClass}>
            <option value={PatientSex.MALE}>Hombre</option>
            <option value={PatientSex.FEMALE}>Mujer</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#F8F9FA] rounded border border-[#E0E0E0] flex justify-between items-center text-xs font-bold">
           <span className="text-[#7F8C8D] uppercase tracking-wider">Volumen Distribución (Watson V):</span>
           <span className="text-[#A80000] text-lg font-black">{patient.actV || '0'} L</span>
        </div>
        <div className="p-4 bg-[#F8F9FA] rounded border border-[#E0E0E0] flex justify-between items-center text-xs font-bold">
           <span className="text-[#7F8C8D] uppercase tracking-wider">Superficie Corporal (SC):</span>
           <span className="text-[#2C3E50] text-lg font-black">{patient.bsa || '0'} m²</span>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
