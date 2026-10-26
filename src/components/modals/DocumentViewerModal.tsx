import React from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DocumentViewerModal: React.FC = () => {
  const { activeDocumentView, setActiveDocumentView, currentChunks, currentPolicy } = useApp();

  if (!activeDocumentView) return null;

  const { page, quote } = activeDocumentView;

  // Filter chunks for this page
  const pageChunks = currentChunks.filter((c) => c.page === page);

  const cleanQuote = quote ? quote.toLowerCase().trim() : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[20px] sm:rounded-[16px] shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E6F4F1] dark:bg-[#2D7A78]/20 text-[#2D7A78]">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                Policy Document · Page {page}
              </h2>
              <span className="text-[12px] text-slate-500">{currentPolicy.planName}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveDocumentView(null)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close document viewer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cited Quote Callout */}
        {quote && (
          <div className="p-3 bg-[#E6F4F1]/60 dark:bg-[#2D7A78]/15 border-b border-[#A7D7D2] dark:border-[#2D7A78]/30 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-[#2D7A78] shrink-0 mt-0.5" />
            <div className="text-[13px]">
              <span className="font-semibold text-[#2D7A78] dark:text-[#3AAFA9] block">
                Highlighted Source Quote:
              </span>
              <p className="italic text-slate-800 dark:text-slate-200 mt-0.5">"{quote}"</p>
            </div>
          </div>
        )}

        {/* Page Content Display */}
        <div className="p-4 overflow-y-auto space-y-4 text-[14px] leading-relaxed font-serif text-slate-800 dark:text-slate-200">
          {pageChunks.length > 0 ? (
            pageChunks.map((chunk) => {
              const textLower = chunk.text.toLowerCase();
              const hasQuote = cleanQuote && textLower.includes(cleanQuote);

              return (
                <div
                  key={chunk.id}
                  className={`p-3 rounded-[10px] border transition-colors ${
                    hasQuote
                      ? 'bg-[#E6F4F1]/30 dark:bg-[#2D7A78]/10 border-[#2D7A78]/40 ring-1 ring-[#2D7A78]/30'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {chunk.sectionTitle && (
                    <span className="text-[12px] font-sans font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      {chunk.sectionTitle}
                    </span>
                  )}
                  <p className="whitespace-pre-line font-mono text-[13px] text-slate-700 dark:text-slate-300">
                    {chunk.text}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500 font-sans text-[13px]">
              Page text excerpt not available in offline preview.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            type="button"
            onClick={() => setActiveDocumentView(null)}
            className="px-4 py-2 bg-[#2D7A78] text-white text-[13px] font-medium rounded-[8px] min-h-[40px] cursor-pointer"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
