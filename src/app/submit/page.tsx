'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function isRlsError(err: { code?: string; message?: string }): boolean {
  return err.code === '42501' || (err.message?.includes('row-level security') ?? false)
}

// Customer category tags
const customerCategories = [
  'Non-payment',
  'Fraudulent chargeback / disputed work',
  'Threatened bad reviews as leverage',
  'False damage / insurance claim',
  'Hostile / threatening / abusive',
  'Scope / contract dispute',
  'Stopped payment / bounced check',
  'False licensing board complaint',
  'Refused access / locked out',
  'Pattern of bad behavior',
]

// Worker category tags
const workerCategories = [
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

type ReportType = 'customer' | 'worker' | null

function generateInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() + '.')
    .join('')
}

function CheckboxTag({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-xs transition-colors ${
        checked
          ? 'border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626]'
          : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#d1d5db]'
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
        checked ? 'border-[#DC2626] bg-[#DC2626] text-white' : 'border-[#d1d5db]'
      }`}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {label}
    </label>
  )
}

export default function SubmitPage() {
  const router = useRouter()
  const [reportType, setReportType] = useState<ReportType>(null)
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

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    full_name: '', address: '', city: '', state: '', zip: '', phone: '', email: '',
    description: '', amount_owed: '', incident_date: '', categories: [] as string[],
  })

  // Worker form state
  const [workerForm, setWorkerForm] = useState({
    full_name: '', phone: '', city: '', state: '', trade_specialty: '',
    description: '', incident_date: '', categories: [] as string[],
  })

  function handleCustomerChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setCustomerForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleWorkerChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setWorkerForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function toggleCustomerCategory(cat: string) {
    setCustomerForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }))
  }

  function toggleWorkerCategory(cat: string) {
    setWorkerForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const form = reportType === 'customer' ? customerForm : workerForm
    const categories = form.categories

    if (categories.length === 0) {
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

    if (reportType === 'customer') {
      const f = customerForm
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          full_name: f.full_name,
          display_name: generateInitials(f.full_name),
          address: f.address,
          city: f.city,
          state: f.state,
          zip: f.zip || null,
          phone: f.phone || null,
          email: f.email || null,
        })
        .select('id')
        .single()

      if (customerError) {
        setError(isRlsError(customerError) ? '__rls__' : 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      const { error: entryError } = await supabase
        .from('entries')
        .insert({
          customer_id: customer.id,
          submitted_by: user.id,
          description: f.description,
          amount_owed: f.amount_owed ? parseFloat(f.amount_owed) : null,
          incident_date: f.incident_date,
          category_tags: f.categories,
        })

      if (entryError) {
        setError(isRlsError(entryError) ? '__rls__' : 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
    } else {
      const f = workerForm
      const { data: worker, error: workerError } = await supabase
        .from('workers')
        .insert({
          full_name: f.full_name,
          phone: f.phone || null,
          city: f.city,
          state: f.state,
          trade_specialty: f.trade_specialty || null,
        })
        .select('id')
        .single()

      if (workerError) {
        setError(isRlsError(workerError) ? '__rls__' : 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      const { error: entryError } = await supabase
        .from('worker_entries')
        .insert({
          worker_id: worker.id,
          submitted_by: user.id,
          description: f.description,
          incident_date: f.incident_date,
          category_tags: f.categories,
        })

      if (entryError) {
        setError(isRlsError(entryError) ? '__rls__' : 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
    }

    setLoading(false)
    setSuccess(true)
  }

  function resetAll() {
    setSuccess(false)
    setReportType(null)
    setCertified(false)
    setError('')
    setCustomerForm({ full_name: '', address: '', city: '', state: '', zip: '', phone: '', email: '', description: '', amount_owed: '', incident_date: '', categories: [] })
    setWorkerForm({ full_name: '', phone: '', city: '', state: '', trade_specialty: '', description: '', incident_date: '', categories: [] })
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-green-200 bg-green-50 p-10">
          <div className="mb-4 text-5xl">✅</div>
          <h2 className="mb-2 text-2xl font-black text-[#111111]">Report Submitted Successfully</h2>
          <p className="text-[#6b7280]">Thank you for protecting the community.</p>
          <button
            onClick={resetAll}
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
        <h1 className="mb-2 text-3xl font-black text-[#111111]">Submit a Report</h1>
        <p className="text-[#6b7280]">
          Choose who you are reporting, then fill out the details below.
        </p>
      </div>

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

      {verified !== false && <>
      {/* Report Type Selection */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => { setReportType('customer'); setError('') }}
          className={`rounded-lg border-2 p-6 text-left transition-all ${
            reportType === 'customer'
              ? 'border-[#DC2626] bg-[#DC2626]/5 shadow-sm'
              : 'border-[#e5e7eb] bg-white hover:border-[#d1d5db]'
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f9fafb]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={reportType === 'customer' ? '#DC2626' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
              <line x1="4" y1="4" x2="20" y2="20"/>
            </svg>
          </div>
          <h3 className={`mb-1 text-base font-bold ${reportType === 'customer' ? 'text-[#DC2626]' : 'text-[#111111]'}`}>
            Report a Problem Customer
          </h3>
          <p className="text-xs leading-relaxed text-[#6b7280]">
            Flag a customer for non-payment, fraud, hostile behavior, or other issues
          </p>
        </button>

        <button
          type="button"
          onClick={() => { setReportType('worker'); setError('') }}
          className={`rounded-lg border-2 p-6 text-left transition-all ${
            reportType === 'worker'
              ? 'border-[#DC2626] bg-[#DC2626]/5 shadow-sm'
              : 'border-[#e5e7eb] bg-white hover:border-[#d1d5db]'
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f9fafb]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={reportType === 'worker' ? '#DC2626' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 18v1a1 1 0 001 1h18a1 1 0 001-1v-1"/>
              <path d="M2 18l3-9h14l3 9"/>
              <path d="M9 9V5a1 1 0 011-1h4a1 1 0 011 1v4"/>
              <line x1="12" y1="13" x2="12" y2="16"/>
            </svg>
          </div>
          <h3 className={`mb-1 text-base font-bold ${reportType === 'worker' ? 'text-[#DC2626]' : 'text-[#111111]'}`}>
            Report a Problem Worker
          </h3>
          <p className="text-xs leading-relaxed text-[#6b7280]">
            Flag an employee, sub, or laborer for theft, no-shows, poor workmanship, or other issues
          </p>
        </button>
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

      {/* Customer Form */}
      {reportType === 'customer' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <h2 className="mb-1 text-lg font-bold text-[#111111]">Customer Information</h2>
            <p className="mb-5 text-xs text-[#9ca3af]">Full name is stored internally and never shown publicly.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Full Name <span className="text-[#DC2626]">*</span></label>
                <input name="full_name" value={customerForm.full_name} onChange={handleCustomerChange} required placeholder="e.g. John Smith" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Address <span className="text-[#DC2626]">*</span></label>
                <input name="address" value={customerForm.address} onChange={handleCustomerChange} required placeholder="Street address" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">City <span className="text-[#DC2626]">*</span></label>
                <input name="city" value={customerForm.city} onChange={handleCustomerChange} required className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">State <span className="text-[#DC2626]">*</span></label>
                  <select name="state" value={customerForm.state} onChange={handleCustomerChange} required className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]">
                    <option value="">Select</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">ZIP</label>
                  <input name="zip" value={customerForm.zip} onChange={handleCustomerChange} maxLength={10} className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Phone</label>
                <input name="phone" value={customerForm.phone} onChange={handleCustomerChange} type="tel" placeholder="(555) 123-4567" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Email</label>
                <input name="email" value={customerForm.email} onChange={handleCustomerChange} type="email" placeholder="Optional" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <h2 className="mb-5 text-lg font-bold text-[#111111]">Incident Information</h2>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium text-[#6b7280]">Categories <span className="text-[#DC2626]">*</span></label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {customerCategories.map((cat) => (
                    <CheckboxTag key={cat} label={cat} checked={customerForm.categories.includes(cat)} onChange={() => toggleCustomerCategory(cat)} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Date of Incident <span className="text-[#DC2626]">*</span></label>
                  <input name="incident_date" value={customerForm.incident_date} onChange={handleCustomerChange} type="date" required className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Amount Owed ($)</label>
                  <input name="amount_owed" value={customerForm.amount_owed} onChange={handleCustomerChange} type="number" min="0" step="0.01" placeholder="0.00" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Description <span className="text-[#DC2626]">*</span> <span className="ml-2 font-normal text-[#9ca3af]">(min 30 characters)</span></label>
                <textarea name="description" value={customerForm.description} onChange={handleCustomerChange} required minLength={30} rows={5} placeholder="Describe what happened in detail..." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
                <div className="mt-1 text-right text-xs text-[#9ca3af]">{customerForm.description.length} / 30 min</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={certified} onChange={(e) => setCertified(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#d1d5db] accent-[#DC2626]" />
              <span className="text-sm leading-relaxed text-[#6b7280]">
                I certify that this report is based on my firsthand experience and is truthful and accurate to the best of my knowledge. I understand that false reports may result in account termination.
                <span className="text-[#DC2626]"> *</span>
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded bg-[#DC2626] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting...
              </span>
            ) : 'Submit Report'}
          </button>
        </form>
      )}

      {/* Worker Form */}
      {reportType === 'worker' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <h2 className="mb-1 text-lg font-bold text-[#111111]">Worker Information</h2>
            <p className="mb-5 text-xs text-[#9ca3af]">Full name is stored internally and only initials are shown publicly.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Full Name <span className="text-[#DC2626]">*</span></label>
                <input name="full_name" value={workerForm.full_name} onChange={handleWorkerChange} required placeholder="e.g. Mike Torres" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Phone</label>
                <input name="phone" value={workerForm.phone} onChange={handleWorkerChange} type="tel" placeholder="(555) 123-4567" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Trade / Specialty</label>
                <select name="trade_specialty" value={workerForm.trade_specialty} onChange={handleWorkerChange} className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]">
                  <option value="">Select trade</option>
                  {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">City <span className="text-[#DC2626]">*</span></label>
                <input name="city" value={workerForm.city} onChange={handleWorkerChange} required className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">State <span className="text-[#DC2626]">*</span></label>
                <select name="state" value={workerForm.state} onChange={handleWorkerChange} required className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]">
                  <option value="">Select</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <h2 className="mb-5 text-lg font-bold text-[#111111]">Incident Information</h2>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium text-[#6b7280]">Categories <span className="text-[#DC2626]">*</span></label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {workerCategories.map((cat) => (
                    <CheckboxTag key={cat} label={cat} checked={workerForm.categories.includes(cat)} onChange={() => toggleWorkerCategory(cat)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Date of Incident <span className="text-[#DC2626]">*</span></label>
                <input name="incident_date" value={workerForm.incident_date} onChange={handleWorkerChange} type="date" required className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Description <span className="text-[#DC2626]">*</span> <span className="ml-2 font-normal text-[#9ca3af]">(min 30 characters)</span></label>
                <textarea name="description" value={workerForm.description} onChange={handleWorkerChange} required minLength={30} rows={5} placeholder="Describe what happened in detail..." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
                <div className="mt-1 text-right text-xs text-[#9ca3af]">{workerForm.description.length} / 30 min</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={certified} onChange={(e) => setCertified(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#d1d5db] accent-[#DC2626]" />
              <span className="text-sm leading-relaxed text-[#6b7280]">
                I certify that this report is based on my firsthand experience and is truthful and accurate to the best of my knowledge. I understand that false reports may result in account termination.
                <span className="text-[#DC2626]"> *</span>
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded bg-[#DC2626] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting...
              </span>
            ) : 'Submit Report'}
          </button>
        </form>
      )}
      </>}
    </div>
  )
}
