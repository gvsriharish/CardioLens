# Implementation Audit

Historical implementation audit from an earlier pass on 2026-10-14. Current final evidence and corrections are in `reports/final_audit/`. The supplied folder has no `.git` metadata.

## Baseline inspected

Reviewed the README, dependency manifests, ML schema/preprocessor/training code, data loader and generator, saved artifacts, FastAPI schemas/routes/service/explanation code, frontend services/components, and existing tests. The workspace directory has no `.git` metadata, so a tracked-file diff or commit baseline is unavailable.

At that earlier baseline, the backend suite reported **11 passed** and the frontend build reported a 676 kB chunk. Those are historical baseline numbers, not current final verification. The current CSV has 303 rows and 54 columns and exactly matches the seeded generator (`n_samples=303`, `random_state=42`).

## Findings and disposition

| Area | Baseline finding | Status after this pass |
| --- | --- | --- |
| Provenance | README disclosed synthetic CSV, but no machine-readable data manifest or integrity passport existed. | Added generated `data/manifest.json`, artifact hashes/version, `/metadata`, and UI passport. Synthetic status stays explicit. |
| Leakage | Training removed target/catheterization columns after normalization; API schema ignored unexpected keys, so outcome keys could be silently sent. | API now rejects extra fields and invalid categorical options; tests cover label injection. Training continues excluding CAD/Cath/LAD/LCX/RCA. |
| Evaluation | Fold-local preprocessing and pooled stratified CV existed. Candidate selection and metrics used the same pooled out-of-fold scores; no independent holdout, calibration, or external validation. | Added explicit selection-bias warning, support/prevalence, confusion matrix, Brier score, data quality counts, data hash. No holdout or calibration claim is made. |
| API | Health/model-info/metrics/predict/explain/sample/features/batch routes existed; no provenance metadata or what-if route. | Added `/metadata`, `/model/metrics`, and `/scenario`; scenario computes both full predictions with the active service and returns percentage-point deltas. |
| Evidence | Output did not distinguish probability bands from clinical thresholds and did not report calibration or applicability limitations. | Added explicit evidence, data-quality, calibration, and OOD status fields; bands are identified as display conventions. Calibration and OOD detection remain unavailable. |
| Frontend | Interactive Three.js anatomy, API predictions, and vessel-specific attributions existed. No scenario comparison or dedicated integrity passport. | Added both panels. Hypothetical result drives the existing vessel visualization; reset restores baseline display. Vessel cards are keyboard-operable buttons. |
| Documentation | Core architecture/API/ML/demo docs existed; requested ethics, user guide, audit, checklist, and report were absent or overstated some claims. | Added/updated requested docs. Demo wording now avoids clinical claims and fabricated metrics. |
| Tests | Earlier backend tests covered core routes and leakage preprocessing; no frontend E2E suite. | The current final audit ran 16 backend tests and the frontend production build. No browser walkthrough or automated E2E test suite is claimed. |

## Known unresolved gaps

- No authentic, licensed benchmark CSV or independent source metadata was available. Current models remain synthetic demonstrations.
- No independent held-out test cohort, external validation, calibrated probabilities, uncertainty intervals, or OOD detector.
- Model selection is based on pooled out-of-fold F1 and metrics on the same pooled predictions; estimates can be optimistic.
- The browser starts with labelled synthetic presets. The API now rejects omitted required predictors (BMI and Obesity can be derived from supplied height/weight); validation is not a clinical measurement-quality check.
- Target-specific SHAP values are now computed for the bundled estimators using a deterministic synthetic-cohort reference subset. Units vary by estimator, and contributions are associations, not causal explanations.
- No frontend unit test or automated browser E2E harness is configured.
- The exact anatomical mesh is procedural and stylized; it maps whole-vessel output bands and cannot localize a lesion.
- No repository Git metadata was present, so changes cannot be summarized as a Git diff or committed here.
