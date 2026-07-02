const router = require('express').Router();

const GROK_MODEL = process.env.GROK_MODEL || 'grok-2-1212';
const SYSTEM_PROMPT = `You are an AI stylist for an F1 merchandise store. Answer the user's styling request in a helpful and concise way. Recommend 3 clothing products based on the prompt. Return strict JSON only with this shape: {"recommendations": ["Product Name 1", "Product Name 2", "Product Name 3"], "note": "Short explanation"}. Use only the provided catalog names. If unsure, choose the safest stylish options and explain briefly.`;

function normalize(str = '') {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function extractJSON(text) {
  const trimmed = String(text || '').trim();
  const codeMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = codeMatch ? codeMatch[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      return null;
    }
  }
}

function heuristicRecommend(prompt, catalog) {
  const text = normalize(prompt);
  const clothing = Array.isArray(catalog) ? catalog.filter(item => item.category === 'clothing') : [];

  const scored = clothing
    .map(item => {
      const name = normalize(`${item.name || ''} ${item.nameRu || ''}`);
      let score = 0;

      if ((text.includes('hot') || text.includes('30') || text.includes('sun') || text.includes('issiq')) && (name.includes('tee') || name.includes('t shirt') || name.includes('cap') || name.includes('polo'))) score += 4;
      if ((text.includes('rain') || text.includes('wind') || text.includes('cold') || text.includes('cool') || text.includes('sovuq') || text.includes('nam')) && (name.includes('jacket') || name.includes('hoodie') || name.includes('kurtk') || name.includes('hudi'))) score += 4;
      if ((text.includes('monza') || text.includes('gran') || text.includes('race') || text.includes('track') || text.includes('trassa')) && (name.includes('jacket') || name.includes('hoodie') || name.includes('tee') || name.includes('polo'))) score += 2;
      if ((text.includes('cap') || text.includes('kepka') || text.includes('hat')) && name.includes('cap')) score += 5;
      if ((text.includes('hoodie') || text.includes('hudi')) && (name.includes('hoodie') || name.includes('hudi'))) score += 5;
      if ((text.includes('jacket') || text.includes('kurtk')) && name.includes('jacket')) score += 5;
      if (item.badge) score += 1;
      if (item.inStock !== false) score += 1;

      return { item, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map(entry => entry.item);
}

function matchCatalogItems(catalog, candidates, fallback) {
  const items = Array.isArray(catalog) ? catalog : [];
  const matched = [];

  for (const candidate of candidates || []) {
    const normalizedCandidate = normalize(candidate);
    const found = items.find(item => {
      const name = normalize(`${item.name || ''} ${item.nameRu || ''}`);
      return name.includes(normalizedCandidate) || normalizedCandidate.includes(name);
    });
    if (found && !matched.some(x => x._id === found._id)) matched.push(found);
  }

  if (matched.length) return matched;
  return Array.isArray(fallback) && fallback.length ? fallback : items.slice(0, 3);
}

router.post('/recommend', async (req, res) => {
  const { prompt = '', products = [] } = req.body || {};
  if (!String(prompt || '').trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const catalog = Array.isArray(products) ? products : [];
  const fallback = heuristicRecommend(prompt, catalog);
  const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;

  if (!apiKey) {
    return res.json({
      note: 'Grok API key not configured. Using local recommendations.',
      items: fallback,
    });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Prompt: ${prompt}\nCatalog: ${catalog.slice(0, 10).map(item => `${item.name || item.nameRu || ''}`).join(' | ')}`,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const parsed = extractJSON(text);
    const names = Array.isArray(parsed?.recommendations) ? parsed.recommendations : [];
    const items = matchCatalogItems(catalog, names, fallback);

    res.json({
      note: parsed?.note || 'Recommendation generated by Grok.',
      items,
    });
  } catch (error) {
    res.json({
      note: 'Grok was unavailable, so local recommendations were used.',
      items: fallback,
    });
  }
});

module.exports = router;
