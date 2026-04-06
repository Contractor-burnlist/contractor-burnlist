'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ReputationBadge from '@/components/ReputationBadge'
import { Suspense } from 'react'

function NewPostForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCategory = searchParams.get('category') ?? ''

  const [categories, setCategories] = useState<any[]>([])
  const [categorySlug, setCategorySlug] = useState(preselectedCategory)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [myUsername, setMyUsername] = useState<string | null>(null)
  const [myRepPoints, setMyRepPoints] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login?next=/community/new'); return }
      const { data: prof } = await supabase.from('profiles').select('display_username, reputation_points').eq('id', user.id).single()
      setMyUsername(prof?.display_username ?? null)
      setMyRepPoints(prof?.reputation_points ?? 0)
    })
    supabase.from('forum_categories').select('id, name, slug, emoji, is_locked').order('display_order')
      .then(({ data }) => setCategories((data ?? []).filter((c: any) => !c.is_locked)))
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (title.length < 5) { setError('Title must be at least 5 characters.'); return }
    if (content.length < 10) { setError('Content must be at least 10 characters.'); return }
    if (!categorySlug) { setError('Please select a category.'); return }

    setPosting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login?next=/community/new'); return }

    const cat = categories.find((c) => c.slug === categorySlug)
    if (!cat) { setError('Invalid category.'); setPosting(false); return }

    const { data, error: insertErr } = await supabase.from('forum_posts').insert({
      category_id: cat.id, user_id: user.id, title: title.trim(), content: content.trim(),
    }).select('id').single()

    if (insertErr) { setError('Something went wrong. Please try again.'); setPosting(false); return }
    router.push(`/community/${categorySlug}/${data.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-black text-[#111111]">New Post</h1>
      <div className="mb-6 flex items-center gap-2 text-xs text-[#6b7280]">
        <span>Posting as:</span>
        <span className="font-semibold text-[#111111]">{myUsername ?? 'Anonymous'}</span>
        <ReputationBadge points={myRepPoints} />
      </div>
      <p className="mb-6 text-xs text-[#9ca3af]">Your identity is your username — your real name and business are never shown.</p>

      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-xs text-[#DC2626]">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#6b7280]">Category <span className="text-[#DC2626]">*</span></label>
          <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} required className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm outline-none focus:border-[#DC2626]">
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#6b7280]">Title <span className="text-[#DC2626]">*</span> <span className="font-normal text-[#9ca3af]">(5-200)</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="What's on your mind?" className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm outline-none focus:border-[#DC2626]" />
          <div className="mt-1 text-right text-xs text-[#9ca3af]">{title.length}/200</div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#6b7280]">Content <span className="text-[#DC2626]">*</span> <span className="font-normal text-[#9ca3af]">(10-10,000)</span></label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={10000} rows={8} placeholder="Share your thoughts, experience, or question..." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm outline-none focus:border-[#DC2626]" />
          <div className="mt-1 text-right text-xs text-[#9ca3af]">{content.length}/10,000</div>
        </div>
        <button type="submit" disabled={posting} className="w-full rounded bg-[#DC2626] py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
          {posting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  )
}

export default function NewPostPage() {
  return <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#DC2626]" /></div>}>
    <NewPostForm />
  </Suspense>
}
