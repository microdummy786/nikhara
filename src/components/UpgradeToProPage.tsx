import React from 'react';
import { CrownIcon } from './Icons';

export const UpgradeToProPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary p-4">
      <div className="bg-brand-bg-secondary/60 backdrop-blur-lg border border-brand-border/50 rounded-2xl p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center">
        <CrownIcon className="w-16 h-16 sm:w-20 sm:h-20 mb-6" />
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-text-primary mb-4">Upgrade to Pro</h1>
        <p className="text-lg">This page is under construction.</p>
        <p className="mt-2">Check back soon for updates!</p>
        <div className="mt-8 p-4 border border-brand-border/30 rounded-lg bg-brand-bg-primary/40">
          <p className="text-sm">Pro benefits will include:</p>
          <ul className="mt-3 text-sm list-disc list-inside text-left">
            <li>150 Tokens / day</li>
            <li>Exclusive Pro Features</li>
            <li>Priority support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};