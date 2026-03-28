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

  // EXPENSE: "spent 27.8 migros food"
  m = lower.match(/^spent\s+([\d.]+)\s+(.+)/);
  if (m) {
    const amount = parseFloat(m[1]);
    const rest = m[2];
    const catMap = {
      food: ['migros','coop','lidl','aldi','denner','food','grocery','restaurant','lunch','dinner','aligro'],
      transport: ['sbb','train','tram','bus','uber','transport','ticket'],
      health: ['pharmacy','doctor','health','swimming pool','natation'],
      gear: ['gear','equipment','gloves'],
      subscription: ['spotify','netflix','subscription']
    };
    let category = 'other';
    for (const [cat, kws] of Object.entries(catMap)) {
      if (kws.some(k => rest.includes(k))) { category = cat; break; }
    }
    return { type: 'expense', data: { date: today(), amount, category, note: rest } };
  }

  // GYM: "gym 90min hack squat 4x5x120, rdl 3x8x100"
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

  // SWIMMING: "swam 1000m 40min"
  m = lower.match(/^sw[ai]m?\w*\s+(\d+)\s*m(?:eters?)?\s*(?:(\d+)\s*min)?/);
  if (m) {
    return { type: 'swimming', data: { date: today(), distance: parseInt(m[1]), duration: parseInt(m[2]) || 0, type: 'freestyle', drills: [], notes: '' } };
  }

  // BOXING: "boxing conditioning 45min" or "boxing sparring 6 rounds"
  m = lower.match(/^box(?:ing)?\s+(\w+)\s+(\d+)\s*(min|rounds?)/);
  if (m) {
    const isRounds = /round/i.test(m[3]);
    const val = parseInt(m[2]);
    return { type: 'boxing', data: { date: today(), type: m[1], rounds: isRounds ? val : 0, duration: isRounds ? 0 : val, mistakes: [], workOn: '', notes: '' } };
  }

  // DEEP WORK: "deep work 2h gait analysis" or "dw 90min thesis"
  m = lower.match(/^(?:deep\s*work|dw)\s+([\d.]+)\s*(h|hr|hours?|min)\s*(.*)/);
  if (m) {
    let hours = parseFloat(m[1]);
    if (/min/i.test(m[2])) hours = hours / 60;
    return { type: 'deep_work', data: { date: today(), hours, topic: m[3].trim(), category: 'research', focus: 3, notes: '' } };
  }

  // INCOME: "earned 500 salary"
  m = lower.match(/^(?:earned|income)\s+([\d.]+)\s*(.*)/);
  if (m) {
    return { type: 'income', data: { date: today(), amount: parseFloat(m[1]), source: m[2].trim() || 'other', note: '' } };
  }

  return { type: 'unknown', data: { raw: text } };
}
