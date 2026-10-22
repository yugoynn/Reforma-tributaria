/* ============================================================
   APP — liga o modelo à interface (tudo reativo aos sliders)
   ============================================================ */

/* ---------- estado ---------- */
const BASE = {...PRESETS.base};
let cur = {...PRESETS.base};       // "Meu Cenário" (o que os sliders controlam)
let savedScenarios = [
  {nome:'Reforma Base', params:{...PRESETS.base}, data:'20/05/2026', atual:true},
];
let charts = {};

/* ---------- formatação pt-BR ---------- */
const nfMi  = new Intl.NumberFormat('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1});
const nfMi0 = new Intl.NumberFormat('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0});
const nfBi = new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const money = (r)=> Math.abs(r)>=1e9 ? 'R$ '+nfBi.format(r/1e9)+' bi' : 'R$ '+nfMi.format(r/1e6)+' mi';   // R$ 365,3 mi · R$ 27,72 bi
const moneySig = (r)=> (r>=0?'+ ':'- ')+money(Math.abs(r));
const pct  = (x,d=1)=> new Intl.NumberFormat('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(x)+'%';
const pctSig=(x,d=1)=> (x>=0?'+ ':'- ')+new Intl.NumberFormat('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Math.abs(x))+'%';
const num1 = (x)=> nfMi.format(x);

/* ---------- title case p/ nomes de municípios (dados vêm em CAIXA ALTA) ---------- */
const MINOR={'de':1,'da':1,'do':1,'das':1,'dos':1,'e':1};
function tc(s){return String(s).toLowerCase().split(' ').map((w,i)=>MINOR[w]&&i>0?w:(w.charAt(0).toUpperCase()+w.slice(1))).join(' ');}
function munLabel(cod){return tc(REFORMA.nome(cod))+' - SC';}

/* ---------- tab switching ---------- */
const navItems=document.querySelectorAll('.nav-item');
const views={overview:document.getElementById('view-overview'),simulator:document.getElementById('view-simulator'),oficial:document.getElementById('view-oficial'),comparacao:document.getElementById('view-comparacao'),mapa:document.getElementById('view-mapa'),transicao:document.getElementById('view-transicao'),estrutura:document.getElementById('view-estrutura'),setorial:document.getElementById('view-setorial'),benchmark:document.getElementById('view-benchmark'),metodologia:document.getElementById('view-metodologia'),investimento:document.getElementById('view-investimento')};
const bMet=document.getElementById('btn-metod'), bExp=document.getElementById('btn-export');
const ic1=document.getElementById('ic-1');
const scenWrap=document.getElementById('scen-wrap');
let curView='overview';

function setView(v){
  if(!views[v]) v='overview';
  curView=v;
  Object.keys(views).forEach(k=>views[k].classList.toggle('hidden',k!==v));
  bMet&&bMet.classList.toggle('hidden',v!=='overview');
  bExp&&bExp.classList.toggle('hidden',v==='overview');
  ic1&&ic1.classList.toggle('hidden',v!=='overview');
  scenWrap.classList.toggle('hidden',v==='oficial'||v==='comparacao');
  if(v==='oficial') renderOficial();
  if(v==='comparacao') renderComparacao();
  if(v==='mapa' && typeof renderMapaRisco==='function') renderMapaRisco();
  if(v==='transicao' && typeof renderTransicao==='function') renderTransicao();
  if(v==='estrutura' && typeof renderEstrutura==='function') renderEstrutura();
  if(v==='setorial' && typeof renderSetorial==='function') renderSetorial();
  if(v==='benchmark' && typeof renderBenchmark==='function') renderBenchmark();
  if(v==='metodologia' && typeof renderMetodologia==='function') renderMetodologia();
  if(v==='investimento' && typeof renderInvestimento==='function') renderInvestimento();
  requestAnimationFrame(()=>Object.values(charts).forEach(c=>c&&c.resize()));
}
function scrollToSel(id){
  if(!id){window.scrollTo({top:0,behavior:'smooth'});return;}
  const el=document.getElementById(id);
  if(el) requestAnimationFrame(()=>el.scrollIntoView({behavior:'smooth',block:'start'}));
}
// Clique numa aba: marca SOMENTE ela e vai para a visão/seção correta
navItems.forEach(n=>n.addEventListener('click',()=>{
  navItems.forEach(x=>x.classList.remove('active'));
  n.classList.add('active');
  setView(n.dataset.view||'overview');
  if(n.dataset.metod){ openMetod(); return; }
  scrollToSel(n.dataset.scroll);
}));
document.querySelectorAll('[data-goto]').forEach(el=>el.addEventListener('click',()=>{
  setView(el.dataset.goto);
  navItems.forEach(x=>x.classList.toggle('active', x.dataset.view===el.dataset.goto && !x.dataset.scroll));
}));

/* ---------- Chart.js defaults ---------- */
Chart.defaults.font.family="'Inter',sans-serif";
Chart.defaults.font.size=10.5;
Chart.defaults.color='#71808f';
const gridClr='#eef0f4';
const C={teal:'#2f5d57',salmon:'#dcc2be',blue:'#2f4566',coral:'#7a3b35',purple:'#4b3a6b',muted:'#9aa6b2',dark:'#33363d',navy:'#2f4566'};
/* paleta de LINHAS — cores bem distintas p/ não confundir séries sobrepostas */
const LC={meu:'#2f4566',sem:'#64748b',otim:'#4b3a6b',cons:'#7a5a2e',teal:'#0f9d8c',green:'#3d5a45'};

/* ============================================================
   RENDER — recalcula tudo a partir de `cur` e do cenário base
   ============================================================ */
function render(){
  document.querySelectorAll('.yr').forEach(e=>e.textContent=CTX.ano);
  const munNm=munLabel(CTX.cod);
  set('ov-sub','Impacto estimado da Reforma Tributária para '+munNm);
  set('ov-map-name',munNm);
  const meu  = calcular(cur);
  const base = calcular(BASE);
  renderOverview(meu, base);
  renderSimulator(meu, base);
  updateCharts(meu, base);
  syncScenSelect();
  if(curView==='oficial') renderOficial();
  if(curView==='comparacao') renderComparacao();
  if(curView==='mapa' && typeof renderMapaRisco==='function') renderMapaRisco();
  if(curView==='transicao' && typeof renderTransicao==='function') renderTransicao();
  if(curView==='estrutura' && typeof renderEstrutura==='function') renderEstrutura();
  if(curView==='setorial' && typeof renderSetorial==='function') renderSetorial();
  if(curView==='benchmark' && typeof renderBenchmark==='function') renderBenchmark();
  if(curView==='investimento' && typeof renderInvestimento==='function') renderInvestimento();
}

/* sincroniza o seletor de cenário da topbar com o cenário atual */
function syncScenSelect(){
  const sel=document.getElementById('tb-scen-select'); if(!sel) return;
  let val='custom';
  for(const k of ['conservador','base','otimista']) if(sameParams(cur,PRESETS[k])) val=k;
  sel.value=val;
}

function presetLabel(p){
  for(const [k,v] of Object.entries(PRESETS)){
    if(sameParams(p,v)) return k==='base'?'Cenário Base':(k==='otimista'?'Cenário Otimista':'Cenário Conservador');
  }
  return 'Meu Cenário';
}
function sameParams(a,b){return ['eco','cons','pop','ibs','loc'].every(k=>Math.abs(a[k]-b[k])<1e-9);}

/* ---------- OVERVIEW ---------- */
function renderOverview(m, base){
  set('ov-sem', money(m.sem33));
  set('ov-com', money(m.com33));
  set('ov-imp', moneySig(m.impacto));
  set('ov-imp-pct', pctSig(m.impactoPct));
  set('ov-eq', pct(m.eq,2));
  set('ov-eq2', pct(m.eq,2));
  set('ov-eq-ibs', pct(cur.ibs,2));
  const diff=m.eq-cur.ibs;
  document.getElementById('ov-eq-diff').innerHTML='Diferença<br>'+(diff>=0?'+':'')+num1(diff)+' p.p '+(diff>=0?'↑':'↓');
  setRisco('ov-risco', m.risco);
  set('ov-explain', `A Reforma Tributária deve ${m.impacto<0?'reduzir':'aumentar'} a receita de ${tc(REFORMA.nome(CTX.cod))} em ${pct(Math.abs(m.impactoPct))} até ${CTX.ano}, neste cenário${CTX.seguro?' (com seguro-receita)':''}. A alíquota de IBS total de equilíbrio estimada é ${pct(m.eq,2)}.`);
  set('ov-acc', moneySig(m.acumulado).replace('+ ','+ ').replace('- ','- '));

  // mini simulador table
  const rows=[
    ['Crescimento econômico (anual)','eco',pct(BASE.eco),pct(cur.eco)],
    ['Crescimento do consumo (anual)','cons',pct(BASE.cons),pct(cur.cons)],
    ['Crescimento populacional (anual)','pop',pct(BASE.pop),pct(cur.pop)],
    ['IBS - alíquota (hipótese)','ibs',pct(BASE.ibs,2),pct(cur.ibs,2)],
    ['Participação do consumo local','loc',pct(BASE.loc,0),pct(cur.loc,0)],
  ];
  document.getElementById('ov-sim-tbody').innerHTML = rows.map(([lab,k,b,v])=>{
    const arrow = cur[k]>BASE[k]?'<span class="up">↑</span>':(cur[k]<BASE[k]?'<span style="color:var(--coral)">↓</span>':'');
    return `<tr><td>${lab}</td><td class="r">${b}</td><td class="r acc">${v} ${arrow}</td></tr>`;
  }).join('');

  set('ov-r-base', money(base.com33));
  set('ov-r-meu',  money(m.com33));
  const efeito=m.com33-base.com33, efPct=base.com33? (efeito/base.com33*100):0;
  document.getElementById('ov-r-efeito').innerHTML = moneySig(efeito)+' <span style="font-size:10px">'+pctSig(efPct)+'</span>';

  // map info
  setRisco('ov-map-risk', m.risco, true);
  set('ov-map-pct', pctSig(m.impactoPct));
  set('ov-map-fin', moneySig(m.impacto));


  // pills active
  document.querySelectorAll('#ov-pills .pill').forEach(p=>p.classList.toggle('sel', p.dataset.preset && sameParams(cur,PRESETS[p.dataset.preset])));

  renderBenchmarking(m);
  renderPlan(m);
  updateMapa();
  renderPanorama();
}

function renderBenchmarking(m){
  // Ranking REAL dos 295 municípios (ano e IBS correntes). Mostra os 2 mais
  // favoráveis, o município selecionado, os 2 mais afetados e o total de SC.
  const rk=REFORMA.ranking(CTX.ano, cur.ibs/100, CTX.seguro).sort((a,b)=>b.variacao-a.variacao);
  const selIdx=rk.findIndex(x=>x.cod===CTX.cod);
  const idxs=[...new Set([0,1,selIdx,rk.length-2,rk.length-1])].filter(i=>i>=0&&i<rk.length).sort((a,b)=>a-b);
  const rows=idxs.map(i=>rk[i]);
  const sc=REFORMA.totalSC(CTX.ano, cur.ibs/100, CTX.seguro);
  const scRisco=REFORMA.classificar(sc.variacao*100);
  const tb=document.getElementById('bench-tbody');
  let html=rows.map(r=>{
    const me=r.cod===CTX.cod;
    return `<tr class="${me?'me':''}"><td>${tc(r.nome)}</td>`+
      `<td class="${r.variacao<0?'neg':'pos'}">${pctSig(r.variacao*100)}</td>`+
      `<td class="${r.impacto<0?'neg':'pos'}">${num1(r.impacto/1e6)}</td>`+
      `<td>${isFinite(r.eq)?pct(r.eq,2):'–'}</td>`+
      `<td><span class="rk ${r.risco}">${cap(r.risco)}</span></td>`+
      `<td>R$ ${nfMi0.format(r.perCapita)}</td></tr>`;
  }).join('');
  html+=`<tr class="me" style="border-top:2px solid var(--border)"><td><b>SC — soma dos 295</b></td>`+
    `<td class="${sc.variacao<0?'neg':'pos'}">${pctSig(sc.variacao*100)}</td>`+
    `<td class="${sc.impacto<0?'neg':'pos'}">${num1(sc.impacto/1e6)}</td>`+
    `<td>–</td><td><span class="rk ${scRisco}">${cap(scRisco)}</span></td><td>–</td></tr>`;
  tb.innerHTML=html;
}
function cap(s){return s.charAt(0)+s.slice(1).toLowerCase();}

function renderPlan(m){
  setRisco('plan-risco', m.risco);
  set('plan-imp', pctSig(m.impactoPct)+' em 2033');
  set('plan-imp2', '('+moneySig(m.impacto)+')');
}

/* ---------- SIMULATOR ---------- */
function renderSimulator(m, base){
  set('sim-com', money(m.com33));
  set('sim-sem', money(m.sem33));
  set('sim-imp', moneySig(m.impacto));
  set('sim-imp-pct', pctSig(m.impactoPct));
  set('sim-eq', pct(m.eq,2));
  setRisco('sim-risco', m.risco);
  // color of impact stats
  const good = m.impacto>=0;
  document.getElementById('sim-imp').className='v '+(good?'v-teal':'v-coral');
  document.getElementById('sim-imp-pct').className='v '+(good?'v-teal':'v-coral');

  // comparison table (all presets + meu)
  const conser=calcular(PRESETS.conservador), otim=calcular(PRESETS.otimista);
  const semBase=base.sem33;
  const rows=[
    ['Sem reforma (cenário base)', semBase, null, null, ''],
    ['Cenário Otimista', otim.com33, otim.com33-semBase, (otim.com33-semBase)/semBase*100, 'nm-otim'],
    ['Meu Cenário (atual)', m.com33, m.impacto, m.impactoPct, 'nm-base'],
    ['Cenário Conservador', conser.com33, conser.com33-semBase, (conser.com33-semBase)/semBase*100, 'nm-cons'],
  ];
  document.getElementById('cmp-tbody').innerHTML=rows.map(([nm,rev,imp,ip,cls])=>{
    const impCell = imp===null?'–':`<span class="${imp<0?'neg':'pos'}">${moneyShort(imp)}</span>`;
    const ipCell  = ip===null?'–':`<span class="${ip<0?'neg':'pos'}">${pctSig(ip)}</span>`;
    return `<tr><td class="${cls}">${nm}</td><td>${num1(rev/1e6)}</td><td>${impCell}</td><td>${ipCell}</td></tr>`;
  }).join('');

  // sensitivity table
  const s=sensibilidade(cur);
  const sr=[['Crescimento econômico',s.eco],['Crescimento do consumo',s.cons],['Alíquota de IBS',s.ibs]];
  document.getElementById('sens-tbody').innerHTML=sr.map(([lab,arr])=>{
    return `<tr><td>${lab}</td>`+arr.map((v,i)=>`<td class="${i===2?'base':''}">${num1(v)}</td>`).join('')+`</tr>`;
  }).join('');

  // scenario cards active
  document.querySelectorAll('#scen-cards .scen-card').forEach(c=>{
    const on = c.dataset.preset && sameParams(cur,PRESETS[c.dataset.preset]);
    c.classList.toggle('sel', !!on);
    let chk=c.querySelector('.check');
    if(on && !chk){ chk=document.createElement('div'); chk.className='check'; chk.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-11"/></svg>'; c.prepend(chk); }
    if(!on && chk) chk.remove();
  });

  renderSaved();
}
const moneyShort=(r)=>(r>=0?'+ ':'- ')+num1(Math.abs(r)/1e6);

function renderSaved(){
  document.getElementById('saved-list').innerHTML=savedScenarios.map((s,i)=>
    `<div class="saved-card"><div><div class="nm">${s.nome} ${s.atual?'<span class="cur">Atual</span>':''}</div><div class="dt">Atualizado em ${s.data}</div></div><div class="dots" data-load="${i}">⋮</div></div>`
  ).join('');
  document.querySelectorAll('[data-load]').forEach(d=>d.addEventListener('click',()=>{
    const s=savedScenarios[+d.dataset.load]; if(s){ cur={...s.params}; syncSliders(); render(); toast('Cenário "'+s.nome+'" carregado'); }
  }));
}

/* ---------- helpers de DOM ---------- */
function set(id,txt){const e=document.getElementById(id); if(e)e.textContent=txt;}
function setRisco(id,risco,prefix){
  const e=document.getElementById(id); if(!e)return;
  e.textContent=(prefix?'Risco: ':'')+risco;
  e.className = prefix? 'risk' : 'tag';
  if(!prefix){ e.style.background = riscoColor(risco); }
}
function riscoColor(r){return {'ALTO':'var(--coral)','MÉDIO':'var(--amber)','BAIXO':'#4a6b52','FAVORÁVEL':'var(--teal)'}[r]||'var(--coral)';}

/* ============================================================
   CHARTS
   ============================================================ */
function buildCharts(){
  const yrs=YEARS.map(String);
  charts.transicao=new Chart(document.getElementById('c-transicao'),{
    data:{labels:yrs,datasets:[
      {type:'bar',label:'Receita protegida (seguro)',data:[],backgroundColor:C.teal,stack:'s',borderRadius:2,barPercentage:.7,order:3},
      {type:'bar',label:'IBS destino',data:[],backgroundColor:C.dark,stack:'s',borderRadius:2,barPercentage:.7,order:3},
      {type:'line',label:'Sem reforma',data:[],borderColor:C.navy,borderDash:[5,4],borderWidth:2.88,pointRadius:2.5,pointBackgroundColor:C.navy,tension:.1,order:1},
      {type:'line',label:'Diferença acumulada',data:[],borderColor:C.coral,borderDash:[5,4],borderWidth:2.56,pointRadius:2,pointBackgroundColor:C.coral,tension:.1,order:2}
    ]},
    options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{mode:'index',callbacks:{label:c=>c.dataset.label+': '+num1(c.raw)}}},
      scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:9.5}}},
        y:{stacked:true,grid:{color:gridClr},ticks:{stepSize:100,font:{size:9.5}}}}}
  });

  charts.aliquota=new Chart(document.getElementById('c-aliquota'),{
    type:'line',
    data:{labels:[],datasets:[{data:[],borderColor:C.blue,borderWidth:3.2,tension:.35,fill:false,
      pointRadius:(ctx)=>ctx.raw&&ctx.raw._eq?5:3,
      pointBackgroundColor:(ctx)=>ctx.raw&&ctx.raw._eq?C.blue:'#fff',
      pointBorderColor:C.blue,pointBorderWidth:2,parsing:{yAxisKey:'y'}}]},
    options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>num1(c.parsed.y)}}},
      scales:{x:{grid:{display:false},ticks:{font:{size:8.5}}},
        y:{grid:{color:gridClr},ticks:{font:{size:8.5}}}}}
  });

  // composição da receita (município + ano) — v2
  charts.composicao=new Chart(document.getElementById('c-composicao'),{
    type:'bar',
    data:{labels:[],datasets:[
      {label:'ICMS/ISS restante',data:[],backgroundColor:'#9aa6b2',stack:'s',barPercentage:.98,categoryPercentage:.98},
      {label:'IBS pela média',data:[],backgroundColor:'#2f4566',stack:'s',barPercentage:.98,categoryPercentage:.98},
      {label:'IBS pelo consumo',data:[],backgroundColor:'#2f5d57',stack:'s',barPercentage:.98,categoryPercentage:.98},
      {label:'Seguro recebido',data:[],backgroundColor:'#4b3a6b',stack:'s',barPercentage:.98,categoryPercentage:.98},
    ]},
    options:{maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.dataset.label+': '+money(c.raw*1e6)}}},
      scales:{x:{stacked:true,grid:{display:false},ticks:{maxTicksLimit:10,font:{size:8.5}}},
        y:{stacked:true,grid:{color:gridClr},ticks:{font:{size:8.5},callback:v=>num1(v)}}}}
  });

  const allYrs=[];for(let y=2026;y<=2033;y++)allYrs.push(String(y));
  charts.evolucao=new Chart(document.getElementById('c-evolucao'),{
    type:'line',
    data:{labels:allYrs,datasets:[
      {label:'Cenário Otimista',data:[],borderColor:LC.otim,borderDash:[9,4],borderWidth:4.16,pointRadius:3,pointHoverRadius:6,pointBackgroundColor:LC.otim,tension:.15},
      {label:'Sem reforma',data:[],borderColor:LC.sem,borderDash:[2,3],borderWidth:3.2,pointRadius:0,pointHoverRadius:6,pointBackgroundColor:LC.sem,tension:.15},
      {label:'Meu Cenário (atual)',data:[],borderColor:LC.meu,borderWidth:5.76,pointRadius:3.5,pointHoverRadius:7,pointBackgroundColor:LC.meu,tension:.15},
      {label:'Cenário Conservador',data:[],borderColor:LC.cons,borderDash:[6,5],borderWidth:4.16,pointRadius:3,pointHoverRadius:6,pointBackgroundColor:LC.cons,tension:.15}
    ]},
    options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{mode:'index',callbacks:{label:c=>c.dataset.label+': '+num1(c.raw)}}},
      scales:{x:{grid:{display:false},ticks:{font:{size:9.5}}},
        y:{grid:{color:gridClr},ticks:{stepSize:100,font:{size:9.5}}}}}
  });
}

function updateCharts(m, base){
  // TRANSIÇÃO 2026-2077 com SEGURO-RECEITA:
  //  teal  = receita protegida pelo seguro  (prot × sem)   -> vai reduzindo
  //  blue  = receita de destino (IBS pleno) ((1-prot) × IBS) -> vai crescendo
  //  linha = sem reforma (base) | linha vermelha = diferença acumulada
  const seguro=[],destino=[],sem=[],dif=[];
  // acumulado exato ano a ano (2026-2077), plotado nos anos amostrados
  const accByYear={}; let acc=0;
  ACC_YEARS.forEach(t=>{ acc += m.serie[t].comSeguro - m.serie[t].sem; accByYear[t]=acc; });
  CHART_YEARS.forEach(t=>{
    const s=m.serie[t];
    seguro.push(+((s.prot*s.sem)/1e6).toFixed(1));
    destino.push(+(((1-s.prot)*s.com)/1e6).toFixed(1));
    sem.push(+(s.sem/1e6).toFixed(1));
    dif.push(+(accByYear[t]/1e6).toFixed(1));
  });
  const ct=charts.transicao;
  ct.data.labels=CHART_YEARS.map(String);
  ct.data.datasets[0].data=seguro; ct.data.datasets[1].data=destino;
  ct.data.datasets[2].data=sem;    ct.data.datasets[3].data=dif;
  ct.update();

  // alíquota sensitivity around current + equilibrium point
  const rates=[16,16.5,17,17.5,18,cur.ibs, m.eq,19].filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a-b);
  const ca=charts.aliquota;
  ca.data.labels=rates.map(r=>pct(r, r%1===0?0:2));
  ca.data.datasets[0].data=rates.map(r=>({x:pct(r),y:+(calcular({...cur,ibs:r}).com33/1e6).toFixed(1),_eq:Math.abs(r-m.eq)<1e-6}));
  ca.update();

  // composição da receita do município (v2) — por ano, com marca no ano-base
  updateCompCidade();

  // evolução (transição 2026-2033) para cada cenário
  const conser=calcular(PRESETS.conservador), otim=calcular(PRESETS.otimista);
  const serieSeg=(mm)=>CHART_YEARS.map(t=>+(mm.serie[t].comSeguro/1e6).toFixed(1));
  const serieSem=(mm)=>CHART_YEARS.map(t=>+(mm.serie[t].sem/1e6).toFixed(1));
  const ce=charts.evolucao;
  ce.data.labels=CHART_YEARS.map(String);
  ce.data.datasets[0].data=serieSeg(otim);
  ce.data.datasets[1].data=serieSem(base);
  ce.data.datasets[2].data=serieSeg(m);
  ce.data.datasets[3].data=serieSeg(conser);
  ce.update();
}

/* ---------- risk map legend ---------- */
(function(){
  const colors=['#3d5a45','#66774e','#8f7f4a','#8a6a3a','#7a3b35','#d8dee6'];
  const names=['Muito favorável','Favorável','Neutro','Atenção','Crítico','Sem dados'];
  const lg=document.getElementById('map-legend');
  if(lg) names.forEach((n,i)=>lg.insertAdjacentHTML('beforeend',`<span><i style="background:${colors[i]}"></i>${n}</span>`));
})();

/* ============================================================
   SLIDERS + interações
   ============================================================ */
function paintSlider(r){
  const p=(r.value-r.min)/(r.max-r.min)*100;
  r.style.background=`linear-gradient(90deg,var(--blue) 0 ${p}%,#e2e8f2 ${p}% 100%)`;
  const out=document.querySelector(`[data-out="${r.dataset.outTarget}"]`);
  if(out){
    let val = r.dataset.int ? Math.round(r.value) : parseFloat(r.value).toFixed(r.dataset.outTarget==='ibs'?2:1);
    out.textContent=String(val).replace('.',',')+(r.dataset.suffix||'');
  }
}
const sliders=document.querySelectorAll('input[data-fill][data-key]');
sliders.forEach(r=>{
  r.addEventListener('input',()=>{
    paintSlider(r);
    cur[r.dataset.key]=parseFloat(r.value);
    render();
  });
  paintSlider(r);
});
function syncSliders(){
  sliders.forEach(r=>{ r.value=cur[r.dataset.key]; paintSlider(r); });
}

/* preset selection (cards + pills) */
function applyPreset(name){
  if(!PRESETS[name])return;
  cur={...PRESETS[name]};
  syncSliders(); render();
  toast((name==='base'?'Cenário Base':name==='otimista'?'Cenário Otimista':'Cenário Conservador')+' aplicado');
}
document.querySelectorAll('[data-preset]').forEach(el=>el.addEventListener('click',()=>applyPreset(el.dataset.preset)));

/* reset */
function resetBase(){ applyPreset('base'); }
document.getElementById('sim-reset').addEventListener('click',resetBase);
document.getElementById('ov-sim-reset').addEventListener('click',resetBase);
document.getElementById('sim-update').addEventListener('click',()=>{ render(); toast('Simulação atualizada'); });

/* salvar cenário */
function saveScenario(){
  const n=savedScenarios.filter(s=>!s.atual).length+1;
  const nome = presetLabel(cur)==='Meu Cenário' ? 'Meu Cenário '+n : presetLabel(cur);
  const d=new Date(); const data=String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();
  savedScenarios.forEach(s=>s.atual=false);
  savedScenarios.unshift({nome, params:{...cur}, data, atual:true});
  renderSaved(); toast('Cenário salvo');
}
document.getElementById('ov-save').addEventListener('click',saveScenario);
document.getElementById('scen-new').addEventListener('click',saveScenario);

/* comparar → vai pro simulador de cenários e marca a aba */
const _bcmp=document.getElementById('btn-cmp-ov'); _bcmp&&_bcmp.addEventListener('click',()=>{
  setView('simulator');
  navItems.forEach(x=>x.classList.toggle('active', x.dataset.view==='simulator' && !x.dataset.scroll));
});

/* PDF / share */
document.getElementById('btn-pdf').addEventListener('click',()=>window.print());
document.getElementById('btn-export')&&document.getElementById('btn-export').addEventListener('click',()=>window.print());
document.getElementById('btn-share').addEventListener('click',()=>{
  const url=location.href;
  if(navigator.share){navigator.share({title:'Reforma Tributária — Criciúma',url});}
  else{navigator.clipboard&&navigator.clipboard.writeText(url); toast('Link copiado para a área de transferência');}
});

/* ---------- toast ---------- */
let toastT;
function toast(msg){
  let el=document.querySelector('.toast');
  if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el);}
  el.textContent=msg; el.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('show'),2200);
}

/* ---------- modal metodologia ---------- */
const modal=document.getElementById('modal-metod');
function openMetod(){
  const fb=REFORMA.FATOR.toFixed(4).replace('.',',');
  const cs=pct(REFORMA.cargaSC*100,2);
  document.querySelector('#modal-metod .modal-head b').textContent='Metodologia e premissas';
  document.getElementById('modal-body').innerHTML=`
    <p>Simulador da receita municipal com a Reforma Tributária (IBS) para os <b>295 municípios de Santa Catarina</b>, de 2013 a 2078. Os dados vêm do arquivo <code>dados_reforma.json</code>; a receita é calculada ao vivo a partir das alíquotas, do ano e do seguro-receita que você escolher.</p>

    <h4>De onde vem cada número</h4>
    <ul>
      <li><b>Do JSON:</b> consumo, população, receita ICMS+ISS sem reforma, coeficiente histórico e os parâmetros legais da transição, por ano.</li>
      <li><b>Suas hipóteses:</b> a alíquota do IBS, o ano e ligar/desligar o seguro-receita.</li>
      <li><b>Constante fixa:</b> o <code>fator_base</code> e as regras da Constituição (25%, 80/10/5/5).</li>
    </ul>

    <h4>A constante fator_base</h4>
    <p>Nem todo consumo paga a alíquota cheia (cesta básica zerada, reduções de 60%, regimes específicos). O <code>fator_base</code> é a fração do consumo que, na média, paga a alíquota cheia. É calculado uma vez a partir do próprio JSON:</p>
    <p style="background:var(--border-2);padding:8px 10px;border-radius:6px;font-family:monospace;font-size:11px">
      cargaSC = receita_sc[2024] / consumo_sc[2024] = ${cs}<br>
      fator_base = cargaSC / (0,0318 + 0,25 × 0,1552) = <b>${fb}</b></p>
    <p>As alíquotas de referência (3,18% municipal e 15,52% estadual, IBS total ≈ 18,7% — estimativa do Comitê Gestor) ficam fixas: mudar a alíquota no simulador <b>não</b> muda o fator_base.</p>

    <h4>As fórmulas (Guia, seção 5)</h4>
    <ul>
      <li><b>Divisão do IBS:</b> um IBS total é dividido em 17% municipal e 83% estadual (fração do ISS na receita de SC, 0,45 — provisório).</li>
      <li><b>Cota nos 25% estaduais:</b> <code>0,95 × pop/pop_SC + 0,05/295</code> (Art. 158, §2º: 80% população, 5% partes iguais; educação e ambiental ainda seguem a população).</li>
      <li><b>IBS gerado:</b> municipal = <code>aliqMun × fator_base × base_destino</code>; cota = <code>0,25 × aliqEst × fator_base × consumo_SC × cota</code>.</li>
      <li><b>Três parcelas:</b> <b>Legado</b> (ICMS/ISS ainda cobrado até 2032) + <b>Histórica</b> (repartida pela arrecadação 2019–2026, ADCT art. 131) + <b>Destino</b> (segue o consumo local). O seguro-receita desconta 5% da parcela de destino.</li>
    </ul>

    <h4>Cuidados e limitações (Guia, seção 9)</h4>
    <ul>
      <li>Valores <b>nominais</b> (projeção ~2% real + 3,5% de IPCA ao ano).</li>
      <li>A fração do ISS (0,45) e a alíquota de referência são provisórias.</li>
      <li>O seguro desconta os 5% que vão ao fundo, mas não calcula quanto o município recebe de volta (depende do Brasil todo).</li>
      <li>SC é tratado como sistema fechado: bom para comparar municípios entre si; para saber se SC ganha ou perde é preciso calibrar com dados nacionais.</li>
      <li>A mesma alíquota é aplicada a todos os municípios. Anos marcados como PREENCHIDO/PROJEÇÃO são estimados.</li>
      <li>O <b>Simulador de Cenários</b> adiciona premissas de crescimento (sliders) sobre esta base; no Cenário Base os números batem com o Simulador Oficial.</li>
    </ul>

    <h4>Base legal</h4>
    <p style="font-size:11.5px">EC 132/2023 (ADCT arts. 128, 129, 131 e 132; CF art. 158, IV, "b", e §2º); LC 214/2025 (IBS e local da operação); LC 227/2026 (Comitê Gestor, receita média de referência 2019–2026 e distribuição).</p>
    <p style="color:var(--muted);font-size:11px">Guia gerado a partir do dados_reforma.json de 2026-09-28. Projeções sujeitas a alterações na legislação, na economia e nas bases de dados.</p>`;
  modal.classList.remove('hidden');
}
[bMet,document.getElementById('lnk-metod'),document.getElementById('lnk-metod2')].forEach(b=>b&&b.addEventListener('click',e=>{e.preventDefault();openMetod();}));
document.getElementById('modal-x').addEventListener('click',()=>modal.classList.add('hidden'));
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.add('hidden');});

/* ============================================================
   TOPBAR — seletor de município / ano / seguro-receita (globais)
   ============================================================ */
function setSeguro(v){
  CTX.seguro=!!v;
  const t=document.getElementById('seguro-toggle');
  t&&t.classList.toggle('on',CTX.seguro);
  set('seguro-lbl',CTX.seguro?'ligado':'desligado');
  const ofc=document.getElementById('of-seguro'); if(ofc) ofc.checked=CTX.seguro;
  render();
}
(function initTopbar(){
  const ms=document.getElementById('mun-select');
  ms.innerHTML='<option value="SC" selected>Santa Catarina (todos)</option>'+REFORMA.municipios.map(x=>`<option value="${x.cod}">${tc(x.nome)}</option>`).join('');
  ms.addEventListener('change',()=>{ if(ms.value==='SC'){CTX.sc=true;} else {CTX.sc=false; CTX.cod=+ms.value;} render();});
  const as=document.getElementById('ano-select');
  as.innerHTML=REFORMA.anos.filter(y=>y>=2013&&y<=2078).map(y=>`<option value="${y}"${y===CTX.ano?' selected':''}>${y}</option>`).join('');
  as.addEventListener('change',()=>{CTX.ano=+as.value; render();});
  const sgT=document.getElementById('seguro-toggle'); sgT&&sgT.addEventListener('click',()=>setSeguro(!CTX.seguro));
  const scenSel=document.getElementById('tb-scen-select');
  scenSel.addEventListener('change',()=>{ if(scenSel.value!=='custom') applyPreset(scenSel.value); else syncScenSelect(); });
})();

/* ============================================================
   SIMULADOR OFICIAL (IBS) — cálculo de referência do Guia
   ============================================================ */
let ofState={ibs:18.7, manual:false, am:3.18, ae:15.52};
let ofRankFull=false;

function paintRange(el){
  const p=(el.value-el.min)/(el.max-el.min)*100;
  el.style.background=`linear-gradient(90deg,var(--blue) 0 ${p}%,#e2e8f2 ${p}% 100%)`;
}
function ofAliquotas(){
  if(ofState.manual) return {am:ofState.am/100, ae:ofState.ae/100};
  const s=REFORMA.split(ofState.ibs/100); return {am:s.aliqMun, ae:s.aliqEst};
}
function riscoCls(varPct){return REFORMA.classificar(varPct);}

function buildOfChart(){
  if(charts.oficial) return;
  charts.oficial=new Chart(document.getElementById('of-chart'),{
    type:'line',
    data:{labels:[],datasets:[
      {label:'Sem reforma',data:[],borderColor:LC.sem,borderDash:[2,3],borderWidth:3.52,pointRadius:0,pointHoverRadius:6,tension:.15},
      {label:'Com reforma (com seguro)',data:[],borderColor:LC.meu,borderWidth:5.76,pointRadius:0,pointHoverRadius:7,tension:.15},
      {label:'Com reforma (sem seguro)',data:[],borderColor:LC.green,borderDash:[9,4],borderWidth:4.16,pointRadius:0,pointHoverRadius:6,tension:.15},
    ]},
    options:{maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.dataset.label+': '+money(c.raw*1e6)}}},
      scales:{x:{grid:{display:false},ticks:{maxTicksLimit:12,font:{size:9}}},
        y:{grid:{color:gridClr},ticks:{font:{size:9},callback:v=>num1(v)}}}}
  });
}

function renderOficial(){
  const cod=CTX.cod, ano=CTX.ano;
  const a=ofAliquotas();
  const ibsTot = ofState.manual ? null : ofState.ibs;
  // entradas
  set('of-mun', munLabel(cod));
  set('of-ano', String(ano));
  set('of-ibs-val', num1(ofState.ibs));
  set('of-am', pct(a.am*100,2));
  set('of-ae', pct(a.ae*100,2));
  const ofc=document.getElementById('of-seguro'); if(ofc) ofc.checked=CTX.seguro;

  // cálculo principal
  const r=REFORMA.receita(cod, ano, a.am, a.ae, CTX.seguro);
  const eq=REFORMA.equilibrio(cod, ano, CTX.seguro);
  const good=r.variacao>=0;
  set('of-com', money(r.total));
  set('of-sem', money(r.semReforma));
  const vEl=document.getElementById('of-var'); vEl.textContent=pctSig(r.variacao*100); vEl.className='v '+(good?'v-teal':'v-coral');
  set('of-eq', isFinite(eq)?pct(eq,2):'–');
  set('of-pc', 'R$ '+nfMi0.format(r.perCapita));
  setRisco('of-risco', riscoCls(r.variacao*100));
  set('of-tipo', `Consumo: ${r.tipo_consumo} · Receita: ${r.tipo_receita}. ${(r.tipo_consumo!=='HISTORICO'||r.tipo_receita!=='HISTORICO')?'Alguns valores deste ano são estimados (PREENCHIDO/PROJECAO).':'Valores históricos.'}`);

  // parcelas + barra
  const parts=[['Legado (ICMS/ISS mantido)',r.legado,'b-leg','var(--dark-2)'],
               ['Histórica (receita 2019–2026)',r.historica,'b-his','var(--purple)'],
               ['Destino (consumo local)',r.destino,'b-des','var(--teal)']];
  // escala pelo maior entre com-reforma e sem-reforma → a barra ENCOLHE/CRESCE
  // conforme os valores (perda = barra não enche; ganho = passa da marca).
  const comTot=r.legado+r.historica+r.destino;
  const ref=Math.max(comTot, r.semReforma, 1);
  const marca=r.semReforma/ref*100;
  document.getElementById('of-bar').innerHTML=
    parts.map(p=>`<i class="${p[2]}" style="width:${Math.max(p[1]/ref*100,0)}%" title="${p[0]}: ${money(p[1])}"></i>`).join('')+
    `<span class="of-bar-mark" style="left:${marca}%" title="Sem reforma: ${money(r.semReforma)}"></span>`;
  document.getElementById('of-parcelas').innerHTML=
    parts.map(p=>`<tr><td class="lbl"><span class="sw" style="background:${p[3]}"></span>${p[0]}</td><td class="val">${money(p[1])}</td></tr>`).join('')+
    `<tr><td class="lbl"><b>Total com reforma</b></td><td class="val">${money(r.total)}</td></tr>`+
    `<tr><td class="lbl">Sem reforma (comparação)</td><td class="val">${money(r.semReforma)}</td></tr>`+
    `<tr><td class="lbl">Variação</td><td class="val ${good?'pos':'neg'}">${pctSig(r.variacao*100)}</td></tr>`;

  // intermediários (passo a passo)
  const m=REFORMA.mun(cod);
  const inter=[
    ['fator_base (constante)', REFORMA.FATOR.toFixed(4).replace('.',',')],
    ['carga tributária de SC (2024)', pct(REFORMA.cargaSC*100,2)],
    ['T — sistema antigo já convertido', pct(r.T*100,0)],
    ['ICMS/ISS mantido (ano)', pct(r.mantido*100,0)],
    ['Retenção histórica (ano)', pct(r.ret*100,0)],
    ['Seguro-receita (ano)', pct(r.seg*100,2)+(CTX.seguro?'':' (desligado)')],
    ['Cota nos 25% do IBS estadual', (r.cota*100).toFixed(4).replace('.',',')+'%'],
    ['IBS municipal', money(r.ibsMun)],
    ['IBS cota-parte estadual', money(r.ibsCota)],
    ['IBS pool (todo o SC)', money(r.ibsPool)],
    ['Base de destino (consumo local)', money(r.base_destino)],
    ['População', nfMi0.format(r.populacao)+' hab.'],
    ['Coeficiente histórico', (m.coef_historico*100).toFixed(4).replace('.',',')+'%'],
  ];
  document.getElementById('of-inter').innerHTML=inter.map(x=>`<tr><td class="lbl">${x[0]}</td><td class="val">${x[1]}</td></tr>`).join('');

  // trajetória 2013-2078
  buildOfChart();
  const anos=REFORMA.anos;
  const sem=[],comS=[],comP=[];
  anos.forEach(y=>{
    const rs=REFORMA.receita(cod,y,a.am,a.ae,true);
    const rp=REFORMA.receita(cod,y,a.am,a.ae,false);
    sem.push(+(rs.semReforma/1e6).toFixed(1));
    comS.push(+(rs.total/1e6).toFixed(1));
    comP.push(+(rp.total/1e6).toFixed(1));
  });
  const ch=charts.oficial;
  ch.data.labels=anos.map(String);
  ch.data.datasets[0].data=sem; ch.data.datasets[1].data=comS; ch.data.datasets[2].data=comP;
  ch.update();

  // tabela de conferência
  set('of-conf-mun', tc(REFORMA.nome(cod)));
  const aliqs=[15,18.7,20], years=[2030,2033,2050];
  let conf='';
  aliqs.forEach(ib=>{ years.forEach(y=>{
    const sp=REFORMA.split(ib/100);
    const rr=REFORMA.receitaIBS(cod,y,ib/100,false);
    const rseg=REFORMA.receitaIBS(cod,y,ib/100,true);
    conf+=`<tr><td>${num1(ib)}%</td><td>${pct(sp.aliqMun*100,2)} / ${pct(sp.aliqEst*100,2)}</td><td>${y}</td>`+
      `<td>${num1(rr.semReforma/1e6)}</td><td>${num1(rr.total/1e6)}</td>`+
      `<td class="${rr.variacao<0?'neg':'pos'}">${pctSig(rr.variacao*100)}</td>`+
      `<td>${num1(rseg.total/1e6)}</td></tr>`;
  });});
  document.getElementById('of-conf').innerHTML=conf;

  // ranking dos 295
  renderOfRank(ibsTot);
}

function renderOfRank(ibsTot){
  const ib=(ibsTot==null?ofState.ibs:ibsTot);
  const rk=REFORMA.ranking(CTX.ano, ib/100, CTX.seguro);
  const sc=REFORMA.totalSC(CTX.ano, ib/100, CTX.seguro);
  set('of-sc-total', `Total de SC: ${money(sc.total)} com reforma (${pctSig(sc.variacao*100)} vs. sem reforma).`);
  const q=(document.getElementById('of-search').value||'').trim().toLowerCase();
  const sort=document.getElementById('of-sort').value;
  let list=rk.filter(x=>!q||tc(x.nome).toLowerCase().includes(q));
  const cmp={'var-desc':(a,b)=>b.variacao-a.variacao,'var-asc':(a,b)=>a.variacao-b.variacao,
    'imp-desc':(a,b)=>b.impacto-a.impacto,'imp-asc':(a,b)=>a.impacto-b.impacto,
    'nome':(a,b)=>a.nome.localeCompare(b.nome,'pt-BR')};
  list.sort(cmp[sort]||cmp['var-desc']);
  const show=(ofRankFull||q)?list:list.slice(0,12);
  document.getElementById('of-rank').innerHTML=show.map((r,i)=>{
    const me=r.cod===CTX.cod;
    return `<tr class="${me?'me':''}"><td>${i+1}</td><td>${tc(r.nome)}</td>`+
      `<td>${num1(r.sem/1e6)}</td><td>${num1(r.total/1e6)}</td>`+
      `<td class="${r.impacto<0?'neg':'pos'}">${num1(r.impacto/1e6)}</td>`+
      `<td class="${r.variacao<0?'neg':'pos'}">${pctSig(r.variacao*100)}</td>`+
      `<td><span class="rk ${r.risco}">${cap(r.risco)}</span></td>`+
      `<td>${isFinite(r.eq)?pct(r.eq,2):'–'}</td></tr>`;
  }).join('');
  set('of-rank-more', (ofRankFull||q)?`Mostrando ${show.length} de ${rk.length}`:`Mostrar todos os ${rk.length} →`);
}

(function initOficial(){
  const ibs=document.getElementById('of-ibs');
  ibs.addEventListener('input',()=>{ofState.ibs=parseFloat(ibs.value); paintRange(ibs); renderOficial();});
  paintRange(ibs);
  document.getElementById('of-manual').addEventListener('change',e=>{
    ofState.manual=e.target.checked;
    document.getElementById('of-manual-box').classList.toggle('hidden',!ofState.manual);
    document.getElementById('of-ibs').disabled=ofState.manual;
    renderOficial();
  });
  document.getElementById('of-am-in').addEventListener('input',e=>{ofState.am=parseFloat(e.target.value)||0; renderOficial();});
  document.getElementById('of-ae-in').addEventListener('input',e=>{ofState.ae=parseFloat(e.target.value)||0; renderOficial();});
  document.getElementById('of-seguro').addEventListener('change',e=>setSeguro(e.target.checked));
  document.getElementById('of-search').addEventListener('input',()=>renderOfRank(ofState.manual?null:ofState.ibs));
  document.getElementById('of-sort').addEventListener('change',()=>renderOfRank(ofState.manual?null:ofState.ibs));
  document.getElementById('of-rank-more').addEventListener('click',()=>{ofRankFull=!ofRankFull; renderOfRank(ofState.manual?null:ofState.ibs);});
  document.getElementById('of-metod').addEventListener('click',e=>{e.preventDefault();openMetod();});
})();

/* ============================================================
   COMPARAÇÃO DE CENÁRIOS (motor v2)
   ============================================================ */
const CP_COL={conservador:'#7a5a2e',base:'#2f4566',otimista:'#3d5a45'};
let cpState={ano:2033,comparacao:'lei',projecao:'tendencia',aliquota:17.5,loc:100,horizon:2096};

function cpOver(){return {comparacao:cpState.comparacao,projecao:cpState.projecao,aliquota:cpState.aliquota/100,consumoLocal:cpState.loc/100};}
function cpMoney(v){ if(v==null||isNaN(v))return '–'; const a=Math.abs(v),s=v<0?'−':'';
  if(a>=1e9) return s+'R$ '+new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(a/1e9)+' bi';
  return s+'R$ '+nfMi.format(a/1e6)+' mi'; }
function cpRisco(c){return {'Crítico':'#5e2a2a','Atenção':'#b0756b','Neutro':'#9aa6b2','Favorável':'#7f98a3','Muito favorável':'#2f4a55'}[c]||'#9aa6b2';}
function cpRiscoTxt(c){return (c==='Favorável'||c==='Neutro')?'#33363d':'#fff';}

function renderComparacao(){
  if(typeof REFORMA2==='undefined'){return;}
  const cod=CTX.cod, m=REFORMA2.mun(String(cod));
  if(!m){ document.getElementById('cp-cards').innerHTML='<div class="card pad">Este município não está na base v2.</div>'; return; }
  set('cp-mun', tc(m.nome));
  document.querySelectorAll('.cp-metric').forEach(e=>e.textContent=cpState.comparacao==='lei'?'pela lei':'regra final');
  document.querySelectorAll('.cp-yr-lbl').forEach(e=>e.textContent=cpState.ano);
  set('cp-aliq-val', num1(cpState.aliquota)+'%');
  set('cp-loc-val', cpState.loc+'%');
  cpSyncControls();
  const comp=REFORMA2.compararCenarios(cod, cpState.ano, cpOver());
  renderCpCards(comp);
  renderCpEfeitos(comp);
  renderCpTable(cod);
  updateCpCharts(comp);
}

function renderCpCards(comp){
  document.getElementById('cp-cards').innerHTML=comp.map(x=>{
    const good=(x.impactoPct||0)>=0;
    const eq=isFinite(x.aliqEquilibrio)&&x.aliqEquilibrio!=null?pct(x.aliqEquilibrio*100,2):'–';
    return `<div class="cp-scard c-${x.cen} ${x.cen==='base'?'sel':''}">
      <div class="cp-h"><div class="cp-nm">${x.label}</div>
        <span class="tag" style="background:${cpRisco(x.classe)};color:${cpRiscoTxt(x.classe)}">${x.classe||'–'}</span></div>
      <div class="cp-com">${cpMoney(x.com)}</div>
      <div class="cp-sem">sem reforma: ${cpMoney(x.sem)}</div>
      <div class="cp-imp ${good?'pos':'neg'}">${cpMoney(x.impacto)} · ${pctSig((x.impactoPct||0)*100)}</div>
      <div class="cp-rows">
        <div class="cp-row"><span>Alíquota que empataria</span><b>${eq}</b></div>
        <div class="cp-row"><span>Saldo acum. (2026–${cpState.ano})</span><b>${cpMoney(x.saldoAcum)}</b></div>
        <div class="cp-row"><span>Trajetória até 2096</span><b>${x.trajetoria}</b></div>
      </div></div>`;
  }).join('');
}

function renderCpEfeitos(comp){
  const base=comp.find(x=>x.cen==='base')||comp[1];
  set('cp-ef-cen','BASE');
  const ef=base.efeitos; if(!ef){document.getElementById('cp-efeitos').innerHTML='<div style="color:var(--muted);font-size:11px">Sem dados para este ano.</div>';return;}
  const rows=[
    ['Regra da média histórica','A parte retida segue a fatia de 2019–2026',ef.media],
    ['Parte pelo consumo','A parte não retida segue o consumo e a população',ef.consumo],
    ['Contribuição ao seguro-receita','5% da parte pelo consumo vão ao fundo nacional',ef.contrib],
    ['Seguro-receita recebido','Só recebe quem está entre as maiores perdas',ef.recebido],
  ];
  const total=ef.media+ef.consumo+ef.contrib+ef.recebido;
  const maxAbs=Math.max(...rows.map(r=>Math.abs(r[2])),Math.abs(total),1);
  const bar=(v)=>{const w=Math.abs(v)/maxAbs*48;const pos=v>=0;
    return `<div class="track"><div class="mid"></div><i style="${pos?'left:50%':'right:50%'};width:${w}%;background:${pos?'#7f98a3':'#7a3b35'}"></i></div>`;};
  let html=rows.map(r=>`<div class="cp-ef"><div class="lb">${r[0]}<small>${r[1]}</small></div>${bar(r[2])}<div class="vl ${r[2]<0?'neg':'pos'}">${cpMoney(r[2])}</div></div>`).join('');
  html+=`<div class="cp-ef total"><div class="lb">Diferença total</div>${bar(total)}<div class="vl ${total<0?'neg':'pos'}">${cpMoney(total)}</div></div>`;
  document.getElementById('cp-efeitos').innerHTML=html;
}

function renderCpTable(cod){
  const years=[2029,2033,2040,2050,2078,2096];
  const byCen={};
  REFORMA2.CEN.forEach(c=>{const p=REFORMA2.parametrosPadrao(Object.assign({cenario:c},cpOver()));byCen[c]=REFORMA2.calcularMunicipio(cod,p);});
  document.getElementById('cp-table').innerHTML=years.map(y=>{
    let cells='';
    REFORMA2.CEN.forEach(c=>{const l=REFORMA2.linhaAno(byCen[c],y);
      if(!l||l.semDado){cells+='<td>–</td><td>–</td>';return;}
      const com=l[cpState.comparacao], vp=l.sem?com/l.sem-1:0;
      cells+=`<td>${nfMi.format(com/1e6)}</td><td class="${vp<0?'neg':'pos'}">${pctSig(vp*100)}</td>`;});
    return `<tr><td><b>${y}</b></td>${cells}</tr>`;
  }).join('');
}

function buildCpCharts(){
  if(charts.cpTraj) return;
  const mk=(tipTraj)=>({maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
    plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.dataset.label+': '+(tipTraj?cpMoney(c.raw*1e6):pctSig(c.raw))}}},
    scales:{x:{grid:{display:false},ticks:{maxTicksLimit:12,font:{size:9}}},
      y:{grid:{color:gridClr},ticks:{font:{size:9},callback:v=>tipTraj?num1(v):v+'%'}}}});
  charts.cpTraj=new Chart(document.getElementById('cp-chart-traj'),{type:'line',data:{labels:[],datasets:[
    {label:'Conservador',data:[],borderColor:CP_COL.conservador,borderWidth:3.84,pointRadius:0,pointHoverRadius:6,tension:.15},
    {label:'Base',data:[],borderColor:CP_COL.base,borderWidth:5.44,pointRadius:0,pointHoverRadius:7,tension:.15},
    {label:'Otimista',data:[],borderColor:CP_COL.otimista,borderWidth:3.84,pointRadius:0,pointHoverRadius:6,tension:.15},
    {label:'Sem reforma (base)',data:[],borderColor:'#64748b',borderDash:[3,3],borderWidth:3.2,pointRadius:0,pointHoverRadius:6,tension:.15},
  ]},options:mk(true)});
  charts.cpImp=new Chart(document.getElementById('cp-chart-imp'),{type:'line',data:{labels:[],datasets:[
    {label:'Conservador',data:[],borderColor:CP_COL.conservador,borderWidth:3.84,pointRadius:0,pointHoverRadius:6,tension:.15},
    {label:'Base',data:[],borderColor:CP_COL.base,borderWidth:4.8,pointRadius:0,pointHoverRadius:7,tension:.15},
    {label:'Otimista',data:[],borderColor:CP_COL.otimista,borderWidth:3.84,pointRadius:0,pointHoverRadius:6,tension:.15},
  ]},options:mk(false)});
}

function updateCpCharts(comp){
  buildCpCharts();
  const hz=cpState.horizon, metric=cpState.comparacao;
  const map={}; comp.forEach(x=>map[x.cen]=x.linhas);
  const yrs=REFORMA2.anos.filter(y=>y>=2018&&y<=hz);
  const val=(cen,f)=>yrs.map(y=>{const l=REFORMA2.linhaAno(map[cen],y);return (l&&!l.semDado)?f(l):null;});
  const t=charts.cpTraj; t.data.labels=yrs.map(String);
  t.data.datasets[0].data=val('conservador',l=>+(l[metric]/1e6).toFixed(1));
  t.data.datasets[1].data=val('base',l=>+(l[metric]/1e6).toFixed(1));
  t.data.datasets[2].data=val('otimista',l=>+(l[metric]/1e6).toFixed(1));
  t.data.datasets[3].data=val('base',l=>+(l.sem/1e6).toFixed(1));
  t.update();
  const im=charts.cpImp; im.data.labels=yrs.map(String);
  im.data.datasets[0].data=val('conservador',l=>+((l[metric]/l.sem-1)*100).toFixed(1));
  im.data.datasets[1].data=val('base',l=>+((l[metric]/l.sem-1)*100).toFixed(1));
  im.data.datasets[2].data=val('otimista',l=>+((l[metric]/l.sem-1)*100).toFixed(1));
  im.update();
  document.getElementById('cp-legend').innerHTML=
    `<span><i class="line" style="border-top-color:${CP_COL.conservador}"></i>Conservador</span>`+
    `<span><i class="solid" style="background:${CP_COL.base}"></i>Base</span>`+
    `<span><i class="line" style="border-top-color:${CP_COL.otimista}"></i>Otimista</span>`+
    `<span><i class="line" style="border-top-color:#64748b"></i>Sem reforma (base)</span>`;
}

function cpSyncControls(){
  document.querySelectorAll('#cp-years button').forEach(b=>b.classList.toggle('on',+b.dataset.y===cpState.ano));
  document.querySelectorAll('#cp-comp button').forEach(b=>b.classList.toggle('on',b.dataset.v===cpState.comparacao));
  document.querySelectorAll('#cp-proj button').forEach(b=>b.classList.toggle('on',b.dataset.v===cpState.projecao));
  document.querySelectorAll('#cp-horizon button').forEach(b=>b.classList.toggle('on',+b.dataset.v===cpState.horizon));
  const a=document.getElementById('cp-aliq'); if(a){a.value=cpState.aliquota; paintRange(a);}
  const l=document.getElementById('cp-loc'); if(l){l.value=cpState.loc; paintRange(l);}
}

(function initComparacao(){
  const yrs=[2027,2029,2033,2040,2050,2078,2096];
  document.getElementById('cp-years').innerHTML=yrs.map(y=>`<button data-y="${y}" class="${y===cpState.ano?'on':''}">${y}</button>`).join('');
  document.querySelectorAll('#cp-years button').forEach(b=>b.addEventListener('click',()=>{cpState.ano=+b.dataset.y; renderComparacao();}));
  document.querySelectorAll('#cp-comp button').forEach(b=>b.addEventListener('click',()=>{cpState.comparacao=b.dataset.v; renderComparacao();}));
  document.querySelectorAll('#cp-proj button').forEach(b=>b.addEventListener('click',()=>{cpState.projecao=b.dataset.v; renderComparacao();}));
  document.querySelectorAll('#cp-horizon button').forEach(b=>b.addEventListener('click',()=>{cpState.horizon=+b.dataset.v; renderComparacao();}));
  const a=document.getElementById('cp-aliq'); a.addEventListener('input',()=>{cpState.aliquota=parseFloat(a.value); paintRange(a); renderComparacao();}); paintRange(a);
  const l=document.getElementById('cp-loc'); l.addEventListener('input',()=>{cpState.loc=parseFloat(l.value); paintRange(l); renderComparacao();}); paintRange(l);
  document.getElementById('cp-reset').addEventListener('click',()=>{cpState={ano:2033,comparacao:'lei',projecao:'tendencia',aliquota:17.5,loc:100,horizon:2096}; renderComparacao();});
})();

/* ============================================================
   MAPA DE RISCO (coroplético real dos 295 municípios, modelo v2)
   ============================================================ */
const MAPA_COR={'Crítico':'#5e2a2a','Atenção':'#b0756b','Neutro':'#E2DDD3','Favorável':'#7f98a3','Muito favorável':'#2f4a55'};
let _mapaData=null,_mapaAno=null,_mapaCounts=null;

function mapaCompute(){
  if(_mapaAno===CTX.ano && _mapaData) return _mapaData;
  const p=REFORMA2.parametrosPadrao();
  const out={}, counts={'Crítico':0,'Atenção':0,'Neutro':0,'Favorável':0,'Muito favorável':0};
  REFORMA2.municipios.forEach(x=>{
    const l=REFORMA2.linhaAno(REFORMA2.calcularMunicipio(x.cod,p),CTX.ano);
    if(!l||l.semDado){ out[x.cod]={classe:null,nome:x.nome}; return; }
    const ind=REFORMA2.indicadores(l,'lei',p.aliquota);
    out[x.cod]={classe:ind.classe,imp:ind.dif,sem:l.sem,com:l.lei,nome:x.nome};
    if(counts[ind.classe]!=null) counts[ind.classe]++;
  });
  _mapaData=out; _mapaAno=CTX.ano; _mapaCounts=counts; return out;
}
function buildMapa(){
  const svg=document.getElementById('risk-map');
  if(!svg||svg.dataset.built||typeof MALHA_SC==='undefined') return;
  let html='';
  for(const cod in MALHA_SC.p) html+=`<path class="m" data-cod="${cod}" d="${MALHA_SC.p[cod]}"></path>`;
  html+=`<path class="contorno" d="${MALHA_SC.c}"></path>`;
  svg.innerHTML=html; svg.dataset.built='1';
  svg.addEventListener('mousemove',mapaHover);
  svg.addEventListener('mouseleave',()=>{const t=document.getElementById('map-tip');if(t)t.classList.add('hidden');});
  svg.addEventListener('click',e=>{const t=e.target.closest('path.m');if(!t)return;CTX.cod=+t.dataset.cod;const s=document.getElementById('mun-select');if(s)s.value=t.dataset.cod;render();});
}
function updateMapa(){
  if(typeof REFORMA2==='undefined'||typeof MALHA_SC==='undefined') return;
  buildMapa();
  const svg=document.getElementById('risk-map'); if(!svg||!svg.dataset.built) return;
  const data=mapaCompute();
  svg.querySelectorAll('path.m').forEach(pth=>{
    const d=data[pth.dataset.cod];
    pth.setAttribute('fill', (d&&MAPA_COR[d.classe])||'#d8dee6');
    pth.classList.toggle('sel', +pth.dataset.cod===CTX.cod);
  });
  const lg=document.getElementById('map-legend');
  if(lg) lg.innerHTML=['Crítico','Atenção','Neutro','Favorável','Muito favorável']
    .map(n=>`<span><i style="background:${MAPA_COR[n]}"></i>${n} <b>${(_mapaCounts&&_mapaCounts[n])||0}</b></span>`).join('');
}
function mapaHover(e){
  const tip=document.getElementById('map-tip'); if(!tip) return;
  const t=e.target.closest('path.m');
  const d=t&&_mapaData?_mapaData[t.dataset.cod]:null;
  if(!d||!d.sem){ tip.classList.add('hidden'); return; }
  tip.innerHTML=`<b>${tc(d.nome)}</b><br>${d.classe||'—'} · ${pctSig((d.com/d.sem-1)*100)}<br>Sem ${money(d.sem)} · Com ${money(d.com)}`;
  tip.classList.remove('hidden');
  const wrap=document.getElementById('risk-map').closest('.map-wrap').getBoundingClientRect();
  tip.style.left=Math.min(e.clientX-wrap.left+12, wrap.width-200)+'px';
  tip.style.top=(e.clientY-wrap.top+12)+'px';
}

/* Composição da receita do município selecionado (por ano, modelo v2) */
function updateCompCidade(){
  if(typeof REFORMA2==='undefined'||!charts.composicao) return;
  const m=REFORMA2.mun(String(CTX.cod));
  set('comp-mun-lbl', m?tc(m.nome)+' · '+CTX.ano:'—');
  if(!m) return;
  const p=REFORMA2.parametrosPadrao();
  const lin=REFORMA2.calcularMunicipio(CTX.cod,p).filter(l=>!l.semDado&&l.ano>=2026&&l.ano<=2096);
  const yrs=lin.map(l=>l.ano), idxSel=yrs.indexOf(CTX.ano);
  const parts=[l=>l.rem,l=>l.parteMedia,l=>l.parteConsumo,l=>l.seguroRecebido];
  const ch=charts.composicao; ch.data.labels=yrs.map(String);
  ch.data.datasets.forEach((ds,i)=>{
    ds.data=lin.map(l=>+(parts[i](l)/1e6).toFixed(1));
    ds.borderColor=lin.map((l,k)=>k===idxSel?'#0b1e45':'rgba(0,0,0,0)');
    ds.borderWidth=lin.map((l,k)=>k===idxSel?2:0);
  });
  ch.update();
  document.getElementById('comp-cidade-leg').innerHTML='<span><i style="background:#9aa6b2"></i>ICMS/ISS restante</span><span><i style="background:#2f4566"></i>IBS pela média</span><span><i style="background:#2f5d57"></i>IBS pelo consumo</span><span><i style="background:#4b3a6b"></i>Seguro recebido</span>';
}

/* ============================================================
   PANORAMA DE SC (perfil, porte, rankings, composição, diferença) — v2
   ============================================================ */
let _panAno=null,_panData=null,_scTot=null;
function scTot(){ if(!_scTot) _scTot=REFORMA2.calcularTotal(REFORMA2.parametrosPadrao()); return _scTot; }
function panoramaCompute(){
  if(_panAno===CTX.ano&&_panData) return _panData;
  const p=REFORMA2.parametrosPadrao(), i2025=REFORMA2.anos.indexOf(2025);
  const perfil={}, porte={}, mlist=[];
  REFORMA2.municipios.forEach(x=>{
    const m=REFORMA2.mun(x.cod);
    const l=REFORMA2.linhaAno(REFORMA2.calcularMunicipio(x.cod,p),CTX.ano);
    if(!l||l.semDado) return;
    const impPct=l.sem? l.lei/l.sem-1:0;
    const g=m.grupo||'—';
    (perfil[g]=perfil[g]||{sem:0,lei:0,n:0,perdem:0}); perfil[g].sem+=l.sem; perfil[g].lei+=l.lei; perfil[g].n++; if(impPct<-0.0005)perfil[g].perdem++;
    const pt=REFORMA2.porte(m.populacao[i2025]||0);
    (porte[pt]=porte[pt]||{sem:0,lei:0,n:0,perdem:0}); porte[pt].sem+=l.sem; porte[pt].lei+=l.lei; porte[pt].n++; if(impPct<-0.0005)porte[pt].perdem++;
    mlist.push({cod:x.cod,nome:x.nome,porte:pt,impPct,imp:l.lei-l.sem});
  });
  _panData={perfil,porte,mlist}; _panAno=CTX.ano; return _panData;
}
function panDivBars(rows){
  const mx=Math.max(...rows.map(r=>Math.abs(r.pct)),0.001);
  return rows.map(r=>{const w=Math.abs(r.pct)/mx*48,pos=r.pct>=0;
    return `<div class="pan-bar"><div class="lb">${tc(r.lab)}<small>${r.perdem} de ${r.n} perdem</small></div>`+
      `<div class="track"><div class="mid"></div><i style="${pos?'left:50%':'right:50%'};width:${w}%;background:${pos?'#7f98a3':'#7a3b35'}"></i></div>`+
      `<div class="vl ${pos?'pos':'neg'}">${pctSig(r.pct*100)}</div></div>`;}).join('');
}
function panTopList(items,loss){
  const mx=Math.max(...items.map(i=>Math.abs(i.impPct)),0.001);
  return items.map(i=>`<li data-cod="${i.cod}"><div class="nm">${tc(i.nome)}<small>${cpMoney(i.imp)} · ${i.porte.replace('Pequeno porte','Peq.')}</small></div>`+
    `<div class="bar" style="width:${Math.max(Math.abs(i.impPct)/mx*100,3)}%;background:${loss?'#7a3b35':'#7f98a3'}"></div>`+
    `<div class="v ${loss?'neg':'pos'}">${pctSig(i.impPct*100)}</div></li>`).join('');
}
function renderPanorama(){
  if(typeof REFORMA2==='undefined') return;
  const d=panoramaCompute();
  const perfilRows=Object.keys(d.perfil).map(g=>{const o=d.perfil[g];return {lab:g,pct:o.sem?o.lei/o.sem-1:0,n:o.n,perdem:o.perdem};}).sort((a,b)=>a.pct-b.pct);
  document.getElementById('pan-perfil').innerHTML=panDivBars(perfilRows);
  const ordem=['Pequeno porte I','Pequeno porte II','Médio porte','Grande porte'];
  const porteRows=ordem.filter(k=>d.porte[k]).map(k=>{const o=d.porte[k];return {lab:k,pct:o.sem?o.lei/o.sem-1:0,n:o.n,perdem:o.perdem};});
  document.getElementById('pan-porte').innerHTML=panDivBars(porteRows);
  document.getElementById('pan-perdas').innerHTML=panTopList([...d.mlist].sort((a,b)=>a.impPct-b.impPct).slice(0,10),true);
  document.getElementById('pan-ganhos').innerHTML=panTopList([...d.mlist].sort((a,b)=>b.impPct-a.impPct).slice(0,10),false);
  document.querySelectorAll('.pan-top li[data-cod]').forEach(li=>li.addEventListener('click',()=>{CTX.cod=+li.dataset.cod;const s=document.getElementById('mun-select');if(s)s.value=li.dataset.cod;render();}));
  updatePanCharts();
}
function buildPanCharts(){
  if(charts.panComp) return;
  charts.panComp=new Chart(document.getElementById('pan-comp'),{type:'line',data:{labels:[],datasets:[
    {label:'ICMS/ISS restante',data:[],backgroundColor:'#9aa6b2',borderColor:'#9aa6b2',fill:true,stack:'s',pointRadius:0,borderWidth:0,tension:.1},
    {label:'IBS pela média',data:[],backgroundColor:'#2f4566',borderColor:'#2f4566',fill:true,stack:'s',pointRadius:0,borderWidth:0,tension:.1},
    {label:'IBS pelo consumo',data:[],backgroundColor:'#2f5d57',borderColor:'#2f5d57',fill:true,stack:'s',pointRadius:0,borderWidth:0,tension:.1},
    {label:'Seguro recebido',data:[],backgroundColor:'#4b3a6b',borderColor:'#4b3a6b',fill:true,stack:'s',pointRadius:0,borderWidth:0,tension:.1},
  ]},options:{maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.dataset.label+': R$ '+num1(c.raw)+' bi'}}},
    scales:{x:{grid:{display:false},ticks:{maxTicksLimit:10,font:{size:8.5}}},y:{stacked:true,grid:{color:gridClr},ticks:{font:{size:8.5}}}}}});
  charts.panDif=new Chart(document.getElementById('pan-dif'),{type:'line',data:{labels:[],datasets:[
    {label:'Pela lei',data:[],borderColor:'#2f4566',borderWidth:3,pointRadius:0,tension:.15},
    {label:'Regra final',data:[],borderColor:'#3d5a45',borderDash:[6,4],borderWidth:2.6,pointRadius:0,tension:.15},
  ]},options:{maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.dataset.label+': '+pctSig(c.raw)}}},
    scales:{x:{grid:{display:false},ticks:{maxTicksLimit:10,font:{size:8.5}}},y:{grid:{color:gridClr},ticks:{font:{size:8.5},callback:v=>v+'%'}}}}});
}
function updatePanCharts(){
  buildPanCharts();
  const t=scTot().filter(r=>r.ano>=2026&&r.ano<=2096), yrs=t.map(r=>String(r.ano));
  const cc=charts.panComp; cc.data.labels=yrs;
  cc.data.datasets[0].data=t.map(r=>+(r.rem/1e9).toFixed(2));
  cc.data.datasets[1].data=t.map(r=>+(r.parteMedia/1e9).toFixed(2));
  cc.data.datasets[2].data=t.map(r=>+(r.parteConsumo/1e9).toFixed(2));
  cc.data.datasets[3].data=t.map(r=>+(r.seguroRecebido/1e9).toFixed(2));
  cc.update();
  const cd=charts.panDif; cd.data.labels=yrs;
  cd.data.datasets[0].data=t.map(r=>+((r.lei/r.sem-1)*100).toFixed(1));
  cd.data.datasets[1].data=t.map(r=>+((r.final/r.sem-1)*100).toFixed(1));
  cd.update();
  document.getElementById('pan-comp-leg').innerHTML='<span><i style="background:#9aa6b2"></i>ICMS/ISS restante</span><span><i style="background:#2f4566"></i>IBS pela média</span><span><i style="background:#2f5d57"></i>IBS pelo consumo</span><span><i style="background:#4b3a6b"></i>Seguro recebido</span>';
  document.getElementById('pan-dif-leg').innerHTML='<span><i class="solid" style="background:#2f4566"></i>Pela lei</span><span><i class="line" style="border-top-color:#3d5a45"></i>Regra final</span>';
}

/* ============================================================
   INIT
   ============================================================ */
CTX.sc = true;               // padrão: Santa Catarina inteira (o município é escolhido no seletor)
buildCharts();
syncSliders();
render();
