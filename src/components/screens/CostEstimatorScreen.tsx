import React, { useState, useMemo } from 'react';
import { Calculator, ArrowLeft, RefreshCw, HelpCircle, Check, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateEstimatedCost } from '../../services/costEstimator';
import { EstimateRange } from '../common/EstimateRange';
import { JargonTooltip } from '../common/JargonTooltip';
import { PlainDisclaimer } from '../common/PlainDisclaimer';

interface ProcedurePreset {
  id: string;
  name: string;
  type: 'health' | 'dental' | 'vision';
  typicalQuote: number;
  fixedCopay?: number;
  coinsuranceRate?: number;
  isPreventive?: boolean;
}

const PROCEDURE_PRESETS: ProcedurePreset[] = [
  {
    id: 'specialist_visit',
    name: 'Specialist Doctor Visit (e.g. Dermatologist)',
    type: 'health',
    typicalQuote: 280,
    fixedCopay: 35,
  },
  {
    id: 'mri_scan',
    name: 'MRI Knee Scan (Outpatient Facility)',
    type: 'health',
    typicalQuote: 850,
    coinsuranceRate: 0.20,
  },
  {
    id: 'routine_physical',
    name: 'Annual Preventive Physical Checkup',
    type: 'health',
    typicalQuote: 320,
    isPreventive: true,
  },
  {
    id: 'dental_cleaning',
    name: 'Routine Dental Cleaning & X-Rays',
    type: 'dental',
    typicalQuote: 180,
    isPreventive: true,
  },
  {
    id: 'dental_crown',
    name: 'Dental Porcelain Crown (Class III)',
    type: 'dental',
    typicalQuote: 1100,
    coinsuranceRate: 0.50,
  },
  {
    id: 'eye_exam',
    name: 'Comprehensive Eye Examination',
    type: 'vision',
    typicalQuote: 160,
    fixedCopay: 10,
  },
];

export const CostEstimatorScreen: React.FC = () => {
  const { currentPolicy, currentFacts, usageData, updateUsage, navigateTo } = useApp();

  const symbol = currentPolicy.currencySymbol || '$';

  // Selected Procedure & Quote
  const [selectedPresetId, setSelectedPresetId] = useState<string>('specialist_visit');
  const [quotedPriceInput, setQuotedPriceInput] = useState<number>(280);

  // Editable Yearly Usage Tracker
  const [editingUsage, setEditingUsage] = useState(false);
  const [tempDeductibleUsed, setTempDeductibleUsed] = useState<number>(usageData.deductibleUsed);
  const [tempOopUsed, setTempOopUsed] = useState<number>(usageData.outOfPocketUsed);

  // Filter presets matching active policy type
  const relevantPresets = PROCEDURE_PRESETS.filter(
    (p) => p.type === currentPolicy.type || currentPolicy.type === 'other'
  );

  const selectedPreset =
    PROCEDURE_PRESETS.find((p) => p.id === selectedPresetId) || PROCEDURE_PRESETS[0];

  const handleSelectPreset = (p: ProcedurePreset) => {
    setSelectedPresetId(p.id);
    setQuotedPriceInput(p.typicalQuote);
  };

  // Extract policy facts for deductible and OOP max
  const deductibleTotal = currentFacts.find((f) => f.key === 'deductible')?.value ?? 500;
  const oopMaxTotal = currentFacts.find((f) => f.key === 'out_of_pocket_max')?.value ?? 3500;
  const annualLimitTotal = currentFacts.find((f) => f.key === 'annual_maximum')?.value ?? undefined;

  // Run Deterministic Math
  const estimateResult = useMemo(() => {
    return calculateEstimatedCost({
      serviceName: selectedPreset.name,
      quotedPrice: Number(quotedPriceInput) || 0,
      fixedCopay: selectedPreset.fixedCopay,
      coinsuranceRate: selectedPreset.coinsuranceRate ?? 0.20,
      isPreventive: selectedPreset.isPreventive,
      deductibleTotal,
      deductibleUsed: usageData.deductibleUsed,
      outOfPocketMaxTotal: oopMaxTotal,
      outOfPocketMaxUsed: usageData.outOfPocketUsed,
      annualLimitTotal,
      annualLimitUsed: 0,
      currencySymbol: symbol,
    });
  }, [
    selectedPreset,
    quotedPriceInput,
    deductibleTotal,
    usageData.deductibleUsed,
    oopMaxTotal,
    usageData.outOfPocketUsed,
    annualLimitTotal,
    symbol,
  ]);

  const handleSaveUsage = () => {
    updateUsage({
      deductibleUsed: Number(tempDeductibleUsed) || 0,
      outOfPocketUsed: Number(tempOopUsed) || 0,
    });
    setEditingUsage(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-24">
      {/* Top Bar */}
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
            Cost Estimator
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Deterministic arithmetic · Verified against {currentPolicy.planName}
          </p>
        </div>
      </div>

      {/* Usage Tracker Card (Amount already paid this year) */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Your Spending This Year</span>
            <JargonTooltip termKey="deductible" />
          </span>

          <button
            type="button"
            onClick={() => {
              if (editingUsage) handleSaveUsage();
              else setEditingUsage(true);
            }}
            className="text-[13px] font-medium text-[#2D7A78] dark:text-[#3AAFA9] hover:underline cursor-pointer min-h-[36px]"
          >
            {editingUsage ? 'Save numbers' : 'Update spending'}
          </button>
        </div>

        {editingUsage ? (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[12px] text-slate-500 block mb-1">
                Deductible Paid ({symbol})
              </label>
              <input
                type="number"
                value={tempDeductibleUsed}
                onChange={(e) => setTempDeductibleUsed(Number(e.target.value))}
                className="w-full p-2 text-[14px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-[8px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-slate-500 block mb-1">
                Out-of-Pocket Paid ({symbol})
              </label>
              <input
                type="number"
                value={tempOopUsed}
                onChange={(e) => setTempOopUsed(Number(e.target.value))}
                className="w-full p-2 text-[14px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-[8px]"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-1 text-[13px]">
            <div className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-900/60">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wide">
                Deductible Used
              </span>
              <span className="text-[18px] font-bold text-slate-900 dark:text-white tabular-nums">
                {symbol}{usageData.deductibleUsed}{' '}
                <span className="text-[12px] font-normal text-slate-500">
                  / {symbol}{deductibleTotal}
                </span>
              </span>
            </div>

            <div className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-900/60">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wide">
                Out-of-Pocket Used
              </span>
              <span className="text-[18px] font-bold text-slate-900 dark:text-white tabular-nums">
                {symbol}{usageData.outOfPocketUsed}{' '}
                <span className="text-[12px] font-normal text-slate-500">
                  / {symbol}{oopMaxTotal}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Select Procedure / Visit Type */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <label className="text-[14px] font-semibold text-slate-900 dark:text-white block">
          Choose a Visit or Procedure
        </label>

        <div className="space-y-1.5">
          {relevantPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`w-full text-left p-2.5 rounded-[8px] text-[13px] font-medium transition-colors flex items-center justify-between min-h-[44px] cursor-pointer ${
                selectedPresetId === preset.id
                  ? 'bg-[#E6F4F1] dark:bg-[#2D7A78]/25 text-[#2D7A78] dark:text-[#3AAFA9] border border-[#A7D7D2] dark:border-[#2D7A78]/50'
                  : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>{preset.name}</span>
              <span className="text-[12px] font-mono text-slate-500">
                Avg: {symbol}{preset.typicalQuote}
              </span>
            </button>
          ))}
        </div>

        {/* Enter Custom Price Quote */}
        <div className="pt-2">
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
            Provider's Quoted Price ({symbol})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
              {symbol}
            </span>
            <input
              type="number"
              value={quotedPriceInput}
              onChange={(e) => setQuotedPriceInput(Number(e.target.value))}
              placeholder="e.g. 400"
              className="w-full pl-8 pr-3 py-2.5 text-[15px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Calculated Result Breakdown */}
      <EstimateRange
        estimate={estimateResult}
        currencySymbol={symbol}
        serviceName={selectedPreset.name}
      />

      <PlainDisclaimer variant="subtle" />
    </div>
  );
};
