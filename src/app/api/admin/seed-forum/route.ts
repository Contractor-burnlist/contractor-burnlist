import { createServiceClient, createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

const SEED_DOMAIN = 'contractor-burnlist-seed.com'

const PROFILES = [
  { username: 'WrenchKing_TX', trade: 'Plumbing', business_name: 'WK Plumbing Solutions', reputation_points: 95, city: 'Houston', state: 'TX' },
  { username: 'SparkyMike', trade: 'Electrical', business_name: 'Mikes Electrical', reputation_points: 72, city: 'Dallas', state: 'TX' },
  { username: 'RoofDog_AZ', trade: 'Roofing', business_name: 'Desert Roofing Co', reputation_points: 110, city: 'Phoenix', state: 'AZ' },
  { username: 'PaintPro_Mike', trade: 'Painting', business_name: 'Pro Coat Painting', reputation_points: 45, city: 'San Diego', state: 'CA' },
  { username: 'HVACHero', trade: 'HVAC', business_name: 'Hero HVAC Services', reputation_points: 88, city: 'Denver', state: 'CO' },
  { username: 'ConcreteCarl', trade: 'Concrete', business_name: 'Carl\'s Concrete', reputation_points: 63, city: 'Austin', state: 'TX' },
  { username: 'FenceGuy_FL', trade: 'Fencing', business_name: 'Gulf Coast Fencing', reputation_points: 38, city: 'Tampa', state: 'FL' },
  { username: 'CleanSweep_LA', trade: 'Cleaning', business_name: 'CleanSweep Commercial', reputation_points: 105, city: 'Los Angeles', state: 'CA' },
  { username: 'HandyDan', trade: 'Handyman', business_name: 'Dan\'s Handyman', reputation_points: 28, city: 'Atlanta', state: 'GA' },
  { username: 'TreeTopTom', trade: 'Tree Service', business_name: 'TreeTop Removal', reputation_points: 51, city: 'Portland', state: 'OR' },
]

function rank(pts: number) {
  if (pts >= 200) return 'Legend'
  if (pts >= 100) return 'Expert'
  if (pts >= 60) return 'Veteran'
  if (pts >= 30) return 'Trusted Voice'
  if (pts >= 10) return 'Contributor'
  return 'Rookie'
}

function daysAgo(d: number, hourOffset = 0) {
  return new Date(Date.now() - d * 86400000 - hourOffset * 3600000).toISOString()
}

type Post = { cat: string; title: string; content: string; author: string; upvotes: number; daysAgo: number; replies: { author: string; content: string; hoursAfter: number }[] }

const POSTS: Post[] = [
  // VENT ZONE
  { cat: 'vent-zone', title: 'customer ghosted on a $8200 tile job', content: 'finished a full bathroom remodel last october. Tile, fixtures, all of it. Customer signed the completion form, shook my hand, said check was in the mail. That was 3 months ago. Phones disconnected. Drove by the house last week and theres a damn for sale sign in the yard. $8200 just gone. Ive been doing this 14 years and this one still gets me. anyone else dealt with something like this? starting to think I need to require payment before I leave the site on everything', author: 'WrenchKing_TX', upvotes: 18, daysAgo: 14, replies: [
    { author: 'SparkyMike', content: 'had a customer bounce a $3400 check on me last year... by the time the bank told me she already hired someone else to \'fix\' my work. some people man', hoursAfter: 3 },
    { author: 'ConcreteCarl', content: 'File a mechanics lien. Yesterday', hoursAfter: 4 },
    { author: 'RoofDog_AZ', content: 'this is why i do 50% upfront on anything over 5k. lost too much money learning that one', hoursAfter: 7 },
    { author: 'HandyDan', content: 'ngl thats brutal. definitely post them on here so the rest of us know', hoursAfter: 12 },
  ]},
  { cat: 'vent-zone', title: 'lady threatened to call cops because I showed up at 8am', content: 'so get this. Contract clearly says work starts at 8am monday. I pull up at 7:55, start unloading my gear and this lady comes flying out the front door in her bathrobe screaming about how im trespassing and shes calling the police. I literally have her signature on a contract that says 8am start. I tried to show her and she wasnt having it. Told me to get off her property. So I packed up my stuff and left. Called her later and she acted like nothing happened and asked when I was coming back. I said im not. lifes too short for that kind of crazy', author: 'PaintPro_Mike', upvotes: 24, daysAgo: 11, replies: [
    { author: 'HandyDan', content: 'lmao I had one call the HOA on me for parking my van in front of her house. the van that was there to fix HER fence', hoursAfter: 2 },
    { author: 'FenceGuy_FL', content: 'always get it in writing always show the contract always have a witness. CYA forever', hoursAfter: 5 },
    { author: 'CleanSweep_LA', content: "I've started texting the morning of to confirm. Just a quick 'Hey, crew arriving at 8am as scheduled.' Saves so much drama.", hoursAfter: 8 },
    { author: 'ConcreteCarl', content: 'Shoulda called the cops yourself lol let them read the contract to her', hoursAfter: 14 },
  ]},
  { cat: 'vent-zone', title: 'scope creep is killing me', content: "Got hired for a straightforward AC unit replacement. $4,800 job, quoted and signed. I'm halfway through and the homeowner starts with 'while you're here, can you take a look at the ductwork?' Then the thermostat. Then a bathroom vent fan that 'doesn't seem right.' Before I know it she's got a $12,000 wishlist going and she's genuinely shocked when I tell her that's all separate work with separate costs. 'But you're already here!' Yes ma'am and my time isnt free. This happens at least once a month.", author: 'HVACHero', upvotes: 21, daysAgo: 9, replies: [
    { author: 'TreeTopTom', content: "I literally have a laminated card I hand people that says 'additional work requires a separate estimate' — saved my sanity", hoursAfter: 4 },
    { author: 'WrenchKing_TX', content: "the 'while youre here' tax. every contractor knows it", hoursAfter: 6 },
    { author: 'RoofDog_AZ', content: 'i just say sure let me write that up as a change order and hand them a price. shuts it down real quick', hoursAfter: 11 },
  ]},
  { cat: 'vent-zone', title: 'got a 1 star review because it RAINED', content: 'reroofed a house last month. perfect job passed inspection no issues. two weeks later monsoon season hits (its arizona, this happens every year) and her patio floods. she leaves me a 1 star review saying my roof caused flooding. maam thats a drainage issue not a roofing issue. tried to explain it to her and she said i was being \'dismissive\'. cant win', author: 'RoofDog_AZ', upvotes: 15, daysAgo: 6, replies: [
    { author: 'SparkyMike', content: 'reply to it professionally and move on... anyone in the trades will see right through it', hoursAfter: 2 },
    { author: 'ConcreteCarl', content: 'I got a 1 star because the customer didnt like the color of the concrete THEY picked. you cant make this stuff up', hoursAfter: 5 },
    { author: 'PaintPro_Mike', content: "had a customer leave me 2 stars because and I quote 'the paint smell gave me a headache.' it was paint. what did you think was gonna happen", hoursAfter: 9 },
  ]},
  { cat: 'vent-zone', title: 'cancelled the day before install and I already ordered materials', content: "customer wanted 200ft of cedar fence. We agreed on price signed the contract I went and ordered $4000 worth of cedar. DAY BEFORE install she calls and says she found someone cheaper and wants to cancel. I've got 4 grand in lumber sitting in my yard that was cut to her specifications. She says thats my problem not hers. I have a cancellation clause in my contract but good luck getting anything in small claims its not even worth the time off work. Im just tired of this crap. every time you think youve seen it all someone comes up with a new way to screw you", author: 'FenceGuy_FL', upvotes: 12, daysAgo: 3, replies: [
    { author: 'HandyDan', content: 'this is why deposits are non negotiable. material deposit before you order ANYTHING', hoursAfter: 1 },
    { author: 'PaintPro_Mike', content: 'take her to small claims anyway its the principle. plus the judge will see the signed contract and the receipts for materials and youll win', hoursAfter: 4 },
    { author: 'CleanSweep_LA', content: "Our contracts now have a clause that any materials ordered are non-refundable regardless of cancellation. Had our lawyer add it after a similar situation.", hoursAfter: 8 },
  ]},
  // BUSINESS ADVICE
  { cat: 'business-advice', title: 'raising prices on long term customers', content: "materials are up like 20% from last year. Labor costs up too. I need to raise my rates but ive got customers who have been with me 5-6 years... do you guys just raise it gradually or send some kind of letter or what? I dont want to lose the good ones but I also cant keep eating the cost", author: 'SparkyMike', upvotes: 16, daysAgo: 18, replies: [
    { author: 'HVACHero', content: "I send a rate update letter every January. Keep it professional, explain material costs are up across the industry, give 30 day notice. Most people get it. The ones who leave over a 10% increase werent your best customers.", hoursAfter: 5 },
    { author: 'ConcreteCarl', content: 'Just quote the new rate on the next job. Dont apologize for it', hoursAfter: 8 },
    { author: 'WrenchKing_TX', content: 'raised my hourly from $85 to $110 last year. Lost 2 customers gained 5 better ones. dont be afraid to charge what youre worth man', hoursAfter: 14 },
    { author: 'TreeTopTom', content: "I usually frame it as 'hey just want to be upfront - my rates are going up starting next month, heres what that looks like for your usual service' — being direct about it goes a long way", hoursAfter: 22 },
  ]},
  { cat: 'business-advice', title: 'thinking about hiring my first employee after 6 years solo', content: "been doing handyman work solo for 6 years now and im getting more calls than I can handle which is great but also stressful. thinking about bringing someone on but the whole liability insurance workers comp taxes thing is overwhelming. those of you who went from solo to having a crew was it actually worth it? what do I need to know before I jump", author: 'HandyDan', upvotes: 19, daysAgo: 12, replies: [
    { author: 'CleanSweep_LA', content: "Start with a 1099 sub, not a W-2 employee. Way less paperwork to start. Once you're consistently too busy for two people, then look at W-2.", hoursAfter: 3 },
    { author: 'FenceGuy_FL', content: 'workers comp alone will make you cry. but once you have 2-3 solid guys you can take on jobs that were impossible solo. my revenue doubled first year with a crew', hoursAfter: 7 },
    { author: 'SparkyMike', content: 'get a good accountant BEFORE you hire. not after. trust me on that one', hoursAfter: 11 },
    { author: 'RoofDog_AZ', content: 'screen them real good. one bad hire costs more than staying solo. check the worker database on here before you bring anyone on', hoursAfter: 26 },
  ]},
  { cat: 'business-advice', title: 'best invoicing app thats not $50/month?', content: "using quickbooks right now and it feels like massive overkill for my operation. I just need to send invoices track payments and maybe schedule jobs. what are you guys using? bonus points if it doesnt cost a fortune every month", author: 'TreeTopTom', upvotes: 11, daysAgo: 7, replies: [
    { author: 'PaintPro_Mike', content: 'Jobber. seriously changed my life. scheduling invoicing customer management all in one place and its not bad price wise', hoursAfter: 2 },
    { author: 'HandyDan', content: 'I used Invoice Ninja for like 2 years its free and open source. does the basics pretty well', hoursAfter: 6 },
    { author: 'HVACHero', content: "Housecall Pro if you want the whole package. It's not cheap but if you're doing any kind of volume it pays for itself.", hoursAfter: 10 },
  ]},
  { cat: 'business-advice', title: 'when do you walk away from a job', content: "Had a potential customer yesterday wanting a 2000 sqft driveway pour. Great job good money. But the guy was already arguing about price before we even signed anything, wanted to change the mix design to save money, and told me his last two concrete guys 'didnt work out.' Red flags everywhere. Walked away. What are your walk away signals", author: 'ConcreteCarl', upvotes: 22, daysAgo: 4, replies: [
    { author: 'WrenchKing_TX', content: 'if they badmouth their last contractor theyre gonna badmouth you next. thats my #1 red flag right there', hoursAfter: 2 },
    { author: 'SparkyMike', content: "'can you do it cheaper' before you even start is an instant no from me...", hoursAfter: 5 },
    { author: 'RoofDog_AZ', content: 'check em on here first. coulda saved you the trip', hoursAfter: 9 },
    { author: 'FenceGuy_FL', content: 'when they want to pay all cash and no contract. nope nope nope', hoursAfter: 15 },
    { author: 'HandyDan', content: "ngl the 'my last 2 guys didnt work out' thing is a HUGE red flag. like maybe the problem isnt the contractors my guy", hoursAfter: 20 },
  ]},
  // TRADE TALK
  { cat: 'trade-talk', title: 'best cordless impact driver right now?', content: "my Milwaukee M18 finally died after 5 years of beating on it every day. Looking at a replacement. Should I stay Milwaukee or look at DeWalt or Makita? anyone tried the new M18 gen 4? worth the upgrade or just marketing hype", author: 'WrenchKing_TX', upvotes: 14, daysAgo: 10, replies: [
    { author: 'SparkyMike', content: 'Milwaukee Gen 4 is a beast. more torque than youll ever need and the battery life is insane', hoursAfter: 3 },
    { author: 'HandyDan', content: "Makita XDT19 if you want something lighter. I switch between jobs all day and the weight difference matters when you're holding it overhead", hoursAfter: 6 },
    { author: 'RoofDog_AZ', content: 'dewalt 20v max. fight me', hoursAfter: 10 },
    { author: 'ConcreteCarl', content: 'Milwaukee. Not even a question', hoursAfter: 15 },
  ]},
  { cat: 'trade-talk', title: 'PEX vs copper in 2026 wheres everyone at', content: "I know this is basically a holy war at this point but im genuinely curious where everyone stands now. I switched to PEX for residential about 5 years ago and havent looked back. But I still get customers who insist on copper because they think its 'better.' What are you guys telling customers who push back on PEX?", author: 'HVACHero', upvotes: 9, daysAgo: 5, replies: [
    { author: 'WrenchKing_TX', content: 'PEX residential copper commercial. PEX is faster cheaper and the fittings have gotten way more reliable now. no contest for residential', hoursAfter: 4 },
    { author: 'ConcreteCarl', content: 'not a plumber but ive seen PEX freeze and bounce back while copper splits wide open. that sold me', hoursAfter: 8 },
    { author: 'SparkyMike', content: 'my plumber buddy says anyone still running copper in residential is just burning money... hard to argue with him', hoursAfter: 18 },
  ]},
  { cat: 'trade-talk', title: 'new EPA lead paint rules are killing my margins', content: "the updated RRP rule changes are absolutely destroying my margins on older homes. Extra containment extra testing extra disposal fees and now the documentation requirements are even worse. Had to walk away from 3 jobs this month alone because once you add in all the lead abatement costs the whole project becomes unprofitable. how are you guys pricing this in without scaring customers off? because right now im just not bidding pre-1978 homes at all", author: 'PaintPro_Mike', upvotes: 7, daysAgo: 2, replies: [
    { author: 'CleanSweep_LA', content: "We add a flat $1,500 EPA compliance surcharge on any pre-1978 home. Explain the legal requirements and most customers understand. The ones who don't aren't worth the risk.", hoursAfter: 5 },
    { author: 'TreeTopTom', content: "document EVERYTHING. photos of containment, disposal receipts, all of it. one complaint to the EPA and youre looking at $37,500 per violation — not worth cutting corners", hoursAfter: 12 },
  ]},
  // WINS
  { cat: 'wins', title: 'just hit $1M in revenue for the first time', content: "Started this cleaning company out of my Honda Civic 4 years ago with a mop bucket and honestly not much of a plan. Just closed the books on our first million dollar year. 12 employees, 3 vans, mix of commercial and residential. It hasn't been easy and there were months where I wasn't sure I could make payroll but we figured it out every time. If you're grinding as a solo operator right now just keep going. It does get better.", author: 'CleanSweep_LA', upvotes: 25, daysAgo: 16, replies: [
    { author: 'HandyDan', content: 'this is what I needed to hear today man. congrats seriously', hoursAfter: 1 },
    { author: 'SparkyMike', content: 'legend. buy yourself something nice you earned it', hoursAfter: 3 },
    { author: 'FenceGuy_FL', content: '4 years from a civic to a million bucks. thats insane. respect', hoursAfter: 7 },
    { author: 'PaintPro_Mike', content: 'ok you gotta drop some knowledge though. what was the single biggest decision that helped you grow? like if you had to pick one thing', hoursAfter: 12 },
    { author: 'ConcreteCarl', content: 'Congrats. Real deal right there', hoursAfter: 24 },
  ]},
  { cat: 'wins', title: 'landed a $340K commercial contract', content: "been chasing commercial work for 2 years now. bid on probably 30 jobs and kept coming up short. finally landed a full reroof on a strip mall — $340K. biggest job ive ever done by a mile. crew of 8 starting monday. im not gonna lie im terrified but also more excited than ive been about work in a long time", author: 'RoofDog_AZ', upvotes: 18, daysAgo: 8, replies: [
    { author: 'ConcreteCarl', content: 'get it. dont forget to enjoy the moment man this is what all the grinding was for', hoursAfter: 3 },
    { author: 'WrenchKing_TX', content: 'make sure your insurance is locked in tight for a job that size. and get your draws scheduled in the contract so youre not floating materials costs', hoursAfter: 8 },
    { author: 'HVACHero', content: "That's a career-defining job right there. Knock it out and the next one will be even bigger.", hoursAfter: 14 },
  ]},
  { cat: 'wins', title: '5 stars on google after 2 years — 87 reviews', content: "just realized I have a perfect 5.0 on google with 87 reviews after 2 years of being in business. never paid for a single one and never did anything sketchy to get them. just showed up when I said I would did good work and asked happy customers to leave a review. simple but it works", author: 'HandyDan', upvotes: 13, daysAgo: 5, replies: [
    { author: 'TreeTopTom', content: "thats the playbook right there — no shortcuts just quality work", hoursAfter: 4 },
    { author: 'SparkyMike', content: '87 five star reviews is worth more than any marketing budget... nice work man', hoursAfter: 9 },
    { author: 'CleanSweep_LA', content: "That's the best advertising money can't buy. Respect.", hoursAfter: 16 },
  ]},
  // HIRING
  { cat: 'hiring-crew', title: 'how do yall screen workers before hiring', content: "need to hire 2 laborers for my fencing crew. Last guy I hired seemed great in the interview showed up on time for 2 days then no showed on day 3 and I never heard from him again. The guy before that I literally caught putting materials in his truck at the end of the day. So yeah my track record with hiring isnt great. What does your screening process look like? background checks? references? trial period? Im open to anything at this point", author: 'FenceGuy_FL', upvotes: 15, daysAgo: 13, replies: [
    { author: 'CleanSweep_LA', content: "1 week paid trial period. Non-negotiable for us. You learn more about someone in 5 days of actual work than you ever will in an interview. Also check the worker database on here.", hoursAfter: 4 },
    { author: 'RoofDog_AZ', content: "call their references. not just the ones they give you — ask specifically for their last 3 employers", hoursAfter: 10 },
    { author: 'ConcreteCarl', content: 'Drug test day one. Lost a 50K job because a laborer showed up high and put a skid steer through a clients retaining wall', hoursAfter: 18 },
  ]},
  { cat: 'hiring-crew', title: 'hourly vs piece rate for laborers?', content: "Running a crew of 6 right now. Everyone on hourly between $22-28/hr depending on experience. Thinking about switching to piece rate for flatwork to incentivize faster work. Those of you doing piece rate how do you structure it and does quality go to crap when guys are rushing to finish", author: 'ConcreteCarl', upvotes: 8, daysAgo: 7, replies: [
    { author: 'WrenchKing_TX', content: 'piece rate works great until someone rushes and you start getting callbacks. id do hybrid — base hourly plus a bonus for finishing under the time estimate', hoursAfter: 6 },
    { author: 'FenceGuy_FL', content: 'we do piece rate for fence panels and the guys love it because the good workers make way more money. quality stays up because they know I inspect every single panel before we leave', hoursAfter: 14 },
  ]},
  { cat: 'hiring-crew', title: 'what do you do when your best guy no shows', content: "my lead electrician no showed monday morning. no call no text nothing. I had a full day of appointments booked and had to scramble to cover everything myself. he finally texts me at like 2pm with some excuse about his car. this is the second time this year. how do you handle this? written warning? just fire him? hes good when hes actually there which makes it harder", author: 'SparkyMike', upvotes: 11, daysAgo: 4, replies: [
    { author: 'HandyDan', content: 'first time warning. second time hes gone. you already gave him a chance', hoursAfter: 2 },
    { author: 'HVACHero', content: "Document everything. Written warnings protect you legally if there's ever a wrongful termination claim.", hoursAfter: 6 },
    { author: 'CleanSweep_LA', content: "Zero tolerance for no-call no-shows in my company. If you can't even send a text, I can't trust you on a job site with a customer's property.", hoursAfter: 12 },
    { author: 'RoofDog_AZ', content: 'the fact that hes good when hes there makes it worse honestly. because you keep making excuses for him and he knows it', hoursAfter: 20 },
  ]},
  // LEGAL
  { cat: 'legal-contracts', title: 'mechanics lien literally saved my business', content: "customer owed me $6800 for tree removal work we did back in september. Called, texted, sent invoices — nothing for 4 months. Finally filed a mechanics lien on the property. Got a call from their real estate agent 2 weeks later because surprise surprise they were trying to sell the house and couldnt close with a lien on it. Paid in full within 48 hours. learn your lien rights people. its the most powerful tool you have and most contractors dont even know about it", author: 'TreeTopTom', upvotes: 20, daysAgo: 15, replies: [
    { author: 'WrenchKing_TX', content: 'every contractor needs to understand lien rights in their state. its literally the law working FOR you for once', hoursAfter: 5 },
    { author: 'ConcreteCarl', content: 'What state? Filing deadlines are different everywhere. Missed mine by 3 days once and was completely out of luck', hoursAfter: 10 },
    { author: 'SparkyMike', content: 'pro tip... mention lien rights in your initial contract. half the time just knowing you CAN file one is enough to make people pay on time', hoursAfter: 18 },
  ]},
  { cat: 'legal-contracts', title: 'updating my contract for 2026 what am I missing', content: "going through my contract template and trying to tighten it up for this year. Right now I have scope of work payment schedule change order process and a cancellation clause. What am I missing? what clauses have actually saved you in a real situation? Id rather learn from you guys than learn the hard way again", author: 'PaintPro_Mike', upvotes: 16, daysAgo: 9, replies: [
    { author: 'HVACHero', content: "Arbitration clause for disputes. Keeps you out of expensive lawsuits and into cheaper arbitration. My lawyer added it and it's already come in handy.", hoursAfter: 4 },
    { author: 'FenceGuy_FL', content: 'MATERIAL PRICE ESCALATION CLAUSE. if lumber goes up 15% between signing and start date youre covered. learned that one during covid the hard way', hoursAfter: 8 },
    { author: 'RoofDog_AZ', content: 'photo documentation clause. the right to photograph all work at every stage for your records. saved me in a dispute last year when a customer said we damaged their siding', hoursAfter: 14 },
    { author: 'HandyDan', content: 'payment terms with actual teeth. net 30 with 1.5% monthly interest after that. put it in writing and people take it seriously', hoursAfter: 22 },
  ]},
  // OFF TOPIC
  { cat: 'off-topic', title: 'final four picks??', content: "alright boys its that time. whos everyone got? my brackets already toast but im riding Houston all the way. Duke is overrated like always. hit me with your picks", author: 'RoofDog_AZ', upvotes: 12, daysAgo: 17, replies: [
    { author: 'WrenchKing_TX', content: 'Houston all day baby. go coogs. Duke gonna duke and choke in the semis like they always do', hoursAfter: 1 },
    { author: 'SparkyMike', content: 'Auburns defense is legit this year... I got them cutting down the nets', hoursAfter: 3 },
    { author: 'ConcreteCarl', content: 'Stopped doing brackets years ago. Just bet the under on every game and drink beer. way more enjoyable', hoursAfter: 7 },
    { author: 'HandyDan', content: 'florida has the momentum right now dont sleep on them', hoursAfter: 12 },
    { author: 'FenceGuy_FL', content: 'as a florida man im legally required to say gators but between us I think houston takes it', hoursAfter: 18 },
  ]},
  { cat: 'off-topic', title: 'what truck are you guys running', content: "Need a new work truck. Currently beating my 2018 F250 into the ground. Thinking either new super duty or maybe going Ram 3500 this time. What are you driving and how is it holding up. Dont say Tacoma", author: 'ConcreteCarl', upvotes: 16, daysAgo: 10, replies: [
    { author: 'WrenchKing_TX', content: '2023 Ram 2500 cummins. will never go back to gas. tows my trailer like its not even there', hoursAfter: 2 },
    { author: 'RoofDog_AZ', content: 'F350 diesel. 180k miles still runs like a tank. Ford truck chevy everything else', hoursAfter: 5 },
    { author: 'TreeTopTom', content: "I have a Tundra. yeah I know — but im a tree guy not hauling concrete. it does what I need it to do", hoursAfter: 9 },
    { author: 'PaintPro_Mike', content: "transit van gang over here. dont need a truck bed I need covered storage for all my gear. the van life chose me", hoursAfter: 14 },
    { author: 'HVACHero', content: "2024 Silverado 2500 HD. Best tech package of any work truck out there. The bed camera alone was worth the upgrade.", hoursAfter: 20 },
    { author: 'HandyDan', content: 'he said dont say tacoma lmao', hoursAfter: 25 },
  ]},
  { cat: 'off-topic', title: 'boot recommendations for concrete guys', content: "going through boots every 4-5 months because concrete eats them alive. on thorogoods right now and they're decent but not lasting like I need them to. what are you concrete guys wearing that actually survives? budget doesnt matter at this point if they actually last", author: 'ConcreteCarl', upvotes: 9, daysAgo: 6, replies: [
    { author: 'FenceGuy_FL', content: "Red Wing 2240s. steel toe waterproof and they'll resole them. only boot Ill wear at this point", hoursAfter: 3 },
    { author: 'WrenchKing_TX', content: 'Danner Bull Run. comfortable all day and they handle wet conditions. not cheap but you get what you pay for', hoursAfter: 8 },
    { author: 'HandyDan', content: 'Irish Setter by Red Wing. half the price of the main line and like 80% of the quality. solid budget option', hoursAfter: 14 },
  ]},
  { cat: 'off-topic', title: 'weekend brisket thread — drop your rubs', content: "Smoking a brisket this weekend and I've got my rub pretty dialed in but always looking for new ideas. What are you guys running? SPG is the base obviously but whats your secret weapon. Don't hold back.", author: 'HVACHero', upvotes: 14, daysAgo: 3, replies: [
    { author: 'ConcreteCarl', content: 'brown sugar smoked paprika onion powder cayenne. layer it on thick and let it sit overnight. dont skimp', hoursAfter: 2 },
    { author: 'WrenchKing_TX', content: 'SPG and thats it. let the meat and the smoke do the work. everyone overcomplicates brisket', hoursAfter: 5 },
    { author: 'RoofDog_AZ', content: 'coffee rub. yeah coffee. mix it in with your SPG base and thank me later. trust the process', hoursAfter: 9 },
    { author: 'TreeTopTom', content: "mustard slather before the rub — changed my whole game honestly", hoursAfter: 14 },
    { author: 'FenceGuy_FL', content: 'this thread is more useful than half the business advice section lol', hoursAfter: 20 },
  ]},
]

export async function POST() {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const admin = await createServiceClient()

  // Check if already seeded
  const { data: existing } = await admin.from('profiles').select('id').ilike('email', `%${SEED_DOMAIN}%`).limit(1)
  if (existing && existing.length > 0) return NextResponse.json({ message: 'Already seeded' })

  // Create profiles
  const userMap = new Map<string, string>()
  for (let i = 0; i < PROFILES.length; i++) {
    const p = PROFILES[i]
    const id = crypto.randomUUID()
    const { error } = await admin.from('profiles').insert({
      id,
      email: `seeduser${i + 1}@${SEED_DOMAIN}`,
      display_username: p.username,
      trade: p.trade,
      business_name: p.business_name,
      business_phone: '(555) 000-' + String(1000 + i),
      reputation_points: p.reputation_points,
      reputation_rank: rank(p.reputation_points),
      trust_score: Math.min(Math.floor(p.reputation_points / 25) + 3, 5),
      subscription_status: 'active',
      subscription_tier: 'fortress',
      city: p.city,
      state: p.state,
      is_verified: true,
    })
    if (error) console.error('Profile insert error:', p.username, error.message)
    userMap.set(p.username, id)
  }

  // Get category IDs
  const { data: cats } = await admin.from('forum_categories').select('id, slug')
  const catMap = new Map<string, string>()
  for (const c of cats ?? []) catMap.set(c.slug, c.id)

  let postCount = 0, replyCount = 0, upvoteCount = 0

  for (const post of POSTS) {
    const catId = catMap.get(post.cat)
    const authorId = userMap.get(post.author)
    if (!catId || !authorId) { console.error('Missing cat/author:', post.cat, post.author); continue }

    const postCreatedAt = daysAgo(post.daysAgo)
    const { data: newPost, error: postErr } = await admin.from('forum_posts').insert({
      category_id: catId, user_id: authorId, title: post.title, content: post.content,
      upvote_count: post.upvotes, reply_count: post.replies.length, created_at: postCreatedAt, updated_at: postCreatedAt,
    }).select('id').single()

    if (postErr || !newPost) { console.error('Post insert error:', postErr?.message); continue }
    postCount++

    // Replies
    for (const reply of post.replies) {
      const replyAuthorId = userMap.get(reply.author)
      if (!replyAuthorId) continue
      const replyAt = daysAgo(post.daysAgo, -reply.hoursAfter)
      await admin.from('forum_replies').insert({
        post_id: newPost.id, user_id: replyAuthorId, content: reply.content,
        created_at: replyAt, updated_at: replyAt,
      })
      replyCount++
    }

    // Upvotes — distribute among random seed users (not the author)
    const otherUsers = PROFILES.filter((p) => p.username !== post.author).map((p) => userMap.get(p.username)!).filter(Boolean)
    const numUpvotes = Math.min(post.upvotes, otherUsers.length)
    const shuffled = otherUsers.sort(() => Math.random() - 0.5).slice(0, numUpvotes)
    for (const uid of shuffled) {
      const { error: upErr } = await admin.from('forum_upvotes').insert({ user_id: uid, post_id: newPost.id })
      if (!upErr) upvoteCount++
    }
  }

  return NextResponse.json({ message: `Seeded ${PROFILES.length} profiles, ${postCount} posts, ${replyCount} replies, ${upvoteCount} upvotes` })
}
