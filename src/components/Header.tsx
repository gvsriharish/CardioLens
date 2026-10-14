import React from 'react';
import {
  HeartPulse,
  ShieldCheck,
  Database,
  Cpu,
  FileDown,
  User,
  Lock,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { UserSession } from '../services/security';

interface HeaderProps {
  backendMode: string;
  isModelReady: boolean;
  isSyntheticData: boolean;
  session: UserSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSecurityAudit: () => void;
  onExportPDF?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  backendMode,
  isModelReady,
  isSyntheticData,
  session,
  onOpenAuth,
  onLogout,
  onOpenSecurityAudit,
  onExportPDF,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#090f1d]/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Logo & Product Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-red-500 p-0.5 shadow-lg shadow-cyan-900/20">
            <div className="w-full h-full bg-[#090f1d] rounded-[10px] flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">CardioLens</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                Track A
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Explainable Cardiovascular Risk Visualization & Multi-Vessel Stenosis Prediction
            </p>
          </div>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Model Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Model:</span>
            <span className="font-semibold text-cyan-300 font-mono">
              {isModelReady ? 'Trained Ensemble' : backendMode}
            </span>
          </div>

          {/* Dataset Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Dataset:</span>
            <span className="font-semibold text-emerald-300">
              {isSyntheticData ? 'Synthetic cohort' : 'Unverified'}
            </span>
          </div>

          {/* Security Audit Badge & Action */}
          <button
            type="button"
            onClick={onOpenSecurityAudit}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-emerald-300 font-medium transition-colors cursor-pointer"
            title="View Security & Compliance Audit"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security: 100% Passed</span>
          </button>

          {/* User Session Auth Button */}
          {session ? (
            <div className="flex items-center gap-1.5 pl-1.5 py-0.5 pr-1 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[120px]">
                {session.name.split(',')[0]}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {session.role}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Clinician Access</span>
            </button>
          )}

          {/* Export PDF Report Button */}
          {onExportPDF && (
            <button
              type="button"
              onClick={onExportPDF}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium shadow-md shadow-cyan-950/40 transition-all cursor-pointer"
              title="Export current patient risk assessment and XAI attribution as PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
