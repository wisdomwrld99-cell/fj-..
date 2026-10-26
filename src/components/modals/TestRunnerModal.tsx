import React, { useState } from 'react';
import { X, Play, CheckCircle2, AlertTriangle, ShieldCheck, Terminal, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { runBenchmark, BenchmarkReport } from '../../benchmark/runPolicyBenchmark';

export const TestRunnerModal: React.FC = () => {
  const { showTestRunner, setShowTestRunner } = useApp();
  const [report, setReport] = useState<BenchmarkReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'health' | 'dental' | 'vision'>('all');

  if (!showTestRunner) return null;

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const rep = runBenchmark();
      setReport(rep);
      setIsRunning(false);
    }, 400);
  };

  const filteredResults = report
    ? report.results.filter((r) => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'health') return r.policyKey.includes('ppo') || r.policyKey.includes('hmo') || r.policyKey.includes('hdhp');
        if (selectedFilter === 'dental') return r.policyKey.includes('dental');
        if (selectedFilter === 'vision') return r.policyKey.includes('vision');
        return true;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[16px] shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E6F4F1] dark:bg-[#2D7A78]/20 text-[#2D7A78]">
              <Terminal size={18} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">
                Policy Test Suite & Benchmark
              </h2>
              <p className="text-[12px] text-slate-500">
                5 realistic policies · 30 verified test questions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTestRunner(false)}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close test benchmark"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Controls & Stats */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="px-4 py-2 bg-[#2D7A78] hover:bg-[#246664] disabled:opacity-50 text-white font-medium text-[13px] rounded-[8px] min-h-[40px] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Play size={14} />
              <span>{isRunning ? 'Auditing 30 Questions...' : 'Run All 30 Tests'}</span>
            </button>

            {report && (
              <span className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
                {report.passed}/{report.total} Passed ({((report.passed / report.total) * 100).toFixed(0)}%)
              </span>
            )}
          </div>

          {/* Filter tabs */}
          {report && (
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-[8px] border border-slate-200 dark:border-slate-700 text-[12px]">
              {(['all', 'health', 'dental', 'vision'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-2.5 py-1 rounded-[6px] capitalize transition-colors cursor-pointer ${
                    selectedFilter === filter
                      ? 'bg-[#2D7A78] text-white font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          {!report && !isRunning && (
            <div className="text-center py-10 space-y-2">
              <ShieldCheck size={36} className="mx-auto text-[#2D7A78]" />
              <p className="text-[14px] font-medium text-slate-800 dark:text-slate-200">
                Click "Run All 30 Tests" to evaluate coverage extraction.
              </p>
              <p className="text-[12px] text-slate-500 max-w-sm mx-auto">
                Verifies exact quotes, page numbers, zero hallucinations, and refusal of clinical medical advice.
              </p>
            </div>
          )}

          {report &&
            filteredResults.map((item, idx) => (
              <div
                key={item.questionId}
                className="p-3 bg-white dark:bg-slate-800 rounded-[10px] border border-slate-200 dark:border-slate-700 text-[13px] space-y-1 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                    <span className="text-slate-400 font-mono text-[11px]">#{idx + 1}</span>
                    <span>{item.question}</span>
                  </div>

                  {item.pass ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 size={12} />
                      <span>PASS</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 px-2 py-0.5 rounded-full shrink-0">
                      <AlertTriangle size={12} />
                      <span>FAIL</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="font-mono text-[11px] text-slate-400 uppercase">
                    {item.policyKey} · Confidence: {item.actualConfidence}
                  </span>
                  <span className="text-[12px] text-slate-600 dark:text-slate-300 font-sans">
                    {item.notes}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* Terminal Run Instructions Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[12px] font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>CLI: npx tsx src/benchmark/runPolicyBenchmark.ts</span>
          <span>Math tests: npm run test:math</span>
        </div>
      </div>
    </div>
  );
};
