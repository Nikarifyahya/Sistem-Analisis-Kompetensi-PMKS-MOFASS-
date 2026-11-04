import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  Users, 
  TrendingUp, 
  Calendar, 
  FileCheck2, 
  ArrowRight, 
  Sparkles,
  Briefcase
} from 'lucide-react';
import { CompanyProfile, UserProfile, BusinessSector, BusinessSize } from '../types';
import { MALAYSIAN_STATES } from '../data/mofassQuestions';

interface CompanyProfileFormProps {
  user: UserProfile;
  company: CompanyProfile | null;
  onSave: (updatedUser: UserProfile, updatedCompany: CompanyProfile) => void;
}

const SECTOR_OPTIONS: BusinessSector[] = [
  'Pembuatan / Pengilangan',
  'Perkhidmatan (Services)',
  'Peruncitan & Pemborongan',
  'Makanan & Minuman (F&B)',
  'Teknologi & Digital',
  'Profesional & Konsultansi',
  'Pertanian & Asas Tani',
  'Pembinaan & Kejuruteraan',
  'Lain-lain',
];

const SIZE_OPTIONS: BusinessSize[] = [
  'Mikro (< RM300k / < 5 Pekerja)',
  'Kecil (RM300k - RM15m / 5 - 75 Pekerja)',
  'Sederhana (RM15m - RM50m / 75 - 200 Pekerja)',
];

const SAMPLE_PMKS_COMPANY: CompanyProfile = {
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
  briefDescription: 'Penyedia penyelesaian automasi perniagaan pintar dan integrasi sistem awan untuk perusahaan runcit tempatan.'
};

export const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({
  user,
  company,
  onSave
}) => {
  const [fullName, setFullName] = useState(user.fullName || 'Nik Arif Yahya');
  const [phone, setPhone] = useState(user.phone || '019-8765432');
  const [role, setRole] = useState(user.role || 'Pengarah Urusan (Managing Director)');

  const [companyName, setCompanyName] = useState(company?.companyName || 'Nusantara Global Tech Solutions Sdn Bhd');
  const [ssmNumber, setSsmNumber] = useState(company?.ssmNumber || '202101034567 (1435890-X)');
  const [sector, setSector] = useState<BusinessSector>(company?.sector || 'Teknologi & Digital');
  const [businessSize, setBusinessSize] = useState<BusinessSize>(
    company?.businessSize || 'Kecil (RM300k - RM15m / 5 - 75 Pekerja)'
  );
  const [yearsInOperation, setYearsInOperation] = useState<number>(company?.yearsInOperation || 4);
  const [annualTurnover, setAnnualTurnover] = useState<string>(company?.annualTurnover || 'RM 1,250,000');
  const [employeeCount, setEmployeeCount] = useState<number>(company?.employeeCount || 14);
  const [state, setState] = useState<string>(company?.state || 'Selangor');
  const [briefDescription, setBriefDescription] = useState<string>(
    company?.briefDescription || 'Penyedia penyelesaian automasi perniagaan pintar dan integrasi sistem awan untuk perusahaan runcit tempatan.'
  );

  const handlePreloadSample = () => {
    setFullName('Nik Arif Yahya');
    setPhone('019-8765432');
    setRole('Pengarah Urusan (Managing Director)');
    setCompanyName(SAMPLE_PMKS_COMPANY.companyName);
    setSsmNumber(SAMPLE_PMKS_COMPANY.ssmNumber);
    setSector(SAMPLE_PMKS_COMPANY.sector);
    setBusinessSize(SAMPLE_PMKS_COMPANY.businessSize);
    setYearsInOperation(SAMPLE_PMKS_COMPANY.yearsInOperation);
    setAnnualTurnover(SAMPLE_PMKS_COMPANY.annualTurnover);
    setEmployeeCount(SAMPLE_PMKS_COMPANY.employeeCount);
    setState(SAMPLE_PMKS_COMPANY.state);
    setBriefDescription(SAMPLE_PMKS_COMPANY.briefDescription || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser: UserProfile = {
      ...user,
      fullName,
      phone,
      role
    };

    const updatedCompany: CompanyProfile = {
      companyName,
      ssmNumber,
      sector,
      businessSize,
      yearsInOperation,
      annualTurnover,
      employeeCount,
      state,
      briefDescription
    };

    onSave(updatedUser, updatedCompany);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-indigo-950/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Langkah 1 daripada 2: Pendaftaran Profil
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Maklumat Peribadi & Syarikat PMKS</h1>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl">
            Maklumat ini akan digunakan oleh algoritma AI untuk menanda aras (benchmarking) prestasi syarikat anda dengan piawaian industri PMKS Malaysia.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePreloadSample}
          className="self-start md:self-center shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Isi Contoh Profil Pantas
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bahagian 1: Maklumat Usahawan */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Maklumat Pemilik / Responden</h2>
              <p className="text-xs text-slate-500">Profil individu yang mewakili syarikat dalam penilaian ini</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Penuh Responden *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Penuh Anda"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jawatan / Peranan *</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="cth. Pengarah Urusan / CEO"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombor Telefon / WhatsApp *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01X-XXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bahagian 2: Maklumat Entiti Perniagaan */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Maklumat Syarikat & Operasi Perniagaan</h2>
              <p className="text-xs text-slate-500">Butiran pendaftaran SSM dan skala operasi semasa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Berdaftar Syarikat *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="cth. Megah Holdings Sdn Bhd"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombor Pendaftaran SSM / Lesen *</label>
              <div className="relative">
                <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={ssmNumber}
                  onChange={(e) => setSsmNumber(e.target.value)}
                  placeholder="202001012345 (XXXXXX-X)"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Sektor Industri *</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as BusinessSector)}
                className="w-full px-3 py-2.5 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {SECTOR_OPTIONS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori Saiz PMKS *</label>
              <select
                value={businessSize}
                onChange={(e) => setBusinessSize(e.target.value as BusinessSize)}
                className="w-full px-3 py-2.5 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {SIZE_OPTIONS.map((sz) => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tempoh Beroperasi (Tahun) *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={yearsInOperation}
                  onChange={(e) => setYearsInOperation(parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Anggaran Perolehan Jualan Tahunan *</label>
              <div className="relative">
                <TrendingUp className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={annualTurnover}
                  onChange={(e) => setAnnualTurnover(e.target.value)}
                  placeholder="cth. RM 800,000"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Pekerja Sepenuh Masa *</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 1)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Negeri Premis Utama *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {MALAYSIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Penerangan Ringkas Produk / Perkhidmatan</label>
            <textarea
              rows={3}
              value={briefDescription}
              onChange={(e) => setBriefDescription(e.target.value)}
              placeholder="Huraikan secara ringkas apa yang ditawarkan oleh perniagaan anda dan pasaran sasaran..."
              className="w-full px-3 py-2.5 text-xs font-medium text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-98"
          >
            <span>Simpan & Mula Jawab Penilaian MOFASS (60 Soalan)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
