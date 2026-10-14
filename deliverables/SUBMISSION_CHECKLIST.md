# Submission Checklist

Status uses the supplied Track A statement and evidence from 2026-10-14.

| Requirement | Status | Evidence / remaining work |
|---|---|---|
| Existing project audited and preserved | Verified | No Git metadata is present |
| Dataset provenance | Verified synthetic | Exact seeded-generator match; no genuine source/license record |
| Four target models / leakage exclusions | Software verified | CAD, Cath, LAD, LCX, RCA excluded; artifacts preserved; provenance metadata unsigned |
| Validation and metrics | Partial | Actual pooled OOF metrics on 303 synthetic labels; selection may be optimistic, no independent evaluation |
| API, SHAP and failure handling | Tests passed | All target contributions finite; model/SHAP failures abstain; 16 backend tests pass |
| 3D controls and vessel map | Implemented, browser unverified | Schematic whole-vessel model; no lesion localization |
| Trust/safety | Partial | Provenance and disclaimer present; calibration/OOD absent; placement not browser-verified |
| Frontend production build | Verified with advisory | TypeScript/Vite pass; 800.95 kB JS bundle, >500 kB advisory |
| Technical report (maximum six pages) | Verified | PDF has 4 rendered pages |
| YouTube demonstration, 3-10 minutes | **Not ready** | Script exists; no recording or URL |
| Final release verdict | **NOT READY** | Missing required video; synthetic-only evidence; browser/live checks outstanding |
