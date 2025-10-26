import React from 'react';
import { GalleryIcon } from './Icons';

export const BriefGalleryPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary p-4">
      <div className="bg-brand-bg-secondary/60 backdrop-blur-lg border border-brand-border/50 rounded-2xl p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center">
        <GalleryIcon className="w-16 h-16 sm:w-20 sm:h-20 text-brand-accent-primary mb-6" />
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-text-primary mb-4">Brief Gallery</h1>
        <p className="text-lg">This page is under construction.</p>
        <p className="mt-2">Check back soon for updates!</p>
        <div className="mt-8 p-4 border border-brand-border/30 rounded-lg bg-brand-bg-primary/40">
          <p className="text-sm">The Brief Gallery will feature:</p>
          <ul className="mt-3 text-sm list-disc list-inside text-left">
            <li>Popular brief templates</li>
            <li>All generated briefs</li>
            <li>Featured briefs of the week</li>
          </ul>
        </div>
      </div>
    </div>
  );
};