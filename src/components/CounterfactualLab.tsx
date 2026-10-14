import React, { useEffect, useState } from 'react';
import { PatientData, PredictionResponse, ScenarioResponse } from '../types';
import { compareScenario } from '../services/api';

interface Props {
  baselinePatient: PatientData;
  onPredictionChange: (prediction: PredictionResponse | null) => void;
}

const targets = ['CAD', 'LAD', 'LCX', 'RCA'] as const;
const ranges = { LDL: [20, 400], BP: [70, 240], 'EF-TTE': [15, 75] } as const;

export const CounterfactualLab: React.FC<Props> = ({ baselinePatient, onPredictionChange }) => {
  const [values, setValues] = useState({ LDL: baselinePatient.LDL, BP: baselinePatient.BP, 'EF-TTE': baselinePatient['EF-TTE'] });
  const [result, setResult] = useState<ScenarioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues({ LDL: baselinePatient.LDL, BP: baselinePatient.BP, 'EF-TTE': baselinePatient['EF-TTE'] });
    setResult(null);
    setError(null);
    onPredictionChange(null);
  }, [baselinePatient, onPredictionChange]);

  const runScenario = async () => {
    setLoading(true); setError(null);
    try {
      const hypothetical: PatientData = { ...baselinePatient, ...values };
      const comparison = await compareScenario(baselinePatient, hypothetical);
      setResult(comparison);
      onPredictionChange(comparison.hypothetical_prediction);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Scenario request failed.');
      setResult(null); onPredictionChange(null);
    } finally { setLoading(false); }
  };

  const reset = () => {
    setValues({ LDL: baselinePatient.LDL, BP: baselinePatient.BP, 'EF-TTE': baselinePatient['EF-TTE'] });
    setResult(null); setError(null); onPredictionChange(null);
  };

  const field = (key: keyof typeof values, label: string, unit: string) => <label key={key} className="block text-xs text-slate-300">{label} ({unit})<input aria-label={`Hypothetical ${label}`} type="number" min={ranges[key][0]} max={ranges[key][1]} value={values[key]} onChange={e => setValues(v => ({ ...v, [key]: parseFloat(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label>;

  return <section className="clinical-card p-5 space-y-4" aria-labelledby="scenario-title">
    <div><h2 id="scenario-title" className="text-lg font-bold text-white">What-If Scenario Lab</h2><p className="text-xs text-slate-400 mt-1">The current form is the observed baseline. Edit a separate hypothetical copy; the comparison runs both profiles through the backend.</p></div>
    <div className="grid sm:grid-cols-3 gap-3">{field('LDL', 'LDL cholesterol', 'mg/dL')}{field('BP', 'Systolic blood pressure', 'mmHg')}{field('EF-TTE', 'Ejection fraction', '%')}</div>
    <div className="flex gap-2"><button type="button" onClick={runScenario} disabled={loading} className="rounded-lg bg-cyan-700 hover:bg-cyan-600 disabled:opacity-60 px-4 py-2 text-sm font-semibold">{loading ? 'Running model…' : 'Compare with backend'}</button><button type="button" onClick={reset} className="rounded-lg border border-slate-700 px-4 py-2 text-sm">Reset scenario</button></div>
    {error && <p role="alert" className="text-sm text-rose-300">Scenario failed: {error}</p>}
    {result && <div className="space-y-3" aria-live="polite"><p className="text-xs text-amber-200">Hypothetical profile · outputs from the active {result.hypothetical_prediction.model_mode}. Percentage point change = hypothetical minus baseline.</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-400"><tr><th className="py-2">Target</th><th>Baseline</th><th>Hypothetical</th><th>Difference</th></tr></thead><tbody>{targets.map(target => { const baseline = result.baseline_prediction.vessels[target].probability; const hypothetical = result.hypothetical_prediction.vessels[target].probability; const delta = result.probability_differences_percentage_points[target]; return <tr key={target} className="border-t border-slate-800"><th className="py-2">{target}</th><td>{(baseline * 100).toFixed(1)}%</td><td>{(hypothetical * 100).toFixed(1)}%</td><td>{delta > 0 ? '+' : ''}{delta.toFixed(2)} pp</td></tr>; })}</tbody></table></div><p className="text-xs text-slate-400">{result.scenario_notice}</p></div>}
  </section>;
};
