const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// In-memory rate limiter — resets on cold start, sufficient for abuse prevention
const RATE_MAP = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const entry = RATE_MAP.get(ip) || { count: 0, reset: now + 3_600_000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 3_600_000; }
  entry.count++;
  RATE_MAP.set(ip, entry);
  return entry.count > 20; // 20 req/hour per IP
}

function isValidTask(t) {
  return (
    typeof t.title === 'string' && t.title.length > 0 &&
    typeof t.estimatedMinutes === 'number' && t.estimatedMinutes > 0 &&
    ['easy', 'core', 'stretch'].includes(t.difficulty) &&
    Array.isArray(t.steps)
  );
}

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests' });

  const { goalText, deadline, hoursPerWeek, currentLevel, successCriteria, modifier } = req.body || {};

  if (!goalText || typeof goalText !== 'string') {
    return res.status(400).json({ error: 'goalText is required' });
  }
  const safeGoalText = goalText.trim().slice(0, 300);
  if (!safeGoalText) return res.status(400).json({ error: 'goalText is required' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Add GROQ_API_KEY in Vercel environment variables' });

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = deadline
    ? Math.max(4, Math.round((new Date(deadline) - Date.now()) / msPerWeek))
    : 16;
  const weeksPerPhase = Math.max(2, Math.round(totalWeeks / 4));

  const prompt = `Goal: "${safeGoalText}"
Timeline: ${totalWeeks} weeks${deadline ? ` (deadline: ${deadline})` : ''}
${hoursPerWeek ? `Hours/week: ${hoursPerWeek}` : ''}
${currentLevel ? `Starting level: ${currentLevel}` : ''}
${successCriteria ? `Success looks like: ${successCriteria}` : ''}

Return ONLY valid JSON — no markdown, no explanation:
{
  "milestones": [
    { "title": "Phase Name", "desc": "What this phase achieves", "weeks": ${weeksPerPhase} }
  ],
  "taskSets": [
    [
      {
        "title": "Specific actionable task title",
        "estimatedMinutes": 45,
        "difficulty": "easy",
        "startTrigger": "The exact first physical action to begin right now",
        "steps": ["Step 1 with time estimate (X min)", "Step 2 (X min)", "Step 3 (X min)"],
        "completionCondition": "Specific measurable proof this task is done",
        "focusTip": "Environment or focus tip for this task",
        "community": null,
        "xpBase": 60
      }
    ]
  ]
}

Requirements:
- Exactly 4 milestones, each ~${weeksPerPhase} weeks
- taskSets: exactly 4 arrays (one per milestone), each with exactly 4 tasks
- difficulty per milestone: mix of "easy", "core", "stretch" — at least one each
- estimatedMinutes: easy=15-30, core=30-60, stretch=45-90
- xpBase: easy=40-60, core=60-90, stretch=80-120
- startTrigger: a highly specific physical first action (not vague like "open your laptop")
- steps: 3-5 steps, each with time estimate in parentheses
- completionCondition: a concrete, verifiable outcome
- All tasks must be directly and specifically relevant to: "${safeGoalText}"
- Do NOT include a "resources" field — omit it entirely
${modifier ? `\nThe user requested: "${modifier.slice(0, 200)}". Adjust the plan accordingly.` : ''}`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a goal planning engine. Return only valid JSON matching the schema the user provides. No explanation, no markdown, no extra fields.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq error:', errText);
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || '';

    let template;
    try {
      template = JSON.parse(text);
    } catch {
      console.error('JSON parse failed:', text.slice(0, 200));
      return res.status(502).json({ error: 'Invalid AI response format' });
    }

    if (!Array.isArray(template.milestones) || !Array.isArray(template.taskSets)) {
      return res.status(502).json({ error: 'Malformed plan structure from AI' });
    }

    const allTasksValid = template.taskSets.every(set =>
      Array.isArray(set) && set.every(isValidTask)
    );
    if (!allTasksValid) {
      return res.status(502).json({ error: 'Malformed task in AI response' });
    }

    return res.status(200).json({ template, usedFallback: false });
  } catch (err) {
    console.error('decompose handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
