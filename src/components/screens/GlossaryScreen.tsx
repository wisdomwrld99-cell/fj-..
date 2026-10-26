import React, { useState } from 'react';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { STRINGS } from '../../constants/strings';

export const GlossaryScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const terms = Object.entries(STRINGS.jargon).map(([key, item]) => ({
    key,
    ...item,
  }));

  const filteredTerms = terms.filter(
    (t) =>
      t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortDef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fullDef.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Insurance Glossary
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Plain words for confusing terms
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search terms (e.g. Deductible, Copay, Coinsurance)..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] text-[14px] text-slate-900 dark:text-white min-h-[44px] focus:outline-hidden focus:ring-2 focus:ring-[#2D7A78]/30 shadow-xs"
        />
      </div>

      {/* Terms List */}
      <div className="space-y-3">
        {filteredTerms.map((item) => (
          <div
            key={item.key}
            className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-2"
          >
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">
                {item.term}
              </h2>
              <p className="text-[14px] font-semibold text-[#2D7A78] dark:text-[#3AAFA9] mt-0.5">
                {item.shortDef}
              </p>
            </div>

            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.fullDef}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[12px] text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">In real life:</span>{' '}
              {item.example}
            </div>
          </div>
        ))}

        {filteredTerms.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-[14px]">
            No terms found matching "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
