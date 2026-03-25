import React, { useEffect } from 'react';
import { PatientInfo, PatientSex } from '../types';

interface PatientFormProps {
  patient: PatientInfo;
  setPatient: React.Dispatch<React.SetStateAction<PatientInfo>>;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, setPatient }) => {
  useEffect(() => {
    if (patient.weight > 0 && patient.height > 0 && patient.age > 0) {
      let v = 0;

      if (patient.sex === PatientSex.MALE) {
        v =
          2.447 -
          0.09156 * patient.age +
          0.1074 * patient.height +
          0.3362 * patient.weight;
      } else {
        v =
          -2.097 +
          0.1069 * patient.height +
          0.2466 * patient.weight;
      }

      const bsa = Math.sqrt((patient.height * patient.weight) / 3600);

      setPatient(prev => ({
        ...prev,
        actV: Number(v.toFixed(2)),
        bsa: Number(bsa.toFixed(2)),
      }));
    }
  }, [patient.weight, patient.height, patient.age, patient.sex, setPatient]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setPatient(prev => {
      let newValue: any = value;

      // 🔥 CLAVE: sex NO se convierte a número
      if (
        name !== 'name' &&
        name !== 'accessType' &&
        name !== 'accessSide' &&
        name !== 'sex'
      ) {
        newValue = value === '' ? 0 : Number(value);
        if (isNaN(newValue)) newValue = 0;
      }

      return { ...prev, [name]: newValue };
    });
  };

  const labelClass =
    'text-[10px] font-black text-[#2C3E50] uppercase tracking-widest mb-2 block opacity-70';

  const inputClass =
    'w-full p-3 bg-white border border-[#E0E0E0] rounded focus:border-[#A80000] outline-none font-semibold text-sm transition-all';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className={labelClass}>Edad</label>
          <input
            type="number"
            name="age"
            value={patient.age || ''}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Peso (kg)</label>
          <input
            type="number"
            name="weight"
            value={patient.weight || ''}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Talla (cm)</label>
          <input
            type="number"
            name="height"
            value={patient.height || ''}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Sexo Biológico</label>
          <select
            name="sex"
            value={patient.sex}
            onChange={handleChange}
            className={inputClass}
          >
            <option value={PatientSex.MALE}>Hombre</option>
            <option value={PatientSex.FEMALE}>Mujer</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[#F8F9FA] rounded border border-[#E0E0E0] flex justify-between items-center text-xs font-bold">
          <span className="text-[#7F8C8D] uppercase tracking-wider">
            Volumen Distribución:
          </span>
          <span className="text-[#A80000] text-lg font-black">
            {patient.actV || '0'} L
          </span>
        </div>

        <div className="p-4 bg-[#F8F9FA] rounded border border-[#E0E0E0] flex justify-between items-center text-xs font-bold">
          <span className="text-[#7F8C8D] uppercase tracking-wider">
            Superficie Corporal:
          </span>
          <span className="text-[#2C3E50] text-lg font-black">
            {patient.bsa || '0'} m²
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
