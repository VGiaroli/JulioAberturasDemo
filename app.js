/* ===== AberturasPro – prototipo. Datos: ORIGINAL = Catálogo Línea Delta (Alcemar/Alsafex, 09-06-23). DEMO = ficticio. ===== */
const PDF='https://alsafex.com.ar/wp-content/uploads/2023/11/Catalogo_Linea_Delta.pdf';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* --- PERFILES (ORIGINAL: código, nombre, kg/m, largo barra según catálogo, página de detalle) --- */
const P=(c,n,kg,pg,use,bar=6150)=>[c,{c,n,kg,pg,use,bar}];
const PROF=Object.fromEntries([
P(668,'Marco VA/VB/PA/VV/PF',.66,9,'Marco: ventana de abrir D.C., banderola, puerta de abrir, ventiluz, paño fijo recto'),
P(662,'Marco ventana de abrir C.E.P.',.71,8,'Marco ventana de rebatir / oscilo-batiente / banderola C.E.P.'),
P(661,'Hoja curva ventana de abrir C.E.P.',.79,8,'Hoja ventana de abrir C.E.P.'),
P(636,'Encuentro central ventana de abrir C.E.P.',.92,8,'Ventanas de 2 hojas C.E.P.'),
P(629,'Travesaño angosto paño fijo (solo con marco 668)',.77,9,'Paño fijo',6030),
P(651,'Umbral y dintel (corrediza)',1.21,6,'Corrediza 2 pistas'),
P(655,'Jamba (corrediza)',.59,6,'Corrediza 2 pistas'),
P(653,'Parante lateral (corrediza)',.64,6,'Corrediza'),
P(654,'Parante central (corrediza)',.58,6,'Corrediza'),
P(652,'Zócalo (ventana corrediza)',.64,6,'Corrediza',6030),
P(660,'Zócalo puerta corrediza',1.26,6,'Puerta corrediza',6030),
P(677,'Parante lat. con tirador (puerta corrediza)',.79,6,'Puerta corrediza'),
P(638,'Travesaño (corrediza)',.70,6,'Corrediza',6030),
P(691,'Umbral y dintel 3 guías',1.83,5,'Corrediza 3 pistas'),
P(692,'Jamba 3 guías',.98,5,'Corrediza 3 pistas'),
P(685,'Mosquitero',.38,5,'Corrediza',6030),P(708,'Tope mosquitero',.19,5,'Corrediza',6030),
P(632,'Contravidrio recto 36 mm',.32,13,'Complemento (vidrio)',6030),P(633,'Contravidrio recto 22 mm',.26,13,'Complemento',6030),
P(645,'Contravidrio recto 15 mm',.21,13,'Complemento',6030),P(646,'Contravidrio recto 29 mm',.29,13,'Complemento',6030),
P(667,'Contravidrio curvo 29 mm',.21,13,'Complemento',6030),P(666,'Contravidrio curvo 15 mm',.16,13,'Complemento',6030),
P(695,'Hoja recta ventana de abrir D.C.',.86,9,'Doble contacto'),P(696,'Hoja curva ventana de abrir D.C.',.90,10,'Doble contacto'),
P(694,'Encuentro central D.C.',.80,11,'Doble contacto'),P(688,'Hoja recta ventiluz',.85,9,'Ventiluz'),
P(614,'Hoja de puerta s/contravidrio ext.',1.15,12,'Puerta de rebatir'),P(615,'Travesaño de puerta s/cv ext.',1.09,12,'Puerta de rebatir'),
P(616,'Zócalo de puerta s/cv ext.',1.29,12,'Puerta de rebatir'),P(669,'Zócalo de puerta',1.63,11,'Puerta de rebatir'),
P(670,'Travesaño de puerta',1.01,11,'Puerta de rebatir'),P(671,'Parante de puerta',.94,11,'Puerta de rebatir'),
P(675,'Hoja ventana proyectante/desplazable',1.07,13,'Desplazable'),P(676,'Marco ventana proyectante/desplazable',.72,13,'Desplazable'),
P(643,'Marco ventana guillotina',1.10,14,'Guillotina',6030),P(507,'Hoja ventana guillotina',.56,14,'Guillotina',6030),
P(657,'Contramarco',.19,15,'Complemento'),P(718,'Premarco',.33,15,'Complemento')
]);
/* --- MODELOS. parts: [pieza, cód. perfil, cant, fórmula(A,H), ángulos]. Fórmulas = LECTURA del catálogo (verificar contra la página) --- */
const M=(id,cat,name,pg,desc,o={})=>({id,cat,name,pg,desc,dims:['A','H'],parts:[],variants:[],...o});
const MODELS=[
M('pf','Paños fijos','Paño fijo recto',17,'Paño fijo con marco 668 y contravidrios.',{variants:['Recto','Curvo (p.17)'],parts:[['Marco ancho',668,2,'A','45°/45°'],['Marco alto',668,2,'H','45°/45°'],['Contravidrio recto (ver nota)',632,2,'A-51','45°/45°'],['Contravidrio recto (ver nota)',632,2,'H-51','45°/45°']]}),
M('vr1','Ventanas de rebatir','Ventana de rebatir 1 hoja C.E.P.',19,'Cámara ecualizadora de presiones.',{parts:[['Marco ancho',662,2,'A','45°/45°'],['Marco alto',662,2,'H','45°/45°'],['Hoja ancho',661,2,'A-39','45°/45°'],['Hoja alto',661,2,'H-39','45°/45°'],['Contravidrio recto ancho',632,2,'A-123','90°/90°'],['Contravidrio recto alto',632,2,'H-157','90°/90°']]}),
M('vr2','Ventanas de rebatir','Ventana de rebatir 2 hojas C.E.P.',21,'Dos hojas con encuentro central 636.',{codes:[662,661,636,632]}),
M('vr1d','Ventanas de rebatir','Ventana de rebatir 1 hoja Doble Contacto',27,'Hoja 695/696 o 639/640.',{codes:[668,695,696]}),
M('vo1','Ventanas oscilobatientes','Oscilo-batiente 1 hoja C.E.P.',23,'Ver cálculo de herrajes p.56.',{codes:[662,661]}),
M('vo2','Ventanas oscilobatientes','Oscilo-batiente 2 hojas C.E.P.',24,'Ver p.56.',{codes:[662,661,636]}),
M('vb','Ventanas banderola','Banderola C.E.P.',25,'Cierre banderola H-52.',{codes:[662,661]}),
M('vv','Ventanas ventiluz','Ventiluz Doble Contacto',35,'Hoja 688/637.',{codes:[668,688]}),
M('pr1','Puertas de rebatir','Puerta de rebatir 1 hoja D.C.',37,'Parante, zócalo y travesaño.',{codes:[668,671,669,670,614,615,616]}),
M('pr2','Puertas de rebatir','Puerta de rebatir 2 hojas D.C.',41,'Con encuentro 694.',{codes:[668,671,669,670,694]}),
M('c2','Ventanas y puertas corredizas','Ventana corrediza 2 pistas (vidrio simple)',43,'2 hojas, mosquitero opcional.',{variants:['Vidrio simple / laminado (p.43-44)','DVH (p.45-46)'],parts:[['Umbral y dintel',651,2,'A-42','90°/90°'],['Jamba',655,2,'H','90°/90°'],['Parante lateral',653,2,'H-79','90°/90°'],['Parante central',654,2,'H-79','90°/90°'],['Zócalo',652,4,'A/2-24','90°/90°']]}),
M('c2d','Ventanas y puertas corredizas','Corrediza 2 pistas DVH',45,'Parantes 665/664/687, zócalo 663.',{codes:[651,655,652]}),
M('c3','Ventanas y puertas corredizas','Corrediza 3 pistas',47,'Umbral 691, jamba 692.',{codes:[691,692,653,654,652]}),
M('dz','Ventanas desplazables','Ventana desplazable D.C.',51,'Marco 676, hoja 675.',{codes:[676,675]}),
M('gu','Ventanas guillotina','Guillotina auto-compensada',53,'Ancho 460–1200, alto 860–1500 mm.',{codes:[643,507]})];
const CATS=[...new Set(MODELS.map(m=>m.cat))];
/* --- cálculo: despiece + optimización de barras (first-fit decreasing) --- */
function calc(m,A,H){const rows=m.parts.map(([p,c,q,f,ang])=>({p,c,q,f,ang,len:Math.round(new Function('A','H','return '+f)(A,H))}));
 const by={};rows.forEach(r=>{(by[r.c]??=[]);for(let i=0;i<r.q;i++)by[r.c].push(r.len)});
 const res={};let used=0,w=0,bars=0;
 for(const c in by){const B=PROF[c].bar,list=by[c].sort((a,b)=>b-a),bs=[];list.forEach(l=>{const b=bs.find(x=>x.r>=l);b?(b.r-=l,b.u+=l):bs.push({r:B-l,u:l})});
  res[c]={bar:B,n:bs.length,left:bs.map(b=>b.r),used:list.reduce((a,b)=>a+b,0)};used+=res[c].used;bars+=bs.length;w+=res[c].used*PROF[c].kg/1000}
 return{rows,res,used,bars,w}}
/* --- persistencia --- */
const K='aberturaspro_v1';let DB;
const seed=()=>({clients:[{id:1,n:'Carpintería Rossi',t:'3562-441122',e:'rossi@mail.com',d:'Morteros'},{id:2,n:'María Fernández',t:'3562-559900',e:'',d:'San Francisco'},{id:3,n:'Constructora Delta Sur',t:'3564-120045',e:'obras@deltasur.com',d:'Rafaela'}],
 jobs:[{id:1,num:'T-0001',cl:1,name:'Ventana living',mod:'c2',A:2000,H:1100,mat:'Aluminio',date:'2026-10-02',st:'Terminado',obs:'',desc:'Corrediza 2 hojas'},
 {id:2,num:'T-0002',cl:2,name:'Ventana cocina',mod:'vr1',A:800,H:900,mat:'Aluminio',date:'2026-10-14',st:'Terminado',obs:'',desc:''},
 {id:3,num:'T-0003',cl:3,name:'Ventanal obra 12',mod:'c2',A:2400,H:1200,mat:'Aluminio',date:'2026-10-28',st:'En producción',obs:'Entrega urgente',desc:''},
 {id:4,num:'T-0004',cl:1,name:'Paño fijo vidriera',mod:'pf',A:1500,H:2000,mat:'Aluminio',date:'2026-11-03',st:'Pendiente',obs:'',desc:''}],
 mats:{668:12,662:10,661:10,651:8,655:8,653:9,654:9,652:7,632:15,657:6,636:4},
 left:[{id:1,c:655,len:1850,job:'T-0001',used:false},{id:2,c:651,len:2150,job:'T-0001',used:false},{id:3,c:662,len:3200,job:'T-0002',used:false},{id:4,c:653,len:900,job:'T-0003',used:true}],seq:5});
const load=()=>{try{DB=JSON.parse(localStorage.getItem(K))}catch{}DB??=seed()},save=()=>{try{localStorage.setItem(K,JSON.stringify(DB))}catch{}};
function resetDemo(){if(confirm('¿Restaurar datos de demostración?')){DB=seed();save();go(cur)}}
const cl=id=>DB.clients.find(c=>c.id==id)?.n||'—',mod=id=>MODELS.find(m=>m.id==id),dimTxt=j=>`${j.A} × ${j.H} mm`;
/* --- modal genérico --- */
let MB;const modal=(t,b,f='',lg=true)=>{MB??=new bootstrap.Modal('#m');$('#mt').textContent=t;$('#mb').innerHTML=b;$('#mf').innerHTML=f||'<button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>';document.querySelector('#m .modal-dialog').className='modal-dialog modal-dialog-scrollable '+(lg?'modal-xl':'');MB.show()},close=()=>MB.hide();
/* --- navegación --- */
const NAV=[['dash','Dashboard','speedometer2'],['jobs','Trabajos','clipboard-check'],['new','Nuevo trabajo','plus-circle'],['cat','Catálogo de modelos','grid-3x3'],['prof','Perfiles','rulers'],['mat','Materiales','box-seam'],['left','Sobrantes','scissors'],['cli','Clientes','people'],['hist','Historial','clock-history']];
let cur='dash',F='';
function go(v){cur=v;$('#nav').innerHTML=NAV.map(n=>`<a class="${n[0]==v?'on':''}" onclick="go('${n[0]}')"><i class="bi bi-${n[2]}"></i>${n[1]}</a>`).join('');$('#title').textContent=NAV.find(n=>n[0]==v)[1];
 if(v=='new')return newJob();$('#view').innerHTML=V[v]()}
const stBadge=s=>`<span class="badge bg-${{Pendiente:'warning text-dark','En producción':'primary',Terminado:'success'}[s]}">${s}</span>`;
const DEMO='<span class="tag demo">DEMO</span>',ORIG='<span class="tag orig">Catálogo</span>';
const V={
dash(){const pend=DB.jobs.filter(j=>j.st!='Terminado').length,free=DB.left.filter(l=>!l.used).length;
 const S=(i,l,v)=>`<div class="col-md-4 col-xl-2"><div class="cardx stat"><i class="bi bi-${i}"></i><div><b>${v}</b><span class="text-muted">${l}</span></div></div></div>`;
 return`<div class="row g-3 mb-4">${S('check2-square','Trabajos',DB.jobs.length)+S('hourglass-split','Pendientes',pend)+S('people','Clientes',DB.clients.length)+S('box-seam','Barras en stock',Object.values(DB.mats).reduce((a,b)=>a+b,0))+S('scissors','Sobrantes libres',free)}</div>
 <div class="cardx"><h6>Últimos trabajos</h6>${jobTable(DB.jobs.slice(-5).reverse(),false)}</div>`},
jobs(){const q=F.toLowerCase();const L=DB.jobs.filter(j=>[j.num,cl(j.cl),j.name,mod(j.mod)?.name,dimTxt(j)].join(' ').toLowerCase().includes(q));
 return`<div class="d-flex gap-2 mb-3"><input class="form-control" style="max-width:380px" placeholder="Buscar por cliente, producto, modelo o medidas…" value="${esc(F)}" oninput="F=this.value;$('#jt').innerHTML=jobTable(DB.jobs.filter(j=>[j.num,cl(j.cl),j.name,mod(j.mod)?.name,dimTxt(j)].join(' ').toLowerCase().includes(F.toLowerCase())),true)"><button class="btn btn-primary ms-auto" onclick="go('new')"><i class="bi bi-plus-lg"></i> Nuevo trabajo</button></div><div class="cardx" id="jt">${jobTable(L,true)}</div>`},
cat(){return`<div class="alert-demo mb-3">Esquemas ilustrativos propios (${DEMO}). Los dibujos técnicos originales se consultan en el PDF del catálogo (botón “Ver página”). No todos los modelos son necesariamente fabricados por la empresa.</div>`+CATS.map(c=>`<div class="cat">${c}</div><div class="row g-3">${MODELS.filter(m=>m.cat==c).map(m=>`<div class="col-md-4 col-xl-3"><div class="mcard">${draw(m)}<div class="b"><b>${m.name}</b><div class="text-muted small">${m.cat} · p.${m.pg}</div><p class="small mb-1">${m.desc}</p>${m.parts.length?'<span class="tag">Con cálculo demo</span>':'<span class="tag" style="background:#eee;color:#555">Sin fórmulas cargadas</span>'}</div><div class="p-2 d-flex gap-2"><button class="btn btn-sm btn-outline-primary flex-fill" onclick="detail('${m.id}')">Detalle</button><button class="btn btn-sm btn-primary flex-fill" onclick="newJob('${m.id}')">Seleccionar</button></div></div></div>`).join('')}</div>`).join('')},
prof(){return`<input class="form-control mb-3" style="max-width:380px" placeholder="Buscar por código, nombre, descripción o uso…" oninput="profT(this.value)"><div class="cardx" id="pt">${profTable('')}</div>`},
mat(){return`<div class="alert-demo mb-3">Perfiles y pesos: ${ORIG} · Cantidades en stock: ${DEMO}</div><div class="cardx"><table class="table"><tr><th>Código</th><th>Nombre</th><th>Tipo</th><th>Barra (mm)</th><th>Disponible</th><th>Unidad</th></tr>${Object.entries(DB.mats).map(([c,q])=>`<tr><td><b>${c}</b></td><td>${PROF[c]?.n}</td><td>Aluminio</td><td>${PROF[c]?.bar}</td><td>${q}</td><td>barras</td></tr>`).join('')}</table></div>`},
left(){return`<input class="form-control mb-3" style="max-width:300px" placeholder="Buscar por perfil…" oninput="leftT(this.value)"><div class="cardx" id="lt">${leftTable('')}</div>`},
cli(){return`<div class="d-flex mb-3 gap-2"><input class="form-control" style="max-width:340px" placeholder="Buscar por nombre o teléfono…" oninput="cliT(this.value)"><button class="btn btn-primary ms-auto" onclick="clientForm()"><i class="bi bi-plus-lg"></i> Nuevo cliente</button></div><div class="cardx" id="ct">${cliTable('')}</div>`},
hist(){return`<div class="cardx">${jobTable([...DB.jobs].sort((a,b)=>b.date.localeCompare(a.date)),true)}</div>`}};
const profTable=q=>{q=q.toLowerCase();return`<table class="table"><tr><th>Código</th><th>Nombre</th><th>kg/m (±10%)</th><th>Barra</th><th>Uso</th><th>Modelos con cálculo</th><th></th></tr>${Object.values(PROF).filter(p=>(p.c+p.n+p.use).toLowerCase().includes(q)).map(p=>`<tr><td><b>${p.c}</b></td><td>${p.n}</td><td>${p.kg}</td><td>${p.bar} mm</td><td>${p.use}</td><td>${MODELS.filter(m=>m.parts.some(x=>x[1]==p.c)).map(m=>m.name).join(', ')||'—'}</td><td><button class="btn btn-sm btn-outline-secondary" onclick="viewer(${p.pg})">Sección p.${p.pg}</button></td></tr>`).join('')}</table>`},
profT=q=>$('#pt').innerHTML=profTable(q);
const leftTable=q=>`<table class="table"><tr><th>Perfil</th><th>Nombre</th><th>Longitud</th><th>Origen</th><th>Estado</th><th></th></tr>${DB.left.filter(l=>(l.c+PROF[l.c].n).toLowerCase().includes(q.toLowerCase())).map(l=>`<tr><td><b>${l.c}</b></td><td>${PROF[l.c].n}</td><td>${l.len} mm</td><td>${l.job}</td><td>${l.used?'<span class="badge bg-secondary">Utilizado</span>':'<span class="badge bg-success">Disponible</span>'}</td><td>${l.used?'':`<button class="btn btn-sm btn-outline-primary" onclick="useLeft(${l.id})">Marcar utilizado</button>`}</td></tr>`).join('')}</table><small class="text-muted">Verificar compatibilidad (perfil y largo) antes de reutilizar.</small>`,leftT=q=>$('#lt').innerHTML=leftTable(q);
const cliTable=q=>`<table class="table"><tr><th>Nombre</th><th>Teléfono</th><th>Localidad</th><th>Trabajos</th><th></th></tr>${DB.clients.filter(c=>(c.n+c.t).toLowerCase().includes(q.toLowerCase())).map(c=>`<tr><td>${esc(c.n)}</td><td>${esc(c.t)}</td><td>${esc(c.d)}</td><td>${DB.jobs.filter(j=>j.cl==c.id).map(j=>j.num).join(', ')||'—'}</td><td><button class="btn btn-sm btn-outline-secondary" onclick="cliDet(${c.id})">Ver</button></td></tr>`).join('')}</table>`,cliT=q=>$('#ct').innerHTML=cliTable(q);
function jobTable(L,act=true){return`<table class="table align-middle"><tr><th>N°</th><th>Cliente</th><th>Producto</th><th>Modelo</th><th>Medidas</th><th>Fecha</th><th>Estado</th>${act?'<th></th>':''}</tr>${L.map(j=>`<tr><td><b>${j.num}</b></td><td>${esc(cl(j.cl))}</td><td>${esc(j.name)}</td><td>${mod(j.mod)?.name}</td><td>${dimTxt(j)}</td><td>${j.date}</td><td>${stBadge(j.st)}</td>${act?`<td class="text-nowrap"><button class="btn btn-sm btn-outline-secondary" title="Detalle" onclick="jobDet(${j.id})"><i class="bi bi-eye"></i></button> <button class="btn btn-sm btn-outline-secondary" title="Editar" onclick="newJob(null,${j.id},'edit')"><i class="bi bi-pencil"></i></button> <button class="btn btn-sm btn-outline-primary" title="Reutilizar" onclick="newJob(null,${j.id},'reuse')"><i class="bi bi-copy"></i></button> <button class="btn btn-sm btn-outline-danger" title="Eliminar" onclick="delJob(${j.id})"><i class="bi bi-trash"></i></button></td>`:''}</tr>`).join('')}</table>`}
/* --- esquema ilustrativo (NO es el dibujo del catálogo) --- */
function draw(m){const sl=/corredi/i.test(m.name),two=/2 hojas|2 pistas|3 pistas/.test(m.name),fixed=m.id=='pf';
 return`<svg viewBox="0 0 200 110"><rect x="40" y="10" width="120" height="90" fill="#fff" stroke="#14213d" stroke-width="3"/>${fixed?'<rect x="50" y="20" width="100" height="70" fill="#dbeafe" stroke="#64748b"/>':two||sl?'<rect x="48" y="18" width="52" height="74" fill="#dbeafe" stroke="#64748b"/><rect x="100" y="18" width="52" height="74" fill="#cfe0fb" stroke="#64748b"/>':'<rect x="50" y="20" width="100" height="70" fill="#dbeafe" stroke="#64748b"/><path d="M50 20L150 55L50 90" fill="none" stroke="#2563eb" stroke-dasharray="4"/>'}</svg>`}
const viewer=p=>modal('Catálogo Línea Delta – página '+p,`<div class="small text-muted mb-2">Si el visor no carga (el sitio puede bloquear incrustación), <a href="${PDF}#page=${p}" target="_blank">abrir el PDF original</a>.</div><iframe src="${PDF}#page=${p}" style="width:100%;height:70vh;border:1px solid #ddd"></iframe>`);
function detail(id){const m=mod(id);const codes=m.parts.length?[...new Set(m.parts.map(p=>p[1]))]:m.codes||[];
 modal(m.name,`<div class="row"><div class="col-md-4">${draw(m).replace('class','x')}<div class="small text-muted text-center">Esquema ilustrativo ${DEMO}</div></div><div class="col-md-8"><p>${m.desc} <b>Página del catálogo: ${m.pg}</b></p>${m.variants.length?`<p><b>Variantes:</b> ${m.variants.join(' · ')}</p>`:''}<b>Perfiles asociados ${ORIG}</b><table class="table"><tr><th>Código</th><th>Perfil</th><th>kg/m</th></tr>${codes.map(c=>`<tr><td><b>${c}</b></td><td>${PROF[c]?.n||'(ver catálogo)'}</td><td>${PROF[c]?.kg??'—'}</td></tr>`).join('')}</table><p><b>Medidas necesarias:</b> Ancho (A) y Alto (H) en mm.</p>${m.parts.length?'':'<div class="alert-demo">Fórmulas de corte aún no cargadas; la estructura está lista (ver <code>MODELS</code> en app.js).</div>'}</div></div>`,
 `<button class="btn btn-outline-secondary" onclick="viewer(${m.pg})">Ver página del catálogo</button><button class="btn btn-primary" onclick="close();newJob('${m.id}')">Usar en nuevo trabajo</button>`)}
/* --- formulario de trabajo (nuevo / editar / reutilizar). La reutilización guarda SIEMPRE un registro nuevo --- */
function newJob(mid,jid,mode='new'){const j=jid?{...DB.jobs.find(x=>x.id==jid)}:{cl:DB.clients[0].id,name:'',mod:mid||MODELS.find(m=>m.parts.length).id,A:2000,H:800,mat:'Aluminio',date:new Date().toISOString().slice(0,10),st:'Pendiente',obs:'',desc:''};if(mid)j.mod=mid;
 if(cur!='new'){cur='new';go('new');return newJob(mid,jid,mode)}
 window.CJ={j,mode,id:jid};
 const ttl={new:'Nuevo trabajo',edit:'Editar '+j.num,reuse:'Reutilizar '+j.num+' (se creará un trabajo nuevo; el original no se modifica)'}[mode];
 $('#title').textContent=ttl.slice(0,40);
 $('#view').innerHTML=`<div class="row g-3"><div class="col-lg-5"><div class="cardx"><h6>${ttl}</h6><div class="row g-2">
 <div class="col-12"><label>Cliente</label><select id="fc" class="form-select">${DB.clients.map(c=>`<option value="${c.id}" ${c.id==j.cl?'selected':''}>${esc(c.n)}</option>`).join('')}</select></div>
 <div class="col-12"><label>Nombre del trabajo</label><input id="fn" class="form-control" value="${esc(j.name)}" placeholder="Ej: Ventana dormitorio"></div>
 <div class="col-12"><label>Tipo / Modelo ${ORIG}</label><div class="input-group"><select id="fm" class="form-select" onchange="CJ.j.mod=this.value;preview()">${CATS.map(c=>`<optgroup label="${c}">${MODELS.filter(m=>m.cat==c).map(m=>`<option value="${m.id}" ${m.id==j.mod?'selected':''}>${m.name}</option>`).join('')}</optgroup>`).join('')}</select><button class="btn btn-outline-secondary" onclick="detail($('#fm').value)">Ref.</button></div></div>
 <div class="col-6"><label>Ancho (A) mm</label><input id="fa" type="number" class="form-control" value="${j.A}" oninput="preview()"></div><div class="col-6"><label>Alto (H) mm</label><input id="fh" type="number" class="form-control" value="${j.H}" oninput="preview()"></div>
 <div class="col-6"><label>Material</label><select id="fx" class="form-select"><option>Aluminio</option><option ${j.mat=='Madera'?'selected':''}>Madera</option></select></div><div class="col-6"><label>Fecha</label><input id="fd" type="date" class="form-control" value="${j.date}"></div>
 <div class="col-12"><label>Descripción / Observaciones</label><textarea id="fo" class="form-control" rows="2">${esc(j.obs)}</textarea></div></div>
 <div class="mt-3 d-flex gap-2"><button class="btn btn-primary" onclick="saveJob()"><i class="bi bi-check2"></i> Guardar trabajo</button><button class="btn btn-outline-secondary" onclick="go('jobs')">Cancelar</button></div></div></div>
 <div class="col-lg-7"><div id="pv"></div></div></div>`;preview()}
function preview(){const m=mod($('#fm').value),A=+$('#fa').value,H=+$('#fh').value;let h=`<div class="cardx mb-3"><div class="row"><div class="col-4">${draw(m)}</div><div class="col-8"><b>${m.name}</b><p class="small mb-1">${m.desc}</p><button class="btn btn-sm btn-outline-secondary" onclick="viewer(${m.pg})">Ver página ${m.pg} del catálogo</button></div></div></div>`;
 if(!m.parts.length)h+=`<div class="alert-demo">Este modelo no tiene fórmulas de corte cargadas todavía. Se puede guardar el trabajo igualmente.</div>`;
 else{const r=calc(m,A,H);h+=`<div class="cardx"><h6>Despiece y cortes</h6><div class="alert-demo mb-2">Cálculo ${DEMO}: fórmulas transcriptas del catálogo (p.${m.pg}), <b>verificar con prototipo</b> antes de producir (el catálogo lo indica). No es salida oficial.</div>
 <div style="max-height:260px;overflow:auto"><table class="table table-sm"><tr><th>Pieza</th><th>Perfil</th><th>Cant.</th><th>Fórmula</th><th>Corte</th><th>Áng.</th></tr>${r.rows.map(x=>`<tr><td>${x.p}</td><td>${x.c}</td><td>${x.q}</td><td class="text-muted">${x.f}</td><td><b>${x.len} mm</b></td><td>${x.ang}</td></tr>`).join('')}</table></div>
 <hr><b>Resumen de materiales</b><table class="table table-sm"><tr><th>Perfil</th><th>Barras</th><th>Usado</th><th>Sobrantes (mm)</th></tr>${Object.entries(r.res).map(([c,v])=>`<tr><td>${c} ${PROF[c].n}</td><td>${v.n} × ${v.bar}</td><td>${v.used}</td><td>${v.left.join(', ')}</td></tr>`).join('')}</table>
 <div class="small">Total barras: <b>${r.bars}</b> · Longitud usada: <b>${r.used} mm</b> · Peso aprox.: <b>${r.w.toFixed(2)} kg</b></div></div>`}
 const sim=DB.jobs.filter(j=>j.id!=CJ.id&&j.mod==m.id&&Math.abs(j.A-A)<=200&&Math.abs(j.H-H)<=200);
 if(sim.length)h+=`<div class="cardx mt-3"><b>Trabajos similares (±200 mm)</b>${sim.map(j=>`<div class="d-flex justify-content-between border-top pt-2 mt-2"><span>${j.num} · ${esc(cl(j.cl))} · ${dimTxt(j)}</span><button class="btn btn-sm btn-outline-primary" onclick="newJob(null,${j.id},'reuse')">Reutilizar</button></div>`).join('')}</div>`;$('#pv').innerHTML=h}
function saveJob(){const m=mod($('#fm').value),A=+$('#fa').value,H=+$('#fh').value;if(!$('#fn').value.trim()||!A||!H)return alert('Completá nombre y medidas.');
 const d={cl:+$('#fc').value,name:$('#fn').value,mod:m.id,A,H,mat:$('#fx').value,date:$('#fd').value,obs:$('#fo').value};
 if(CJ.mode=='edit')Object.assign(DB.jobs.find(x=>x.id==CJ.id),d);
 else{const id=DB.seq++;const j={id,num:'T-'+String(DB.jobs.length+1).padStart(4,'0'),st:'Pendiente',desc:'',...d};DB.jobs.push(j);
  if(m.parts.length){const r=calc(m,A,H);for(const c in r.res){DB.mats[c]=Math.max(0,(DB.mats[c]||0)-r.res[c].n);r.res[c].left.filter(l=>l>=300).forEach(l=>DB.left.push({id:DB.seq++,c:+c,len:l,job:j.num,used:false}))}}}
 save();go('jobs')}
function jobDet(id){const j=DB.jobs.find(x=>x.id==id),m=mod(j.mod);let r=m.parts.length?calc(m,j.A,j.H):null;
 modal(j.num+' · '+j.name,`<p>${esc(cl(j.cl))} · ${m.name} · ${dimTxt(j)} · ${j.date} ${stBadge(j.st)}</p>${r?`<table class="table table-sm"><tr><th>Pieza</th><th>Perfil</th><th>Cant.</th><th>Corte</th></tr>${r.rows.map(x=>`<tr><td>${x.p}</td><td>${x.c}</td><td>${x.q}</td><td>${x.len} mm</td></tr>`).join('')}</table><div class="small">Barras: ${r.bars} · Usado: ${r.used} mm · ${r.w.toFixed(2)} kg ${DEMO}</div>`:'<i>Sin fórmulas cargadas para este modelo.</i>'}`,
 `<select class="form-select w-auto" onchange="setSt(${id},this.value)">${['Pendiente','En producción','Terminado'].map(s=>`<option ${s==j.st?'selected':''}>${s}</option>`).join('')}</select><button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>`)}
const setSt=(id,s)=>{DB.jobs.find(j=>j.id==id).st=s;save();go(cur)};
function delJob(id){const j=DB.jobs.find(x=>x.id==id);modal('Confirmar eliminación',`¿Eliminar el trabajo <b>${j.num} – ${esc(j.name)}</b>? Esta acción no se puede deshacer.`,`<button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button><button class="btn btn-danger" onclick="DB.jobs=DB.jobs.filter(x=>x.id!=${id});save();close();go(cur)">Eliminar</button>`,false)}
const useLeft=id=>{DB.left.find(l=>l.id==id).used=true;save();go('left')};
function clientForm(){modal('Registrar cliente',`<div class="row g-2"><div class="col-12"><input id="cn" class="form-control" placeholder="Nombre"></div><div class="col-6"><input id="ct2" class="form-control" placeholder="Teléfono"></div><div class="col-6"><input id="cd" class="form-control" placeholder="Localidad"></div></div>`,`<button class="btn btn-primary" onclick="if(!$('#cn').value)return;DB.clients.push({id:Date.now(),n:$('#cn').value,t:$('#ct2').value,e:'',d:$('#cd').value});save();close();go('cli')">Guardar</button>`,false)}
const cliDet=id=>{const c=DB.clients.find(x=>x.id==id);modal(c.n,`<p>${esc(c.t)} · ${esc(c.d)}</p>${jobTable(DB.jobs.filter(j=>j.cl==id),false)}`)};
load();go('dash');
