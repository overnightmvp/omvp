/**
 * Tests for YouTube video scraper using Apify
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapeYouTubeVideo } from '../../../src/lib/agents/scraper';
import type { ScrapedVideoData } from '../../../src/lib/agents/types';

// Mock the Apify client
vi.mock('apify-client', () => {
  const mockDataset = {
    listItems: vi.fn(),
  };

  const mockActor = {
    call: vi.fn(),
  };

  class MockApifyClient {
    constructor() {}
    actor() {
      return mockActor;
    }
    dataset() {
      return mockDataset;
    }
  }

  return {
    ApifyClient: MockApifyClient,
    _mockActor: mockActor,
    _mockDataset: mockDataset,
  };
});

describe('scrapeYouTubeVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return video metadata with valid URL', async () => {
    // Arrange
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const mockApifyResponse = {
      items: [
        {
          title: 'How to Build Authority Online',
          description: 'Learn the secrets to building online authority',
          viewCount: 150000,
          subtitles: 'This is a test transcript with all the video content.',
          channelName: 'Authority Channel',
          publishedAt: '2024-01-15T10:00:00Z',
        },
      ],
    };

    // Mock Apify client behavior
    const { ApifyClient, _mockActor, _mockDataset } = await import('apify-client');
    _mockActor.call.mockResolvedValueOnce({ defaultDatasetId: 'test-dataset-id' });
    _mockDataset.listItems.mockResolvedValueOnce(mockApifyResponse);

    // Act
    const result = await scrapeYouTubeVideo(videoUrl);

    // Assert
    expect(result).toBeDefined();
    expect(result.title).toBe('How to Build Authority Online');
    expect(result.description).toBe('Learn the secrets to building online authority');
    expect(result.viewCount).toBe(150000);
    expect(result.channelName).toBe('Authority Channel');
    expect(result.publishedDate).toBe('2024-01-15T10:00:00Z');
  });

  it('should return English transcript as plaintext with valid URL', async () => {
    // Arrange
    const videoUrl = 'https://www.youtube.com/watch?v=test123';

    const mockApifyResponse = {
      items: [
        {
          title: 'Test Video',
          description: 'Test description',
          viewCount: 1000,
          subtitles: 'This is the English transcript content. It should be returned as plain text.',
          channelName: 'Test Channel',
          publishedAt: '2024-01-01T00:00:00Z',
        },
      ],
    };

    const { _mockActor, _mockDataset } = await import('apify-client');
    _mockActor.call.mockResolvedValueOnce({ defaultDatasetId: 'test-dataset-id' });
    _mockDataset.listItems.mockResolvedValueOnce(mockApifyResponse);

    // Act
    const result = await scrapeYouTubeVideo(videoUrl);

    // Assert
    expect(result.transcript).toBe('This is the English transcript content. It should be returned as plain text.');
    expect(typeof result.transcript).toBe('string');
  });

  it('should throw descriptive error with invalid URL', async () => {
    // Arrange
    const invalidUrl = 'not-a-youtube-url';

    // Act & Assert
    await expect(scrapeYouTubeVideo(invalidUrl)).rejects.toThrow('Invalid YouTube URL');
  });

  it('should handle videos without transcripts gracefully', async () => {
    // Arrange
    const videoUrl = 'https://www.youtube.com/watch?v=notranscript';

    const mockApifyResponse = {
      items: [
        {
          title: 'Video Without Transcript',
          description: 'No subtitles available',
          viewCount: 500,
          subtitles: null, // No transcript available
          channelName: 'No Transcript Channel',
          publishedAt: '2024-02-01T00:00:00Z',
        },
      ],
    };

    const { _mockActor, _mockDataset } = await import('apify-client');
    _mockActor.call.mockResolvedValueOnce({ defaultDatasetId: 'test-dataset-id' });
    _mockDataset.listItems.mockResolvedValueOnce(mockApifyResponse);

    // Act
    const result = await scrapeYouTubeVideo(videoUrl);

    // Assert
    expect(result.transcript).toBeNull();
    expect(result.title).toBe('Video Without Transcript');
    expect(result.viewCount).toBe(500);
  });

  it('should throw error when Apify returns no data', async () => {
    // Arrange
    const videoUrl = 'https://www.youtube.com/watch?v=nodata';

    const mockApifyResponse = {
      items: [],
    };

    const { _mockActor, _mockDataset } = await import('apify-client');
    _mockActor.call.mockResolvedValueOnce({ defaultDatasetId: 'test-dataset-id' });
    _mockDataset.listItems.mockResolvedValueOnce(mockApifyResponse);

    // Act & Assert
    await expect(scrapeYouTubeVideo(videoUrl)).rejects.toThrow('No data returned from Apify');
  });

  it('should throw error when APIFY_API_TOKEN is missing', async () => {
    // Arrange
    const videoUrl = 'https://www.youtube.com/watch?v=test';
    const originalToken = process.env.APIFY_API_TOKEN;
    delete process.env.APIFY_API_TOKEN;

    // Act & Assert
    await expect(scrapeYouTubeVideo(videoUrl)).rejects.toThrow('APIFY_API_TOKEN environment variable is required');

    // Cleanup
    if (originalToken) {
      process.env.APIFY_API_TOKEN = originalToken;
    }
  });
});
