import React from 'react';
import { CrownIcon } from './Icons';

interface GenerationHistoryPageProps {
  onBack?: () => void;
}

export const GenerationHistoryPage: React.FC<GenerationHistoryPageProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary p-4">
      {onBack && (
        <button 
          onClick={onBack}
          className="self-start mb-4 px-4 py-2 bg-brand-bg-secondary/60 hover:bg-brand-bg-secondary/80 text-brand-text-primary rounded-xl border border-brand-border/50 transition-all duration-200"
        >
          ← Back to Home
        </button>
      )}
      <div className="bg-brand-bg-secondary/60 backdrop-blur-lg border border-brand-border/50 rounded-2xl p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 sm:w-20 sm:h-20 text-brand-accent-primary mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
          </svg>
          <CrownIcon className="absolute -top-2 -right-2 w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-text-primary mb-4">Generation History</h1>
        <p className="text-lg">This page is under construction.</p>
        <p className="mt-2">Check back soon for updates!</p>
        <div className="mt-8 p-4 border border-brand-border/30 rounded-lg bg-brand-bg-primary/40">
          <p className="text-sm">Your generation history will include:</p>
          <ul className="mt-3 text-sm list-disc list-inside text-left">
            <li>Previously generated briefs</li>
            <li>Generation timestamps</li>
            <li>Brief categories</li>
            <li>Export history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};