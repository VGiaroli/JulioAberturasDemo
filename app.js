/*
 * Julio Aberturas - Sistema de cortes
 * Prototipo Delta Plus (Alsafex)
 *
 * Reglas cargadas: ventana y puerta corrediza de 2 hojas, opción para vidrio
 * simple o laminado. Fuente de fórmulas: manual DELTA-PLUS.pdf, página impresa 31.
 * Perfiles, peso y largos: catálogo 2-DELTA-PLUS-03-2023.pdf, páginas impresas 4 a 7.
 *
 * Importante: el manual indica que las medidas deben comprobarse mediante un
 * prototipo antes de la producción en serie. Esta app no reemplaza esa validación.
 */

'use strict';

const STORAGE_KEY = 'julio_aberturas_delta_plus_v1';
const LINE_NAME = 'Delta Plus · Alsafex';
const MANUAL_PAGE = 31;
const CATALOG_PAGE_RANGE = '4–7';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const mm = value => `${Number(value || 0).toLocaleString('es-AR')} mm`;
const today = () => new Date().toISOString().slice(0, 10);

/* Datos de perfiles transcritos del índice técnico Delta Plus 2023.
   Los números de página son las páginas impresas en el catálogo. */
const PROFILES = {
  '1020651': { code: '1020651', shortCode: '651', name: 'Umbral y dintel de marco', kg: 1.21, bar: 6150, page: 9, catalogPage: 5, section: 'Marco' },
  '1020655': { code: '1020655', shortCode: '655', name: 'Jamba de marco', kg: 0.59, bar: 6150, page: 9, catalogPage: 6, section: 'Marco' },
  '1020653': { code: '1020653', shortCode: '653', name: 'Parante lateral V.S.', kg: 0.64, bar: 6150, page: 10, catalogPage: 5, section: 'Hoja' },
  '1020654': { code: '1020654', shortCode: '654', name: 'Parante central V.S.', kg: 0.58, bar: 6150, page: 10, catalogPage: 5, section: 'Hoja' },
  '1020677': { code: '1020677', shortCode: '677', name: 'Parante central V.S. con tirador', kg: 0.79, bar: 6150, page: 10, catalogPage: 6, section: 'Hoja' },
  '1020652': { code: '1020652', shortCode: '652', name: 'Zócalo y cabezal V.S.', kg: 0.64, bar: 6030, page: 10, catalogPage: 5, section: 'Hoja' },
  '1020660': { code: '1020660', shortCode: '660', name: 'Zócalo V.S. puerta corrediza', kg: 1.26, bar: 6030, page: 10, catalogPage: 6, section: 'Hoja' },
  '1020685': { code: '1020685', shortCode: '685', name: 'Mosquitero', kg: 0.38, bar: 6030, page: 13, catalogPage: 7, section: 'Mosquitero' },
  '1020708': { code: '1020708', shortCode: '708', name: 'Tope mosquitero', kg: 0.19, bar: 6030, page: 9, catalogPage: 7, section: 'Mosquitero' }
};

/* Fórmulas de la tabla de corte del manual Delta Plus, p. 31.
   El código corto del manual se vincula al código completo del catálogo 2023
   por coincidencia de sufijo, denominación y perfil. */
const MODELS = {
  window2: {
    id: 'window2', type: 'Ventana', name: 'Ventana corrediza · 2 hojas · 2 pistas',
    description: 'Ventana corrediza de dos hojas. Opción para vidrio simple o laminado.',
    source: 'DELTA-PLUS.pdf · página 31',
    rules: [
      { part: 'Umbral y dintel', code: '1020651', qty: 2, formula: 'A - 42', angle: '90° / 90°' },
      { part: 'Jamba', code: '1020655', qty: 2, formula: 'H', angle: '90° / 90°' },
      { part: 'Parante lateral', code: '1020653', qty: 2, formula: 'H - 79', angle: '90° / 90°' },
      { part: 'Parante central', code: '1020654', qty: 2, formula: 'H - 79', angle: '90° / 90°' },
      { part: 'Zócalo', code: '1020652', qty: 4, formula: 'A / 2 - 24', angle: '90° / 90°' }
    ],
    mosquitoRules: [
      { part: 'Mosquitero horizontal', code: '1020685', qty: 2, formula: 'A / 2 - 7', angle: '45° / 45°' },
      { part: 'Mosquitero vertical', code: '1020685', qty: 2, formula: 'H - 88', angle: '45° / 45°' },
      { part: 'Tope mosquitero', code: '1020708', qty: 2, formula: 'H - 100', angle: '90° / 90°' }
    ]
  },
  door2: {
    id: 'door2', type: 'Puerta', name: 'Puerta corrediza · 2 hojas · 2 pistas',
    description: 'Puerta corrediza de dos hojas. Opción para vidrio simple o laminado.',
    source: 'DELTA-PLUS.pdf · página 31',
    rules: [
      { part: 'Umbral y dintel', code: '1020651', qty: 2, formula: 'A - 42', angle: '90° / 90°' },
      { part: 'Jamba', code: '1020655', qty: 2, formula: 'H', angle: '90° / 90°' },
      { part: 'Parante lateral', code: '1020653', qty: 2, formula: 'H - 79', angle: '90° / 90°' },
      { part: 'Parante central', code: '1020654', qty: 1, formula: 'H - 79', angle: '90° / 90°' },
      { part: 'Parante central con tirador', code: '1020677', qty: 1, formula: 'H - 79', angle: '90° / 90°' },
      { part: 'Zócalo', code: '1020652', qty: 2, formula: 'A / 2 - 24', angle: '90° / 90°' },
      { part: 'Zócalo alto', code: '1020660', qty: 2, formula: 'A / 2 - 24', angle: '90° / 90°' }
    ],
    mosquitoRules: [
      { part: 'Mosquitero horizontal', code: '1020685', qty: 2, formula: 'A / 2 - 7', angle: '45° / 45°' },
      { part: 'Mosquitero vertical', code: '1020685', qty: 2, formula: 'H - 88', angle: '45° / 45°' },
      { part: 'Tope mosquitero', code: '1020708', qty: 2, formula: 'H - 100', angle: '90° / 90°' }
    ]
  }
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel de taller', icon: '▦' },
  { id: 'jobs', label: 'Trabajos', icon: '▤' },
  { id: 'new', label: 'Nuevo trabajo', icon: '+' },
  { id: 'cuts', label: 'Planos de corte', icon: '⌁' },
  { id: 'leftovers', label: 'Banco de sobrantes', icon: '♻' },
  { id: 'profiles', label: 'Perfiles y stock', icon: '▥' }
];

function createEmptyDB() {
  const stock = {};
  Object.keys(PROFILES).forEach(code => { stock[code] = 0; });
  return {
    version: 1,
    jobs: [],
    leftovers: [],
    stock,
    settings: { kerf: 3, minRecover: 500 },
    sequence: 1
  };
}

let DB = createEmptyDB();
let currentView = 'dashboard';
let activeJobId = null;
let jobSearch = '';
let leftoverSearch = '';
let toastTimer = null;

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1 && Array.isArray(parsed.jobs) && Array.isArray(parsed.leftovers)) {
      DB = { ...createEmptyDB(), ...parsed };
      DB.stock = { ...createEmptyDB().stock, ...(parsed.stock || {}) };
      DB.settings = { ...createEmptyDB().settings, ...(parsed.settings || {}) };
      DB.sequence = Number(parsed.sequence) || 1;
    }
  } catch (error) {
    console.error('No se pudieron cargar los datos guardados:', error);
  }
}

function saveDB() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
    return true;
  } catch (error) {
    console.error('No se pudieron guardar los datos:', error);
    notify('No se pudieron guardar los datos. Revisá el espacio disponible del navegador.', 'error');
    return false;
  }
}

function notify(message, type = 'success') {
  let host = $('#toastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  host.innerHTML = `<div class="toast-message ${type === 'error' ? 'toast-error' : ''}">${esc(message)}</div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { host.innerHTML = ''; }, 3200);
}

/* Evaluador matemático controlado: admite A, H, números, + - * / y paréntesis.
   No ejecuta código, no usa eval() ni new Function(). */
function evaluateFormula(expression, values) {
  const input = String(expression).replace(/,/g, '.');
  const tokens = [];
  const tokenPattern = /\s*([AH]|\d+(?:\.\d+)?|[()+\-*/])\s*/gy;
  let position = 0;
  while (position < input.length) {
    tokenPattern.lastIndex = position;
    const match = tokenPattern.exec(input);
    if (!match) throw new Error(`Fórmula no reconocida: ${expression}`);
    tokens.push(match[1]);
    position = tokenPattern.lastIndex;
  }
  let index = 0;
  const peek = () => tokens[index];
  const consume = () => tokens[index++];
  const parsePrimary = () => {
    const token = consume();
    if (token === '(') {
      const value = parseExpression();
      if (consume() !== ')') throw new Error('Falta cerrar un paréntesis en la fórmula.');
      return value;
    }
    if (token === 'A') return Number(values.A);
    if (token === 'H') return Number(values.H);
    if (token !== undefined && /^\d+(?:\.\d+)?$/.test(token)) return Number(token);
    throw new Error(`Elemento inesperado en fórmula: ${token ?? 'fin'}`);
  };
  const parseUnary = () => {
    if (peek() === '+') { consume(); return parseUnary(); }
    if (peek() === '-') { consume(); return -parseUnary(); }
    return parsePrimary();
  };
  const parseTerm = () => {
    let value = parseUnary();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const next = parseUnary();
      if (op === '/' && next === 0) throw new Error('División por cero en la fórmula.');
      value = op === '*' ? value * next : value / next;
    }
    return value;
  };
  const parseExpression = () => {
    let value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const next = parseTerm();
      value = op === '+' ? value + next : value - next;
    }
    return value;
  };
  const result = parseExpression();
  if (index !== tokens.length || !Number.isFinite(result)) throw new Error(`No se pudo resolver la fórmula: ${expression}`);
  return Math.round(result);
}

function generatePieces(modelId, width, height, includeMosquito) {
  const model = MODELS[modelId];
  if (!model) throw new Error('Seleccioná una tipología válida.');
  const rules = includeMosquito ? [...model.rules, ...model.mosquitoRules] : model.rules;
  const pieces = [];
  for (const rule of rules) {
    if (!PROFILES[rule.code]) throw new Error(`No existe el perfil ${rule.code}.`);
    const length = evaluateFormula(rule.formula, { A: width, H: height });
    if (length <= 0) throw new Error(`La fórmula ${rule.formula} de «${rule.part}» dio una medida no válida (${length} mm). Revisá ancho y alto.`);
    if (length > 12000) throw new Error(`La pieza «${rule.part}» supera 12.000 mm. Revisá las medidas ingresadas.`);
    for (let i = 0; i < rule.qty; i++) {
      pieces.push({
        id: uid(), part: rule.part, code: rule.code,
        length, formula: rule.formula, angle: rule.angle
      });
    }
  }
  return pieces;
}

function remainingFor(bar) {
  const totalCuts = bar.cuts.reduce((sum, cut) => sum + cut.length, 0);
  const kerfUsed = Math.max(0, bar.cuts.length - 1) * bar.kerf;
  return bar.totalLength - totalCuts - kerfUsed;
}

function canPlace(bar, piece) {
  const extraKerf = bar.cuts.length ? bar.kerf : 0;
  return remainingFor(bar) >= piece.length + extraKerf;
}

function placePiece(bar, piece) {
  const kerfBefore = bar.cuts.length ? bar.kerf : 0;
  bar.cuts.push({ ...piece, kerfBefore });
  bar.remaining = remainingFor(bar);
}

function optimizeProfileCuts(code, pieces, availableLeftovers, kerf) {
  const profile = PROFILES[code];
  const leftoverBars = availableLeftovers
    .filter(item => item.code === code && item.state === 'Disponible')
    .map(item => ({
      id: `left-${item.id}`, source: 'sobrante', sourceLeftId: item.id,
      label: `Sobrante #${item.id}`, totalLength: item.length,
      kerf, cuts: [], remaining: item.length
    }));

  // Best-Fit Decreasing sobre sobrantes existentes: primero se busca el rezago
  // que deje el remanente más pequeño sin desperdiciar ninguna pieza.
  const sortedPieces = [...pieces].sort((a, b) => b.length - a.length);
  const notPlaced = [];
  for (const piece of sortedPieces) {
    const candidates = leftoverBars
      .filter(bar => canPlace(bar, piece))
      .sort((a, b) => (remainingFor(a) - piece.length - (a.cuts.length ? kerf : 0)) -
                      (remainingFor(b) - piece.length - (b.cuts.length ? kerf : 0)));
    if (candidates.length) placePiece(candidates[0], piece);
    else notPlaced.push(piece);
  }

  // Después se optimizan barras comerciales nuevas con Best-Fit Decreasing.
  const newBars = [];
  for (const piece of notPlaced) {
    const candidates = newBars.filter(bar => canPlace(bar, piece));
    if (candidates.length) {
      candidates.sort((a, b) => (remainingFor(a) - piece.length - (a.cuts.length ? kerf : 0)) -
                                 (remainingFor(b) - piece.length - (b.cuts.length ? kerf : 0)));
      placePiece(candidates[0], piece);
    } else {
      const bar = {
        id: uid(), source: 'nueva', sourceLeftId: null,
        label: `Barra comercial · ${profile.bar} mm`,
        totalLength: profile.bar, kerf, cuts: [], remaining: profile.bar
      };
      placePiece(bar, piece);
      newBars.push(bar);
    }
  }

  const usedLeftovers = leftoverBars.filter(bar => bar.cuts.length > 0);
  const bars = [...usedLeftovers, ...newBars].map(bar => ({
    ...bar,
    remaining: Math.max(0, remainingFor(bar))
  }));
  const cutLength = pieces.reduce((sum, piece) => sum + piece.length, 0);
  const totalInput = bars.reduce((sum, bar) => sum + bar.totalLength, 0);
  const waste = bars.reduce((sum, bar) => sum + bar.remaining, 0);
  const recoveredPotential = bars.filter(bar => bar.remaining >= DB.settings.minRecover).length;
  return {
    code, profile, bars, cutLength, newBars: newBars.length,
    usedLeftovers: usedLeftovers.map(bar => bar.sourceLeftId),
    totalInput, waste, recoveredPotential
  };
}

function calculatePlan(modelId, width, height, includeMosquito, finish) {
  const pieces = generatePieces(modelId, width, height, includeMosquito);
  const grouped = {};
  pieces.forEach(piece => { (grouped[piece.code] ||= []).push(piece); });
  const groups = Object.entries(grouped).map(([code, groupPieces]) =>
    optimizeProfileCuts(code, groupPieces, DB.leftovers.filter(item => item.state === 'Disponible' && item.finish === finish), Number(DB.settings.kerf) || 0)
  );
  const totalCutLength = pieces.reduce((sum, piece) => sum + piece.length, 0);
  const totalInput = groups.reduce((sum, group) => sum + group.totalInput, 0);
  const totalNewBars = groups.reduce((sum, group) => sum + group.newBars, 0);
  const totalUsedLeftovers = groups.reduce((sum, group) => sum + group.usedLeftovers.length, 0);
  const theoreticalRemainders = groups.flatMap(group => group.bars
    .filter(bar => bar.remaining >= Number(DB.settings.minRecover))
    .map(bar => ({
      code: group.code, length: bar.remaining, source: bar.source,
      sourceLeftId: bar.sourceLeftId, barId: bar.id
    })));
  const scrap = groups.reduce((sum, group) => sum + group.bars
    .filter(bar => bar.remaining < Number(DB.settings.minRecover))
    .reduce((sub, bar) => sub + bar.remaining, 0), 0);
  const weightKg = groups.reduce((sum, group) => sum + group.cutLength * group.profile.kg / 1000, 0);
  const efficiency = totalInput > 0 ? Math.min(100, totalCutLength / totalInput * 100) : 0;
  return {
    pieces, groups, totalCutLength, totalNewBars, totalUsedLeftovers,
    totalInput, theoreticalRemainders, scrap, weightKg, efficiency
  };
}

function availableStockSummary(plan) {
  return plan.groups.map(group => {
    const stock = Number(DB.stock[group.code] || 0);
    const reserved = Math.min(stock, group.newBars);
    return { code: group.code, needed: group.newBars, stock, reserved, missing: group.newBars - reserved };
  }).filter(item => item.needed > 0);
}

function currentFinish() {
  return $('#finishSelect')?.value || 'Aluminio natural';
}

function settingValues() {
  return {
    kerf: Math.max(0, Number($('#kerfSetting')?.value ?? DB.settings.kerf) || 0),
    minRecover: Math.max(0, Number($('#recoverSetting')?.value ?? DB.settings.minRecover) || 0)
  };
}

function syncSettings() {
  DB.settings = settingValues();
  saveDB();
  if (currentView === 'new') previewDraft();
  else if (currentView === 'job' && activeJobId) renderJobDetail(activeJobId);
}

function renderNavigation() {
  $('#nav').innerHTML = NAV_ITEMS.map(item => `
    <button type="button" class="nav-link ${currentView === item.id ? 'active' : ''}" data-view="${item.id}">
      <span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>
    </button>`).join('');
}

function go(view) {
  currentView = view;
  activeJobId = null;
  renderNavigation();
  const item = NAV_ITEMS.find(nav => nav.id === view);
  $('#title').textContent = item?.label || 'Trabajo';
  $('#side').classList.remove('open');
  const renderers = {
    dashboard: renderDashboard,
    jobs: renderJobs,
    new: renderNewJob,
    cuts: renderCuts,
    leftovers: renderLeftovers,
    profiles: renderProfiles
  };
  $('#view').innerHTML = (renderers[view] || renderDashboard)();
  if (view === 'new') previewDraft();
}

function openJob(id) {
  activeJobId = id;
  currentView = 'job';
  renderNavigation();
  $('#title').textContent = 'Detalle del trabajo';
  $('#side').classList.remove('open');
  renderJobDetail(id);
}

function renderDashboard() {
  const activeJobs = DB.jobs.filter(job => job.status !== 'Terminado').length;
  const available = DB.leftovers.filter(item => item.state === 'Disponible');
  const availableMeters = available.reduce((sum, item) => sum + item.length, 0) / 1000;
  const totalBars = Object.values(DB.stock).reduce((sum, amount) => sum + Number(amount || 0), 0);
  const stat = (icon, value, label) => `
    <div class="stat-card"><div class="stat-icon">${icon}</div><div><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div></div>`;
  const latest = [...DB.jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  return `
    <div class="page-heading"><div><h2>Resumen del taller</h2><p>Trabajos, cortes y material disponible en un solo lugar.</p></div>
      <div class="heading-actions"><button class="button" type="button" onclick="go('new')">＋ Nuevo trabajo</button></div></div>
    <div class="notice warning"><div>ⓘ</div><div><strong>Fórmulas iniciales Delta Plus.</strong> Se cargó la corrediza de 2 hojas para ventana y puerta (vidrio simple o laminado), tomada del manual técnico, página 31. El fabricante indica verificar las medidas con un prototipo antes de producir en serie.</div></div>
    <div class="grid stats-grid" style="margin-top:15px">
      ${stat('▤', DB.jobs.length, 'Trabajos registrados')}
      ${stat('⚙', activeJobs, 'Trabajos pendientes / en producción')}
      ${stat('♻', available.length, 'Sobrantes disponibles')}
      ${stat('▥', totalBars, 'Barras registradas en stock')}
    </div>
    <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(250px,.8fr);align-items:start">
      <section class="panel"><div class="panel-head"><div><h3>Últimos trabajos</h3><p>Accedé al detalle y al plano de corte.</p></div><button class="button button-outline button-small" onclick="go('jobs')">Ver todos</button></div>
        ${latest.length ? jobTable(latest) : emptyState('Todavía no hay trabajos','Creá el primer trabajo para generar su lista de piezas y el plano de corte.','＋ Nuevo trabajo',"go('new')")}
      </section>
      <section class="panel"><div class="panel-head"><div><h3>Material recuperable</h3><p>Sobrantes que pueden reutilizarse.</p></div></div>
        <div class="mini-stat"><b>${availableMeters.toFixed(2).replace('.', ',')} m</b><span>Longitud total disponible</span></div>
        <div class="mini-stat" style="margin-top:9px"><b>${DB.leftovers.filter(item => item.state === 'Reservado').length}</b><span>Sobrantes reservados en trabajos</span></div>
        <button class="button button-outline" style="width:100%;margin-top:12px" onclick="go('leftovers')">Consultar banco de sobrantes</button>
      </section>
    </div>
    <div class="panel"><div class="panel-head"><div><h3>Cómo funciona</h3><p>El flujo de fabricación está centrado en el despiece.</p></div></div>
      <div class="grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">
        ${stepCard('01','Trabajo','Producto, tipo de abertura y medidas.')}
        ${stepCard('02','Despiece','Fórmulas técnicas y piezas a cortar.')}
        ${stepCard('03','Optimización','Sobrantes primero y barras nuevas después.')}
        ${stepCard('04','Confirmación','Medir y registrar los sobrantes reales.')}
      </div>
    </div>`;
}

function stepCard(number, title, description) {
  return `<div class="step-card"><span>${number}</span><strong>${title}</strong><small>${description}</small></div>`;
}

function emptyState(title, description, buttonLabel, action) {
  return `<div class="empty-state"><div class="empty-icon">⌁</div><h3>${esc(title)}</h3><p>${esc(description)}</p>${buttonLabel ? `<button type="button" class="button button-outline button-small" onclick="${action}">${esc(buttonLabel)}</button>` : ''}</div>`;
}

function statusBadge(status) {
  const classes = { 'Pendiente': 'pending', 'En producción': 'production', 'Terminado': 'done' };
  return `<span class="badge ${classes[status] || 'pending'}">${esc(status)}</span>`;
}

function jobTable(jobs) {
  return `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>N.º trabajo</th><th>Producto / subtítulo</th><th>Tipología</th><th>Medidas</th><th>Fecha</th><th>Estado</th><th></th></tr></thead>
    <tbody>${jobs.map(job => `
      <tr>
        <td><strong class="mono">${esc(job.number)}</strong></td>
        <td><strong>${esc(job.product)}</strong>${job.subtitle ? `<small class="table-subtitle">${esc(job.subtitle)}</small>` : ''}<small class="table-subtitle">${esc(job.client || 'Sin cliente / obra')}</small></td>
        <td>${esc(MODELS[job.modelId]?.name || '—')}</td>
        <td class="mono">${job.width} × ${job.height} mm</td>
        <td class="mono">${esc(job.date)}</td>
        <td>${statusBadge(job.status)}</td>
        <td><button class="button button-outline button-small" onclick="openJob('${job.id}')">Abrir</button></td>
      </tr>`).join('')}</tbody>
  </table></div>`;
}

function renderJobs() {
  const filtered = DB.jobs.filter(job => [job.number, job.product, job.subtitle, job.client, MODELS[job.modelId]?.name].join(' ').toLowerCase().includes(jobSearch.toLowerCase()));
  return `
    <div class="page-heading"><div><h2>Trabajos registrados</h2><p>Consultá órdenes, estados, medidas y planos de corte.</p></div><div class="heading-actions"><button class="button" onclick="go('new')">＋ Crear trabajo</button></div></div>
    <div class="panel"><div class="panel-head"><div><h3>Listado de fabricación</h3><p>${DB.jobs.length} trabajo(s) guardado(s).</p></div><input class="search-input" placeholder="Buscar trabajo, cliente o tipología…" value="${esc(jobSearch)}" oninput="filterJobs(this.value)"></div>
      ${filtered.length ? jobTable(filtered) : emptyState(DB.jobs.length ? 'No hay resultados' : 'No hay trabajos todavía', DB.jobs.length ? 'Probá con otro término de búsqueda.' : 'Al crear un trabajo, aparecerá en este listado.','＋ Nuevo trabajo',"go('new')")}
    </div>`;
}

function filterJobs(value) {
  jobSearch = value;
  const input = $('.search-input');
  const panel = input?.closest('.panel');
  if (!panel) return;
  const filtered = DB.jobs.filter(job => [job.number, job.product, job.subtitle, job.client, MODELS[job.modelId]?.name].join(' ').toLowerCase().includes(jobSearch.toLowerCase()));
  const old = $('.table-wrap, .empty-state', panel);
  if (old) old.outerHTML = filtered.length ? jobTable(filtered) : emptyState('No hay resultados', 'Probá con otro término de búsqueda.');
  const newInput = $('.search-input', panel);
  if (newInput) { newInput.focus(); newInput.setSelectionRange(value.length, value.length); }
}

function renderNewJob() {
  const options = Object.values(MODELS).map(model => `<option value="${model.id}">${esc(model.name)}</option>`).join('');
  return `
    <div class="page-heading"><div><h2>Nuevo trabajo</h2><p>Ingresá las medidas y obtené el despiece antes de guardar la orden.</p></div></div>
    <div class="notice warning" style="margin-bottom:14px"><div>ⓘ</div><div><strong>Alcance de esta versión:</strong> las reglas cargadas corresponden a ventana y puerta corrediza de 2 hojas, con vidrio simple o laminado. Las tipologías que no están documentadas todavía no se ofrecen para calcular.</div></div>
    <div class="form-layout">
      <section class="panel">
        <div class="panel-head"><div><h3>Datos del trabajo</h3><p>Medidas expresadas en milímetros.</p></div></div>
        <form id="jobForm" onsubmit="event.preventDefault(); saveNewJob();">
          <div class="form-grid">
            <div class="field full"><label for="clientInput">Cliente / obra (opcional)</label><input id="clientInput" maxlength="100" placeholder="Nombre del cliente o de la obra"></div>
            <div class="field full"><label for="productInput">Producto a fabricar *</label><input id="productInput" required maxlength="100" placeholder="Ej.: Ventana del living"></div>
            <div class="field full"><label for="subtitleInput">Subtítulo / identificación</label><input id="subtitleInput" maxlength="100" placeholder="Ej.: Cara E · Planta baja"></div>
            <div class="field full"><label for="modelSelect">Tipología técnica *</label><select id="modelSelect" onchange="previewDraft()">${options}</select><small class="field-help" id="modelDescription">${esc(MODELS.window2.description)}</small></div>
            <div class="field"><label for="widthInput">Ancho total (A) *</label><input id="widthInput" type="number" min="100" max="10000" step="1" value="1500" required oninput="previewDraft()"></div>
            <div class="field"><label for="heightInput">Alto total (H) *</label><input id="heightInput" type="number" min="100" max="10000" step="1" value="1200" required oninput="previewDraft()"></div>
            <div class="field full"><label for="finishSelect">Acabado del perfil *</label><select id="finishSelect" onchange="previewDraft()">
              <option>Aluminio natural</option><option>Blanco</option><option>Negro</option><option>Bronce</option><option>Otro / personalizado</option>
            </select><small class="field-help">Los sobrantes solo se ofrecen para reutilizar cuando coinciden la línea, el perfil y el acabado.</small></div>
            <div class="field full"><div class="check-row"><input id="mosquitoInput" type="checkbox" onchange="previewDraft()"><div><strong>Incluir mosquitero</strong><small>Agrega los cortes del perfil 685 y los topes 708, según la tabla del manual.</small></div></div></div>
            <div class="field"><label for="dateInput">Fecha del trabajo</label><input id="dateInput" type="date" value="${today()}"></div>
            <div class="field"><label for="notesInput">Observaciones</label><input id="notesInput" maxlength="180" placeholder="Vidrio, herrajes, aclaraciones…"></div>
          </div>
          <div class="form-actions"><button class="button" type="submit">Guardar trabajo y reservar material</button><button class="button button-quiet" type="button" onclick="go('jobs')">Cancelar</button></div>
        </form>
      </section>
      <section class="panel" id="newPreview"><div class="empty-state"><div class="empty-icon">⌁</div><h3>Vista previa del despiece</h3><p>Ingresá las medidas para calcular las piezas, revisar el aprovechamiento de sobrantes y conocer cuántas barras nuevas se necesitan.</p></div></section>
    </div>`;
}

function readDraft() {
  return {
    client: $('#clientInput')?.value.trim() || '',
    product: $('#productInput')?.value.trim() || '',
    subtitle: $('#subtitleInput')?.value.trim() || '',
    modelId: $('#modelSelect')?.value || 'window2',
    width: Number($('#widthInput')?.value),
    height: Number($('#heightInput')?.value),
    finish: $('#finishSelect')?.value || 'Aluminio natural',
    includeMosquito: Boolean($('#mosquitoInput')?.checked),
    date: $('#dateInput')?.value || today(),
    notes: $('#notesInput')?.value.trim() || ''
  };
}

function validateDraft(draft) {
  if (!draft.product) return 'Ingresá el nombre del producto.';
  if (!Number.isFinite(draft.width) || draft.width < 100 || draft.width > 10000) return 'El ancho debe estar entre 100 y 10.000 mm.';
  if (!Number.isFinite(draft.height) || draft.height < 100 || draft.height > 10000) return 'El alto debe estar entre 100 y 10.000 mm.';
  if (!MODELS[draft.modelId]) return 'Seleccioná una tipología válida.';
  return '';
}

function previewDraft() {
  const host = $('#newPreview');
  if (!host) return;
  const draft = readDraft();
  const model = MODELS[draft.modelId];
  $('#modelDescription').textContent = model.description;
  const error = validateDraft({ ...draft, product: draft.product || 'Vista previa' });
  if (error) {
    host.innerHTML = `<div class="panel-head"><div><h3>Vista previa del despiece</h3><p>Corregí los datos para calcular.</p></div></div><div class="notice warning">${esc(error)}</div>`;
    return;
  }
  try {
    const plan = calculatePlan(draft.modelId, draft.width, draft.height, draft.includeMosquito, draft.finish);
    host.innerHTML = `
      <div class="panel-head"><div><h3>Vista previa del despiece</h3><p>${esc(model.name)} · ${draft.width} × ${draft.height} mm</p></div><span class="badge production">Cálculo preliminar</span></div>
      ${renderPlanSummary(plan)}
      ${renderStockAlert(plan)}
      ${renderCutGroups(plan)}
      <div class="notice" style="margin-top:12px"><div>ⓘ</div><div>Vista previa. El material no se reserva hasta guardar el trabajo. La longitud de sobrante es estimada y se debe medir al terminar de cortar.</div></div>`;
  } catch (error) {
    host.innerHTML = `<div class="notice danger">${esc(error.message)}</div>`;
  }
}

function renderPlanSummary(plan) {
  const barCount = plan.totalNewBars + plan.totalUsedLeftovers;
  return `<div class="preview-summary">
    <div class="mini-stat"><b>${plan.pieces.length}</b><span>Piezas a cortar</span></div>
    <div class="mini-stat"><b>${barCount}</b><span>Barras / sobrantes usados</span></div>
    <div class="mini-stat"><b>${plan.efficiency.toFixed(1).replace('.', ',')}%</b><span>Aprovechamiento lineal</span></div>
  </div>
  <div class="plan-kpis"><span>Longitud de piezas: <strong>${mm(plan.totalCutLength)}</strong></span><span>Peso teórico de piezas: <strong>${plan.weightKg.toFixed(2).replace('.', ',')} kg</strong></span><span>Sobrantes potenciales: <strong>${plan.theoreticalRemainders.length}</strong></span></div>`;
}

function renderStockAlert(plan) {
  const stock = availableStockSummary(plan);
  if (!stock.length) return '<div class="notice success">Las piezas se pueden obtener de los sobrantes existentes. No se requieren barras nuevas para este cálculo.</div>';
  const shortages = stock.filter(item => item.missing > 0);
  if (!shortages.length) return '<div class="notice success">El stock registrado alcanza para cubrir las barras nuevas calculadas.</div>';
  return `<div class="notice warning"><div>!</div><div><strong>Revisar disponibilidad de barras.</strong><br>${shortages.map(item => `${esc(PROFILES[item.code].name)}: necesita ${item.needed}, stock registrado ${item.stock}, faltan ${item.missing}.`).join('<br>')}<br><small>Podés guardar el trabajo; quedará indicada la cantidad pendiente de compra.</small></div></div>`;
}

function groupPiecesForTable(pieces) {
  const map = new Map();
  for (const piece of pieces) {
    const key = [piece.part, piece.code, piece.length, piece.angle, piece.formula].join('|');
    const current = map.get(key);
    if (current) current.qty++;
    else map.set(key, { ...piece, qty: 1 });
  }
  return [...map.values()];
}

function renderCutGroups(plan) {
  return plan.groups.map(group => {
    const list = groupPiecesForTable(plan.pieces.filter(piece => piece.code === group.code));
    return `<div class="cut-group">
      <div class="cut-group-head"><div><span class="code">${group.code}</span> <strong>${esc(group.profile.name)}</strong></div><small>${group.profile.bar.toLocaleString('es-AR')} mm por barra</small></div>
      <div class="table-wrap"><table class="data-table compact-table"><thead><tr><th>Pieza</th><th>Cant.</th><th>Fórmula</th><th>Largo</th><th>Ángulos</th></tr></thead><tbody>
        ${list.map(piece => `<tr><td>${esc(piece.part)}</td><td class="mono">${piece.qty}</td><td><span class="formula">${esc(piece.formula)}</span></td><td class="mono"><strong>${mm(piece.length)}</strong></td><td class="mono">${esc(piece.angle)}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="bar-list">${group.bars.map((bar, index) => renderCutBar(bar, group.profile, index + 1)).join('')}</div>
    </div>`;
  }).join('');
}

function renderCutBar(bar, profile, index) {
  const width = 1000;
  const y = 13;
  const h = 34;
  let x = 0;
  let shapes = '';
  const palette = ['#1677b8', '#28547b', '#3e7399', '#51677f', '#19836b', '#6c85a0'];
  bar.cuts.forEach((piece, pieceIndex) => {
    if (piece.kerfBefore > 0) {
      const kerfWidth = Math.max(1.2, piece.kerfBefore / bar.totalLength * width);
      shapes += `<rect x="${x.toFixed(2)}" y="${y}" width="${kerfWidth.toFixed(2)}" height="${h}" fill="#e34c4c"><title>Disco: ${piece.kerfBefore} mm</title></rect>`;
      x += kerfWidth;
    }
    const segmentWidth = piece.length / bar.totalLength * width;
    shapes += `<rect x="${x.toFixed(2)}" y="${y}" width="${Math.max(0, segmentWidth).toFixed(2)}" height="${h}" rx="2" fill="${palette[pieceIndex % palette.length]}" stroke="#fff" stroke-width="1"><title>${esc(piece.part)} · ${piece.length} mm · ${esc(piece.angle)}</title></rect>`;
    if (segmentWidth > 74) {
      shapes += `<text x="${(x + segmentWidth / 2).toFixed(2)}" y="${y + 14}" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">${esc(piece.part.slice(0, 17))}</text>`;
      shapes += `<text x="${(x + segmentWidth / 2).toFixed(2)}" y="${y + 27}" text-anchor="middle" fill="#eaf6ff" font-size="9" font-family="monospace">${piece.length} mm</text>`;
    } else if (segmentWidth > 26) {
      shapes += `<text x="${(x + segmentWidth / 2).toFixed(2)}" y="${y + 21}" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">${piece.length}</text>`;
    }
    x += segmentWidth;
  });
  const remWidth = Math.max(0, bar.remaining / bar.totalLength * width);
  if (remWidth > 0.1) {
    const fill = bar.remaining >= Number(DB.settings.minRecover) ? '#cceedd' : '#e6eaf0';
    const stroke = bar.remaining >= Number(DB.settings.minRecover) ? '#16845b' : '#aab4c1';
    shapes += `<rect x="${x.toFixed(2)}" y="${y}" width="${remWidth.toFixed(2)}" height="${h}" rx="2" fill="${fill}" stroke="${stroke}" stroke-dasharray="4 3"><title>Sobrante previsto: ${Math.round(bar.remaining)} mm</title></rect>`;
    if (remWidth > 65) shapes += `<text x="${(x + remWidth / 2).toFixed(2)}" y="${y + 21}" text-anchor="middle" fill="#315c4b" font-size="10" font-weight="700">${Math.round(bar.remaining)} mm libres</text>`;
  }
  const sourceLabel = bar.source === 'sobrante' ? `Sobrante #${bar.sourceLeftId}` : `Barra nueva ${profile.bar} mm`;
  const remClass = bar.remaining >= Number(DB.settings.minRecover) ? 'rem-good' : 'rem-scrap';
  return `<div class="bar-row">
    <div class="bar-row-head"><span><strong>${esc(sourceLabel)}</strong><small>${bar.cuts.length} corte(s)</small></span><span class="${remClass}">${Math.round(bar.remaining)} mm ${bar.remaining >= Number(DB.settings.minRecover) ? 'recuperables (estimado)' : 'de descarte / ajuste'}</span></div>
    <svg class="cad-track" viewBox="0 0 ${width} 63" role="img" aria-label="Plano de corte: ${esc(sourceLabel)}">
      <rect x="0" y="${y}" width="${width}" height="${h}" rx="3" fill="#f0f3f7" stroke="#aab7c6"/>
      ${shapes}
      <text x="0" y="60" fill="#77869a" font-size="9">0</text><text x="${width}" y="60" text-anchor="end" fill="#77869a" font-size="9">${bar.totalLength} mm</text>
    </svg>
  </div>`;
}

function saveNewJob() {
  const draft = readDraft();
  const error = validateDraft(draft);
  if (error) return notify(error, 'error');
  let plan;
  try { plan = calculatePlan(draft.modelId, draft.width, draft.height, draft.includeMosquito, draft.finish); }
  catch (calculationError) { return notify(calculationError.message, 'error'); }

  const shortages = availableStockSummary(plan).filter(item => item.missing > 0);
  if (shortages.length) {
    const lines = shortages.map(item => `${PROFILES[item.code].shortCode}: faltan ${item.missing} barra(s)`).join('\n');
    if (!confirm(`El stock registrado no alcanza para todas las barras nuevas.\n\n${lines}\n\nSe guardará el trabajo y se indicará la compra pendiente. ¿Continuar?`)) return;
  }

  const sequence = DB.sequence++;
  const number = `JA-${String(sequence).padStart(4, '0')}`;
  const id = uid();
  const reservations = availableStockSummary(plan).map(item => ({ code: item.code, count: item.reserved }));
  const missing = availableStockSummary(plan).filter(item => item.missing > 0).map(item => ({ code: item.code, count: item.missing }));
  const usedLeftIds = plan.groups.flatMap(group => group.usedLeftovers);

  const job = {
    id, number, ...draft,
    status: 'Pendiente', createdAt: new Date().toISOString(),
    plan, reservedBars: reservations, missingBars: missing,
    usedLeftoverIds: usedLeftIds, completedAt: null, actualLeftoverIds: []
  };

  usedLeftIds.forEach(leftId => {
    const item = DB.leftovers.find(left => left.id === leftId);
    if (item) { item.state = 'Reservado'; item.reservedBy = id; }
  });
  reservations.forEach(item => {
    DB.stock[item.code] = Math.max(0, Number(DB.stock[item.code] || 0) - item.count);
  });
  DB.jobs.push(job);
  saveDB();
  openJob(job.id);
  notify(`Trabajo ${number} guardado. Revisá el plano de corte.`);
}

function renderCuts() {
  const jobs = [...DB.jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return `<div class="page-heading"><div><h2>Planos de corte</h2><p>Elegí un trabajo para consultar la distribución de piezas por barra.</p></div><div class="heading-actions"><button class="button" onclick="go('new')">＋ Nuevo trabajo</button></div></div>
    <div class="panel"><div class="panel-head"><div><h3>Órdenes con despiece calculado</h3><p>Los planos se guardan junto con cada trabajo.</p></div></div>
      ${jobs.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Trabajo</th><th>Producto</th><th>Tipología</th><th>Cortes</th><th>Barras nuevas</th><th>Sobrantes usados</th><th></th></tr></thead><tbody>
        ${jobs.map(job => `<tr><td class="mono"><strong>${esc(job.number)}</strong></td><td>${esc(job.product)}</td><td>${esc(MODELS[job.modelId]?.name || '')}</td><td>${job.plan.pieces.length}</td><td>${job.plan.totalNewBars}</td><td>${job.plan.totalUsedLeftovers}</td><td><button class="button button-outline button-small" onclick="openJob('${job.id}')">Ver plano</button></td></tr>`).join('')}
      </tbody></table></div>` : emptyState('Todavía no hay planos','Primero creá un trabajo para generar su despiece.','＋ Nuevo trabajo',"go('new')")}
    </div>`;
}

function renderJobDetail(id) {
  const job = DB.jobs.find(item => item.id === id);
  if (!job) { go('jobs'); return; }
  const model = MODELS[job.modelId];
  const shortages = job.missingBars || [];
  $('#view').innerHTML = `
    <div class="page-heading"><div><h2>Detalle del trabajo</h2><p>Información de fabricación y optimización de material.</p></div><div class="heading-actions"><button class="button button-quiet" onclick="go('jobs')">← Volver a trabajos</button></div></div>
    <div class="detail-top">
      <div><h2 class="detail-title">${esc(job.number)} · ${esc(job.product)}</h2>
        <div class="detail-meta">${esc(job.subtitle || 'Sin subtítulo')} · ${esc(job.client || 'Sin cliente / obra')}<br>${esc(model?.name || '')} · ${job.width} × ${job.height} mm · ${esc(job.finish)} · ${esc(job.date)}</div>
        ${job.notes ? `<div class="detail-meta">Observaciones: ${esc(job.notes)}</div>` : ''}
      </div>
      <div class="detail-actions">${statusBadge(job.status)}
        ${job.status !== 'Terminado' ? `${(job.missingBars || []).length ? `<button class="button button-outline button-small" onclick="reserveMissingStock('${job.id}')">Actualizar reserva de stock</button>` : ''}<button class="button button-outline button-small" onclick="setJobStatus('${job.id}','En producción')">Pasar a producción</button><button class="button button-success button-small" onclick="openFinishDialog('${job.id}')">Finalizar y confirmar sobrantes</button><button class="button button-outline button-small" onclick="deleteJob('${job.id}')">Cancelar trabajo</button>` : '<span class="badge done">Sobrantes confirmados</span>'}
      </div>
    </div>
    ${shortages.length ? `<div class="notice warning" style="margin-top:12px"><div>!</div><div><strong>Barras pendientes de compra:</strong> ${shortages.map(item => `${esc(PROFILES[item.code].name)}: ${item.count}`).join(' · ')}. El stock registrado no alcanzó al reservar este trabajo.</div></div>` : ''}
    ${job.status === 'Terminado' ? `<div class="notice success" style="margin-top:12px">Trabajo finalizado el ${esc(job.completedAt ? job.completedAt.slice(0,10) : '')}. Los sobrantes reales confirmados ya se encuentran en el banco de inventario.</div>` : `<div class="notice warning" style="margin-top:12px">Los sobrantes del plano son estimados. Al terminar, medí los recortes en el taller y confirmá sus longitudes para incorporarlos al inventario.</div>`}
    <div class="panel" style="margin-top:14px"><div class="panel-head"><div><h3>Resumen de fabricación</h3><p>Valores calculados en milímetros, antes de la validación física.</p></div></div>${renderPlanSummary(job.plan)}</div>
    <div class="panel"><div class="panel-head"><div><h3>Lista de cortes y planos por perfil</h3><p>Incluye los ángulos y la distribución propuesta en cada barra.</p></div></div>${renderCutGroups(job.plan)}</div>
    <div class="panel"><div class="panel-head"><div><h3>Datos técnicos aplicados</h3><p>Origen de las reglas utilizadas.</p></div></div>
      <div class="source-grid"><div><strong>Fórmulas</strong><span>Manual técnico Delta Plus · página 31</span></div><div><strong>Perfiles y largos</strong><span>Catálogo Delta Plus 2023 · páginas 4 a 7 y detalles 9 a 10</span></div><div><strong>Disco de sierra</strong><span>${DB.settings.kerf} mm entre cortes consecutivos</span></div><div><strong>Recupero mínimo</strong><span>${DB.settings.minRecover} mm (configurable)</span></div></div>
    </div>`;
}

function setJobStatus(id, status) {
  const job = DB.jobs.find(item => item.id === id);
  if (!job || job.status === 'Terminado') return;
  job.status = status;
  saveDB();
  renderJobDetail(id);
  notify(`Estado actualizado: ${status}.`);
}

function openFinishDialog(jobId) {
  const job = DB.jobs.find(item => item.id === jobId);
  if (!job || job.status === 'Terminado') return;
  const recoverable = job.plan.groups.flatMap(group => group.bars
    .filter(bar => bar.cuts.length && bar.remaining >= Number(DB.settings.minRecover))
    .map(bar => ({ code: group.code, profile: group.profile, bar, index: 0 })));
  recoverable.forEach((item, index) => { item.index = index; });
  const body = `
    <div class="notice warning" style="margin-bottom:13px"><div>ⓘ</div><div>Medí cada recorte en el taller. Podés corregir la longitud sugerida antes de incorporarla al inventario. Los valores inferiores al mínimo de recupero no se guardarán.</div></div>
    ${recoverable.length ? `<div class="confirm-grid">${recoverable.map(item => `
      <div class="confirm-row"><label for="actualRem_${item.index}"><strong>${esc(item.profile.name)}</strong><small>Código ${item.code} · ${item.bar.source === 'sobrante' ? `Usa sobrante #${item.bar.sourceLeftId}` : 'Barra comercial nueva'} · Estimado ${Math.round(item.bar.remaining)} mm</small></label>
        <input id="actualRem_${item.index}" data-rem-index="${item.index}" type="number" min="0" max="${Math.round(item.bar.totalLength)}" step="1" value="${Math.round(item.bar.remaining)}" aria-label="Longitud real del sobrante en milímetros"></div>`).join('')}</div>` : '<div class="empty-state"><div class="empty-icon">✓</div><h3>No hay sobrantes por encima del mínimo</h3><p>Podés finalizar el trabajo. No se agregarán recortes al inventario.</p></div>'}`;
  const dialog = $('#dialog');
  $('#dialogTitle').textContent = `Finalizar ${job.number}`;
  $('#dialogBody').innerHTML = body;
  $('#dialogFooter').innerHTML = `<button class="button button-quiet" type="button" onclick="closeDialog()">Volver</button><button class="button button-success" type="button" onclick="confirmFinish('${jobId}',${recoverable.length})">Confirmar finalización</button>`;
  dialog.showModal();
}

function confirmFinish(jobId, count) {
  const job = DB.jobs.find(item => item.id === jobId);
  if (!job || job.status === 'Terminado') return closeDialog();
  const recoverable = job.plan.groups.flatMap(group => group.bars
    .filter(bar => bar.cuts.length && bar.remaining >= Number(DB.settings.minRecover))
    .map(bar => ({ code: group.code, profile: group.profile, bar })));
  const newIds = [];
  for (let i = 0; i < count; i++) {
    const value = Number($(`#actualRem_${i}`)?.value || 0);
    const item = recoverable[i];
    if (!item || value < Number(DB.settings.minRecover)) continue;
    const id = DB.sequence++;
    DB.leftovers.push({
      id, code: item.code, length: Math.round(value), finish: job.finish,
      sourceJob: job.number,
      sourceBar: item.bar.source === 'sobrante' ? `Sobrante #${item.bar.sourceLeftId}` : 'Barra nueva',
      state: 'Disponible', createdAt: new Date().toISOString(), reservedBy: null
    });
    newIds.push(id);
  }
  job.actualLeftoverIds = newIds;
  (job.usedLeftoverIds || []).forEach(leftId => {
    const oldLeft = DB.leftovers.find(item => item.id === leftId);
    if (oldLeft) { oldLeft.state = 'Usado'; oldLeft.reservedBy = null; }
  });
  job.status = 'Terminado';
  job.completedAt = new Date().toISOString();
  saveDB();
  closeDialog();
  renderJobDetail(jobId);
  notify(`Trabajo finalizado. Se registraron ${newIds.length} sobrante(s) real(es).`);
}

function reserveMissingStock(jobId) {
  const job = DB.jobs.find(item => item.id === jobId);
  if (!job || job.status === 'Terminado') return;
  const remaining = [];
  (job.missingBars || []).forEach(item => {
    const available = Number(DB.stock[item.code] || 0);
    const reserve = Math.min(available, item.count);
    if (reserve > 0) {
      DB.stock[item.code] = available - reserve;
      const existing = (job.reservedBars || []).find(row => row.code === item.code);
      if (existing) existing.count += reserve;
      else (job.reservedBars ||= []).push({ code: item.code, count: reserve });
    }
    const missing = item.count - reserve;
    if (missing > 0) remaining.push({ code: item.code, count: missing });
  });
  job.missingBars = remaining;
  saveDB();
  renderJobDetail(jobId);
  notify(remaining.length ? 'Se actualizaron las reservas; todavía falta material.' : 'Se reservaron las barras disponibles para este trabajo.');
}

function deleteJob(jobId) {
  const job = DB.jobs.find(item => item.id === jobId);
  if (!job || job.status === 'Terminado') return;
  if (!confirm(`¿Cancelar el trabajo ${job.number}? Se liberarán los sobrantes y las barras que estaban reservadas.`)) return;
  (job.usedLeftoverIds || []).forEach(leftId => {
    const item = DB.leftovers.find(left => left.id === leftId);
    if (item && item.state === 'Reservado' && item.reservedBy === job.id) {
      item.state = 'Disponible';
      item.reservedBy = null;
    }
  });
  (job.reservedBars || []).forEach(item => {
    DB.stock[item.code] = Number(DB.stock[item.code] || 0) + item.count;
  });
  DB.jobs = DB.jobs.filter(item => item.id !== jobId);
  saveDB();
  go('jobs');
  notify(`Trabajo ${job.number} cancelado y reservas liberadas.`);
}

function renderLeftovers() {
  const available = DB.leftovers.filter(item => item.state === 'Disponible');
  const reserved = DB.leftovers.filter(item => item.state === 'Reservado');
  const filtered = DB.leftovers.filter(item => [item.id, item.code, PROFILES[item.code]?.name, item.finish, item.sourceJob, item.state].join(' ').toLowerCase().includes(leftoverSearch.toLowerCase()));
  const availableLength = available.reduce((sum, item) => sum + item.length, 0);
  return `
    <div class="page-heading"><div><h2>Banco de sobrantes</h2><p>Inventario independiente de recortes reutilizables.</p></div><div class="heading-actions"><button class="button" onclick="openAddLeftoverDialog()">＋ Agregar sobrante</button></div></div>
    <div class="grid stats-grid">
      <div class="stat-card"><div class="stat-icon">♻</div><div><span class="stat-value">${available.length}</span><span class="stat-label">Disponibles</span></div></div>
      <div class="stat-card"><div class="stat-icon">↗</div><div><span class="stat-value">${reserved.length}</span><span class="stat-label">Reservados</span></div></div>
      <div class="stat-card"><div class="stat-icon">↔</div><div><span class="stat-value">${(availableLength / 1000).toFixed(2).replace('.', ',')} m</span><span class="stat-label">Metros disponibles</span></div></div>
      <div class="stat-card"><div class="stat-icon">✓</div><div><span class="stat-value">${DB.leftovers.filter(item => item.state === 'Usado').length}</span><span class="stat-label">Historial de usados</span></div></div>
    </div>
    <div class="notice">ⓘ Un sobrante se identifica por línea, código de perfil, largo, acabado y trabajo de origen. Solo los sobrantes disponibles y compatibles con el acabado del nuevo trabajo se ofrecen al optimizador.</div>
    <div class="panel" style="margin-top:14px"><div class="panel-head"><div><h3>Inventario de recortes</h3><p>${DB.leftovers.length} registro(s).</p></div><input class="search-input" placeholder="Filtrar por código, acabado o trabajo…" value="${esc(leftoverSearch)}" oninput="filterLeftovers(this.value)"></div>
      ${filtered.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Perfil</th><th>Longitud</th><th>Acabado</th><th>Origen</th><th>Estado</th><th></th></tr></thead><tbody>
        ${filtered.map(item => `<tr><td class="mono">#${item.id}</td><td><span class="code">${item.code}</span><small class="table-subtitle">${esc(PROFILES[item.code]?.name || 'Perfil')}</small></td><td class="mono"><strong>${mm(item.length)}</strong></td><td>${esc(item.finish)}</td><td>${esc(item.sourceJob || 'Carga manual')}<small class="table-subtitle">${esc(item.sourceBar || '')}</small></td><td><span class="badge ${item.state === 'Disponible' ? 'available' : item.state === 'Reservado' ? 'reserved' : 'used'}">${esc(item.state)}</span></td><td>${item.state === 'Disponible' ? `<button class="button button-outline button-small" onclick="deleteLeftover(${item.id})">Eliminar</button>` : '—'}</td></tr>`).join('')}
      </tbody></table></div>` : emptyState('No hay sobrantes registrados','Los sobrantes confirmados al finalizar un trabajo aparecerán acá.')}
    </div>`;
}

function filterLeftovers(value) {
  leftoverSearch = value;
  const input = $('.search-input');
  const panel = input?.closest('.panel');
  if (!panel) return;
  const filtered = DB.leftovers.filter(item => [item.id, item.code, PROFILES[item.code]?.name, item.finish, item.sourceJob, item.state].join(' ').toLowerCase().includes(leftoverSearch.toLowerCase()));
  const old = $('.table-wrap, .empty-state', panel);
  if (old) old.outerHTML = filtered.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Perfil</th><th>Longitud</th><th>Acabado</th><th>Origen</th><th>Estado</th><th></th></tr></thead><tbody>${filtered.map(item => `<tr><td class="mono">#${item.id}</td><td><span class="code">${item.code}</span><small class="table-subtitle">${esc(PROFILES[item.code]?.name || 'Perfil')}</small></td><td class="mono"><strong>${mm(item.length)}</strong></td><td>${esc(item.finish)}</td><td>${esc(item.sourceJob || 'Carga manual')}<small class="table-subtitle">${esc(item.sourceBar || '')}</small></td><td><span class="badge ${item.state === 'Disponible' ? 'available' : item.state === 'Reservado' ? 'reserved' : 'used'}">${esc(item.state)}</span></td><td>${item.state === 'Disponible' ? `<button class="button button-outline button-small" onclick="deleteLeftover(${item.id})">Eliminar</button>` : '—'}</td></tr>`).join('')}</tbody></table></div>` : emptyState('No hay resultados', 'Probá con otro término de búsqueda.');
  const newInput = $('.search-input', panel);
  if (newInput) { newInput.focus(); newInput.setSelectionRange(value.length, value.length); }
}

function openAddLeftoverDialog() {
  const profileOptions = Object.values(PROFILES).map(profile => `<option value="${profile.code}">${profile.code} · ${esc(profile.name)}</option>`).join('');
  $('#dialogTitle').textContent = 'Agregar sobrante al inventario';
  $('#dialogBody').innerHTML = `
    <form id="leftoverForm" class="form-grid">
      <div class="field full"><label for="leftCode">Perfil *</label><select id="leftCode">${profileOptions}</select></div>
      <div class="field"><label for="leftLength">Longitud real (mm) *</label><input id="leftLength" type="number" min="1" max="12000" step="1" required placeholder="Ej.: 1450"></div>
      <div class="field"><label for="leftFinish">Acabado *</label><select id="leftFinish"><option>Aluminio natural</option><option>Blanco</option><option>Negro</option><option>Bronce</option><option>Otro / personalizado</option></select></div>
      <div class="field full"><label for="leftOrigin">Origen / referencia</label><input id="leftOrigin" maxlength="80" placeholder="Ej.: recorte de trabajo anterior"></div>
    </form>`;
  $('#dialogFooter').innerHTML = `<button class="button button-quiet" onclick="closeDialog()">Cancelar</button><button class="button" onclick="saveManualLeftover()">Guardar sobrante</button>`;
  $('#dialog').showModal();
}

function saveManualLeftover() {
  const code = $('#leftCode').value;
  const length = Number($('#leftLength').value);
  if (!PROFILES[code] || !Number.isFinite(length) || length <= 0 || length > 12000) return notify('Ingresá un perfil y una longitud válida.', 'error');
  const id = DB.sequence++;
  DB.leftovers.push({ id, code, length: Math.round(length), finish: $('#leftFinish').value, sourceJob: $('#leftOrigin').value.trim() || 'Carga manual', sourceBar: 'Alta manual', state: 'Disponible', createdAt: new Date().toISOString(), reservedBy: null });
  saveDB(); closeDialog(); go('leftovers'); notify('Sobrante agregado al inventario.');
}

function deleteLeftover(id) {
  const item = DB.leftovers.find(left => left.id === id);
  if (!item || item.state !== 'Disponible') return;
  if (!confirm(`¿Eliminar el sobrante #${id} (${item.code}, ${item.length} mm)?`)) return;
  DB.leftovers = DB.leftovers.filter(left => left.id !== id);
  saveDB(); go('leftovers'); notify('Sobrante eliminado.');
}

function renderProfiles() {
  return `
    <div class="page-heading"><div><h2>Perfiles y stock</h2><p>Datos técnicos de los perfiles utilizados en las reglas iniciales de Delta Plus.</p></div></div>
    <div class="notice warning"><div>ⓘ</div><div>Los códigos completos y longitudes se tomaron del catálogo Delta Plus 2023. El manual de corte de 2015 presenta los códigos cortos (651, 655, etc.); se vinculó cada regla por coincidencia del código final, descripción y peso lineal. Conviene que Julio confirme esta correspondencia con el material que compra.</div></div>
    <div class="panel" style="margin-top:14px"><div class="panel-head"><div><h3>Catálogo de perfiles</h3><p>El stock se puede editar directamente. Cargá solo barras físicas disponibles.</p></div></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Código</th><th>Descripción</th><th>Grupo</th><th>Peso kg/m</th><th>Largo barra</th><th>Catálogo pág.</th><th>Stock (barras)</th></tr></thead><tbody>
        ${Object.values(PROFILES).map(profile => `<tr><td><span class="code">${profile.code}</span></td><td><strong>${esc(profile.name)}</strong></td><td>${esc(profile.section)}</td><td class="mono">${profile.kg.toFixed(2).replace('.', ',')}</td><td class="mono">${profile.bar.toLocaleString('es-AR')} mm</td><td class="mono">${profile.catalogPage}</td><td><input class="stock-input" type="number" min="0" max="9999" step="1" value="${Number(DB.stock[profile.code] || 0)}" onchange="updateStock('${profile.code}',this.value)" aria-label="Stock de ${profile.code}"></td></tr>`).join('')}
      </tbody></table></div>
    </div>
    <div class="panel"><div class="panel-head"><div><h3>Parámetros del optimizador</h3><p>Se aplican a todas las tipologías cargadas.</p></div></div>
      <div class="source-grid"><div><strong>Espesor de sierra</strong><span>${DB.settings.kerf} mm entre dos cortes consecutivos de una misma barra.</span></div><div><strong>Longitud mínima recuperable</strong><span>${DB.settings.minRecover} mm. Por debajo de este valor se considera descarte de taller.</span></div><div><strong>Optimización</strong><span>Mejor ajuste decreciente: sobrantes compatibles primero, barras comerciales después.</span></div><div><strong>Persistencia</strong><span>Los datos se guardan en el navegador actual. Exportá una copia periódicamente.</span></div></div>
    </div>`;
}

function updateStock(code, value) {
  const quantity = Number(value);
  if (!PROFILES[code] || !Number.isInteger(quantity) || quantity < 0 || quantity > 9999) return notify('El stock debe ser un número entero entre 0 y 9999.', 'error');
  DB.stock[code] = quantity;
  saveDB();
  notify(`Stock actualizado para el perfil ${code}.`);
}

function closeDialog() {
  const dialog = $('#dialog');
  if (dialog.open) dialog.close();
}

function exportData() {
  const payload = {
    application: 'Julio Aberturas',
    version: DB.version,
    exportedAt: new Date().toISOString(),
    data: DB
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `julio-aberturas-respaldo-${today()}.json`;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  notify('Copia de seguridad descargada.');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const data = parsed.data || parsed;
      if (!data || data.version !== 1 || !Array.isArray(data.jobs) || !Array.isArray(data.leftovers) || !data.stock) throw new Error('El archivo no tiene el formato de respaldo de Julio Aberturas.');
      if (!confirm('Importar este respaldo reemplazará los trabajos, sobrantes y stock guardados en este navegador. ¿Continuar?')) return;
      DB = { ...createEmptyDB(), ...data, stock: { ...createEmptyDB().stock, ...data.stock }, settings: { ...createEmptyDB().settings, ...(data.settings || {}) } };
      saveDB(); go('dashboard'); notify('Respaldo importado correctamente.');
    } catch (error) { notify(error.message || 'No se pudo leer el respaldo.', 'error'); }
  };
  reader.onerror = () => notify('No se pudo leer el archivo.', 'error');
  reader.readAsText(file);
}

function init() {
  loadDB();
  $('#kerfSetting').value = DB.settings.kerf;
  $('#recoverSetting').value = DB.settings.minRecover;
  $('#nav').addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (button) go(button.dataset.view);
  });
  $('#dialogClose').addEventListener('click', closeDialog);
  $('#dialog').addEventListener('click', event => {
    if (event.target === $('#dialog')) closeDialog();
  });
  $('#menuToggle').addEventListener('click', () => $('#side').classList.toggle('open'));
  $('#kerfSetting').addEventListener('change', syncSettings);
  $('#recoverSetting').addEventListener('change', syncSettings);
  $('#exportButton').addEventListener('click', exportData);
  $('#importFile').addEventListener('change', event => {
    importData(event.target.files?.[0]);
    event.target.value = '';
  });
  go('dashboard');
}

// Exposición de funciones de cálculo para pruebas unitarias simples en Node.js.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PROFILES, MODELS, evaluateFormula, generatePieces, optimizeProfileCuts };
}
if (typeof window !== 'undefined') window.JulioAberturas = { PROFILES, MODELS, evaluateFormula, generatePieces };
if (typeof document !== 'undefined') init();
