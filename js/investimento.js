/* ============================================================
   TELA: SIMULADOR DE INVESTIMENTO  (calculadora T3.5)
   ------------------------------------------------------------
   "Se eu investir x no setor Y, quanto volta de receita?"
   • Controles: valor x (R$ mi/ano), setor (6) ou atividade (67), ano inicial
   • Receita adicional no ano-base: sem reforma, pela lei, só pelo consumo
     (+ acumulado desde o ano inicial)
   • Linha 2026–2097 dos 3 cenários
   • Efeitos econômicos (MIP municipal): produção, VA local, VA que sai,
     salários, empregos, consumo das famílias
   • VA do município por setor (rosca) e comparação entre os 6 setores
   Dados: DADOS_INVESTIMENTO + DADOS_ESTRUTURA (pacote entrega_front),
   motor em js/investimento_motor.js (MOTOR_DE_CALCULO.md, seção 8).
   Alíquota padrão do pacote, consumo local = 1, cota-parte do IBS
   pelos critérios padrão. Ano de referência = seletor "Ano-base".
   ============================================================ */
(function () {
  if (typeof DADOS_INVESTIMENTO === 'undefined' || typeof INVEST_MOTOR === 'undefined') return;
  const DI = DADOS_INVESTIMENTO, DE = DADOS_ESTRUTURA, A = DE.aliquota.padrao, P = DE.consumo_local == null ? 1 : DE.consumo_local;
  const $ = (id) => document.getElementById(id);
  const ANOS = DI.trans.ano;
  const nfd = (d) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const nf0 = nfd(0), nf1 = nfd(1), nf2 = nfd(2);
  /* valores pequenos (x = R$ 10 mi gera receitas de centenas de mil) precisam de mais casas */
  const fmi = (v) => {
    const a = Math.abs(v);
    if (a >= 1000) return 'R$ ' + nf2.format(v / 1000) + ' bi';
    if (a >= 100) return 'R$ ' + nf1.format(v) + ' mi';
    if (a >= 1) return 'R$ ' + nf2.format(v) + ' mi';
    if (a >= 0.001) return 'R$ ' + nf0.format(v * 1000) + ' mil';
    return 'R$ 0';
  };
  const fx = (x) => 'R$ ' + (Number.isInteger(x) ? nf0 : nf1).format(x) + ' mi';
  const sgn = (v) => (v > 5e-7 ? '+' : v < -5e-7 ? '−' : '') + fmi(Math.abs(v));
  const pc = (x, d = 1) => nfd(d).format(x * 100) + '%';
  const COR = { sem: '#9aa6b2', lei: '#2c0e5e', cs: '#2f5d57' };
  const SETOR_COR = { 'Agropecuária': '#55663f', 'Indústria': '#33363d', 'Construção': '#7a5a2e', 'Comércio': '#2f4566', 'Serviços': '#2f5d57', 'Outros': '#9aa6b2' };
  const ORDEM_SET = ['Agropecuária', 'Indústria', 'Construção', 'Comércio', 'Serviços', 'Outros'];
  const S = { cod: null, x: DI.slider_x.padrao, nivel: 'set', alvo: { set: DI.setores.findIndex((s) => s[0] === 'Indústria'), atv: 0 }, ini: ANOS[0] };
  if (S.alvo.set < 0) S.alvo.set = 0;
  let evo = null, donut = null, cmp = null;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const anoRef = () => (ANOS.includes(CTX.ano) ? CTX.ano : 2033);
  const nomeMun = (cod) => DE.municipios[String(cod)].nome;
  const lista = () => (S.nivel === 'set' ? DI.setores : DI.atividades);
  const coefDe = (cod, nivel, i) => DI.municipios[String(cod)][nivel][i];
  const alvoMeta = () => lista()[S.alvo[S.nivel]];
  const setorDoAlvo = () => alvoMeta()[2];

  /* série dos 3 cenários (R$ mi de 2025 por ano), zero antes do ano inicial */
  function serie(cod, coef, x) {
    const out = { sem: [], lei: [], cs: [] };
    ANOS.forEach((ano) => {
      const on = ano >= S.ini;
      out.sem.push(on ? INVEST_MOTOR.delta(cod, ano, 'sem_reforma', A, P, x, coef) : 0);
      out.lei.push(on ? INVEST_MOTOR.delta(cod, ano, 'lei', A, P, x, coef) : 0);
      out.cs.push(on ? INVEST_MOTOR.delta(cod, ano, 'so_consumo', A, P, x, coef) : 0);
    });
    return out;
  }

  /* ============================================================
     CONTROLES
     ============================================================ */
  function montarControles() {
    const sx = DI.slider_x, r = $('iv-x-range'), n = $('iv-x');
    [r, n].forEach((el) => { el.min = sx.min; el.max = sx.max; el.step = sx.passo; el.value = S.x; });
    const pinta = () => r.style.setProperty('--p', ((S.x - sx.min) / (sx.max - sx.min)) * 100 + '%');
    pinta();
    r.addEventListener('input', () => { S.x = +r.value; n.value = S.x; pinta(); renderInvestimento(); });
    n.addEventListener('input', () => {
      const v = +n.value; if (!isFinite(v) || n.value === '') return;
      S.x = Math.max(sx.min, Math.min(v, 100000)); r.value = Math.min(S.x, sx.max); pinta(); renderInvestimento();
    });
    n.addEventListener('blur', () => { n.value = S.x; });
    $('iv-nivel').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      if (S.nivel === b.dataset.n) return;
      /* ao trocar de nível, mantém o setor: atividade -> seu setor; setor -> 1ª atividade do setor */
      const setor = setorDoAlvo();
      S.nivel = b.dataset.n;
      if (S.nivel === 'set') S.alvo.set = DI.setores.findIndex((s) => s[0] === setor);
      else if (DI.atividades[S.alvo.atv][2] !== setor) S.alvo.atv = DI.atividades.findIndex((a) => a[2] === setor);
      $('iv-nivel').querySelectorAll('button').forEach((o) => o.classList.toggle('on', o === b));
      opcoesAlvo(); renderInvestimento();
    }));
    $('iv-alvo').addEventListener('change', (e) => { S.alvo[S.nivel] = +e.target.value; renderInvestimento(); });
    $('iv-ini').innerHTML = ANOS.filter((a) => a <= 2077).map((a) => `<option value="${a}">${a}</option>`).join('');
    $('iv-ini').value = S.ini;
    $('iv-ini').addEventListener('change', (e) => { S.ini = +e.target.value; renderInvestimento(); });
    const ms = $('iv-mun-sel');
    ms.innerHTML = Object.keys(DE.municipios).map((c) => [c, nomeMun(c)]).sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
      .map(([c, nm]) => `<option value="${c}">${esc(nm)}</option>`).join('');
    ms.addEventListener('change', () => { S.cod = ms.value; renderInvestimento(); });
    opcoesAlvo();
  }
  function opcoesAlvo() {
    const sel = $('iv-alvo'), box = $('iv-boxes'), set = S.nivel === 'set';
    sel.classList.toggle('hidden', set); box.classList.toggle('hidden', !set);
    $('iv-alvo-lab').textContent = set ? 'Setor' : 'Atividade';
    $('iv-x-alvo').textContent = set ? 'no setor' : 'na atividade';
    if (set) {
      /* caixas de seleção, mas só uma marcada por vez (comporta-se como opção única) */
      box.innerHTML = ORDEM_SET.map((st) => DI.setores.findIndex((x) => x[0] === st)).filter((i) => i >= 0).map((i) =>
        `<label class="iv-box"><input type="checkbox" value="${i}"${i === S.alvo.set ? ' checked' : ''}><span class="ck"></span><span class="nm">${esc(DI.setores[i][1])}</span></label>`).join('');
      box.querySelectorAll('input').forEach((ck) => ck.addEventListener('change', () => {
        if (!ck.checked) { ck.checked = true; return; } /* não deixa ficar sem nenhum setor */
        box.querySelectorAll('input').forEach((o) => { if (o !== ck) o.checked = false; });
        S.alvo.set = +ck.value; renderInvestimento();
      }));
    } else {
      sel.innerHTML = ORDEM_SET.map((st) => `<optgroup label="${st}">` + DI.atividades.map((a, i) => [a, i]).filter(([a]) => a[2] === st)
        .map(([a, i]) => `<option value="${i}">${esc(a[1])}</option>`).join('') + '</optgroup>').join('');
      sel.value = S.alvo.atv;
    }
  }

  /* ============================================================
     CARDS DE RECEITA
     ============================================================ */
  function renderReceita(se, j, ano) {
    const tag = S.ini > ano ? ` · o investimento começa em ${S.ini}` : '';
    [['sem', se.sem], ['lei', se.lei], ['cs', se.cs]].forEach(([k, v]) => {
      const val = v[j];
      $('iv-' + k).textContent = sgn(val);
      $('iv-' + k + '-pct').innerHTML = S.x > 0 ? `<b>${pc(val / S.x, 2)}</b> do valor investido por ano${tag}` : 'Informe um valor investido';
      /* comparação com sem reforma + barras dos 3 cenários */
      const base = se.sem[j], NOME = { sem: 'Sem reforma', lei: 'Pela lei', cs: 'Só pelo consumo' };
      if (k === 'sem') $('iv-sem-cmp').innerHTML = `<span class="iv-chip eq">referência</span>ISS + cota-parte do ICMS`;
      else if (base > 1e-9 && S.ini <= ano) {
        const r = val / base - 1, cl = Math.abs(r) < 0.005 ? 'eq' : r > 0 ? 'up' : 'dn';
        $('iv-' + k + '-cmp').innerHTML = `<span class="iv-chip ${cl}">${cl === 'eq' ? '≈ 0%' : (r > 0 ? '+' : '−') + pc(Math.abs(r), 0)}</span>em relação a sem reforma`;
      } else $('iv-' + k + '-cmp').innerHTML = '';
      const mx = Math.max(se.sem[j], se.lei[j], se.cs[j], 1e-12);
      $('iv-' + k + '-bars').innerHTML = ['sem', 'lei', 'cs'].map((q) =>
        `<div class="iv-bar${q === k ? ' me' : ''}"><span>${NOME[q]}</span><div><i style="width:${Math.max(0, se[q][j] / mx * 100)}%;background:${q === k ? 'var(--c)' : '#c3cad3'}"></i></div></div>`).join('');
      let acc = 0; for (let t = 0; t <= j; t++) acc += v[t];
      const de = Math.max(S.ini, ANOS[0]);
      $('iv-' + k + '-acc').innerHTML = de > ano ? `Acumulado: <b>R$ 0</b>` :
        `Acumulado ${de}–${ano}: <b>${sgn(acc)}</b>` + (S.x > 0 ? ` · ${pc(acc / (S.x * (ano - de + 1)), 1)} do investido` : '');
    });
  }

  /* ============================================================
     GRÁFICO DE LINHAS 2026–2097
     ============================================================ */
  const marcaAno = {
    id: 'ivMarcaAno',
    beforeDatasetsDraw(ch) {
      const o = ch.options.plugins.ivMarcaAno; if (!o) return;
      const { ctx, chartArea: ar, scales: { x } } = ch;
      ctx.save();
      if (o.ini > ANOS[0]) {
        const xi = x.getPixelForValue(ANOS.indexOf(o.ini));
        ctx.fillStyle = 'rgba(154,166,178,.10)'; ctx.fillRect(ar.left, ar.top, xi - ar.left, ar.bottom - ar.top);
        ctx.fillStyle = '#9aa6b2'; ctx.font = "600 10px 'Inter',sans-serif"; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        if (xi - ar.left > 70) ctx.fillText('antes do investimento', ar.left + 6, ar.top + 4);
      }
      const xr = x.getPixelForValue(ANOS.indexOf(o.ref));
      ctx.strokeStyle = '#2c0e5e'; ctx.globalAlpha = .55; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(xr, ar.top - 6); ctx.lineTo(xr, ar.bottom); ctx.stroke();
      ctx.restore();
    },
    afterDatasetsDraw(ch) {
      const o = ch.options.plugins.ivMarcaAno; if (!o) return;
      const { ctx, chartArea: ar, scales: { x, y } } = ch, j = ANOS.indexOf(o.ref);
      const xr = x.getPixelForValue(j);
      ctx.save();
      /* rótulo do ano */
      ctx.font = "800 10.5px 'Inter',sans-serif";
      const t = String(o.ref), w = ctx.measureText(t).width + 12;
      ctx.fillStyle = '#2c0e5e'; ctx.beginPath(); ctx.roundRect(xr - w / 2, ar.top - 23, w, 17, 5); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, xr, ar.top - 14.5);
      /* pontos e valores no ano-base, sem sobreposição */
      const pts = ch.data.datasets.map((d, k) => ({ k, v: d.data[j], py: y.getPixelForValue(d.data[j]), c: d.borderColor }))
        .sort((a, b) => a.py - b.py);
      for (let i = 1; i < pts.length; i++) pts[i].ly = Math.max(pts[i].py, (pts[i - 1].ly ?? pts[i - 1].py) + 15);
      pts[0].ly = Math.max(pts[0].py, ar.top + 2); /* não encosta no selo do ano */
      for (let i = 1; i < pts.length; i++) pts[i].ly = Math.max(pts[i].py, pts[i - 1].ly + 15);
      const right = xr > ar.right - 90;
      pts.forEach((p) => {
        ctx.fillStyle = '#fff'; ctx.strokeStyle = p.c; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(xr, p.py, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.font = "800 11px 'Inter',sans-serif"; ctx.textAlign = right ? 'right' : 'left'; ctx.textBaseline = 'middle';
        const lab = fmi(p.v), lx = right ? xr - 9 : xr + 9;
        ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round'; ctx.strokeText(lab, lx, p.ly);
        ctx.fillStyle = p.c === COR.sem ? '#64748b' : p.c; ctx.fillText(lab, lx, p.ly);
      });
      ctx.restore();
    },
  };
  function renderEvo(se, ano) {
    const ds = [
      { label: 'Sem reforma', data: se.sem, borderColor: COR.sem, borderDash: [6, 5], borderWidth: 2 },
      { label: 'Pela lei', data: se.lei, borderColor: COR.lei, borderWidth: 2.6, fill: { target: 'origin' }, backgroundColor: 'rgba(44,14,94,.06)' },
      { label: 'Só pelo consumo', data: se.cs, borderColor: COR.cs, borderWidth: 2.2 },
    ].map((d) => Object.assign({ pointRadius: 0, pointHoverRadius: 4, tension: 0, stepped: false }, d));
    if (!evo) {
      evo = new Chart($('iv-evo'), {
        type: 'line', data: { labels: ANOS, datasets: ds },
        options: {
          maintainAspectRatio: false, animation: false, interaction: { mode: 'index', intersect: false },
          layout: { padding: { top: 26, right: 8 } },
          plugins: { legend: { display: false }, ivMarcaAno: { ref: ano, ini: S.ini },
            tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${fmi(c.parsed.y)}` } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#71808f', font: { size: 10.5 }, autoSkip: false, maxRotation: 0,
              callback: (v, i) => (ANOS[i] === 2026 || ANOS[i] % 10 === 0 || ANOS[i] === 2097 ? ANOS[i] : '') } },
            y: { beginAtZero: true, grid: { color: '#eef1f5' }, border: { display: false },
              ticks: { color: '#71808f', font: { size: 10.5 }, maxTicksLimit: 6, callback: (v) => fmi(v) } },
          },
        },
        plugins: [marcaAno],
      });
    } else {
      evo.data.datasets.forEach((d, k) => { d.data = ds[k].data; });
      evo.options.plugins.ivMarcaAno = { ref: ano, ini: S.ini };
      evo.update('none');
    }
  }

  /* ============================================================
     EFEITOS ECONÔMICOS
     ============================================================ */
  function renderEfeitos(coef) {
    const e = INVEST_MOTOR.efeitos(S.x, coef), m = e.mult;
    const put = (id, v, n) => { $('iv-' + id).textContent = v; $('iv-' + id + '-n').innerHTML = n; };
    const porR = (k) => `<b>${nf2.format(m[k])}</b> por R$ 1 investido`;
    put('prod', fmi(e.producao), porR('producao') + (m.producao > 1 ? ' · inclui as compras locais em cadeia' : ''));
    put('va', fmi(e.va_local), porR('va_local') + ' · fica no município');
    put('out', fmi(e.va_vazado), porR('va_vazado') + ' · compras de fora');
    put('sal', fmi(e.salarios), porR('salarios'));
    put('emp', nf0.format(e.empregos) + (e.empregos >= 0.5 && e.empregos < 1.5 ? ' emprego' : ' empregos'), `<b>${nf1.format(m.empregos)}</b> por R$ 1 mi investido`);
    put('cons', fmi(e.consumo), porR('consumo') + ' · efeito-renda');
  }

  /* ============================================================
     VA DO MUNICÍPIO POR SETOR (rosca com o setor escolhido em destaque)
     ============================================================ */
  function renderVA(cod) {
    const M = DE.municipios[String(cod)], tot = M.kpis.va_corrente_mi, foco = setorDoAlvo();
    const setores = M.va.map(([s, part]) => ({ s, part: part || 0, v: (part || 0) * (tot || 0) }));
    const f = setores.find((x) => x.s === foco) || { part: 0 };
    $('iv-donut-pct').textContent = pc(f.part);
    $('iv-donut-lab').textContent = foco;
    $('iv-va-sub').textContent = `Peso do setor do investimento (${foco}) na economia do município · VA de ${M.kpis.ano_va} (IBGE, correntes): ${fmi(tot)}.`;
    const cores = setores.map((x) => (x.s === foco ? SETOR_COR[x.s] : SETOR_COR[x.s] + '40'));
    if (!donut) {
      donut = new Chart($('iv-donut'), {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: '#fff', borderWidth: 2, offset: [] }] },
        options: { maintainAspectRatio: false, cutout: '66%', layout: { padding: 10 }, animation: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: {} } } },
      });
    }
    donut.data.labels = setores.map((x) => x.s);
    donut.data.datasets[0].data = setores.map((x) => +(x.part * 100).toFixed(2));
    donut.data.datasets[0].backgroundColor = cores;
    donut.data.datasets[0].offset = setores.map((x) => (x.s === foco ? 9 : 0));
    donut.options.plugins.tooltip.callbacks.label = (c) => ` ${c.label}: ${pc(setores[c.dataIndex].part)} · ${fmi(setores[c.dataIndex].v)}`;
    donut.update('none');
    $('iv-va-leg').innerHTML = [...setores].sort((a, b) => b.part - a.part).map((x) =>
      `<div class="it${x.s === foco ? ' on' : ''}"><i style="background:${SETOR_COR[x.s]}"></i><span>${x.s}</span><b>${pc(x.part)}</b><small>${fmi(x.v)}</small></div>`).join('');
  }

  /* ============================================================
     COMPARAÇÃO ENTRE OS 6 SETORES (mesmo x, ano-base)
     ============================================================ */
  const cmpLabels = {
    id: 'ivCmpLabels',
    afterDatasetsDraw(ch) {
      const ctx = ch.ctx; ctx.save(); ctx.font = "700 10px 'Inter',sans-serif"; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ch.data.datasets.forEach((d, k) => {
        const meta = ch.getDatasetMeta(k); if (meta.hidden) return;
        meta.data.forEach((b, i) => {
          const v = d.data[i];
          ctx.fillStyle = k === 0 ? '#64748b' : k === 1 ? '#2c0e5e' : '#2f5d57';
          ctx.fillText(fmi(v), Math.max(b.x, b.base) + 5, b.y);
        });
      });
      ctx.restore();
    },
  };
  function renderCmp(cod, j, ano) {
    const ord = ORDEM_SET.map((s) => DI.setores.findIndex((x) => x[0] === s)).filter((i) => i >= 0);
    const foco = setorDoAlvo();
    const val = (cen) => ord.map((i) => (ano < S.ini ? 0 : INVEST_MOTOR.delta(cod, ano, cen, A, P, S.x, coefDe(cod, 'set', i))));
    const sem = val('sem_reforma'), lei = val('lei'), cs = val('so_consumo');
    const labels = ord.map((i) => DI.setores[i][1]);
    const alpha = (c, i) => (labels[i] === foco ? c : c + '59');
    const ds = [
      { label: 'Sem reforma', data: sem, backgroundColor: labels.map((_, i) => alpha('#9aa6b2', i)) },
      { label: 'Pela lei', data: lei, backgroundColor: labels.map((_, i) => alpha('#2c0e5e', i)) },
      { label: 'Só pelo consumo', data: cs, backgroundColor: labels.map((_, i) => alpha('#2f5d57', i)) },
    ].map((d) => Object.assign({ borderRadius: 4, barPercentage: .86, categoryPercentage: .78 }, d));
    const best = labels[lei.indexOf(Math.max(...lei))];
    $('iv-cmp-sub').innerHTML = S.x > 0 && ano >= S.ini
      ? `Receita adicional em ${ano} para os mesmos ${fx(S.x)}/ano em cada setor. Pela lei, <b>${best}</b> é o que mais devolve; em destaque, o setor escolhido.`
      : `Receita adicional em ${ano} para o mesmo valor investido em cada setor.`;
    if (!cmp) {
      cmp = new Chart($('iv-cmp'), {
        type: 'bar', data: { labels, datasets: ds },
        options: {
          indexAxis: 'y', maintainAspectRatio: false, animation: false, layout: { padding: { right: 70 } },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${fmi(c.parsed.x)}` } } },
          scales: {
            x: { beginAtZero: true, grid: { color: '#eef1f5' }, border: { display: false }, ticks: { color: '#71808f', font: { size: 10 }, maxTicksLimit: 6, callback: (v) => fmi(v) } },
            y: { grid: { display: false }, border: { display: false },
              ticks: { color: (c) => (labels[c.index] === foco ? '#2c0e5e' : '#71808f'), font: (c) => ({ size: 11.5, weight: labels[c.index] === foco ? '800' : '600' }) } },
          },
        },
        plugins: [cmpLabels],
      });
    } else {
      cmp.data.labels = labels;
      cmp.data.datasets.forEach((d, k) => { d.data = ds[k].data; d.backgroundColor = ds[k].backgroundColor; });
      cmp.options.scales.y.ticks.color = (c) => (labels[c.index] === foco ? '#2c0e5e' : '#71808f');
      cmp.options.scales.y.ticks.font = (c) => ({ size: 11.5, weight: labels[c.index] === foco ? '800' : '600' });
      cmp.update('none');
    }
  }

  /* ============================================================
     RENDER
     ============================================================ */
  window.renderInvestimento = function () {
    if (!$('iv-x-range').dataset.ok) { montarControles(); $('iv-x-range').dataset.ok = '1'; }
    /* calculadora é municipal: com "Santa Catarina" no topo, escolhe-se o município no próprio card */
    if (!CTX.sc) S.cod = String(CTX.cod);
    else if (!S.cod || !DI.municipios[S.cod]) S.cod = DI.municipios['4204608'] ? '4204608' : Object.keys(DI.municipios)[0];
    $('iv-mun-wrap').classList.toggle('hidden', !CTX.sc);
    $('iv-mun-sel').value = S.cod;
    const cod = S.cod, ano = anoRef(), j = ANOS.indexOf(ano), mm = DI.municipios[cod], meta = alvoMeta();
    const coef = coefDe(cod, S.nivel, S.alvo[S.nivel]);
    document.querySelectorAll('#view-investimento .yr').forEach((e) => { e.textContent = ano; });
    $('iv-mun').textContent = nomeMun(cod) + ' - SC';

    const se = serie(cod, coef, S.x);
    renderReceita(se, j, ano);
    renderEvo(se, ano);
    renderEfeitos(coef);
    renderVA(cod);
    renderCmp(cod, j, ano);

    const alvoTxt = S.nivel === 'set' ? `no setor ${meta[1]}` : `em ${meta[1]} (${meta[2]})`;
    const dl = se.lei[j], ds = se.sem[j];
    let frase = `${fx(S.x)}/ano ${alvoTxt}, a partir de ${S.ini}`;
    if (ano >= S.ini && S.x > 0 && ds > 0) {
      const v = dl / ds - 1;
      frase += ` · em ${ano}, pela lei, volta ${fmi(dl)} — ${Math.abs(v) < 0.005 ? 'praticamente o mesmo que' : pc(Math.abs(v), 0) + (v < 0 ? ' a menos que' : ' a mais que')} sem reforma.`;
    } else frase += '.';
    $('iv-evo-sub').textContent = frase + ' Valores em R$ de 2025.';
    const notas = [`Alíquota efetiva do ISS no município: <b>${pc(mm.iss, 2)}</b>`, `IBS a ${pc(A, 2)} (padrão do modelo), consumo local = ${nf0.format(P * 100)}%`];
    if (meta[2] === 'Comércio' || meta[0] === 'Comércio') notas.push(esc(DI.nota_comercio || ''));
    $('iv-evo-note').innerHTML = notas.join(' · ');
    $('iv-foot').innerHTML = `${esc(DI.texto || '')} Coeficientes da MIP municipal (IBGE 2015, regionalizada para 2021); efeito-renda com propensão a consumir de ${nf2.format(DI.propensao_consumo || 0.81)} por R$ de salário. Modelo ${DI.versao} (${DI.data_geracao}).`;
  };
})();
