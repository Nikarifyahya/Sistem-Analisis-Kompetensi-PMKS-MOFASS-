import React from 'react';
import { 
  Building2, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  ClipboardCheck, 
  BarChart3, 
  History, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, CompanyProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  company: CompanyProfile | null;
  activeTab: 'profile' | 'assessment' | 'dashboard' | 'history';
  onSelectTab: (tab: 'profile' | 'assessment' | 'dashboard' | 'history') => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  hasAssessment: boolean;
  onStartNewAssessment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  company,
  activeTab,
  onSelectTab,
  onOpenAuth,
  onSignOut,
  hasAssessment,
  onStartNewAssessment
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <span className="font-extrabold text-base tracking-tight font-mono">M6</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">MOFASS PMKS</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Firebase Auth
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Sistem Analisis Tahap Kompetensi & Strategi Pertumbuhan Pintar
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => onSelectTab('profile')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Profil Syarikat
              </button>

              <button
                onClick={() => onSelectTab('assessment')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'assessment'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                Penilaian MOFASS
              </button>

              {hasAssessment && (
                <button
                  onClick={() => onSelectTab('dashboard')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Papan Pemuka & Laporan
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </button>
              )}

              <button
                onClick={() => onSelectTab('history')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Rekod Penilaian
              </button>
            </nav>
          )}

          {/* Right Action / Auth Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {company?.companyName || user.fullName || 'Usahawan PMKS'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    {user.email}
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>

                <button
                  onClick={onSignOut}
                  title="Log Keluar"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Log Masuk / Daftar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Submenu for active tabs */}
      {user && (
        <div className="lg:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50/90 px-2 py-2 overflow-x-auto text-xs">
          <button
            onClick={() => onSelectTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Profil
          </button>
          <button
            onClick={() => onSelectTab('assessment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'assessment' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Soalan (60)
          </button>
          {hasAssessment && (
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Laporan AI
            </button>
          )}
          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'history' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Sejarah
          </button>
        </div>
      )}
    </header>
  );
};
