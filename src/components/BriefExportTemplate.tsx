import React from 'react';
import { Brief } from '../types';
import logoSvg from '../assets/logo.svg';

interface BriefExportTemplateProps {
  brief: Brief;
}

export const BriefExportTemplate: React.FC<BriefExportTemplateProps> = ({ brief }) => {
  const renderMarkdownBold = (text: string): React.ReactNode => {
    if (!text) return null;
    // Regex to find text between single or double asterisks (non-greedy)
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <strong key={index}>{part.slice(1, -1)}</strong>;
      }
      return part;
    });
  };

  // Remove asterisks from company name and deadline
  const cleanText = (text: string): string => {
    if (!text) return '';
    return text.replace(/\*\*/g, '').replace(/\*/g, '');
  };

  return (
    <div style={{
      backgroundColor: '#0D141C',
      color: 'white',
      fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '20px',
      width: '800px',
      position: 'relative',
      boxSizing: 'border-box',
      margin: '0 auto',
      height: 'auto',
      minHeight: 'fit-content'
    }}>
      {/* NikharaBrief Logo and Text */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginTop: '10px',
        marginBottom: '15px',
        justifyContent: 'center',
        width: '100%'
      }}>
        <img 
          src={logoSvg} 
          alt="NikharaBrief Logo" 
          style={{ width: '40px', height: '40px', marginRight: '10px', color: '#2c8bfb' }} 
        />
        <h1 style={{ 
          color: 'white', 
          fontSize: '24px', 
          fontWeight: 'bold',
          margin: 0
        }}>NikharaBrief</h1>
      </div>

      {/* Brief Card - Centered with consistent margins */}
      <div style={{
        backgroundColor: '#0D141C',
        border: '1px solid #1E88E5',
        borderRadius: '8px',
        boxShadow: '0 0 15px rgba(30, 136, 229, 0.4)',
        padding: '30px',
        width: '90%',
        margin: '0 auto',
        marginTop: '30px',
        marginBottom: '30px'
      }}>
        {/* Brief ID and Tags */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '0', fontSize: '14px' }}>Brief ID: {brief.id}</p>
          
          {/* Category, Niche, Industry Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            <span style={{ 
              backgroundColor: 'rgba(30, 136, 229, 0.2)', 
              color: 'white', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '12px',
              border: '1px solid rgba(30, 136, 229, 0.5)'
            }}>
              {brief.category}
            </span>
            <span style={{ 
              backgroundColor: 'rgba(30, 136, 229, 0.2)', 
              color: 'white', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '12px',
              border: '1px solid rgba(30, 136, 229, 0.5)'
            }}>
              {brief.niche}
            </span>
            <span style={{ 
              backgroundColor: 'rgba(30, 136, 229, 0.2)', 
              color: 'white', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '12px',
              border: '1px solid rgba(30, 136, 229, 0.5)'
            }}>
              {brief.industry}
            </span>
          </div>
          
          <hr style={{ border: '0.5px solid #1E88E5', margin: '15px 0' }} />
        </div>

        {/* Company Name */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>Company Name :</p>
          <p style={{ margin: '8px 0', fontSize: '14px' }}>
            {cleanText(brief.companyName)}
          </p>
        </div>

        {/* Company Description */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>Company Description :</p>
          <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: '1.5' }}>
            {renderMarkdownBold(brief.companyDescription)}
          </p>
        </div>

        {/* Project Description */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>Project Description :</p>
          <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: '1.5' }}>
            {renderMarkdownBold(brief.projectDescription)}
          </p>
        </div>

        {/* Deadline */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>Deadline :</p>
          <p style={{ margin: '8px 0', fontSize: '14px' }}>
            {cleanText(brief.deadline)}
          </p>
        </div>
      </div>
    </div>
  );
};