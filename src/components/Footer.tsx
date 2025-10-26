
import React from 'react';
import { Logo, LinkedInIcon, YoutubeIcon, InstagramIcon, FacebookIcon, TwitterIcon, ThreadsIcon, PinterestIcon, CrownIcon } from './Icons';

import type { Page } from '../types';

interface FooterProps {
  setActivePage: (page: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  const socialLinks = [
    { name: 'LinkedIn', icon: LinkedInIcon, href: '#' },
    { name: 'Youtube', icon: YoutubeIcon, href: '#' },
    { name: 'Instagram', icon: InstagramIcon, href: '#' },
    { name: 'Facebook', icon: FacebookIcon, href: '#' },
    { name: 'X (Twitter)', icon: TwitterIcon, href: '#' },
    { name: 'Threads', icon: ThreadsIcon, href: '#' },
    { name: 'Pinterest', icon: PinterestIcon, href: '#' },
  ];

  return (
    <footer className="bg-brand-bg-secondary/60 backdrop-blur-md text-brand-text-secondary border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Logo className="h-9 w-9 text-brand-accent-primary" />
              <span className="text-xl font-bold text-brand-text-primary">NikharaBrief</span>
            </div>
            <p className="text-sm">Unleash Your Creativity</p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="font-semibold text-brand-text-primary mb-4">LINKS</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('Upgrade to Pro'); }} className="flex items-center gap-1.5 hover:text-brand-accent-primary transition-colors">
                  Upgrade to Pro&nbsp;
                  <CrownIcon className="w-5 h-5" />
                </a>
              </li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePage('Discover'); }} className="hover:text-brand-accent-primary transition-colors">Discover</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePage('Leaderboards'); }} className="hover:text-brand-accent-primary transition-colors">Leaderboards</a></li>
            </ul>
          </div>

          {/* Column 3: Details */}
          <div>
            <h3 className="font-semibold text-brand-text-primary mb-4">DETAILS</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-brand-accent-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-brand-accent-primary transition-colors">Contact or Report</a></li>
              <li><a href="#" className="hover:text-brand-accent-primary transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-brand-accent-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div>
            <h3 className="font-semibold text-brand-text-primary mb-4">SOCIAL</h3>
            <ul className="space-y-3 text-sm">
              {socialLinks.map(({ name, icon: Icon, href }) => (
                <li key={name}>
                  <a href={href} className="flex items-center gap-3 hover:text-brand-accent-primary transition-colors group">
                    <Icon className="h-5 w-5" />
                    <span>{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-brand-bg-primary text-center py-4 text-xs border-t border-brand-border">
        <p>© 2025 — NikharaBrief™. All Rights Reserved.</p>
        <p>Made with ❤ by Ayudha Studios</p>
      </div>
    </footer>
  );
};
