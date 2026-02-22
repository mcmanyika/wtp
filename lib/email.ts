import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'DC <onboarding@resend.dev>'
const APP_NAME = 'Diaspora Connect'
const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dcpzim.com'

// ─── Welcome Email ────────────────────────────────────────────────
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string
  name: string
}) {
  const firstName = name.split(' ')[0] || name

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Welcome to ${APP_NAME}!`,
      html: buildWelcomeEmailHtml({ firstName, name }),
    })

    if (error) {
      console.error('Resend error sending welcome email:', error)
      return { success: false, error }
    }

    console.log('Welcome email sent successfully:', data?.id)
    return { success: true, id: data?.id }
  } catch (err: any) {
    console.error('Failed to send welcome email:', err)
    return { success: false, error: err.message }
  }
}

// ─── Generic / Custom Email ──────────────────────────────────────
export async function sendCustomEmail({
  to,
  name,
  subject,
  body,
}: {
  to: string
  name: string
  subject: string
  body: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html: buildCustomEmailHtml({ name, subject, body }),
    })

    if (error) {
      console.error('Resend error sending custom email:', error)
      return { success: false, error }
    }

    console.log('Custom email sent successfully:', data?.id)
    return { success: true, id: data?.id }
  } catch (err: any) {
    console.error('Failed to send custom email:', err)
    return { success: false, error: err.message }
  }
}

function buildCustomEmailHtml({ name, subject, body }: { name: string; subject: string; body: string }) {
  // Convert newlines to <br> for plain-text body
  const htmlBody = body.replace(/\n/g, '<br />')
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:#ffffff;border-radius:12px;width:60px;height:60px;line-height:60px;text-align:center;font-weight:800;font-size:24px;color:#0f172a;">DC</div>
              <h1 style="color:#ffffff;font-size:22px;margin:16px 0 0;font-weight:700;">
                ${APP_NAME}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;">
              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
                Dear <strong style="color:#0f172a;">${name}</strong>,
              </p>
              <div style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
                ${htmlBody}
              </div>
              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 4px;">
                Warm regards,
              </p>
              <p style="color:#0f172a;font-size:15px;line-height:1.5;margin:0 0 2px;">
                <strong>Diaspora Connect</strong>
              </p>
              <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0;">
                <a href="${APP_URL}" style="color:#0f172a;text-decoration:underline;">www.dcpzim.com</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f1f5f9;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// ─── HTML Template Builder ────────────────────────────────────────
function buildWelcomeEmailHtml({
  firstName,
  name,
}: {
  firstName: string
  name: string
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Diaspora Connect</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:#ffffff;border-radius:12px;width:60px;height:60px;line-height:60px;text-align:center;font-weight:800;font-size:24px;color:#0f172a;">DC</div>
              <h1 style="color:#ffffff;font-size:22px;margin:16px 0 0;font-weight:700;">
                Diaspora Connect
              </h1>
              <p style="color:#94a3b8;font-size:13px;margin:6px 0 0;">
                Zimbabwe's Diaspora Intelligence Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;">
              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
                Dear <strong style="color:#0f172a;">${name}</strong>,
              </p>
              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
                Thank you for joining <strong>Diaspora Connect (DC)</strong>.
              </p>
              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
                By choosing to become part of this Platform, you have joined a community committed to a simple but profound mission: <strong style="color:#0f172a;">connecting Zimbabwe and its global diaspora for structured, scalable national development.</strong>
              </p>
              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
                DC is a digital platform designed to connect Zimbabwe and its global diaspora through trusted information, verified services, and structured economic and civic participation. Our content is powered by expert podcast interviews with bankers, lawyers, policymakers, investors, and industry leaders &mdash; transformed into actionable guides, directories, and services.
              </p>

              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 12px;">
                Your membership strengthens a collective effort to:
              </p>

              <!-- Bullet Points -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;vertical-align:top;color:#10b981;font-size:16px;">&#8226;</td>
                        <td style="color:#334155;font-size:14px;line-height:1.6;">Access expert-verified guides on investment, banking, and property</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;vertical-align:top;color:#10b981;font-size:16px;">&#8226;</td>
                        <td style="color:#334155;font-size:14px;line-height:1.6;">Connect with trusted, vetted service providers</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;vertical-align:top;color:#10b981;font-size:16px;">&#8226;</td>
                        <td style="color:#334155;font-size:14px;line-height:1.6;">Navigate legal, citizenship, and pension matters with confidence</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;vertical-align:top;color:#10b981;font-size:16px;">&#8226;</td>
                        <td style="color:#334155;font-size:14px;line-height:1.6;">Participate in civic engagement and national development from abroad</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
                We encourage you to stay engaged, participate in programmes and dialogues in your community, and share accurate information from our official platforms. The strength of this movement lies not in personalities, but in citizens acting together in defence of a common national covenant.
              </p>

              <!-- Highlight Quote -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-left:4px solid #10b981;padding:16px 20px;background-color:#f0fdf4;border-radius:0 8px 8px 0;">
                    <p style="color:#0f172a;font-size:16px;font-weight:600;font-style:italic;margin:0;">
                      Connecting Zimbabwe and its global citizens for a stronger future.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Your solidarity contribution of <strong style="color:#0f172a;">USD5 per month</strong> or <strong style="color:#0f172a;">USD60 per annum</strong> will help us reach as many of our compatriots at home.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 0 28px;">
                    <a href="${APP_URL}/membership-application" style="display:inline-block;background-color:#0f172a;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                      Apply for Membership &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 4px;">
                Warm regards,
              </p>
              <p style="color:#0f172a;font-size:15px;line-height:1.5;margin:0 0 2px;">
                <strong>Senator Jameson Zvidzai Timba</strong>
              </p>
              <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0 0 2px;">
                Convenor
              </p>
              <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0;">
                Diaspora Connect (DC)
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f1f5f9;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="color:#64748b;font-size:12px;line-height:1.5;margin:0 0 8px;">
                You're receiving this email because you signed up at
                <a href="${APP_URL}" style="color:#0f172a;text-decoration:underline;">${APP_URL.replace('https://', '')}</a>
              </p>
              <p style="color:#94a3b8;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
