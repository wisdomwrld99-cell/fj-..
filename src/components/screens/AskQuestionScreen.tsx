import React, { useState } from 'react';
import { ArrowLeft, Send, Mic, MicOff, Sparkles, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { answerPolicyQuestion } from '../../services/qaService';
import { PlainDisclaimer } from '../common/PlainDisclaimer';

export const AskQuestionScreen: React.FC = () => {
  const {
    navigateTo,
    currentPolicy,
    currentChunks,
    currentFacts,
    usageData,
    saveAnswerToHistory,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Suggested chips tailored to policy type
  const getSuggestedChips = () => {
    switch (currentPolicy.type) {
      case 'dental':
        return [
          'Is a porcelain crown covered?',
          'Are dental cleanings 100% free?',
          'What is my yearly maximum limit?',
          'Does it cover teeth whitening?',
        ];
      case 'vision':
        return [
          'How much do I pay for an eye exam?',
          'What is my frame allowance?',
          'Does this plan cover LASIK eye surgery?',
          'Can I get contacts instead of glasses?',
        ];
      default:
        return [
          'What do I pay for a specialist visit?',
          'Do I need a referral from my doctor?',
          'What will I pay for an MRI scan?',
          'Is acupuncture covered?',
          'What does an Emergency Room visit cost?',
        ];
    }
  };

  const chips = getSuggestedChips();

  // Voice recognition simulation
  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Voice input simulation
      setTimeout(() => {
        setInputQuery('What is my specialist visit copay?');
        setIsListening(false);
      }, 1800);
    }
  };

  const handleSubmit = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await answerPolicyQuestion({
        question: q.trim(),
        policy: currentPolicy,
        chunks: currentChunks,
        facts: currentFacts,
        usage: usageData,
      });

      saveAnswerToHistory(result);
      navigateTo('answer');
    } catch (err) {
      console.error('Failed to answer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-20">
      {/* Top Bar */}
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
            Ask About Coverage
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Checking: {currentPolicy.planName}
          </p>
        </div>
      </div>

      {/* Question Input Box */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="e.g. Will my insurance pay for an MRI, and what will I owe?"
            disabled={isLoading}
            className="w-full p-3 text-[15px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2D7A78]/30 placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors min-h-[44px] cursor-pointer ${
              isListening
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
            title="Voice input"
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            <span>{isListening ? 'Listening...' : 'Voice'}</span>
          </button>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!inputQuery.trim() || isLoading}
            className="px-5 py-2.5 bg-[#2D7A78] hover:bg-[#246664] disabled:opacity-50 text-white font-medium text-[14px] rounded-[10px] min-h-[44px] flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>{isLoading ? 'Checking policy...' : 'Ask Plainly'}</span>
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* Suggested Questions Chips */}
      <div className="space-y-2">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <HelpCircle size={14} className="text-[#2D7A78]" />
          <span>Suggested Questions:</span>
        </span>
        <div className="flex flex-col gap-2">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputQuery(chip);
                handleSubmit(chip);
              }}
              disabled={isLoading}
              className="w-full text-left p-3 text-[14px] font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-[10px] border border-slate-200/80 dark:border-slate-700 hover:border-[#2D7A78] hover:bg-[#E6F4F1]/30 dark:hover:bg-slate-700/50 transition-colors shadow-2xs min-h-[44px] flex items-center justify-between cursor-pointer"
            >
              <span>{chip}</span>
              <Sparkles size={14} className="text-[#2D7A78] shrink-0 opacity-70" />
            </button>
          ))}
        </div>
      </div>

      <PlainDisclaimer />
    </div>
  );
};
