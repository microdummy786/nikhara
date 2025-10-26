

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, SearchIcon } from './Icons';

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  searchable?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder, disabled = false, searchable = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  useEffect(() => {
    if (isOpen && searchable) {
      inputRef.current?.focus();
    }
  }, [isOpen, searchable]);
  
  const filteredOptions = searchable 
    ? options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative mt-2" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex justify-between items-center bg-brand-bg-primary border border-brand-border rounded-xl py-2.5 px-4 text-left text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={value ? 'text-brand-text-primary' : 'text-brand-text-secondary'}>
          {value || placeholder}
        </span>
        <ChevronDownIcon className={`w-5 h-5 text-brand-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-brand-bg-secondary/80 backdrop-blur-lg border border-brand-border rounded-xl shadow-lg max-h-48 sm:max-h-60 overflow-hidden flex flex-col">
          {searchable && (
            <div className="p-2 border-b border-brand-border relative">
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-brand-bg-primary border border-brand-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent-primary"
              />
            </div>
          )}
          <ul className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                <li
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="cursor-pointer px-4 py-2 text-sm hover:bg-brand-accent-primary hover:text-white"
                >
                    {option}
                </li>
                ))
            ) : (
                <li className="px-4 py-2 text-sm text-brand-text-secondary">No options found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};