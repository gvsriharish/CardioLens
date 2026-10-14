# CardioLens — Machine Learning Pipeline

> **Dataset provenance correction (2026-10-14):** The bundled `data/z_alizadeh_sani_dataset.csv` exactly matches the repository's seeded synthetic generator; these are not verified UCI records. All current metrics and artifacts are synthetic-data demonstrations only. They do not support claims of clinical performance or generalization. Training fits preprocessing independently within each CV fold and refuses to overwrite the CSV.

## 1. Problem Formulation & Multi-Target Objectives

Coronary Artery Disease (CAD) diagnosis typically requires expensive, invasive catheterization or specialized coronary computed tomography angiography (CCTA). CardioLens formulates this as a multi-target statistical learning problem:

$$\hat{y}_{\text{CAD}}, \hat{y}_{\text{LAD}}, \hat{y}_{\text{LCX}}, \hat{y}_{\text{RCA}} = f(\mathbf{x}_{\text{clinical}})$$

where $\mathbf{x}_{\text{clinical}}$ contains non-invasive patient measurements:
- **Demographics**: Age, Biological Sex, Weight, Height, BMI.
- **Vascular Comorbidities**: Diabetes Mellitus (DM), Hypertension (HTN), Current Smoker, Ex-Smoker, Family History (FH), Chronic Renal/BP complications.
- **Physical Examination & Symptoms**: Systolic Blood Pressure (BP), Resting Pulse Rate (PR), Typical Angina, Exertional Dyspnea, Murmurs.
- **Laboratory Panel**: Fasting Blood Sugar (FBS), Serum Creatinine (CR), Triglycerides (TG), LDL Cholesterol, HDL Cholesterol, Blood Urea Nitrogen (BUN), Erythrocyte Sedimentation Rate (ESR), Hemoglobin (HB).
- **ECG & Echocardiography**: ST Segment Elevation, ST Segment Depression, Pathological Q Waves, T-Wave Inversion, LV Hypertrophy, Ejection Fraction (EF-TTE), Regional Wall Motion Abnormality (RWMA).

---

## 2. Direct Outcome Leakage Exclusion

A critical failure mode in coronary ML competitions is leakage of post-catheterization findings (`Cath`, `CAD`, `LAD`, `LCX`, `RCA`) into feature sets:
```python
LEAKAGE_TARGET_COLUMNS = {'cath', 'cad', 'lad', 'lcx', 'rca', 'vessel_stenosis'}
```
Before training, direct outcome/catheterization columns and aliases are excluded from $\mathbf{X}$. This is not a guarantee against every derived or post-diagnosis field; those require review against a trustworthy dataset dictionary, which is not available for the synthetic fixture.

---

## 3. Preprocessing & Feature Engineering

- **Numerical Pipeline**:
  - Missing value imputation using training fold medians (`SimpleImputer(strategy='median')`).
  - Z-score standardization (`StandardScaler`) to normalize scale discrepancies across physiological units (e.g., age vs leukocyte counts).
- **Categorical Pipeline**:
  - Missing value imputation using most frequent class (`SimpleImputer(strategy='most_frequent')`).
  - One-Hot Encoding (`OneHotEncoder(handle_unknown='ignore', sparse_output=False)`).
- **Output Space**: 78 engineered features representing all non-invasive clinical indicators.

---

## 4. Cross-Validation & Model Selection

Because the bundled synthetic demonstration contains only 303 records, evaluation employs **5-Fold Stratified Cross-Validation** to preserve target prevalence across folds:

### Stratified CV Results (Synthetic Demonstration Dataset)

| Target | Selected estimator | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **CAD** | RandomForest | **74.9%** | 75.0% | 97.2% | **0.847** | **0.781** |
| **LAD** | LogisticRegression | **76.2%** | 77.6% | 79.5% | **0.786** | **0.858** |
| **LCX** | LogisticRegression | **74.6%** | 64.6% | 59.0% | **0.617** | **0.809** |
| **RCA** | LogisticRegression | **71.9%** | 64.7% | 57.4% | **0.608** | **0.776** |

These exact results are synthetic-data results stored in `models/metrics.json`.

---

## 5. Model-Derived Overall Risk Scoring

Overall cardiovascular risk is computed through a transparent, weighted anatomical aggregation:

$$\text{Risk}_{\text{overall}} = 0.35 \cdot P(\text{CAD}) + 0.30 \cdot P(\text{LAD}) + 0.15 \cdot P(\text{LCX}) + 0.20 \cdot P(\text{RCA})$$

- **Threshold Categories**:
  - $0\% - 25\%$: Low Risk (Emerald `#10b981`)
  - $25\% - 50\%$: Moderate Risk (Amber `#f59e0b`)
  - $50\% - 75\%$: High Risk (Orange `#f97316`)
  - $75\% - 100\%$: Very High Risk (Crimson `#ef4444`)

---

## 6. Explainable AI (XAI) Attribution

Attributions $\phi_j$ are calculated for each patient relative to the standardized baseline cohort:
- **Linear Models (Log-Odds Decomposition)**:
  $$\phi_j = x_j \cdot w_j$$
- **Tree Models**:
  Local probability sensitivity by replacing one standardized input at a time with the training baseline. This is model association, not a causal effect.
- Contributions are categorized into:
  - **Risk Contributors** ($\phi_j > 0$): Factors elevating predicted stenosis probability.
  - **Protective Factors** ($\phi_j < 0$): Factors buffering against predicted stenosis.
