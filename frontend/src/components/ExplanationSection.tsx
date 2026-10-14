import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info, ShieldCheck, HelpCircle } from 'lucide-react';
import { FeatureContributionItem } from '../types';

interface ExplanationSectionProps {
  topRiskContributors: FeatureContributionItem[];
  protectiveFactors: FeatureContributionItem[];
  selectedVessel: string | null;
}

export const ExplanationSection: React.FC<ExplanationSectionProps> = ({
  topRiskContributors,
  protectiveFactors,
  selectedVessel,
}) => {
  return (
    <div className="clinical-card p-5 border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Why Is This Patient At Risk?
            </h3>
            {selectedVessel && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Focused on {selectedVessel}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Target-specific SHAP feature contributions (synthetic reference cohort; association, not causation)
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-500" />
            <span className="text-slate-300">Increases Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span className="text-slate-300">Protective Factor</span>
          </div>
        </div>
      </div>

      {/* Two columns: Risk Drivers vs Protective Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Risk Contributors */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 uppercase tracking-wider">
            <ArrowUpRight className="w-4 h-4" />
            <span>Top Associated Risk Contributors</span>
          </div>

          <div className="space-y-2">
            {topRiskContributors.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-lg">
                No dominant adverse risk factors detected for this patient.
              </div>
            ) : (
              topRiskContributors.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-red-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">
                      {item.label}
                    </span>
                    <span className="font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                      {item.value}
                    </span>
                  </div>

                  {/* Relative contribution bar */}
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden my-1.5">
                    <div
                      className="bg-red-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(15, Math.abs(item.contribution) * 200))}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.clinical_note}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Protective Factors */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <ArrowDownRight className="w-4 h-4" />
            <span>Top Associated Protective / Mitigating Factors</span>
          </div>

          <div className="space-y-2">
            {protectiveFactors.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-lg">
                No strong protective clinical factors identified.
              </div>
            ) : (
              protectiveFactors.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">
                      {item.label}
                    </span>
                    <span className="font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                      {item.value}
                    </span>
                  </div>

                  {/* Relative contribution bar */}
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden my-1.5">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(15, Math.abs(item.contribution) * 200))}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.clinical_note}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
