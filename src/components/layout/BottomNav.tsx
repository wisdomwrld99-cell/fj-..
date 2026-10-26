import React from 'react';
import { Shield, HelpCircle, Calculator, CheckSquare, Settings } from 'lucide-react';
import { useApp, ScreenId } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo } = useApp();

  const navItems = [
    {
      id: 'plan_summary' as ScreenId,
      label: 'Summary',
      icon: Shield,
    },
    {
      id: 'ask_question' as ScreenId,
      label: 'Ask',
      icon: HelpCircle,
    },
    {
      id: 'cost_estimator' as ScreenId,
      label: 'Estimate',
      icon: Calculator,
    },
    {
      id: 'checklist' as ScreenId,
      label: 'Checklist',
      icon: CheckSquare,
    },
    {
      id: 'settings' as ScreenId,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id || (item.id === 'ask_question' && currentScreen === 'answer');

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              className={`flex flex-col items-center justify-center h-full w-full py-1 text-center min-h-[44px] cursor-pointer transition-colors ${
                isActive
                  ? 'text-[#2D7A78] dark:text-[#3AAFA9]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className={`text-[11px] font-medium tracking-tight mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
