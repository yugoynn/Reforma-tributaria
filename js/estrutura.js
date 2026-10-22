/* ============================================================
   TELA: ESTRUTURA PRODUTIVA E ENCADEAMENTOS  (Tela 3)
   ------------------------------------------------------------
   Tudo num painel só:
     • 6 cards econômicos (PIB, VA, empregos, empresas,
       índice de encadeamento, retenção de valor)          T3.1
     • fluxos intersetoriais (Sankey fornecedores → município → clientes)  T3.3
     • distribuição do valor adicionado por setor (rosca)   T3.2
     • sensibilidade da receita à alíquota do IBS           T3.4
   Dados: DADOS_ESTRUTURA (js/dados_estrutura.js), gerado do pacote
   entrega_front v1.1 por tools/gerar_dados_estrutura.py.
   Motor de receita: docs/MOTOR_DE_CALCULO.md do pacote (seção 1),
   cenário "lei", consumo local padrão (p = 1). Valores em R$ de 2025.
   ============================================================ */
(function () {
  if (typeof DADOS_ESTRUTURA === 'undefined') return;
  const DE = DADOS_ESTRUTURA, A = DE.aliquota, P = DE.consumo_local;
  const $ = (id) => document.getElementById(id);
  const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const SETOR_COR = { 'Agropecuária': '#55663f', 'Indústria': '#33363d', 'Construção': '#7a5a2e', 'Comércio': '#2f4566', 'Serviços': '#2f5d57', 'Outros': '#9aa6b2' };
  const SETOR_ICO = {
    'Agropecuária': '<path d="M12 21V11M12 11c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/>',
    'Indústria': '<path d="M3 21V10l5 3V10l5 3V10l5 3V4h3v17z"/>',
    'Construção': '<path d="M3 21h18M5 21V11h14v10M9 21v-5h6v5M4 11l8-7 8 7"/>',
    'Comércio': '<path d="M6 6h15l-1.5 9H8L6 3H3"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    'Serviços': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/>',
    'Outros': '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  };
  const fmi = (v) => v == null ? '—' : (Math.abs(v) >= 1000 ? 'R$ ' + nf2.format(v / 1000) + ' bi' : 'R$ ' + nf1.format(v) + ' mi');
  const fmiSig = (v) => (v >= 0 ? '+ ' : '− ') + fmi(Math.abs(v));
  const pc = (x, d = 1) => x == null ? '—' : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(x * 100) + '%';
  const pcSig = (x, d = 1) => x == null ? '' : (x >= 0 ? '+' : '−') + pc(Math.abs(x), d);
  const ROT_COR = { 'Alto': ['#e6ebe7', '#34503c'], 'Médio': ['#f1ece4', '#6b4e26'], 'Baixo': ['#eef0f4', '#475569'] };
  const chip = (r) => r ? `<span class="es-chip" style="background:${(ROT_COR[r] || ROT_COR.Baixo)[0]};color:${(ROT_COR[r] || ROT_COR.Baixo)[1]}">${r}</span>` : '';

  let M = null, cod = null, donut = null, sens = null;

  /* ---------------- motor (MOTOR_DE_CALCULO.md, seção 1 — cenário "lei") ---------------- */
  function k(ano) {
    const i = DE.anos.indexOf(ano), m = M.motor, g = (c) => m[c][i];
    return { sem: g('sem'), fixo: g('f_iss') + g('f_cota_parte_icms') + g('f_teste_cota'), fixo_p: g('fp_teste'),
      a_ret: g('a_retido'), a_cota: g('a_cota'), ap: g('ap_destino'), s0: g('s0'), s1: g('s1') };
  }
  const receita = (c, a, p) => c.fixo + p * c.fixo_p + a * (c.a_ret + c.a_cota) + a * p * c.ap + a * Math.max(0, c.s0 - p * c.s1);
  function aliqEq(c, p) {
    const num = c.sem - c.fixo - p * c.fixo_p, den = c.a_ret + c.a_cota + p * c.ap + Math.max(0, c.s0 - p * c.s1);
    if (den <= 1e-12) return null;
    const a = num / den;
    return a >= 0 && a <= DE.aliquota_equilibrio_max ? a : null;
  }

  /* ============================================================
     1. CARDS
     ============================================================ */
  function setK(n, v, cls, sub, note) {
    const e = $('es-k' + n); e.innerHTML = v; e.className = 'v ' + (cls || '');
    $('es-k' + n + '-s').textContent = sub || ''; $('es-k' + n + '-n').innerHTML = note || '';
  }
  const varTxt = (v, ano) => v == null ? '' : `<span class="${v >= 0 ? 'pos' : 'neg'}">${v >= 0 ? '▲' : '▼'} ${pc(Math.abs(v))}</span> vs ${ano - 1}`;
  function renderKpis() {
    const x = M.kpis;
    setK(1, fmi(x.pib_corrente_mi), 'v-navy', `(${x.ano_pib}, valores correntes)`, varTxt(x.var_pib_nominal, x.ano_pib));
    setK(2, fmi(x.va_corrente_mi), 'v-blue', `(${x.ano_va}, valores correntes)`, x.va_sobre_pib != null ? `${pc(x.va_sobre_pib)} do PIB de ${x.ano_va}` : '');
    setK(3, x.empregos_formais != null ? nf0.format(x.empregos_formais) : '—', 'v-green', `(RAIS ${x.ano_rais})`, varTxt(x.var_empregos, x.ano_rais));
    setK(4, x.empresas_ativas != null ? nf0.format(x.empresas_ativas) : '—', 'v-amber', `(RAIS ${x.ano_rais}, com vínculo)`, varTxt(x.var_empresas, x.ano_rais));
    setK(5, (x.indice_encadeamento != null ? nf2.format(x.indice_encadeamento) : '—') + chip(x.rotulo_encadeamento), 'v-purple', x.agregado ? '(média dos municípios, ponderada pelo VA)' : '(multiplicador de produção local)', 'Cada R$ 1 de demanda gera ' + (x.indice_encadeamento != null ? 'R$ ' + nf2.format(x.indice_encadeamento) : '—') + ' de produção local');
    setK(6, pc(x.retencao_valor) + chip(x.rotulo_retencao), 'v-teal', x.agregado ? '(média dos municípios, ponderada pelo VA)' : '(valor que fica no município)', 'Vazamento: ' + (x.retencao_valor != null ? pc(1 - x.retencao_valor) : '—') + ' do valor gerado');
  }

  /* ============================================================
     2. FLUXOS INTERSETORIAIS (Sankey em SVG)
     ============================================================ */
  const SELO = { nfe_hibrida: 'Matriz híbrida (NF-e + FLQ)', nfe_hibrida_limitada: 'Matriz híbrida (com ressalva)', flq: 'Matriz regionalizada (FLQ)' };
  const FONTE_FLUXO = { flq: 'quocientes locacionais (FLQ)', nfe_bens: 'NF-e (vendas de bens)' };
  const vfmt = (v) => (v >= 10 ? nf0.format(v) : nf1.format(v)) + ' mi';

  function renderSankey() {
    const mip = M.mip, svg = $('es-sankey'), msg = $('es-flux-msg');
    if (!mip) {   // Santa Catarina: a MIP é municipal, não há fluxo agregado
      svg.innerHTML = ''; svg.classList.add('hidden'); msg.classList.remove('hidden');
      $('es-flux-sub').textContent = 'Compras por setor fornecedor (para trás) e vendas por setor comprador (para frente), pela matriz insumo-produto de cada município.';
      const selo = $('es-selo'); selo.textContent = 'Disponível por município'; selo.title = '';
      return;
    }
    svg.classList.remove('hidden'); msg.classList.add('hidden');
    const W = 900, H = 430, top = 46, bot = 14, innerH = H - top - bot;
    const xL = 168, xR = W - 168, nodeW = 8, cw = 210, cx0 = W / 2 - cw / 2, cx1 = W / 2 + cw / 2;
    const forn = mip.forn.map(([s, v, f]) => ({ s, v: Math.max(0, v || 0), f }));
    const cli = mip.cli.map(([s, v, f]) => ({ s, v: Math.max(0, v || 0), f }));
    const tF = forn.reduce((a, b) => a + b.v, 0), tC = cli.reduce((a, b) => a + b.v, 0), tMax = Math.max(tF, tC, 1e-9);
    const bandMax = innerH * 0.58;                         // espessura total máxima dos fluxos
    const slot = innerH / 6;
    function nodes(list) {                                  // um "slot" por setor; altura proporcional ao valor
      const sc = bandMax / tMax;
      return list.map((n, j) => { const h = Math.max(2, n.v * sc), yc = top + slot * j + slot / 2; return { ...n, h, y: yc - h / 2, yc, cy: 0 }; });
    }
    const L = nodes(forn), R = nodes(cli);
    // pontos de chegada empilhados no centro (mesma ordem), centralizados
    const stack = (arr) => { const tot = arr.reduce((a, b) => a + b.h, 0); let y = top + innerH / 2 - tot / 2; arr.forEach((n) => { n.cy = y; y += n.h; }); };
    stack(L); stack(R);
    const boxH = Math.max(210, Math.max(L.reduce((a, b) => a + b.h, 0), R.reduce((a, b) => a + b.h, 0)) + 30);
    const boxY = top + innerH / 2 - boxH / 2;
    const band = (x0, y0, h0, x1, y1, h1) => {
      const xm = (x0 + x1) / 2;
      return `M${x0},${y0} C${xm},${y0} ${xm},${y1} ${x1},${y1} L${x1},${y1 + h1} C${xm},${y1 + h1} ${xm},${y0 + h0} ${x0},${y0 + h0}Z`;
    };
    const ico = (s, x, y) => `<g transform="translate(${x},${y})"><rect width="26" height="26" rx="7" fill="${SETOR_COR[s]}" opacity=".14"/>` +
      `<g transform="translate(5,5) scale(.667)" fill="none" stroke="${SETOR_COR[s]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${SETOR_ICO[s]}</g></g>`;
    let g = '';
    g += `<text x="0" y="18" class="es-col">FORNECEDORES (compras, para trás)</text>`;
    g += `<text x="${W}" y="18" class="es-col" text-anchor="end">CLIENTES (vendas, para frente)</text>`;
    L.forEach((n, j) => {
      g += `<path class="es-band" data-side="f" data-j="${j}" d="${band(xL + nodeW, n.y, n.h, cx0, n.cy, n.h)}" fill="${SETOR_COR[n.s]}"/>`;
      g += `<rect x="${xL}" y="${n.y}" width="${nodeW}" height="${n.h}" rx="2" fill="${SETOR_COR[n.s]}"/>`;
      g += ico(n.s, 0, n.yc - 13);
      g += `<text x="34" y="${n.yc - 2}" class="es-nm">${n.s}</text><text x="34" y="${n.yc + 13}" class="es-vl">${vfmt(n.v)}</text>`;
    });
    R.forEach((n, j) => {
      g += `<path class="es-band" data-side="c" data-j="${j}" d="${band(cx1, n.cy, n.h, xR, n.y, n.h)}" fill="${SETOR_COR[n.s]}"/>`;
      g += `<rect x="${xR}" y="${n.y}" width="${nodeW}" height="${n.h}" rx="2" fill="${SETOR_COR[n.s]}"/>`;
      g += ico(n.s, W - 26, n.yc - 13);
      g += `<text x="${W - 34}" y="${n.yc - 2}" class="es-nm" text-anchor="end">${n.s}</text><text x="${W - 34}" y="${n.yc + 13}" class="es-vl" text-anchor="end">${vfmt(n.v)}</text>`;
    });
    // caixa central
    const c = mip.centro, mx = W / 2;
    g += `<rect x="${cx0}" y="${boxY}" width="${cw}" height="${boxH}" rx="16" class="es-box"/>`;
    const yy = boxY + boxH / 2;
    g += `<g transform="translate(${mx - 13},${yy - 92})" fill="none" stroke="#33363d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h20M5 21V8l6-3v16M11 21V3l10 4v14M8 10h0M8 14h0M15 9h2M15 13h2M15 17h2"/></g>`;
    g += `<text x="${mx}" y="${yy - 48}" class="es-cn" text-anchor="middle">${esc(M.nome)} - SC</text>`;
    g += `<text x="${mx}" y="${yy - 24}" class="es-cl" text-anchor="middle">Valor adicionado (MIP, ${mip.ano_reg})</text>`;
    g += `<text x="${mx}" y="${yy - 4}" class="es-cv" text-anchor="middle">R$ ${nf0.format(c.va_mip_mi)} mi</text>`;
    g += `<text x="${mx}" y="${yy + 24}" class="es-cl" text-anchor="middle">Encadeamento total</text>`;
    g += `<text x="${mx}" y="${yy + 42}" class="es-cs" text-anchor="middle">${nf2.format(c.indice_encadeamento)} (${c.rotulo_encadeamento})</text>`;
    g += `<text x="${mx}" y="${yy + 66}" class="es-cl" text-anchor="middle">Retenção de valor</text>`;
    g += `<text x="${mx}" y="${yy + 84}" class="es-cs" text-anchor="middle">${pc(c.retencao_valor)} (${c.rotulo_retencao})</text>`;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = g;

    // tooltip
    const data = { f: L, c: R };
    svg.querySelectorAll('.es-band').forEach((p) => {
      p.addEventListener('mousemove', (e) => {
        const n = data[p.dataset.side][+p.dataset.j], tot = p.dataset.side === 'f' ? tF : tC;
        const tip = $('es-tip');
        tip.innerHTML = p.dataset.side === 'f'
          ? `<b>${n.s} → ${esc(M.nome)}</b><br>Compras de insumos: R$ ${nf1.format(n.v)} mi<br>${pc(tot ? n.v / tot : 0)} das compras · fonte: ${FONTE_FLUXO[n.f] || n.f}`
          : `<b>${esc(M.nome)} → ${n.s}</b><br>Vendas: R$ ${nf1.format(n.v)} mi<br>${pc(tot ? n.v / tot : 0)} das vendas · fonte: ${FONTE_FLUXO[n.f] || n.f}`;
        tip.classList.remove('hidden');
        const r = $('es-sankey-wrap').getBoundingClientRect();
        let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
        if (x + tip.offsetWidth > r.width - 6) x = e.clientX - r.left - tip.offsetWidth - 12;
        tip.style.left = x + 'px'; tip.style.top = y + 'px';
      });
      p.addEventListener('mouseleave', () => $('es-tip').classList.add('hidden'));
    });

    $('es-flux-sub').textContent = `R$ milhões correntes de ${mip.ano_reg} · compras por setor fornecedor (para trás) e vendas por setor comprador (para frente). MIP nacional do IBGE (${mip.ano_mip}) regionalizada para o município.`;
    const selo = $('es-selo');
    selo.textContent = SELO[mip.fonte] || mip.fonte;
    selo.title = DE.textos.mip_fonte[mip.fonte] || '';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* ============================================================
     3. VALOR ADICIONADO POR SETOR (rosca)
     ============================================================ */
  function renderVA() {
    const tot = M.kpis.va_corrente_mi, ano = M.kpis.ano_va;
    const setores = M.va.map(([s, part]) => ({ s, part: part || 0, v: (part || 0) * (tot || 0) }));
    $('es-donut-tot').textContent = fmi(tot);
    $('es-donut-ano').textContent = `VA de ${ano}`;
    $('es-va-sub').textContent = `Participação de cada setor no valor adicionado de ${ano} (IBGE, valores correntes).`;
    if (!donut) {
      donut = new Chart($('es-donut'), {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: '#fff', borderWidth: 2, hoverOffset: 6 }] },
        options: { maintainAspectRatio: false, cutout: '64%', layout: { padding: 6 }, animation: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${pc(setores[c.dataIndex].part)} · ${fmi(setores[c.dataIndex].v)}` } } } },
      });
    }
    donut.data.labels = setores.map((x) => x.s);
    donut.data.datasets[0].data = setores.map((x) => +(x.part * 100).toFixed(2));
    donut.data.datasets[0].backgroundColor = setores.map((x) => SETOR_COR[x.s]);
    donut.options.plugins.tooltip.callbacks.label = (c) => ` ${c.label}: ${pc(setores[c.dataIndex].part)} · ${fmi(setores[c.dataIndex].v)}`;
    donut.update();
    $('es-va-leg').innerHTML = [...setores].sort((a, b) => b.part - a.part).map((x) =>
      `<div class="it"><i style="background:${SETOR_COR[x.s]}"></i><span>${x.s}</span><b>${pc(x.part)}</b><small>${fmi(x.v)}</small></div>`).join('');
  }

  /* ============================================================
     4. SENSIBILIDADE À ALÍQUOTA (reta receita(a) no ano-base)
     ============================================================ */
  const sensLabels = {
    id: 'esSensLabels',
    afterDatasetsDraw(ch) {
      const ctx = ch.ctx, ds = ch.data.datasets[0], meta = ch.getDatasetMeta(0), area = ch.chartArea;
      ctx.save();
      ctx.font = "700 10.5px 'Inter',sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      const plano = Math.abs(ds.data[ds.data.length - 1].y - ds.data[0].y) < 0.5;   // reta plana: um rótulo só
      meta.data.forEach((pt, j) => {
        if (plano && j > 0) return;
        const t = nf1.format(ds.data[j].y);
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.strokeText(t, pt.x, pt.y - 8);
        ctx.fillStyle = '#33363d'; ctx.fillText(t, pt.x, pt.y - 8);
      });
      const eq = ch.$eq;
      if (eq) {   // linha vertical + caixa no ponto de equilíbrio
        const x = ch.scales.x.getPixelForValue(eq.a * 100), y = ch.scales.y.getPixelForValue(eq.r);
        ctx.setLineDash([4, 4]); ctx.strokeStyle = '#4b3a6b'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, area.bottom); ctx.stroke(); ctx.setLineDash([]);
        const bw = 156, bh = 46, bx = Math.max(x - bw - 14, area.left + 4), by = Math.min(y + 16, area.bottom - bh - 4);   // abaixo e à esquerda (área vazia sob a reta)
        ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.strokeStyle = '#ddd8e6'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 8) : ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.stroke();
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#71808f'; ctx.font = "600 10px 'Inter',sans-serif"; ctx.fillText('Alíquota de equilíbrio', bx + 10, by + 15);
        ctx.fillStyle = '#4b3a6b'; ctx.font = "800 15px 'Inter',sans-serif"; ctx.fillText(pc(eq.a, 2), bx + 10, by + 34);
        ctx.fillStyle = '#71808f'; ctx.font = "600 10px 'Inter',sans-serif"; ctx.textAlign = 'right'; ctx.fillText(fmi(eq.r), bx + bw - 10, by + 34);
      }
      ctx.restore();
    },
  };

  function renderSens() {
    const ano = DE.anos.includes(CTX.ano) ? CTX.ano : 2033;
    const c = k(ano), eq = aliqEq(c, P);
    const pts = [0.14, 0.16, 0.18, A.referencia_externa, 0.20, A.padrao, 0.24, 0.26].filter((a) => a >= A.min - 1e-9 && a <= A.max + 1e-9);
    const line = pts.map((a) => ({ x: +(a * 100).toFixed(3), y: +receita(c, a, P).toFixed(2) }));
    const rPad = receita(c, A.padrao, P), rRef = receita(c, A.referencia_externa, P);
    const slope = (receita(c, 0.25, P) - receita(c, 0.15, P)) / 10;     // R$ mi por p.p.
    $('es-sens-ano').textContent = ano;
    if (sens) sens.destroy();
    const special = [
      { label: `Alíquota padrão do modelo (${pc(A.padrao, 2)})`, a: A.padrao, r: rPad, cor: '#2f4566' },
      { label: `Referência do CGIBS (${pc(A.referencia_externa, 1)})`, a: A.referencia_externa, r: rRef, cor: '#7a5a2e' },
    ];
    sens = new Chart($('es-sens'), {
      type: 'line',
      data: { datasets: [
        { label: 'Receita com reforma (pela lei)', data: line, borderColor: '#33363d', backgroundColor: '#33363d', borderWidth: 2.6, pointRadius: 3.5, pointBackgroundColor: '#33363d', pointBorderColor: '#fff', pointBorderWidth: 1.5, tension: 0, order: 2 },
        { label: 'Receita sem reforma', data: [{ x: A.min * 100, y: +c.sem.toFixed(2) }, { x: A.max * 100, y: +c.sem.toFixed(2) }], borderColor: '#64748b', borderDash: [6, 4], borderWidth: 2, pointRadius: 0, order: 3 },
        ...special.map((s) => ({ label: s.label, data: [{ x: +(s.a * 100).toFixed(3), y: +s.r.toFixed(2) }], showLine: false, pointRadius: 7, pointHoverRadius: 8, pointBackgroundColor: s.cor, pointBorderColor: '#fff', pointBorderWidth: 2, order: 1 })),
        ...(eq != null && eq >= A.min && eq <= A.max ? [{ label: 'Ponto de equilíbrio', data: [{ x: +(eq * 100).toFixed(3), y: +c.sem.toFixed(2) }], showLine: false, pointRadius: 8, pointStyle: 'rectRot', pointBackgroundColor: '#4b3a6b', pointBorderColor: '#fff', pointBorderWidth: 2, order: 0 }] : []),
      ] },
      options: {
        maintainAspectRatio: false, animation: false, layout: { padding: { top: 18, right: 34 } },
        interaction: { mode: 'nearest', intersect: false },
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          title: (it) => 'Alíquota do IBS: ' + nf2.format(it[0].parsed.x) + '%',
          label: (x) => ` ${x.dataset.label}: ${fmi(x.parsed.y)}`,
        } } },
        scales: {
          x: { type: 'linear', min: A.min * 100, max: A.max * 100, grid: { color: gridClr }, title: { display: true, text: 'Alíquota total do IBS (%)', font: { size: 10.5, weight: 600 } },
            ticks: { stepSize: 2, font: { size: 10 }, callback: (v) => nf0.format(v) + '%' } },
          y: { grace: '12%', grid: { color: gridClr }, ticks: { font: { size: 10 }, callback: (v) => nf0.format(v) } },
        },
      },
      plugins: [sensLabels],
    });
    sens.$eq = eq != null && eq >= A.min && eq <= A.max ? { a: eq, r: c.sem } : null;
    sens.update();

    $('es-sens-leg').innerHTML =
      `<span><i class="ln" style="background:#33363d"></i>Receita com reforma (pela lei)</span><span><i class="dash"></i>Receita sem reforma</span>` +
      `<span><i style="background:#2f4566;border-radius:50%"></i>Alíquota padrão</span><span><i style="background:#7a5a2e;border-radius:50%"></i>Referência CGIBS</span>` +
      `<span><i style="background:#4b3a6b;transform:rotate(45deg);border-radius:2px;width:11px;height:11px"></i>Equilíbrio</span>`;

    const imp = (r) => c.sem ? (r - c.sem) / c.sem : 0;
    const fig = (lbl, val, note, cls) => `<div class="es-fig"><span>${lbl}</span><b class="${cls || ''}">${val}</b>${note ? `<small>${note}</small>` : ''}</div>`;
    $('es-figs').innerHTML =
      fig(`Alíquota de equilíbrio (${ano})`, eq != null ? pc(eq, 2) : '—', eq != null ? `${eq > A.padrao ? '+' : '−'}${nf2.format(Math.abs(eq - A.padrao) * 100)} p.p. em relação à padrão` : 'não existe neste ano', 'eq') +
      fig(`Receita sem reforma (${ano})`, fmi(c.sem), 'ISS + cota-parte do ICMS') +
      fig(`Na alíquota padrão (${pc(A.padrao, 2)})`, fmi(rPad), `<span class="${imp(rPad) < 0 ? 'neg' : 'pos'}">${pcSig(imp(rPad))}</span> vs sem reforma`) +
      fig(`Na referência do CGIBS (${pc(A.referencia_externa, 1)})`, fmi(rRef), `<span class="${imp(rRef) < 0 ? 'neg' : 'pos'}">${pcSig(imp(rRef))}</span> vs sem reforma`) +
      fig('Cada +1 p.p. de alíquota', Math.abs(slope) < 0.05 ? 'sem efeito' : fmiSig(slope), Math.abs(slope) < 0.05 ? 'a receita não depende da alíquota neste ano' : (CTX.sc ? 'na receita somada dos municípios' : 'na receita do município'));

    const fora = eq != null && (eq < A.min || eq > A.max) ? ` Ela fica fora da faixa do gráfico (${pc(A.min, 0)} a ${pc(A.max, 0)}).` : '';
    $('es-sens-note').innerHTML = `<span class="ni">ⓘ</span><span>` + (eq != null
      ? `Com a alíquota de equilíbrio de <b>${pc(eq, 2)}</b>, ${esc(M.nome)} mantém em ${ano} a mesma receita que teria sem a reforma (${fmi(c.sem)}).${fora}`
      : (ano < 2029 ? `Entre 2026 e 2028, pela lei, a receita quase não depende da alíquota do IBS (só o IBS de teste), por isso não há alíquota de equilíbrio. Escolha um ano-base a partir de 2029.`
        : `Não há alíquota de equilíbrio até ${pc(DE.aliquota_equilibrio_max, 0)}: ${DE.textos.aliquota_equilibrio.texto}`)) + '</span>';
  }

  /* ============================================================
     RENDER
     ============================================================ */
  window.renderEstrutura = function () {
    cod = CTX.sc ? 'SC' : String(CTX.cod);
    M = CTX.sc ? DE.sc : DE.municipios[cod];
    const sec = $('view-estrutura');
    if (!M) { $('es-mun').textContent = munLabel(CTX.cod); sec.classList.add('es-empty'); return; }
    sec.classList.remove('es-empty');
    $('es-mun').textContent = CTX.sc ? 'Santa Catarina' : M.nome + ' - SC';
    renderKpis();
    renderSankey();
    renderVA();
    renderSens();
    $('es-foot').textContent = `${DE.textos.rodape_fonte} Fluxos e VA em valores correntes do ano indicado.` +
      (CTX.sc ? ' Santa Catarina = soma dos 295 municípios; encadeamento e retenção são médias ponderadas pelo VA.' : '') + ` Modelo ${DE.versao} (${DE.data_geracao}).`;
  };
})();
