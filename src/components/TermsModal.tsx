import React from 'react';
import { FileCheck, X, AlertTriangle, Scale, Stethoscope } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-700 bg-[#0c1322] text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            <h2 id="terms-title" className="text-base font-bold text-white tracking-wide">
              Terms & Conditions of Prototype Use
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terms and conditions"
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200">
            <span className="font-semibold block mb-0.5 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Not a Medical Device or Clinical Diagnostic Tool
            </span>
            CardioLens is an investigational educational prototype. Statistical risk probabilities and 3D visual representations do not constitute a medical diagnosis, triage directive, or treatment plan.
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              1. Non-Diagnostic Educational Scope
            </h3>
            <p>
              The outputs provided by CardioLens (CAD, LAD, LCX, RCA probabilities and SHAP-based attributions) reflect statistical associations fitted on a demonstration cohort. They are not calibrated probabilities and must never supersede clinical judgment, formal invasive coronary angiography, or diagnostic CT/SPECT imaging.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              2. Limitation of Liability
            </h3>
            <p>
              Under no circumstances shall the authors, contributors, or affiliated institutions be held liable for clinical decisions, diagnoses, patient outcomes, or claims arising from the use of this software prototype. Clinicians and researchers assume all responsibility for verifying inputs and interpreting results.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">3. Procedural 3D Visualization Limitations</h3>
            <p>
              The 3D cardiac viewer employs a generic procedural anatomical reference structure. Coronary artery paths, branch overlays, and emissive color bands represent whole-vessel statistical outputs. They do not locate specific anatomical plaques, thrombi, or patient-specific lesion geometry.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">4. Acceptable Use & Research Integrity</h3>
            <p>
              Users agree not to input unauthorized personal identifying information, attempt unauthorized penetration testing against rate-limiting layers, or misrepresent model demonstration benchmarks as FDA/CE cleared diagnostic claims.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-3.5 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">CardioLens Clinical Decision Support Agreement</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            I Acknowledge & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
