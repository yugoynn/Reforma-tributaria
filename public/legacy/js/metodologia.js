/* ============================================================
   TELA: METODOLOGIA, DADOS E LEGISLAÇÃO  (T6.1–T6.7)
   ------------------------------------------------------------
   Só renderiza o global/meta.json do pacote (DADOS_METODOLOGIA,
   gerado por tools/gerar_dados_metodologia.py):
     • como funciona o simulador (fluxo)   • premissas   • limitações
     • bases de dados utilizadas (fontes)  • histórico de versões
     • metodologia de cálculo (etapas)     • documentos (abrem no painel)
   As fontes usam selos com a sigla de cada instituição (não são os
   logotipos oficiais); para usar os logos, coloque os arquivos em
   img/fontes/ e preencha LOGO_ARQUIVO abaixo.
   ============================================================ */
(function () {
  if (typeof DADOS_METODOLOGIA === 'undefined') return;
  const M = DADOS_METODOLOGIA;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svg = (d, w = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICO = {
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    scale: '<path d="M12 3v18M6 7h12M4 11l3-4 3 4a3 3 0 01-6 0zM14 11l3-4 3 4a3 3 0 01-6 0zM8 21h8"/>',
    calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h2M16 15v3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    doc: '<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    link: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    alerta: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  };
  const ETAPA_ICO = ['database', 'chart', 'calculator', 'scale', 'check'];

  /* selo de cada fonte: sigla + cor do painel (não é o logotipo oficial) */
  const SELO = [
    [/^STN/i, 'STN', '#33363d'], [/^IBGE/i, 'IBGE', '#2f4566'], [/^SEF/i, 'SEF/SC', '#0f766e'],
    [/^RAIS/i, 'RAIS', '#7a5a2e'], [/^MDS/i, 'MDS · INSS', '#4b3a6b'], [/^BCB/i, 'BCB', '#475569'], [/^Legisla/i, null, '#0b1e45'],
  ];
  /* logotipos oficiais enviados pelo usuário (cópias recortadas em img/fontes/; originais em img/) */
  const LOGO_ARQUIVO = {
    'STN': 'img/fontes/stn.png', 'IBGE': 'img/fontes/ibge.png', 'SEF/SC': 'img/fontes/sef_sc.png', 'RAIS': 'img/fontes/rais.png',
    'MDS · INSS': 'img/fontes/mds.png', 'BCB': 'img/fontes/bcb.png', 'LEGISLACAO': 'img/fontes/receita_federal.png',
  };
  function selo(fonte) {
    const s = SELO.find(([re]) => re.test(fonte)) || [null, fonte.split(' ')[0], '#475569'];
    const sigla = s[1], cor = s[2];
    const chave = sigla || 'LEGISLACAO';
    if (LOGO_ARQUIVO[chave]) return `<span class="mt-logo img"><img src="${LOGO_ARQUIVO[chave]}" alt="${esc(sigla || 'Receita Federal')}"></span>`;
    if (sigla && LOGO_ARQUIVO[sigla]) return `<span class="mt-logo img"><img src="${LOGO_ARQUIVO[sigla]}" alt="${esc(sigla)}"></span>`;
    if (!sigla) return `<span class="mt-logo ic" style="--c:${cor}">${svg(ICO.scale)}</span>`;
    return `<span class="mt-logo" style="--c:${cor}"><b>${esc(sigla)}</b></span>`;
  }

  let todasPremissas = false, todasLimit = false;

  function renderFluxo() {
    $('mt-fluxo').innerHTML = M.fluxo.map((f, i) =>
      `<div class="mt-passo"><div class="mt-pic">${svg(ICO[f.icone_sugerido] || ICO.check)}</div>` +
      `<b>${f.ordem}. ${esc(f.titulo)}</b><p>${esc(f.descricao)}</p></div>` + (i < M.fluxo.length - 1 ? '<div class="mt-seta">→</div>' : '')).join('');
  }
  function renderListas() {
    const pre = M.premissas;   // todas as premissas; o botão mostra/oculta os detalhes
    $('mt-premissas').innerHTML = pre.map((p) => `<li><span class="i ok">${svg(ICO.ok)}</span><div><b>${esc(p.texto)}</b>` +
      (todasPremissas ? `<small>${esc(p.detalhe)}${p.fonte ? ` <em>Fonte: ${esc(p.fonte)}</em>` : ''}</small>` : '') + '</div></li>').join('');
    $('mt-premissas-more').textContent = todasPremissas ? 'Ocultar detalhes ↑' : 'Ver detalhes e fontes das premissas →';
    const lim = M.limitacoes;
    $('mt-limitacoes').innerHTML = lim.map((p) => `<li><span class="i al">${svg(ICO.alerta)}</span><div><b>${esc(p.texto)}</b>` +
      (todasLimit ? `<small>${esc(p.detalhe)}</small>` : '') + '</div></li>').join('');
    $('mt-limitacoes-more').textContent = todasLimit ? 'Ocultar detalhes ↑' : 'Entenda as limitações →';
  }
  function renderFontes() {
    $('mt-fontes').innerHTML = M.fontes.map((f) => `<tr><td><div class="mt-fonte">${selo(f.fonte)}<span>${esc(f.fonte)}</span></div></td>` +
      `<td class="d">${esc(f.descricao)}</td><td>${esc(f.periodo)}</td><td>${esc(f.atualizacao)}</td><td>${esc(f.cobertura)}</td>` +
      `<td>${f.url ? `<a class="mt-ext" href="${esc(f.url)}" target="_blank" rel="noopener" title="Abrir ${esc(f.url)}">${svg(ICO.link)}</a>` : ''}</td></tr>`).join('');
  }
  function renderVersoes() {
    const fd = (d) => d.split('-').reverse().join('/');
    $('mt-versoes').innerHTML = M.versoes.map((v, i) => `<div class="mt-ver-it${i === 0 ? ' atual' : ''}"><div class="mt-dot"></div>` +
      `<div class="mt-ver-h"><b>v${esc(v.versao)}</b>${i === 0 ? '<span class="mt-tag">Atual</span>' : ''}<small>${fd(v.data)}</small></div>` +
      `<div class="mt-ver-c"><b>${esc(v.resumo)}</b><p>${esc(v.detalhes)}</p></div></div>`).join('');
  }
  function renderEtapas() {
    $('mt-etapas').innerHTML = M.metodologia.map((m, i) => `<div class="mt-etapa"><div class="mt-pic sm">${svg(ICO[ETAPA_ICO[i]] || ICO.check)}</div>` +
      `<div><b>${m.ordem}. ${esc(m.titulo)}</b><p>${esc(m.descricao)}</p></div></div>`).join('');
  }
  function renderDocs() {
    $('mt-docs').innerHTML = M.documentos.map((d, i) => `<button type="button" class="mt-doc" data-i="${i}"><span class="mt-pic sm">${svg(ICO.doc)}</span>` +
      `<span><b>${esc(d.titulo)}</b><small>${esc(d.subtitulo)}</small><em>${esc(d.formato)} · ler no painel</em></span></button>`).join('');
    document.querySelectorAll('#mt-docs .mt-doc').forEach((b) => b.addEventListener('click', () => abrirDoc(M.documentos[+b.dataset.i])));
  }

  /* ---------------- leitor de documento (markdown simples) ---------------- */
  function inline(t) {
    return esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function md(txt) {
    const L = txt.replace(/\r/g, '').split('\n'); let h = '', i = 0;
    while (i < L.length) {
      const l = L[i];
      if (/^#{1,4}\s/.test(l)) { const n = l.match(/^#+/)[0].length; h += `<h${n + 1}>${inline(l.replace(/^#+\s*/, ''))}</h${n + 1}>`; i++; continue; }
      if (/^\s*\|/.test(l)) {
        const rows = []; while (i < L.length && /^\s*\|/.test(L[i])) rows.push(L[i++]);
        const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        const body = rows.filter((r) => !/^\s*\|[\s:-]+\|/.test(r) || /[A-Za-zÀ-ú0-9]/.test(r.replace(/[|:-]/g, '')));
        h += '<div class="md-tbl"><table><thead><tr>' + cells(body[0]).map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
          body.slice(1).map((r) => '<tr>' + cells(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>';
        continue;
      }
      if (/^\s*([-*]|\d+\.)\s/.test(l)) {
        const ord = /^\s*\d+\./.test(l); let it = '';
        while (i < L.length && /^\s*([-*]|\d+\.)\s/.test(L[i])) it += `<li>${inline(L[i++].replace(/^\s*([-*]|\d+\.)\s/, ''))}</li>`;
        h += ord ? `<ol>${it}</ol>` : `<ul>${it}</ul>`; continue;
      }
      if (/^```/.test(l)) { let c = ''; i++; while (i < L.length && !/^```/.test(L[i])) c += esc(L[i++]) + '\n'; i++; h += `<pre>${c}</pre>`; continue; }
      if (!l.trim()) { i++; continue; }
      let p = l; i++; while (i < L.length && L[i].trim() && !/^(#|\s*\||\s*[-*]\s|\s*\d+\.\s|```)/.test(L[i])) p += ' ' + L[i++];
      h += `<p>${inline(p)}</p>`;
    }
    return h;
  }
  function abrirDoc(d) {
    const modal = $('modal-metod'), txt = M.textos_docs[d.arquivo];
    modal.querySelector('.modal-head b').textContent = d.titulo + ' · ' + d.subtitulo;
    $('modal-body').innerHTML = txt ? `<div class="md-doc">${md(txt)}</div><p class="md-src">Arquivo do pacote: <code>${esc(d.arquivo)}</code> · modelo v${esc(M.versao_modelo)}</p>`
      : '<p>Documento não encontrado no pacote.</p>';
    modal.classList.add('wide'); modal.classList.remove('hidden');
  }

  window.renderMetodologia = function () {
    renderFluxo(); renderListas(); renderFontes(); renderVersoes(); renderEtapas(); renderDocs();
    $('mt-ver').textContent = `Modelo v${M.versao_modelo} · ${M.data_geracao.split('-').reverse().join('/')}`;
  };

  $('mt-premissas-more').addEventListener('click', () => { todasPremissas = !todasPremissas; renderListas(); });
  $('mt-limitacoes-more').addEventListener('click', () => { todasLimit = !todasLimit; renderListas(); });
  $('mt-metod-doc').addEventListener('click', () => abrirDoc(M.documentos.find((d) => /METODOLOGIA\.md$/.test(d.arquivo)) || M.documentos[0]));
  // o modal é compartilhado: volta ao tamanho normal ao fechar
  const modal = $('modal-metod');
  const fechar = () => modal.classList.remove('wide');
  $('modal-x').addEventListener('click', fechar);
  modal.addEventListener('click', (e) => { if (e.target === modal) fechar(); });
})();
