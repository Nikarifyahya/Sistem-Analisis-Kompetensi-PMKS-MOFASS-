import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  RefreshCw, 
  Copy, 
  Check, 
  Filter, 
  ArrowUpRight,
  PieChart,
  Users,
  Compass,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { AssessmentResult, UserProfile, MofassCategoryId } from '../types';
import { getAllAssessmentsAdmin, deleteAssessmentRecordAdmin } from '../services/assessmentRepo';
import { generateProfessionalPDF } from '../utils/pdfGenerator';
import { MOFASS_CATEGORIES } from '../data/mofassQuestions';

const ADMIN_EMAIL = 'nikarifyahya@gmail.com';

interface AdminPortalProps {
  user: UserProfile | null;
  onViewAssessment: (assessment: AssessmentResult) => void;
  onBackToApp?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  user,
  onViewAssessment,
  onBackToApp
}) => {
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedMaturity, setSelectedMaturity] = useState<string>('ALL');
  
  // Download state tracker: assessmentId -> boolean
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<AssessmentResult | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllAssessmentsAdmin();
      setAssessments(data);
    } catch (err) {
      console.error('Failed to load admin assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  // Flash action message
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage(null);
    }, 4000);
  };

  // Copy Reference ID
  const handleCopyRef = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast(`No Rujukan ${id} telah disalin!`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Handle PDF Download
  const handleDownloadPDF = async (assessment: AssessmentResult) => {
    try {
      setDownloadingId(assessment.id);
      await generateProfessionalPDF(assessment);
      showToast(`Salinan PDF lengkap bagi ${assessment.companyProfile.companyName} berjaya dimuat turun!`);
    } catch (error) {
      console.error('PDF download error:', error);
      showToast('Ralat semasa menjana PDF. Sila cuba sebentar lagi.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const success = await deleteAssessmentRecordAdmin(itemToDelete.id);
      if (success) {
        setAssessments((prev) => prev.filter((a) => a.id !== itemToDelete.id));
        showToast(`Laporan bagi syarikat ${itemToDelete.companyProfile.companyName} (${itemToDelete.id}) telah dipadam.`);
        setItemToDelete(null);
      } else {
        showToast('Gagal memadam laporan. Sila cuba lagi.', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Ralat memadam laporan dari pangkalan data.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Assessments for Table
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const matchesSearch = 
        !searchQuery ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.companyProfile?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.companyProfile?.ssmNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.userProfile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.companyProfile?.state?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector = selectedSector === 'ALL' || a.companyProfile?.sector === selectedSector;
      const matchesMaturity = selectedMaturity === 'ALL' || a.maturityLevel === selectedMaturity;

      return matchesSearch && matchesSector && matchesMaturity;
    });
  }, [assessments, searchQuery, selectedSector, selectedMaturity]);

  // Analytics Computation
  const analytics = useMemo(() => {
    if (assessments.length === 0) {
      return {
        totalReports: 0,
        uniqueCompanies: 0,
        avgOverallScore: 0,
        dominantMaturity: 'Tiada Data',
        categoryAverages: {} as Record<MofassCategoryId, { avgScore: number; avgPercent: number; count: number }>,
        maturityCounts: { 'Tahap 1': 0, 'Tahap 2': 0, 'Tahap 3': 0, 'Tahap 4': 0 } as Record<string, number>,
        sectorCounts: {} as Record<string, number>,
        stateCounts: {} as Record<string, number>,
        topGaps: [] as { gap: string; count: number }[],
      };
    }

    const totalReports = assessments.length;
    const companyNames = new Set(assessments.map((a) => a.companyProfile?.companyName?.trim() || a.id));
    const uniqueCompanies = companyNames.size;

    const sumPercentage = assessments.reduce((acc, a) => acc + (a.overallPercentage || 0), 0);
    const avgOverallScore = Math.round(sumPercentage / totalReports);

    // Maturity counts
    const maturityCounts: Record<string, number> = {
      'Tahap 1': 0,
      'Tahap 2': 0,
      'Tahap 3': 0,
      'Tahap 4': 0
    };

    assessments.forEach((a) => {
      if (a.maturityLevel && maturityCounts[a.maturityLevel] !== undefined) {
        maturityCounts[a.maturityLevel]++;
      }
    });

    let dominantMaturity = 'Tahap 1';
    let maxMaturityCount = -1;
    Object.entries(maturityCounts).forEach(([k, count]) => {
      if (count > maxMaturityCount) {
        maxMaturityCount = count;
        dominantMaturity = k;
      }
    });

    // Category Averages
    const categoryTotals: Record<string, { sumScore: number; sumPercent: number; count: number }> = {};
    assessments.forEach((a) => {
      if (a.categoryScores) {
        Object.entries(a.categoryScores).forEach(([catId, scoreObj]) => {
          if (!categoryTotals[catId]) {
            categoryTotals[catId] = { sumScore: 0, sumPercent: 0, count: 0 };
          }
          categoryTotals[catId].sumScore += scoreObj.score || 0;
          categoryTotals[catId].sumPercent += scoreObj.percentage || 0;
          categoryTotals[catId].count++;
        });
      }
    });

    const categoryAverages: Record<string, { avgScore: number; avgPercent: number; count: number }> = {};
    Object.entries(categoryTotals).forEach(([catId, data]) => {
      categoryAverages[catId] = {
        avgScore: Math.round((data.sumScore / data.count) * 10) / 10,
        avgPercent: Math.round(data.sumPercent / data.count),
        count: data.count
      };
    });

    // Sector counts
    const sectorCounts: Record<string, number> = {};
    assessments.forEach((a) => {
      const s = a.companyProfile?.sector || 'Lain-lain';
      sectorCounts[s] = (sectorCounts[s] || 0) + 1;
    });

    // State counts
    const stateCounts: Record<string, number> = {};
    assessments.forEach((a) => {
      const st = a.companyProfile?.state || 'Tidak Dinyatakan';
      stateCounts[st] = (stateCounts[st] || 0) + 1;
    });

    // Common Gaps
    const gapMap: Record<string, number> = {};
    assessments.forEach((a) => {
      if (a.categoryScores) {
        Object.values(a.categoryScores).forEach((cat) => {
          cat.keyGaps?.forEach((g) => {
            const cleanG = g.trim();
            gapMap[cleanG] = (gapMap[cleanG] || 0) + 1;
          });
        });
      }
    });

    const topGaps = Object.entries(gapMap)
      .map(([gap, count]) => ({ gap, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalReports,
      uniqueCompanies,
      avgOverallScore,
      dominantMaturity,
      categoryAverages,
      maturityCounts,
      sectorCounts,
      stateCounts,
      topGaps
    };
  }, [assessments]);

  // Export CSV
  const handleExportCSV = () => {
    if (assessments.length === 0) return;
    const headers = ['Bil', 'No Rujukan', 'Nama Syarikat', 'No SSM', 'Sektor', 'Saiz PMKS', 'Negeri', 'Skor %', 'Tahap Kematangan', 'Tarikh Dikeluarkan', 'Emel Pengguna'];
    const rows = assessments.map((a, idx) => [
      idx + 1,
      `"${a.id}"`,
      `"${a.companyProfile?.companyName || ''}"`,
      `"${a.companyProfile?.ssmNumber || ''}"`,
      `"${a.companyProfile?.sector || ''}"`,
      `"${a.companyProfile?.businessSize || ''}"`,
      `"${a.companyProfile?.state || ''}"`,
      a.overallPercentage || 0,
      `"${a.maturityLevel || ''}"`,
      `"${new Date(a.createdAt || Date.now()).toLocaleDateString('ms-MY')}"`,
      `"${a.userEmail || a.userProfile?.email || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Senarai_Laporan_MOFASS_PMKS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Senarai laporan berjaya dieksport ke CSV!');
  };

  // Helper date formatter
  const formatReportDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('ms-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // If not admin, display restricted view
  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-12 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Akses Pentadbir Dihadkan
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Halaman panel kawalan dan pengurusan laporan ini dihadkan khusus kepada akaun pentadbir berdaftar sahaja.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Akaun Pentadbir Dibenarkan:</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                {ADMIN_EMAIL}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Akaun Semasa Anda:</span>
              <span className="font-medium text-slate-800">
                {user?.email || 'Belum Log Masuk'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Kembali ke Aplikasi Utama
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Toast Alert */}
      {actionMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all border ${
          actionMessage.type === 'success'
            ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
            : 'bg-rose-900 text-rose-100 border-rose-700'
        }`}>
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Admin Portal Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 px-3 py-1 bg-white rounded-xl shadow-md flex items-center justify-center">
                <img 
                  src="/assets/aistudio/Logo_Impak_Niaga_9f4ce565.png" 
                  alt="Logo Impak Niaga" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-white">
                    Panel Kawalan Pentadbir MOFASS
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Pentadbir Sistem
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pengurusan Laporan Prestasi, Diagnostik MOFASS & Analisis Eksekutif PMKS
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-right">
                <div className="text-[10px] text-slate-400">Log Masuk Sebagai:</div>
                <div className="text-xs font-bold text-amber-300">{ADMIN_EMAIL}</div>
              </div>

              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
                title="Segar Semula Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
                <span>Segar Semula</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Eksport CSV</span>
              </button>
            </div>
          </div>

          {/* Primary View Navigation Switcher */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard & Analisis Tertentu</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Senarai Laporan Penilaian</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'list' ? 'bg-slate-900 text-amber-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {assessments.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD & ANALISIS TERTENTU                                       */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Reports */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Laporan</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{analytics.totalReports}</span>
                  <span className="text-xs text-slate-500 font-medium">penilaian</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Disimpan dalam Firestore
                </p>
              </div>

              {/* Unique Companies */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Syarikat PMKS Unik</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{analytics.uniqueCompanies}</span>
                  <span className="text-xs text-slate-500 font-medium">entiti berdaftar</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-500" /> Rentas pelbagai sektor ekonomi
                </p>
              </div>

              {/* Overall Average Score */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purata Skor MOFASS</span>
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{analytics.avgOverallScore}%</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    analytics.avgOverallScore >= 75 ? 'bg-emerald-100 text-emerald-800' :
                    analytics.avgOverallScore >= 60 ? 'bg-blue-100 text-blue-800' :
                    analytics.avgOverallScore >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {analytics.avgOverallScore >= 75 ? 'Cemerlang' : analytics.avgOverallScore >= 60 ? 'Mantap' : analytics.avgOverallScore >= 40 ? 'Berkembang' : 'Kritikal'}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Indeks purata kompetensi kebangsaan
                </p>
              </div>

              {/* Dominant Maturity Level */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tahap Dominan</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{analytics.dominantMaturity}</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  {analytics.maturityCounts[analytics.dominantMaturity] || 0} daripada {analytics.totalReports} syarikat dinilai
                </p>
              </div>
            </div>

            {/* Middle Section: 6 MOFASS Elements Breakdown & Maturity Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: 6 MOFASS Elements Average Performance */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      Analisis Purata 6 Elemen MOFASS PMKS
                    </h3>
                    <p className="text-xs text-slate-500">
                      Purata skor markah peratusan bagi setiap fungsi teras perniagaan
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    Skala: 0 - 100%
                  </span>
                </div>

                <div className="space-y-4">
                  {MOFASS_CATEGORIES.map((cat) => {
                    const avgData = analytics.categoryAverages[cat.id] || { avgScore: 0, avgPercent: 0 };
                    const pct = avgData.avgPercent;
                    
                    let barColor = 'bg-rose-500';
                    let statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                    let statusText = 'Kritikal';

                    if (pct >= 75) {
                      barColor = 'bg-emerald-500';
                      statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      statusText = 'Cemerlang';
                    } else if (pct >= 60) {
                      barColor = 'bg-indigo-500';
                      statusBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                      statusText = 'Memuaskan';
                    } else if (pct >= 40) {
                      barColor = 'bg-amber-500';
                      statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                      statusText = 'Perlu Pembaikan';
                    }

                    return (
                      <div key={cat.id} className="space-y-1.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-bold text-slate-800">
                            <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[11px] font-black text-indigo-700 shadow-2xs">
                              {cat.letter}
                            </span>
                            <span>{cat.name} ({cat.shortName})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                              {statusText}
                            </span>
                            <span className="font-extrabold text-slate-900 text-sm">
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.max(5, Math.min(100, pct))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                          <span>{cat.description}</span>
                          <span>Purata: {avgData.avgScore} / 50</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Col: Taburan Tahap Kematangan */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="pb-3 border-b border-slate-100 mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-indigo-600" />
                      Taburan Tahap Kematangan
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pecahan kompetensi mengikut gred rasmi MOFASS
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { 
                        level: 'Tahap 4', 
                        label: 'Unggul / Berdaya Saing', 
                        range: '80% - 100%', 
                        count: analytics.maturityCounts['Tahap 4'], 
                        color: 'bg-emerald-500', 
                        bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      },
                      { 
                        level: 'Tahap 3', 
                        label: 'Mantap / Stabil', 
                        range: '60% - 79%', 
                        count: analytics.maturityCounts['Tahap 3'], 
                        color: 'bg-sky-500', 
                        bgLight: 'bg-sky-50 text-sky-800 border-sky-200' 
                      },
                      { 
                        level: 'Tahap 2', 
                        label: 'Berkembang', 
                        range: '40% - 59%', 
                        count: analytics.maturityCounts['Tahap 2'], 
                        color: 'bg-amber-500', 
                        bgLight: 'bg-amber-50 text-amber-800 border-amber-200' 
                      },
                      { 
                        level: 'Tahap 1', 
                        label: 'Asas / Permulaan', 
                        range: '0% - 39%', 
                        count: analytics.maturityCounts['Tahap 1'], 
                        color: 'bg-rose-500', 
                        bgLight: 'bg-rose-50 text-rose-800 border-rose-200' 
                      },
                    ].map((lvl) => {
                      const sharePct = analytics.totalReports > 0 
                        ? Math.round((lvl.count / analytics.totalReports) * 100) 
                        : 0;
                      return (
                        <div key={lvl.level} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{lvl.level}: {lvl.label}</span>
                            <span className="text-[11px] font-black text-slate-700">{lvl.count} syarikat ({sharePct}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${lvl.color}`}
                              style={{ width: `${sharePct}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 flex justify-between">
                            <span>Julat Skor: {lvl.range}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                  <div className="font-bold text-indigo-900 mb-0.5">Implikasi Analisis:</div>
                  PMKS pada Tahap 1 & 2 memerlukan intervensi segera dari segi penstrukturan perakaunan digital dan SOP operasi sebelum layak memohon pembiayaan komersial berskala besar.
                </div>
              </div>
            </div>

            {/* Bottom Section: Sector Breakdown & Common Vulnerabilities / Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Sector Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Taburan Mengikut Sektor Industri PMKS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Penyertaan syarikat merentasi kluster perniagaan utama di Malaysia
                  </p>
                </div>

                <div className="space-y-2.5">
                  {Object.entries(analytics.sectorCounts).length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">Tiada rekod sektor</div>
                  ) : (
                    Object.entries(analytics.sectorCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([sector, count]) => {
                        const pct = analytics.totalReports > 0 ? Math.round((count / analytics.totalReports) * 100) : 0;
                        return (
                          <div key={sector} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                            <span className="font-semibold text-slate-800">{sector}</span>
                            <div className="flex items-center gap-2 font-bold text-slate-700">
                              <span>{count} syarikat</span>
                              <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-indigo-600">
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Common Vulnerabilities / Jurang Lazim PMKS */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Analisis Jurang & Kelemahan Lazim PMKS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cabaran operasi dan pengurusan yang paling kerap dihadapi oleh responden
                  </p>
                </div>

                <div className="space-y-2.5">
                  {analytics.topGaps.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">Tiada data jurang dicatatkan</div>
                  ) : (
                    analytics.topGaps.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100/70 text-xs">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <div className="grow">
                          <p className="font-semibold text-slate-800 leading-snug">{item.gap}</p>
                          <span className="text-[10px] text-rose-600 font-bold">
                            Dialami oleh {item.count} syarikat ({analytics.totalReports > 0 ? Math.round((item.count / analytics.totalReports) * 100) : 0}% daripada sampel)
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SENARAI LAPORAN PENILAIAN (TABLE VIEW)                              */}
        {/* ========================================================================= */}
        {activeTab === 'list' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative grow max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari No Rujukan, Nama Syarikat, atau No SSM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">Sektor:</span>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
                  >
                    <option value="ALL">Semua Sektor</option>
                    <option value="Makanan & Minuman (F&B)">Makanan & Minuman (F&B)</option>
                    <option value="Perkhidmatan (Services)">Perkhidmatan (Services)</option>
                    <option value="Peruncitan & Pemborongan">Peruncitan & Pemborongan</option>
                    <option value="Pembuatan / Pengilangan">Pembuatan / Pengilangan</option>
                    <option value="Teknologi & Digital">Teknologi & Digital</option>
                    <option value="Profesional & Konsultansi">Profesional & Konsultansi</option>
                    <option value="Pertanian & Asas Tani">Pertanian & Asas Tani</option>
                    <option value="Pembinaan & Kejuruteraan">Pembinaan & Kejuruteraan</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-500">Kematangan:</span>
                  <select
                    value={selectedMaturity}
                    onChange={(e) => setSelectedMaturity(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
                  >
                    <option value="ALL">Semua Tahap</option>
                    <option value="Tahap 4">Tahap 4 (Unggul)</option>
                    <option value="Tahap 3">Tahap 3 (Mantap)</option>
                    <option value="Tahap 2">Tahap 2 (Berkembang)</option>
                    <option value="Tahap 1">Tahap 1 (Asas)</option>
                  </select>
                </div>

                {(searchQuery || selectedSector !== 'ALL' || selectedMaturity !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSector('ALL');
                      setSelectedMaturity('ALL');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1"
                  >
                    Set Semula
                  </button>
                )}
              </div>
            </div>

            {/* Table of Assessments */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-4 text-center w-12">Bil</th>
                      <th className="py-3.5 px-4 min-w-[150px]">No Rujukan</th>
                      <th className="py-3.5 px-4 min-w-[240px]">Nama Syarikat</th>
                      <th className="py-3.5 px-4 min-w-[150px]">Tarikh Dikeluarkan</th>
                      <th className="py-3.5 px-4 text-center min-w-[280px]">Salinan Pdf Laporan lengkap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredAssessments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          {loading ? (
                            <div className="flex flex-col items-center gap-2">
                              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                              <span>Memuat turun pangkalan data laporan...</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <FileText className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                              <p className="font-semibold text-slate-600">Tiada laporan dijumpai.</p>
                              <p className="text-[11px] text-slate-400">Cuba ubah carian atau tetapan penapis anda.</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredAssessments.map((item, index) => {
                        const isDownloading = downloadingId === item.id;
                        const isCopied = copiedId === item.id;

                        // Maturity badge colors
                        let matBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                        if (item.maturityLevel === 'Tahap 4') matBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        else if (item.maturityLevel === 'Tahap 3') matBadge = 'bg-sky-50 text-sky-700 border-sky-200';
                        else if (item.maturityLevel === 'Tahap 2') matBadge = 'bg-amber-50 text-amber-700 border-amber-200';

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* 1. Bil */}
                            <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                              {index + 1}
                            </td>

                            {/* 2. No Rujukan */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-200/80 text-[11px]">
                                  {item.id}
                                </span>
                                <button
                                  onClick={() => handleCopyRef(item.id)}
                                  title="Salin No Rujukan"
                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition"
                                >
                                  {isCopied ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                Skor: <span className="font-bold text-slate-700">{item.overallPercentage}%</span>
                                {' • '}
                                <span className={`inline-block px-1.5 py-0.2 rounded border font-semibold ${matBadge}`}>
                                  {item.maturityLevel}
                                </span>
                              </div>
                            </td>

                            {/* 3. Nama Syarikat */}
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-slate-900 leading-snug">
                                {item.companyProfile?.companyName || 'Syarikat PMKS'}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                                {item.companyProfile?.ssmNumber && (
                                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                    {item.companyProfile.ssmNumber}
                                  </span>
                                )}
                                <span>•</span>
                                <span className="text-slate-600 font-medium">{item.companyProfile?.sector}</span>
                                {item.companyProfile?.state && (
                                  <>
                                    <span>•</span>
                                    <span>{item.companyProfile.state}</span>
                                  </>
                                )}
                              </div>
                            </td>

                            {/* 4. Tarikh Dikeluarkan */}
                            <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                              {formatReportDate(item.createdAt)}
                            </td>

                            {/* 5. Salinan Pdf Laporan lengkap (Actions: Lihat Laporan | Muat Turun | Padam) */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Butang 1: Lihat Laporan */}
                                <button
                                  onClick={() => onViewAssessment(item)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-indigo-300 transition shadow-2xs active:scale-95"
                                  title="Lihat Laporan Interaktif"
                                >
                                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Lihat Laporan</span>
                                </button>

                                {/* Butang 2: Muat Turun (Official PDF via jsPDF) */}
                                <button
                                  onClick={() => handleDownloadPDF(item)}
                                  disabled={isDownloading}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
                                  title="Muat Turun Salinan PDF Lengkap"
                                >
                                  {isDownloading ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Download className="w-3.5 h-3.5" />
                                  )}
                                  <span>{isDownloading ? 'Menjana...' : 'Muat Turun'}</span>
                                </button>

                                {/* Butang 3: Padam */}
                                <button
                                  onClick={() => setItemToDelete(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 hover:border-rose-300 transition active:scale-95"
                                  title="Padam Laporan Ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Padam</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer info */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <div>
                  Menunjukkan <span className="font-bold text-slate-800">{filteredAssessments.length}</span> daripada <span className="font-bold text-slate-800">{assessments.length}</span> jumlah laporan berdaftar
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pengesyoran automatik berasaskan ML & piawaian MOFASS</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                Sahkan Pemadaman Laporan?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adakah anda pasti ingin memadam laporan penilaian berikut secara kekal dari pangkalan data?
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 text-left">
              <div className="font-bold text-slate-900">
                {itemToDelete.companyProfile?.companyName}
              </div>
              <div className="text-slate-500 flex items-center gap-2">
                <span>No Rujukan:</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  {itemToDelete.id}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Tarikh: {formatReportDate(itemToDelete.createdAt)}
              </div>
            </div>

            <p className="text-[11px] text-rose-600 font-medium">
              Amaran: Tindakan ini tidak boleh dikembalikan. Rekod dan salinan laporan digital ini akan dikeluarkan serta-merta.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-200 transition flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeleting ? 'Memadam...' : 'Ya, Padam Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
