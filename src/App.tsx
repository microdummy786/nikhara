
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { BriefGenerator } from './components/BriefGenerator';
import type { Page, Brief, User } from './types';
import { BriefDisplay } from './components/BriefDisplay';
import { SettingsPage } from './components/SettingsPage';
import { ProfilePage } from './components/ProfilePage';
import { UpgradeToProPage } from './components/UpgradeToProPage';
import { BriefGalleryPage } from './components/BriefGalleryPage';
import { DiscoverPage } from './components/DiscoverPage';
import { LeaderboardsPage } from './components/LeaderboardsPage';
import { SavedBriefsPage } from './components/SavedBriefsPage';
import { GenerationHistoryPage } from './components/GenerationHistoryPage';
import { NAV_ITEMS } from './constants';
import { Logo, HamburgerMenuIcon, CrownIcon } from './components/Icons';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Home');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [user, setUser] = useState<User>({
      id: 'dev-user',
      username: '@alex_creative',
      displayName: 'Alex',
      payment: 'paid',
      role: 'user',
      tokens: 150,
  });

  const [currentBrief, setCurrentBrief] = useState<Brief | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserTokens = useCallback((newTokens: number) => {
    setUser(prevUser => ({...prevUser, tokens: newTokens}));
  }, []);

  const handleSetActivePage = (page: Page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const [showGenerationHistory, setShowGenerationHistory] = useState<boolean>(false);

  const renderContent = () => {
    if (showGenerationHistory) {
      return <GenerationHistoryPage onBack={() => setShowGenerationHistory(false)} />;
    }
    
    switch (activePage) {
      case 'Home':
        return (
          <div className="flex flex-col xl:flex-row gap-8 w-full">
            <BriefGenerator 
              setCurrentBrief={setCurrentBrief}
              setIsLoading={setIsLoading}
              setError={setError}
              currentUser={user}
              updateTokens={updateUserTokens}
              onShowGenerationHistory={() => setShowGenerationHistory(true)}
            />
            <BriefDisplay 
              brief={currentBrief} 
              isLoading={isLoading} 
              error={error} 
              currentUser={user}
            />
          </div>
        );
      case 'Brief Gallery':
        return <BriefGalleryPage />;
      case 'Discover':
        return <DiscoverPage />;
      case 'Leaderboards':
        return <LeaderboardsPage />;
      case 'Saved Briefs':
        return <SavedBriefsPage />;
      case 'Settings':
        return <SettingsPage />;
      case 'Profile':
        return <ProfilePage />;
      case 'Upgrade to Pro':
        return <UpgradeToProPage />;
      default:
        return <BriefGalleryPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg-primary font-sans">
      <Sidebar 
        activePage={activePage} 
        setActivePage={handleSetActivePage}
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        currentUser={user}
      />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <header className="md:hidden flex items-center justify-between p-4 border-b border-brand-border sticky top-0 bg-brand-bg-primary/80 backdrop-blur-sm z-30">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-md hover:bg-white/10">
                <HamburgerMenuIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center justify-center flex-1 gap-2">
                <Logo className="h-8 w-8 text-brand-accent-primary" />
                <span className="text-xl font-bold text-brand-text-primary">NikharaBrief</span>
            </div>
            <div className="w-8"></div>
        </header>

        <main className="flex-grow p-4 sm:p-6 xl:p-8">
          {renderContent()}
        </main>
        <Footer setActivePage={handleSetActivePage} />
      </div>
    </div>
  );
};

export default App;