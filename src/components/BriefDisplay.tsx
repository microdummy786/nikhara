

import React, { useEffect, useState } from 'react';
import type { Brief, User } from '../types';
import { SaveIcon, ExportIcon, CrownIcon, ErrorIcon } from './Icons';
import { ExportButton } from './ExportButton';

interface BriefDisplayProps {
  brief: Brief | null;
  isLoading: boolean;
  error: string | null;
  currentUser: User;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <div className="relative flex items-center justify-center h-20 w-20">
        <div className="absolute h-full w-full rounded-full border-2 border-brand-border animate-spin" style={{ animationDuration: '1.5s', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}></div>
        <div className="absolute h-[calc(100%-20px)] w-[calc(100%-20px)] rounded-full border-2 border-brand-border animate-spin" style={{ animation: 'spin 1s linear reverse infinite', borderTopColor: 'transparent', borderRightColor: 'transparent' }}></div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-brand-text-secondary tracking-wider">GENERATING BRIEF...</p>
        <p className="text-xs text-brand-text-secondary/70">It may take longer during busy hours</p>
      </div>
    </div>
);

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-brand-text-primary">Your creative brief will appear here</h2>
        <p className="mt-2 text-brand-text-secondary">Fill out the form to generate a new brief.</p>
    </div>
);

const ErrorState: React.FC<{ message: string; countdown?: string }> = ({ message, countdown }) => {
  const isTokenExhausted = !!countdown;
  
  return (
    <div className={`flex flex-col items-center justify-center h-full text-center p-6 rounded-2xl border ${
      isTokenExhausted 
        ? 'bg-brand-error/15 border-brand-error/40' 
        : 'bg-brand-error/10 border-brand-error/30'
    }`}>
      <ErrorIcon className="w-12 h-12 text-brand-error/90 mb-4" />
      <h2 className={`text-xl font-bold ${isTokenExhausted ? 'text-brand-error' : 'text-brand-error'}`}>
        {isTokenExhausted ? 'Tokens Exhausted' : 'Generation Failed'}
      </h2>
      <p className="mt-4 text-brand-text-secondary max-w-md leading-relaxed">{message}</p>
      {countdown && (
        <div className="mt-4 px-4 py-2 bg-brand-error/20 rounded-lg border border-brand-error/30">
          <p className="text-sm text-brand-text-primary font-semibold">
            Next reset in: <span className="text-brand-error">{countdown}</span>
          </p>
        </div>
      )}
    </div>
  );
};

const renderMarkdownBold = (text: string): React.ReactNode => {
    if (!text) return null;
    // Regex to find text between single or double asterisks (non-greedy)
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <strong key={index}>{part.slice(1, -1)}</strong>;
        }
        return part;
    });
};


interface ParsedError {
  message: string;
  timeUntilReset?: { hours: number; minutes: number; seconds: number };
  isTokenExhausted?: boolean;
}

export const BriefDisplay: React.FC<BriefDisplayProps> = ({ brief, isLoading, error, currentUser }) => {
  const isPaid = currentUser.payment === 'paid';
  const [parsedError, setParsedError] = useState<ParsedError | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  // Parse error if it's a serialized TokenExhaustedError
  useEffect(() => {
    if (error) {
      try {
        const parsed = JSON.parse(error) as ParsedError;
        if (parsed.isTokenExhausted && parsed.timeUntilReset) {
          setParsedError(parsed);
          
          // Start countdown
          const updateCountdown = () => {
            const { hours, minutes, seconds } = parsed.timeUntilReset!;
            setCountdown(`${hours}h ${minutes}m ${seconds}s`);
          };
          
          updateCountdown();
          const interval = setInterval(() => {
            // Recalculate time (approximate)
            const timeLeft = parsed.timeUntilReset!;
            const newSeconds = Math.max(0, timeLeft.seconds - 1);
            const newMinutes = timeLeft.minutes + Math.floor(newSeconds / 60);
            const newHours = timeLeft.hours + Math.floor(newMinutes / 60);
            
            parsed.timeUntilReset = {
              hours: newHours,
              minutes: newMinutes % 60,
              seconds: newSeconds % 60
            };
            
            setCountdown(`${parsed.timeUntilReset.hours}h ${parsed.timeUntilReset.minutes}m ${parsed.timeUntilReset.seconds}s`);
          }, 1000);
          
          return () => clearInterval(interval);
        } else {
          setParsedError(null);
        }
      } catch {
        setParsedError(null);
      }
    } else {
      setParsedError(null);
    }
  }, [error]);

  const renderBriefContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) {
      const message = parsedError?.message || error;
      return <ErrorState message={message} countdown={parsedError?.isTokenExhausted ? countdown : undefined} />;
    }
    if (!brief) return <InitialState />;

    return (
        <div className="flex flex-col h-full animate-fade-in" id="brief-content">
            {/* Top Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-4 border-b border-brand-border">
                <div className="space-y-2">
                    <p className="text-base sm:text-lg font-semibold text-brand-text-primary tracking-wide">ID: {brief.id}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-brand-text-secondary">
                        <span className="bg-brand-bg-primary px-2 py-1 rounded-md">{brief.category}</span>
                        <span className="bg-brand-bg-primary px-2 py-1 rounded-md">{brief.niche}</span>
                        <span className="bg-brand-bg-primary px-2 py-1 rounded-md">{brief.industry}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                    {isPaid && (
                        <button className="flex items-center gap-2 text-sm py-2 px-3 bg-brand-border hover:bg-white/10 transition-colors rounded-lg relative">
                            <CrownIcon className="w-6 h-6 absolute -top-2 -left-2 transform -rotate-12" />
                            <SaveIcon className="w-4 h-4" /> Save
                        </button>
                    )}
                    <ExportButton brief={brief} />
                </div>
            </div>

            {/* Bottom Section - Scrollable */}
            <div className="pt-6 overflow-y-auto flex-grow pr-2 space-y-6">
                <div>
                    <h4 className="font-bold text-lg text-brand-text-primary mb-2">Company Name</h4>
                    <p className="text-brand-text-secondary whitespace-pre-wrap">{renderMarkdownBold(brief.companyName)}</p>
                </div>
                
                <div>
                    <h4 className="font-bold text-lg text-brand-text-primary mb-2">Company Description</h4>
                    <p className="text-brand-text-secondary whitespace-pre-wrap">{renderMarkdownBold(brief.companyDescription)}</p>
                </div>
                
                <div>
                    <h4 className="font-bold text-lg text-brand-text-primary mb-2">Project Description</h4>
                    <p className="text-brand-text-secondary whitespace-pre-wrap">{renderMarkdownBold(brief.projectDescription)}</p>
                </div>
                
                <div>
                    <h4 className="font-bold text-lg text-brand-text-primary mb-2">Deadline</h4>
                    <p className="text-brand-text-secondary whitespace-pre-wrap">{renderMarkdownBold(brief.deadline)}</p>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="w-full xl:w-3/5 bg-brand-bg-secondary/60 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-brand-border/50 min-h-[450px] sm:min-h-[500px] lg:min-h-[600px] flex flex-col">
        {renderBriefContent()}
    </div>
  );
};

// Add fade-in animation to tailwind config or a style tag
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);