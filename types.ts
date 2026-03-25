
export enum TreatmentCategory {
  CRRT = 'CRRT',
  SLED = 'SLED-Híbrida'
}

export enum PatientType {
  ADULT = 'Adulto',
  PEDIATRIC = 'Pediátrico'
}

export enum PatientSex {
  MALE = 'Hombre',
  FEMALE = 'Mujer'
}

export enum FilterFluxType {
  HIGH = 'Alto Flujo',
  LOW = 'Bajo Flujo'
}

export type AccessType = 'Yugular' | 'Femoral' | 'Subclavia' | 'Fístula A/V' | '';
export type AccessSide = 'Derecho' | 'Derecha' | 'Izquierdo' | 'Izquierda' | '';

export enum MachineType {
  AMPLYA = 'Amplya (Medtronic/Bellco)',
  PRISMAFLEX = 'Prismaflex (Baxter)',
  OMNI = 'Omni (Baxter/Nipro)',
  MULTIFILTRATE = 'MultiFiltrate (Fresenius)',
  MEDICA = 'Medica (Equasmart)',
  FRESENIUS_4008S = 'Fresenius 4008s',
  FRESENIUS_5008S = 'Fresenius 5008s',
  BBRAUN_DIALOG_HDF = 'B. Braun Dialog+ HDF'
}

export enum ModalityType {
  CVVH = 'CVVH',
  CVVHD = 'CVVHD',
  CVVHDF = 'CVVHDF',
  SCUF = 'SCUF',
  SLED_HD = 'SLED/HD',
  SLED_HDF = 'SLED-HDF'
}

export enum CrrtLiquidBrand {
  HBIOFLUIDS = 'HBiofluids',
  MULTIBIC = 'MultiBic (Fresenius)',
  OTHER = 'Otras'
}

export interface LiquidComposition {
  na: number;
  k: number;
  cl: number;
  hco3: number;
  ca: number;
  mg: number;
  glu: number;
  desc?: string;
}

export const LIQUID_COMPOSITIONS: Record<string, LiquidComposition> = {
  // HBIOFLUIDS
  'HB_2.5': { na: 140, k: 2.5, cl: 113, hco3: 32, ca: 1.5, mg: 1.5, glu: 5.5, desc: 'K+ 2.5 / Bicarb 32 / Cl- 113' },
  'HB_3.5': { na: 140, k: 3.5, cl: 113, hco3: 34, ca: 1.5, mg: 1.5, glu: 5.5, desc: 'K+ 3.5 / Bicarb 34 / Cl- 113' },
  'HB_4.0': { na: 140, k: 4.0, cl: 113, hco3: 36, ca: 1.5, mg: 1.5, glu: 5.5, desc: 'K+ 4.0 / Bicarb 36 / Cl- 113' },
  // MULTIBIC (Fresenius)
  'MB_2.0': { na: 140, k: 2.0, cl: 111, hco3: 35, ca: 1.5, mg: 0.5, glu: 0, desc: 'K+ 2.0 / Bicarb 35 / Cl- 111' },
  'MB_3.0': { na: 140, k: 3.0, cl: 112, hco3: 35, ca: 1.5, mg: 0.5, glu: 0, desc: 'K+ 3.0 / Bicarb 35 / Cl- 112' },
  'MB_4.0': { na: 140, k: 4.0, cl: 113, hco3: 35, ca: 1.5, mg: 0.5, glu: 0, desc: 'K+ 4.0 / Bicarb 35 / Cl- 113' }
};

export interface FilterModelInfo {
  name: string;
  surface: number;
  type: string;
  brand?: string;
  kuf?: number;
}

export const FILTER_CATALOG: Record<string, FilterModelInfo[]> = {
  'Fresenius': [
    { name: 'Ultraflux AV 400s', surface: 0.7, type: 'Polysulfone' },
    { name: 'Ultraflux AV 600s', surface: 1.0, type: 'Polysulfone' },
    { name: 'Ultraflux AV 1000s', surface: 1.8, type: 'Polysulfone' }
  ],
  'Omni/Nipro/Medica': [
    { name: 'Oxylog', surface: 1.4, type: 'Standard' },
    { name: 'EMiC 2', surface: 1.8, type: 'High-Flux' },
    { name: 'Medica Equasmart 1.2', surface: 1.2, type: 'Polysulfone' }
  ],
  'Originales/Baxter': [
    { name: 'ST Set 60', surface: 0.6, type: 'AN69 ST' },
    { name: 'ST Set 100', surface: 1.0, type: 'AN69 ST' },
    { name: 'ST Set 150', surface: 1.5, type: 'AN69 ST' },
    { name: 'Oxiris', surface: 1.5, type: 'Adsorption' },
    { name: 'Septex', surface: 1.1, type: 'High-Flux' }
  ],
  'Amplya': [
    { name: 'HFT14', surface: 1.4, type: 'Polyphenylene' },
    { name: 'HFT22', surface: 2.2, type: 'Polyphenylene' }
  ]
};

export const SLED_SURFACES = [0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2];

export enum AnticoagulationType {
  CITRATE = 'Citrato (Regysol)',
  HEPARIN = 'Heparina',
  NONE = 'Ninguna'
}

export enum SledBicarbonateType {
  BIBAG_650 = 'bibag 650g (Fresenius)',
  BIBAG_900 = 'bibag 900g (Fresenius)',
  SOLCART_B_650 = 'Sol-Cart B 650g (Kdial/Nipro)',
  SOLCART_B_760 = 'Sol-Cart B 760g (Kdial/Nipro)',
  SOLCART_B_1100 = 'Sol-Cart B 1100g (Kdial/Nipro)',
  POWDER_GENERIC = 'Bicarbonato en Polvo (Genérico)'
}

export const SLED_ACIDS = [
  { id: 'SK-F 211', desc: 'SK-F 211 (K+ 1.0, Ca2+ 2.5)' },
  { id: 'SK-F 212', desc: 'SK-F 212 (K+ 2.0, Ca2+ 2.5)' },
  { id: 'SK-F 213', desc: 'SK-F 213 (K+ 3.0, Ca2+ 2.5)' },
  { id: 'SK-F 203', desc: 'SK-F 203 (K+ 2.0, Ca2+ 3.5)' },
  { id: 'Kdial 1', desc: 'Kdial 1 (K+ 1.0, Ca2+ 2.5)' },
  { id: 'Kdial 2', desc: 'Kdial 2 (K+ 2.0, Ca2+ 2.5)' },
  { id: 'Kdial 3', desc: 'Kdial 3 (K+ 3.0, Ca2+ 2.5)' },
  { id: 'Kdial 4', desc: 'Kdial 4 (K+ 4.0, Ca2+ 2.5)' },
];

export interface PatientInfo {
  name: string;
  weight: number;
  idealWeight?: number;
  height: number;
  age: number;
  type: PatientType;
  sex: PatientSex;
  actV?: number;
  accessType?: AccessType;
  accessSide?: AccessSide;
  bsa?: number;
}

export interface SodiumData {
  currentNa: number;
  targetNa24h: number;
  fluidNaBase: number;
}

export interface PrescriptionData {
  category: TreatmentCategory;
  machine: MachineType;
  modality: ModalityType;
  filterModel: string;
  filterSurface: number;
  filterFluxType: FilterFluxType;
  crrtLiquidBrand: CrrtLiquidBrand;
  crrtLiquidKey: string;
  bloodFlow: number;
  pbpFlow: number;
  dialysateFlow: number;
  replacementFlowPre: number;
  replacementFlowPost: number;
  targetDose: number;
  treatmentTime: number;
  totalSledUF: number;
  anticoagulation: AnticoagulationType;
  // SLED Specific Inputs
  sledAcidConcentrate?: string;
  sledBicarbonateType?: SledBicarbonateType;
  sledBicarbonateCell?: string;
  filterKuf?: number;
}

export interface BalanceData {
  intakeHourly: number;
  desiredBalance24h: number;
}

export interface CrrtJustificationData {
  diagnosis: string;
  kdigoStage: string;
  diuresis: string;
  creatinine: string;
  accumulatedBalance: string;
  vasopressor: string;
  conditions: {
    septicShock: boolean;
    multiorganFailure: boolean;
    ecmo: boolean;
    mechanicalVentilation: boolean;
    refractoryAcidosis: boolean;
    refractoryHyperkalemia: boolean;
    fluidOverload10: boolean;
    symptomaticUremia: boolean;
  };
  selectedCriterion: string;
  aiJustification: string;
  proposedModality: string;
  proposedDose: string;
  proposedAnticoagulation: string;
  objectives: {
    volumeControl: boolean;
    metabolicCorrection: boolean;
    uremicClearance: boolean;
    organSupport: boolean;
  };
}

export const KDIGO_CRITERIA = [
  'Oliguria persistente (<0.3 ml/kg/h >24 h)',
  'Anuria >12 h',
  'Hiperkalemia refractaria',
  'Acidosis metabólica severa refractaria',
  'Sobrecarga hídrica con compromiso respiratorio',
  'Uremia con manifestaciones clínicas',
  'Progresión a AKI estadio 3',
  'Necesidad de control preciso de volumen en paciente hemodinámicamente inestable',
  'Soporte renal en contexto de shock con vasopresores',
  'Soporte renal en ECMO'
];
