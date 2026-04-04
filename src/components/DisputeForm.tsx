'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const DISPUTE_REASONS = [
  { value: 'false_information', label: 'This report contains false information' },
  { value: 'identity_dispute', label: 'I am not the person described in this report' },
  { value: 'harassment', label: 'This report is harassment or retaliation' },
  { value: 'inaccurate', label: 'The details are inaccurate or exaggerated' },
  { value: 'other', label: 'Other' },
]

export default function DisputeForm({ contentType, contentId }: { contentType: 'customer' | 'worker'; contentId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'duplicate' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !reason || description.length < 50 || !agreed) return

    setStatus('submitting')
    const supabase = createClient()

    const { error } = await supabase.from('content_flags').insert({
      user_id: null,
      content_type: contentType,
      content_id: contentId,
      reason,
      description,
      contact_name: name,
      contact_email: email,
    })

    if (error) {
      setStatus('error')
    } else {
      setStatus('done')
    }
  }

  if (status === 'done') {
    return (
      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-5 text-center">
        <div className="mb-2 text-2xl">✓</div>
        <p className="text-sm font-semibold text-green-800">Your dispute has been submitted.</p>
        <p className="mt-1 text-xs text-green-700">Our team will review it and may contact you at the email address provided. Please allow up to 5 business days for a response.</p>
      </div>
    )
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-4 flex items-center gap-1.5 text-xs text-[#9ca3af] transition-colors hover:text-[#6b7280]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
        Is this about you? Dispute this report
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111111]">Dispute This Report</h2>
          <button onClick={() => setOpen(false)} className="text-[#9ca3af] hover:text-[#111111]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
          </button>
        </div>
        <p className="mb-5 text-xs text-[#6b7280]">If you believe this report is about you and contains false or inaccurate information, you can submit a dispute for review.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Your Full Name <span className="text-[#DC2626]">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Smith" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Your Email Address <span className="text-[#DC2626]">*</span></label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Phone Number (optional)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="(555) 123-4567" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Reason for Dispute <span className="text-[#DC2626]">*</span></label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} required className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]">
              <option value="">Select a reason</option>
              {DISPUTE_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Detailed Explanation <span className="text-[#DC2626]">*</span> <span className="font-normal text-[#9ca3af]">(min 50 characters)</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={50} rows={4} placeholder="Please explain why this report is inaccurate and provide any supporting details..." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
            <div className="mt-1 text-right text-xs text-[#9ca3af]">{description.length}/50 min</div>
          </div>

          <label className="flex cursor-pointer items-start gap-2">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#DC2626]" />
            <span className="text-xs text-[#6b7280]">
              I understand that submitting a dispute does not guarantee removal. Contractor Burnlist will review this dispute in good faith. See our <Link href="/terms" target="_blank" className="font-semibold text-[#DC2626] underline">Terms &amp; Conditions</Link> for our full dispute resolution process.
            </span>
          </label>

          {status === 'error' && <p className="text-xs text-[#DC2626]">Something went wrong. Please try again.</p>}

          <button type="submit" disabled={!name || !email || !reason || description.length < 50 || !agreed || status === 'submitting'} className="w-full rounded bg-[#DC2626] py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
            {status === 'submitting' ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </form>
      </div>
    </div>
  )
}
