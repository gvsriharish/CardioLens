# User Guide

## Start the app

From the repository root, start FastAPI with `python -m backend.app.main`. In a second terminal, run `cd frontend; npm run dev -- --host 127.0.0.1`; open `http://127.0.0.1:5173/`. For production-style local serving, build the frontend with `cd frontend; npm run build`, then start the backend and open `http://127.0.0.1:8000/`.

## Patient profile and predictions

The bundled profiles are synthetic examples. The form opens on a labelled synthetic example; edit the displayed values or select another example, then choose **Analyze Cardiovascular Risk**. The API returns CAD, LAD, LCX, and RCA model outputs when all required fields are present and compatible model artifacts are loaded. The probability band/color is a display convention and not a diagnostic threshold. API requests reject omitted required fields instead of applying defaults; BMI and Obesity may be derived from supplied height and weight.

## 3D anatomy

The scene is a stylized procedural heart, ribcage, and coronary-vessel model. Drag to rotate; scroll to zoom; use the vessel cards to focus/select a vessel; use reset to restore the camera. The selected vessel's panel describes the whole-vessel model output. It does not show patient-specific imaging, plaque locations, measured narrowing, or lesion lengths.

## What-If Scenario Lab

Open the **What-If Scenario** tab to edit a hypothetical copy of the current form's LDL, systolic BP, and ejection fraction. The displayed baseline remains the original profile. **Compare with backend** sends both profiles to `/scenario`; the returned predictions and percentage-point differences are from live model inference. The hypothetical prediction drives the 3D colors while a scenario result is active. **Reset scenario** restores the ordinary prediction view. This is not a causal estimate, treatment effect, or care recommendation.

## Integrity Passport and explanations

The **Integrity Passport** reads provenance, hashes, class counts, validation method, and metrics from backend-generated artifacts. It reports calibration/OOD status as not evaluated. The explanation panel shows target-specific SHAP attributions relative to a deterministic synthetic-cohort reference subset; select CAD, LAD, LCX, or RCA to view that target's explanation. Units vary by estimator and contributions do not establish causation. If explanation generation fails, the API reports an error rather than invented values.

## Safety

Educational and research decision-support prototype only. Outputs are synthetic-data demonstrations and are not a diagnosis. Do not use them for clinical decisions.
