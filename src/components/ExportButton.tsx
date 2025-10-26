import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { Brief } from '../types';
import { ExportIcon, ChevronDownIcon } from './Icons';
import { BriefExportTemplate } from './BriefExportTemplate';
import { createRoot } from 'react-dom/client';

interface ExportButtonProps {
  brief: Brief;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ brief }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format brief content for text and markdown export
  const formatBriefContent = (isMarkdown: boolean) => {
    const title = isMarkdown ? '# NikharaBrief.com\n\n' : 'NikharaBrief.com\n';
    const sectionStart = isMarkdown ? '## ' : '';
    const lineBreak = isMarkdown ? '\n\n' : '\n\n';
    const sectionSeparator = isMarkdown ? ' : ' : ' : ';
    
    // Remove asterisks from company name and deadline
    const companyName = brief.companyName?.replace(/\*\*/g, '').replace(/\*/g, '') || '';
    const deadline = brief.deadline?.replace(/\*\*/g, '').replace(/\*/g, '') || '';

    return `${title}Brief ID: ${brief.id}${lineBreak}` +
      `${sectionStart}Company Name${sectionSeparator}${companyName}${lineBreak}` +
      `${sectionStart}Company Description${sectionSeparator}${brief.companyDescription}${lineBreak}` +
      `${sectionStart}Project Description${sectionSeparator}${brief.projectDescription}${lineBreak}` +
      `${sectionStart}Deadline${sectionSeparator}${deadline}${lineBreak}` +
      `${sectionStart}Category${sectionSeparator}${brief.category}${lineBreak}` +
      `${sectionStart}Niche${sectionSeparator}${brief.niche}${lineBreak}` +
      `${sectionStart}Industry${sectionSeparator}${brief.industry}${lineBreak}`;
  };

  // Export as text file
  const exportAsText = () => {
    const content = formatBriefContent(false);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `brief-${brief.id}.txt`);
    setIsOpen(false);
  };

  // Export as markdown
  const exportAsMarkdown = () => {
    const content = formatBriefContent(true);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `brief-${brief.id}.md`);
    setIsOpen(false);
  };

  // Export as image
  const exportAsImage = () => {
    try {
      // Create a temporary div for rendering the export template
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '800px';
      tempDiv.style.height = 'auto';
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '0';
      tempDiv.style.left = '0';
      tempDiv.style.zIndex = '-1000';
      tempDiv.style.backgroundColor = '#0D141C';
      tempDiv.style.overflow = 'visible';
      document.body.appendChild(tempDiv);
      
      // Render the export template to the temporary div
      const root = createRoot(tempDiv);
      root.render(<BriefExportTemplate brief={brief} />);
      
      // Wait for the component to render
      setTimeout(() => {
        // Get the actual height of the rendered content
        const actualHeight = tempDiv.offsetHeight;
        
        // Convert the rendered component to an image
        toPng(tempDiv, { 
          quality: 0.95,
          pixelRatio: 1,
          backgroundColor: '#0D141C',
          width: 800,
          height: actualHeight,
          canvasWidth: 800,
          canvasHeight: actualHeight
        })
        .then((dataUrl) => {
            saveAs(dataUrl, `brief-${brief.id}.png`);
            setIsOpen(false);
            // Clean up
            document.body.removeChild(tempDiv);
          })
          .catch((error) => {
            console.error('Error exporting as image:', error);
            document.body.removeChild(tempDiv);
          });
      }, 500);
    } catch (error) {
      console.error('Error in export process:', error);
    }
  };

  // Export as PDF
  const exportAsPDF = () => {
    try {
      // Create a temporary div for rendering the export template
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '800px';
      tempDiv.style.height = 'auto';
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '0';
      tempDiv.style.left = '0';
      tempDiv.style.zIndex = '-1000';
      tempDiv.style.backgroundColor = '#0D141C';
      tempDiv.style.overflow = 'visible';
      document.body.appendChild(tempDiv);
      
      // Render the export template to the temporary div
      const root = createRoot(tempDiv);
      root.render(<BriefExportTemplate brief={brief} />);
      
      // Wait for the component to render
      setTimeout(() => {
        // Get the actual height of the rendered content
        const actualHeight = tempDiv.offsetHeight;
        
        // Convert the rendered component to an image
        toPng(tempDiv, { 
          quality: 0.95,
          pixelRatio: 1,
          backgroundColor: '#0D141C',
          width: 800,
          height: actualHeight,
          canvasWidth: 800,
          canvasHeight: actualHeight
        })
        .then((dataUrl) => {
          // Create a PDF with custom dimensions matching the image
          const imgProps = { width: 800, height: actualHeight };
          // Use a scale factor to convert pixels to mm (approximate)
          const scaleFactor = 0.264583; // 1 pixel ≈ 0.264583 mm
          const pdfWidth = imgProps.width * scaleFactor;
          const pdfHeight = imgProps.height * scaleFactor;
          
          // Create PDF with custom dimensions
          const pdf = new jsPDF({
            orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
            unit: 'mm',
            format: [pdfWidth, pdfHeight]
          });
          
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`brief-${brief.id}.pdf`);
          setIsOpen(false);
          // Clean up
          document.body.removeChild(tempDiv);
        })
        .catch((error) => {
          console.error('Error exporting as PDF:', error);
          document.body.removeChild(tempDiv);
        });
    }, 500);
    } catch (error) {
      console.error('Error in PDF export process:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm py-2 px-3 bg-brand-border hover:bg-white/10 transition-colors rounded-lg"
      >
        <ExportIcon className="w-4 h-4" /> 
        <span>Export</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-brand-bg-primary border border-brand-border rounded-lg shadow-lg z-10">
          <ul className="py-1">
            <li>
              <button 
                onClick={exportAsText}
                className="w-full text-left px-4 py-2 text-sm text-brand-text-secondary hover:bg-brand-bg-secondary transition-colors"
              >
                Export as Text File
              </button>
            </li>
            <li>
              <button 
                onClick={exportAsMarkdown}
                className="w-full text-left px-4 py-2 text-sm text-brand-text-secondary hover:bg-brand-bg-secondary transition-colors"
              >
                Export as Markdown
              </button>
            </li>
            <li>
              <button 
                onClick={exportAsImage}
                className="w-full text-left px-4 py-2 text-sm text-brand-text-secondary hover:bg-brand-bg-secondary transition-colors"
              >
                Export as Image
              </button>
            </li>
            <li>
              <button 
                onClick={exportAsPDF}
                className="w-full text-left px-4 py-2 text-sm text-brand-text-secondary hover:bg-brand-bg-secondary transition-colors"
              >
                Export as PDF
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};