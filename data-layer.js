// ========================================================================
// THE FORGE — Data Layer (Supabase + IndexedDB offline queue)
// ========================================================================

// ==================== IndexedDB Helpers ====================
const FORGE_IDB = 'forge_offline';
const FORGE_IDB_VER = 1;

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(FORGE_IDB, FORGE_IDB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('cache')) db.createObjectStore('cache');
      if (!db.objectStoreNames.contains('queue')) db.createObjectStore('queue', { autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(store, key, value) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(store, key) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll(store) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbClear(store) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ==================== Case Conversion ====================
function toSnake(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.replace(/[A-Z]/g, l => '_' + l.toLowerCase()), v])
  );
}

function toCamel(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.replace(/_([a-z])/g, (_, l) => l.toUpperCase()), v])
  );
}

// ==================== Queue Logic ====================
async function enqueue(table, operation, payload) {
  await idbPut('queue', undefined, { table, operation, payload, ts: Date.now() });
}

async function replayQueue() {
  const items = await idbGetAll('queue');
  if (!items.length) return;
  for (const item of items) {
    const { table, operation, payload } = item;
    let error;
    if (operation === 'insert') {
      ({ error } = await supabase.from(table).insert(payload));
    } else if (operation === 'update') {
      const { id, ...rest } = payload;
      ({ error } = await supabase.from(table).update(rest).eq('id', id));
    } else if (operation === 'delete') {
      ({ error } = await supabase.from(table).delete().eq('id', payload.id));
    }
    if (error) { console.error('Queue replay failed:', error); return; }
  }
  await idbClear('queue');
}

// ==================== CRUD Operations ====================
async function dbInsert(table, row) {
  const snakeRow = toSnake(row);
  if (navigator.onLine) {
    const { error } = await supabase.from(table).insert(snakeRow);
    if (error) await enqueue(table, 'insert', snakeRow);
  } else {
    await enqueue(table, 'insert', snakeRow);
  }
}

async function dbUpdate(table, id, changes) {
  const snakeChanges = toSnake(changes);
  if (navigator.onLine) {
    const { error } = await supabase.from(table).update(snakeChanges).eq('id', id);
    if (error) await enqueue(table, 'update', { id, ...snakeChanges });
  } else {
    await enqueue(table, 'update', { id, ...snakeChanges });
  }
}

async function dbDelete(table, id) {
  if (navigator.onLine) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) await enqueue(table, 'delete', { id });
  } else {
    await enqueue(table, 'delete', { id });
  }
}

async function dbUpsertProfile(changes) {
  const session = await supabase.auth.getSession();
  const userId = session.data.session.user.id;
  const snakeChanges = toSnake(changes);
  snakeChanges.user_id = userId;
  snakeChanges.updated_at = new Date().toISOString();
  if (navigator.onLine) {
    const { error } = await supabase.from('user_profile').upsert(snakeChanges, { onConflict: 'user_id' });
    if (error) await enqueue('user_profile', 'update', snakeChanges);
  } else {
    await enqueue('user_profile', 'update', snakeChanges);
  }
}

// ==================== Full State Fetch ====================
const TABLE_MAP = [
  { table: 'daily_logs',        path: 'dailyLogs' },
  { table: 'quests',            path: 'quests' },
  { table: 'expenses',          path: 'expenses' },
  { table: 'income',            path: 'income' },
  { table: 'contacts',          path: 'contacts' },
  { table: 'workouts',          path: 'iron.workouts' },
  { table: 'swimming_sessions', path: 'iron.swimmingSessions' },
  { table: 'boxing_sessions',   path: 'iron.boxingSessions' },
  { table: 'anvil_tasks',       path: 'anvil.tasks' },
  { table: 'outreach_log',      path: 'anvil.outreachLog' },
  { table: 'guild_interactions', path: 'guild.interactions' },
  { table: 'deep_work_sessions', path: 'library.deepWorkSessions' },
  { table: 'papers',            path: 'library.papers' },
  { table: 'courses',           path: 'library.courses' },
  { table: 'weekly_reviews',    path: 'weeklyReviews' },
];

function setNestedPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

async function fetchFullState(userId) {
  const state = defaultState();

  // Fetch profile
  const { data: profile } = await supabase.from('user_profile')
    .select('*').eq('user_id', userId).single();
  if (profile) {
    state.domains = profile.domains;
    state.truth = profile.truth;
    state.startDate = profile.start_date;
    state.vault.budgetGoals = profile.budget_goals || state.vault.budgetGoals;
  }

  // Fetch all tables in parallel
  const results = await Promise.all(
    TABLE_MAP.map(({ table }) => supabase.from(table).select('*').eq('user_id', userId))
  );

  TABLE_MAP.forEach(({ path }, i) => {
    const rows = (results[i].data || []).map(toCamel);
    setNestedPath(state, path, rows);
  });

  return state;
}

function cacheState() {
  idbPut('cache', 'fullState', S);
}

async function loadStateAsync() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return defaultState();
    }
    if (navigator.onLine) {
      await replayQueue();
      const state = await fetchFullState(session.user.id);
      await idbPut('cache', 'fullState', state);
      return state;
    }
    return (await idbGet('cache', 'fullState')) || defaultState();
  } catch (e) {
    console.error('State load failed:', e);
    try { return (await idbGet('cache', 'fullState')) || defaultState(); } catch (_) {}
    return defaultState();
  }
}

async function initForge(renderCallback) {
  try {
    S = await loadStateAsync();
  } catch (e) {
    console.error('initForge failed:', e);
    S = defaultState();
  }
  const loader = document.getElementById('forge-loading');
  if (loader) loader.remove();
  if (renderCallback) renderCallback();
}

// ==================== Reconnect Handler ====================
window.addEventListener('online', async () => {
  document.getElementById('sync-status')?.style?.setProperty('background', 'var(--green)');
  await replayQueue();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    S = await fetchFullState(session.user.id);
    cacheState();
    if (typeof renderAll === 'function') renderAll();
  }
});
window.addEventListener('offline', () => {
  document.getElementById('sync-status')?.style?.setProperty('background', 'var(--ember)');
});
