'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ReputationBadge from '@/components/ReputationBadge'

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}

function nl2br(text: string) {
  return text.split('\n').map((line, i) => <span key={i}>{line}{i < text.split('\n').length - 1 && <br />}</span>)
}

export default function PostDetail({ post, replies: initialReplies, slug }: { post: any; replies: any[]; slug: string }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [replies, setReplies] = useState(initialReplies)
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyToText, setReplyToText] = useState('')
  const [posting, setPosting] = useState(false)
  const [upvotedPosts, setUpvotedPosts] = useState<Set<string>>(new Set())
  const [upvotedReplies, setUpvotedReplies] = useState<Set<string>>(new Set())
  const [myUsername, setMyUsername] = useState<string | null>(null)
  const [myRepPoints, setMyRepPoints] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUserId(user?.id ?? null)
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('display_username, reputation_points').eq('id', user.id).single()
        setMyUsername(prof?.display_username ?? null)
        setMyRepPoints(prof?.reputation_points ?? 0)
        const { data: postUp } = await supabase.from('forum_upvotes').select('post_id').eq('user_id', user.id).eq('post_id', post.id)
        if (postUp?.length) setUpvotedPosts(new Set([post.id]))
        const replyIds = initialReplies.map((r) => r.id)
        if (replyIds.length) {
          const { data: replyUp } = await supabase.from('forum_upvotes').select('reply_id').eq('user_id', user.id).in('reply_id', replyIds)
          setUpvotedReplies(new Set((replyUp ?? []).map((u: any) => u.reply_id)))
        }
      }
    })
  }, [post.id, initialReplies])

  async function togglePostUpvote() {
    if (!userId || userId === post.user_id) return
    const supabase = createClient()
    if (upvotedPosts.has(post.id)) {
      await supabase.from('forum_upvotes').delete().eq('user_id', userId).eq('post_id', post.id)
      setUpvotedPosts(new Set())
    } else {
      await supabase.from('forum_upvotes').insert({ user_id: userId, post_id: post.id })
      setUpvotedPosts(new Set([post.id]))
    }
  }

  async function toggleReplyUpvote(replyId: string, authorId: string) {
    if (!userId || userId === authorId) return
    const supabase = createClient()
    if (upvotedReplies.has(replyId)) {
      await supabase.from('forum_upvotes').delete().eq('user_id', userId).eq('reply_id', replyId)
      setUpvotedReplies((prev) => { const n = new Set(prev); n.delete(replyId); return n })
    } else {
      await supabase.from('forum_upvotes').insert({ user_id: userId, reply_id: replyId })
      setUpvotedReplies((prev) => new Set(prev).add(replyId))
    }
  }

  async function submitReply(parentId?: string) {
    const text = parentId ? replyToText : replyText
    if (!text.trim() || posting || !userId) return
    setPosting(true)
    const supabase = createClient()
    const { data } = await supabase.from('forum_replies').insert({
      post_id: post.id, user_id: userId, content: text.trim(),
      parent_reply_id: parentId || null,
    }).select('*, profiles(display_username, trade, reputation_points, is_verified)').single()
    if (data) setReplies((prev) => [...prev, data])
    if (parentId) { setReplyToText(''); setReplyingTo(null) } else setReplyText('')
    setPosting(false)
  }

  async function deleteReply(id: string) {
    if (!confirm('Delete this reply?')) return
    const supabase = createClient()
    await supabase.from('forum_replies').update({ is_deleted: true }).eq('id', id)
    setReplies((prev) => prev.map((r) => r.id === id ? { ...r, is_deleted: true } : r))
  }

  const topLevel = replies.filter((r) => !r.parent_reply_id)
  const childMap = new Map<string, any[]>()
  for (const r of replies) {
    if (r.parent_reply_id) {
      const arr = childMap.get(r.parent_reply_id) ?? []
      arr.push(r)
      childMap.set(r.parent_reply_id, arr)
    }
  }

  const isAuthor = userId === post.user_id
  const isPostUpvoted = upvotedPosts.has(post.id)

  function renderReply(r: any, isChild = false) {
    const prof = r.profiles as any
    const isReplyUpvoted = upvotedReplies.has(r.id)
    const isReplyAuthor = userId === r.user_id
    return (
      <div key={r.id} className={isChild ? 'ml-8 border-l-2 border-[#e5e7eb] pl-4' : ''}>
        <div className="py-3">
          {r.is_deleted ? (
            <p className="text-sm italic text-[#9ca3af]">[This reply has been removed]</p>
          ) : (
            <>
              <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-[#9ca3af]">
                <span className="font-semibold text-[#111111]">{prof?.display_username ?? 'Anonymous'}</span>
                {prof?.trade && <span className="rounded bg-[#f0f0f0] px-1.5 py-0.5">{prof.trade}</span>}
                <ReputationBadge points={prof?.reputation_points ?? 0} />
                <span>{timeAgo(r.created_at)}</span>
                {r.updated_at !== r.created_at && <span>(edited)</span>}
              </div>
              <p className="text-sm text-[#374151]">{nl2br(r.content)}</p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <button onClick={() => toggleReplyUpvote(r.id, r.user_id)} disabled={isReplyAuthor || !userId} className={`flex items-center gap-1 ${isReplyUpvoted ? 'text-[#DC2626]' : 'text-[#9ca3af] hover:text-[#DC2626]'} disabled:opacity-40`}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill={isReplyUpvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2l5 5H2z"/></svg>
                  {r.upvote_count}
                </button>
                {!isChild && userId && <button onClick={() => { setReplyingTo(replyingTo === r.id ? null : r.id); setReplyToText('') }} className="text-[#9ca3af] hover:text-[#111111]">Reply</button>}
                {isReplyAuthor && <button onClick={() => deleteReply(r.id)} className="text-[#9ca3af] hover:text-[#DC2626]">Delete</button>}
              </div>
            </>
          )}
        </div>
        {replyingTo === r.id && (
          <div className="ml-8 mb-2 border-l-2 border-[#e5e7eb] pl-4">
            <textarea value={replyToText} onChange={(e) => setReplyToText(e.target.value)} rows={2} maxLength={5000} placeholder="Write a reply..." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm outline-none focus:border-[#DC2626]" />
            <div className="mt-1 flex gap-2">
              <button onClick={() => submitReply(r.id)} disabled={!replyToText.trim() || posting} className="rounded bg-[#DC2626] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">Reply</button>
              <button onClick={() => setReplyingTo(null)} className="text-xs text-[#6b7280]">Cancel</button>
            </div>
          </div>
        )}
        {(childMap.get(r.id) ?? []).map((child) => renderReply(child, true))}
      </div>
    )
  }

  return (
    <div>
      {/* Post */}
      <div className="mb-8 rounded-lg border border-[#e5e7eb] bg-white p-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <button onClick={togglePostUpvote} disabled={isAuthor || !userId} className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${isPostUpvoted ? 'bg-[#DC2626] text-white' : 'bg-[#f9fafb] text-[#9ca3af] hover:text-[#DC2626]'} disabled:opacity-40`}>
              <svg width="16" height="16" viewBox="0 0 14 14" fill={isPostUpvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2l5 5H2z"/></svg>
            </button>
            <span className={`text-sm font-bold ${isPostUpvoted ? 'text-[#DC2626]' : 'text-[#6b7280]'}`}>{post.upvote_count}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black text-[#111111]">{post.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#9ca3af]">
              <span className="font-semibold text-[#111111]">{(post.profiles as any)?.display_username ?? 'Anonymous'}</span>
              {(post.profiles as any)?.trade && <span className="rounded bg-[#f0f0f0] px-1.5 py-0.5">{(post.profiles as any).trade}</span>}
              <ReputationBadge points={(post.profiles as any)?.reputation_points ?? 0} />
              <span>{timeAgo(post.created_at)}</span>
              {post.updated_at !== post.created_at && <span>(edited)</span>}
            </div>
            <div className="mt-4 text-sm leading-relaxed text-[#374151]">{nl2br(post.content)}</div>
          </div>
        </div>
      </div>

      {/* Reply input */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold text-[#111111]">{replies.filter((r) => !r.is_deleted).length} Replies</h2>
        {userId ? (
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-[#6b7280]">
              <span>Posting as:</span>
              <span className="font-semibold text-[#111111]">{myUsername ?? 'Anonymous'}</span>
              <ReputationBadge points={myRepPoints} />
            </div>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} maxLength={5000} placeholder="Share your thoughts..." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm outline-none focus:border-[#DC2626]" />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[10px] text-[#9ca3af]">{replyText.length}/5000</span>
              <button onClick={() => submitReply()} disabled={!replyText.trim() || posting} className="rounded bg-[#DC2626] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                {posting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-center text-sm text-[#6b7280]">
            <a href="/auth/login?next=/community" className="font-semibold text-[#DC2626] hover:underline">Log in</a> to join the discussion
          </div>
        )}
      </div>

      {/* Replies list */}
      <div className="divide-y divide-[#e5e7eb]">
        {topLevel.map((r) => renderReply(r))}
      </div>
    </div>
  )
}
