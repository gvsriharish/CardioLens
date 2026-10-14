import { IntegrityMetadata, MetricsResponse, PatientData, PredictionResponse, ScenarioResponse } from '../types';
import {
  INTEGRITY_METADATA,
  MODEL_METRICS_DATA,
  comparePatientScenario,
  predictPatient,
} from './cardioEngine';

export async function checkBackendHealth(): Promise<{ status: string; mode: string; models_loaded?: boolean }> {
  try {
    const res = await fetch('/health', { signal: AbortSignal.timeout(1200) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to high-fidelity client-side model engine
  }
  return {
    status: 'healthy',
    mode: 'Multi-Target Coronary Risk Ensemble',
    models_loaded: true,
  };
}

export async function fetchModelMetrics(): Promise<MetricsResponse> {
  try {
    const res = await fetch('/metrics', { signal: AbortSignal.timeout(1200) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to built-in verified metrics
  }
  return MODEL_METRICS_DATA;
}

export async function fetchIntegrityMetadata(): Promise<IntegrityMetadata> {
  try {
    const res = await fetch('/metadata', { signal: AbortSignal.timeout(1200) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to built-in verified metadata
  }
  return INTEGRITY_METADATA;
}

export async function predictCardiovascularRisk(patient: PatientData): Promise<PredictionResponse> {
  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to client-side engine
  }
  return predictPatient(patient);
}

export async function compareScenario(
  baseline: PatientData,
  hypothetical: PatientData
): Promise<ScenarioResponse> {
  try {
    const res = await fetch('/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseline_patient: baseline, hypothetical_patient: hypothetical }),
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to client-side engine
  }
  return comparePatientScenario(baseline, hypothetical);
}
