/**
 * Watsonx AI Service
 * Handles AI-powered email generation using IBM Watsonx.ai (Granite models)
 */

import { FilteredATSContext } from '@/lib/ats-engine';
import { WatsonXAI } from '@ibm-cloud/watsonx-ai';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface WatsonxConfig {
  apiKey: string;
  projectId: string;
  serviceUrl: string;
  model: string;
  parameters: {
    max_new_tokens: number;
    temperature: number;
    top_p: number;
    repetition_penalty: number;
  };
}

export interface EmailPromptContext {
  emailType: 'job_application' | 'follow_up' | 'networking';
  targetRole: string;
  companyName?: string;
  matchedSkills: string[];
  missingSkills: string[];
  experienceLevel: string;
  tone: 'professional' | 'friendly';
  language: string;
}

export interface EmailContent {
  subject: string;
  body: string;
  generatedBy: 'watsonx' | 'template';
  tokensUsed: number;
}

export interface EmailResult {
  success: boolean;
  email: EmailContent;
  warning?: string;
}

// ============================================================================
// Watsonx Configuration
// ============================================================================

const watsonxConfig: WatsonxConfig = {
  apiKey: process.env.WATSONX_API_KEY || '',
  projectId: process.env.WATSONX_PROJECT_ID || '',
  serviceUrl: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
  model: 'ibm/granite-13b-chat-v2',
  parameters: {
    max_new_tokens: 250,      // Limit response length
    temperature: 0.7,         // Balanced creativity
    top_p: 0.9,              // Nucleus sampling
    repetition_penalty: 1.1   // Reduce repetition
  }
};

// ============================================================================
// Prompt Building
// ============================================================================

/**
 * Build optimized prompt for email generation
 * Token budget: ~120 tokens (prompt) + ~75 tokens (context) = ~195 tokens
 */
function buildPrompt(context: EmailPromptContext): string {
  return `Generate a ${context.tone} ${context.emailType} email in ${context.language}.

Context:
- Target Role: ${context.targetRole}
- Company: ${context.companyName || '[Company Name]'}
- Candidate Level: ${context.experienceLevel}
- Relevant Skills: ${context.matchedSkills.join(', ')}
- Skills to Develop: ${context.missingSkills.join(', ')}

Requirements:
- Length: 150-200 words
- Include subject line
- Professional format
- Highlight matched skills naturally

Email:`;
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Extract subject line from generated email
 */
function extractSubject(emailText: string): string {
  const subjectMatch = emailText.match(/Subject:\s*(.+?)(?:\n|$)/i);
  if (subjectMatch) {
    return subjectMatch[1].trim();
  }
  
  // Fallback: use first line or generate from content
  const lines = emailText.split('\n').filter(line => line.trim());
  return lines[0]?.substring(0, 60) || 'Professional Email';
}

// ============================================================================
// Watsonx API Integration
// ============================================================================

/**
 * Generate email using Watsonx.ai
 * Note: This is a placeholder implementation. Actual Watsonx SDK integration required.
 */
async function generateWithWatsonx(context: EmailPromptContext): Promise<string> {
  // Check if API key is configured
  if (!watsonxConfig.apiKey || !watsonxConfig.projectId) {
    throw new Error('Watsonx API credentials not configured');
  }

  const prompt = buildPrompt(context);
  
  try {
    // Initialize Watsonx client
    const watsonxClient = new WatsonXAI({
      version: '2023-05-29',
      serviceUrl: watsonxConfig.serviceUrl,
      authenticator: new IamAuthenticator({
        apikey: watsonxConfig.apiKey
      })
    });

    const response = await watsonxClient.generateText({
      modelId: watsonxConfig.model,
      projectId: watsonxConfig.projectId,
      input: prompt,
      parameters: watsonxConfig.parameters
    });

    return (response.result as any).generated_text || '';

  } catch (error) {
    console.error('Watsonx API error:', error);
    throw error;
  }
}

// ============================================================================
// Template Fallback
// ============================================================================

/**
 * Generate template-based email when Watsonx fails
 */
function generateTemplateEmail(context: EmailPromptContext): EmailContent {
  const { targetRole, matchedSkills, experienceLevel, companyName } = context;
  
  const subject = `Application for ${targetRole} Position`;
  
  const body = `Dear Hiring Manager,

I am writing to express my interest in the ${targetRole} position${companyName ? ` at ${companyName}` : ''}. As a ${experienceLevel} professional with expertise in ${matchedSkills.slice(0, 3).join(', ')}, I am confident in my ability to contribute to your team.

My background includes hands-on experience with ${matchedSkills[0]}, which aligns well with your requirements. I am eager to bring my skills and dedication to your organization.

I would welcome the opportunity to discuss how my experience can benefit your team.

Best regards,
[Your Name]`;

  return {
    subject,
    body,
    generatedBy: 'template',
    tokensUsed: 0
  };
}

// ============================================================================
// Main Email Generation with Fallback
// ============================================================================

/**
 * Generate email with Watsonx AI, falling back to template on failure
 */
export async function generateEmailWithFallback(
  context: EmailPromptContext
): Promise<EmailResult> {
  try {
    // Attempt Watsonx generation
    const aiEmail = await generateWithWatsonx(context);
    
    // Validate response
    if (!aiEmail || aiEmail.trim().length < 50) {
      throw new Error('Invalid AI response');
    }
    
    return {
      success: true,
      email: {
        subject: extractSubject(aiEmail),
        body: aiEmail,
        generatedBy: 'watsonx',
        tokensUsed: estimateTokens(aiEmail)
      }
    };
    
  } catch (error) {
    console.error('Watsonx failed, using template:', error);
    
    // Fallback to template
    return {
      success: true,
      email: generateTemplateEmail(context),
      warning: 'AI service unavailable, using template'
    };
  }
}

/**
 * Convert FilteredATSContext to EmailPromptContext
 */
export function atsContextToEmailContext(
  atsContext: FilteredATSContext,
  emailType: 'job_application' | 'follow_up' | 'networking' = 'job_application',
  companyName?: string,
  tone: 'professional' | 'friendly' = 'professional',
  language: string = 'en'
): EmailPromptContext {
  return {
    emailType,
    targetRole: atsContext.targetRole,
    companyName,
    matchedSkills: atsContext.matchedSkills,
    missingSkills: atsContext.missingSkills,
    experienceLevel: atsContext.experienceLevel,
    tone,
    language
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  generateEmailWithFallback,
  atsContextToEmailContext,
  buildPrompt,
  estimateTokens
};

// Made with Bob
