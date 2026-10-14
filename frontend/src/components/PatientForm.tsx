import React, { useState } from 'react';
import { Play, Sparkles, User, Activity, FlaskConical, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';
import { PatientData } from '../types';
import { PRESET_PATIENTS, PresetOption } from '../constants/presets';

interface PatientFormProps {
  formData: PatientData;
  onChange: (updated: PatientData) => void;
  onSubmit: () => void;
  onSelectPreset: (preset: PresetOption) => void;
  isLoading: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onSelectPreset,
  isLoading,
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'demographics' | 'vitals' | 'labs' | 'ecg'>('all');

  const updateField = (field: string, value: any) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <div className="clinical-card p-4 sm:p-5 flex flex-col h-full border-slate-800 shadow-xl">
      {/* Panel Header & Preset Selectors */}
      <div className="border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Patient Clinical Profile
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Clinical feature schema
          </span>
        </div>

        {/* Example Presets Bar */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Synthetic example profiles (predictions come from the active model):
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESET_PATIENTS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className="px-2 py-1.5 rounded-lg text-left text-[11px] font-medium border border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
              >
                <span className="font-semibold text-slate-200 truncate">
                  {preset.key === 'high_risk' ? 'High Risk' : preset.key === 'moderate_risk' ? 'Moderate Risk' : 'Low Risk'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {preset.key === 'high_risk' ? 'STEMI / LAD' : preset.key === 'moderate_risk' ? 'Exertional' : 'Optimal'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Fields Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
        {/* SECTION 1: DEMOGRAPHICS & COMORBIDITIES */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-300 text-xs pb-1 border-b border-slate-800/80">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Demographics & Comorbidities</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Age (years)</label>
              <input
                type="number"
                min="20"
                max="95"
                value={formData.Age}
                onChange={(e) => updateField('Age', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Sex</label>
              <select
                value={formData.Sex}
                onChange={(e) => updateField('Sex', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Weight (kg)</label>
              <input
                type="number"
                value={formData.Weight}
                onChange={(e) => updateField('Weight', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Height (cm)</label>
              <input
                type="number"
                value={formData.Length}
                onChange={(e) => updateField('Length', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Diabetes</label>
              <select
                value={formData.DM}
                onChange={(e) => updateField('DM', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100"
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Hypertension</label>
              <select
                value={formData.HTN}
                onChange={(e) => updateField('HTN', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100"
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Smoker</label>
              <select
                value={formData['Current Smoker']}
                onChange={(e) => updateField('Current Smoker', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100"
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: VITALS & SYMPTOMS */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-300 text-xs pb-1 border-b border-slate-800/80">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vitals & Symptoms</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                value={formData.BP}
                onChange={(e) => updateField('BP', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Pulse Rate (BPM)</label>
              <input
                type="number"
                value={formData.PR}
                onChange={(e) => updateField('PR', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Typical Chest Pain</label>
              <select
                value={formData['Typical Chest Pain']}
                onChange={(e) => updateField('Typical Chest Pain', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none font-semibold"
              >
                <option value="Y">Yes (Angina)</option>
                <option value="N">No</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Exertional Dyspnea</label>
              <select
                value={formData.Dyspnea}
                onChange={(e) => updateField('Dyspnea', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: LABORATORY METRICS */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-300 text-xs pb-1 border-b border-slate-800/80">
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
            <span>Serum Chemistry & Lipids</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">LDL Chol (mg/dL)</label>
              <input
                type="number"
                value={formData.LDL}
                onChange={(e) => updateField('LDL', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">HDL Chol (mg/dL)</label>
              <input
                type="number"
                value={formData.HDL}
                onChange={(e) => updateField('HDL', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Fasting Glucose (mg/dL)</label>
              <input
                type="number"
                value={formData.FBS}
                onChange={(e) => updateField('FBS', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Triglycerides (mg/dL)</label>
              <input
                type="number"
                value={formData.TG}
                onChange={(e) => updateField('TG', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: ECG & ECHOCARDIOGRAPHY */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-300 text-xs pb-1 border-b border-slate-800/80">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
            <span>ECG & Echocardiography</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Ejection Fraction (%)</label>
              <input
                type="number"
                min="15"
                max="75"
                value={formData['EF-TTE']}
                onChange={(e) => updateField('EF-TTE', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Wall Motion (RWMA 0-4)</label>
              <input
                type="number"
                min="0"
                max="4"
                value={formData['Region RWMA']}
                onChange={(e) => updateField('Region RWMA', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">ST Elevation</label>
              <select
                value={String(formData['St Elevation'])}
                onChange={(e) => updateField('St Elevation', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="1">Present (1)</option>
                <option value="0">Absent (0)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">ST Depression</label>
              <select
                value={String(formData['St Depression'])}
                onChange={(e) => updateField('St Depression', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="1">Present (1)</option>
                <option value="0">Absent (0)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Primary CTA Button */}
      <div className="border-t border-slate-800 pt-3 mt-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Multi-Target Hemodynamics...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Analyze Cardiovascular Risk</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
