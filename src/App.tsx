import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, testFirestoreConnection } from './firebase/config';
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
import { AdminPortal } from './components/AdminPortal';
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
  
  const [activeTab, setActiveTab] = useState<'profile' | 'assessment' | 'dashboard' | 'history' | 'admin'>('profile');
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
        await loadUserData(profile.uid, profile.email);
      } else {
        // Check for local stored demo user
        const localUserStr = localStorage.getItem('mofass_user_profile');
        if (localUserStr) {
          try {
            const parsed = JSON.parse(localUserStr);
            setUser(parsed);
            await loadUserData(parsed.uid, parsed.email);
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

  const loadUserData = async (uid: string, userEmail?: string) => {
    try {
      const comp = await getCompanyProfile(uid);
      if (comp) {
        setCompany(comp);
      }
      const history = await getUserAssessments(uid);
      const sanitizedHistory = history.map(ensureCompleteAssessment);
      setPastAssessments(sanitizedHistory);

      const email = (userEmail || user?.email || '').toLowerCase().trim();
      if (email === 'nikarifyahya@gmail.com') {
        setActiveTab('admin');
      } else if (sanitizedHistory.length > 0) {
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
    await loadUserData(authedUser.uid, authedUser.email);
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
                    className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-500/25 transition active:scale-98"
                  >
                    <span>Daftar / Log Masuk & Mulakan Penilaian</span>
                    <ArrowRight className="w-5 h-5" />
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
        ) : activeTab === 'admin' ? (
          /* Step Admin: Executive Analytics & Reports Registry */
          <AdminPortal
            user={user}
            onViewAssessment={(selected) => {
              setCurrentAssessment(selected);
              setActiveTab('dashboard');
            }}
            onBackToApp={() => {
              if (currentAssessment) setActiveTab('dashboard');
              else if (company) setActiveTab('assessment');
              else setActiveTab('profile');
            }}
          />
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
            onBackToAdmin={user?.email?.toLowerCase().trim() === 'nikarifyahya@gmail.com' ? () => setActiveTab('admin') : undefined}
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
