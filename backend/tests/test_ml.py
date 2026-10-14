"""
Unit tests for Machine Learning pipeline, leakage exclusion, and preprocessing.
"""

from pathlib import Path
import joblib
import numpy as np
import pytest

from ml.preprocessor import CardioPreprocessor
from ml.schema import is_leakage_column, TARGETS, CATEGORICAL_FEATURES, NUMERICAL_FEATURES

MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "models"

def test_leakage_detector():
    assert is_leakage_column("Cath")
    assert is_leakage_column("cath")
    assert is_leakage_column("CAD")
    assert is_leakage_column("cad")
    assert is_leakage_column("LAD")
    assert is_leakage_column("LCX")
    assert is_leakage_column("RCA")
    assert is_leakage_column("coronary_artery_disease")
    assert is_leakage_column("left_anterior_descending")
    assert is_leakage_column("catheterization")
    assert not is_leakage_column("Age")
    assert not is_leakage_column("BP")
    assert not is_leakage_column("LDL")
    assert not is_leakage_column("EF-TTE")

def test_preprocessed_matrix_drops_normalized_target_aliases():
    preprocessor = CardioPreprocessor()
    rows = [{**{name: 50 for name in NUMERICAL_FEATURES}, **{name: "N" for name in CATEGORICAL_FEATURES}, "Sex": sex,
             "coronary_artery_disease": target, "left_anterior_descending": vessel, "catheterization": cath}
            for sex, target, vessel, cath in [("Male", "CAD", "Stenosis", "CAD"), ("Female", "Normal", "Normal", "Normal")]]
    X = preprocessor.fit_transform(rows)
    assert X.shape[1] == len(preprocessor.get_feature_names())
    assert all(name not in {"CAD", "Cath", "LAD", "LCX", "RCA"} for name in preprocessor.get_feature_names())

def test_preprocessor_leakage_exclusion():
    preprocessor = CardioPreprocessor()
    dirty_records = [
        {
            "Age": 60, "Sex": "Male", "BP": 140, "Cath": "CAD", "CAD": "CAD",
            "LAD": "Stenosis", "LCX": "Normal", "RCA": "Stenosis", "LDL": 150
        },
        {
            "Age": 50, "Sex": "Female", "BP": 120, "Cath": "Normal", "CAD": "Normal",
            "LAD": "Normal", "LCX": "Normal", "RCA": "Normal", "LDL": 95
        }
    ]

    features, targets = preprocessor.extract_dataset(dirty_records)
    assert len(features) == 2
    for feat_row in features:
        for leakage_col in ["Cath", "CAD", "LAD", "LCX", "RCA"]:
            assert leakage_col not in feat_row

    assert "CAD" in targets
    assert targets["CAD"].tolist() == [1, 0]
    assert targets["LAD"].tolist() == [1, 0]
    assert targets["LCX"].tolist() == [0, 0]
    assert targets["RCA"].tolist() == [1, 0]

def test_extension_dataset_target_aliases_and_stenotic_labels():
    records = [
        {
            "catheterization": "CAD",
            "left_anterior_descending": "Stenotic",
            "left_circumflex": "Normal",
            "right_coronary_artery": "Stenotic",
            "Age": 60,
        },
        {
            "catheterization": "Normal",
            "left_anterior_descending": "Normal",
            "left_circumflex": "Stenotic",
            "right_coronary_artery": "Normal",
            "Age": 50,
        },
    ]

    features, targets = CardioPreprocessor().extract_dataset(records)
    assert targets["CAD"].tolist() == [1, 0]
    assert targets["LAD"].tolist() == [1, 0]
    assert targets["LCX"].tolist() == [0, 1]
    assert targets["RCA"].tolist() == [1, 0]
    assert all(not ({"CAD", "Cath", "LAD", "LCX", "RCA"} & set(row)) for row in features)

def test_unrecognized_or_missing_target_labels_are_rejected():
    base = {"Cath": "CAD", "LAD": "Stenotic", "LCX": "Normal", "RCA": "Normal"}
    with pytest.raises(ValueError, match="Unrecognized label"):
        CardioPreprocessor().extract_dataset([{**base, "LAD": "Maybe"}])

    with pytest.raises(ValueError, match="Unrecognized label"):
        CardioPreprocessor().extract_dataset([{**base, "LAD": "CAD"}])

    with pytest.raises(ValueError, match="Missing required target"):
        CardioPreprocessor().extract_dataset([{"Cath": "CAD", "LAD": "Normal", "LCX": "Normal"}])

def test_saved_model_artifacts_exist():
    assert (MODELS_DIR / "preprocessor.joblib").exists()
    assert (MODELS_DIR / "cad_model.joblib").exists()
    assert (MODELS_DIR / "lad_model.joblib").exists()
    assert (MODELS_DIR / "lcx_model.joblib").exists()
    assert (MODELS_DIR / "rca_model.joblib").exists()
    assert (MODELS_DIR / "metrics.json").exists()
    assert (MODELS_DIR / "model_manifest.json").exists()
    assert (MODELS_DIR.parent / "data" / "manifest.json").exists()

def test_model_inference_probability_range():
    preprocessor = joblib.load(MODELS_DIR / "preprocessor.joblib")
    sample_patient = {
        "Age": 65, "Sex": "Male", "BP": 150, "PR": 80, "LDL": 160,
        "HDL": 35, "Typical Chest Pain": "Y", "EF-TTE": 40, "St Elevation": "1"
    }
    X = preprocessor.transform([sample_patient])
    assert X.shape[0] == 1

    for target in TARGETS:
        model = joblib.load(MODELS_DIR / f"{target.lower()}_model.joblib")
        prob = model.predict_proba(X)[0, 1]
        assert 0.0 <= prob <= 1.0
