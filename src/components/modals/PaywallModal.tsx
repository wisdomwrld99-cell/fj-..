import React, { useState } from 'react';
import { X, Check, Shield, Sparkles, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PaywallModal: React.FC = () => {
  const { showPaywall, setShowPaywall, updateUserProfile } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  if (!showPaywall) return null;

  const handleUpgrade = () => {
    updateUserProfile({ isPro: true });
    setShowPaywall(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[20px] sm:rounded-[16px] shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Top Dismiss Button */}
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6F4F1] dark:bg-[#2D7A78]/20 text-[#2D7A78] dark:text-[#3AAFA9] text-[12px] font-semibold">
            <Star size={13} />
            <span>Plainly Pro</span>
          </div>

          <button
            type="button"
            onClick={() => setShowPaywall(false)}
            className="p-2 -mr-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close upgrade dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">
            Never Overpay for Healthcare
          </h2>
          <p className="text-[13px] text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Upgrade for unlimited grounded questions, family policies, and the complete pre-visit toolkit.
          </p>
        </div>

        {/* Feature Comparison */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-[12px] border border-slate-200 dark:border-slate-700 text-[13px] space-y-2">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Check size={16} className="text-[#2D7A78] shrink-0" />
            <span>Unlimited verified questions & answers</span>
          </div>
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Check size={16} className="text-[#2D7A78] shrink-0" />
            <span>Multiple policies (health, dental, vision, family)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Check size={16} className="text-[#2D7A78] shrink-0" />
            <span>Deterministic cost estimator with real-time usage tracking</span>
          </div>
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Check size={16} className="text-[#2D7A78] shrink-0" />
            <span>Custom pre-visit checklists & clinic note export</span>
          </div>
        </div>

        {/* Plan Pricing Toggle */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedPlan('yearly')}
            className={`p-3 rounded-[10px] border text-left cursor-pointer transition-colors ${
              selectedPlan === 'yearly'
                ? 'bg-[#E6F4F1] dark:bg-[#2D7A78]/20 border-[#2D7A78] ring-1 ring-[#2D7A78]'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="text-[11px] font-semibold text-[#2D7A78] uppercase block">
              Best Value (Save 33%)
            </span>
            <span className="text-[18px] font-bold text-slate-900 dark:text-white block mt-0.5">
              $39.99 <span className="text-[12px] font-normal text-slate-500">/ yr</span>
            </span>
            <span className="text-[11px] text-slate-500">$3.33/month</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan('monthly')}
            className={`p-3 rounded-[10px] border text-left cursor-pointer transition-colors ${
              selectedPlan === 'monthly'
                ? 'bg-[#E6F4F1] dark:bg-[#2D7A78]/20 border-[#2D7A78] ring-1 ring-[#2D7A78]'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">
              Monthly
            </span>
            <span className="text-[18px] font-bold text-slate-900 dark:text-white block mt-0.5">
              $4.99 <span className="text-[12px] font-normal text-slate-500">/ mo</span>
            </span>
            <span className="text-[11px] text-slate-500">Cancel anytime</span>
          </button>
        </div>

        {/* Upgrade Action Button */}
        <button
          type="button"
          onClick={handleUpgrade}
          className="w-full py-3 bg-[#2D7A78] hover:bg-[#246664] text-white font-medium text-[15px] rounded-[10px] min-h-[48px] flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <span>Upgrade to Plainly Pro</span>
          <Sparkles size={16} />
        </button>

        <p className="text-center text-[12px] text-slate-400">
          Plainly Free includes 1 policy, 5 questions/month, and full plan summaries.
        </p>
      </div>
    </div>
  );
};
