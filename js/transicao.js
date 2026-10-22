/* ============================================================
   TELA: TRANSIÇÃO DA REFORMA TRIBUTÁRIA 2026–2033  (Tela 2)
   ------------------------------------------------------------
   Município selecionado na topbar e modelo v2 (REFORMA2), receita
   "pela lei" (com seguro-receita), anos 2026 a 2033.
     • 5 cards de indicadores
     • gráfico com 4 visualizações: evolução (R$) · composição (%) ·
       diferença para o cenário-base · tabela detalhada
     • diferença acumulada e indicadores da transição
     • painel "Parâmetros do cenário": sliders e cenários prontos do
       Simulador de Cenários (mesmo estado `cur` do app), aplicados
       sobre o modelo v2 (ver params() abaixo)
   Reaproveita os formatadores e helpers do app.js e o estilo
   dos cards da tela de Mapa de Risco (.rm-stat, .rm-title...).
   ============================================================ */
(function () {
  if (typeof REFORMA2 === 'undefined') return;

  const ANO0 = 2026, ANO1 = 2033;
  const IPCA = 0.035;                       // premissa do projeto (valores reais)
  const COR = { icms: '#8b93a0', ibs: '#33363d', com: '#2f4566', sem: '#64748b', dif: '#7a3b35', media: '#2f4566', consumo: '#2f5d57', seguro: '#4b3a6b', pos: '#3d5a45' };
  const $ = (id) => document.getElementById(id);
  const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  const sig0 = (v) => (v > 0.5 ? '+' : (v < -0.5 ? '−' : '')) + nf0.format(Math.abs(v));

  let tab = 'evo', unit = 'nom';
  let chart = null, accChart = null;
  let S = null;            // série corrente

  /* ---------------- parâmetros do cenário (sliders do simulador) ----------------
     O último cenário pronto escolhido (Conservador, Base ou Otimista) é a
     referência: nele o desvio é zero e os números são os do modelo v2 puro
     (os mesmos da Tela 1). Mexendo nos sliders:
       • crescimento econômico/consumo → desvio anual sobre o consumo e a
         receita sem reforma do município, a partir de 2025 (mesma regra do
         simulador: 45% econômico + 55% consumo);
       • crescimento populacional → desvio sobre a fatia do município na
         cota-parte do IBS estadual;
       • consumo local → parâmetro L do modelo v2 (relativo ao cenário);
       • alíquota de IBS → muda a alíquota de referência do v2 na mesma
         proporção (18,7% no Base ≡ 17,5% de referência no v2).            */
  let refPreset = 'base';
  const _applyPreset = applyPreset;
  applyPreset = function (n) { if (PRESETS[n]) refPreset = n; _applyPreset(n); };   // eslint-disable-line no-global-assign
  const ANCORA = REFORMA2.meta.ano_base_dados || 2025;
  const ALIQ_REF = REFORMA2.parametrosPadrao().aliquota;

  function params() {
    for (const k of REFORMA2.CEN) if (sameParams(cur, PRESETS[k])) refPreset = k;
    const ref = PRESETS[refPreset];
    const g = (q) => 0.45 * q.eco / 100 + 0.55 * q.cons / 100;
    return {
      cen: refPreset, ref,
      dg: g(cur) - g(ref), dpop: (cur.pop - ref.pop) / 100,
      L: cur.loc / ref.loc, aliq: ALIQ_REF * cur.ibs / ref.ibs,
      custom: !REFORMA2.CEN.some((k) => sameParams(cur, PRESETS[k])),
    };
  }

  /* roda o motor v2 sobre uma cópia do município com os desvios aplicados */
  function linhasAjustadas(cod, P) {
    const p = REFORMA2.parametrosPadrao({ cenario: P.cen, consumoLocal: P.L, aliquota: P.aliq });
    const m = REFORMA2.mun(String(cod));
    if (Math.abs(P.dg) < 1e-12 && Math.abs(P.dpop) < 1e-12) return { p, lin: REFORMA2.calcularMunicipio(cod, p), ser: m.series[P.cen] };
    const anos = REFORMA2.anos;
    const f = (d, t) => t <= ANCORA ? 1 : Math.max(0.05, Math.pow(1 + d, t - ANCORA));
    const sc = (arr, d) => arr.map((v, i) => v == null ? v : v * f(d, anos[i]));
    const s0 = m.series[P.cen];
    const ser = { cp_icms: sc(s0.cp_icms, P.dg), iss: sc(s0.iss, P.dg), consumo: sc(s0.consumo, P.dg) };
    const KEY = '__tr_ajuste__';
    REFORMA2.D.municipios[KEY] = Object.assign({}, m, { p_ipm_ibs: sc(m.p_ipm_ibs, P.dpop), series: { [P.cen]: ser } });
    try { return { p, lin: REFORMA2.calcularMunicipio(KEY, p), ser }; }
    finally { delete REFORMA2.D.municipios[KEY]; }
  }

  /* ---------------- Santa Catarina: soma dos 295 (mesmos parâmetros em cada um) ---------------- */
  const CAMPOS_SC = ['sem', 'rem', 'lei', 'parteMedia', 'parteConsumo', 'seguroRecebido', 'teste', 'ibsCota', 'ibsConsumo'];
  let _scKey = null, _scVal = null;
  function linhasSC(P) {
    const key = [P.cen, P.dg, P.dpop, P.L, P.aliq].join('|');
    if (key === _scKey) return _scVal;
    const n = REFORMA2.anos.length;
    const lin = REFORMA2.anos.map((ano) => Object.assign({ ano, f: 1 }, Object.fromEntries(CAMPOS_SC.map((c) => [c, 0]))));
    const ser = { cp_icms: new Array(n).fill(0), iss: new Array(n).fill(0) };
    let p = null;
    REFORMA2.municipios.forEach((x) => {
      const r = linhasAjustadas(x.cod, P); p = r.p;
      r.lin.forEach((l, i) => {
        if (!l || l.semDado) return;
        CAMPOS_SC.forEach((c) => { lin[i][c] += l[c] || 0; });
        lin[i].f = l.f;
        ser.cp_icms[i] += r.ser.cp_icms[i] || 0; ser.iss[i] += r.ser.iss[i] || 0;
      });
    });
    _scKey = key; _scVal = { p, lin, ser };
    return _scVal;
  }

  /* ---------------- série 2026–2033 (município ou SC) ---------------- */
  function serie(cod) {
    const P = params();
    const { p, lin, ser } = CTX.sc ? linhasSC(P) : linhasAjustadas(cod, P);
    const m = REFORMA2.mun(String(cod));
    const defl = (y) => unit === 'real' ? Math.pow(1 + IPCA, y - ANO0) : 1;
    const rows = [];
    let acc = 0, accSem = 0;
    for (let y = ANO0; y <= ANO1; y++) {
      const i = REFORMA2.idxAno[y], l = lin[i];
      if (!l || l.semDado) continue;
      const d = defl(y);
      const r = {
        ano: y, i, l,
        rem: l.rem / d, ibs: (l.lei - l.rem) / d, com: l.lei / d, sem: l.sem / d,
        media: l.parteMedia / d, consumo: l.parteConsumo / d, seguro: l.seguroRecebido / d,
        cp: (ser.cp_icms[i] || 0) / d, iss: (ser.iss[i] || 0) / d,
      };
      r.dif = r.com - r.sem; r.difPct = r.sem ? r.dif / r.sem : 0;
      acc += r.dif; accSem += r.sem; r.acc = acc;
      rows.push(r);
    }
    return { cod, cen: P.cen, P, m, lin, rows, acc, accSem, p };
  }

  /* dependência de transferências: cota-parte do ICMS (+ a parte do IBS que
     chega como cota-parte estadual, a parcela da média histórica na mesma
     proporção de 2026 e o seguro-receita recebido) ÷ receita total */
  function depTransf(r, cpShare26) {
    const l = r.l, d = r.l.lei / r.com;           // deflator do ano
    const cotaFrac = l.ibsConsumo ? l.ibsCota / l.ibsConsumo : 0;
    const consumoSemTeste = (l.parteConsumo - l.teste) / d;
    const t = l.f * r.cp + r.media * cpShare26 + consumoSemTeste * cotaFrac + r.seguro;
    return r.com ? t / r.com : 0;
  }

  /* ---------------- ano de equilíbrio ---------------- */
  function anoEquilibrio() {
    const t = REFORMA2.trajetoria(S.lin, 'lei');
    if (t.ganhaNoFim && t.sempre) return { v: '2029', n: 'ganha desde o início do IBS' };
    if (t.ganhaNoFim) return { v: String(t.desde), n: 'receita com reforma ≥ sem reforma' };
    return { v: 'Não atinge', n: 'perde receita até 2096' };
  }

  /* ============================================================
     CARDS
     ============================================================ */
  function setV(id, txt, cls) { const e = $(id); e.textContent = txt; e.className = 'v ' + (cls || ''); }
  function renderKpis() {
    const a = S.rows[0], b = S.rows[S.rows.length - 1];
    const cenL = 'cenário ' + REFORMA2.cenLabel(S.cen) + (S.P.custom ? ' + ajustes' : '');
    $('tr-k1-s').textContent = cenL; $('tr-k2-s').textContent = cenL;
    const realTxt = unit === 'real' ? 'em R$ de 2026' : 'valores nominais';
    setV('tr-k1', money(a.com), 'v-navy'); $('tr-k1-n').textContent = `ICMS + ISS: ${money(a.rem)}`;
    setV('tr-k2', money(b.com), 'v-blue'); $('tr-k2-n').textContent = realTxt;
    const v = b.com - a.com, vp = a.com ? v / a.com : 0;
    setV('tr-k3', moneySig(v), v >= 0 ? 'v-green' : 'v-coral'); $('tr-k3-n').textContent = pctSig(vp * 100) + ' no período';
    const ip = S.accSem ? S.acc / S.accSem : 0;
    setV('tr-k4', moneySig(S.acc), S.acc < 0 ? 'v-coral' : 'v-teal');
    $('tr-k4-n').textContent = pctSig(ip * 100) + ' da receita sem reforma';
    $('tr-k4-b').className = 'badge ' + (S.acc < 0 ? 'b-coral' : 'b-teal');
    const eq = anoEquilibrio();
    $('tr-k5').textContent = eq.v; $('tr-k5-n').textContent = eq.n;
  }

  /* ============================================================
     GRÁFICO PRINCIPAL (4 abas)
     ============================================================ */
  const M = (v) => v / 1e6;
  const LEG = {
    evo: `<span><i style="background:${COR.icms}"></i>ICMS + ISS (transição)</span><span><i style="background:${COR.ibs}"></i>IBS (transição)</span>` +
      `<span><i class="ln" style="background:${COR.com}"></i>Receita total com reforma</span><span><i class="dash"></i>Receita total sem reforma (cenário-base)</span>` +
      `<span><i class="ln" style="background:${COR.dif}"></i>Diferença anual</span>`,
    comp: `<span><i style="background:${COR.icms}"></i>ICMS + ISS restante</span><span><i style="background:${COR.media}"></i>IBS pela média histórica</span>` +
      `<span><i style="background:${COR.consumo}"></i>IBS pelo consumo (destino)</span><span><i style="background:${COR.seguro}"></i>Seguro-receita recebido</span>`,
    dif: `<span><i style="background:${COR.dif}"></i>Diferença anual (R$)</span><span><i class="ln" style="background:${COR.ibs}"></i>Diferença anual (%)</span>`,
  };
  const TITLE = {
    evo: 'Arrecadação total e composição por tributo',
    comp: 'Composição da receita com reforma (%)',
    dif: 'Diferença anual para o cenário-base (sem reforma)',
    tab: 'Tabela detalhada da transição',
  };

  function label(ctx, txt, x, y, color, bold, noHalo) {
    ctx.font = `${bold ? 700 : 600} 10.5px 'Inter',sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (color !== '#fff' && !noHalo) { ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineJoin = 'round'; ctx.strokeText(txt, x, y); }
    ctx.fillStyle = color; ctx.fillText(txt, x, y);
  }

  const evoLabels = {
    id: 'trEvoLabels',
    afterDatasetsDraw(ch) {
      const ctx = ch.ctx; ctx.save();
      [0, 1].forEach((k) => {
        const meta = ch.getDatasetMeta(k); if (meta.hidden) return;
        meta.data.forEach((bar, j) => {
          const v = ch.data.datasets[k].data[j]; const h = Math.abs(bar.base - bar.y);
          if (v == null || h < 15) return;
          label(ctx, nf0.format(v), bar.x, (bar.y + bar.base) / 2, k === 1 ? '#fff' : '#33363d', true, true);
        });
      });
      const mc = ch.getDatasetMeta(2), ms = ch.getDatasetMeta(3), md = ch.getDatasetMeta(4);
      ms.data.forEach((ps, j) => {
        const pc = mc.data[j], vs = ch.data.datasets[3].data[j], vc = ch.data.datasets[2].data[j];
        if (!ms.hidden) label(ctx, nf0.format(vs), ps.x, ps.y - 10, '#475569');
        if (!mc.hidden && Math.abs(pc.y - ps.y) >= 14) label(ctx, nf0.format(vc), pc.x, pc.y - 10, COR.com, true);
      });
      if (!md.hidden) md.data.forEach((pt, j) => label(ctx, sig0(ch.data.datasets[4].data[j]), pt.x, pt.y + 12, COR.dif, true));
      ctx.restore();
    },
  };
  const compLabels = {
    id: 'trCompLabels',
    afterDatasetsDraw(ch) {
      const ctx = ch.ctx; ctx.save();
      ch.data.datasets.forEach((ds, k) => {
        const meta = ch.getDatasetMeta(k); if (meta.hidden) return;
        meta.data.forEach((bar, j) => {
          const v = ds.data[j]; if (v == null || v < 6) return;
          label(ctx, nf0.format(v) + '%', bar.x, (bar.y + bar.base) / 2, k === 0 ? '#33363d' : '#fff', true, true);
        });
      });
      ctx.restore();
    },
  };
  const difLabels = {
    id: 'trDifLabels',
    afterDatasetsDraw(ch) {
      const ctx = ch.ctx; ctx.save();
      const meta = ch.getDatasetMeta(0);
      meta.data.forEach((bar, j) => {
        const v = ch.data.datasets[0].data[j];
        label(ctx, sig0(v), bar.x, v < 0 ? bar.y + 10 : bar.y - 10, v < 0 ? COR.dif : COR.pos, true);
      });
      ctx.restore();
    },
  };

  /* anos depois do ano-base aparecem esmaecidos (efeito do botão Avançar) */
  const futuro = (y) => CTX.ano >= ANO0 && CTX.ano < ANO1 && y > CTX.ano;

  function buildChart() {
    if (chart) { chart.destroy(); chart = null; }
    const yrs = S.rows.map((r) => String(r.ano));
    const tickY = { font: { size: 9.5 }, callback: (v) => nf0.format(v) };
    let cfg;
    if (tab === 'evo') {
      const difs = S.rows.map((r) => M(r.dif)), mx = Math.max(...S.rows.map((r) => M(Math.max(r.com, r.sem))));
      const mn = Math.min(0, ...difs);
      cfg = {
        data: { labels: yrs, datasets: [
          { type: 'bar', label: 'ICMS + ISS (transição)', data: S.rows.map((r) => M(r.rem)), backgroundColor: S.rows.map((r) => futuro(r.ano) ? 'rgba(143,163,191,.28)' : COR.icms), stack: 's', borderRadius: 3, barPercentage: .62, order: 3 },
          { type: 'bar', label: 'IBS (transição)', data: S.rows.map((r) => M(r.ibs)), backgroundColor: S.rows.map((r) => futuro(r.ano) ? 'rgba(51,54,61,.22)' : COR.ibs), stack: 's', borderRadius: 3, barPercentage: .62, order: 3 },
          { type: 'line', label: 'Receita total com reforma', data: S.rows.map((r) => M(r.com)), borderColor: COR.com, backgroundColor: COR.com, borderWidth: 2.6, pointRadius: 3.5, pointBorderColor: '#fff', pointBorderWidth: 1.5, tension: .2, order: 1 },
          { type: 'line', label: 'Receita total sem reforma', data: S.rows.map((r) => M(r.sem)), borderColor: COR.sem, backgroundColor: COR.sem, borderDash: [6, 4], borderWidth: 2, pointRadius: 2.5, tension: .2, order: 2 },
          { type: 'line', label: 'Diferença anual', data: difs, borderColor: COR.dif, backgroundColor: COR.dif, borderWidth: 1.6, pointRadius: 3, tension: .2, order: 0 },
        ] },
        options: {
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10.5, weight: 600 } } },
            y: { suggestedMin: Math.min(mn * 1.7, -mx * 0.07), suggestedMax: mx * 1.12, grid: { color: gridClr }, ticks: tickY },
          },
        },
        plugins: [evoLabels],
      };
    } else if (tab === 'comp') {
      const parts = [['ICMS + ISS restante', 'rem', COR.icms], ['IBS pela média histórica', 'media', COR.media], ['IBS pelo consumo (destino)', 'consumo', COR.consumo], ['Seguro-receita recebido', 'seguro', COR.seguro]];
      cfg = {
        type: 'bar',
        data: { labels: yrs, datasets: parts.map(([lb, k, c]) => ({ label: lb, data: S.rows.map((r) => r.com ? +(r[k] / r.com * 100).toFixed(2) : 0), _raw: S.rows.map((r) => r[k]), backgroundColor: c, stack: 's', barPercentage: .62, borderRadius: 2 })) },
        options: {
          scales: { x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10.5, weight: 600 } } },
            y: { stacked: true, min: 0, max: 100, grid: { color: gridClr }, ticks: { font: { size: 9.5 }, callback: (v) => v + '%' } } },
          plugins: { tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${pct(c.raw, 1)} · ${money(c.dataset._raw[c.dataIndex])}` } } },
        },
        plugins: [compLabels],
      };
    } else {
      const difs = S.rows.map((r) => M(r.dif));
      cfg = {
        data: { labels: yrs, datasets: [
          { type: 'bar', label: 'Diferença anual (R$ mi)', data: difs, backgroundColor: difs.map((v) => v < 0 ? COR.dif : COR.pos), borderRadius: 3, barPercentage: .55, yAxisID: 'y', order: 2 },
          { type: 'line', label: 'Diferença anual (%)', data: S.rows.map((r) => +(r.difPct * 100).toFixed(2)), borderColor: COR.ibs, backgroundColor: COR.ibs, borderWidth: 2.4, pointRadius: 3.5, tension: .2, yAxisID: 'y1', order: 1 },
        ] },
        options: {
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10.5, weight: 600 } } },
            y: { grid: { color: gridClr }, grace: '15%', ticks: tickY },
            y1: { position: 'right', grid: { display: false }, grace: '15%', ticks: { font: { size: 9.5 }, callback: (v) => num1(v) + '%' } },
          },
          plugins: { tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${c.datasetIndex === 1 ? pctSig(c.raw) : moneySig(c.raw * 1e6)}` } } },
        },
        plugins: [difLabels],
      };
    }
    cfg.options = Object.assign({ maintainAspectRatio: false, animation: false, interaction: { mode: 'index', intersect: false } }, cfg.options);
    cfg.options.layout = { padding: { top: 16 } };
    cfg.options.plugins = Object.assign({ legend: { display: false },
      tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${money(c.raw * 1e6)}` } } }, cfg.options.plugins || {});
    chart = new Chart($('tr-chart'), cfg);
  }

  function renderTable() {
    const f = (v) => num1(M(v));
    let html = S.rows.map((r) => `<tr><td><b>${r.ano}</b></td><td>${f(r.rem)}</td><td>${f(r.ibs)}</td><td>${f(r.com)}</td><td>${f(r.sem)}</td>` +
      `<td class="${r.dif < 0 ? 'neg' : 'pos'}">${moneyShort(r.dif)}</td><td class="${r.dif < 0 ? 'neg' : 'pos'}">${pctSig(r.difPct * 100)}</td>` +
      `<td class="${r.acc < 0 ? 'neg' : 'pos'}">${moneyShort(r.acc)}</td></tr>`).join('');
    const sum = (k) => S.rows.reduce((s, r) => s + r[k], 0);
    html += `<tr class="tot"><td>Total</td><td>${f(sum('rem'))}</td><td>${f(sum('ibs'))}</td><td>${f(sum('com'))}</td><td>${f(sum('sem'))}</td>` +
      `<td class="${S.acc < 0 ? 'neg' : 'pos'}">${moneyShort(S.acc)}</td><td class="${S.acc < 0 ? 'neg' : 'pos'}">${pctSig(S.acc / S.accSem * 100)}</td><td></td></tr>`;
    $('tr-table').innerHTML = html;
  }

  function renderMain() {
    $('tr-chart-title').textContent = TITLE[tab] + (tab === 'evo' && CTX.ano >= ANO0 && CTX.ano < ANO1 ? ` · até ${CTX.ano}` : '');
    const isTab = tab === 'tab';
    $('tr-box').classList.toggle('hidden', isTab);
    $('tr-table-wrap').classList.toggle('hidden', !isTab);
    $('tr-legend').classList.toggle('hidden', isTab);
    $('tr-legend').innerHTML = LEG[tab] || '';
    const u = unit === 'real' ? 'R$ milhões de 2026 (IPCA)' : 'R$ milhões';
    $('tr-unit-lbl').textContent = tab === 'comp' ? '% da receita com reforma' : (tab === 'dif' ? u + ' · % da receita sem reforma' : u);
    $('tr-acc-unit').textContent = u;
    if (isTab) { if (chart) { chart.destroy(); chart = null; } renderTable(); }
    else buildChart();
    document.querySelectorAll('#tr-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === tab));
  }

  /* ============================================================
     DIFERENÇA ACUMULADA
     ============================================================ */
  const accLabels = {
    id: 'trAccLabels',
    afterDatasetsDraw(ch) {
      const ctx = ch.ctx; ctx.save();
      ch.getDatasetMeta(0).data.forEach((pt, j) => {
        const v = ch.data.datasets[0].data[j];
        label(ctx, sig0(v) + (Math.abs(v) >= 0.5 ? ' mi' : ''), pt.x, v < 0 ? pt.y - 11 : pt.y - 11, v < 0 ? COR.dif : COR.pos, true);
      });
      ctx.restore();
    },
  };
  function renderAcc() {
    const yrs = S.rows.map((r) => String(r.ano)), vals = S.rows.map((r) => +M(r.acc).toFixed(2));
    const neg = S.acc < 0, c = neg ? COR.dif : COR.pos;
    if (accChart) accChart.destroy();
    accChart = new Chart($('tr-acc'), {
      type: 'line',
      data: { labels: yrs, datasets: [{ label: 'Diferença acumulada', data: vals, borderColor: c, borderWidth: 2.4, pointRadius: 3.5, pointBackgroundColor: c, pointBorderColor: '#fff', pointBorderWidth: 1.5,
        fill: 'origin', backgroundColor: neg ? 'rgba(122,59,53,.16)' : 'rgba(61,90,69,.16)', tension: .25 }] },
      options: { maintainAspectRatio: false, animation: false, layout: { padding: { top: 18, right: 26, left: 6 } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => ' Acumulado: ' + moneySig(x.raw * 1e6) } } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 9.5 } } },
          y: { grace: '18%', grid: { color: gridClr }, ticks: { font: { size: 9.5 }, callback: (v) => nf0.format(v) } } } },
      plugins: [accLabels],
    });
  }

  /* ============================================================
     RESUMO + INDICADORES
     ============================================================ */
  const ICO = {
    banco: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/></svg>',
    troca: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h13l-4-4M20 15H7l4 4"/></svg>',
    queda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6l7 7 3-3 6 6"/><path d="M20 11v5h-5"/></svg>',
    alta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18l7-7 3 3 6-6"/><path d="M20 13V8h-5"/></svg>',
    alvo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    moeda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.5"/></svg>',
    barras: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V14M9 20V10M14 20V12M19 20V6"/></svg>',
    repasse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="12" width="7" height="8" rx="1"/><rect x="14" y="5" width="7" height="15" rx="1"/><path d="M10 8h4M12 6l2 2-2 2"/></svg>',
  };
  const fm = (v) => 'R$ ' + nfMi.format(Math.abs(v) / 1e6) + ' mi';

  function renderInd() {
    const R = S.rows, a = R[0], b = R[R.length - 1];
    const ultRem = [...R].reverse().find((r) => r.rem > 0) || a;
    const ibs0 = R.find((r) => r.ano >= 2029 && r.ibs > 0) || R.find((r) => r.ibs > 0) || b;
    const nIbs = b.ano - ibs0.ano, nRem = ultRem.ano - a.ano;
    const cagrIbs = nIbs > 0 && ibs0.ibs > 0 ? Math.pow(b.ibs / ibs0.ibs, 1 / nIbs) - 1 : null;
    const cagrRem = nRem > 0 && a.rem > 0 ? Math.pow(ultRem.rem / a.rem, 1 / nRem) - 1 : null;
    const reducao = a.rem ? b.rem / a.rem - 1 : null;
    const cpShare26 = (a.cp + a.iss) ? a.cp / (a.cp + a.iss) : 0;
    const dep0 = depTransf(a, cpShare26), dep1 = depTransf(b, cpShare26);
    const cls = (v) => v == null ? '' : (v < 0 ? 'neg' : 'pos');
    const tiles = [
      ['moeda', '#e7ecf6', '#33363d', `Participação do IBS na receita total (${b.ano})`, pct(b.ibs / b.com * 100, 1), ''],
      ['banco', 'var(--coral-soft)', 'var(--coral)', `Redução do ICMS/ISS ${a.ano}–${b.ano}`, reducao == null ? '–' : pctSig(reducao * 100), cls(reducao)],
      ['alta', '#e8eaef', '#2f4566', `Taxa média anual de crescimento do IBS (${ibs0.ano}–${b.ano})`, cagrIbs == null ? '–' : pctSig(cagrIbs * 100) + ' <small>a.a.</small>', cls(cagrIbs)],
      ['queda', '#f1ece4', '#7a5a2e', `Taxa média anual de variação do ICMS/ISS (${a.ano}–${ultRem.ano})`, cagrRem == null ? '–' : pctSig(cagrRem * 100) + ' <small>a.a.</small>', cls(cagrRem)],
      ['repasse', '#ebe8f0', '#4b3a6b', `Dependência de transferências (${a.ano})`, pct(dep0 * 100, 1), ''],
      ['repasse', '#ebe8f0', '#4b3a6b', `Dependência de transferências (${b.ano})`, pct(dep1 * 100, 1), ''],
    ];
    $('tr-ind').innerHTML = tiles.map(([ic, bg, fg, t, v, c]) =>
      `<div class="it"><div class="ic" style="background:${bg};color:${fg}">${ICO[ic]}</div><div style="min-width:0"><span>${t}</span><b class="${c}">${v}</b></div></div>`).join('');
  }

  /* ============================================================
     PAINEL DE PARÂMETROS
     ============================================================ */
  function renderParams() {
    document.querySelectorAll('.tr-range').forEach((r) => { r.value = cur[r.dataset.k]; paintRange(r); });
    document.querySelectorAll('[data-trv]').forEach((e) => { const k = e.dataset.trv; e.textContent = pct(cur[k], k === 'ibs' ? 2 : 1); });
    document.querySelectorAll('#tr-scen .scen-card').forEach((c) => {
      const on = sameParams(cur, PRESETS[c.dataset.preset]);
      c.classList.toggle('sel', on);
      let chk = c.querySelector('.check');
      if (on && !chk) { chk = document.createElement('div'); chk.className = 'check'; chk.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-11"/></svg>'; c.prepend(chk); }
      if (!on && chk) chk.remove();
    });
  }

  /* ============================================================
     MODAIS
     ============================================================ */
  function openTr(kind) {
    const modal = $('modal-metod'), P = REFORMA2.D.parametros_legais;
    const pc = (x) => pct(x * 100, 0);
    let html;
    if (kind === 'metod') {
      modal.querySelector('.modal-head b').textContent = 'Metodologia da transição 2026–2033';
      const linhas = P.ano.map((y, k) => [y, k]).filter(([y]) => y >= ANO0 && y <= ANO1).map(([y, k]) =>
        `<tr><td><b>${y}</b></td><td>${pc(P.fator_icms_iss[k])}</td><td>${pc(P.ret[k])}</td><td>${pc(P.seguro[k])}</td><td>${P.parcela_ibs_teste[k] ? pc(P.parcela_ibs_teste[k]) : '–'}</td></tr>`).join('');
      html = `
        <p>A receita do município em cada ano é a soma de quatro partes (modelo v2, "pela lei"):</p>
        <ul>
          <li><b>ICMS + ISS restante</b>: a fatia do sistema atual que ainda existe no ano.</li>
          <li><b>IBS pela média histórica</b>: parte retida e distribuída pela participação do município na arrecadação de 2019–2026.</li>
          <li><b>IBS pelo consumo (destino)</b>: parte que segue o consumo local e a população (cota-parte estadual), já descontados os 5% do seguro-receita. Em 2027–2028 inclui o IBS de teste.</li>
          <li><b>Seguro-receita recebido</b>: compensação para os municípios entre as maiores perdas.</li>
        </ul>
        <h4>Parâmetros da lei ano a ano</h4>
        <table class="of-tbl" style="font-size:12px!important"><thead><tr><th>Ano</th><th>ICMS/ISS mantido</th><th>Retenção pela média</th><th>Seguro-receita</th><th>IBS de teste</th></tr></thead><tbody>${linhas}</tbody></table>
        <p style="margin-top:12px">A <b>diferença</b> de cada ano é a receita com reforma menos a receita sem reforma (cota-parte do ICMS + ISS projetada). A <b>diferença acumulada</b> soma essas diferenças desde 2026.</p>
        <p style="color:var(--muted);font-size:11px">Base legal: EC 132/2023 (ADCT arts. 128 a 132) e LC 214/2025.</p>`;
    } else {
      modal.querySelector('.modal-head b').textContent = 'Parâmetros do cenário: como entram no cálculo';
      html = `
        <ul>
          <li><b>Modelo:</b> dados_reforma_v2 (295 municípios de SC), receita "pela lei", com seguro-receita.</li>
          <li><b>Cenário de referência:</b> ${REFORMA2.cenLabel(S.cen)} (o último cenário pronto escolhido). Nele os sliders não causam desvio e os números são os do modelo v2, os mesmos do Mapa de Risco.</li>
          <li><b>Parâmetros atuais:</b> crescimento econômico ${pct(cur.eco, 1)}, consumo ${pct(cur.cons, 1)}, população ${pct(cur.pop, 1)}, IBS total ${pct(cur.ibs, 2)}, consumo local ${pct(cur.loc, 0)}.</li>
          <li><b>Como entram no cálculo:</b> a diferença entre o crescimento escolhido (45% econômico + 55% consumo) e o do cenário de referência vira um desvio anual, a partir de ${ANCORA}, sobre o consumo e a receita sem reforma do município; o crescimento populacional muda a fatia do município na cota-parte do IBS estadual; o consumo local vira o fator L do v2.</li>
          <li><b>Alíquota de referência do IBS no v2:</b> ${pct(S.p.aliquota * 100, 2)}. O slider é aplicado em proporção ao cenário (18,7% no Base equivale aos 17,5% de referência do v2).</li>
          <li><b>Receita sem reforma:</b> cota-parte do ICMS + ISS projetada pela tendência do município.</li>
          <li><b>Ano de equilíbrio:</b> primeiro ano a partir do qual a receita com reforma fica igual ou acima da receita sem reforma até 2096.</li>
          <li><b>Dependência de transferências:</b> parte da receita que chega por repasse: cota-parte do ICMS, cota-parte do IBS estadual, a parcela da média histórica na mesma proporção da cota-parte em 2026 e o seguro-receita recebido.</li>
          <li><b>Taxas médias anuais:</b> crescimento composto; a do IBS começa em 2029 (primeiro ano de IBS pleno) e a do ICMS/ISS vai até o último ano em que ele existe.</li>
        </ul>
        <p style="color:var(--muted);font-size:11px">Projeções sujeitas a alterações na legislação, na economia e nas bases de dados.</p>`;
    }
    $('modal-body').innerHTML = html;
    modal.classList.remove('hidden');
  }

  /* ============================================================
     RENDER
     ============================================================ */
  window.renderTransicao = function () {
    const cod = CTX.cod;
    if (!REFORMA2.mun(String(cod))) return;
    S = serie(cod);
    $('tr-sub').textContent = (CTX.sc ? 'Santa Catarina (soma dos 295 municípios)' : munLabel(cod)) + ' · cenário ' + REFORMA2.cenLabel(S.cen) + (S.P.custom ? ' com parâmetros ajustados' : '');
    renderParams();
    renderKpis();
    renderMain();
    renderAcc();
    renderInd();
  };

  document.querySelectorAll('#tr-tabs button').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.t; renderMain(); }));
  $('tr-metod').addEventListener('click', () => openTr('metod'));
  $('tr-prem').addEventListener('click', () => openTr('prem'));
  document.querySelectorAll('.tr-range').forEach((r) => r.addEventListener('input', () => {
    cur[r.dataset.k] = parseFloat(r.value);
    syncSliders();          // mantém os sliders do Simulador de Cenários iguais
    render();               // app.js → recalcula tudo e chama renderTransicao()
  }));
  $('tr-reset').addEventListener('click', () => resetBase());
})();
