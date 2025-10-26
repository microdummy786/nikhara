import { supabase } from '../lib/supabase';
import type { Brief, GeneratorFormData } from '../types';

/**
 * Generate a unique brief ID in the format: BRFYYYYMMDDHHMMSSXXX
 */
export const generateBriefId = (): string => {
  const d = new Date();
  const YYYY = d.getUTCFullYear();
  const MM = String(d.getUTCMonth() + 1).padStart(2, '0');
  const DD = String(d.getUTCDate()).padStart(2, '0');
  const HH = String(d.getUTCHours()).padStart(2, '0');
  const MIN = String(d.getUTCMinutes()).padStart(2, '0');
  const SS = String(d.getUTCSeconds()).padStart(2, '0');
  const XXX = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `BRF${YYYY}${MM}${DD}${HH}${MIN}${SS}${XXX}`;
};

/**
 * Save a brief to the database
 */
export const saveBriefToDatabase = async (brief: Brief, userId?: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('briefs')
      .insert({
        brief_id: brief.id,
        category: brief.category,
        niche: brief.niche,
        industry: brief.industry,
        keywords: brief.keywords,
        deadline: brief.deadline,
        company_name: brief.companyName,
        company_description: brief.companyDescription,
        project_description: brief.projectDescription,
        brief_visibility: brief.visibility,
        brief_created_at: brief.createdAt,
        full_text: brief.fullText
      });

    if (error) {
      console.error('Error saving brief to database:', error);
      throw error;
    }

    // Add to brief history if user is logged in
    if (userId) {
      await supabase
        .from('brief_history')
        .insert({
          user_id: userId,
          brief_id: brief.id,
          generated_at: brief.createdAt
        });
    }

    console.log('Brief saved to database successfully');
  } catch (error) {
    console.error('Error in saveBriefToDatabase:', error);
    throw error;
  }
};

/**
 * Get a pre-generated brief that matches the criteria
 */
export const getPreGeneratedBrief = async (formData: GeneratorFormData): Promise<Brief | null> => {
  try {
    // Build the query to match category, niche, and industry
    let query = supabase
      .from('briefs')
      .select('*')
      .eq('category', formData.category)
      .eq('niche', formData.niche)
      .eq('industry', formData.industry)
      .eq('brief_visibility', 'public');

    // Get all matching briefs
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching pre-generated brief:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Filter by keywords if provided
    let filteredData = data;
    if (formData.keywords && formData.keywords.length > 0) {
      // Filter briefs that contain at least one of the requested keywords
      filteredData = data.filter(brief => {
        const briefKeywords = Array.isArray(brief.keywords) ? brief.keywords : [];
        return formData.keywords.some(keyword => 
          briefKeywords.includes(keyword)
        );
      });
    }

    if (filteredData.length === 0) {
      return null;
    }

    // Select a random brief from the filtered matches
    const randomIndex = Math.floor(Math.random() * filteredData.length);
    const briefData = filteredData[randomIndex];

    // Convert database format to Brief type
    const brief: Brief = {
      id: briefData.brief_id,
      category: briefData.category,
      niche: briefData.niche,
      industry: briefData.industry,
      keywords: Array.isArray(briefData.keywords) ? briefData.keywords : [],
      deadline: briefData.deadline,
      companyName: briefData.company_name || '',
      companyDescription: briefData.company_description || '',
      projectDescription: briefData.project_description || '',
      visibility: briefData.brief_visibility,
      createdAt: briefData.brief_created_at,
      fullText: briefData.full_text || ''
    };

    return brief;
  } catch (error) {
    console.error('Error in getPreGeneratedBrief:', error);
    return null;
  }
};

/**
 * Get brief history for a user (last 5 briefs)
 */
export const getBriefHistory = async (userId: string, limit: number = 5): Promise<Brief[]> => {
  try {
    const { data, error } = await supabase
      .from('brief_history')
      .select(`
        brief_id,
        generated_at,
        briefs (*)
      `)
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching brief history:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Convert to Brief[] format
    return data
      .filter(entry => entry.briefs)
      .map(entry => {
        const b = entry.briefs as any;
        return {
          id: b.brief_id,
          category: b.category,
          niche: b.niche,
          industry: b.industry,
          keywords: Array.isArray(b.keywords) ? b.keywords : [],
          deadline: b.deadline,
          companyName: b.company_name || '',
          companyDescription: b.company_description || '',
          projectDescription: b.project_description || '',
          visibility: b.brief_visibility,
          createdAt: b.brief_created_at,
          fullText: b.full_text || ''
        };
      });
  } catch (error) {
    console.error('Error in getBriefHistory:', error);
    return [];
  }
};

