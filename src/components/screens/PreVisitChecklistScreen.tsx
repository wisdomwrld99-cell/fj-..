import React, { useState } from 'react';
import { ArrowLeft, CheckSquare, Square, FileText, Phone, AlertCircle, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlainDisclaimer } from '../common/PlainDisclaimer';

export const PreVisitChecklistScreen: React.FC = () => {
  const { checklists, toggleChecklistItem, updateChecklistNotes, navigateTo, currentPolicy } = useApp();

  const [selectedVisitType, setSelectedVisitType] = useState<string>('specialist');
  const [activeNotes, setActiveNotes] = useState<string>(
    checklists[selectedVisitType]?.notes || ''
  );
  const [savedToast, setSavedToast] = useState(false);

  const currentChecklist = checklists[selectedVisitType];

  const handleNotesChange = (val: string) => {
    setActiveNotes(val);
    updateChecklistNotes(selectedVisitType, val);
  };

  const handleSaveNotes = () => {
    updateChecklistNotes(selectedVisitType, activeNotes);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const completedCount = currentChecklist?.items.filter((i) => i.completed).length || 0;
  const totalCount = currentChecklist?.items.length || 0;

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-24">
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
            Pre-Visit Checklist
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            What to confirm before your appointment
          </p>
        </div>
      </div>

      {/* Visit Type Segmented Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-[10px]">
        {[
          { id: 'specialist', label: 'Specialist' },
          { id: 'imaging', label: 'MRI / Scan' },
          { id: 'dental', label: 'Dental' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setSelectedVisitType(tab.id);
              setActiveNotes(checklists[tab.id]?.notes || '');
            }}
            className={`py-2 px-1 text-[13px] font-medium rounded-[8px] transition-colors min-h-[40px] cursor-pointer ${
              selectedVisitType === tab.id
                ? 'bg-white dark:bg-slate-900 text-[#2D7A78] dark:text-[#3AAFA9] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Progress Counter */}
      <div className="p-3 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[13px]">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Checklist Progress: {completedCount} of {totalCount} completed
        </span>
        <span className="font-bold text-[#2D7A78] dark:text-[#3AAFA9]">
          {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
        </span>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {currentChecklist?.items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleChecklistItem(selectedVisitType, item.id)}
            className={`p-3.5 rounded-[12px] border transition-colors cursor-pointer select-none flex items-start gap-3 ${
              item.completed
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-[#2D7A78]/50'
            }`}
          >
            <div className="pt-0.5 text-[#2D7A78] dark:text-[#3AAFA9] shrink-0">
              {item.completed ? (
                <CheckSquare size={20} className="text-emerald-700 dark:text-emerald-400" />
              ) : (
                <Square size={20} className="text-slate-400" />
              )}
            </div>

            <div className="space-y-1">
              <span
                className={`text-[15px] font-semibold leading-snug block ${
                  item.completed
                    ? 'line-through text-slate-500 dark:text-slate-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {item.task}
              </span>
              <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* User Notes */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[14px] font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileText size={16} className="text-[#2D7A78]" />
            <span>My Notes & Questions for Clinic</span>
          </label>
          {savedToast && (
            <span className="text-[12px] text-emerald-600 font-medium">Saved</span>
          )}
        </div>

        <textarea
          rows={3}
          value={activeNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="e.g. Clinic receptionist name, pre-auth reference #, quote given on phone..."
          className="w-full p-2.5 text-[14px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#2D7A78]/30"
        />

        <button
          type="button"
          onClick={handleSaveNotes}
          className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-medium text-[13px] rounded-[8px] min-h-[40px] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Save size={14} />
          <span>Save Notes</span>
        </button>
      </div>

      <PlainDisclaimer />
    </div>
  );
};
