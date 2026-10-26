import React, { useState } from 'react';
import { Camera, Upload, Edit3, ArrowLeft, Check, Sparkles, FileText, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InsuranceType, OCRCardResult } from '../../types';
import { SAMPLE_CARD_PRESETS, parseInsuranceCardText } from '../../services/ocrService';
import { chunkDocumentText, validateAndGroundPlanFacts } from '../../services/documentProcessor';
import { STRINGS } from '../../constants/strings';

type Tab = 'scan' | 'upload' | 'manual';

export const AddPolicyScreen: React.FC = () => {
  const { navigateTo, addNewPolicy, userProfile, updateUserProfile } = useApp();

  // Mode Selection
  const [activeTab, setActiveTab] = useState<Tab>('scan');

  // Policy Metadata
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('health');
  const [country, setCountry] = useState(userProfile.country || 'US');
  const [currencySymbol, setCurrencySymbol] = useState(userProfile.currencySymbol || '$');

  // Card OCR States
  const [isScanning, setIsScanning] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [extractedCard, setExtractedCard] = useState<OCRCardResult | null>(null);

  // Document Upload States
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const [docProgress, setDocProgress] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  // Manual Entry States
  const [manualForm, setManualForm] = useState({
    insurer: '',
    planName: '',
    memberId: '',
    groupNumber: '',
    phone: '',
    deductible: 500,
    outOfPocketMax: 3500,
    copay: 30,
    coinsurance: 20,
    annualLimit: 1500,
    waitingPeriod: 0,
  });

  // Country change sync
  const handleCountryChange = (cCode: string) => {
    setCountry(cCode);
    const countryObj = STRINGS.countries.find((c) => c.code === cCode);
    if (countryObj) {
      setCurrencySymbol(countryObj.symbol);
      updateUserProfile({ country: cCode, currency: countryObj.currency, currencySymbol: countryObj.symbol });
    }
  };

  // Card Preset Click (Instant test simulator)
  const handleSelectCardPreset = (presetId: string) => {
    const preset = SAMPLE_CARD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setIsScanning(true);
    setTimeout(() => {
      setInsuranceType(preset.type);
      setExtractedCard({
        insurer: preset.insurer,
        planName: preset.planName,
        memberId: preset.memberId,
        groupNumber: preset.groupNumber,
        phone: preset.phone,
        rawText: `INSURER: ${preset.insurer}\nPLAN: ${preset.planName}\nMEMBER ID: ${preset.memberId}\nGROUP: ${preset.groupNumber}\nCALL: ${preset.phone}`,
        confidence: 96,
      });
      setIsScanning(false);
    }, 600);
  };

  // Card Raw Text OCR parse
  const handleRunOcrOnText = () => {
    if (!ocrText.trim()) return;
    setIsScanning(true);
    setTimeout(() => {
      const parsed = parseInsuranceCardText(ocrText);
      setExtractedCard(parsed);
      setIsScanning(false);
    }, 400);
  };

  // Simulated Document Ingestion with honest progress
  const handleSimulateDocUpload = (fileName = 'Policy_Benefits_Schedule_2026.pdf') => {
    setSelectedFileName(fileName);
    setIsProcessingDoc(true);

    const steps = [
      'Extracting clean text from pages...',
      'Splitting sections & character offsets...',
      'Verifying benefits against strict ground rules...',
      'Formatting plain-language summary...',
    ];

    let stepIndex = 0;
    setDocProgress(steps[0]);

    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setDocProgress(steps[stepIndex]);
      } else {
        clearInterval(interval);
        setIsProcessingDoc(false);

        // Generate chunks and facts
        const dummyPages = [
          {
            pageNumber: 1,
            text: `Section 1. Annual Deductible: The Individual In-Network Deductible is $500. Out-of-pocket maximum is $3,500.`,
          },
          {
            pageNumber: 2,
            text: `Section 2. Office Visits: Primary Care copay is $20. Specialist copay is $35. In-network Advanced Imaging MRI is 20% after deductible.`,
          },
          {
            pageNumber: 3,
            text: `Section 3. Exclusions: Cosmetic procedures and adult dental are not covered.`,
          },
        ];

        const chunks = chunkDocumentText(dummyPages);
        const facts = validateAndGroundPlanFacts(
          [
            {
              key: 'deductible',
              label: 'Individual Deductible',
              value: 500,
              valueDisplay: '$500 / year',
              unit: 'currency',
              sourcePage: 1,
              sourceQuote: 'The Individual In-Network Deductible is $500.',
              explanation: 'You pay the first $500 before insurance begins sharing costs.',
            },
            {
              key: 'out_of_pocket_max',
              label: 'Out-of-Pocket Maximum',
              value: 3500,
              valueDisplay: '$3,500 / year',
              unit: 'currency',
              sourcePage: 1,
              sourceQuote: 'Out-of-pocket maximum is $3,500.',
              explanation: 'The most you could pay in one year for covered care.',
            },
            {
              key: 'specialist_copay',
              label: 'Specialist Copay',
              value: 35,
              valueDisplay: '$35 flat copay',
              unit: 'currency',
              sourcePage: 2,
              sourceQuote: 'Specialist copay is $35.',
              explanation: 'Flat fee per visit, deductible not required.',
            },
          ],
          chunks
        );

        addNewPolicy(
          {
            insurer: 'Uploaded Policy Partner',
            planName: 'Comprehensive In-Network Health Plan',
            memberId: 'MEM-9920194',
            groupNumber: 'GRP-3310',
            phone: '1-800-555-0199',
            type: insuranceType,
            country,
            currency: userProfile.currency || 'USD',
            currencySymbol,
            renewalDate: '2027-01-01',
            yearStart: '2026-01-01',
          },
          facts,
          chunks
        );
      }
    }, 700);
  };

  // Submit Extracted Card
  const handleConfirmCard = () => {
    if (!extractedCard) return;

    addNewPolicy({
      insurer: extractedCard.insurer,
      planName: extractedCard.planName,
      memberId: extractedCard.memberId,
      groupNumber: extractedCard.groupNumber,
      phone: extractedCard.phone,
      type: insuranceType,
      country,
      currency: userProfile.currency || 'USD',
      currencySymbol,
      renewalDate: '2027-01-01',
      yearStart: '2026-01-01',
    });
  };

  // Submit Manual Form
  const handleConfirmManual = () => {
    addNewPolicy({
      insurer: manualForm.insurer || 'Custom Insurer',
      planName: manualForm.planName || 'Self-Managed Plan',
      memberId: manualForm.memberId || 'MANUAL-001',
      groupNumber: manualForm.groupNumber || 'GRP-001',
      phone: manualForm.phone || '1-800-555-0100',
      type: insuranceType,
      country,
      currency: userProfile.currency || 'USD',
      currencySymbol,
      renewalDate: '2027-01-01',
      yearStart: '2026-01-01',
    });
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-16">
      {/* Header */}
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
            Add Your Policy
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Choose your preferred way to input your details
          </p>
        </div>
      </div>

      {/* Country & Insurance Type Selector */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-[12px] border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Globe size={15} className="text-[#2D7A78]" />
            <span>Country & Currency</span>
          </label>
          <select
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="text-[13px] font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-[8px] px-2.5 py-1.5 min-h-[38px] text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            {STRINGS.countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
            Insurance Type
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-[10px] border border-slate-200 dark:border-slate-700">
            {(['health', 'dental', 'vision', 'other'] as InsuranceType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setInsuranceType(t)}
                className={`py-2 text-[13px] font-medium rounded-[8px] capitalize transition-colors min-h-[40px] cursor-pointer ${
                  insuranceType === t
                    ? 'bg-[#2D7A78] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Way Mode Segmented Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-[10px]">
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-[13px] font-medium rounded-[8px] transition-colors min-h-[44px] cursor-pointer ${
            activeTab === 'scan'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Camera size={15} />
          <span>Scan Card</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-[13px] font-medium rounded-[8px] transition-colors min-h-[44px] cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Upload size={15} />
          <span>Upload PDF</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 text-[13px] font-medium rounded-[8px] transition-colors min-h-[44px] cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Edit3 size={15} />
          <span>Manual</span>
        </button>
      </div>

      {/* TAB 1: SCAN CARD */}
      {activeTab === 'scan' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">
              Scan Member Card
            </h2>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Scan your physical insurance card using your camera, paste OCR text, or choose a pre-configured sample card.
            </p>

            {/* Quick Presets */}
            <div className="pt-1">
              <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">
                Sample Cards to Test:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SAMPLE_CARD_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectCardPreset(preset.id)}
                    className="px-2.5 py-1.5 text-[12px] font-medium bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-[8px] border border-slate-200 dark:border-slate-700 hover:border-[#2D7A78] transition-colors min-h-[36px] cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Paste Raw OCR Box */}
            <div className="pt-2">
              <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Or Paste Card Text:
              </label>
              <textarea
                rows={3}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="CareFirst BlueCross BlueShield&#10;Member ID: XBD928374011&#10;Group: GRP-77492A&#10;Phone: 1-800-535-9700"
                className="w-full p-2.5 text-[13px] font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D7A78]/30"
              />
              <button
                type="button"
                onClick={handleRunOcrOnText}
                disabled={!ocrText.trim() || isScanning}
                className="mt-2 w-full py-2 bg-[#2D7A78] hover:bg-[#246664] disabled:opacity-50 text-white font-medium text-[14px] rounded-[10px] min-h-[44px] cursor-pointer"
              >
                {isScanning ? 'Extracting Card Details...' : 'Run Card Recognition'}
              </button>
            </div>
          </div>

          {/* Extracted Details Preview */}
          {extractedCard && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-[12px] border border-emerald-200 dark:border-emerald-800/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-emerald-900 dark:text-emerald-200">
                  Extracted Card Details
                </span>
                <span className="text-[12px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {extractedCard.confidence}% match
                </span>
              </div>

              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between border-b border-emerald-200/60 pb-1">
                  <span className="text-slate-600 dark:text-slate-400">Insurer:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{extractedCard.insurer}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-200/60 pb-1">
                  <span className="text-slate-600 dark:text-slate-400">Plan Name:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{extractedCard.planName}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-200/60 pb-1">
                  <span className="text-slate-600 dark:text-slate-400">Member ID:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{extractedCard.memberId}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-200/60 pb-1">
                  <span className="text-slate-600 dark:text-slate-400">Group #:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{extractedCard.groupNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Insurer Phone:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{extractedCard.phone}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmCard}
                className="w-full py-2.5 bg-[#2D7A78] hover:bg-[#246664] text-white font-medium text-[14px] rounded-[10px] min-h-[44px] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check size={16} />
                <span>Confirm & View Plan Summary</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPLOAD DOCUMENT */}
      {activeTab === 'upload' && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="text-center py-6 px-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[12px] bg-slate-50 dark:bg-slate-900/40">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#E6F4F1] dark:bg-[#2D7A78]/20 flex items-center justify-center text-[#2D7A78] dark:text-[#3AAFA9] mb-3">
              <FileText size={24} />
            </div>
            <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">
              Upload Policy Document (PDF or Photos)
            </h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              This document serves as the verifiable source of truth for your answers and cost estimates.
            </p>

            <button
              type="button"
              onClick={() => handleSimulateDocUpload('My_Health_Benefits_Plan_2026.pdf')}
              disabled={isProcessingDoc}
              className="mt-4 px-4 py-2.5 bg-[#2D7A78] hover:bg-[#246664] text-white font-medium text-[14px] rounded-[10px] min-h-[44px] cursor-pointer shadow-xs inline-flex items-center gap-2"
            >
              <Upload size={16} />
              <span>{isProcessingDoc ? 'Processing Document...' : 'Choose File to Process'}</span>
            </button>
          </div>

          {isProcessingDoc && (
            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-slate-800 dark:text-slate-200">Processing: {selectedFileName}</span>
                <span className="text-[#2D7A78] dark:text-[#3AAFA9] font-medium">Please wait...</span>
              </div>
              <p className="text-[12px] text-slate-500 font-mono">{docProgress}</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#2D7A78] h-full w-3/4 animate-pulse" />
              </div>
            </div>
          )}

          <div className="text-[12px] text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-medium text-slate-700 dark:text-slate-300">Privacy Notice:</p>
            <p>
              Your documents are encrypted at rest and never shared or used to train public models. You can permanently delete your files at any time in Settings.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: MANUAL ENTRY */}
      {activeTab === 'manual' && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">
            Manual Key Numbers
          </h2>

          <div className="space-y-3 text-[14px]">
            <div>
              <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Insurer Name
              </label>
              <input
                type="text"
                value={manualForm.insurer}
                onChange={(e) => setManualForm({ ...manualForm, insurer: e.target.value })}
                placeholder="e.g. Cigna, UnitedHealthcare"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-800 dark:text-slate-200 min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Plan Name
              </label>
              <input
                type="text"
                value={manualForm.planName}
                onChange={(e) => setManualForm({ ...manualForm, planName: e.target.value })}
                placeholder="e.g. Choice Plus PPO"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-800 dark:text-slate-200 min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Yearly Deductible ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={manualForm.deductible}
                  onChange={(e) => setManualForm({ ...manualForm, deductible: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-800 dark:text-slate-200 min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Out-of-Pocket Max ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={manualForm.outOfPocketMax}
                  onChange={(e) => setManualForm({ ...manualForm, outOfPocketMax: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-800 dark:text-slate-200 min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmManual}
              className="w-full mt-2 py-2.5 bg-[#2D7A78] hover:bg-[#246664] text-white font-medium text-[14px] rounded-[10px] min-h-[44px] cursor-pointer"
            >
              Save Policy & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
