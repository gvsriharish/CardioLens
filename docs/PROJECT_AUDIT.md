# CardioLens Project Audit

Audit date: 2026-10-14. Project: the supplied `Final\New folder` CardioLens source tree. The tree has no `.git` metadata.

## Evidence summary

- Frontend: React 18, TypeScript, Vite, Three.js. Backend: FastAPI. Four saved target estimators and a preprocessing artifact are under `models/`.
- Dataset: 303 x 54 CSV exactly matches the project's seeded synthetic generator. SHA-256 `4b6e0a08d400a4b113344e5ed56036688d0576abcf3462fab486558ea339c153`. No external source, authentic clinical cohort, or data license is supplied.
- Model provenance: `model_manifest.json` records the same dataset hash and artifact hashes matching local files. This is unsigned project metadata, not independent historical proof. Models were preserved; they were not retrained in this audit.
- Feature safety: CAD, Cath, LAD, LCX, and RCA are excluded; named/alias leakage tests pass. Semantic leakage and patient grouping cannot be resolved without a data dictionary and authentic patient identifiers.
- Validation: stratified five-fold training-fold preprocessing. Candidate selection and reported pooled OOF metrics reuse pooled F1, so estimates can be optimistic. No locked independent/external evaluation, calibration, or uncertainty intervals.
- Explanations: target-specific SHAP uses a deterministic 32-row subset of the synthetic cohort as background. Contributions are not causal, units vary by estimator, and an explanation failure returns HTTP 503 without fabricated values.
- Visualization: Three.js schematic whole-vessel mapping. It does not depict patient-specific vessel geometry or lesion localization.

## Current verification

- Backend suite: 16 passed, one Starlette/AnyIO deprecation warning.
- Frontend TypeScript/Vite build: passed, 1,485 modules; JS bundle 800.95 kB minified / 213.87 kB gzip and Vite's >500 kB advisory.
- Four-target SHAP API tests, invalid/missing input tests, leakage checks, batch limit, absent-model and SHAP failure abstention all pass.
- Technical report regenerated and visually checked at four pages.
- Final ZIP clean extraction suite and endpoint smoke are recorded in `reports/final_audit/test_results.md`.
- Live browser, loopback network, device/accessibility, WebGL fallback, and clinical evaluation are not verified. No YouTube video was recorded or uploaded.

## Use boundary

This is a software demonstration using synthetic labels, not a clinical model. Do not use its scores for diagnosis, triage, or treatment. Track A submission remains not ready until the required demo video exists; genuine-data evaluation and other unverified evidence remain major scientific limitations.
