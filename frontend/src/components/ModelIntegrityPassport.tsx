import React from 'react';
import { IntegrityMetadata } from '../types';

interface Props { metadata: IntegrityMetadata | null; error?: string | null; }

const percent = (value: number | null | undefined) => value == null ? 'Not available' : `${(value * 100).toFixed(1)}%`;

export const ModelIntegrityPassport: React.FC<Props> = ({ metadata, error }) => {
  if (!metadata) return <section className="clinical-card p-5" aria-live="polite">{error ? `Integrity metadata unavailable: ${error}` : 'Loading model integrity metadata…'}</section>;
  const metrics = metadata.metrics;
  const dataset = metadata.dataset ?? {};
  return <section className="clinical-card p-5 space-y-5" aria-labelledby="passport-title">
    <div>
      <h2 id="passport-title" className="text-lg font-bold text-white">Model Integrity Passport</h2>
      <p className="text-sm text-slate-400 mt-1">Live metadata from the backend and generated training artifacts.</p>
    </div>
    <div className="grid md:grid-cols-3 gap-3 text-sm">
      <div className="rounded-lg border border-slate-700 p-3"><div className="text-slate-400">Dataset provenance</div><strong className="text-amber-300">{dataset.provenance_status ?? (metrics?.is_synthetic ? 'synthetic' : 'unverified')}</strong><p className="mt-1 text-xs text-slate-400">{dataset.provenance_evidence ?? 'No provenance manifest is available.'}</p></div>
      <div className="rounded-lg border border-slate-700 p-3"><div className="text-slate-400">Model readiness</div><strong>{metadata.models_loaded ? metadata.model_mode : 'Model artifacts unavailable · predictions abstain'}</strong><p className="mt-1 text-xs text-slate-400">Artifact version: {dataset.artifact_version ?? 'See model manifest'}</p></div>
      <div className="rounded-lg border border-slate-700 p-3"><div className="text-slate-400">Calibration / applicability</div><strong className="text-amber-300">Not evaluated</strong><p className="mt-1 text-xs text-slate-400">No calibrated probability claim or out-of-distribution detector is available.</p></div>
    </div>
    <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300">
      <p><b>Records:</b> {dataset.record_count ?? metrics?.sample_count ?? 'Unknown'} · <b>Features:</b> {metrics?.feature_count ?? 'Unknown'} · <b>SHA-256:</b> <span className="font-mono break-all">{dataset.sha256 ?? metrics?.dataset_sha256 ?? 'Unavailable'}</span></p>
      <p><b>Validation:</b> {metrics?.validation_methodology ?? 'Unavailable'}. {metrics?.selection_methodology ?? ''}</p>
      <p><b>Excluded leakage fields:</b> {(metrics?.excluded_leakage_columns ?? []).join(', ') || 'Unavailable'}</p>
      <p><b>Data checks:</b> {metrics?.data_quality ? `${metrics.data_quality.duplicate_rows} duplicate rows; ${metrics.data_quality.missing_cells} empty cells` : 'Unavailable'}</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs"><thead className="text-slate-400"><tr><th className="py-2">Target</th><th>Model</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th><th>ROC-AUC</th><th>Brier</th></tr></thead>
        <tbody>{Object.entries(metrics?.target_metrics ?? {}).map(([target, item]: [string, any]) => <tr key={target} className="border-t border-slate-800"><th className="py-2 text-white">{target}</th><td>{item.model}</td><td>{percent(item.accuracy)}</td><td>{percent(item.precision)}</td><td>{percent(item.recall)}</td><td>{percent(item.f1)}</td><td>{item.roc_auc == null ? 'Undefined' : item.roc_auc.toFixed(3)}</td><td>{item.brier_score == null ? 'Unavailable' : item.brier_score.toFixed(3)}</td></tr>)}</tbody>
      </table>
    </div>
    <p className="text-xs text-amber-200">These are pooled out-of-fold selection estimates on synthetic records. Candidate selection used those same out-of-fold F1 results, so the reported values may be optimistic. There is no independent held-out or external evaluation. Brier scores are descriptive and do not establish calibration. The 3D view maps whole-vessel model outputs; it does not localize a lesion.</p>
  </section>;
};
