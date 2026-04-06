/**
 * Email utility using Resend.
 *
 * SETUP STEPS:
 * 1. Create a free account at https://resend.com
 * 2. Go to Domains → Add Domain → add contractorburnlist.com
 * 3. Add the DNS records Resend provides (SPF, DKIM, DMARC)
 * 4. Wait for domain verification
 * 5. Go to API Keys → Create API Key
 * 6. Add RESEND_API_KEY to your .env.local and Vercel env vars
 */

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.warn(`[email] No RESEND_API_KEY — would send to ${to}: "${subject}"`)
    return
  }

  try {
    await resend.emails.send({
      from: 'Contractor Burnlist <noreply@contractorburnlist.com>',
      to,
      subject,
      html,
    })
  } catch (err: any) {
    console.error('[email] Send failed:', err.message)
  }
}
