export const VERSION = '2.1.0';

export const CROPS = {
  variable: { name: { 'pt-BR': 'Variável', en: 'Variable' }, emoji: '📦', sym: 'var x', t: 14, y: 9, cost: 3, color: '#4ade80', rarity: 'common', lv: 1, desc: { 'pt-BR': 'let x = valor. O início de tudo.', en: 'let x = value. The start of it all.' } },
  function: { name: { 'pt-BR': 'Função', en: 'Function' }, emoji: '⚡', sym: 'fn()', t: 30, y: 27, cost: 8, color: '#60a5fa', rarity: 'common', lv: 1, desc: { 'pt-BR': 'DRY principle. Lógica reutilizável.', en: 'DRY principle. Reusable logic.' } },
  class: { name: { 'pt-BR': 'Classe', en: 'Class' }, emoji: '🏛️', sym: 'class{}', t: 62, y: 82, cost: 20, color: '#c084fc', rarity: 'uncommon', lv: 3, desc: { 'pt-BR': 'OOP em sua forma clássica.', en: 'OOP in its classic form.' } },
  api: { name: { 'pt-BR': 'API REST', en: 'REST API' }, emoji: '🌐', sym: 'GET/', t: 120, y: 210, cost: 46, color: '#fb923c', rarity: 'rare', lv: 5, desc: { 'pt-BR': 'Conecta serviços. Status: 200 OK.', en: 'Connects services. Status: 200 OK.' } },
  algorithm: { name: { 'pt-BR': 'Algoritmo', en: 'Algorithm' }, emoji: '🧮', sym: 'O(n)', t: 185, y: 430, cost: 88, color: '#f43f5e', rarity: 'rare', lv: 7, desc: { 'pt-BR': 'Big-O importa. Eficiência é tudo.', en: 'Big-O matters. Efficiency is everything.' } },
  database: { name: { 'pt-BR': 'Banco', en: 'Database' }, emoji: '🗄️', sym: 'SQL', t: 290, y: 900, cost: 165, color: '#22d3ee', rarity: 'epic', lv: 10, desc: { 'pt-BR': 'Persistência real. SELECT * FROM life.', en: 'Real persistence. SELECT * FROM life.' } },
  ml_model: { name: { 'pt-BR': 'Modelo ML', en: 'ML Model' }, emoji: '🤖', sym: 'AI()', t: 520, y: 2400, cost: 380, color: '#a78bfa', rarity: 'legendary', lv: 15, desc: { 'pt-BR': 'model.fit(X,y). Reze ao GPU.', en: 'model.fit(X,y). Pray to the GPU.' } },
  cache: { name: { 'pt-BR': 'Cache', en: 'Cache' }, emoji: '🧠', sym: 'L1', t: 95, y: 180, cost: 34, color: '#34d399', rarity: 'rare', lv: 4, desc: { 'pt-BR': 'Latência baixa, throughput alto.', en: 'Low latency, high throughput.' } },
  microservice: { name: { 'pt-BR': 'Microserviço', en: 'Microservice' }, emoji: '🧩', sym: 'svc', t: 145, y: 300, cost: 58, color: '#38bdf8', rarity: 'rare', lv: 6, desc: { 'pt-BR': 'Escala horizontal e complexidade vertical.', en: 'Horizontal scale, vertical complexity.' } },
  shader: { name: { 'pt-BR': 'Shader', en: 'Shader' }, emoji: '✨', sym: 'GLSL', t: 230, y: 560, cost: 96, color: '#f472b6', rarity: 'epic', lv: 8, desc: { 'pt-BR': 'Brilho, partículas e custo de GPU.', en: 'Glow, particles, and GPU cost.' } },
  docker: { name: { 'pt-BR': 'Docker', en: 'Docker' }, emoji: '🐳', sym: 'img', t: 270, y: 700, cost: 118, color: '#0ea5e9', rarity: 'epic', lv: 9, desc: { 'pt-BR': 'Empacota tudo e chama de portátil.', en: 'Packages everything and calls it portable.' } },
  ai_agent: { name: { 'pt-BR': 'Agente IA', en: 'AI Agent' }, emoji: '🛰️', sym: 'agent', t: 680, y: 3600, cost: 920, color: '#facc15', rarity: 'mythic', lv: 20, desc: { 'pt-BR': 'Automação autônoma de alto risco.', en: 'Autonomous automation at high risk.' } },
};

export const UPGRADES = {
  coffee: { name: { 'pt-BR': 'Café Duplo', en: 'Double Coffee' }, emoji: '☕', desc: { 'pt-BR': '+25% velocidade por nível', en: '+25% growth speed per level' }, costs: [80, 200, 500], max: 3, effect: 'speed', req: [] },
  linter: { name: { 'pt-BR': 'Linter Pro', en: 'Linter Pro' }, emoji: '🔍', desc: { 'pt-BR': '-40% chance de bugs por nível', en: '-40% bug chance per level' }, costs: [150, 400], max: 2, effect: 'bugProtect', req: [] },
  gpu: { name: { 'pt-BR': 'GPU Cluster', en: 'GPU Cluster' }, emoji: '💻', desc: { 'pt-BR': '+50% yield em todos os crops por nível', en: '+50% yield for all crops per level' }, costs: [300, 800, 2000], max: 3, effect: 'yieldBoost', req: ['coffee'] },
  network: { name: { 'pt-BR': 'Open Source', en: 'Open Source' }, emoji: '🌐', desc: { 'pt-BR': '+25% recompensas dos contratos', en: '+25% contract rewards' }, costs: [250, 700], max: 2, effect: 'contractBoost', req: ['linter'] },
  ci_cd: { name: { 'pt-BR': 'CI/CD', en: 'CI/CD' }, emoji: '🚀', desc: { 'pt-BR': 'Auto-colhe crops maduros', en: 'Auto-harvest mature crops' }, costs: [600], max: 1, effect: 'autoHarvest', req: ['network'] },
  stack: { name: { 'pt-BR': 'Stack Overflow', en: 'Stack Overflow' }, emoji: '📚', desc: { 'pt-BR': '+100% XP de colheita', en: '+100% harvest XP' }, costs: [600], max: 1, effect: 'xpBoost', req: ['coffee'] },
  expansion6: { name: { 'pt-BR': 'Farm 6×6', en: 'Farm 6×6' }, emoji: '📐', desc: { 'pt-BR': 'Expande o farm para 36 plots', en: 'Expands the farm to 36 plots' }, costs: [500], max: 1, effect: 'expand6', req: ['gpu'] },
  expansion7: { name: { 'pt-BR': 'Farm 7×7', en: 'Farm 7×7' }, emoji: '🗺️', desc: { 'pt-BR': 'Expande o farm para 49 plots', en: 'Expands the farm to 49 plots' }, costs: [1500], max: 1, effect: 'expand7', req: ['expansion6'] },
  greenhouse: { name: { 'pt-BR': 'Estufa', en: 'Greenhouse' }, emoji: '🪴', desc: { 'pt-BR': '+10% rendimento e -10% tempo', en: '+10% yield and -10% time' }, costs: [900, 2400], max: 2, effect: 'greenhouse', req: ['ci_cd'] },
  observability: { name: { 'pt-BR': 'Observabilidade', en: 'Observability' }, emoji: '📈', desc: { 'pt-BR': '+50% ganhos de metas', en: '+50% goal rewards' }, costs: [1100], max: 1, effect: 'goals', req: ['network'] },
  backup: { name: { 'pt-BR': 'Backup na Nuvem', en: 'Cloud Backup' }, emoji: '☁️', desc: { 'pt-BR': 'Import/export e slots extras', en: 'Import/export and extra slots' }, costs: [1300], max: 1, effect: 'backup', req: ['observability'] },
};

export const EVENTS = [
  { id: 'review', title: { 'pt-BR': 'Code Review', en: 'Code Review' }, desc: { 'pt-BR': 'Você aceita uma revisão pesada?', en: 'Do you accept a heavy review?' }, kind: 'good', choices: [
    { id: 'accept', label: { 'pt-BR': 'Aceitar', en: 'Accept' }, reward: { reviewBonus: true, xp: 40 } },
    { id: 'pushback', label: { 'pt-BR': 'Argumentar', en: 'Push back' }, reward: { tokens: 30, reputation: 1 } },
  ]},
  { id: 'deploy', title: { 'pt-BR': 'Deploy Automático', en: 'Auto Deploy' }, desc: { 'pt-BR': 'Rodar agora ou esperar um teste final?', en: 'Deploy now or wait for a final test?' }, kind: 'good', choices: [
    { id: 'now', label: { 'pt-BR': 'Agora', en: 'Now' }, reward: { harvestAll: true, tokens: 45 } },
    { id: 'test', label: { 'pt-BR': 'Testar', en: 'Test' }, reward: { xp: 60, reputation: 1 } },
  ]},
  { id: 'refactor', title: { 'pt-BR': 'Big Refactor', en: 'Big Refactor' }, desc: { 'pt-BR': 'Refatorar tudo ou só estabilizar?', en: 'Refactor everything or just stabilize?' }, kind: 'good', choices: [
    { id: 'rewrite', label: { 'pt-BR': 'Reescrever', en: 'Rewrite' }, reward: { refactorMinutes: 10, tokens: -15 } },
    { id: 'stabilize', label: { 'pt-BR': 'Estabilizar', en: 'Stabilize' }, reward: { linterBoost: 1, xp: 30 } },
  ]},
  { id: 'incident', title: { 'pt-BR': 'Incidente em Produção', en: 'Production Incident' }, desc: { 'pt-BR': 'Resolver rápido ou preservar o backlog?', en: 'Fix fast or preserve the backlog?' }, kind: 'bad', choices: [
    { id: 'fix', label: { 'pt-BR': 'Corrigir', en: 'Fix' }, reward: { bugsFixed: 2, tokens: 20 } },
    { id: 'rollback', label: { 'pt-BR': 'Rollback', en: 'Rollback' }, reward: { tokens: -10, reputation: 1 } },
  ]},
  { id: 'hackathon', title: { 'pt-BR': 'Hackathon', en: 'Hackathon' }, desc: { 'pt-BR': 'Escolha entre velocidade ou qualidade.', en: 'Choose speed or quality.' }, kind: 'good', choices: [
    { id: 'speed', label: { 'pt-BR': 'Velocidade', en: 'Speed' }, reward: { hackathonBonus: true, tokens: 120 } },
    { id: 'quality', label: { 'pt-BR': 'Qualidade', en: 'Quality' }, reward: { xp: 110, reputation: 2 } },
  ]},
];

export const CONTRACT_POOL = [
  { id: 'var_drive', name: { 'pt-BR': 'Variable Sprint', en: 'Variable Sprint' }, emoji: '📦', desc: { 'pt-BR': 'Colha 15 Variables', en: 'Harvest 15 Variables' }, goal: 15, key: 'varHarv', rewardTok: 90, rewardXp: 45, rewardRep: 1 },
  { id: 'bug_hunt', name: { 'pt-BR': 'Bug Hunt', en: 'Bug Hunt' }, emoji: '🦟', desc: { 'pt-BR': 'Corrija 5 bugs', en: 'Fix 5 bugs' }, goal: 5, key: 'bugsFixed', rewardTok: 110, rewardXp: 60, rewardRep: 1 },
  { id: 'plant_burst', name: { 'pt-BR': 'Farm Expansion', en: 'Farm Expansion' }, emoji: '🌱', desc: { 'pt-BR': 'Faça 30 plantações', en: 'Make 30 plantings' }, goal: 30, key: 'planted', rewardTok: 120, rewardXp: 70, rewardRep: 1 },
  { id: 'token_push', name: { 'pt-BR': 'Deployment Budget', en: 'Deployment Budget' }, emoji: '💰', desc: { 'pt-BR': 'Ganhe 1.200 tokens', en: 'Earn 1,200 tokens' }, goal: 1200, key: 'earned', rewardTok: 160, rewardXp: 90, rewardRep: 2 },
  { id: 'ship_ready', name: { 'pt-BR': 'Ship It', en: 'Ship It' }, emoji: '🎯', desc: { 'pt-BR': 'Alcance o nível 12', en: 'Reach level 12' }, goal: 12, key: 'level', rewardTok: 180, rewardXp: 110, rewardRep: 2 },
  { id: 'prestige1', name: { 'pt-BR': 'Prestígio I', en: 'Prestige I' }, emoji: '🏅', desc: { 'pt-BR': 'Faça 1 prestige', en: 'Reach 1 prestige' }, goal: 1, key: 'prestige', rewardTok: 220, rewardXp: 120, rewardRep: 2 },
];

export const GOALS = [
  { id: 'lvl10', name: { 'pt-BR': 'Rumo ao patch 1.0', en: 'Toward patch 1.0' }, desc: { 'pt-BR': 'Alcance o nível 10', en: 'Reach level 10' }, key: 'level', goal: 10, reward: { prestige: 1 } },
  { id: 'lvl20', name: { 'pt-BR': 'Ship pronto', en: 'Ship Ready' }, desc: { 'pt-BR': 'Alcance o nível 20', en: 'Reach level 20' }, key: 'level', goal: 20, reward: { tokens: 250 } },
  { id: 'harvest100', name: { 'pt-BR': 'Ops Maduras', en: 'Mature Ops' }, desc: { 'pt-BR': 'Faça 100 colheitas', en: 'Do 100 harvests' }, key: 'harvested', goal: 100, reward: { reputation: 2 } },
  { id: 'earn5k', name: { 'pt-BR': 'Caixa Forte', en: 'Strongbox' }, desc: { 'pt-BR': 'Ganhe 5.000 tokens', en: 'Earn 5,000 tokens' }, key: 'earned', goal: 5000, reward: { prestige: 1, tokens: 300 } },
  { id: 'unlock_all', name: { 'pt-BR': 'Catálogo Completo', en: 'Full Catalog' }, desc: { 'pt-BR': 'Desbloqueie todos os crops', en: 'Unlock every crop' }, key: 'unlockAll', goal: 1, reward: { prestige: 2 } },
  { id: 'prestige3', name: { 'pt-BR': 'Veterano', en: 'Veteran' }, desc: { 'pt-BR': 'Alcance 3 prestige', en: 'Reach 3 prestige' }, key: 'prestige', goal: 3, reward: { tokens: 500 } },
];

export const ACHIEVEMENTS = [
  { id: 'first', name: { 'pt-BR': 'Hello World', en: 'Hello World' }, emoji: '👋', desc: { 'pt-BR': 'Faça sua primeira colheita', en: 'Do your first harvest' }, chk: state => state.stats.harvested >= 1 },
  { id: 'rich', name: { 'pt-BR': 'Senior Dev', en: 'Senior Dev' }, emoji: '💰', desc: { 'pt-BR': 'Ganhe 1.000 tokens no total', en: 'Earn 1,000 total tokens' }, chk: state => state.stats.earned >= 1000 },
  { id: 'full', name: { 'pt-BR': 'Full Stack', en: 'Full Stack' }, emoji: '🌾', desc: { 'pt-BR': 'Plante em todos os plots', en: 'Plant in every plot' }, chk: state => state.plots.filter(plot => plot.state !== 'empty').length >= state.farmSize },
  { id: 'debug', name: { 'pt-BR': 'Exterminador', en: 'Exterminator' }, emoji: '🦟', desc: { 'pt-BR': 'Corrija 10 bugs', en: 'Fix 10 bugs' }, chk: state => state.stats.bugsFixed >= 10 },
  { id: 'aieng', name: { 'pt-BR': 'AI Engineer', en: 'AI Engineer' }, emoji: '🤖', desc: { 'pt-BR': 'Colha seu primeiro ML Model', en: 'Harvest your first ML Model' }, chk: state => state.stats.mlHarv >= 1 },
  { id: 'lv20', name: { 'pt-BR': 'Ship It!', en: 'Ship It!' }, emoji: '🎯', desc: { 'pt-BR': 'Alcance o nível 20', en: 'Reach level 20' }, chk: state => state.level >= 20 },
  { id: 'hoarder', name: { 'pt-BR': 'Token Hoarder', en: 'Token Hoarder' }, emoji: '🏦', desc: { 'pt-BR': 'Tenha 5.000 tokens', en: 'Hold 5,000 tokens' }, chk: state => state.tokens >= 5000 },
  { id: 'speedrun', name: { 'pt-BR': 'Speedrunner', en: 'Speedrunner' }, emoji: '⚡', desc: { 'pt-BR': 'Colha 50 Variables', en: 'Harvest 50 Variables' }, chk: state => state.stats.varHarv >= 50 },
  { id: 'contractor', name: { 'pt-BR': 'Contractor', en: 'Contractor' }, emoji: '📋', desc: { 'pt-BR': 'Complete 5 contratos', en: 'Complete 5 contracts' }, chk: state => state.stats.contractsClaimed >= 5 },
  { id: 'prestige', name: { 'pt-BR': 'Reset Master', en: 'Reset Master' }, emoji: '♻️', desc: { 'pt-BR': 'Faça 1 prestige', en: 'Perform 1 prestige' }, chk: state => state.prestige >= 1 },
];

export const DEFAULT_SETTINGS = {
  volume: 0.75,
  sfx: true,
  music: false,
  fullscreen: false,
  pauseOnBlur: true,
  reducedMotion: false,
  language: 'pt-BR',
};

export function cropLabel(crop, lang) {
  return crop.name[lang] || crop.name.en || crop.name['pt-BR'];
}

export function cropDesc(crop, lang) {
  return crop.desc[lang] || crop.desc.en || crop.desc['pt-BR'];
}
