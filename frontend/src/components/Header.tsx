import React from 'react';
import { HeartPulse, ShieldCheck, Database, Cpu, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  backendMode: string;
  isModelReady: boolean;
  isSyntheticData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  backendMode,
  isModelReady,
  isSyntheticData,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#090f1d]/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Logo & Product Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-red-500 p-0.5 shadow-lg shadow-cyan-900/20">
            <div className="w-full h-full bg-[#090f1d] rounded-[10px] flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                CardioLens
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                Track A
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Explainable Cardiovascular Risk Visualization & Multi-Vessel Stenosis Prediction
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Model Status */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Model:</span>
            <span className="font-semibold text-cyan-300 font-mono">
              {isModelReady ? 'Trained models loaded' : backendMode}
            </span>
          </div>

          {/* Dataset Status */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Dataset:</span>
            <span className="font-semibold text-emerald-300">
              {isSyntheticData ? 'Synthetic demo data' : 'Unverified dataset'}
            </span>
          </div>

          {/* Safety Prototype Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Clinical Decision Support Prototype</span>
          </div>
        </div>
      </div>
    </header>
  );
};
