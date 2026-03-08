/**
 * Email Notification Utility
 *
 * Sends email notifications to users when their pages are ready or if generation fails.
 * Uses Resend API for email delivery with branded HTML templates.
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailResult {
  success: boolean
  data?: any
  error?: string
}

export interface PageData {
  url: string
  headline: string
  slug: string
}

/**
 * Send email notification when page generation is complete
 *
 * @param userEmail - User's email address
 * @param pageData - Published page details (url, headline, slug)
 * @returns Result object with success status
 */
export async function sendPageReadyEmail(
  userEmail: string,
  pageData: PageData
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A0A0A; margin-bottom: 20px;">Your SEO page has been published!</h2>
        <p style="font-size: 18px; font-weight: 600; color: #0A0A0A;">
          <strong>${pageData.headline}</strong>
        </p>
        <p style="color: #333; line-height: 1.6;">
          Your page is now live and ready to be indexed by Google.
        </p>
        <a
          href="${pageData.url}"
          style="
            background: #E8FF47;
            color: #0A0A0A;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
            font-weight: 600;
          "
        >
          View Your Page
        </a>
        <p style="color: #0A0A0A; margin-top: 30px; font-weight: 600;">Next steps:</p>
        <ul style="color: #333; line-height: 1.8;">
          <li>Share on social media to build initial traffic</li>
          <li>Submit to Google Search Console for faster indexing</li>
          <li>Consider upgrading for more pages and templates</li>
        </ul>
        <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
          Powered by Authority Platform
        </p>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'Authority Platform <noreply@authorityplatform.com>',
      to: userEmail,
      subject: `Your SEO page is ready: ${pageData.headline}`,
      html,
    })

    if (error) {
      console.error('Resend API error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending page ready email:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}

/**
 * Send email notification when page generation fails
 *
 * @param userEmail - User's email address
 * @param errorMessage - Error message describing what went wrong
 * @returns Result object with success status
 */
export async function sendPageFailedEmail(
  userEmail: string,
  errorMessage: string
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF3B5C; margin-bottom: 20px;">Page generation failed</h2>
        <p style="color: #333; line-height: 1.6;">
          We encountered an issue while generating your SEO page.
        </p>
        <div style="
          background: #FFF3F5;
          border-left: 4px solid #FF3B5C;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        ">
          <p style="color: #333; margin: 0; font-family: monospace; font-size: 14px;">
            ${errorMessage}
          </p>
        </div>
        <p style="color: #333; line-height: 1.6;">
          Our team has been notified. We'll investigate and resolve this issue.
        </p>
        <a
          href="mailto:support@authorityplatform.com"
          style="
            background: #E8FF47;
            color: #0A0A0A;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
            font-weight: 600;
          "
        >
          Contact Support
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
          Powered by Authority Platform
        </p>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'Authority Platform <noreply@authorityplatform.com>',
      to: userEmail,
      subject: 'Page generation failed',
      html,
    })

    if (error) {
      console.error('Resend API error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending page failed email:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}
