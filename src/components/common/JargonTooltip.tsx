import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { STRINGS } from '../../constants/strings';

interface JargonTooltipProps {
  termKey: keyof typeof STRINGS.jargon;
  children?: React.ReactNode;
}

export const JargonTooltip: React.FC<JargonTooltipProps> = ({ termKey, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const jargonInfo = STRINGS.jargon[termKey];

  if (!jargonInfo) {
    return <span>{children}</span>;
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 font-medium text-[#2D7A78] dark:text-[#3AAFA9] underline decoration-dotted decoration-[#2D7A78]/50 underline-offset-4 hover:decoration-solid cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#2D7A78]/30 rounded-xs"
        aria-expanded={isOpen}
      >
        <span>{children || jargonInfo.term}</span>
        <HelpCircle size={13} className="opacity-70" aria-hidden="true" />
      </button>

      {isOpen && (
        <span
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3.5 bg-slate-900 text-white rounded-[10px] shadow-xl text-left block border border-slate-700 animate-in fade-in duration-150"
          role="tooltip"
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="font-semibold text-[14px] text-white">
              {jargonInfo.term}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5"
              aria-label="Close explanation"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-[13px] text-emerald-200 font-medium mb-1.5 leading-snug">
            {jargonInfo.shortDef}
          </p>
          <p className="text-[12px] text-slate-300 leading-normal">
            {jargonInfo.fullDef}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="font-medium text-slate-300">Example:</span> {jargonInfo.example}
          </div>
          {/* Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  );
};
