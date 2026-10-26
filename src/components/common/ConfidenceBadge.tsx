import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { ConfidenceLevel } from '../../types';
import { STRINGS } from '../../constants/strings';

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  showDescription = false,
  size = 'md',
}) => {
  const config = {
    clear: {
      label: STRINGS.confidence.clear.badgeLabel,
      description: STRINGS.confidence.clear.description,
      icon: CheckCircle2,
      containerClass:
        'bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800',
      iconClass: 'text-emerald-700 dark:text-emerald-400',
    },
    partly_clear: {
      label: STRINGS.confidence.partly_clear.badgeLabel,
      description: STRINGS.confidence.partly_clear.description,
      icon: AlertCircle,
      containerClass:
        'bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800',
      iconClass: 'text-amber-700 dark:text-amber-400',
    },
    not_found: {
      label: STRINGS.confidence.not_found.badgeLabel,
      description: STRINGS.confidence.not_found.description,
      icon: HelpCircle,
      containerClass:
        'bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
      iconClass: 'text-slate-600 dark:text-slate-400',
    },
  }[confidence];

  const Icon = config.icon;
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const textClass = size === 'sm' ? 'text-[12px]' : size === 'lg' ? 'text-[16px] font-semibold' : 'text-[14px] font-medium';

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-medium transition-colors ${config.containerClass}`}
        role="status"
        aria-label={`Confidence: ${config.label}`}
      >
        <Icon size={iconSize} className={`shrink-0 ${config.iconClass}`} aria-hidden="true" />
        <span className={textClass}>{config.label}</span>
      </div>
      {showDescription && (
        <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
          {config.description}
        </p>
      )}
    </div>
  );
};
