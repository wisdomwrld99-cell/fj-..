import React, { useState } from 'react';
import { Shield, FileCheck, Calculator, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Shield,
      title: 'Understand your care before you pay.',
      subtitle:
        'Plain words, grade-school reading level. No insurance legal jargon without an instant one-line explanation.',
      action: 'Next',
    },
    {
      icon: FileCheck,
      title: 'Verifiable proof from your own document.',
      subtitle:
        'Every answer cites the exact page and clause from your policy. If your document doesn\'t answer it, we say so honestly.',
      action: 'Next',
    },
    {
      icon: Calculator,
      title: 'Know your out-of-pocket costs before booking.',
      subtitle:
        'Deterministic math based on what you have already paid this year. No surprise bills in the waiting room.',
      action: 'Add your policy',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigateTo('add_policy');
    }
  };

  const SlideIcon = slides[currentSlide].icon;

  return (
    <div className="min-h-full flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Bar: Skip button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigateTo('plan_summary')}
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-[14px] font-medium py-2 px-3 rounded-lg min-h-[44px]"
        >
          Skip to Demo
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="my-auto py-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E6F4F1] dark:bg-[#2D7A78]/20 flex items-center justify-center text-[#2D7A78] dark:text-[#3AAFA9] shadow-xs">
          <SlideIcon size={32} />
        </div>

        <div className="space-y-3">
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            {slides[currentSlide].title}
          </h1>
          <p className="text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 pt-4" aria-label="Slide indicators">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 min-w-[20px] ${
                idx === currentSlide
                  ? 'w-8 bg-[#2D7A78] dark:bg-[#3AAFA9]'
                  : 'w-2 bg-slate-300 dark:bg-slate-700'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="space-y-3 pt-6">
        <button
          type="button"
          onClick={handleNext}
          className="w-full h-12 rounded-[10px] bg-[#2D7A78] hover:bg-[#246664] text-white font-medium text-[16px] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <span>{slides[currentSlide].action}</span>
          <ArrowRight size={18} />
        </button>

        <p className="text-center text-[12px] text-slate-400 dark:text-slate-500">
          Private & encrypted. No account required to view first summary.
        </p>
      </div>
    </div>
  );
};
