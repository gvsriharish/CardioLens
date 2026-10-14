"""
Core prediction and inference service for CardioLens.
Orchestrates model inference, probability calibration, risk scoring,
and Explainable AI attribution.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import joblib
import numpy as np

from backend.app.explain import explain_patient_prediction
from backend.app.schemas import (
    FeatureContributionItem,
    PredictionResponse,
    VesselRiskDetail,
)
from ml.schema import TARGETS

MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "models"
METRICS_FILE = MODELS_DIR / "metrics.json"

VESSEL_CONFIGS = {
    "CAD": {
        "name": "Coronary Artery Disease (Overall)",
        "anatomy": "Global presence of obstructive coronary artery stenosis (>=50% luminal narrowing) across the epicardial coronary tree.",
        "drivers": ["Age", "Smoking", "LDL Cholesterol", "Typical Chest Pain", "ST Elevation"],
    },
    "LAD": {
        "name": "Left Anterior Descending Artery",
        "anatomy": "Anterior interventricular groove supply to anterior myocardial wall, apex, and anterior two-thirds of interventricular septum ('widow-maker' vessel).",
        "drivers": ["ST Elevation", "Pathologic Q Waves", "Depressed Ejection Fraction", "Regional Wall Motion Abnormality", "Typical Angina"],
    },
    "LCX": {
        "name": "Left Circumflex Artery",
        "anatomy": "Left atrioventricular sulcus supply to lateral and posterior walls of the left ventricle and obtuse marginal branches.",
        "drivers": ["T-Wave Inversion", "Hypertension", "Diabetes Mellitus", "Serum Triglycerides", "Exertional Dyspnea"],
    },
    "RCA": {
        "name": "Right Coronary Artery",
        "anatomy": "Right atrioventricular sulcus supply to right ventricle, inferior/diaphragmatic LV wall, and cardiac conduction system (SA/AV nodes).",
        "drivers": ["Current Smoking", "Bradycardia/Pulse", "Elevated Systolic BP", "Inferior ECG Lead Changes", "Male Sex"],
    },
}

SAFETY_DISCLAIMER = (
    "Educational and research decision-support prototype only. Predictions are not a diagnosis, do not localize anatomical lesions, "
    "and are not a substitute for professional medical assessment or formal diagnostic imaging. "
    "The 3D anatomy is an explanatory mapping of statistical model outputs, not patient-specific medical imaging."
)


class ModelUnavailableError(RuntimeError):
    """Raised when complete, compatible local model artifacts are unavailable."""

class ExplanationUnavailableError(RuntimeError):
    """Raised when SHAP cannot produce valid contributions for the loaded models."""

class CardioService:
    def __init__(self):
        self.preprocessor = None
        self.models: Dict[str, Any] = {}
        self.metrics: Dict[str, Any] = {}
        self.is_loaded = False
        self.load_artifacts()

    def load_artifacts(self):
        try:
            prep_file = MODELS_DIR / "preprocessor.joblib"
            if prep_file.exists():
                self.preprocessor = joblib.load(prep_file)

            for target in TARGETS:
                m_file = MODELS_DIR / f"{target.lower()}_model.joblib"
                if m_file.exists():
                    self.models[target] = joblib.load(m_file)

            if METRICS_FILE.exists():
                with open(METRICS_FILE, "r") as f:
                    self.metrics = json.load(f)

            if self.preprocessor and len(self.models) == len(TARGETS):
                self.is_loaded = True
                print("[CardioService] Production models and preprocessor successfully loaded.")
            else:
                print(f"[CardioService] Incomplete models found ({len(self.models)}/{len(TARGETS)}). Inference is unavailable.")
        except Exception as e:
            print(f"[CardioService] Error loading model artifacts ({type(e).__name__}). Inference is unavailable.")
            self.is_loaded = False

    def classify_risk(self, prob: float) -> Tuple[str, str]:
        """Map probability to standardized risk category and hex color."""
        if prob < 0.25:
            return "Low", "#10b981"        # Emerald Green
        elif prob < 0.50:
            return "Moderate", "#f59e0b"   # Amber
        elif prob < 0.75:
            return "High", "#f97316"       # Vivid Orange
        else:
            return "Very High", "#ef4444"  # Crimson Red

    def calculate_overall_risk(self, cad_p: float, lad_p: float, lcx_p: float, rca_p: float) -> float:
        """
        Documented weighted anatomical risk aggregation:
        - Overall CAD status: 35%
        - LAD (critical anterior/septal territory): 30%
        - LCX (lateral LV wall): 15%
        - RCA (inferior wall & conduction): 20%
        """
        # Experimental aggregation for visualization only; not a validated clinical score.
        overall = (0.35 * cad_p) + (0.30 * lad_p) + (0.15 * lcx_p) + (0.20 * rca_p)
        return round(float(np.clip(overall, 0.01, 0.99)), 4)

    def predict_patient(self, patient_dict: Dict[str, Any]) -> PredictionResponse:
        """Run multi-target prediction, risk scoring, and XAI attribution."""
        if not self.is_loaded:
            raise ModelUnavailableError("Complete model artifacts are unavailable or incompatible.")

        # Derive BMI if not supplied
        wt = float(patient_dict.get("Weight", 75))
        ht = float(patient_dict.get("Length", 170))
        if "BMI" not in patient_dict or patient_dict["BMI"] is None:
            patient_dict["BMI"] = round(wt / ((ht / 100) ** 2), 2)
        if "Obesity" not in patient_dict or patient_dict["Obesity"] is None:
            patient_dict["Obesity"] = "Y" if patient_dict["BMI"] >= 30 else "N"

        probabilities: Dict[str, float] = {}
        target_explanations: Dict[str, Dict[str, List[Any]]] = {}

        if self.is_loaded:
            # Transform input via preprocessor (strict zero target leakage)
            X_proc = self.preprocessor.transform([patient_dict])

            for target in TARGETS:
                model = self.models[target]
                if hasattr(model, "predict_proba"):
                    class_index = list(model.classes_).index(1) if 1 in model.classes_ else None
                    prob = float(model.predict_proba(X_proc)[0, class_index]) if class_index is not None else 0.0
                else:
                    prob = float(model.predict(X_proc)[0])
                probabilities[target] = round(prob, 4)

            # Keep an explanation per target so vessel selection and attribution stay aligned.
            try:
                for target in TARGETS:
                    items, risks, protective = explain_patient_prediction(
                        model=self.models[target], X_processed_patient=X_proc,
                        preprocessor=self.preprocessor, raw_patient_dict=patient_dict, top_k=7)
                    target_explanations[target] = {
                        "explanation": items, "top_risk_contributors": risks, "protective_factors": protective}
            except Exception as exc:
                raise ExplanationUnavailableError("SHAP could not produce valid target-specific contributions") from exc
            explanation_items = target_explanations["CAD"]["explanation"]
            top_risk = target_explanations["CAD"]["top_risk_contributors"]
            top_protective = target_explanations["CAD"]["protective_factors"]
            model_mode = (
                "Synthetic Demo Models"
                if self.metrics.get("is_synthetic")
                else "Provenance Unverified Models"
            )
        cad_p = probabilities["CAD"]
        lad_p = probabilities["LAD"]
        lcx_p = probabilities["LCX"]
        rca_p = probabilities["RCA"]

        overall_risk = self.calculate_overall_risk(cad_p, lad_p, lcx_p, rca_p)
        overall_level, _ = self.classify_risk(overall_risk)
        cad_level, cad_color = self.classify_risk(cad_p)

        # Assemble vessel detail dictionaries
        vessels_detail: Dict[str, VesselRiskDetail] = {}
        for target in TARGETS:
            p = probabilities[target]
            lvl, color = self.classify_risk(p)
            cfg = VESSEL_CONFIGS[target]
            status = f"{lvl} probability band (visualization convention)"
            vessels_detail[target] = VesselRiskDetail(
                vessel_key=target,
                vessel_name=cfg["name"],
                probability=p,
                percentage=f"{p * 100:.1f}%",
                risk_level=lvl,
                color_hex=color,
                status=status,
                anatomy_description=cfg["anatomy"],
                primary_drivers=cfg["drivers"],
            )

        explanation_pydantic = [FeatureContributionItem(**item) if isinstance(item, dict) else item for item in explanation_items]
        top_risk_pydantic = [FeatureContributionItem(**item) if isinstance(item, dict) else item for item in top_risk]
        top_protective_pydantic = [FeatureContributionItem(**item) if isinstance(item, dict) else item for item in top_protective]

        is_synth = bool(self.metrics.get("is_synthetic", True))

        return PredictionResponse(
            cad_probability=cad_p,
            cad_class=cad_level,
            lad_probability=lad_p,
            lcx_probability=lcx_p,
            rca_probability=rca_p,
            overall_risk=overall_risk,
            risk_level=overall_level,
            vessels=vessels_detail,
            explanation=explanation_pydantic,
            protective_factors=top_protective_pydantic,
            top_risk_contributors=top_risk_pydantic,
            target_explanations=target_explanations,
            risk_scoring_methodology="Weighted Anatomical Risk Aggregation: 35% CAD + 30% LAD + 15% LCX + 20% RCA",
            model_mode=model_mode,
            is_synthetic_dataset=is_synth,
            medical_disclaimer=SAFETY_DISCLAIMER,
            evidence_status=("Synthetic demonstration dataset; not authentic clinical records" if is_synth else "Dataset provenance unverified; source metadata must be reviewed"),
            calibration_status="Not evaluated; returned probabilities are not established as calibrated",
            out_of_distribution_status="Not evaluated; no validated applicability-domain detector is available",
            data_quality_status="Input schema validated; clinical source, measurement quality, and missingness are not independently verified",
        )

# Global service instance
cardio_service = CardioService()
