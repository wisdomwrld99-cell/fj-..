import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { EstimateBreakdown } from '../../types';

interface EstimateRangeProps {
  estimate?: EstimateBreakdown;
  currencySymbol?: string;
  serviceName?: string;
}

export const EstimateRange: React.FC<EstimateRangeProps> = ({
  estimate,
  currencySymbol = '$',
  serviceName,
}) => {
  const [showMath, setShowMath] = useState(false);

  if (!estimate) {
    return null;
  }

  const isFixed = estimate.costRange.min === estimate.costRange.max;
  const isZero = estimate.totalEstimatedPatientCost === 0;

  return (
    <div className="rounded-[12px] p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-[12px] font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
            What you'd likely pay {serviceName ? `for ${serviceName}` : ''}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[28px] font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {isZero ? (
                '100% Covered ($0)'
              ) : isFixed ? (
                `${currencySymbol}${estimate.costRange.min}`
              ) : (
                `${currencySymbol}${estimate.costRange.min} – ${currencySymbol}${estimate.costRange.max}`
              )}
            </span>
            <span className="text-[13px] text-slate-500 dark:text-slate-400">
              {isFixed ? '(fixed copay)' : '(estimated range)'}
            </span>
          </div>
        </div>

        <div className="p-2 rounded-[8px] bg-[#E6F4F1] dark:bg-[#2D7A78]/20 text-[#2D7A78] dark:text-[#3AAFA9] shrink-0">
          <Calculator size={20} aria-hidden="true" />
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-[8px] p-3 text-[13px] text-slate-600 dark:text-slate-300 space-y-1 mb-3">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
          <Info size={14} className="text-[#2D7A78] shrink-0" />
          <span>Assumptions behind this estimate:</span>
        </div>
        <ul className="list-disc list-inside space-y-0.5 pl-1 text-[13px]">
          <li>You visit an in-network provider</li>
          {estimate.deductibleRemainingBefore > 0 ? (
            <li>
              You have {currencySymbol}{estimate.deductibleRemainingBefore} left on your deductible
            </li>
          ) : (
            <li>Your annual deductible has already been met</li>
          )}
          {estimate.coinsuranceRate > 0 && (
            <li>Your coinsurance is {Math.round(estimate.coinsuranceRate * 100)}%</li>
          )}
          <li>Standard, non-complex procedure without facility surcharge</li>
        </ul>
      </div>

      {estimate.explanationSteps && estimate.explanationSteps.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-700/60 pt-2.5">
          <button
            type="button"
            onClick={() => setShowMath(!showMath)}
            className="w-full flex items-center justify-between text-[13px] font-medium text-[#2D7A78] dark:text-[#3AAFA9] hover:underline cursor-pointer py-1 min-h-[36px]"
          >
            <span>See how the numbers were calculated</span>
            {showMath ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showMath && (
            <div className="mt-2.5 p-3 rounded-[8px] bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 text-[13px] font-mono text-slate-700 dark:text-slate-300">
              {estimate.explanationSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-slate-400 select-none">{idx + 1}.</span>
                  <span className="font-sans leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
