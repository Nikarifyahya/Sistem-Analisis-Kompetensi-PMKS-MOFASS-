import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider, DEMO_USER } from '../firebase/config';
import { UserProfile } from '../types';
import { ShieldCheck, Sparkles, AlertCircle, X, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'quick' | 'email'>('quick');
  const [isRegister, setIsRegister] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const profile: UserProfile = {
        uid: user.uid,
        fullName: user.displayName || 'Usahawan PMKS',
        email: user.email || 'user@pmks.my',
        photoURL: user.photoURL || undefined,
        role: 'Pengarah Urusan',
        isDemo: false
      };
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Tetingkap popup disekat oleh pelayar web anda. Sila benarkan popup atau gunakan Mod Akses Pantas di bawah.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain pratonton ini belum didaftarkan di Firebase Console. Sila gunakan "Mod Akses Pantas PMKS" untuk mula serta-merta tanpa sekatan.');
      } else {
        setErrorMsg(err.message || 'Gagal log masuk dengan Google. Sila cuba mod alternatif.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Sila masukkan emel dan kata laluan.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const profile: UserProfile = {
          uid: res.user.uid,
          fullName: fullName || email.split('@')[0],
          email: res.user.email || email,
          role: 'Pengasas Perniagaan',
          isDemo: false
        };
        onSuccess(profile);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const profile: UserProfile = {
          uid: res.user.uid,
          fullName: fullName || res.user.displayName || email.split('@')[0],
          email: res.user.email || email,
          role: 'Pengasas Perniagaan',
          isDemo: false
        };
        onSuccess(profile);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ralat pengesahan emel.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = () => {
    onSuccess(DEMO_USER);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header graphic */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-indigo-100 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-emerald-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sistem MOFASS PMKS</h2>
          <p className="text-xs text-indigo-100 mt-1">
            Log masuk selamat untuk menyimpan profil perniagaan dan laporan analitik anda
          </p>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Perhatian</p>
                <p className="text-amber-800 mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {authMode === 'quick' ? (
            <div className="space-y-3.5">
              {/* Google Sign-in button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-xs transition hover:border-slate-300 active:scale-98 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {loading ? 'Menghubungkan...' : 'Log Masuk dengan Google'}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-4 text-xs font-semibold text-slate-400">ATAU PILIHAN CEPAT</span>
                <div className="grow border-t border-slate-200"></div>
              </div>

              {/* Instant Demo Access (Preloaded with user credentials from context) */}
              <button
                onClick={handleQuickDemoAccess}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 font-semibold text-sm hover:from-emerald-100 hover:to-teal-100 transition shadow-xs group"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">Akses Segera (Usahawan Nik Arif Yahya)</div>
                    <div className="text-[11px] text-emerald-700">Akaun demo siap sedia untuk semakan pantas</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('email')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
                >
                  Log masuk dengan Emel & Kata Laluan
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {isRegister && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Penuh</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="cth. Ahmad Razif"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Emel</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@syarikat.com.my"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Laluan</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {loading ? 'Memproses...' : isRegister ? 'Daftar Akaun Baru' : 'Log Masuk'}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-indigo-600 hover:underline"
                >
                  {isRegister ? 'Sudah ada akaun? Log Masuk' : 'Tiada akaun? Daftar sekarang'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('quick')}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Kembali
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Firebase: sistem-kompetensi</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Firestore Aktif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
