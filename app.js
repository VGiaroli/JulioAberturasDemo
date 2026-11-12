/* ===== AberturasPro CAD – Ingeniería y Optimización Lineal (Línea Niza - Alsafex) ===== */
const PDF = 'https://alsafex.com.ar/wp-content/uploads/2023/11/Catalogo_Linea_Delta.pdf';
const $ = s => document.querySelector(s), esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const E_SIERRA = 3; // mm (Espesor disco de corte en taller)
const MIN_RECOV = 500; // mm (Umbral mínimo de recupero para inventario de sobrantes)

/* --- PERFILES LÍNEA NIZA (Catálogo Técnico Alsafex) --- */
const P = (c, n, kg, pg, use, shape = 'marco', bar = 6030) => [c, { c, n, kg, pg, use, shape, bar }];
const PROF = Object.fromEntries([
  P(4059, 'Marco Perimetral / Ventana Rebatir / Paño Fijo', .72, 5, 'Marco universal Niza', 'marco', 6030),
  P(4859, 'Marco Ventana Rebatir 2H / Puerta', .85, 6, 'Marco rebatir / puerta', 'marco', 6030),
  P(1060561, 'Guía Inferior Corrediza 2/3 Pistas', 1.21, 2, 'Guía corrediza N-Uno / N-Tres', 'guia', 6030),
  P(1110405, 'Horizontales de Hoja Corrediza (Zócalo/Cabezal)', .92, 1, 'Hoja corrediza 2H', 'hoja', 6030),
  P(1116406, 'Verticales de Hoja Corrediza (Parantes)', .94, 1, 'Parante corrediza', 'hoja', 6030),
  P(1060743, 'Encuentro Central Corrediza', .92, 2, 'Encuentro 2 hojas', 'encuentro', 6030),
  P(1020638, 'Travesaño de Hoja / Zócalo Puerta', 1.09, 2, 'Vidrio repartido / Zócalo', 'travesano', 6030),
  P(1118405, 'Horizontales Hoja Corrediza 3H', .92, 3, 'Corrediza 3 guías', 'hoja', 6030),
  P(1020685, 'Perfil Mosquitero', .38, 4, 'Mosquitero corredizo', 'tubo', 6030),
  P(4047, 'Contravidrio Clip a 45°', .21, 4, 'Contravidrio clip', 'cv', 6030),
  P(4045, 'Contravidrio Recto a 90°', .22, 4, 'Contravidrio recto', 'cv', 6030),
  P(1110353, 'Travesaño Intermedio Paño Fijo', .77, 4, 'Paño fijo', 'travesano', 6030),
  P(1110208, 'Hoja de Rebatir / Desplazable', 1.07, 5, 'Rebatir 1H / Desplazable', 'hoja', 6030),
  P(1110268, 'Verticales Hoja Rebatir 2H', 1.10, 7, 'Rebatir 2 hojas', 'hoja', 6030),
  P(1110209, 'Inversor de Marcha / Falso Parante', .95, 7, 'Inversor rebatir 2H', 'encuentro', 6030),
  P(1060647, 'Premarco Standard 48 mm', .33, 5, 'Premarco mampostería', 'tubo', 6030),
  P(875, 'Premarco Reforzado 74 mm', .55, 5, 'Premarco pesado', 'tubo', 6030),
  P(1020657, 'Contramarco Tapa-juntas', .19, 5, 'Contramarco ventana/puerta', 'cv', 6030),
  P(1110504, 'Marco Perimetral Pesado N-Cinco', 1.83, 8, 'Corrediza N-Cinco', 'marco', 6030),
  P(1110505, 'Zócalo / Cabezal Hoja Pesada N-Cinco', 1.45, 8, 'Hoja pesada N-Cinco', 'hoja', 6030),
  P(1116566, 'Parante Vertical Hoja Pesada N-Cinco', 1.32, 8, 'Parante N-Cinco', 'hoja', 6030),
  P(1060756, 'Encuentro Central Reforzado N-Cinco', 1.10, 8, 'Encuentro N-Cinco', 'encuentro', 6030)
]);

/* --- MODELOS Y FÓRMULAS OFICIALES LÍNEA NIZA --- */
const MODELS = [
  {
    id: 'c2', cat: 'Corredizas N-Uno', name: 'Corrediza 2 Hojas (2 Guías)', pg: 1, leaves: 2, type: 'corrediza',
    desc: 'Sistema corredizo 2 pistas armado a 45° con encuentro central a 90°.',
    glass: { w: 'A/2-76', h: 'H-146', qty: 2 },
    parts: [
      ['Marco horizontal (Sup/Inf)', 4059, 2, 'A', '45°/45°'],
      ['Marco vertical (Jambas)', 4059, 2, 'H', '45°/45°'],
      ['Guía inferior insert', 1060561, 2, 'A-88', '90°/90°'],
      ['Zócalo / Cabezal hoja', 1110405, 4, 'A/2-8', '45°/45°'],
      ['Parante lateral hoja', 1116406, 4, 'H-78', '45°/45°'],
      ['Encuentro central', 1060743, 2, 'H-78', '90°/90°']
    ]
  },
  {
    id: 'c3', cat: 'Corredizas N-Uno', name: 'Corrediza 3 Hojas (3 Guías)', pg: 2, leaves: 3, type: 'corrediza3',
    desc: 'Sistema corredizo de 3 guías independientes y 3 hojas móviles.',
    glass: { w: 'A/3-52', h: 'H-146', qty: 3 },
    parts: [
      ['Marco horizontal', 4059, 2, 'A', '45°/45°'],
      ['Marco vertical', 4059, 2, 'H', '45°/45°'],
      ['Guía inferior 3 guías', 1060561, 3, 'A-88', '90°/90°'],
      ['Horizontal hoja 3H', 1118405, 6, 'A/3+16', '45°/45°'],
      ['Vertical hoja 3H', 1116406, 6, 'H-78', '45°/45°'],
      ['Travesaño de hoja', 1020638, 3, 'A/3-77', '90°/90°']
    ]
  },
  {
    id: 'pf', cat: 'Paños Fijos N-Tres', name: 'Paño Fijo Recto', pg: 4, leaves: 0, type: 'fijo',
    desc: 'Paño fijo perimetral con marco universal 4059 y contravidrio clip.',
    glass: { w: 'A-59', h: 'H-59', qty: 1 },
    parts: [
      ['Marco horizontal', 4059, 2, 'A', '45°/45°'],
      ['Marco vertical', 4059, 2, 'H', '45°/45°'],
      ['Contravidrio clip ancho', 4047, 2, 'A-59', '45°/45°'],
      ['Contravidrio clip alto', 4047, 2, 'H-59', '45°/45°']
    ]
  },
  {
    id: 'vr1', cat: 'Ventanas de Rebatir N-Tres', name: 'Ventana de Rebatir 1 Hoja', pg: 5, leaves: 1, type: 'rebatir1',
    desc: 'Cámara ecualizadora de presiones (C.E.P.), apertura interior 1 hoja.',
    glass: { w: 'A-139', h: 'H-139', qty: 1 },
    parts: [
      ['Marco horizontal', 4059, 2, 'A', '45°/45°'],
      ['Marco vertical', 4059, 2, 'H', '45°/45°'],
      ['Hoja rebatir ancho', 1110208, 2, 'A-47', '45°/45°'],
      ['Hoja rebatir alto', 1110208, 2, 'H-47', '45°/45°'],
      ['Contravidrio ancho', 4047, 2, 'A-139', '45°/45°'],
      ['Contravidrio alto', 4047, 2, 'H-139', '45°/45°']
    ]
  },
  {
    id: 'vr2', cat: 'Ventanas de Rebatir N-Tres', name: 'Ventana de Rebatir 2 Hojas', pg: 7, leaves: 2, type: 'rebatir2',
    desc: 'Ventana de abrir doble hoja con perfil inversor de marcha central.',
    glass: { w: 'A/2-118', h: 'H-139', qty: 2 },
    parts: [
      ['Marco horizontal', 4859, 2, 'A', '45°/45°'],
      ['Marco vertical', 4859, 2, 'H', '45°/45°'],
      ['Horizontal hoja 2H', 1110208, 4, 'A/2-26', '45°/45°'],
      ['Vertical hoja 2H', 1110268, 4, 'H-47', '45°/45°'],
      ['Inversor de marcha', 1110209, 1, 'H-97', '90°/90°'],
      ['Contravidrio ancho', 4047, 4, 'A/2-118', '45°/45°'],
      ['Contravidrio alto', 4047, 4, 'H-139', '45°/45°']
    ]
  },
  {
    id: 'pr1', cat: 'Puertas de Rebatir', name: 'Puerta de Rebatir 1 Hoja No Coplanar', pg: 8, leaves: 1, type: 'puerta',
    desc: 'Puerta de abrir pesada con jambas a 90° al piso y zócalo tubular.',
    glass: { w: 'A-196', h: 'H-206', qty: 1 },
    parts: [
      ['Marco superior', 4859, 1, 'A', '45°/45°'],
      ['Marco vertical (jamba)', 4859, 2, 'H', '45°/90°'],
      ['Zócalo / Cabezal puerta', 1020638, 2, 'A-104', '90°/90°'],
      ['Parante vertical puerta', 1110208, 2, 'H-57', '45°/45°']
    ]
  },
  {
    id: 'dz', cat: 'Desplazables', name: 'Ventana Desplazable / Proyectante', pg: 9, leaves: 1, type: 'proyectante',
    desc: 'Apertura exterior proyectante con brazos de fricción en acero inox.',
    glass: { w: 'A-139', h: 'H-139', qty: 1 },
    parts: [
      ['Marco horizontal', 4059, 2, 'A', '45°/45°'],
      ['Marco vertical', 4059, 2, 'H', '45°/45°'],
      ['Hoja desplazable ancho', 1110208, 2, 'A-47', '45°/45°'],
      ['Hoja desplazable alto', 1110208, 2, 'H-47', '45°/45°'],
      ['Contravidrio ancho', 4047, 2, 'A-139', '45°/45°'],
      ['Contravidrio alto', 4047, 2, 'H-139', '45°/45°']
    ]
  },
  {
    id: 'c5', cat: 'Grandes Dimensiones (N-Cinco)', name: 'Corrediza Pesada 2 Hojas N-Cinco', pg: 8, leaves: 2, type: 'corrediza',
    desc: 'Perfilería reforzada de alta inercia para grandes ventanales de patio.',
    glass: { w: 'A/2-82', h: 'H-180', qty: 2 },
    parts: [
      ['Marco perimetral pesado', 1110504, 2, 'A', '45°/45°'],
      ['Marco vertical pesado', 1110504, 2, 'H', '45°/45°'],
      ['Zócalo / Cabezal pesado', 1110505, 4, 'A/2+21', '45°/45°'],
      ['Parante vertical pesado', 1116566, 4, 'H-96', '45°/45°'],
      ['Encuentro central pesado', 1060756, 2, 'H-96', '90°/90°']
    ]
  }
];
const CATS = [...new Set(MODELS.map(m => m.cat))];

/* --- PERSISTENCIA Y DATOS DEMO --- */
const K = 'aberturaspro_cad_v4';
let DB;
const seed = () => ({
  clients: [
    { id: 1, n: 'Constructora Del Centro S.A.', t: '3562-441122', e: 'compras@delcentro.com', d: 'Morteros, Cba.' },
    { id: 2, n: 'Estudio Arq. Rossi & Asoc.', t: '3562-559900', e: 'obras@rossiarq.com', d: 'San Francisco, Cba.' },
    { id: 3, n: 'Desarrollos Urbanos Delta', t: '3564-120045', e: 'ingenieria@deltasa.com', d: 'Rafaela, Sta. Fe' }
  ],
  jobs: [
    { id: 1, num: 'OT-0001', cl: 1, name: 'Ventana Living Frente', sub: 'Cara E - Planta Baja', mod: 'c2', A: 2000, H: 1100, mat: 'Aluminio Anodizado Natural', date: '2026-11-04', st: 'Terminado', obs: 'Vidrio DVH 4+9+4' },
    { id: 2, num: 'OT-0002', cl: 2, name: 'Puerta Acceso Galería', sub: 'Cara N - Módulo Principal', mod: 'pr1', A: 950, H: 2100, mat: 'Aluminio Blanco Epoxi', date: '2026-11-09', st: 'En producción', obs: 'Cerradura multipunto' }
  ],
  mats: { 4059: 18, 4859: 12, 1060561: 10, 1110405: 14, 1116406: 14, 1060743: 8, 4047: 22, 1110208: 12, 1020638: 9, 1110504: 6, 1110505: 8, 1116566: 8, 1060756: 4 },
  left: [
    { id: 1, c: 4059, len: 1850, mat: 'Aluminio', job: 'OT-0001', used: false },
    { id: 2, c: 1060561, len: 2150, mat: 'Aluminio', job: 'OT-0001', used: false },
    { id: 3, c: 4859, len: 1420, mat: 'Aluminio', job: 'OT-0002', used: false }
  ],
  seq: 4
});

const load = () => { try { DB = JSON.parse(localStorage.getItem(K)) } catch { } DB ??= seed() }, save = () => { try { localStorage.setItem(K, JSON.stringify(DB)) } catch { } };
function resetDemo() { if (confirm('¿Restaurar los datos de demostración de taller?')) { DB = seed(); save(); go(cur) } }
const cl = id => DB.clients.find(c => c.id == id)?.n || '—', mod = id => MODELS.find(m => m.id == id), dimTxt = j => `${j.A} × ${j.H} mm`;

/* --- DIBUJO TÉCNICO DE SECCIÓN DE PERFIL (SVG MINIATURA) --- */
function drawProfileSection(shape) {
  const shapes = {
    marco: `<path d="M4,4 H28 V28 H22 V10 H10 V28 H4 Z M10,14 H18 V20 H10 Z" fill="#64748b" stroke="#0f172a" stroke-width="1.2"/>`,
    hoja: `<path d="M6,3 H26 V29 H18 V21 H14 V29 H6 Z M11,8 H21 V15 H11 Z" fill="#0284c7" stroke="#0f172a" stroke-width="1.2"/>`,
    guia: `<path d="M2,24 H30 V28 H2 Z M7,14 H10 V24 H7 Z M22,14 H25 V24 H22 Z" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>`,
    encuentro: `<path d="M12,3 H20 V29 H12 Z M6,12 H12 V20 H6 Z M20,12 H26 V20 H20 Z" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>`,
    cv: `<path d="M6,6 H24 V10 H10 V24 H6 Z" fill="#94a3b8" stroke="#0f172a" stroke-width="1.2"/>`,
    travesano: `<rect x="6" y="4" width="20" height="24" rx="2" fill="#475569" stroke="#0f172a" stroke-width="1.2"/><rect x="10" y="8" width="12" height="16" fill="#f8fafc"/>`,
    tubo: `<rect x="5" y="5" width="22" height="22" fill="#64748b" stroke="#0f172a" stroke-width="1.2"/><rect x="9" y="9" width="14" height="14" fill="#f8fafc"/>`
  };
  return `<svg width="28" height="28" viewBox="0 0 32 32" class="bg-white rounded p-0.5 border border-secondary">${shapes[shape] || shapes.tubo}</svg>`;
}

/* --- DIBUJO TÉCNICO DE LA ABERTURA EN CAD (SVG CON COTAS) --- */
function drawAberturaCAD(m, A = 2000, H = 1200) {
  let inner = '';
  if (m.type === 'fijo') {
    inner = `
      <rect x="44" y="24" width="132" height="82" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
      <line x1="95" y1="50" x2="125" y2="80" stroke="#7dd3fc" stroke-width="2"/>
      <line x1="108" y1="45" x2="128" y2="65" stroke="#7dd3fc" stroke-width="1.5"/>`;
  } else if (m.type === 'corrediza') {
    inner = `
      <rect x="44" y="24" width="68" height="82" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="108" y="24" width="68" height="82" fill="#bae6fd" fill-opacity="0.7" stroke="#0f172a" stroke-width="1.5"/>
      <path d="M62,65 H92 M86,60 L92,65 L86,70" fill="none" stroke="#0369a1" stroke-width="2"/>
      <path d="M158,65 H128 M134,60 L128,65 L134,70" fill="none" stroke="#0369a1" stroke-width="2"/>`;
  } else if (m.type === 'corrediza3') {
    inner = `
      <rect x="44" y="24" width="46" height="82" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.3"/>
      <rect x="87" y="24" width="46" height="82" fill="#bae6fd" fill-opacity="0.75" stroke="#0f172a" stroke-width="1.3"/>
      <rect x="130" y="24" width="46" height="82" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.3"/>
      <path d="M58,65 H76 M102,65 H120 M162,65 H144" stroke="#0369a1" stroke-width="1.8"/>`;
  } else if (m.type === 'rebatir1') {
    inner = `
      <rect x="44" y="24" width="132" height="82" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.5"/>
      <polyline points="44,24 176,65 44,106" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="169" y="58" width="4" height="14" rx="1" fill="#334155"/>`;
  } else if (m.type === 'rebatir2') {
    inner = `
      <rect x="44" y="24" width="66" height="82" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="110" y="24" width="66" height="82" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.5"/>
      <polyline points="44,24 110,65 44,106" fill="none" stroke="#0284c7" stroke-width="1.4" stroke-dasharray="4,3"/>
      <polyline points="176,24 110,65 176,106" fill="none" stroke="#0284c7" stroke-width="1.4" stroke-dasharray="4,3"/>`;
  } else if (m.type === 'puerta') {
    inner = `
      <rect x="58" y="16" width="104" height="96" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.5"/>
      <line x1="58" y1="68" x2="162" y2="68" stroke="#0f172a" stroke-width="2.5"/>
      <polyline points="58,16 162,64 58,112" fill="none" stroke="#0284c7" stroke-width="1.4" stroke-dasharray="4,3"/>
      <circle cx="152" cy="62" r="2.5" fill="#0f172a"/>`;
  } else {
    inner = `
      <rect x="44" y="24" width="132" height="82" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.5"/>
      <polyline points="44,24 110,106 176,24" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  }

  const isDoor = m.type === 'puerta';
  const frameRect = isDoor
    ? `<path d="M52,114 V10 H168 V114" fill="none" stroke="#0f172a" stroke-width="4"/>`
    : `<rect x="38" y="18" width="144" height="94" fill="#cbd5e1" stroke="#0f172a" stroke-width="3"/>`;

  return `
  <svg viewBox="0 0 220 140" style="width:100%; max-width:240px; height:auto;">
    ${frameRect}
    ${inner}
    <!-- Cota Ancho (A) -->
    <line x1="${isDoor ? 52 : 38}" y1="124" x2="${isDoor ? 168 : 182}" y2="124" stroke="#475569" stroke-width="1"/>
    <line x1="${isDoor ? 52 : 38}" y1="120" x2="${isDoor ? 52 : 38}" y2="128" stroke="#475569" stroke-width="1"/>
    <line x1="${isDoor ? 168 : 182}" y1="120" x2="${isDoor ? 168 : 182}" y2="128" stroke="#475569" stroke-width="1"/>
    <text x="110" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="700" fill="#0f172a">A = ${A} mm</text>
    <!-- Cota Alto (H) -->
    <line x1="22" y1="${isDoor ? 10 : 18}" x2="22" y2="${isDoor ? 114 : 112}" stroke="#475569" stroke-width="1"/>
    <line x1="18" y1="${isDoor ? 10 : 18}" x2="26" y2="${isDoor ? 10 : 18}" stroke="#475569" stroke-width="1"/>
    <line x1="18" y1="${isDoor ? 114 : 112}" x2="26" y2="${isDoor ? 114 : 112}" stroke="#475569" stroke-width="1"/>
    <text x="14" y="65" text-anchor="middle" transform="rotate(-90 14,65)" font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="700" fill="#0f172a">H = ${H} mm</text>
  </svg>`;
}

/* --- MOTOR DE OPTIMIZACIÓN LINEAL 1D (FFD + KERF 3MM + REUTILIZACIÓN SOBRANTES) --- */
function calc(m, A, H, jobNum = 'OT-PREVIEW') {
  const rows = m.parts.map(([p, c, q, f, ang]) => ({
    p, c, q, f, ang,
    len: Math.round(new Function('A', 'H', 'return ' + f)(A, H))
  }));

  const by = {};
  rows.forEach(r => {
    (by[r.c] ??= []);
    for (let i = 0; i < r.q; i++) by[r.c].push({ p: r.p, len: r.len, ang: r.ang });
  });

  const res = {};
  let usedTotal = 0, wTotal = 0, barsTotal = 0, efficiencySum = 0, totalMaterialUsed = 0;
  const usedLeftsList = [];
  const generatedLeftsList = [];

  let availableLefts = DB ? JSON.parse(JSON.stringify(DB.left.filter(l => !l.used))) : [];

  for (const c in by) {
    const B = PROF[c]?.bar || 6030;
    const requiredCuts = [...by[c]].sort((a, b) => b.len - a.len);
    const activeBars = [];

    requiredCuts.forEach(cut => {
      let placed = false;
      // 1. Buscar espacio en barras o sobrantes ya abiertos en este trabajo
      for (let bar of activeBars) {
        const kerf = bar.cuts.length > 0 ? E_SIERRA : 0;
        if (bar.remaining >= cut.len + kerf) {
          bar.cuts.push({ ...cut, kerfBefore: kerf });
          bar.remaining -= (cut.len + kerf);
          placed = true;
          break;
        }
      }

      // 2. Buscar en el inventario de sobrantes disponibles en taller (Best-Fit)
      if (!placed) {
        const matchingLefts = availableLefts
          .filter(l => l.c == +c && !l.used && l.len >= cut.len)
          .sort((a, b) => a.len - b.len); // El que mejor ajusta (menor desperdicio)

        if (matchingLefts.length > 0) {
          const sob = matchingLefts[0];
          sob.used = true;
          usedLeftsList.push({ id: sob.id, c: +c, len: cut.len, origLen: sob.len, fromLeftId: sob.id });
          activeBars.push({
            type: 'sobrante',
            refId: sob.id,
            label: `RECUPERO #${sob.id} (Origen: ${sob.job})`,
            totalLen: sob.len,
            remaining: sob.len - cut.len,
            cuts: [{ ...cut, kerfBefore: 0 }]
          });
          placed = true;
        }
      }

      // 3. Abrir barra comercial nueva
      if (!placed) {
        activeBars.push({
          type: 'nueva',
          label: `BARRA COMERCIAL (${B} mm)`,
          totalLen: B,
          remaining: B - cut.len,
          cuts: [{ ...cut, kerfBefore: 0 }]
        });
      }
    });

    const profileCutsLen = requiredCuts.reduce((acc, curr) => acc + curr.len, 0);
    const barCountNew = activeBars.filter(b => b.type === 'nueva').length;

    activeBars.forEach(bar => {
      totalMaterialUsed += bar.totalLen;
      if (bar.remaining >= MIN_RECOV) {
        generatedLeftsList.push({
          id: 'R-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
          c: +c,
          len: bar.remaining,
          job: jobNum,
          used: false,
          mat: 'Aluminio'
        });
      }
    });

    res[c] = {
      bar: B,
      n: barCountNew,
      used: profileCutsLen,
      barsDetail: activeBars
    };
    usedTotal += profileCutsLen;
    barsTotal += barCountNew;
    wTotal += profileCutsLen * (PROF[c]?.kg || 0) / 1000;
  }

  // Cálculo de vidrios y accesorios según manual Niza
  const glassW = m.glass ? Math.round(new Function('A', 'H', 'return ' + m.glass.w)(A, H)) : 0;
  const glassH = m.glass ? Math.round(new Function('A', 'H', 'return ' + m.glass.h)(A, H)) : 0;
  const escuadras = 4 + (m.leaves * 4);
  const felpaML = m.type.includes('corrediza') ? ((4 * A + 6 * H) / 1000).toFixed(1) : ((2 * (A + H)) / 1000).toFixed(1);
  const effPct = totalMaterialUsed > 0 ? Math.min(100, ((usedTotal / totalMaterialUsed) * 100)).toFixed(1) : 100;

  return {
    rows, res, used: usedTotal, bars: barsTotal, w: wTotal,
    usedLeftsList, generatedLeftsList, effPct,
    bom: { glassW, glassH, glassQty: m.glass?.qty || 0, escuadras, felpaML }
  };
}

/* --- RENDERIZADO DE PLANOS DE CORTE EN SVG (ESTILO CAD INDUSTRIAL) --- */
function renderOptimizationVisual(r) {
  let html = `
  <!-- Definición de patrones SVG para sobrantes y scrap -->
  <svg width="0" height="0" style="position:absolute">
    <defs>
      <pattern id="hatch-recov" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#dcfce7"/>
        <line x1="0" y1="0" x2="0" y2="8" stroke="#16a34a" stroke-width="2.5" />
      </pattern>
      <pattern id="hatch-scrap" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#fee2e2"/>
        <line x1="0" y1="0" x2="0" y2="6" stroke="#dc2626" stroke-width="2" />
      </pattern>
      <linearGradient id="alu-metal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#075985"/>
      </linearGradient>
      <linearGradient id="alu-metal-alt" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="50%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
  </svg>`;

  for (const c in r.res) {
    const profileInfo = r.res[c];
    const prof = PROF[c] || { n: 'Perfil Aluminio', shape: 'tubo', kg: 0 };

    html += `
    <div class="cad-sheet">
      <div class="cad-sheet-head">
        <div class="d-flex align-items-center gap-2">
          ${drawProfileSection(prof.shape)}
          <div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-info text-dark mono fw-bold">PERFIL ${c}</span>
              <span class="fw-bold">${prof.n}</span>
            </div>
            <div class="small text-white-50 mono" style="font-size:11px;">Peso lineal: ${prof.kg} kg/m · Barra estándar: ${profileInfo.bar} mm</div>
          </div>
        </div>
        <div class="text-end mono">
          <span class="badge bg-primary fs-6">${profileInfo.n} barra(s) nueva(s)</span>
        </div>
      </div>
      <div class="p-3 bg-white">`;

    profileInfo.barsDetail.forEach((bar, idx) => {
      const totalLen = bar.totalLen;
      const isSobrante = bar.type === 'sobrante';
      const isRecov = bar.remaining >= MIN_RECOV;

      // Construcción del dibujo SVG proporcional de la barra (ancho lógico 1000px)
      const W = 1000;
      const barY = 14;
      const barH = 38;
      let currentX = 0;
      let svgPieces = '';
      let svgDimensions = '';

      bar.cuts.forEach((cut, cutIdx) => {
        // Dibujar corte de sierra (kerf) si no es la primera pieza
        if (cut.kerfBefore > 0) {
          const kerfW = Math.max(2, (cut.kerfBefore / totalLen) * W);
          svgPieces += `<rect x="${currentX}" y="${barY}" width="${kerfW}" height="${barH}" fill="#ef4444" />`;
          currentX += kerfW;
        }

        const segW = (cut.len / totalLen) * W;
        const fillGrad = cutIdx % 2 === 0 ? 'url(#alu-metal)' : 'url(#alu-metal-alt)';
        const is45 = cut.ang.includes('45');
        const bevel = is45 ? Math.min(10, segW * 0.15) : 0;

        // Polígono con biselado real a 45° o recto a 90°
        const points = `${currentX + bevel},${barY} ${currentX + segW - bevel},${barY} ${currentX + segW},${barY + barH} ${currentX},${barY + barH}`;
        svgPieces += `<polygon points="${points}" fill="${fillGrad}" stroke="#ffffff" stroke-width="1.2" />`;

        // Texto dentro de la pieza si hay espacio suficiente
        if (segW > 55) {
          const midX = currentX + segW / 2;
          svgPieces += `<text x="${midX}" y="${barY + 17}" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-size="11" font-weight="700">${esc(cut.p.slice(0, 18))}</text>`;
          svgPieces += `<text x="${midX}" y="${barY + 31}" text-anchor="middle" fill="#bae6fd" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">${cut.len} mm (${cut.ang})</text>`;
        } else if (segW > 24) {
          const midX = currentX + segW / 2;
          svgPieces += `<text x="${midX}" y="${barY + 23}" text-anchor="middle" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700">${cut.len}</text>`;
        }

        // Línea de cota técnica inferior
        const dimY = barY + barH + 14;
        svgDimensions += `
          <line x1="${currentX + 2}" y1="${dimY}" x2="${currentX + segW - 2}" y2="${dimY}" stroke="#475569" stroke-width="1"/>
          <line x1="${currentX + 2}" y1="${dimY - 4}" x2="${currentX + 2}" y2="${dimY + 4}" stroke="#475569" stroke-width="1"/>
          <line x1="${currentX + segW - 2}" y1="${dimY - 4}" x2="${currentX + segW - 2}" y2="${dimY + 4}" stroke="#475569" stroke-width="1"/>
          <text x="${currentX + segW / 2}" y="${dimY + 12}" text-anchor="middle" fill="#1e293b" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="700">${cut.len}</text>`;

        currentX += segW;
      });

      // Dibujar tramo sobrante (rezago) al final de la barra
      if (bar.remaining > 0) {
        const remW = Math.max(0, W - currentX);
        const patternId = isRecov ? 'url(#hatch-recov)' : 'url(#hatch-scrap)';
        const strokeCol = isRecov ? '#16a34a' : '#dc2626';
        const textCol = isRecov ? '#14532d' : '#7f1d1d';

        svgPieces += `<rect x="${currentX}" y="${barY}" width="${remW}" height="${barH}" fill="${patternId}" stroke="${strokeCol}" stroke-width="1.5" stroke-dasharray="4,2"/>`;

        if (remW > 65) {
          svgPieces += `<text x="${currentX + remW / 2}" y="${barY + 17}" text-anchor="middle" fill="${textCol}" font-family="Inter, sans-serif" font-size="10.5" font-weight="700">${isRecov ? 'SOBRANTE ÚTIL' : 'DESCARTE'}</text>`;
          svgPieces += `<text x="${currentX + remW / 2}" y="${barY + 31}" text-anchor="middle" fill="${textCol}" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">${bar.remaining} mm</text>`;
        } else if (remW > 22) {
          svgPieces += `<text x="${currentX + remW / 2}" y="${barY + 23}" text-anchor="middle" fill="${textCol}" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700">${bar.remaining}</text>`;
        }

        const dimY = barY + barH + 14;
        svgDimensions += `
          <line x1="${currentX + 2}" y1="${dimY}" x2="${W - 2}" y2="${dimY}" stroke="${strokeCol}" stroke-width="1" stroke-dasharray="2,2"/>
          <text x="${currentX + remW / 2}" y="${dimY + 12}" text-anchor="middle" fill="${textCol}" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="700">${bar.remaining} mm</text>`;
      }

      html += `
      <div class="cad-bar-box">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <div class="d-flex align-items-center gap-2">
            <span class="badge ${isSobrante ? 'bg-success' : 'bg-secondary'} mono">BARRA #${idx + 1}</span>
            <span class="fw-bold text-dark" style="font-size:12.5px;">${bar.label}</span>
          </div>
          <div class="mono" style="font-size:12px;">
            ${bar.remaining > 0
              ? (isRecov
                ? `<span class="text-success fw-bold"><i class="bi bi-check-circle-fill"></i> Guarda sobrante: ${bar.remaining} mm</span>`
                : `<span class="text-danger fw-bold"><i class="bi bi-x-circle"></i> Scrap / Despunte: ${bar.remaining} mm</span>`)
              : `<span class="text-primary fw-bold">Aprovechamiento 100%</span>`
            }
          </div>
        </div>
        <svg viewBox="0 0 ${W} 84" style="width:100%; height:auto; display:block;">
          ${svgPieces}
          ${svgDimensions}
        </svg>
      </div>`;
    });

    html += `</div></div>`;
  }
  return html;
}

/* --- MODAL Y NAVEGACIÓN --- */
let MB;
const modal = (t, b, f = '', lg = true) => {
  MB ??= new bootstrap.Modal('#m');
  $('#mt').textContent = t;
  $('#mb').innerHTML = b;
  $('#mf').innerHTML = f || '<button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>';
  document.querySelector('#m .modal-dialog').className = 'modal-dialog modal-dialog-scrollable ' + (lg ? 'modal-xl' : '');
  MB.show();
}, close = () => MB.hide();

const NAV = [
  ['dash', 'Panel de Taller', 'speedometer2'],
  ['jobs', 'Órdenes de Trabajo', 'clipboard-check'],
  ['new', 'Nueva Orden / Corte', 'plus-square-fill'],
  ['left', 'Banco de Sobrantes', 'scissors'],
  ['mat', 'Stock de Barras', 'box-seam'],
  ['cat', 'Tipologías Niza', 'grid-3x3'],
  ['prof', 'Perfiles y Matrices', 'rulers'],
  ['cli', 'Clientes / Obras', 'buildings'],
  ['hist', 'Historial', 'clock-history']
];

let cur = 'dash', F = '';
function go(v) {
  cur = v;
  $('#nav').innerHTML = NAV.map(n => `<a class="${n[0] == v ? 'on' : ''}" onclick="go('${n[0]}')"><i class="bi bi-${n[2]}"></i>${n[1]}</a>`).join('');
  $('#title').textContent = NAV.find(n => n[0] == v)[1];
  if (v == 'new') return newJob();
  $('#view').innerHTML = V[v]();
}

const stBadge = s => `<span class="badge bg-${{ Pendiente: 'warning text-dark', 'En producción': 'primary', Terminado: 'success' }[s]}">${s}</span>`;

const V = {
  dash() {
    const pend = DB.jobs.filter(j => j.st != 'Terminado').length;
    const freeLefts = DB.left.filter(l => !l.used);
    const totalLeftMeters = (freeLefts.reduce((a, b) => a + b.len, 0) / 1000).toFixed(2);
    const S = (i, l, v) => `<div class="col-md-4 col-xl"><div class="cardx stat"><i class="bi bi-${i}"></i><div><b>${v}</b><span class="text-muted small">${l}</span></div></div></div>`;

    return `
    <div class="row g-3 mb-4">
      ${S('clipboard-data', 'Órdenes Activas', DB.jobs.length)}
      ${S('gear-wide-connected', 'En Taller', pend)}
      ${S('box-seam', 'Barras en Stock', Object.values(DB.mats).reduce((a, b) => a + b, 0))}
      ${S('scissors', 'Recortes Útiles', freeLefts.length)}
      ${S('rulers', 'Metros Recuperables', totalLeftMeters + ' m')}
    </div>
    <div class="cardx">
      <div class="cardx-header">
        <h6>Últimas Órdenes de Fabricación en Planta</h6>
        <button class="btn btn-sm btn-primary" onclick="go('new')"><i class="bi bi-plus-lg"></i> Nueva Orden</button>
      </div>
      ${jobTable(DB.jobs.slice(-5).reverse(), true)}
    </div>`;
  },

  jobs() {
    const q = F.toLowerCase();
    const L = DB.jobs.filter(j => [j.num, cl(j.cl), j.name, j.sub, mod(j.mod)?.name, dimTxt(j)].join(' ').toLowerCase().includes(q));
    return `
    <div class="d-flex gap-2 mb-3">
      <input class="form-control" style="max-width:420px" placeholder="Buscar por N° OT, cliente, pieza, subtítulo o medidas..." value="${esc(F)}" oninput="F=this.value;$('#jt').innerHTML=jobTable(DB.jobs.filter(j=>[j.num,cl(j.cl),j.name,j.sub,mod(j.mod)?.name,dimTxt(j)].join(' ').toLowerCase().includes(F.toLowerCase())),true)">
      <button class="btn btn-primary ms-auto" onclick="go('new')"><i class="bi bi-plus-lg"></i> Nueva Orden de Fabricación</button>
    </div>
    <div class="cardx" id="jt">${jobTable(L, true)}</div>`;
  },

  cat() {
    return `
    <div class="alert-tech mb-3">
      <i class="bi bi-info-circle-fill"></i> <b>Catálogo Técnico Línea Niza (Alsafex):</b> Seleccione una tipología para calcular automáticamente el despiece de aluminio, vidrios, accesorios y planos de corte optimizados.
    </div>` + CATS.map(c => `
    <div class="cat">${c}</div>
    <div class="row g-3">
      ${MODELS.filter(m => m.cat == c).map(m => `
        <div class="col-md-4 col-xl-3">
          <div class="mcard">
            <div class="mcard-cad-preview">${drawAberturaCAD(m, 1500, 1200)}</div>
            <div class="p-3 flex-grow-1">
              <div class="fw-bold text-dark">${m.name}</div>
              <div class="text-muted small mb-2">${m.cat} · Manual p.${m.pg}</div>
              <p class="small text-secondary mb-0">${m.desc}</p>
            </div>
            <div class="p-2 bg-light border-top d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary flex-fill" onclick="detail('${m.id}')">Fórmulas</button>
              <button class="btn btn-sm btn-primary flex-fill" onclick="newJob('${m.id}')">Fabricar</button>
            </div>
          </div>
        </div>`).join('')}
    </div>`).join('');
  },

  prof() {
    return `
    <input class="form-control mb-3" style="max-width:400px" placeholder="Buscar por código de matriz, nombre o aplicación..." oninput="profT(this.value)">
    <div class="cardx" id="pt">${profTable('')}</div>`;
  },

  mat() {
    return `
    <div class="alert-tech mb-3">
      <i class="bi bi-box-seam"></i> Inventario de barras comerciales estándar (<b>6030 mm</b>). Cada orden de trabajo descuenta automáticamente las barras nuevas consumidas.
    </div>
    <div class="cardx">
      <table class="table align-middle">
        <tr><th>Sección</th><th>Código</th><th>Descripción del Perfil</th><th>Peso Lineal</th><th>Barra Std</th><th>Stock Disponible</th></tr>
        ${Object.entries(DB.mats).map(([c, q]) => `
          <tr>
            <td>${drawProfileSection(PROF[c]?.shape)}</td>
            <td><span class="code-badge">${c}</span></td>
            <td class="fw-medium">${PROF[c]?.n}</td>
            <td class="mono">${PROF[c]?.kg} kg/m</td>
            <td class="mono">${PROF[c]?.bar || 6030} mm</td>
            <td><span class="badge ${q > 4 ? 'bg-success' : 'bg-warning text-dark'} mono fs-6">${q} barras</span></td>
          </tr>`).join('')}
      </table>
    </div>`;
  },

  left() {
    return `
    <div class="alert-tech mb-3">
      <i class="bi bi-recycle"></i> <b>Banco de Sobrantes Reutilizables:</b> Todo recorte resultante $\ge \mathbf{500\text{ mm}}$ se almacena aquí con su perfil y longitud exacta. El motor de optimización los asigna prioritariamente en futuros trabajos antes de cortar una barra nueva.
    </div>
    <input class="form-control mb-3" style="max-width:340px" placeholder="Filtrar por código de perfil o N° OT..." oninput="leftT(this.value)">
    <div class="cardx" id="lt">${leftTable('')}</div>`;
  },

  cli() {
    return `
    <div class="d-flex mb-3 gap-2">
      <input class="form-control" style="max-width:340px" placeholder="Buscar cliente u obra..." oninput="cliT(this.value)">
      <button class="btn btn-primary ms-auto" onclick="clientForm()"><i class="bi bi-plus-lg"></i> Nuevo Cliente</button>
    </div>
    <div class="cardx" id="ct">${cliTable('')}</div>`;
  },

  hist() {
    return `<div class="cardx">${jobTable([...DB.jobs].sort((a, b) => b.date.localeCompare(a.date)), true)}</div>`;
  }
};

const profTable = q => {
  q = q.toLowerCase();
  return `<table class="table align-middle"><tr><th>Sección</th><th>Matriz</th><th>Descripción</th><th>kg/m</th><th>Barra</th><th>Aplicación</th><th></th></tr>${Object.values(PROF).filter(p => (p.c + p.n + p.use).toLowerCase().includes(q)).map(p => `<tr><td>${drawProfileSection(p.shape)}</td><td><span class="code-badge">${p.c}</span></td><td>${p.n}</td><td class="mono">${p.kg}</td><td class="mono">${p.bar} mm</td><td class="small text-muted">${p.use}</td><td><button class="btn btn-sm btn-outline-secondary" onclick="viewer(${p.pg})">Manual p.${p.pg}</button></td></tr>`).join('')}</table>`;
}, profT = q => $('#pt').innerHTML = profTable(q);

const leftTable = q => {
  const filtered = DB.left.filter(l => (l.c + '' + PROF[l.c]?.n + l.job).toLowerCase().includes(q.toLowerCase()));
  return `<table class="table align-middle">
    <tr><th>ID Sobrante</th><th>Sección</th><th>Perfil</th><th>Longitud Útil</th><th>Material</th><th>OT Origen</th><th>Estado</th><th>Acción</th></tr>
    ${filtered.map(l => `
      <tr>
        <td class="mono fw-bold">#${l.id}</td>
        <td>${drawProfileSection(PROF[l.c]?.shape)}</td>
        <td><span class="code-badge">${l.c}</span> ${PROF[l.c]?.n || ''}</td>
        <td><span class="badge bg-info text-dark mono fs-6">${l.len} mm</span></td>
        <td class="small">${l.mat || 'Aluminio'}</td>
        <td class="mono">${l.job}</td>
        <td>${l.used ? '<span class="badge bg-secondary">Reutilizado</span>' : '<span class="badge bg-success">Disponible en Taller</span>'}</td>
        <td>${l.used ? '—' : `<button class="btn btn-sm btn-outline-primary" onclick="useLeft('${l.id}')">Dar de baja manual</button>`}</td>
      </tr>`).join('')}
  </table>`;
};
const leftT = q => $('#lt').innerHTML = leftTable(q);

const cliTable = q => `<table class="table align-middle"><tr><th>Cliente / Empresa</th><th>Teléfono</th><th>Localidad</th><th>Órdenes</th><th></th></tr>${DB.clients.filter(c => (c.n + c.t).toLowerCase().includes(q.toLowerCase())).map(c => `<tr><td class="fw-bold">${esc(c.n)}</td><td class="mono">${esc(c.t)}</td><td>${esc(c.d)}</td><td class="mono">${DB.jobs.filter(j => j.cl == c.id).map(j => j.num).join(', ') || '—'}</td><td><button class="btn btn-sm btn-outline-secondary" onclick="cliDet(${c.id})">Ver Ficha</button></td></tr>`).join('')}</table>`, cliT = q => $('#ct').innerHTML = cliTable(q);

function jobTable(L, act = true) {
  return `<table class="table align-middle">
    <tr><th>N° OT</th><th>Cliente</th><th>Producto / Subtítulo</th><th>Tipología</th><th>Dimensiones</th><th>Fecha</th><th>Estado</th>${act ? '<th></th>' : ''}</tr>
    ${L.map(j => `
      <tr>
        <td class="mono fw-bold text-primary">${j.num}</td>
        <td class="fw-medium">${esc(cl(j.cl))}</td>
        <td>
          <div class="fw-bold text-dark">${esc(j.name)}</div>
          ${j.sub ? `<div class="small text-muted"><i class="bi bi-tag"></i> ${esc(j.sub)}</div>` : ''}
        </td>
        <td>${mod(j.mod)?.name}</td>
        <td class="mono fw-bold">${dimTxt(j)}</td>
        <td class="mono small">${j.date}</td>
        <td>${stBadge(j.st)}</td>
        ${act ? `<td class="text-nowrap">
          <button class="btn btn-sm btn-primary" title="Ver Plano de Corte y Despiece" onclick="jobDet(${j.id})"><i class="bi bi-rulers"></i> Plano</button>
          <button class="btn btn-sm btn-outline-secondary" title="Editar" onclick="newJob(null,${j.id},'edit')"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-secondary" title="Duplicar OT" onclick="newJob(null,${j.id},'reuse')"><i class="bi bi-copy"></i></button>
          <button class="btn btn-sm btn-outline-danger" title="Eliminar" onclick="delJob(${j.id})"><i class="bi bi-trash"></i></button>
        </td>` : ''}
      </tr>`).join('')}
  </table>`;
}

const viewer = p => modal('Manual Técnico Línea Niza – pág. ' + p, `<div class="small text-muted mb-2"><a href="${PDF}" target="_blank">Abrir PDF técnico en nueva pestaña</a></div><iframe src="${PDF}#page=${p}" style="width:100%;height:70vh;border:1px solid #cbd5e1"></iframe>`);

function detail(id) {
  const m = mod(id);
  modal(m.name, `
    <div class="row align-items-center mb-3">
      <div class="col-md-4 text-center bg-light p-3 rounded border">${drawAberturaCAD(m, 1500, 1200)}</div>
      <div class="col-md-8">
        <p class="mb-2">${m.desc}</p>
        <div class="small text-muted mb-2">Referencia: <b>Manual Técnico Línea Niza (Pág. ${m.pg})</b></div>
        ${m.glass ? `<div class="alert-tech py-2"><b>Fórmula Vidrio:</b> Ancho = <code>${m.glass.w}</code> · Alto = <code>${m.glass.h}</code> (${m.glass.qty} paño/s)</div>` : ''}
      </div>
    </div>
    <h6 class="fw-bold">Matriz de Despiece Paramétrico</h6>
    <table class="table table-sm">
      <tr><th>Pieza</th><th>Perfil</th><th>Cant.</th><th>Fórmula Corte</th><th>Ángulos</th></tr>
      ${m.parts.map(p => `<tr><td>${p[0]}</td><td><span class="code-badge">${p[1]}</span> ${PROF[p[1]]?.n || ''}</td><td class="mono">${p[2]}</td><td><span class="formula-pill">${p[3]}</span></td><td class="mono">${p[4]}</td></tr>`).join('')}
    </table>`,
    `<button class="btn btn-primary" onclick="close();newJob('${m.id}')"><i class="bi bi-plus-lg"></i> Crear Orden con esta Tipología</button>`);
}

/* --- FORMULARIO DE NUEVA ORDEN DE FABRICACIÓN --- */
function newJob(mid, jid, mode = 'new') {
  const j = jid ? { ...DB.jobs.find(x => x.id == jid) } : { cl: DB.clients[0].id, name: '', sub: '', mod: mid || MODELS[0].id, A: 2000, H: 1200, mat: 'Aluminio Anodizado Natural', date: new Date().toISOString().slice(0, 10), st: 'Pendiente', obs: '' };
  if (mid) j.mod = mid;
  if (cur != 'new') { cur = 'new'; go('new'); return newJob(mid, jid, mode); }
  window.CJ = { j, mode, id: jid };

  const ttl = { new: 'Nueva Orden de Fabricación', edit: 'Editar ' + j.num, reuse: 'Duplicar ' + j.num }[mode];
  $('#title').textContent = ttl;

  $('#view').innerHTML = `
  <div class="row g-3">
    <div class="col-lg-4">
      <div class="cardx">
        <div class="cardx-header"><h6><i class="bi bi-sliders"></i> Parámetros de Abertura</h6></div>
        <div class="row g-2">
          <div class="col-12">
            <label class="form-label small fw-bold mb-1">Cliente / Obra</label>
            <select id="fc" class="form-select">${DB.clients.map(c => `<option value="${c.id}" ${c.id == j.cl ? 'selected' : ''}>${esc(c.n)}</option>`).join('')}</select>
          </div>
          <div class="col-12">
            <label class="form-label small fw-bold mb-1">Producto a fabricar</label>
            <input id="fn" class="form-control" value="${esc(j.name)}" placeholder="Ej: Puerta Balcón / Ventana Living">
          </div>
          <div class="col-12">
            <label class="form-label small fw-bold mb-1">Subtítulo / Identificador de Pieza</label>
            <input id="fsub" class="form-control" value="${esc(j.sub || '')}" placeholder="Ej: Cara E / Módulo Norte / Paño 1">
          </div>
          <div class="col-12">
            <label class="form-label small fw-bold mb-1">Tipología Línea Niza</label>
            <select id="fm" class="form-select" onchange="CJ.j.mod=this.value;preview()">
              ${CATS.map(c => `<optgroup label="${c}">${MODELS.filter(m => m.cat == c).map(m => `<option value="${m.id}" ${m.id == j.mod ? 'selected' : ''}>${m.name}</option>`).join('')}</optgroup>`).join('')}
            </select>
          </div>
          <div class="col-6">
            <label class="form-label small fw-bold mb-1">Ancho Total (A) mm</label>
            <input id="fa" type="number" class="form-control mono fw-bold" value="${j.A}" oninput="preview()">
          </div>
          <div class="col-6">
            <label class="form-label small fw-bold mb-1">Alto Total (H) mm</label>
            <input id="fh" type="number" class="form-control mono fw-bold" value="${j.H}" oninput="preview()">
          </div>
          <div class="col-6">
            <label class="form-label small fw-bold mb-1">Acabado / Material</label>
            <select id="fx" class="form-select">
              <option ${j.mat.includes('Natural') ? 'selected' : ''}>Aluminio Anodizado Natural</option>
              <option ${j.mat.includes('Blanco') ? 'selected' : ''}>Aluminio Blanco Epoxi</option>
              <option ${j.mat.includes('Negro') ? 'selected' : ''}>Aluminio Negro Anodizado</option>
              <option ${j.mat.includes('Madera') ? 'selected' : ''}>Madera / Mixto</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label small fw-bold mb-1">Fecha Entrega</label>
            <input id="fd" type="date" class="form-control mono" value="${j.date}">
          </div>
          <div class="col-12">
            <label class="form-label small fw-bold mb-1">Notas de Taller</label>
            <textarea id="fo" class="form-control" rows="2" placeholder="Ej: Vidrio DVH, sentido de apertura...">${esc(j.obs)}</textarea>
          </div>
        </div>
        <div class="mt-3 pt-2 border-top d-flex gap-2">
          <button class="btn btn-primary flex-grow-1 fw-bold" onclick="saveJob()"><i class="bi bi-check2-circle"></i> Confirmar y Descontar Stock</button>
          <button class="btn btn-outline-secondary" onclick="go('jobs')">Cancelar</button>
        </div>
      </div>
    </div>
    <div class="col-lg-8">
      <div id="pv"></div>
    </div>
  </div>`;
  preview();
}

function preview() {
  const m = mod($('#fm').value), A = +$('#fa').value || 1000, H = +$('#fh').value || 1000;
  const nextJobNum = 'OT-' + String(DB.jobs.length + 1).padStart(4, '0');
  const r = calc(m, A, H, nextJobNum);

  let h = `
  <!-- Cabecera con Plano CAD de la Abertura y Resumen Ejecutivo -->
  <div class="cardx mb-3">
    <div class="row align-items-center">
      <div class="col-md-4 text-center border-end">
        ${drawAberturaCAD(m, A, H)}
      </div>
      <div class="col-md-8">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <h5 class="fw-bold text-dark m-0">${m.name}</h5>
          <span class="badge bg-dark mono">Manual p.${m.pg}</span>
        </div>
        <p class="small text-muted mb-3">${m.desc}</p>
        <div class="row g-2 text-center">
          <div class="col-3">
            <div class="p-2 bg-light rounded border">
              <div class="small text-muted">Barras Nuevas</div>
              <div class="fw-bold mono fs-6 text-primary">${r.bars} u.</div>
            </div>
          </div>
          <div class="col-3">
            <div class="p-2 bg-light rounded border">
              <div class="small text-muted">Sobrantes Usados</div>
              <div class="fw-bold mono fs-6 text-success">${r.usedLeftsList.length} pza(s)</div>
            </div>
          </div>
          <div class="col-3">
            <div class="p-2 bg-light rounded border">
              <div class="small text-muted">Peso Aluminio</div>
              <div class="fw-bold mono fs-6">${r.w.toFixed(2)} kg</div>
            </div>
          </div>
          <div class="col-3">
            <div class="p-2 bg-light rounded border">
              <div class="small text-muted">Rendimiento</div>
              <div class="fw-bold mono fs-6 text-dark">${r.effPct}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Plano Gráfico de Optimización Lineal (SVG) -->
  <div class="cardx mb-3">
    <div class="cardx-header">
      <h6><i class="bi bi-rulers text-primary"></i> Plano de Corte y Optimización Lineal (1D)</h6>
      <div class="d-flex gap-2 small">
        <span class="badge" style="background:#0284c7">Pieza a cortar</span>
        <span class="badge bg-success">Sobrante útil (&ge;500mm)</span>
        <span class="badge bg-danger">Descarte (&lt;500mm)</span>
      </div>
    </div>
    ${renderOptimizationVisual(r)}
  </div>

  <!-- Despiece Técnico + Vidrios y Accesorios -->
  <div class="row g-3">
    <div class="col-md-7">
      <div class="cardx h-100">
        <div class="cardx-header"><h6>Lista de Despiece de Perfiles</h6></div>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <tr><th>Pieza</th><th>Matriz</th><th>Cant.</th><th>Fórmula</th><th>Corte</th><th>Áng.</th></tr>
            ${r.rows.map(x => `
              <tr>
                <td>${x.p}</td>
                <td><span class="code-badge">${x.c}</span></td>
                <td class="mono fw-bold">${x.q}</td>
                <td><span class="formula-pill">${x.f}</span></td>
                <td class="mono fw-bold text-primary">${x.len} mm</td>
                <td class="mono small">${x.ang}</td>
              </tr>`).join('')}
          </table>
        </div>
      </div>
    </div>
    <div class="col-md-5">
      <div class="cardx h-100">
        <div class="cardx-header"><h6>Vidrios e Insumos (BOM)</h6></div>
        <ul class="list-group list-group-flush small">
          ${r.bom.glassQty > 0 ? `
          <li class="list-group-item d-flex justify-content-between px-0">
            <span><i class="bi bi-window text-info"></i> Vidrio (${r.bom.glassQty} paño/s):</span>
            <b class="mono">${r.bom.glassW} × ${r.bom.glassH} mm</b>
          </li>` : ''}
          <li class="list-group-item d-flex justify-content-between px-0">
            <span><i class="bi bi-bounding-box text-secondary"></i> Escuadras armado:</span>
            <b class="mono">${r.bom.escuadras} unid.</b>
          </li>
          <li class="list-group-item d-flex justify-content-between px-0">
            <span><i class="bi bi-bezier2 text-secondary"></i> Burlete / Felpa est.:</span>
            <b class="mono">${r.bom.felpaML} ml</b>
          </li>
          <li class="list-group-item d-flex justify-content-between px-0">
            <span><i class="bi bi-recycle text-success"></i> Nuevos sobrantes a guardar:</span>
            <b class="mono text-success">${r.generatedLeftsList.length} tramo(s)</b>
          </li>
        </ul>
      </div>
    </div>
  </div>`;

  $('#pv').innerHTML = h;
}

function saveJob() {
  const m = mod($('#fm').value), A = +$('#fa').value, H = +$('#fh').value;
  if (!$('#fn').value.trim() || !A || !H) return alert('Por favor, complete el nombre del producto y las dimensiones (Ancho y Alto).');
  const d = { cl: +$('#fc').value, name: $('#fn').value.trim(), sub: $('#fsub').value.trim(), mod: m.id, A, H, mat: $('#fx').value, date: $('#fd').value, obs: $('#fo').value };

  if (CJ.mode == 'edit') {
    Object.assign(DB.jobs.find(x => x.id == CJ.id), d);
  } else {
    const nextNum = 'OT-' + String(DB.jobs.length + 1).padStart(4, '0');
    const j = { id: DB.seq++, num: nextNum, st: 'Pendiente', ...d };
    DB.jobs.push(j);

    const r = calc(m, A, H, nextNum);

    // 1. Marcar como reutilizados los sobrantes consumidos
    r.usedLeftsList.forEach(ul => {
      const leftItem = DB.left.find(l => l.id == ul.fromLeftId);
      if (leftItem) leftItem.used = true;
    });

    // 2. Descontar barras comerciales nuevas del inventario
    for (const c in r.res) {
      const barsNeeded = r.res[c].n;
      if (barsNeeded > 0) {
        DB.mats[c] = Math.max(0, (DB.mats[c] || 0) - barsNeeded);
      }
    }

    // 3. Registrar los nuevos sobrantes recuperables (>= 500mm) en el banco independiente
    r.generatedLeftsList.forEach(gl => {
      DB.left.push({
        id: DB.seq++,
        c: gl.c,
        len: gl.len,
        mat: d.mat,
        job: nextNum,
        used: false
      });
    });
  }
  save();
  go('jobs');
}

function jobDet(id) {
  const j = DB.jobs.find(x => x.id == id), m = mod(j.mod);
  const r = calc(m, j.A, j.H, j.num);
  modal(`${j.num} · ${j.name} ${j.sub ? '(' + j.sub + ')' : ''}`, `
    <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-white rounded border">
      <div>
        <div class="fw-bold text-dark">${esc(cl(j.cl))} — ${m.name}</div>
        <div class="small text-muted mono">Medidas: ${dimTxt(j)} · Acabado: ${j.mat} · Fecha: ${j.date}</div>
      </div>
      <div>${stBadge(j.st)}</div>
    </div>
    ${renderOptimizationVisual(r)}`,
    `<select class="form-select w-auto" onchange="setSt(${id},this.value)">${['Pendiente', 'En producción', 'Terminado'].map(s => `<option ${s == j.st ? 'selected' : ''}>${s}</option>`).join('')}</select>
     <button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar Plano</button>`);
}

const setSt = (id, s) => { DB.jobs.find(j => j.id == id).st = s; save(); go(cur) };
function delJob(id) {
  const j = DB.jobs.find(x => x.id == id);
  modal('Confirmar eliminación', `¿Eliminar la orden de trabajo <b>${j.num} – ${esc(j.name)}</b>?`,
    `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button><button class="btn btn-danger" onclick="DB.jobs=DB.jobs.filter(x=>x.id!=${id});save();close();go(cur)">Eliminar</button>`, false);
}
const useLeft = id => { const l = DB.left.find(x => x.id == id); if (l) l.used = true; save(); go('left') };

function clientForm() {
  modal('Registrar Cliente / Obra', `
    <div class="row g-2">
      <div class="col-12"><input id="cn" class="form-control" placeholder="Razón Social o Nombre"></div>
      <div class="col-6"><input id="ct2" class="form-control" placeholder="Teléfono"></div>
      <div class="col-6"><input id="cd" class="form-control" placeholder="Localidad / Obra"></div>
    </div>`,
    `<button class="btn btn-primary" onclick="if(!$('#cn').value)return;DB.clients.push({id:Date.now(),n:$('#cn').value,t:$('#ct2').value,e:'',d:$('#cd').value});save();close();go('cli')">Guardar Cliente</button>`, false);
}
const cliDet = id => { const c = DB.clients.find(x => x.id == id); modal(c.n, `<p class="mono small">${esc(c.t)} · ${esc(c.d)}</p>${jobTable(DB.jobs.filter(j => j.cl == id), false)}`) };

load(); go('dash');
