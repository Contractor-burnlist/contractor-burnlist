'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getReputation } from '@/lib/reputation'
import ReputationBadge from '@/components/ReputationBadge'

type Comment = {
  id: string
  content: string
  user_id: string
  parent_comment_id: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
  display_username: string | null
  is_verified: boolean
  reputation_points: number
  like_count: number
  liked_by_me: boolean
  replies: Comment[]
}

type SortMode = 'likes' | 'newest'

export default function CommentSection({
  entryId,
  workerEntryId,
}: {
  entryId?: string
  workerEntryId?: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [posting, setPosting] = useState(false)
  const [sort, setSort] = useState<SortMode>('likes')
  const [showAll, setShowAll] = useState(false)
  const [myUsername, setMyUsername] = useState<string | null>(null)
  const [myRepPoints, setMyRepPoints] = useState(0)

  const loadComments = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUserId(user?.id ?? null)

    if (user) {
      const { data: myProf } = await supabase.from('profiles').select('display_username, reputation_points').eq('id', user.id).single()
      setMyUsername(myProf?.display_username ?? null)
      setMyRepPoints(myProf?.reputation_points ?? 0)
    }

    const filterKey = entryId ? 'entry_id' : 'worker_entry_id'
    const filterVal = entryId ?? workerEntryId

    const { data: rawComments } = await supabase
      .from('comments')
      .select('id, content, user_id, parent_comment_id, is_deleted, created_at, updated_at, profiles(display_username, is_verified, reputation_points)')
      .eq(filterKey, filterVal!)
      .order('created_at', { ascending: true })

    if (!rawComments) { setLoading(false); return }

    // Get likes
    const commentIds = rawComments.map((c: any) => c.id)
    const { data: likes } = commentIds.length > 0
      ? await supabase.from('comment_likes').select('comment_id, user_id').in('comment_id', commentIds)
      : { data: [] }

    const likeMap = new Map<string, { count: number; likedByMe: boolean }>()
    for (const like of (likes ?? [])) {
      const entry = likeMap.get(like.comment_id) ?? { count: 0, likedByMe: false }
      entry.count++
      if (like.user_id === user?.id) entry.likedByMe = true
      likeMap.set(like.comment_id, entry)
    }

    const allComments: Comment[] = rawComments.map((c: any) => ({
      id: c.id,
      content: c.content,
      user_id: c.user_id,
      parent_comment_id: c.parent_comment_id,
      is_deleted: c.is_deleted,
      created_at: c.created_at,
      updated_at: c.updated_at,
      display_username: c.profiles?.display_username ?? null,
      is_verified: c.profiles?.is_verified ?? false,
      reputation_points: c.profiles?.reputation_points ?? 0,
      like_count: likeMap.get(c.id)?.count ?? 0,
      liked_by_me: likeMap.get(c.id)?.likedByMe ?? false,
      replies: [],
    }))

    // Thread: group replies under parents
    const topLevel: Comment[] = []
    const replyMap = new Map<string, Comment[]>()
    for (const c of allComments) {
      if (c.parent_comment_id) {
        const arr = replyMap.get(c.parent_comment_id) ?? []
        arr.push(c)
        replyMap.set(c.parent_comment_id, arr)
      } else {
        topLevel.push(c)
      }
    }
    for (const c of topLevel) {
      c.replies = replyMap.get(c.id) ?? []
    }

    setComments(topLevel)
    setLoading(false)
  }, [entryId, workerEntryId])

  useEffect(() => { loadComments() }, [loadComments])

  async function handlePost() {
    if (!newComment.trim() || posting) return
    setPosting(true)
    const supabase = createClient()
    const payload: Record<string, unknown> = {
      content: newComment.trim(),
      user_id: userId,
      ...(entryId ? { entry_id: entryId } : { worker_entry_id: workerEntryId }),
    }
    await supabase.from('comments').insert(payload)
    setNewComment('')
    setPosting(false)
    loadComments()
  }

  async function handleReply(parentId: string) {
    if (!replyText.trim() || posting) return
    setPosting(true)
    const supabase = createClient()
    const payload: Record<string, unknown> = {
      content: replyText.trim(),
      user_id: userId,
      parent_comment_id: parentId,
      ...(entryId ? { entry_id: entryId } : { worker_entry_id: workerEntryId }),
    }
    await supabase.from('comments').insert(payload)
    setReplyText('')
    setReplyingTo(null)
    setPosting(false)
    loadComments()
  }

  async function handleLike(commentId: string, liked: boolean) {
    const supabase = createClient()
    // Optimistic update
    setComments((prev) => prev.map((c) => {
      if (c.id === commentId) return { ...c, liked_by_me: !liked, like_count: c.like_count + (liked ? -1 : 1) }
      return { ...c, replies: c.replies.map((r) => r.id === commentId ? { ...r, liked_by_me: !liked, like_count: r.like_count + (liked ? -1 : 1) } : r) }
    }))
    if (liked) {
      await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId!)
    } else {
      await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId })
    }
  }

  async function handleEdit(commentId: string) {
    if (!editText.trim()) return
    const supabase = createClient()
    await supabase.from('comments').update({ content: editText.trim() }).eq('id', commentId)
    setEditingId(null)
    loadComments()
  }

  async function handleDelete(commentId: string) {
    if (!confirm('Are you sure? This can\'t be undone.')) return
    const supabase = createClient()
    await supabase.from('comments').update({ is_deleted: true }).eq('id', commentId)
    loadComments()
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const sorted = [...comments].sort((a, b) =>
    sort === 'likes' ? b.like_count - a.like_count : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const displayed = showAll ? sorted : sorted.slice(0, 10)
  const totalCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)

  function renderComment(c: Comment, isReply = false) {
    const rep = getReputation(c.reputation_points)
    const isAuthor = c.user_id === userId
    const isEditing = editingId === c.id
    const wasEdited = c.updated_at !== c.created_at && !c.is_deleted

    return (
      <div key={c.id} className={`${isReply ? 'ml-8 border-l-2 border-[#e5e7eb] pl-4' : ''}`}>
        <div className="py-3">
          {c.is_deleted ? (
            <p className="text-sm italic text-[#9ca3af]">[This comment has been removed]</p>
          ) : (
            <>
              {/* Author line */}
              <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-[#111111]">{c.display_username ?? 'Anonymous Contractor'}</span>
                {c.is_verified && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-green-600">
                    <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.15"/>
                    <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <span className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${rep.color} ${rep.bg} ${rep.border}`}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" className={rep.color}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
                  {rep.rank}
                </span>
                <span className="text-[#9ca3af]">{timeAgo(c.created_at)}</span>
                {wasEdited && <span className="text-[#9ca3af]">(edited)</span>}
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea value={editText} onChange={(e) => setEditText(e.target.value)} maxLength={2000} rows={3} className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#DC2626]" />
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(c.id)} className="rounded bg-[#DC2626] px-3 py-1 text-xs font-semibold text-white hover:bg-red-700">Save</button>
                    <button onClick={() => setEditingId(null)} className="rounded border border-[#e5e7eb] px-3 py-1 text-xs text-[#6b7280] hover:border-[#d1d5db]">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#374151] whitespace-pre-wrap">{c.content}</p>
              )}

              {/* Actions */}
              {!isEditing && (
                <div className="mt-2 flex items-center gap-3">
                  {!isAuthor && userId && (
                    <button onClick={() => handleLike(c.id, c.liked_by_me)} className={`flex items-center gap-1 text-xs transition-colors ${c.liked_by_me ? 'text-[#DC2626]' : 'text-[#9ca3af] hover:text-[#DC2626]'}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={c.liked_by_me ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                      </svg>
                      {c.like_count > 0 && c.like_count}
                    </button>
                  )}
                  {isAuthor && c.like_count > 0 && (
                    <span className="flex items-center gap-1 text-xs text-[#9ca3af]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#DC2626]">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                      </svg>
                      {c.like_count}
                    </span>
                  )}
                  {!isReply && userId && (
                    <button onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText('') }} className="text-xs text-[#9ca3af] hover:text-[#111111]">Reply</button>
                  )}
                  {isAuthor && (
                    <>
                      <button onClick={() => { setEditingId(c.id); setEditText(c.content) }} className="text-xs text-[#9ca3af] hover:text-[#111111]">Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs text-[#9ca3af] hover:text-[#DC2626]">Delete</button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Reply input */}
        {replyingTo === c.id && (
          <div className="ml-8 mb-2 border-l-2 border-[#e5e7eb] pl-4">
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} maxLength={2000} rows={2} placeholder="Write a reply..." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
            <div className="mt-1.5 flex items-center gap-2">
              <button onClick={() => handleReply(c.id)} disabled={!replyText.trim() || posting} className="rounded bg-[#DC2626] px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">Reply</button>
              <button onClick={() => setReplyingTo(null)} className="text-xs text-[#6b7280]">Cancel</button>
              <span className="ml-auto text-xs text-[#9ca3af]">{replyText.length}/2000</span>
            </div>
          </div>
        )}

        {/* Replies */}
        {c.replies.map((r) => renderComment(r, true))}
      </div>
    )
  }

  if (loading) return null

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#111111]">Discussion ({totalCount})</h3>
        {totalCount > 1 && (
          <div className="flex gap-1 rounded bg-[#f9fafb] p-0.5">
            <button onClick={() => setSort('likes')} className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${sort === 'likes' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#9ca3af]'}`}>Top</button>
            <button onClick={() => setSort('newest')} className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${sort === 'newest' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#9ca3af]'}`}>New</button>
          </div>
        )}
      </div>

      {/* Comment input */}
      {userId ? (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-[#6b7280]">
            <span>Posting as:</span>
            {myUsername ? (
              <span className="font-semibold text-[#111111]">{myUsername}</span>
            ) : (
              <>
                <span className="text-[#9ca3af]">Anonymous Contractor</span>
                <span>—</span>
                <a href="/my-profile" className="font-semibold text-[#DC2626] hover:underline">Set a username</a>
              </>
            )}
            <ReputationBadge points={myRepPoints} />
          </div>
          <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} maxLength={2000} rows={2} placeholder="Share your experience or insight..." className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]" />
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-[10px] text-[#9ca3af]">Your identity is anonymous. Others only see your username and reputation rank.</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9ca3af]">{newComment.length}/2000</span>
              <button onClick={handlePost} disabled={!newComment.trim() || posting} className="rounded bg-[#DC2626] px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-center text-sm text-[#6b7280]">
          <a href="/auth/login" className="font-semibold text-[#DC2626] hover:underline">Log in</a> to join the discussion
        </div>
      )}

      {/* Comments list */}
      {displayed.length > 0 ? (
        <div className="divide-y divide-[#e5e7eb]">
          {displayed.map((c) => renderComment(c))}
        </div>
      ) : (
        <p className="py-4 text-center text-xs text-[#9ca3af]">No comments yet. Be the first to share your insight.</p>
      )}

      {!showAll && comments.length > 10 && (
        <button onClick={() => setShowAll(true)} className="mt-3 w-full rounded border border-[#e5e7eb] py-2 text-xs font-medium text-[#6b7280] hover:border-[#d1d5db] hover:text-[#111111]">
          Show all {totalCount} comments
        </button>
      )}
    </div>
  )
}
