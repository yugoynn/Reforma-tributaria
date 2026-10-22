/* ============================================================
   TELA: DECOMPOSIÇÃO SETORIAL DO IMPACTO  (Tela 4)
   ------------------------------------------------------------
   • Contribuição setorial (cascata: 8 setores + total)      T4.1
   • Impacto por setor (tabela sem/com reforma, R$ e %)      T4.2
   • Participação dos setores na receita com reforma (rosca) T4.3
   • Evolução do impacto por setor (4 maiores + Outros)      T4.4
   Dados: DADOS_SETORIAL (js/dados_setorial.js), gerado do pacote
   entrega_front por tools/gerar_dados_setorial.py.
   setor = fixo + a*coef_a + recebe_seguro * a*max(0, s0 - s1)   (p = 1)
   Alíquota padrão do pacote; município ou SC pelo seletor do topo;
   ano pelo seletor "Ano-base" (anima com o botão Avançar).
   ============================================================ */
(function () {
  if (typeof DADOS_SETORIAL === 'undefined') return;
  const DS = DADOS_SETORIAL, A = DS.aliquota_padrao;
  const $ = (id) => document.getElementById(id);
  const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const COR = { 'Indústria': '#33363d', 'Comércio': '#2f4566', 'Serviços': '#2f5d57', 'Construção': '#7a5a2e', 'Agronegócio': '#55663f',
    'Turismo': '#4b3a6b', 'Tecnologia': '#3d5866', 'Transferências e transição': '#9aa6b2', 'Outros': '#9aa6b2' };
  const CURTO = { 'Transferências e transição': 'Transf. e transição' };
  const ICO = {
    'Indústria': '<path d="M3 21V10l5 3V10l5 3V10l5 3V4h3v17z"/>',
    'Comércio': '<path d="M6 6h15l-1.5 9H8L6 3H3"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    'Serviços': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/>',
    'Construção': '<path d="M3 21h18M5 21V11h14v10M9 21v-5h6v5M4 11l8-7 8 7"/>',
    'Agronegócio': '<path d="M12 21V11M12 11c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/>',
    'Turismo': '<path d="M2 16l20-6-3-3-6 2-6-4-2 1 4 5-5 2-2-1-1 1z"/><path d="M3 21h18"/>',
    'Tecnologia': '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
    'Transferências e transição': '<path d="M4 9h13l-4-4M20 15H7l4 4"/>',
  };
  const fmi = (v) => Math.abs(v) >= 1000 ? 'R$ ' + nf2.format(v / 1000) + ' bi' : 'R$ ' + nf1.format(v) + ' mi';
  // sinal só quando o valor não arredonda para zero na casa decimal exibida
  const sgn = (v, f, eps = 0.05) => (v >= eps ? '+' : v <= -eps ? '−' : '') + f(Math.abs(v));
  const pc = (x, d = 1) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(x * 100) + '%';
  let X = null, wf = null, donut = null, evo = null;

  /* receita de um setor num índice de ano */
  function setorAno(row, i) {
    const [nome, seg, sem, fixo, a] = row;
    const com = fixo[i] + A * a[i] + (seg ? A * X.segbase[i] : 0);
    return { s: nome, sem: sem[i], com, imp: com - sem[i] };
  }
  function anoRef() { return DS.anos.includes(CTX.ano) ? CTX.ano : 2033; }
  const modo = () => $('ds-modo').value;

  /* ============================================================
     CASCATA
     ============================================================ */
  const wfLabels = {
    id: 'dsWfLabels',
    afterDatasetsDraw(ch) {
      const ctx = ch.ctx, ds = ch.data.datasets[0], meta = ch.getDatasetMeta(0);
      ctx.save(); ctx.font = "700 10.5px 'Inter',sans-serif"; ctx.textAlign = 'center';
      meta.data.forEach((bar, j) => {
        const v = ds._v[j], neg = v < 0, top = Math.min(bar.y, bar.base), bot = Math.max(bar.y, bar.base);
        ctx.fillStyle = j === meta.data.length - 1 ? '#33363d' : (neg ? '#6e332d' : '#34503c');
        ctx.textBaseline = neg ? 'top' : 'bottom';
        ctx.fillText(ds._fmt(v), bar.x, neg ? bot + 4 : top - 4);
      });
      ctx.restore();
    },
  };
  function renderWaterfall(rows, tot, i) {
    const pp = modo() === 'pp', k = pp ? 100 / tot.sem : 1;
    const vals = rows.map((r) => r.imp * k), totV = tot.imp * k;
    let acc = 0;
    const bars = vals.map((v) => { const b = [acc, acc + v]; acc += v; return b; });
    bars.push([0, totV]);
    const labels = rows.map((r) => CURTO[r.s] || r.s).concat(['Total']);
    const cores = vals.map((v) => v < 0 ? '#7a3b35' : '#3d5a45').concat(['#33363d']);
    const fmt = pp ? (v) => sgn(v, (x) => nf2.format(x), 0.005) + ' p.p.' : (v) => sgn(v, (x) => Math.abs(x) >= 1000 ? nf2.format(x / 1000) + ' bi' : nf1.format(x));
    $('ds-wf-sub').textContent = pp
      ? 'Quanto cada setor soma ao impacto percentual total (pontos percentuais da receita sem reforma).'
      : 'Impacto financeiro de cada setor na arrecadação (com − sem reforma) · R$ milhões de 2025.';
    if (wf) wf.destroy();
    wf = new Chart($('ds-wf'), {
      type: 'bar',
      data: { labels, datasets: [{ data: bars, backgroundColor: cores, borderRadius: 4, barPercentage: .62, _v: vals.concat([totV]), _fmt: fmt }] },
      options: {
        maintainAspectRatio: false, animation: false, layout: { padding: { top: 18, bottom: 4 } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ' ' + fmt(c.dataset._v[c.dataIndex]) } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9.5, weight: 600 }, maxRotation: 0, autoSkip: false,
            callback: function (v) { const l = this.getLabelForValue(v); return l === 'Transf. e transição' ? ['Transf. e', 'transição'] : (l === 'Agronegócio' ? ['Agrone-', 'gócio'] : (l === 'Construção' ? ['Constru-', 'ção'] : l)); } } },
          y: { grace: '18%', grid: { color: gridClr }, ticks: { font: { size: 9.5 }, callback: (v) => pp ? nf1.format(v) : new Intl.NumberFormat('pt-BR').format(v) } },
        },
      },
      plugins: [wfLabels],
    });
  }

  /* ============================================================
     TABELA
     ============================================================ */
  function renderTabela(rows, tot) {
    const mx = Math.max(...rows.map((r) => Math.abs(r.imp)), 1e-9);
    const ico = (s) => `<span class="ds-ic" style="color:${COR[s]};background:${COR[s]}1f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO[s] || ''}</svg></span>`;
    const barra = (v) => {
      const w = Math.abs(v) / mx * 46;
      return `<div class="ds-bar"><div class="mid"></div><i style="${v >= 0 ? 'left:50%' : 'right:50%'};width:${w}%;background:${v >= 0 ? '#3d5a45' : '#7a3b35'}"></i></div>`;
    };
    const linha = (r, total) => {
      const p = r.sem ? r.imp / r.sem : 0, c = r.imp < -0.05 ? 'neg' : (r.imp > 0.05 ? 'pos' : '');
      return `<tr class="${total ? 'tot' : ''}"><td>${total ? '<b>TOTAL</b>' : ico(r.s) + r.s}</td><td>${nf1.format(r.sem)}</td><td>${nf1.format(r.com)}</td>` +
        `<td class="ds-imp"><span class="${c}">${sgn(r.imp, (x) => nf1.format(x))}</span>${total ? '' : barra(r.imp)}</td><td class="${c}">${r.sem >= 0.05 ? sgn(p, (x) => pc(x), 0.0005) : '—'}</td></tr>`;
    };
    $('ds-tbody').innerHTML = rows.map((r) => linha(r)).join('') + linha({ ...tot, s: 'TOTAL' }, true);
  }

  /* ============================================================
     ROSCA — participação na receita com reforma
     ============================================================ */
  function renderDonut(rows, tot, ano) {
    const lista = [...rows].sort((a, b) => b.com - a.com);
    $('ds-donut-tot').textContent = fmi(tot.com);
    $('ds-donut-ano').textContent = `${ano} · pela lei`;
    if (!donut) {
      donut = new Chart($('ds-donut'), {
        type: 'doughnut', data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: '#fff', borderWidth: 2, hoverOffset: 6 }] },
        options: { maintainAspectRatio: false, cutout: '64%', animation: false, layout: { padding: 6 }, plugins: { legend: { display: false } } },
      });
    }
    donut.data.labels = lista.map((r) => r.s);
    donut.data.datasets[0].data = lista.map((r) => Math.max(0, r.com));
    donut.data.datasets[0].backgroundColor = lista.map((r) => COR[r.s]);
    donut.options.plugins.tooltip = { callbacks: { label: (c) => ` ${c.label}: ${pc(tot.com ? lista[c.dataIndex].com / tot.com : 0)} · ${fmi(lista[c.dataIndex].com)}` } };
    donut.update();
    $('ds-leg').innerHTML = lista.map((r) =>
      `<div class="it"><i style="background:${COR[r.s]}"></i><span>${r.s}</span><b>${pc(tot.com ? r.com / tot.com : 0)}</b><small>${fmi(r.com)}</small></div>`).join('');
  }

  /* ============================================================
     EVOLUÇÃO — 4 setores de maior |impacto| no ano-base + Outros
     ============================================================ */
  const evoLabels = {
    id: 'dsEvoLabels',
    afterDatasetsDraw(ch) {
      const ctx = ch.ctx; ctx.save(); ctx.font = "700 10.5px 'Inter',sans-serif"; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      // rótulos no fim de cada linha, afastados para não se sobreporem (mín. 13 px)
      const its = ch.data.datasets.map((ds, k) => {
        const meta = ch.getDatasetMeta(k), pt = meta.data[meta.data.length - 1];
        return pt && !meta.hidden ? { ds, x: pt.x, y: pt.y } : null;
      }).filter(Boolean).sort((p, q) => p.y - q.y);
      for (let j = 1; j < its.length; j++) if (its[j].y - its[j - 1].y < 13) its[j].y = its[j - 1].y + 13;
      its.forEach((o) => { ctx.fillStyle = o.ds.borderColor; ctx.fillText(o.ds._fmt(o.ds.data[o.ds.data.length - 1]), o.x + 8, o.y); });
      ctx.restore();
    },
  };
  function renderEvo(ano) {
    const pp = modo() === 'pp';
    const fim = Math.max(2033, ano), anos = DS.anos.filter((y) => y <= fim);
    const iRef = DS.anos.indexOf(ano);
    const atRef = X.set.map((row) => setorAno(row, iRef));
    const top = [...atRef].sort((a, b) => Math.abs(b.imp) - Math.abs(a.imp)).slice(0, 4).map((r) => r.s);
    const series = {}; top.concat(['Outros']).forEach((s) => (series[s] = []));
    anos.forEach((y) => {
      const i = DS.anos.indexOf(y), rs = X.set.map((row) => setorAno(row, i));
      const semTot = rs.reduce((t, r) => t + r.sem, 0), k = pp ? 100 / semTot : 1;
      let outros = 0;
      rs.forEach((r) => { if (top.includes(r.s)) series[r.s].push(+(r.imp * k).toFixed(3)); else outros += r.imp * k; });
      series['Outros'].push(+outros.toFixed(3));
    });
    const fmt = pp ? (v) => sgn(v, (x) => nf2.format(x), 0.005) + ' p.p.' : (v) => sgn(v, (x) => nf1.format(x));
    if (evo) evo.destroy();
    const nomes = Object.keys(series);
    evo = new Chart($('ds-evo'), {
      type: 'line',
      data: { labels: anos.map(String), datasets: nomes.map((s) => ({
        label: s, data: series[s], borderColor: COR[s], backgroundColor: COR[s], borderWidth: s === 'Outros' ? 2 : 2.6,
        borderDash: s === 'Outros' ? [5, 4] : [], tension: .2, _fmt: fmt,
        pointRadius: anos.map((y) => y === ano ? 5 : (anos.length <= 12 ? 3 : 0)), pointBorderColor: '#fff', pointBorderWidth: 1.2,
      })) },
      options: {
        maintainAspectRatio: false, animation: false, interaction: { mode: 'index', intersect: false },
        layout: { padding: { right: pp ? 74 : 66, top: 8 } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${fmt(c.raw)}` } } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 14 } },
          y: { grid: { color: gridClr }, grace: '10%', ticks: { font: { size: 9.5 }, callback: (v) => pp ? nf1.format(v) : new Intl.NumberFormat('pt-BR').format(v) } } },
      },
      plugins: [evoLabels],
    });
    $('ds-evo-leg').innerHTML = nomes.map((s) => s === 'Outros'
      ? `<span><i class="dash" style="border-top-color:${COR[s]}"></i>Outros setores</span>`
      : `<span><i class="ln" style="background:${COR[s]}"></i>${s}</span>`).join('');
    $('ds-evo-sub').textContent = (pp ? 'Contribuição de cada setor para o impacto percentual (p.p.)' : 'Impacto financeiro de cada setor (R$ milhões de 2025)') +
      `, ${anos[0]}–${fim}. Os 4 setores de maior impacto em ${ano}; os demais em "Outros".`;
  }

  /* ============================================================
     RENDER
     ============================================================ */
  window.renderSetorial = function () {
    X = CTX.sc ? DS.sc : DS.municipios[String(CTX.cod)];
    if (!X) return;
    const ano = anoRef(), i = DS.anos.indexOf(ano);
    const rows = X.set.map((row) => setorAno(row, i));
    const tot = rows.reduce((t, r) => ({ sem: t.sem + r.sem, com: t.com + r.com, imp: t.imp + r.imp }), { sem: 0, com: 0, imp: 0 });
    $('ds-escopo').textContent = CTX.sc ? 'Santa Catarina (soma dos 295 municípios)' : X.nome + ' - SC';
    renderWaterfall(rows, tot, i);
    renderTabela(rows, tot);
    renderDonut(rows, tot, ano);
    renderEvo(ano);
    $('ds-foot').textContent = `Receita com reforma pela lei, na alíquota padrão do modelo (${pc(A, 2)}) e consumo local padrão. ` +
      `O seguro-receita é atribuído ao setor "Transferências e transição"; a soma dos 8 setores é o impacto total. ` +
      `Fonte: STN/SICONFI, IBGE, SEF/SC, RAIS; elaboração própria. Valores em R$ de 2025 (IPCA). Modelo ${DS.versao} (${DS.data_geracao}).`;
  };
  $('ds-modo').addEventListener('change', () => { if (curView === 'setorial') window.renderSetorial(); });
})();
