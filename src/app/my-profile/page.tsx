'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculateTrustScore, type TrustProfile } from '@/lib/trust-score'

const TRADE_OPTIONS = [
  'Plumbing', 'Electrical', 'HVAC', 'Painting', 'Cleaning',
  'General Contractor', 'Roofing', 'Landscaping', 'Flooring',
  'Handyman', 'Demolition', 'Fencing', 'Concrete', 'Drywall',
  'Pest Control', 'Tree Service', 'Pressure Washing', 'Garage Door',
  'Locksmith', 'Appliance Repair', 'Other',
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

type FullProfile = TrustProfile & {
  email?: string | null
  created_at?: string | null
  city?: string | null
  state?: string | null
  subscription_tier?: string | null
}

export default function MyProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<FullProfile | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasSubmissions, setHasSubmissions] = useState(false)
  const [submissionCount, setSubmissionCount] = useState(0)

  const [form, setForm] = useState({
    business_name: '',
    business_phone: '',
    trade: '',
    city: '',
    state: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login?next=/my-profile'); return }
      setEmail(user.email ?? '')

      const [{ data: prof }, { data: entries }, { data: workerEntries }] = await Promise.all([
        supabase.from('profiles').select('business_name, business_phone, trade, is_verified, subscription_status, subscription_tier, created_at, city, state').eq('id', user.id).single(),
        supabase.from('entries').select('id').eq('submitted_by', user.id).limit(1),
        supabase.from('worker_entries').select('id').eq('submitted_by', user.id).limit(1),
      ])

      const p = prof as FullProfile | null
      setProfile(p)
      const hasSubs = (entries?.length ?? 0) > 0 || (workerEntries?.length ?? 0) > 0
      setHasSubmissions(hasSubs)

      // Get full count
      const [{ count: ec }, { count: wc }] = await Promise.all([
        supabase.from('entries').select('id', { count: 'exact', head: true }).eq('submitted_by', user.id),
        supabase.from('worker_entries').select('id', { count: 'exact', head: true }).eq('submitted_by', user.id),
      ])
      setSubmissionCount((ec ?? 0) + (wc ?? 0))

      setForm({
        business_name: p?.business_name ?? '',
        business_phone: p?.business_phone ?? '',
        trade: p?.trade ?? '',
        city: p?.city ?? '',
        state: p?.state ?? '',
      })
      setLoading(false)
    })
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      business_name: form.business_name || null,
      business_phone: form.business_phone || null,
      trade: form.trade || null,
      city: form.city || null,
      state: form.state || null,
    }).eq('id', user.id)

    setProfile((prev) => prev ? { ...prev, ...form } : prev)
    setSaving(false)
    setSaved(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#DC2626]" />
      </div>
    )
  }

  // Use form values for live trust score calculation
  const liveProfile: TrustProfile = {
    ...profile,
    business_name: form.business_name || null,
    business_phone: form.business_phone || null,
    trade: form.trade || null,
  }
  const trust = calculateTrustScore(liveProfile, hasSubmissions)

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-black text-[#111111]">My Profile</h1>
      <p className="mb-8 text-[#6b7280]">Build your business profile and increase your trust score</p>

      {/* Privacy Guarantee Banner */}
      <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-5">
        <div className="flex gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-blue-600">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div>
            <h3 className="text-sm font-bold text-blue-900">Your Information is Never Shared</h3>
            <p className="mt-1 text-xs leading-relaxed text-blue-800">
              Your business profile is used solely to verify your credibility on the platform.
              Your name, business name, phone number, and contact details are <strong>never displayed publicly</strong> and
              are <strong>never visible</strong> to the customers or workers you report. All reports are submitted anonymously
              — only your trust score and verified badge are visible on your submissions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* LEFT — Trust Score & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trust Score Card */}
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <div className="mb-4 text-center">
              <div className="text-xs text-[#6b7280]">Trust Score</div>
              <div className="mt-1 text-4xl font-black text-[#111111]">{trust.score}<span className="text-lg text-[#9ca3af]">/{trust.maxScore}</span></div>
              <div className="mt-2 flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`h-2.5 w-8 rounded-full ${i <= trust.score ? 'bg-green-500' : 'bg-[#e5e7eb]'}`} />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {/* Completed steps */}
              {trust.completedSteps.map((step) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="text-sm text-[#6b7280] line-through">{step}</span>
                </div>
              ))}

              {/* Incomplete steps */}
              {trust.incompleteSteps.map((step) => (
                <div key={step.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#e5e7eb]" />
                    <span className="text-sm font-medium text-[#111111]">{step.label}</span>
                  </div>
                  <Link
                    href={step.href}
                    className="shrink-0 rounded bg-[#f9fafb] px-2.5 py-1 text-xs font-semibold text-[#DC2626] transition-colors hover:bg-[#DC2626]/10"
                  >
                    {step.action} →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Account Info Card */}
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-[#111111]">Account Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Email</span>
                <span className="font-medium text-[#111111]">{email}</span>
              </div>
              {memberSince && (
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Member since</span>
                  <span className="font-medium text-[#111111]">{memberSince}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Reports submitted</span>
                <span className="font-medium text-[#111111]">{submissionCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6b7280]">Verification</span>
                {profile?.is_verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-green-600">
                      <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.15"/>
                      <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Verified
                  </span>
                ) : (
                  <Link href="/verify" className="text-xs font-semibold text-green-600 hover:underline">Get Verified →</Link>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6b7280]">Subscription</span>
                {profile?.subscription_status === 'active' ? (
                  <span className="rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                    {profile.subscription_tier === 'fortress' ? 'Fortress' : 'Shield'}
                  </span>
                ) : (
                  <Link href="/pricing" className="text-xs font-semibold text-[#DC2626] hover:underline">View Plans →</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Business Profile Form */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <h2 className="mb-1 text-lg font-bold text-[#111111]">Business Profile</h2>
            <div className="mb-5 flex items-start gap-2 rounded bg-[#f9fafb] p-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-[#6b7280]">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="text-xs text-[#6b7280]">
                This information is private and only used for verification purposes. It is never shown to anyone on the platform.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">
                  Business Name
                  {!form.business_name && <span className="ml-1 text-[#DC2626]">*</span>}
                </label>
                <input name="business_name" value={form.business_name} onChange={handleChange} placeholder="e.g. Pipe Dream Plumbing Co." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">
                  Business Phone
                  {!form.business_phone && <span className="ml-1 text-[#DC2626]">*</span>}
                </label>
                <input name="business_phone" value={form.business_phone} onChange={handleChange} type="tel" placeholder="(555) 123-4567" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">
                  Trade / Service
                  {!form.trade && <span className="ml-1 text-[#DC2626]">*</span>}
                </label>
                <select name="trade" value={form.trade} onChange={handleChange} className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]">
                  <option value="">Select your trade</option>
                  {TRADE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">City</label>
                <input name="city" value={form.city} onChange={handleChange} className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">State</label>
                <select name="state" value={form.state} onChange={handleChange} className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]">
                  <option value="">Select</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button type="submit" disabled={saving} className="w-full rounded bg-[#DC2626] py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>

              {saved && (
                <div className="rounded border border-green-200 bg-green-50 px-4 py-2.5 text-center text-sm font-medium text-green-600">
                  Profile saved successfully!
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
