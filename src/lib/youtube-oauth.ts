import { google } from 'googleapis'

export const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/youtube/callback`
)

export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
]

export function generateAuthUrl(state: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: YOUTUBE_SCOPES,
    state,
    prompt: 'consent', // Force consent screen to get refresh token
    include_granted_scopes: true,
  })
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function getChannelInfo(accessToken: string, refreshToken: string) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

  const response = await youtube.channels.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    mine: true,
  })

  const channel = response.data.items?.[0]

  if (!channel) {
    throw new Error('No YouTube channel found for this account')
  }

  return {
    channelId: channel.id!,
    channelName: channel.snippet?.title || '',
    channelUrl: `https://www.youtube.com/channel/${channel.id}`,
    subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
    customUrl: channel.snippet?.customUrl,
    thumbnail: channel.snippet?.thumbnails?.default?.url,
  }
}

export async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })

  const { credentials } = await oauth2Client.refreshAccessToken()
  return credentials
}
