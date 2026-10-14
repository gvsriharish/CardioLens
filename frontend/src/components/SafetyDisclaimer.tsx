import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const SafetyDisclaimer: React.FC = () => {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-200/90 flex items-start gap-3 shadow-lg">
      <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <span>Medical Safety & Diagnostic Disclaimer</span>
        </div>
        <p className="leading-relaxed text-amber-200/80">
          <strong>Educational and research decision-support prototype only. Predictions are not a diagnosis, do not localize anatomical lesions, and are not a substitute for professional medical assessment or formal diagnostic imaging.</strong> The bundled models were trained on synthetic demonstration data; the CSV's UCI-style filename and schema do not verify its provenance.
        </p>
        <p className="leading-relaxed text-amber-200/80 text-[11px]">
          <strong>Explanatory Anatomy Notice:</strong> The interactive heart is a generic AI-assisted cutaway reference mesh; selectable coronary overlays are schematic. Neither depicts patient-specific radiologic imaging, validated lumen geometry, or an observed lesion.
        </p>
      </div>
    </div>
  );
};
