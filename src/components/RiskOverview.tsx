import React from 'react';
import { AlertCircle, CheckCircle2, Flame, Heart, ShieldAlert, FileDown } from 'lucide-react';
import { PredictionResponse, RiskLevel } from '../types';

interface RiskOverviewProps {
  prediction: PredictionResponse | null;
  selectedVessel: string | null;
  onSelectVessel: (vesselKey: string) => void;
  onExportPDF?: () => void;
}

export const RiskOverview: React.FC<RiskOverviewProps> = ({
  prediction,
  selectedVessel,
  onSelectVessel,
  onExportPDF,
}) => {
  if (!prediction) {
    return (
      <div className="clinical-card p-5 h-full flex flex-col items-center justify-center text-center text-slate-400">
        <Heart className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
        <p className="text-sm font-medium">Ready for cardiovascular analysis</p>
        <p className="text-xs text-slate-500 mt-1">Configure patient features and click Analyze</p>
      </div>
    );
  }

  const { overall_risk, risk_level, vessels } = prediction;
  const overallPercentage = (overall_risk * 100).toFixed(1);

  const getRiskBadgeStyles = (level: RiskLevel) => {
    switch (level) {
      case 'Very High':
        return 'bg-red-500/20 text-red-400 border-red-500/40 shadow-glow-danger';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-glow-warning';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Low':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-glow-success';
    }
  };

  const vesselKeys = ['CAD', 'LAD', 'LCX', 'RCA'];

  return (
    <div className="clinical-card p-5 flex flex-col h-full border-slate-800 shadow-xl space-y-5">
      {/* OVERALL CARDIOVASCULAR RISK HERO CARD */}
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 p-4 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider">
            Overall Model-Derived Risk
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Weighted Multi-Target
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black tracking-tight text-white font-mono">
                {overallPercentage}%
              </span>
              <span className="text-xs text-slate-400">probability</span>
            </div>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getRiskBadgeStyles(risk_level)}`}>
                {risk_level === 'Very High' || risk_level === 'High' ? (
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {risk_level} Risk Category
              </span>
            </div>
          </div>

          {/* Radial visual indicator */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="transition-all duration-1000 ease-out"
                strokeWidth="3.5"
                strokeDasharray={`${overall_risk * 100}, 100`}
                strokeLinecap="round"
                stroke={
                  risk_level === 'Very High'
                    ? '#ef4444'
                    : risk_level === 'High'
                    ? '#f97316'
                    : risk_level === 'Moderate'
                    ? '#f59e0b'
                    : '#10b981'
                }
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-[11px] font-bold font-mono text-white">
              {Math.round(overall_risk * 100)}%
            </div>
          </div>
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-slate-400">Probability bands and colors are display conventions, not diagnostic thresholds. Probabilities are not established as calibrated clinical risk.</p>
      </div>

      {/* 4 VESSEL CARDS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Coronary Vessel Distribution</span>
          <span className="text-[10px] text-slate-500 font-normal">Click vessel to focus</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
          {vesselKeys.map((key) => {
            const v = vessels[key];
            if (!v) return null;
            const isSelected = selectedVessel === key;

            return (
              <button type="button" aria-pressed={isSelected} aria-label={`Focus ${v.vessel_name}, ${v.percentage}, ${v.risk_level} visualization band`}
                key={key}
                onClick={() => onSelectVessel(key)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-850 border-cyan-500 shadow-glow-cyan'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: v.color_hex }}
                    />
                    <span className="font-bold text-xs text-white">
                      {v.vessel_key}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal truncate max-w-[130px]">
                      {key === 'CAD' ? 'Global Disease' : key === 'LAD' ? 'Ant. Descending' : key === 'LCX' ? 'Circumflex' : 'Right Coronary'}
                    </span>
                  </div>

                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: v.color_hex }}
                  >
                    {v.percentage}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80 mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(5, v.probability * 100))}%`,
                      backgroundColor: v.color_hex,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[170px]">
                    {v.status}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${v.color_hex}1a`,
                      color: v.color_hex,
                    }}
                  >
                    {v.risk_level}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Export Report Action */}
        {onExportPDF && (
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onExportPDF}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-lg shadow-cyan-950/40 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Export Clinical PDF Report</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
