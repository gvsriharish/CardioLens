# Hackathon Readiness Checklist

Status reflects checks actually run on 2026-10-14. The official Track A statement is provided; this audit does not claim a hackathon score or rules beyond it.

## Latest checks

- Backend: 16 passed, 1 Starlette/AnyIO deprecation warning. Includes target leakage, input validation, all-target SHAP output, model-loss, and SHAP-failure behavior.
- Frontend: `npm run build` passed TypeScript and Vite; JS bundle 800.95 kB minified (213.87 kB gzip), above Vite's 500 kB advisory.
- Release: 4-page technical report; ZIP contains one `CardioLens/` root, 76 entries, required files and no dependency/cache/temp paths. The extracted release suite and in-process API smoke passed.
- Browser walkthrough, live loopback smoke, WebGL/device/accessibility tests were not verified. No frontend test/lint scripts exist.
- Existing models were not retrained. All data and metrics are synthetic; candidate selection reuses pooled OOF F1.

| Requirement | Status | Evidence / remaining work |
| --- | --- | --- |
| Existing project and four models preserved | Verified | Source/artifact inspection; manifest hashes match files; unsigned metadata |
| CAD/LAD/LCX/RCA inference | Software verified | API tests exercise all four; no clinical validity established |
| Leakage exclusions | Verified for named/alias fields | CAD, Cath, LAD, LCX, RCA excluded and tests pass; semantic/timing leakage needs authentic data dictionary |
| Dataset provenance | Verified synthetic | Exact generator match and SHA-256; genuine source/license unavailable |
| Metrics | Partially satisfied | Actual OOF metrics recorded for four targets; synthetic-only and selection-optimistic; no independent holdout |
| Target-specific SHAP | Implemented and tested | Synthetic reference background; estimator-specific output units; not causal |
| 3D vessel visualization | Implemented, browser unverified | Whole-vessel schematic mapping; no patient-specific lesions |
| API integration and failure safety | Test verified | Missing models / failed SHAP abstain with HTTP 503; input validation and error privacy tests pass |
| Trust/evidence dashboard | Partial | Provenance/metrics passport exists; no validated OOD/calibration evidence or one consolidated failure lab |
| Clinical safety notice | Source/API verified | Visible notice included in app and API; browser placement unverified |
| Six-page documentation limit | Verified | `deliverables/technical_report.pdf` is 4 pages, rendered and visually reviewed |
| 3-10 minute YouTube demo | **Not ready** | Demo script only; recording and URL absent |
| Overall Track A readiness | **NOT READY** | Required video absent; only synthetic training/evaluation; browser/live integration checks incomplete |

## Remaining work before submission

1. Record a 3-10-minute demonstration, ensure synthetic/safety notices remain visible, upload it to YouTube, and add the URL.
2. If clinical performance is to be claimed, obtain authorized genuine data and verify its source, license, feature/target definitions, and patient grouping before a locked evaluation.
3. Verify app behavior in a browser and on submission hardware, including WebGL failure, keyboard/focus, mobile/responsive layout, and screen-reader behavior.
4. Document the redistribution license before publicly publishing source/model artifacts.
