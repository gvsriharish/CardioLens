"""
CardioLens - FastAPI Full-Stack Application
Provides RESTful APIs for cardiovascular risk prediction, multi-vessel stenosis estimation,
model metrics, and patient explainability.
Automatically serves the production frontend when built.
"""

from pathlib import Path
from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.app.schemas import (
    BatchPredictRequest,
    ModelInfoResponse,
    PatientInput,
    PredictionResponse,
    ScenarioRequest,
    ScenarioResponse,
)
from backend.app.service import (
    ExplanationUnavailableError,
    ModelUnavailableError,
    SAFETY_DISCLAIMER,
    VESSEL_CONFIGS,
    cardio_service,
)
from ml.schema import CATEGORICAL_FEATURES, NUMERICAL_FEATURES, TARGETS

FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

app = FastAPI(
    title="CardioLens API",
    description="Explainable Cardiovascular Risk Visualization & Vessel Stenosis Prediction Engine",
    version="1.0.0",
)

# Enable CORS for local Vite development & general web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def predict_or_unavailable(patient_dict: Dict[str, Any]):
    try:
        return cardio_service.predict_patient(patient_dict)
    except ModelUnavailableError as exc:
        raise HTTPException(
            status_code=503,
            detail="Prediction is unavailable because complete model artifacts could not be loaded. Restore or retrain the permitted local artifacts.",
        ) from exc
    except ExplanationUnavailableError as exc:
        raise HTTPException(
            status_code=503,
            detail="Prediction explanation is unavailable because SHAP could not produce valid contributions. No explanation values were returned.",
        ) from exc

# Preset clinical patient examples
SAMPLE_PATIENTS = {
    "high_risk": {
        "name": "High-Risk Patient (Acute STEMI Presentation)",
        "description": "64-year-old active smoker male with hypertension, diabetes, elevated LDL, typical substernal angina, acute ST elevation, and anterior wall hypokinesia (EF 38%).",
        "data": {
            "Age": 64.0,
            "Sex": "Male",
            "Weight": 84.0,
            "Length": 172.0,
            "BMI": 28.4,
            "DM": "Y",
            "HTN": "Y",
            "Current Smoker": "Y",
            "EX-Smoker": "N",
            "FH": "Y",
            "Obesity": "N",
            "CRBP": "N",
            "BP": 158.0,
            "PR": 94.0,
            "Weak Peripheral Pulse": "N",
            "Cough": "N",
            "Dyspnea": "Y",
            "Typical Chest Pain": "Y",
            "Atypical": "N",
            "Nonanginal": "N",
            "Exertional CP": "Y",
            "LowTH Ang": "N",
            "Edema": "0",
            "Murmur": "N",
            "Systolic Murmur": "N",
            "Diastolic Murmur": "N",
            "FBS": 168.0,
            "CR": 1.35,
            "TG": 240.0,
            "LDL": 168.0,
            "HDL": 32.0,
            "BUN": 26.0,
            "ESR": 32.0,
            "HB": 14.1,
            "K": 4.1,
            "Na": 138.0,
            "WBC": 9800.0,
            "Lymph": 20.0,
            "Neut": 76.0,
            "PLT": 260.0,
            "EF-TTE": 38.0,
            "Region RWMA": 3.0,
            "VHD": "None",
            "Q Wave": "1",
            "St Elevation": "1",
            "St Depression": "1",
            "Tinversion": "1",
            "LVH": "1",
            "Poor R Progression": "1",
        },
    },
    "moderate_risk": {
        "name": "Moderate-Risk Patient (Exertional Symptoms)",
        "description": "56-year-old female with long-standing hypertension, borderline fasting glucose, atypical chest discomfort, ST depression on stress ECG, and preserved systolic function (EF 52%).",
        "data": {
            "Age": 56.0,
            "Sex": "Female",
            "Weight": 72.0,
            "Length": 162.0,
            "BMI": 27.4,
            "DM": "N",
            "HTN": "Y",
            "Current Smoker": "N",
            "EX-Smoker": "Y",
            "FH": "Y",
            "Obesity": "N",
            "CRBP": "N",
            "BP": 138.0,
            "PR": 76.0,
            "Weak Peripheral Pulse": "N",
            "Cough": "N",
            "Dyspnea": "Y",
            "Typical Chest Pain": "N",
            "Atypical": "Y",
            "Nonanginal": "N",
            "Exertional CP": "N",
            "LowTH Ang": "N",
            "Edema": "0",
            "Murmur": "N",
            "Systolic Murmur": "N",
            "Diastolic Murmur": "N",
            "FBS": 112.0,
            "CR": 0.95,
            "TG": 185.0,
            "LDL": 134.0,
            "HDL": 46.0,
            "BUN": 16.0,
            "ESR": 18.0,
            "HB": 13.2,
            "K": 4.2,
            "Na": 141.0,
            "WBC": 6800.0,
            "Lymph": 31.0,
            "Neut": 63.0,
            "PLT": 215.0,
            "EF-TTE": 52.0,
            "Region RWMA": 1.0,
            "VHD": "Mild",
            "Q Wave": "0",
            "St Elevation": "0",
            "St Depression": "1",
            "Tinversion": "1",
            "LVH": "0",
            "Poor R Progression": "0",
        },
    },
    "low_risk": {
        "name": "Low-Risk Patient (Routine Prevention Check)",
        "description": "42-year-old asymptomatic male runner with optimal lipids (HDL 58 mg/dL, LDL 82 mg/dL), normal resting ECG, and robust left ventricular systolic function (EF 64%).",
        "data": {
            "Age": 42.0,
            "Sex": "Male",
            "Weight": 68.0,
            "Length": 178.0,
            "BMI": 21.5,
            "DM": "N",
            "HTN": "N",
            "Current Smoker": "N",
            "EX-Smoker": "N",
            "FH": "N",
            "Obesity": "N",
            "CRBP": "N",
            "BP": 116.0,
            "PR": 58.0,
            "Weak Peripheral Pulse": "N",
            "Cough": "N",
            "Dyspnea": "N",
            "Typical Chest Pain": "N",
            "Atypical": "N",
            "Nonanginal": "N",
            "Exertional CP": "N",
            "LowTH Ang": "N",
            "Edema": "0",
            "Murmur": "N",
            "Systolic Murmur": "N",
            "Diastolic Murmur": "N",
            "FBS": 88.0,
            "CR": 0.85,
            "TG": 92.0,
            "LDL": 82.0,
            "HDL": 58.0,
            "BUN": 13.0,
            "ESR": 6.0,
            "HB": 14.8,
            "K": 4.4,
            "Na": 142.0,
            "WBC": 5600.0,
            "Lymph": 36.0,
            "Neut": 56.0,
            "PLT": 235.0,
            "EF-TTE": 64.0,
            "Region RWMA": 0.0,
            "VHD": "None",
            "Q Wave": "0",
            "St Elevation": "0",
            "St Depression": "0",
            "Tinversion": "0",
            "LVH": "0",
            "Poor R Progression": "0",
        },
    },
}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure no raw stack traces or internal paths are exposed to the user."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Cardiovascular inference processing error.",
            "detail": "An internal error occurred while processing the patient features. Please verify all inputs.",
            "safety_disclaimer": SAFETY_DISCLAIMER,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return useful field errors without reflecting submitted patient values."""
    return JSONResponse(
        status_code=422,
        content={
            "detail": [
                {key: error[key] for key in ("loc", "msg", "type") if key in error}
                for error in exc.errors()
            ]
        },
    )

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy" if cardio_service.is_loaded else "degraded",
        "service": "CardioLens",
        "models_loaded": cardio_service.is_loaded,
        "mode": ("Synthetic Demo Models" if cardio_service.metrics.get("is_synthetic") else "Loaded Models") if cardio_service.is_loaded else "Model artifacts unavailable",
    }

@app.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    """Retrieve metadata about trained models, algorithms, and leakage rules."""
    algs = {
        target: cardio_service.metrics.get("targets", {}).get(target, {}).get("selected_model", "Calibrated Estimator")
        for target in TARGETS
    }
    return ModelInfoResponse(
        name="CardioLens Multi-Target Coronary Risk Ensemble",
        version="1.0.0",
        description="Research prototype for CAD and vessel-specific model output; bundled artifacts were trained on synthetic demonstration data.",
        targets=TARGETS,
        algorithms=algs,
        leakage_columns_excluded=["CAD", "Cath", "LAD", "LCX", "RCA"],
        feature_count=cardio_service.metrics.get("feature_count", 78),
        is_demo_mode=not cardio_service.is_loaded or cardio_service.metrics.get("is_synthetic", False),
        safety_disclaimer=SAFETY_DISCLAIMER,
    )

@app.get("/metrics")
def get_metrics():
    """Return 5-Fold Stratified Cross-Validation evaluation metrics."""
    if not cardio_service.metrics:
        raise HTTPException(status_code=404, detail="Metrics not yet computed or models not loaded.")
    return cardio_service.metrics

@app.get("/metadata")
def get_metadata():
    """Return dataset provenance and artifact metadata from repository manifests."""
    manifest_path = Path(__file__).resolve().parents[2] / "data" / "manifest.json"
    model_manifest_path = Path(__file__).resolve().parents[2] / "models" / "model_manifest.json"
    manifest = {}
    if manifest_path.exists():
        import json
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if model_manifest_path.exists():
        import json
        manifest["artifact_version"] = json.loads(model_manifest_path.read_text(encoding="utf-8")).get("artifact_version")
    return {
        "dataset": manifest,
        "model_mode": ("Synthetic Demo Models" if cardio_service.metrics.get("is_synthetic") else "Provenance Unverified Models") if cardio_service.is_loaded else "Model artifacts unavailable",
        "models_loaded": cardio_service.is_loaded,
        "metrics": cardio_service.metrics,
        "safety_disclaimer": SAFETY_DISCLAIMER,
    }

@app.get("/model/metrics")
def get_model_metrics():
    """Compatibility route for the model integrity passport."""
    return get_metrics()

@app.post("/predict", response_model=PredictionResponse)
def predict(patient: PatientInput):
    """Predict CAD and vessel-specific stenosis (LAD, LCX, RCA) probabilities."""
    patient_dict = patient.model_dump(by_alias=True)
    return predict_or_unavailable(patient_dict)

@app.post("/scenario", response_model=ScenarioResponse)
def predict_scenario(scenario: ScenarioRequest):
    """Compare a baseline profile with a hypothetical profile using live inference."""
    baseline = predict_or_unavailable(scenario.baseline_patient.model_dump(by_alias=True))
    hypothetical = predict_or_unavailable(scenario.hypothetical_patient.model_dump(by_alias=True))
    baseline_values = {
        "CAD": baseline.cad_probability, "LAD": baseline.lad_probability,
        "LCX": baseline.lcx_probability, "RCA": baseline.rca_probability,
    }
    hypothetical_values = {
        "CAD": hypothetical.cad_probability, "LAD": hypothetical.lad_probability,
        "LCX": hypothetical.lcx_probability, "RCA": hypothetical.rca_probability,
    }
    return ScenarioResponse(
        baseline_prediction=baseline,
        hypothetical_prediction=hypothetical,
        probability_differences_percentage_points={
            target: round((hypothetical_values[target] - baseline_values[target]) * 100, 2)
            for target in baseline_values
        },
        scenario_notice=("Hypothetical model comparison only; differences are not causal effects, treatment estimates, or clinical recommendations."),
    )

@app.post("/explain")
def explain(patient: PatientInput):
    """Return detailed Explainable AI feature attributions for a given patient."""
    patient_dict = patient.model_dump(by_alias=True)
    pred_res = predict_or_unavailable(patient_dict)
    return {
        "overall_risk": pred_res.overall_risk,
        "risk_level": pred_res.risk_level,
        "cad_probability": pred_res.cad_probability,
        "top_risk_contributors": pred_res.top_risk_contributors,
        "protective_factors": pred_res.protective_factors,
        "full_explanation": pred_res.explanation,
        "target_explanations": pred_res.target_explanations,
        "methodology": "Target-specific SHAP values using a deterministic subset of the bundled synthetic cohort as background. Contribution units depend on the estimator output (tree model output or linear-model raw margin); association only, not causation or clinical effect.",
        "disclaimer": SAFETY_DISCLAIMER,
    }

@app.get("/sample-patient")
def get_sample_patient(preset: str = "high_risk"):
    """Fetch preset clinical patient examples (high_risk, moderate_risk, low_risk)."""
    if preset not in SAMPLE_PATIENTS:
        preset = "high_risk"
    preset_obj = SAMPLE_PATIENTS[preset]
    prediction = predict_or_unavailable(dict(preset_obj["data"]))
    return {
        "preset_key": preset,
        "name": preset_obj["name"],
        "description": preset_obj["description"],
        "patient_data": preset_obj["data"],
        "prediction": prediction,
        "available_presets": list(SAMPLE_PATIENTS.keys()),
    }

@app.get("/features")
def get_features():
    """List clinical features categorized by examination section."""
    return {
        "demographics": ["Age", "Sex", "Weight", "Length", "BMI"],
        "comorbidities": ["DM", "HTN", "Current Smoker", "EX-Smoker", "FH", "Obesity", "CRBP"],
        "vitals_and_symptoms": [
            "BP", "PR", "Weak Peripheral Pulse", "Cough", "Dyspnea",
            "Typical Chest Pain", "Atypical", "Nonanginal", "Exertional CP", "LowTH Ang", "Edema", "Murmur"
        ],
        "laboratory": ["FBS", "CR", "TG", "LDL", "HDL", "BUN", "ESR", "HB", "K", "Na", "WBC", "Lymph", "Neut", "PLT"],
        "ecg_and_echo": ["EF-TTE", "Region RWMA", "VHD", "Q Wave", "St Elevation", "St Depression", "Tinversion", "LVH", "Poor R Progression"],
        "targets": TARGETS,
        "leakage_columns": ["CAD", "Cath", "LAD", "LCX", "RCA"],
    }

@app.post("/batch-predict")
def batch_predict(batch: BatchPredictRequest):
    """Batch prediction endpoint for clinical evaluation cohorts."""
    results = []
    for patient in batch.patients:
        res = predict_or_unavailable(patient.model_dump(by_alias=True))
        results.append({
            "cad_probability": res.cad_probability,
            "lad_probability": res.lad_probability,
            "lcx_probability": res.lcx_probability,
            "rca_probability": res.rca_probability,
            "overall_risk": res.overall_risk,
            "risk_level": res.risk_level,
        })
    return {"count": len(results), "predictions": results}

# Mount static frontend production build if available
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=False)
