import React, { useState } from 'react';
import { FileText, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { SourceCitation } from '../../types';

interface SourcePanelProps {
  sources: SourceCitation[];
  onViewInDocument?: (page: number, quote: string) => void;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({ sources, onViewInDocument }) => {
  const [selectedCitation, setSelectedCitation] = useState<SourceCitation | null>(null);

  if (!sources || sources.length === 0) {
    return (
      <div className="rounded-[12px] p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-[14px]">
          <FileText size={16} className="text-slate-500" />
          <span>Where this came from</span>
        </div>
        <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          No explicit clause was found in your uploaded policy pages. We do not guess or use standard industry rules when your document is silent.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-[14px]">
          <FileText size={16} className="text-[#2D7A78]" />
          <span>Where this came from</span>
        </div>
        <span className="text-[12px] text-slate-500 dark:text-slate-400">
          {sources.length} {sources.length === 1 ? 'citation' : 'citations'}
        </span>
      </div>

      <div className="space-y-3">
        {sources.map((source, index) => (
          <div
            key={index}
            className="p-3 bg-white dark:bg-slate-800 rounded-[10px] border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#2D7A78] dark:text-[#3AAFA9]">
                <span>Page {source.page}</span>
                {source.sectionTitle && (
                  <span className="text-slate-500 dark:text-slate-400 font-normal">
                    · {source.sectionTitle}
                  </span>
                )}
              </span>

              {source.verified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={12} />
                  <span>Exact quote verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                  <AlertTriangle size={12} />
                  <span>Close match</span>
                </span>
              )}
            </div>

            <blockquote className="text-[14px] italic text-slate-700 dark:text-slate-300 leading-relaxed border-l-2 border-[#2D7A78]/40 pl-2.5 py-0.5 my-1">
              "{source.quote}"
            </blockquote>

            {onViewInDocument && (
              <button
                type="button"
                onClick={() => onViewInDocument(source.page, source.quote)}
                className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-[#2D7A78] hover:text-[#246664] dark:text-[#3AAFA9] hover:underline cursor-pointer min-h-[32px]"
              >
                <ExternalLink size={13} />
                <span>See in document</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
