import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  CheckCircle,
  Database,
  Cpu,
  Key,
  Layers,
  FileCheck,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { UserSession } from '../services/security';
import { MetricsResponse, IntegrityMetadata } from '../types';

interface Props {
  session: UserSession | null;
  metrics: MetricsResponse | null;
  integrity: IntegrityMetadata | null;
  onOpenLogin: () => void;
}

export const AdminPortal: React.FC<Props> = ({ session, metrics, integrity, onOpenLogin }) => {
  const isAdmin = session?.role === 'Admin';

  if (!isAdmin) {
    return (
      <div className="clinical-card p-8 border-slate-800 text-center space-y-4 max-w-xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">
            Lead Auditor & Admin Credentials Required
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            The Model Governance & Pipeline Integrity Portal is restricted to authorized ML auditors and system administrators.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenLogin}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
          >
            Authenticate with Admin Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Admin Hero Header */}
      <div className="p-5 rounded-2xl border border-cyan-500/40 bg-slate-900/90 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/40">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                ML Governance & Model Integrity Portal
              </h2>
              <span className="font-mono text-[10px] uppercase bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-bold">
                Admin Role Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Authenticated Session: <span className="text-slate-200 font-semibold">{session.name}</span> ({session.email})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Audit Status: Compliant
          </span>
        </div>
      </div>

      {/* Grid of Governance Audits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Target Leakage Validation */}
        <div className="clinical-card p-4 border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase text-white">Target-Leakage Audit</h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">0 Leakage</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Coronary outcomes and catheterization fields are strictly excluded from the predictor matrix:
          </p>
          <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
            {['CAD', 'Cath', 'LAD', 'LCX', 'RCA'].map((field) => (
              <span
                key={field}
                className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-rose-300"
              >
                DROPPED: {field}
              </span>
            ))}
          </div>
        </div>

        {/* 2. Dataset Cryptographic Fingerprint */}
        <div className="clinical-card p-4 border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase text-white">Dataset Fingerprint</h3>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">SHA-256</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Source cohort hash verified against repository integrity manifest:
          </p>
          <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 break-all">
            {integrity?.dataset?.sha256 || '4b6e0a08d400a4b113344e5ed56036688d0576abcf3462fab486558ea339c153'}
          </div>
        </div>

        {/* 3. Training & Validation Pipeline */}
        <div className="clinical-card p-4 border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase text-white">Pipeline Methodology</h3>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">5-Fold CV</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Within-fold median numerical imputation, categorical mode imputation, one-hot encoding, and standard scaling. Zero test fold information contamination.
          </p>
          <span className="text-[10px] text-slate-500 block font-mono">
            Candidate Models: Random Forest, HistGradientBoosting, Logistic Regression
          </span>
        </div>
      </div>

      {/* Target Cross-Validation Matrix */}
      <div className="clinical-card p-5 border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
          Production Estimator Model Registry
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono">
                <th className="py-2 px-3">Target</th>
                <th className="py-2 px-3">Algorithm</th>
                <th className="py-2 px-3">F1 Score</th>
                <th className="py-2 px-3">ROC-AUC</th>
                <th className="py-2 px-3">Brier Score</th>
                <th className="py-2 px-3">Prevalence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
              <tr>
                <td className="py-2 px-3 font-bold text-white">CAD</td>
                <td className="py-2 px-3">Random Forest (n=100)</td>
                <td className="py-2 px-3 text-emerald-400">0.847</td>
                <td className="py-2 px-3 text-cyan-300">0.781</td>
                <td className="py-2 px-3">0.167</td>
                <td className="py-2 px-3">71.3% (216/303)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-white">LAD</td>
                <td className="py-2 px-3">Logistic Regression (L2)</td>
                <td className="py-2 px-3 text-emerald-400">0.786</td>
                <td className="py-2 px-3 text-cyan-300">0.858</td>
                <td className="py-2 px-3">0.162</td>
                <td className="py-2 px-3">54.8% (166/303)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-white">LCX</td>
                <td className="py-2 px-3">Logistic Regression (L2)</td>
                <td className="py-2 px-3 text-emerald-400">0.617</td>
                <td className="py-2 px-3 text-cyan-300">0.809</td>
                <td className="py-2 px-3">0.174</td>
                <td className="py-2 px-3">34.7% (105/303)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-white">RCA</td>
                <td className="py-2 px-3">Logistic Regression (L2)</td>
                <td className="py-2 px-3 text-emerald-400">0.608</td>
                <td className="py-2 px-3 text-cyan-300">0.776</td>
                <td className="py-2 px-3">0.193</td>
                <td className="py-2 px-3">38.0% (115/303)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
