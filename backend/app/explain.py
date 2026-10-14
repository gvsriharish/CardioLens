"""
Explainable AI (XAI) Attribution Engine for CardioLens.
Computes patient-specific feature attributions (positive risk contributors and
protective factors) using model-specific sensitivity, linear log-odds decomposition,
and background population references.
"""

from typing import Any, Dict, List, Tuple
import numpy as np
import shap
from functools import lru_cache
from ml.dataset_generator import load_or_create_dataset_records
from ml.schema import NUMERICAL_FEATURES, CATEGORICAL_FEATURES

# Human-readable labels and clinical descriptions for features
FEATURE_METADATA: Dict[str, Dict[str, str]] = {
    "Age": {"label": "Age", "unit": "years", "note": "Advanced age is associated with cumulative vascular arterial stiffness and plaque formation."},
    "Weight": {"label": "Weight", "unit": "kg", "note": "Excess body weight increases myocardial workload and metabolic demand."},
    "Length": {"label": "Height", "unit": "cm", "note": "Used in calculating body surface area and BMI."},
    "BMI": {"label": "Body Mass Index", "unit": "kg/m²", "note": "Elevated BMI correlates with systemic adiposity and atherogenic dyslipidemia."},
    "BP": {"label": "Systolic Blood Pressure", "unit": "mmHg", "note": "High blood pressure inflicts repetitive shear stress on coronary endothelial lining."},
    "PR": {"label": "Resting Pulse Rate", "unit": "bpm", "note": "Elevated resting heart rate increases myocardial oxygen demand and shear fatigue."},
    "FBS": {"label": "Fasting Blood Sugar", "unit": "mg/dL", "note": "Hyperglycemia promotes vascular inflammation and accelerates coronary atherosclerosis."},
    "CR": {"label": "Serum Creatinine", "unit": "mg/dL", "note": "Renal microvascular impairment strongly parallels coronary arterial disease."},
    "TG": {"label": "Serum Triglycerides", "unit": "mg/dL", "note": "Elevated triglycerides are linked with atherogenic remnant lipoproteins."},
    "LDL": {"label": "LDL Cholesterol", "unit": "mg/dL", "note": "High circulating LDL drives atheromatous plaque initiation and progression."},
    "HDL": {"label": "HDL Cholesterol", "unit": "mg/dL", "note": "High-density lipoprotein mediates reverse cholesterol transport (cardioprotective)."},
    "BUN": {"label": "Blood Urea Nitrogen", "unit": "mg/dL", "note": "Renal functional indicator associated with cardiorenal syndrome."},
    "ESR": {"label": "Erythrocyte Sedimentation Rate", "unit": "mm/hr", "note": "Non-specific systemic inflammatory marker elevated in active vascular disease."},
    "HB": {"label": "Hemoglobin", "unit": "g/dL", "note": "Determines arterial oxygen delivery capacity to ischemic myocardium."},
    "K": {"label": "Serum Potassium", "unit": "mEq/L", "note": "Electrolyte balance critical for myocardial membrane potential."},
    "Na": {"label": "Serum Sodium", "unit": "mEq/L", "note": "Electrolyte reflective of neurohormonal volume regulation."},
    "WBC": {"label": "White Blood Cell Count", "unit": "/mcL", "note": "Leukocyte count indicates underlying vascular inflammatory activity."},
    "Lymph": {"label": "Lymphocyte Ratio", "unit": "%", "note": "Lower lymphocyte ratio may reflect physiological stress response."},
    "Neut": {"label": "Neutrophil Ratio", "unit": "%", "note": "Elevated neutrophils reflect acute and subacute vascular inflammation."},
    "PLT": {"label": "Platelet Count", "unit": "x10³/mcL", "note": "Platelets are key mediators of coronary thrombus formation."},
    "EF-TTE": {"label": "Ejection Fraction (Echo)", "unit": "%", "note": "Depressed LV systolic function (<50%) indicates myocardial damage or ischemia."},
    "Region RWMA": {"label": "Regional Wall Motion Abnormality", "unit": "grade 0-4", "note": "Echocardiographic indicator of localized territory hypokinesia or akinesia."},
    "Typical Chest Pain": {"label": "Typical Anginal Chest Pain", "unit": "", "note": "Substernal exertional discomfort relieved by rest is classic for coronary ischemia."},
    "St Elevation": {"label": "ST Segment Elevation", "unit": "", "note": "ECG marker strongly associated with acute transmural myocardial injury."},
    "St Depression": {"label": "ST Segment Depression", "unit": "", "note": "ECG marker associated with subendocardial ischemia."},
    "Tinversion": {"label": "T-Wave Inversion", "unit": "", "note": "ECG repolarization abnormality associated with localized ischemia."},
    "Q Wave": {"label": "Pathologic Q Waves", "unit": "", "note": "ECG evidence of previous localized myocardial infarction."},
    "LVH": {"label": "Left Ventricular Hypertrophy", "unit": "", "note": "Reflects chronic pressure overload from long-standing hypertension."},
    "Poor R Progression": {"label": "Poor R-Wave Progression", "unit": "", "note": "Anterior lead ECG pattern associated with prior anterior myocardial damage."},
    "DM": {"label": "Diabetes Mellitus History", "unit": "", "note": "Diabetes causes diffuse micro- and macro-vascular coronary endothelial dysfunction."},
    "HTN": {"label": "Hypertension History", "unit": "", "note": "Long-term arterial hypertension accelerates coronary plaque vulnerability."},
    "Current Smoker": {"label": "Active Tobacco Smoking", "unit": "", "note": "Nicotine and combustion toxins induce endothelial oxidative injury and spasm."},
    "FH": {"label": "Family History of CAD", "unit": "", "note": "Reflects polygenic predisposition and shared familial cardiometabolic risks."},
    "Dyspnea": {"label": "Exertional Dyspnea", "unit": "", "note": "Shortness of breath on exertion often functions as an anginal equivalent."},
    "VHD": {"label": "Valvular Heart Disease", "unit": "", "note": "Concurrent valvular disease alters cardiac loading and hemodynamics."},
}

@lru_cache(maxsize=1)
def _background_records():
    """Use a deterministic subset of the bundled training-reference cohort."""
    records, _ = load_or_create_dataset_records()
    if not records:
        raise RuntimeError("SHAP reference cohort is unavailable")
    # Spread the background across the cohort rather than taking only its first rows.
    indices = np.linspace(0, len(records) - 1, min(32, len(records)), dtype=int)
    return [records[i] for i in indices]


def explain_patient_prediction(
    model,
    X_processed_patient: np.ndarray,
    preprocessor,
    raw_patient_dict: Dict[str, Any],
    top_k: int = 8
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Generate signed feature attributions for a single patient:
    - Top risk-increasing factors
    - Top protective factors
    - Overall explanation array
    """
    feature_names = preprocessor.get_feature_names()
    x = X_processed_patient[0]  # 1D array of scaled/encoded features

    if not hasattr(model, "predict_proba") or 1 not in model.classes_:
        raise RuntimeError("SHAP explanation requires a binary probability model")
    background = preprocessor.transform(_background_records())
    # SHAP selects Tree or Linear explainers for these supported sklearn models.
    # Linear models explain raw margin (log-odds); tree models use model output.
    explainer = shap.Explainer(model, background, feature_names=feature_names)
    shap_result = explainer(X_processed_patient)
    attributions = np.asarray(shap_result.values)
    if attributions.ndim == 3:
        positive_index = list(model.classes_).index(1)
        attributions = attributions[0, :, positive_index]
    elif attributions.ndim == 2:
        attributions = attributions[0]
    else:
        raise RuntimeError(f"Unexpected SHAP value shape: {attributions.shape}")
    if len(attributions) != len(feature_names) or not np.all(np.isfinite(attributions)):
        raise RuntimeError("SHAP returned invalid feature contributions")

    # Group one-hot encoded categories back to original base features
    base_contributions: Dict[str, float] = {}
    for feat_name, attr in zip(feature_names, attributions):
        # Handle cat_col_val or num_col
        base_name = feat_name
        if feat_name.startswith("cat__"):
            base_name = feat_name.replace("cat__", "").split("_")[0]
        elif feat_name.startswith("num__"):
            base_name = feat_name.replace("num__", "")
        else:
            matching_categories = [name for name in CATEGORICAL_FEATURES if feat_name.startswith(name + "_")]
            if matching_categories:
                base_name = max(matching_categories, key=len)

        base_contributions[base_name] = base_contributions.get(base_name, 0.0) + float(attr)

    items: List[Dict[str, Any]] = []
    for feat, contrib in base_contributions.items():
        meta = FEATURE_METADATA.get(feat, {"label": feat, "unit": "", "note": "Associated with the model prediction."})
        raw_val = raw_patient_dict.get(feat, "")
        if raw_val is None or raw_val == "":
            continue

        direction = "increases_risk" if contrib > 0.005 else ("protective" if contrib < -0.005 else "neutral")
        abs_val = abs(contrib)
        magnitude = "High" if abs_val > 0.25 else ("Moderate" if abs_val > 0.10 else "Low")

        unit = f" {meta['unit']}" if meta['unit'] else ""
        formatted_val = f"{raw_val}{unit}"

        items.append({
            "feature": feat,
            "label": meta["label"],
            "value": formatted_val,
            "contribution": round(contrib, 4),
            "direction": direction,
            "impact_magnitude": magnitude,
            "clinical_note": "SHAP attribution for this target and model output; association only, not causation or a clinical effect.",
        })

    # Sort positive (risk contributors) descending
    positive_factors = sorted([item for item in items if item["direction"] == "increases_risk"], key=lambda x: x["contribution"], reverse=True)
    # Sort negative (protective factors) ascending (most protective first)
    protective_factors = sorted([item for item in items if item["direction"] == "protective"], key=lambda x: x["contribution"])

    top_risk = positive_factors[:top_k]
    top_protective = protective_factors[:top_k]
    combined_explanation = top_risk + top_protective

    return combined_explanation, top_risk, top_protective
