# ML leakage and validation audit — supplied workbook vs current CardioLens artifacts

Audit date: 2026-10-14. No model was retrained and no existing artifact was replaced.

## What the current artifacts represent

The saved `cad_model.joblib`, `lad_model.joblib`, `lcx_model.joblib`, `rca_model.joblib`, and preprocessor are associated in `models/model_manifest.json` with CSV SHA-256 `4b6e0a08d400a4b113344e5ed56036688d0576abcf3462fab486558ea339c153`. The bundled CSV matches the project's seeded synthetic generator; these artifacts were **not trained on the newly supplied Excel workbook**. The manifest is unsigned and is not independent historical proof.

Existing metrics are pooled five-fold out-of-fold estimates on synthetic labels after selecting the candidate with the highest pooled OOF F1. This selection reuses the score set and can be optimistic. They are not estimates on the supplied workbook or clinical performance. Real-data metrics for CAD/Cath, LAD, LCX, and RCA: **not produced** (no holdout split or model evaluation was run).

## Leakage and target handling

| Check | Finding |
|---|---|
| Target columns | Workbook has `LAD`, `LCX`, `RCA`, `Cath`; no separate `CAD`. Correct candidate mapping is `Cath` -> overall CAD, pending source-copy verification and conflict resolution. |
| Inputs | All four outcome columns must be excluded from predictors for every task. Current `ml/schema.py` and `CardioPreprocessor.sanitize_record()` explicitly drop CAD, Cath, LAD, LCX, RCA, and alias normalization recognizes the named targets. This is a source-level safeguard, but does not make source-workbook training compatible. |
| Label parser correction | `CardioPreprocessor.extract_dataset()` now falls back from a missing CAD field to the source-specific Cath field, recognizes `Stenotic`, and rejects missing or unknown target labels instead of treating them as negative. Regression tests cover these cases and target exclusion. This is parser support only; the loader still accepts CSV requiring explicit CAD/LAD/LCX/RCA columns, and the supplied workbook is XLSX. |
| Feature schema mismatch | The fixed 22 numerical + 27 categorical input schema is not a schema-driven ingest of the workbook's 55 pre-outcome fields. Several workbook columns (including CRF, CVA, Airway disease, Thyroid Disease, CHF, DLP, Lung rales, and BBB) are not modeled; the project also expects fields absent from this workbook (including CRBP, Cough, and Murmur). These are meaningful schema differences, not safely interchangeable aliases. |
| Derived inputs | BMI is formula-derived from Weight/Length; Obesity is partly formula-derived using >=25 and partly literal. These are redundant/definition-sensitive predictors. BMI formula is an exact arithmetic derivation, not outcome leakage, but preprocessing should recompute/validate under an explicit protocol and avoid treating formula text as a value. Obesity threshold conflicts with app code's >=30. |
| Other leakage | Empty template sheet contains therapy, stress-test, catheterization lesion/anatomy, and procedure fields that could be post-outcome. It has no rows and is not used. If later populated, timing must be established; exclude post-diagnostic/procedural variables for pre-diagnostic inference. `Region RWMA` is not an anatomical lesion map. |
| Split contamination / duplicate patients | Existing training fits imputation/encoding/scaling within each training fold (good). Dataset has no patient identifier; exact duplicate rows and duplicate non-target profiles are both zero, but patient separation across partitions cannot be verified. |
| Target consistency | One record has Cath=Normal with at least one vessel=Stenotic, despite UCI's stated CAD-as-any-stenosis relationship. Label disagreement must be adjudicated or governed by a predeclared exclusion policy; neither target should be silently edited. |
| Positive classes | Documented candidate positives: Cath `CAD`; each vessel `Stenotic`. UCI defines overall CAD >=50% diameter narrowing; detailed per-vessel threshold/coding documentation needs confirmation. The source-specific parser mapping is now covered by regression tests; the per-vessel cutoff still requires source-specific clinical documentation. |

No target column was found among current model input features by source review of the fixed preprocessor and target exclusion tests. No indication exists that the present models used the Excel. Potential indirect leakage from source timing/derived columns cannot be resolved solely from this workbook; the empty template's procedural fields remain prohibited until timing is documented.

## Evaluation decision

The UCI record documents a public dataset with CC BY 4.0, but the supplied file has not been matched byte-for-byte or row-for-row against UCI's downloadable copy. The label parser has been corrected and regression-tested, but XLSX ingestion/training is not implemented, predictor schemas differ, local-file identity is unresolved, and one cross-target label conflict remains. Therefore the validation gate is **FAIL / STOP** for training or evaluation on this local workbook. Existing models are preserved for the synthetic demo only.

| Target | Actual held-out metrics on supplied workbook |
|---|---|
| Overall CAD (candidate `Cath`) | Not evaluated |
| LAD | Not evaluated |
| LCX | Not evaluated |
| RCA | Not evaluated |

Do not substitute synthetic OOF estimates for these values. Before training: verify local file against official UCI download; settle target mapping and conflicting label with authoritative documentation; define formula handling, input-field mapping, and clinical measurement timing; implement explicit XLSX/CSV source ingestion and schema mapping; then use a locked stratified holdout or nested CV with fold-local preprocessing and report support/confusion matrix, precision/recall/F1/accuracy/AUC per target. Preserve existing artifacts and train to a new output version only after that gate.
