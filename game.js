// Aspirante a Escritor - Versión profunda
const STORAGE_KEY = 'aspiranteEscritorDeepSave';

const genres = ['Narrativa', 'Poesía', 'Ensayo', 'Ciencia Ficción', 'Misterio', 'Romance', 'Fantasía'];

const magazines = [
  { name: 'Revista Local', minQuality: 38, payment: 120, rep: 4, type: 'cuento' },
  { name: 'Literaria Nacional', minQuality: 55, payment: 350, rep: 18, type: 'cuento' },
  { name: 'Antología Internacional', minQuality: 72, payment: 900, rep: 35, type: 'cuento' },
  { name: 'Editorial Independiente', minQuality: 62, payment: 2000, rep: 25, type: 'novela', advance: 1500 },
  { name: 'Editorial Grande', minQuality: 78, payment: 8000, rep: 50, type: 'novela', advance: 5000 }
];

const contests = [
  { name: 'Concurso Municipal', minQuality: 32, prize: 250, rep: 8 },
  { name: 'Premio Nacional de Cuento', minQuality: 58, prize: 1800, rep: 45 },
  { name: 'Concurso Internacional', minQuality: 75, prize: 6000, rep: 70 }
];

const booksCatalog = [
  { title: 'El arte de la ficción', author: 'John Gardner', genre: 'Narrativa', insp: 18, skill: { Narrativa: 6 }, wellbeing: 2 },
  { title: 'Sobre la escritura', author: 'Stephen King', genre: 'Narrativa', insp: 22, skill: { Narrativa: 9 }, wellbeing: -1 },
  { title: 'Bird by Bird', author: 'Anne Lamott', genre: 'Narrativa', insp: 15, skill: { Narrativa: 5 }, wellbeing: 5, discipline: 4 },
  { title: 'Poesía completa', author: 'Pablo Neruda', genre: 'Poesía', insp: 20, skill: { Poesía: 8 } },
  { title: '1984', author: 'George Orwell', genre: 'Ciencia Ficción', insp: 14, skill: { 'Ciencia Ficción': 5 } },
  { title: 'Ensayos', author: 'Montaigne', genre: 'Ensayo', insp: 12, skill: { Ensayo: 7 }, wellbeing: 3 },
  { title: 'The War of Art', author: 'Steven Pressfield', genre: 'Narrativa', insp: 10, skill: {}, discipline: 8, wellbeing: 1 }
];

let state = {
  week: 1,
  energy: 100,
  inspiration: 45,
  money: 600,
  reputation: 0,
  wellbeing: 70,      // salud mental / ánimo
  discipline: 30,     // hábito de escritura
  confidence: 40,     // vs impostor
  social: 50,         // energía social / red
  burnout: 0,         // 0-100, alto es malo
  skills: { Narrativa: 18, Poesía: 8, Ensayo: 12, 'Ciencia Ficción': 8, Misterio: 7, Romance: 6, Fantasía: 5, Estilo: 12 },
  library: [],
  works: [],
  contracts: [],
  hasAgent: false,
  agentQuality: 0,
  log: ['Comienzas. Tienes ideas, un poco de dinero y mucho camino por delante. El oficio es largo.']
};

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) Object.assign(state, JSON.parse(saved));
}

function addLog(msg) {
  state.log.unshift(`[Semana ${state.week}] ${msg}`);
  if (state.log.length > 60) state.log.pop();
  save();
}

function clamp(n, min=0, max=100) { return Math.max(min, Math.min(max, n)); }

function getQuality(genre) {
  const skill = state.skills[genre] || 8;
  const style = state.skills.Estilo;
  const libBonus = state.library.reduce((sum, b) => sum + (b.skill?.[genre] || 0), 0);
  const inspBonus = state.inspiration / 6;
  const wellBonus = (state.wellbeing - 50) / 10;
  const confBonus = (state.confidence - 40) / 15;
  const discBonus = state.discipline / 20;
  const burnPenalty = state.burnout / 15;
  let q = skill * 0.55 + style * 0.28 + libBonus + inspBonus + wellBonus + confBonus + discBonus - burnPenalty + Math.random() * 12;
  return clamp(Math.floor(q), 5, 98);
}

function writeWork(type, genre) {
  if (state.energy < 25) { addLog('Demasiado cansado. Necesitas descansar o recuperar energía.'); return; }
  if (state.burnout > 75) { addLog('El burnout es tan alto que apenas puedes concentrarte. Algo tiene que cambiar.'); return; }
  const cost = type === 'novela' ? 45 : 28;
  state.energy -= cost;
  state.inspiration = clamp(state.inspiration - (type === 'novela' ? 18 : 12));
  state.wellbeing = clamp(state.wellbeing - 4);
  state.burnout = clamp(state.burnout + (type === 'novela' ? 8 : 5));
  state.discipline = clamp(state.discipline + 1);

  const quality = getQuality(genre);
  const titles = {
    cuento: [`${genre} breve #${state.works.length+1}`, `Fragmento de ${genre}`, `Historia de ${genre}`],
    novela: [`Novela de ${genre} #${state.works.filter(w=>w.type==='novela').length+1}`, `Manuscrito largo de ${genre}`]
  };
  const title = titles[type][Math.floor(Math.random()*titles[type].length)];
  state.works.push({ title, type, genre, quality, status: 'borrador', earnings: 0, rightsSold: [] });
  addLog(`Escribiste "${title}" (calidad ${quality}/100). El proceso te dejó cansado.`);

  state.skills[genre] = clamp((state.skills[genre] || 8) + (type === 'novela' ? 1.5 : 0.8));
  state.skills.Estilo = clamp(state.skills.Estilo + 0.4);
  if (Math.random() < 0.15) {
    state.confidence = clamp(state.confidence + 3);
    addLog('Algo en esta pieza te dio un poco más de confianza.');
  }
  save(); render();
}

function readBook(index) {
  if (state.energy < 8) { addLog('Necesitas más energía para leer con atención.'); return; }
  const book = state.library[index];
  if (!book) return;
  state.energy -= 8;
  state.inspiration = clamp(state.inspiration + book.insp);
  state.wellbeing = clamp(state.wellbeing + (book.wellbeing || 2));
  if (book.discipline) state.discipline = clamp(state.discipline + book.discipline);
  Object.keys(book.skill || {}).forEach(g => {
    state.skills[g] = clamp((state.skills[g] || 0) + (book.skill[g] * 0.35));
  });
  addLog(`Leíste "${book.title}" de ${book.author}. Ideas y ánimo mejoran.`);
  save(); render();
}

function buyBook(book) {
  if (state.money < 45) { addLog('No alcanza para comprar ese libro ahora.'); return; }
  state.money -= 45;
  state.library.push({ ...book });
  addLog(`Compraste "${book.title}" para tu biblioteca.`);
  save(); render();
}

function submitWork(workIndex, targetType, targetIndex) {
  const work = state.works[workIndex];
  if (!work || work.status !== 'borrador') return;
  const targets = targetType === 'contest' ? contests : magazines;
  const target = targets[targetIndex];
  if (target.type && target.type !== work.type) { addLog('Esa publicación no acepta ese tipo de obra.'); return; }

  work.status = 'enviado';
  let chance = Math.max(0.03, (work.quality - target.minQuality + state.reputation / 12 + (state.hasAgent ? 15 : 0)) / 110);
  chance *= (state.confidence / 100) * 0.3 + 0.7;
  if (Math.random() < chance) {
    const pay = target.prize || target.payment || 0;
    const adv = target.advance || 0;
    state.money += pay + adv;
    state.reputation += target.rep;
    work.status = 'publicado';
    work.earnings += pay + adv;
    work.venue = target.name;
    if (target.type === 'novela' && adv) {
      state.contracts.push({ workTitle: work.title, publisher: target.name, advance: adv, royalties: 0, rights: ['publicación'] });
    }
    addLog(`¡Aceptado en ${target.name}! ${pay ? 'Pago/premio: $' + pay : ''} ${adv ? 'Anticipo: $' + adv : ''}.`);
    state.confidence = clamp(state.confidence + 8);
    state.wellbeing = clamp(state.wellbeing + 6);
  } else {
    work.status = 'rechazado';
    addLog(`Rechazado por ${target.name}. Es normal. Sigue.`);
    state.confidence = clamp(state.confidence - 4);
    state.wellbeing = clamp(state.wellbeing - 3);
    if (Math.random() < 0.2) addLog('El rechazo duele más de lo que esperabas.');
  }
  save(); render();
}

function seekAgent() {
  if (state.hasAgent) { addLog('Ya tienes agente.'); return; }
  if (state.reputation < 25 || state.works.filter(w => w.status === 'publicado').length < 2) {
    addLog('Los agentes aún no responden. Necesitas más reputación o obras publicadas.');
    return;
  }
  const chance = Math.min(0.4, (state.reputation - 20) / 150 + state.works.filter(w=>w.quality>65).length * 0.05);
  if (Math.random() < chance) {
    state.hasAgent = true;
    state.agentQuality = 40 + Math.floor(Math.random()*30);
    addLog(`Conseguiste un agente literario (calidad ${state.agentQuality}). Ahora las puertas se abren un poco más.`);
    state.confidence += 10;
  } else {
    addLog('Los agentes pasaron. Intenta de nuevo más adelante.');
  }
  save(); render();
}

function negotiateRights(workIndex, rightType) {
  const work = state.works[workIndex];
  if (!work || work.status !== 'publicado' || work.rightsSold.includes(rightType)) return;
  if (!state.hasAgent && Math.random() > 0.3) { addLog('Sin agente es muy difícil negociar derechos. Casi nadie responde.'); return; }
  const base = rightType === 'traducción' ? 800 : 2500;
  const pay = Math.floor(base * (work.quality / 70) * (state.hasAgent ? 1.4 : 0.7));
  state.money += pay;
  work.rightsSold.push(rightType);
  work.earnings += pay;
  addLog(`Vendiste derechos de ${rightType} de "${work.title}" por $${pay}.`);
  state.reputation += 5;
  save(); render();
}

function travel(type) {
  const options = {
    vacaciones: { cost: 450, insp: 28, energy: 15, well: 12, burn: -15, social: 5, msg: 'Vacaciones. El silencio y el paisaje te devolvieron algo.' },
    conferencia: { cost: 220, insp: 12, energy: -8, well: 2, burn: 4, social: 18, rep: 12, msg: 'Conferencia. Conociste gente, escuchaste charlas, volviste con ideas y algo de cansancio.' },
    residencia: { cost: 600, insp: 35, energy: -15, well: 8, burn: 6, disc: 5, rep: 20, msg: 'Residencia de escritura. Semanas intensas. Productividad alta, vida social baja.' },
    presentacion: { cost: 80, insp: 8, energy: -4, well: 4, social: 10, rep: 15, msg: 'Presentaste. El público fue amable. Te sentiste expuesto y vivo.' }
  };
  const opt = options[type];
  if (state.money < opt.cost) { addLog('No alcanza el dinero.'); return; }
  state.money -= opt.cost;
  state.inspiration = clamp(state.inspiration + opt.insp);
  state.energy = clamp(state.energy + (opt.energy || 0));
  state.wellbeing = clamp(state.wellbeing + (opt.well || 0));
  state.burnout = clamp(state.burnout + (opt.burn || 0));
  state.social = clamp(state.social + (opt.social || 0));
  if (opt.rep) state.reputation += opt.rep;
  if (opt.disc) state.discipline = clamp(state.discipline + opt.disc);
  addLog(opt.msg);
  save(); render();
}

function personalAction(type) {
  if (type === 'rest') {
    state.energy = clamp(state.energy + 35);
    state.wellbeing = clamp(state.wellbeing + 8);
    state.burnout = clamp(state.burnout - 12);
    state.inspiration = clamp(state.inspiration - 3);
    addLog('Descansaste de verdad. El cuerpo y la cabeza lo agradecen.');
  } else if (type === 'exercise') {
    state.energy = clamp(state.energy - 12);
    state.wellbeing = clamp(state.wellbeing + 10);
    state.burnout = clamp(state.burnout - 8);
    state.discipline = clamp(state.discipline + 2);
    addLog('Saliste a caminar / hacer ejercicio. Claridad mental.');
  } else if (type === 'social') {
    state.social = clamp(state.social + 15);
    state.wellbeing = clamp(state.wellbeing + 6);
    state.energy = clamp(state.energy - 8);
    addLog('Pasaste tiempo con gente. Te recordó que no eres solo palabras.');
  } else if (type === 'therapy') {
    if (state.money < 120) { addLog('No puedes pagar la sesión ahora.'); return; }
    state.money -= 120;
    state.wellbeing = clamp(state.wellbeing + 14);
    state.confidence = clamp(state.confidence + 5);
    state.burnout = clamp(state.burnout - 10);
    addLog('Sesión de terapia. Algo se ordenó adentro.');
  }
  save(); render();
}

function nextWeek() {
  state.week++;
  state.energy = clamp(state.energy + 8);
  state.burnout = clamp(state.burnout - 3);
  // Regalías
  const royalties = state.works.filter(w => w.status === 'publicado').reduce((s, w) => s + Math.floor(w.quality / 18), 0);
  if (royalties > 0) {
    state.money += royalties;
    addLog(`Regalías de la semana: $${royalties}.`);
  }
  // Eventos aleatorios de vida
  const roll = Math.random();
  if (roll < 0.08 && state.burnout > 50) {
    addLog('Semana de bloqueo total. Las palabras no salen. La duda crece.');
    state.inspiration = clamp(state.inspiration - 15);
    state.confidence = clamp(state.confidence - 6);
  } else if (roll < 0.14 && state.reputation > 15) {
    addLog('Alguien te escribió diciendo que tu texto le importó. Pequeña luz.');
    state.wellbeing = clamp(state.wellbeing + 8);
    state.confidence = clamp(state.confidence + 4);
  } else if (roll < 0.18) {
    addLog('Crisis pequeña de la vida cotidiana. Energía y ánimo bajan.');
    state.energy = clamp(state.energy - 10);
    state.wellbeing = clamp(state.wellbeing - 5);
  }
  if (state.wellbeing < 30) addLog('Tu bienestar está bajo. Escribe con cuidado o descansa.');
  if (state.burnout > 80) addLog('Advertencia: riesgo alto de burnout. Considera parar.');
  save(); render();
}

function renderStats() {
  const el = document.getElementById('stats-content');
  el.innerHTML = `
    <div class="stat">Energía: ${state.energy}/100 <div class="bar"><div class="bar-fill bar-energy" style="width:${state.energy}%"></div></div></div>
    <div class="stat">Inspiración: ${state.inspiration}/100 <div class="bar"><div class="bar-fill bar-insp" style="width:${state.inspiration}%"></div></div></div>
    <div class="stat">Dinero: $${state.money}</div>
    <div class="stat">Reputación: ${state.reputation}</div>
    <div class="stat">Habilidades:</div>
    ${Object.entries(state.skills).map(([k,v]) => `<div class="stat" style="font-size:0.9em">${k}: ${Math.floor(v)}</div>`).join('')}
  `;
}

function renderPersonal() {
  const el = document.getElementById('personal-content');
  const wellColor = state.wellbeing > 60 ? '#4caf50' : state.wellbeing > 35 ? '#ff9800' : '#c62828';
  el.innerHTML = `
    <div class="stat">Bienestar: ${state.wellbeing}/100 <div class="bar"><div class="bar-fill" style="width:${state.wellbeing}%;background:${wellColor}"></div></div></div>
    <div class="stat">Disciplina: ${state.discipline}/100 <div class="bar"><div class="bar-fill bar-disc" style="width:${state.discipline}%"></div></div></div>
    <div class="stat">Confianza: ${state.confidence}/100</div>
    <div class="stat">Energía social: ${state.social}/100</div>
    <div class="stat ${state.burnout > 60 ? 'warning' : ''}">Burnout: ${state.burnout}/100</div>
    <div class="stat">Agente: ${state.hasAgent ? 'Sí (calidad ' + state.agentQuality + ')' : 'No'}</div>
    <button class="secondary" onclick="personalAction('rest')">Descansar de verdad</button>
    <button class="secondary" onclick="personalAction('exercise')">Ejercicio / caminar</button>
    <button class="secondary" onclick="personalAction('social')">Tiempo social</button>
    <button class="secondary" onclick="personalAction('therapy')">Terapia ($120)</button>
    <button onclick="seekAgent()">Buscar agente literario</button>
  `;
}

function renderActions() {
  const el = document.getElementById('actions-content');
  el.innerHTML = `
    <button onclick="writeWork('cuento', 'Narrativa')">Escribir Cuento (Narrativa)</button>
    <button onclick="writeWork('cuento', 'Poesía')">Escribir Poema</button>
    <button onclick="writeWork('cuento', 'Misterio')">Cuento de Misterio</button>
    <button onclick="writeWork('novela', 'Narrativa')">Escribir Novela</button>
    <button onclick="travel('vacaciones')">Vacaciones ($450, +ánimo/insp)</button>
    <button onclick="travel('conferencia')">Conferencia ($220, +red/rep)</button>
    <button onclick="travel('residencia')">Residencia ($600, +insp/disc)</button>
    <button onclick="travel('presentacion')">Presentación ($80, +rep)</button>
    <button onclick="nextWeek()">Avanzar Semana</button>
    <h3>Comprar libros</h3>
    ${booksCatalog.map((b, i) => `<button onclick="buyBook(booksCatalog[${i}])">${b.title} ($45)</button>`).join('')}
  `;
}

function renderPortfolio() {
  const el = document.getElementById('portfolio-content');
  const worksHtml = state.works.map((w, i) => `
    <div class="work">
      <strong>${w.title}</strong> (${w.genre}, ${w.quality}/100) — ${w.status} $${w.earnings}<br>
      ${w.venue ? `<small>En: ${w.venue}</small><br>` : ''}
      ${w.status === 'borrador' ? `
        <button onclick="submitWork(${i}, 'contest', 0)">Concurso Municipal</button>
        <button onclick="submitWork(${i}, 'contest', 1)">Premio Nacional</button>
        <button onclick="submitWork(${i}, 'magazine', 0)">Revista Local</button>
        <button onclick="submitWork(${i}, 'magazine', 1)">Literaria Nacional</button>
        ${w.type === 'novela' ? `<button onclick="submitWork(${i}, 'magazine', 3)">Editorial Independiente</button><button onclick="submitWork(${i}, 'magazine', 4)">Editorial Grande</button>` : ''}
      ` : ''}
      ${w.status === 'publicado' ? `
        ${!w.rightsSold.includes('traducción') ? `<button onclick="negotiateRights(${i}, 'traducción')">Vender derechos traducción</button>` : ''}
        ${!w.rightsSold.includes('audiovisual') ? `<button onclick="negotiateRights(${i}, 'audiovisual')">Vender derechos audiovisuales</button>` : ''}
      ` : ''}
    </div>
  `).join('') || '<p>Aún no has escrito nada.</p>';
  const libHtml = state.library.map((b, i) => `
    <div class="book">${b.title} — ${b.author} <button onclick="readBook(${i})">Leer</button></div>
  `).join('') || '<p>Biblioteca vacía. Los libros alimentan el oficio.</p>';
  el.innerHTML = `<h3>Obras</h3>${worksHtml}<h3>Biblioteca</h3>${libHtml}`;
}

function renderLog() {
  document.getElementById('log-content').innerHTML = state.log.map(l => `<div class="log-entry">${l}</div>`).join('');
}

function renderStatusBar() {
  const warnings = [];
  if (state.burnout > 70) warnings.push('<span class="warning">Alto burnout</span>');
  if (state.wellbeing < 35) warnings.push('<span class="warning">Bajo bienestar</span>');
  if (state.hasAgent) warnings.push('<span class="good">Con agente</span>');
  document.getElementById('status-bar').innerHTML = warnings.join(' · ') || 'Todo relativamente estable';
}

function render() {
  document.getElementById('time').textContent = `Semana ${state.week}`;
  renderStatusBar();
  renderStats();
  renderPersonal();
  renderActions();
  renderPortfolio();
  renderLog();
}

load();
render();
window.writeWork = writeWork;
window.readBook = readBook;
window.buyBook = buyBook;
window.submitWork = submitWork;
window.seekAgent = seekAgent;
window.negotiateRights = negotiateRights;
window.travel = travel;
window.personalAction = personalAction;
window.nextWeek = nextWeek;
window.booksCatalog = booksCatalog;
