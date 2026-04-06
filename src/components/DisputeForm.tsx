'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const DISPUTE_REASONS = [
  { value: 'false_information', label: 'This report contains false information' },
  { value: 'identity_dispute', label: 'I am not the person described in this feedback' },
  { value: 'harassment', label: 'This feedback is harassment or retaliation' },
  { value: 'inaccurate', label: 'The details are inaccurate or exaggerated' },
  { value: 'other', label: 'Other' },
]

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_SIZE = 10 * 1024 * 1024

type FileItem = { file: File; status: 'pending' | 'uploading' | 'done' | 'error'; path?: string; error?: string }

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function DisputeForm({ contentType, contentId, variant = 'link' }: { contentType: 'customer' | 'worker'; contentId: string; variant?: 'link' | 'banner' }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([])
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addFiles(newFiles: FileList | File[]) {
    const toAdd: FileItem[] = []
    for (const file of Array.from(newFiles)) {
      if (files.length + toAdd.length >= 5) break
      if (!ALLOWED_TYPES.includes(file.type)) {
        toAdd.push({ file, status: 'error', error: 'File type not supported' })
        continue
      }
      if (file.size > MAX_SIZE) {
        toAdd.push({ file, status: 'error', error: 'File too large (max 10MB)' })
        continue
      }
      toAdd.push({ file, status: 'pending' })
    }
    setFiles((prev) => [...prev, ...toAdd])
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadFiles(): Promise<string[]> {
    const paths: string[] = []
    const updated = [...files]

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== 'pending') continue
      updated[i] = { ...updated[i], status: 'uploading' }
      setFiles([...updated])

      const form = new FormData()
      form.append('file', updated[i].file)
      form.append('contentId', contentId)

      try {
        const res = await fetch('/api/dispute-upload', { method: 'POST', body: form })
        const data = await res.json()
        if (res.ok && data.path) {
          updated[i] = { ...updated[i], status: 'done', path: data.path }
          paths.push(data.path)
        } else {
          updated[i] = { ...updated[i], status: 'error', error: data.error || 'Upload failed' }
        }
      } catch {
        updated[i] = { ...updated[i], status: 'error', error: 'Upload failed' }
      }
      setFiles([...updated])
    }
    return paths
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !reason || description.length < 50 || !agreed) return

    setStatus('submitting')

    const uploadedPaths = files.some((f) => f.status === 'pending') ? await uploadFiles() : files.filter((f) => f.path).map((f) => f.path!)

    const supabase = createClient()
    const { error } = await supabase.from('content_flags').insert({
      user_id: null,
      content_type: contentType,
      content_id: contentId,
      reason,
      description,
      contact_name: name,
      contact_email: email || null,
      attachment_paths: uploadedPaths.length > 0 ? uploadedPaths : null,
    })

    if (error) {
      setStatus('error')
    } else {
      setStatus('done')
      // Notify original submitters (fire-and-forget)
      fetch('/api/dispute-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, contentId, reason }),
      }).catch(() => {})
    }
  }

  function isImage(file: File) { return file.type.startsWith('image/') }

  if (status === 'done') {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 p-5 text-center ${variant === 'banner' ? 'mb-4' : 'mt-6'}`}>
        <p className="text-sm font-semibold text-green-800">✓ Your dispute has been submitted.</p>
        <p className="mt-1 text-xs text-green-700">Our team will review it and may contact you{email ? ' at the email address provided' : ''}. Please allow up to 5 business days for a response.</p>
      </div>
    )
  }

  if (!open) {
    if (variant === 'banner') {
      return (
        <button onClick={() => setOpen(true)} className="mb-4 flex w-full items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-left transition-colors hover:bg-amber-100">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
          <span className="text-sm font-semibold text-amber-800">Is this about you? Dispute this feedback →</span>
        </button>
      )
    }
    return (
      <button onClick={() => setOpen(true)} className="mt-4 flex items-center gap-1.5 text-xs text-[#9ca3af] transition-colors hover:text-[#6b7280]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
        Is this about you? Dispute this feedback
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111111]">Dispute This Feedback</h2>
          <button onClick={() => setOpen(false)} className="text-[#9ca3af] hover:text-[#111111]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
          </button>
        </div>
        <p className="mb-5 text-xs text-[#6b7280]">If you believe this feedback is about you and contains false or inaccurate information, you can submit a dispute for review.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Your Full Name <span className="text-[#DC2626]">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Smith" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Your Email Address (optional)</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
            <p className="mt-1 text-[10px] text-[#9ca3af]">Providing your email allows us to follow up with you about your dispute, but it is not required.</p>
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
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={50} rows={4} placeholder="Please explain why this feedback is inaccurate and provide any supporting details..." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
            <div className="mt-1 text-right text-xs text-[#9ca3af]">{description.length}/50 min</div>
          </div>

          {/* File Upload */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Supporting Evidence (optional)</label>
            <p className="mb-2 text-[10px] text-[#9ca3af]">Attach photos, documents, or other evidence. Accepted: JPG, PNG, PDF, DOC/DOCX. Max 10MB per file, up to 5 files.</p>

            <div
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${dragOver ? 'border-[#DC2626] bg-[#DC2626]/5' : 'border-[#e5e7eb] bg-[#f9fafb] hover:border-[#d1d5db]'} ${files.length >= 5 ? 'pointer-events-none opacity-50' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="mt-2 text-xs text-[#6b7280]">Drag and drop files here, or <span className="font-semibold text-[#DC2626]">browse</span></p>
              <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx" className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = '' }} />
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded border px-3 py-2 ${f.status === 'error' ? 'border-red-200 bg-red-50' : 'border-[#e5e7eb] bg-white'}`}>
                    {isImage(f.file) ? (
                      <img src={URL.createObjectURL(f.file)} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#f9fafb] text-[10px] font-bold text-[#6b7280]">
                        {f.file.name.split('.').pop()?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#111111]">{f.file.name}</p>
                      <p className="text-[10px] text-[#9ca3af]">
                        {formatBytes(f.file.size)}
                        {f.status === 'uploading' && ' — Uploading...'}
                        {f.status === 'done' && ' — Uploaded'}
                        {f.status === 'error' && <span className="text-[#DC2626]"> — {f.error}</span>}
                      </p>
                    </div>
                    {f.status === 'uploading' && <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#DC2626]" />}
                    <button type="button" onClick={() => removeFile(i)} className="shrink-0 text-[#9ca3af] hover:text-[#DC2626]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {files.length >= 5 && <p className="mt-1 text-[10px] text-[#DC2626]">Maximum 5 files per dispute.</p>}
          </div>

          <label className="flex cursor-pointer items-start gap-2">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#DC2626]" />
            <span className="text-xs text-[#6b7280]">
              I understand that submitting a dispute does not guarantee removal. Contractor Burnlist will review this dispute in good faith. See our <Link href="/terms" target="_blank" className="font-semibold text-[#DC2626] underline">Terms &amp; Conditions</Link> for our full dispute resolution process.
            </span>
          </label>

          {status === 'error' && <p className="text-xs text-[#DC2626]">Something went wrong. Please try again.</p>}

          <button type="submit" disabled={!name || !reason || description.length < 50 || !agreed || status === 'submitting'} className="w-full rounded bg-[#DC2626] py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
            {status === 'submitting' ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </form>
      </div>
    </div>
  )
}
