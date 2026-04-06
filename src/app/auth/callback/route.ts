import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email-templates'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if this is a new user and send welcome email (fire-and-forget)
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const admin = await createServiceClient()
        const { data: profile } = await admin.from('profiles').select('welcome_email_sent').eq('id', user.id).single()
        if (profile && !profile.welcome_email_sent) {
          const email = welcomeEmail()
          sendEmail({ to: user.email, subject: email.subject, html: email.html }).catch(() => {})
          admin.from('profiles').update({ welcome_email_sent: true }).eq('id', user.id).then(() => {})
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=true`)
}
