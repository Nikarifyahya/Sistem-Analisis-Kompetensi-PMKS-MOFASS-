import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../firebase/config';
import { UserProfile } from '../types';
import { 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Copy, 
  Check, 
  ExternalLink,
  Globe,
  KeyRound,
  CheckCircle2,
  Info
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Specific domain authorization helper state
  const [domainErrorDetails, setDomainErrorDetails] = useState<{
    currentHostname: string;
    vercelHostname: string;
  } | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'sistem-analisis-kompetensi-pmks-mof.vercel.app';
  const targetVercelHost = 'sistem-analisis-kompetensi-pmks-mof.vercel.app';

  // Handle errors specifically to detect and diagnose unauthorized domain
  const handleAuthError = (err: any, providerName: string) => {
    console.warn(`${providerName} sign-in error:`, err);
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/unauthorized-domain' || message.includes('unauthorized domain') || message.includes('authorized domain')) {
      setDomainErrorDetails({
        currentHostname: currentHost,
        vercelHostname: targetVercelHost
      });
      setErrorMsg(null);
    } else if (code === 'auth/popup-blocked') {
      setErrorMsg('Tetingkap popup disekat oleh pelayar web anda. Sila benarkan popup atau teruskan dengan log masuk Emel & Kata Laluan di bawah.');
    } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      setErrorMsg('Proses log masuk dibatalkan sebelum selesai. Sila cuba lagi.');
    } else if (code === 'auth/user-not-found') {
      setErrorMsg('Akaun bagi emel ini belum berdaftar. Sila pilih "Daftar Akaun Baru".');
    } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      setErrorMsg('Emel atau kata laluan tidak tepat. Sila semak semula.');
    } else if (code === 'auth/email-already-in-use') {
      setErrorMsg('Emel ini sudah berdaftar. Sila klik "Log Masuk" di bawah.');
    } else if (code === 'auth/weak-password') {
      setErrorMsg('Kata laluan hendaklah sekurang-kurangnya 6 aksara.');
    } else if (code === 'auth/operation-not-allowed') {
      setErrorMsg(`Penyedia log masuk ${providerName} belum diaktifkan di Firebase Console > Authentication > Sign-in method.`);
    } else {
      setErrorMsg(message || `Ralat log masuk dengan ${providerName}.`);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    setDomainErrorDetails(null);
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
      handleAuthError(err, 'Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    setDomainErrorDetails(null);
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;
      const profile: UserProfile = {
        uid: user.uid,
        fullName: user.displayName || user.email?.split('@')[0] || 'Pengguna Apple PMKS',
        email: user.email || `${user.uid}@privaterelay.appleid.com`,
        photoURL: user.photoURL || undefined,
        role: 'Pengarah Urusan',
        isDemo: false
      };
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      handleAuthError(err, 'Apple');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email) {
      setErrorMsg('Sila masukkan alamat emel anda.');
      return;
    }

    // Handle Password Reset Flow
    if (isForgotPassword) {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setInfoMsg(`Pautan penetapan semula kata laluan telah dihantar ke ${email}. Sila semak peti masuk atau folder spam anda.`);
        setIsForgotPassword(false);
      } catch (err: any) {
        handleAuthError(err, 'Reset Kata Laluan');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMsg('Sila masukkan kata laluan.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata laluan hendaklah sekurang-kurangnya 6 aksara.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const resolvedName = fullName.trim() || email.split('@')[0];
        
        // Update Firebase User Profile display name
        try {
          await updateProfile(res.user, { displayName: resolvedName });
        } catch {
          // ignore display name update error
        }

        const profile: UserProfile = {
          uid: res.user.uid,
          fullName: resolvedName,
          email: res.user.email || email,
          role: 'Pengarah Urusan',
          isDemo: false
        };
        onSuccess(profile);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const profile: UserProfile = {
          uid: res.user.uid,
          fullName: res.user.displayName || fullName.trim() || email.split('@')[0],
          email: res.user.email || email,
          role: 'Pengarah Urusan',
          isDemo: false
        };
        onSuccess(profile);
      }
      onClose();
    } catch (err: any) {
      handleAuthError(err, 'Emel');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTarget(text);
      setTimeout(() => setCopiedTarget(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative my-6">
        
        {/* Header graphic with official Impak Niaga Logo */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="bg-white px-4 py-2 rounded-2xl shadow-md mx-auto w-fit mb-3">
            <img 
              src="/assets/aistudio/Logo_Impak_Niaga_9f4ce565.png" 
              alt="Logo Impak Niaga" 
              className="h-9 w-auto object-contain"
            />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            Log Masuk Impak Niaga
          </h2>
          <p className="text-xs text-indigo-200/90 mt-1">
            Sistem Analisis Tahap Kompetensi PMKS (MOFASS)
          </p>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Informational Message */}
          {infoMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{infoMsg}</p>
            </div>
          )}

          {/* Standard Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Makluman</p>
                <p className="text-rose-800 mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Comprehensive Solution Box for Unauthorized Domain */}
          {domainErrorDetails && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <Globe className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-amber-950 text-sm">
                    Pendaftaran Domain Diperlukan di Firebase
                  </h3>
                  <p className="text-amber-900 text-[11px] mt-1 leading-relaxed">
                    Firebase Console menyekat OAuth Google/Apple jika nama domain belum didaftarkan di senarai <strong>Authorized domains</strong>.
                  </p>
                </div>
              </div>

              {/* Domains to Copy */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Domain untuk didaftarkan:
                </span>
                
                {/* Vercel Target Domain */}
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200 font-mono text-[11px] text-slate-800">
                  <span className="truncate mr-2">{targetVercelHost}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(targetVercelHost)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-sans font-bold text-[10px] transition shrink-0"
                  >
                    {copiedTarget === targetVercelHost ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Current Hostname if different */}
                {currentHost !== targetVercelHost && (
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200 font-mono text-[11px] text-slate-800">
                    <span className="truncate mr-2">{currentHost}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentHost)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-sans font-bold text-[10px] transition shrink-0"
                    >
                      {copiedTarget === currentHost ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Step-by-Step Instructions */}
              <div className="bg-amber-100/70 p-2.5 rounded-xl text-[11px] text-amber-900 space-y-1">
                <p className="font-bold">Langkah Pantas (Hanya Perlu Sekali):</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[10px]">
                  <li>Buka Firebase Console &gt; Authentication &gt; Settings</li>
                  <li>Di bahagian <strong>Authorized domains</strong>, klik <strong>Add domain</strong></li>
                  <li>Tampal domain di atas dan tekan <strong>Save</strong></li>
                </ol>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <a
                  href="https://console.firebase.google.com/project/sistem-kompetensi/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs"
                >
                  <span>Buka Firebase Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setDomainErrorDetails(null)}
                  className="text-[11px] text-amber-800 hover:text-amber-950 underline"
                >
                  Tutup Notis
                </button>
              </div>

              {/* Direct Instant Workaround Banner */}
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Penyelesaian Terus:</strong> Log masuk atau daftar dengan <strong>Emel & Kata Laluan</strong> di bawah berfungsi serta-merta tanpa sekatan domain!
                </span>
              </div>
            </div>
          )}

          {/* Social Logins: Google & Apple */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition hover:border-slate-300 active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Google</span>
              </button>

              {/* Apple Sign-in */}
              <button
                type="button"
                onClick={handleAppleSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs shadow-xs transition active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.6-7.85-11.75-14.32-6.52-10.23-11.66-21.57-15.41-34.02-3.75-12.45-5.63-23.86-5.63-34.23 0-14.07 3.65-25.75 10.96-35.03 7.31-9.28 16.59-13.98 27.84-14.1 4.79 0 10.22 1.34 16.3 4.02 6.08 2.68 10.05 4.08 11.91 4.2 1.54 0 5.66-1.42 12.35-4.27 6.69-2.85 12.32-4.14 16.9-3.87 13.04.81 23.36 5.64 30.96 14.5-11.39 6.89-16.96 16.29-16.71 28.2.25 9.4 3.93 17.26 11.05 23.59 7.12 6.33 15.65 9.89 25.59 10.68-2.18 6.94-5.06 14.28-8.63 22.02zM119.22 31.84c0-7.39 2.64-14.19 7.92-20.4 5.28-6.21 11.83-10.24 19.65-12.09.28 1.48.42 2.87.42 4.18 0 7.27-2.78 14.24-8.34 20.91-5.56 6.67-12.16 10.59-19.8 11.76-.11-1.46-.22-2.92-.35-4.36z" />
                </svg>
                <span>Apple ID</span>
              </button>

            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Atau Emel & Kata Laluan
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Mode Switcher Tabs */}
          {!isForgotPassword && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg(null);
                }}
                className={`py-1.5 rounded-lg transition-all ${
                  !isRegister ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Log Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg(null);
                }}
                className={`py-1.5 rounded-lg transition-all ${
                  isRegister ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daftar Akaun Baru
              </button>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isForgotPassword ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs">
                  <p className="font-semibold">Penetapan Semula Kata Laluan</p>
                  <p className="text-blue-800 mt-0.5">
                    Masukkan emel anda dan kami akan menghantar pautan pengesahan ke peti surat anda.
                  </p>
                </div>

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 disabled:opacity-50"
                >
                  {loading ? 'Menghantar Pautan...' : 'Hantar Pautan Reset'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setErrorMsg(null);
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    Kembali ke Log Masuk
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isRegister && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Penuh / Nama Pemilik</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="cth. Ahmad Razif bin Othman"
                        required={isRegister}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Kata Laluan</label>
                    {!isRegister && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setErrorMsg(null);
                          setInfoMsg(null);
                        }}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Lupa Kata Laluan?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Memproses...</span>
                  ) : isRegister ? (
                    <>
                      <span>Daftar Akaun Baru</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Log Masuk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </>
            )}
          </form>

          {/* Quick Domain Guidance Link at footer */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Firebase: sistem-kompetensi</span>
              <button
                type="button"
                onClick={() => {
                  setDomainErrorDetails({
                    currentHostname: currentHost,
                    vercelHostname: targetVercelHost
                  });
                }}
                className="text-slate-500 hover:text-indigo-600 transition inline-flex items-center gap-1 font-medium"
              >
                <Info className="w-3 h-3 text-indigo-500" />
                <span>Info Domain Vercel</span>
              </button>
            </div>
            
            <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[10.5px] text-amber-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Akses Pentadbir: <b>nikarifyahya@gmail.com</b></span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('nikarifyahya@gmail.com');
                  setIsRegister(false);
                  setIsForgotPassword(false);
                }}
                className="text-[10px] bg-amber-200/60 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold transition"
              >
                Isi Emel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
