/* ============================================================
   TELA: MAPA DE RISCO MUNICIPAL  (Tela 1)
   ------------------------------------------------------------
   Cards da tela, todos sobre o modelo v2 (REFORMA2 / dados_reforma_v2):
     1. Mapa coroplético dos 295 municípios (classe de risco no ano-base)
     2. Seis cards de indicadores do município selecionado
     3. Ranking de impacto percentual (maiores perdas / ganhos)
     4. Distribuição dos municípios por classe de risco (rosca)
   Reaproveita: MALHA_SC (geometria), MAPA_COR (cores das classes),
   REFORMA2.calcularMunicipio / indicadores / classeRisco, os
   formatadores do app.js (money, moneySig, pctSig, tc...) e o modal.
   Contexto: município e ano vêm da topbar (CTX); o cenário econômico
   vem do seletor "Cenário" (Meu Cenário → usa o cenário Base).
   ============================================================ */
(function () {
  if (typeof REFORMA2 === 'undefined' || typeof MALHA_SC === 'undefined') return;

  const ORDEM = ['Muito favorável', 'Favorável', 'Neutro', 'Atenção', 'Crítico'];
  const SEM_DADOS = 'Sem dados';
  const COR_SEM = '#d8dee6';
  const cor = (c) => MAPA_COR[c] || COR_SEM;
  const corTxt = (c) => (c === 'Neutro' || c === 'Favorável' || !MAPA_COR[c]) ? '#33363d' : '#fff';
  const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const $ = (id) => document.getElementById(id);

  /* ---------------- cenário econômico (topbar) ---------------- */
  function cenAtual() {
    const s = $('tb-scen-select');
    const v = s ? s.value : 'base';
    return REFORMA2.CEN.includes(v) ? v : 'base';
  }

  /* ---------------- índice 0–1 (cada classe ocupa uma faixa de 0,2) ----------------
     impacto  +20% → 0 | +10% → 0,2 | +3% → 0,4 | −3% → 0,6 | −10% → 0,8 | −20% → 1   */
  const PTS = [[0.20, 0], [0.10, 0.2], [0.03, 0.4], [-0.03, 0.6], [-0.10, 0.8], [-0.20, 1]];
  function indice(v) {
    if (v >= PTS[0][0]) return 0;
    if (v <= PTS[PTS.length - 1][0]) return 1;
    for (let k = 0; k < PTS.length - 1; k++) {
      const [a, ya] = PTS[k], [b, yb] = PTS[k + 1];
      if (v <= a && v >= b) return ya + (yb - ya) * (a - v) / (a - b);
    }
    return 0.5;
  }

  /* ---------------- dados (com cache) ---------------- */
  const _lin = {};
  function linhas(cen) {
    if (_lin[cen]) return _lin[cen];
    const p = REFORMA2.parametrosPadrao({ cenario: cen });
    const o = {};
    REFORMA2.municipios.forEach((x) => { o[x.cod] = REFORMA2.calcularMunicipio(x.cod, p); });
    return (_lin[cen] = o);
  }
  const _cache = {};
  function calc(ano, cen) {
    const key = cen + '|' + ano;
    if (_cache[key]) return _cache[key];
    const L = linhas(cen), i = REFORMA2.idxAno[ano];
    const aliq = REFORMA2.parametrosPadrao().aliquota;
    const byCod = {}, rows = [], counts = {};
    ORDEM.forEach((c) => (counts[c] = 0)); counts[SEM_DADOS] = 0;
    REFORMA2.municipios.forEach((x) => {
      const l = i == null ? null : L[x.cod][i];
      if (!l || l.semDado || !l.sem) { byCod[x.cod] = { cod: x.cod, nome: x.nome, classe: null }; counts[SEM_DADOS]++; return; }
      const ind = REFORMA2.indicadores(l, 'lei', aliq);
      const o = { cod: x.cod, nome: x.nome, classe: ind.classe, impPct: ind.impacto, imp: ind.dif,
        sem: l.sem, com: l.lei, eq: ind.aliqEquilibrio, idx: indice(ind.impacto), linha: l, i };
      byCod[x.cod] = o; rows.push(o); counts[ind.classe]++;
    });
    const media = rows.length ? rows.reduce((s, r) => s + r.idx, 0) / rows.length : null;
    // Santa Catarina = soma dos municípios (receitas somadas; % recalculado sobre a soma)
    let sc = null;
    if (rows.length) {
      const L0 = { ano, sem: 0, lei: 0, rem: 0, teste: 0 };
      rows.forEach((r) => { L0.sem += r.linha.sem; L0.lei += r.linha.lei; L0.rem += r.linha.rem; L0.teste += r.linha.teste; });
      const ind = REFORMA2.indicadores(L0, 'lei', aliq);
      sc = { nome: 'Santa Catarina', classe: ind.classe, impPct: ind.impacto, imp: ind.dif, sem: L0.sem, com: L0.lei,
        eq: ind.aliqEquilibrio, idx: indice(ind.impacto), perdem: rows.filter((r) => r.imp < 0).length };
    }
    return (_cache[key] = { ano, cen, byCod, rows, counts, media, n: rows.length, sc });
  }

  /* ---------------- estado da tela ---------------- */
  const VB0 = { x: 0, y: 0, w: MALHA_SC.w, h: MALHA_SC.h };
  let vb = { ...VB0 };
  let rankTab = 'perdas', rankFull = false;
  let charts = { donut: null };
  let D = null;           // resultado de calc() corrente
  const bbox = {};        // bbox de cada município (coordenadas da malha)

  function bboxOf(cod) {
    if (bbox[cod]) return bbox[cod];
    const d = MALHA_SC.p[cod]; if (!d) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const re = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g; let m;
    while ((m = re.exec(d))) { const x = +m[1], y = +m[2]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return (bbox[cod] = { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
  }

  /* ============================================================
     1. MAPA
     ============================================================ */
  function buildMap() {
    const svg = $('rm-map'); if (svg.dataset.built) return;
    let html = '<g id="rm-g">';
    for (const cod in MALHA_SC.p) html += `<path class="m" data-cod="${cod}" d="${MALHA_SC.p[cod]}"></path>`;
    html += `<path class="contorno" d="${MALHA_SC.c}"></path></g>`;
    html += '<g class="pin" id="rm-pin"><path d="M0,0 C-3,-8 -11,-14 -11,-23 A11,11 0 1 1 11,-23 C11,-14 3,-8 0,0Z" fill="#0b1e45" stroke="#fff" stroke-width="1.6"/><circle cx="0" cy="-23" r="4.4" fill="#fff"/></g>';
    svg.innerHTML = html; svg.dataset.built = '1';

    /* arrastar (quando aproximado) + clique para selecionar */
    let drag = null;
    svg.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY, vb: { ...vb }, moved: false, target: e.target.closest('path.m') };
      svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove', (e) => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) > 4) { drag.moved = true; svg.classList.add('dragging'); hideTip(); }
        if (drag.moved && vb.w < VB0.w - 0.5) {
          const rc = svg.getBoundingClientRect();
          const k = Math.max(drag.vb.w / rc.width, drag.vb.h / rc.height);
          vb = clampVB({ ...drag.vb, x: drag.vb.x - dx * k, y: drag.vb.y - dy * k });
          applyVB();
        }
        return;
      }
      showTip(e);
    });
    const end = (e) => {
      if (!drag) return;
      const d = drag; drag = null; svg.classList.remove('dragging');
      if (!d.moved && d.target) selecionar(+d.target.dataset.cod);
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', () => { drag = null; svg.classList.remove('dragging'); });
    svg.addEventListener('mouseleave', hideTip);

    document.querySelectorAll('#rm-map-wrap .rm-ctrl button').forEach((b) => b.addEventListener('click', () => {
      const z = b.dataset.z;
      if (z === 'home') animateTo({ ...VB0 });
      else if (z === 'in') zoom(1 / 1.6);
      else if (z === 'out') zoom(1.6);
      else if (z === 'sel') { const bb = CTX.sc ? null : bboxOf(CTX.cod); if (!bb) animateTo({ ...VB0 }); if (bb) { animateTo(clampVB(centered(bb.cx, bb.cy, VB0.w / 3.2))); } }
    }));
  }

  function centered(cx, cy, w) { const h = w * VB0.h / VB0.w; return { x: cx - w / 2, y: cy - h / 2, w, h }; }
  function clampVB(v) {
    const w = Math.min(Math.max(v.w, VB0.w / 10), VB0.w), h = w * VB0.h / VB0.w;
    let cx = v.x + v.w / 2, cy = v.y + v.h / 2;
    if (w >= VB0.w - 0.5) return { ...VB0 };
    cx = Math.min(Math.max(cx, w / 2), VB0.w - w / 2);
    cy = Math.min(Math.max(cy, h / 2), VB0.h - h / 2);
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }
  function zoom(f) { animateTo(clampVB(centered(vb.x + vb.w / 2, vb.y + vb.h / 2, vb.w * f))); }
  let _anim = null;
  function animateTo(t) {
    cancelAnimationFrame(_anim);
    const s = { ...vb }, t0 = performance.now(), dur = 260;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      vb = { x: s.x + (t.x - s.x) * e, y: s.y + (t.y - s.y) * e, w: s.w + (t.w - s.w) * e, h: s.h + (t.h - s.h) * e };
      applyVB();
      if (p < 1) _anim = requestAnimationFrame(step);
    };
    _anim = requestAnimationFrame(step);
  }
  function applyVB() {
    $('rm-map').setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    placePin();
  }

  function paintMap() {
    const svg = $('rm-map');
    svg.querySelectorAll('path.m').forEach((p) => {
      const d = D.byCod[p.dataset.cod];
      p.setAttribute('fill', cor(d && d.classe));
      p.classList.toggle('sel', !CTX.sc && +p.dataset.cod === CTX.cod);
    });
    // município selecionado por cima (para a borda aparecer inteira)
    const sel = svg.querySelector(`path.m[data-cod="${CTX.cod}"]`);
    const cont = svg.querySelector('path.contorno');
    if (sel && cont && !CTX.sc) cont.parentNode.insertBefore(sel, cont);

    // legenda lateral
    $('rm-legend').innerHTML = ORDEM.concat([SEM_DADOS]).map((c) =>
      `<div class="it" data-c="${c}"><i style="background:${cor(c)}"></i>${c}<b>${D.counts[c] || 0}</b></div>`).join('');
    bindHighlight('#rm-legend .it');
    $('rm-fonte').textContent = `Fonte: modelo v2 (dados_reforma_v2) · cenário ${REFORMA2.cenLabel(D.cen)} · ${D.ano}`;
    placePin();
  }

  /* realça uma classe no mapa (legendas e rosca) */
  function highlight(classe) {
    const svg = $('rm-map'); if (!svg) return;
    if (!classe) { svg.classList.remove('filtering'); svg.querySelectorAll('path.hl').forEach((p) => p.classList.remove('hl')); return; }
    svg.classList.add('filtering');
    svg.querySelectorAll('path.m').forEach((p) => {
      const d = D.byCod[p.dataset.cod];
      p.classList.toggle('hl', ((d && d.classe) || SEM_DADOS) === classe);
    });
  }
  function bindHighlight(sel) {
    document.querySelectorAll(sel).forEach((el) => {
      el.addEventListener('mouseenter', () => highlight(el.dataset.c));
      el.addEventListener('mouseleave', () => highlight(null));
    });
  }

  /* pin do município selecionado (tamanho constante em qualquer zoom) */
  function placePin() {
    const pin = $('rm-pin');
    if (!pin || !D) return;
    const bb = CTX.sc ? null : bboxOf(CTX.cod);
    if (!bb) { pin.style.display = 'none'; return; }
    pin.style.display = '';
    pin.setAttribute('transform', `translate(${bb.cx},${bb.cy}) scale(${vb.w / VB0.w})`);
  }

  /* tooltip de hover */
  function showTip(e) {
    const tip = $('rm-tip'), t = e.target.closest && e.target.closest('path.m');
    if (!t || !D) { hideTip(); return; }
    const d = D.byCod[t.dataset.cod];
    const nome = d ? tc(d.nome) : t.dataset.cod;
    tip.innerHTML = d && d.classe
      ? `<b>${nome}</b><br>${d.classe} · ${pctSig(d.impPct * 100)}<br>${moneySig(d.imp)}`
      : `<b>${nome}</b><br>Sem dados`;
    tip.classList.remove('hidden');
    const r = $('rm-map-wrap').getBoundingClientRect();
    let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
    if (x + tip.offsetWidth > r.width - 8) x = e.clientX - r.left - tip.offsetWidth - 12;
    if (y + tip.offsetHeight > r.height - 8) y = e.clientY - r.top - tip.offsetHeight - 12;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hideTip() { const t = $('rm-tip'); if (t) t.classList.add('hidden'); }

  /* ============================================================
     2. CARDS DE INDICADORES (município selecionado, ano-base)
     ============================================================ */
  function setV(id, txt, cls) { const e = $(id); if (!e) return; e.textContent = txt; e.className = 'v ' + (cls || ''); }

  function renderKpis() {
    const d = CTX.sc ? D.sc : D.byCod[CTX.cod];
    const tag = $('rm-s-risco');
    if (!d || !d.classe) {
      ['rm-s-sem', 'rm-s-com', 'rm-s-imp', 'rm-s-pct', 'rm-s-eq'].forEach((id) => setV(id, '–'));
      $('rm-s-eq-n').textContent = ''; $('rm-s-pct-n').textContent = ''; $('rm-s-risco-n').textContent = '';
      tag.textContent = 'Sem dados'; tag.style.background = COR_SEM; tag.style.color = '#33363d';
      return;
    }
    const neg = d.imp < 0;
    setV('rm-s-sem', money(d.sem), 'v-navy');
    setV('rm-s-com', money(d.com), 'v-blue');
    setV('rm-s-imp', moneySig(d.imp), neg ? 'v-coral' : 'v-teal');
    setV('rm-s-pct', pctSig(d.impPct * 100), neg ? 'v-coral' : 'v-teal');
    $('rm-s-imp-badge').className = 'badge ' + (neg ? 'b-coral' : 'b-teal');
    $('rm-s-imp-badge').style.transform = neg ? '' : 'rotate(180deg)';
    $('rm-s-pct-badge').className = 'badge ' + (neg ? 'b-coral' : 'b-teal');
    const ref = REFORMA2.parametrosPadrao().aliquota * 100;
    if (d.eq != null && isFinite(d.eq)) {
      setV('rm-s-eq', pct(d.eq * 100, 2), 'v-green');
      const dif = d.eq * 100 - ref;
      $('rm-s-eq-n').textContent = `ref. ${pct(ref, 2)} · ${dif >= 0 ? '+' : '−'}${num1(Math.abs(dif))} p.p.`;
    } else { setV('rm-s-eq', '–', 'v-green'); $('rm-s-eq-n').textContent = 'calculada a partir de 2029'; }
    const ordem = [...D.rows].sort((x, y) => x.impPct - y.impPct), pos = ordem.findIndex((r) => r.cod === CTX.cod) + 1;
    $('rm-s-pct-n').textContent = CTX.sc ? `${d.perdem} de ${ordem.length} municípios perdem receita`
      : (neg ? `${pos}ª maior perda de ${ordem.length}` : `${ordem.length - pos + 1}º maior ganho de ${ordem.length}`);
    tag.textContent = d.classe.toUpperCase();
    tag.style.background = cor(d.classe); tag.style.color = corTxt(d.classe);
    $('rm-s-risco-n').textContent = `Índice ${nf2.format(d.idx)} de 0 a 1`;
  }

  /* ============================================================
     3. RANKING
     ============================================================ */
  function renderRanking() {
    const list = [...D.rows].sort((a, b) => rankTab === 'perdas' ? a.impPct - b.impPct : b.impPct - a.impPct);
    const pos = CTX.sc ? -1 : list.findIndex((r) => r.cod === CTX.cod);
    const row = (r, i) => `<li data-cod="${r.cod}" class="${!CTX.sc && r.cod === CTX.cod ? 'me' : ''}"><span class="p">${i + 1}º</span>` +
      `<span class="n">${tc(r.nome)}</span><span class="v ${r.impPct < 0 ? 'neg' : 'pos'}">${pctSig(r.impPct * 100)}</span></li>`;
    let html;
    if (rankFull) html = list.map(row).join('');
    else {
      html = list.slice(0, 5).map(row).join('');
      if (pos >= 5) html += '<li class="gap">⋯</li>' + row(list[pos], pos);
    }
    if (!list.length) html = `<li class="gap" style="letter-spacing:0">Sem dados para ${D.ano}.</li>`;
    const ol = $('rm-rank-list');
    ol.innerHTML = html; ol.classList.toggle('full', rankFull);
    ol.querySelectorAll('li[data-cod]').forEach((li) => li.addEventListener('click', () => selecionar(+li.dataset.cod)));
    if (rankFull) { const me = ol.querySelector('li.me'); if (me) me.scrollIntoView({ block: 'nearest' }); }
    $('rm-rank-more').textContent = rankFull ? `Mostrar só o top 5 ↑` : `Ver ranking completo (${list.length}) →`;
    document.querySelectorAll('#rm-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === rankTab));
  }

  /* ============================================================
     4. DISTRIBUIÇÃO (rosca)
     ============================================================ */
  const CATS = ORDEM.concat([SEM_DADOS]);
  function renderDist() {
    const vals = CATS.map((c) => D.counts[c] || 0), tot = vals.reduce((a, b) => a + b, 0) || 1;
    if (!charts.donut) {
      charts.donut = new Chart($('rm-donut'), {
        type: 'doughnut',
        data: { labels: CATS, datasets: [{ data: vals, backgroundColor: CATS.map(cor), borderColor: '#fff', borderWidth: 2, hoverOffset: 6 }] },
        options: {
          maintainAspectRatio: false, cutout: '64%', layout: { padding: 6 },
          plugins: { legend: { display: false },
            tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw} (${pct(c.raw / c.dataset.data.reduce((a, b) => a + b, 0) * 100, 1)})` } } },
          onHover: (e, els) => highlight(els.length ? CATS[els[0].index] : null),
        },
      });
      $('rm-donut').addEventListener('mouseleave', () => highlight(null));
    } else {
      charts.donut.data.datasets[0].data = vals; charts.donut.update('none');
    }
    $('rm-donut-n').textContent = D.n;
    $('rm-dist-leg').innerHTML = CATS.map((c, k) =>
      `<div class="it" data-c="${c}"><i style="background:${cor(c)}"></i><span>${c}</span><b>${vals[k]}</b><small>(${pct(vals[k] / tot * 100, 1)})</small></div>`).join('');
    bindHighlight('#rm-dist-leg .it');
  }

  /* ============================================================
     MODAL — "Entenda o índice"
     ============================================================ */
  function openIndice() {
    const modal = $('modal-metod');
    modal.querySelector('.modal-head b').textContent = 'Índice de risco: como é calculado';
    const faixa = (c, txt, ix) => `<tr><td><span class="rm-chip" style="background:${cor(c)};color:${corTxt(c)}">${c}</span></td><td style="text-align:left">${txt}</td><td>${ix}</td></tr>`;
    $('modal-body').innerHTML = `
      <p>O <b>Índice de Exposição à Reforma Tributária</b> mostra quanto a receita de cada município muda com a reforma no ano-base escolhido na barra do topo, pelo <b>modelo v2</b> (dados_reforma_v2, 295 municípios de SC).</p>
      <h4>1. Impacto percentual</h4>
      <p><code>impacto = receita com reforma ÷ receita sem reforma − 1</code><br>
      A receita <b>sem reforma</b> é a cota-parte do ICMS + ISS projetada. A receita <b>com reforma</b> segue a lei (EC 132/2023 e LC 214/2025): ICMS/ISS que ainda resta na transição + IBS pela média histórica + IBS pelo consumo (destino) − contribuição ao seguro-receita + seguro recebido.</p>
      <h4>2. Classe de risco</h4>
      <table class="of-tbl" style="font-size:12px!important"><thead><tr><th>Classe</th><th style="text-align:left">Impacto</th><th>Índice</th></tr></thead><tbody>
        ${faixa('Crítico', 'perda de 10% ou mais', '0,8 a 1,0')}
        ${faixa('Atenção', 'perda entre 3% e 10%', '0,6 a 0,8')}
        ${faixa('Neutro', 'entre −3% e +3%', '0,4 a 0,6')}
        ${faixa('Favorável', 'ganho entre 3% e 10%', '0,2 a 0,4')}
        ${faixa('Muito favorável', 'ganho de 10% ou mais', '0,0 a 0,2')}
      </tbody></table>
      <h4>3. Índice de 0 a 1</h4>
      <p>O card de classificação mostra também o índice do município numa escala de 0 (muito favorável) a 1 (crítico), em que cada classe ocupa uma faixa de 0,2. A conversão é linear dentro de cada faixa e satura em ±20%.</p>
      <h4>4. Fatores de exposição</h4>
      <p>São os quatro efeitos que, somados, dão a diferença entre a receita com e sem reforma: regra da média histórica, IBS pelo consumo, contribuição ao seguro-receita e seguro-receita recebido.</p>
      <h4>5. Dependência ICMS / ISS</h4>
      <p>Participação de cada imposto na receita ICMS + ISS do município (a receita que a reforma substitui) no ano-base.</p>
      <p style="color:var(--muted);font-size:11px">O cenário econômico (Conservador, Base ou Otimista) muda os valores em R$; "Meu Cenário" usa o cenário Base do modelo v2. Projeções sujeitas a alterações na legislação, na economia e nas bases de dados.</p>`;
    modal.classList.remove('hidden');
  }

  /* ============================================================
     navegação / seleção
     ============================================================ */
  function irPara(v) {
    setView(v);
    navItems.forEach((x) => x.classList.toggle('active', x.dataset.view === v && !x.dataset.scroll));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function selecionar(cod) {
    if (!cod) return;
    CTX.cod = cod; CTX.sc = false;
    const s = $('mun-select'); if (s) s.value = String(cod);
    render();   // app.js → chama renderMapaRisco() quando esta tela está ativa
  }

  /* ============================================================
     RENDER
     ============================================================ */
  window.renderMapaRisco = function () {
    buildMap();
    const cen = cenAtual();
    D = calc(CTX.ano, cen);
    $('rm-escopo').textContent = CTX.sc ? 'SANTA CATARINA' : munLabel(CTX.cod).toUpperCase();
    const sv = $('tb-scen-select');
    $('rm-cen-lbl').textContent = 'cenário ' + REFORMA2.cenLabel(cen) + (sv && sv.value === 'custom' ? ' (Meu Cenário usa o Base no modelo v2)' : '');
    paintMap();
    renderKpis();
    renderRanking();
    renderDist();
    requestAnimationFrame(placePin);
  };

  /* ---------------- eventos fixos ---------------- */
  document.querySelectorAll('#rm-tabs button').forEach((b) => b.addEventListener('click', () => { rankTab = b.dataset.t; renderRanking(); }));
  $('rm-rank-more').addEventListener('click', () => { rankFull = !rankFull; renderRanking(); });
  $('rm-entenda').addEventListener('click', openIndice);
  $('rm-dist-metod').addEventListener('click', openIndice);
  window.addEventListener('resize', () => { if (curView === 'mapa') placePin(); });
})();
