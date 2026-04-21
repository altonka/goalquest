const Decompose = (() => {

  const WORLD_COLORS = ['#7c5cfc','#4299e1','#4fd1c5','#68d391','#f6e05e','#ed8936'];
  const NODE_SUBTITLES = ['Basics','Practice','Deep Dive','Application','Mastery','Challenge'];

  // ─── Rich Task Templates ────────────────────────────────────────────────────
  // Each task: { title, estimatedMinutes, difficulty, startTrigger, steps[],
  //              completionCondition, focusTip, resources[], community, xpBase }

  const TEMPLATES = {

    // ── CONSULTING ────────────────────────────────────────────────────────────
    consultant: {
      milestones: [
        { title: 'Foundation',      desc: 'Build consulting knowledge base',          weeks: 4 },
        { title: 'Case Mastery',    desc: 'Master case interview frameworks',          weeks: 8 },
        { title: 'Network & CV',    desc: 'Build network and polish materials',        weeks: 4 },
        { title: 'Apply & Interview', desc: 'Active applications and interviews',      weeks: 6 },
      ],
      taskSets: [
        // Milestone 0 – Foundation
        [
          {
            title: 'Read Case in Point: Chapters 1–4',
            estimatedMinutes: 45,
            difficulty: 'easy',
            startTrigger: 'Open Case in Point PDF to Chapter 1 and read the first sentence out loud',
            steps: [
              'Skim Chapters 1–2 for framework overview (15 min)',
              'Read Chapters 3–4 carefully, underline key terms (20 min)',
              'Write the 3 core frameworks in your own words — no peeking (10 min)',
            ],
            completionCondition: '3 framework definitions written in your notes app or notebook',
            focusTip: '45-min timer · phone in another room · notebook ready',
            resources: [
              { label: 'Case in Point (Cosentino) — Amazon', url: 'https://www.amazon.com/s?k=case+in+point+cosentino', primary: true },
              { label: 'PrepLounge Framework Bootcamp (free)', url: 'https://www.preplounge.com/en/bootcamp.php', primary: false },
              { label: 'MConsulting Prep — YouTube', url: 'https://www.youtube.com/@MConsultingPrep', primary: false },
            ],
            community: null,
            xpBase: 60,
          },
          {
            title: 'Mental Math Drill: 20 Problems Without a Calculator',
            estimatedMinutes: 20,
            difficulty: 'easy',
            startTrigger: 'Write the number 1 at the top of a blank page — do the first problem before anything else',
            steps: [
              'Solve 10 multiplication problems (e.g. 37×8, 125×4) by hand (10 min)',
              'Solve 10 percentage problems (e.g. 15% of 340) by hand (8 min)',
              'Write your score and total time at the bottom (2 min)',
            ],
            completionCondition: '20 problems completed with score and time recorded',
            focusTip: '20-min timer · pen and paper only · no calculator',
            resources: [
              { label: 'PrepLounge Mental Math Trainer (free)', url: 'https://www.preplounge.com/en/mental-math.php', primary: true },
              { label: 'Victor Cheng Math Practice Videos', url: 'https://www.youtube.com/@VictorChengCaseInterviews', primary: false },
            ],
            community: null,
            xpBase: 50,
          },
          {
            title: 'Analyze 1 Full McKinsey Case Interview Video',
            estimatedMinutes: 35,
            difficulty: 'core',
            startTrigger: 'Open YouTube, search "McKinsey case interview example full", click the first result',
            steps: [
              'Watch the full case video without pausing (20 min)',
              'Write the exact framework the candidate used (5 min)',
              'Write 2 things they did well and 1 clear mistake (5 min)',
              'Write how you would have structured the opening differently (5 min)',
            ],
            completionCondition: 'Framework used + 2 strengths + 1 mistake + your alternative — all written',
            focusTip: '35-min session · take notes while watching · pause freely to write',
            resources: [
              { label: 'McKinsey Case Interview Full Example', url: 'https://www.youtube.com/results?search_query=mckinsey+case+interview+example+full', primary: true },
              { label: 'Bain Case Interview Example', url: 'https://www.youtube.com/results?search_query=bain+case+interview+example', primary: false },
              { label: 'CaseCoach Free Cases', url: 'https://www.casecoach.net', primary: false },
            ],
            community: null,
            xpBase: 70,
          },
          {
            title: 'Draw All 4 Core Frameworks From Memory',
            estimatedMinutes: 50,
            difficulty: 'stretch',
            startTrigger: 'Grab a blank sheet of paper and write "Framework Map" at the top — close all notes',
            steps: [
              'Draw MECE diagram + write a 1-sentence definition (10 min)',
              'Draw Profitability tree: Revenue branches and Cost branches (10 min)',
              'Draw Market Entry framework: 4 key strategic questions (10 min)',
              'Draw M&A framework: Strategic fit + Financial fit (10 min)',
              'Cover your drawings — recall each framework from memory and check (10 min)',
            ],
            completionCondition: 'All 4 frameworks drawn from scratch on a single page without notes',
            focusTip: '50-min Pomodoro · no internet · paper only',
            resources: [
              { label: 'PrepLounge Bootcamp — all frameworks', url: 'https://www.preplounge.com/en/bootcamp.php', primary: true },
              { label: 'Management Consulted Framework Guide', url: 'https://managementconsulted.com/case-frameworks/', primary: false },
            ],
            community: 'r/consulting — post a photo of your framework map for feedback',
            xpBase: 90,
          },
        ],
        // Milestone 1 – Case Mastery
        [
          {
            title: 'Solo Case: Profitability Framework — Full Run-Through',
            estimatedMinutes: 40,
            difficulty: 'core',
            startTrigger: 'Open Case in Point to a profitability case, read the prompt out loud, then put the book face down',
            steps: [
              'Read the case prompt — do not peek at the framework guide (5 min)',
              'Structure your analysis using Revenue / Cost branches out loud (10 min)',
              'Work through the numbers and analysis, speaking continuously (20 min)',
              'Immediately write 3 specific mistakes you made (5 min)',
            ],
            completionCondition: 'Full case completed + 3 documented mistakes in your notes',
            focusTip: '40-min timer · speak every thought out loud · record optional',
            resources: [
              { label: 'PrepLounge Free Profitability Cases', url: 'https://www.preplounge.com/en/cases.php?type=profitability', primary: true },
              { label: 'CaseCoach — Profitability Cases', url: 'https://www.casecoach.net', primary: false },
              { label: 'Case in Point (book)', url: 'https://www.amazon.com/s?k=case+in+point+cosentino', primary: false },
            ],
            community: 'PrepLounge → Meetup & Practice → find a partner for live feedback',
            xpBase: 80,
          },
          {
            title: 'Market Sizing: Solve 2 Problems From Scratch',
            estimatedMinutes: 30,
            difficulty: 'easy',
            startTrigger: 'Write "How many gas stations are in Germany?" at the top of a blank page — answer it before opening anything',
            steps: [
              'Solve Problem 1: "Gas stations in Germany" using population-down approach (12 min)',
              'Solve Problem 2: "Tennis balls in a Boeing 747" using volume approach (12 min)',
              'Look up real estimates — write the delta between your answer and actual (6 min)',
            ],
            completionCondition: '2 full market sizing solutions written with labeled calculations and delta noted',
            focusTip: '30-min timer · pen + paper · think out loud · no searching mid-problem',
            resources: [
              { label: 'PrepLounge Market Sizing Bootcamp', url: 'https://www.preplounge.com/en/bootcamp.php?chapterType=case_interview_basics&chapterUrl=market-sizing', primary: true },
              { label: 'IGotAnOffer Market Sizing Guide', url: 'https://igotanoffer.com/blogs/mckinsey-case-interview-blog/market-sizing-questions', primary: false },
            ],
            community: null,
            xpBase: 60,
          },
          {
            title: 'Live Mock Case With a Partner — Both Roles',
            estimatedMinutes: 60,
            difficulty: 'stretch',
            startTrigger: 'Message your practice partner "Ready for our case session today?" and open your note sheet',
            steps: [
              'Agree on one case — interviewee goes first (2 min)',
              'Complete the full case in interviewee role, no help (28 min)',
              'Switch — you become interviewer for partner\'s case (25 min)',
              'Give each other exactly 3 specific, written feedback points (5 min)',
            ],
            completionCondition: 'Both roles completed + 3 written feedback points received',
            focusTip: 'Video call preferred · record with permission · dress as you would for real',
            resources: [
              { label: 'PrepLounge Partner Matching (free)', url: 'https://www.preplounge.com/en/case-partner.php', primary: true },
              { label: 'IGotAnOffer Peer Practice Community', url: 'https://igotanoffer.com/en/community', primary: false },
            ],
            community: 'PrepLounge → "Find Case Partner" → filter by target firm and availability',
            xpBase: 100,
          },
          {
            title: 'Industry Deep Dive: 1-Page Sector Brief',
            estimatedMinutes: 45,
            difficulty: 'core',
            startTrigger: 'Open a blank Google Doc titled "Sector Brief: [pick one sector]" and write today\'s date',
            steps: [
              'Read 1 recent McKinsey Insights article on any sector (15 min)',
              'Identify 3 key trends affecting profitability in that sector (10 min)',
              'List the top 5 players + estimated market share (10 min)',
              'Write 2 sentences on how this sector would appear in a case interview (10 min)',
            ],
            completionCondition: '3 trends + top 5 players + case interview angle all written in the doc',
            focusTip: '45-min session · one tab only · no switching apps',
            resources: [
              { label: 'McKinsey Insights (free)', url: 'https://www.mckinsey.com/insights', primary: true },
              { label: 'Statista — Market Data', url: 'https://www.statista.com', primary: false },
              { label: 'HBR Free Articles', url: 'https://hbr.org', primary: false },
            ],
            community: null,
            xpBase: 75,
          },
        ],
        // Milestone 2 – Network & CV
        [
          {
            title: 'Send 2 LinkedIn Requests to Consultants — With Personal Notes',
            estimatedMinutes: 20,
            difficulty: 'easy',
            startTrigger: 'Open LinkedIn, type "Analyst [your target firm] [target city]" in search, hit Enter',
            steps: [
              'Find 2 consultants at your target firm whose background resonates (5 min)',
              'Read their profiles — find 1 genuine shared angle (school, interest, role) (5 min)',
              'Write a 300-character note that references their specific work, not generic (10 min)',
            ],
            completionCondition: '2 connection requests sent — both with personalized notes referencing their specific work',
            focusTip: '20-min session · no generic messages — if you can\'t personalize, skip and find someone else',
            resources: [
              { label: 'LinkedIn Alumni Tool (filter by firm)', url: 'https://www.linkedin.com/alumni/', primary: true },
              { label: 'Management Consulted Networking Guide', url: 'https://managementconsulted.com/consulting-networking/', primary: false },
            ],
            community: 'r/consulting — weekly networking thread for message review',
            xpBase: 60,
          },
          {
            title: 'Rewrite 3 CV Bullets Using STAR + Numbers',
            estimatedMinutes: 35,
            difficulty: 'core',
            startTrigger: 'Open your current CV and highlight the 3 weakest bullet points — those are your targets',
            steps: [
              'Pick the 3 weakest bullets from your existing CV (3 min)',
              'Rewrite bullet 1: Action Verb + Task + Result + Number (10 min)',
              'Rewrite bullet 2 the same way (10 min)',
              'Rewrite bullet 3 the same way (10 min)',
              'Read all 3 out loud — do they sound impactful? (2 min)',
            ],
            completionCondition: '3 rewritten bullets, each with a quantified result (%, $, time saved, people impacted)',
            focusTip: '35-min timer · focus on adding numbers — estimate if you don\'t know exactly',
            resources: [
              { label: 'McKinsey CV Tips & Examples', url: 'https://www.mckinsey.com/careers', primary: true },
              { label: 'r/consulting CV Feedback Thread', url: 'https://www.reddit.com/r/consulting/', primary: false },
              { label: 'Bain CV Guide', url: 'https://www.bain.com/careers/', primary: false },
            ],
            community: 'r/consulting → weekly CV review megathread — post your 3 bullets for feedback',
            xpBase: 75,
          },
          {
            title: 'Schedule 1 Coffee Chat With a Consultant',
            estimatedMinutes: 30,
            difficulty: 'stretch',
            startTrigger: 'Open LinkedIn, find a consultant you already connected with, and start writing the message',
            steps: [
              'Pick 1 accessible contact from your network (5 min)',
              'Write a 3-sentence message: who you are → what you want → propose 2 time slots (10 min)',
              'Send it (1 min)',
              'Prepare 5 specific questions to ask during the call (14 min)',
            ],
            completionCondition: 'Message sent + 5 specific questions written in your notes',
            focusTip: 'Be specific — propose 2 exact time slots · keep the message under 100 words',
            resources: [
              { label: 'PrepLounge Coffee Chat Templates', url: 'https://www.preplounge.com/en/consulting-forum.php', primary: true },
              { label: 'Management Consulted Cold Outreach Guide', url: 'https://managementconsulted.com/consulting-networking/', primary: false },
            ],
            community: 'LinkedIn Alumni filter → your university → filter by McKinsey/Bain/BCG',
            xpBase: 90,
          },
          {
            title: 'Research 1 Target Firm: 3 Personal Talking Points',
            estimatedMinutes: 25,
            difficulty: 'easy',
            startTrigger: 'Open the firm\'s careers page and navigate to "About Us" or "Our Values" — read it now',
            steps: [
              'Read the firm\'s culture/values page fully (8 min)',
              'Find 2 recent news articles about the firm on LinkedIn or Blind (10 min)',
              'Write 3 talking points connecting your background to their values (7 min)',
            ],
            completionCondition: '3 personal talking points written — each references a specific firm initiative or value',
            focusTip: '25-min session · be specific, not generic · "I value impact" is not enough',
            resources: [
              { label: 'Glassdoor Firm Reviews', url: 'https://www.glassdoor.com/Reviews/index.htm', primary: true },
              { label: 'Blind — Consulting Forum', url: 'https://www.teamblind.com', primary: false },
              { label: 'Vault Consulting Rankings', url: 'https://www.vault.com/best-companies-to-work-for/consulting', primary: false },
            ],
            community: null,
            xpBase: 55,
          },
        ],
        // Milestone 3 – Apply & Interview
        [
          {
            title: 'Submit 1 Complete Application',
            estimatedMinutes: 60,
            difficulty: 'stretch',
            startTrigger: 'Open the firm\'s application portal, log in, and have your CV and cover letter open in two tabs',
            steps: [
              'Review all application requirements and fields (5 min)',
              'Tailor cover letter opening: reference 1 specific firm project or value (20 min)',
              'Fill in all application fields carefully and completely (25 min)',
              'Proofread everything once — no typos, correct firm name (5 min)',
              'Submit and screenshot the confirmation page (5 min)',
            ],
            completionCondition: 'Application submitted — confirmation screenshot saved',
            focusTip: '60-min uninterrupted block · close all other tabs · phone away',
            resources: [
              { label: 'McKinsey Application Portal', url: 'https://www.mckinsey.com/careers/apply', primary: true },
              { label: 'Bain Application', url: 'https://www.bain.com/careers/find-a-role/', primary: false },
              { label: 'BCG Application', url: 'https://careers.bcg.com/', primary: false },
            ],
            community: null,
            xpBase: 110,
          },
          {
            title: '45-Min Mock Interview on Video — Fit + 1 Case',
            estimatedMinutes: 45,
            difficulty: 'stretch',
            startTrigger: 'Start your phone camera recording and say "Mock — [today\'s date] — [target firm]" to begin',
            steps: [
              'Record "Walk me through your background" answer in 90 seconds (5 min)',
              'Record "Why consulting?" answer with STAR structure — no pausing (10 min)',
              'Do 1 full profitability or market entry case, out loud (25 min)',
              'Stop recording — write 3 specific things to improve before watching (5 min)',
            ],
            completionCondition: 'Recording saved + 3 improvement points written before watching back',
            focusTip: 'Dress as for the real interview · no pausing · treat every second as live',
            resources: [
              { label: 'IGotAnOffer Mock Interview Guide', url: 'https://igotanoffer.com', primary: true },
              { label: 'PrepLounge Expert Coaching (paid)', url: 'https://www.preplounge.com/en/coaching.php', primary: false },
            ],
            community: 'IGotAnOffer → Community → post for peer mock exchange',
            xpBase: 110,
          },
          {
            title: 'Debrief Last Mock: Fix Your Top 3 Weaknesses',
            estimatedMinutes: 30,
            difficulty: 'core',
            startTrigger: 'Open your last mock recording and play it from the beginning — have your notes open',
            steps: [
              'Watch the full recording (15 min)',
              'List your 3 biggest weaknesses with exact timestamps (5 min)',
              'For each weakness: write 1 specific fix + how to practice it this week (10 min)',
            ],
            completionCondition: '3 weaknesses with timestamps + specific fixes written — ready to drill',
            focusTip: 'Be brutally honest · fix what costs you most points, not what feels comfortable',
            resources: [
              { label: 'Victor Cheng Feedback Framework — YouTube', url: 'https://www.youtube.com/@VictorChengCaseInterviews', primary: true },
              { label: 'PrepLounge Expert Feedback (paid)', url: 'https://www.preplounge.com/en/coaching.php', primary: false },
            ],
            community: 'PrepLounge → submit case recording for community feedback',
            xpBase: 80,
          },
          {
            title: 'Follow Up With 2 Network Contacts',
            estimatedMinutes: 20,
            difficulty: 'easy',
            startTrigger: 'Open LinkedIn, go to Messaging → Sent, find contacts from the past 2 weeks with no reply',
            steps: [
              'Find 2 unanswered messages from the past 2 weeks (3 min)',
              'Write a short follow-up for each: 1 new sentence of value + polite nudge (12 min)',
              'Send both (5 min)',
            ],
            completionCondition: '2 follow-up messages sent — both shorter than 80 words',
            focusTip: 'Keep it short · add 1 new piece of value · never ask twice in the same message',
            resources: [
              { label: 'Follow-Up Template Examples', url: 'https://managementconsulted.com/consulting-networking/', primary: true },
            ],
            community: null,
            xpBase: 55,
          },
        ],
      ],
    },

    // ── FITNESS ───────────────────────────────────────────────────────────────
    fitness: {
      milestones: [
        { title: 'Baseline',       desc: 'Establish routine and baseline metrics',    weeks: 2 },
        { title: 'Build Habit',    desc: 'Consistent training 4×/week',               weeks: 6 },
        { title: 'Intensity Up',   desc: 'Progressive overload and diet lock-in',     weeks: 6 },
        { title: 'Peak & Maintain',desc: 'Hit target metrics and maintain',            weeks: 4 },
      ],
      taskSets: [
        // Milestone 0 – Baseline
        [
          {
            title: 'Record Your Baseline: Weight + Measurements + Photos',
            estimatedMinutes: 15,
            difficulty: 'easy',
            startTrigger: 'Step on the scale right now and write the number before you do anything else',
            steps: [
              'Weigh yourself (morning, after bathroom) and record (2 min)',
              'Measure waist, chest, hips, arms — write all numbers (8 min)',
              'Take front, side, back progress photos in consistent lighting (5 min)',
            ],
            completionCondition: 'Weight + 4 measurements + 3 photos stored in your phone or notes',
            focusTip: 'Same time, same conditions every week for accurate tracking',
            resources: [
              { label: 'Strong App — workout + body tracking (free)', url: 'https://www.strong.app', primary: true },
              { label: 'MyFitnessPal — measurements tracker', url: 'https://www.myfitnesspal.com', primary: false },
            ],
            community: null,
            xpBase: 40,
          },
          {
            title: 'Full Body Assessment Workout (First Session)',
            estimatedMinutes: 45,
            difficulty: 'core',
            startTrigger: 'Change into workout clothes right now and walk to where you\'ll train — no scrolling first',
            steps: [
              '5-min dynamic warmup: leg swings, arm circles, hip rotations',
              'Test squat: 3 sets of 5 at light weight — note form and weight',
              'Test push-up: max reps in 1 set — note total',
              'Test pull-up or row: max reps — note total',
              'Write all numbers + how your body felt (5 min)',
            ],
            completionCondition: 'Squat weight + push-up reps + pull-up reps recorded with notes on form',
            focusTip: 'This is assessment, not performance — use light weight, perfect form',
            resources: [
              { label: 'Jeff Nippard — Beginner Program YouTube', url: 'https://www.youtube.com/@JeffNippard', primary: true },
              { label: 'AthleanX Fundamentals', url: 'https://www.youtube.com/@athleanx', primary: false },
            ],
            community: 'r/fitness — post your baseline numbers in the Daily Simple Questions thread',
            xpBase: 70,
          },
          {
            title: 'Plan Your Week: Meals + Training Schedule',
            estimatedMinutes: 25,
            difficulty: 'easy',
            startTrigger: 'Open your phone calendar and block 4 training slots for this week before anything else',
            steps: [
              'Block 4 training times in your calendar for the week (5 min)',
              'Plan 3 meals for tomorrow — use MyFitnessPal to hit your protein target (15 min)',
              'Write a grocery list for the next 2 days (5 min)',
            ],
            completionCondition: '4 training slots in calendar + tomorrow\'s meals planned in MyFitnessPal',
            focusTip: 'Planning the night before removes the decision friction in the morning',
            resources: [
              { label: 'MyFitnessPal (free food logging)', url: 'https://www.myfitnesspal.com', primary: true },
              { label: 'Cronometer — precise macro tracking', url: 'https://cronometer.com', primary: false },
            ],
            community: null,
            xpBase: 45,
          },
        ],
        // Milestone 1 – Build Habit
        [
          {
            title: 'Push Day Strength Session',
            estimatedMinutes: 45,
            difficulty: 'core',
            startTrigger: 'Put on your shoes and walk to the gym or your training space — start the Strong app timer',
            steps: [
              '5-min warmup: shoulder circles + light bench press (5 min)',
              'Bench Press: 3×8 at your working weight — log each set in Strong (12 min)',
              'Overhead Press: 3×10 (10 min)',
              'Tricep Dips or Pushdowns: 3×12 (10 min)',
              'Log everything and rate your session energy 1–5 (3 min)',
            ],
            completionCondition: 'All 3 exercises logged with weights and reps in Strong app',
            focusTip: '45-min timer · rest max 90 sec between sets · no phone except logging',
            resources: [
              { label: 'Strong App — free workout logger', url: 'https://www.strong.app', primary: true },
              { label: 'Jeff Nippard Push Day Program', url: 'https://www.youtube.com/@JeffNippard', primary: false },
            ],
            community: 'r/fitness daily thread — log your session and get form feedback',
            xpBase: 70,
          },
          {
            title: 'Meal Prep: Cook 2 Days of Protein + Carbs',
            estimatedMinutes: 45,
            difficulty: 'easy',
            startTrigger: 'Open MyFitnessPal, check tomorrow\'s protein target, then walk to the kitchen',
            steps: [
              'Cook 300–400g of chicken breast or eggs (main protein source) (20 min)',
              'Prep rice, oats, or sweet potato for carbs (15 min)',
              'Portion into containers: 2 days of meals (8 min)',
              'Log all macros in MyFitnessPal (2 min)',
            ],
            completionCondition: '2 days of portioned meals in fridge + macros logged',
            focusTip: 'Cook in bulk — 45 min now saves 20 min × 4 meals this week',
            resources: [
              { label: 'MyFitnessPal — macro calculator', url: 'https://www.myfitnesspal.com', primary: true },
              { label: 'High Protein Meal Prep — YouTube (Remington James)', url: 'https://www.youtube.com/@RemingtonJames', primary: false },
            ],
            community: null,
            xpBase: 55,
          },
          {
            title: 'Leg Day + Bodyweight Check',
            estimatedMinutes: 50,
            difficulty: 'stretch',
            startTrigger: 'Open Strong app, create a new workout called "Leg Day [date]", and start the timer',
            steps: [
              'Warmup: 5 min leg swings + light squats',
              'Squat: 4×6 at 70% 1RM — log each rep quality (15 min)',
              'Romanian Deadlift: 3×10 — focus on hamstring stretch (12 min)',
              'Walking Lunges: 3×12 each leg (10 min)',
              'Weigh yourself post-session + note bodyweight in app (3 min)',
            ],
            completionCondition: 'Full leg session logged in Strong + bodyweight recorded',
            focusTip: '50-min timer · film your squat from the side at least once for form check',
            resources: [
              { label: 'Strong App', url: 'https://www.strong.app', primary: true },
              { label: 'Alan Thrall — Squat Form Guide', url: 'https://www.youtube.com/@UntamedStrength', primary: false },
            ],
            community: 'r/formcheck — post your squat video for free form critique',
            xpBase: 85,
          },
        ],
        // Milestone 2 – Intensity Up
        [
          {
            title: 'HIIT Session: 4 Rounds, 25 Minutes',
            estimatedMinutes: 30,
            difficulty: 'core',
            startTrigger: 'Set a 25-min timer, put on music, and start the first exercise immediately',
            steps: [
              '2-min warmup: jumping jacks + high knees',
              '4 rounds: 40 sec work / 20 sec rest — Burpees, Jump Squats, Push-ups, Mountain Climbers',
              '3-min cooldown stretch',
              'Log heart rate or perceived effort 1–10',
            ],
            completionCondition: '4 full rounds completed + effort level logged',
            focusTip: '30-min session · no rests between rounds · keep a bucket nearby',
            resources: [
              { label: 'Nike Training Club — free HIIT workouts', url: 'https://www.nike.com/ntc-app', primary: true },
              { label: 'Sydney Cummings HIIT — YouTube', url: 'https://www.youtube.com/@SydneyCummingsHoudyshell', primary: false },
            ],
            community: null,
            xpBase: 75,
          },
          {
            title: 'Progressive Overload: Add 5% to Last Week\'s Key Lifts',
            estimatedMinutes: 50,
            difficulty: 'stretch',
            startTrigger: 'Open Strong app, find last week\'s session, add 5% to each main lift weight',
            steps: [
              'Calculate new weights: last week × 1.05 (round to nearest plate) (5 min)',
              'Bench/Squat/Deadlift at new weight: 3×5 — full focus (30 min)',
              'If form breaks, drop back 2.5kg and log the reason (5 min)',
              'Record: new weight, reps, form quality (10 min)',
            ],
            completionCondition: 'New weights logged — PR attempted on at least 1 lift',
            focusTip: 'Progressive overload is the #1 driver of results — do not skip this',
            resources: [
              { label: 'Strong App — progressive overload tracking', url: 'https://www.strong.app', primary: true },
              { label: 'Alan Thrall — Progressive Overload Explained', url: 'https://www.youtube.com/@UntamedStrength', primary: false },
            ],
            community: null,
            xpBase: 90,
          },
          {
            title: 'Full Day of Nutrition Tracking — Hit Your Macros',
            estimatedMinutes: 20,
            difficulty: 'easy',
            startTrigger: 'Open MyFitnessPal right now and log what you already ate this morning',
            steps: [
              'Log breakfast immediately (5 min)',
              'Pre-log lunch and dinner for today (10 min)',
              'Check: are you hitting protein target? Adjust 1 meal if not (5 min)',
            ],
            completionCondition: 'All meals logged in MyFitnessPal — protein target within 10g',
            focusTip: 'Pre-logging at the start of the day is 10× easier than end-of-day recall',
            resources: [
              { label: 'MyFitnessPal', url: 'https://www.myfitnesspal.com', primary: true },
              { label: 'Cronometer — more precise tracking', url: 'https://cronometer.com', primary: false },
            ],
            community: null,
            xpBase: 50,
          },
        ],
        // Milestone 3 – Peak & Maintain
        [
          {
            title: 'Test Your 1RM on 3 Main Lifts',
            estimatedMinutes: 60,
            difficulty: 'stretch',
            startTrigger: 'Open Strong app, create "1RM Test Day", and start with a 10-min warmup',
            steps: [
              '10-min full body warmup',
              'Squat 1RM: work up in 3 sets to your max (20 min)',
              'Bench Press 1RM: same protocol (20 min)',
              'Compare to your baseline from Week 1 — calculate % increase (10 min)',
            ],
            completionCondition: '3 new 1RM numbers recorded + comparison to baseline written',
            focusTip: 'Have a spotter or use safety bars — safety first on 1RM day',
            resources: [
              { label: 'Strong App — 1RM calculator', url: 'https://www.strong.app', primary: true },
              { label: 'Starting Strength 1RM Protocol', url: 'https://startingstrength.com', primary: false },
            ],
            community: 'r/fitness — post your before/after numbers for accountability',
            xpBase: 110,
          },
          {
            title: 'Final Progress Review: Photos + Measurements',
            estimatedMinutes: 20,
            difficulty: 'easy',
            startTrigger: 'Step on the scale — same time, same conditions as Week 1',
            steps: [
              'Weigh yourself and record (2 min)',
              'Take the same measurements as Week 1 (waist, chest, hips, arms) (8 min)',
              'Take front, side, back photos in identical conditions to Week 1 (5 min)',
              'Write 3 specific things that changed physically and mentally (5 min)',
            ],
            completionCondition: 'Final measurements + photos + 3 written observations — ready to compare',
            focusTip: 'Compare Week 1 and final photos side by side — results are often invisible day-to-day',
            resources: [
              { label: 'Progress Photo Tips — Reddit', url: 'https://www.reddit.com/r/progresspics/', primary: true },
            ],
            community: 'r/progresspics — post your transformation for community support',
            xpBase: 70,
          },
        ],
      ],
    },

    // ── STARTUP ───────────────────────────────────────────────────────────────
    startup: {
      milestones: [
        { title: 'Validate Idea', desc: 'Customer discovery and problem validation',  weeks: 3 },
        { title: 'Build MVP',     desc: 'Ship minimal working product',               weeks: 6 },
        { title: 'Get Users',     desc: 'First 10–100 users and feedback loops',      weeks: 4 },
        { title: 'Revenue',       desc: 'First paying customer',                      weeks: 5 },
      ],
      taskSets: [
        // Milestone 0 – Validate
        [
          {
            title: 'Write a 1-Page Problem Hypothesis',
            estimatedMinutes: 30,
            difficulty: 'easy',
            startTrigger: 'Open a blank doc, type "Problem Hypothesis [date]" at the top, and write the first sentence',
            steps: [
              'Write who has the problem (specific person, not everyone) (5 min)',
              'Write what the problem is in 1 sentence (5 min)',
              'Write how they currently solve it and why that\'s broken (10 min)',
              'Write what success looks like for them (10 min)',
            ],
            completionCondition: '4 sections complete — 1 page max — no business model yet',
            focusTip: 'No solutions yet — only describe the problem and the person',
            resources: [
              { label: 'YC Problem Statement Framework', url: 'https://www.ycombinator.com/library/Ei-how-to-apply-to-y-combinator', primary: true },
              { label: 'Indie Hackers — Idea Validation Forum', url: 'https://www.indiehackers.com', primary: false },
            ],
            community: 'Indie Hackers → "Share your idea" thread for early feedback',
            xpBase: 55,
          },
          {
            title: 'Conduct 1 Customer Discovery Interview (30 min)',
            estimatedMinutes: 40,
            difficulty: 'core',
            startTrigger: 'Text or email 1 person who fits your target customer profile and book a 30-min call today',
            steps: [
              'Book the call and prepare 5 open-ended questions (10 min)',
              'Run the call: ask about their problem, NOT your solution (30 min)',
              'Write 3 specific quotes or insights from the call (10 min)',
            ],
            completionCondition: '3 specific insights from the call written — with quotes, not summaries',
            focusTip: 'Never pitch during discovery · listen 80%, talk 20% · record with permission',
            resources: [
              { label: 'The Mom Test (book summary)', url: 'https://www.momtestbook.com', primary: true },
              { label: 'YC Customer Discovery Questions', url: 'https://www.ycombinator.com/library', primary: false },
            ],
            community: 'r/startups — post your 3 insights for validation',
            xpBase: 80,
          },
          {
            title: 'Map 5 Competitors: Features + Weaknesses',
            estimatedMinutes: 45,
            difficulty: 'stretch',
            startTrigger: 'Open a Google Sheet and create columns: Name, Price, Top Feature, Biggest Weakness, User Reviews',
            steps: [
              'Find 5 competitors (search your problem + "tool" or "app") (10 min)',
              'Fill in: price, top 3 features for each (15 min)',
              'Read 10 negative reviews per competitor on G2, ProductHunt, or Reddit (15 min)',
              'Write 1 sentence: the gap all competitors share (5 min)',
            ],
            completionCondition: 'Competitive matrix complete for 5 competitors + 1 clear gap identified',
            focusTip: 'Look for patterns in negative reviews — that\'s where your opportunity is',
            resources: [
              { label: 'G2 — Software Reviews', url: 'https://www.g2.com', primary: true },
              { label: 'Product Hunt — competitor discovery', url: 'https://www.producthunt.com', primary: false },
            ],
            community: null,
            xpBase: 85,
          },
        ],
        // Milestone 1 – Build MVP
        [
          {
            title: 'Build Core Feature #1 — 90 Min Focused Session',
            estimatedMinutes: 90,
            difficulty: 'stretch',
            startTrigger: 'Close all tabs except your code editor and start a 90-min timer right now',
            steps: [
              'Define the 1 thing this feature must do — write it in 1 sentence (5 min)',
              'Code the core logic — no styling yet (60 min)',
              'Test it manually: does it work? (15 min)',
              'Write what\'s left to finish this feature (10 min)',
            ],
            completionCondition: 'Feature works end-to-end — you can demo it to 1 person',
            focusTip: '90-min deep work block · no Slack · no email · phone away',
            resources: [
              { label: 'GitHub — code hosting', url: 'https://www.github.com', primary: true },
              { label: 'Vercel — free instant deployment', url: 'https://vercel.com', primary: false },
            ],
            community: 'Indie Hackers — share your progress post after each major feature',
            xpBase: 100,
          },
          {
            title: 'Create a Landing Page in 1 Hour (No Code)',
            estimatedMinutes: 60,
            difficulty: 'core',
            startTrigger: 'Open Carrd.co or Webflow and start a new project — use a template',
            steps: [
              'Pick a template that fits your product (5 min)',
              'Write headline: "We help [WHO] do [WHAT] without [PAIN]" (10 min)',
              'Add 3 benefit bullets + 1 call to action (15 min)',
              'Add your email capture form (10 min)',
              'Publish and test on mobile (10 min)',
              'Share the URL with 3 people and ask "Would you sign up?" (10 min)',
            ],
            completionCondition: 'Live URL with email capture — tested on mobile — shared with 3 people',
            focusTip: 'Ship ugly. Fix later. The goal is a live URL today.',
            resources: [
              { label: 'Carrd — free landing pages', url: 'https://carrd.co', primary: true },
              { label: 'Webflow — free plan', url: 'https://webflow.com', primary: false },
              { label: 'Mailchimp — free email capture', url: 'https://mailchimp.com', primary: false },
            ],
            community: 'r/roastmystartup — post your landing page URL for brutal honest feedback',
            xpBase: 90,
          },
          {
            title: 'Set Up Analytics: Know What\'s Happening on Your Site',
            estimatedMinutes: 30,
            difficulty: 'easy',
            startTrigger: 'Open Google Analytics and click "Start measuring" — have your site URL ready',
            steps: [
              'Create GA4 property and paste tracking code into your site (15 min)',
              'Set up 1 conversion event: "email_signup" or "cta_click" (10 min)',
              'Test: visit your site and confirm event fires in GA4 Realtime (5 min)',
            ],
            completionCondition: 'GA4 installed + 1 conversion event tracking — verified in Realtime',
            focusTip: 'You cannot improve what you cannot measure — do this before you get users',
            resources: [
              { label: 'Google Analytics 4 — free', url: 'https://analytics.google.com', primary: true },
              { label: 'Plausible — privacy-friendly alternative', url: 'https://plausible.io', primary: false },
            ],
            community: null,
            xpBase: 55,
          },
        ],
        // Milestone 2 – Get Users
        [
          {
            title: 'Post in 2 Communities With a Value-First Approach',
            estimatedMinutes: 40,
            difficulty: 'core',
            startTrigger: 'Open Reddit or Indie Hackers and find the most active thread in your target community',
            steps: [
              'Find the right community (subreddit, forum, Slack) for your target user (10 min)',
              'Write a post that leads with insight or story — no hard sell (20 min)',
              'Post in 2 communities and respond to every comment within 1 hour (10 min)',
            ],
            completionCondition: '2 posts live — both leading with value, not promotion',
            focusTip: 'If your post is just an ad, it will be removed · lead with a genuine insight',
            resources: [
              { label: 'Indie Hackers — community sharing', url: 'https://www.indiehackers.com', primary: true },
              { label: 'r/startups — share your progress', url: 'https://www.reddit.com/r/startups/', primary: false },
              { label: 'Product Hunt — ship and get feedback', url: 'https://www.producthunt.com', primary: false },
            ],
            community: 'Indie Hackers "What are you working on?" weekly thread',
            xpBase: 75,
          },
          {
            title: 'Run 1 User Feedback Session (30-Min Call)',
            estimatedMinutes: 40,
            difficulty: 'stretch',
            startTrigger: 'Message 1 of your current users: "Can we do a 30-min feedback call this week? I\'ll buy coffee"',
            steps: [
              'Book the call (ask 3 people, take the first yes) (5 min)',
              'Prepare 5 questions focused on friction and confusion (5 min)',
              'Run the call: share your screen, watch them use the product (30 min)',
              'Write 3 specific fixes based on what you saw (10 min)',
            ],
            completionCondition: '3 specific product fixes written based on what the user struggled with',
            focusTip: 'Watch where they hesitate or click wrong — that\'s your product roadmap',
            resources: [
              { label: 'Calendly — free booking link', url: 'https://calendly.com', primary: true },
              { label: 'Loom — async user session recording', url: 'https://www.loom.com', primary: false },
            ],
            community: null,
            xpBase: 90,
          },
          {
            title: 'Cold Email 10 Target Users',
            estimatedMinutes: 30,
            difficulty: 'easy',
            startTrigger: 'Open your email, write "Cold Outreach [date]" as subject, and draft your first message',
            steps: [
              'Write 1 template: 3 sentences max — problem, how you solve it, ask (10 min)',
              'Find 10 specific email addresses using LinkedIn or Apollo.io (10 min)',
              'Personalize line 1 of each email before sending (10 min)',
            ],
            completionCondition: '10 emails sent — each with a personalized first line',
            focusTip: '3 sentences max · 1 clear ask · no attachments · subject line: 5 words max',
            resources: [
              { label: 'Apollo.io — free email finder (50/month)', url: 'https://www.apollo.io', primary: true },
              { label: 'Hunter.io — email finder', url: 'https://hunter.io', primary: false },
            ],
            community: 'r/sales — post your cold email for feedback before sending',
            xpBase: 65,
          },
        ],
        // Milestone 3 – Revenue
        [
          {
            title: 'Set Up Stripe and Create Your First Pricing Page',
            estimatedMinutes: 30,
            difficulty: 'easy',
            startTrigger: 'Go to stripe.com, click "Start now", and create your account in the next 5 minutes',
            steps: [
              'Create Stripe account and activate it (10 min)',
              'Create 1 product with your price point (10 min)',
              'Generate a payment link and paste it on your landing page (10 min)',
            ],
            completionCondition: 'Live Stripe payment link on your site — test it with a $0.50 test charge',
            focusTip: 'Done is better than perfect — a working payment page ships today',
            resources: [
              { label: 'Stripe — payments infrastructure', url: 'https://stripe.com', primary: true },
              { label: 'Gumroad — simpler alternative', url: 'https://gumroad.com', primary: false },
            ],
            community: null,
            xpBase: 60,
          },
          {
            title: 'Run 1 Sales Demo Call (30 Min)',
            estimatedMinutes: 40,
            difficulty: 'stretch',
            startTrigger: 'Message your warmest lead: "Can I show you [product] in 30 min? I think it solves [their problem]"',
            steps: [
              'Open with their problem, not your product (5 min)',
              'Demo the 1 feature that solves their specific problem (15 min)',
              'Ask "What would need to be true for you to try this?" (5 min)',
              'Make the ask: offer a free trial or a specific price (5 min)',
              'Write what objection they gave and how you\'ll address it (10 min)',
            ],
            completionCondition: 'Call done + objection documented + follow-up email sent within 1 hour',
            focusTip: 'Open with their pain, not your features · ask for the sale directly',
            resources: [
              { label: 'Loom — async demo alternative', url: 'https://www.loom.com', primary: true },
              { label: 'YC Sales Advice for Founders', url: 'https://www.ycombinator.com/library/Ei-sales-for-founders', primary: false },
            ],
            community: 'r/sales — post your call script for critique',
            xpBase: 110,
          },
          {
            title: 'Send Pricing Proposal to 5 Warm Leads',
            estimatedMinutes: 35,
            difficulty: 'core',
            startTrigger: 'Open your list of people who showed interest — pick the 5 most engaged',
            steps: [
              'List 5 people who engaged with your product (5 min)',
              'Write a 3-paragraph email: recap their problem, show your solution, give a price (15 min)',
              'Personalize line 1 for each lead (10 min)',
              'Send all 5 — log them in a simple spreadsheet (5 min)',
            ],
            completionCondition: '5 pricing emails sent — all logged in tracking sheet',
            focusTip: 'Charge more than you think · test 3 different price points across 5 leads',
            resources: [
              { label: 'Notion — simple sales tracking template', url: 'https://www.notion.so', primary: true },
              { label: 'Google Sheets — free CRM', url: 'https://sheets.google.com', primary: false },
            ],
            community: null,
            xpBase: 85,
          },
        ],
      ],
    },

    // ── DEFAULT ───────────────────────────────────────────────────────────────
    default: {
      milestones: [
        { title: 'Learn & Prepare', desc: 'Research and skill foundation',       weeks: 3 },
        { title: 'Build & Practice',desc: 'Active work and iteration',            weeks: 5 },
        { title: 'Refine & Grow',   desc: 'Improve quality and expand',          weeks: 4 },
        { title: 'Complete & Ship', desc: 'Final push to goal completion',       weeks: 4 },
      ],
      taskSets: [
        [
          {
            title: 'Find Your Top 3 Learning Resources and Rank Them',
            estimatedMinutes: 30,
            difficulty: 'easy',
            startTrigger: 'Open a blank doc titled "Learning Resources" and write your goal at the top',
            steps: [
              'Search "[your goal] best resources 2024 Reddit" and scan 3 threads (15 min)',
              'List 5 resources: book, course, community, YouTube, tool (10 min)',
              'Pick the top 3 and write why each one is best (5 min)',
            ],
            completionCondition: '3 ranked resources with 1-sentence rationale each — ready to use tomorrow',
            focusTip: 'Don\'t start consuming content yet — just identify the best sources',
            resources: [
              { label: 'Reddit — search "[goal] resources"', url: 'https://www.reddit.com', primary: true },
              { label: 'YouTube — search "[goal] beginner guide"', url: 'https://www.youtube.com', primary: false },
            ],
            community: 'Find a subreddit for your goal — post "Best resources for beginner?"',
            xpBase: 50,
          },
          {
            title: 'Deep Work Session: Study Core Concept for 60 Minutes',
            estimatedMinutes: 60,
            difficulty: 'core',
            startTrigger: 'Open your primary resource, find where you left off, and start a 60-min timer immediately',
            steps: [
              'Read or watch your primary resource for 50 minutes — take brief notes (50 min)',
              'Summarize what you learned in 5 bullet points (10 min)',
            ],
            completionCondition: '5 bullet-point summary written in your own words — no copy-pasting',
            focusTip: '60-min Pomodoro · phone in another room · 1 tab only · notes on paper',
            resources: [
              { label: 'Forest App — focus timer (free)', url: 'https://www.forestapp.cc', primary: true },
              { label: 'Notion — note-taking', url: 'https://www.notion.so', primary: false },
            ],
            community: null,
            xpBase: 70,
          },
          {
            title: 'Find 1 Mentor or Accountability Partner',
            estimatedMinutes: 25,
            difficulty: 'stretch',
            startTrigger: 'Open Reddit or LinkedIn and search "[your goal] community" right now',
            steps: [
              'Find 1 community where people pursue your goal (5 min)',
              'Find 1 person 6–12 months ahead of you (5 min)',
              'Send them a specific message: who you are, where you are, 1 specific question (15 min)',
            ],
            completionCondition: '1 message sent to a potential mentor — specific question included',
            focusTip: 'Ask a specific question — not "can you mentor me?" but something answerable',
            resources: [
              { label: 'Reddit — find your goal\'s subreddit', url: 'https://www.reddit.com', primary: true },
              { label: 'LinkedIn — connect with practitioners', url: 'https://www.linkedin.com', primary: false },
            ],
            community: 'ADPList — free mentorship platform for any goal',
            xpBase: 80,
          },
        ],
        [
          {
            title: 'Deliberate Practice Session: Work on Your Weakest Skill',
            estimatedMinutes: 60,
            difficulty: 'core',
            startTrigger: 'Write your #1 weakest skill at the top of a blank page, then start working on it immediately',
            steps: [
              'Identify the exact sub-skill you struggle with most (5 min)',
              'Practice that sub-skill deliberately for 45 minutes — no other activities (45 min)',
              'Write what improved and what still needs work (10 min)',
            ],
            completionCondition: '45 min of practice + improvement notes written',
            focusTip: 'Deliberate practice means working on what\'s hard, not what\'s comfortable',
            resources: [
              { label: 'Anki — spaced repetition for any skill', url: 'https://apps.ankiweb.net', primary: true },
              { label: 'Notion — practice log', url: 'https://www.notion.so', primary: false },
            ],
            community: 'Find a study partner in your goal\'s community for accountability',
            xpBase: 75,
          },
          {
            title: 'Get Feedback: Share Your Work With 1 Person',
            estimatedMinutes: 30,
            difficulty: 'easy',
            startTrigger: 'Identify 1 specific piece of work you can share right now and prepare it',
            steps: [
              'Pick 1 specific output from your last week of work (5 min)',
              'Write 2 specific questions you want answered about it (5 min)',
              'Share it with 1 person who can give useful feedback + ask your questions (20 min)',
            ],
            completionCondition: 'Output shared + 2 specific questions asked — feedback received or pending',
            focusTip: 'Be specific about what feedback you want — "what do you think?" gets nothing',
            resources: [
              { label: 'Reddit — find your goal\'s community', url: 'https://www.reddit.com', primary: true },
            ],
            community: 'Post in your goal\'s subreddit for expert feedback',
            xpBase: 55,
          },
          {
            title: 'Create 1 Output to Share Publicly',
            estimatedMinutes: 60,
            difficulty: 'stretch',
            startTrigger: 'Open a blank doc or editor and write the title of what you\'ll create today',
            steps: [
              'Define what you\'re creating and who it\'s for (5 min)',
              'Create it — write, record, build, design (45 min)',
              'Polish once (5 min)',
              'Publish or share it publicly (5 min)',
            ],
            completionCondition: 'Output published or shared — link or screenshot saved',
            focusTip: 'Ship when it\'s 80% done — perfection kills momentum',
            resources: [
              { label: 'Medium — free publishing', url: 'https://www.medium.com', primary: true },
              { label: 'X/Twitter — share your progress publicly', url: 'https://www.twitter.com', primary: false },
            ],
            community: 'Share in your goal community for maximum feedback',
            xpBase: 90,
          },
        ],
        [
          {
            title: 'Identify Top 3 Weaknesses and Plan Fixes',
            estimatedMinutes: 30,
            difficulty: 'easy',
            startTrigger: 'Open your last week\'s notes and read what went wrong before writing anything',
            steps: [
              'Review last 2 weeks of work — what went wrong? (10 min)',
              'List your 3 biggest weaknesses specifically (10 min)',
              'For each: write 1 specific action to fix it this week (10 min)',
            ],
            completionCondition: '3 weaknesses + 3 specific fix actions written',
            focusTip: 'Be brutally specific — "I need to improve" is not a weakness',
            resources: [
              { label: 'Notion — reflection template', url: 'https://www.notion.so', primary: true },
            ],
            community: null,
            xpBase: 50,
          },
          {
            title: 'Connect With 1 Person Ahead of You in This Field',
            estimatedMinutes: 25,
            difficulty: 'core',
            startTrigger: 'Open LinkedIn or your goal\'s community and find someone 1–2 years ahead of you',
            steps: [
              'Find 1 person who achieved what you\'re working toward (5 min)',
              'Read their public content or profile thoroughly (10 min)',
              'Send a specific, short message referencing their work and asking 1 precise question (10 min)',
            ],
            completionCondition: 'Message sent — references their specific work — 1 clear question asked',
            focusTip: 'People respond to specific questions, not vague admiration',
            resources: [
              { label: 'LinkedIn', url: 'https://www.linkedin.com', primary: true },
              { label: 'ADPList — free mentorship', url: 'https://adplist.org', primary: false },
            ],
            community: null,
            xpBase: 65,
          },
        ],
        [
          {
            title: 'Final Deep Work: Finish Your Main Deliverable',
            estimatedMinutes: 90,
            difficulty: 'stretch',
            startTrigger: 'Open your main project file and write "FINAL SESSION" at the top — start the timer',
            steps: [
              'List everything remaining to finish (5 min)',
              'Work through the list in priority order (75 min)',
              'Stop at 90 min regardless — write what\'s left (10 min)',
            ],
            completionCondition: 'Deliverable is at least 90% complete — what remains is documented',
            focusTip: '90-min single session · no notifications · this is your final push',
            resources: [
              { label: 'Forest App — focus timer', url: 'https://www.forestapp.cc', primary: true },
            ],
            community: null,
            xpBase: 110,
          },
          {
            title: 'Measure Results Against Your Success Criteria',
            estimatedMinutes: 20,
            difficulty: 'easy',
            startTrigger: 'Open the success criteria you wrote at the start of this goal and read it carefully',
            steps: [
              'Read your original success criteria (2 min)',
              'Rate each criterion 0–10: how well did you achieve it? (10 min)',
              'Write 3 specific things you would do differently next goal (8 min)',
            ],
            completionCondition: 'Each criterion scored + 3 retrospective learnings written',
            focusTip: 'Honest self-assessment is a skill — be as harsh as you\'d be with a colleague',
            resources: [
              { label: 'Notion — retrospective template', url: 'https://www.notion.so', primary: true },
            ],
            community: 'Share your retrospective in your goal community — you\'ll help others',
            xpBase: 60,
          },
        ],
      ],
    },
  };

  // ─── Detection ───────────────────────────────────────────────────────────────

  function detectTemplate(goalText) {
    const g = goalText.toLowerCase();
    if (/consult|mbb|mckinsey|bain|bcg|strategy|case interview/.test(g)) return TEMPLATES.consultant;
    // Check startup before fitness to avoid "run a company" → fitness via /run/
    if (/startup|found(er|ing)|launch.*product|build.*app|saas|mvp|\bbusiness\b|\bcompany\b|\bproduct\b/.test(g)) return TEMPLATES.startup;
    // Word boundaries on ambiguous words: "run" (not "run a company"), "cut" (not "budget cut"), "fit" (not "outfit")
    if (/\bgym\b|weight loss|lose weight|muscle|marathon|\bworkout\b|\btraining\b|get fit|stay fit|\bbulk\b|body fat|meal prep|calorie/.test(g) || /\brun\b.*(5k|10k|km|mile|faster|marathon)/.test(g)) return TEMPLATES.fitness;
    return TEMPLATES.default;
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  function uid() { return Math.random().toString(36).slice(2, 10); }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  // ─── Build Plan ──────────────────────────────────────────────────────────────

  const TASKS_PER_NODE = 3;

  function assemblePlan(clarification, template) {
    const { goalText, deadline, hoursPerWeek, startDate = new Date().toISOString().split('T')[0] } = clarification;
    const goalId = uid();

    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const totalWeeks = deadline
      ? Math.max(4, Math.round((new Date(deadline) - new Date(startDate)) / msPerWeek))
      : template.milestones.reduce((s, m) => s + m.weeks, 0);

    const totalTemplateWeeks = template.milestones.reduce((s, m) => s + m.weeks, 0);
    const scale = totalWeeks / totalTemplateWeeks;

    const goal = {
      id: goalId,
      title: goalText,
      deadline: deadline || addDays(startDate, totalWeeks * 7),
      priority: clarification.priority || 7,
      hoursPerWeek: hoursPerWeek || 10,
      successCriteria: clarification.successCriteria || `Successfully achieve: ${goalText}`,
      startDate,
      createdAt: new Date().toISOString(),
    };

    const milestones = [];
    const tasks = [];
    let cursor = startDate;

    template.milestones.forEach((m, mi) => {
      const mWeeks = Math.max(1, Math.round(m.weeks * scale));
      const mDeadline = addDays(cursor, mWeeks * 7);
      const milestoneId = uid();
      milestones.push({
        id: milestoneId,
        goalId,
        title: m.title,
        desc: m.desc,
        deadline: mDeadline,
        startDate: cursor,
        progress: 0,
        index: mi,
        color: WORLD_COLORS[mi % WORLD_COLORS.length],
      });

      const taskTemplates = template.taskSets[mi] || template.taskSets[0];
      // Distribute task templates across weeks, cycling if needed
      for (let w = 0; w < mWeeks; w++) {
        const tmpl = taskTemplates[w % taskTemplates.length];
        const deadline = addDays(cursor, w * 7 + 2);
        // Avoid duplicate titles when cycling past the template set
        const isRepeat = w >= taskTemplates.length;
        const round = Math.floor(w / taskTemplates.length) + 1;
        const taskTitle = isRepeat ? `${tmpl.title} — Round ${round}` : tmpl.title;
        tasks.push({
          id: uid(),
          milestoneId,
          goalId,
          // Rich fields from template
          title: taskTitle,
          estimatedMinutes: tmpl.estimatedMinutes,
          difficulty: tmpl.difficulty || 'core',
          startTrigger: tmpl.startTrigger,
          steps: tmpl.steps || [],
          completionCondition: tmpl.completionCondition,
          focusTip: tmpl.focusTip,
          resources: tmpl.resources || [],
          community: tmpl.community || null,
          // System fields
          deadline,
          status: 'todo',
          xpReward: tmpl.xpBase || 60,
          isBoss: false,
        });
      }
      cursor = mDeadline;
    });

    // Build nodes (clusters of TASKS_PER_NODE tasks per milestone)
    const nodes = [];
    let globalIndex = 0;
    milestones.forEach((milestone) => {
      const mTasks = tasks.filter(t => t.milestoneId === milestone.id);
      const numNodes = Math.max(1, Math.ceil(mTasks.length / TASKS_PER_NODE));
      for (let ni = 0; ni < numNodes; ni++) {
        const nodeTasks = mTasks.slice(ni * TASKS_PER_NODE, (ni + 1) * TASKS_PER_NODE);
        const isBoss = ni === numNodes - 1;
        if (isBoss) nodeTasks.forEach(t => { t.xpReward = Math.round(t.xpReward * 2); t.isBoss = true; });
        nodes.push({
          id: uid(),
          milestoneId: milestone.id,
          goalId,
          title: isBoss
            ? `⚔️ Boss: ${milestone.title}`
            : `${milestone.title}: ${NODE_SUBTITLES[ni % NODE_SUBTITLES.length]}`,
          taskIds: nodeTasks.map(t => t.id),
          isBoss,
          index: ni,
          globalIndex: globalIndex++,
          color: milestone.color,
        });
      }
    });

    return { goal, milestones, tasks, nodes };
  }

  function buildPlan(clarification) {
    return assemblePlan(clarification, detectTemplate(clarification.goalText));
  }

  async function buildPlanAI(clarification) {
    try {
      const res = await fetch('/api/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clarification),
      });
      if (!res.ok) throw new Error('API error');
      const { template } = await res.json();
      return assemblePlan(clarification, template);
    } catch {
      const plan = assemblePlan(clarification, detectTemplate(clarification.goalText));
      return { ...plan, _usedFallback: true };
    }
  }

  // ─── Daily Task Selection ────────────────────────────────────────────────────
  // Pick up to 5 tasks: 1 easy + 1–2 core + 1 stretch, balanced by availability

  function selectDailyTasks(tasks, hoursPerWeek) {
    const today = new Date().toISOString().split('T')[0];
    const available = tasks.filter(t => t.status !== 'done' && t.deadline <= addDays(today, 3))
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const dailyMinutes = Math.round((hoursPerWeek || 10) * 60 / 7);
    // Allow 25% overrun so user can finish a started task; floor at 25 min so at least 1 task is always shown
    const budget = Math.max(dailyMinutes * 1.25, 25);

    const easy    = available.filter(t => t.difficulty === 'easy');
    const core    = available.filter(t => t.difficulty === 'core');
    const stretch = available.filter(t => t.difficulty === 'stretch');

    const picked = [];
    let minutesUsed = 0;

    function tryAdd(t) {
      if (picked.find(p => p.id === t.id)) return false;
      if (minutesUsed + t.estimatedMinutes <= budget) {
        picked.push(t);
        minutesUsed += t.estimatedMinutes;
        return true;
      }
      return false;
    }

    // Pick 1 easy first (quick win), then up to 2 core, then 1 stretch
    for (const t of easy.slice(0, 1)) tryAdd(t);
    let coreCount = 0;
    for (const t of core) { if (coreCount >= 2) break; if (tryAdd(t)) coreCount++; }
    for (const t of stretch.slice(0, 1)) tryAdd(t);

    // If nothing fit within budget, show the single shortest available task
    if (picked.length === 0 && available.length > 0) {
      const shortest = [...available].sort((a, b) => a.estimatedMinutes - b.estimatedMinutes)[0];
      picked.push(shortest);
    }

    return picked;
  }

  // ─── Adaptive Mode ───────────────────────────────────────────────────────────

  function getAdaptiveMode(user) {
    const total = (user.totalTasksDone || 0) + (user.totalTasksSkipped || 0);
    if (total < 5) return 'normal';
    const rate = (user.totalTasksDone || 0) / total;
    if (rate < 0.4) return 'reduced';    // overwhelmed — fewer, easier tasks
    if (rate > 0.85) return 'boosted';   // crushing it — add stretch
    return 'normal';
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function computeNodeStates(nodes, tasks) {
    return nodes.map((node, i) => {
      const nodeTasks = tasks.filter(t => node.taskIds.includes(t.id));
      const done = nodeTasks.filter(t => t.status === 'done').length;
      const state = done === nodeTasks.length && nodeTasks.length > 0 ? 'complete'
        : done > 0 ? 'partial'
        : i === 0 ? 'active'
        : (() => {
            const prev = nodes[i - 1];
            const prevTasks = tasks.filter(t => prev.taskIds.includes(t.id));
            const prevDone = prevTasks.filter(t => t.status === 'done').length;
            return prevDone === prevTasks.length ? 'active' : 'locked';
          })();
      return { ...node, state };
    });
  }

  function getUpcomingTasks(tasks, days = 7) {
    const today = new Date().toISOString().split('T')[0];
    return tasks
      .filter(t => t.status !== 'done' && t.deadline >= today && t.deadline <= addDays(today, days))
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }

  function getOverdueTasks(tasks) {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.status !== 'done' && t.deadline < today);
  }

  function rescheduleTasks(tasks) {
    const today = new Date().toISOString().split('T')[0];
    // Sort overdue tasks oldest-first, then spread them: 2 per day starting from today
    const overdue = tasks
      .filter(t => t.status !== 'done' && t.deadline < today)
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    const MAX_PER_DAY = 2;
    const rescheduledMap = {};
    overdue.forEach((t, i) => {
      const dayOffset = Math.floor(i / MAX_PER_DAY);
      rescheduledMap[t.id] = addDays(today, dayOffset);
    });

    return tasks.map(t =>
      rescheduledMap[t.id]
        ? { ...t, deadline: rescheduledMap[t.id], rescheduled: true }
        : t
    );
  }

  function getTodayTasks(tasks) {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.deadline === today);
  }

  return {
    buildPlan, buildPlanAI, computeNodeStates, selectDailyTasks, getAdaptiveMode,
    getUpcomingTasks, getTodayTasks, getOverdueTasks, rescheduleTasks,
    addDays, WORLD_COLORS,
  };
})();
