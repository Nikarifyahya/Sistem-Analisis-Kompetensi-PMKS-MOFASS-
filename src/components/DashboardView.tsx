import React, { useState, useEffect } from 'react';
import { 
  AssessmentResult, 
  MofassCategoryId, 
  ActionPlanItem 
} from '../types';
import { MOFASS_CATEGORIES } from '../data/mofassQuestions';
import { RadarChart } from './RadarChart';
import { ProfessionalReportView } from './ProfessionalReportView';
import { generateProfessionalPDF } from '../utils/pdfGenerator';
import { ensureCompleteAssessment } from '../utils/mlEngine';
import { 
  requestAIGrowthRecommendations, 
  requestAIIndustryLandscape,
  AIAnalysisResponse 
} from '../services/aiAdvisor';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  Sparkles, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Printer, 
  Download, 
  ExternalLink, 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  FileText,
  DollarSign,
  Briefcase,
  ChevronRight,
  ListTodo,
  PieChart,
  Globe,
  Loader2
} from 'lucide-react';

interface DashboardViewProps {
  assessment: AssessmentResult;
  onRetake: () => void;
  onUpdateAssessment?: (updated: AssessmentResult) => void;
  onBackToAdmin?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  assessment: rawAssessment,
  onRetake,
  onUpdateAssessment,
  onBackToAdmin
}) => {
  const assessment = ensureCompleteAssessment(rawAssessment);
  const [activeTab, setActiveTab] = useState<'overview' | 'industry' | 'roadmap' | 'swot' | 'simulator' | 'grants' | 'report'>('overview');
  const [aiData, setAiData] = useState<AIAnalysisResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [isLoadingAIIndustry, setIsLoadingAIIndustry] = useState<boolean>(false);
  const [aiIndustrySuccessMsg, setAiIndustrySuccessMsg] = useState<string | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  // What-if simulator state (0 - 100 values)
  const [simulatedScores, setSimulatedScores] = useState<Record<MofassCategoryId, number>>({
    M: assessment.categoryScores.M?.percentage || 50,
    O: assessment.categoryScores.O?.percentage || 50,
    F: assessment.categoryScores.F?.percentage || 50,
    A: assessment.categoryScores.A?.percentage || 50,
    S_SALES: assessment.categoryScores.S_SALES?.percentage || 50,
    S_SYSTEM: assessment.categoryScores.S_SYSTEM?.percentage || 50,
  });

  // Trigger celebration on high score load
  useEffect(() => {
    if (assessment.overallPercentage >= 70) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [assessment.overallPercentage]);

  // Handle generating / fetching AI strategy recommendations
  const handleFetchAIAdvice = async () => {
    setIsLoadingAI(true);
    const result = await requestAIGrowthRecommendations(assessment);
    if (result) {
      setAiData(result);
    }
    setIsLoadingAI(false);
  };

  // Handle generating / fetching AI Industry Landscape based on Sector & Years in Operation
  const handleFetchAIIndustryLandscape = async () => {
    setIsLoadingAIIndustry(true);
    setAiIndustrySuccessMsg(null);
    try {
      const result = await requestAIIndustryLandscape(assessment.companyProfile);
      if (result && onUpdateAssessment) {
        const updatedAssessment = {
          ...assessment,
          industryLandscape: result
        };
        onUpdateAssessment(updatedAssessment);
        setAiIndustrySuccessMsg(`Ulasan pasaran sektor ${assessment.companyProfile.sector} (${assessment.companyProfile.yearsInOperation} Tahun) berjaya dijana dengan Gemini AI!`);
        setTimeout(() => setAiIndustrySuccessMsg(null), 6000);
      }
    } catch (e) {
      console.warn('Error fetching AI industry landscape:', e);
    } finally {
      setIsLoadingAIIndustry(false);
    }
  };

  const getStageName = (years: number) => {
    if (years >= 10) return 'Fasa Pemantapan Legasi & Transformasi IR4.0 (10+ Tahun)';
    if (years >= 6) return 'Fasa Kematangan & Penskalaan (6-9 Tahun)';
    if (years >= 3) return 'Fasa Pengukuhan Sistem & Pertumbuhan Awal (3-5 Tahun)';
    return 'Fasa Permulaan & Pembinaan Pasaran Asas (1-2 Tahun)';
  };

  const toggleTask = (taskId: string) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Simulator computed impact calculations
  const simulatedAverage = Math.round(
    Object.values(simulatedScores).reduce((a, b) => a + b, 0) / 6
  );
  const scoreDelta = simulatedAverage - assessment.overallPercentage;
  const projectedRevenueGain = Math.max(0, Math.round(scoreDelta * 0.85 + 5));
  const projectedEfficiencyGain = Math.max(0, Math.round(scoreDelta * 0.75 + 10));
  const loanReadinessIndex = Math.min(98, Math.round(simulatedAverage * 0.9 + 5));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Cemerlang':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Memuaskan':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Perlu Pembaikan':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const getMaturityBadgeStyle = (level: string) => {
    switch (level) {
      case 'Tahap 4':
        return 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white';
      case 'Tahap 3':
        return 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white';
      case 'Tahap 2':
        return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-rose-600 to-red-700 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative ambient lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                {assessment.companyProfile.companyName}
              </span>
              <span className="text-xs text-slate-400">
                SSM: {assessment.companyProfile.ssmNumber}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400">
                {assessment.companyProfile.sector} ({assessment.companyProfile.state})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Laporan Prestasi & Diagnostik Tahap Kompetensi MOFASS
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              Penilaian analitik komprehensif bagi 6 dimensi utama perniagaan PMKS berdasarkan piawaian diagnostik Malaysia.
            </p>
          </div>

          {/* Overall Score Badge Card */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shrink-0">
            <div className="text-center">
              <div className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-0.5">
                Skor Keseluruhan
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-white flex items-baseline justify-center">
                <span>{assessment.overallPercentage}</span>
                <span className="text-xl text-indigo-300 font-normal">%</span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                {assessment.totalScore} / 300 mata
              </div>
            </div>

            <div className="h-14 w-px bg-white/20"></div>

            <div className="text-left space-y-1">
              <span className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold tracking-wide uppercase shadow-xs ${getMaturityBadgeStyle(assessment.maturityLevel)}`}>
                {assessment.maturityLevel}
              </span>
              <div className="text-xs font-bold text-white max-w-[140px] leading-tight">
                {assessment.maturityTitle.split('(')[0]}
              </div>
              <div className="text-[11px] text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Audit Siap Sah
              </div>
            </div>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Tarikh Penilaian: {new Date(assessment.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition shadow-xs active:scale-95"
                title="Kembali ke Panel Pengurusan Pentadbir"
              >
                <span>← Kembali ke Panel Pentadbir</span>
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('industry');
                handleFetchAIIndustryLandscape();
              }}
              disabled={isLoadingAIIndustry}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold transition shadow-xs active:scale-95 disabled:opacity-60"
              title="Jana ulasan pasaran profesional sektor PMKS berasaskan sektor dan tahun operasi dengan Gemini AI"
            >
              {isLoadingAIIndustry ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menganalisis Pasaran...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Jana Ulasan AI (Sektor & Umur Operasi)</span>
                </>
              )}
            </button>
            <button
              onClick={() => generateProfessionalPDF(assessment)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold transition shadow-xs active:scale-95"
              title="Muat turun laporan PDF persembahan korporat rasmi menggunakan perpustakaan jspdf"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Muat Turun PDF (jsPDF)</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Papar Laporan Penuh
            </button>
            <button
              onClick={onRetake}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Kemaskini Soalan
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Ringkasan & Radar MOFASS
        </button>

        <button
          onClick={() => setActiveTab('industry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'industry'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-300" />
          Landskap Industri (Gemini AI)
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'roadmap'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Pelan Tindakan AI (30-60-90 Hari)
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'simulator'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Simulator Pertumbuhan Pintar
        </button>

        <button
          onClick={() => setActiveTab('swot')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'swot'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          Matriks SWOT PMKS
        </button>

        <button
          onClick={() => setActiveTab('grants')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'grants'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Padanan Geran Kerajaan ({assessment.matchedGovPrograms?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'report'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Sijil & Laporan Rasmi
        </button>
      </div>

      {/* Success Notification Banner for Gemini AI Industry Generation */}
      {aiIndustrySuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{aiIndustrySuccessMsg}</span>
          </div>
          <button 
            onClick={() => setAiIndustrySuccessMsg(null)} 
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold px-2 py-1 rounded-lg hover:bg-emerald-100 transition"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Tab: Industry Landscape (Powered by Gemini AI) */}
      {activeTab === 'industry' && (
        <div className="space-y-6">
          {/* Main Top Banner Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-extrabold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dianalisis Menggunakan Gemini AI (gemini-3.8-flash)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Bahagian 2.0: Pendahuluan & Landskap Industri PMKS
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl leading-relaxed">
                  Ulasan pasaran industri profesional yang disintesis khusus mengikut sektor <strong className="text-white underline">{assessment.companyProfile.sector}</strong> dan tempoh beroperasi <strong className="text-white underline">{assessment.companyProfile.yearsInOperation} Tahun</strong> syarikat anda di Malaysia.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                  <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-slate-200 font-semibold">
                    Sektor: <strong>{assessment.companyProfile.sector}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 font-semibold">
                    Tempoh Operasi: <strong>{assessment.companyProfile.yearsInOperation} Tahun</strong>
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-semibold">
                    Fasa: <strong>{getStageName(assessment.companyProfile.yearsInOperation)}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  onClick={handleFetchAIIndustryLandscape}
                  disabled={isLoadingAIIndustry}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md disabled:opacity-50 active:scale-95"
                >
                  {isLoadingAIIndustry ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menjana Ulasan AI...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Jana Semula Gemini AI</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => generateProfessionalPDF(assessment)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition active:scale-95"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Muat Turun PDF (jsPDF)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2.1: Gambaran Makro Pasaran Sektor di Malaysia */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-mono">
                2.1 Gambaran Makro Sektor {assessment.companyProfile.sector} di Malaysia
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {assessment.industryLandscape?.sectorOverview}
            </p>
          </div>

          {/* Section 2.2: Analisis Fasa Kematangan & Tempoh Operasi */}
          <div className="bg-gradient-to-r from-cyan-50/70 to-indigo-50/70 rounded-2xl p-6 border border-cyan-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-cyan-950 uppercase tracking-wide font-mono">
                2.2 Analisis Kematangan Fasa Operasi ({assessment.companyProfile.yearsInOperation} Tahun Beroperasi)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/80 p-4 rounded-xl border border-cyan-100">
              {assessment.industryLandscape?.stageAnalysis || 
                `Berdasarkan tempoh operasi ${assessment.companyProfile.yearsInOperation} tahun dalam sektor ${assessment.companyProfile.sector}, syarikat kini berada pada ${getStageName(assessment.companyProfile.yearsInOperation)}. Keutamaan utama ialah mengimbangi kos operasi, menginstitusikan SOP kerja, serta memanfaatkan automasi digital untuk melonjakkan skala.`
              }
            </p>
          </div>

          {/* Grid: Trends & Key Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trends Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Trend Pasaran Semasa di Malaysia
                </h3>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Dinamik 2026
                </span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                {assessment.industryLandscape?.marketTrends.map((trend, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{trend}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Challenges Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Cabaran Utama Pemain Industri Mengikut Fasa
                </h3>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  Fasa {assessment.companyProfile.yearsInOperation} Tahun
                </span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                {assessment.industryLandscape?.keyChallenges.map((chal, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-rose-50/40 p-3 rounded-xl border border-rose-100">
                    <span className="w-5 h-5 rounded-lg bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      !
                    </span>
                    <span className="leading-relaxed">{chal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Grid: Government Policies & Growth Drivers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Government Policies */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200/80 shadow-xs bg-emerald-50/20">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-emerald-100">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Sokongan Dasar & Program Kerajaan Malaysia
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Agensi Rasmi
                </span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                {assessment.industryLandscape?.governmentPolicySupport.map((gov, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-emerald-100">
                    <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      ✓
                    </span>
                    <span className="leading-relaxed">{gov}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth Drivers */}
            <div className="bg-white rounded-2xl p-6 border border-sky-200/80 shadow-xs bg-sky-50/20">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-100">
                <h3 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-600" />
                  Pemangkin Pertumbuhan Strategik (Growth Drivers)
                </h3>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                  Peluang Skala
                </span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                {assessment.industryLandscape?.growthDrivers.map((gd, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-sky-100">
                    <span className="w-5 h-5 rounded-lg bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      ★
                    </span>
                    <span className="leading-relaxed">{gd}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Overview & MOFASS Radar */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Executive AI Summary Box */}
          <div className="bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-indigo-950">
                  Rumusan Diagnostik Algoritma MOFASS
                </h3>
              </div>
              <button
                onClick={handleFetchAIAdvice}
                disabled={isLoadingAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {isLoadingAI ? 'Menjana Analisis Gemini...' : 'Perbaharui Analisis Pintar AI'}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {aiData?.executiveSummary || assessment.aiExecutiveSummary}
            </p>
          </div>

          {/* Grid: Radar Chart & Benchmark Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Radar Spider Web Card */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-indigo-600" />
                    Graf Radar Tahap Kompetensi MOFASS
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    6 Dimensi Teras
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Visualisasi imbangan kekuatan operasi antara Marketing, Operation, Finance, Administration, Sales, dan System.
                </p>
              </div>

              <div className="py-2 flex items-center justify-center">
                <RadarChart scores={assessment.categoryScores} />
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl mt-4">
                <strong>Panduan Tafsiran:</strong> Bentuk poligon yang sekata dan luas melambangkan kesihatan organisasi yang stabil. Bentuk yang tajam atau condong menunjukkan ketidakseimbangan yang boleh merencatkan pertumbuhan syarikat.
              </div>
            </div>

            {/* Benchmark Comparison & Quick Health Index */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Perbandingan Penanda Aras Industri PMKS Malaysia
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Perbandingan skor syarikat anda berbanding purata industri PMKS dalam kategori {assessment.companyProfile.sector}.
                </p>

                <div className="space-y-4">
                  {MOFASS_CATEGORIES.map((cat) => {
                    const userVal = assessment.categoryScores[cat.id]?.percentage || 0;
                    const benchmarkVal = cat.id === 'M' ? 52 : cat.id === 'O' ? 64 : cat.id === 'F' ? 58 : cat.id === 'A' ? 55 : cat.id === 'S_SALES' ? 60 : 48;
                    const diff = userVal - benchmarkVal;

                    return (
                      <div key={cat.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-slate-100 font-mono text-[11px] flex items-center justify-center text-slate-700">
                              {cat.letter}
                            </span>
                            {cat.name}
                          </span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-extrabold text-slate-900">{userVal}%</span>
                            <span className="text-slate-400 text-[11px]">/ penanda aras {benchmarkVal}%</span>
                            <span className={`text-[11px] font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              ({diff >= 0 ? `+${diff}%` : `${diff}%`})
                            </span>
                          </div>
                        </div>

                        {/* Bar comparison */}
                        <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          {/* Benchmark marker line */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                            style={{ left: `${benchmarkVal}%` }}
                            title={`Penanda aras: ${benchmarkVal}%`}
                          />
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              userVal >= 75 ? 'bg-indigo-600' : userVal >= 50 ? 'bg-sky-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${userVal}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Garis Penanda Aras: Purata PMKS Malaysia (SME Corp Baseline)</span>
                <span className="font-semibold text-indigo-600">6 Dimensi Lengkap</span>
              </div>
            </div>
          </div>

          {/* 6 Dimension Breakdown Cards */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Analisis Terperinci 6 Dimensi Kompetensi (MOFASS)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {MOFASS_CATEGORIES.map((cat) => {
                const scoreResult = assessment.categoryScores[cat.id];
                if (!scoreResult) return null;

                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm ${cat.badgeColor}`}>
                            {cat.letter}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {cat.shortName}
                            </h4>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                              {cat.code}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(scoreResult.status)}`}>
                          {scoreResult.status}
                        </span>
                      </div>

                      {/* Score display */}
                      <div className="my-3 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-slate-900 font-mono">
                          {scoreResult.percentage}%
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {scoreResult.score} / {scoreResult.maxScore} mata
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full ${
                            scoreResult.percentage >= 80
                              ? 'bg-emerald-500'
                              : scoreResult.percentage >= 60
                              ? 'bg-indigo-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${scoreResult.percentage}%` }}
                        />
                      </div>

                      {/* Strengths */}
                      {scoreResult.keyStrengths?.length > 0 && (
                        <div className="mb-3">
                          <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 mb-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Kekuatan Utama:
                          </div>
                          <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                            {scoreResult.keyStrengths.slice(0, 2).map((s, idx) => (
                              <li key={idx} className="truncate">{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Gaps */}
                      {scoreResult.keyGaps?.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-rose-800 flex items-center gap-1 mb-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Jurang Pembaikan:
                          </div>
                          <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                            {scoreResult.keyGaps.slice(0, 2).map((g, idx) => (
                              <li key={idx} className="truncate">{g}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Gred: {scoreResult.levelGrade}</span>
                      <span className="font-semibold text-indigo-600">10 Soalan</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 30-60-90 Day AI Growth Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Pelan Tindakan Berjadual Pembelajaran Mesin (AI)
              </div>
              <h2 className="text-xl font-bold">Pelan Strategi Pertumbuhan 30 - 60 - 90 Hari</h2>
              <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                Langkah tindakan diprioritikan berdasarkan kelemahan kritikal syarikat anda untuk memaksimumkan lonjakan hasil dan kecekapan operasi.
              </p>
            </div>

            <div className="shrink-0 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-center">
              <div className="text-[11px] text-indigo-200 uppercase font-mono">Kemajuan Pelan</div>
              <div className="text-2xl font-bold font-mono text-white">
                {Object.values(checkedTasks).filter(Boolean).length} / {assessment.growthRoadmap.length}
              </div>
              <div className="text-[10px] text-emerald-300">Tugasan Selesai</div>
            </div>
          </div>

          <div className="space-y-4">
            {assessment.growthRoadmap.map((item, idx) => {
              const isDone = !!checkedTasks[item.id];

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-6 border transition-all ${
                    isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/90 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(item.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border transition ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-indigo-500 bg-white'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {item.timeframe}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Keutamaan: {item.priority}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Dimensi: {item.category}
                          </span>
                        </div>
                        <h3 className={`text-base font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="ml-9 space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <strong className="text-indigo-900 font-semibold">Sasaran Impak:</strong> {item.impactArea}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                        <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                        Langkah Tindakan Spesifik:
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {item.actionDetails.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {item.suggestedToolsOrAgencies && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[11px] text-slate-400">Cadangan Alatan & Rakan:</span>
                        {item.suggestedToolsOrAgencies.map((tool, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: What-if Growth Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" /> Simulasi Pertumbuhan Masa Nyata
                </div>
                <h2 className="text-xl font-bold text-slate-900">Simulator Peningkatan Kompetensi PMKS</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Gerakkan peluncur di bawah untuk melihat unjuran impak kepada hasil perniagaan, pengurangan kos, dan kelayakan pembiayaan jika anda menambah baik kecekapan setiap dimensi.
                </p>
              </div>

              <button
                onClick={() =>
                  setSimulatedScores({
                    M: Math.min(100, (assessment.categoryScores.M?.percentage || 50) + 20),
                    O: Math.min(100, (assessment.categoryScores.O?.percentage || 50) + 20),
                    F: Math.min(100, (assessment.categoryScores.F?.percentage || 50) + 20),
                    A: Math.min(100, (assessment.categoryScores.A?.percentage || 50) + 20),
                    S_SALES: Math.min(100, (assessment.categoryScores.S_SALES?.percentage || 50) + 20),
                    S_SYSTEM: Math.min(100, (assessment.categoryScores.S_SYSTEM?.percentage || 50) + 20),
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                Simulasi Sasaran +20% Serentak
              </button>
            </div>

            {/* Projected Impact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 rounded-2xl border border-indigo-200">
                <div className="text-xs font-bold text-indigo-900 mb-1">Unjuran Skor Baru</div>
                <div className="text-3xl font-black font-mono text-indigo-700">
                  {simulatedAverage}%
                </div>
                <div className="text-[11px] text-indigo-600 mt-1">
                  Peningkatan +{Math.max(0, scoreDelta)}% mata
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-2xl border border-emerald-200">
                <div className="text-xs font-bold text-emerald-900 mb-1">Potensi Lonjakan Hasil</div>
                <div className="text-3xl font-black font-mono text-emerald-700">
                  +{projectedRevenueGain}%
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">
                  Pertumbuhan jualan tahunan
                </div>
              </div>

              <div className="bg-gradient-to-br from-sky-50 to-sky-100/50 p-4 rounded-2xl border border-sky-200">
                <div className="text-xs font-bold text-sky-900 mb-1">Pengurangan Kos & Ralat</div>
                <div className="text-3xl font-black font-mono text-sky-700">
                  -{projectedEfficiencyGain}%
                </div>
                <div className="text-[11px] text-sky-600 mt-1">
                  Kecekapan aliran kerja SOP
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-2xl border border-amber-200">
                <div className="text-xs font-bold text-amber-900 mb-1">Indeks Kelayakan Pembiayaan</div>
                <div className="text-3xl font-black font-mono text-amber-700">
                  {loanReadinessIndex}%
                </div>
                <div className="text-[11px] text-amber-600 mt-1">
                  Kesediaan kelulusan bank/geran
                </div>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {MOFASS_CATEGORIES.map((cat) => {
                const currentSim = simulatedScores[cat.id] ?? 50;
                const originalVal = assessment.categoryScores[cat.id]?.percentage || 50;

                return (
                  <div key={cat.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-md text-[11px] font-mono font-bold flex items-center justify-center ${cat.badgeColor}`}>
                          {cat.letter}
                        </span>
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-slate-400">Asal: {originalVal}%</span>
                        <span className="text-indigo-600 font-extrabold text-sm">{currentSim}%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={currentSim}
                      onChange={(e) =>
                        setSimulatedScores((prev) => ({
                          ...prev,
                          [cat.id]: parseInt(e.target.value) || 20,
                        }))
                      }
                      className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>20% (Asas)</span>
                      <span>60% (Sederhana)</span>
                      <span>100% (Maksimum)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SWOT Matrix */}
      {activeTab === 'swot' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Matriks Analisis SWOT Bersepadu PMKS
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sintesis menyeluruh kekuatan, kelemahan dalaman, peluang pasaran luaran, dan ancaman risiko industri untuk {assessment.companyProfile.companyName}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6">
                <h3 className="text-sm font-extrabold text-emerald-900 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Kekuatan Dalaman (Strengths)
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {assessment.swotAnalysis.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-6">
                <h3 className="text-sm font-extrabold text-rose-900 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Kelemahan Dalaman (Weaknesses)
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {assessment.swotAnalysis.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-6">
                <h3 className="text-sm font-extrabold text-sky-900 flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  Peluang Pasaran (Opportunities)
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {assessment.swotAnalysis.opportunities.map((opp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6">
                <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Ancaman Industri (Threats)
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {assessment.swotAnalysis.threats.map((thr, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{thr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Matched Government Programs */}
      {activeTab === 'grants' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Padanan Automatik Ekosistem Keusahawanan
              </div>
              <h2 className="text-xl font-bold text-slate-900">Program & Geran Sokongan Agensi Kerajaan Malaysia</h2>
              <p className="text-xs text-slate-500 mt-1">
                Berdasarkan kelemahan pada dimensi perniagaan anda, berikut adalah inisiatif rasmi yang boleh dimanfaatkan untuk membiayai penambahbaikan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {assessment.matchedGovPrograms?.map((prog, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wide">
                        {prog.agency}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {prog.supportType}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-2">
                      {prog.programName}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {prog.description}
                    </p>

                    <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                      <strong>Syarat Kelayakan:</strong> {prog.eligibility}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Padanan Sasaran MOFASS</span>
                    <span className="font-bold text-indigo-600 flex items-center gap-1">
                      Maklumat Lanjut <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Official Printable & Downloadable Professional Report */}
      {activeTab === 'report' && (
        <ProfessionalReportView assessment={assessment} />
      )}
    </div>
  );
};
