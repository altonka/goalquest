const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { goalText, deadline, hoursPerWeek, currentLevel, successCriteria } = req.body || {};
  if (!goalText) return res.status(400).json({ error: 'goalText is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured — add GEMINI_API_KEY in Vercel environment variables' });

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = deadline
    ? Math.max(4, Math.round((new Date(deadline) - Date.now()) / msPerWeek))
    : 16;
  const weeksPerPhase = Math.max(2, Math.round(totalWeeks / 4));

  const prompt = `You are a world-class goal achievement coach. Create a personalized, actionable plan.

Goal: "${goalText}"
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
        "resources": [{ "label": "Resource Name", "url": "https://example.com", "primary": true }],
        "community": "Where to share or get feedback, or null",
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
- All tasks must be directly and specifically relevant to: "${goalText}"
- Use real, specific websites and tools relevant to this exact goal`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini error:', errText);
      return res.status(502).json({ error: 'AI service unavailable', detail: errText.slice(0, 200) });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(502).json({ error: 'Invalid AI response format' });

    const template = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(template.milestones) || !Array.isArray(template.taskSets)) {
      return res.status(502).json({ error: 'Malformed plan structure from AI' });
    }

    return res.status(200).json({ template });
  } catch (err) {
    console.error('decompose handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
