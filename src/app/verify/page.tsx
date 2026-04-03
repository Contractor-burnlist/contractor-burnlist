'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TRADE_OPTIONS = [
  'Plumbing', 'Electrical', 'HVAC', 'Painting', 'Cleaning',
  'General Contractor', 'Roofing', 'Landscaping', 'Flooring',
  'Handyman', 'Demolition', 'Fencing', 'Concrete', 'Drywall',
  'Pest Control', 'Tree Service', 'Pressure Washing', 'Garage Door',
  'Locksmith', 'Appliance Repair', 'Other',
]

function isValidGbpUrl(url: string): boolean {
  return /google\.com\/maps|maps\.google\.com|business\.google\.com|goo\.gl\/maps/i.test(url)
}

type Profile = {
  is_verified: boolean
  business_name: string | null
  google_business_url: string | null
  business_phone: string | null
  trade: string | null
  trust_score: number
}

export default function VerifyPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    business_name: '',
    google_business_url: '',
    business_phone: '',
    trade: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login?next=/verify')
        return
      }
      supabase
        .from('profiles')
        .select('is_verified, business_name, google_business_url, business_phone, trade, trust_score')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setProfile(data as Profile | null)
          setLoading(false)
        })
    })
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isValidGbpUrl(form.google_business_url)) {
      setError('Please enter a valid Google Business Profile URL (e.g. google.com/maps/...)')
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login?next=/verify'); return }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        business_name: form.business_name,
        google_business_url: form.google_business_url,
        business_phone: form.business_phone || null,
        trade: form.trade,
        is_verified: true,
        verified_at: new Date().toISOString(),
        trust_score: Math.min((profile?.trust_score ?? 1) + 2, 5),
      })
      .eq('id', user.id)

    setSubmitting(false)

    if (updateErr) {
      setError('Something went wrong. Please try again.')
      return
    }

    setSuccess(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#DC2626]" />
      </div>
    )
  }

  // Already verified
  if (profile?.is_verified && !success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-green-200 bg-green-50 p-10">
          <div className="mb-4 flex justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-green-600">
              <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.15"/>
              <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-black text-[#111111]">Your Business is Verified!</h2>
          <p className="mb-4 text-[#6b7280]">Your reports display a Verified badge, giving them extra credibility in the registry.</p>
          {profile.business_name && <p className="text-sm font-semibold text-[#111111]">{profile.business_name}</p>}
          {profile.trade && <p className="text-sm text-[#6b7280]">{profile.trade}</p>}
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/submit" className="rounded bg-[#DC2626] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
              Submit a Report
            </Link>
            <Link href="/dashboard" className="rounded border border-[#e5e7eb] px-6 py-2.5 text-sm font-semibold text-[#6b7280] transition-colors hover:border-[#d1d5db] hover:text-[#111111]">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state after verification
  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-green-200 bg-green-50 p-10">
          <div className="mb-4 flex justify-center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-green-600">
              <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.15"/>
              <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-black text-green-800">You&apos;re Verified!</h2>
          <p className="mb-1 text-[#6b7280]">All your future reports will carry the</p>
          <span className="inline-flex items-center gap-1 rounded border border-green-300 bg-green-50 px-3 py-1 text-sm font-semibold text-green-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-green-600">
              <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.15"/>
              <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Verified Report
          </span>
          <p className="mt-4 text-sm text-[#6b7280]">badge, giving them extra credibility in the registry.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/submit" className="rounded bg-[#DC2626] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
              Submit a Report
            </Link>
            <Link href="/dashboard" className="rounded border border-[#e5e7eb] px-6 py-2.5 text-sm font-semibold text-[#6b7280] transition-colors hover:border-[#d1d5db] hover:text-[#111111]">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Not yet verified — pitch + form
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="mb-4 flex justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-green-600">
            <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.15"/>
            <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="mb-2 text-3xl font-black text-[#111111]">Get the Verified Badge</h1>
        <p className="text-[#6b7280]">
          Link your Google Business Profile to earn a verified badge on all your reports.
          Verified reports carry more weight in the registry and show other contractors you&apos;re legit.
        </p>
      </div>

      {/* Benefits */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: '🛡️', text: 'Verified badge on all your submissions' },
          { icon: '📈', text: 'Higher trust score' },
          { icon: '⭐', text: 'Stand out in the registry' },
        ].map((b) => (
          <div key={b.text} className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <div className="mb-2 text-2xl">{b.icon}</div>
            <p className="text-xs font-medium text-green-800">{b.text}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
          <h2 className="mb-5 text-lg font-bold text-[#111111]">Business Details</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Business Name <span className="text-[#DC2626]">*</span></label>
              <input name="business_name" value={form.business_name} onChange={handleChange} required placeholder="e.g. Pipe Dream Plumbing Co." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Google Business Profile URL <span className="text-[#DC2626]">*</span></label>
              <input name="google_business_url" value={form.google_business_url} onChange={handleChange} required placeholder="https://google.com/maps/place/..." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-green-500" />
              <p className="mt-1 text-xs text-[#9ca3af]">Find your business on Google Maps and paste the URL here</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Business Phone</label>
              <input name="business_phone" value={form.business_phone} onChange={handleChange} type="tel" placeholder="(555) 123-4567" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Trade / Service <span className="text-[#DC2626]">*</span></label>
              <select name="trade" value={form.trade} onChange={handleChange} required className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-green-500">
                <option value="">Select your trade</option>
                {TRADE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="w-full rounded bg-green-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50">
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Verifying...
            </span>
          ) : 'Request Verification'}
        </button>
      </form>
    </div>
  )
}
