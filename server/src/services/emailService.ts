// Email Service - Business logic for email operations

import prisma from '../lib/prisma';
import aiService from './aiService';
import { EmailTone, EmailAction, EmailGenerationRequest } from '../types/email.types';

class EmailService {
  /**
   * Process email generation request
   */
  async processEmail(request: EmailGenerationRequest) {
    const { originalText, tone, action, userId, subject } = request;

    let generatedEmail = '';
    let generatedSubject = subject;

    try {
      // Process based on action type
      switch (action) {
        case 'generate':
          generatedEmail = await aiService.generateEmail(originalText, tone);
          generatedSubject = await aiService.generateSubject(generatedEmail);
          break;

        case 'shorten':
          generatedEmail = await aiService.shortenEmail(originalText);
          break;

        case 'expand':
          generatedEmail = await aiService.expandEmail(originalText, tone);
          break;

        case 'fix_grammar':
          generatedEmail = await aiService.fixGrammar(originalText);
          break;

        case 'generate_subject':
          generatedSubject = await aiService.generateSubject(originalText);
          generatedEmail = originalText;
          break;

        default:
          throw new Error('Invalid action type');
      }

      // Save to database if userId provided
      if (userId) {
        await this.saveEmailHistory({
          userId,
          originalText,
          generatedEmail,
          subject: generatedSubject || null,
          tone,
          action,
        });
      }

      // Calculate word counts
      const wordCount = {
        original: originalText.split(/\s+/).length,
        generated: generatedEmail.split(/\s+/).length,
      };

      return {
        success: true,
        data: {
          generatedEmail,
          subject: generatedSubject,
          originalText,
          tone,
          action,
          wordCount,
        },
      };
    } catch (error) {
      console.error('Email processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process email',
      };
    }
  }

  /**
   * Save email to history
   */
  private async saveEmailHistory(data: {
    userId: number;
    originalText: string;
    generatedEmail: string;
    subject: string | null;
    tone: string;
    action: string;
  }) {
    try {
      await prisma.email.create({
        data,
      });
    } catch (error) {
      console.error('Failed to save email history:', error);
      // Don't throw - history save failure shouldn't break the main flow
    }
  }

  /**
   * Get email history for a user
   */
  async getEmailHistory(userId: number, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [emails, total] = await Promise.all([
        prisma.email.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.email.count({ where: { userId } }),
      ]);

      return {
        success: true,
        data: emails,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Failed to fetch email history:', error);
      return {
        success: false,
        error: 'Failed to fetch email history',
      };
    }
  }

  /**
   * Delete email from history
   */
  async deleteEmail(emailId: number, userId: number) {
    try {
      await prisma.email.deleteMany({
        where: {
          id: emailId,
          userId,
        },
      });

      return {
        success: true,
        message: 'Email deleted successfully',
      };
    } catch (error) {
      console.error('Failed to delete email:', error);
      return {
        success: false,
        error: 'Failed to delete email',
      };
    }
  }
}

export const emailService = new EmailService();
export default emailService;
