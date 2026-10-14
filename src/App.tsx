import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { PatientForm } from './components/PatientForm';
import { HeartViewer3D } from './components/HeartViewer3D';
import { RiskOverview } from './components/RiskOverview';
import { ExplanationSection } from './components/ExplanationSection';
import { ModelPerformance } from './components/ModelPerformance';
import { SafetyDisclaimer } from './components/SafetyDisclaimer';
import { ModelIntegrityPassport } from './components/ModelIntegrityPassport';
import { CounterfactualLab } from './components/CounterfactualLab';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsModal } from './components/TermsModal';
import {
  checkBackendHealth,
  fetchIntegrityMetadata,
  fetchModelMetrics,
  predictCardiovascularRisk,
} from './services/api';
import {
  checkRateLimit,
  clearSession,
  getActiveSession,
  sanitizeAndValidatePatientData,
  UserSession,
} from './services/security';
import { IntegrityMetadata, MetricsResponse, PatientData, PredictionResponse } from './types';
import { PRESET_PATIENTS, PresetOption } from './constants/presets';
import { exportPatientReportPDF } from './services/reportGenerator';
import {
  Layers,
  Activity,
  FileText,
  ShieldCheck,
  GitCompareArrows,
  Lock,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export const App: React.FC = () => {
  // Centralized State
  const [formData, setFormData] = useState<PatientData>(PRESET_PATIENTS[0].data);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [integrity, setIntegrity] = useState<IntegrityMetadata | null>(null);
  const [scenarioPrediction, setScenarioPrediction] = useState<PredictionResponse | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<string | null>('LAD');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'explanation' | 'physiology' | 'performance' | 'integrity' | 'scenario' | 'admin'
  >('explanation');

  // Security & Authentication State
  const [session, setSession] = useState<UserSession | null>(() => getActiveSession());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  // Backend connection status
  const [backendMode, setBackendMode] = useState<string>('Initializing');
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize and run initial prediction
  useEffect(() => {
    let mounted = true;

    async function initSystem() {
      try {
        const health = await checkBackendHealth();
        if (!mounted) return;
        setBackendMode(health.mode);
        setIsModelReady(Boolean(health.models_loaded));
        const loadedMetrics = await fetchModelMetrics();
        if (!mounted) return;
        setMetrics(loadedMetrics);
        const metadata = await fetchIntegrityMetadata();
        if (!mounted) return;
        setIntegrity(metadata);
        setIsLoading(true);

        const { sanitized } = sanitizeAndValidatePatientData(formData);
        const initialPred = await predictCardiovascularRisk(sanitized);
        if (!mounted) return;
        setPrediction(initialPred);
        setConnectionError(null);
      } catch (err) {
        if (mounted)
          setConnectionError(
            err instanceof Error ? err.message : 'System initialization encountered an error.'
          );
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initSystem();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAnalyze = async () => {
    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit('patient_analysis', 35, 60000);
    if (!rateCheck.allowed) {
      setSecurityNotice(
        `Rate limit reached: Maximum 35 evaluations per minute. Please wait ${rateCheck.retryAfterSec}s before retrying.`
      );
      return;
    }

    // 2. Strict Input Sanitization & Range Validation
    const { sanitized, warnings } = sanitizeAndValidatePatientData(formData);
    setFormData(sanitized);

    if (warnings.length > 0) {
      setSecurityNotice(`Form Sanitized: ${warnings[0]}`);
      setTimeout(() => setSecurityNotice(null), 5000);
    } else {
      setSecurityNotice(null);
    }

    setIsLoading(true);
    try {
      const res = await predictCardiovascularRisk(sanitized);
      setPrediction(res);
      setConnectionError(null);
    } catch (err) {
      setConnectionError(
        err instanceof Error ? err.message : 'Prediction failed. Check input parameters.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = async (preset: PresetOption) => {
    const { sanitized } = sanitizeAndValidatePatientData(preset.data);
    setFormData(sanitized);
    setIsLoading(true);
    try {
      const res = await predictCardiovascularRisk(sanitized);
      setPrediction(res);
      setConnectionError(null);
      setSecurityNotice(null);
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : 'Preset prediction failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVessel = (vesselKey: string) => {
    setSelectedVessel((prev) => (prev === vesselKey ? null : vesselKey));
  };

  const handleExportPDF = () => {
    // Rate limit PDF generation to protect client performance
    const rateCheck = checkRateLimit('export_pdf', 15, 60000);
    if (!rateCheck.allowed) {
      setSecurityNotice(
        `Export rate limit reached. Please wait ${rateCheck.retryAfterSec}s before exporting again.`
      );
      return;
    }
    setSecurityNotice(null);

    const { sanitized } = sanitizeAndValidatePatientData(formData);
    exportPatientReportPDF({
      patient: sanitized,
      prediction: displayedPrediction,
      metrics,
      selectedVessel,
    });
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    if (activeTab === 'admin') setActiveTab('explanation');
  };

  const displayedPrediction = scenarioPrediction ?? prediction;

  return (
    <div className="min-h-screen bg-[#070b14] bg-clinical-grid text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        backendMode={backendMode}
        isModelReady={isModelReady}
        isSyntheticData={prediction?.is_synthetic_dataset ?? true}
        session={session}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenSecurityAudit={() => setIsSecurityAuditOpen(true)}
        onExportPDF={handleExportPDF}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 lg:px-8 py-5 space-y-5">
        {/* Persistent Safety Disclaimer Banner */}
        <SafetyDisclaimer />

        {/* Security Notification Banner */}
        {securityNotice && (
          <div
            role="status"
            className="rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between animate-fade-in"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{securityNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setSecurityNotice(null)}
              className="text-amber-400 hover:text-white text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {connectionError && (
          <div
            role="alert"
            className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Notice: {connectionError}</span>
          </div>
        )}

        {/* PRIMARY 3-COLUMN WORKFLOW GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT COLUMN: Patient Input Form (4 cols) */}
          <div className="lg:col-span-4 h-full">
            <PatientForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleAnalyze}
              onSelectPreset={handleSelectPreset}
              isLoading={isLoading}
            />
          </div>

          {/* CENTER COLUMN: Interactive 3D Heart & Coronary Hemodynamics (5 cols) */}
          <div className="lg:col-span-5 h-full">
            <HeartViewer3D
              prediction={displayedPrediction}
              selectedVessel={selectedVessel}
              onSelectVessel={handleSelectVessel}
              pulseRate={formData.PR || 75}
            />
          </div>

          {/* RIGHT COLUMN: Risk Summary & Vessel Cards (3 cols) */}
          <div className="lg:col-span-3 h-full">
            <RiskOverview
              prediction={displayedPrediction}
              selectedVessel={selectedVessel}
              onSelectVessel={handleSelectVessel}
              onExportPDF={handleExportPDF}
            />
          </div>
        </div>

        {/* BOTTOM SECTION: ANALYTICS & TABS */}
        <div className="space-y-3">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('explanation')}
              className={`px-4 py-2 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'explanation'
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Explainable AI (XAI) Attribution</span>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'performance'
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Cross-Validation Model Performance</span>
            </button>

            <button
              onClick={() => setActiveTab('physiology')}
              className={`px-4 py-2 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'physiology'
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Patient Physiology Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('scenario')}
              className={`px-4 py-2 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'scenario'
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCompareArrows className="w-4 h-4" />
              <span>What-If Scenario</span>
            </button>

            <button
              onClick={() => setActiveTab('integrity')}
              className={`px-4 py-2 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'integrity'
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Integrity Passport</span>
            </button>

            {/* Protected Admin Portal Tab */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Admin & Governance</span>
              {session?.role === 'Admin' && (
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </button>
          </div>

          {/* Active Tab Contents */}
          {activeTab === 'explanation' && (
            <ExplanationSection
              topRiskContributors={
                selectedVessel && prediction?.target_explanations?.[selectedVessel]
                  ? prediction.target_explanations[selectedVessel].top_risk_contributors
                  : prediction?.top_risk_contributors ?? []
              }
              protectiveFactors={
                selectedVessel && prediction?.target_explanations?.[selectedVessel]
                  ? prediction.target_explanations[selectedVessel].protective_factors
                  : prediction?.protective_factors ?? []
              }
              selectedVessel={selectedVessel}
            />
          )}

          {activeTab === 'performance' && <ModelPerformance metrics={metrics} />}

          {activeTab === 'physiology' && (
            <div className="clinical-card p-5 border-slate-800 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Patient Physiological & Diagnostic Parameters
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Synchronized multi-system clinical indicators used for current inference
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-400">
                  Pulse: {formData.PR} BPM • BP: {formData.BP} mmHg
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Age & Sex</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {formData.Age} yrs ({formData.Sex})
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">BMI & Obesity</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {formData.BMI || (formData.Weight / Math.pow(formData.Length / 100, 2)).toFixed(1)}{' '}
                    kg/m²
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">LDL / HDL Ratio</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {(formData.LDL / formData.HDL).toFixed(2)} ({formData.LDL}/{formData.HDL})
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Triglycerides</span>
                  <span className="text-sm font-bold text-white font-mono">{formData.TG} mg/dL</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Fasting Blood Sugar</span>
                  <span className="text-sm font-bold text-white font-mono">{formData.FBS} mg/dL</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Ejection Fraction</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    {formData['EF-TTE']}%
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Wall Motion (RWMA)</span>
                  <span className="text-sm font-bold text-white font-mono">
                    Grade {formData['Region RWMA']}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ST Elevation</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      formData['St Elevation'] === '1' ? 'text-red-400' : 'text-slate-300'
                    }`}
                  >
                    {formData['St Elevation'] === '1' ? 'Present (1)' : 'Absent (0)'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ST Depression</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      formData['St Depression'] === '1' ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    {formData['St Depression'] === '1' ? 'Present (1)' : 'Absent (0)'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">T-Wave Inversion</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      formData.Tinversion === '1' ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    {formData.Tinversion === '1' ? 'Present (1)' : 'Absent (0)'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Chest Pain Type</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {formData['Typical Chest Pain'] === 'Y' ? 'Typical Angina' : 'Atypical / None'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Smoking Status</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {formData['Current Smoker'] === 'Y' ? 'Active Smoker' : 'Non-Smoker'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scenario' && (
            <CounterfactualLab
              baselinePatient={formData}
              onPredictionChange={setScenarioPrediction}
            />
          )}

          {activeTab === 'integrity' && (
            <ModelIntegrityPassport metadata={integrity} error={connectionError} />
          )}

          {activeTab === 'admin' && (
            <AdminPortal
              session={session}
              metrics={metrics}
              integrity={integrity}
              onOpenLogin={() => setIsAuthOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Footer with Legal & Compliance Navigation */}
      <footer className="border-t border-slate-800 bg-[#090f1d] py-4 px-4 lg:px-8 text-center text-xs text-slate-500 mt-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">CardioLens</span>
            <span>•</span>
            <span>Decision Support & Risk Visualization</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsSecurityAuditOpen(true)}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Security Audit
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            Demonstration cohort (N=303) • Zero target leakage • No persistent PHI
          </div>
        </div>
      </footer>

      {/* Security, Auth & Legal Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(newSession) => setSession(newSession)}
      />

      <SecurityAuditModal
        isOpen={isSecurityAuditOpen}
        onClose={() => setIsSecurityAuditOpen(false)}
      />

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
};

export default App;
