# CardioLens — Trust-Aware 3D Cardiovascular Risk Visualization (React)

CardioLens is an educational research and clinical decision-support prototype rewritten as a high-performance React application using TypeScript, Three.js, and Tailwind CSS. It visualizes coronary risk anatomy, estimates CAD (Coronary Artery Disease) and vessel-specific stenosis probabilities (LAD, LCX, RCA), provides Explainable AI (XAI) feature attributions, runs interactive what-if scenarios, and verifies dataset and model integrity.

## Key Features

- **Interactive 3D Heart & Coronary Hemodynamics**: Procedural 3D anatomical heart with selectable coronary artery branch overlays (LAD, LCX, RCA), dynamic pulse synchronization, anterior/posterior/left/right/superior viewing angles, and risk-calibrated emissive vessel coloring.
- **Multi-Target Risk Scoring**: Evaluates global CAD risk along with vessel-specific stenosis probabilities across the Left Anterior Descending (LAD), Left Circumflex (LCX), and Right Coronary Artery (RCA), synthesized via a weighted anatomical risk aggregation.
- **Explainable AI (XAI) Attribution**: SHAP-style signed feature attribution highlighting top adverse risk drivers and cardioprotective factors with clinical contextual notes for each coronary vessel territory.
- **What-If Scenario Lab (Counterfactual Analysis)**: Allows clinicians to adjust modifiable parameters (e.g. LDL cholesterol, blood pressure, ejection fraction) side-by-side against baseline patient data and inspect projected risk differences in percentage points.
- **Cross-Validation Model Performance Audit**: Displays stratified 5-fold cross-validation benchmarks (Accuracy, Precision, Recall, F1-Score, ROC-AUC, Brier score) across all target vessels.
- **Model Integrity Passport**: Transparent audit documentation showing dataset provenance (SHA-256 fingerprint, 303 synthetic cohort records), zero target-leakage validation, and calibration notices.
- **Synthetic Example Presets**: One-click clinical profiles representing High Risk (STEMI presentation), Moderate Risk (Exertional Ischemia), and Low Risk (Routine Preventive Screening).

## Running the Application

```bash
npm install
npm run dev
```

The application starts on port 3000 (`http://localhost:3000`).

To build for production:

```bash
npm run build
```

To run lint checks:

```bash
npm run lint
```

## Safety Disclaimer

CardioLens is an educational and research decision-support prototype only. Predictions are statistical model outputs, not a medical diagnosis, do not localize patient-specific anatomical lesions, and are not a substitute for professional medical assessment or formal clinical diagnostic imaging.
