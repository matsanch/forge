// ========================================================================
// THE FORGE — Natural Language Input Parser
// ========================================================================

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseInput(text) {
  text = text.trim();
  const lower = text.toLowerCase();
  let m;

  // Strip filler words for cleaner matching
  function stripNoise(s) {
    return s.replace(/\b(at|on|for|in|from|the|a|an)\b/g, ' ').replace(/\s{2,}/g, ' ').trim();
  }

  // Extract amount, handling currency suffixes: "40fr", "27.80chf", "50.-", "12.5 fr"
  function extractAmount(s) {
    const am = s.match(/([\d.]+)\s*(?:fr|chf|.-)?/);
    return am ? parseFloat(am[1]) : NaN;
  }

  // EXPENSE: "spent 40fr at migros", "spent 27.8 migros food", "spent 12 chf on groceries"
  m = lower.match(/^spent\s+([\d.]+\s*(?:fr|chf|\.\-)?)\s+(.*)/);
  if (m) {
    const amount = extractAmount(m[1]);
    const rest = stripNoise(m[2]);
    const catMap = {
      food: ['migros','coop','lidl','aldi','denner','food','grocery','groceries','restaurant','lunch','dinner','aligro','kebab','pizza','mcdonalds','burger','bakery','cafe','coffee'],
      transport: ['sbb','train','tram','bus','uber','transport','ticket','taxi','bolt','lyft','ga','half-fare'],
      health: ['pharmacy','doctor','health','swimming pool','natation','physio','dentist','hospital'],
      gear: ['gear','equipment','gloves','shoes','clothes','clothing','decathlon'],
      subscription: ['spotify','netflix','subscription','youtube','icloud','apple','google','adobe']
    };
    let category = 'other';
    for (const [cat, kws] of Object.entries(catMap)) {
      if (kws.some(k => rest.includes(k))) { category = cat; break; }
    }
    return { type: 'expense', data: { date: today(), amount, category, note: rest } };
  }

  // GYM: "gym 90min hack squat 4x5x120, rdl 3x8x100" or "gym bench 4x8x80"
  m = lower.match(/^gym\s+(?:(\d+)\s*min\s+)?(.*)/);
  if (m) {
    const duration = parseInt(m[1]) || 0;
    const exercises = m[2].split(/[,;]/).map(s => {
      const em = s.trim().match(/^(.+?)\s+(\d+)x(\d+)(?:x([\d.]+))?/);
      if (!em) return null;
      return { name: em[1].trim(), muscle: '', sets: parseInt(em[2]), reps: parseInt(em[3]), weight: parseFloat(em[4]) || 0 };
    }).filter(Boolean);
    return { type: 'workout', data: { date: today(), exercises, energy: 3, duration, notes: '' } };
  }

  // SWIMMING: "swam 1000m 40min", "swam for 40 min 1000m", "swimming 1000m"
  m = lower.match(/^sw[ai]m?\w*\s+(?:for\s+)?(\d+)\s*m(?:eters?)?\s*(?:(?:for\s+|in\s+)?(\d+)\s*min)?/);
  if (!m) m = lower.match(/^sw[ai]m?\w*\s+(?:for\s+)?(\d+)\s*min\s+(\d+)\s*m/);
  if (m) {
    const first = parseInt(m[1]), second = parseInt(m[2]) || 0;
    const isFirstDist = lower.match(/^sw\w*\s+(?:for\s+)?\d+\s*m[^i]/);
    const distance = isFirstDist ? first : second;
    const duration = isFirstDist ? second : first;
    return { type: 'swimming', data: { date: today(), distance, duration, type: 'freestyle', drills: [], notes: '' } };
  }

  // BOXING: "boxing conditioning 45min", "boxed sparring 6 rounds", "boxing 45min conditioning"
  m = lower.match(/^box(?:ed|ing)?\s+(\w+)\s+(\d+)\s*(min(?:utes?)?|rounds?)/);
  if (!m) m = lower.match(/^box(?:ed|ing)?\s+(\d+)\s*(min(?:utes?)?|rounds?)\s+(\w+)/);
  if (m) {
    const hasTypeFirst = isNaN(parseInt(m[1]));
    const type = hasTypeFirst ? m[1] : m[3];
    const val = hasTypeFirst ? parseInt(m[2]) : parseInt(m[1]);
    const unit = hasTypeFirst ? m[3] : m[2];
    const isRounds = /round/i.test(unit);
    return { type: 'boxing', data: { date: today(), type, rounds: isRounds ? val : 0, duration: isRounds ? 0 : val, mistakes: [], workOn: '', notes: '' } };
  }

  // DEEP WORK: "deep work 2h gait analysis", "dw 90min thesis", "deep work 2h on gait analysis"
  m = lower.match(/^(?:deep\s*work(?:ed)?|dw)\s+([\d.]+)\s*(h|hr|hours?|min(?:utes?)?)\s*(?:on\s+)?(.*)/);
  if (m) {
    let hours = parseFloat(m[1]);
    if (/min/i.test(m[2])) hours = hours / 60;
    return { type: 'deep_work', data: { date: today(), hours, topic: m[3].trim(), category: 'research', focus: 3, notes: '' } };
  }

  // INCOME: "earned 500 salary", "earned 500fr from swimming lessons", "income 200 freelance"
  m = lower.match(/^(?:earned|income)\s+([\d.]+)\s*(?:fr|chf|\.\-)?\s*(?:from\s+)?(.*)/);
  if (m) {
    return { type: 'income', data: { date: today(), amount: parseFloat(m[1]), source: m[2].trim() || 'other', note: '' } };
  }

  return { type: 'unknown', data: { raw: text } };
}
