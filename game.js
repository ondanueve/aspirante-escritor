// Aspirante a Escritor - Simulador
const STORAGE_KEY = 'aspiranteEscritorSave';

const genres = ['Narrativa', 'Poesía', 'Ensayo', 'Ciencia Ficción', 'Misterio', 'Romance'];
const magazines = [
  { name: 'Revista Local', minQuality: 40, payment: 100, rep: 5 },
  { name: 'Literaria Nacional', minQuality: 55, payment: 300, rep: 15 },
  { name: 'Antología Internacional', minQuality: 70, payment: 800, rep: 30 }
];
const contests = [
  { name: 'Concurso Municipal', minQuality: 35, prize: 200, rep: 10 },
  { name: 'Premio Nacional de Cuento', minQuality: 60, prize: 1500, rep: 40 },
  { name: 'Concurso Internacional', minQuality: 75, prize: 5000, rep: 60 }
];
const booksCatalog = [
  { title: 'El arte de la ficción', author: 'John Gardner', genre: 'Narrativa', insp: 15, skill: { Narrativa: 5 } },
  { title: 'Sobre la escritura', author: 'Stephen King', genre: 'Narrativa', insp: 20, skill: { Narrativa: 8 } },
  { title: 'Poesía completa', author: 'Pablo Neruda', genre: 'Poesía', insp: 18, skill: { Poesía: 7 } },
  { title: '1984', author: 'George Orwell', genre: 'Ciencia Ficción', insp: 12, skill: { 'Ciencia Ficción': 4 } },
  { title: 'Ensayos', author: 'Montaigne', genre: 'Ensayo', insp: 10, skill: { Ensayo: 6 } }
];

let state = {
  week: 1,
  energy: 100,
  inspiration: 50,
  money: 500,
  reputation: 0,
  skills: { Narrativa: 20, Poesía: 10, Ensayo: 15, 'Ciencia Ficción': 10, Misterio: 10, Romance: 10, Estilo: 15 },
  library: [],
  works: [],
  log: ['Comienzas tu carrera como aspirante a escritor. El mundo literario es duro, pero tienes ideas.']
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) state = JSON.parse(saved);
}

function addLog(msg) {
  state.log.unshift(`[Semana ${state.week}] ${msg}`);
  if (state.log.length > 50) state.log.pop();
  save();
}

function getQuality(genre) {
  const skill = state.skills[genre] || 10;
  const style = state.skills.Estilo;
  const libBonus = state.library.reduce((sum, b) => sum + (b.skill[genre] || 0), 0);
  const inspBonus = state.inspiration / 5;
  return Math.min(100, Math.floor(skill * 0.6 + style * 0.3 + libBonus + inspBonus + Math.random() * 15));
}

function writeWork(type, genre) {
  if (state.energy < 30) { addLog('Demasiado cansado para escribir.'); return; }
  state.energy -= 30;
  state.inspiration = Math.max(0, state.inspiration - 10);
  const quality = getQuality(genre);
  const title = type === 'cuento' ? `Cuento de ${genre} #${state.works.length + 1}` : `Novela de ${genre} #${state.works.filter(w => w.type === 'novela').length + 1}`;
  state.works.push({ title, type, genre, quality, status: 'borrador', earnings: 0 });
  addLog(`Escribiste "${title}" (calidad ${quality}/100).`);
  // Improve skills slightly
  state.skills[genre] = Math.min(100, (state.skills[genre] || 10) + 1);
  state.skills.Estilo = Math.min(100, state.skills.Estilo + 0.5);
  save();
  render();
}

function readBook(index) {
  if (state.energy < 10) { addLog('Necesitas más energía para leer.'); return; }
  const book = state.library[index];
  if (!book) return;
  state.energy -= 10;
  state.inspiration = Math.min(100, state.inspiration + book.insp);
  Object.keys(book.skill).forEach(g => {
    state.skills[g] = Math.min(100, (state.skills[g] || 0) + book.skill[g] * 0.3);
  });
  addLog(`Leíste "${book.title}" de ${book.author}. Inspiración y habilidades aumentan.`);
  save();
  render();
}

function buyBook(book) {
  if (state.money < 40) { addLog('No tienes dinero para comprar el libro.'); return; }
  state.money -= 40;
  state.library.push({ ...book });
  addLog(`Compraste "${book.title}" para tu biblioteca.`);
  save();
  render();
}

function submitWork(workIndex, targetType, targetIndex) {
  const work = state.works[workIndex];
  if (!work || work.status !== 'borrador') return;
  const targets = targetType === 'contest' ? contests : magazines;
  const target = targets[targetIndex];
  work.status = 'enviado';
  const successChance = Math.max(0.05, (work.quality - target.minQuality + state.reputation / 10) / 100);
  if (Math.random() < successChance) {
    if (targetType === 'contest') {
      state.money += target.prize;
      state.reputation += target.rep;
      work.status = 'publicado';
      work.earnings += target.prize;
      addLog(`¡Ganaste el ${target.name}! Premio: $${target.prize}.`);
    } else {
      state.money += target.payment;
      state.reputation += target.rep;
      work.status = 'publicado';
      work.earnings += target.payment;
      addLog(`Publicado en ${target.name}. Pago: $${target.payment}.`);
    }
  } else {
    work.status = 'rechazado';
    addLog(`Rechazado por ${target.name}. Sigue escribiendo.`);
  }
  save();
  render();
}

function travel(type) {
  const options = {
    vacaciones: { cost: 400, insp: 30, energy: 20, rep: 0, msg: 'Vacaciones inspiradoras. Ideas fluyen.' },
    conferencia: { cost: 200, insp: 15, energy: -10, rep: 15, msg: 'Asististe a una conferencia. Networking y reputación.' },
    presentacion: { cost: 100, insp: 10, energy: -5, rep: 20, msg: 'Presentaste tu obra. El público responde.' }
  };
  const opt = options[type];
  if (state.money < opt.cost) { addLog('No alcanza el dinero para viajar.'); return; }
  state.money -= opt.cost;
  state.inspiration = Math.min(100, state.inspiration + opt.insp);
  state.energy = Math.max(0, Math.min(100, state.energy + opt.energy));
  state.reputation += opt.rep;
  addLog(opt.msg);
  save();
  render();
}

function rest() {
  state.energy = Math.min(100, state.energy + 40);
  state.inspiration = Math.max(0, state.inspiration - 5);
  addLog('Descansaste y recuperaste energía.');
  save();
  render();
}

function nextWeek() {
  state.week++;
  state.energy = Math.min(100, state.energy + 10);
  // Passive income from published works (royalties)
  const royalties = state.works.filter(w => w.status === 'publicado').reduce((s, w) => s + Math.floor(w.quality / 20), 0);
  if (royalties > 0) {
    state.money += royalties;
    addLog(`Regalías de la semana: $${royalties}.`);
  }
  // Random events
  if (Math.random() < 0.1 && state.reputation > 20) {
    addLog('Un agente literario se interesa por tu trabajo.');
    state.reputation += 5;
  }
  save();
  render();
}

function renderStats() {
  const el = document.getElementById('stats-content');
  el.innerHTML = `
    <div class="stat">Energía: ${state.energy}/100 <div class="bar"><div class="bar-fill" style="width:${state.energy}%"></div></div></div>
    <div class="stat">Inspiración: ${state.inspiration}/100 <div class="bar"><div class="bar-fill" style="width:${state.inspiration}%"></div></div></div>
    <div class="stat">Dinero: $${state.money}</div>
    <div class="stat">Reputación: ${state.reputation}</div>
    <div class="stat">Habilidades:</div>
    ${Object.entries(state.skills).map(([k,v]) => `<div class="stat">${k}: ${Math.floor(v)}</div>`).join('')}
  `;
}

function renderActions() {
  const el = document.getElementById('actions-content');
  el.innerHTML = `
    <button onclick="writeWork('cuento', 'Narrativa')">Escribir Cuento (Narrativa)</button>
    <button onclick="writeWork('cuento', 'Poesía')">Escribir Poema</button>
    <button onclick="writeWork('novela', 'Narrativa')">Escribir Novela</button>
    <button onclick="rest()">Descansar (+Energía)</button>
    <button onclick="travel('vacaciones')">Vacaciones ($400, +Insp)</button>
    <button onclick="travel('conferencia')">Conferencia ($200, +Rep)</button>
    <button onclick="travel('presentacion')">Presentación ($100, +Rep)</button>
    <button onclick="nextWeek()">Avanzar Semana</button>
    <h3>Comprar libros</h3>
    ${booksCatalog.map((b, i) => `<button onclick="buyBook(booksCatalog[${i}])">${b.title} ($40)</button>`).join('')}
  `;
}

function renderPortfolio() {
  const el = document.getElementById('portfolio-content');
  const worksHtml = state.works.map((w, i) => `
    <div class="work">
      <strong>${w.title}</strong> (${w.genre}, ${w.quality}/100) - ${w.status} $${w.earnings}<br>
      ${w.status === 'borrador' ? `
        <button onclick="submitWork(${i}, 'contest', 0)">Enviar a Concurso Municipal</button>
        <button onclick="submitWork(${i}, 'contest', 1)">Premio Nacional</button>
        <button onclick="submitWork(${i}, 'magazine', 0)">Revista Local</button>
        <button onclick="submitWork(${i}, 'magazine', 1)">Literaria Nacional</button>
      ` : ''}
    </div>
  `).join('') || '<p>Aún no has escrito nada.</p>';
  const libHtml = state.library.map((b, i) => `
    <div class="book">
      ${b.title} - ${b.author} <button onclick="readBook(${i})">Leer</button>
    </div>
  `).join('') || '<p>Biblioteca vacía. Compra libros para inspirarte.</p>';
  el.innerHTML = `<h3>Obras</h3>${worksHtml}<h3>Biblioteca</h3>${libHtml}`;
}

function renderLog() {
  document.getElementById('log-content').innerHTML = state.log.map(l => `<div class="log-entry">${l}</div>`).join('');
}

function render() {
  document.getElementById('time').textContent = `Semana ${state.week}`;
  renderStats();
  renderActions();
  renderPortfolio();
  renderLog();
}

// Init
load();
render();
window.writeWork = writeWork;
window.readBook = readBook;
window.buyBook = buyBook;
window.submitWork = submitWork;
window.travel = travel;
window.rest = rest;
window.nextWeek = nextWeek;
window.booksCatalog = booksCatalog;
