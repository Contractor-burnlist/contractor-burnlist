'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ReputationBadge from '@/components/ReputationBadge'
import TradeFlair from '@/components/TradeFlair'

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

function UpvoteBtn({ active, count, onClick, disabled, size = 'sm' }: { active: boolean; count: number; onClick: () => void; disabled: boolean; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'h-11 w-11' : 'h-8 w-8'
  const iconSz = size === 'lg' ? 16 : 12
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button onClick={onClick} disabled={disabled} className={`flex ${sz} items-center justify-center rounded-lg transition-all ${active ? 'bg-[#DC2626] text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-[#DC2626]'} disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-400`}>
        <svg width={iconSz} height={iconSz} viewBox="0 0 14 14" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2l5 5H2z"/></svg>
      </button>
      <span className={`text-xs font-bold ${active ? 'text-[#DC2626]' : 'text-gray-500'}`}>{count}</span>
    </div>
  )
}

function AuthorLine({ prof, createdAt, edited }: { prof: any; createdAt: string; edited?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-sm font-semibold text-gray-900">{prof?.display_username ?? 'Anonymous'}</span>
      {prof?.trade && <TradeFlair trade={prof.trade} />}
      <ReputationBadge points={prof?.reputation_points ?? 0} />
      <span className="text-xs text-gray-400">{timeAgo(createdAt)}</span>
      {edited && <span className="text-[10px] italic text-gray-400">(edited)</span>}
    </div>
  )
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
  const [postVoteCount, setPostVoteCount] = useState(post.upvote_count ?? 0)
  const [replyVoteCounts, setReplyVoteCounts] = useState<Map<string, number>>(new Map(initialReplies.map((r: any) => [r.id, r.upvote_count ?? 0])))
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
      setUpvotedPosts(new Set())
      setPostVoteCount((c: number) => Math.max(c - 1, 0))
      await supabase.from('forum_upvotes').delete().eq('user_id', userId).eq('post_id', post.id)
    } else {
      setUpvotedPosts(new Set([post.id]))
      setPostVoteCount((c: number) => c + 1)
      await supabase.from('forum_upvotes').insert({ user_id: userId, post_id: post.id })
    }
  }

  async function toggleReplyUpvote(replyId: string, authorId: string) {
    if (!userId || userId === authorId) return
    const supabase = createClient()
    if (upvotedReplies.has(replyId)) {
      setUpvotedReplies((prev) => { const n = new Set(prev); n.delete(replyId); return n })
      setReplyVoteCounts((prev) => { const n = new Map(prev); n.set(replyId, Math.max((n.get(replyId) ?? 0) - 1, 0)); return n })
      await supabase.from('forum_upvotes').delete().eq('user_id', userId).eq('reply_id', replyId)
    } else {
      setUpvotedReplies((prev) => new Set(prev).add(replyId))
      setReplyVoteCounts((prev) => { const n = new Map(prev); n.set(replyId, (n.get(replyId) ?? 0) + 1); return n })
      await supabase.from('forum_upvotes').insert({ user_id: userId, reply_id: replyId })
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

  const activeReplyCount = replies.filter((r) => !r.is_deleted).length

  function renderReply(r: any, isChild = false) {
    const prof = r.profiles as any
    const isReplyUpvoted = upvotedReplies.has(r.id)
    const isReplyAuthor = userId === r.user_id
    return (
      <div key={r.id} className={isChild ? 'ml-6 border-l-2 border-[#DC2626]/15 pl-5 sm:ml-10' : ''}>
        <div className={`rounded-lg bg-white p-4 ${!isChild ? 'border border-gray-200' : ''}`}>
          {r.is_deleted ? (
            <p className="py-2 text-sm italic text-gray-400">[This reply has been removed]</p>
          ) : (
            <div className="flex gap-3">
              <UpvoteBtn active={isReplyUpvoted} count={replyVoteCounts.get(r.id) ?? r.upvote_count ?? 0} onClick={() => toggleReplyUpvote(r.id, r.user_id)} disabled={isReplyAuthor || !userId} />
              <div className="min-w-0 flex-1">
                <AuthorLine prof={prof} createdAt={r.created_at} edited={r.updated_at !== r.created_at} />
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{nl2br(r.content)}</p>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  {!isChild && userId && (
                    <button onClick={() => { setReplyingTo(replyingTo === r.id ? null : r.id); setReplyToText('') }} className="font-medium text-gray-400 transition-colors hover:text-gray-900">Reply</button>
                  )}
                  {isReplyAuthor && (
                    <button onClick={() => deleteReply(r.id)} className="font-medium text-gray-400 transition-colors hover:text-[#DC2626]">Delete</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {replyingTo === r.id && (
          <div className="ml-6 mt-2 border-l-2 border-[#DC2626]/15 pl-5 sm:ml-10">
            <textarea value={replyToText} onChange={(e) => setReplyToText(e.target.value)} rows={2} maxLength={5000} placeholder="Write a reply..." className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" />
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => submitReply(r.id)} disabled={!replyToText.trim() || posting} className="rounded-lg bg-[#DC2626] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">Reply</button>
              <button onClick={() => setReplyingTo(null)} className="text-xs text-gray-500 hover:text-gray-900">Cancel</button>
              <span className="ml-auto text-[10px] text-gray-400">{replyToText.length}/5000</span>
            </div>
          </div>
        )}

        {(childMap.get(r.id) ?? []).map((child) => renderReply(child, true))}
      </div>
    )
  }

  return (
    <div>
      {/* Post Card */}
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex gap-5">
            <div className="hidden sm:block">
              <UpvoteBtn active={upvotedPosts.has(post.id)} count={postVoteCount} onClick={togglePostUpvote} disabled={userId === post.user_id || !userId} size="lg" />
            </div>
            <div className="min-w-0 flex-1">
              <AuthorLine prof={post.profiles as any} createdAt={post.created_at} edited={post.updated_at !== post.created_at} />
              <h1 className="mt-3 text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">{post.title}</h1>
              <div className="mt-5 text-base leading-7 text-gray-700">{nl2br(post.content)}</div>
              {/* Mobile upvote */}
              <div className="mt-4 flex items-center gap-3 sm:hidden">
                <UpvoteBtn active={upvotedPosts.has(post.id)} count={postVoteCount} onClick={togglePostUpvote} disabled={userId === post.user_id || !userId} />
                <span className="text-xs text-gray-400">{activeReplyCount} replies</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Input */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">{activeReplyCount} {activeReplyCount === 1 ? 'Reply' : 'Replies'}</h2>
        {userId ? (
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
              <span>Posting as:</span>
              <span className="font-semibold text-gray-900">{myUsername ?? 'Anonymous'}</span>
              <ReputationBadge points={myRepPoints} />
            </div>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} maxLength={5000} placeholder="Share your thoughts..." className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:ring-2 focus:ring-red-500 focus:border-red-500" />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">{replyText.length}/5,000</span>
              <button onClick={() => submitReply()} disabled={!replyText.trim() || posting} className="rounded-lg bg-[#DC2626] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                {posting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 text-center text-sm text-gray-500">
            <a href="/auth/login?next=/community" className="font-semibold text-[#DC2626] hover:underline">Log in</a> to join the discussion
          </div>
        )}
      </div>

      {/* Replies */}
      {topLevel.length > 0 ? (
        <div className="space-y-3">
          {topLevel.map((r) => renderReply(r))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-8 py-12 text-center">
          <p className="text-sm text-gray-400">No replies yet. Be the first to share your thoughts.</p>
        </div>
      )}
    </div>
  )
}
