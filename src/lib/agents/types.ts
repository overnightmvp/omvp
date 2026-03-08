/**
 * Type definitions for agent operations
 */

/**
 * Scraped video data from Apify YouTube scraper
 */
export interface ScrapedVideoData {
  title: string;
  description: string;
  viewCount: number;
  transcript: string | null;
  channelName: string;
  publishedDate: string;
}

/**
 * Options for Apify YouTube scraper
 */
export interface ApifyScraperOptions {
  subtitlesLanguage?: string;
  maxResults?: number;
}

/**
 * Cleaned transcript output
 */
export interface CleanedTranscript {
  text: string;
  wordCount: number;
}

/**
 * Transformed article content from Claude
 */
export interface TransformedContent {
  headline: string;
  metaDescription: string;
  content: string;
  sections: ArticleSection[];
  faq?: FAQItem[];
}

/**
 * Article section structure
 */
export interface ArticleSection {
  heading: string;
  content: string;
}

/**
 * FAQ item structure
 */
export interface FAQItem {
  question: string;
  answer: string;
}
