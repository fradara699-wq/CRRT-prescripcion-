
import React from 'react';
import { 
  PatientInfo, 
  PrescriptionData, 
  TreatmentCategory,
  BalanceData,
  SodiumData,
  ModalityType,
  LIQUID_COMPOSITIONS,
  AnticoagulationType
} from '../types';

interface PrescriptionSummaryProps {
  patient: PatientInfo;
  prescription: PrescriptionData;
  sodium: SodiumData;
  netUF: number;
  deliveredDose: number;
  activeView: string;
  balance: BalanceData;
}

const PrescriptionSummary: React.FC<PrescriptionSummaryProps> = ({ 
  patient, 
  prescription, 
  netUF, 
  deliveredDose,
}) => {
  const isSled = prescription.category === TreatmentCategory.SLED;
  const currentLiquid = LIQUID_COMPOSITIONS[prescription.crrtLiquidKey];

  const suggestedEffluent = patient.weight > 0 ? Math.round(prescription.targetDose * patient.weight) : 0;

  const ktv = isSled && patient.actV && patient.actV > 0 
    ? ((prescription.dialysateFlow * 60 / 1000) * prescription.treatmentTime / patient.actV).toFixed(2)
    : '---';

  // Lógica de Nomograma de Heparina (v22.0) para el reporte
  const initialBolus = Math.round(patient.weight * 50);
  const initialMnt = Math.round(patient.weight * 15);

  const HeparinReport = () => (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderLeft: '8px solid #A80000', 
      borderRight: '1px solid #E0E0E0', 
      borderTop: '1px solid #E0E0E0', 
      borderBottom: '1px solid #E0E0E0', 
      padding: '20px', 
      color: '#2C3E50', 
      fontFamily: "'Segoe UI', Roboto, sans-serif", 
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
      borderRadius: '4px',
      marginBottom: '25px'
    }}>
      <h2 style={{ color: '#A80000', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #EEE', paddingBottom: '10px', marginTop: '0', fontSize: '1rem', fontWeight: '900' }}> 
        💉 Protocolo Anticoagulación: Heparina 
      </h2>
      <div style={{ backgroundColor: '#F8F9FA', borderRadius: '4px', padding: '15px', marginTop: '10px' }}>
        <span style={{ display: 'block', color: '#7F8C8D', fontSize: '0.8em', textTransform: 'uppercase', fontWeight: 'bold' }}> Prescripción Inicial (Peso: {patient.weight} kg) </span>
        <p style={{ margin: '5px 0', fontSize: '1.2em' }}> Bolo: <b>{initialBolus} UI</b> | Mantenimiento: <b style={{ color: '#A80000' }}>{initialMnt} UI/h</b> </p>
      </div>
      <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed #A80000', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#A80000', fontWeight: '900' }}> ⚡ AJUSTE SEGÚN KPTT ACTUAL </h4>
        <p style={{ fontSize: '1.1em', margin: '5px 0' }}> KPTT Encontrado: <b>--- seg</b> </p>
        <p style={{ background: '#FFF', padding: '10px', border: '1px solid #EEE', fontSize: '0.9rem', borderRadius: '4px' }}> <b>ACCIÓN:</b> Pendiente de primer control post-bolo </p>
        <p style={{ fontSize: '0.9em', color: '#7F8C8D', margin: '5px 0' }}> 🕒 Próximo control: <b>---</b> </p>
      </div>
    </div>
  );

  const DosimetryBlock = () => (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderLeft: '8px solid #A80000', 
      borderRight: '1px solid #E0E0E0', 
      borderTop: '1px solid #E0E0E0', 
      borderBottom: '1px solid #E0E0E0', 
      padding: '20px', 
      color: '#2C3E50', 
      fontFamily: "'Inter', sans-serif", 
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
      borderRadius: '4px',
      marginBottom: '25px'
    }}>
      <h2 style={{ color: '#A80000', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #EEE', paddingBottom: '10px', margin: '0 0 15px 0', fontSize: '1rem', fontWeight: '900' }}> 
        🏥 Cálculo de Dosis y Efluente 
      </h2>
      <div style={{ display: 'flex', justifyContent: 'space-around', background: '#F8F9FA', padding: '15px', border: '1px solid #DDD', borderRadius: '4px' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', color: '#7F8C8D', fontSize: '0.7em', fontWeight: 'bold' }}> DOSIS OBJETIVO </span>
          <span style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#A80000' }}> {prescription.targetDose} <small style={{ fontSize: '0.6em' }}>mL/kg/h</small> </span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', color: '#7F8C8D', fontSize: '0.7em', fontWeight: 'bold' }}> EFLUENTE TOTAL </span>
          <span style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#2C3E50' }}> {suggestedEffluent} <small style={{ fontSize: '0.6em' }}>mL/h</small> </span>
        </div>
      </div>

      <h4 style={{ margin: '20px 0 10px 0', color: '#A80000', fontSize: '0.8em', textTransform: 'uppercase', borderBottom: '1px solid #F0F0F0', fontWeight: '900' }}> 
        ⚙️ Reparto Automático de Bombas ({prescription.modality}) 
      </h4>

      <table style={{ width: '100%', fontSize: '0.9em' }}>
        <tbody>
          <tr>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #F9F9F9' }}> 💧 <b>Q. Dializado (Qd):</b> </td>
            <td style={{ textAlign: 'right', padding: '8px 0', borderBottom: '1px solid #F9F9F9' }}> <b>{prescription.dialysateFlow} mL/h</b> </td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', borderBottom: '1px solid #F9F9F9' }}> 💉 <b>Q. Reposición Pre:</b> </td>
            <td style={{ textAlign: 'right', padding: '8px 0', borderBottom: '1px solid #F9F9F9' }}> <b>{prescription.replacementFlowPre} mL/h</b> </td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0' }}> 💉 <b>Q. Reposición Post:</b> </td>
            <td style={{ textAlign: 'right', padding: '8px 0' }}> <b>{prescription.replacementFlowPost} mL/h</b> </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  if (isSled) {
    return (
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderLeft: '10px solid #A80000', 
        borderRight: '1px solid #E0E0E0', 
        borderTop: '1px solid #E0E0E0', 
        borderBottom: '1px solid #E0E0E0', 
        padding: '28px', 
        color: '#2C3E50', 
        fontFamily: "'Inter', sans-serif", 
        boxShadow: '0 15px 35px rgba(0,0,0,0.08)', 
        borderRadius: '12px',
        animation: 'fade-in 0.8s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '2px solid #F5F5F5', paddingBottom: '15px', marginBottom: '25px' }}>
          <h2 style={{ color: '#A80000', textTransform: 'uppercase', letterSpacing: '3px', margin: '0', fontSize: '1.2rem', fontWeight: '900' }}>
            ⚡ PROTOCOLO TÉCNICO SLED-HÍBRIDA
          </h2>
          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#BDC3C7', letterSpacing: '1px' }}>v22.0 PREMIUM</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
          <div style={{ backgroundColor: '#F8F9FA', borderLeft: '4px solid #A80000', padding: '15px', borderRadius: '6px' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#7F8C8D', textTransform: 'uppercase', fontWeight: '800' }}>Eficacia (Kt/V)</span>
            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#A80000' }}>{ktv}</span>
            <span style={{ display: 'block', fontSize: '0.6rem', color: '#95A5A6' }}>Basado en V Watson: {patient.actV} L</span>
          </div>
          <div style={{ backgroundColor: '#2C3E50', color: 'white', padding: '15px', borderRadius: '6px' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#BDC3C7', textTransform: 'uppercase', fontWeight: '800' }}>UF Neta Total</span>
            <span style={{ fontSize: '1.8rem', fontWeight: '900' }}>{prescription.totalSledUF} <small style={{ fontSize: '0.8rem' }}>mL</small></span>
            <span style={{ display: 'block', fontSize: '0.6rem', color: '#BDC3C7' }}>Remoción programada por sesión</span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: '#7F8C8D', textTransform: 'uppercase', borderBottom: '1px solid #EEE' }}>
              <th style={{ padding: '10px' }}>Configuración</th>
              <th style={{ padding: '10px' }}>Hardware</th>
              <th style={{ padding: '10px' }}>Flujos</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{prescription.modality}</div>
                <div style={{ fontSize: '0.7rem', color: '#95A5A6' }}>Sesión {prescription.treatmentTime}h</div>
              </td>
              <td style={{ padding: '10px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{prescription.machine.split('(')[0]}</div>
                <div style={{ fontSize: '0.7rem', color: '#95A5A6' }}>{prescription.filterFluxType} - {prescription.filterSurface} m²</div>
                <div style={{ fontSize: '0.7rem', color: '#95A5A6' }}>KUF: {prescription.filterKuf || '---'} ml/h/mmHg</div>
              </td>
              <td style={{ padding: '10px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>Qb {prescription.bloodFlow} mL/min</div>
                <div style={{ fontSize: '0.9rem', color: '#A80000', fontWeight: '800' }}>Qd {prescription.dialysateFlow} mL/min</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginBottom: '25px', border: '1px solid #E0E0E0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#2C3E50', color: 'white', padding: '12px 20px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' }}>
             <span>🧪 Líquido de Diálisis: {prescription.sledAcidConcentrate || 'No seleccionado'}</span>
             <span>{prescription.sledBicarbonateType || 'Bic: 35 mEq/L'}</span>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#FAFAFA', fontSize: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div style={{ background: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #EEE' }}>
                 <span style={{ display: 'block', fontSize: '0.55rem', color: '#7F8C8D', fontWeight: '800' }}>K+</span>
                 <span style={{ fontSize: '1rem', fontWeight: '900', color: '#A80000' }}>{prescription.sledAcidConcentrate?.includes('1.0') ? '1.0' : prescription.sledAcidConcentrate?.includes('2.0') ? '2.0' : prescription.sledAcidConcentrate?.includes('3.0') ? '3.0' : prescription.sledAcidConcentrate?.includes('4.0') ? '4.0' : '---'}</span>
              </div>
              <div style={{ background: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #EEE' }}>
                 <span style={{ display: 'block', fontSize: '0.55rem', color: '#7F8C8D', fontWeight: '800' }}>Ca2+</span>
                 <span style={{ fontSize: '1rem', fontWeight: '900', color: '#2C3E50' }}>{prescription.sledAcidConcentrate?.includes('3.5') ? '3.5' : '2.5'}</span>
              </div>
              <div style={{ background: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #EEE' }}>
                 <span style={{ display: 'block', fontSize: '0.55rem', color: '#7F8C8D', fontWeight: '800' }}>Mg2+</span>
                 <span style={{ fontSize: '1rem', fontWeight: '900', color: '#2C3E50' }}>1.0</span>
              </div>
              <div style={{ background: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #EEE' }}>
                 <span style={{ display: 'block', fontSize: '0.55rem', color: '#7F8C8D', fontWeight: '800' }}>Na+</span>
                 <span style={{ fontSize: '1rem', fontWeight: '900', color: '#2C3E50' }}>140</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.6rem', color: '#BDC3C7', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700', borderTop: '1px solid #FAFAFA', paddingTop: '15px' }}>
          PROTOCOLO SLED v22.0 • ESPECIALIZADO CULLEN PRO
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      borderLeft: '10px solid #A80000', 
      borderRight: '1px solid #E0E0E0', 
      borderTop: '1px solid #E0E0E0', 
      borderBottom: '1px solid #E0E0E0', 
      padding: '28px', 
      color: '#2C3E50', 
      fontFamily: "'Inter', sans-serif", 
      boxShadow: '0 15px 35px rgba(0,0,0,0.08)', 
      borderRadius: '12px' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '2px solid #F5F5F5', paddingBottom: '15px', marginBottom: '25px' }}>
        <h2 style={{ color: '#A80000', textTransform: 'uppercase', letterSpacing: '3px', margin: '0', fontSize: '1.2rem', fontWeight: '900' }}>
          🌀 PROTOCOLO TÉCNICO CRRT
        </h2>
        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#BDC3C7', letterSpacing: '1px' }}>v22.0 PREMIUM</span>
      </div>

      <DosimetryBlock />

      {prescription.anticoagulation === AnticoagulationType.HEPARIN && <HeparinReport />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#FFF9F9', border: '1px solid #FFE0E0', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.6rem', color: '#7F8C8D', textTransform: 'uppercase', fontWeight: '800' }}>Dosis Real</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#A80000' }}>{deliveredDose}</span>
          <span style={{ fontSize: '0.6rem', color: '#A80000', display: 'block' }}>mL/kg/h</span>
        </div>
        <div style={{ backgroundColor: '#F8F9FA', border: '1px solid #EEE', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.6rem', color: '#7F8C8D', textTransform: 'uppercase', fontWeight: '800' }}>UF Neta Programada</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#27AE60' }}>{netUF}</span>
          <span style={{ fontSize: '0.6rem', color: '#27AE60', display: 'block' }}>mL/h</span>
        </div>
        <div style={{ backgroundColor: '#F8F9FA', border: '1px solid #EEE', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.6rem', color: '#7F8C8D', textTransform: 'uppercase', fontWeight: '800' }}>Watson V</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2C3E50' }}>{patient.actV}</span>
          <span style={{ fontSize: '0.6rem', color: '#2C3E50', display: 'block' }}>Litros</span>
        </div>
      </div>

      <div style={{ marginBottom: '25px', border: '1px solid #E0E0E0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#2C3E50', color: 'white', padding: '12px 20px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' }}>
           <span>🧪 Perfil de Líquidos: {prescription.crrtLiquidBrand}</span>
           <span>{currentLiquid?.desc}</span>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#FAFAFA' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #EEE' }}>
               <span style={{ display: 'block', fontSize: '0.6rem', color: '#7F8C8D', fontWeight: '800' }}>POTASIO (K+)</span>
               <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#A80000' }}>{currentLiquid?.k} <small style={{ fontSize: '0.6rem' }}>mEq/L</small></span>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #EEE' }}>
               <span style={{ display: 'block', fontSize: '0.6rem', color: '#7F8C8D', fontWeight: '800' }}>BICARBONATO</span>
               <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#2C3E50' }}>{currentLiquid?.hco3} <small style={{ fontSize: '0.6rem' }}>mEq/L</small></span>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #EEE' }}>
               <span style={{ display: 'block', fontSize: '0.6rem', color: '#7F8C8D', fontWeight: '800' }}>CLORO (Cl-)</span>
               <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#2C3E50' }}>{currentLiquid?.cl} <small style={{ fontSize: '0.6rem' }}>mEq/L</small></span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={{ border: '1px solid #EEE', borderRadius: '10px', padding: '15px' }}>
           <h5 style={{ margin: '0 0 10px 0', fontSize: '0.7rem', color: '#A80000', textTransform: 'uppercase', fontWeight: '900' }}>Hardware & Filtro</h5>
           <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>{prescription.machine}</div>
           <div style={{ fontSize: '0.75rem', color: '#7F8C8D' }}>Membrana: {prescription.filterModel} ({prescription.filterSurface} m²)</div>
           <div style={{ fontSize: '0.75rem', color: '#7F8C8D' }}>Modalidad: {prescription.modality}</div>
        </div>
        <div style={{ border: '1px solid #EEE', borderRadius: '10px', padding: '15px' }}>
           <h5 style={{ margin: '0 0 10px 0', fontSize: '0.7rem', color: '#A80000', textTransform: 'uppercase', fontWeight: '900' }}>Distribución de Bombas</h5>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
              <div><span style={{ color: '#7F8C8D' }}>Sangre:</span> <b>{prescription.bloodFlow}</b></div>
              <div><span style={{ color: '#7F8C8D' }}>Dializante:</span> <b style={{ fontSize: '0.9rem' }}>{prescription.dialysateFlow}</b></div>
              <div><span style={{ color: '#7F8C8D' }}>Rep. Pre:</span> <b style={{ fontSize: '0.9rem' }}>{prescription.replacementFlowPre}</b></div>
              <div><span style={{ color: '#7F8C8D' }}>Rep. Post:</span> <b style={{ fontSize: '0.9rem' }}>{prescription.replacementFlowPost}</b></div>
           </div>
        </div>
      </div>
      
      <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.6rem', color: '#BDC3C7', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700' }}>
        PROTOCOLO CRRT v22.0 • ESPECIALIZADO CULLEN PRO
      </div>
    </div>
  );
};

export default PrescriptionSummary;
