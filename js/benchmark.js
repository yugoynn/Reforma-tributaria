/* ============================================================
   BENCHMARKING MUNICIPAL (dentro da aba Decomposição Setorial)
   ------------------------------------------------------------
   • Comparativo de indicadores-chave (municípios + SC)        T5.1
   • Perfil econômico comparativo: radar da composição do PIB,
     com 2 seletores de cidade (+ SC como referência)           T5.4
   • Municípios mais afetados (maiores perdas / ganhos)          T5.2
   • Municípios menos afetados (menor |impacto %|)               T5.3
   Receitas: motor do pacote (DADOS_ESTRUTURA), cenário "lei",
   alíquota padrão, consumo local padrão; ano = Ano-base do topo.
   Indicadores e PIB: DADOS_BENCHMARK (tools/gerar_dados_benchmark.py).
   ============================================================ */
(function () {
  if (typeof DADOS_BENCHMARK === 'undefined' || typeof DADOS_ESTRUTURA === 'undefined') return;
  const DB = DADOS_BENCHMARK, DE = DADOS_ESTRUTURA, A = DE.aliquota.padrao, P = DE.consumo_local;
  const $ = (id) => document.getElementById(id);
  const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const pc = (x, d = 1) => x == null ? '—' : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(x * 100) + '%';
  const sgn = (v, f, eps) => (v >= eps ? '+' : v <= -eps ? '−' : '') + f(Math.abs(v));
  const fmi = (v) => Math.abs(v) >= 1000 ? 'R$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v / 1000) + ' bi' : 'R$ ' + nf1.format(v) + ' mi';
  const EXPO_COR = { BAIXO: ['#e6ebe7', '#34503c'], MEDIO: ['#f1ece4', '#6b4e26'], ALTO: ['#f1e6e4', '#6e332d'] };
  const EXPO_TXT = { BAIXO: 'BAIXO', MEDIO: 'MÉDIO', ALTO: 'ALTO' };
  let rankTab = 'perdas', fullMais = false, fullMenos = false, radar = null;
  let pickA = null, pickB = null, pickAuto = true;     // A acompanha o município do topo até ser trocado à mão

  /* ---------------- motor (MOTOR_DE_CALCULO.md, seção 1) ---------------- */
  function receitas(mot, ano) {
    const i = DE.anos.indexOf(ano), g = (c) => mot[c][i];
    const com = g('f_iss') + g('f_cota_parte_icms') + g('f_teste_cota') + P * g('fp_teste') + A * (g('a_retido') + g('a_cota'))
      + A * P * g('ap_destino') + A * Math.max(0, g('s0') - P * g('s1'));
    return { sem: g('sem'), com };
  }
  function classe(imp) {
    const c = Object.fromEntries(DB.classes.map((x) => [x.codigo, x]));
    if (imp == null || isNaN(imp)) return c.sem_dados;
    if (imp >= c.muito_favoravel.min) return c.muito_favoravel;
    if (imp >= c.favoravel.min) return c.favoravel;
    if (imp > c.neutro.min) return c.neutro;
    if (imp > c.critico.max) return c.atencao;
    return c.critico;
  }
  function dados(cod, ano) {          // cod: código IBGE (string) ou 'SC'
    const sc = cod === 'SC', e = sc ? DE.sc : DE.municipios[cod], b = sc ? DB.sc : DB.municipios[cod];
    if (!e || !b) return null;
    const r = receitas(e.motor, ano), imp = r.com - r.sem, impPct = r.sem ? imp / r.sem : 0;
    const pop = b.pop[DB.anos.indexOf(ano)];
    return { cod, nome: sc ? 'Santa Catarina' : b.nome, sem: r.sem, com: r.com, imp, impPct, pc: pop ? r.com * 1e6 / pop : null, b, cl: classe(impPct) };
  }
  const anoRef = () => (DB.anos.includes(CTX.ano) ? CTX.ano : 2033);

  /* ============================================================
     COMPARATIVO DE INDICADORES-CHAVE
     ============================================================ */
  function colunas() {
    const base = DB.comparacao_padrao.map(String);
    const sel = CTX.sc ? null : String(CTX.cod);
    const lista = sel ? [sel, ...base.filter((c) => c !== sel)].slice(0, 6) : base.slice(0, 6);
    return lista.concat(['SC']);
  }
  function renderComparativo(ano) {
    const cols = colunas().map((c) => dados(c, ano)).filter(Boolean);
    const sel = CTX.sc ? null : String(CTX.cod);
    const linhas = [
      ['Receita projetada com reforma (R$ mi)', (d) => nf1.format(d.com)],
      ['Receita projetada sem reforma (R$ mi)', (d) => nf1.format(d.sem)],
      ['Impacto financeiro (R$ mi)', (d) => `<span class="${d.imp < 0 ? 'neg' : 'pos'}">${sgn(d.imp, (x) => nf1.format(x), 0.05)}</span>`],
      ['Impacto percentual (%)', (d) => `<span class="${d.impPct < 0 ? 'neg' : 'pos'}">${sgn(d.impPct, (x) => pc(x), 0.0005)}</span>`],
      ['Receita per capita com reforma (R$)', (d) => d.pc != null ? nf0.format(d.pc) : '—'],
      [`Dependência do ICMS (% da receita corrente, ${cols[0].b.ano_fiscal})`, (d) => pc(d.b.dep_icms)],
      [`Dependência do ISS (% da receita corrente, ${cols[0].b.ano_fiscal})`, (d) => pc(d.b.dep_iss)],
      [`Participação de Serviços no PIB (%, ${cols[0].b.ano_va})`, (d) => pc(d.b.serv)],
      [`Participação da Indústria no PIB (%, ${cols[0].b.ano_va})`, (d) => pc(d.b.ind)],
      ['Índice de exposição à reforma', (d) => {
        const e = d.cl.indice_exposicao; if (!e) return '—';
        return `<span class="bm-chip" style="background:${EXPO_COR[e][0]};color:${EXPO_COR[e][1]}" title="${d.cl.rotulo}">${EXPO_TXT[e]}</span>`;
      }],
    ];
    const head = '<thead><tr><th></th>' + cols.map((d) =>
      `<th class="${d.cod === 'SC' ? 'sc' : (d.cod === sel ? 'me' : '')}"${d.cod !== 'SC' ? ` data-cod="${d.cod}"` : ''}>${d.cod === 'SC' ? 'SC (total)' : d.nome}</th>`).join('') + '</tr></thead>';
    const body = '<tbody>' + linhas.map(([lb, f]) => `<tr><td>${lb}</td>` + cols.map((d) => `<td class="${d.cod === 'SC' ? 'sc' : (d.cod === sel ? 'me' : '')}">${f(d)}</td>`).join('') + '</tr>').join('') + '</tbody>';
    $('bm-tbl').innerHTML = head + body;
    $('bm-tbl').querySelectorAll('th[data-cod]').forEach((th) => th.addEventListener('click', () => selecionar(+th.dataset.cod)));
  }

  /* ============================================================
     PERFIL ECONÔMICO COMPARATIVO (radar) — 2 cidades + SC
     ============================================================ */
  function opcoes(sel) {
    const ms = Object.entries(DB.municipios).sort((a, b) => a[1].nome.localeCompare(b[1].nome, 'pt-BR'));
    sel.innerHTML = '<option value="SC">Santa Catarina</option>' + ms.map(([c, m]) => `<option value="${c}">${m.nome}</option>`).join('');
  }
  function renderRadar() {
    if (pickAuto || !pickA) pickA = CTX.sc ? '4204608' : String(CTX.cod);
    if (!pickB || pickB === pickA) pickB = DB.comparacao_padrao.map(String).find((c) => c !== pickA) || 'SC';
    $('bm-a').value = pickA; $('bm-b').value = pickB;
    const serie = (c) => (c === 'SC' ? DB.sc : DB.municipios[c]);
    const nome = (c) => (c === 'SC' ? 'Santa Catarina' : DB.municipios[c].nome);
    const ds = [
      { c: pickA, cor: '#2f4566', fill: 'rgba(47,69,102,.16)', w: 2.6, dash: [] },
      { c: pickB, cor: '#7a5a2e', fill: 'rgba(122,90,46,.14)', w: 2.6, dash: [] },
    ];
    if (pickA !== 'SC' && pickB !== 'SC') ds.push({ c: 'SC', cor: '#64748b', fill: 'rgba(0,0,0,0)', w: 1.6, dash: [5, 4] });
    const data = {
      labels: DB.setores_pib,
      datasets: ds.map((d) => ({ label: nome(d.c), data: serie(d.c).pib.map((v) => +(v * 100).toFixed(2)), borderColor: d.cor, backgroundColor: d.fill,
        borderWidth: d.w, borderDash: d.dash, pointRadius: 3, pointBackgroundColor: d.cor, pointBorderColor: '#fff', pointBorderWidth: 1 })),
    };
    const max = Math.max(...data.datasets.flatMap((d) => d.data));
    if (radar) radar.destroy();
    radar = new Chart($('bm-radar'), {
      type: 'radar', data,
      options: { maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${nf1.format(c.raw)}%` } } },
        scales: { r: { min: 0, max: Math.ceil(max / 10) * 10, ticks: { stepSize: 10, font: { size: 9 }, backdropColor: 'rgba(255,255,255,.8)', callback: (v) => v + '%' },
          grid: { color: '#e5e8ee' }, angleLines: { color: '#e5e8ee' }, pointLabels: { font: { size: 11.5, weight: 600 }, color: '#1f2a3a' } } } },
    });
    $('bm-radar-leg').innerHTML = ds.map((d) => d.dash.length
      ? `<span><i class="dash" style="border-top-color:${d.cor}"></i>${nome(d.c)} (referência)</span>`
      : `<span><i style="background:${d.cor}"></i>${nome(d.c)}</span>`).join('');
    $('bm-radar-sub').textContent = `Composição do PIB (%) por setor · IBGE ${DB.sc.ano_va}. Escolha as duas cidades a comparar.`;
  }

  /* ============================================================
     MAIS / MENOS AFETADOS
     ============================================================ */
  function todos(ano) { return Object.keys(DB.municipios).map((c) => dados(c, ano)).filter(Boolean); }
  function lista(el, rows, full, sel) {
    const linha = (d, i) => `<li data-cod="${d.cod}" class="${d.cod === sel ? 'me' : ''}"><span class="p">${i + 1}º</span><span class="n">${d.nome} - SC</span>` +
      `<span class="v ${d.impPct < 0 ? 'neg' : 'pos'}">${sgn(d.impPct, (x) => pc(x), 0.0005)}</span><span class="r">${sgn(d.imp, fmi, 0.05)}</span></li>`;
    let html = (full ? rows : rows.slice(0, 5)).map(linha).join('');
    const pos = rows.findIndex((d) => d.cod === sel);
    if (!full && pos >= 5) html += '<li class="gap">⋯</li>' + linha(rows[pos], pos);
    el.innerHTML = html; el.classList.toggle('full', full);
    el.querySelectorAll('li[data-cod]').forEach((li) => li.addEventListener('click', () => selecionar(+li.dataset.cod)));
    if (full) { const me = el.querySelector('li.me'); if (me) me.scrollIntoView({ block: 'nearest' }); }
  }
  function renderRankings(ano) {
    const t = todos(ano), sel = CTX.sc ? null : String(CTX.cod);
    const mais = [...t].sort((a, b) => rankTab === 'perdas' ? a.impPct - b.impPct : b.impPct - a.impPct);
    const menos = [...t].sort((a, b) => Math.abs(a.impPct) - Math.abs(b.impPct));
    lista($('bm-mais'), mais, fullMais, sel);
    lista($('bm-menos'), menos, fullMenos, sel);
    $('bm-mais-more').textContent = fullMais ? 'Mostrar só o top 5 ↑' : `Ver ranking completo (${t.length}) →`;
    $('bm-menos-more').textContent = fullMenos ? 'Mostrar só o top 5 ↑' : `Ver ranking completo (${t.length}) →`;
    document.querySelectorAll('#bm-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === rankTab));
  }

  function selecionar(cod) {
    CTX.cod = cod; CTX.sc = false; pickAuto = true;
    const s = $('mun-select'); if (s) s.value = String(cod);
    render();
  }

  window.renderBenchmark = function () {
    const ano = anoRef();
    renderComparativo(ano);
    renderRadar();
    renderRankings(ano);
    $('bm-foot').textContent = `Receitas pela lei na alíquota padrão do modelo (${pc(A, 2)}), R$ de 2025. Índice de exposição: ALTO para perdas de 1% ou mais, ` +
      `MÉDIO entre −1% e +1%, BAIXO para ganhos de 1% ou mais. Dependências: ano fiscal ${DB.sc.ano_fiscal}; PIB por setor: IBGE ${DB.sc.ano_va}. Modelo ${DB.versao}.`;
  };

  opcoes($('bm-a')); opcoes($('bm-b'));
  $('bm-a').addEventListener('change', (e) => { pickA = e.target.value; pickAuto = false; renderRadar(); });
  $('bm-b').addEventListener('change', (e) => { pickB = e.target.value; renderRadar(); });
  document.querySelectorAll('#bm-tabs button').forEach((b) => b.addEventListener('click', () => { rankTab = b.dataset.t; renderRankings(anoRef()); }));
  $('bm-mais-more').addEventListener('click', () => { fullMais = !fullMais; renderRankings(anoRef()); });
  $('bm-menos-more').addEventListener('click', () => { fullMenos = !fullMenos; renderRankings(anoRef()); });
})();
