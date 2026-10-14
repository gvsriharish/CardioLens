"""
Schema definition, column normalization, and leakage prevention rules
for CardioVision AI.
"""

from typing import Dict, List, Set

# Explicit leakage columns that MUST NEVER be included in feature matrix X
LEAKAGE_TARGET_COLUMNS: Set[str] = {
    "cath",
    "cad",
    "lad",
    "lcx",
    "rca",
    "vessel_stenosis",
    "target",
    "outcome",
}

# Standard targets predicted by CardioVision AI
TARGETS = ["CAD", "LAD", "LCX", "RCA"]

# Canonical column names and alias dictionary for adaptive ingestion
COLUMN_ALIASES: Dict[str, List[str]] = {
    "Age": ["age", "patient_age", "years"],
    "Sex": ["sex", "gender"],
    "Weight": ["weight", "wt", "weight_kg"],
    "Length": ["length", "height", "ht", "height_cm"],
    "BMI": ["bmi", "body_mass_index"],
    "DM": ["dm", "diabetes", "diabetes_mellitus"],
    "HTN": ["htn", "hypertension", "high_blood_pressure"],
    "Current Smoker": ["current_smoker", "smoker", "smoking", "current smoker"],
    "EX-Smoker": ["ex-smoker", "ex_smoker", "former_smoker", "ex smoker"],
    "FH": ["fh", "family_history", "family history"],
    "Obesity": ["obesity", "obese"],
    "CRBP": ["crbp", "chronic_renal_bp"],
    "BP": ["bp", "blood_pressure", "systolic_bp", "resting_bp"],
    "PR": ["pr", "pulse_rate", "heart_rate", "pulse", "hr"],
    "Weak Peripheral Pulse": ["weak_peripheral_pulse", "weak_pulse", "peripheral_pulse"],
    "Cough": ["cough"],
    "Dyspnea": ["dyspnea", "shortness_of_breath", "sob"],
    "Typical Chest Pain": ["typical_chest_pain", "typical_cp", "typical chest pain", "angina"],
    "Atypical": ["atypical", "atypical_cp", "atypical chest pain"],
    "Nonanginal": ["nonanginal", "non_anginal_cp"],
    "Exertional CP": ["exertional_cp", "exertional chest pain"],
    "LowTH Ang": ["lowth_ang", "low_th_angina"],
    "Edema": ["edema", "peripheral_edema"],
    "Murmur": ["murmur", "heart_murmur"],
    "Systolic Murmur": ["systolic_murmur"],
    "Diastolic Murmur": ["diastolic_murmur"],
    "FBS": ["fbs", "fasting_blood_sugar", "glucose"],
    "CR": ["cr", "creatinine", "serum_creatinine"],
    "TG": ["tg", "triglycerides", "triglyceride"],
    "LDL": ["ldl", "ldl_cholesterol", "bad_cholesterol"],
    "HDL": ["hdl", "hdl_cholesterol", "good_cholesterol"],
    "BUN": ["bun", "blood_urea_nitrogen"],
    "ESR": ["esr", "erythrocyte_sedimentation_rate"],
    "HB": ["hb", "hemoglobin", "hgb"],
    "K": ["k", "potassium"],
    "Na": ["na", "sodium"],
    "WBC": ["wbc", "white_blood_cell_count", "white_cells"],
    "Lymph": ["lymph", "lymphocytes"],
    "Neut": ["neut", "neutrophils"],
    "PLT": ["plt", "platelets"],
    "EF-TTE": ["ef-tte", "ef_tte", "ef", "ejection_fraction"],
    "Region RWMA": ["region_rwma", "rwma", "wall_motion_abnormality"],
    "VHD": ["vhd", "valvular_heart_disease"],
    "Q Wave": ["q_wave", "q wave", "pathologic_q"],
    "St Elevation": ["st_elevation", "st elevation", "ste"],
    "St Depression": ["st_depression", "st depression", "std"],
    "Tinversion": ["tinversion", "t_inversion", "t wave inversion"],
    "LVH": ["lvh", "left_ventricular_hypertrophy"],
    "Poor R Progression": ["poor_r_progression", "poor r progression", "prp"],
    # Targets & Cath aliases for detection
    "Cath": ["cath", "catheterization", "angiography"],
    "CAD": ["cad", "coronary_artery_disease"],
    "LAD": ["lad", "left_anterior_descending"],
    "LCX": ["lcx", "left_circumflex"],
    "RCA": ["rca", "right_coronary_artery"],
}

# Categorical vs Numerical feature splits for standard modeling
NUMERICAL_FEATURES: List[str] = [
    "Age", "Weight", "Length", "BMI", "BP", "PR", "FBS", "CR", "TG",
    "LDL", "HDL", "BUN", "ESR", "HB", "K", "Na", "WBC", "Lymph", "Neut",
    "PLT", "EF-TTE", "Region RWMA"
]

CATEGORICAL_FEATURES: List[str] = [
    "Sex", "DM", "HTN", "Current Smoker", "EX-Smoker", "FH", "Obesity",
    "CRBP", "Weak Peripheral Pulse", "Cough", "Dyspnea", "Typical Chest Pain",
    "Atypical", "Nonanginal", "Exertional CP", "LowTH Ang", "Edema",
    "Murmur", "Systolic Murmur", "Diastolic Murmur", "VHD", "Q Wave",
    "St Elevation", "St Depression", "Tinversion", "LVH", "Poor R Progression"
]

def normalize_column_name(raw_name: str) -> str:
    """Map any raw column name to its canonical name if known."""
    cleaned = raw_name.strip().lower().replace("_", " ")
    for canonical, aliases in COLUMN_ALIASES.items():
        if cleaned == canonical.lower():
            return canonical
        for alias in aliases:
            if cleaned == alias.lower().replace("_", " "):
                return canonical
    return raw_name.strip()

def is_leakage_column(col_name: str) -> bool:
    """Determine if a column introduces target leakage."""
    normalized = normalize_column_name(col_name)
    norm = normalized.strip().lower().replace(" ", "_")
    return norm in LEAKAGE_TARGET_COLUMNS or norm in {t.lower() for t in TARGETS}
