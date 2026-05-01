// AI Service for Email Generation
// This service handles AI-powered email generation using IBM Watson or fallback logic

import { EmailTone, EmailAction } from '../types/email.types';

interface AIServiceConfig {
  apiKey?: string;
  cloudUrl?: string;
  projectId?: string;
}

class AIService {
  private config: AIServiceConfig;

  constructor() {
    this.config = {
      apiKey: process.env.IBM_API_KEY,
      cloudUrl: process.env.IBM_CLOUD_URL,
      projectId: process.env.IBM_PROJECT_ID,
    };
  }

  /**
   * Generate professional email based on rough text and tone
   */
  async generateEmail(originalText: string, tone: EmailTone): Promise<string> {
    // TODO: Integrate with IBM Watson AI or OpenAI
    // For now, using template-based generation
    
    const toneInstructions = this.getToneInstructions(tone);
    
    // Simulate AI processing
    const generatedEmail = this.templateBasedGeneration(originalText, tone);
    
    return generatedEmail;
  }

  /**
   * Generate subject line from email content
   */
  async generateSubject(emailContent: string): Promise<string> {
    // Extract key points and create subject
    const words = emailContent.split(' ').slice(0, 50).join(' ');
    const sentences = words.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim() || 'Email';
    
    // Create concise subject (max 60 chars)
    let subject = firstSentence.substring(0, 60);
    if (firstSentence.length > 60) {
      subject += '...';
    }
    
    return subject;
  }

  /**
   * Shorten email while maintaining key points
   */
  async shortenEmail(emailContent: string): Promise<string> {
    const sentences = emailContent.split(/[.!?]/).filter(s => s.trim());
    
    // Keep first sentence, key points, and closing
    const shortened = [
      sentences[0],
      ...sentences.slice(1, -1).filter((_, i) => i % 2 === 0),
      sentences[sentences.length - 1]
    ].join('. ') + '.';
    
    return shortened;
  }

  /**
   * Expand email with more details and professional language
   */
  async expandEmail(emailContent: string, tone: EmailTone): Promise<string> {
    const sentences = emailContent.split(/[.!?]/).filter(s => s.trim());
    
    const expanded = sentences.map((sentence, index) => {
      const trimmed = sentence.trim();
      if (index === 0) {
        return this.addGreeting(trimmed, tone);
      } else if (index === sentences.length - 1) {
        return this.addClosing(trimmed, tone);
      } else {
        return this.expandSentence(trimmed, tone);
      }
    }).join('\n\n');
    
    return expanded;
  }

  /**
   * Fix grammar and improve writing
   */
  async fixGrammar(emailContent: string): Promise<string> {
    // Basic grammar fixes
    let fixed = emailContent;
    
    // Capitalize first letter of sentences
    fixed = fixed.replace(/(^\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
    
    // Fix common issues
    fixed = fixed.replace(/\s+/g, ' '); // Multiple spaces
    fixed = fixed.replace(/\s+([.,!?])/g, '$1'); // Space before punctuation
    fixed = fixed.replace(/([.,!?])(\w)/g, '$1 $2'); // Missing space after punctuation
    fixed = fixed.replace(/i\s/gi, 'I '); // Lowercase 'i'
    fixed = fixed.replace(/\bi\b/g, 'I'); // Standalone 'i'
    
    return fixed.trim();
  }

  // Helper methods
  private getToneInstructions(tone: EmailTone): string {
    const instructions = {
      formal: 'Use professional language, proper salutations, and formal structure.',
      friendly: 'Use warm, approachable language while maintaining professionalism.',
      urgent: 'Emphasize time-sensitivity and importance with clear action items.',
      casual: 'Use relaxed, conversational tone while staying professional.',
    };
    return instructions[tone];
  }

  private templateBasedGeneration(text: string, tone: EmailTone): string {
    const greeting = this.getGreeting(tone);
    const closing = this.getClosing(tone);
    
    // Clean and structure the text
    const body = this.structureBody(text, tone);
    
    return `${greeting}\n\n${body}\n\n${closing}`;
  }

  private getGreeting(tone: EmailTone): string {
    const greetings = {
      formal: 'Dear [Recipient],',
      friendly: 'Hi [Recipient],',
      urgent: 'Dear [Recipient],\n\nURGENT:',
      casual: 'Hey [Recipient],',
    };
    return greetings[tone];
  }

  private getClosing(tone: EmailTone): string {
    const closings = {
      formal: 'Best regards,\n[Your Name]',
      friendly: 'Best,\n[Your Name]',
      urgent: 'Please respond at your earliest convenience.\n\nBest regards,\n[Your Name]',
      casual: 'Thanks,\n[Your Name]',
    };
    return closings[tone];
  }

  private structureBody(text: string, tone: EmailTone): string {
    // Clean the text
    let body = text.trim();
    
    // Add professional structure based on tone
    if (tone === 'formal') {
      body = `I hope this email finds you well.\n\n${body}\n\nThank you for your time and consideration.`;
    } else if (tone === 'urgent') {
      body = `${body}\n\nThis matter requires immediate attention.`;
    } else if (tone === 'friendly') {
      body = `I hope you're doing well!\n\n${body}`;
    }
    
    return body;
  }

  private addGreeting(sentence: string, tone: EmailTone): string {
    const greeting = this.getGreeting(tone);
    return `${greeting}\n\n${sentence}.`;
  }

  private addClosing(sentence: string, tone: EmailTone): string {
    const closing = this.getClosing(tone);
    return `${sentence}.\n\n${closing}`;
  }

  private expandSentence(sentence: string, tone: EmailTone): string {
    // Add context and details
    const expansions = {
      formal: `${sentence}. This is an important matter that requires your attention.`,
      friendly: `${sentence}. I'd really appreciate your help with this.`,
      urgent: `${sentence}. Time is of the essence here.`,
      casual: `${sentence}. Let me know what you think.`,
    };
    return expansions[tone];
  }
}

export const aiService = new AIService();
export default aiService;
