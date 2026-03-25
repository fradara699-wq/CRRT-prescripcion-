
import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  PatientInfo, 
  PrescriptionData, 
  BalanceData, 
  SodiumData,
  PatientType, 
  PatientSex,
  MachineType, 
  ModalityType, 
  AnticoagulationType,
  TreatmentCategory,
  FILTER_CATALOG,
  CrrtLiquidBrand,
  LIQUID_COMPOSITIONS,
  FilterFluxType
} from './types';
import PatientForm from './components/PatientForm';
import ConfigurationGrid from './components/ConfigurationGrid';
import BalanceCalculator from './components/BalanceCalculator';
import SodiumCalculator from './components/SodiumCalculator';
import AnticoagulationSelector from './components/AnticoagulationSelector';
import PrescriptionSummary from './components/PrescriptionSummary';
import HelpView from './components/HelpView';
import CrrtJustification from './components/CrrtJustification';
import { CrrtJustificationData } from './types';

const INITIAL_PATIENT: PatientInfo = {
  name: '', weight: 0, height: 0, age: 0,
  type: PatientType.ADULT, sex: PatientSex.MALE, actV: 0,
  accessType: '', accessSide: ''
};

const App: React.FC = () => {
  const [treatmentSelected, setTreatmentSelected] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'prescription' | 'sodium' | 'anticoagulation' | 'justification' | 'help'>('prescription');

  const [patient, setPatient] = useState<PatientInfo>(INITIAL_PATIENT);

  const [justification, setJustification] = useState<CrrtJustificationData>({
    diagnosis: '',
    kdigoStage: '',
    diuresis: '',
    creatinine: '',
    accumulatedBalance: '',
    vasopressor: '',
    conditions: {
      septicShock: false,
      multiorganFailure: false,
      ecmo: false,
      mechanicalVentilation: false,
      refractoryAcidosis: false,
      refractoryHyperkalemia: false,
      fluidOverload10: false,
      symptomaticUremia: false,
    },
    selectedCriterion: '',
    aiJustification: `Paciente crítico en Unidad de Cuidados Intensivos bajo protocolo institucional HP, en contexto de soporte multiorgánico avanzado.
Paciente cursa shock séptico refractario en contexto de proceso infeccioso en tratamiento, con disfunción orgánica múltiple severa. Presenta compromiso hemodinámico con requerimiento de vasopresores a dosis elevadas para sostener presión arterial media adecuada, hipoperfusión tisular con hiperlactatemia persistente y vasoplejía. Se asocia insuficiencia respiratoria que requiere ventilación mecánica, lesión renal aguda KDIGO III con alteraciones metabólicas y balance hídrico comprometido anurico, y encefalopatía séptica en el contexto de enfermedad crítica y sedación. Se observan además alteraciones hematológicas y compromiso hepático compatibles con respuesta inflamatoria sistémica severa. El puntaje SOFA estimado es mayor de 12, reflejando falla multiorgánica avanzada y alto riesgo de mortalidad. A pesar del manejo estándar optimizado —incluyendo antibioticoterapia de amplio espectro, control del foco infeccioso, reanimación hemodinámica guiada por objetivos y soporte multiorgánico el paciente evoluciona anurico y con sobrecarga hídrica.— El paciente presenta evolución desfavorable con progresión de la disfunción orgánica. Dado el contexto de shock séptico grave con disfunción multiorgánica progresiva, lesion renal aguda estadio KDIGO III , probable endotoxemia y respuesta inflamatoria desregulada se indica reemplazo renal continuo CRRT.`,
    proposedModality: 'CVVHDF',
    proposedDose: '25-30',
    proposedAnticoagulation: 'Citrato regional',
    objectives: {
      volumeControl: false,
      metabolicCorrection: false,
      uremicClearance: false,
      organSupport: false,
    },
  });

  const [prescription, setPrescription] = useState<PrescriptionData>({
    category: TreatmentCategory.CRRT,
    machine: MachineType.PRISMAFLEX,
    modality: ModalityType.CVVHDF,
    filterModel: 'ST Set 100',
    filterSurface: 1.0,
    filterFluxType: FilterFluxType.HIGH,
    bloodFlow: 0, pbpFlow: 0, dialysateFlow: 0, replacementFlowPre: 0,
    replacementFlowPost: 0, targetDose: 25, treatmentTime: 6, totalSledUF: 0,
    anticoagulation: AnticoagulationType.NONE,
    crrtLiquidBrand: CrrtLiquidBrand.HBIOFLUIDS,
    crrtLiquidKey: 'HB_2.5'
  });

  const [balance, setBalance] = useState<BalanceData>({ intakeHourly: 0, desiredBalance24h: 0 });
  const [sodium, setSodium] = useState<SodiumData>({ currentNa: 0, targetNa24h: 0, fluidNaBase: 140 });

  const calculatedNetUF = useMemo(() => {
    const extraExtractionHourly = balance.desiredBalance24h / 24;
    return Math.round(balance.intakeHourly + extraExtractionHourly);
  }, [balance]);

  const deliveredDose = useMemo(() => {
    if (patient.weight <= 0) return 0;
    const effluent = prescription.dialysateFlow + prescription.replacementFlowPre + prescription.replacementFlowPost + (prescription.category === TreatmentCategory.CRRT ? calculatedNetUF : 0);
    return parseFloat((effluent / patient.weight).toFixed(1));
  }, [prescription, calculatedNetUF, patient.weight]);

  const handleSelection = (category: TreatmentCategory) => {
    const defaultMachine = category === TreatmentCategory.CRRT ? MachineType.PRISMAFLEX : MachineType.FRESENIUS_5008S;
    setPrescription(prev => ({
      ...prev, category, machine: defaultMachine,
      modality: category === TreatmentCategory.CRRT ? ModalityType.CVVHDF : ModalityType.SLED_HD,
      filterModel: category === TreatmentCategory.CRRT ? 'ST Set 100' : 'SLED Filter',
      filterSurface: category === TreatmentCategory.CRRT ? 1.0 : 1.5,
      filterFluxType: category === TreatmentCategory.CRRT ? FilterFluxType.HIGH : FilterFluxType.LOW,
      crrtLiquidBrand: category === TreatmentCategory.CRRT ? CrrtLiquidBrand.HBIOFLUIDS : CrrtLiquidBrand.OTHER,
      crrtLiquidKey: category === TreatmentCategory.CRRT ? 'HB_2.5' : '',
      dialysateFlow: 0, replacementFlowPre: 0, replacementFlowPost: 0,
      sledAcidConcentrate: '', sledBicarbonateType: undefined, sledBicarbonateCell: ''
    }));
    setTreatmentSelected(true);
    setActiveView('prescription');
  };

  const handleFullReset = () => {
    setPatient(INITIAL_PATIENT);
    setTreatmentSelected(false);
    setActiveView('prescription');
    setBalance({ intakeHourly: 0, desiredBalance24h: 0 });
    setSodium({ currentNa: 0, targetNa24h: 0, fluidNaBase: 140 });
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    const isSled = prescription.category === TreatmentCategory.SLED;
    
    if (isSled) {
      // SLED Specific Report
      doc.setDrawColor(44, 62, 80);
      doc.setLineWidth(1.5);
      doc.rect(5, 5, 200, 287);
      
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORME MÉDICO DE TERAPIA RENAL HÍBRIDA (SLED)', 105, 20, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('UNIDAD DE CUIDADOS CRÍTICOS - PROTOCOLO DE ALTA PRECISIÓN', 105, 25, { align: 'center' });

      // 1. ENCABEZADO DE IDENTIFICACIÓN
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('1. ENCABEZADO DE IDENTIFICACIÓN', 15, 35);
      
      autoTable(doc, {
        startY: 40,
        body: [
          ['Paciente', patient.name || 'No consignado', 'Edad', `${patient.age || 0} años`],
          ['Peso Actual', `${patient.weight || 0} kg`, 'Peso Ideal/Seco', `${patient.idealWeight || 'No consignado'} kg`],
          ['Talla', `${patient.height || 0} cm`, 'Superficie Corporal (SC)', `${patient.bsa || 0} m²`]
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: [240, 240, 240] }, 2: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
      });

      // 2. CONFIGURACIÓN TÉCNICA Y HARDWARE
      const hardwareY = (doc as any).lastAutoTable.finalY + 10;
      doc.text('2. CONFIGURACIÓN TÉCNICA Y HARDWARE', 15, hardwareY);
      
      autoTable(doc, {
        startY: hardwareY + 5,
        body: [
          ['Máquina', prescription.machine || 'No consignado'],
          ['Modalidad', 'SLED (Sustitución Renal de Baja Eficiencia)'],
          ['Filtro/Dializador', `${prescription.filterModel || 'No consignado'} (${prescription.filterFluxType || 'No consignado'})`],
          ['Superficie Filtro', `${prescription.filterSurface || 0} m²`],
          ['Coef. Ultrafiltración (KUF)', `${prescription.filterKuf || 'No consignado'} ml/h/mmHg`]
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [240, 240, 240] } }
      });

      // 3. LÍQUIDO DE DIÁLISIS (CONCENTRADO ÁCIDO)
      const liquidY = (doc as any).lastAutoTable.finalY + 10;
      doc.text('3. LÍQUIDO DE DIÁLISIS (CONCENTRADO ÁCIDO)', 15, liquidY);
      
      autoTable(doc, {
        startY: liquidY + 5,
        head: [['Electrolito', 'Concentración', 'Unidad']],
        body: [
          ['Sodio (Na+)', '140', 'mEq/L'],
          ['Potasio (K+)', prescription.sledAcidConcentrate?.includes('1.0') ? '1.0' : prescription.sledAcidConcentrate?.includes('2.0') ? '2.0' : prescription.sledAcidConcentrate?.includes('3.0') ? '3.0' : prescription.sledAcidConcentrate?.includes('4.0') ? '4.0' : 'Variable', 'mEq/L'],
          ['Calcio (Ca2+)', prescription.sledAcidConcentrate?.includes('3.5') ? '3.5' : '2.5', 'mEq/L'],
          ['Magnesio (Mg2+)', '1.0', 'mEq/L'],
          ['Cloro (Cl-)', '107-109', 'mEq/L'],
          ['Bicarbonato (Buffer)', `${prescription.sledBicarbonateCell || '35'} (${prescription.sledBicarbonateType || 'Polvo'})`, 'mEq/L'],
          ['Glucosa', '100', 'mg/dL'],
          ['Temperatura Baño', '35.5 - 36.5', '°C']
        ],
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80] },
        styles: { fontSize: 8, cellPadding: 2 }
      });

      // 4. PROTOCOLO TÉCNICO (PARÁMETROS OPERATIVOS)
      const protocolY = (doc as any).lastAutoTable.finalY + 10;
      doc.text('4. PROTOCOLO TÉCNICO (PARÁMETROS OPERATIVOS)', 15, protocolY);
      
      autoTable(doc, {
        startY: protocolY + 5,
        body: [
          ['Flujo de Sangre (Qb)', `${prescription.bloodFlow || 0} ml/min`],
          ['Flujo de Dializado (Qd)', `${prescription.dialysateFlow || 0} ml/min (Flujo bajo adaptado)`],
          ['Tiempo de Tratamiento', `${prescription.treatmentTime || 0} horas`],
          ['Acceso Vascular', `${patient.accessType || 'No consignado'} ${patient.accessSide || ''}`]
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [240, 240, 240] } }
      });

      // 5. ANTICOAGULACIÓN
      const antiY = (doc as any).lastAutoTable.finalY + 10;
      doc.text('5. ANTICOAGULACIÓN', 15, antiY);
      
      autoTable(doc, {
        startY: antiY + 5,
        body: [
          ['Estrategia', prescription.anticoagulation || 'Sin Anticoagulación'],
          ['Protocolo', prescription.anticoagulation === AnticoagulationType.NONE ? 'Lavados con solución salina c/30-60 min' : 'Dosis según protocolo institucional'],
          ['Monitoreo', prescription.anticoagulation === AnticoagulationType.CITRATE ? 'Calcio iónico' : prescription.anticoagulation === AnticoagulationType.HEPARIN ? 'KPTT / ACT' : 'Clínico']
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [240, 240, 240] } }
      });

      // 6. GESTIÓN HÍDRICA
      const fluidY = (doc as any).lastAutoTable.finalY + 10;
      doc.text('6. GESTIÓN HÍDRICA', 15, fluidY);
      
      const sledUfRate = prescription.treatmentTime > 0 ? Math.round(prescription.totalSledUF / prescription.treatmentTime) : 0;

      autoTable(doc, {
        startY: fluidY + 5,
        body: [
          ['Objetivo de Balance', `${prescription.totalSledUF || 0} ml para la sesión`],
          ['Tasa de Ultrafiltración (UF)', `${sledUfRate} ml/h`],
          ['UF Total prevista', `${prescription.totalSledUF || 0} ml`]
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [240, 240, 240] } }
      });

      // Signature
      const signY = 270;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Dr. Avila Rafael - Jefe de UCC', 150, signY, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(120, signY - 2, 180, signY - 2);

    } else {
      // CRRT Report (Keep existing or slightly update)
      const liquid = LIQUID_COMPOSITIONS[prescription.crrtLiquidKey];
      
      // Border
      doc.setDrawColor(168, 0, 0);
      doc.setLineWidth(1.5);
      doc.rect(5, 5, 200, 287);
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(168, 0, 0);
      doc.text('PROTOCOLO TÉCNICO DE SOPORTE RENAL v22.0', 105, 20, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('CULLEN PRO SERIES - REPORTE DE PRESCRIPCIÓN INTEGRAL', 105, 25, { align: 'center' });

      // 1. PRESCRIPCIÓN MÉDICA – CRRT
      const prescriptionY = 35;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('1. PRESCRIPCIÓN MÉDICA – CRRT', 15, prescriptionY);

      // 🔹 IDENTIFICACIÓN Y DATOS ANTROPOMÉTRICOS
      autoTable(doc, {
        startY: prescriptionY + 5,
        head: [['🔹 IDENTIFICACIÓN Y DATOS ANTROPOMÉTRICOS', 'VALOR']],
        body: [
          ['Identificación Paciente', patient.name || 'No consignado'],
          ['Edad', `${patient.age || 0} años`],
          ['Sexo Biológico', patient.sex || 'No consignado'],
          ['Peso (kg)', `${patient.weight || 0} kg`],
          ['Talla (cm)', `${patient.height || 0} cm`],
          ['Volumen Distribución (Watson V)', `${patient.actV || 0} L`],
          ['Superficie Corporal (SC)', `${patient.bsa || 0} m²`],
          ['Vía de Acceso', patient.accessType || 'No consignado'],
          ['Lado / Ubicación', patient.accessSide || 'No consignado']
        ],
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
        styles: { fontSize: 8 }
      });

      // 🔹 GESTIÓN HÍDRICA & BALANCE
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 5,
        head: [['🔹 GESTIÓN HÍDRICA & BALANCE', 'VALOR']],
        body: [
          ['Aportes horarios totales (ml/h)', `${balance.intakeHourly || 0} ml/h`],
          ['Meta balance negativo 24h (ml)', `${balance.desiredBalance24h || 0} ml`],
          ['Volumen extra a extraer en 1 día', `${balance.desiredBalance24h || 0} ml`],
          ['UF Neta Programada', `${calculatedNetUF || 0} ml/h`],
          ['Meta horaria sugerida bomba', `${calculatedNetUF || 0} ml/h`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [39, 174, 96], textColor: [255, 255, 255] },
        styles: { fontSize: 8 }
      });

      // 🔹 CONFIGURACIÓN TÉCNICA & HARDWARE
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 5,
        head: [['🔹 CONFIGURACIÓN TÉCNICA & HARDWARE', 'VALOR']],
        body: [
          ['Hardware / Máquina', prescription.machine || 'No consignado'],
          ['Modalidad', prescription.modality || 'No consignado'],
          ['Marca / Fabricante líquidos', prescription.crrtLiquidBrand || 'No consignado'],
          ['Perfil Electrolítico (K/Bic/Cl)', liquid ? liquid.desc : 'No consignado'],
          ['Filtro / Membrana seleccionada', prescription.filterModel || 'No consignado'],
          ['Flujo sangre (Qb)', `${prescription.bloodFlow || 0} ml/min`],
          ['Dosis objetivo', `${prescription.targetDose || 0} ml/kg/h`],
          ['Efluente total', `${(prescription.dialysateFlow || 0) + (prescription.replacementFlowPre || 0) + (prescription.replacementFlowPost || 0) + (calculatedNetUF || 0)} ml/h`],
          ['Q. Dializado (Qd)', `${prescription.dialysateFlow || 0} ml/h`],
          ['Reposición Pre', `${prescription.replacementFlowPre || 0} ml/h`],
          ['Reposición Post', `${prescription.replacementFlowPost || 0} ml/h`],
          ['Dosis real', `${deliveredDose || 0} ml/kg/h`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [168, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 8 }
      });

      // 🔹 PERFIL DE LÍQUIDOS
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 5,
        head: [['🔹 PERFIL DE LÍQUIDOS', 'VALOR']],
        body: [
          ['Potasio (K+)', liquid ? `${liquid.k} mEq/L` : 'No consignado'],
          ['Bicarbonato', liquid ? `${liquid.hco3} mEq/L` : 'No consignado'],
          ['Cloro (Cl-)', liquid ? `${liquid.cl} mEq/L` : 'No consignado']
        ],
        theme: 'grid',
        headStyles: { fillColor: [243, 156, 18], textColor: [255, 255, 255] },
        styles: { fontSize: 8 }
      });

      // 🔹 PROTOCOLO CRRT – HP
      const isCitrate = prescription.anticoagulation === AnticoagulationType.CITRATE;
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 5,
        head: [['🔹 PROTOCOLO CRRT – HP', 'VALOR']],
        body: [
          ['Tipo de Anticoagulación', prescription.anticoagulation || 'No consignado'],
          ['Protocolo ACD-A', isCitrate ? 'Activo' : 'N/A'],
          ['Constante', isCitrate ? '3.0' : '0'],
          ['Flujo Citrato', isCitrate ? `${Math.round((prescription.bloodFlow || 0) * 60 * 0.03)} ml/h` : '0'],
          ['Ajuste Bomba PBP', isCitrate ? `${Math.round((prescription.bloodFlow || 0) * 60 * 0.03)} ml/h` : '0'],
          ['Calcio Iónico Posfiltro', '0 mmol/L'],
          ['Calcio Iónico Sistémico', '0 mmol/L'],
          ['Cloruro Calcio 10%', '0'],
          ['Estado del tratamiento', 'INICIO / EN CURSO']
        ],
        theme: 'grid',
        headStyles: { fillColor: [155, 89, 182], textColor: [255, 255, 255] },
        styles: { fontSize: 8 }
      });

      // 3️⃣ BIBLIOGRAFÍA
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'bold');
      doc.text('3️⃣ BIBLIOGRAFÍA', 15, finalY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1–138.', 15, finalY + 5);
      doc.text('KDIGO 2012 Acute Kidney Injury Work Group. Section 5: Dialysis Interventions for Treatment of AKI.', 15, finalY + 8);
    }

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(`Generado por Cullen Pro v22.0 | ${new Date().toLocaleString()}`, 105, pageHeight - 10, { align: 'center' });

    doc.save(`Prescripcion_Renal_v22_${patient.name || 'Reporte'}.pdf`);
  };

  if (!treatmentSelected) {
    return (
      <div className="fixed inset-0 bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-[#2C3E50]">
        <div className="w-20 h-20 bg-white border border-[#E0E0E0] premium-shadow rounded-2xl flex items-center justify-center mb-8">
          <i className="fas fa-stethoscope text-[#A80000] text-3xl"></i>
        </div>
        <h1 className="text-3xl font-black mb-1 uppercase tracking-tighter text-center">Protocolo de <span className="text-[#A80000]">Soporte Renal</span></h1>
        <p className="text-slate-400 text-[11px] font-bold tracking-[0.4em] uppercase mb-12">v22.0 • Módulo de Alta Precisión</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
          <button 
            onClick={() => handleSelection(TreatmentCategory.CRRT)} 
            className="bg-white border-l-4 border-[#A80000] p-8 premium-shadow rounded-lg text-left group hover:bg-[#A80000] transition-all relative overflow-hidden"
          >
             <div className="flex items-start justify-between">
               <div className="pr-4 flex-1">
                 <span className="block text-xs font-black text-[#A80000] group-hover:text-white uppercase mb-2 tracking-widest">Solapa 01</span>
                 <h3 className="text-xl font-bold group-hover:text-white uppercase">[🌀 Modo CRRT]</h3>
                 <p className="text-[10px] text-slate-400 group-hover:text-white/70 mt-2 uppercase font-bold">Terapias Continuas (Hardware & Filtros)</p>
               </div>
               <div className="w-24 h-24 shrink-0 bg-white p-2 rounded-xl group-hover:bg-white/90 transition-all flex items-center justify-center shadow-inner">
                 <img src="https://raw.githubusercontent.com/fradara699-wq/medical-media/main/crrt%20.png" alt="CRRT" className="w-full h-full object-contain" />
               </div>
             </div>
          </button>
          
          <button 
            onClick={() => handleSelection(TreatmentCategory.SLED)} 
            className="bg-white border-l-4 border-[#2C3E50] p-8 premium-shadow rounded-lg text-left group hover:bg-[#2C3E50] transition-all relative overflow-hidden"
          >
             <div className="flex items-start justify-between">
               <div className="pr-4 flex-1">
                 <span className="block text-xs font-black text-[#2C3E50] group-hover:text-white uppercase mb-2 tracking-widest">Solapa 02</span>
                 <h3 className="text-xl font-bold group-hover:text-white uppercase">[⚡ Modo SLED]</h3>
                 <p className="text-[10px] text-slate-400 group-hover:text-white/70 mt-2 uppercase font-bold">Terapias Híbridas (Watson y Kt/V)</p>
               </div>
               <div className="w-24 h-24 shrink-0 bg-white p-2 rounded-xl group-hover:bg-white/90 transition-all flex items-center justify-center shadow-inner">
                 <img src="https://raw.githubusercontent.com/fradara699-wq/medical-media/main/SLED.png" alt="SLED" className="w-full h-full object-contain" onError={(e) => {
                     e.currentTarget.src = "https://raw.githubusercontent.com/fradara699-wq/medical-media/main/sled.png";
                   }} />
               </div>
             </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] text-[#2C3E50]">
      <header className="bg-white border-b border-[#E0E0E0] premium-shadow p-4 flex items-center justify-between md:px-12 sticky top-0 z-50 no-print">
        <div className="flex items-center gap-3">
          <i className="fas fa-wave-square text-[#A80000]"></i>
          <span className="font-black text-sm tracking-[0.2em] text-[#A80000] uppercase">Cullen Pro v22.0</span>
        </div>
        <button onClick={exportToPdf} className="bg-[#A80000] text-white px-6 py-2 rounded-full font-bold text-[10px] tracking-widest hover:bg-[#850000] transition-all uppercase shadow-md active:scale-95">
          <i className="fas fa-file-pdf mr-2"></i> Reporte PDF
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar pb-32">
        <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-12">
          {activeView === 'help' ? (
            <HelpView />
          ) : activeView === 'prescription' ? (
            <div className="space-y-12 animate-in fade-in duration-500">
              <section className="bg-white p-8 rounded-lg border border-[#E0E0E0] premium-shadow">
                <h2 className="text-[10px] font-black mb-8 text-[#A80000] uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#A80000] text-white flex items-center justify-center text-[10px]">1</span>
                  Identificación y Datos Antropométricos
                </h2>
                <PatientForm patient={patient} setPatient={setPatient} />
              </section>

              <section className="bg-white p-8 rounded-lg border border-[#E0E0E0] premium-shadow">
                <h2 className="text-[10px] font-black mb-8 text-[#A80000] uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#A80000] text-white flex items-center justify-center text-[10px]">2</span>
                  Gestión Hídrica & Balance
                </h2>
                <BalanceCalculator 
                  balance={balance} setBalance={setBalance} netUF={calculatedNetUF} 
                  modality={prescription.modality} totalSledUF={prescription.totalSledUF}
                  setPrescription={setPrescription} category={prescription.category}
                />
              </section>

              <section className="bg-white p-8 rounded-lg border border-[#E0E0E0] premium-shadow">
                <h2 className="text-[10px] font-black mb-8 text-[#A80000] uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#A80000] text-white flex items-center justify-center text-[10px]">3</span>
                  Configuración Técnica & Hardware
                </h2>
                <ConfigurationGrid prescription={prescription} setPrescription={setPrescription} patientWeight={patient.weight} netUF={calculatedNetUF} />
              </section>

              <div className="pt-8 border-t border-[#EEE]">
                <PrescriptionSummary 
                  patient={patient} prescription={prescription} sodium={sodium}
                  netUF={calculatedNetUF} deliveredDose={deliveredDose}
                  activeView={activeView} balance={balance}
                />
              </div>
            </div>
          ) : activeView === 'sodium' ? (
            <SodiumCalculator sodium={sodium} setSodium={setSodium} />
          ) : activeView === 'anticoagulation' ? (
            <AnticoagulationSelector prescription={prescription} setPrescription={setPrescription} patientWeight={patient.weight} />
          ) : activeView === 'justification' ? (
            <CrrtJustification 
              data={justification} 
              setData={setJustification}
              prescription={prescription}
              patient={patient}
              balance={balance}
              calculatedNetUF={calculatedNetUF}
            />
          ) : null}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-50 no-print h-16">
        <div className="max-w-4xl mx-auto flex justify-around items-center h-full px-2">
           <button onClick={handleFullReset} className="flex flex-col items-center justify-center gap-1 group">
             <i className="fas fa-home text-slate-400 group-hover:text-[#A80000] transition-colors text-lg"></i>
             <span className="text-[8px] font-black uppercase text-slate-400 group-hover:text-[#A80000]">Inicio</span>
           </button>
           <button onClick={() => { handleSelection(TreatmentCategory.CRRT); setActiveView('prescription'); }} className={`flex flex-col items-center justify-center gap-1 group ${prescription.category === TreatmentCategory.CRRT && activeView === 'prescription' ? 'text-[#A80000]' : 'text-slate-400'}`}>
             <i className="fas fa-sync-alt text-lg"></i>
             <span className="text-[8px] font-black uppercase tracking-widest">CRRT</span>
           </button>
           <button onClick={() => { handleSelection(TreatmentCategory.SLED); setActiveView('prescription'); }} className={`flex flex-col items-center justify-center gap-1 group ${prescription.category === TreatmentCategory.SLED && activeView === 'prescription' ? 'text-[#A80000]' : 'text-slate-400'}`}>
             <i className="fas fa-bolt text-lg"></i>
             <span className="text-[8px] font-black uppercase tracking-widest">SLED</span>
           </button>
           <button onClick={() => setActiveView('anticoagulation')} className={`flex flex-col items-center justify-center gap-1 group ${activeView === 'anticoagulation' ? 'text-[#A80000]' : 'text-slate-400'}`}>
             <i className="fas fa-syringe text-lg"></i>
             <span className="text-[8px] font-black uppercase tracking-widest">Anticoag</span>
           </button>
           <button onClick={() => setActiveView('justification')} className={`flex flex-col items-center justify-center gap-1 group ${activeView === 'justification' ? 'text-[#A80000]' : 'text-slate-400'}`}>
             <i className="fas fa-file-medical text-lg"></i>
             <span className="text-[8px] font-black uppercase tracking-widest">Justificación</span>
           </button>
           <button onClick={() => setActiveView('sodium')} className={`flex flex-col items-center justify-center gap-1 group ${activeView === 'sodium' ? 'text-[#A80000]' : 'text-slate-400'}`}>
             <i className="fas fa-vial text-lg"></i>
             <span className="text-[8px] font-black uppercase tracking-widest">Sodio</span>
           </button>
           <button onClick={() => setActiveView('help')} className={`flex flex-col items-center justify-center gap-1 group ${activeView === 'help' ? 'text-[#A80000]' : 'text-slate-400'}`}>
             <i className="fas fa-question-circle text-lg"></i>
             <span className="text-[8px] font-black uppercase tracking-widest">Ayuda</span>
           </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
