import React, { useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Bell,
  Fingerprint,
  Download,
  Trash2,
  Shield,
  Check,
  Moon,
  Sun,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { STRINGS } from '../../constants/strings';

export const SettingsScreen: React.FC = () => {
  const {
    navigateTo,
    userProfile,
    updateUserProfile,
    notificationsEnabled,
    requestNotificationPermission,
    deleteEverything,
    isDarkMode,
    toggleDarkMode,
    currentPolicy,
  } = useApp();

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [notificationToast, setNotificationToast] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleCountryChange = (cCode: string) => {
    const cObj = STRINGS.countries.find((c) => c.code === cCode);
    if (cObj) {
      updateUserProfile({
        country: cCode,
        currency: cObj.currency,
        currencySymbol: cObj.symbol,
      });
    }
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationToast('Reminders activated: Deductible reset (Jan 1) & waiting period alerts.');
        setTimeout(() => setNotificationToast(''), 3000);
      }
    }
  };

  const handleExportData = () => {
    const data = {
      profile: userProfile,
      policy: currentPolicy,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Plainly_Insurance_Data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            Settings & Privacy
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Control your regional settings, reminders, and data
          </p>
        </div>
      </div>

      {/* Regional & Currency Settings */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Globe size={16} className="text-[#2D7A78]" />
          <span>Country, Currency & Language</span>
        </h2>

        <div>
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
            Country & Currency
          </label>
          <select
            value={userProfile.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-[8px] text-[14px] text-slate-800 dark:text-slate-200 min-h-[44px]"
          >
            {STRINGS.countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.currency} - {c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 block mb-1">
            Language
          </label>
          <select
            value={userProfile.language}
            onChange={(e) => updateUserProfile({ language: e.target.value })}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-[8px] text-[14px] text-slate-800 dark:text-slate-200 min-h-[44px]"
          >
            <option value="en">English (Plain Reading Level)</option>
            <option value="es">Español (Lectura clara)</option>
            <option value="fr">Français (Langage simple)</option>
          </select>
        </div>
      </div>

      {/* Reminders & Notifications */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Bell size={16} className="text-[#2D7A78]" />
          <span>Benefit Reminders</span>
        </h2>
        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Receive gentle notifications for policy milestones:
        </p>

        <ul className="text-[12px] text-slate-500 space-y-1 list-disc list-inside">
          <li>Annual deductible reset on January 1st</li>
          <li>Waiting periods ending (e.g. major dental becoming active)</li>
          <li>Policy renewal and open enrollment windows</li>
        </ul>

        {notificationToast && (
          <div className="p-2.5 rounded-[8px] bg-emerald-50 text-emerald-800 text-[12px] font-medium">
            {notificationToast}
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleNotifications}
          className="w-full py-2.5 bg-[#2D7A78] hover:bg-[#246664] text-white font-medium text-[14px] rounded-[10px] min-h-[44px] cursor-pointer"
        >
          {notificationsEnabled ? 'Reminders Active' : 'Enable Benefit Reminders'}
        </button>
      </div>

      {/* Security & Appearance */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
          Security & Theme
        </h2>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Fingerprint size={18} className="text-[#2D7A78]" />
            <span className="text-[14px] font-medium text-slate-800 dark:text-slate-200">
              App Lock (Biometrics / Face ID)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBiometricsEnabled(!biometricsEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              biometricsEnabled ? 'bg-[#2D7A78]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                biometricsEnabled ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-700/60 pt-2">
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon size={18} className="text-[#2D7A78]" /> : <Sun size={18} className="text-[#2D7A78]" />}
            <span className="text-[14px] font-medium text-slate-800 dark:text-slate-200">
              Dark Mode
            </span>
          </div>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="text-[13px] font-medium text-[#2D7A78] dark:text-[#3AAFA9] hover:underline"
          >
            {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
          Your Data & Privacy
        </h2>
        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Your documents are private to you. We do not use your documents to train models.
        </p>

        <button
          type="button"
          onClick={handleExportData}
          className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-medium text-[14px] rounded-[10px] min-h-[44px] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download size={16} />
          <span>Export My Data (JSON)</span>
        </button>

        {showConfirmDelete ? (
          <div className="p-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
            <p className="text-[13px] font-semibold text-rose-800 dark:text-rose-300">
              Are you sure? This permanently wipes all policies, documents, and Q&A history.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={deleteEverything}
                className="flex-1 py-2 bg-rose-600 text-white rounded-[8px] text-[13px] font-medium min-h-[40px] cursor-pointer"
              >
                Yes, Delete Everything
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2 bg-slate-200 text-slate-800 rounded-[8px] text-[13px] font-medium min-h-[40px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirmDelete(true)}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 font-medium text-[14px] rounded-[10px] min-h-[44px] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 size={16} />
            <span>Delete Everything & Reset App</span>
          </button>
        )}
      </div>
    </div>
  );
};
