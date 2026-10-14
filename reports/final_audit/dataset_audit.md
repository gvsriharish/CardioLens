# Dataset audit — supplied Extension of Z-Alizadeh Sani workbook

Audit date: 2026-10-14. The workbook was read with pandas 3.0.1 and openpyxl from the user-provided file. No patient rows were printed in the audit output or copied into this report.

## Source and integrity

- Local filename: `extention of Z-Alizadeh sani dataset.xlsx`; 131,137 bytes; SHA-256 `739343245c2ba578b541370217531750d8e936022f928b83e0d91756caa3ff0b`.
- The UCI Machine Learning Repository lists an Extension of Z-Alizadeh Sani dataset with 303 instances, 59 features, and the same workbook filename. UCI documents overall CAD as narrowing >=50%, describes CAD as present when at least one of LAD/LCX/RCA is stenotic, and identifies the angiography result as `Cath`. It lists CC BY 4.0 and the citation: Alizadehsani, R., Roshanzamir, & Sani (2013), DOI [10.24432/C5461K](https://doi.org/10.24432/C5461K). See [UCI dataset record](https://archive.ics.uci.edu/dataset/411/extention%2Bof%2Bz%2B).
- **Structure consistent with UCI: YES. Exact-file provenance: NOT VERIFIED.** Local workbook contents were not byte-for-byte or row-for-row compared against a fresh official download. Filename, dimensions, labels and matching schema strongly support consistency, but do not authenticate this particular local copy.
- **License:** UCI's catalog licenses its hosted dataset CC BY 4.0. This does not by itself authenticate that this exact local file is unmodified UCI content. The workbook is not bundled in the release archive pending exact source comparison and attribution review; no patient-level data is redistributed there.
- Workbook metadata names creator `alizadeh` and last editor `MRT www.Win2Farsi.com`; metadata is not provenance evidence. No citation, source URL, or license statement was embedded in the workbook.

## Workbook and sheet inventory

| Sheet | Visibility | Data rows x columns | Audit result |
|---|---|---:|---|
| `Sheet 1 - Table 1` | visible | 303 x 59 | Populated cohort; all 59 headers listed below |
| `Sheet1` | visible | 0 x 100 | Header-only template; not observations, not included in model audit as usable data |

The primary sheet is compatible in row count and number of total fields with UCI's description (303 records and 59 fields). It contains 55 non-outcome columns plus `LAD`, `LCX`, `RCA`, and `Cath`; no separate `CAD` column is present. Thus the four-outcome interpretation is compatible with the supplied Track A request, though the overall label is named `Cath` in this workbook.

### Primary sheet columns and pandas dtypes

Headers, in source order: `Age`, `Weight`, `Length`, `Sex`, `BMI`, `DM`, `HTN`, `Current Smoker`, `EX-Smoker`, `FH`, `Obesity`, `CRF`, `CVA`, `Airway disease`, `Thyroid Disease`, `CHF`, `DLP`, `BP`, `PR`, `Edema`, `Weak Peripheral Pulse`, `Lung rales`, `Systolic Murmur`, `Diastolic Murmur`, `Typical Chest Pain`, `Dyspnea`, `Function Class`, `Atypical`, `Nonanginal`, `Exertional CP`, `LowTH Ang`, `Q Wave`, `St Elevation`, `St Depression`, `Tinversion`, `LVH`, `Poor R Progression`, `BBB`, `FBS`, `CR`, `TG`, `LDL`, `HDL`, `BUN`, `ESR`, `HB`, `K`, `Na`, `WBC`, `Lymph`, `Neut`, `PLT`, `EF-TTE`, `Region RWMA`, `VHD`, `LAD`, `LCX`, `RCA`, `Cath`.

Pandas inferred 29 `int64`, 5 `float64`, and 25 string columns (`str` dtype). Continuous/measurement fields include Age, Weight, Length, BMI, BP, PR, FBS, CR, TG, LDL, HDL, BUN, ESR, HB, K, Na, WBC, Lymph, Neut, PLT, EF-TTE, and Region RWMA. Several binary/coded fields (for example DM, HTN, Edema, Function Class, ECG indicators and vessel labels) were inferred as integers; categorical and label fields such as Sex, history/exam fields, VHD, LAD, LCX, RCA, and Cath are strings. Actual Excel formula cells mean dtypes can differ between formula-aware and cached-value readers; do not treat formulas as original measured values.

### Missingness, duplicates, identifiers

- Missing cells in populated sheet: 0 / 17,877 (0%). Header-only sheet has no records.
- Exact duplicate rows: 0. Duplicate rows across all non-outcome feature values: 0.
- No apparent patient ID, accession number, or record key field exists. Zero duplicate profiles do not prove that records are distinct people; patient-level duplicate checks across identifiers are unavailable.

### Candidate outcomes and class counts

Counts are literal source categories; positive classes follow UCI's documented semantics where available.

| Workbook field | Values (count) | Candidate positive class | Definition evidence / limitation |
|---|---|---|---|
| `Cath` | `CAD` 216; `Normal` 87 | `CAD` | UCI states CAD is >=50% narrowing and identifies Cath as angiography result. In this workbook Cath acts as the overall outcome alias; there is no CAD field. |
| `LAD` | `Stenotic` 177; `Normal` 126 | `Stenotic` | UCI documents vessel-stenosis classification. Its page does not specify per-vessel threshold details beyond the overall CAD definition. |
| `LCX` | `Stenotic` 119; `Normal` 184 | `Stenotic` | Same limitation. |
| `RCA` | `Stenotic` 114; `Normal` 189 | `Stenotic` | Same limitation. |

**Internal label consistency issue:** UCI says overall CAD occurs when at least one of LAD/LCX/RCA is stenotic. In this workbook, the vessel-label union is 217 records while Cath=`CAD` is 216; exactly one record is discordant (`Cath=Normal` despite >=1 vessel labeled `Stenotic`). No record details are reproduced here. The source record does not explain this discrepancy. Do not silently rewrite either label; resolve against an authoritative data record or predeclare an adjudication/exclusion rule before evaluation.

### Data quality findings

- `Sex`: `Male` 176 and `Fmale` 127; likely a source typo, but not normalized in the workbook. Any preprocessing correction must be explicit and retain a raw-value audit trail.
- `Exertional CP`: all 303 values are `N` (zero variance; contributes no predictive information).
- `VHD`: inconsistent capitalization: `N` 116, `mild` 149, `Moderate` 27, `Severe` 11.
- `Function Class`: 0:211, 2:73, 3:18, 1:1; rare category and the 0/1/2/3 coding meaning is not defined on the UCI landing page.
- `LowTH Ang`: `N` 301, `Y` 2 (rare positive category).
- Formula cells in primary sheet: all 303 BMI cells are formulas; 110 Obesity cells are formulas. BMI is computed from Weight/Length. The Obesity formula uses BMI >=25, while other project logic uses >=30; source workbook contains a mixed set of formulas and literal values. This definition conflict must be resolved before treating Obesity as an input. Do not recalculate or overwrite source cells.
- `Sheet1` is an empty, 100-column template containing further fields including post-test/procedure/anatomical lesion and treatment fields. It adds no cohort records. Those fields must not be mistaken for measured predictors; if populated later, establish availability timing and exclude post-outcome/procedure information from pre-diagnostic models.
- Numeric range checks observed no automated row edits. Observed min/max include Age 30–86, Weight 48–120, Length 140–188, BMI 18.115–40.901, BP 90–190, PR 50–110, FBS 62–400, CR 0.5–2.2, TG 37–1050, LDL 18–232, HDL 15.9–111, BUN 6–52, ESR 1–90, HB 8.9–17.6, K 3–6.6, Na 128–156, WBC 3,700–18,000, Lymph 7–60, Neut 32–89, PLT 25–742, EF-TTE 15–60, Region RWMA 0–4. These are descriptive ranges, not clinical validity determinations.

## Conclusion

The workbook is **structurally consistent** with the UCI extension and supplies four candidate target columns. The UCI-hosted dataset's license and overall CAD definition are documented. Exact provenance/integrity of this supplied local workbook remains **NOT VERIFIED**, per-file clinical data dictionary details remain incomplete, and the one Cath/vessel contradiction plus current XLSX-ingestion and predictor-schema gaps block safe model evaluation/training with the current project. The source-specific Cath/Stenotic label parser was corrected and unit-tested, but the workbook was not trained or evaluated. Preserve it as audit input only; do not overwrite it, correct it silently, or include it in the release package pending the checks above.
