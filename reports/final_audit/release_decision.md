# CardioLens Track A release decision

Audit date: 2026-10-14

## Verdict

**NOT READY as a complete Track A submission.** The package is a working software demo, but the required 3–10-minute video is absent. More materially for this audit, the supplied workbook has not been authenticated against the UCI download, contains one contradiction between Cath and vessel labels, and remains incompatible with the current CSV-only training loader and fixed feature schema. No model was trained or evaluated on it. The saved model set remains the synthetic demo set.

## Dataset decision

The local workbook has 303 records and 59 columns on its populated sheet, matching the structure described by UCI's official Extension of Z-Alizadeh Sani record. UCI documents the overall CAD threshold as >=50% narrowing and provides a CC BY 4.0 license. The exact local file was not compared against the official download; local provenance is **NOT VERIFIED**. The overall target is represented by `Cath` (`CAD` 216, `Normal` 87); vessel targets are `LAD` (`Stenotic` 177, `Normal` 126), `LCX` (`Stenotic` 119, `Normal` 184), and `RCA` (`Stenotic` 114, `Normal` 189). The documented candidate positive classes are CAD and Stenotic respectively. One row contradicts UCI's any-stenotic CAD relation. Therefore labels are not ready for evaluation until that contradiction and source copy are resolved. Details and data quality findings are in `dataset_audit.md`.

The UCI repository license permits sharing/adaptation with attribution for its published dataset; it does not prove the supplied file is byte-identical. The workbook is excluded from the submission ZIP. Cite Alizadehsani, R., Roshanzamir, M., & Sani, Z. (2013), [UCI DOI 10.24432/C5461K](https://doi.org/10.24432/C5461K), CC BY 4.0 when using verified UCI data.

The project-generated synthetic CSV is included as the demo runtime dataset and is not the UCI patient workbook. A root license for CardioLens source/model artifacts is not supplied; do not infer one. The bundled heart mesh includes its CC0 notice. Python and npm runtime dependencies are declared in `backend/requirements.txt` and `frontend/package-lock.json`.

## Models and evaluation

`models/model_manifest.json` binds current artifacts to the bundled synthetic CSV (SHA-256 `4b6e0a08d400a4b113344e5ed56036688d0576abcf3462fab486558ea339c153`). Existing models were not overwritten or retrained. The label parser was safely corrected: it can map `Cath` to the overall CAD target when CAD is absent, recognizes `Stenotic`, and rejects missing/unknown labels; regression tests were added. The XLSX is still not ingestible by the training loader (CSV with explicit target columns is required), the fixed input schema differs, provenance is unmatched, and one label contradiction remains. No model was trained or evaluated on it. No actual-data performance metrics are available.

Synthetic pooled stratified out-of-fold metrics (support 303 per target) are reproduced only to accurately describe current artifacts. Candidate selection used pooled OOF F1 on the same partitions, so estimates may be optimistic. They are neither independent holdout nor clinical evidence. Confusion matrix order is `[[TN, FP], [FN, TP]]`.

| Target | Selected estimator | Accuracy | Precision | Recall | F1 | ROC-AUC | Confusion matrix |
|---|---|---:|---:|---:|---:|---:|---|
| CAD (synthetic) | RandomForest | 0.7492 | 0.7500 | 0.9722 | 0.8468 | 0.7812 | [[17,70],[6,210]] |
| LAD (synthetic) | LogisticRegression | 0.7624 | 0.7765 | 0.7952 | 0.7857 | 0.8584 | [[99,38],[34,132]] |
| LCX (synthetic) | LogisticRegression | 0.7459 | 0.6458 | 0.5905 | 0.6169 | 0.8089 | [[164,34],[43,62]] |
| RCA (synthetic) | LogisticRegression | 0.7195 | 0.6471 | 0.5739 | 0.6083 | 0.7762 | [[152,36],[49,66]] |

## Application and requirement status

Current implementation includes separate CAD/LAD/LCX/RCA endpoints, model outputs, per-target SHAP explanations, a Three.js schematic heart, vessel risk bands, and a visible disclaimer in source/API. Targeted backend ML tests and production build pass; the full TestClient suite stalls at the health test. Extracted ASGI health smoke passes, while a live loopback request times out. Browser layout, accessibility, and WebGL fallback are not verified. The heart is explanatory and not a patient-specific lesion map. See `requirement_traceability.md` for each Track A item and status.

Outstanding official deliverable: a 3–10-minute demonstration video or URL is not present; only a demo script exists.

## Release contents and archive

The existing original `CardioLens_Final_Submission.zip` and prior `CardioLens_Final_Submission_TrackA.zip` are preserved. The final archive is `CardioLens_Final_Submission.zip` inside the project root, distinct from the preserved parent-folder original. It excludes the user workbook, caches, virtual environments, `node_modules`, temporary directories, and secrets. Archive integrity, entry count, extraction, and startup-check results are recorded in `test_results.md`; exact byte size and SHA-256 are reported in the audit handoff.

## Actions before a complete release

1. Compare supplied workbook against UCI's official file by SHA-256 or row-level comparison; keep raw copy unchanged.
2. Resolve the one Cath/vessel contradiction with authoritative source evidence or a predeclared exclusion policy; do not edit labels silently.
3. Add verified XLSX/CSV ingestion and explicit predictor-schema/formula handling; the `Cath` and `Stenotic` parser mappings now have regression tests.
4. Train to new artifact paths only after those gates; use locked or nested validation with fold-local preprocessing. Keep synthetic and verified-data models distinct.
5. Record and publish a 3–10-minute demo, and run browser/accessibility/device checks.
6. Include UCI attribution for any verified UCI dataset or derived material redistributed under CC BY 4.0.

**Recommendation:** retain the current package only as a research/educational prototype. Do not present the current metrics as real-data performance or as clinical validation.
