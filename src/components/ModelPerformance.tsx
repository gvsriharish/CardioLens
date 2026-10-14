import React from 'react';
import { BarChart3, CheckCircle, ShieldCheck, Database, Layers } from 'lucide-react';
import { MetricsResponse } from '../types';

interface ModelPerformanceProps {
  metrics: MetricsResponse | null;
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="clinical-card p-6 border-slate-800 text-center text-slate-400">
        <BarChart3 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
        <p className="text-sm">Loading validation performance metrics...</p>
      </div>
    );
  }

  const { target_metrics, validation_methodology, sample_count, feature_count, excluded_leakage_columns } = metrics;
  const targets = ['CAD', 'LAD', 'LCX', 'RCA'];

  return (
    <div className="clinical-card p-5 border-slate-800 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Model Performance & Cross-Validation Audit
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pooled stratified 5-fold cross-validation estimates across all targets
          </p>
        </div>

        {/* Audit Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Known outcome fields excluded
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            N = {sample_count} synthetic records
          </span>
        </div>
      </div>

      <div className={`rounded-lg border px-3 py-2 text-xs ${metrics.is_synthetic ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
        {metrics.is_synthetic ? 'Synthetic-data demonstration metrics. These do not establish clinical performance.' : 'Dataset provenance is unverified. Treat these metrics as exploratory.'}
      </div>

      {/* Target Metrics Table (Primary Hackathon Requirement) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300">
              <th className="py-2.5 px-3 font-semibold">Target Vessel</th>
              <th className="py-2.5 px-3 font-semibold">Selected estimator</th>
              <th className="py-2.5 px-3 font-semibold">Accuracy</th>
              <th className="py-2.5 px-3 font-semibold">Precision</th>
              <th className="py-2.5 px-3 font-semibold">Recall</th>
              <th className="py-2.5 px-3 font-semibold">F1-Score</th>
              <th className="py-2.5 px-3 font-semibold">ROC-AUC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {targets.map((tgt) => {
              const m = target_metrics[tgt];
              if (!m) return null;
              return (
                <tr key={tgt} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {tgt}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">
                    {m.model}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300 font-bold">
                    {(m.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">
                    {(m.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">
                    {(m.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">
                    {m.f1.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 text-amber-300 font-bold">
                    {m.roc_auc.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Technical Methodology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Validation Framework
          </div>
          <p className="text-xs text-slate-200 font-medium">
            {validation_methodology}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Stratification preserves target class ratios across validation folds; these are not independent test results.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            Feature Engineering
          </div>
          <p className="text-xs text-slate-200 font-medium">
            {feature_count} Transformed Predictors
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Median imputation, standard scaling, and one-hot encoding without lookahead.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Excluded Leakage Attributes
          </div>
          <p className="text-xs font-mono text-amber-300 font-semibold truncate">
            {excluded_leakage_columns.join(', ')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Listed outcome fields are excluded; feature timing and clinical label semantics are not independently established.
          </p>
        </div>
      </div>
    </div>
  );
};
