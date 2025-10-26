

import React, { useState, useMemo, useCallback } from 'react';
import type { Brief, User, GeneratorFormData } from '../types';
import { BRIEF_CATEGORIES } from '../constants';
import { CustomSelect } from './CustomSelect';
import { generateCreativeBrief } from '../services/geminiService';
import { CrownIcon } from './Icons';

interface BriefGeneratorProps {
  setCurrentBrief: (brief: Brief | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  currentUser: User;
  updateTokens: (newTokens: number) => void;
  onShowGenerationHistory: () => void;
}

const DEADLINE_UNITS = ['days', 'weeks', 'months'];

export const BriefGenerator: React.FC<BriefGeneratorProps> = ({ setCurrentBrief, setIsLoading, setError, currentUser, updateTokens, onShowGenerationHistory }) => {
  const [category, setCategory] = useState('');
  const [niche, setNiche] = useState('');
  const [industry, setIndustry] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [deadlineValue, setDeadlineValue] = useState<number | ''>('');
  const [deadlineUnit, setDeadlineUnit] = useState('days');

  const availableOptions = useMemo(() => {
    if (!category || !BRIEF_CATEGORIES[category as keyof typeof BRIEF_CATEGORIES]) {
      return { niche: [], industry: [], keywords: [] };
    }
    const opts = BRIEF_CATEGORIES[category as keyof typeof BRIEF_CATEGORIES];
    setNiche('');
    setIndustry('');
    setKeywords([]);
    return opts;
  }, [category]);

  const handleKeywordToggle = (keyword: string) => {
    setKeywords(prev => 
      prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]
    );
  };

  const isFormValid = category && niche && industry;

  const handleGenerateBrief = useCallback(async () => {
      if (!isFormValid) {
          setError("Please fill out Category, Niche, and Industry.");
          return;
      }
      if (currentUser.tokens < 10) {
          setError("Insufficient tokens. New brief generation costs 10 tokens.");
          return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentBrief(null);
      
      const newTokens = currentUser.tokens - 10;
      updateTokens(newTokens);
      
      const deadline = deadlineValue ? `${deadlineValue} ${deadlineUnit}` : '';

      const formData: GeneratorFormData = { category, niche, industry, keywords, deadline };

      try {
          const brief = await generateCreativeBrief(formData);
          setCurrentBrief(brief);
      } catch (e: any) {
          setError(e.message || "An unknown error occurred.");
          updateTokens(currentUser.tokens); // Refund tokens on failure
      } finally {
          setIsLoading(false);
      }
  }, [isFormValid, currentUser.tokens, category, niche, industry, keywords, deadlineValue, deadlineUnit, setIsLoading, setError, setCurrentBrief, updateTokens]);

  const renderKeywords = () => {
    const keywordData = availableOptions.keywords;
    
    if (category === 'Game Development' && keywordData && !Array.isArray(keywordData)) {
      return (
        <>
          <div>
            <h3 className="text-sm font-semibold text-brand-text-primary mb-2 ml-1">Project Difficulty</h3>
            <div className="space-y-2 p-3 bg-brand-bg-primary/70 rounded-xl border border-brand-border">
              {keywordData.difficulty.map(kw => (
                <label key={kw} className="flex items-center space-x-3 cursor-pointer p-1 rounded-md hover:bg-white/5">
                  <input type="checkbox" checked={keywords.includes(kw)} onChange={() => handleKeywordToggle(kw)} className="form-checkbox h-4 w-4 rounded bg-brand-border border-brand-border text-brand-accent-primary focus:ring-brand-accent-primary focus:ring-offset-brand-bg-primary" />
                  <span className="text-brand-text-primary">{kw}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand-text-primary mb-2 ml-1">Game Genre</h3>
            <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-brand-bg-primary/70 rounded-xl border border-brand-border">
              {keywordData.genres.map(kw => (
                <label key={kw} className="flex items-center space-x-3 cursor-pointer p-1 rounded-md hover:bg-white/5">
                  <input type="checkbox" checked={keywords.includes(kw)} onChange={() => handleKeywordToggle(kw)} className="form-checkbox h-4 w-4 rounded bg-brand-border border-brand-border text-brand-accent-primary focus:ring-brand-accent-primary focus:ring-offset-brand-bg-primary" />
                  <span className="text-brand-text-primary">{kw}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      );
    }
    
    if (Array.isArray(keywordData) && keywordData.length > 0) {
      return (
        <div>
          <label className="text-sm font-medium text-brand-text-secondary ml-1">Keywords (optional)</label>
          <div className="mt-2 max-h-40 overflow-y-auto space-y-2 p-3 bg-brand-bg-primary/70 rounded-xl border border-brand-border">
            {keywordData.map(kw => (
              <label key={kw} className="flex items-center space-x-3 cursor-pointer p-1 rounded-md hover:bg-white/5">
                <input type="checkbox" checked={keywords.includes(kw)} onChange={() => handleKeywordToggle(kw)} className="form-checkbox h-4 w-4 rounded bg-brand-border border-brand-border text-brand-accent-primary focus:ring-brand-accent-primary focus:ring-offset-brand-bg-primary" />
                <span className="text-brand-text-primary">{kw}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="text-sm font-medium text-brand-text-secondary ml-1">Keywords (optional)</label>
        <div className="mt-2 flex items-center justify-center h-24 p-3 bg-brand-bg-primary/70 rounded-xl border border-brand-border">
          <p className="text-xs text-brand-text-secondary text-center">Select a category to see keywords.</p>
        </div>
      </div>
    );
  };


  return (
    <div className="w-full xl:w-2/5 flex-shrink-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary">Brief Generator</h1>
      <p className="text-brand-text-secondary mt-1 mb-6">Generate your next creative brief in seconds.</p>

      <div className="bg-brand-bg-secondary/60 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-brand-border/50 space-y-4">
        <div>
          <label className="text-sm font-medium text-brand-text-secondary ml-1">Category</label>
          <CustomSelect options={Object.keys(BRIEF_CATEGORIES)} value={category} onChange={setCategory} placeholder="Select Category" />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-text-secondary ml-1">Niche</label>
          <CustomSelect options={availableOptions.niche} value={niche} onChange={setNiche} placeholder="Select Niche" disabled={!category} />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-text-secondary ml-1">Industry</label>
          <CustomSelect options={availableOptions.industry} value={industry} onChange={setIndustry} placeholder="Select Industry" disabled={!category}/>
        </div>
        <div>
            <label htmlFor="deadline-value" className="text-sm font-medium text-brand-text-secondary ml-1">Deadline</label>
            <div className="flex items-center gap-2 mt-1">
                <div className="flex-grow">
                    <input
                        id="deadline-value"
                        type="number"
                        value={deadlineValue}
                        onChange={(e) => setDeadlineValue(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        placeholder="e.g., 7"
                        className="w-full bg-brand-bg-primary border border-brand-border rounded-xl py-2.5 px-4 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>
                <div className="w-32 flex-shrink-0">
                    <CustomSelect options={DEADLINE_UNITS} value={deadlineUnit} onChange={setDeadlineUnit} placeholder="Unit" searchable={false}/>
                </div>
            </div>
            <p className="text-xs text-brand-text-secondary mt-1 ml-1">Leave empty for AI Generated deadline.</p>
        </div>
        
        {renderKeywords()}

        <div className="pt-2 space-y-3">
          <button 
            onClick={handleGenerateBrief}
            disabled={!isFormValid}
            className="w-full bg-brand-accent-primary text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_15px_rgba(46,139,255,0.4)] hover:shadow-[0_0_25px_rgba(46,139,255,0.6)]"
          >
            Generate Brief - 10 tokens
          </button>
          <button 
            disabled={!isFormValid}
            className="w-full border border-brand-border text-brand-text-secondary font-semibold py-3 px-4 rounded-xl hover:bg-brand-border hover:text-brand-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            Get Pre-Generated Brief - 1 token
          </button>
          <button 
            onClick={onShowGenerationHistory}
            className="relative w-full mt-3 py-3 px-4 bg-brand-bg-secondary/60 hover:bg-brand-bg-secondary/80 text-brand-text-primary rounded-xl border border-brand-border/50 transition-all duration-200 flex items-center justify-center"
          >
            <div className="absolute -top-1 -left-1 transform -rotate-12">
              <CrownIcon className="w-6 h-6" />
            </div>
            <span>Generation History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
