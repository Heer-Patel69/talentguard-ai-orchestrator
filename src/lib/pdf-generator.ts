import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CandidateReportData {
  candidateName: string;
  email: string;
  role: string;
  appliedDate: string;
  interviewDate?: string;
  experience?: string;
  finalScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  recommendation: 'shortlist' | 'reject' | 'hire';
  recommendationReason: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  roundScores: Array<{
    roundNumber: number;
    roundType: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
  }>;
  questionScores?: Array<{
    questionNumber: number;
    questionText: string;
    score: number;
    aiEvaluation: string;
  }>;
}

export function generateCandidateReportPDF(data: CandidateReportData): jsPDF {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // Helper to add page if needed
  const checkPageBreak = (needed: number) => {
    if (yPos + needed > 280) {
      pdf.addPage();
      yPos = 20;
    }
  };

  // Header
  pdf.setFillColor(34, 37, 49);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Candidate Evaluation Report', 20, 25);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  })}`, 20, 34);

  yPos = 55;
  pdf.setTextColor(0, 0, 0);

  // Candidate Info Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Candidate Information', 20, yPos);
  yPos += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const infoData = [
    ['Name', data.candidateName],
    ['Email', data.email],
    ['Position', data.role],
    ['Experience', data.experience || 'N/A'],
    ['Applied Date', data.appliedDate],
    ['Interview Date', data.interviewDate || 'N/A'],
  ];

  autoTable(pdf, {
    startY: yPos,
    head: [],
    body: infoData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 100 },
    },
    margin: { left: 20 },
  });

  yPos = (pdf as any).lastAutoTable.finalY + 15;

  // Score Summary
  checkPageBreak(60);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Score Summary', 20, yPos);
  yPos += 10;

  const recommendationColor = data.recommendation === 'hire' || data.recommendation === 'shortlist' 
    ? [22, 163, 74] : [220, 38, 38];

  autoTable(pdf, {
    startY: yPos,
    head: [['Metric', 'Score', 'Status']],
    body: [
      ['Final Score', `${data.finalScore}%`, data.finalScore >= 70 ? 'Pass' : 'Below Threshold'],
      ['Technical', `${data.technicalScore}%`, data.technicalScore >= 60 ? 'Good' : 'Needs Improvement'],
      ['Communication', `${data.communicationScore}%`, data.communicationScore >= 60 ? 'Good' : 'Needs Improvement'],
      ['Problem Solving', `${data.problemSolvingScore}%`, data.problemSolvingScore >= 60 ? 'Good' : 'Needs Improvement'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 37, 49] },
    styles: { fontSize: 10, cellPadding: 4 },
    margin: { left: 20, right: 20 },
  });

  yPos = (pdf as any).lastAutoTable.finalY + 15;

  // Recommendation
  checkPageBreak(40);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AI Recommendation', 20, yPos);
  yPos += 8;

  pdf.setFillColor(recommendationColor[0], recommendationColor[1], recommendationColor[2]);
  pdf.roundedRect(20, yPos, 50, 10, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.recommendation.toUpperCase(), 25, yPos + 7);
  
  yPos += 18;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  
  const reasonLines = pdf.splitTextToSize(data.recommendationReason, pageWidth - 40);
  pdf.text(reasonLines, 20, yPos);
  yPos += reasonLines.length * 5 + 15;

  // Strengths & Weaknesses
  checkPageBreak(80);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Strengths', 20, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  data.strengths.forEach((s) => {
    checkPageBreak(8);
    pdf.text(`• ${s}`, 25, yPos);
    yPos += 6;
  });

  yPos += 10;
  checkPageBreak(80);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Areas for Improvement', 20, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  data.weaknesses.forEach((w) => {
    checkPageBreak(8);
    pdf.text(`• ${w}`, 25, yPos);
    yPos += 6;
  });

  // Round Scores
  if (data.roundScores.length > 0) {
    checkPageBreak(60);
    yPos += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Round Performance', 20, yPos);
    yPos += 10;

    autoTable(pdf, {
      startY: yPos,
      head: [['Round', 'Type', 'Score', 'Key Strengths']],
      body: data.roundScores.map((r) => [
        `Round ${r.roundNumber}`,
        r.roundType,
        `${r.score}%`,
        r.strengths.slice(0, 2).join('; '),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [34, 37, 49] },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 20, right: 20 },
    });

    yPos = (pdf as any).lastAutoTable.finalY + 15;
  }

  // Question Details (if provided)
  if (data.questionScores && data.questionScores.length > 0) {
    checkPageBreak(60);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Question Analysis', 20, yPos);
    yPos += 10;

    autoTable(pdf, {
      startY: yPos,
      head: [['Q#', 'Question', 'Score', 'AI Evaluation']],
      body: data.questionScores.map((q) => [
        `Q${q.questionNumber}`,
        q.questionText.length > 40 ? q.questionText.substring(0, 40) + '...' : q.questionText,
        `${q.score}%`,
        q.aiEvaluation.length > 50 ? q.aiEvaluation.substring(0, 50) + '...' : q.aiEvaluation,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [34, 37, 49] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { cellWidth: 20 },
        3: { cellWidth: 80 },
      },
      margin: { left: 20, right: 20 },
    });
  }

  // Footer on all pages
  const pageCount = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `HireMinds AI - Confidential | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  return pdf;
}

export function downloadCandidateReport(data: CandidateReportData, filename?: string) {
  const pdf = generateCandidateReportPDF(data);
  const name = filename || `${data.candidateName.replace(/\s+/g, '_')}_report.pdf`;
  pdf.save(name);
}
