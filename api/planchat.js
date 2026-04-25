const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const RATE_MAP = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const entry = RATE_MAP.get(ip) || { count: 0, reset: now + 3_600_000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 3_600_000; }
  entry.count++;
  RATE_MAP.set(ip, entry);
  return entry.count > 40;
}

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests' });

  const { message, plan } = req.body || {};
  if (!message || typeof message !== 'string') return res.status(400).json({ error: 'message required' });
  if (!plan || !Array.isArray(plan.milestones)) return res.status(400).json({ error: 'plan.milestones required' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not configured in Vercel environment variables' });

  const milestonesDesc = (plan.milestones || []).map((m, i) => {
    const taskCount = (plan.tasks || []).filter(t => t.milestoneId === m.id).length;
    return `Milestone ${i + 1} (milestoneIndex: ${i}): "${m.title}" — ${taskCount} tasks`;
  }).join('\n');

  const systemPrompt = `You are a plan editing assistant for GoalQuest, an AI goal tracker.
The user wants to modify their plan through natural language.

Current plan:
Goal: "${(plan.goal && plan.goal.title) || 'unknown'}"
Milestones:
${milestonesDesc}

Return ONLY valid JSON — no markdown, no explanation:
{
  "assistant_message": "friendly 1-2 sentence explanation of what you're proposing",
  "proposed_changes": [
    {
      "type": "reduce_tasks",
      "milestoneIndex": 0,
      "factor": 0.6
    }
  ],
  "change_summary": "brief summary of all changes",
  "requires_confirmation": true
}

Change types (use exact type strings):
- "reduce_tasks": milestoneIndex + factor (0.4–0.7, proportion of tasks to keep)
- "add_tasks": milestoneIndex + count (1–3) + optional difficulty ("easy"|"core"|"stretch") + optional label string
- "change_difficulty": milestoneIndex + target ("easy"|"core"|"stretch")
- "shift_milestone": milestoneIndex + days (positive integer, days to push forward)
- "shorten_tasks": milestoneIndex + maxMinutes (integer)
- "replace_resources": milestoneIndex (replaces with YouTube search links)

Rules:
- milestoneIndex is 0-based (Milestone 1 = 0, Milestone 2 = 1)
- Only include fields relevant to the change type
- If a change applies to ALL milestones, include one entry per milestone
- If the request doesn't map to a plan edit, return proposed_changes: [] and explain in assistant_message
- requires_confirmation: always true
- Keep assistant_message concise and friendly`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim().slice(0, 600) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.35,
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq planchat error:', errText);
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || '';

    let parsed;
    try { parsed = JSON.parse(text); }
    catch {
      console.error('planchat JSON parse failed:', text.slice(0, 200));
      return res.status(502).json({ error: 'Invalid AI response format' });
    }

    if (typeof parsed.assistant_message !== 'string' || !Array.isArray(parsed.proposed_changes)) {
      return res.status(502).json({ error: 'Malformed AI response structure' });
    }

    return res.status(200).json({
      assistant_message: parsed.assistant_message,
      proposed_changes: parsed.proposed_changes,
      change_summary: parsed.change_summary || '',
      requires_confirmation: true,
    });
  } catch (err) {
    console.error('planchat handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
