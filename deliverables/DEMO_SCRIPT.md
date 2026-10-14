# CardioLens Demo Script (4–6 minutes)

## Before recording

Start backend and frontend using `README.md`. Confirm the interface identifies synthetic demo data and keep the educational-use disclaimer visible. Use built-in examples only; do not enter patient information.

## Flow

- **0:00–0:40 — Purpose:** Explain that CardioLens demonstrates separate CAD, LAD, LCX, and RCA model outputs. State clearly that its 303-row data are synthetic, not verified clinical records.
- **0:40–1:40 — Input and validation:** Load a bundled sample profile, review supported tabular fields, and submit it through the local API. Mention that the dataset does not include image/audio inputs.
- **1:40–2:30 — Results:** Show four model-estimated outputs and target-specific model attribution. Keep evaluation metrics separate from an individual sample output.
- **2:30–3:30 — Anatomy:** Rotate and zoom the scene; reset the camera and select LAD, LCX, or RCA. Explain that the whole-vessel highlight is schematic and cannot locate a lesion.
- **3:30–4:20 — What-if:** Change one supported feature in the hypothetical copy and run the API-backed comparison. Show baseline and hypothetical outputs, and state this is not a causal treatment estimate.
- **4:20–5:20 — Integrity Passport:** Show source status, data hash, cross-validation method, sample counts, and metrics. State that independent validation, calibration, and OOD detection are not evaluated.
- **5:20–5:40 — Close:** Reinforce that this is an educational software prototype, not a diagnosis or care recommendation.

## Recording and upload checklist

- Capture 3–10 minutes and review audio, legibility, and visible synthetic-data/safety disclosures.
- Do not show credentials, real patient data, or claim clinical performance.
- Save the recording locally, then upload to YouTube using the user's account and preferred visibility setting. No recording or upload is claimed by this project; provide the final URL only after the user completes the upload.
