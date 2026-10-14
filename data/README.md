# Dataset provenance

`z_alizadeh_sani_dataset.csv` contains 303 rows with 54 fields. Its filename and columns resemble the Z-Alizadeh Sani dataset, but they are not provenance evidence. The bundled file exactly matches the deterministic output of `ml.dataset_generator.generate_synthetic_records(303, 42)` and is therefore synthetic demonstration data.

Training loads an existing CSV without changing it. To use real data, obtain it from an authorized source, record source/license/version information, and replace the file intentionally. The ingestion code checks required target columns but cannot verify an external dataset's authenticity.
