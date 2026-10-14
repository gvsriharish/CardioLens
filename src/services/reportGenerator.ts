import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PatientData, PredictionResponse, MetricsResponse } from '../types';

export function exportPatientReportPDF({
  patient,
  prediction,
  metrics,
  selectedVessel,
}: {
  patient: PatientData;
  prediction: PredictionResponse | null;
  metrics: MetricsResponse | null;
  selectedVessel: string | null;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 16;

  // Header Banner Background
  doc.setFillColor(11, 20, 38); // Deep clinical slate
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(6, 182, 212); // Cyan 500
  doc.rect(0, 27, pageWidth, 1.2, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CardioLens | Cardiovascular Risk & XAI Report', margin, 13);

  // Subtitle & Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  const reportDate = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(
    `Explainable Decision-Support Assessment • Generated: ${reportDate} • Prototype Model: 5-Fold Stratified Ensemble`,
    margin,
    20
  );

  currentY = 34;

  // Patient Clinical Demographics & Physical Markers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('1. Patient Profile & Clinical Features', margin, currentY);
  currentY += 4;

  const bmi =
    patient.BMI ||
    Number((patient.Weight / Math.pow(patient.Length / 100, 2)).toFixed(1));

  const patientDetails = [
    [
      'Age', `${patient.Age} years`,
      'Biological Sex', `${patient.Sex}`,
      'BMI & Obesity', `${bmi} kg/m² (${patient.Obesity === 'Y' ? 'Obese' : 'Non-obese'})`
    ],
    [
      'Resting Blood Pressure', `${patient.BP} mmHg`,
      'Pulse Rate', `${patient.PR} bpm`,
      'Smoking Status', `${patient['Current Smoker'] === 'Y' ? 'Active Smoker' : patient['EX-Smoker'] === 'Y' ? 'Ex-Smoker' : 'Non-Smoker'}`
    ],
    [
      'Diabetes Mellitus', `${patient.DM === 'Y' ? 'Yes' : 'No'}`,
      'Hypertension History', `${patient.HTN === 'Y' ? 'Yes' : 'No'}`,
      'Family CAD History', `${patient.FH === 'Y' ? 'Yes' : 'No'}`
    ],
    [
      'Chest Pain Type', `${patient['Typical Chest Pain'] === 'Y' ? 'Typical Angina' : patient.Atypical === 'Y' ? 'Atypical' : 'Non-anginal / None'}`,
      'Exertional Dyspnea', `${patient.Dyspnea === 'Y' ? 'Present' : 'Absent'}`,
      'Peripheral Edema', `${patient.Edema === '1' ? 'Present' : 'Absent'}`
    ],
    [
      'LDL / HDL Ratio', `${(patient.LDL / patient.HDL).toFixed(2)} (${patient.LDL} / ${patient.HDL} mg/dL)`,
      'Triglycerides', `${patient.TG} mg/dL`,
      'Fasting Blood Sugar', `${patient.FBS} mg/dL`
    ],
    [
      'Ejection Fraction (EF)', `${patient['EF-TTE']}%`,
      'Wall Motion (RWMA)', `Grade ${patient['Region RWMA']}`,
      'ECG ST Segment', `${patient['St Elevation'] === '1' ? 'ST Elevation' : patient['St Depression'] === '1' ? 'ST Depression' : 'Normal / Isoelectric'}`
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    body: patientDetails,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 32 },
      1: { cellWidth: 30 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 32 },
      3: { cellWidth: 30 },
      4: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 32 },
      5: { cellWidth: 26 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 2. Risk Estimation Summary & Vessel Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Multi-Target Cardiovascular Risk Assessment', margin, currentY);
  currentY += 4;

  if (prediction) {
    const vesselRows = [
      [
        'Overall Composite Risk',
        `${(prediction.overall_risk * 100).toFixed(1)}%`,
        prediction.risk_level.toUpperCase(),
        'Weighted multi-target coronary aggregation (35% CAD + 30% LAD + 15% LCX + 20% RCA)',
      ],
      [
        'CAD (Coronary Artery Disease)',
        prediction.vessels.CAD?.percentage || `${(prediction.cad_probability * 100).toFixed(1)}%`,
        prediction.vessels.CAD?.risk_level || 'N/A',
        'Global epicardial obstructive stenosis probability (>=50% luminal narrowing)',
      ],
      [
        'LAD (Left Anterior Descending)',
        prediction.vessels.LAD?.percentage || `${(prediction.lad_probability * 100).toFixed(1)}%`,
        prediction.vessels.LAD?.risk_level || 'N/A',
        'Anterior myocardium, apex, and anterior 2/3 of interventricular septum ("widow-maker")',
      ],
      [
        'LCX (Left Circumflex Artery)',
        prediction.vessels.LCX?.percentage || `${(prediction.lcx_probability * 100).toFixed(1)}%`,
        prediction.vessels.LCX?.risk_level || 'N/A',
        'Left atrioventricular sulcus, lateral wall, and obtuse marginal branches',
      ],
      [
        'RCA (Right Coronary Artery)',
        prediction.vessels.RCA?.percentage || `${(prediction.rca_probability * 100).toFixed(1)}%`,
        prediction.vessels.RCA?.risk_level || 'N/A',
        'Right ventricle, diaphragmatic/inferior LV wall, and cardiac conduction system',
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Target Vessel Territory', 'Probability', 'Risk Category', 'Anatomical / Clinical Scope']],
      body: vesselRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
        cellPadding: 2.2,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { fontStyle: 'bold', halign: 'center', cellWidth: 24 },
        2: { fontStyle: 'bold', halign: 'center', cellWidth: 28 },
        3: { cellWidth: 80 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const val = String(data.cell.raw).toLowerCase();
          if (val.includes('very high')) {
            data.cell.styles.textColor = [220, 38, 38]; // Red
          } else if (val.includes('high')) {
            data.cell.styles.textColor = [234, 88, 12]; // Orange
          } else if (val.includes('moderate')) {
            data.cell.styles.textColor = [217, 119, 6]; // Amber
          } else {
            data.cell.styles.textColor = [16, 185, 129]; // Green
          }
        }
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check if we need a page break before XAI
  if (currentY > pageHeight - 85) {
    doc.addPage();
    currentY = 20;
  }

  // 3. Explainable AI (XAI) Attribution Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const xaiHeaderTarget = selectedVessel ? ` (${selectedVessel} Vessel Focus)` : ' (Global CAD)';
  doc.text(`3. Explainable AI (XAI) Feature Attribution${xaiHeaderTarget}`, margin, currentY);
  currentY += 4;

  const activeTargetExplanations =
    selectedVessel && prediction?.target_explanations?.[selectedVessel]
      ? prediction.target_explanations[selectedVessel]
      : {
          top_risk_contributors: prediction?.top_risk_contributors || [],
          protective_factors: prediction?.protective_factors || [],
        };

  // Top Risk Factors
  const riskRows = activeTargetExplanations.top_risk_contributors.slice(0, 6).map((item) => [
    item.label,
    String(item.value),
    `+${item.contribution.toFixed(3)}`,
    item.impact_magnitude,
    item.clinical_note,
  ]);

  if (riskRows.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28); // Red 700
    doc.text('Key Adverse Risk Drivers (Factors Increasing Risk)', margin, currentY);
    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      head: [['Clinical Factor', 'Patient Value', 'Weight (+)', 'Impact', 'Pathophysiological / Clinical Rationale']],
      body: riskRows,
      theme: 'grid',
      headStyles: {
        fillColor: [127, 29, 29], // Dark Red
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        cellPadding: 2,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        lineColor: [254, 226, 226],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 42 },
        1: { halign: 'center', cellWidth: 26 },
        2: { fontStyle: 'bold', textColor: [220, 38, 38], halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 18 },
        4: { cellWidth: 76 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // Protective Factors
  const protRows = activeTargetExplanations.protective_factors.slice(0, 5).map((item) => [
    item.label,
    String(item.value),
    `${item.contribution.toFixed(3)}`,
    item.impact_magnitude,
    item.clinical_note,
  ]);

  if (protRows.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(4, 120, 87); // Emerald 700
    doc.text('Cardioprotective / Mitigating Indicators', margin, currentY);
    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      head: [['Clinical Factor', 'Patient Value', 'Weight (-)', 'Impact', 'Protective / Physiological Rationale']],
      body: protRows,
      theme: 'grid',
      headStyles: {
        fillColor: [6, 78, 59], // Dark Green
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        cellPadding: 2,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        lineColor: [209, 250, 229],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 42 },
        1: { halign: 'center', cellWidth: 26 },
        2: { fontStyle: 'bold', textColor: [16, 185, 129], halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 18 },
        4: { cellWidth: 76 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 4. Model Provenance & Cross-Validation Audit
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Model Verification & Integrity Passport', margin, currentY);
  currentY += 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const auditText = [
    `• Dataset Provenance: Z-Alizadeh Sani synthetic demonstration cohort (N = 303 records, 78 encoded features).`,
    `• Zero Target-Leakage Guarantee: Outcome targets (CAD, Cath, LAD, LCX, RCA) strictly excluded from all predictor inputs.`,
    `• Model Selection: Stratified 5-Fold Cross Validation evaluated Random Forest, HistGradientBoosting, and Logistic Regression.`,
    `• Benchmarks: CAD F1 = 0.847 (Random Forest) | LAD F1 = 0.786 (LogReg) | LCX F1 = 0.617 (LogReg) | RCA F1 = 0.608 (LogReg).`,
  ];
  auditText.forEach((line) => {
    doc.text(line, margin, currentY);
    currentY += 3.8;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    // Disclaimer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Medical Disclaimer: Educational and research decision-support prototype only. Predictions are statistical estimates, not a formal diagnosis.',
      margin,
      pageHeight - 9.5
    );
    doc.text(
      'Does not localize anatomical lesions or replace clinical diagnostic imaging. Consult qualified healthcare professionals.',
      margin,
      pageHeight - 6.5
    );

    // Page Number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 8);
  }

  // Save the PDF
  const filename = `CardioLens_Risk_Report_${patient.Age}yo_${patient.Sex}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
