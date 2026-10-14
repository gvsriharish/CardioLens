# Machine Learning Evaluation

## Current data and method

The only bundled data are 303 synthetic generator-matched records. No authentic clinical-data training was performed. Inputs exclude the four outcome labels and `Cath`. Numerical/categorical preprocessing is fitted within each stratified fold. For each target, Random Forest, HistGradientBoosting, and Logistic Regression are compared; the model with highest pooled out-of-fold F1 is selected independently. The production artifact is then fitted on all 303 rows.

This is **pooled stratified five-fold out-of-fold evaluation**, not a held-out test. Candidate selection and reported scores use the same pooled predictions, so values may be optimistically selected. There is no external cohort, calibration process, or uncertainty interval. The production artifact has seen all available synthetic rows during its final fit.

## Actual pooled out-of-fold results

Refreshed by `python -m ml.train` on 2026-10-14; current machine-readable results are in `models/metrics.json`.

| Target | Selected model | Accuracy | Precision | Recall | F1 | ROC-AUC | Brier |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| CAD | Random Forest | 0.7492 | 0.7500 | 0.9722 | 0.8468 | 0.7812 | 0.1674 |
| LAD | Logistic Regression | 0.7624 | 0.7765 | 0.7952 | 0.7857 | 0.8584 | 0.1625 |
| LCX | Logistic Regression | 0.7459 | 0.6458 | 0.5905 | 0.6169 | 0.8089 | 0.1744 |
| RCA | Logistic Regression | 0.7195 | 0.6471 | 0.5739 | 0.6083 | 0.7762 | 0.1931 |

All targets have 303 pooled out-of-fold predictions. Confusion matrices, target support, class prevalence, and the full candidate comparisons are stored in `models/metrics.json`. The Brier values are uncalibrated descriptive scores; lower is better only in comparable evaluation settings and does not make these probabilities clinically calibrated.

## Class counts

| Target | Positive | Negative | Positive prevalence |
| --- | ---: | ---: | ---: |
| CAD | 216 | 87 | 71.3% |
| LAD | 166 | 137 | 54.8% |
| LCX | 105 | 198 | 34.7% |
| RCA | 115 | 188 | 38.0% |

## Reproduction

```powershell
python -m ml.train
python -m pytest backend\tests -q
```

Training writes the model artifacts, evaluation JSON, dataset manifest, and a model manifest containing artifact hashes. Results apply only to this synthetic pipeline run; they are not evidence of clinical utility or generalization.
