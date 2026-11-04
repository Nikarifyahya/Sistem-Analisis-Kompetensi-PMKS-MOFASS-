import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, testFirestoreConnection, DEMO_USER } from './firebase/config';
import { 
  UserProfile, 
  CompanyProfile, 
  AssessmentResult 
} from './types';
import { 
  getUserProfile, 
  saveUserProfile, 
  getCompanyProfile, 
  saveCompanyProfile, 
  saveAssessmentRecord, 
  getUserAssessments,
  getDraftAnswers,
  saveDraftAnswers
} from './services/assessmentRepo';
import { calculateAssessmentScores, ensureCompleteAssessment } from './utils/mlEngine';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { CompanyProfileForm } from './components/CompanyProfileForm';
import { AssessmentWizard } from './components/AssessmentWizard';
import { DashboardView } from './components/DashboardView';
import { HistoryModal } from './components/HistoryModal';
import { 
  Building2, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  FileText,
  BarChart3,
  Layers,
  Compass,
  Award
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'assessment' | 'dashboard' | 'history'>('profile');
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentResult | null>(null);
  const [pastAssessments, setPastAssessments] = useState<AssessmentResult[]>([]);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Auth & Firestore Listener
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          fullName: fbUser.displayName || 'Usahawan PMKS',
          email: fbUser.email || 'user@pmks.my',
          photoURL: fbUser.photoURL || undefined,
          role: 'Pengarah Urusan',
          isDemo: false
        };
        setUser(profile);
        await loadUserData(profile.uid);
      } else {
        // Check for local stored demo user
        const localUserStr = localStorage.getItem('mofass_user_profile');
        if (localUserStr) {
          try {
            const parsed = JSON.parse(localUserStr);
            setUser(parsed);
            await loadUserData(parsed.uid);
          } catch {
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    });

    const savedDraft = getDraftAnswers();
    if (savedDraft) {
      setDraftAnswers(savedDraft);
    }

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      const comp = await getCompanyProfile(uid);
      if (comp) {
        setCompany(comp);
      }
      const history = await getUserAssessments(uid);
      const sanitizedHistory = history.map(ensureCompleteAssessment);
      setPastAssessments(sanitizedHistory);
      if (sanitizedHistory.length > 0) {
        setCurrentAssessment(sanitizedHistory[0]);
        setActiveTab('dashboard');
      } else if (comp) {
        setActiveTab('assessment');
      }
    } catch (e) {
      console.warn('Error loading user data:', e);
    }
  };

  const handleAuthSuccess = async (authedUser: UserProfile) => {
    setUser(authedUser);
    await saveUserProfile(authedUser);
    await loadUserData(authedUser.uid);
  };

  const handleSignOut = () => {
    localStorage.removeItem('mofass_user_profile');
    setUser(null);
    setCompany(null);
    setCurrentAssessment(null);
    setActiveTab('profile');
  };

  const handleSaveCompany = async (updatedUser: UserProfile, updatedCompany: CompanyProfile) => {
    setUser(updatedUser);
    setCompany(updatedCompany);
    await saveUserProfile(updatedUser);
    await saveCompanyProfile(updatedUser.uid, updatedCompany);
    setActiveTab('assessment');
  };

  const handleCompleteAssessment = async (answers: Record<string, number>) => {
    if (!user || !company) return;

    const result = ensureCompleteAssessment(calculateAssessmentScores(answers, company, user));
    setCurrentAssessment(result);
    await saveAssessmentRecord(result);

    const history = await getUserAssessments(user.uid);
    setPastAssessments(history);

    setActiveTab('dashboard');
  };

  const handleSaveDraft = (answers: Record<string, number>) => {
    setDraftAnswers(answers);
    saveDraftAnswers(answers);
  };

  // Quick Demo Exploration for Evaluator
  const handleExploreInstantDemo = async () => {
    const demoUser = DEMO_USER;
    const demoCompany: CompanyProfile = {
      companyName: 'Nusantara Global Tech Solutions Sdn Bhd',
      ssmNumber: '202101034567 (1435890-X)',
      sector: 'Teknologi & Digital',
      businessSize: 'Kecil (RM300k - RM15m / 5 - 75 Pekerja)',
      yearsInOperation: 4,
      annualTurnover: 'RM 1,250,000',
      employeeCount: 14,
      state: 'Selangor',
      district: 'Shah Alam',
      website: 'https://nusantaratech.com.my',
      briefDescription: 'Penyedia automasi dan perisian pengurusan inventori pintar PMKS.'
    };

    const demoAnswers: Record<string, number> = {
      M1: 4, M2: 4, M3: 3, M4: 3, M5: 5, M6: 4, M7: 4, M8: 4, M9: 3, M10: 2,
      O1: 4, O2: 4, O3: 4, O4: 3, O5: 2, O6: 3, O7: 4, O8: 4, O9: 4, O10: 2,
      F1: 4, F2: 4, F3: 3, F4: 4, F5: 4, F6: 4, F7: 3, F8: 4, F9: 2, F10: 3,
      A1: 4, A2: 3, A3: 5, A4: 4, A5: 4, A6: 4, A7: 5, A8: 2, A9: 3, A10: 4,
      S_SALES1: 4, S_SALES2: 4, S_SALES3: 3, S_SALES4: 4, S_SALES5: 4, S_SALES6: 3, S_SALES7: 2, S_SALES8: 4, S_SALES9: 3, S_SALES10: 4,
      S_SYSTEM1: 4, S_SYSTEM2: 4, S_SYSTEM3: 3, S_SYSTEM4: 4, S_SYSTEM5: 4, S_SYSTEM6: 3, S_SYSTEM7: 4, S_SYSTEM8: 4, S_SYSTEM9: 2, S_SYSTEM10: 4,
    };

    setUser(demoUser);
    setCompany(demoCompany);
    await saveUserProfile(demoUser);
    await saveCompanyProfile(demoUser.uid, demoCompany);

    const result = calculateAssessmentScores(demoAnswers, demoCompany, demoUser);
    setCurrentAssessment(result);
    await saveAssessmentRecord(result);
    setPastAssessments([result]);
    setActiveTab('dashboard');
  };

  const handleStartNewAssessment = () => {
    setDraftAnswers({});
    localStorage.removeItem('mofass_active_draft_answers');
    setActiveTab('assessment');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        user={user}
        company={company}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'history') {
            setIsHistoryModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        hasAssessment={!!currentAssessment}
        onStartNewAssessment={handleStartNewAssessment}
      />

      <main className="grow">
        {/* If user is not signed in, show high-impact welcome landing with login triggers */}
        {!user ? (
          <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
              <div className="max-w-3xl space-y-6 relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-white/95 px-3.5 py-1.5 rounded-xl shadow-md">
                    <img 
                      src="/assets/aistudio/Logo_Impak_Niaga_9f4ce565.png" 
                      alt="Logo Impak Niaga" 
                      className="h-8 sm:h-9 w-auto object-contain"
                    />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-300 text-xs font-bold backdrop-blur-md border border-white/20">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Sistem Diagnostik PMKS Bersepadu • Piawaian MOFASS
                  </div>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Analisis Tahap Kompetensi Perniagaan & Pengesyoran Strategi AI Pintar
                </h1>

                <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed">
                  Platform berkuasa algoritma pembelajaran mesin untuk menilai 6 dimensi teras syarikat anda (Marketing, Operation, Finance, Administration, Sales, System). Menjana laporan prestasi secara automatik berserta papan pemuka interaktif dan pelan tindakan 30-60-90 hari.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition active:scale-98"
                  >
                    <span>Daftar Masuk & Mulakan Penilaian</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleExploreInstantDemo}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-sm rounded-2xl backdrop-blur-md transition shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Pratonton Laporan Demo (Akses Pantas)</span>
                  </button>
                </div>
              </div>

              {/* Badges footer */}
              <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-indigo-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>60 Soalan Skala Likert Rasmi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Graf Radar & Penanda Aras PMKS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Simulator Pertumbuhan Masa Nyata</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Padanan Geran Kerajaan (SME Corp/MDEC)</span>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Kerangka Diagnostik MOFASS</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Menilai secara holistik setiap sendi perniagaan daripada kecekapan saluran pemasaran hingga ke automasi sistem IT dan simpan kira berkanun.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Pengesyoran Strategi AI Pintar</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Algoritma pembelajaran mesin menterjemah jurang penilaian kepada pelan tindakan 30-60-90 hari yang tersusun mengikut prioriti impak.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Papan Pemuka Interaktif</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pantau indeks kesihatan perniagaan dan uji simulasi perubahan skor untuk menganggar lonjakan hasil dan potensi kelulusan pembiayaan bank.
                </p>
              </div>
            </div>
          </div>
        ) : !company || activeTab === 'profile' ? (
          /* Step 1: Company & Profile Setup */
          <CompanyProfileForm
            user={user}
            company={company}
            onSave={handleSaveCompany}
          />
        ) : activeTab === 'assessment' ? (
          /* Step 2: MOFASS 60 Questions Wizard */
          <AssessmentWizard
            company={company}
            initialAnswers={draftAnswers}
            onComplete={handleCompleteAssessment}
            onSaveDraft={handleSaveDraft}
          />
        ) : currentAssessment ? (
          /* Step 3: Interactive Dashboard & Reports */
          <DashboardView
            assessment={currentAssessment}
            onRetake={() => setActiveTab('assessment')}
            onUpdateAssessment={async (updated) => {
              const sanitized = ensureCompleteAssessment(updated);
              setCurrentAssessment(sanitized);
              await saveAssessmentRecord(sanitized);
              setPastAssessments((prev) => prev.map((a) => a.id === sanitized.id ? sanitized : a));
            }}
          />
        ) : (
          /* Fallback redirect to assessment */
          <div className="text-center py-16">
            <button
              onClick={() => setActiveTab('assessment')}
              className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-md"
            >
              Mula Jawab Soalan Penilaian MOFASS
            </button>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        assessments={pastAssessments}
        onSelectAssessment={(a) => {
          setCurrentAssessment(a);
          setActiveTab('dashboard');
        }}
        onStartNew={handleStartNewAssessment}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} MOFASS PMKS • Sistem Analisis Tahap Kompetensi Perniagaan Malaysia</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Marketing • Operation • Finance • Administration • Sales • System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
