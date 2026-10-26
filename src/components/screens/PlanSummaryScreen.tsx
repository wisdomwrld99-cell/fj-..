import React from 'react';
import {
  FileText,
  HelpCircle,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JargonTooltip } from '../common/JargonTooltip';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { PlainDisclaimer } from '../common/PlainDisclaimer';

export const PlanSummaryScreen: React.FC = () => {
  const {
    currentPolicy,
    policies,
    setCurrentPolicyById,
    currentFacts,
    navigateTo,
    setActiveDocumentView,
    usageData,
    setShowTestRunner,
  } = useApp();

  const symbol = currentPolicy.currencySymbol || '$';

  // Helper to find specific key fact
  const getFact = (key: string) => currentFacts.find((f) => f.key === key);

  const deductibleFact = getFact('deductible');
  const oopMaxFact = getFact('out_of_pocket_max');
  const specialistFact = getFact('specialist_copay') || getFact('specialist_referral');
  const annualLimitFact = getFact('annual_maximum');

  // Non-covered / exclusions list
  const exclusionFacts = currentFacts.filter((f) => f.valueDisplay === 'Not Covered');

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-20">
      {/* Top Header & Policy Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[12px] font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
            Active Insurance
          </span>
          <div className="relative mt-0.5">
            <select
              value={currentPolicy.id}
              onChange={(e) => setCurrentPolicyById(e.target.value)}
              className="text-[16px] font-bold text-slate-900 dark:text-white bg-transparent border-none p-0 pr-6 cursor-pointer focus:outline-hidden"
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id} className="text-slate-900 bg-white dark:bg-slate-800">
                  {p.insurer} ({p.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowTestRunner(true)}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2D7A78] dark:text-[#3AAFA9] bg-[#E6F4F1] dark:bg-[#2D7A78]/20 px-2.5 py-1.5 rounded-[8px] min-h-[36px] hover:bg-[#A7D7D2]/40 cursor-pointer"
            title="Run 5-Policy 30-Question Benchmark"
          >
            <Activity size={14} />
            <span>Benchmark (30 Qs)</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('add_policy')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Add another policy"
            title="Add policy"
          >
            <PlusCircle size={20} />
          </button>
        </div>
      </div>

      {/* Plan Card Banner */}
      <div className="p-4 rounded-[12px] bg-gradient-to-br from-[#2D7A78] to-[#246664] text-white shadow-sm space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-100">
              {currentPolicy.type.toUpperCase()} INSURANCE
            </span>
            <h1 className="text-[20px] font-bold tracking-tight text-white mt-0.5">
              {currentPolicy.planName}
            </h1>
          </div>
          <Shield size={24} className="text-emerald-200 shrink-0" />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-emerald-100/90 pt-1 border-t border-emerald-400/20">
          <span>Member ID: {currentPolicy.memberId}</span>
          <span>Group: {currentPolicy.groupNumber}</span>
          <span>Call: {currentPolicy.phone}</span>
        </div>
      </div>

      {/* Ask Question Quick CTA */}
      <button
        type="button"
        onClick={() => navigateTo('ask_question')}
        className="w-full p-3.5 bg-white dark:bg-slate-800 rounded-[12px] border border-[#2D7A78]/30 dark:border-slate-700 shadow-xs flex items-center justify-between text-left group hover:border-[#2D7A78] transition-colors cursor-pointer min-h-[52px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E6F4F1] dark:bg-[#2D7A78]/20 flex items-center justify-center text-[#2D7A78] dark:text-[#3AAFA9]">
            <HelpCircle size={18} />
          </div>
          <div>
            <span className="text-[14px] font-semibold text-slate-900 dark:text-white block">
              Ask about coverage & costs
            </span>
            <span className="text-[12px] text-slate-500 dark:text-slate-400">
              e.g., "Is a crown covered?", "Specialist visit copay"
            </span>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-400 group-hover:text-[#2D7A78] transition-colors" />
      </button>

      {/* SECTION: YOUR PLAN IN PLAIN WORDS */}
      <div className="space-y-3">
        <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">
          Your Plan in Plain Words
        </h2>

        {/* Fact Card 1: Deductible */}
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-semibold text-slate-900 dark:text-white">
                  What you pay before help starts
                </span>
                <JargonTooltip termKey="deductible" />
              </div>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                {deductibleFact?.explanation || 'Deductible'}
              </p>
            </div>
            <span className="text-[18px] font-bold text-slate-900 dark:text-white tabular-nums">
              {deductibleFact ? deductibleFact.valueDisplay : 'Not found in document'}
            </span>
          </div>

          {/* Deductible Used Progress Bar */}
          {deductibleFact && deductibleFact.value && deductibleFact.value > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex justify-between text-[12px] text-slate-600 dark:text-slate-400 mb-1">
                <span>Paid this year: {symbol}{usageData.deductibleUsed}</span>
                <span>Remaining: {symbol}{Math.max(0, deductibleFact.value - usageData.deductibleUsed)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#2D7A78] h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (usageData.deductibleUsed / deductibleFact.value) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {deductibleFact?.sourcePage && deductibleFact.sourceQuote && (
            <button
              type="button"
              onClick={() =>
                setActiveDocumentView({
                  page: deductibleFact.sourcePage!,
                  quote: deductibleFact.sourceQuote,
                })
              }
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2D7A78] dark:text-[#3AAFA9] hover:underline cursor-pointer pt-1"
            >
              <ExternalLink size={12} />
              <span>See in document (Page {deductibleFact.sourcePage})</span>
            </button>
          )}
        </div>

        {/* Fact Card 2: Out of pocket max */}
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-1.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-semibold text-slate-900 dark:text-white">
                  The most you could pay in a year
                </span>
                <JargonTooltip termKey="outOfPocketMax" />
              </div>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                {oopMaxFact?.explanation || 'Out-of-Pocket Maximum'}
              </p>
            </div>
            <span className="text-[18px] font-bold text-slate-900 dark:text-white tabular-nums">
              {oopMaxFact ? oopMaxFact.valueDisplay : 'No max stated'}
            </span>
          </div>

          {oopMaxFact?.sourcePage && oopMaxFact.sourceQuote && (
            <button
              type="button"
              onClick={() =>
                setActiveDocumentView({
                  page: oopMaxFact.sourcePage!,
                  quote: oopMaxFact.sourceQuote,
                })
              }
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2D7A78] dark:text-[#3AAFA9] hover:underline cursor-pointer pt-1"
            >
              <ExternalLink size={12} />
              <span>See in document (Page {oopMaxFact.sourcePage})</span>
            </button>
          )}
        </div>

        {/* Fact Card 3: Per Visit Copays / Percentage */}
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-1.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-semibold text-slate-900 dark:text-white">
                  What you pay per doctor visit
                </span>
                <JargonTooltip termKey="copay" />
              </div>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                Specialist consultations and office care
              </p>
            </div>
            <span className="text-[16px] font-bold text-slate-900 dark:text-white">
              {specialistFact ? specialistFact.valueDisplay : 'Not found in document'}
            </span>
          </div>

          {specialistFact?.sourcePage && specialistFact.sourceQuote && (
            <button
              type="button"
              onClick={() =>
                setActiveDocumentView({
                  page: specialistFact.sourcePage!,
                  quote: specialistFact.sourceQuote,
                })
              }
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2D7A78] dark:text-[#3AAFA9] hover:underline cursor-pointer pt-1"
            >
              <ExternalLink size={12} />
              <span>See in document (Page {specialistFact.sourcePage})</span>
            </button>
          )}
        </div>

        {/* Fact Card 4: Yearly Limits (especially dental/vision) */}
        {annualLimitFact && (
          <div className="p-3.5 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-1.5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-semibold text-slate-900 dark:text-white">
                    Yearly benefit limit
                  </span>
                  <JargonTooltip termKey="annualLimit" />
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {annualLimitFact.explanation}
                </p>
              </div>
              <span className="text-[16px] font-bold text-slate-900 dark:text-white">
                {annualLimitFact.valueDisplay}
              </span>
            </div>

            {annualLimitFact.sourcePage && annualLimitFact.sourceQuote && (
              <button
                type="button"
                onClick={() =>
                  setActiveDocumentView({
                    page: annualLimitFact.sourcePage!,
                    quote: annualLimitFact.sourceQuote,
                  })
                }
                className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2D7A78] dark:text-[#3AAFA9] hover:underline cursor-pointer pt-1"
              >
                <ExternalLink size={12} />
                <span>See in document (Page {annualLimitFact.sourcePage})</span>
              </button>
            )}
          </div>
        )}

        {/* Exclusions Section */}
        {exclusionFacts.length > 0 && (
          <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-[12px] border border-rose-200/80 dark:border-rose-900/60 space-y-2">
            <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-semibold text-[14px]">
              <AlertOctagon size={16} />
              <span>What is NOT covered (as stated in document)</span>
            </div>
            <ul className="space-y-1.5 text-[13px] text-slate-700 dark:text-slate-300">
              {exclusionFacts.map((ex) => (
                <li key={ex.id} className="flex items-start justify-between gap-2">
                  <span>• {ex.label}: {ex.explanation}</span>
                  {ex.sourcePage && ex.sourceQuote && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDocumentView({
                          page: ex.sourcePage!,
                          quote: ex.sourceQuote,
                        })
                      }
                      className="text-[11px] text-[#2D7A78] dark:text-[#3AAFA9] hover:underline shrink-0"
                    >
                      Pg {ex.sourcePage}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Persistent Disclaimer */}
      <PlainDisclaimer variant="card" />
    </div>
  );
};
