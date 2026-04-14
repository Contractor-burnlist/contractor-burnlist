import { createServiceClient, createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

const SEED_DOMAIN = 'contractor-burnlist-seed.com'

function rank(pts: number) {
  if (pts >= 200) return 'Legend'
  if (pts >= 100) return 'Expert'
  if (pts >= 60) return 'Veteran'
  if (pts >= 30) return 'Trusted Voice'
  if (pts >= 10) return 'Contributor'
  return 'Rookie'
}

export async function POST() {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const admin = await createServiceClient()

  const { data: seedProfiles } = await admin
    .from('profiles')
    .select('id, display_username')
    .ilike('email', `%@${SEED_DOMAIN}`)

  if (!seedProfiles || seedProfiles.length === 0) {
    return NextResponse.json({ error: 'No seed profiles found' }, { status: 404 })
  }

  const seedUserIds = seedProfiles.map((p) => p.id as string)
  const seedIdSet = new Set(seedUserIds)

  const { data: seedPosts } = await admin
    .from('forum_posts')
    .select('id, user_id, upvote_count')
    .in('user_id', seedUserIds)

  const { data: seedReplies } = await admin
    .from('forum_replies')
    .select('id, user_id, post_id, upvote_count')
    .in('user_id', seedUserIds)

  const posts = seedPosts ?? []
  const replies = seedReplies ?? []

  // Remove existing upvotes FROM seed users to avoid UNIQUE violations on re-insert.
  // Delete triggers will churn upvote_count/reputation; we reset both afterward.
  await admin.from('forum_upvotes').delete().in('user_id', seedUserIds)

  // Reset upvote_count on seed content to 0 so trigger-based increments land on a clean slate.
  if (posts.length > 0) {
    await admin.from('forum_posts').update({ upvote_count: 0 }).in('id', posts.map((p) => p.id))
  }
  if (replies.length > 0) {
    await admin.from('forum_replies').update({ upvote_count: 0 }).in('id', replies.map((r) => r.id))
  }

  let postUpvoteCount = 0
  let replyUpvoteCount = 0

  // Per-author tallies for final reputation calc
  const postUpvotesReceived = new Map<string, number>()
  const replyUpvotesReceived = new Map<string, number>()

  for (const post of posts) {
    const target = (post.upvote_count as number) ?? 0
    if (target <= 0) continue
    const authorId = post.user_id as string
    const voters = seedUserIds.filter((id) => id !== authorId)
    const n = Math.min(target, voters.length)
    const picks = [...voters].sort(() => Math.random() - 0.5).slice(0, n)
    for (const uid of picks) {
      const { error } = await admin.from('forum_upvotes').insert({ user_id: uid, post_id: post.id })
      if (!error) postUpvoteCount++
      else console.error('Post upvote insert error:', error.message)
    }
    postUpvotesReceived.set(authorId, (postUpvotesReceived.get(authorId) ?? 0) + picks.length)
    // Pin final upvote_count to actual inserted count (overrides any trigger drift)
    await admin.from('forum_posts').update({ upvote_count: picks.length }).eq('id', post.id)
  }

  for (const reply of replies) {
    const target = (reply.upvote_count as number) ?? 0
    if (target <= 0) continue
    const authorId = reply.user_id as string
    const voters = seedUserIds.filter((id) => id !== authorId)
    const n = Math.min(target, voters.length)
    const picks = [...voters].sort(() => Math.random() - 0.5).slice(0, n)
    for (const uid of picks) {
      const { error } = await admin.from('forum_upvotes').insert({ user_id: uid, reply_id: reply.id })
      if (!error) replyUpvoteCount++
      else console.error('Reply upvote insert error:', error.message)
    }
    replyUpvotesReceived.set(authorId, (replyUpvotesReceived.get(authorId) ?? 0) + picks.length)
    await admin.from('forum_replies').update({ upvote_count: picks.length }).eq('id', reply.id)
  }

  // Recalculate reputation from scratch
  const postsByAuthor = new Map<string, number>()
  for (const p of posts) postsByAuthor.set(p.user_id as string, (postsByAuthor.get(p.user_id as string) ?? 0) + 1)

  // Feedback comments authored by seed users
  const { data: feedbackComments } = await admin
    .from('comments')
    .select('id, user_id')
    .in('user_id', seedUserIds)
    .eq('is_deleted', false)

  const commentsByAuthor = new Map<string, string[]>()
  for (const c of feedbackComments ?? []) {
    const arr = commentsByAuthor.get(c.user_id as string) ?? []
    arr.push(c.id as string)
    commentsByAuthor.set(c.user_id as string, arr)
  }

  // Comment likes received
  const allCommentIds = (feedbackComments ?? []).map((c) => c.id as string)
  const likesByComment = new Map<string, number>()
  if (allCommentIds.length > 0) {
    const { data: likes } = await admin
      .from('comment_likes')
      .select('comment_id')
      .in('comment_id', allCommentIds)
    for (const l of likes ?? []) {
      likesByComment.set(l.comment_id as string, (likesByComment.get(l.comment_id as string) ?? 0) + 1)
    }
  }

  let profilesUpdated = 0
  for (const prof of seedProfiles) {
    const id = prof.id as string
    const postsAuthored = postsByAuthor.get(id) ?? 0
    const postUps = postUpvotesReceived.get(id) ?? 0
    const replyUps = replyUpvotesReceived.get(id) ?? 0
    const commentsAuthored = (commentsByAuthor.get(id) ?? []).length
    const commentLikesReceived = (commentsByAuthor.get(id) ?? [])
      .reduce((sum, cid) => sum + (likesByComment.get(cid) ?? 0), 0)

    const points =
      postsAuthored * 3 +
      postUps * 2 +
      replyUps * 1 +
      commentsAuthored * 2 +
      commentLikesReceived * 3

    const { error } = await admin
      .from('profiles')
      .update({ reputation_points: points, reputation_rank: rank(points) })
      .eq('id', id)
    if (!error) profilesUpdated++
    else console.error('Profile rep update error:', prof.display_username, error.message)
  }

  // seedIdSet is used implicitly by filters above; kept defined for clarity.
  void seedIdSet

  return NextResponse.json({
    message: `Created ${postUpvoteCount} post upvotes, ${replyUpvoteCount} reply upvotes. Updated reputation for ${profilesUpdated} profiles.`,
    seedProfiles: seedProfiles.length,
    posts: posts.length,
    replies: replies.length,
  })
}
