import React from 'react';
import { ShieldCheck, X, Lock, EyeOff, Server, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-700 bg-[#0c1322] text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 id="privacy-policy-title" className="text-base font-bold text-white tracking-wide">
              Privacy Policy & Data Protection Statement
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close privacy policy"
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-cyan-200">
            <span className="font-semibold block mb-0.5 text-sm">Key Commitment: Zero Persistent Protected Health Information (PHI)</span>
            CardioLens processes patient biometric and lab parameters entirely within ephemeral memory. No entered health information is transmitted to external telemetry systems or stored on remote servers.
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-400" />
              1. Ephemeral Client-Side Processing
            </h3>
            <p>
              All patient inputs entered into the clinical parameters form are held in transient browser memory for the duration of the active evaluation session. Once the tab is closed or the form is reset, data is purged from client memory.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              2. No Third-Party Tracking or Advertising Cookies
            </h3>
            <p>
              CardioLens does not embed third-party advertising pixels, commercial analytics beacons, or behavioral tracking cookies. Session authentication tokens are stored exclusively in temporary session storage and expire automatically after 30 minutes of inactivity.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              3. Demonstration Dataset Provenance Notice
            </h3>
            <p>
              The demonstration records provided in presets and validation metrics originate from the synthetic cohort (N = 303, SHA-256: 4b6e0a08d400a4b113344e5ed56036688d0576abcf3462fab486558ea339c153). No actual patient medical records from real-world hospital databases are distributed with this prototype.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-300" />
              4. Local PDF Export Security
            </h3>
            <p>
              Generated PDF risk summaries and XAI attribution sheets are assembled directly within your client browser using client-side vector libraries. The resulting document is saved directly to your local file system without passing through an external print server.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">5. Security Governance & Inquiries</h3>
            <p>
              For security compliance inquiries or vulnerability reports regarding the CardioLens prototype, contact the designated system administrator at <span className="font-mono text-cyan-300">security@cardiolens.org</span>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-3.5 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Effective Date: October 2026 • Version 1.2.0</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
