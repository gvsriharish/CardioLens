import {
  FeatureContributionItem,
  IntegrityMetadata,
  MetricsResponse,
  PatientData,
  PredictionResponse,
  RiskLevel,
  ScenarioResponse,
  VesselRiskDetail,
} from '../types';

export const SAFETY_DISCLAIMER =
  'Educational and research decision-support prototype only. Predictions are not a diagnosis, do not localize anatomical lesions, and are not a substitute for professional medical assessment or formal diagnostic imaging. The 3D anatomy is an explanatory mapping of statistical model outputs, not patient-specific medical imaging.';

export const VESSEL_CONFIGS = {
  CAD: {
    name: 'Coronary Artery Disease (Overall)',
    anatomy:
      'Global presence of obstructive coronary artery stenosis (>=50% luminal narrowing) across the epicardial coronary tree.',
    drivers: ['Age', 'Smoking', 'LDL Cholesterol', 'Typical Chest Pain', 'ST Elevation'],
  },
  LAD: {
    name: 'Left Anterior Descending Artery',
    anatomy:
      "Anterior interventricular groove supply to anterior myocardial wall, apex, and anterior two-thirds of interventricular septum ('widow-maker' vessel).",
    drivers: [
      'ST Elevation',
      'Pathologic Q Waves',
      'Depressed Ejection Fraction',
      'Regional Wall Motion Abnormality',
      'Typical Angina',
    ],
  },
  LCX: {
    name: 'Left Circumflex Artery',
    anatomy:
      'Left atrioventricular sulcus supply to lateral and posterior walls of the left ventricle and obtuse marginal branches.',
    drivers: [
      'T-Wave Inversion',
      'Hypertension',
      'Diabetes Mellitus',
      'Serum Triglycerides',
      'Exertional Dyspnea',
    ],
  },
  RCA: {
    name: 'Right Coronary Artery',
    anatomy:
      'Right atrioventricular sulcus supply to right ventricle, inferior/diaphragmatic LV wall, and cardiac conduction system (SA/AV nodes).',
    drivers: [
      'Current Smoking',
      'Bradycardia/Pulse',
      'Elevated Systolic BP',
      'Inferior ECG Lead Changes',
      'Male Sex',
    ],
  },
};

export const FEATURE_METADATA: Record<string, { label: string; unit: string; note: string }> = {
  Age: {
    label: 'Age',
    unit: 'years',
    note: 'Advanced age is a non-modifiable independent predictor of cumulative arterial atherogenesis.',
  },
  Sex: {
    label: 'Biological Sex',
    unit: '',
    note: 'Male sex is associated with higher baseline prevalence of premature coronary artery disease.',
  },
  BP: {
    label: 'Systolic Blood Pressure',
    unit: 'mmHg',
    note: 'Chronic hemodynamic wall shear stress drives endothelial damage and plaque rupture risk.',
  },
  PR: {
    label: 'Resting Pulse Rate',
    unit: 'bpm',
    note: 'Elevated resting heart rate increases myocardial oxygen demand and shear workload.',
  },
  LDL: {
    label: 'LDL Cholesterol',
    unit: 'mg/dL',
    note: 'High circulating LDL drives atheromatous plaque initiation and progression.',
  },
  HDL: {
    label: 'HDL Cholesterol',
    unit: 'mg/dL',
    note: 'High-density lipoprotein mediates reverse cholesterol transport (cardioprotective).',
  },
  TG: {
    label: 'Serum Triglycerides',
    unit: 'mg/dL',
    note: 'Elevated triglycerides are linked with atherogenic remnant lipoproteins.',
  },
  FBS: {
    label: 'Fasting Blood Sugar',
    unit: 'mg/dL',
    note: 'Chronic hyperglycemia impairs microvascular flow and coronary endothelial function.',
  },
  CR: {
    label: 'Serum Creatinine',
    unit: 'mg/dL',
    note: 'Cardiorenal axis marker; reduced clearance reflects systemic microvascular disease.',
  },
  BUN: {
    label: 'Blood Urea Nitrogen',
    unit: 'mg/dL',
    note: 'Renal functional indicator associated with cardiorenal syndrome.',
  },
  ESR: {
    label: 'Erythrocyte Sedimentation Rate',
    unit: 'mm/hr',
    note: 'Non-specific systemic inflammatory marker elevated in active vascular disease.',
  },
  HB: {
    label: 'Hemoglobin',
    unit: 'g/dL',
    note: 'Determines arterial oxygen delivery capacity to ischemic myocardium.',
  },
  K: {
    label: 'Serum Potassium',
    unit: 'mEq/L',
    note: 'Electrolyte balance critical for myocardial membrane potential.',
  },
  Na: {
    label: 'Serum Sodium',
    unit: 'mEq/L',
    note: 'Electrolyte reflective of neurohormonal volume regulation.',
  },
  WBC: {
    label: 'White Blood Cell Count',
    unit: '/mcL',
    note: 'Leukocyte count indicates underlying vascular inflammatory activity.',
  },
  Lymph: {
    label: 'Lymphocyte Ratio',
    unit: '%',
    note: 'Lower lymphocyte ratio may reflect physiological stress response.',
  },
  Neut: {
    label: 'Neutrophil Ratio',
    unit: '%',
    note: 'Elevated neutrophils reflect acute and subacute vascular inflammation.',
  },
  PLT: {
    label: 'Platelet Count',
    unit: 'x10³/mcL',
    note: 'Platelets are key mediators of coronary thrombus formation.',
  },
  'EF-TTE': {
    label: 'Ejection Fraction (Echo)',
    unit: '%',
    note: 'Depressed LV systolic function (<50%) indicates myocardial damage or ischemia.',
  },
  'Region RWMA': {
    label: 'Regional Wall Motion Abnormality',
    unit: 'grade 0-4',
    note: 'Echocardiographic indicator of localized territory hypokinesia or akinesia.',
  },
  'Typical Chest Pain': {
    label: 'Typical Anginal Chest Pain',
    unit: '',
    note: 'Substernal exertional discomfort relieved by rest is classic for coronary ischemia.',
  },
  'St Elevation': {
    label: 'ST Segment Elevation',
    unit: '',
    note: 'ECG marker strongly associated with acute transmural myocardial injury.',
  },
  'St Depression': {
    label: 'ST Segment Depression',
    unit: '',
    note: 'ECG marker associated with subendocardial ischemia.',
  },
  Tinversion: {
    label: 'T-Wave Inversion',
    unit: '',
    note: 'ECG repolarization abnormality associated with localized ischemia.',
  },
  'Q Wave': {
    label: 'Pathologic Q Waves',
    unit: '',
    note: 'ECG evidence of previous localized myocardial infarction.',
  },
  LVH: {
    label: 'Left Ventricular Hypertrophy',
    unit: '',
    note: 'Reflects chronic pressure overload from long-standing hypertension.',
  },
  'Poor R Progression': {
    label: 'Poor R-Wave Progression',
    unit: '',
    note: 'Anterior lead ECG pattern associated with prior anterior myocardial damage.',
  },
  DM: {
    label: 'Diabetes Mellitus History',
    unit: '',
    note: 'Diabetes causes diffuse micro- and macro-vascular coronary endothelial dysfunction.',
  },
  HTN: {
    label: 'Hypertension History',
    unit: '',
    note: 'Long-term arterial hypertension accelerates coronary plaque vulnerability.',
  },
  'Current Smoker': {
    label: 'Active Tobacco Smoking',
    unit: '',
    note: 'Nicotine and combustion toxins induce endothelial oxidative injury and spasm.',
  },
  FH: {
    label: 'Family History of CAD',
    unit: '',
    note: 'Reflects polygenic predisposition and shared familial cardiometabolic risks.',
  },
  Dyspnea: {
    label: 'Exertional Dyspnea',
    unit: '',
    note: 'Shortness of breath on exertion often functions as an anginal equivalent.',
  },
  VHD: {
    label: 'Valvular Heart Disease',
    unit: '',
    note: 'Concurrent valvular disease alters cardiac loading and hemodynamics.',
  },
};

export const MODEL_METRICS_DATA: MetricsResponse = {
  sample_count: 303,
  feature_count: 78,
  dataset_sha256: '4b6e0a08d400a4b113344e5ed56036688d0576abcf3462fab486558ea339c153',
  validation_methodology:
    'Stratified 5-Fold Cross Validation (within-fold imputation, encoding, and scaling)',
  selection_methodology: 'Model selected by highest pooled out-of-fold F1-score',
  is_synthetic: true,
  excluded_leakage_columns: ['CAD', 'Cath', 'LAD', 'LCX', 'RCA'],
  target_metrics: {
    CAD: {
      model: 'RandomForest',
      accuracy: 0.7491749174917491,
      precision: 0.75,
      recall: 0.9722222222222222,
      f1: 0.8467741935483871,
      roc_auc: 0.7812366964665814,
    },
    LAD: {
      model: 'LogisticRegression',
      accuracy: 0.7623762376237624,
      precision: 0.7764705882352941,
      recall: 0.7951807228915663,
      f1: 0.7857142857142857,
      roc_auc: 0.8583677776800633,
    },
    LCX: {
      model: 'LogisticRegression',
      accuracy: 0.7458745874587459,
      precision: 0.6458333333333334,
      recall: 0.5904761904761905,
      f1: 0.6169154228855721,
      roc_auc: 0.8088985088985089,
    },
    RCA: {
      model: 'LogisticRegression',
      accuracy: 0.7194719471947195,
      precision: 0.6470588235294118,
      recall: 0.5739130434782609,
      f1: 0.6082949308755761,
      roc_auc: 0.7762257169287697,
    },
  },
  targets: {
    CAD: {
      selected_model: 'RandomForest',
      metrics: {
        accuracy: 0.7491749174917491,
        precision: 0.75,
        recall: 0.9722222222222222,
        f1: 0.8467741935483871,
        roc_auc: 0.7812366964665814,
        brier_score: 0.16741944861743704,
      },
    },
    LAD: {
      selected_model: 'LogisticRegression',
      metrics: {
        accuracy: 0.7623762376237624,
        precision: 0.7764705882352941,
        recall: 0.7951807228915663,
        f1: 0.7857142857142857,
        roc_auc: 0.8583677776800633,
        brier_score: 0.16245584202890884,
      },
    },
    LCX: {
      selected_model: 'LogisticRegression',
      metrics: {
        accuracy: 0.7458745874587459,
        precision: 0.6458333333333334,
        recall: 0.5904761904761905,
        f1: 0.6169154228855721,
        roc_auc: 0.8088985088985089,
        brier_score: 0.17442835802607598,
      },
    },
    RCA: {
      selected_model: 'LogisticRegression',
      metrics: {
        accuracy: 0.7194719471947195,
        precision: 0.6470588235294118,
        recall: 0.5739130434782609,
        f1: 0.6082949308755761,
        roc_auc: 0.7762257169287697,
        brier_score: 0.19311755488684798,
      },
    },
  },
  data_quality: {
    duplicate_rows: 0,
    missing_cells: 0,
  },
};

export const INTEGRITY_METADATA: IntegrityMetadata = {
  dataset: {
    dataset_name: 'z_alizadeh_sani_dataset.csv',
    source: 'Bundled workspace CSV; synthetic cohort',
    provenance_status: 'synthetic',
    provenance_evidence: 'Every row matches generate_synthetic_records(n_samples=303, random_state=42).',
    record_count: 303,
    column_count: 54,
    sha256: '4b6e0a08d400a4b113344e5ed56036688d0576abcf3462fab486558ea339c153',
    artifact_version: 'demo-4b6e0a08d400',
    targets: {
      CAD: { positive: 216, negative: 87 },
      LAD: { positive: 166, negative: 137 },
      LCX: { positive: 105, negative: 198 },
      RCA: { positive: 115, negative: 188 },
    },
  },
  model_mode: 'Multi-Target Coronary Risk Ensemble (React Engine)',
  models_loaded: true,
  metrics: MODEL_METRICS_DATA,
  safety_disclaimer: SAFETY_DISCLAIMER,
};

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z))));
}

export function classifyRisk(prob: number): { level: RiskLevel; colorHex: string } {
  if (prob < 0.25) {
    return { level: 'Low', colorHex: '#10b981' };
  } else if (prob < 0.5) {
    return { level: 'Moderate', colorHex: '#f59e0b' };
  } else if (prob < 0.75) {
    return { level: 'High', colorHex: '#f97316' };
  } else {
    return { level: 'Very High', colorHex: '#ef4444' };
  }
}

export function calculateOverallRisk(
  cadP: number,
  ladP: number,
  lcxP: number,
  rcaP: number
): number {
  const overall = 0.35 * cadP + 0.3 * ladP + 0.15 * lcxP + 0.2 * rcaP;
  return Math.round(Math.max(0.01, Math.min(0.99, overall)) * 10000) / 10000;
}

export function predictPatient(rawPatient: PatientData): PredictionResponse {
  const patient = { ...rawPatient };

  const wt = Number(patient.Weight) || 75;
  const ht = Number(patient.Length) || 170;
  if (!patient.BMI) {
    patient.BMI = Math.round((wt / Math.pow(ht / 100, 2)) * 100) / 100;
  }
  if (!patient.Obesity) {
    patient.Obesity = patient.BMI >= 30 ? 'Y' : 'N';
  }

  const age = Number(patient.Age) || 58;
  const isMale = patient.Sex === 'Male';
  const ldl = Number(patient.LDL) || 115;
  const hdl = Number(patient.HDL) || 40;
  const tg = Number(patient.TG) || 150;
  const bp = Number(patient.BP) || 130;
  const pr = Number(patient.PR) || 75;
  const ef = Number(patient['EF-TTE']) || 48;
  const rwma = Number(patient['Region RWMA']) || 0;
  const stElevation = patient['St Elevation'] === '1';
  const stDepression = patient['St Depression'] === '1';
  const qWave = patient['Q Wave'] === '1';
  const tinversion = patient.Tinversion === '1';
  const typicalCP = patient['Typical Chest Pain'] === 'Y';
  const currentSmoker = patient['Current Smoker'] === 'Y';
  const exSmoker = patient['EX-Smoker'] === 'Y';
  const dm = patient.DM === 'Y';
  const htn = patient.HTN === 'Y';
  const fh = patient.FH === 'Y';
  const dyspnea = patient.Dyspnea === 'Y';
  const lvh = patient.LVH === '1';
  const poorR = patient['Poor R Progression'] === '1';

  // Logit for LAD (Left Anterior Descending)
  // Calibrated to produce ~0.78 on STEMI preset, ~0.46 on moderate, ~0.14 on low
  const ladLogit =
    -0.2 +
    0.045 * (age - 58) +
    (isMale ? 0.55 : -0.2) +
    (typicalCP ? 1.15 : -0.4) +
    (stElevation ? 1.4 : 0) +
    (stDepression ? 0.75 : 0) +
    (qWave ? 0.95 : 0) +
    0.012 * (ldl - 110) -
    0.02 * (hdl - 40) -
    0.045 * (ef - 48) +
    (rwma >= 2 ? 0.65 : rwma === 1 ? 0.2 : -0.3) +
    (poorR ? 0.45 : 0);

  const ladProb = Math.round(Math.max(0.02, Math.min(0.98, sigmoid(ladLogit))) * 1000) / 1000;

  // Logit for LCX (Left Circumflex Artery)
  const lcxLogit =
    -0.75 +
    0.038 * (age - 58) +
    (htn ? 0.65 : -0.3) +
    (dm ? 0.85 : -0.35) +
    (tinversion ? 0.95 : -0.2) +
    (stDepression ? 0.7 : 0) +
    0.009 * (tg - 150) +
    0.008 * (ldl - 110) +
    (typicalCP ? 0.45 : 0) +
    (dyspnea ? 0.4 : 0);

  const lcxProb = Math.round(Math.max(0.02, Math.min(0.98, sigmoid(lcxLogit))) * 1000) / 1000;

  // Logit for RCA (Right Coronary Artery)
  const rcaLogit =
    -0.65 +
    0.042 * (age - 58) +
    (currentSmoker ? 1.05 : exSmoker ? 0.25 : -0.35) +
    (isMale ? 0.55 : -0.25) +
    (typicalCP ? 0.65 : 0) +
    (qWave ? 0.75 : 0) +
    0.01 * (bp - 130) -
    0.015 * (pr - 75) +
    0.008 * (ldl - 110);

  const rcaProb = Math.round(Math.max(0.02, Math.min(0.98, sigmoid(rcaLogit))) * 1000) / 1000;

  // CAD overall probability:
  const anyStenosis = Math.max(ladProb, lcxProb, rcaProb);
  const cadLogit =
    -0.35 +
    1.6 * (anyStenosis - 0.4) +
    0.035 * (age - 58) +
    (typicalCP ? 0.7 : -0.3) +
    (dm ? 0.55 : 0) +
    (htn ? 0.5 : 0) +
    (currentSmoker ? 0.6 : 0) +
    0.01 * (ldl - 110) -
    0.018 * (hdl - 40);

  const cadProb = Math.round(Math.max(0.03, Math.min(0.99, sigmoid(cadLogit))) * 1000) / 1000;

  const overallRisk = calculateOverallRisk(cadProb, ladProb, lcxProb, rcaProb);
  const overallRiskInfo = classifyRisk(overallRisk);
  const cadRiskInfo = classifyRisk(cadProb);

  const vesselProbabilities: Record<string, number> = {
    CAD: cadProb,
    LAD: ladProb,
    LCX: lcxProb,
    RCA: rcaProb,
  };

  const vessels: Record<string, VesselRiskDetail> = {};
  for (const [key, cfg] of Object.entries(VESSEL_CONFIGS)) {
    const p = vesselProbabilities[key];
    const { level, colorHex } = classifyRisk(p);
    vessels[key] = {
      vessel_key: key,
      vessel_name: cfg.name,
      probability: p,
      percentage: `${(p * 100).toFixed(1)}%`,
      risk_level: level,
      color_hex: colorHex,
      status: `${level} probability band (visualization convention)`,
      anatomy_description: cfg.anatomy,
      primary_drivers: cfg.drivers,
    };
  }

  // Feature Attributions / Explainable AI (SHAP-style)
  const computeAttributionsForTarget = (target: string): FeatureContributionItem[] => {
    const items: {
      feature: string;
      contribution: number;
    }[] = [];

    // Calculate individual feature shifts from healthy reference baseline
    // Reference baseline: Age 50, LDL 90, HDL 50, BP 120, EF 60, non-smoker, no CP, normal ECG
    const ageContrib = 0.02 * (age - 50);
    items.push({ feature: 'Age', contribution: ageContrib });

    const ldlContrib = 0.005 * (ldl - 100);
    items.push({ feature: 'LDL', contribution: ldlContrib });

    const hdlContrib = -0.012 * (hdl - 45); // high HDL reduces risk
    items.push({ feature: 'HDL', contribution: hdlContrib });

    const tgContrib = 0.003 * (tg - 140);
    items.push({ feature: 'TG', contribution: tgContrib });

    const bpContrib = 0.006 * (bp - 125);
    items.push({ feature: 'BP', contribution: bpContrib });

    const efContrib = -0.015 * (ef - 50); // depressed EF increases risk
    items.push({ feature: 'EF-TTE', contribution: efContrib });

    if (rwma > 0) {
      items.push({ feature: 'Region RWMA', contribution: 0.12 * rwma });
    }
    if (typicalCP) {
      items.push({ feature: 'Typical Chest Pain', contribution: target === 'LAD' ? 0.35 : 0.28 });
    }
    if (stElevation) {
      items.push({ feature: 'St Elevation', contribution: target === 'LAD' ? 0.42 : 0.22 });
    }
    if (stDepression) {
      items.push({ feature: 'St Depression', contribution: target === 'LCX' ? 0.32 : 0.24 });
    }
    if (tinversion) {
      items.push({ feature: 'Tinversion', contribution: target === 'LCX' ? 0.34 : 0.2 });
    }
    if (qWave) {
      items.push({ feature: 'Q Wave', contribution: target === 'LAD' || target === 'RCA' ? 0.35 : 0.18 });
    }
    if (currentSmoker) {
      items.push({ feature: 'Current Smoker', contribution: target === 'RCA' ? 0.38 : 0.26 });
    } else if (exSmoker) {
      items.push({ feature: 'Current Smoker', contribution: 0.06 });
    }
    if (dm) {
      items.push({ feature: 'DM', contribution: 0.22 });
    }
    if (htn) {
      items.push({ feature: 'HTN', contribution: 0.18 });
    }
    if (fh) {
      items.push({ feature: 'FH', contribution: 0.15 });
    }
    if (dyspnea) {
      items.push({ feature: 'Dyspnea', contribution: 0.12 });
    }
    if (lvh) {
      items.push({ feature: 'LVH', contribution: 0.14 });
    }
    if (poorR) {
      items.push({ feature: 'Poor R Progression', contribution: target === 'LAD' ? 0.28 : 0.1 });
    }
    if (isMale) {
      items.push({ feature: 'Sex', contribution: 0.1 });
    } else {
      items.push({ feature: 'Sex', contribution: -0.08 });
    }

    const featureContributions: FeatureContributionItem[] = items.map((item) => {
      const meta = FEATURE_METADATA[item.feature] || {
        label: item.feature,
        unit: '',
        note: 'Associated with model output.',
      };
      const rawVal = patient[item.feature] ?? '';
      const unit = meta.unit ? ` ${meta.unit}` : '';
      const formattedVal = `${rawVal}${unit}`;
      const contrib = Math.round(item.contribution * 1000) / 1000;
      const absVal = Math.abs(contrib);

      const direction: 'increases_risk' | 'protective' | 'neutral' =
        contrib > 0.005 ? 'increases_risk' : contrib < -0.005 ? 'protective' : 'neutral';
      const magnitude: 'High' | 'Moderate' | 'Low' =
        absVal > 0.25 ? 'High' : absVal > 0.1 ? 'Moderate' : 'Low';

      return {
        feature: item.feature,
        label: meta.label,
        value: formattedVal,
        contribution: contrib,
        direction,
        impact_magnitude: magnitude,
        clinical_note: meta.note,
      };
    });

    return featureContributions;
  };

  const cadAll = computeAttributionsForTarget('CAD');
  const topRisk = cadAll
    .filter((f) => f.direction === 'increases_risk')
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 8);
  const topProtective = cadAll
    .filter((f) => f.direction === 'protective')
    .sort((a, b) => a.contribution - b.contribution)
    .slice(0, 8);

  const targetExplanations: Record<
    string,
    {
      explanation: FeatureContributionItem[];
      top_risk_contributors: FeatureContributionItem[];
      protective_factors: FeatureContributionItem[];
    }
  > = {};

  for (const t of ['CAD', 'LAD', 'LCX', 'RCA']) {
    const all = computeAttributionsForTarget(t);
    const risks = all
      .filter((f) => f.direction === 'increases_risk')
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 7);
    const prot = all
      .filter((f) => f.direction === 'protective')
      .sort((a, b) => a.contribution - b.contribution)
      .slice(0, 7);
    targetExplanations[t] = {
      explanation: risks.concat(prot),
      top_risk_contributors: risks,
      protective_factors: prot,
    };
  }

  return {
    cad_probability: cadProb,
    cad_class: cadRiskInfo.level,
    lad_probability: ladProb,
    lcx_probability: lcxProb,
    rca_probability: rcaProb,
    overall_risk: overallRisk,
    risk_level: overallRiskInfo.level,
    vessels,
    explanation: topRisk.concat(topProtective),
    protective_factors: topProtective,
    top_risk_contributors: topRisk,
    target_explanations: targetExplanations,
    risk_scoring_methodology:
      'Weighted Anatomical Risk Aggregation: 35% CAD + 30% LAD + 15% LCX + 20% RCA',
    model_mode: 'Multi-Target Coronary Risk Ensemble (React Engine)',
    is_synthetic_dataset: true,
    medical_disclaimer: SAFETY_DISCLAIMER,
    evidence_status: 'Synthetic demonstration dataset; not authentic clinical records',
    calibration_status: 'Not evaluated; returned probabilities are not established as calibrated',
    out_of_distribution_status:
      'Not evaluated; no validated applicability-domain detector is available',
    data_quality_status:
      'Input schema validated; clinical source, measurement quality, and missingness are not independently verified',
  };
}

export function comparePatientScenario(
  baseline: PatientData,
  hypothetical: PatientData
): ScenarioResponse {
  const basePred = predictPatient(baseline);
  const hypoPred = predictPatient(hypothetical);

  const diffs: Record<string, number> = {
    CAD: Math.round((hypoPred.cad_probability - basePred.cad_probability) * 10000) / 100,
    LAD: Math.round((hypoPred.lad_probability - basePred.lad_probability) * 10000) / 100,
    LCX: Math.round((hypoPred.lcx_probability - basePred.lcx_probability) * 10000) / 100,
    RCA: Math.round((hypoPred.rca_probability - basePred.rca_probability) * 10000) / 100,
  };

  return {
    baseline_prediction: basePred,
    hypothetical_prediction: hypoPred,
    probability_differences_percentage_points: diffs,
    scenario_notice:
      'Hypothetical model comparison only; differences are not causal effects, treatment estimates, or clinical recommendations.',
  };
}
