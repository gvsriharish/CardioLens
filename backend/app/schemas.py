"""
Pydantic schemas and request/response models for CardioLens API.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator

class PatientInput(BaseModel):
    # Demographics
    Age: float = Field(default=62.0, ge=18, le=100, description="Age in years")
    Sex: str = Field(default="Male", description="Biological Sex: Male or Female")
    Weight: float = Field(default=78.0, ge=35, le=200, description="Weight in kg")
    Length: float = Field(default=170.0, ge=100, le=220, description="Height in cm")
    BMI: Optional[float] = Field(default=None, ge=10, le=80, description="Body Mass Index (auto-calculated if None)")

    # Comorbidities & History
    DM: str = Field(default="Y", description="Diabetes Mellitus (Y/N)")
    HTN: str = Field(default="Y", description="Hypertension (Y/N)")
    Current_Smoker: str = Field(default="Y", alias="Current Smoker", description="Current smoker (Y/N)")
    EX_Smoker: str = Field(default="N", alias="EX-Smoker", description="Ex-smoker (Y/N)")
    FH: str = Field(default="Y", description="Family History of premature CAD (Y/N)")
    Obesity: Optional[str] = Field(default=None, description="Obesity (Y/N, auto-derived from BMI if None)")
    CRBP: str = Field(default="N", description="Chronic Renal / BP complication (Y/N)")

    # Symptoms & Physical Exam
    BP: float = Field(default=145.0, ge=70, le=240, description="Resting Blood Pressure (mmHg)")
    PR: float = Field(default=82.0, ge=40, le=180, description="Pulse Rate (bpm)")
    Weak_Peripheral_Pulse: str = Field(default="N", alias="Weak Peripheral Pulse", description="Weak peripheral pulse (Y/N)")
    Cough: str = Field(default="N", description="Chronic cough (Y/N)")
    Dyspnea: str = Field(default="Y", description="Dyspnea / Shortness of breath (Y/N)")
    Typical_Chest_Pain: str = Field(default="Y", alias="Typical Chest Pain", description="Typical angina chest pain (Y/N)")
    Atypical: str = Field(default="N", description="Atypical chest pain (Y/N)")
    Nonanginal: str = Field(default="N", description="Nonanginal chest pain (Y/N)")
    Exertional_CP: str = Field(default="Y", alias="Exertional CP", description="Exertional chest pain (Y/N)")
    LowTH_Ang: str = Field(default="N", alias="LowTH Ang", description="Low threshold angina (Y/N)")
    Edema: str = Field(default="0", description="Peripheral edema (0 or 1)")
    Murmur: str = Field(default="N", description="Cardiac murmur (Y/N)")
    Systolic_Murmur: str = Field(default="N", alias="Systolic Murmur", description="Systolic murmur (Y/N)")
    Diastolic_Murmur: str = Field(default="N", alias="Diastolic Murmur", description="Diastolic murmur (Y/N)")

    # Laboratory
    FBS: float = Field(default=142.0, ge=50, le=500, description="Fasting Blood Sugar (mg/dL)")
    CR: float = Field(default=1.2, ge=0.3, le=10.0, description="Serum Creatinine (mg/dL)")
    TG: float = Field(default=210.0, ge=30, le=1000, description="Triglycerides (mg/dL)")
    LDL: float = Field(default=155.0, ge=20, le=400, description="LDL Cholesterol (mg/dL)")
    HDL: float = Field(default=34.0, ge=10, le=120, description="HDL Cholesterol (mg/dL)")
    BUN: float = Field(default=22.0, ge=3, le=100, description="Blood Urea Nitrogen (mg/dL)")
    ESR: float = Field(default=26.0, ge=1, le=120, description="Erythrocyte Sedimentation Rate (mm/hr)")
    HB: float = Field(default=13.8, ge=6, le=22, description="Hemoglobin (g/dL)")
    K: float = Field(default=4.3, ge=2.0, le=7.0, description="Serum Potassium (mEq/L)")
    Na: float = Field(default=139.0, ge=115, le=160, description="Serum Sodium (mEq/L)")
    WBC: float = Field(default=8400.0, ge=2000, le=30000, description="White Blood Cells (/mcL)")
    Lymph: float = Field(default=24.0, ge=5, le=70, description="Lymphocyte percentage (%)")
    Neut: float = Field(default=72.0, ge=20, le=90, description="Neutrophil percentage (%)")
    PLT: float = Field(default=230.0, ge=50, le=800, description="Platelets (x10^3/mcL)")

    # ECG & Echocardiography
    EF_TTE: float = Field(default=42.0, alias="EF-TTE", ge=15, le=75, description="Ejection Fraction (%)")
    Region_RWMA: float = Field(default=2.0, alias="Region RWMA", ge=0, le=4, description="Regional Wall Motion Abnormality (0-4)")
    VHD: str = Field(default="Mild", description="Valvular Heart Disease (None, Mild, Moderate, Severe)")
    Q_Wave: str = Field(default="1", alias="Q Wave", description="Pathological Q Wave present (0 or 1)")
    St_Elevation: str = Field(default="1", alias="St Elevation", description="ST Segment Elevation present (0 or 1)")
    St_Depression: str = Field(default="1", alias="St Depression", description="ST Segment Depression present (0 or 1)")
    Tinversion: str = Field(default="1", description="T-wave inversion present (0 or 1)")
    LVH: str = Field(default="0", description="Left Ventricular Hypertrophy (0 or 1)")
    Poor_R_Progression: str = Field(default="0", alias="Poor R Progression", description="Poor R-wave progression (0 or 1)")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    @model_validator(mode="before")
    @classmethod
    def require_supplied_features(cls, values):
        """Reject omitted predictor fields instead of silently applying defaults."""
        if not isinstance(values, dict):
            return values
        missing = []
        for name, field in cls.model_fields.items():
            if name in {"BMI", "Obesity"}:
                continue  # Explicitly documented derivations from supplied height/weight.
            if name not in values and field.alias not in values:
                missing.append(field.alias or name)
        if missing:
            raise ValueError("Missing required feature fields: " + ", ".join(missing))
        return values

    @model_validator(mode="after")
    def validate_categories(self):
        for name in ("DM", "HTN", "Current_Smoker", "EX_Smoker", "FH", "CRBP", "Weak_Peripheral_Pulse", "Cough", "Dyspnea", "Typical_Chest_Pain", "Atypical", "Nonanginal", "Exertional_CP", "LowTH_Ang", "Murmur", "Systolic_Murmur", "Diastolic_Murmur"):
            if getattr(self, name) not in {"Y", "N"}:
                raise ValueError(f"{name} must be Y or N")
        if self.Sex not in {"Male", "Female"}:
            raise ValueError("Sex must be Male or Female")
        if self.Obesity is not None and self.Obesity not in {"Y", "N"}:
            raise ValueError("Obesity must be Y or N when supplied")
        if self.VHD not in {"None", "Mild", "Moderate", "Severe"}:
            raise ValueError("VHD must be None, Mild, Moderate, or Severe")
        if self.Edema not in {"0", "1"}:
            raise ValueError("Edema must be 0 or 1")
        for name in ("Q_Wave", "St_Elevation", "St_Depression", "Tinversion", "LVH", "Poor_R_Progression"):
            if getattr(self, name) not in {"0", "1"}:
                raise ValueError(f"{name} must be 0 or 1")
        return self

class FeatureContributionItem(BaseModel):
    feature: str
    label: str
    value: Any
    contribution: float
    direction: str  # "increases_risk" | "protective"
    impact_magnitude: str  # "High" | "Moderate" | "Low"
    clinical_note: str

class VesselRiskDetail(BaseModel):
    vessel_key: str
    vessel_name: str
    probability: float
    percentage: str
    risk_level: str  # "Low", "Moderate", "High", "Very High"
    color_hex: str
    status: str
    anatomy_description: str
    primary_drivers: List[str]

class PredictionResponse(BaseModel):
    cad_probability: float
    cad_class: str
    lad_probability: float
    lcx_probability: float
    rca_probability: float
    overall_risk: float
    risk_level: str
    vessels: Dict[str, VesselRiskDetail]
    explanation: List[FeatureContributionItem]
    protective_factors: List[FeatureContributionItem]
    top_risk_contributors: List[FeatureContributionItem]
    target_explanations: Dict[str, Dict[str, List[FeatureContributionItem]]] = Field(default_factory=dict)
    risk_scoring_methodology: str
    model_mode: str  # Synthetic or unverified loaded models; inference abstains when artifacts are unavailable
    is_synthetic_dataset: bool
    medical_disclaimer: str
    evidence_status: str
    calibration_status: str
    out_of_distribution_status: str
    data_quality_status: str

class ScenarioRequest(BaseModel):
    baseline_patient: PatientInput
    hypothetical_patient: PatientInput

class ScenarioResponse(BaseModel):
    baseline_prediction: PredictionResponse
    hypothetical_prediction: PredictionResponse
    probability_differences_percentage_points: Dict[str, float]
    scenario_notice: str

class ModelInfoResponse(BaseModel):
    name: str
    version: str
    description: str
    targets: List[str]
    algorithms: Dict[str, str]
    leakage_columns_excluded: List[str]
    feature_count: int
    is_demo_mode: bool
    safety_disclaimer: str

class MetricItem(BaseModel):
    model: str
    accuracy: float
    precision: float
    recall: float
    f1: float
    roc_auc: float

class MetricsResponse(BaseModel):
    sample_count: int
    feature_count: int
    validation_methodology: str
    is_synthetic: bool
    excluded_leakage_columns: List[str]
    target_metrics: Dict[str, MetricItem]
    targets_detail: Dict[str, Any]

class BatchPredictRequest(BaseModel):
    patients: List[PatientInput] = Field(min_length=1, max_length=100)
