import { createServiceClient, createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { NextRequest, NextResponse } from 'next/server'

const MARKER_TITLE = 'what are you guys charging per hour fully loaded for plumbing'

const USERNAMES = [
  'WrenchKing_TX', 'SparkyMike', 'RoofDog_AZ', 'PaintPro_Mike', 'HVACHero',
  'ConcreteCarl', 'FenceGuy_FL', 'CleanSweep_LA', 'HandyDan', 'TreeTopTom',
]

type Reply = { author: string; content: string; upvotes: number; hoursAfter: number }
type Post = { cat: string; title: string; content: string; author: string; upvotes: number; daysAgo: number; replies: Reply[] }

const NEW_POSTS: Post[] = [
  {
    cat: 'business-advice',
    title: 'what are you guys charging per hour fully loaded for plumbing',
    content: "trying to figure out if im undercharging. Currently at $135/hr fully loaded (truck, insurance, tools, overhead, profit) for residential service calls in Houston. Some guys on facebook are saying theyre at $175-200 and I cant figure out how theyre getting customers at that rate. whats everyone charging and what market are you in. looking for real numbers not what you THINK you should charge",
    author: 'WrenchKing_TX',
    upvotes: 19,
    daysAgo: 2,
    replies: [
      { author: 'HVACHero', content: "I'm not plumbing but HVAC and I'm at $165/hr fully loaded in Denver. $135 sounds low for Houston honestly, especially with what insurance costs down there. Have you recalculated your overhead recently? A lot of guys are still using numbers from 2-3 years ago and wondering why they're not making money.", upvotes: 8, hoursAfter: 3 },
      { author: 'SparkyMike', content: "$155 in Dallas for electrical... plumbing should be similar or higher honestly. you guys deal with way more liability and materials costs. $135 in houston is probably leaving money on the table", upvotes: 6, hoursAfter: 5 },
      { author: 'ConcreteCarl', content: "Charge more. Next question", upvotes: 14, hoursAfter: 8 },
      { author: 'PaintPro_Mike', content: "ok so this is a real sore subject for me because I see plumbers charging $135-200/hr and meanwhile painting contractors are out here getting beat up on price because everyone thinks their nephew with a roller can do it for $15/hr. the trades are not created equal when it comes to what the market will bear and I think plumbers have it way easier than most trades when it comes to pricing because nobody wants to deal with their own sewage. just my 2 cents. anyway to answer your question $135 seems low for a major metro", upvotes: 3, hoursAfter: 10 },
      { author: 'RoofDog_AZ', content: "lol painters complaining about pricing in a plumbing thread. classic", upvotes: 11, hoursAfter: 12 },
      { author: 'PaintPro_Mike', content: "wasnt complaining just making a point. sorry that reading comprehension isnt included in a roofing license", upvotes: 7, hoursAfter: 12 },
      { author: 'RoofDog_AZ', content: "dont need reading comprehension when im making $340k contracts. how much is your biggest job mike? a bedroom accent wall?", upvotes: 9, hoursAfter: 13 },
      { author: 'HandyDan', content: "lmao this thread went off the rails fast. anyway wrenchking I do handyman work so different ballgame but I always check what the plumbers in my area charge before I quote any plumbing-adjacent stuff. In atlanta most guys are $150-175 for residential service", upvotes: 5, hoursAfter: 14 },
      { author: 'PaintPro_Mike', content: "my biggest job was a $89K commercial repaint on a 3 story office building but go off I guess. at least my work doesnt blow off in a thunderstorm", upvotes: 6, hoursAfter: 14 },
      { author: 'FenceGuy_FL', content: "can you two shut up and let the man get his answer. wrenchking $135 is low. im in tampa not even plumbing and I know plumbers here getting $160-185. raise your rate $20 tomorrow nobody will even notice", upvotes: 12, hoursAfter: 15 },
      { author: 'RoofDog_AZ', content: "ok 89k is legit ill give you that. but you started it", upvotes: 4, hoursAfter: 15 },
      { author: 'WrenchKing_TX', content: "well this was helpful and entertaining lol. sounds like the consensus is I need to bump up to at least $155-165. appreciate the real numbers guys. mike and roofdog yall need to get a room", upvotes: 15, hoursAfter: 16 },
      { author: 'CleanSweep_LA', content: "Late to this but wanted to add context. When I started my cleaning company I charged $35/hr because I was scared to lose customers. Now we're at $85/hr for residential and $110/hr for commercial and we're busier than ever. The customers you lose by raising prices are almost always the worst customers anyway. Raise your rate, WrenchKing.", upvotes: 10, hoursAfter: 18 },
      { author: 'TreeTopTom', content: "what everyone else said — youre undercharging. also the fact that youre asking means you already know the answer. just do it", upvotes: 7, hoursAfter: 24 },
    ],
  },
  {
    cat: 'vent-zone',
    title: 'insurance company trying to lowball my claim',
    content: "so a drunk driver took out 40ft of a customers cedar fence that WE installed 3 months ago. Their insurance is trying to pay out based on 'depreciated value' of a 3 month old fence. ARE YOU KIDDING ME. The fence was $12,000 installed and theyre offering $4,800 because of 'wear and depreciation.' Its 3 months old!! theres no wear!! Ive been going back and forth with the adjuster for 2 weeks and im about to lose my mind. anyone dealt with this before",
    author: 'FenceGuy_FL',
    upvotes: 16,
    daysAgo: 1,
    replies: [
      { author: 'SparkyMike', content: "get your customer to hire a public adjuster... they work on contingency and they will fight the insurance company way harder than you or the customer can. dealt with this on a lightning strike job", upvotes: 7, hoursAfter: 4 },
      { author: 'TreeTopTom', content: "document everything — your original invoice, materials receipts, photos of the install and the damage. then file a complaint with the state insurance commissioner. insurance companies hate that", upvotes: 9, hoursAfter: 6 },
      { author: 'HVACHero', content: "The word 'depreciation' on a 3-month-old fence is laughable. That adjuster is hoping you'll go away. Don't. Escalate above them and reference your state's replacement cost statute if Florida has one.", upvotes: 6, hoursAfter: 8 },
      { author: 'ConcreteCarl', content: "Lawyer. Now. Not later", upvotes: 8, hoursAfter: 10 },
    ],
  },
  {
    cat: 'trade-talk',
    title: 'anyone else having issues with PEX fittings from lowes',
    content: "bought a batch of SharkBite PEX fittings from lowes last week and 3 out of 12 leaked on pressure test. Never had this issue before with the same product from my supply house. Starting to wonder if the big box stores are getting different quality batches than the supply houses. Anyone else noticing this or am I just unlucky",
    author: 'WrenchKing_TX',
    upvotes: 11,
    daysAgo: 3,
    replies: [
      { author: 'HVACHero', content: "I've heard this from a few plumber friends actually. The theory is that big box stores get a different SKU that's technically the same product but manufactured to different tolerances. Can't confirm but I stick to my supply house for anything going behind a wall.", upvotes: 6, hoursAfter: 5 },
      { author: 'RoofDog_AZ', content: "same thing happens with roofing nails from home depot vs my supplier. the box store ones bend way easier. you get what you pay for", upvotes: 4, hoursAfter: 8 },
      { author: 'HandyDan', content: "ngl I buy almost everything from the big box stores because the convenience but this is making me reconsider for fittings at least. a leak behind drywall is not something I want to deal with because I saved $2 on a fitting", upvotes: 5, hoursAfter: 12 },
      { author: 'ConcreteCarl', content: "Supply house. Always. For anything structural or pressure rated", upvotes: 7, hoursAfter: 24 },
    ],
  },
  {
    cat: 'wins',
    title: 'quit my W2 job 6 months ago — just had my first $20K month',
    content: "I know $20K in a month isnt crazy money to some of you guys running bigger operations but for me this is huge. I was making $65K/year as a maintenance tech for an apartment complex. Hated every minute of it. Started doing handyman work on the side, built up enough clients, and quit 6 months ago. Just closed out march at $20,400 in revenue. After expenses im probably netting around $14K which is already way more than I was making monthly at the apartment gig. Scared every day that itll dry up but right now its working",
    author: 'HandyDan',
    upvotes: 22,
    daysAgo: 4,
    replies: [
      { author: 'CleanSweep_LA', content: "That's amazing, Dan. And don't downplay $20K months — that's a $240K annual run rate in your first 6 months solo. Most businesses don't hit that in their first 2 years. Keep going.", upvotes: 11, hoursAfter: 3 },
      { author: 'WrenchKing_TX', content: "thats awesome man. the fear never fully goes away but it gets easier. just keep stacking customers and the repeat business will smooth out the slow months", upvotes: 8, hoursAfter: 5 },
      { author: 'SparkyMike', content: "love to see it... the jump from W2 to self employed is the scariest and best decision youll ever make. congrats", upvotes: 6, hoursAfter: 7 },
      { author: 'ConcreteCarl', content: "20K months as a solo handyman. Thats legit. Dont let anyone tell you otherwise", upvotes: 9, hoursAfter: 10 },
      { author: 'FenceGuy_FL', content: "dude I was in the exact same spot 2 years ago. maintenance tech making nothing, started on the side, jumped ship. best decision of my life. youre gonna look back on this post in a year and laugh at how scared you were", upvotes: 7, hoursAfter: 12 },
    ],
  },
  {
    cat: 'off-topic',
    title: 'gas station breakfast burrito rankings and I will not be taking questions',
    content: "1. Buc-ees brisket burrito. 2. QuikTrip loaded breakfast burrito. 3. Wawa sizzli. 4. 7-eleven if youre desperate. 5. Gas station sushi (just kidding dont ever do this). This is the definitive list and I will die on this hill",
    author: 'ConcreteCarl',
    upvotes: 21,
    daysAgo: 5,
    replies: [
      { author: 'WrenchKing_TX', content: "bucees is not a gas station its a religious experience. also you forgot Sheetz which means your list is invalid", upvotes: 13, hoursAfter: 2 },
      { author: 'RoofDog_AZ', content: "no circle K?? the tornado burrito is elite and I wont hear otherwise", upvotes: 5, hoursAfter: 3 },
      { author: 'FenceGuy_FL', content: "wawa above 7-eleven is the only correct take on this list. but you sleeping on Racetrac", upvotes: 4, hoursAfter: 4 },
      { author: 'HandyDan', content: "the fact that grown men running businesses are arguing about gas station burritos at 6am is exactly why I joined this site lol", upvotes: 16, hoursAfter: 5 },
      { author: 'SparkyMike', content: "I feel personally attacked that QT is only #2... thats a top tier burrito and the price point is unbeatable", upvotes: 3, hoursAfter: 6 },
      { author: 'PaintPro_Mike', content: "yall are gonna have a collective heart attack by 50 eating gas station food every morning. but also bucees #1 is correct", upvotes: 8, hoursAfter: 8 },
      { author: 'TreeTopTom', content: "this thread is peak contractor content honestly", upvotes: 6, hoursAfter: 10 },
    ],
  },
]

type ExistingReply = { parentTitle: string; author: string; content: string; daysAgo: number; hoursOffset: number }

const NEW_REPLIES_ON_EXISTING: ExistingReply[] = [
  // final four picks??
  { parentTitle: 'final four picks??', author: 'ConcreteCarl', content: "houston won. called it. everyone who said duke owes me a beer", daysAgo: 1, hoursOffset: 0 },
  { parentTitle: 'final four picks??', author: 'SparkyMike', content: "I said auburn and I stand by it... they got robbed by the refs in the semis", daysAgo: 0, hoursOffset: 20 },
  { parentTitle: 'final four picks??', author: 'HandyDan', content: "my bracket was toast after the first round so I stopped caring lol", daysAgo: 0, hoursOffset: 18 },
  // what truck are you guys running
  { parentTitle: 'what truck are you guys running', author: 'CleanSweep_LA', content: "Just ordered a Transit for our 4th van. We're officially a Transit fleet. My guys love them for commercial cleaning because you can stand up inside.", daysAgo: 2, hoursOffset: 0 },
  { parentTitle: 'what truck are you guys running', author: 'ConcreteCarl', content: "standing up inside a van. thats soft. but I respect the hustle", daysAgo: 1, hoursOffset: 0 },
  // mechanics lien literally saved my business
  { parentTitle: 'mechanics lien literally saved my business', author: 'HandyDan', content: "just looked up the lien laws in georgia and wow I had no idea I had this option. filing one next week on a customer who owes me $2,800. thanks for this post", daysAgo: 1, hoursOffset: 0 },
  { parentTitle: 'mechanics lien literally saved my business', author: 'TreeTopTom', content: "glad it helped — seriously every contractor should know their lien rights. its literally free leverage", daysAgo: 0, hoursOffset: 20 },
  // scope creep is killing me
  { parentTitle: 'scope creep is killing me', author: 'FenceGuy_FL', content: "had one last week. lady hired me for a 60ft fence. day of install she asks if I can 'also trim some trees that are in the way.' maam I am a fence guy not a tree guy", daysAgo: 2, hoursOffset: 0 },
  { parentTitle: 'scope creep is killing me', author: 'TreeTopTom', content: "hey send those tree jobs my way lol", daysAgo: 1, hoursOffset: 0 },
]

function tsDaysAgo(d: number, hoursOffset = 0) {
  return new Date(Date.now() - d * 86400000 - hoursOffset * 3600000).toISOString()
}

function addHours(iso: string, hours: number) {
  return new Date(new Date(iso).getTime() + hours * 3600000).toISOString()
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const admin = await createServiceClient()
  const force = new URL(req.url).searchParams.get('force') === 'true'

  // Check marker
  const { data: marker } = await admin.from('forum_posts').select('id').eq('title', MARKER_TITLE).limit(1)
  const alreadySeeded = !!(marker && marker.length > 0)

  // Load seed users
  const { data: profiles } = await admin.from('profiles').select('id, display_username').in('display_username', USERNAMES)
  const userMap = new Map<string, string>()
  for (const p of profiles ?? []) userMap.set(p.display_username as string, p.id as string)
  if (userMap.size < USERNAMES.length) {
    return NextResponse.json({ error: 'Missing seed profiles. Run /api/admin/seed-forum first.', found: userMap.size }, { status: 400 })
  }

  if (alreadySeeded) {
    if (!force) return NextResponse.json({ message: 'Already seeded. Pass ?force=true to re-create.' })

    // Delete seed-2 posts (cascades replies + upvotes)
    const titles = NEW_POSTS.map((p) => p.title)
    await admin.from('forum_posts').delete().in('title', titles)

    // Delete replies added to existing threads
    for (const r of NEW_REPLIES_ON_EXISTING) {
      const { data: parent } = await admin.from('forum_posts').select('id').eq('title', r.parentTitle).maybeSingle()
      if (!parent) continue
      const authorId = userMap.get(r.author)
      if (!authorId) continue
      await admin.from('forum_replies').delete().eq('post_id', parent.id).eq('user_id', authorId).eq('content', r.content)
    }
  }

  const { data: cats } = await admin.from('forum_categories').select('id, slug')
  const catMap = new Map<string, string>()
  for (const c of cats ?? []) catMap.set(c.slug as string, c.id as string)

  let postCount = 0, replyCount = 0, upvoteCount = 0, existingReplyCount = 0

  for (const post of NEW_POSTS) {
    const catId = catMap.get(post.cat)
    const authorId = userMap.get(post.author)
    if (!catId || !authorId) { console.error('Missing cat/author:', post.cat, post.author); continue }

    const postCreatedAt = tsDaysAgo(post.daysAgo)
    const { data: newPost, error: postErr } = await admin.from('forum_posts').insert({
      category_id: catId,
      user_id: authorId,
      title: post.title,
      content: post.content,
      upvote_count: 0,
      reply_count: 0,
      created_at: postCreatedAt,
      updated_at: postCreatedAt,
    }).select('id').single()

    if (postErr || !newPost) { console.error('Post insert error:', postErr?.message); continue }
    postCount++

    for (const reply of post.replies) {
      const replyAuthorId = userMap.get(reply.author)
      if (!replyAuthorId) continue
      const replyAt = addHours(postCreatedAt, reply.hoursAfter)
      const { error: replyErr } = await admin.from('forum_replies').insert({
        post_id: newPost.id,
        user_id: replyAuthorId,
        content: reply.content,
        upvote_count: reply.upvotes,
        created_at: replyAt,
        updated_at: replyAt,
      })
      if (!replyErr) replyCount++
      else console.error('Reply insert error:', replyErr.message)
    }

    // Upvote records (capped at number of other users = 9)
    const otherUserIds = Array.from(userMap.entries()).filter(([u]) => u !== post.author).map(([, id]) => id)
    const numUpvotes = Math.min(post.upvotes, otherUserIds.length)
    const shuffled = [...otherUserIds].sort(() => Math.random() - 0.5).slice(0, numUpvotes)
    for (const uid of shuffled) {
      const { error } = await admin.from('forum_upvotes').insert({ user_id: uid, post_id: newPost.id })
      if (!error) upvoteCount++
    }

    // Override trigger drift — set exact upvote_count the user specified
    await admin.from('forum_posts').update({ upvote_count: post.upvotes }).eq('id', newPost.id)
  }

  // Replies on existing threads
  for (const r of NEW_REPLIES_ON_EXISTING) {
    const { data: parent } = await admin.from('forum_posts').select('id').eq('title', r.parentTitle).maybeSingle()
    if (!parent) { console.error('Missing parent post:', r.parentTitle); continue }
    const authorId = userMap.get(r.author)
    if (!authorId) continue
    const replyAt = tsDaysAgo(r.daysAgo, r.hoursOffset)
    const { error } = await admin.from('forum_replies').insert({
      post_id: parent.id,
      user_id: authorId,
      content: r.content,
      created_at: replyAt,
      updated_at: replyAt,
    })
    if (!error) existingReplyCount++
    else console.error('Existing-thread reply error:', error.message)
  }

  return NextResponse.json({
    message: 'seed-forum-2 complete',
    posts: postCount,
    newThreadReplies: replyCount,
    repliesOnExistingThreads: existingReplyCount,
    upvoteRecords: upvoteCount,
    forced: force && alreadySeeded,
  })
}
