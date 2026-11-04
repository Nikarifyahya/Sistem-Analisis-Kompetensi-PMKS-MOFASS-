import React, { useRef, useState } from 'react';
import { AssessmentResult } from '../types';
import { MOFASS_CATEGORIES } from '../data/mofassQuestions';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { generateProfessionalPDF } from '../utils/pdfGenerator';
import { ensureCompleteAssessment } from '../utils/mlEngine';
import { 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Target, 
  Calendar, 
  User, 
  Compass, 
  FileSpreadsheet, 
  Loader2,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface ProfessionalReportViewProps {
  assessment: AssessmentResult;
  onClose?: () => void;
}

export const ProfessionalReportView: React.FC<ProfessionalReportViewProps> = ({
  assessment: rawAssessment,
  onClose
}) => {
  const assessment = ensureCompleteAssessment(rawAssessment);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Download PDF using professional jsPDF document generator
  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
    try {
      // Use direct jsPDF vector presentation generator
      generateProfessionalPDF(assessment);
    } catch (err) {
      console.error('Error generating PDF via jsPDF generator:', err);
      window.print();
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Export report as editable Word (.doc) / HTML file
  const handleExportWord = () => {
    if (!reportRef.current) return;
    const content = reportRef.current.innerHTML;
    const header = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Laporan MOFASS - ${assessment.companyProfile.companyName}</title><style>body{font-family:Arial,sans-serif;margin:40px;line-height:1.6;color:#1e293b;}table{width:100%;border-collapse:collapse;margin:20px 0;}th,td{border:1px solid #cbd5e1;padding:8px 12px;}th{background:#f1f5f9;font-weight:bold;text-align:left;}h1,h2,h3{color:#0f172a;}hr{border:none;border-top:1px solid #cbd5e1;margin:30px 0;}</style></head><body>`;
    const footer = `</body></html>`;
    const fullSource = header + content + footer;

    const blob = new Blob(['\ufeff' + fullSource], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Strategik_MOFASS_${assessment.companyProfile.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Cemerlang':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Memuaskan':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Perlu Pembaikan':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Print & Download Controls) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Laporan Rasmi Tahap Kompetensi Perniagaan PMKS
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen beraudit lengkap meliputi ringkasan eksekutif, landskap industri, analisis 6 dimensi MOFASS, analisis SWOT/risiko, dan rancangan strategik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menjana PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Muat Turun PDF Lengkap</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportWord}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Eksport Word (.doc)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Actual Printable / Exportable Document Paper */}
      <div
        ref={reportRef}
        className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-300 shadow-xl max-w-5xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none text-slate-800"
      >
        {/* ======================================================== */}
        {/* MUKA HADAPAN RASMI (COVER / TITLE SECTION)               */}
        {/* ======================================================== */}
        <div className="pb-10 border-b-4 border-slate-900 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                <img 
                  src="/assets/aistudio/Logo_Impak_Niaga_9f4ce565.png" 
                  alt="Logo Impak Niaga" 
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-700 font-mono">
                  IMPAK NIAGA • SISTEM AUDIT DIAGNOSTIK PMKS KEBANGSAAN
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase leading-tight mt-0.5">
                  LAPORAN AUDIT PRESTASI & PELAN TINDAKAN STRATEGIK PMKS
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Berasaskan Kerangka 6 Dimensi M-O-F-A-S-S (Marketing, Operation, Finance, Administration, Sales, System)
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-[10px] font-mono text-slate-400 uppercase">NO. RUJUKAN AUDIT</div>
              <div className="text-xs font-mono font-extrabold text-slate-900">{assessment.id}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Tarikh Dikeluarkan: {new Date(assessment.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Business Particulars Table Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Nama Entiti Berdaftar</span>
              <strong className="text-slate-900 text-sm font-bold block mt-0.5">{assessment.companyProfile.companyName}</strong>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">No. Pendaftaran SSM</span>
              <span className="text-slate-800 font-mono font-bold block mt-0.5">{assessment.companyProfile.ssmNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Sektor & Saiz PMKS</span>
              <span className="text-slate-800 font-medium block mt-0.5">{assessment.companyProfile.sector} ({assessment.companyProfile.businessSize.split('(')[0]})</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Pegawai Responden</span>
              <span className="text-slate-800 font-medium block mt-0.5">{assessment.userProfile.fullName} ({assessment.userProfile.role || 'Pengarah'})</span>
            </div>
          </div>

          {/* Assessment Overall Score Banner */}
          <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
            <div className="space-y-1">
              <div className="text-xs font-mono text-indigo-300 uppercase tracking-wider">
                Keputusan Penilaian Diagnostik Keseluruhan
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                {assessment.maturityTitle}
              </h2>
              <p className="text-xs text-indigo-200/90 max-w-xl leading-relaxed">
                {assessment.maturityDescription}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20">
              <div className="text-[10px] uppercase font-mono text-indigo-200">SKOR KESELURUHAN</div>
              <div className="text-4xl font-black font-mono text-white flex items-baseline sm:justify-end">
                <span>{assessment.overallPercentage}</span>
                <span className="text-xl text-indigo-300 font-normal">%</span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                {assessment.totalScore} / 300 Mata
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BAHAGIAN 1: RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)      */}
        {/* ======================================================== */}
        <div className="mb-12">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b-2 border-indigo-600">
            <Compass className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black uppercase text-slate-900 tracking-tight">
              Bahagian 1: Ringkasan Eksekutif (Executive Summary)
            </h2>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-3">
            <p>
              {assessment.aiExecutiveSummary}
            </p>
            <p>
              Melalui penilaian teliti ke atas kesemua 60 parameter MOFASS, entiti perniagaan ini mempamerkan daya tahan asas yang signifikan, disokong oleh kepimpinan yang komited terhadap pertumbuhan. Walau bagaimanapun, untuk membolehkan syarikat beralih daripada fasa pengurusan reaktif kepada penskalaan mampan, intervensi strategik dalam penyelarasan proses SOP, kawalan penuaan hutang, automasi alatan digital, dan pengukuhan saluran jualan berulang perlu dimulakan tanpa kelewatan.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BAHAGIAN 2: PENDAHULUAN & LANDSKAP INDUSTRI              */}
        {/* ======================================================== */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-4 border-b-2 border-indigo-600">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-black uppercase text-slate-900 tracking-tight">
                Bahagian 2: Pendahuluan & Landskap Industri yang Diceburi
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[10px] font-extrabold text-cyan-800">
              <Sparkles className="w-3 h-3 text-cyan-600" />
              <span>Dianalisis Menggunakan Gemini AI</span>
            </div>
          </div>

          {/* Sektor & Tahun Operasi Metadata Pill Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
            <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Sektor: <strong className="text-slate-900">{assessment.companyProfile.sector}</strong>
            </span>
            <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              Tempoh Beroperasi: <strong className="text-indigo-900">{assessment.companyProfile.yearsInOperation} Tahun</strong>
            </span>
            <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Kedudukan Fasa: <strong className="text-emerald-900">{assessment.companyProfile.yearsInOperation >= 10 ? 'Fasa Pemantapan Legasi & Transformasi IR4.0 (10+ Tahun)' : assessment.companyProfile.yearsInOperation >= 6 ? 'Fasa Kematangan & Penskalaan (6-9 Tahun)' : assessment.companyProfile.yearsInOperation >= 3 ? 'Fasa Pengukuhan Sistem & Pertumbuhan Awal (3-5 Tahun)' : 'Fasa Permulaan & Pembinaan Pasaran Asas (1-2 Tahun)'}</strong>
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {/* 2.1 Macro Overview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1.5 text-xs uppercase tracking-wide font-mono flex items-center justify-between">
                <span>2.1 Gambaran Makro Sektor {assessment.companyProfile.sector} di Malaysia</span>
                <span className="text-[10px] font-normal text-slate-500 lowercase">dianalisis berpandukan data 2026</span>
              </h3>
              <p>{assessment.industryLandscape?.sectorOverview}</p>
            </div>

            {/* 2.2 Stage of Business Analysis based on years in operation */}
            <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-200">
              <h3 className="font-bold text-cyan-950 mb-1.5 text-xs uppercase tracking-wide font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>2.2 Analisis Kematangan Fasa Operasi ({assessment.companyProfile.yearsInOperation} Tahun Beroperasi)</span>
              </h3>
              <p className="text-slate-700">
                {assessment.industryLandscape?.stageAnalysis || 
                  `Berdasarkan tempoh operasi ${assessment.companyProfile.yearsInOperation} tahun dalam sektor ${assessment.companyProfile.sector}, syarikat berada dalam fasa pertumbuhan berstruktur. Fokus utama fasa ini adalah membendung kebergantungan operasi kepada pengasas, menginstitusikan SOP standard, serta memanfaatkan pembiayaan digital dan automasi untuk memperluas margin keuntungan.`
                }
              </p>
            </div>

            {/* 2.3 Trends & 2.4 Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="font-bold text-slate-900 mb-2 text-xs flex items-center gap-1.5 text-indigo-900">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> 2.3 Trend Pasaran Semasa di Malaysia
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {(assessment.industryLandscape?.marketTrends?.length ? assessment.industryLandscape.marketTrends : [
                    'Peningkatan kebergantungan kepada platform transaksi digital, CRM awan, dan automasi proses kerja.',
                    'Peralihan perbelanjaan korporat & pengguna kepada tawaran nilai telus dan kepuasan masa nyata.',
                    'Penekanan ketat kepada pematuhan mandat e-Invois LHDN dan integriti aliran rekod inventori.'
                  ]).map((t, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="font-bold text-slate-900 mb-2 text-xs flex items-center gap-1.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> 2.4 Cabaran Utama Pemain Industri (Fasa {assessment.companyProfile.yearsInOperation} Tahun)
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {(assessment.industryLandscape?.keyChallenges?.length ? assessment.industryLandscape.keyChallenges : [
                    'Kenaikan kos overhed buruh, sewa premis, dan ketidaktentuan harga input bahan mentah.',
                    'Kekangan aliran tunai pusingan berpunca daripada tempoh kutipan kredit penghutang yang panjang (>45 hari).',
                    'Kesukaran menarik dan mengekalkan bakat berkemahiran teknikal serta ketiadaan SOP bertulis.'
                  ]).map((c, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 2.5 Government Support & 2.6 Growth Drivers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs">
                <h4 className="font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 2.5 Sokongan Dasar Kerajaan & Inisiatif PMKS
                </h4>
                <ul className="space-y-1.5 text-slate-700">
                  {(assessment.industryLandscape?.governmentPolicySupport?.length ? assessment.industryLandscape.governmentPolicySupport : [
                    'Pelan Induk PKS (SME Masterplan) dan Dasar Keusahawanan Nasional (DKN 2030).',
                    'Inisiatif automasi & pendigitalan pintar PMKS diterajui SME Corp, MDEC, dan KUSKOP.',
                    'Skim Jaminan Modal Kerja (WCS) oleh Syarikat Jaminan Pembiayaan Perniagaan (SJPP).'
                  ]).map((g, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 text-xs">
                <h4 className="font-bold text-sky-950 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" /> 2.6 Pemangkin Pertumbuhan Strategik (Growth Drivers)
                </h4>
                <ul className="space-y-1.5 text-slate-700">
                  {(assessment.industryLandscape?.growthDrivers?.length ? assessment.industryLandscape.growthDrivers : [
                    'Peluasan kontrak korporat dan perkongsian penyelesaian integrasi bersama syarikat GLC tempatan.',
                    'Potensi penskalaan perniagaan rentas sempadan ke pasaran serantau ASEAN (Indonesia, Filipina, Vietnam).',
                    'Automasi proses berulang yang mengurangkan kos operasi seunit sebanyak 15% hingga 25%.'
                  ]).map((gd, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-sky-600 font-bold">★</span>
                      <span>{gd}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BAHAGIAN 3: ANALISIS KEPUTUSAN SETIAP ELEMEN MOFASS      */}
        {/* ======================================================== */}
        <div className="mb-12">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b-2 border-indigo-600">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black uppercase text-slate-900 tracking-tight">
              Bahagian 3: Analisis Keputusan Terperinci Setiap Elemen MOFASS
            </h2>
          </div>

          <p className="text-xs text-slate-600 mb-6">
            Pecahan 6 dimensi kritikal perniagaan dinilai berdasarkan instrumen 60 soalan objektif skala Likert standard.
          </p>

          <div className="space-y-6">
            {MOFASS_CATEGORIES.map((cat, idx) => {
              const sc = assessment.categoryScores[cat.id];
              const deep = assessment.elementDeepAnalyses?.[cat.id];
              if (!sc) return null;

              return (
                <div key={cat.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center ${cat.badgeColor}`}>
                        {cat.letter}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {idx + 1}.0 {cat.name}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          {cat.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(sc.status)}`}>
                        {sc.status}
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {sc.percentage}%
                      </span>
                      <span className="text-xs text-slate-400">({sc.score}/50 mata)</span>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="pt-3 text-xs text-slate-700 leading-relaxed">
                    <p className="mb-3">
                      <strong>Huraian Diagnostik:</strong> {deep?.narrativeDiagnosis || `Dimensi ${cat.name} mencatatkan pencapaian sebanyak ${sc.percentage}%.`}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {/* Strengths */}
                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                        <div className="text-[11px] font-bold text-emerald-900 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Kekuatan Yang Dikenalpasti:
                        </div>
                        <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                          {sc.keyStrengths?.length > 0 ? (
                            sc.keyStrengths.map((s, sIdx) => <li key={sIdx}>{s}</li>)
                          ) : (
                            <li>Asas kefahaman kepimpinan terhadap keperluan {cat.shortName}</li>
                          )}
                        </ul>
                      </div>

                      {/* Root causes / Vulnerabilities */}
                      <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                        <div className="text-[11px] font-bold text-rose-900 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Titik Kelemahan & Jurang:
                        </div>
                        <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                          {sc.keyGaps?.length > 0 ? (
                            sc.keyGaps.map((g, gIdx) => <li key={gIdx}>{g}</li>)
                          ) : (
                            <li>Perlu penambahbaikan berkala secara berterusan</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {deep?.strategicPrescription && (
                      <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-950">
                        <strong>Preskripsi Tindakan Pembetulan:</strong> {deep.strategicPrescription}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* BAHAGIAN 4: ANALISIS-ANALISIS BERKAITAN (SWOT, GAP, RISK) */}
        {/* ======================================================== */}
        <div className="mb-12">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b-2 border-indigo-600">
            <Target className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black uppercase text-slate-900 tracking-tight">
              Bahagian 4: Analisis-Analisis Berkaitan (Related Diagnostic Frameworks)
            </h2>
          </div>

          {/* 4.1 Benchmark Gap Analysis Table */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 mb-2">
              4.1 Analisis Jurang Penanda Aras (Benchmark Gap vs Purata PMKS Malaysia)
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Dimensi MOFASS</th>
                    <th className="p-2.5 text-center">Skor Syarikat</th>
                    <th className="p-2.5 text-center">Penanda Aras Industri</th>
                    <th className="p-2.5 text-center">Jurang (Variance)</th>
                    <th className="p-2.5">Status Penarafan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {MOFASS_CATEGORIES.map((c) => {
                    const sc = assessment.categoryScores[c.id];
                    const benchmark = c.id === 'M' ? 52 : c.id === 'O' ? 64 : c.id === 'F' ? 58 : c.id === 'A' ? 55 : c.id === 'S_SALES' ? 60 : 48;
                    const diff = (sc?.percentage || 0) - benchmark;

                    return (
                      <tr key={c.id}>
                        <td className="p-2.5 font-bold text-slate-900">{c.name}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-indigo-700">{sc?.percentage}%</td>
                        <td className="p-2.5 text-center font-mono text-slate-500">{benchmark}%</td>
                        <td className="p-2.5 text-center font-mono font-bold">
                          <span className={diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            {diff >= 0 ? `+${diff}%` : `${diff}%`}
                          </span>
                        </td>
                        <td className="p-2.5">
                          {diff >= 10 ? 'Mendahului Pasaran' : diff >= 0 ? 'Setanding Industri' : 'Di Bawah Penanda Aras'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4.2 Matriks SWOT Komprehensif */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 mb-2">
              4.2 Matriks SWOT Bersepadu PMKS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-900 uppercase mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Kekuatan (Strengths)
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {assessment.swotAnalysis.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200">
                <h4 className="text-xs font-bold text-rose-900 uppercase mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Kelemahan (Weaknesses)
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {assessment.swotAnalysis.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200">
                <h4 className="text-xs font-bold text-sky-900 uppercase mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-600" /> Peluang (Opportunities)
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {assessment.swotAnalysis.opportunities.map((o, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-sky-600 font-bold">•</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                <h4 className="text-xs font-bold text-amber-900 uppercase mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Ancaman (Threats)
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {assessment.swotAnalysis.threats.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BAHAGIAN 5: RANCANGAN STRATEGIK, PELAN TINDAKAN & KPI    */}
        {/* ======================================================== */}
        <div className="mb-12">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b-2 border-indigo-600">
            <Compass className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black uppercase text-slate-900 tracking-tight">
              Bahagian 5: Rancangan Strategik Pertumbuhan, Pelan Tindakan & KPI
            </h2>
          </div>

          {/* Visi Transformasi */}
          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs sm:text-sm mb-6">
            <span className="text-[10px] font-mono uppercase text-indigo-300 block mb-1">
              Visi & Hala Tuju Transformasi Syarikat (12 - 24 Bulan)
            </span>
            <p className="font-semibold leading-relaxed">
              "{assessment.strategicBlueprint?.transformationVision}"
            </p>
          </div>

          {/* 4 Teras Strategi */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 mb-3">
              5.1 Teras Strategi Utama (Core Strategic Pillars)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assessment.strategicBlueprint?.corePillars.map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
                  <strong className="text-indigo-900 block font-bold text-xs mb-1">{p.title}</strong>
                  <p className="text-slate-600 mb-1.5"><strong>Fokus:</strong> {p.focus}</p>
                  <p className="text-emerald-700"><strong>Hasil Dijangka:</strong> {p.expectedOutcome}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5.2 Jadual KPI Strategik Kuantitatif */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 mb-3">
              5.2 Jadual Petunjuk Prestasi Utama (KPI) Kuantitatif
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Metrik KPI</th>
                    <th className="p-2.5">Asas Semasa (Baseline)</th>
                    <th className="p-2.5">Sasaran 12 Bulan</th>
                    <th className="p-2.5">Kekerapan Pantauan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {assessment.strategicBlueprint?.kpis.map((k, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-slate-900">{k.metric}</td>
                      <td className="p-2.5 font-mono text-slate-600">{k.baseline}</td>
                      <td className="p-2.5 font-mono font-bold text-emerald-700">{k.target12Months}</td>
                      <td className="p-2.5 text-slate-500">{k.measurementFrequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5.3 Jadual Pelan Tindakan Berstruktur */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 mb-3">
              5.3 Jadual Pelan Tindakan Terperinci Mengikut Fasa (Action Plan Matrix)
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 w-1/4">Inisiatif & Fasa</th>
                    <th className="p-2.5 w-2/5">Tindakan Spesifik</th>
                    <th className="p-2.5">Pegawai (PIC)</th>
                    <th className="p-2.5">Sasaran KPI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-[11px]">
                  {assessment.strategicBlueprint?.actionPlan.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/60">
                      <td className="p-2.5 align-top">
                        <strong className="text-slate-900 block">{act.initiative}</strong>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {act.phase}
                        </span>
                      </td>
                      <td className="p-2.5 align-top">
                        <ul className="space-y-1 text-slate-600 list-disc list-inside">
                          {act.specificActions.map((s, sIdx) => (
                            <li key={sIdx}>{s}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-2.5 align-top font-bold text-slate-700">{act.pic}</td>
                      <td className="p-2.5 align-top text-emerald-700 font-medium">{act.kpiTarget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5.4 Anggaran Belanjawan & Unjuran ROI */}
          {assessment.strategicBlueprint?.estimatedBudgetROI && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Anggaran Pelaburan Diperlukan</span>
                <strong className="text-slate-900 font-bold">{assessment.strategicBlueprint.estimatedBudgetROI.estimatedInvestment}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Tempoh Pulang Modal (Payback Period)</span>
                <strong className="text-emerald-700 font-bold">{assessment.strategicBlueprint.estimatedBudgetROI.projectedPaybackPeriod}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Unjuran Kadar Pertumbuhan Hasil</span>
                <strong className="text-indigo-700 font-bold">{assessment.strategicBlueprint.estimatedBudgetROI.projectedGrowthRate}</strong>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* BAHAGIAN 6: PADANAN GERAN & PROGRAM KERAJAAN             */}
        {/* ======================================================== */}
        <div className="mb-12">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b-2 border-indigo-600">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black uppercase text-slate-900 tracking-tight">
              Bahagian 6: Padanan Program & Geran Sokongan Agensi Kerajaan Malaysia
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {assessment.matchedGovPrograms?.map((prog, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-indigo-700 uppercase font-mono">{prog.agency}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {prog.supportType}
                  </span>
                </div>
                <strong className="text-slate-900 block font-bold mb-1">{prog.programName}</strong>
                <p className="text-slate-600 mb-2 leading-relaxed">{prog.description}</p>
                <div className="p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-500">
                  <strong>Kelayakan:</strong> {prog.eligibility}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* BAHAGIAN 7: PERAKUAN AUDIT & TANDATANGAN PENGESAHAN       */}
        {/* ======================================================== */}
        <div className="pt-8 border-t-2 border-slate-900">
          <h2 className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 mb-6">
            Bahagian 7: Perakuan Pengesahan Diagnostik & Akuan Pemilikan
          </h2>

          <p className="text-xs text-slate-600 mb-8 leading-relaxed">
            Laporan ini disediakan secara rasmi oleh Sistem Analisis Tahap Kompetensi PMKS (MOFASS) berpandukan pengesahan data yang dibekalkan oleh pihak pengurusan syarikat. Kandungan laporan ini boleh digunapakai sebagai dokumen sokongan perancangan strategik korporat, permohonan kemudahan pembiayaan bank, dan pengesahan kriteria geran agensi keusahawanan Malaysia.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
            <div>
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-indigo-700/50 flex flex-col items-center justify-center text-center p-2 text-indigo-950 rotate-[-6deg] bg-indigo-50/20">
                <ShieldCheck className="w-7 h-7 text-indigo-700 mb-0.5" />
                <span className="text-[10px] font-black uppercase tracking-tight">IMPAK NIAGA</span>
                <span className="text-[8px] font-bold text-slate-600 font-mono">MOFASS PMKS DIAUDIT</span>
                <span className="text-[7px] text-slate-400 font-mono">{assessment.id.slice(0, 16)}</span>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <div className="h-12"></div>
              <div className="w-56 border-b border-slate-900 inline-block"></div>
              <div className="text-xs font-bold text-slate-900">
                {assessment.userProfile.fullName}
              </div>
              <div className="text-[11px] text-slate-500">
                {assessment.userProfile.role || 'Pengarah Urusan'} • {assessment.companyProfile.companyName}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Tarikh Perakuan: {new Date(assessment.createdAt).toLocaleDateString('ms-MY')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
