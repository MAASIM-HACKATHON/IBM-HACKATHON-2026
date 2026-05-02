import { requestWatsonxText } from './watsonxService';
import type { EmailFormValues } from '../utilities/system-utils/emailGenerator';

export interface ContentAnalysisResult {
  purpose: EmailFormValues['purpose'] | null;
  tone: EmailFormValues['tone'] | null;
  jobRole: string;
  company: string;
  extraInstruction: string;
  refinement: EmailFormValues['refinement'] | null;
  confidence: number;
}

/**
 * Builds a prompt for Watsonx AI to analyze pasted content and extract email context
 */
function buildContentAnalysisPrompt(content: string): string {
  return [
    'You are an intelligent content analyzer for an email generation system.',
    'Analyze the following text and extract relevant information for email composition.',
    '',
    'TEXT TO ANALYZE:',
    '---',
    content,
    '---',
    '',
    'Extract and return ONLY the following information in this exact format:',
    'PURPOSE: <one of: job-application, follow-up, thank-you, networking, inquiry>',
    'TONE: <one of: formal, professional, friendly, enthusiastic>',
    'JOB_ROLE: <detected job role or position, or NONE if not found>',
    'COMPANY: <detected company name, or NONE if not found>',
    'REFINEMENT: <one of: none, shorter, longer, more-formal, more-casual>',
    'EXTRA_INSTRUCTION: <brief instruction for email generation based on content, or NONE>',
    'CONFIDENCE: <number from 0-100 indicating confidence in the analysis>',
    '',
    'Guidelines:',
    '- PURPOSE: Determine the primary intent (job application, follow-up, thank you, networking, or inquiry)',
    '- TONE: Assess the appropriate tone based on formality and enthusiasm level',
    '- JOB_ROLE: Extract specific job title or position mentioned',
    '- COMPANY: Extract company or organization name',
    '- REFINEMENT: Suggest refinement based on content length and formality',
    '- EXTRA_INSTRUCTION: Generate helpful instructions for the AI email generator',
    '- CONFIDENCE: Rate your confidence in the overall analysis',
    '',
    'Return ONLY the formatted output above, nothing else.',
  ].join('\n');
}

/**
 * Parses the Watsonx AI response and extracts structured analysis data
 */
function parseAnalysisResponse(responseText: string): ContentAnalysisResult | null {
  try {
    const lines = responseText.split('\n').map(line => line.trim()).filter(Boolean);
    
    const result: ContentAnalysisResult = {
      purpose: null,
      tone: null,
      jobRole: '',
      company: '',
      extraInstruction: '',
      refinement: null,
      confidence: 0,
    };

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      if (!key || !value) continue;

      const normalizedKey = key.trim().toUpperCase();

      switch (normalizedKey) {
        case 'PURPOSE': {
          const purposeValue = value.toLowerCase();
          if (['job-application', 'follow-up', 'thank-you', 'networking', 'inquiry'].includes(purposeValue)) {
            result.purpose = purposeValue as EmailFormValues['purpose'];
          }
          break;
        }

        case 'TONE': {
          const toneValue = value.toLowerCase();
          if (['formal', 'professional', 'friendly', 'enthusiastic'].includes(toneValue)) {
            result.tone = toneValue as EmailFormValues['tone'];
          }
          break;
        }

        case 'JOB_ROLE':
        case 'JOBROLE': {
          if (value.toUpperCase() !== 'NONE') {
            result.jobRole = value;
          }
          break;
        }

        case 'COMPANY': {
          if (value.toUpperCase() !== 'NONE') {
            result.company = value;
          }
          break;
        }

        case 'REFINEMENT': {
          const refinementValue = value.toLowerCase();
          if (['none', 'shorter', 'longer', 'more-formal', 'more-casual'].includes(refinementValue)) {
            result.refinement = refinementValue as EmailFormValues['refinement'];
          }
          break;
        }

        case 'EXTRA_INSTRUCTION':
        case 'EXTRAINSTRUCTION': {
          if (value.toUpperCase() !== 'NONE') {
            result.extraInstruction = value;
          }
          break;
        }

        case 'CONFIDENCE': {
          const confidenceNum = parseInt(value, 10);
          if (!isNaN(confidenceNum)) {
            result.confidence = Math.min(Math.max(confidenceNum, 0), 100);
          }
          break;
        }
      }
    }

    // Only return if we have at least some useful data
    if (result.purpose || result.tone || result.jobRole || result.company) {
      return result;
    }

    return null;
  } catch (error) {
    console.error('Failed to parse analysis response:', error);
    return null;
  }
}

/**
 * Analyzes pasted content using Watsonx AI to intelligently detect email context
 * and auto-fill form fields with high accuracy
 */
export async function analyzeContentWithWatsonx(content: string): Promise<ContentAnalysisResult | null> {
  if (!content || content.trim().length < 20) {
    return null;
  }

  try {
    const prompt = buildContentAnalysisPrompt(content);
    const response = await requestWatsonxText({ prompt });
    const analysis = parseAnalysisResponse(response.text);

    return analysis;
  } catch (error) {
    console.error('Watsonx content analysis failed:', error);
    return null;
  }
}
