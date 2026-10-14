# CardioLens — REST API Documentation

Base URL: `http://localhost:8000`

---

## 1. System & Health

### `GET /health`
Returns system health, inference readiness, and production mode.
```json
{
  "status": "healthy",
  "service": "CardioLens",
  "models_loaded": true,
  "mode": "Synthetic Demo Models"
}
```

### `GET /metadata`
Returns the generated dataset provenance manifest, artifact version, model readiness, and evaluation metrics. Provenance status is `synthetic` for the bundled CSV; a different local CSV is reported as `unverified` unless its source can be documented externally.

### `GET /model-info`
Provides metadata on trained models, algorithms, excluded leakage features, and safety notices.

### `GET /metrics`
Returns 5-fold stratified cross-validation performance metrics (Accuracy, Precision, Recall, F1, ROC-AUC) across CAD, LAD, LCX, and RCA. Bundled artifacts and metrics use a synthetic dataset exactly reproduced by the repository generator; they are not clinical validation results.

`GET /model/metrics` is an alias for clients using that path.

---

## 2. Clinical Prediction & Explainability

### `POST /predict`
Performs multi-target prediction for a patient.

Use `GET /sample-patient?preset=low_risk` and send its complete `patient_data` object as the request body to `POST /predict` to reproduce the example below.

**Response excerpt from a live low-risk synthetic demo profile on 2026-10-14**:
```json
{
  "cad_probability": 0.4222,
  "lad_probability": 0.0009,
  "lcx_probability": 0.0005,
  "rca_probability": 0.0308,
  "overall_risk": 0.1543,
  "model_mode": "Synthetic Demo Models",
  "is_synthetic_dataset": true,
  "evidence_status": "Synthetic demonstration dataset; not authentic clinical records",
  "calibration_status": "Not evaluated; returned probabilities are not established as calibrated",
  "out_of_distribution_status": "Not evaluated; no validated applicability-domain detector is available"
}
```

Each response also reports `evidence_status`, `data_quality_status`, `calibration_status`, and `out_of_distribution_status`. Calibration and OOD detection are not evaluated. Probability bands in the UI are display conventions.

### `POST /explain`
Returns the CAD view and per-target SHAP attributions with clinical notes. SHAP values explain the fitted model output relative to a deterministic subset of the bundled synthetic cohort; they are not causal effects or clinical effects. Units may differ by estimator (tree output versus linear raw margin).

### `POST /scenario`
Accepts `{ "baseline_patient": PatientInput, "hypothetical_patient": PatientInput }`. Returns both predictions, per-target percentage-point differences, and a notice that the comparison is not causal or a treatment estimate. Unknown fields (including outcomes) and unsupported categorical values are rejected by schema validation.

### `GET /sample-patient?preset={high_risk|moderate_risk|low_risk}`
Returns pre-configured clinical patient profiles with pre-computed model inferences.

### `GET /features`
Lists all expected clinical predictors categorized by diagnostic modality.

### `POST /batch-predict`
Accepts a cohort of patients and yields batched predictions for clinical evaluation studies.
# Input completeness

`POST /predict`, `/explain`, `/scenario`, and `/batch-predict` require all clinical predictor fields in each patient object. The server returns HTTP 422 and identifies missing fields rather than filling them with defaults. `BMI` and `Obesity` are optional because the service derives them from the supplied height and weight. A batch must contain 1–100 patients. The browser's initial values and selectable presets are synthetic examples and are labelled as such.

