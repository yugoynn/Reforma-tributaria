/* ============================================================
   BOTÃO "AVANÇAR" (header) — anima o ano-base, 1 ano por segundo
   ------------------------------------------------------------
   • Clique: começa a avançar o ano (se estiver antes de 2026 ou no
     último ano, recomeça em 2026). Clique de novo: pausa.
   • Cada passo atualiza o seletor "Ano-base" e chama render(), então
     a tela aberta acompanha: mapa, cards, ranking e distribuição na
     Visão Geral; barras dos anos já percorridos na Transição;
     sensibilidade à alíquota na Estrutura Produtiva.
   • Mudar o ano à mão no seletor pausa a animação.
   Também abre o painel na Visão Geral (mapa), por ser o último script.
   ============================================================ */
(function () {
  const btn = document.getElementById('btn-play');
  const sel = document.getElementById('ano-select');
  const lbl = document.getElementById('btn-play-lbl');
  const INICIO = 2026, PASSO_MS = 300;
  let timer = null;

  if (btn && sel) {
    const anos = [...sel.options].map((o) => +o.value);
    const FIM = anos[anos.length - 1];
    const irPara = (ano) => { CTX.ano = ano; sel.value = String(ano); render(); };
    const parar = () => {
      clearInterval(timer); timer = null;
      btn.classList.remove('on'); lbl.textContent = 'Avançar';
      sel.closest('.select').classList.remove('anim');
    };
    const passo = () => {
      if (CTX.ano >= FIM) { parar(); return; }
      irPara(CTX.ano + 1);
      if (CTX.ano >= FIM) parar();
    };
    btn.addEventListener('click', () => {
      if (timer) { parar(); return; }
      if (CTX.ano < INICIO || CTX.ano >= FIM) irPara(INICIO);
      btn.classList.add('on'); lbl.textContent = 'Pausar';
      sel.closest('.select').classList.add('anim');
      timer = setInterval(passo, PASSO_MS);
    });
    sel.addEventListener('change', () => { if (timer) parar(); });
  }

  setView('mapa');
})();
