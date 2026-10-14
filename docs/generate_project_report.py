"""Generate a short, data-driven CardioLens project report."""
import json
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "deliverables" / "technical_report.pdf"
metrics = json.loads((ROOT / "models" / "metrics.json").read_text(encoding="utf-8"))
manifest = json.loads((ROOT / "data" / "manifest.json").read_text(encoding="utf-8"))
NAVY, CYAN = colors.HexColor("#0B1425"), colors.HexColor("#087F9C")
PALE, MUTED = colors.HexColor("#EAF3F7"), colors.HexColor("#536273")
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=25, leading=30, textColor=NAVY, alignment=TA_LEFT, spaceAfter=12))
styles.add(ParagraphStyle(name="Deck", parent=styles["Normal"], fontSize=11, leading=16, textColor=MUTED, spaceAfter=12))
styles.add(ParagraphStyle(name="Section", parent=styles["Heading2"], fontSize=15, leading=19, textColor=CYAN, spaceBefore=8, spaceAfter=7))
styles.add(ParagraphStyle(name="Sub", parent=styles["Heading3"], fontSize=10.5, leading=13, textColor=NAVY, spaceBefore=5, spaceAfter=4))
styles.add(ParagraphStyle(name="BodySmall", parent=styles["BodyText"], fontSize=8.8, leading=12.2, textColor=colors.HexColor("#263445"), spaceAfter=6))
styles.add(ParagraphStyle(name="Tiny", parent=styles["BodyText"], fontSize=7.5, leading=10, textColor=MUTED))
styles.add(ParagraphStyle(name="Callout", parent=styles["BodyText"], fontSize=9.2, leading=13, textColor=NAVY, backColor=PALE, borderPadding=8, spaceBefore=5, spaceAfter=8))
def p(text, style="BodySmall"): return Paragraph(text, styles[style])
def bullet(text): return Paragraph("&bull;&nbsp; " + text, styles["BodySmall"])
def draw_page(canvas, doc):
    canvas.saveState(); w, h = letter
    canvas.setFillColor(NAVY); canvas.rect(0, h - 0.25 * inch, w, 0.25 * inch, stroke=0, fill=1)
    canvas.setStrokeColor(colors.HexColor("#D7E2E8")); canvas.line(0.55 * inch, 0.48 * inch, w - 0.55 * inch, 0.48 * inch)
    canvas.setFont("Helvetica", 7.5); canvas.setFillColor(MUTED)
    canvas.drawString(0.55 * inch, 0.3 * inch, "CardioLens | Synthetic-data research prototype | 2026-10-14")
    canvas.drawRightString(w - 0.55 * inch, 0.3 * inch, f"{doc.page}"); canvas.restoreState()
doc = SimpleDocTemplate(str(OUT), pagesize=letter, rightMargin=0.58 * inch, leftMargin=0.58 * inch, topMargin=0.55 * inch, bottomMargin=0.65 * inch, title="CardioLens Project Report", author="CardioLens Project")
story = []
story += [Spacer(1, 0.3 * inch), p("CARDIOVASCULAR RISK VISUALIZATION &amp; PREDICTION", "Tiny"), p("CardioLens", "CoverTitle"), p("Trust-aware, vessel-level visualization for a multimodal AI hackathon prototype", "Deck")]
story += [p("Project summary", "Section"), p("CardioLens combines a React/TypeScript dashboard, FastAPI inference service, four scikit-learn binary classifiers, target-specific SHAP attributions, and a procedural Three.js coronary anatomy. Each model output maps to an entire named vessel; the application does not locate lesions or represent patient-specific imaging.")]
arch = [[p("INPUT", "Sub"), p("INFERENCE", "Sub"), p("OUTPUT", "Sub")], [p("Clinical form or synthetic example profile"), p("Validated FastAPI request to saved preprocessing and CAD/LAD/LCX/RCA model artifacts"), p("Four probabilities, per-target SHAP contributions, and evidence-status labels")], [p("Hypothetical copy in What-If Lab"), p("/scenario evaluates baseline and hypothetical inputs"), p("Four paired outputs, percentage-point differences, and updated 3D view")], [p("Generated data/model manifests"), p("/metadata and /metrics"), p("Integrity Passport with provenance, hashes, class counts, and metrics")]]
table = Table(arch, colWidths=[1.72 * inch, 2.75 * inch, 2.1 * inch], repeatRows=1)
table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), PALE), ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D3E0E7")), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7), ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
story += [p("System flow", "Section"), table, Spacer(1, 8), p("Safety statement", "Section"), p("Educational and research decision-support prototype only. Predictions are not a diagnosis, do not localize anatomical lesions, and are not a substitute for professional medical assessment or formal diagnostic imaging.", "Callout"), p("The repository directory did not contain Git metadata at report time. This report describes the working tree and current generated artifacts.", "Tiny"), PageBreak()]
story += [p("01 | DATA &amp; MODEL METHOD", "Tiny"), p("A reproducible pipeline with an explicit provenance boundary", "Section")]
story += [p(f"<b>Data status:</b> {manifest['provenance_status'].upper()} | <b>Rows:</b> {manifest['record_count']} | <b>Columns:</b> {manifest['column_count']} | <b>SHA-256:</b> {manifest['sha256'][:24]}...")]
story += [p("The bundled CSV is exactly reproduced by the workspace's seeded synthetic generator. It is not verified Z-Alizadeh Sani clinical data. No authentic-data training was performed. Target labels come from synthetic latent-score/quantile rules, not clinical adjudication.")]
story += [p("Training and evaluation", "Section"), bullet("Numerical median imputation/scaling and categorical mode imputation/one-hot encoding are fit separately inside each stratified CV training fold."), bullet("CAD, Cath, LAD, LCX, and RCA are excluded from model inputs; the API rejects unknown keys and invalid categories."), bullet("Random Forest, HistGradientBoosting, and Logistic Regression are compared per target; selection uses pooled out-of-fold F1."), bullet("The selected model and preprocessor are refit on all 303 synthetic rows for demo inference. There is no independent holdout cohort."), bullet("Metrics are selection-set estimates and can be optimistic; no external validation or calibration has been performed.")]
rows = [["Target", "Selected model", "Accuracy", "Precision", "Recall", "F1", "ROC-AUC", "Brier"]]
for target in ["CAD", "LAD", "LCX", "RCA"]:
    item = metrics["target_metrics"][target]
    rows.append([target, item["model"], f"{item['accuracy']:.3f}", f"{item['precision']:.3f}", f"{item['recall']:.3f}", f"{item['f1']:.3f}", f"{item['roc_auc']:.3f}", f"{item['brier_score']:.3f}"])
eval_table = Table(rows, colWidths=[0.55*inch, 1.65*inch, 0.72*inch, 0.72*inch, 0.65*inch, 0.55*inch, 0.72*inch, 0.56*inch], repeatRows=1)
eval_table.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), colors.white), ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"), ("FONTSIZE", (0,0), (-1,-1), 7.5), ("GRID", (0,0), (-1,-1), 0.35, colors.HexColor("#D3E0E7")), ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, PALE]), ("ALIGN", (2,1), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("LEFTPADDING", (0,0), (-1,-1), 5), ("RIGHTPADDING", (0,0), (-1,-1), 5), ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6)]))
story += [p("Pooled out-of-fold results", "Section"), eval_table, Spacer(1, 5), p("Brier scores are descriptive scores, not a calibration study. Confusion matrices, candidate metrics, prevalence, and support are available in the machine-readable metrics JSON.", "Tiny"), PageBreak()]
story += [p("02 | TRUSTMAP &amp; INTERACTION", "Tiny"), p("Make the evidence visible without overstating it", "Section")]
story += [p("The vessel cards and 3D scene consume the same active backend prediction response. Colors represent qualitative visualization bands; they are not diagnostic cutoffs or measured lumen narrowing. Vessel selection changes the focused detail and explanation target without changing inference results.")]
story += [p("Trust and evidence states", "Section"), bullet("Dataset provenance: synthetic generator match; record count, hash, target counts, leakage exclusions, and training method are read from generated artifacts."), bullet("Calibration: not evaluated. The displayed probabilities have not been shown to be calibrated."), bullet("Out-of-distribution: not evaluated. No applicability-domain detector or reliability interval is available."), bullet("Data quality: request schema validation is applied, but source validity and per-measurement quality are not verified. Form defaults do not preserve missingness."), bullet("Anatomy: procedural whole-vessel geometry only; no patient-specific image, plaque coordinates, lesion length, or exact narrowing is represented.")]
story += [p("What-If Scenario Lab", "Section"), p("The lab preserves the visible baseline profile and edits a separate hypothetical copy for LDL, systolic blood pressure, and ejection fraction. The /scenario endpoint calls the same active backend model on both profiles, returns all four outputs plus percentage-point deltas, and the hypothetical result drives the 3D view. Differences are not causal effects, treatment estimates, or recommendations.")]
story += [p("Explainability", "Section"), p("Each target has its own SHAP attribution against a deterministic synthetic-cohort reference subset. Attribution units depend on the estimator output and do not establish medical causation. Explanation failures return an explicit unavailable response rather than invented values.")]
story += [p("Interaction verification", "Section"), p("Frontend production compilation and backend in-process API tests passed. No browser walkthrough, WebGL/device compatibility check, accessibility review, or demo video was performed during this audit.", "Callout"), PageBreak()]
story += [p("03 | VERIFICATION &amp; NEXT STEPS", "Tiny"), p("A working demo, with clinical validation still ahead", "Section")]
story += [p("Verification performed in this workspace", "Sub"), bullet("The saved artifacts were not retrained or replaced. Manifest SHA-256 checks match the bundled model files; model/data provenance metadata links the artifacts to the synthetic cohort, but it is unsigned and not independent proof of historical training."), bullet("Backend tests: 16 passed, including all-target SHAP response checks and an unavailable-response test for injected SHAP failure; one Starlette/AnyIO deprecation warning."), bullet("Frontend production build: TypeScript and Vite passed; minified JS is 800.95 kB (213.87 kB gzip), above Vite's 500 kB advisory."), bullet("TestClient API integration exercises health, metrics, metadata, all four outputs, explanations, scenarios, batch bounds, validation errors, and model-unavailable behavior. Live loopback HTTP and browser checks remain unverified."), bullet("No clinical evaluation, independent test set, calibration, external cohort, frontend E2E, accessibility review, or video recording was performed; no Git metadata was present.")]
story += [p("Before any stronger claim", "Section"), bullet("Obtain a verifiable, licensed clinical benchmark and document source, version, access terms, schema, and target meanings."), bullet("Review predictor timing and derived/post-diagnosis fields with an authentic data dictionary; preserve an untouched test set."), bullet("Evaluate the locked models externally, report uncertainty intervals where justified, and assess calibration before describing probabilities as risk."), bullet("Add validated OOD/data-quality monitoring and explicit missingness handling if the intended application requires them."), bullet("Add frontend unit and browser E2E tests; measure rendering/build performance on target laptops."), bullet("Record a demo only after reviewing synthetic-data and safety labels; no recording is claimed here.")]
story += [Spacer(1, 8), p("Current deliverable status", "Section")]
status = [[p("Built and verified", "Sub"), p("Partial / not available", "Sub")], [p("Four saved demo models and metrics; leakage exclusions; target-specific SHAP; local API integration; 3D vessel mapping; API-backed what-if comparison; provenance passport; backend tests and production build."), p("Authentic-data training, independent holdout/external validation, calibration, uncertainty intervals, OOD detection, clinical measurement quality review, browser E2E, accessibility review, recording, Git diff/commit.")]]
status_table = Table(status, colWidths=[3.35*inch, 3.35*inch])
status_table.setStyle(TableStyle([("BACKGROUND", (0,0), (0,0), colors.HexColor("#D9F0E3")), ("BACKGROUND", (1,0), (1,0), colors.HexColor("#FFF0D6")), ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#D3E0E7")), ("VALIGN", (0,0), (-1,-1), "TOP"), ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"), ("FONTSIZE", (0,0), (-1,-1), 8), ("LEADING", (0,1), (-1,1), 11), ("LEFTPADDING", (0,0), (-1,-1), 8), ("RIGHTPADDING", (0,0), (-1,-1), 8), ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7)]))
story += [status_table, Spacer(1, 12), p("All measured model results in this report are synthetic-data demonstrations. The application must not be used to diagnose, triage, or guide treatment.", "Callout")]
OUT.parent.mkdir(parents=True, exist_ok=True)
doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
print(OUT)
