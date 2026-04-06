'use client'

import { useState } from 'react'

const REASON_LABELS: Record<string, string> = {
  false_information: 'False Information',
  harassment: 'Harassment',
  spam: 'Spam',
  retaliation: 'Retaliation',
  inappropriate: 'Inappropriate',
  identity_dispute: 'Identity Dispute',
  inaccurate: 'Inaccurate',
  other: 'Other',
}

type Flag = {
  id: string
  content_type: string
  content_id: string
  reason: string
  description: string | null
  status: string
  admin_notes: string | null
  created_at: string
  contact_name: string | null
  contact_email: string | null
  attachment_paths: string[] | null
  user_id: string | null
  profiles: { email: string; display_username: string | null } | { email: string; display_username: string | null }[] | null
}

export default function AdminFlaggedClient({ initialFlags }: { initialFlags: Flag[] }) {
  const [flags, setFlags] = useState(initialFlags)
  const [tab, setTab] = useState('pending')

  const filtered = tab === 'all' ? flags : flags.filter((f) => f.status === tab)

  async function handleAction(flagId: string, action: 'dismiss' | 'action_taken', includeNotes = false) {
    const msg = action === 'action_taken' ? 'Remove flagged content and mark as resolved?' : 'Dismiss this flag?'
    if (!confirm(msg)) return

    const res = await fetch('/api/admin/flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagId, action, includeNotes }),
    })
    const { emailSent } = await res.json()

    setFlags((prev) => prev.map((f) => f.id === flagId ? { ...f, status: action === 'dismiss' ? 'dismissed' : 'action_taken' } : f))
    if (emailSent) alert('Notification email sent to disputant.')
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[#111111]">Flagged Content</h1>

      <div className="mb-4 flex gap-2">
        {['pending', 'reviewed', 'dismissed', 'action_taken', 'all'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${tab === t ? 'bg-[#111111] text-white' : 'border border-[#e5e7eb] text-[#6b7280]'}`}>
            {t === 'action_taken' ? 'Actioned' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#9ca3af]">No flags found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className="rounded-lg border border-[#e5e7eb] bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${f.content_type === 'comment' ? 'bg-blue-50 text-blue-600' : 'bg-[#DC2626]/10 text-[#DC2626]'}`}>
                      {f.content_type}
                    </span>
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{REASON_LABELS[f.reason] ?? f.reason}</span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${f.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : f.status === 'action_taken' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-[#6b7280]'}`}>
                      {f.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-[#6b7280]">
                    {f.contact_name ? (
                      <span>Dispute from: <strong className="text-[#111111]">{f.contact_name}</strong>{f.contact_email && <> &middot; <a href={`mailto:${f.contact_email}`} className="text-[#DC2626] hover:underline">{f.contact_email}</a></>}</span>
                    ) : (
                      <span>Flagged by: {(() => { const p = Array.isArray(f.profiles) ? f.profiles[0] : f.profiles; return p?.display_username ?? p?.email ?? 'Unknown' })()}</span>
                    )}
                  </div>
                  {f.description && <p className="mt-1 text-xs text-[#374151]">{f.description}</p>}
                  {f.attachment_paths && f.attachment_paths.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-[#6b7280]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                      {f.attachment_paths.length} attachment{f.attachment_paths.length > 1 ? 's' : ''}
                    </div>
                  )}
                  <div className="mt-1 text-[10px] text-[#9ca3af]">
                    Content ID: {f.content_id.slice(0, 8)}... &middot; {new Date(f.created_at).toLocaleString()}
                  </div>
                  {f.admin_notes && <p className="mt-1 text-[10px] italic text-[#6b7280]">Admin: {f.admin_notes}</p>}
                </div>
                {f.status === 'pending' && (
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {f.contact_email && <span className="text-[10px] text-green-600">Email will be sent to disputant</span>}
                    {!f.contact_email && f.contact_name && <span className="text-[10px] text-[#9ca3af]">No email provided</span>}
                    <div className="flex gap-1">
                      <button onClick={() => handleAction(f.id, 'dismiss')} className="rounded border border-[#e5e7eb] px-2 py-1 text-[10px] text-[#6b7280] hover:bg-[#f9fafb]">Dismiss</button>
                      <button onClick={() => handleAction(f.id, 'action_taken')} className="rounded border border-[#DC2626] px-2 py-1 text-[10px] text-[#DC2626] hover:bg-red-50">Remove Content</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
