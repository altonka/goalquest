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

    // ── LANGUAGE LEARNING ────────────────────────────────────────────────────
    language: {
      milestones: [
        { title: 'Foundations',     desc: 'Pronunciation, alphabet, 500 core words',    weeks: 3 },
        { title: 'Core Grammar',    desc: 'Essential grammar patterns & sentences',      weeks: 5 },
        { title: 'Conversation',    desc: 'Real conversations & listening comprehension', weeks: 6 },
        { title: 'Fluency Push',    desc: 'Immersion, complex topics, near-fluency',     weeks: 4 },
      ],
      taskSets: [
        [
          { title: 'Learn 50 Core Words With Anki Spaced Repetition', estimatedMinutes: 25, difficulty: 'easy', startTrigger: 'Open Anki, find the top-rated vocabulary deck for your language, install it, and review the first card right now', steps: ['Install the most-downloaded vocabulary deck for your language (5 min)', 'Study 50 new cards in the spaced repetition queue (15 min)', 'Write any 10 words from memory on paper without looking (5 min)'], completionCondition: '50 cards reviewed in Anki + 10 words written from memory on paper', focusTip: 'Type nothing — write by hand. Motor memory reinforces vocabulary 2× faster.', resources: [{ label: 'Anki — free spaced repetition', url: 'https://apps.ankiweb.net', primary: true }, { label: 'Anki shared language decks', url: 'https://ankiweb.net/shared/decks', primary: false }], community: null, xpBase: 50 },
          { title: 'Pronunciation Drill: Master 20 Core Sounds', estimatedMinutes: 25, difficulty: 'easy', startTrigger: 'Open Forvo.com, search "hello" in your target language, and listen to 3 native recordings before anything else', steps: ['Listen to 20 words on Forvo — focus on mouth shape and stress (10 min)', 'Record yourself saying each word on your phone (8 min)', 'Compare your recording to the native — write the 3 biggest differences (7 min)'], completionCondition: '20 words recorded + 3 pronunciation gaps written down', focusTip: 'Sounding weird means it\'s working. Imitate ruthlessly, not carefully.', resources: [{ label: 'Forvo — native speaker pronunciation database (free)', url: 'https://forvo.com', primary: true }, { label: 'Speechling — pronunciation feedback (free tier)', url: 'https://speechling.com', primary: false }], community: null, xpBase: 45 },
          { title: 'Complete 3 Duolingo Units — No Skipping', estimatedMinutes: 25, difficulty: 'easy', startTrigger: 'Open Duolingo, set your goal to "Serious", and complete the first lesson immediately', steps: ['Complete lesson 1 in Unit 1 (8 min)', 'Complete lesson 2 (8 min)', 'Complete lesson 3 (8 min)', 'Screenshot your XP and streak (1 min)'], completionCondition: '3 lessons completed + streak active on Duolingo', focusTip: 'Don\'t use hearts tricks or shortcuts — every lesson fully. Shortcuts kill retention.', resources: [{ label: 'Duolingo — free structured lessons', url: 'https://duolingo.com', primary: true }], community: null, xpBase: 40 },
          { title: 'Comprehensible Input: Watch 20-Minute Beginner Video', estimatedMinutes: 35, difficulty: 'stretch', startTrigger: 'Search YouTube for "comprehensible [language] for beginners" and click the first result immediately', steps: ['Watch the full video without subtitles — focus on what you understand (20 min)', 'Write every word you recognized without looking anything up (5 min)', 'Look up 5 words you heard but couldn\'t grasp (10 min)'], completionCondition: 'Video watched + understood-words list written + 5 new words looked up and added to Anki', focusTip: 'Feeling lost at 50% comprehension is the sweet spot. Push through — your brain is working.', resources: [{ label: 'Dreaming Spanish — comprehensible input (free)', url: 'https://www.dreamingspanish.com', primary: true }, { label: 'Language Reactor — Netflix + YouTube with dual subtitles', url: 'https://www.languagereactor.com', primary: false }], community: 'r/languagelearning — post your word list for encouragement', xpBase: 70 },
        ],
        [
          { title: 'Grammar Drill: Write 10 Original Sentences in Present Tense', estimatedMinutes: 35, difficulty: 'core', startTrigger: 'Open a blank notebook page, write "Present Tense Drill [date]", and write your first sentence before opening any reference', steps: ['Write conjugation table for 3 common verbs from memory (10 min)', 'Write 10 original sentences using those verbs (15 min)', 'Cover your notes and rewrite 5 sentences from memory (10 min)'], completionCondition: '10 original sentences written + 5 recalled from memory without looking', focusTip: 'Write about your own life — personal sentences are remembered 3× better than generic examples.', resources: [{ label: 'Linguee — words in context (free)', url: 'https://www.linguee.com', primary: true }, { label: 'Language Transfer — free audio grammar course', url: 'https://www.languagetransfer.org', primary: false }], community: null, xpBase: 65 },
          { title: 'Shadowing Session: Mimic 15 Minutes of Native Audio', estimatedMinutes: 25, difficulty: 'easy', startTrigger: 'Find a 3-min audio clip with a transcript in your target language and listen to it once through now', steps: ['Listen once without stopping (3 min)', 'Shadow line by line — pause, repeat, match rhythm and intonation (12 min)', 'Shadow the full clip continuously without pausing (3 min)', 'Write 3 phrases that now feel natural (7 min)'], completionCondition: '1 clip shadowed continuously + 3 natural phrases written', focusTip: 'Match the speaker\'s emotion and pace — sounding natural beats being grammatically correct.', resources: [{ label: 'Speechling — shadowing with transcripts (free)', url: 'https://speechling.com', primary: true }], community: null, xpBase: 55 },
          { title: 'Sentence Mining: Extract 15 Phrases From Real Content', estimatedMinutes: 40, difficulty: 'core', startTrigger: 'Open LingQ or a native article in your target language and read the first paragraph', steps: ['Read a short article or watch a 5-min video in the target language (10 min)', 'Highlight 15 unknown words or phrases in full sentence context (10 min)', 'Add all 15 as sentence-context cards to Anki (15 min)', 'Review those 15 cards once immediately (5 min)'], completionCondition: '15 sentence-context Anki cards created + reviewed once', focusTip: 'Sentence cards (word in context) retain 3× longer than isolated word cards.', resources: [{ label: 'LingQ — reading with vocabulary tracking (free tier)', url: 'https://www.lingq.com', primary: true }], community: null, xpBase: 70 },
          { title: 'Book Your First Conversation Lesson on Italki', estimatedMinutes: 40, difficulty: 'stretch', startTrigger: 'Go to Italki.com, search community tutors for your language, sort by price ascending', steps: ['Browse 5 tutors — read their intro videos and reviews (10 min)', 'Book the cheapest community tutor for a 30-min trial (5 min)', 'Prepare a 2-minute self-introduction in the target language (20 min)', 'Write 5 questions to ask your tutor (5 min)'], completionCondition: 'Lesson booked + 2-min intro rehearsed + 5 questions written', focusTip: 'Community tutors cost $5–$10 for 30 min. One lesson accelerates more than a week of solo study.', resources: [{ label: 'Italki — community tutors from $5', url: 'https://www.italki.com', primary: true }, { label: 'Tandem — free language exchange', url: 'https://www.tandem.net', primary: false }], community: 'r/language_exchange — find a free language partner this week', xpBase: 90 },
        ],
        [
          { title: 'Conversation Practice: 30-Minute Speaking Session', estimatedMinutes: 40, difficulty: 'stretch', startTrigger: 'Open Tandem or HelloTalk, find a native speaker online, and send "Want to practice for 30 min?" right now', steps: ['Do a 30-minute conversation — target language only, no switching (30 min)', 'Write every word or phrase you couldn\'t say (5 min)', 'Add all gaps to Anki (5 min)'], completionCondition: '30-min conversation completed + gap vocabulary added to Anki', focusTip: 'Productive struggle in real conversation builds fluency faster than any drill.', resources: [{ label: 'Tandem — free language exchange', url: 'https://www.tandem.net', primary: true }, { label: 'HelloTalk — text + voice exchange (free)', url: 'https://www.hellotalk.com', primary: false }], community: 'r/language_exchange — post your level and find a partner this week', xpBase: 95 },
          { title: 'Podcast Listening: Full Episode With Transcript', estimatedMinutes: 35, difficulty: 'core', startTrigger: 'Find a podcast for intermediate learners in your language and queue up Episode 1', steps: ['Listen to a full episode with transcript following along (20 min)', 'Relisten to any section you missed — no pausing (10 min)', 'Write a 5-sentence summary of the episode in the target language (5 min)'], completionCondition: 'Full episode listened to twice + 5-sentence summary written in target language', focusTip: 'Listening comprehension is built through volume. 20 min/day beats 2 hours on weekends.', resources: [{ label: 'News in Slow [Language] — graded podcasts for learners', url: 'https://www.newsinslowspanish.com', primary: true }], community: null, xpBase: 65 },
          { title: 'Read a Children\'s Book End-to-End Without Stopping', estimatedMinutes: 25, difficulty: 'easy', startTrigger: 'Search "free [language] children\'s books online" — open the first result and read the first page now', steps: ['Read the entire story — look up max 10 words (15 min)', 'Read it again without looking anything up (5 min)', 'Write a 3-sentence opinion in the target language (5 min)'], completionCondition: 'Story read twice + 3-sentence opinion written in target language', focusTip: 'Children\'s books use the highest-frequency vocabulary. They\'re efficient, not childish.', resources: [{ label: 'Storyweaver — free multilingual books', url: 'https://storyweaver.org.in', primary: true }], community: null, xpBase: 50 },
          { title: 'Monologue Recording: 3 Minutes Without Stopping', estimatedMinutes: 25, difficulty: 'stretch', startTrigger: 'Open your phone voice recorder, press record, and start speaking about your day — no stopping', steps: ['Record yourself speaking for 3 minutes on any topic (3 min)', 'Listen back — count how many times you paused or switched to your native language (5 min)', 'Record again on the same topic — try to reduce the gaps (3 min)', 'Write 5 phrases you wanted to say but couldn\'t (4 min)'], completionCondition: '2 recordings done + pause count tracked + 5 gap phrases written', focusTip: 'Measuring your pauses forces fluency. Compare recordings every week to hear real progress.', resources: [], community: 'r/languagelearning — post your recording for kind, honest feedback', xpBase: 80 },
        ],
        [
          { title: 'Immersion Block: 4 Hours of Target Language Only', estimatedMinutes: 60, difficulty: 'stretch', startTrigger: 'Change your phone language to your target language right now — that\'s the start condition', steps: ['Change phone + browser language settings (2 min)', 'Watch 1 hour of native content — no subtitles (60 min)', 'Do your Anki review entirely in target language (20 min)', 'Write a 100-word diary entry about today in the target language (20 min)'], completionCondition: '4 hours total target-language exposure + 100-word diary entry written', focusTip: 'You will understand less than you expect. Discomfort at this stage is fluency building.', resources: [{ label: 'Language Reactor — Netflix immersion tool (free)', url: 'https://www.languagereactor.com', primary: true }], community: null, xpBase: 110 },
          { title: 'Write a 200-Word Essay in Your Target Language', estimatedMinutes: 35, difficulty: 'core', startTrigger: 'Open a blank doc, write the title in your target language, and write the first sentence now', steps: ['Write 200 words on any topic you care about — no translation tools (25 min)', 'Read it aloud and fix anything that sounds wrong (5 min)', 'Post it to LangCorrect for free native corrections (5 min)'], completionCondition: '200-word essay written + posted for native correction', focusTip: 'Write about something you\'d actually discuss in real life — not textbook topics.', resources: [{ label: 'LangCorrect — free essay corrections by native speakers', url: 'https://langcorrect.com', primary: true }], community: 'LangCorrect.com — post your essay for free corrections from native speakers', xpBase: 80 },
          { title: 'CEFR Self-Assessment: Benchmark Your Current Level', estimatedMinutes: 30, difficulty: 'easy', startTrigger: 'Search "free CEFR level test [language]" and open the first official-looking result', steps: ['Complete the full online level test (20 min)', 'Write your result and compare to your starting level (5 min)', 'Write 3 specific areas where you\'re still weak (5 min)'], completionCondition: 'CEFR level identified + 3 specific weak areas documented + progress from start noted', focusTip: 'Be honest — knowing your actual level shapes your best next steps.', resources: [{ label: 'Alliance Française — CEFR placement test (free)', url: 'https://www.alliancefr.org', primary: true }], community: 'r/languagelearning — share your progress from start to now', xpBase: 55 },
          { title: 'Watch a Full Movie With No Subtitles', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Find a film in your target language on Netflix or YouTube and start it — no subtitles, no excuses', steps: ['Watch the full movie without pausing (90 min)', 'Write 10 sentences you understood verbatim (10 min)', 'Rate your overall comprehension 1–10 (2 min)'], completionCondition: 'Full movie watched + 10 understood sentences + comprehension score recorded', focusTip: 'Pick an action movie — less dialogue, more visual context. Easier immersion entry.', resources: [{ label: 'Netflix — filter by audio language', url: 'https://netflix.com', primary: true }], community: null, xpBase: 100 },
        ],
      ],
    },

    // ── CODING / PROGRAMMING ──────────────────────────────────────────────────
    coding: {
      milestones: [
        { title: 'Fundamentals',  desc: 'Variables, functions, loops, data structures', weeks: 4 },
        { title: 'Build Projects',desc: 'Apply skills by building real apps',             weeks: 6 },
        { title: 'Deploy & APIs', desc: 'Put code online, work with real APIs & tools',  weeks: 4 },
        { title: 'Job Ready',     desc: 'Portfolio polish, interviews, networking',       weeks: 4 },
      ],
      taskSets: [
        [
          { title: 'Code From Scratch: Variables, Functions, Loops', estimatedMinutes: 45, difficulty: 'easy', startTrigger: 'Open VS Code (or repl.it), create a new file called "day1.js", and type the first line of code before watching any tutorial', steps: ['Write a variable for your name, age, and a boolean — print all three (5 min)', 'Write a function that takes 2 numbers and returns their sum (10 min)', 'Write a function that returns whether a number is even or odd (10 min)', 'Write a loop that prints numbers 1–10 (10 min)', 'Run all code — fix every error until output is clean (10 min)'], completionCondition: 'All 4 exercises run without errors — output visible in terminal', focusTip: 'Type every character. No copy-paste. Muscle memory builds syntax knowledge.', resources: [{ label: 'The Odin Project — free full-stack curriculum', url: 'https://www.theodinproject.com', primary: true }, { label: 'repl.it — code in browser, no install needed', url: 'https://replit.com', primary: false }], community: 'r/learnprogramming — post your first running program for feedback', xpBase: 60 },
          { title: 'Solve 5 LeetCode Easy Problems', estimatedMinutes: 60, difficulty: 'core', startTrigger: 'Go to LeetCode.com, filter by Easy, and open the first problem — read it twice before writing a single line', steps: ['Read + write your approach in plain English before coding (5 min)', 'Solve problems 1 and 2 — write your own solution, no hints (20 min)', 'Solve problems 3, 4, and 5 (25 min)', 'Read the top-voted solution for each — write what was different (10 min)'], completionCondition: '5 LeetCode Easy problems solved + 1 insight written per problem', focusTip: 'Stuck for 15 min? Read only the hint, not the solution. Hints preserve the struggle.', resources: [{ label: 'LeetCode — free problems', url: 'https://leetcode.com', primary: true }, { label: 'NeetCode — organized problems + video explanations', url: 'https://neetcode.io', primary: false }], community: 'r/leetcode — post the problem you found hardest for hints', xpBase: 75 },
          { title: 'Study Data Structures: Arrays and Objects Hands-On', estimatedMinutes: 50, difficulty: 'core', startTrigger: 'Open your notes app and write "Arrays + Objects — [date]" as the title. Write the first definition from memory before opening anything.', steps: ['Watch a 20-min YouTube tutorial on arrays in your language (20 min)', 'Write 5 array operations from scratch in your editor (15 min)', 'Write 3 object/dictionary examples from scratch (15 min)'], completionCondition: '5 array + 3 object code examples written and running — notes complete', focusTip: 'Write code while you watch — do not watch passively. Pause and type every example.', resources: [{ label: 'CS50 — Harvard\'s free intro to CS', url: 'https://cs50.harvard.edu/x/', primary: true }, { label: 'JavaScript.info — free modern JS guide', url: 'https://javascript.info', primary: false }], community: null, xpBase: 70 },
          { title: 'Build a CLI Tool in 90 Minutes — No Tutorial', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Create a folder called "cli-project", open a blank file, and write a comment at the top: "# Tool: [what it does]"', steps: ['Write 1 sentence describing exactly what it does (3 min)', 'Build core logic — no UI yet (50 min)', 'Add user input so someone can interact with it via command line (25 min)', 'Test 5 inputs, fix all crashes (12 min)'], completionCondition: 'Working CLI tool that accepts input and produces correct output on 5 test cases', focusTip: '90-min timer · no tutorials · look up syntax only, never logic', resources: [{ label: 'Node.js readline docs', url: 'https://nodejs.org/api/readline.html', primary: true }], community: 'r/learnprogramming — share your CLI for code review', xpBase: 100 },
        ],
        [
          { title: 'Build a To-Do App: Full CRUD With LocalStorage', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Create a new folder "todo-app", open index.html, and write the HTML skeleton before doing anything else', steps: ['Build HTML structure: input, button, list (10 min)', 'JS: add tasks to the list (20 min)', 'JS: delete tasks (15 min)', 'JS: mark tasks done (15 min)', 'JS: save to localStorage so tasks persist on refresh (20 min)', 'Test all features + fix every bug (10 min)'], completionCondition: 'To-do app that adds, deletes, completes, and persists tasks — all 4 features working', focusTip: 'Do it without a tutorial. You know enough. The struggle is where learning happens.', resources: [{ label: 'MDN — localStorage docs (free)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage', primary: true }], community: 'r/webdev — post your to-do app for feedback', xpBase: 100 },
          { title: 'API Integration: Fetch Real Data and Display It', estimatedMinutes: 60, difficulty: 'core', startTrigger: 'Go to any public API list, pick a weather or trivia API, and read its Getting Started section', steps: ['Pick a free public API and read its docs (10 min)', 'Make a fetch() call in the browser console — get real data (15 min)', 'Build a page that displays the data clearly (25 min)', 'Handle the error case — what shows if the API fails? (10 min)'], completionCondition: 'Page fetches real API data + error state handled + demo-able', focusTip: 'Simplest API possible — weather, jokes, cat facts. Complexity is not the goal here.', resources: [{ label: 'Public APIs list on GitHub', url: 'https://github.com/public-apis/public-apis', primary: true }], community: null, xpBase: 80 },
          { title: 'Push Your Project to GitHub', estimatedMinutes: 30, difficulty: 'easy', startTrigger: 'Open a terminal in your project folder and type "git init" right now', steps: ['Initialize git + create .gitignore (5 min)', 'Make your first commit with a descriptive message (5 min)', 'Create a GitHub repo and push to it (15 min)', 'Verify your code is visible on GitHub in the browser (5 min)'], completionCondition: 'Code visible on public GitHub repo with at least 1 meaningful commit message', focusTip: 'Every project you build should go on GitHub. This is your professional portfolio — start it now.', resources: [{ label: 'GitHub — free public repos', url: 'https://github.com', primary: true }, { label: 'freeCodeCamp Git crash course (YouTube)', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk', primary: false }], community: null, xpBase: 55 },
          { title: 'Code Review: Get Feedback on Your Best Project', estimatedMinutes: 30, difficulty: 'core', startTrigger: 'Open your best project on GitHub, copy the URL, and post it with "Looking for code review" right now', steps: ['Post to r/learnprogramming or a coding Discord (5 min)', 'While waiting: review your own code — find 3 things to improve (15 min)', 'When feedback arrives: implement at least 1 suggestion (10 min)'], completionCondition: 'Code review requested + 3 self-identified improvements + 1 implemented', focusTip: 'Feedback will feel harsh. That\'s valuable. Senior devs learn faster because they ask for review more.', resources: [{ label: 'CodeReview StackExchange', url: 'https://codereview.stackexchange.com', primary: true }], community: 'r/learnprogramming weekly code review thread', xpBase: 70 },
        ],
        [
          { title: 'Deploy Your App Live (Vercel or GitHub Pages)', estimatedMinutes: 30, difficulty: 'easy', startTrigger: 'Open vercel.com, sign in with GitHub, and click "New Project" — your code is already there', steps: ['Connect GitHub account to Vercel (3 min)', 'Import your project repo (2 min)', 'Click Deploy — wait for the build (3 min)', 'Open the live URL — test all features on the deployed version (12 min)', 'Share the URL with 1 person and ask "Does this work for you?" (10 min)'], completionCondition: 'Live public URL — all features working in production — shared with 1 real person', focusTip: 'A live URL is 100× more impressive than a local demo. Deploy early, deploy often.', resources: [{ label: 'Vercel — free hosting', url: 'https://vercel.com', primary: true }, { label: 'GitHub Pages — free static hosting', url: 'https://pages.github.com', primary: false }], community: null, xpBase: 70 },
          { title: 'Build a REST API With 3 Endpoints', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Create a new folder "my-api", run "npm init -y" in terminal, install express — start in the next 3 minutes', steps: ['Set up Express server with a root GET route (10 min)', 'Add GET /items — return a list (20 min)', 'Add POST /items — accept and store a new item (25 min)', 'Add DELETE /items/:id — remove an item (25 min)', 'Test all 3 endpoints with Postman or Thunder Client (10 min)'], completionCondition: 'GET, POST, DELETE all tested and returning correct status codes', focusTip: 'Use an in-memory array first — no database yet. Get the logic right before adding persistence.', resources: [{ label: 'Express.js docs', url: 'https://expressjs.com', primary: true }, { label: 'Thunder Client — VS Code REST client (free)', url: 'https://www.thunderclient.com', primary: false }], community: null, xpBase: 100 },
          { title: 'Refactor: Apply Clean Code Principles to One Project', estimatedMinutes: 50, difficulty: 'core', startTrigger: 'Open one of your older projects and read the first 100 lines — find the worst function name', steps: ['Rename all unclear variables and functions to be self-explanatory (15 min)', 'Break any function over 15 lines into 2 smaller functions (20 min)', 'Delete all commented-out dead code (5 min)', 'Commit with message "refactor: improve readability" (10 min)'], completionCondition: 'Refactored code committed — at least 3 concrete improvements in the commit description', focusTip: 'Code is read 10× more than it\'s written. Readable code is a professional skill — not a nice-to-have.', resources: [{ label: 'Clean Code JS — free GitHub summary', url: 'https://github.com/ryanmcdermott/clean-code-javascript', primary: true }], community: null, xpBase: 70 },
          { title: 'Write a README for Your Best Project', estimatedMinutes: 30, difficulty: 'easy', startTrigger: 'Open your best project on GitHub, click "Add a README", and write your name and project title on line 1', steps: ['Write: what the project does in 2 sentences (5 min)', 'Add: how to install and run it (10 min)', 'Add: screenshots or a GIF of it working (10 min)', 'Add: tech stack + your GitHub profile link (5 min)'], completionCondition: 'README live on GitHub — description, setup instructions, screenshot, tech stack', focusTip: 'Recruiters read the README before the code. Make it clear and visual.', resources: [{ label: 'Readme.so — visual README builder (free)', url: 'https://readme.so', primary: true }], community: null, xpBase: 55 },
        ],
        [
          { title: 'Build Your Portfolio Page and Deploy It', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Create a new folder "portfolio", open index.html, and write your name in an H1 tag — start the timer', steps: ['Hero section: name, title, 1-line bio (20 min)', '3 project cards with title, description, live URL, GitHub link (30 min)', 'Contact info + GitHub profile link (10 min)', 'Mobile responsiveness check (15 min)', 'Deploy to GitHub Pages or Vercel (15 min)'], completionCondition: 'Live portfolio URL — 3 projects visible — works on mobile', focusTip: 'Ugly is fine. Live is everything. Ship now and improve later.', resources: [{ label: 'GitHub Pages — free hosting', url: 'https://pages.github.com', primary: true }], community: 'r/webdev — post your portfolio URL for feedback', xpBase: 110 },
          { title: 'Mock Technical Interview: 2 Problems Out Loud', estimatedMinutes: 60, difficulty: 'stretch', startTrigger: 'Open a blank code editor, set a 60-min timer, and pick 2 LeetCode Medium problems', steps: ['Problem 1: read it out loud, explain your approach out loud before coding, solve it (25 min)', 'Problem 2: same process (25 min)', 'Write 3 specific improvements before your next session (10 min)'], completionCondition: 'Both problems attempted with verbal explanation + 3 improvements written', focusTip: 'Silence in a real technical interview is expensive. Practice speaking every thought.', resources: [{ label: 'Pramp — free peer mock interviews', url: 'https://www.pramp.com', primary: true }], community: 'Pramp.com — schedule a free mock interview this week', xpBase: 110 },
          { title: 'Cold Outreach: Message 3 Developers on LinkedIn', estimatedMinutes: 25, difficulty: 'core', startTrigger: 'Open LinkedIn, search "junior developer [your location]", and open the first profile that interests you', steps: ['Find 3 developers 1–2 years ahead of you (5 min)', 'Read their profiles — find 1 specific thing to reference per message (5 min)', 'Write and send 3 connection requests with personalized notes (15 min)'], completionCondition: '3 messages sent — each with a specific reference to their projects or stack', focusTip: 'Generic messages get 0% response. Reference their specific tech stack or a project you found.', resources: [{ label: 'LinkedIn', url: 'https://linkedin.com', primary: true }], community: null, xpBase: 65 },
          { title: 'Ship Your Final Project: Build Something You\'d Actually Use', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Write the problem your app solves in 1 sentence. Open your editor. Start.', steps: ['Define scope: 1 core feature only — write it down (5 min)', 'Build the entire core feature without stopping (65 min)', 'Deploy and share the live URL publicly (15 min)', 'Add it to your portfolio page (5 min)'], completionCondition: 'Live app URL shared publicly + added to portfolio', focusTip: 'The best portfolio project is the one you built to solve your own problem. Authenticity shows.', resources: [{ label: 'Indie Hackers — share your build story', url: 'https://indiehackers.com', primary: true }], community: 'Indie Hackers "What are you building?" thread', xpBase: 120 },
        ],
      ],
    },

    // ── WRITING (NOVEL / BOOK) ────────────────────────────────────────────────
    writing: {
      milestones: [
        { title: 'Foundation',   desc: 'Premise, characters, outline',              weeks: 3 },
        { title: 'First Draft',  desc: 'Write daily — complete the rough draft',    weeks: 8 },
        { title: 'Revision',     desc: 'Structural edit, line edit, beta readers',  weeks: 6 },
        { title: 'Polish & Ship',desc: 'Final polish, query agents or self-publish', weeks: 5 },
      ],
      taskSets: [
        [
          { title: 'Write Your 1-Page Story Premise', estimatedMinutes: 30, difficulty: 'easy', startTrigger: 'Open a blank doc titled "Story Premise" and answer: "What is this story about?" — one sentence, right now', steps: ['Write the logline: protagonist + goal + obstacle + stakes (10 min)', 'Write the theme: what does this story argue about human nature? (10 min)', 'Write the ending you\'re writing toward — even if it changes later (10 min)'], completionCondition: 'Logline + theme + target ending — all written on one page', focusTip: 'If you can\'t write the premise in 2 sentences, you don\'t know your story yet. Fix that first.', resources: [{ label: 'Story Grid — premise document framework (free)', url: 'https://storygrid.com', primary: true }, { label: 'Brandon Sanderson\'s free writing lectures (YouTube)', url: 'https://www.youtube.com/playlist?list=PLH3mK1NZn9QqOSj3ObrP3xL8tEJQ12-vL', primary: false }], community: 'r/writing — post your logline for feedback', xpBase: 55 },
          { title: 'Build Your Protagonist: 1-Page Character Profile', estimatedMinutes: 45, difficulty: 'core', startTrigger: 'Open a new doc, write your protagonist\'s name at the top, and answer: "What do they want most?"', steps: ['Write external goal (what they want) + internal wound (why they\'re broken) (10 min)', 'Write their fatal flaw — the thing that makes the story necessary (10 min)', 'Write their voice: 5 things they\'d say and 5 they\'d never say (15 min)', 'Write the transformation arc: where they start vs. where they end (10 min)'], completionCondition: 'Goal + wound + flaw + voice + arc — all written in the character profile', focusTip: 'Most first drafts fail because the character is a placeholder. Fix this before you write a word of prose.', resources: [{ label: 'K.M. Weiland — character arc framework (free blog)', url: 'https://www.helpingwritersbecomeauthors.com', primary: true }], community: null, xpBase: 70 },
          { title: 'Scene-by-Scene Outline: Map the Full Story', estimatedMinutes: 60, difficulty: 'stretch', startTrigger: 'Open a spreadsheet or doc, create a "Scene #" and "What Happens" column — fill in scene 1 now', steps: ['List the 3 major turning points: inciting incident, midpoint, climax (15 min)', 'Map Act 1: opening → inciting incident (15 min)', 'Map Act 2: complication → midpoint → dark night of the soul (15 min)', 'Map Act 3: climax → resolution (15 min)'], completionCondition: 'All 3 acts mapped — at least 15 scenes — major turning points identified', focusTip: 'Outlines change. Write it anyway. Discovery writers: at minimum, know your ending.', resources: [{ label: 'Save the Cat Beat Sheet — free download', url: 'https://www.savethecat.com', primary: true }, { label: 'Scrivener — writing software (30-day free trial)', url: 'https://www.literatureandlatte.com/scrivener', primary: false }], community: 'r/writing — "Is my outline working?" post for structural feedback', xpBase: 90 },
          { title: 'Write the First 500 Words of Chapter 1', estimatedMinutes: 40, difficulty: 'core', startTrigger: 'Open your manuscript, place cursor at line 1, and write the first sentence — don\'t read it back yet', steps: ['Write 500 words — do not stop to edit (30 min)', 'Read it once and mark anything confusing with [FIX] (5 min)', 'Write one sentence describing the next scene — so you know where to start tomorrow (5 min)'], completionCondition: '500 words written + [FIX] markers added + next scene noted', focusTip: 'Your first draft is supposed to be bad. Write it anyway. Edit in revision.', resources: [{ label: 'Google Docs — free, cloud-saved writing (recommended)', url: 'https://docs.google.com', primary: true }, { label: 'Hemingway Editor — clarity checker (free web version)', url: 'https://hemingwayapp.com', primary: false }], community: null, xpBase: 75 },
        ],
        [
          { title: 'Daily Writing Session: 500–750 Words, No Editing', estimatedMinutes: 50, difficulty: 'core', startTrigger: 'Open your manuscript, scroll to your last sentence, and type the very next word immediately', steps: ['Write for 45 minutes without stopping — use [PLACEHOLDER] when stuck (45 min)', 'Count and log your word count delta (2 min)', 'Write 1 sentence summarizing the next scene — for tomorrow (3 min)'], completionCondition: '500+ new words added + next scene sentence written for tomorrow', focusTip: 'Close your internet. Your word count target ends the session, not the timer.', resources: [{ label: '750words.com — distraction-free daily writing tracker (free)', url: 'https://750words.com', primary: true }], community: 'NaNoWriMo forums — daily word count tracking + accountability', xpBase: 65 },
          { title: 'Write the Scene You\'ve Been Avoiding', estimatedMinutes: 50, difficulty: 'stretch', startTrigger: 'Open your outline, find the scene you\'ve been skipping, and write its opening line right now', steps: ['Find the avoided scene in your outline (3 min)', 'Write it in full — no matter how rough (40 min)', 'Don\'t delete it — mark it [REVISIT] instead (2 min)', 'Write why that scene was difficult (5 min)'], completionCondition: 'Avoided scene written in full and saved — not deleted', focusTip: 'The scene you\'re avoiding is usually the most important one in the book.', resources: [{ label: 'Big Magic — Elizabeth Gilbert (book on creative courage)', url: 'https://www.amazon.com/s?k=big+magic+elizabeth+gilbert', primary: true }], community: null, xpBase: 90 },
          { title: 'Read Chapter Aloud — Fix What Sounds Wrong', estimatedMinutes: 40, difficulty: 'easy', startTrigger: 'Open your most recently written chapter and read the first sentence aloud right now', steps: ['Read the full chapter aloud — highlight anything awkward (25 min)', 'Fix the top 5 awkward lines (10 min)', 'Write 3 observations about your voice or style (5 min)'], completionCondition: 'Full chapter read aloud + 5 fixes made + 3 style observations written', focusTip: 'Your ear catches what your eye misses. Every professional writer reads drafts aloud.', resources: [{ label: 'Natural Reader — free text-to-speech for self-editing', url: 'https://www.naturalreaders.com', primary: true }], community: null, xpBase: 55 },
          { title: 'Midpoint Check: Is the Story Still on Track?', estimatedMinutes: 30, difficulty: 'easy', startTrigger: 'Open your outline and manuscript side by side — compare your actual progress to the plan', steps: ['Count current word count vs. target (5 min)', 'Check: are you at the midpoint of your story at ~50% of your word count target? (10 min)', 'List 3 scenes to cut or condense (10 min)', 'Adjust outline for the second half based on what\'s working (5 min)'], completionCondition: 'Word count tracked + pace checked + outline adjusted for second half', focusTip: 'Most first drafts run long in Act 2. Check now — not at 100,000 words.', resources: [], community: 'r/writing — share your midpoint and ask for pacing advice', xpBase: 50 },
        ],
        [
          { title: 'Structural Edit: Find the 3 Biggest Plot Holes', estimatedMinutes: 60, difficulty: 'stretch', startTrigger: 'Read your outline from start to finish — open a notes doc and write problems as you go', steps: ['Read the full outline and list every logic gap or unmotivated character action (20 min)', 'Rank top 3 structural problems by severity (5 min)', 'Write the fix for each one (25 min)', 'Update the outline to reflect the fixes (10 min)'], completionCondition: '3 structural fixes written + outline updated — no untreated plot holes', focusTip: 'Structural problems compound. Fix them in the outline before rewriting prose — or you\'ll rewrite it twice.', resources: [{ label: 'Story Grid — structural editing framework (free)', url: 'https://storygrid.com', primary: true }], community: null, xpBase: 95 },
          { title: 'Line Edit: Polish 10 Pages Until They Sing', estimatedMinutes: 60, difficulty: 'core', startTrigger: 'Open your manuscript to page 1 and cut the first adverb you see — that\'s how you start', steps: ['Cut all adverbs — replace with stronger verbs (15 min)', 'Rewrite all passive voice constructions as active (15 min)', 'Vary sentence length — no 3 sentences the same length in a row (15 min)', 'Read the 10 pages aloud one final time (15 min)'], completionCondition: '10 pages line-edited: no adverbs, no passive voice, varied rhythm', focusTip: 'Line editing is 80% cutting. The average first draft is 20% too long.', resources: [{ label: 'Hemingway Editor — passive voice + adverb detector (free)', url: 'https://hemingwayapp.com', primary: true }], community: null, xpBase: 80 },
          { title: 'Find 2 Beta Readers and Send Them Your Manuscript', estimatedMinutes: 35, difficulty: 'core', startTrigger: 'Write the names of 2 people who read your genre and would give honest feedback — not just supportive friends', steps: ['Pick 2 beta readers who are your actual target audience (5 min)', 'Write a 1-page brief: genre, what you\'re worried about, 3 specific questions (15 min)', 'Send the manuscript + brief via Google Docs (10 min)', 'Agree on a 3-week deadline for feedback (5 min)'], completionCondition: 'Manuscript sent to 2 beta readers + deadline agreed', focusTip: 'Give beta readers specific questions. "What did you think?" gets useless answers.', resources: [{ label: 'r/BetaReaders — find beta readers for free', url: 'https://reddit.com/r/BetaReaders', primary: true }], community: 'r/BetaReaders — post your genre and word count for volunteers', xpBase: 75 },
          { title: 'Process Beta Feedback: Build Your Revision Priority List', estimatedMinutes: 45, difficulty: 'core', startTrigger: 'Open your beta reader feedback — read the hardest comment first before the positive ones', steps: ['Read all feedback without defending yourself — highlight recurring themes (15 min)', 'Sort comments: agree / disagree / need to think (10 min)', 'For every "agree": write the specific fix (15 min)', 'Create a ranked top-5 revision list (5 min)'], completionCondition: 'All feedback categorized + 5 priority fixes written', focusTip: 'If 2 readers flag the same problem — it\'s the manuscript, not the reader.', resources: [{ label: 'Jane Friedman — how to use beta feedback (free blog)', url: 'https://www.janefriedman.com', primary: true }], community: null, xpBase: 70 },
        ],
        [
          { title: 'Final Proofread: Read Every Page Once More', estimatedMinutes: 90, difficulty: 'core', startTrigger: 'Change the manuscript font to something unfamiliar — it forces fresh eyes. Start page 1 now.', steps: ['Read from page 1 to end — mark every typo and awkward phrase (75 min)', 'Fix all marked items (15 min)'], completionCondition: 'Full manuscript read once + all marked items fixed — zero untreated marks', focusTip: 'Changing the font makes errors visible that you\'ve become blind to after dozens of readings.', resources: [{ label: 'Grammarly — free tier catches most typos', url: 'https://grammarly.com', primary: true }], community: null, xpBase: 90 },
          { title: 'Write Your Back-Cover Description and Author Bio', estimatedMinutes: 35, difficulty: 'easy', startTrigger: 'Open a blank doc and write the title of your book at the top — then write the first sentence of the blurb', steps: ['Write the hook: 1 sentence capturing the core premise (10 min)', 'Write a 2-paragraph plot summary: who, what\'s at stake, what\'s the choice (20 min)', 'Write your author bio in 3 sentences — third person, specific (5 min)'], completionCondition: 'Book description + author bio written — both under 200 words each', focusTip: 'Read the back cover of 10 books in your genre before writing yours. Study what works.', resources: [{ label: 'Goodreads — read back-cover copy in your genre', url: 'https://goodreads.com', primary: true }], community: null, xpBase: 60 },
          { title: 'Ship It: Upload to KDP or Send Your First Query', estimatedMinutes: 60, difficulty: 'stretch', startTrigger: 'Open Amazon KDP or QueryTracker. The next action is to submit. Don\'t read it again. Submit.', steps: ['Final file format check (5 min)', 'Upload to KDP or send query to your first 3 agents (30 min)', 'Screenshot the confirmation (2 min)', 'Write one honest paragraph about how this moment feels (23 min)'], completionCondition: 'Book uploaded or query sent — confirmation screenshot saved', focusTip: 'Done is the engine of more. Ship it.', resources: [{ label: 'Amazon KDP — free self-publishing', url: 'https://kdp.amazon.com', primary: true }, { label: 'QueryTracker — find literary agents (free)', url: 'https://querytracker.net', primary: false }], community: 'r/writing — celebrate your ship with the community', xpBase: 130 },
          { title: 'Reflect: What Would You Do Differently on Book 2?', estimatedMinutes: 20, difficulty: 'easy', startTrigger: 'Open a blank doc and write "Book 1 Retrospective" at the top — write the first honest thing that comes to mind', steps: ['Write 3 things you\'d do differently in the planning phase (7 min)', 'Write 3 things you\'d do differently in the drafting phase (7 min)', 'Write 1 thing you did right that you\'d repeat (6 min)'], completionCondition: '3 planning lessons + 3 drafting lessons + 1 thing done right — all written', focusTip: 'Your second book will be better because you wrote the first one. Document the lessons now.', resources: [], community: null, xpBase: 50 },
        ],
      ],
    },

    // ── CAREER / PROMOTION ────────────────────────────────────────────────────
    career: {
      milestones: [
        { title: 'Self-Audit',      desc: 'Gap analysis, brag doc, sponsor mapping',     weeks: 3 },
        { title: 'Skill Building',  desc: 'Fill skill gaps, take on stretch projects',    weeks: 5 },
        { title: 'Visibility',      desc: 'Present results, build internal relationships',weeks: 5 },
        { title: 'Promotion Push',  desc: 'Formal ask, documentation, negotiation',       weeks: 5 },
      ],
      taskSets: [
        [
          { title: 'Map the Gap: You vs. Next Level', estimatedMinutes: 40, difficulty: 'core', startTrigger: 'Open your company\'s career ladder doc (or LinkedIn job posts for your target role) and read the next-level requirements first', steps: ['List every skill and responsibility required for the next level (10 min)', 'Rate yourself on each: 1 (no evidence) to 5 (strong evidence) (15 min)', 'Highlight your 3 biggest gaps (5 min)', 'Write 1 specific closing action for each gap (10 min)'], completionCondition: 'Every next-level criterion rated + 3 gaps identified + 1 action per gap written', focusTip: 'Be ruthlessly honest. Rating yourself 5 on everything explains why you haven\'t been promoted.', resources: [{ label: 'Levels.fyi — leveling and compensation data by company', url: 'https://www.levels.fyi', primary: true }], community: null, xpBase: 70 },
          { title: 'Schedule a Career Conversation With Your Manager', estimatedMinutes: 25, difficulty: 'easy', startTrigger: 'Open your calendar, find a 30-min slot in the next 5 days, and send your manager an invite titled "Career Discussion" right now', steps: ['Send the invite with a 1-line agenda (5 min)', 'Prepare 3 specific questions: Am I on track? What\'s my biggest gap? What would make you advocate for me? (15 min)', 'After the meeting: write exactly what they said — not your interpretation (5 min)'], completionCondition: 'Meeting scheduled + 3 questions prepared', focusTip: 'Say it directly: "I\'m targeting [title] and want to know what it takes." Don\'t hint.', resources: [{ label: 'Lenny\'s Newsletter — career conversation framework (free)', url: 'https://www.lennysnewsletter.com', primary: true }], community: null, xpBase: 60 },
          { title: 'Build Your Brag Doc: Last 3 Months of Impact', estimatedMinutes: 45, difficulty: 'core', startTrigger: 'Open a new Google Doc titled "Brag Doc [Your Name]" and write your most recent impactful project at the top', steps: ['List every project you contributed to in the last 3 months (10 min)', 'For each: write the result in numbers — %, $, time saved, users affected (20 min)', 'Identify 3 strongest bullets — the ones you\'d use in a performance review (10 min)', 'Check: could your manager recite this impact in a promotion discussion? (5 min)'], completionCondition: 'Brag doc with quantified impact for every project in the last 3 months', focusTip: 'Estimate numbers if you don\'t have them. "~30% faster" beats "improved performance".', resources: [{ label: 'Julia Evans — brag document template (free blog)', url: 'https://jvns.ca/blog/brag-documents/', primary: true }], community: null, xpBase: 75 },
          { title: 'Find Your Sponsor: Map 1 Senior Advocate', estimatedMinutes: 30, difficulty: 'stretch', startTrigger: 'Write the name of the most senior person who has seen your best work and respects it — that\'s your target', steps: ['Identify 1 senior person with promotion influence (5 min)', 'Write what they know about your work specifically (10 min)', 'Write what they still don\'t know — and how you\'ll make them aware (10 min)', 'Send them a project update or ask for input on something this week (5 min)'], completionCondition: 'Sponsor identified + awareness gap documented + 1 touchpoint initiated', focusTip: 'Sponsors advocate for you in rooms you\'re not in. Mentors give advice. You need both — prioritize the sponsor.', resources: [], community: null, xpBase: 80 },
        ],
        [
          { title: 'Volunteer for the High-Visibility Project', estimatedMinutes: 20, difficulty: 'easy', startTrigger: 'Open Slack or email and write a message today: "I\'d like to help with [project] — where can I contribute?"', steps: ['Identify 1 project that senior people watch closely (5 min)', 'Write 2 specific ways you could contribute (10 min)', 'Send the message today — don\'t overthink it (5 min)'], completionCondition: 'Message sent to the right stakeholder — today', focusTip: 'High-visibility projects compound your reputation. Saying yes to the right one once is strategic.', resources: [], community: null, xpBase: 60 },
          { title: 'Deep Dive: 45 Minutes on Your Biggest Skill Gap', estimatedMinutes: 60, difficulty: 'stretch', startTrigger: 'Open your gap analysis from week 1 — find your biggest gap and open a learning resource for it right now', steps: ['Find the highest-priority skill gap from your self-audit (5 min)', 'Find the best free resource and start immediately — no more research (5 min)', 'Deep work session on that skill (45 min)', 'Write 3 things you can now do that you couldn\'t before (5 min)'], completionCondition: '45-min focused learning session + 3 new capabilities written', focusTip: 'Study the gap your manager mentioned, not the one you enjoy most.', resources: [{ label: 'Coursera — free audit for most courses', url: 'https://coursera.org', primary: true }], community: null, xpBase: 80 },
          { title: 'Build a Cross-Functional Relationship: 1 Coffee Chat', estimatedMinutes: 30, difficulty: 'core', startTrigger: 'Write the name of someone in a different team whose work intersects yours — message them today', steps: ['Identify 1 person in a different team you should know better (5 min)', 'Message with specific reason: "I\'m working on X — would love 20 min to learn about Y from you" (10 min)', 'Prepare 3 questions to ask (10 min)', 'After the chat: write 1 follow-up action (5 min)'], completionCondition: 'Message sent + meeting scheduled or completed + follow-up action written', focusTip: 'Cross-functional relationships expand your promotion surface area beyond your direct manager.', resources: [], community: null, xpBase: 65 },
          { title: 'Deliver the Stretch Project You\'ve Been Avoiding', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Open the stretch project you\'ve been putting off — write 3 next actions at the top of the doc before anything else', steps: ['Write the 3 most important next actions (5 min)', 'Do the hardest one first — no perfect conditions (70 min)', 'Send a stakeholder update on where it stands (15 min)'], completionCondition: 'Meaningful progress + stakeholder update sent', focusTip: 'The stretch project you\'re avoiding is the one that will get you promoted.', resources: [], community: null, xpBase: 100 },
        ],
        [
          { title: 'Present Your Work: Give a Demo or Lunch & Learn', estimatedMinutes: 60, difficulty: 'stretch', startTrigger: 'Message your team right now: "I\'d like to do a 10-min demo of [what you built] this week — Thursday?"', steps: ['Book a 20-min slot with 5+ colleagues (10 min)', 'Build 5 slides: context, what you built, how it works, impact, next steps (30 min)', 'Practice your delivery twice (20 min)'], completionCondition: 'Demo scheduled + 5 slides built + practiced twice', focusTip: 'Presenting your work forces clarity — and puts your impact in front of decision-makers.', resources: [{ label: 'Google Slides — free', url: 'https://slides.google.com', primary: true }], community: null, xpBase: 90 },
          { title: 'Update Your Brag Doc With This Quarter\'s Impact', estimatedMinutes: 30, difficulty: 'easy', startTrigger: 'Open your Brag Doc — read the last entry and pick up where it stopped', steps: ['Add every project completed in the last 4 weeks (10 min)', 'Quantify each with a number — estimate if needed (15 min)', 'Identify 1 bullet strong enough for a performance review (5 min)'], completionCondition: 'Brag Doc updated + at least 1 review-ready bullet identified', focusTip: 'Update this monthly. Annual reviews are won monthly, not in December.', resources: [], community: null, xpBase: 55 },
          { title: 'Peer Feedback: Ask 3 Colleagues for Honest Input', estimatedMinutes: 20, difficulty: 'easy', startTrigger: 'Message 3 colleagues right now: "I\'m working on my growth — 2 minutes of honest feedback would help a lot"', steps: ['Choose 3 people who work closely with you — not just friends (3 min)', 'Send a short message with 2 specific questions (10 min)', 'When replies arrive: write every recurring theme (7 min)'], completionCondition: '3 feedback messages sent + recurring themes documented when replies arrive', focusTip: 'Ask "What\'s 1 thing I could do more of? 1 thing less?" — gets honest answers every time.', resources: [], community: null, xpBase: 55 },
          { title: 'Build 5 New Internal Relationships This Month', estimatedMinutes: 35, difficulty: 'core', startTrigger: 'Open your company org chart and find 1 person you should know but don\'t', steps: ['List 5 people in adjacent teams to build relationships with (5 min)', 'For each: write 1 reason they\'d benefit from knowing you (10 min)', 'Reach out to all 5 with specific, brief messages today (20 min)'], completionCondition: '5 messages sent — all with specific reasons, not generic networking', focusTip: 'Internal relationships are your promotion infrastructure. Build them before you need them.', resources: [], community: null, xpBase: 65 },
        ],
        [
          { title: 'Write Your 1-Page Promotion Case Document', estimatedMinutes: 50, difficulty: 'stretch', startTrigger: 'Open your Brag Doc and a blank doc side by side — write "Why I deserve the promotion" at the top', steps: ['Write your 3 strongest impact bullets with numbers (10 min)', 'Write which next-level skills you\'ve already demonstrated (10 min)', 'Write what you\'ll do differently at the next level (10 min)', 'Write why now is the right time from the business perspective (10 min)', 'Read it aloud — would your manager use these exact words to promote you? (10 min)'], completionCondition: '1-page promotion case: impact, capability evidence, future intent, timing argument', focusTip: 'Your manager needs to sell your promotion to their manager. Write it so they can use your words.', resources: [{ label: 'Lenny\'s Newsletter — how to ask for a promotion (free)', url: 'https://www.lennysnewsletter.com', primary: true }], community: null, xpBase: 95 },
          { title: 'Have the Promotion Conversation With Your Manager', estimatedMinutes: 30, difficulty: 'stretch', startTrigger: 'Send the calendar invite: "Career Discussion — 30 min" right now for this week', steps: ['Schedule the meeting today (2 min)', 'Prepare: 3 impact bullets, your ask, and the question "What would I need to demonstrate?" (20 min)', 'State your ask clearly: "I\'m targeting [title] — I\'d like to be considered in the next cycle" (meeting)', 'Write exactly what they said + any conditions mentioned afterward (8 min)'], completionCondition: 'Meeting held + ask made explicitly + manager response documented', focusTip: 'Say the ask clearly. "I\'d like to be considered for promotion to [title]." Most people never say it out loud.', resources: [{ label: 'Harvard Business Review — how to ask for a promotion (free)', url: 'https://hbr.org', primary: true }], community: null, xpBase: 110 },
          { title: 'Research Your Market Value and Apply Externally', estimatedMinutes: 35, difficulty: 'core', startTrigger: 'Go to Levels.fyi and search your title and company — read the comp data before anything else', steps: ['Check Levels.fyi and Glassdoor for your target title + location (10 min)', 'Apply to 2 external roles at the next level (15 min)', 'Write your target comp range based on market data (10 min)'], completionCondition: 'Market comp documented + 2 external applications submitted', focusTip: 'You don\'t have to take an offer to use one. Market data is negotiation leverage.', resources: [{ label: 'Levels.fyi — comp data (free)', url: 'https://levels.fyi', primary: true }, { label: 'Glassdoor — salary data (free)', url: 'https://glassdoor.com', primary: false }], community: null, xpBase: 80 },
          { title: 'Negotiate Your Package: Prepare and Deliver the Ask', estimatedMinutes: 30, difficulty: 'stretch', startTrigger: 'Write the number you want at the top of a blank page. That\'s your anchor. Now build the case for it.', steps: ['Write market rate, current comp, and target comp with sources (10 min)', 'Write 3 strongest recent impact bullets as justification (10 min)', 'Practice the script: "Based on X, I\'m targeting Y — is that achievable?" out loud (10 min)'], completionCondition: 'Negotiation case prepared — number, justification, verbal script ready', focusTip: 'Name the number you want, not the minimum you\'d accept. The first number anchors everything.', resources: [{ label: 'Fearless Salary Negotiation — Josh Doody (book)', url: 'https://fearlesssalarynegotiation.com', primary: true }], community: null, xpBase: 100 },
        ],
      ],
    },

    // ── EXAM PREPARATION ──────────────────────────────────────────────────────
    exam: {
      milestones: [
        { title: 'Diagnostic',      desc: 'Baseline score, weak area map, study plan',     weeks: 2 },
        { title: 'Concept Mastery', desc: 'Master core content section by section',          weeks: 6 },
        { title: 'Practice Tests',  desc: 'Full-length tests, timing, error analysis',       weeks: 5 },
        { title: 'Final Push',      desc: 'Targeted drilling, mental prep, peak performance', weeks: 3 },
      ],
      taskSets: [
        [
          { title: 'Take a Full Diagnostic Test Under Real Conditions', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Open a free official practice test for your exam — set a strict timer before you read a single question', steps: ['Set timer to real test duration — no pausing, no extra time', 'Complete the full test without checking answers mid-test', 'Score every section immediately after (10 min)', 'Write 3 observations about where you struggled most (5 min)'], completionCondition: 'Full diagnostic completed + section scores recorded + 3 struggle areas identified', focusTip: 'The diagnostic only works with real conditions. Cheating it cheats your entire study plan.', resources: [{ label: 'Khan Academy — free LSAT, SAT, GMAT prep', url: 'https://www.khanacademy.org', primary: true }, { label: 'GMAC Official Guide — free first practice test', url: 'https://www.mba.com', primary: false }], community: 'r/GMAT, r/LSAT, or r/GRE — post your diagnostic for study priority advice', xpBase: 90 },
          { title: 'Build Your Full Study Schedule: Topics Mapped to Weeks', estimatedMinutes: 30, difficulty: 'easy', startTrigger: 'Open a spreadsheet or calendar — write your exam date at the top and count backwards to today', steps: ['Count total weeks until exam (2 min)', 'List every section and topic tested on your exam (8 min)', 'Assign each topic to a week based on weight and your weakness (15 min)', 'Block daily study time on your calendar for the next 2 weeks (5 min)'], completionCondition: 'Full schedule built: every topic assigned to a week + daily time blocked on calendar', focusTip: 'Allocate the most time to sections where improvement = most additional points, not your favorites.', resources: [{ label: 'Google Calendar — free time blocking', url: 'https://calendar.google.com', primary: true }], community: null, xpBase: 55 },
          { title: 'Error Analysis: Categorize Every Diagnostic Mistake', estimatedMinutes: 40, difficulty: 'core', startTrigger: 'Open your scored diagnostic — look at your lowest section first', steps: ['List every wrong answer from the diagnostic (10 min)', 'Categorize each: careless error / concept gap / ran out of time (15 min)', 'Write the 3 concept gaps driving the most errors (10 min)', 'Find 1 resource for each concept gap (5 min)'], completionCondition: 'All diagnostic errors categorized + 3 concept gaps with resources identified', focusTip: 'Most score improvement comes from fixing 2–3 core concept gaps, not grinding more questions.', resources: [{ label: 'Manhattan Prep — free concept guides for GMAT/GRE', url: 'https://www.manhattanprep.com', primary: true }], community: null, xpBase: 70 },
          { title: 'Find a Study Partner or Accountability Group', estimatedMinutes: 20, difficulty: 'easy', startTrigger: 'Post in the relevant subreddit right now: "[Exam] study partner — taking it in [month] — looking for accountability"', steps: ['Post in r/GMAT, r/LSAT, r/GRE, or r/SAT (5 min)', 'Or message 1 person in your network taking the same exam (5 min)', 'Set a weekly check-in format: who completed what + accuracy score (10 min)'], completionCondition: 'Post made or message sent + 1 weekly check-in format agreed', focusTip: 'One accountability partner dramatically changes test prep completion rates.', resources: [{ label: 'r/GMAT — active study partner community', url: 'https://reddit.com/r/GMAT', primary: true }], community: null, xpBase: 45 },
        ],
        [
          { title: 'Deep Concept Study: Master 1 Topic in 60 Minutes', estimatedMinutes: 60, difficulty: 'core', startTrigger: 'Open your weakest topic resource — read the first page or watch the first 5 minutes before anything else', steps: ['Read or watch the full concept lesson (30 min)', 'Close the resource and write everything you understood from memory (15 min)', 'Do 10 practice questions on only that topic — no other topics (15 min)'], completionCondition: 'Concept learned + notes written from memory + 10 practice questions done + accuracy noted', focusTip: 'One topic at a time. Mixing before you\'ve mastered one slows both down.', resources: [{ label: 'Khan Academy — free concept-by-concept lessons', url: 'https://www.khanacademy.org', primary: true }, { label: 'Magoosh — video lessons for GMAT, GRE, LSAT', url: 'https://magoosh.com', primary: false }], community: null, xpBase: 70 },
          { title: 'Timed Drill: 20 Questions at Strict Per-Question Pace', estimatedMinutes: 35, difficulty: 'core', startTrigger: 'Calculate your per-question time budget for your exam — set that timer and start question 1', steps: ['Calculate exact time per question for your exam (2 min)', 'Answer 20 questions at strict per-question limits (25 min)', 'Score and categorize errors: concept vs. timing vs. careless (8 min)'], completionCondition: '20 timed questions completed + error categories logged', focusTip: 'Timing kills more test-takers than content. Practice the clock as hard as the content.', resources: [{ label: 'Official practice questions — always use official materials first', url: 'https://www.mba.com', primary: true }], community: null, xpBase: 65 },
          { title: 'Flashcard Sprint: 50 Cards for Your Hardest Topic', estimatedMinutes: 40, difficulty: 'easy', startTrigger: 'Open Anki, create a deck called "[Exam]: [Topic]", and create your first card now', steps: ['Create 50 cards — focus on formulas, rules, and definitions you\'ve missed (30 min)', 'Review all 50 cards once immediately (10 min)'], completionCondition: '50 Anki cards created and reviewed once', focusTip: 'Make cards for things you got wrong — not things you already know.', resources: [{ label: 'Anki — free spaced repetition', url: 'https://apps.ankiweb.net', primary: true }], community: null, xpBase: 55 },
          { title: 'Weekly Review: Track Accuracy and Adjust Focus', estimatedMinutes: 25, difficulty: 'easy', startTrigger: 'Open your error log and study schedule — review the last 7 days before writing anything', steps: ['Count questions answered this week + accuracy by section (5 min)', 'Identify which topic improved most + which is still stuck (10 min)', 'Adjust next week\'s study focus based on the data — not your gut (10 min)'], completionCondition: 'Weekly accuracy tracked + next week\'s focus adjusted based on data', focusTip: 'Gut feelings about test prep are almost always wrong. Use the data.', resources: [{ label: 'Google Sheets — free error log', url: 'https://sheets.google.com', primary: true }], community: null, xpBase: 50 },
        ],
        [
          { title: 'Full Practice Test #2: Real Conditions, Strict Timer', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Sit down at a desk, no phone nearby, full test in front of you — set the timer now', steps: ['Complete the full test under strict timed conditions', 'Score every section immediately after', 'Compare section scores to Diagnostic — write what improved and what didn\'t (10 min)'], completionCondition: 'Full practice test completed + scored + trend comparison written vs. Diagnostic', focusTip: 'Take at least 4 full practice tests before the real exam. Stamina is a trainable skill.', resources: [{ label: 'Official practice tests — always prioritize official materials', url: 'https://www.mba.com', primary: true }], community: 'Post your practice test score progression in your exam subreddit for advice', xpBase: 100 },
          { title: 'Error Log Deep Dive: Fix Top 3 Repeat Mistakes', estimatedMinutes: 45, difficulty: 'core', startTrigger: 'Open your error log — find the 3 question types you\'ve missed the most across all practice', steps: ['Identify your top 3 repeat error types (5 min)', 'For each: read the correct approach and write the rule in your own words (15 min)', 'Do 5 targeted questions per error type immediately (20 min)', 'Check accuracy — did it improve? Adjust if not (5 min)'], completionCondition: 'Top 3 repeat errors identified + rule written + 5 practice questions per type done', focusTip: 'Repeat errors are a gift — they tell you exactly what to study.', resources: [], community: null, xpBase: 80 },
          { title: 'Timing Strategy: Find Your Optimal Pacing Plan', estimatedMinutes: 30, difficulty: 'core', startTrigger: 'Look at your last practice test — open the sections where you ran out of time first', steps: ['Identify sections where you ran out of time (5 min)', 'Write a per-question time budget for each section (5 min)', 'Complete 1 timed section using your new budget — stop exactly at time (20 min)'], completionCondition: 'New time budget written + 1 section completed at strict new pacing', focusTip: 'Spending too long on hard questions means skipping easy ones. Practice the skip.', resources: [], community: null, xpBase: 65 },
          { title: 'Practice Test #3: Weakest Section Only, Full Focus', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Sit down for your weakest section under full exam conditions — full timer, no distractions', steps: ['Complete your weakest 1–2 sections under timed conditions', 'Score and compare to tests #1 and #2 (5 min)', 'Write what specifically changed — concept, timing, or approach (5 min)'], completionCondition: 'Weakest section completed + scored + trend vs. previous tests written', focusTip: 'By test #3, you should see improvement in your weakest section. If not — change your study method.', resources: [], community: null, xpBase: 95 },
        ],
        [
          { title: 'Final Weak Area Sprint: 90 Minutes on Your Worst Topic', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Open your error log — find your single weakest topic and work on nothing else for 90 minutes', steps: ['Review the concept one final time (20 min)', 'Do 30 practice questions on that topic only (50 min)', 'Score yourself — write your accuracy and whether it improved (10 min)', 'Decide: do more or move on? (10 min)'], completionCondition: '30 practice questions completed + final accuracy noted + decision made', focusTip: 'At this stage, stop adding new material. Deepen what you have.', resources: [], community: null, xpBase: 100 },
          { title: 'Final Full Practice Test: Treat It Like the Real Thing', estimatedMinutes: 90, difficulty: 'stretch', startTrigger: 'Same time of day as your real exam. Same location. Same snack. Timer on — go.', steps: ['Complete the full test under exam conditions', 'Score every section immediately (5 min)', 'Write your predicted score range based on all practice tests (5 min)'], completionCondition: 'Final practice test completed + scored + predicted score range written', focusTip: 'Your final practice score is your floor on test day. Trust your preparation.', resources: [], community: 'Share your final practice score in your exam subreddit for support', xpBase: 110 },
          { title: 'Day Before: Review Notes, Pack, Rest Early', estimatedMinutes: 30, difficulty: 'easy', startTrigger: 'Open your condensed formula or rule sheet — read it once slowly, then close it', steps: ['Read your 1-page summary notes one final time — no new material (15 min)', 'Pack everything needed: ID, pencils, snack, water (5 min)', 'Set alarm 90 min before test time (2 min)', 'Commit to sleeping at your normal time tonight (8 min)'], completionCondition: 'Notes reviewed once + logistics packed + alarm set + early bedtime committed', focusTip: 'The day before is won by resting. Your score is already set. Trust the preparation.', resources: [], community: null, xpBase: 50 },
          { title: 'Post-Exam Debrief: Record What Happened While Fresh', estimatedMinutes: 20, difficulty: 'easy', startTrigger: 'Open a blank doc immediately after the exam and write your first reaction before doing anything else', steps: ['Write how you felt: timing, confidence, surprises (10 min)', 'Write the 2–3 question types that felt hardest (5 min)', 'Write what you\'d do differently if preparing again (5 min)'], completionCondition: 'Post-exam debrief written while memory is still raw', focusTip: 'Whether you nail it or retake it — this debrief helps you and helps future test-takers.', resources: [], community: 'r/GMAT, r/LSAT, r/GRE — share your experience to help others', xpBase: 60 },
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
    if (/spanish|french|japanese|mandarin|chinese|german|arabic|korean|italian|portuguese|\blanguage\b|fluent|duolingo|vocab/.test(g)) return TEMPLATES.language;
    if (/\bcode\b|coding|program|javascript|python|react|developer|software engineer|full.?stack|front.?end|back.?end|web dev/.test(g)) return TEMPLATES.coding;
    if (/\bnovel\b|write.*book|writing.*book|manuscript|screenplay|\bauthor\b|fiction|non.?fiction|first draft|nanowrimo/.test(g)) return TEMPLATES.writing;
    if (/promot|senior|manag|leadership|career advance|raise|new job|job offer|performance review|get promoted/.test(g)) return TEMPLATES.career;
    if (/gmat|gre|lsat|\bsat\b|ielts|toefl|\bexam\b|certif|bar exam|\bcpa\b|\bcfa\b|\bpmp\b|pass.*test|study.*exam/.test(g)) return TEMPLATES.exam;
    return TEMPLATES.default;
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  function uid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    }
    return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  }

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
