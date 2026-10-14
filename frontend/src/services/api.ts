import { IntegrityMetadata, MetricsResponse, PatientData, PredictionResponse, ScenarioResponse } from '../types';

// Vite development proxies /api to FastAPI; the production app uses same-origin routes.
const API_BASE = '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { ...init, signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = Array.isArray(body?.detail)
      ? body.detail.map((item: { loc?: (string | number)[]; msg?: string }) => {
          const field = item.loc?.slice(1).join('.') || 'Request';
          return `${field}: ${item.msg || 'Invalid value'}`;
        }).join('; ')
      : typeof body?.detail === 'string' ? body.detail : body?.error;
    throw new Error(detail || `Backend request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function checkBackendHealth(): Promise<{ status: string; mode: string; models_loaded?: boolean }> {
  return request('/health');
}

export function fetchModelMetrics(): Promise<MetricsResponse> {
  return request('/metrics');
}

export function fetchIntegrityMetadata(): Promise<IntegrityMetadata> {
  return request('/metadata');
}

export function predictCardiovascularRisk(patient: PatientData): Promise<PredictionResponse> {
  return request('/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patient) });
}

export function compareScenario(baseline: PatientData, hypothetical: PatientData): Promise<ScenarioResponse> {
  return request('/scenario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseline_patient: baseline, hypothetical_patient: hypothetical }),
  });
}
