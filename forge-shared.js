// ========================================================================
// THE FORGE — Shared State & Utilities (used by all pages)
// ========================================================================

const DOMAIN_META = {
  iron:    { icon:'fa-dumbbell',  titles:['Unforged','Recruit','Soldier','Warrior','Champion','Titan'], color:'#4ade80',
             milestones:['','4x/week for 4 weeks','8x/week for 8 weeks','PR + 0 missed in 12 weeks','Compete or hit body comp target','All sustained 6 months'] },
  anvil:   { icon:'fa-hammer',    titles:['Unforged','Apprentice','Journeyman','Craftsman','Artisan','Master Smith'], color:'#e94560',
             milestones:['','GCP done + NeurGait repo init','3+ features + 5 cold emails','Positive feedback + 1 thesis lead responds','NeurGait in workflow OR thesis confirmed','Thesis secured + recommendation letter'] },
  vault:   { icon:'fa-vault',     titles:['Unforged','Peasant','Merchant','Treasurer','Banker','Lord of Coin'], color:'#e94560',
             milestones:['','Know exact burn rate','Savings account + auto transfer','Swiss tax basics + 1 month positive savings','3 month emergency fund','6 month runway + tax-optimized'] },
  guild:   { icon:'fa-users',     titles:['Unforged','Stranger','Acquaintance','Ally','Guild Member','Guild Master'], color:'#e94560',
             milestones:['','LinkedIn overhauled + 1st cold email','10 outreach + 1 response','3 meaningful conversations','Warm intro to thesis target','5+ professionals vouch for you'] },
  library: { icon:'fa-book',      titles:['Unforged','Student','Scholar','Sage','Loremaster','Archmage'], color:'#e94560',
             milestones:['','GCP done + 5 gait papers read','Explain DFA/stride variability without notes','Applied knowledge in NeurGait code','Published or presented work','PI or CTO seeks your input'] }
};

const OVERALL_TITLES = ['Nameless','Initiate','Proven','Forged','Legendary','Mythic'];

// ==================== STATE ====================
function defaultState() {
  return {
    domains:{iron:0,anvil:0,vault:0,guild:0,library:0},
    dailyLogs:[], quests:[], expenses:[], income:[], contacts:[], weeklyReviews:[],
    truth:'Click here to set your Uncomfortable Truth.', startDate:'2026-03-08',
    iron:{ workouts:[], swimmingSessions:[], boxingSessions:[] },
    anvil:{ tasks:[], outreachLog:[] },
    vault:{ budgetGoals:{ monthlyTarget:0, savingsTarget:10 } },
    guild:{ interactions:[] },
    library:{ papers:[], courses:[], deepWorkSessions:[] }
  };
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('forge_state'));
    if (s && s.domains) {
      // Ensure all sub-objects exist
      if (!s.contacts) s.contacts=[];
      if (!s.weeklyReviews) s.weeklyReviews=[];
      if (!s.iron) s.iron={ workouts:[], swimmingSessions:[], boxingSessions:[] };
      if (!s.iron.workouts) s.iron.workouts=[];
      if (!s.iron.swimmingSessions) s.iron.swimmingSessions=[];
      if (!s.iron.boxingSessions) s.iron.boxingSessions=[];
      if (!s.anvil) s.anvil={ tasks:[], outreachLog:[] };
      if (!s.anvil.tasks) s.anvil.tasks=[];
      if (!s.anvil.outreachLog) s.anvil.outreachLog=[];
      if (!s.vault) s.vault={ budgetGoals:{ monthlyTarget:0, savingsTarget:10 } };
      if (!s.guild) s.guild={ interactions:[] };
      if (!s.guild.interactions) s.guild.interactions=[];
      if (!s.library) s.library={ papers:[], courses:[], deepWorkSessions:[] };
      if (!s.library.papers) s.library.papers=[];
      if (!s.library.courses) s.library.courses=[];
      if (!s.library.deepWorkSessions) s.library.deepWorkSessions=[];
      return s;
    }
  } catch(e){}
  return defaultState();
}

let S = defaultState();
function saveState() { cacheState(); }

// ==================== UTILITIES ====================
function uid(){return crypto.randomUUID()}
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function today(){return new Date().toISOString().slice(0,10)}
function overallLevel(){const v=Object.values(S.domains);return Math.floor(v.reduce((a,b)=>a+b,0)/v.length)}

// ==================== SERVICE WORKER ====================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
