# Data, Provenance, and Safety

## Provenance

The bundled `data/z_alizadeh_sani_dataset.csv` has 303 records and 54 columns. A row-for-row comparison with `ml.dataset_generator.generate_synthetic_records(303, 42)` matches exactly. It is synthetic demonstration data, not verified Z-Alizadeh Sani clinical data. Its filename/schema do not establish source, licensing, or clinical validity. Training records the SHA-256, provenance status, row count, label counts, and preprocessing in `data/manifest.json`. External CSV files are marked `unverified` unless separately documented; the loader cannot authenticate provenance.

No authentic-data training was performed because no sourced, licensed dataset was supplied. Do not add private patient records or credentials to this repository. Before using another dataset, record source, version, retrieval date, license/access terms, schema, target encoding, and a cryptographic hash.

## Targets and leakage controls

The synthetic generator creates four binary labels using seeded latent score/quantile rules (see `ml/dataset_generator.py`); they are not clinically adjudicated outcomes or a verified stenosis threshold. `CAD`, `Cath`, `LAD`, `LCX`, and `RCA` are excluded from model inputs. The API rejects unknown request fields, including outcome columns, instead of silently ignoring them.

Potential duplicated rows and empty cells are counted in generated metrics. The bundled generator-matched file currently has zero duplicate rows and zero empty cells. This is a mechanical check only; it does not establish data accuracy, measurement validity, or independence. Other leakage from derived or post-diagnosis fields cannot be excluded clinically without authentic source documentation.

## Inference and evidence limits

Preprocessing is fitted inside each training fold. Each target chooses a candidate by pooled out-of-fold F1, then the selected estimator is refit on all available records for demo inference. The pooled CV metrics are not independent test results and may be optimistic because selection and reporting use the same out-of-fold predictions. There is no separate holdout, external validation, calibration study, uncertainty estimate, or validated out-of-distribution detector.

The probability bands/colors are visualization conventions. A model probability is not a measured stenosis percentage or a clinical diagnosis. Brier scores are descriptive scoring results and do not by themselves establish calibration. The 3D scene highlights entire named vessels based on the model output; it does not locate plaque or patient-specific anatomy.

## Safety

Educational and research decision-support prototype only. Predictions are not a diagnosis, do not localize anatomical lesions, and are not a substitute for professional medical assessment or formal diagnostic imaging. The What-If Lab compares model outputs for hypothetical inputs; changes are not causal effects, treatment estimates, or recommendations. Do not use this software to make care decisions.
