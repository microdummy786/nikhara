
import React from 'react';

interface PlaceholderPageProps {
  title: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary p-4">
       <div className="bg-brand-bg-secondary/60 backdrop-blur-lg border border-brand-border/50 rounded-2xl p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center">
        {Icon && <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-brand-accent-primary mb-6" />}
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-text-primary mb-4">{title}</h1>
        <p className="text-lg">This page is under construction.</p>
        <p className="mt-2">Check back soon for updates!</p>
      </div>
    </div>
  );
};
