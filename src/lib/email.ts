import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Authority Platform <noreply@yourdomain.com>',
      to,
      subject,
      html,
    })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

export async function sendPageReadyEmail(
  to: string,
  pageUrl: string,
  videoTitle: string
) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #E8FF47; background: #0A0A0A; padding: 20px; text-align: center;">
        Your SEO Page is Ready! 🎉
      </h1>
      <div style="padding: 20px; background: #141414; color: #fff;">
        <p>Great news! We've generated your SEO-optimized page from:</p>
        <p style="font-weight: bold; font-size: 18px; margin: 20px 0;">
          "${videoTitle}"
        </p>
        <p>Your page is now live and ready to attract search traffic.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a
            href="${pageUrl}"
            style="
              display: inline-block;
              background: #E8FF47;
              color: #0A0A0A;
              padding: 15px 40px;
              text-decoration: none;
              font-weight: bold;
              border-radius: 8px;
            "
          >
            View Your Page
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          This is your free page. Want to generate more? Upgrade to a paid plan.
        </p>
      </div>
    </div>
  `

  return sendEmail({
    to,
    subject: 'Your SEO Page is Ready!',
    html,
  })
}

export async function sendGenerationFailedEmail(
  to: string,
  videoTitle: string,
  errorMessage: string
) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #FF3B5C; background: #0A0A0A; padding: 20px; text-align: center;">
        Page Generation Failed
      </h1>
      <div style="padding: 20px; background: #141414; color: #fff;">
        <p>We encountered an issue generating your page from:</p>
        <p style="font-weight: bold; font-size: 18px; margin: 20px 0;">
          "${videoTitle}"
        </p>
        <p style="color: #FF3B5C;">Error: ${errorMessage}</p>
        <p>Our team has been notified. Please contact support if this persists.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a
            href="mailto:support@yourdomain.com"
            style="
              display: inline-block;
              background: #E8FF47;
              color: #0A0A0A;
              padding: 15px 40px;
              text-decoration: none;
              font-weight: bold;
              border-radius: 8px;
            "
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  `

  return sendEmail({
    to,
    subject: 'Page Generation Failed',
    html,
  })
}