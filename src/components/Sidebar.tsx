
import React from 'react';
import type { Page, User } from '../types';
import { NAV_ITEMS, PROFILE_NAV_ITEMS } from '../constants';
import { Logo, SidebarToggleIcon, CloseIcon, CrownIcon } from './Icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isCollapsed, setCollapsed, isMobileOpen, setMobileOpen, currentUser }) => {
  // Fix: Explicitly type NavLink as a React.FC to ensure TypeScript correctly handles special React props like 'key'.
  const NavLink: React.FC<{ item: { name: string, icon: React.FC<any>, showCrown?: boolean }, isProfile?: boolean }> = ({ item, isProfile = false }) => (
     <a
      href="#"
      onClick={(e) => { 
        e.preventDefault(); 
        if (!isProfile) setActivePage(item.name as Page); 
      }}
      className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${!isProfile && activePage === item.name ? 'bg-brand-accent-primary text-white shadow-[0_0_15px_rgba(46,139,255,0.4)]' : 'text-brand-text-secondary hover:bg-brand-border hover:text-brand-text-primary'}`}
    >
      <div className="relative">
        <item.icon className="h-6 w-6 flex-shrink-0" />
      </div>
      {!isCollapsed && (
        <div className="flex items-center justify-between w-full">
          <span className="font-semibold">{item.name}</span>
          {item.showCrown && <CrownIcon className="w-6 h-6" />}
        </div>
      )}
    </a>
  );

  return (
    <>
      <aside className={`fixed top-0 left-0 h-full bg-brand-bg-secondary/80 backdrop-blur-lg border-r border-brand-border flex flex-col transition-all duration-300 ease-in-out z-50 ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64 md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 h-20 border-b border-brand-border flex-shrink-0">
          {isCollapsed ? (
            <div className="w-full flex justify-center">
              <button onClick={() => setCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-white/10 hidden md:block">
                <SidebarToggleIcon className="h-6 w-6 rotate-180 transition-transform duration-300" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Logo className="h-9 w-9 text-brand-accent-primary" />
                <span className="text-xl font-bold text-brand-text-primary">NikharaBrief</span>
              </div>
              <button onClick={() => setCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-white/10 hidden md:block">
                <SidebarToggleIcon className="h-6 w-6 transition-transform duration-300" />
              </button>
            </>
          )}
          <button onClick={() => setMobileOpen(false)} className={`p-2 rounded-md hover:bg-white/10 md:hidden ${isCollapsed ? 'hidden': ''}`}>
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-brand-border flex-shrink-0 space-y-4">
            <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto'}`}>
                <div className="bg-brand-bg-primary/70 p-3 rounded-xl text-center">
                    <p className="font-semibold text-brand-text-primary">{currentUser.tokens} / {currentUser.payment === 'paid' ? 150 : 30} Tokens</p>
                    <p className="text-xs text-brand-text-secondary mt-1">Resets at 00:00 UTC</p>
                </div>
            </div>
            <div className="space-y-2">
                {PROFILE_NAV_ITEMS.map(item => (
                  <div key={item.name}>
                    <a
                      href="#"
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setActivePage(item.name as Page);
                      }}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${activePage === item.name ? 'bg-brand-accent-primary text-white shadow-[0_0_15px_rgba(46,139,255,0.4)]' : 'text-brand-text-secondary hover:bg-brand-border hover:text-brand-text-primary'}`}
                    >
                      <item.icon className="h-6 w-6 flex-shrink-0" />
                      {!isCollapsed && <span className="font-semibold">{item.name}</span>}
                    </a>
                  </div>
                ))}
            </div>
        </div>
      </aside>
       {isMobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden" aria-hidden="true" />}
    </>
  );
};
