import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssessmentResult } from '../types';
import { MOFASS_CATEGORIES } from '../data/mofassQuestions';
import { ensureCompleteAssessment } from './mlEngine';

export function generateProfessionalPDF(rawAssessment: AssessmentResult): void {
  const assessment = ensureCompleteAssessment(rawAssessment);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Corporate Color Palette
  const primaryDark = [15, 23, 42];     // Slate 900
  const primaryNavy = [30, 27, 75];     // Indigo 950
  const accentIndigo = [79, 70, 229];   // Indigo 600
  const accentTeal = [13, 148, 136];    // Teal 600
  const accentEmerald = [16, 185, 129]; // Emerald 500
  const accentAmber = [217, 119, 6];    // Amber 600
  const accentRose = [225, 29, 72];     // Rose 600
  const neutralGray = [100, 116, 139];  // Slate 500
  const bgLight = [248, 250, 252];      // Slate 50

  const company = assessment.companyProfile;
  const user = assessment.userProfile;
  const createdDate = new Date(assessment.createdAt).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Helper for running header and footer
  const addHeaderFooter = (pageNumber: number, totalPages: number) => {
    // Top banner line
    doc.setDrawColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, 12, pageWidth - margin, 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.text('MOFASS PMKS • LAPORAN AUDIT & PELAN TINDAKAN STRATEGIK', margin, 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
    doc.text(assessment.id, pageWidth - margin, 9, { align: 'right' });

    // Bottom banner line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFontSize(8);
    doc.text(
      `Syarikat: ${company.companyName} | Tarikh: ${createdDate}`,
      margin,
      pageHeight - 7
    );
    doc.text(
      `Muka Surat ${pageNumber} daripada ${totalPages}`,
      pageWidth - margin,
      pageHeight - 7,
      { align: 'right' }
    );
  };

  // =========================================================================
  // PAGE 1: EXECUTIVE PRESENTATION COVER
  // =========================================================================
  // Dark Navy Top Band
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, pageWidth, 78, 'F');

  // Decorative Accent Bar
  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.rect(0, 75, pageWidth, 3, 'F');

  // Badge M6 Logo
  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.roundedRect(margin, 16, 16, 16, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('M6', margin + 8, 27, { align: 'center' });

  // Document Title Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('STANDAR AUDIT DIAGNOSTIK KEBANGSAAN PMKS MALAYSIA', margin + 22, 21);

  doc.setFontSize(16);
  doc.text('LAPORAN PRESTASI & PELAN TINDAKAN STRATEGIK', margin + 22, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text('Kerangka Penilaian Kompetensi MOFASS: Marketing, Operation, Finance, Administration, Sales, System', margin + 22, 34);

  // Reference and Date in Cover Header
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`ID Audit: ${assessment.id}   |   Tarikh: ${createdDate}`, margin + 22, 41);

  // Business Profile Info Card
  let curY = 88;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, contentWidth, 54, 4, 4, 'FD');

  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('MAKLUMAT ENTITI PERNIAGAAN TERPILIH', margin + 6, curY + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);

  // Col 1
  doc.text('Nama Syarikat:', margin + 6, curY + 18);
  doc.text('No. Pendaftaran SSM:', margin + 6, curY + 25);
  doc.text('Sektor Industri:', margin + 6, curY + 32);
  doc.text('Saiz Perniagaan:', margin + 6, curY + 39);
  doc.text('Lokasi Premis / Negeri:', margin + 6, curY + 46);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(company.companyName, margin + 46, curY + 18);
  doc.text(company.ssmNumber, margin + 46, curY + 25);
  doc.text(company.sector, margin + 46, curY + 32);
  doc.text(company.businessSize, margin + 46, curY + 39);
  doc.text(company.state, margin + 46, curY + 46);

  // Col 2
  const col2X = margin + 105;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  doc.text('Tempoh Beroperasi:', col2X, curY + 18);
  doc.text('Perolehan Tahunan:', col2X, curY + 25);
  doc.text('Jumlah Tenaga Kerja:', col2X, curY + 32);
  doc.text('Pegawai Responden:', col2X, curY + 39);
  doc.text('Jawatan Responden:', col2X, curY + 46);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(`${company.yearsInOperation} Tahun`, col2X + 38, curY + 18);
  doc.text(company.annualTurnover, col2X + 38, curY + 25);
  doc.text(`${company.employeeCount} Pekerja Sepenuh Masa`, col2X + 38, curY + 32);
  doc.text(user.fullName, col2X + 38, curY + 39);
  doc.text(user.role || 'Pengarah Urusan', col2X + 38, curY + 46);

  // Score Banner & Maturity Card
  curY = 150;
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.roundedRect(margin, curY, contentWidth, 58, 4, 4, 'F');

  doc.setTextColor(224, 231, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('KEPUTUSAN PENILAIAN TAHAP KOMPETENSI (MATURITY LEVEL)', margin + 8, curY + 11);

  // Huge Score Number
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${assessment.overallPercentage}%`, margin + 8, curY + 28);

  doc.setFontSize(10);
  doc.setTextColor(199, 210, 254);
  doc.text(`${assessment.totalScore} / 300 Jumlah Mata Diperoleh`, margin + 8, curY + 36);

  // Maturity Badge Box
  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.roundedRect(margin + 75, curY + 8, contentWidth - 83, 42, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(assessment.maturityTitle, margin + 81, curY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(224, 231, 255);
  const maturityLines = doc.splitTextToSize(assessment.maturityDescription, contentWidth - 95);
  doc.text(maturityLines, margin + 81, curY + 25);

  // Table of 6 Elements Snapshot on Page 1
  curY = 216;
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('RINGKASAN SKOR 6 ELEMEN TERAS MOFASS', margin, curY);

  const snapshotRows = MOFASS_CATEGORIES.map((c) => {
    const sc = assessment.categoryScores[c.id];
    return [
      c.code,
      c.name,
      `${sc?.score || 0} / 50`,
      `${sc?.percentage || 0}%`,
      sc?.status || 'Kritikal'
    ];
  });

  autoTable(doc, {
    startY: curY + 3,
    head: [['KOD', 'DIMENSI MOFASS', 'SKOR MATA', 'PERATUSAN', 'STATUS PRESTASI']],
    body: snapshotRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: primaryDark as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 24, fontStyle: 'bold', halign: 'center' },
      4: { cellWidth: 46, fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });

  // =========================================================================
  // PAGE 2: RINGKASAN EKSEKUTIF & INDEKS DIAGNOSTIK
  // =========================================================================
  doc.addPage();
  curY = 20;

  // Title: Bahagian 1
  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.rect(margin, curY, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('1.0 RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)', margin + 6, curY + 5.5);

  curY += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);

  const execSummaryLines = doc.splitTextToSize(assessment.aiExecutiveSummary, contentWidth);
  doc.text(execSummaryLines, margin, curY);
  curY += (execSummaryLines.length * 4.4) + 12;

  // Highlights Card on Page 2
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, contentWidth, 70, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('1.1 RUMUSAN INDEKS KESIHATAN & KEDUDUKAN STRATEGIK PMKS', margin + 6, curY + 9);

  const hlColW = (contentWidth - 16) / 3;

  // Col 1: Maturity
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 4, curY + 14, hlColW, 48, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.text('TAHAP KEMATANGAN', margin + 8, curY + 22);
  doc.setFontSize(14);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(assessment.maturityLevel, margin + 8, curY + 31);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  const matShort = doc.splitTextToSize(assessment.maturityTitle.split('(')[0], hlColW - 8);
  doc.text(matShort, margin + 8, curY + 38);

  // Col 2: Score vs Benchmark
  const scoreCol2X = margin + 4 + hlColW + 4;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(scoreCol2X, curY + 14, hlColW, 48, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(accentTeal[0], accentTeal[1], accentTeal[2]);
  doc.text('INDEKS SKOR PURATA', scoreCol2X + 4, curY + 22);
  doc.setFontSize(14);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(`${assessment.overallPercentage}%`, scoreCol2X + 4, curY + 31);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  doc.text('Penanda Aras PMKS: 56%', scoreCol2X + 4, curY + 38);
  const diffBM = assessment.overallPercentage - 56;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(diffBM >= 0 ? accentEmerald[0] : accentRose[0], diffBM >= 0 ? accentEmerald[1] : accentRose[1], diffBM >= 0 ? accentEmerald[2] : accentRose[2]);
  doc.text(diffBM >= 0 ? `+${diffBM}% Lebih Baik` : `${diffBM}% Di Bawah`, scoreCol2X + 4, curY + 45);

  // Col 3: Primary Priority
  const scoreCol3X = scoreCol2X + hlColW + 4;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(scoreCol3X, curY + 14, hlColW, 48, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(accentRose[0], accentRose[1], accentRose[2]);
  doc.text('KEUTAMAAN SEGERA', scoreCol3X + 4, curY + 22);

  const sortedScores = Object.values(assessment.categoryScores).sort((a, b) => a.percentage - b.percentage);
  const lowest = sortedScores[0];

  doc.setFontSize(11);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(lowest ? lowest.categoryName.split('(')[0] : 'Operasi', scoreCol3X + 4, curY + 31);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  doc.text(`Skor Terendah: ${lowest ? lowest.percentage : 40}%`, scoreCol3X + 4, curY + 38);
  doc.text('Memerlukan Pelan Tindakan Segera', scoreCol3X + 4, curY + 45);

  // =========================================================================
  // PAGE 3: PENDAHULUAN & LANDSKAP INDUSTRI (DEDICATED FULL PAGE)
  // =========================================================================
  doc.addPage();
  curY = 20;

  // Title: Bahagian 2
  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.rect(margin, curY, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(`2.0 PENDAHULUAN & LANDSKAP INDUSTRI: ${company.sector.toUpperCase()}`, margin + 6, curY + 5.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  const stageDesc = company.yearsInOperation >= 10 ? 'Fasa Pemantapan Legasi & IR4.0' : company.yearsInOperation >= 6 ? 'Fasa Kematangan & Penskalaan' : company.yearsInOperation >= 3 ? 'Fasa Pengukuhan Sistem' : 'Fasa Permulaan & Pembinaan Pasaran';
  doc.text(`Tempoh Beroperasi: ${company.yearsInOperation} Tahun (${stageDesc}) • Ulasan Pasaran Dikuasakan oleh Gemini AI`, margin + 6, curY + 10.5);

  curY += 15;

  // Box 2.1: Macro Overview & Stage Analysis
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, contentWidth, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.text(`2.1 Gambaran Makro & Analisis Fasa Operasi (${company.yearsInOperation} Tahun Beroperasi):`, margin + 5, curY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  const rawOverview = assessment.industryLandscape?.stageAnalysis
    ? `${assessment.industryLandscape.sectorOverview.split('.')[0]}. ${assessment.industryLandscape.stageAnalysis}`
    : (assessment.industryLandscape?.sectorOverview || 'Sektor PMKS di Malaysia memainkan peranan penting dalam memacu ekonomi domestik dan rantaian bekalan.');
  const sectorOverviewLines = doc.splitTextToSize(rawOverview, contentWidth - 10);
  doc.text(sectorOverviewLines.slice(0, 5), margin + 5, curY + 12);

  curY += 43;

  // Two columns for Trends & Challenges
  const halfColWidth = (contentWidth - 6) / 2;
  const boxHeight = 56;

  // Box 1: Trends
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, halfColWidth, boxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.text('Trend Pasaran Semasa di Malaysia:', margin + 4, curY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  let trendY = curY + 13;
  const activeTrends = (assessment.industryLandscape?.marketTrends && assessment.industryLandscape.marketTrends.length > 0)
    ? assessment.industryLandscape.marketTrends
    : [
        'Peningkatan kebergantungan kepada platform transaksi digital, CRM awan, dan automasi proses kerja.',
        'Peralihan perbelanjaan korporat & pengguna kepada tawaran nilai telus dan kepuasan masa nyata.',
        'Penekanan ketat kepada pematuhan mandat e-Invois LHDN dan integriti aliran rekod inventori.'
      ];
  activeTrends.slice(0, 3).forEach((t) => {
    const lines = doc.splitTextToSize(`• ${t}`, halfColWidth - 8);
    doc.text(lines, margin + 4, trendY);
    trendY += (lines.length * 3.6) + 2;
  });

  // Box 2: Challenges
  const box2X = margin + halfColWidth + 6;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(box2X, curY, halfColWidth, boxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(accentRose[0], accentRose[1], accentRose[2]);
  doc.text('Cabaran Utama Pemain Industri:', box2X + 4, curY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  let chalY = curY + 13;
  const activeChallenges = (assessment.industryLandscape?.keyChallenges && assessment.industryLandscape.keyChallenges.length > 0)
    ? assessment.industryLandscape.keyChallenges
    : [
        'Kenaikan kos overhed buruh, kenaikan kadar sewa premis, dan ketidaktentuan harga input bahan.',
        'Kekangan aliran tunai pusingan berpunca daripada tempoh kutipan kredit penghutang yang panjang (>45 hari).',
        'Kesukaran menarik dan mengekalkan bakat berkemahiran teknikal serta ketiadaan SOP bertulis.'
      ];
  activeChallenges.slice(0, 3).forEach((c) => {
    const lines = doc.splitTextToSize(`• ${c}`, halfColWidth - 8);
    doc.text(lines, box2X + 4, chalY);
    chalY += (lines.length * 3.6) + 2;
  });

  curY += boxHeight + 6;

  // Box 3: Government Support policies Box
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, curY, contentWidth, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(accentTeal[0], accentTeal[1], accentTeal[2]);
  doc.text('Sokongan Dasar Kerajaan & Peluang Pertumbuhan PMKS:', margin + 4, curY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  let govY = curY + 13;
  const activePolicies = (assessment.industryLandscape?.governmentPolicySupport && assessment.industryLandscape.governmentPolicySupport.length > 0)
    ? assessment.industryLandscape.governmentPolicySupport
    : [
        'Pelan Induk PKS (SME Masterplan) dan Dasar Keusahawanan Nasional (DKN 2030).',
        'Inisiatif automasi & pendigitalan pintar PMKS diterajui SME Corp, MDEC, dan KUSKOP.',
        'Skim Jaminan Modal Kerja (WCS) oleh Syarikat Jaminan Pembiayaan Perniagaan (SJPP).'
      ];
  activePolicies.slice(0, 3).forEach((g) => {
    const lines = doc.splitTextToSize(`✓ ${g}`, contentWidth - 8);
    doc.text(lines, margin + 4, govY);
    govY += (lines.length * 3.6) + 1.5;
  });

  curY += 44;

  // Box 4: Strategic Growth Drivers
  doc.setFillColor(240, 249, 255); // Sky 50
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margin, curY, contentWidth, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.text('Faktor Pemangkin Pertumbuhan Strategik Sektor (Growth Drivers):', margin + 4, curY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  let gdY = curY + 13;
  const activeGrowthDrivers = (assessment.industryLandscape?.growthDrivers && assessment.industryLandscape.growthDrivers.length > 0)
    ? assessment.industryLandscape.growthDrivers
    : [
        'Peluasan kontrak korporat dan perkongsian penyelesaian integrasi bersama syarikat berkaitan kerajaan (GLC).',
        'Potensi penskalaan perniagaan rentas sempadan ke pasaran serantau ASEAN (Indonesia, Filipina, Vietnam).',
        'Automasi proses berulang yang mengurangkan kos operasi seunit sebanyak 15% hingga 25%.'
      ];
  activeGrowthDrivers.slice(0, 3).forEach((gd) => {
    const lines = doc.splitTextToSize(`★ ${gd}`, contentWidth - 8);
    doc.text(lines, margin + 4, gdY);
    gdY += (lines.length * 3.6) + 1.5;
  });

  // =========================================================================
  // PAGE 4: ANALISIS KEPUTUSAN TERPERINCI SETIAP ELEMEN MOFASS
  // =========================================================================
  doc.addPage();
  curY = 20;

  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.rect(margin, curY, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('3.0 ANALISIS KEPUTUSAN SETIAP ELEMEN MOFASS (BAHAGIAN 1/2)', margin + 6, curY + 5.5);

  curY += 12;

  // Print first 3 categories: M, O, F
  ['M', 'O', 'F'].forEach((catId) => {
    const cat = MOFASS_CATEGORIES.find((c) => c.id === catId)!;
    const sc = assessment.categoryScores[cat.id];
    const deep = assessment.elementDeepAnalyses?.[cat.id];

    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, curY, contentWidth, 72, 3, 3, 'FD');

    // Header bar
    doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.roundedRect(margin, curY, contentWidth, 8, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`${cat.code} - ${cat.name.toUpperCase()}`, margin + 4, curY + 5.5);
    doc.text(`Skor: ${sc?.percentage}% (${sc?.score}/50) | Status: ${sc?.status}`, pageWidth - margin - 4, curY + 5.5, { align: 'right' });

    // Body
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const diagLines = doc.splitTextToSize(`Huraian: ${deep?.narrativeDiagnosis || ''}`, contentWidth - 8);
    doc.text(diagLines, margin + 4, curY + 14);

    let secSubY = curY + 14 + (diagLines.length * 3.5) + 3;

    // Strengths
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentTeal[0], accentTeal[1], accentTeal[2]);
    doc.text('Kekuatan Utama:', margin + 4, secSubY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    sc?.keyStrengths.slice(0, 2).forEach((s) => {
      secSubY += 3.8;
      doc.text(`• ${s}`, margin + 6, secSubY);
    });

    secSubY += 5;
    // Gaps
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentRose[0], accentRose[1], accentRose[2]);
    doc.text('Jurang Pembaikan & Punca Asas:', margin + 4, secSubY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    sc?.keyGaps.slice(0, 2).forEach((g) => {
      secSubY += 3.8;
      doc.text(`• ${g}`, margin + 6, secSubY);
    });

    secSubY += 5;
    // Prescription
    if (deep?.strategicPrescription) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
      doc.text('Preskripsi Tindakan:', margin + 4, secSubY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
      const prescLines = doc.splitTextToSize(deep.strategicPrescription, contentWidth - 42);
      doc.text(prescLines, margin + 35, secSubY);
    }

    curY += 78;
  });

  // =========================================================================
  // PAGE 4: ANALISIS KEPUTUSAN TERPERINCI (A, S_SALES, S_SYSTEM)
  // =========================================================================
  doc.addPage();
  curY = 20;

  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.rect(margin, curY, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('3.0 ANALISIS KEPUTUSAN SETIAP ELEMEN MOFASS (BAHAGIAN 2/2)', margin + 6, curY + 5.5);

  curY += 12;

  // Print remaining 3 categories: A, S_SALES, S_SYSTEM
  ['A', 'S_SALES', 'S_SYSTEM'].forEach((catId) => {
    const cat = MOFASS_CATEGORIES.find((c) => c.id === catId)!;
    const sc = assessment.categoryScores[cat.id];
    const deep = assessment.elementDeepAnalyses?.[cat.id];

    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, curY, contentWidth, 72, 3, 3, 'FD');

    // Header bar
    doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.roundedRect(margin, curY, contentWidth, 8, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`${cat.code} - ${cat.name.toUpperCase()}`, margin + 4, curY + 5.5);
    doc.text(`Skor: ${sc?.percentage}% (${sc?.score}/50) | Status: ${sc?.status}`, pageWidth - margin - 4, curY + 5.5, { align: 'right' });

    // Body
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const diagLines = doc.splitTextToSize(`Huraian: ${deep?.narrativeDiagnosis || ''}`, contentWidth - 8);
    doc.text(diagLines, margin + 4, curY + 14);

    let secSubY = curY + 14 + (diagLines.length * 3.5) + 3;

    // Strengths
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentTeal[0], accentTeal[1], accentTeal[2]);
    doc.text('Kekuatan Utama:', margin + 4, secSubY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    sc?.keyStrengths.slice(0, 2).forEach((s) => {
      secSubY += 3.8;
      doc.text(`• ${s}`, margin + 6, secSubY);
    });

    secSubY += 5;
    // Gaps
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentRose[0], accentRose[1], accentRose[2]);
    doc.text('Jurang Pembaikan & Punca Asas:', margin + 4, secSubY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    sc?.keyGaps.slice(0, 2).forEach((g) => {
      secSubY += 3.8;
      doc.text(`• ${g}`, margin + 6, secSubY);
    });

    secSubY += 5;
    // Prescription
    if (deep?.strategicPrescription) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
      doc.text('Preskripsi Tindakan:', margin + 4, secSubY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
      const prescLines = doc.splitTextToSize(deep.strategicPrescription, contentWidth - 42);
      doc.text(prescLines, margin + 35, secSubY);
    }

    curY += 78;
  });

  // =========================================================================
  // PAGE 5: ANALISIS BERKAITAN (JURANG PENANDA ARAS & SWOT)
  // =========================================================================
  doc.addPage();
  curY = 20;

  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.rect(margin, curY, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('4.0 ANALISIS-ANALISIS BERKAITAN (BENCHMARK & SWOT)', margin + 6, curY + 5.5);

  curY += 12;

  // Benchmark Gap Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('4.1 Analisis Jurang Penanda Aras (Benchmark Gap vs Purata PMKS Malaysia)', margin, curY);

  const gapRows = MOFASS_CATEGORIES.map((c) => {
    const sc = assessment.categoryScores[c.id];
    const benchmark = c.id === 'M' ? 52 : c.id === 'O' ? 64 : c.id === 'F' ? 58 : c.id === 'A' ? 55 : c.id === 'S_SALES' ? 60 : 48;
    const diff = (sc?.percentage || 0) - benchmark;
    return [
      c.name,
      `${sc?.percentage}%`,
      `${benchmark}%`,
      diff >= 0 ? `+${diff}%` : `${diff}%`,
      diff >= 10 ? 'Mendahului Pasaran' : diff >= 0 ? 'Setanding Industri' : 'Di Bawah Penanda Aras'
    ];
  });

  autoTable(doc, {
    startY: curY + 3,
    head: [['DIMENSI MOFASS', 'SKOR SYARIKAT', 'PENANDA ARAS', 'VARIANS', 'STATUS PENARAFAN']],
    body: gapRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.2 },
    headStyles: { fillColor: primaryDark as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 38 }
    },
    margin: { left: margin, right: margin }
  });

  // SWOT 4-Quadrant Matrix
  curY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('4.2 Matriks Analisis SWOT Bersepadu PMKS', margin, curY);
  curY += 4;

  const swotBoxWidth = (contentWidth - 6) / 2;
  const swotBoxHeight = 50;

  // Strengths Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, curY, swotBoxWidth, swotBoxHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(accentTeal[0], accentTeal[1], accentTeal[2]);
  doc.text('KEKUATAN (STRENGTHS)', margin + 4, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  let strY = curY + 11;
  assessment.swotAnalysis.strengths.slice(0, 4).forEach((s) => {
    const lines = doc.splitTextToSize(`• ${s}`, swotBoxWidth - 8);
    doc.text(lines, margin + 4, strY);
    strY += (lines.length * 3.4) + 1;
  });

  // Weaknesses Box
  const weakX = margin + swotBoxWidth + 6;
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(weakX, curY, swotBoxWidth, swotBoxHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(accentRose[0], accentRose[1], accentRose[2]);
  doc.text('KELEMAHAN (WEAKNESSES)', weakX + 4, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  let weakY = curY + 11;
  assessment.swotAnalysis.weaknesses.slice(0, 4).forEach((w) => {
    const lines = doc.splitTextToSize(`• ${w}`, swotBoxWidth - 8);
    doc.text(lines, weakX + 4, weakY);
    weakY += (lines.length * 3.4) + 1;
  });

  curY += swotBoxHeight + 6;

  // Opportunities Box
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margin, curY, swotBoxWidth, swotBoxHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.text('PELUANG (OPPORTUNITIES)', margin + 4, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  let oppY = curY + 11;
  assessment.swotAnalysis.opportunities.slice(0, 4).forEach((o) => {
    const lines = doc.splitTextToSize(`• ${o}`, swotBoxWidth - 8);
    doc.text(lines, margin + 4, oppY);
    oppY += (lines.length * 3.4) + 1;
  });

  // Threats Box
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(weakX, curY, swotBoxWidth, swotBoxHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(accentAmber[0], accentAmber[1], accentAmber[2]);
  doc.text('ANCAMAN (THREATS)', weakX + 4, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  let thrY = curY + 11;
  assessment.swotAnalysis.threats.slice(0, 4).forEach((t) => {
    const lines = doc.splitTextToSize(`• ${t}`, swotBoxWidth - 8);
    doc.text(lines, weakX + 4, thrY);
    thrY += (lines.length * 3.4) + 1;
  });

  // =========================================================================
  // PAGE 6: RANCANGAN STRATEGIK, TERAS & JADUAL KPI
  // =========================================================================
  doc.addPage();
  curY = 20;

  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.rect(margin, curY, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('5.0 RANCANGAN STRATEGIK PERTUMBUHAN & JADUAL KPI', margin + 6, curY + 5.5);

  curY += 12;

  // Vision Statement Box
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.roundedRect(margin, curY, contentWidth, 18, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(accentIndigo[0] + 50, accentIndigo[1] + 50, 255);
  doc.text('VISI TRANSFORMASI PERNIAGAAN (12 - 24 BULAN):', margin + 4, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  const visionLines = doc.splitTextToSize(`"${assessment.strategicBlueprint?.transformationVision || ''}"`, contentWidth - 8);
  doc.text(visionLines, margin + 4, curY + 12);

  curY += 24;

  // 4 Core Strategic Pillars
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('5.1 Teras Strategi Utama (Core Strategic Pillars)', margin, curY);
  curY += 4;

  const pillarRows = assessment.strategicBlueprint?.corePillars.map((p) => [
    p.title,
    p.focus,
    p.expectedOutcome
  ]) || [];

  autoTable(doc, {
    startY: curY,
    head: [['TERAS STRATEGI', 'FOKUS PELAKSANAAN', 'HASIL SASARAN JANGKA PANJANG']],
    body: pillarRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    headStyles: { fillColor: primaryNavy as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 54, fontStyle: 'bold' },
      1: { cellWidth: 68 },
      2: { cellWidth: 60, fontStyle: 'bold', textColor: accentTeal as [number, number, number] }
    },
    margin: { left: margin, right: margin }
  });

  // Table of KPIs
  curY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('5.2 Jadual Petunjuk Prestasi Utama (KPI) Kuantitatif', margin, curY);

  const kpiRows = assessment.strategicBlueprint?.kpis.map((k) => [
    k.metric,
    k.baseline,
    k.target12Months,
    k.measurementFrequency
  ]) || [];

  autoTable(doc, {
    startY: curY + 3,
    head: [['METRIK KPI', 'GARIS ASAS SEMASA', 'SASARAN 12 BULAN', 'KEKERAPAN PANTAUAN']],
    body: kpiRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: primaryDark as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 36, halign: 'center' },
      2: { cellWidth: 42, halign: 'center', fontStyle: 'bold', textColor: accentTeal as [number, number, number] },
      3: { cellWidth: 34, halign: 'center' }
    },
    margin: { left: margin, right: margin }
  });

  // =========================================================================
  // PAGE 7: PELAN TINDAKAN BERSTRUKTUR (ACTION PLAN MATRIX)
  // =========================================================================
  doc.addPage();
  curY = 20;

  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.rect(margin, curY, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('5.3 PELAN TINDAKAN TERPERINCI MENGIKUT FASA (ACTION PLAN MATRIX)', margin + 6, curY + 5.5);

  curY += 8;

  const actionRows = assessment.strategicBlueprint?.actionPlan.map((act) => [
    `${act.initiative}\n[${act.phase}]`,
    act.specificActions.map((s) => `• ${s}`).join('\n'),
    act.pic,
    act.kpiTarget,
    act.riskLevel
  ]) || [];

  autoTable(doc, {
    startY: curY + 3,
    head: [['INISIATIF & FASA', 'TINDAKAN SPESIFIK', 'PEGAWAI (PIC)', 'SASARAN KPI', 'RISIKO']],
    body: actionRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    headStyles: { fillColor: primaryDark as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold' },
      1: { cellWidth: 64 },
      2: { cellWidth: 28, fontStyle: 'bold' },
      3: { cellWidth: 32 },
      4: { cellWidth: 12, halign: 'center', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });

  // Budget & ROI Projection Card
  curY = (doc as any).lastAutoTable.finalY + 8;
  if (assessment.strategicBlueprint?.estimatedBudgetROI) {
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, curY, contentWidth, 24, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.text('ANGGARAN BELANJAWAN & UNJURAN PULANGAN PELABURAN (ROI):', margin + 4, curY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.text(`• Anggaran Pelaburan Diperlukan: ${assessment.strategicBlueprint.estimatedBudgetROI.estimatedInvestment}`, margin + 4, curY + 12);
    doc.text(`• Tempoh Pulang Modal (Payback): ${assessment.strategicBlueprint.estimatedBudgetROI.projectedPaybackPeriod}`, margin + 4, curY + 17);
    doc.text(`• Unjuran Kadar Pertumbuhan Hasil: ${assessment.strategicBlueprint.estimatedBudgetROI.projectedGrowthRate}`, margin + 4, curY + 22);
  }

  // =========================================================================
  // PAGE 8: PADANAN GERAN KERAJAAN & PERAKUAN AUDIT
  // =========================================================================
  doc.addPage();
  curY = 20;

  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.rect(margin, curY, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('6.0 PADANAN GERAN KERAJAAN & PERAKUAN AUDIT', margin + 6, curY + 5.5);

  curY += 8;

  const grantRows = assessment.matchedGovPrograms?.map((p) => [
    p.agency,
    p.programName,
    p.supportType,
    p.description,
    p.eligibility
  ]) || [];

  autoTable(doc, {
    startY: curY + 3,
    head: [['AGENSI', 'NAMA PROGRAM', 'BENTUK BANTUAN', 'PENERANGAN BANTUAN', 'SYARAT KELAYAKAN']],
    body: grantRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    headStyles: { fillColor: primaryDark as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 46 },
      4: { cellWidth: 42 }
    },
    margin: { left: margin, right: margin }
  });

  // Section 7: Audit Seal & Signature
  curY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('7.0 PERAKUAN PENGESAHAN DIAGNOSTIK & AKUAN PENGURUSAN', margin, curY);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  const perakuanText = doc.splitTextToSize(
    'Laporan ini dijana secara rasmi berpandukan kerangka MOFASS dengan penentusahan data maklum balas yang dibekalkan oleh pihak pengurusan syarikat. Dokumen ini diperakui sah untuk digunapakai sebagai asas pelan perniagaan strategik korporat, permohonan kemudahan pembiayaan perbankan, dan pengesahan kelayakan geran PMKS.',
    contentWidth
  );
  doc.text(perakuanText, margin, curY);

  curY += (perakuanText.length * 3.8) + 12;

  // Seal & Signature layout
  // Stamp Seal Circle
  doc.setDrawColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.setLineWidth(1.2);
  doc.circle(margin + 20, curY + 16, 16, 'S');

  doc.setLineWidth(0.4);
  doc.circle(margin + 20, curY + 16, 13.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.text('MOFASS PMKS', margin + 20, curY + 14, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('SAH DIAUDIT', margin + 20, curY + 18, { align: 'center' });
  doc.setFontSize(5.5);
  doc.text(assessment.id.slice(0, 14), margin + 20, curY + 22, { align: 'center' });

  // Signature Line
  const signX = pageWidth - margin - 60;
  doc.setDrawColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setLineWidth(0.6);
  doc.line(signX, curY + 22, signX + 60, curY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(user.fullName, signX + 30, curY + 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  doc.text(`${user.role || 'Pengarah Urusan'}`, signX + 30, curY + 30, { align: 'center' });
  doc.text(company.companyName, signX + 30, curY + 34, { align: 'center' });
  doc.text(`Tarikh: ${createdDate}`, signX + 30, curY + 38, { align: 'center' });

  // Add Headers & Footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Don't add top header line on cover page (page 1)
    if (i > 1) {
      addHeaderFooter(i, totalPages);
    } else {
      // Just footer on page 1
      doc.setFontSize(7.5);
      doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
      doc.text(
        `Dokumen Rasmi Dijana oleh Sistem Analisis Kompetensi PMKS (MOFASS) • Muka Surat 1 daripada ${totalPages}`,
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );
    }
  }

  // Save PDF directly to user's device
  const safeName = company.companyName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Laporan_Strategik_MOFASS_${safeName}_${assessment.id}.pdf`);
}
