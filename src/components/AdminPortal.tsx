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
  PieChart, 
  Users, 
  FileSpreadsheet, 
  AlertCircle,
  Landmark,
  MapPin,
  Calendar,
  Award,
  Wallet,
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { AssessmentResult, UserProfile, MofassCategoryId } from '../types';
import { 
  getAllAssessmentsAdmin, 
  getAllCompaniesAdmin,
  deleteAssessmentRecordAdmin,
  subscribeAllAssessmentsAdmin,
  subscribeAllCompaniesAdmin,
  RegisteredCompanyRecord 
} from '../services/assessmentRepo';
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
  const [companies, setCompanies] = useState<RegisteredCompanyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'companies'>('dashboard');
  
  // Dashboard Sub-navigation for quick jumping
  const [dashboardSection, setDashboardSection] = useState<'all' | 'credit' | 'geo' | 'trend' | 'grants'>('all');
  
  // Table search & filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [companySearchQuery, setCompanySearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedMaturity, setSelectedMaturity] = useState<string>('ALL');
  
  // Geo region filter
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  // Download state tracker: assessmentId -> boolean
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<AssessmentResult | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
  const prevCountRef = React.useRef<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assessmentsData, companiesData] = await Promise.all([
        getAllAssessmentsAdmin(),
        getAllCompaniesAdmin()
      ]);
      setAssessments(assessmentsData);
      setCompanies(companiesData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);
    // Realtime Firestore onSnapshot + in-browser live subscription for Assessments
    const unsubAssessments = subscribeAllAssessmentsAdmin((updatedList) => {
      if (prevCountRef.current !== null && updatedList.length > prevCountRef.current) {
        const latest = updatedList[0];
        showToast(`Laporan baharu diterima: ${latest.companyProfile?.companyName || 'Syarikat PMKS'} (${latest.id})!`, 'success');
      }
      prevCountRef.current = updatedList.length;
      setAssessments(updatedList);
      setLoading(false);
    });

    // Realtime Firestore onSnapshot for Company Profiles
    const unsubCompanies = subscribeAllCompaniesAdmin((updatedCompanies) => {
      setCompanies(updatedCompanies);
    });

    return () => {
      unsubAssessments();
      unsubCompanies();
    };
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

  // Filtered Registered PMKS Companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const q = companySearchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        c.companyName?.toLowerCase().includes(q) ||
        c.ssmNumber?.toLowerCase().includes(q) ||
        c.userFullName?.toLowerCase().includes(q) ||
        c.userEmail?.toLowerCase().includes(q) ||
        c.userPhone?.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q) ||
        c.sector?.toLowerCase().includes(q);

      const matchesSector = selectedSector === 'ALL' || c.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [companies, companySearchQuery, selectedSector]);

  // =========================================================================
  // ADVANCED ANALYTICS COMPUTATION
  // =========================================================================
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
        // 1. Credit Readiness
        creditStats: {
          avgCreditScore: 0,
          primeCount: 0,
          borderlineCount: 0,
          highRiskCount: 0,
          totalFinancingEligibleRM: 'RM 0',
        },
        // 2. Geo Distribution
        geoRegions: {} as Record<string, { count: number; states: { name: string; count: number }[] }>,
        // 3. Trajectory
        trajectory: [] as { monthKey: string; label: string; count: number; cumulative: number; avgScore: number }[],
        // 4. Grants Demand
        grantsDemand: [] as { agency: string; program: string; matches: number; percent: number; maxGrant: string; focus: string }[],
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

    // Top Gaps
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

    // -----------------------------------------------------------------------
    // 1. ANALISIS KESEDIAAN PEMBIAYAAN AGREGAT (PORTFOLIO CREDIT READINESS)
    // -----------------------------------------------------------------------
    let primeCount = 0;
    let borderlineCount = 0;
    let highRiskCount = 0;
    let totalCreditScoreSum = 0;
    let aggregatePotentialRM = 0;

    assessments.forEach((a) => {
      const finScore = a.categoryScores?.F?.percentage || 40;
      const opScore = a.categoryScores?.O?.percentage || 40;
      const adminScore = a.categoryScores?.A?.percentage || 40;
      const overall = a.overallPercentage || 40;
      const years = a.companyProfile?.yearsInOperation || 1;

      // Credit Readiness Score: Finance (35%), Overall (35%), Operations & Admin (20%), Age (10%)
      const ageBonus = years >= 5 ? 10 : years >= 3 ? 7 : 4;
      const creditScore = Math.min(100, Math.round(
        (finScore * 0.35) + (overall * 0.35) + ((opScore + adminScore) / 2 * 0.20) + ageBonus
      ));

      totalCreditScoreSum += creditScore;

      if (creditScore >= 70) {
        primeCount++;
        aggregatePotentialRM += 850000; // Estimated loan eligibility for prime PMKS
      } else if (creditScore >= 45) {
        borderlineCount++;
        aggregatePotentialRM += 250000; // Estimated loan eligibility for borderline
      } else {
        highRiskCount++;
        aggregatePotentialRM += 50000;  // Micro-credit support
      }
    });

    const avgCreditScore = Math.round(totalCreditScoreSum / totalReports);
    const totalFinancingEligibleRM = `RM ${(aggregatePotentialRM / 1000000).toFixed(2)} Juta`;

    // -----------------------------------------------------------------------
    // 2. PETA TABURAN GEOGRAFI PMKS (REGIONAL DISTRIBUTION)
    // -----------------------------------------------------------------------
    const regionMapping: Record<string, string> = {
      'Selangor': 'Wilayah Tengah',
      'Kuala Lumpur': 'Wilayah Tengah',
      'W.P. Kuala Lumpur': 'Wilayah Tengah',
      'Putrajaya': 'Wilayah Tengah',
      'W.P. Putrajaya': 'Wilayah Tengah',
      'Johor': 'Wilayah Selatan',
      'Melaka': 'Wilayah Selatan',
      'Negeri Sembilan': 'Wilayah Selatan',
      'Pulau Pinang': 'Wilayah Utara',
      'Perak': 'Wilayah Utara',
      'Kedah': 'Wilayah Utara',
      'Perlis': 'Wilayah Utara',
      'Kelantan': 'Pantai Timur',
      'Terengganu': 'Pantai Timur',
      'Pahang': 'Pantai Timur',
      'Sabah': 'Borneo (Sabah & Sarawak)',
      'Sarawak': 'Borneo (Sabah & Sarawak)',
      'Labuan': 'Borneo (Sabah & Sarawak)',
      'W.P. Labuan': 'Borneo (Sabah & Sarawak)',
    };

    const geoRegions: Record<string, { count: number; states: Record<string, number> }> = {
      'Wilayah Tengah': { count: 0, states: {} },
      'Wilayah Utara': { count: 0, states: {} },
      'Wilayah Selatan': { count: 0, states: {} },
      'Pantai Timur': { count: 0, states: {} },
      'Borneo (Sabah & Sarawak)': { count: 0, states: {} },
      'Lain-lain': { count: 0, states: {} },
    };

    assessments.forEach((a) => {
      const state = a.companyProfile?.state || 'Lain-lain';
      const reg = regionMapping[state] || 'Lain-lain';
      if (!geoRegions[reg]) {
        geoRegions[reg] = { count: 0, states: {} };
      }
      geoRegions[reg].count++;
      geoRegions[reg].states[state] = (geoRegions[reg].states[state] || 0) + 1;
    });

    const formattedGeoRegions: Record<string, { count: number; states: { name: string; count: number }[] }> = {};
    Object.entries(geoRegions).forEach(([reg, data]) => {
      formattedGeoRegions[reg] = {
        count: data.count,
        states: Object.entries(data.states)
          .map(([name, c]) => ({ name, count: c }))
          .sort((a, b) => b.count - a.count)
      };
    });

    // -----------------------------------------------------------------------
    // 3. ANALISIS TREN PENILAIAN (MONTHLY ASSESSMENT TRAJECTORY)
    // -----------------------------------------------------------------------
    const monthOrder: string[] = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];
    const monthNamesBM: Record<string, string> = {
      '2026-06': 'Jun 2026',
      '2026-07': 'Jul 2026',
      '2026-08': 'Ogos 2026',
      '2026-09': 'Sep 2026',
      '2026-10': 'Okt 2026',
      '2026-11': 'Nov 2026',
      '2026-12': 'Dis 2026',
    };

    const monthMap: Record<string, { count: number; scoreSum: number }> = {};
    monthOrder.forEach((m) => {
      monthMap[m] = { count: 0, scoreSum: 0 };
    });

    assessments.forEach((a) => {
      const d = a.createdAt ? new Date(a.createdAt) : new Date();
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yr}-${mo}`;
      if (!monthMap[key]) {
        monthMap[key] = { count: 0, scoreSum: 0 };
      }
      monthMap[key].count++;
      monthMap[key].scoreSum += a.overallPercentage || 0;
    });

    // Build timeline sorted
    const activeMonths = monthOrder.filter((m) => monthMap[m] && monthMap[m].count > 0);
    const monthsToUse = activeMonths.length > 0 ? activeMonths : ['2026-08', '2026-09', '2026-10', '2026-11'];

    let runningCumulative = 0;
    const trajectory = monthsToUse.map((mKey) => {
      const data = monthMap[mKey] || { count: 0, scoreSum: 0 };
      runningCumulative += data.count;
      const avgScore = data.count > 0 ? Math.round(data.scoreSum / data.count) : 0;
      return {
        monthKey: mKey,
        label: monthNamesBM[mKey] || mKey,
        count: data.count,
        cumulative: runningCumulative,
        avgScore,
      };
    });

    // -----------------------------------------------------------------------
    // 4. PADANAN GERAN KERAJAAN TERPILIH (AGGREGATED GRANT DEMAND)
    // -----------------------------------------------------------------------
    const grantsDemand = [
      {
        agency: 'SME Corp Malaysia',
        program: 'Program Peningkatan Keupayaan PMKS (BAP 3.0)',
        matches: assessments.filter((a) => (a.overallPercentage || 0) >= 40 && (a.overallPercentage || 0) <= 80).length,
        maxGrant: 'Geran Sepadan sehingga RM 500,000',
        focus: 'Automasi Operasi, Perakaunan Berkanun & Pensijilan Kualiti'
      },
      {
        agency: 'MDEC (Malaysia Digital)',
        program: 'Geran Digitalisasi PMKS (MDAP / Smart Tech)',
        matches: assessments.filter((a) => (a.categoryScores?.S_SYSTEM?.percentage || 50) <= 65).length,
        maxGrant: 'Geran sehingga RM 20,000 - RM 100,000',
        focus: 'Integrasi e-Invois LHDN, Cloud POS & Automasi CRM'
      },
      {
        agency: 'JAKIM & HDC',
        program: 'Inisiatif Pemacuan Industri Halal & MeSTI',
        matches: assessments.filter((a) => a.companyProfile?.sector === 'Makanan & Minuman (F&B)' || (a.categoryScores?.O?.percentage || 50) <= 65).length,
        maxGrant: 'Subsidi Bimbingan & Kos Audit Pensijilan',
        focus: 'Pematuhan Keselamatan Makanan, Halal & Akses Pasaran'
      },
      {
        agency: 'MATRADE',
        program: 'Geran Pembangunan Pasaran Antarabangsa (MDG)',
        matches: assessments.filter((a) => (a.overallPercentage || 0) >= 60 || a.companyProfile?.businessSize?.includes('Sederhana')).length,
        maxGrant: 'Geran Pembayaran Balik sehingga RM 300,000',
        focus: 'Penyertaan Misi Dagang Antarabangsa & Ekspo Luar Negara'
      },
      {
        agency: 'TEKUN Nasional / MARA',
        program: 'Skim Pembiayaan Mikro & Bimbingan Usahawan',
        matches: assessments.filter((a) => (a.overallPercentage || 0) < 55 || a.companyProfile?.businessSize?.includes('Mikro')).length,
        maxGrant: 'Pembiayaan Mudah RM 10,000 - RM 100,000',
        focus: 'Suntikan Modal Pusingan & Pembelian Mesin Asas'
      },
      {
        agency: 'Credit Guarantee Corp (CGC) & SME Bank',
        program: 'Skim Jaminan Kredit Portfolio & Pinjaman Hijau',
        matches: assessments.filter((a) => (a.overallPercentage || 0) >= 65).length,
        maxGrant: 'Kemudahan Jaminan Bank sehingga RM 2,000,000',
        focus: 'Jaminan Pembiayaan Tanpa Cagaran Hartanah Penuh'
      }
    ].map((g) => ({
      ...g,
      percent: totalReports > 0 ? Math.round((g.matches / totalReports) * 100) : 0
    })).sort((a, b) => b.matches - a.matches);

    return {
      totalReports,
      uniqueCompanies,
      avgOverallScore,
      dominantMaturity,
      categoryAverages,
      maturityCounts,
      sectorCounts,
      stateCounts,
      topGaps,
      creditStats: {
        avgCreditScore,
        primeCount,
        borderlineCount,
        highRiskCount,
        totalFinancingEligibleRM,
      },
      geoRegions: formattedGeoRegions,
      trajectory,
      grantsDemand
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="h-11 sm:h-12 px-2.5 sm:px-3 py-1 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0">
                <img 
                  src="/assets/aistudio/Logo_Impak_Niaga_9f4ce565.png" 
                  alt="Logo Impak Niaga" 
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                    Panel Pentadbir MOFASS PMKS
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Pentadbir Sistem
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Analisis Eksekutif Portfolio, Kesediaan Pembiayaan & Salinan Laporan PMKS
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl text-left sm:text-right grow sm:grow-0">
                <div className="text-[10px] text-slate-400">Log Masuk Sebagai:</div>
                <div className="text-xs font-bold text-amber-300 truncate max-w-[200px]">{ADMIN_EMAIL}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition active:scale-95"
                  title="Segar Semula Data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
                  <span className="hidden sm:inline">Segar Semula</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Eksport CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Primary View Navigation Switcher */}
          <div className="flex items-center gap-2 mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-800 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard & Analisis Eksekutif</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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

            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'companies'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Profil Syarikat Berdaftar</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'companies' ? 'bg-slate-900 text-amber-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {companies.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD & ANALISIS TERTENTU                                       */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Quick Section Anchor Filter Bar (Mobile & Desktop friendly) */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">Pintas:</span>
              <button
                onClick={() => setDashboardSection('all')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  dashboardSection === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua Analisis
              </button>
              <button
                onClick={() => setDashboardSection('credit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  dashboardSection === 'credit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Kesediaan Pembiayaan</span>
              </button>
              <button
                onClick={() => setDashboardSection('geo')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  dashboardSection === 'geo'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>2. Taburan Geografi</span>
              </button>
              <button
                onClick={() => setDashboardSection('trend')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  dashboardSection === 'trend'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-indigo-300" />
                <span>3. Tren Penilaian Bulanan</span>
              </button>
              <button
                onClick={() => setDashboardSection('grants')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  dashboardSection === 'grants'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>4. Padanan Geran Kerajaan</span>
              </button>
            </div>

            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Reports */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Laporan</span>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">{analytics.totalReports}</span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium">laporan</span>
                </div>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 truncate">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> Rekod MOFASS aktif
                </p>
              </div>

              {/* Unique Companies */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Syarikat PMKS</span>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">{analytics.uniqueCompanies}</span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium">entiti unik</span>
                </div>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 truncate">
                  <Users className="w-3 h-3 text-emerald-500 shrink-0" /> Merentasi Malaysia
                </p>
              </div>

              {/* Overall Average Score */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Purata MOFASS</span>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">{analytics.avgOverallScore}%</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    analytics.avgOverallScore >= 75 ? 'bg-emerald-100 text-emerald-800' :
                    analytics.avgOverallScore >= 60 ? 'bg-blue-100 text-blue-800' :
                    analytics.avgOverallScore >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {analytics.avgOverallScore >= 75 ? 'Cemerlang' : analytics.avgOverallScore >= 60 ? 'Mantap' : analytics.avgOverallScore >= 40 ? 'Berkembang' : 'Kritikal'}
                  </span>
                </div>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-500 truncate">
                  Indeks purata kompetensi
                </p>
              </div>

              {/* Dominant Maturity Level */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Tahap Dominan</span>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{analytics.dominantMaturity}</span>
                </div>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-500 truncate">
                  {analytics.maturityCounts[analytics.dominantMaturity] || 0} syarikat dominan
                </p>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 1. ANALISIS KESEDIAAN PEMBIAYAAN AGREGAT (PORTFOLIO CREDIT READINESS)      */}
            {/* ========================================================================= */}
            {(dashboardSection === 'all' || dashboardSection === 'credit') && (
              <div className="bg-white rounded-3xl border border-emerald-200/90 p-5 sm:p-7 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50/50 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          1. Analisis Kesediaan Pembiayaan Agregat (Portfolio Credit Readiness)
                        </h3>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                          Penilaian Kelayakan Bank & CGC
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Indeks kesediaan kredit portfolio PMKS berdasarkan kestabilan kewangan, sistem audit, dan kematangan operasi.
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-900 text-white px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0 shadow-sm">
                    <Wallet className="w-5 h-5 text-emerald-300" />
                    <div>
                      <div className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">Potensi Pembiayaan Layak</div>
                      <div className="text-base sm:text-lg font-black font-mono text-emerald-300">
                        {analytics.creditStats.totalFinancingEligibleRM}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Tier Credit Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {/* Tier 1: Prime / High Readiness */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">Kelayakan Tinggi (Prime)</span>
                      <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        Skor &gt; 70%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-700">{analytics.creditStats.primeCount}</span>
                      <span className="text-xs text-slate-500 font-bold">
                        syarikat ({analytics.totalReports > 0 ? Math.round((analytics.creditStats.primeCount / analytics.totalReports) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
                      <p className="font-semibold text-emerald-900">Profil Status:</p>
                      <p>Sedia memohon pembiayaan bank komersial, kemudahan jaminan CGC, dan geran padanan SME Corp sehingga RM 500k.</p>
                      <div className="pt-1 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Rekod perakaunan & kawalan tunai mantap
                      </div>
                    </div>
                  </div>

                  {/* Tier 2: Borderline / Moderate Risk */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-900 uppercase tracking-wider">Kelayakan Sederhana (Borderline)</span>
                      <span className="text-xs font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                        Skor 45% - 69%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-700">{analytics.creditStats.borderlineCount}</span>
                      <span className="text-xs text-slate-500 font-bold">
                        syarikat ({analytics.totalReports > 0 ? Math.round((analytics.creditStats.borderlineCount / analytics.totalReports) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
                      <p className="font-semibold text-amber-900">Profil Status:</p>
                      <p>Perlu pengukuhan dokumentasi kewangan sebelum permohonan bank. Layak untuk skim pembangunan institusi (SME Bank / MARA).</p>
                      <div className="pt-1 text-[10px] text-amber-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Perlu penstrukturan penyata akaun
                      </div>
                    </div>
                  </div>

                  {/* Tier 3: High Risk / Early Intervention */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-50/80 to-white border border-rose-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-900 uppercase tracking-wider">Perlu Intervensi Awal</span>
                      <span className="text-xs font-black bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                        Skor &lt; 45%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-rose-700">{analytics.creditStats.highRiskCount}</span>
                      <span className="text-xs text-slate-500 font-bold">
                        syarikat ({analytics.totalReports > 0 ? Math.round((analytics.creditStats.highRiskCount / analytics.totalReports) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
                      <p className="font-semibold text-rose-900">Profil Status:</p>
                      <p>Risiko penolakan pinjaman komersial tinggi. Disyorkan beralih kepada skim mikro-kredit TEKUN atau latihan pengurusan kos asas.</p>
                      <div className="pt-1 text-[10px] text-rose-700 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Rekod kewangan & SOP belum lengkap
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. PETA TABURAN GEOGRAFI PMKS (GEOGRAPHICAL DISTRIBUTION)                  */}
            {/* ========================================================================= */}
            {(dashboardSection === 'all' || dashboardSection === 'geo') && (
              <div className="bg-white rounded-3xl border border-sky-200/90 p-5 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200 shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          2. Peta Taburan Geografi PMKS (Geographical Distribution)
                        </h3>
                        <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300">
                          Liputan Negeri & Wilayah
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Taburan syarikat berdaftar mengikut zon ekonomi dan negeri di seluruh Malaysia.
                      </p>
                    </div>
                  </div>

                  {/* Region Filter Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    <button
                      onClick={() => setSelectedRegion('ALL')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                        selectedRegion === 'ALL'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Semua
                    </button>
                    {Object.keys(analytics.geoRegions).map((reg) => (
                      <button
                        key={reg}
                        onClick={() => setSelectedRegion(reg)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition ${
                          selectedRegion === reg
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {reg.replace(' (Sabah & Sarawak)', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Regional Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analytics.geoRegions)
                    .filter(([reg]) => selectedRegion === 'ALL' || selectedRegion === reg)
                    .map(([regName, data]) => {
                      const share = analytics.totalReports > 0 ? Math.round((data.count / analytics.totalReports) * 100) : 0;
                      return (
                        <div key={regName} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{regName}</span>
                            <span className="text-xs font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                              {data.count} PMKS ({share}%)
                            </span>
                          </div>

                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-sky-500 rounded-full transition-all"
                              style={{ width: `${Math.max(5, share)}%` }}
                            />
                          </div>

                          {/* States in this region */}
                          <div className="space-y-1.5 pt-1">
                            {data.states.length === 0 ? (
                              <div className="text-[11px] text-slate-400 italic">Tiada penyertaan setakat ini</div>
                            ) : (
                              data.states.map((st) => (
                                <div key={st.name} className="flex items-center justify-between text-[11px] text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                                  <span className="font-semibold flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-sky-500" />
                                    {st.name}
                                  </span>
                                  <span className="font-bold text-slate-900">{st.count} syarikat</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. ANALISIS TREN PENILAIAN BULANAN (ASSESSMENT TRAJECTORY)                 */}
            {/* ========================================================================= */}
            {(dashboardSection === 'all' || dashboardSection === 'trend') && (
              <div className="bg-white rounded-3xl border border-indigo-200/90 p-5 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          3. Analisis Tren Penilaian (Monthly Assessment Trajectory)
                        </h3>
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-300">
                          Kadar Penyertaan & Skor
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Kekerapan penyelesaian diagnostik MOFASS dan evolusi purata kompetensi mengikut bulan.
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
                    Jumlah Kumulatif: <span className="text-indigo-600 font-extrabold">{analytics.totalReports} Laporan</span>
                  </div>
                </div>

                {/* Trajectory Timeline Cards & Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {analytics.trajectory.map((item, idx) => {
                    const maxCount = Math.max(...analytics.trajectory.map((t) => t.count), 1);
                    const barHeightPct = Math.round((item.count / maxCount) * 100);

                    return (
                      <div key={item.monthKey} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-900">{item.label}</span>
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                            Bulan #{idx + 1}
                          </span>
                        </div>

                        {/* Visual Bar Height Indicator */}
                        <div className="h-16 flex items-end justify-center py-1">
                          <div 
                            className="w-12 bg-gradient-to-t from-indigo-600 to-sky-400 rounded-t-xl transition-all duration-500 relative group flex items-center justify-center text-[10px] text-white font-extrabold shadow-sm"
                            style={{ height: `${Math.max(25, barHeightPct)}%` }}
                          >
                            {item.count}
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] pt-1 border-t border-slate-200/60">
                          <div className="flex justify-between text-slate-600">
                            <span>Penilaian Siap:</span>
                            <span className="font-bold text-slate-900">{item.count} unit</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Purata Skor:</span>
                            <span className="font-bold text-indigo-700">{item.avgScore}%</span>
                          </div>
                          <div className="flex justify-between text-slate-500 text-[10px]">
                            <span>Kumulatif:</span>
                            <span className="font-bold text-slate-700">{item.cumulative}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. PADANAN GERAN KERAJAAN TERPILIH (AGGREGATED GRANT DEMAND)               */}
            {/* ========================================================================= */}
            {(dashboardSection === 'all' || dashboardSection === 'grants') && (
              <div className="bg-white rounded-3xl border border-amber-200/90 p-5 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          4. Padanan Geran Kerajaan Terpilih (Aggregated Grant Demand)
                        </h3>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                          Sokongan Agensi Rasmi
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Analisis potensi agihan geran dan dana pembiayaan kerajaan yang paling relevan dengan profil responden PMKS.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                    SME Corp • MDEC • MATRADE • JAKIM
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.grantsDemand.map((grant, idx) => (
                    <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                            {grant.agency}
                          </span>
                          <span className="font-mono font-bold text-slate-700 text-xs">
                            {grant.matches} Syarikat ({grant.percent}%)
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug">
                          {grant.program}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {grant.focus}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Bentuk Bantuan:</div>
                        <div className="text-xs font-extrabold text-indigo-700">
                          {grant.maxGrant}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Middle Section: 6 MOFASS Elements Breakdown & Maturity Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: 6 MOFASS Elements Average Performance */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
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
                      <div key={cat.id} className="space-y-1.5 bg-slate-50/60 p-3 sm:p-3.5 rounded-xl border border-slate-100">
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
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col justify-between">
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

                  <div className="space-y-3">
                    {[
                      { 
                        level: 'Tahap 4', 
                        label: 'Unggul / Berdaya Saing', 
                        range: '80% - 100%', 
                        count: analytics.maturityCounts['Tahap 4'], 
                        color: 'bg-emerald-500', 
                      },
                      { 
                        level: 'Tahap 3', 
                        label: 'Mantap / Stabil', 
                        range: '60% - 79%', 
                        count: analytics.maturityCounts['Tahap 3'], 
                        color: 'bg-sky-500', 
                      },
                      { 
                        level: 'Tahap 2', 
                        label: 'Berkembang', 
                        range: '40% - 59%', 
                        count: analytics.maturityCounts['Tahap 2'], 
                        color: 'bg-amber-500', 
                      },
                      { 
                        level: 'Tahap 1', 
                        label: 'Asas / Permulaan', 
                        range: '0% - 39%', 
                        count: analytics.maturityCounts['Tahap 1'], 
                        color: 'bg-rose-500', 
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
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
                <div className="pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Taburan Mengikut Sektor Industri PMKS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Penyertaan syarikat merentasi kluster perniagaan utama di Malaysia
                  </p>
                </div>

                <div className="space-y-2">
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
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
                <div className="pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Analisis Jurang & Kelemahan Lazim PMKS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cabaran operasi dan pengurusan yang paling kerap dihadapi oleh responden
                  </p>
                </div>

                <div className="space-y-2">
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
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500 hidden sm:inline">Sektor:</span>
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

                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-500 hidden sm:inline">Kematangan:</span>
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
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1.5"
                  >
                    Set Semula
                  </button>
                )}
              </div>
            </div>

            {/* Table of Assessments (Desktop table + Mobile Cards responsive) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
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

              {/* Mobile Responsive Cards View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredAssessments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 px-4">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    <p className="font-semibold text-slate-600 text-xs">Tiada laporan dijumpai.</p>
                  </div>
                ) : (
                  filteredAssessments.map((item, index) => {
                    const isDownloading = downloadingId === item.id;
                    const isCopied = copiedId === item.id;

                    return (
                      <div key={item.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              Bil #{index + 1} • {formatReportDate(item.createdAt)}
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">
                              {item.companyProfile?.companyName}
                            </h4>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {item.companyProfile?.ssmNumber} • {item.companyProfile?.sector}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                              {item.overallPercentage}%
                            </span>
                            <div className="text-[10px] text-slate-500 font-bold mt-1">
                              {item.maturityLevel}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="font-mono text-slate-700 text-[11px] truncate">{item.id}</span>
                          <button
                            onClick={() => handleCopyRef(item.id)}
                            className="p-1 text-slate-500 hover:text-indigo-600 transition"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Mobile Action Buttons (3 full touch targets) */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <button
                            onClick={() => onViewAssessment(item)}
                            className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Lihat</span>
                          </button>

                          <button
                            onClick={() => handleDownloadPDF(item)}
                            disabled={isDownloading}
                            className="py-2 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition disabled:opacity-50"
                          >
                            {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={() => setItemToDelete(item)}
                            className="py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition border border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Padam</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
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

        {/* ========================================================================= */}
        {/* TAB 3: PROFIL SYARIKAT PMKS BERDAFTAR                                    */}
        {/* ========================================================================= */}
        {activeTab === 'companies' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header / Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Direktori Berpusat PMKS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Profil Syarikat PMKS Berdaftar
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Semua profil perniagaan dan maklumat usahawan yang diisi dalam sistem disegerakkan secara automatik ke pelayan Firestore secara masa nyata.
                </p>
              </div>

              {/* Quick Summary Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Jumlah Syarikat</div>
                  <div className="text-xl font-black text-slate-900">{companies.length}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl text-center">
                  <div className="text-[10px] uppercase font-bold text-emerald-700">Telah Buat Penilaian</div>
                  <div className="text-xl font-black text-emerald-800">
                    {companies.filter((c) => c.lastAssessmentId || assessments.some((a) => a.userId === c.userId || a.companyProfile?.companyName?.toLowerCase() === c.companyName?.toLowerCase())).length}
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl text-center">
                  <div className="text-[10px] uppercase font-bold text-amber-700">Menunggu Penilaian</div>
                  <div className="text-xl font-black text-amber-800">
                    {Math.max(0, companies.length - companies.filter((c) => c.lastAssessmentId || assessments.some((a) => a.userId === c.userId || a.companyProfile?.companyName?.toLowerCase() === c.companyName?.toLowerCase())).length)}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Search Input */}
                <div className="relative grow">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    placeholder="Cari nama syarikat, no SSM, nama pemilik, emel, no tel, atau negeri..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-hidden font-medium transition"
                  />
                  {companySearchQuery && (
                    <button
                      onClick={() => setCompanySearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Batal
                    </button>
                  )}
                </div>

                {/* Sektor Dropdown Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500 shrink-0" />
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="ALL">Semua Sektor Perniagaan</option>
                    <option value="Pembuatan / Pengilangan">Pembuatan / Pengilangan</option>
                    <option value="Perkhidmatan (Services)">Perkhidmatan (Services)</option>
                    <option value="Peruncitan & Pemborongan">Peruncitan & Pemborongan</option>
                    <option value="Makanan & Minuman (F&B)">Makanan & Minuman (F&B)</option>
                    <option value="Teknologi & Digital">Teknologi & Digital</option>
                    <option value="Profesional & Konsultansi">Profesional & Konsultansi</option>
                    <option value="Pertanian & Asas Tani">Pertanian & Asas Tani</option>
                    <option value="Pembinaan & Kejuruteraan">Pembinaan & Kejuruteraan</option>
                    <option value="Lain-lain">Lain-lain Sektor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Companies Data View */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                      <th className="py-3.5 px-4 w-12 text-center text-[11px] uppercase tracking-wider text-slate-400">Bil</th>
                      <th className="py-3.5 px-4 text-[11px] uppercase tracking-wider text-slate-300">Syarikat & No SSM</th>
                      <th className="py-3.5 px-4 text-[11px] uppercase tracking-wider text-slate-300">Maklumat Usahawan</th>
                      <th className="py-3.5 px-4 text-[11px] uppercase tracking-wider text-slate-300">Sektor & Saiz</th>
                      <th className="py-3.5 px-4 text-[11px] uppercase tracking-wider text-slate-300">Kewangan & Pekerja</th>
                      <th className="py-3.5 px-4 text-[11px] uppercase tracking-wider text-slate-300">Lokasi</th>
                      <th className="py-3.5 px-4 text-[11px] uppercase tracking-wider text-slate-300 text-center">Status Penilaian</th>
                      <th className="py-3.5 px-4 text-[11px] uppercase tracking-wider text-slate-300 text-center w-28">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCompanies.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="font-bold text-slate-700">Tiada Profil Syarikat Dijumpai</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {companySearchQuery ? 'Cuba ubah kata kunci carian atau tetapkan semula penapis sektor.' : 'Belum ada profil syarikat yang didaftarkan dalam sistem.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredCompanies.map((c, idx) => {
                        // Find matching assessment if any
                        const matchingAssessment = assessments.find(
                          (a) => a.id === c.lastAssessmentId || a.userId === c.userId || a.companyProfile?.companyName?.toLowerCase() === c.companyName?.toLowerCase()
                        );

                        return (
                          <tr key={c.userId || idx} className="hover:bg-slate-50/80 transition group">
                            <td className="py-3 px-4 text-center text-slate-400 font-bold text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                {c.companyName}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                SSM: {c.ssmNumber || 'Tidak Dinyatakan'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-800">
                                {c.userFullName || 'Usahawan PMKS'}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {c.userEmail || '-'}
                              </div>
                              {c.userPhone && (
                                <div className="text-[10px] text-indigo-600 font-mono mt-0.5">
                                  {c.userPhone}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-block text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                {c.sector}
                              </span>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {c.businessSize}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-emerald-700">
                                {c.annualTurnover || '-'}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {c.employeeCount ? `${c.employeeCount} orang pekerja` : '-'} • {c.yearsInOperation || 0} thn operasi
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1 text-slate-700 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{c.state || 'Malaysia'}</span>
                              </div>
                              {c.district && (
                                <div className="text-[10px] text-slate-400 pl-4.5">
                                  {c.district}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {matchingAssessment ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                                    {matchingAssessment.overallPercentage}% • {matchingAssessment.maturityLevel}
                                  </span>
                                  <span className="text-[10px] text-slate-400 mt-0.5">
                                    {formatReportDate(matchingAssessment.createdAt)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  Menunggu Penilaian
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {matchingAssessment ? (
                                <button
                                  onClick={() => onViewAssessment(matchingAssessment)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Laporan</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Tiada Laporan</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (Optimized for Small Screens) */}
              <div className="lg:hidden divide-y divide-slate-100 p-3 sm:p-4 space-y-4">
                {filteredCompanies.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">Tiada Profil Syarikat Dijumpai</p>
                    <p className="text-xs text-slate-400 mt-1">Ubah kata kunci carian anda di atas.</p>
                  </div>
                ) : (
                  filteredCompanies.map((c, idx) => {
                    const matchingAssessment = assessments.find(
                      (a) => a.id === c.lastAssessmentId || a.userId === c.userId || a.companyProfile?.companyName?.toLowerCase() === c.companyName?.toLowerCase()
                    );

                    return (
                      <div key={c.userId || idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              #{idx + 1} • {c.sector}
                            </span>
                            <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                              {c.companyName}
                            </h3>
                            <div className="text-[11px] text-slate-500 font-mono">
                              SSM: {c.ssmNumber || 'Tidak Dinyatakan'}
                            </div>
                          </div>

                          {matchingAssessment ? (
                            <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 shrink-0">
                              {matchingAssessment.overallPercentage}%
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                              Belum Dinilai
                            </span>
                          )}
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Usahawan:</span>
                            <span className="font-bold text-slate-800">{c.userFullName || 'Usahawan PMKS'}</span>
                          </div>
                          {c.userEmail && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Emel:</span>
                              <span className="text-slate-700 font-mono text-[11px] truncate max-w-[200px]">{c.userEmail}</span>
                            </div>
                          )}
                          {c.userPhone && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">No Tel:</span>
                              <span className="text-indigo-600 font-mono font-bold text-[11px]">{c.userPhone}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Hasil Jualan:</span>
                            <span className="font-bold text-emerald-700">{c.annualTurnover || '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Pekerja & Pengalaman:</span>
                            <span className="text-slate-700">{c.employeeCount || 0} pax • {c.yearsInOperation || 0} tahun</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Negeri:</span>
                            <span className="text-slate-800 font-medium">{c.state || '-'}</span>
                          </div>
                        </div>

                        {matchingAssessment && (
                          <button
                            onClick={() => onViewAssessment(matchingAssessment)}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Laporan Penilaian Lengkap ({matchingAssessment.id})</span>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Table Footer info */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <div>
                  Menunjukkan <span className="font-bold text-slate-800">{filteredCompanies.length}</span> daripada <span className="font-bold text-slate-800">{companies.length}</span> jumlah profil syarikat berdaftar
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Data berpusat masa nyata Firestore</span>
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
