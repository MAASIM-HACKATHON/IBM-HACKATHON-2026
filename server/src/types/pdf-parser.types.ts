/**
 * Type definitions for PDF Parser Microservice
 * Matches core/pdf_parse_output_schema.json
 */

export interface PageData {
  page_number: number;
  text: string;
}

export interface ParseResponse {
  file_name: string;
  total_pages: number;
  raw_text: string;
  pages: PageData[];
  status: 'success' | 'failed';
  error: string | null;
}

export interface HealthResponse {
  status: string;
  version: string;
  pymupdf_version: string;
}

export interface PythonParserConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
}

// Made with Bob
