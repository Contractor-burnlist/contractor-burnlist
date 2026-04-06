const BASE_URL = 'https://www.contractorburnlist.com'

function wrap(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;"><tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:#111111;padding:20px 24px;border-radius:8px 8px 0 0;">
<span style="color:white;font-size:16px;font-weight:800;letter-spacing:1px;">CONTRACTOR BURNLIST</span>
</td></tr>
<tr><td style="background:white;padding:32px 24px;border-radius:0 0 8px 8px;">
${body}
</td></tr>
<tr><td style="padding:16px 24px;text-align:center;">
<p style="color:#9ca3af;font-size:11px;margin:0;">&copy; 2026 Contractor Burnlist. You're receiving this because it directly affects your account.</p>
<p style="color:#9ca3af;font-size:11px;margin:4px 0 0;">This is a transactional email related to your account activity. To stop all emails, you may delete your account.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

function button(text: string, href: string) {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:#DC2626;border-radius:6px;padding:12px 24px;">
<a href="${href}" style="color:white;text-decoration:none;font-size:14px;font-weight:600;">${text}</a>
</td></tr></table>`
}

export function welcomeEmail() {
  return {
    subject: "You're in — welcome to Contractor Burnlist",
    html: wrap(`
<p style="color:#111;font-size:15px;margin:0 0 16px;">Hey,</p>
<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">Your account is set up. Here's what you can do:</p>
<p style="color:#374151;font-size:14px;line-height:1.8;margin:0 0 4px;">→ Search the database to vet customers and workers before you commit</p>
<p style="color:#374151;font-size:14px;line-height:1.8;margin:0 0 4px;">→ Submit feedback on bad actors to protect fellow contractors</p>
<p style="color:#374151;font-size:14px;line-height:1.8;margin:0 0 16px;">→ Complete your profile to build your trust score</p>
${button('Go to Dashboard', `${BASE_URL}/dashboard`)}
<p style="color:#6b7280;font-size:13px;margin:0 0 16px;">That's it. We won't spam you. You'll only hear from us when something directly affects your account.</p>
<p style="color:#374151;font-size:14px;margin:0;">— Contractor Burnlist</p>
`),
  }
}

export function disputeFiledEmail(reason: string) {
  return {
    subject: 'A dispute has been filed on feedback you submitted',
    html: wrap(`
<p style="color:#111;font-size:15px;margin:0 0 16px;">Hey,</p>
<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">Someone has filed a dispute on feedback you submitted on Contractor Burnlist.</p>
<p style="color:#374151;font-size:14px;margin:0 0 4px;"><strong>Dispute reason:</strong> ${reason}</p>
<p style="color:#374151;font-size:14px;line-height:1.6;margin:16px 0;">
<strong>What this means:</strong> The disputed feedback will be reviewed by our team. No action is required from you at this time. If we need additional information, we'll reach out.
</p>
<p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 16px;">
<em>As a reminder, all feedback submitted on Contractor Burnlist should be truthful and based on your firsthand experience. Submitting knowingly false information may expose you to legal liability.</em>
</p>
${button('View Your Dashboard', `${BASE_URL}/dashboard`)}
<p style="color:#374151;font-size:14px;margin:0;">— Contractor Burnlist</p>
`),
  }
}

export function disputeReviewedEmail(outcome: 'dismissed' | 'action_taken', date: string, notes?: string) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  if (outcome === 'dismissed') {
    return {
      subject: 'Update on your dispute — Contractor Burnlist',
      html: wrap(`
<p style="color:#111;font-size:15px;margin:0 0 16px;">Hello,</p>
<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">We've reviewed your dispute submitted on ${formattedDate}.</p>
<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
After review, we have determined that no action is warranted at this time. The feedback in question reflects the personal opinion and experience of the submitting contractor, and Contractor Burnlist does not adjudicate the truth of individual submissions.
</p>
<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
If you believe the feedback contains defamatory statements, you may wish to consult with a licensed attorney regarding your legal options.
</p>
<p style="color:#6b7280;font-size:13px;margin:0 0 16px;">For more information, see our <a href="${BASE_URL}/terms" style="color:#DC2626;">Terms &amp; Conditions</a>.</p>
<p style="color:#374151;font-size:14px;margin:0;">— Contractor Burnlist</p>
`),
    }
  }

  return {
    subject: 'Update on your dispute — Contractor Burnlist',
    html: wrap(`
<p style="color:#111;font-size:15px;margin:0 0 16px;">Hello,</p>
<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">We've reviewed your dispute submitted on ${formattedDate}.</p>
<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">After review, we have taken action on the feedback in question.</p>
${notes ? `<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;padding:12px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;">${notes}</p>` : ''}
<p style="color:#374151;font-size:14px;margin:0 0 16px;">Thank you for bringing this to our attention.</p>
<p style="color:#374151;font-size:14px;margin:0;">— Contractor Burnlist</p>
`),
  }
}
