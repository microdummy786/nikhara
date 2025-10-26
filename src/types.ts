
export type Page = 'Home' | 'Brief Gallery' | 'Discover' | 'Leaderboards' | 'Saved Briefs';

export interface User {
  id: string;
  username: string;
  displayName: string;
  payment: 'paid' | 'unpaid' | 'free';
  role: 'user' | 'moderator' | 'admin';
  tokens: number;
}

export interface Brief {
  id: string;
  category: string;
  niche: string;
  industry: string;
  keywords: string[];
  deadline: string;
  companyName: string;
  companyDescription: string;
  projectDescription: string;
  visibility: 'public' | 'unlisted';
  createdAt: string;
  fullText: string;
}

export interface GeneratorFormData {
    category: string;
    niche: string;
    industry: string;
    keywords: string[];
    deadline: string;
}