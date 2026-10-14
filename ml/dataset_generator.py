"""Synthetic demo record generation and non-destructive CSV ingestion.

Generated cohorts are artificial and are not UCI records or clinical evidence.
"""

import csv
import os
from pathlib import Path
from typing import Dict, List, Tuple
import numpy as np

from ml.schema import (
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
    is_leakage_column,
    normalize_column_name,
)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DEFAULT_DATASET_PATH = DATA_DIR / "z_alizadeh_sani_dataset.csv"

ALL_COLUMNS = [
    "Age", "Weight", "Length", "Sex", "BMI", "DM", "HTN", "Current Smoker",
    "EX-Smoker", "FH", "Obesity", "CRBP", "BP", "PR", "Weak Peripheral Pulse",
    "Cough", "Dyspnea", "Typical Chest Pain", "Atypical", "Nonanginal",
    "Exertional CP", "LowTH Ang", "Edema", "Murmur", "Systolic Murmur",
    "Diastolic Murmur", "FBS", "CR", "TG", "LDL", "HDL", "BUN", "ESR",
    "HB", "K", "Na", "WBC", "Lymph", "Neut", "PLT", "EF-TTE", "Region RWMA",
    "VHD", "Q Wave", "St Elevation", "St Depression", "Tinversion", "LVH",
    "Poor R Progression", "Cath", "CAD", "LAD", "LCX", "RCA"
]

def generate_synthetic_records(n_samples: int = 303, random_state: int = 42) -> List[Dict[str, str]]:
    rng = np.random.RandomState(random_state)

    age = rng.normal(loc=58.9, scale=10.3, size=n_samples).clip(30, 86).round().astype(int)
    sex = rng.choice(["Male", "Female"], size=n_samples, p=[0.60, 0.40])
    weight = rng.normal(loc=73.8, scale=12.1, size=n_samples).clip(45, 120).round(1)
    length = rng.normal(loc=164.5, scale=9.5, size=n_samples).clip(140, 195).round(1)
    bmi = (weight / ((length / 100) ** 2)).round(2)
    obesity = np.where(bmi >= 30, "Y", "N")

    dm = rng.choice(["Y", "N"], size=n_samples, p=[0.32, 0.68])
    htn = rng.choice(["Y", "N"], size=n_samples, p=[0.59, 0.41])
    current_smoker = rng.choice(["Y", "N"], size=n_samples, p=[0.21, 0.79])
    ex_smoker = np.where(current_smoker == "Y", "N", rng.choice(["Y", "N"], size=n_samples, p=[0.12, 0.88]))
    fh = rng.choice(["Y", "N"], size=n_samples, p=[0.16, 0.84])
    crbp = rng.choice(["N", "Y"], size=n_samples, p=[0.92, 0.08])

    bp = (rng.normal(loc=130, scale=18, size=n_samples) + (htn == "Y") * 16).clip(90, 200).round().astype(int)
    pr = rng.normal(loc=75, scale=11, size=n_samples).clip(50, 125).round().astype(int)
    weak_pulse = rng.choice(["N", "Y"], size=n_samples, p=[0.94, 0.06])
    cough = rng.choice(["N", "Y"], size=n_samples, p=[0.88, 0.12])
    dyspnea = rng.choice(["N", "Y"], size=n_samples, p=[0.68, 0.32])

    cp_type = rng.choice(["Typical", "Atypical", "Nonanginal", "None"], size=n_samples, p=[0.42, 0.25, 0.20, 0.13])
    typical_cp = np.where(cp_type == "Typical", "Y", "N")
    atypical_cp = np.where(cp_type == "Atypical", "Y", "N")
    nonanginal_cp = np.where(cp_type == "Nonanginal", "Y", "N")
    exertional_cp = np.where(cp_type == "Typical", rng.choice(["Y", "N"], size=n_samples, p=[0.75, 0.25]), "N")
    lowth_ang = rng.choice(["N", "Y"], size=n_samples, p=[0.87, 0.13])

    edema = rng.choice(["0", "1"], size=n_samples, p=[0.95, 0.05])
    murmur = rng.choice(["N", "Y"], size=n_samples, p=[0.83, 0.17])
    systolic_murmur = np.where(murmur == "Y", rng.choice(["Y", "N"], size=n_samples, p=[0.75, 0.25]), "N")
    diastolic_murmur = np.where(murmur == "Y", rng.choice(["Y", "N"], size=n_samples, p=[0.10, 0.90]), "N")

    fbs = (rng.normal(loc=115, scale=40, size=n_samples) + (dm == "Y") * 55).clip(70, 380).round().astype(int)
    cr = rng.normal(loc=1.05, scale=0.32, size=n_samples).clip(0.5, 3.5).round(2)
    tg = rng.normal(loc=150, scale=70, size=n_samples).clip(50, 600).round().astype(int)
    ldl = rng.normal(loc=115, scale=36, size=n_samples).clip(40, 260).round().astype(int)
    hdl = rng.normal(loc=40.5, scale=9.8, size=n_samples).clip(20, 85).round().astype(int)
    bun = rng.normal(loc=17.5, scale=6.8, size=n_samples).clip(7, 55).round().astype(int)
    esr = rng.normal(loc=19.4, scale=15.1, size=n_samples).clip(2, 90).round().astype(int)
    hb = rng.normal(loc=13.6, scale=1.6, size=n_samples).clip(9, 18).round(1)
    k = rng.normal(loc=4.2, scale=0.45, size=n_samples).clip(3.1, 5.8).round(1)
    na = rng.normal(loc=140.2, scale=3.6, size=n_samples).clip(128, 152).round().astype(int)
    wbc = rng.normal(loc=7500, scale=2200, size=n_samples).clip(3500, 18000).round().astype(int)
    lymph = rng.normal(loc=31.5, scale=8.4, size=n_samples).clip(10, 58).round().astype(int)
    neut = (100 - lymph).clip(35, 88).astype(int)
    plt = rng.normal(loc=221, scale=60, size=n_samples).clip(100, 500).round().astype(int)

    q_wave = rng.choice(["0", "1"], size=n_samples, p=[0.82, 0.18])
    st_elevation = rng.choice(["0", "1"], size=n_samples, p=[0.89, 0.11])
    st_depression = rng.choice(["0", "1"], size=n_samples, p=[0.77, 0.23])
    tinversion = rng.choice(["0", "1"], size=n_samples, p=[0.72, 0.28])
    lvh = rng.choice(["0", "1"], size=n_samples, p=[0.88, 0.12])
    poor_r_progression = rng.choice(["0", "1"], size=n_samples, p=[0.87, 0.13])

    ef_tte = (rng.normal(loc=47.5, scale=9.2, size=n_samples) - (st_elevation == "1") * 7.0).clip(20, 65).round().astype(int)
    region_rwma = np.where(ef_tte < 40, rng.choice([2, 3, 4], size=n_samples), np.where(ef_tte < 50, rng.choice([0, 1, 2], size=n_samples), rng.choice([0, 1], size=n_samples, p=[0.75, 0.25])))
    vhd = rng.choice(["None", "Mild", "Moderate", "Severe"], size=n_samples, p=[0.60, 0.25, 0.12, 0.03])

    # Calibrate latent probability logits to match exact Z-Alizadeh Sani targets
    # LAD: ~54.8% target prevalence
    lad_latent = (
        0.04 * (age - 58)
        + 0.6 * (sex == "Male")
        + 1.1 * (typical_cp == "Y")
        + 1.0 * (st_elevation == "1")
        + 0.8 * (st_depression == "1")
        + 1.0 * (q_wave == "1")
        + 0.012 * (ldl - 110)
        - 0.04 * (ef_tte - 48)
        + 0.5 * (region_rwma >= 2)
        + rng.normal(0, 0.8, size=n_samples)
    )
    lad_thresh = np.percentile(lad_latent, 45.2)  # top 54.8% are stenosis
    lad_status = np.where(lad_latent >= lad_thresh, "Stenosis", "Normal")

    # LCX: ~34.7% target prevalence
    lcx_latent = (
        0.035 * (age - 58)
        + 0.6 * (htn == "Y")
        + 0.8 * (dm == "Y")
        + 0.9 * (tinversion == "1")
        + 0.7 * (st_depression == "1")
        + 0.01 * (tg - 150)
        + 0.4 * (typical_cp == "Y")
        + rng.normal(0, 0.8, size=n_samples)
    )
    lcx_thresh = np.percentile(lcx_latent, 65.3)  # top 34.7% are stenosis
    lcx_status = np.where(lcx_latent >= lcx_thresh, "Stenosis", "Normal")

    # RCA: ~38.0% target prevalence
    rca_latent = (
        0.04 * (age - 58)
        + 0.8 * (current_smoker == "Y")
        + 0.6 * (sex == "Male")
        + 0.7 * (typical_cp == "Y")
        + 0.7 * (q_wave == "1")
        + 0.008 * (bp - 130)
        - 0.015 * (pr - 75)
        + rng.normal(0, 0.8, size=n_samples)
    )
    rca_thresh = np.percentile(rca_latent, 62.0)  # top 38.0% are stenosis
    rca_status = np.where(rca_latent >= rca_thresh, "Stenosis", "Normal")

    # CAD: ~71.3% target prevalence (216 / 303)
    # Strongly concordant with vessel stenoses
    any_stenosis = (lad_status == "Stenosis") | (lcx_status == "Stenosis") | (rca_status == "Stenosis")
    cad_latent = (
        1.8 * any_stenosis
        + 0.03 * (age - 58)
        + 0.6 * (typical_cp == "Y")
        + 0.5 * (dm == "Y")
        + 0.5 * (htn == "Y")
        + rng.normal(0, 0.5, size=n_samples)
    )
    cad_thresh = np.percentile(cad_latent, 28.7)  # top 71.3% are CAD
    cad_status = np.where(cad_latent >= cad_thresh, "CAD", "Normal")
    cath_status = cad_status.copy()

    records = []
    for i in range(n_samples):
        rec = {
            "Age": str(age[i]),
            "Weight": str(weight[i]),
            "Length": str(length[i]),
            "Sex": str(sex[i]),
            "BMI": str(bmi[i]),
            "DM": str(dm[i]),
            "HTN": str(htn[i]),
            "Current Smoker": str(current_smoker[i]),
            "EX-Smoker": str(ex_smoker[i]),
            "FH": str(fh[i]),
            "Obesity": str(obesity[i]),
            "CRBP": str(crbp[i]),
            "BP": str(bp[i]),
            "PR": str(pr[i]),
            "Weak Peripheral Pulse": str(weak_pulse[i]),
            "Cough": str(cough[i]),
            "Dyspnea": str(dyspnea[i]),
            "Typical Chest Pain": str(typical_cp[i]),
            "Atypical": str(atypical_cp[i]),
            "Nonanginal": str(nonanginal_cp[i]),
            "Exertional CP": str(exertional_cp[i]),
            "LowTH Ang": str(lowth_ang[i]),
            "Edema": str(edema[i]),
            "Murmur": str(murmur[i]),
            "Systolic Murmur": str(systolic_murmur[i]),
            "Diastolic Murmur": str(diastolic_murmur[i]),
            "FBS": str(fbs[i]),
            "CR": str(cr[i]),
            "TG": str(tg[i]),
            "LDL": str(ldl[i]),
            "HDL": str(hdl[i]),
            "BUN": str(bun[i]),
            "ESR": str(esr[i]),
            "HB": str(hb[i]),
            "K": str(k[i]),
            "Na": str(na[i]),
            "WBC": str(wbc[i]),
            "Lymph": str(lymph[i]),
            "Neut": str(neut[i]),
            "PLT": str(plt[i]),
            "EF-TTE": str(ef_tte[i]),
            "Region RWMA": str(region_rwma[i]),
            "VHD": str(vhd[i]),
            "Q Wave": str(q_wave[i]),
            "St Elevation": str(st_elevation[i]),
            "St Depression": str(st_depression[i]),
            "Tinversion": str(tinversion[i]),
            "LVH": str(lvh[i]),
            "Poor R Progression": str(poor_r_progression[i]),
            "Cath": str(cath_status[i]),
            "CAD": str(cad_status[i]),
            "LAD": str(lad_status[i]),
            "LCX": str(lcx_status[i]),
            "RCA": str(rca_status[i]),
        }
        records.append(rec)

    return records

def save_records_to_csv(records: List[Dict[str, str]], file_path: Path):
    file_path.parent.mkdir(parents=True, exist_ok=True)
    if not records:
        return
    with open(file_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=ALL_COLUMNS)
        writer.writeheader()
        for r in records:
            writer.writerow(r)

def load_or_create_dataset_records(file_path: Path = DEFAULT_DATASET_PATH, force_regenerate: bool = False, demo: bool = False) -> Tuple[List[Dict[str, str]], bool]:
    """Load supplied CSV without mutation; create synthetic records only by explicit demo request.

    The bundled file exactly matches the seeded project generator, so it is demonstrably
    synthetic. Other CSVs are treated as unverified unless provenance is supplied externally.
    """
    if force_regenerate:
        raise ValueError("Refusing to overwrite a dataset. Choose a different output path explicitly.")
    if file_path.exists():
        with open(file_path, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            if not reader.fieldnames:
                raise ValueError(f"Dataset has no header: {file_path}")
            records = [{normalize_column_name(k): v for k, v in row.items() if k} for row in reader]
        if not records or not all(t in records[0] for t in ("CAD", "LAD", "LCX", "RCA")):
            raise ValueError(f"Dataset is missing required target columns: {file_path}")
        generated = generate_synthetic_records(n_samples=len(records), random_state=42)
        is_synthetic = records == generated
        print(f"[Dataset] Loaded {len(records)} records from {file_path}; provenance={'synthetic generator match' if is_synthetic else 'unverified'}")
        return records, is_synthetic
    if not demo:
        raise FileNotFoundError(f"Dataset not found: {file_path}. Provide a verified CSV or explicitly run training in demo mode.")
    records = generate_synthetic_records(n_samples=303, random_state=42)
    return records, True

if __name__ == "__main__":
    records, is_synth = load_or_create_dataset_records(force_regenerate=True)
    print(f"Loaded {len(records)} rows. Synthetic: {is_synth}")
