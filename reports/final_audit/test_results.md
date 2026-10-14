# CardioLens final submission verification

Audit date: 2026-10-14. The supplied Excel workbook was inspected read-only and is not included in the release ZIP. Existing model artifacts and the synthetic CSV were preserved.

## Tests and build

| Check | Command / method | Result |
|---|---|---|
| Source backend ML tests | Bundled Python 3.12.14 with project root, `backend`, `ml`, and `.codex-test-deps` on `PYTHONPATH`: `-m pytest backend/tests/test_ml.py -vv -s -p no:cacheprovider` | PASS — exit 0; **7 passed**, including leakage exclusions, `Cath` as CAD fallback, `Stenotic` positive encoding, unknown/missing-label rejection, model artifacts, and probability range |
| Full backend suite | Same Python/paths, `-m pytest backend/tests -vv -s -p no:cacheprovider`; repeated with `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1` | NOT VERIFIED — 18 tests collected; both runs stalled at `test_api.py::test_health` for >30 seconds and were manually interrupted. No full-suite pass claimed. |
| Source frontend build | `npm run build` in `frontend` | PASS — exit 0; TypeScript and Vite; 1,485 modules; JS 800.95 kB minified / 213.87 kB gzip; chunk-size advisory |
| Final extracted ML tests | Extracted final package to `C:\Users\gvsri\Downloads\Final\_CardioLens_final_verify_20261014_04\CardioLens`; ran extracted `backend/tests/test_ml.py` with the host's already-installed external test dependencies on `PYTHONPATH` | PASS — **7 passed**. Tests ran against the extracted project files and model artifacts; Python dependencies were provided externally. |
| Extracted API import and model loading | Import `backend.app.main.app` and `cardio_service` from extracted root | PASS — app imports; all four CAD/LAD/LCX/RCA artifacts loaded |
| Extracted in-process API smoke | `httpx.AsyncClient` + `httpx.ASGITransport` GET `/health` in extracted project | PASS — HTTP 200, healthy, models_loaded true, mode `Synthetic Demo Models` |
| Extracted frontend install/build | `npm ci --ignore-scripts`; `npm run build` in extracted `frontend` | PASS — 143 packages installed; final extracted build exit 0, 1,485 modules. npm reported 9 audit advisories (3 moderate, 6 high); no upgrade was applied. |
| Python dependency install / venv | Attempted `python -m venv` and pip install from the documented requirements in the host environment | NOT VERIFIED — available Python 3.13 launcher could not resolve its real interpreter; bundled Python 3.12 `venv` failed at `ensurepip`. A network-enabled `pip --target` attempt downloaded wheels but was interrupted during installation. `backend/requirements.txt` is included. |
| Live loopback API | Started `python -m backend.app.main` from extracted project; requested `http://127.0.0.1:8000/health` using PowerShell | PARTIAL — Uvicorn startup completed; loopback HTTP request timed out after 5 seconds. In-process ASGI health smoke passed. |

## Archive structure and preservation

- ZIP opens and `zipfile.testzip()` reports no corrupt entry.
- Contains exactly one top-level folder, `CardioLens/`, with **79 files** and no nested project copy.
- Required source, training scripts, backend/frontend dependency manifests, runtime bundle, synthetic data/manifest, tests, all four models, preprocessor, metrics, model manifest, and five audit reports plus package listing are included.
- Excluded: user-provided Excel workbook, `node_modules`, virtual environments, Python caches, `tmp`, `work`, test dependency folders, secrets, and temporary files.
- The package file-by-file inventory is `reports/final_audit/package_contents.txt`.
- Existing parent-folder original `C:\Users\gvsri\Downloads\Final\CardioLens_Final_Submission.zip` SHA-256 remains `D6443FA0FCDF86EACFAAD6299746B7EBD3B4956EAECDC1453251E9EF9958F637`. Saved model artifact hashes still match the manifest; source CSV SHA-256 remains `4b6e0a08d400a4b113344e5ed56036688d0576abcf3462fab486558ea339c153`.

## Data and validation limits

No model was retrained. No metrics were generated from the supplied Excel workbook. UCI's CC BY 4.0 catalog license and dataset description, unverified local file identity, the single Cath/vessel label contradiction, synthetic-model provenance, and the release recommendation are documented in `dataset_audit.md`, `ml_leakage_and_validation.md`, and `release_decision.md`. The required 3–10-minute video and browser/device/accessibility checks remain outstanding.
