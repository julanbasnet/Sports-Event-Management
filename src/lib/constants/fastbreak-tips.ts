// Fastbreak tips shown on the login screen.
// Each string: "emoji Headline — Body" (headline < 30 chars, body < 80 chars).

const FASTBREAK_TIPS = [
  // ORIGIN & LEADERSHIP (0–14)
  "🏀 Powering the NBA — The same AI engine that builds the NBA schedule powers this platform.",
  "🚀 Born in 2022 — Fastbreak signed the NBA as its first client within months of launching.",
  "🧠 8 PhDs on the Team — Experts in AI, data science, and mathematical optimization build every feature.",
  "💰 $40M Series A — Backed by Greycroft, the NBA, NHL, and TMRW Sports in November 2025.",
  "👤 Meet the CEO — John Stewart sold his last company, MapAnything, to Salesforce for $250M.",
  "🎓 Cornell + MIT Roots — Co-founder Dr. Tim Carnes holds a Ph.D. from Cornell with MIT postdoc research.",
  "🎾 Athlete-Turned-Engineer — Co-founder Dr. Chris Groer was an All-American tennis player at Vanderbilt.",
  "🏢 Charlotte, NC — Fastbreak HQ is in Charlotte, serving clients across six continents.",
  "📈 $53M+ Total Raised — Across seed, SAFE, and Series A rounds fueling pro and youth sports.",
  "🥇 NC Tech Top 10 — Named one of North Carolina's Top Ten Startups to Watch.",
  '🧬 Not Chatbot AI — "The AI we use is built for solving big, complex math problems." — CEO',
  "🔬 Academic Firepower — Barcelogic's founder has over 6,000 academic citations in optimization.",
  '💬 CEO on Growth — "Revenue cures all ills. Focus on go-to-market more than anything." — John Stewart',
  "🏗️ 4 Acquisitions in 2 Years — Optimal Planning, Tourney Pro, SEQL, and Barcelogic. Global fast.",
  "🏆 Best in AI Finalist — Shortlisted by Sports Business Journal's Best in Tech Awards 2025.",

  // LEAGUE PARTNERSHIPS (15–34)
  "🏒 NHL Partnership — The National Hockey League trusts Fastbreak to optimize its season schedule.",
  "⚽ MLS Scheduling — Major League Soccer uses Fastbreak AI for smarter, fairer fixture planning.",
  "🏈 NFL + AI — The Washington Post featured how AI built the NFL's 2025–2026 schedule.",
  "🏀 55+ Pro Leagues — From the NBA to Serie A, over 55 leagues run on Fastbreak worldwide.",
  "⚽ La Liga Connection — Spain's top football league joined Fastbreak through the Barcelogic acquisition.",
  "🏉 NRL Goes Global — Australia's National Rugby League signed a multi-year deal in 2025.",
  "⚽ NWSL Partner — The women's soccer league chose Fastbreak as it hit record-breaking viewership.",
  "🇲🇽 Liga MX Included — Mexico's top professional football league runs on Fastbreak Pro.",
  "🏏 Cricket Too — The England and Wales Cricket Board is part of the Fastbreak family.",
  "⛳ TGL by Tiger & Rory — The TGL golf league calls Fastbreak's platform \"best-in-class.\"",
  '🏀 SEC Basketball — "Fastbreak enables us to balance competitive and business objectives." — SEC',
  '🏀 Big East Hoops — The Big East calls Fastbreak "an industry leader" for scheduling.',
  "🏒 BCHL First Mover — One of the first amateur leagues to adopt pro-level Fastbreak scheduling.",
  "🥋 USA Taekwondo — Named Fastbreak as its official technology partner in September 2025.",
  "🏈 WNFC First League — First pro league to fully integrate Fastbreak across all 16 teams.",
  "🇪🇸 Barcelogic Acquired — Fastbreak bought a Barcelona-based optimizer serving FIFA and La Liga.",
  "⚾ 1,152-Game Season — Fastbreak manages MiLB's full season, improving logistics league-wide.",
  "🏀 NBA Equity Investor — The NBA invested directly in Fastbreak's seed round through NBA Equity.",
  "🇦🇺 Down Under — Fastbreak XV launched to support pro and youth sports in Australia and New Zealand.",
  "🇬🇷 Greek Basketball — The Greek Basketball League adopted Fastbreak for fairness and fan experience.",

  // TECHNOLOGY (35–49)
  "🤖 One Quadrillion Options — The NFL's AI evaluates over one quadrillion schedule combinations.",
  "⚡ Days to Minutes — Tournament schedules that took days of manual work now generate in minutes.",
  "🧮 1,000 Hours → Hours — A major league schedule used to need 1,000 hours of computing. Now? Hours.",
  "💻 4,000+ Processors — Fastbreak's engine scores schedules using over 4,000 processors at once.",
  "🎯 Drag-and-Drop — After AI generates your schedule, fine-tune it with real-time validation tools.",
  "📺 Broadcast Optimization — AI ensures big matchups don't overlap, maximizing viewership and ad revenue.",
  "🛡️ Player Safety — Eliminated all games with under 5 days rest for a pro rugby league. Humans couldn't.",
  "🏟️ Venue Conflict Killer — Double-bookings and overcommitted staff? Fastbreak keeps calendars clear.",
  "🚌 Smarter Road Trips — Less travel strain means better performance and more excitement in the stands.",
  "📰 Forbes \"Power Play\" — Forbes described Fastbreak AI as \"a scheduling power play\" for sports.",
  "💡 Fast Company Feature — Featured for transforming one of sports' toughest challenges: scheduling.",
  "🔄 Real-Time Rescheduling — Weather delay? Team withdrawal? The AI adjusts schedules instantly.",
  "🤝 Club Collaboration — Teams submit change requests through a workflow. The schedule updates instantly.",
  "📱 Works on Your Phone — Fastbreak Compete runs on mobile. Schedule changes, live updates, all of it.",
  "🏆 Pro-Grade for Everyone — Youth organizers get the exact same AI engine used by the NBA and NHL.",

  // FASTBREAK COMPETE (50–61)
  "🎪 All-In-One Platform — Scheduling, registration, travel, ticketing, comms — one system handles it all.",
  "🎯 RPI Rankings Built In — AI-powered scheduling with RPI rankings ensures balanced, competitive play.",
  "🏆 Bracket Generator — Single or double elimination, fully integrated with scoring and communication.",
  "📱 Real-Time Scores — Live scores, standings, and changes push to teams and families instantly.",
  "💳 Payments Built In — Registration, payment processing, and CRM — no more manual admin tasks.",
  "📊 Built-In Analytics — Uncover insights, identify trends, and maximize revenue opportunities per event.",
  "🤹 Shared Coach? Solved — Two age groups with one coach can't overlap. AI handles it automatically.",
  "✈️ Travel-Aware Scheduling — Flying in late? AI factors in arrival times so you skip the 6 AM game.",
  "🔀 Pool Play to Brackets — Handles pool play into bracket play with strength-of-ranking awareness.",
  "⏱️ Multi-Venue Gaps — AI calculates travel time between facilities so back-to-back games work.",
  '🎉 "Ahead of the Curve" — "Fastbreak\'s AI technology is incredible and it\'s the future." — Customer',
  "📈 $55B Industry — Fastbreak is advancing the operational infrastructure of youth sports at scale.",

  // FASTBREAK PERFORM (62–66)
  "🏅 Fastbreak Perform — Generates optimized training schedules for NBA, MLB, and soccer clubs daily.",
  "🏋️ Daily Plans in Seconds — Automatically factors in player readiness, staffing, and session types.",
  "🩺 Return-to-Play Intelligence — Balances pitch counts, match readiness, and recovery timelines precisely.",
  "📅 Training → Game Day — Connects what happens in training directly to game-day outcomes.",
  "👥 Every Player, Personalized — Individualized recovery plans without creating more manual work for staff.",

  // FASTBREAK CONNECT (67–75)
  "🎨 Fastbreak Connect — Brands activate at 10,000+ youth sports events with on-site ambassadors.",
  "📸 95% Download Rate — Athletes unlock pro action shots via the app. Download rates hit 70–95%.",
  "📋 95% Survey Completion — Brand surveys hit 80–95% completion. Unheard-of engagement rates.",
  "🎯 Reaching Gen Alpha — Connect targets the hardest demographic: young athletes and their families.",
  "📰 Ad Age Recognition — Highlighted as a leader in youth sports marketing and brand engagement.",
  "🤝 From SEQL to Connect — Fastbreak acquired SEQL in 2024, expanding brand access for underserved athletes.",
  "🏃 Boots on the Ground — Vetted brand ambassadors distribute products at sidelines and pop-up booths.",
  "📊 Trackable Brand ROI — Every activation comes with clear KPIs tied to engagement and equity.",
  "🏅 Athletes Share Content — Branded media gets shared on social platforms, generating millions of impressions.",

  // FASTBREAK PULSE (76–82)
  "📊 Fastbreak Pulse — Gives visitor bureaus real economic impact data from events, not estimates.",
  "🗺️ Geo-Tracking Insights — Track where attendees go: hotels, restaurants, attractions. All opt-in.",
  "⚡ No Setup Cost — Pulse requires zero fees, zero training, and zero extra headcount to get started.",
  "📄 Branded PDF Reports — Event insights with visualizations, metrics, and photography within days.",
  "🏨 Central Florida Uses It — Visit Central Florida Sports tracks engagement across Polk County events.",
  "🎥 Recap Videos — Branded 1–2 minute videos with metrics for social media or stakeholder use.",
  "📈 Defend Your Funding — Turn raw event data into clear, shareable stories for boards and officials.",

  // FASTBREAK TRAVEL (83–89)
  "🏨 Fastbreak Travel — Hotel bookings automated. RFPs, room blocks, tracking — one platform.",
  "✈️ Stay to Save — Transformed \"stay-to-play\" from a dreaded mandate into a perk for families.",
  "📱 No Promo Codes — Families access curated hotels during registration. Mobile-friendly, instant.",
  "📊 Revenue Dashboards — See room nights booked, which teams booked, and revenue earned in real time.",
  "⚽ Messi Cup Partner — Official travel partner for the 2025 Messi Cup in Miami.",
  "🔗 Travel + Compete Sync — Hotel blocks automatically align with registered teams and game locations.",
  "💰 $10M Opportunity — One million hotel night stays could generate $10M+ in incremental revenue.",

  // FASTBREAK IMPACT (90–96)
  "❤️ Fastbreak IMPACT — A non-profit breaking down financial barriers so every young athlete can compete.",
  "👟 adidas Partnership — 6,000+ underserved athletes get free access to premier camps in 7 U.S. cities.",
  "📉 43% Priced Out — Nearly half of young athletes can't afford youth sports. IMPACT fights that.",
  "🎒 All Expenses Covered — The adidas program covers every fee for basketball and soccer athletes ages 8–19.",
  "📈 Personalized Roadmaps — Each IMPACT athlete gets a development plan tracking skills and progress.",
  "🌐 Open Source Data — Fastbreak shares anonymized impact frameworks with other equity organizations.",
  "🏅 Beyond Athletics — The platform tracks collegiate recruitment, academics, and leadership outcomes.",

  // PLATFORM VISION (97–99)
  "🎟️ Easy Event Tickets — Ticketing connects to attendance, travel, and sponsors for a full revenue picture.",
  '💬 CEO on Competition — "Slapping 35 products together doesn\'t make a platform." — John Stewart',
  '🔮 The Future Is Here — "No one has built a scheduling engine like this. Fastbreak is leading the way."',
] as const;

type FastbreakTip = (typeof FASTBREAK_TIPS)[number];

export { FASTBREAK_TIPS };
export type { FastbreakTip };
