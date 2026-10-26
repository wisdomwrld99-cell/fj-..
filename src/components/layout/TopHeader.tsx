import React from 'react';
import { Shield, BookOpen, Clock, Star, Terminal } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopHeader: React.FC = () => {
  const { navigateTo, userProfile, setShowPaywall, setShowTestRunner, currentScreen } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => navigateTo('plan_summary')}
          className="flex items-center gap-2 text-left cursor-pointer group min-h-[44px]"
        >
          <div className="w-7 h-7 rounded-lg bg-[#2D7A78] flex items-center justify-center text-white shadow-2xs">
            <Shield size={16} />
          </div>
          <span className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
            Plainly
          </span>
        </button>

        {/* Quick Utilities */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigateTo('history')}
            className={`p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
              currentScreen === 'history' ? 'text-[#2D7A78] bg-[#E6F4F1] dark:bg-[#2D7A78]/20' : ''
            }`}
            title="Q&A History"
            aria-label="Q&A History"
          >
            <Clock size={18} />
          </button>

          <button
            type="button"
            onClick={() => navigateTo('glossary')}
            className={`p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
              currentScreen === 'glossary' ? 'text-[#2D7A78] bg-[#E6F4F1] dark:bg-[#2D7A78]/20' : ''
            }`}
            title="Insurance Glossary"
            aria-label="Insurance Glossary"
          >
            <BookOpen size={18} />
          </button>

          {userProfile.isPro ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D7A78] bg-[#E6F4F1] dark:bg-[#2D7A78]/20 px-2 py-1 rounded-full">
              PRO
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowPaywall(true)}
              className="text-[12px] font-semibold text-[#2D7A78] hover:text-[#246664] dark:text-[#3AAFA9] px-2 py-1 rounded-md hover:bg-[#E6F4F1]/60 cursor-pointer min-h-[36px] flex items-center gap-1"
            >
              <Star size={13} />
              <span>Pro</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
