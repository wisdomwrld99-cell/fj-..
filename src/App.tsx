/**
 * Plainly — Mobile Insurance Clarity Application
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopHeader } from './components/layout/TopHeader';
import { BottomNav } from './components/layout/BottomNav';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { AddPolicyScreen } from './components/screens/AddPolicyScreen';
import { PlanSummaryScreen } from './components/screens/PlanSummaryScreen';
import { AskQuestionScreen } from './components/screens/AskQuestionScreen';
import { AnswerScreen } from './components/screens/AnswerScreen';
import { CostEstimatorScreen } from './components/screens/CostEstimatorScreen';
import { PreVisitChecklistScreen } from './components/screens/PreVisitChecklistScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { GlossaryScreen } from './components/screens/GlossaryScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { DocumentViewerModal } from './components/modals/DocumentViewerModal';
import { PaywallModal } from './components/modals/PaywallModal';
import { TestRunnerModal } from './components/modals/TestRunnerModal';

const MainNavigator: React.FC = () => {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'add_policy':
        return <AddPolicyScreen />;
      case 'plan_summary':
        return <PlanSummaryScreen />;
      case 'ask_question':
        return <AskQuestionScreen />;
      case 'answer':
        return <AnswerScreen />;
      case 'cost_estimator':
        return <CostEstimatorScreen />;
      case 'checklist':
        return <PreVisitChecklistScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'glossary':
        return <GlossaryScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <PlanSummaryScreen />;
    }
  };

  const hideTopAndBottom = currentScreen === 'welcome';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex justify-center selection:bg-[#2D7A78]/20 selection:text-[#2D7A78]">
      {/* Mobile-First Frame */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 min-h-screen shadow-2xl relative flex flex-col border-x border-slate-200 dark:border-slate-800">
        {!hideTopAndBottom && <TopHeader />}

        <main className="flex-1 overflow-x-hidden">
          {renderScreen()}
        </main>

        {!hideTopAndBottom && <BottomNav />}

        {/* Global Modals */}
        <DocumentViewerModal />
        <PaywallModal />
        <TestRunnerModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainNavigator />
    </AppProvider>
  );
}
