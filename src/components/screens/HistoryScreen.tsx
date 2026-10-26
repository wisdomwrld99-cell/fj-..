import React from 'react';
import { ArrowLeft, Clock, FileText, ChevronRight, Calculator, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { PlainDisclaimer } from '../common/PlainDisclaimer';

export const HistoryScreen: React.FC = () => {
  const { qaHistory, navigateTo, setLatestAnswer, currentPolicy } = useApp();

  const handleSelectHistoryItem = (item: any) => {
    setLatestAnswer(item);
    navigateTo('answer');
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigateTo('plan_summary')}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Back to summary"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">
            Saved Q&A & Estimates
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Show these at the clinic billing desk
          </p>
        </div>
      </div>

      {qaHistory.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 space-y-3">
          <Clock size={36} className="mx-auto text-slate-400" />
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">
            No Saved Inquiries Yet
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Whenever you ask a question or calculate an estimate, it is saved here for quick reference during doctor visits.
          </p>
          <button
            type="button"
            onClick={() => navigateTo('ask_question')}
            className="px-4 py-2 bg-[#2D7A78] text-white font-medium text-[14px] rounded-[10px] min-h-[44px] cursor-pointer inline-block"
          >
            Ask a Question Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {qaHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectHistoryItem(item)}
              className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs hover:border-[#2D7A78] transition-colors cursor-pointer space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white group-hover:text-[#2D7A78] transition-colors">
                  "{item.question}"
                </h2>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-[#2D7A78] shrink-0" />
              </div>

              <p className="text-[13px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {item.plainAnswer}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[12px]">
                <ConfidenceBadge confidence={item.confidence} size="sm" />

                <span className="text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <PlainDisclaimer />
    </div>
  );
};
