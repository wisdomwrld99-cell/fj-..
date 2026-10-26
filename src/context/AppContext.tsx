/**
 * Plainly App Context & State Store
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Policy,
  PlanFact,
  DocumentChunk,
  UserProfile,
  UsageData,
  AnswerResult,
  PreVisitChecklist,
  InsuranceType,
} from '../types';
import { SEED_POLICIES } from '../data/seedPolicies';
import { STRINGS } from '../constants/strings';

export type ScreenId =
  | 'welcome'
  | 'add_policy'
  | 'review_details'
  | 'plan_summary'
  | 'ask_question'
  | 'answer'
  | 'cost_estimator'
  | 'checklist'
  | 'history'
  | 'glossary'
  | 'settings';

interface AppContextType {
  currentScreen: ScreenId;
  navigateTo: (screen: ScreenId) => void;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  policies: Policy[];
  currentPolicy: Policy;
  setCurrentPolicyById: (id: string) => void;
  currentFacts: PlanFact[];
  currentChunks: DocumentChunk[];
  usageData: UsageData;
  updateUsage: (updates: Partial<UsageData>) => void;
  qaHistory: AnswerResult[];
  saveAnswerToHistory: (answer: AnswerResult) => void;
  latestAnswer: AnswerResult | null;
  setLatestAnswer: (answer: AnswerResult | null) => void;
  checklists: Record<string, PreVisitChecklist>;
  toggleChecklistItem: (visitType: string, itemId: string) => void;
  updateChecklistNotes: (visitType: string, notes: string) => void;
  activeDocumentView: { page: number; quote?: string } | null;
  setActiveDocumentView: (view: { page: number; quote?: string } | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  showTestRunner: boolean;
  setShowTestRunner: (show: boolean) => void;
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  deleteEverything: () => void;
  addNewPolicy: (
    policy: Omit<Policy, 'id' | 'createdAt' | 'userId' | 'isActive'>,
    facts?: PlanFact[],
    chunks?: DocumentChunk[]
  ) => void;
}

const defaultProfile: UserProfile = {
  id: 'usr_default',
  country: 'US',
  currency: 'USD',
  currencySymbol: '$',
  language: 'en',
  isPro: false,
  questionsAskedThisMonth: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('plan_summary');

  // Theme
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('plainly_profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  // Policies Map & Active Policy
  const [policies, setPolicies] = useState<Policy[]>([
    SEED_POLICIES.carefirst_ppo.policy,
    SEED_POLICIES.kaiser_hmo.policy,
    SEED_POLICIES.aetna_hdhp.policy,
    SEED_POLICIES.delta_dental.policy,
    SEED_POLICIES.vsp_vision.policy,
  ]);

  const [currentPolicyId, setCurrentPolicyId] = useState<string>(
    SEED_POLICIES.carefirst_ppo.policy.id
  );

  const [policyFactsMap, setPolicyFactsMap] = useState<Record<string, PlanFact[]>>({
    [SEED_POLICIES.carefirst_ppo.policy.id]: SEED_POLICIES.carefirst_ppo.facts,
    [SEED_POLICIES.kaiser_hmo.policy.id]: SEED_POLICIES.kaiser_hmo.facts,
    [SEED_POLICIES.aetna_hdhp.policy.id]: SEED_POLICIES.aetna_hdhp.facts,
    [SEED_POLICIES.delta_dental.policy.id]: SEED_POLICIES.delta_dental.facts,
    [SEED_POLICIES.vsp_vision.policy.id]: SEED_POLICIES.vsp_vision.facts,
  });

  const [policyChunksMap, setPolicyChunksMap] = useState<Record<string, DocumentChunk[]>>({
    [SEED_POLICIES.carefirst_ppo.policy.id]: SEED_POLICIES.carefirst_ppo.chunks,
    [SEED_POLICIES.kaiser_hmo.policy.id]: SEED_POLICIES.kaiser_hmo.chunks,
    [SEED_POLICIES.aetna_hdhp.policy.id]: SEED_POLICIES.aetna_hdhp.chunks,
    [SEED_POLICIES.delta_dental.policy.id]: SEED_POLICIES.delta_dental.chunks,
    [SEED_POLICIES.vsp_vision.policy.id]: SEED_POLICIES.vsp_vision.chunks,
  });

  // Usage Tracker
  const [usageData, setUsageData] = useState<UsageData>({
    policyId: currentPolicyId,
    year: 2026,
    deductibleUsed: 150,
    outOfPocketUsed: 420,
    limitsUsed: {},
  });

  // Q&A History
  const [qaHistory, setQaHistory] = useState<AnswerResult[]>([]);
  const [latestAnswer, setLatestAnswer] = useState<AnswerResult | null>(null);

  // Modals & Document Viewer
  const [activeDocumentView, setActiveDocumentView] = useState<{ page: number; quote?: string } | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Checklists
  const [checklists, setChecklists] = useState<Record<string, PreVisitChecklist>>({
    specialist: {
      id: 'chk_specialist',
      policyId: currentPolicyId,
      visitType: 'Specialist Visit',
      notes: '',
      updatedAt: new Date().toISOString(),
      items: STRINGS.checklists.specialist.items.map((it, idx) => ({
        id: `spec_${idx}`,
        task: it.task,
        explanation: it.explanation,
        completed: idx === 0,
        category: it.category,
      })),
    },
    imaging: {
      id: 'chk_imaging',
      policyId: currentPolicyId,
      visitType: 'MRI / Diagnostic Imaging',
      notes: '',
      updatedAt: new Date().toISOString(),
      items: STRINGS.checklists.imaging.items.map((it, idx) => ({
        id: `img_${idx}`,
        task: it.task,
        explanation: it.explanation,
        completed: false,
        category: it.category,
      })),
    },
    dental: {
      id: 'chk_dental',
      policyId: currentPolicyId,
      visitType: 'Major Dental Care',
      notes: '',
      updatedAt: new Date().toISOString(),
      items: STRINGS.checklists.dental.items.map((it, idx) => ({
        id: `dent_${idx}`,
        task: it.task,
        explanation: it.explanation,
        completed: false,
        category: it.category,
      })),
    },
  });

  // Persist Profile
  useEffect(() => {
    localStorage.setItem('plainly_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const currentPolicy = policies.find((p) => p.id === currentPolicyId) || policies[0];
  const currentFacts = policyFactsMap[currentPolicy.id] || [];
  const currentChunks = policyChunksMap[currentPolicy.id] || [];

  const navigateTo = (screen: ScreenId) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const setCurrentPolicyById = (id: string) => {
    const found = policies.find((p) => p.id === id);
    if (found) {
      setCurrentPolicyId(id);
    }
  };

  const updateUsage = (updates: Partial<UsageData>) => {
    setUsageData((prev) => ({ ...prev, ...updates }));
  };

  const saveAnswerToHistory = (answer: AnswerResult) => {
    setQaHistory((prev) => [answer, ...prev]);
    setLatestAnswer(answer);

    // Increment question count for monetization tracking
    setUserProfile((prev) => {
      const newCount = prev.questionsAskedThisMonth + 1;
      // Show paywall after user receives their first answer (if not pro)
      if (newCount === 1 && !prev.isPro) {
        setTimeout(() => setShowPaywall(true), 1200);
      }
      return { ...prev, questionsAskedThisMonth: newCount };
    });
  };

  const toggleChecklistItem = (visitType: string, itemId: string) => {
    setChecklists((prev) => {
      const currentList = prev[visitType];
      if (!currentList) return prev;
      return {
        ...prev,
        [visitType]: {
          ...currentList,
          items: currentList.items.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const updateChecklistNotes = (visitType: string, notes: string) => {
    setChecklists((prev) => {
      const currentList = prev[visitType];
      if (!currentList) return prev;
      return {
        ...prev,
        [visitType]: { ...currentList, notes, updatedAt: new Date().toISOString() },
      };
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        const granted = perm === 'granted';
        setNotificationsEnabled(granted);
        return granted;
      } catch {
        return false;
      }
    }
    setNotificationsEnabled(true);
    return true;
  };

  const deleteEverything = () => {
    localStorage.clear();
    setQaHistory([]);
    setLatestAnswer(null);
    setUsageData({
      policyId: currentPolicyId,
      year: 2026,
      deductibleUsed: 0,
      outOfPocketUsed: 0,
      limitsUsed: {},
    });
    setUserProfile(defaultProfile);
    navigateTo('welcome');
  };

  const addNewPolicy = (
    newPolData: Omit<Policy, 'id' | 'createdAt' | 'userId' | 'isActive'>,
    facts: PlanFact[] = [],
    chunks: DocumentChunk[] = []
  ) => {
    const id = `pol_${Date.now()}`;
    const newPolicy: Policy = {
      ...newPolData,
      id,
      userId: userProfile.id,
      isActive: true,
      createdAt: new Date().toISOString(),
      documentCount: chunks.length > 0 ? 1 : 0,
    };

    setPolicies((prev) => [newPolicy, ...prev]);
    setPolicyFactsMap((prev) => ({ ...prev, [id]: facts }));
    setPolicyChunksMap((prev) => ({ ...prev, [id]: chunks }));
    setCurrentPolicyId(id);
    navigateTo('plan_summary');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigateTo,
        userProfile,
        updateUserProfile,
        policies,
        currentPolicy,
        setCurrentPolicyById,
        currentFacts,
        currentChunks,
        usageData,
        updateUsage,
        qaHistory,
        saveAnswerToHistory,
        latestAnswer,
        setLatestAnswer,
        checklists,
        toggleChecklistItem,
        updateChecklistNotes,
        activeDocumentView,
        setActiveDocumentView,
        isDarkMode,
        toggleDarkMode,
        showPaywall,
        setShowPaywall,
        showTestRunner,
        setShowTestRunner,
        notificationsEnabled,
        requestNotificationPermission,
        deleteEverything,
        addNewPolicy,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
