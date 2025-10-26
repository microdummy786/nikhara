
// Fix: Import React to provide types for React.FC and React.SVGProps.
import React from 'react';
import type { Page } from './types';
import { HomeIcon, GalleryIcon, DiscoverIcon, LeaderboardIcon, SavedIcon, ProfileIcon, SettingsIcon, CrownIcon } from './components/Icons';

export const NAV_ITEMS: { name: Page; icon: React.FC<React.SVGProps<SVGSVGElement>>; showCrown?: boolean }[] = [
  { name: 'Home', icon: HomeIcon },
  { name: 'Brief Gallery', icon: GalleryIcon },
  { name: 'Discover', icon: DiscoverIcon },
  { name: 'Leaderboards', icon: LeaderboardIcon },
  { name: 'Saved Briefs', icon: SavedIcon, showCrown: true },
];

export const PROFILE_NAV_ITEMS = [
    { name: 'Profile', icon: ProfileIcon },
    { name: 'Settings', icon: SettingsIcon },
    { name: 'Upgrade to Pro', icon: CrownIcon },
]

export const BRIEF_CATEGORIES: { [key: string]: { niche: string[]; industry: string[]; keywords: string[] | { difficulty: string[]; genres: string[] } } } = {
    "Game Development": {
        niche: ["Singleplayer", "Multiplayer", "MMO"],
        industry: ["Mobile", "PC", "Console", "Cross Platform", "Web Based", "Random"],
        keywords: {
            difficulty: ["Easy", "Medium", "Hard"],
            genres: ["Battle Royale", "Shooter (FPS/TPS)", "Platformer", "Fighting/Combat", "Stealth", "Survival", "Metroidvania", "Open World", "Adventure", "Horror", "RPG", "MOBA", "Roguelike", "Strategy", "Idle", "Tycoon", "Simulation", "Sports", "Racing", "Puzzle", "Card/Deck", "Detective", "Casual/Party", "Sandbox", "Educational", "Narrative/Visual Novel"]
        }
    },
    "Graphics & Design": {
        niche: ["Motion Graphics", "Logo & Brand Identity", "UI/UX Design", "Print Design", "Art & Illustration", "Character Modelling", "Streaming Graphics", "Books", "Marketing Design", "Visual Design", "Fashion & Merchandise"],
        industry: ["Entertainment", "Gaming", "Marketing", "Technology", "Finance", "Food", "Health", "Retail Store", "Real Estate", "Fashion", "Sports", "Education", "Transportation", "Travel"],
        keywords: ["Minimalist", "Corporate", "Playful", "Elegant", "Vintage", "Modern", "Futuristic", "Hand-drawn"]
    },
    "Copywriting": {
        niche: ["Articles & Blogs", "Scriptwriting", "Speechwriting", "Creative Writing", "Podcast Writing", "Research & Summaries", "Content Editing", "Career Writing", "Business & Marketing", "Social Media", "Book & eBook Writing", "Translation & Localization", "Handwriting"],
        industry: ["Entertainment", "Gaming", "Marketing", "Technology", "Finance", "Food", "Health", "Retail Store", "Real Estate", "Fashion", "Sports", "Education", "Transportation", "Travel"],
        keywords: ["Persuasive", "Informative", "SEO-Optimized", "Storytelling", "Technical", "Humorous"]
    },
    "Music & Audio": {
        niche: ["Song Writers", "Custom Songs", "Voice Over", "Audiobook Production", "Audio Ads Production"],
        industry: ["Entertainment", "Gaming", "Marketing", "Technology", "Finance", "Food", "Health", "Retail Store", "Real Estate", "Fashion", "Sports", "Education", "Transportation", "Travel"],
        keywords: ["Orchestral", "Electronic", "Acoustic", "Cinematic", "Upbeat", "Ambient"]
    },
    "AI Services": {
        niche: ["Prompt Engineering", "AI Mobile Apps", "AI Websites & Softwares", "AI Chatbot", "AI Agents & Automations", "AI Image Generation", "AI Avatar Design", "AI Video Avatars", "AI Video Art", "AI Music Videos", "Text to Speech", "AI Content Editing", "ComfyUI Workflow Creation"],
        industry: ["Entertainment", "Gaming", "Marketing", "Technology", "Finance", "Food", "Health", "Retail Store", "Real Estate", "Fashion", "Sports", "Education", "Transportation", "Travel"],
        keywords: ["Innovative", "Efficient", "Personalized", "Automated", "Data-driven"]
    }
};