"""
Data preprocessing pipeline for CardioVision AI.
Includes explicit target-leakage prevention, missing-value imputation,
categorical encoding, and numerical scaling. Built with pure numpy + scikit-learn.
"""

from typing import Any, Dict, List, Optional, Set, Tuple
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ml.schema import (
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
    TARGETS,
    is_leakage_column,
    normalize_column_name,
)

class CardioPreprocessor(BaseEstimator, TransformerMixin):
    """
    Robust Preprocessor that guarantees:
    1. Zero Target Leakage: excludes LAD, LCX, RCA, Cath, CAD from feature matrix.
    2. Numerical missing-value imputation (median) + standard scaling.
    3. Categorical missing-value imputation (mode) + one-hot encoding.
    4. Tracks exact feature names for feature attribution & Explainable AI.
    """

    def __init__(self):
        self.num_cols: List[str] = [c for c in NUMERICAL_FEATURES if not is_leakage_column(c)]
        self.cat_cols: List[str] = [c for c in CATEGORICAL_FEATURES if not is_leakage_column(c)]
        self.excluded_leakage_cols: List[str] = ["CAD", "Cath", "LAD", "LCX", "RCA"]
        self.feature_names_out: List[str] = []

        self.num_imputer = SimpleImputer(strategy="median")
        self.num_scaler = StandardScaler()
        self.cat_imputer = SimpleImputer(strategy="most_frequent")
        self.cat_ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)

        self.num_medians_: Dict[str, float] = {}
        self.fitted_: bool = False

    def sanitize_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize keys and drop leakage columns."""
        clean = {}
        for k, v in record.items():
            norm_k = normalize_column_name(k)
            if not is_leakage_column(norm_k):
                clean[norm_k] = v
        return clean

    def extract_dataset(
        self, records: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], Dict[str, np.ndarray]]:
        """
        Extract features and targets while strictly dropping leakage attributes.

        For the documented Extension of Z-Alizadeh Sani schema, `Cath` is the
        overall CAD outcome when a separate `CAD` field is absent. Vessel labels
        may be `Stenotic` or `Normal`. This mapping is not a general rule for
        arbitrary datasets; source-specific semantics must be verified first.
        """
        features_list: List[Dict[str, Any]] = []
        targets: Dict[str, List[int]] = {t: [] for t in TARGETS}

        for r in records:
            # Normalize target aliases before reading labels. This also makes
            # aliases such as `catheterization` usable without retaining them
            # in the predictor matrix.
            normalized = {}
            for key, value in r.items():
                canonical = normalize_column_name(str(key))
                if canonical in normalized and str(normalized[canonical]).strip() != str(value).strip():
                    raise ValueError(f"Conflicting values supplied for target alias {canonical!r}.")
                normalized[canonical] = value

            for t in TARGETS:
                raw = normalized.get(t)
                if t == "CAD" and (raw is None or str(raw).strip() == ""):
                    raw = normalized.get("Cath")
                if raw is None or str(raw).strip() == "":
                    raise ValueError(f"Missing required target {t!r}; for this source schema CAD may be supplied as Cath.")

                raw_val = str(raw).strip().lower()
                positive = {"1", "1.0", "yes", "true", "positive", "y"}
                if t == "CAD":
                    positive.add("cad")
                else:
                    positive.update({"stenosis", "stenotic"})
                negative = {"normal", "0", "0.0", "no", "false", "negative", "n"}
                if raw_val in positive:
                    is_pos = 1
                elif raw_val in negative:
                    is_pos = 0
                else:
                    raise ValueError(f"Unrecognized label {raw!r} for target {t!r}; refusing to encode it as negative.")
                targets[t].append(is_pos)

            clean_r = self.sanitize_record(r)
            features_list.append(clean_r)

        targets_arr = {t: np.array(targets[t], dtype=int) for t in TARGETS}
        return features_list, targets_arr

    def fit(self, records: List[Dict[str, Any]], y=None):
        """Fit imputers, scalers, and encoders on patient records."""
        # Convert records to numeric & categorical matrices
        n = len(records)
        num_mat = np.zeros((n, len(self.num_cols)), dtype=float)
        cat_mat = np.empty((n, len(self.cat_cols)), dtype=object)

        for i, r in enumerate(records):
            clean_r = self.sanitize_record(r)
            for j, col in enumerate(self.num_cols):
                val = clean_r.get(col, None)
                try:
                    num_mat[i, j] = float(val) if val is not None and str(val).strip() != "" else np.nan
                except (ValueError, TypeError):
                    num_mat[i, j] = np.nan

            for j, col in enumerate(self.cat_cols):
                val = clean_r.get(col, None)
                cat_mat[i, j] = str(val).strip() if val is not None and str(val).strip() != "" else np.nan

        # Fit numerical transformers
        num_imputed = self.num_imputer.fit_transform(num_mat)
        self.num_scaler.fit(num_imputed)

        for j, col in enumerate(self.num_cols):
            self.num_medians_[col] = float(self.num_imputer.statistics_[j])

        # Fit categorical transformers
        cat_imputed = self.cat_imputer.fit_transform(cat_mat)
        self.cat_ohe.fit(cat_imputed)

        # Assemble feature names
        names = list(self.num_cols)
        cat_names = self.cat_ohe.get_feature_names_out(self.cat_cols).tolist()
        names.extend(cat_names)
        self.feature_names_out = names

        self.fitted_ = True
        return self

    def transform(self, records: List[Dict[str, Any]]) -> np.ndarray:
        """Transform patient records into model feature matrix."""
        if not self.fitted_:
            raise RuntimeError("Preprocessor must be fitted first.")

        n = len(records)
        num_mat = np.zeros((n, len(self.num_cols)), dtype=float)
        cat_mat = np.empty((n, len(self.cat_cols)), dtype=object)

        for i, r in enumerate(records):
            clean_r = self.sanitize_record(r)
            for j, col in enumerate(self.num_cols):
                val = clean_r.get(col, None)
                try:
                    num_mat[i, j] = float(val) if val is not None and str(val).strip() != "" else np.nan
                except (ValueError, TypeError):
                    num_mat[i, j] = np.nan

            for j, col in enumerate(self.cat_cols):
                val = clean_r.get(col, None)
                cat_mat[i, j] = str(val).strip() if val is not None and str(val).strip() != "" else np.nan

        num_imputed = self.num_imputer.transform(num_mat)
        num_scaled = self.num_scaler.transform(num_imputed)

        cat_imputed = self.cat_imputer.transform(cat_mat)
        cat_encoded = self.cat_ohe.transform(cat_imputed)

        return np.hstack([num_scaled, cat_encoded])

    def fit_transform(self, records: List[Dict[str, Any]], y=None) -> np.ndarray:
        return self.fit(records, y).transform(records)

    def get_feature_names(self) -> List[str]:
        return self.feature_names_out
