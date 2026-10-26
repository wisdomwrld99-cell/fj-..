import React from 'react';
import {
  ArrowLeft,
  Phone,
  BookmarkCheck,
  Share2,
  AlertTriangle,
  HelpCircle,
  FileQuestion,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { SourcePanel } from '../common/SourcePanel';
import { EstimateRange } from '../common/EstimateRange';
import { PlainDisclaimer } from '../common/PlainDisclaimer';

export const AnswerScreen: React.FC = () => {
  const { latestAnswer, navigateTo, setActiveDocumentView, currentPolicy } = useApp();

  if (!latestAnswer) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <p className="text-slate-600 dark:text-slate-400">No question answered yet.</p>
        <button
          type="button"
          onClick={() => navigateTo('ask_question')}
          className="px-4 py-2 bg-[#2D7A78] text-white rounded-[10px] min-h-[44px]"
        >
          Ask a Question
        </button>
      </div>
    );
  }

  const isNotFound = latestAnswer.confidence === 'not_found';
  const symbol = currentPolicy.currencySymbol || '$';

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigateTo('ask_question')}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Back to Ask Question"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
            <BookmarkCheck size={13} />
            <span>Saved to history</span>
          </span>
        </div>
      </div>

      {/* User's Original Question */}
      <div className="px-1">
        <span className="text-[12px] font-semibold tracking-wide uppercase text-slate-400">
          Your Question
        </span>
        <h1 className="text-[18px] font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
          "{latestAnswer.question}"
        </h1>
      </div>

      {/* Confidence Label (Clear / Partly Clear / Not Found) */}
      <ConfidenceBadge confidence={latestAnswer.confidence} showDescription size="md" />

      {/* PART A: ONE-SENTENCE PLAIN ANSWER */}
      <div
        className={`p-4 rounded-[12px] border ${
          isNotFound
            ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700'
            : 'bg-[#E6F4F1]/60 dark:bg-[#2D7A78]/15 border-[#A7D7D2] dark:border-[#2D7A78]/40'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-full bg-white dark:bg-slate-800 text-[#2D7A78] dark:text-[#3AAFA9] shadow-2xs shrink-0 mt-0.5">
            {isNotFound ? <FileQuestion size={18} /> : <CheckCircle size={18} />}
          </div>
          <div>
            <span className="text-[12px] font-semibold tracking-wide uppercase text-[#2D7A78] dark:text-[#3AAFA9] block mb-1">
              Plain Answer
            </span>
            <p className="text-[16px] font-medium text-slate-900 dark:text-white leading-relaxed">
              {latestAnswer.plainAnswer}
            </p>
          </div>
        </div>
      </div>

      {/* PART B: WHAT YOU'D LIKELY PAY (RANGE WITH ASSUMPTIONS) */}
      {latestAnswer.estimate && (
        <EstimateRange
          estimate={latestAnswer.estimate}
          currencySymbol={symbol}
          serviceName={latestAnswer.question}
        />
      )}

      {/* PART C: WHERE THIS CAME FROM (SOURCE CITATION & PAGE) */}
      <SourcePanel
        sources={latestAnswer.sources}
        onViewInDocument={(page, quote) => setActiveDocumentView({ page, quote })}
      />

      {/* PART D: BEFORE YOU BOOK, ASK YOUR INSURER */}
      {latestAnswer.questionsToAsk && latestAnswer.questionsToAsk.length > 0 && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-900 dark:text-white">
              <Phone size={16} className="text-[#2D7A78]" />
              <span>Before you book, ask your insurer:</span>
            </div>
            {latestAnswer.insurerPhone && (
              <a
                href={`tel:${latestAnswer.insurerPhone.replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-white bg-[#2D7A78] hover:bg-[#246664] px-3 py-1.5 rounded-[8px] min-h-[36px] transition-colors cursor-pointer"
              >
                <Phone size={13} />
                <span>Call {latestAnswer.insurerPhone}</span>
              </a>
            )}
          </div>

          <div className="space-y-2 pt-1">
            {latestAnswer.questionsToAsk.map((qText, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[13px] text-slate-700 dark:text-slate-300 flex items-start gap-2"
              >
                <span className="font-semibold text-[#2D7A78] select-none">{idx + 1}.</span>
                <span className="leading-snug">{qText}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MANDATORY PERSISTENT DISCLAIMER */}
      <PlainDisclaimer variant="card" />
    </div>
  );
};
