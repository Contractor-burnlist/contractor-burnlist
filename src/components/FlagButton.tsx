'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const REASONS = [
  { value: 'false_information', label: 'False Information' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'retaliation', label: 'Retaliation' },
  { value: 'inappropriate', label: 'Inappropriate' },
  { value: 'other', label: 'Other' },
]

export default function FlagButton({ contentType, contentId }: { contentType: 'entry' | 'worker_entry' | 'comment'; contentId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'already'>('idle')

  async function handleSubmit() {
    if (!reason) return
    setStatus('submitting')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('content_flags').insert({
      user_id: user.id,
      content_type: contentType,
      content_id: contentId,
      reason,
      description: description || null,
    })

    if (error?.code === '23505') {
      setStatus('already')
    } else {
      setStatus('done')
    }
    setTimeout(() => { setOpen(false); setStatus('idle'); setReason(''); setDescription('') }, 1500)
  }

  if (status === 'done') return <span className="text-[10px] text-green-600">Flagged</span>
  if (status === 'already') return <span className="text-[10px] text-[#9ca3af]">Already flagged</span>

  return (
    <>
      <button onClick={() => setOpen(!open)} className="text-[#9ca3af] hover:text-[#DC2626]" title="Flag for review">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-64 rounded-lg border border-[#e5e7eb] bg-white p-3 shadow-lg">
          <p className="mb-2 text-xs font-semibold text-[#111111]">Flag for review</p>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="mb-2 w-full rounded border border-[#e5e7eb] bg-white px-2 py-1.5 text-xs text-[#111111] outline-none">
            <option value="">Select reason</option>
            {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details (optional)" rows={2} className="mb-2 w-full rounded border border-[#e5e7eb] bg-white px-2 py-1.5 text-xs text-[#111111] placeholder-[#9ca3af] outline-none" />
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={!reason || status === 'submitting'} className="rounded bg-[#DC2626] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">
              {status === 'submitting' ? 'Flagging...' : 'Submit Flag'}
            </button>
            <button onClick={() => setOpen(false)} className="text-xs text-[#6b7280]">Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}
