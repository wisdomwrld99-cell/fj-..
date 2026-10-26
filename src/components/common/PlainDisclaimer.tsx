import React from 'react';
import { AlertCircle } from 'lucide-react';
import { STRINGS } from '../../constants/strings';

interface PlainDisclaimerProps {
  className?: string;
  variant?: 'subtle' | 'card';
}

export const PlainDisclaimer: React.FC<PlainDisclaimerProps> = ({
  className = '',
  variant = 'subtle',
}) => {
  if (variant === 'card') {
    return (
      <aside
        aria-label="Important legal disclaimer"
        className={`rounded-[12px] p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed flex items-start gap-2.5 ${className}`}
      >
        <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p>{STRINGS.disclaimers.persistent}</p>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Important legal disclaimer"
      className={`flex items-start gap-2 text-[12px] text-slate-500 dark:text-slate-400 leading-normal py-2 ${className}`}
    >
      <AlertCircle size={14} className="text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
      <p>{STRINGS.disclaimers.persistent}</p>
    </aside>
  );
};
