import React from 'react';
import { AssessmentResult } from '../types';
import { History, Calendar, Award, ChevronRight, X, PlusCircle, CheckCircle2 } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessments: AssessmentResult[];
  onSelectAssessment: (assessment: AssessmentResult) => void;
  onStartNew: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  assessments,
  onSelectAssessment,
  onStartNew
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Sejarah Penilaian MOFASS</h2>
              <p className="text-xs text-slate-300">Rekod diagnostik kompetensi perniagaan yang telah disimpan</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 grow">
          {assessments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <History className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold">Tiada rekod penilaian terdahulu ditemui.</p>
              <p className="text-xs text-slate-400 mt-1">Selesaikan penilaian pertama anda untuk mula menjejak metrik perniagaan.</p>
              <button
                onClick={() => {
                  onClose();
                  onStartNew();
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Mula Penilaian Baru
              </button>
            </div>
          ) : (
            assessments.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectAssessment(item);
                  onClose();
                }}
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-500 hover:bg-indigo-50/20 cursor-pointer transition flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900">
                      {item.companyProfile?.companyName || 'Syarikat PMKS'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {item.maturityLevel}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date(item.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span className="font-mono">{item.totalScore} / 300 mata</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-indigo-700">
                      {item.overallPercentage}%
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Jumlah rekod: <strong className="text-slate-800">{assessments.length}</strong>
          </span>
          <button
            onClick={() => {
              onClose();
              onStartNew();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
          >
            <PlusCircle className="w-4 h-4" />
            Penilaian Baru
          </button>
        </div>
      </div>
    </div>
  );
};
