import React, { useState, useMemo } from 'react';
import { 
  MOFASS_CATEGORIES, 
  LIKERT_OPTIONS 
} from '../data/mofassQuestions';
import { MofassCategoryId, CompanyProfile } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Bookmark, 
  RotateCcw,
  Zap,
  Info,
  HelpCircle,
  Building2
} from 'lucide-react';

interface AssessmentWizardProps {
  company: CompanyProfile;
  initialAnswers: Record<string, number>;
  onComplete: (answers: Record<string, number>) => void;
  onSaveDraft: (answers: Record<string, number>) => void;
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  company,
  initialAnswers,
  onComplete,
  onSaveDraft,
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers || {});
  const [activeCategoryId, setActiveCategoryId] = useState<MofassCategoryId>('M');
  const [isSavedDraft, setIsSavedDraft] = useState(false);

  // Total questions count = 60
  const allQuestionIds = useMemo(() => {
    return MOFASS_CATEGORIES.flatMap((c) => c.questions.map((q) => q.id));
  }, []);

  const totalAnswered = useMemo(() => {
    return allQuestionIds.filter((id) => answers[id] !== undefined && answers[id] > 0).length;
  }, [answers, allQuestionIds]);

  const overallProgress = Math.round((totalAnswered / allQuestionIds.length) * 100);

  const currentCategoryIndex = MOFASS_CATEGORIES.findIndex((c) => c.id === activeCategoryId);
  const currentCategory = MOFASS_CATEGORIES[currentCategoryIndex];

  const handleSelectAnswer = (questionId: string, val: number) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: val };
      onSaveDraft(next);
      return next;
    });
    setIsSavedDraft(false);
  };

  const handleSaveDraftClick = () => {
    onSaveDraft(answers);
    setIsSavedDraft(true);
    setTimeout(() => setIsSavedDraft(false), 2500);
  };

  // Preload realistic sample answers for quick testing so user doesn't need to manually click 60 times
  const handlePreloadRealistic = () => {
    const sampleRatings: Record<string, number> = {
      // Marketing (Moderate strong in CRM/satisfaction, lower in formal IP/budget)
      M1: 4, M2: 4, M3: 3, M4: 3, M5: 5, M6: 4, M7: 4, M8: 4, M9: 3, M10: 2,
      // Operation (Solid workflows, needs ISO/persijilan & BCP)
      O1: 4, O2: 4, O3: 4, O4: 3, O5: 2, O6: 3, O7: 4, O8: 4, O9: 4, O10: 2,
      // Finance (Adequate cashflow, weakness in formal audit & expansion capital)
      F1: 4, F2: 4, F3: 3, F4: 4, F5: 4, F6: 4, F7: 3, F8: 4, F9: 2, F10: 3,
      // Admin (Good ethics & coverage, needs formal job descriptions & HRD corp training)
      A1: 4, A2: 3, A3: 5, A4: 4, A5: 4, A6: 4, A7: 5, A8: 2, A9: 3, A10: 4,
      // Sales (Growing sales, high competitor pressure & needs export)
      S_SALES1: 4, S_SALES2: 4, S_SALES3: 3, S_SALES4: 4, S_SALES5: 4, S_SALES6: 3, S_SALES7: 2, S_SALES8: 4, S_SALES9: 3, S_SALES10: 4,
      // System (Has cloud & POS, needs advanced cybersec & IT capex budget)
      S_SYSTEM1: 4, S_SYSTEM2: 4, S_SYSTEM3: 3, S_SYSTEM4: 4, S_SYSTEM5: 4, S_SYSTEM6: 3, S_SYSTEM7: 4, S_SYSTEM8: 4, S_SYSTEM9: 2, S_SYSTEM10: 4,
    };
    setAnswers(sampleRatings);
    onSaveDraft(sampleRatings);
  };

  const handleClearAll = () => {
    if (confirm('Adakah anda pasti ingin mengosongkan semua jawapan yang telah diisi?')) {
      setAnswers({});
      onSaveDraft({});
    }
  };

  const isCurrentCategoryFullyAnswered = currentCategory.questions.every(
    (q) => answers[q.id] !== undefined
  );

  const canSubmit = totalAnswered >= 40; // Allow submission once at least 40 answered, but recommend all 60

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Banner with Progress */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{company.companyName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{company.sector}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Borang Soalan Penilaian MOFASS (60 Pernyataan)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Nilai perniagaan anda secara jujur mengikut skala Likert 1 (Sangat Tidak Setuju) hingga 5 (Sangat Setuju).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePreloadRealistic}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition active:scale-95 shadow-xs"
              title="Isi contoh jawapan realistik untuk memudahkan pengujian sistem"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              Isi Contoh Pantas (60 Soalan)
            </button>

            <button
              type="button"
              onClick={handleSaveDraftClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium transition"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {isSavedDraft ? 'Tersimpan!' : 'Simpan Draf'}
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700">
              Kemajuan Keseluruhan: <span className="text-indigo-600 font-bold">{totalAnswered} / {allQuestionIds.length}</span> soalan dijawab
            </span>
            <span className="font-bold text-slate-900 font-mono">{overallProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs (M - O - F - A - S - S) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
        {MOFASS_CATEGORIES.map((cat, idx) => {
          const catAnswered = cat.questions.filter((q) => answers[q.id] !== undefined).length;
          const isSelected = cat.id === activeCategoryId;
          const isDone = catAnswered === cat.questions.length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all relative ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-102'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`w-6 h-6 rounded-lg font-mono font-extrabold text-xs flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {cat.letter}
                </span>

                {isDone && (
                  <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-emerald-500'}`} />
                )}
              </div>

              <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {cat.shortName}
              </div>

              <div
                className={`text-[11px] font-mono mt-1 ${
                  isSelected ? 'text-indigo-100' : 'text-slate-400'
                }`}
              >
                {catAnswered} / {cat.questions.length} siap
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Category Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl mb-6 shadow-md flex items-center justify-between">
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-indigo-300 font-mono mb-1">
            Kategori {currentCategoryIndex + 1} daripada 6
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {currentCategory.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {currentCategory.description}
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <div className="text-xs text-indigo-200 font-medium">Status Kategori</div>
          <div className="text-lg font-bold font-mono">
            {currentCategory.questions.filter((q) => answers[q.id] !== undefined).length} / {currentCategory.questions.length}
          </div>
        </div>
      </div>

      {/* Questions List for Current Category */}
      <div className="space-y-4 mb-8">
        {currentCategory.questions.map((q) => {
          const selectedVal = answers[q.id];

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                selectedVal !== undefined
                  ? 'border-indigo-150 shadow-xs'
                  : 'border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5 mb-4">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                  {currentCategory.letter}.{q.number}
                </span>
                <div className="grow">
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {q.text}
                  </h3>
                  {q.guidance && (
                    <div className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-500">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{q.guidance}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Likert Scale Buttons (1 - 5) */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
                {LIKERT_OPTIONS.map((opt) => {
                  const isChecked = selectedVal === opt.value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectAnswer(q.id, opt.value)}
                      className={`flex sm:flex-col items-center sm:items-center justify-between sm:justify-center p-3 rounded-xl border text-xs transition-all active:scale-97 ${
                        isChecked
                          ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-sm ring-2 ring-indigo-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:mb-1">
                        <span
                          className={`w-6 h-6 rounded-full font-mono font-bold text-xs flex items-center justify-center ${
                            isChecked ? 'bg-white text-indigo-700' : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          {opt.value}
                        </span>
                        <span className="sm:hidden font-semibold">{opt.label}</span>
                      </div>

                      <span className="hidden sm:block text-[11px] text-center leading-tight">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation & Submission Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {currentCategoryIndex > 0 ? (
            <button
              type="button"
              onClick={() => setActiveCategoryId(MOFASS_CATEGORIES[currentCategoryIndex - 1].id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kategori Sebelum ({MOFASS_CATEGORIES[currentCategoryIndex - 1].shortName})
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Padam Jawapan
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {currentCategoryIndex < MOFASS_CATEGORIES.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveCategoryId(MOFASS_CATEGORIES[currentCategoryIndex + 1].id)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-200"
            >
              <span>Kategori Seterusnya ({MOFASS_CATEGORIES[currentCategoryIndex + 1].shortName})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(answers)}
              disabled={totalAnswered < 10}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20 active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Jana Laporan Analisis & Cadangan AI</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
