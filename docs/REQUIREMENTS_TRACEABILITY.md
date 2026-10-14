# Track A Requirements Traceability (short form)

Detailed current mapping: `reports/final_audit/requirement_traceability.md`. This short form uses the supplied official statement and current test evidence.

| Requirement | Evidence | Status |
|---|---|---|
| CAD, LAD, LCX, RCA predictions | Four saved model outputs, FastAPI and TestClient | PASS in software; synthetic evidence only |
| Demographic, examination, ECG, lab, echo inputs | `ml/schema.py`, preprocessing and patient form | PARTIAL; feature meanings/availability not verified against authentic data |
| Exclude LAD/LCX/RCA/Cath from every model | Preprocessor drops CAD/Cath/LAD/LCX/RCA; alias/injection tests | PASS for direct columns; semantic timing leakage unverified |
| Accuracy/precision/recall/F1/ROC-AUC | `models/metrics.json`, detailed release report | PARTIAL; pooled OOF synthetic scores with selection optimism, no independent evaluation |
| Interactive Three.js heart, vessel colors, controls | `HeartViewer3D.tsx` source; production build | PARTIAL; browser/device behavior not verified; anatomy is schematic |
| Distinct CAD and vessel results | API response and dashboard source | PASS in API/source; browser unverified |
| SHAP explanations and measurements | `backend/app/explain.py`, `/explain`, frontend explanation panel; tests | PASS implementation/test; synthetic background, model-specific units, noncausal |
| Safety disclaimer | API/service and frontend source | PASS source/API; browser visibility unverified |
| Trust/failure evidence | Integrity Passport, metadata, validation paths | PARTIAL; no single consolidated lab; no OOD/calibration evidence |
| App, saved weights, reproducible documentation | Tests, build, 4-page PDF, clean ZIP | PASS for local prototype |
| YouTube demonstration video (3-10 minutes) | Demo script only | FAIL; no video/URL |

No independent hackathon score or clinical validation is claimed. See final audit reports for the exact metrics, statuses, and outstanding work.
