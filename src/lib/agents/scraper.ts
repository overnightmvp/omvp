/**
 * YouTube video scraper using Apify
 *
 * Fetches video metadata and transcripts from YouTube via Apify's YouTube Scraper actor.
 * Uses the streamers/youtube-scraper actor to avoid YouTube API quota limits.
 */

import { ApifyClient } from 'apify-client';
import type { ScrapedVideoData, ApifyScraperOptions } from './types';

/**
 * Validates if a URL is a valid YouTube URL
 */
function isValidYouTubeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check if it's a YouTube domain
    if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
      return false;
    }

    // Check if it has a video ID (either in v param or path for youtu.be)
    const videoId = parsedUrl.searchParams.get('v') ||
                    (hostname.includes('youtu.be') ? parsedUrl.pathname.slice(1) : null);

    return !!videoId && videoId.length > 0;
  } catch {
    return false;
  }
}

/**
 * Interface for Apify YouTube scraper response
 */
interface ApifyVideoResult {
  title: string;
  description: string;
  viewCount: number;
  subtitles?: string | null;
  channelName: string;
  publishedAt: string;
}

/**
 * Scrapes a YouTube video using Apify
 *
 * @param videoUrl - The YouTube video URL to scrape
 * @param options - Optional scraper configuration
 * @returns Scraped video data including metadata and transcript
 * @throws Error if URL is invalid, API token is missing, or scraping fails
 */
export async function scrapeYouTubeVideo(
  videoUrl: string,
  options: ApifyScraperOptions = {}
): Promise<ScrapedVideoData> {
  // Validate API token
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    throw new Error('APIFY_API_TOKEN environment variable is required');
  }

  // Validate YouTube URL
  if (!isValidYouTubeUrl(videoUrl)) {
    throw new Error('Invalid YouTube URL');
  }

  // Initialize Apify client
  const client = new ApifyClient({
    token: apiToken,
  });

  try {
    // Configure scraper input
    const input = {
      startUrls: [{ url: videoUrl }],
      maxResults: options.maxResults || 1,
      subtitlesLanguage: options.subtitlesLanguage || 'en',
      subtitlesFormat: 'text',
    };

    // Run the YouTube scraper actor
    const run = await client.actor('streamers/youtube-scraper').call(input);

    // Fetch results from the dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Validate we got data
    if (!items || items.length === 0) {
      throw new Error('No data returned from Apify');
    }

    // Extract the first video result
    const videoData = items[0] as unknown as ApifyVideoResult;

    // Map to our ScrapedVideoData interface
    const scrapedData: ScrapedVideoData = {
      title: videoData.title,
      description: videoData.description,
      viewCount: videoData.viewCount,
      transcript: videoData.subtitles || null,
      channelName: videoData.channelName,
      publishedDate: videoData.publishedAt,
    };

    return scrapedData;
  } catch (error) {
    // Re-throw validation errors as-is
    if (error instanceof Error &&
        (error.message.includes('Invalid YouTube URL') ||
         error.message.includes('No data returned') ||
         error.message.includes('APIFY_API_TOKEN'))) {
      throw error;
    }

    // Wrap other errors with context
    throw new Error(
      `Failed to scrape YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Export ApifyClient for external use if needed
 */
export { ApifyClient };
