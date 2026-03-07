import { google } from 'googleapis'
import { oauth2Client } from './youtube-oauth'

export async function getMostPopularVideo(
  accessToken: string,
  refreshToken: string,
  channelId: string
) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

  // Search for videos from this channel, ordered by view count
  const response = await youtube.search.list({
    part: ['snippet'],
    channelId,
    order: 'viewCount',
    type: ['video'],
    maxResults: 1,
  })

  const video = response.data.items?.[0]

  if (!video || !video.id?.videoId) {
    throw new Error('No videos found on this channel')
  }

  // Get detailed video stats
  const videoDetails = await youtube.videos.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    id: [video.id.videoId],
  })

  const videoData = videoDetails.data.items?.[0]

  return {
    videoId: video.id.videoId,
    title: videoData?.snippet?.title || '',
    description: videoData?.snippet?.description || '',
    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
    viewCount: parseInt(videoData?.statistics?.viewCount || '0'),
    publishedAt: videoData?.snippet?.publishedAt || '',
  }
}

export async function getChannelVideos(
  accessToken: string,
  refreshToken: string,
  channelId: string,
  maxResults: number = 10
) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

  const response = await youtube.search.list({
    part: ['snippet'],
    channelId,
    order: 'date',
    type: ['video'],
    maxResults,
  })

  return (
    response.data.items?.map((item) => ({
      videoId: item.id?.videoId || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.default?.url || '',
      publishedAt: item.snippet?.publishedAt || '',
    })) || []
  )
}
