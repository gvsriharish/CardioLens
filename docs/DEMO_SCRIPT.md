# CardioLens Hackathon Demo (4-6 minutes)

## Before the demo

- Start the backend and frontend using the commands in `README.md`.
- Confirm the header says **Trained models loaded** and **Synthetic demo data**.
- Use only the bundled example profiles. Avoid actual patient records.
- Keep the persistent safety disclaimer visible.

## Script

### 0:00-0:40 | Introduce the prototype

"CardioLens is a research prototype for cardiovascular risk visualization. It returns four separate model outputs: CAD, LAD, LCX, and RCA. The bundled 303-row dataset is synthetic, not verified clinical data. The displayed outputs are not medical advice or clinical validation."

### 0:40-1:40 | Submit a demonstration profile

Select **High Risk STEMI / LAD** and run **Analyze Cardiovascular Risk**. Point out the four probabilities and model attribution panel. Explain that the chosen profile is hypothetical and sent to the local FastAPI service.

### 1:40-2:40 | Explore the anatomy

Rotate/zoom the procedural heart and select a vessel card. Show how its probability band and detail panel follow the current backend response. State that the visualization maps a whole-vessel statistical output; it does not show plaque coordinates or measured lumen narrowing.

### 2:40-3:40 | Demonstrate a what-if comparison

Open **What-If Scenario**, adjust one supported input in the hypothetical copy, and run the comparison. Show baseline, hypothetical, and percentage-point differences. State that these are model comparisons, not causal effects or treatment estimates. Reset the scenario.

### 3:40-4:40 | Review integrity and limitations

Open **Integrity Passport**. Show synthetic provenance, SHA-256, class distributions, leakage exclusions, pooled stratified cross-validation method, and metrics. Explicitly say there is no independent holdout, external validation, calibration study, or OOD detector.

### 4:40-5:00 | Close safely

"This is a software demonstration. It is not a diagnosis, does not localize lesions, and must not guide care. Authentic, licensed data and independent evaluation are prerequisites for stronger performance claims."

## Recording checklist

- Keep credentials and real patient information out of frame and out of test requests.
- Show the synthetic-data badge and safety warning before showing predictions.
- Do not narrate the synthetic metrics as clinical performance.
- Do not call the what-if comparison a treatment effect.
- Do not claim an uploaded/recorded video until one is actually created and saved.
