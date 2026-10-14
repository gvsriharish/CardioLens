"""
Unit tests for CardioLens FastAPI endpoints.
"""

import json

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.service import cardio_service

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "models_loaded" in data

def test_model_info():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "CAD" in data["targets"]
    assert "LAD" in data["targets"]
    assert "LCX" in data["targets"]
    assert "RCA" in data["targets"]
    assert "Cath" in data["leakage_columns_excluded"]
    assert "safety_disclaimer" in data

def test_metrics():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "target_metrics" in data
    assert "CAD" in data["target_metrics"]
    cad_m = data["target_metrics"]["CAD"]
    assert 0.0 <= cad_m["accuracy"] <= 1.0
    assert 0.0 <= cad_m["roc_auc"] <= 1.0

def test_metadata_and_metrics_alias():
    metadata = client.get("/metadata")
    assert metadata.status_code == 200
    body = metadata.json()
    assert body["dataset"]["provenance_status"] == "synthetic"
    assert body["metrics"]["sample_count"] == 303
    assert client.get("/model/metrics").json()["sample_count"] == 303

def test_sample_patient():
    response = client.get("/sample-patient?preset=high_risk")
    assert response.status_code == 200
    data = response.json()
    assert "patient_data" in data
    assert "prediction" in data
    pred = data["prediction"]
    assert 0.0 <= pred["overall_risk"] <= 1.0
    assert pred["cad_probability"] >= 0.0
    assert pred["lad_probability"] >= 0.0
    assert pred["lcx_probability"] >= 0.0
    assert pred["rca_probability"] >= 0.0

def test_predict_and_explain():
    patient_payload = client.get("/sample-patient?preset=high_risk").json()["patient_data"]
    response = client.post("/predict", json=patient_payload)
    assert response.status_code == 200
    data = response.json()
    assert "overall_risk" in data
    assert "vessels" in data
    assert "LAD" in data["vessels"]
    assert "LCX" in data["vessels"]
    assert "RCA" in data["vessels"]
    assert len(data["explanation"]) > 0
    assert {"CAD", "LAD", "LCX", "RCA"}.issubset(data["vessels"])
    assert all(0.0 <= data[k] <= 1.0 for k in ("cad_probability", "lad_probability", "lcx_probability", "rca_probability", "overall_risk"))

    # Test explain endpoint
    exp_res = client.post("/explain", json=patient_payload)
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert "top_risk_contributors" in exp_data
    assert "protective_factors" in exp_data
    assert {"CAD", "LAD", "LCX", "RCA"}.issubset(exp_data["target_explanations"])
    assert "SHAP" in exp_data["methodology"]
    for target in ("CAD", "LAD", "LCX", "RCA"):
        target_items = exp_data["target_explanations"][target]["explanation"]
        assert target_items, f"No SHAP feature contributions returned for {target}"
        assert all(item["direction"] in {"increases_risk", "protective", "neutral"} for item in target_items)
        assert all(isinstance(item["contribution"], (int, float)) for item in target_items)

def test_invalid_input_and_batch_predict():
    invalid = client.post("/predict", json={"Age": 150})
    assert invalid.status_code == 422
    sample = client.get("/sample-patient?preset=low_risk").json()["patient_data"]
    missing = {key: value for key, value in sample.items() if key != "LDL"}
    assert client.post("/predict", json=missing).status_code == 422
    for bad_number in ("NaN", "Infinity", "-Infinity"):
        body = json.dumps(sample).replace('"BP": 116.0', f'"BP": {bad_number}')
        response = client.post("/predict", content=body, headers={"Content-Type": "application/json"})
        assert response.status_code == 422
        assert "input" not in response.text
    batch = client.post("/batch-predict", json={"patients": [sample]})
    assert batch.status_code == 200
    result = batch.json()["predictions"][0]
    assert all(0.0 <= result[k] <= 1.0 for k in ("cad_probability", "lad_probability", "lcx_probability", "rca_probability", "overall_risk"))
    assert client.post("/batch-predict", json={"patients": [sample] * 101}).status_code == 422

def test_prediction_rejects_outcomes_and_invalid_categories():
    sample = client.get("/sample-patient?preset=low_risk").json()["patient_data"]
    leaked = {**sample, "CAD": "CAD"}
    assert client.post("/predict", json=leaked).status_code == 422
    invalid = {**sample, "Sex": "unknown"}
    assert client.post("/predict", json=invalid).status_code == 422

def test_missing_models_abstain_instead_of_generating_predictions(monkeypatch):
    sample = client.get("/sample-patient?preset=low_risk").json()["patient_data"]
    monkeypatch.setattr(cardio_service, "is_loaded", False)
    assert client.get("/health").json()["status"] == "degraded"
    response = client.post("/predict", json=sample)
    assert response.status_code == 503
    assert "model artifacts" in response.json()["detail"]
    assert client.get("/sample-patient").status_code == 503
    assert client.post("/explain", json=sample).status_code == 503

def test_shap_failure_returns_clear_unavailable_response(monkeypatch):
    sample = client.get("/sample-patient?preset=low_risk").json()["patient_data"]
    def fail_explanation(*args, **kwargs):
        raise RuntimeError("internal SHAP details must not be exposed")
    monkeypatch.setattr("backend.app.service.explain_patient_prediction", fail_explanation)
    response = client.post("/predict", json=sample)
    assert response.status_code == 503
    assert "SHAP" in response.json()["detail"]
    assert "internal SHAP details" not in response.text

def test_scenario_compares_live_predictions():
    baseline = client.get("/sample-patient?preset=low_risk").json()["patient_data"]
    hypothetical = {**baseline, "LDL": 120.0, "BP": 130.0}
    response = client.post("/scenario", json={"baseline_patient": baseline, "hypothetical_patient": hypothetical})
    assert response.status_code == 200
    body = response.json()
    assert set(body["probability_differences_percentage_points"]) == {"CAD", "LAD", "LCX", "RCA"}
    for target in ("CAD", "LAD", "LCX", "RCA"):
        before = body["baseline_prediction"]["vessels"][target]["probability"]
        after = body["hypothetical_prediction"]["vessels"][target]["probability"]
        assert body["probability_differences_percentage_points"][target] == round((after - before) * 100, 2)
    assert "not causal" in body["scenario_notice"]
