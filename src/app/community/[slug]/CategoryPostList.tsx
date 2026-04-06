'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ReputationBadge from '@/components/ReputationBadge'

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}

export default function CategoryPostList({ posts, slug }: { posts: any[]; slug: string }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
      if (user) {
        const postIds = posts.map((p) => p.id)
        if (postIds.length > 0) {
          supabase.from('forum_upvotes').select('post_id').eq('user_id', user.id).in('post_id', postIds)
            .then(({ data }) => setUpvoted(new Set((data ?? []).map((u: any) => u.post_id))))
        }
      }
    })
  }, [posts])

  async function toggleUpvote(postId: string) {
    if (!userId) return
    const supabase = createClient()
    if (upvoted.has(postId)) {
      await supabase.from('forum_upvotes').delete().eq('user_id', userId).eq('post_id', postId)
      setUpvoted((prev) => { const n = new Set(prev); n.delete(postId); return n })
    } else {
      await supabase.from('forum_upvotes').insert({ user_id: userId, post_id: postId })
      setUpvoted((prev) => new Set(prev).add(postId))
    }
  }

  return (
    <div className="space-y-3">
      {posts.length === 0 && (
        <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-8 py-16 text-center">
          <p className="text-sm text-[#9ca3af]">No posts yet. Be the first to start a discussion!</p>
        </div>
      )}
      {posts.map((post: any) => {
        const isUpvoted = upvoted.has(post.id)
        const isAuthor = post.user_id === userId
        const prof = post.profiles as any
        return (
          <div key={post.id} className="flex gap-4 rounded-xl border border-[#e5e7eb] bg-white p-5 transition-colors hover:border-[#d1d5db]">
            <div className="flex flex-col items-center gap-0.5">
              <button
                onClick={() => !isAuthor && toggleUpvote(post.id)}
                disabled={isAuthor || !userId}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${isUpvoted ? 'bg-[#DC2626] text-white shadow-sm' : 'bg-[#f4f4f5] text-[#9ca3af] hover:bg-[#e5e7eb] hover:text-[#DC2626]'} disabled:opacity-30`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill={isUpvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2l5 5H2z"/></svg>
              </button>
              <span className={`text-xs font-bold ${isUpvoted ? 'text-[#DC2626]' : 'text-[#6b7280]'}`}>{post.upvote_count}</span>
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/community/${slug}/${post.id}`} className="block">
                <h3 className="text-base font-bold text-[#111111] transition-colors hover:text-[#DC2626]">
                  {post.is_pinned && <span className="mr-1.5 text-[#9ca3af]">📌</span>}
                  {post.title}
                </h3>
              </Link>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6b7280] line-clamp-2">{post.content?.slice(0, 200)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-xs font-semibold text-[#111111]">{prof?.display_username ?? 'Anonymous'}</span>
                {prof?.trade && <span className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-2 py-0.5 text-[10px] font-medium text-[#6b7280]">{prof.trade}</span>}
                <ReputationBadge points={prof?.reputation_points ?? 0} />
                <span className="text-[10px] text-[#9ca3af]">·</span>
                <span className="text-[10px] text-[#9ca3af]">{post.reply_count} replies</span>
                <span className="text-[10px] text-[#9ca3af]">·</span>
                <span className="text-[10px] text-[#9ca3af]">{timeAgo(post.created_at)}</span>
                {post.is_locked && <span className="text-[10px] text-amber-600">🔒 Locked</span>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
