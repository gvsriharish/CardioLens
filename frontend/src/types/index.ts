export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface PatientData {
  Age: number;
  Sex: string;
  Weight: number;
  Length: number;
  BMI?: number;
  DM: string;
  HTN: string;
  'Current Smoker': string;
  'EX-Smoker': string;
  FH: string;
  Obesity?: string;
  CRBP: string;
  BP: number;
  PR: number;
  'Weak Peripheral Pulse': string;
  Cough: string;
  Dyspnea: string;
  'Typical Chest Pain': string;
  Atypical: string;
  Nonanginal: string;
  'Exertional CP': string;
  'LowTH Ang': string;
  Edema: string;
  Murmur: string;
  'Systolic Murmur': string;
  'Diastolic Murmur': string;
  FBS: number;
  CR: number;
  TG: number;
  LDL: number;
  HDL: number;
  BUN: number;
  ESR: number;
  HB: number;
  K: number;
  Na: number;
  WBC: number;
  Lymph: number;
  Neut: number;
  PLT: number;
  'EF-TTE': number;
  'Region RWMA': number;
  VHD: string;
  'Q Wave': string;
  'St Elevation': string;
  'St Depression': string;
  Tinversion: string;
  LVH: string;
  'Poor R Progression': string;
  [key: string]: any;
}

export interface FeatureContributionItem {
  feature: string;
  label: string;
  value: string | number;
  contribution: number;
  direction: 'increases_risk' | 'protective' | 'neutral';
  impact_magnitude: 'High' | 'Moderate' | 'Low';
  clinical_note: string;
}

export interface VesselRiskDetail {
  vessel_key: 'CAD' | 'LAD' | 'LCX' | 'RCA' | string;
  vessel_name: string;
  probability: number;
  percentage: string;
  risk_level: RiskLevel;
  color_hex: string;
  status: string;
  anatomy_description: string;
  primary_drivers: string[];
}

export interface PredictionResponse {
  cad_probability: number;
  cad_class: string;
  lad_probability: number;
  lcx_probability: number;
  rca_probability: number;
  overall_risk: number;
  risk_level: RiskLevel;
  vessels: Record<string, VesselRiskDetail>;
  explanation: FeatureContributionItem[];
  protective_factors: FeatureContributionItem[];
  top_risk_contributors: FeatureContributionItem[];
  target_explanations?: Record<string, { explanation: FeatureContributionItem[]; top_risk_contributors: FeatureContributionItem[]; protective_factors: FeatureContributionItem[] }>;
  risk_scoring_methodology: string;
  model_mode: string;
  is_synthetic_dataset: boolean;
  medical_disclaimer: string;
  evidence_status: string;
  calibration_status: string;
  out_of_distribution_status: string;
  data_quality_status: string;
}

export interface MetricItem {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
}

export interface MetricsResponse {
  sample_count: number;
  feature_count: number;
  dataset_sha256: string;
  validation_methodology: string;
  selection_methodology: string;
  is_synthetic: boolean;
  excluded_leakage_columns: string[];
  target_metrics: Record<string, MetricItem>;
  targets: Record<string, any>;
  data_quality: { duplicate_rows: number; missing_cells: number };
}

export interface IntegrityMetadata {
  dataset: Record<string, any>;
  model_mode: string;
  models_loaded: boolean;
  metrics: MetricsResponse;
  safety_disclaimer: string;
}

export interface ScenarioResponse {
  baseline_prediction: PredictionResponse;
  hypothetical_prediction: PredictionResponse;
  probability_differences_percentage_points: Record<string, number>;
  scenario_notice: string;
}

export interface PresetPatient {
  preset_key: string;
  name: string;
  description: string;
  patient_data: PatientData;
  prediction?: PredictionResponse;
}
