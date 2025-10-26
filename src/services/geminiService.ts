
import type { GeneratorFormData, Brief } from '../types';

// Check for the API key in .env.local
const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key available:", !!apiKey); // Debug log

// Define model priority order - faster models first
const MODELS = [
  'gemini-2.5-flash-lite', // Fastest models first
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.5-pro',
];

// Direct API call function
const generateWithGemini = async (model: string, prompt: string) => {
  try {
    console.log(`Making API request to model: ${model}`);
    
    // Use a simpler model name format
    const actualModel = model.includes('gemini-') ? model : `gemini-${model}`;
    
    const url = `https://generativelanguage.googleapis.com/v1/models/${actualModel}:generateContent?key=${apiKey}`;
    
    console.log(`API URL: ${url.split('?')[0]}`); // Log URL without API key
    
    // Add timeout to prevent long-running requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800, // Reduced from 1024 for faster generation
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`API Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`API Error Response:`, errorData);
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`API Response received, has candidates:`, !!data.candidates);
    
    // Check if we have valid response data
    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates in response:", data);
      throw new Error("API returned no content");
    }
    
    const text = data.candidates[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      console.error("Empty text in response:", data.candidates[0]);
      throw new Error("API returned empty content");
    }
    
    return text;
  } catch (error) {
    console.error(`Error in generateWithGemini for model ${model}:`, error);
    throw error;
  }
};

const generateBriefId = (): string => {
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

const parseBriefText = (text: string): Partial<Omit<Brief, 'id' | 'keywords' | 'category' | 'niche' | 'industry' | 'visibility' | 'createdAt' | 'fullText'>> => {
    const sections: { [key: string]: string } = {};
    const lines = text.split('\n');
    let currentSectionKey: keyof ReturnType<typeof parseBriefText> | '' = '';

    const sectionMap: { [header: string]: keyof ReturnType<typeof parseBriefText> } = {
        "company name": "companyName",
        "company description": "companyDescription",
        "project description": "projectDescription",
        "deadline": "deadline"
    };

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        let isHeader = false;
        for (const header in sectionMap) {
            if (trimmedLine.toLowerCase().startsWith(header)) {
                const key = sectionMap[header];
                currentSectionKey = key;
                const content = trimmedLine.substring(header.length).replace(/^:/, '').trim();
                sections[key] = content;
                isHeader = true;
                break;
            }
        }

        if (!isHeader && currentSectionKey && sections[currentSectionKey] !== undefined) {
            if (sections[currentSectionKey] === '') {
                sections[currentSectionKey] = trimmedLine;
            } else {
                sections[currentSectionKey] += `\n${trimmedLine}`;
            }
        }
    }
    
    const result: ReturnType<typeof parseBriefText> = {
        companyName: (sections.companyName || '').trim().replace(/\*\*/g, ''),
        companyDescription: (sections.companyDescription || '').trim().replace(/\*\*/g, ''),
        projectDescription: (sections.projectDescription || '').trim().replace(/\*\*/g, ''),
        deadline: (sections.deadline || '').trim().replace(/\*\*/g, ''),
    };

    return result;
};

export const generateCreativeBrief = async (formData: GeneratorFormData): Promise<Brief> => {
    const deadlineInstruction = formData.deadline
        ? `The project deadline is strictly set to ${formData.deadline}. Design a project with a scope, complexity, and set of deliverables that are realistically achievable within this exact timeframe.`
        : `Based on the project's category, niche, industry, and keywords (especially considering any difficulty keywords like 'Easy', 'Medium', or 'Hard'), determine and provide a realistic project deadline.`;
    
    const prompt = `
        You are a creative director. Generate a detailed and unique creative brief.
        The brief is for a fictional company. Ensure the company name is unique and creative.
        The project is in the category of "${formData.category}", with a niche of "${formData.niche}" for the "${formData.industry}" industry.
        Incorporate these keywords for inspiration: ${formData.keywords.join(", ")}.
        Use Markdown for emphasis, specifically using double asterisks (**) for bolding important terms.
        ${deadlineInstruction}

        Structure your response *exactly* as follows, with each title on a new line:

        Company Name: [Fictional Company Name]
        Company Description: [A paragraph describing the company.]
        Project Description: [A detailed paragraph describing the project, goals, and deliverables.]
        Deadline: [The determined or provided deadline, e.g., "3 Weeks", "1 Month"]
    `;

    // Check if API key is available
    console.log("Using API key for generation:", !!apiKey);
    
    // Only use mock if API key is explicitly missing
    if (!apiKey) {
        console.log("No API key found, using mock response");
        await new Promise(res => setTimeout(res, 1500)); // Simulate network delay
        const mockText = `
            Company Name: Quantum Weavers
            Company Description: Quantum Weavers is a forward-thinking tech startup specializing in creating **immersive educational experiences** using augmented reality. They target young learners, making complex subjects like *quantum physics* and biology engaging and accessible through interactive storytelling.
            Project Description: Design a complete brand identity for Quantum Weavers. This includes a modern, memorable logo, a versatile color palette, and typography guidelines. The brand should feel **innovative**, **friendly**, and **trustworthy**, appealing to both educators and students. The final deliverable should be a comprehensive brand style guide.
            Deadline: 3 Weeks
        `;
        const parsed = parseBriefText(mockText);
         return {
            id: generateBriefId(),
            ...formData,
            companyName: parsed.companyName || "Mock Company",
            companyDescription: parsed.companyDescription || "A mock description.",
            projectDescription: parsed.projectDescription || "A mock project description.",
            deadline: formData.deadline || "3 Weeks (Mock)",
            visibility: 'public',
            createdAt: new Date().toISOString(),
            fullText: mockText,
        };
    }
    
    try {
        // Try models in order of priority until one works
        let text = '';
        let lastError = null;
        
        for (const model of MODELS) {
            try {
                console.log(`Attempting to generate brief with model: ${model}`);
                
                text = await generateWithGemini(model, prompt);
                
                if (text) {
                    console.log(`Successfully generated brief with model: ${model}`);
                    break; // Exit the loop if we got a successful response
                }
            } catch (error) {
                console.warn(`Model ${model} failed:`, error);
                lastError = error;
                // Continue to the next model
            }
        }
        
        if (!text) {
          throw new Error("All models failed to generate content. Last error: " + (lastError?.message || "Unknown error"));
        }

        const parsed = parseBriefText(text);
        
        if (!parsed.companyName || !parsed.companyDescription || !parsed.projectDescription) {
            console.error("Failed to parse brief from AI response:", { text, parsed });
            throw new Error("Failed to parse the brief from AI response. It may be incomplete or in an unexpected format.");
        }

        return {
            id: generateBriefId(),
            ...formData,
            companyName: parsed.companyName,
            companyDescription: parsed.companyDescription,
            projectDescription: parsed.projectDescription,
            deadline: parsed.deadline || formData.deadline || "Not specified",
            visibility: 'public',
            createdAt: new Date().toISOString(),
            fullText: text,
        };

    } catch (error) {
        console.error("Error generating brief:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to generate brief. The AI service may be temporarily unavailable.");
    }
};