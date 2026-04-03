'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function isRlsError(err: { code?: string; message?: string }): boolean {
  return err.code === '42501' || (err.message?.includes('row-level security') ?? false)
}

const categoryOptions = [
  'No-show / abandoned job',
  'Substandard / defective work',
  'Theft / missing materials',
  'Property damage',
  'Unlicensed / misrepresented credentials',
  'Hostile / threatening / abusive',
  'Substance abuse on site',
  'Overbilling / invoice fraud',
  'Refused to fix warranty issue',
  'Left job incomplete',
  'Pattern of bad behavior',
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

const TRADES = [
  'General Contractor',
  'Electrician',
  'Plumber',
  'HVAC',
  'Roofer',
  'Painter',
  'Carpenter',
  'Mason / Concrete',
  'Landscaper',
  'Flooring',
  'Drywall',
  'Handyman',
  'Other',
]

export default function SubmitWorkerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [certified, setCertified] = useState(false)
  const [verified, setVerified] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setVerified(null); return }
      supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setVerified(data?.is_verified === true))
    })
  }, [])

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    state: '',
    trade_specialty: '',
    description: '',
    incident_date: '',
    categories: [] as string[],
  })

  function toggleCategory(cat: string) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.categories.length === 0) {
      setError('Please select at least one category.')
      return
    }
    if (form.description.length < 30) {
      setError('Description must be at least 30 characters.')
      return
    }
    if (!certified) {
      setError('You must certify that this report is truthful.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Insert worker
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .insert({
        full_name: form.full_name,
        phone: form.phone || null,
        city: form.city,
        state: form.state,
        trade_specialty: form.trade_specialty || null,
      })
      .select('id')
      .single()

    if (workerError) {
      setError(isRlsError(workerError) ? '__rls__' : 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    // Insert worker entry
    const { error: entryError } = await supabase
      .from('worker_entries')
      .insert({
        worker_id: worker.id,
        submitted_by: user.id,
        description: form.description,
        incident_date: form.incident_date,
        category_tags: form.categories,
      })

    if (entryError) {
      setError(isRlsError(entryError) ? '__rls__' : 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-green-200 bg-green-50 p-10">
          <div className="mb-4 text-5xl">✅</div>
          <h2 className="mb-2 text-2xl font-black text-[#111111]">Worker Report Submitted</h2>
          <p className="text-[#6b7280]">Thank you for protecting the community.</p>
          <button
            onClick={() => { setSuccess(false); setForm({ full_name: '', phone: '', city: '', state: '', trade_specialty: '', description: '', incident_date: '', categories: [] }); setCertified(false) }}
            className="mt-6 rounded bg-[#DC2626] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-black text-[#111111]">Report a Worker</h1>
        <p className="text-[#6b7280]">
          Flag a problematic worker or subcontractor. All submissions are reviewed before publication.
        </p>
      </div>

      {error && (
        error === '__rls__' ? (
          <div className="mb-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Unfortunately you will not be able to submit reports until you verify your business.
            Please <Link href="/verify" className="font-semibold underline">click here</Link> to do so.
          </div>
        ) : (
          <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )
      )}

      {verified === false && (
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-6 text-center">
          <div className="mb-3 text-3xl">🔒</div>
          <p className="mb-1 text-sm font-semibold text-amber-800">Business Verification Required</p>
          <p className="text-sm text-amber-700">
            Unfortunately you will not be able to submit reports until you verify your business.
            Please <Link href="/verify" className="font-semibold underline">click here</Link> to do so.
          </p>
        </div>
      )}

      {verified !== false && <form onSubmit={handleSubmit} className="space-y-6">
        {/* Worker Information */}
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
          <h2 className="mb-1 text-lg font-bold text-[#111111]">Worker Information</h2>
          <p className="mb-5 text-xs text-[#9ca3af]">Full name is stored internally and only initials are shown publicly.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">
                Full Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                placeholder="e.g. Mike Torres"
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                placeholder="(555) 123-4567"
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">
                Trade / Specialty
              </label>
              <select
                name="trade_specialty"
                value={form.trade_specialty}
                onChange={handleChange}
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
              >
                <option value="">Select trade</option>
                {TRADES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">
                City <span className="text-[#DC2626]">*</span>
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">
                State <span className="text-[#DC2626]">*</span>
              </label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
              >
                <option value="">Select</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Incident Information */}
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
          <h2 className="mb-5 text-lg font-bold text-[#111111]">Incident Information</h2>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-[#6b7280]">
                Categories <span className="text-[#DC2626]">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {categoryOptions.map((cat) => (
                  <label
                    key={cat}
                    className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-xs transition-colors ${
                      form.categories.includes(cat)
                        ? 'border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626]'
                        : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#d1d5db]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="sr-only"
                    />
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      form.categories.includes(cat)
                        ? 'border-[#DC2626] bg-[#DC2626] text-white'
                        : 'border-[#d1d5db]'
                    }`}>
                      {form.categories.includes(cat) && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">
                Date of Incident <span className="text-[#DC2626]">*</span>
              </label>
              <input
                name="incident_date"
                value={form.incident_date}
                onChange={handleChange}
                type="date"
                required
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">
                Description <span className="text-[#DC2626]">*</span>
                <span className="ml-2 font-normal text-[#9ca3af]">(min 30 characters)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                minLength={30}
                rows={5}
                placeholder="Describe what happened in detail..."
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]"
              />
              <div className="mt-1 text-right text-xs text-[#9ca3af]">
                {form.description.length} / 30 min
              </div>
            </div>
          </div>
        </div>

        {/* Certification */}
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={certified}
              onChange={(e) => setCertified(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#d1d5db] accent-[#DC2626]"
            />
            <span className="text-sm leading-relaxed text-[#6b7280]">
              I certify that this report is based on my firsthand experience and is truthful and accurate to the best of my knowledge. I understand that false reports may result in account termination.
              <span className="text-[#DC2626]"> *</span>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[#DC2626] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Submitting...
            </span>
          ) : (
            'Submit Report'
          )}
        </button>
      </form>}
    </div>
  )
}
