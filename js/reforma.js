/* ============================================================
   ENGINE OFICIAL — Reforma Tributária / IBS
   Implementação de referência do "Guia de utilização do
   dados_reforma.json" (seções 4, 5 e 8).
   ------------------------------------------------------------
   Fonte: DADOS_REFORMA (js/dados_reforma.js) — 295 municípios de
   SC, 2013–2078, com o consumo, a receita sem reforma e os
   parâmetros legais da transição.
   Nada é chumbado: a receita é calculada ao vivo a partir das
   alíquotas, do ano e do seguro-receita que o usuário escolher.
   ============================================================ */
const REFORMA = (function () {
  const D   = DADOS_REFORMA;
  const anos = D.anos;                 // [2013 ... 2078]
  const sc   = D.sc;
  const par  = D.parametros;           // listas começam em 2026
  const N    = D.n_municipios;         // 295

  const idxAno = {}; anos.forEach((y, i) => (idxAno[y] = i));
  const idxPar = {}; par.ano.forEach((y, i) => (idxPar[y] = i));

  /* ---- fator_base (seção 4) — calculado UMA vez a partir do JSON ---- */
  const REF_MUN = 0.0318;              // alíquota municipal de referência (3,18%)
  const REF_EST = 0.1552;              // alíquota estadual de referência (15,52%)
  const i24     = idxAno[2024];
  const cargaSC = sc.receita_sc[i24] / sc.consumo_sc[i24];       // ≈ 5,58%
  const FATOR   = cargaSC / (REF_MUN + 0.25 * REF_EST);          // ≈ 0,7900

  /* ---- parâmetros da lei no ano (seção 5, passo 1) ---- */
  function parametros(ano) {
    const k = idxPar[ano];
    if (k === undefined) return { mantido: 1, ret: 0, seg: 0 }; // antes de 2026: sistema atual
    return {
      mantido: par.icms_iss_mantido[k],
      ret:     par.retencao_historica[k],
      seg:     par.seguro_receita[k],
    };
  }

  /* ---- lista de municípios ordenada por nome ---- */
  const municipios = Object.keys(D.municipios)
    .map((cod) => ({ cod: +cod, nome: D.municipios[cod].nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  function mun(cod) { return D.municipios[String(cod)]; }
  function nome(cod) { const m = mun(cod); return m ? m.nome : String(cod); }

  /* Divide um IBS total (fração) em municipal / estadual.
     Proporção do ISS na receita municipal de SC = 0,45 (provisório, seção 3/8):
       municipal = 17% do IBS total ; estadual = 83%.                        */
  function split(ibsTotalFrac) {
    return { aliqMun: ibsTotalFrac * 0.17, aliqEst: ibsTotalFrac * 0.83 };
  }

  /* ============================================================
     Cálculo principal (seção 5) — receita de UM município num ano.
     aliqMun / aliqEst em FRAÇÃO (3,18% = 0,0318).
     seguro: liga/desliga o seguro-receita.
     adj (opcional): multiplicadores de cenário {base, sem, pop}
        base -> escala a base de destino (consumo local)
        sem  -> escala a receita sem reforma (legado)
        pop  -> escala a população (afeta a cota estadual)
     Sem adj, reproduz exatamente a tabela de conferência (seção 7).
     ============================================================ */
  function receita(cod, ano, aliqMun, aliqEst, seguro, adj) {
    adj = adj || {};
    const bF = adj.base == null ? 1 : adj.base;
    const sF = adj.sem  == null ? 1 : adj.sem;
    const pF = adj.pop  == null ? 1 : adj.pop;

    const m = mun(cod);
    const i = idxAno[ano];
    const pr = parametros(ano);
    const T  = 1 - pr.mantido;          // quanto do sistema antigo já virou IBS

    const populacao = m.populacao[i] * pF;
    const baseDest  = m.base_destino[i] * bF;
    const semRef    = m.receita_sem_reforma[i] * sF;

    // Passo 2 — fatia do município nos 25% do IBS estadual
    const cota = 0.95 * populacao / sc.populacao_sc[i] + 0.05 / N;

    // Passo 3 — IBS gerado
    const ibsMun  = aliqMun * FATOR * baseDest;
    const ibsCota = 0.25 * aliqEst * FATOR * sc.consumo_sc[i] * cota;
    const ibsPool = (aliqMun + 0.25 * aliqEst) * FATOR * sc.consumo_sc[i];

    // Passo 4 — as três parcelas
    const legado     = pr.mantido * semRef;
    const historica  = T * pr.ret * ibsPool * m.coef_historico;
    const destPleno  = T * (1 - pr.ret) * (ibsMun + ibsCota);
    const destSeguro = destPleno * (1 - pr.seg);
    const destino    = seguro ? destSeguro : destPleno;

    // Passo 5 — resultado
    const totalSemSeg = legado + historica + destPleno;
    const totalComSeg = legado + historica + destSeguro;
    const total       = seguro ? totalComSeg : totalSemSeg;

    return {
      cod, ano, nome: m.nome,
      semReforma: semRef,
      legado, historica, destino, destinoPleno: destPleno,
      total, comSeguro: totalComSeg, semSeguro: totalSemSeg,
      variacao: total / semRef - 1,
      cota, ibsMun, ibsCota, ibsPool,
      T, mantido: pr.mantido, ret: pr.ret, seg: pr.seg,
      populacao, perCapita: total / populacao,
      base_destino: baseDest,
      tipo_receita: m.tipo_receita[i],
      tipo_consumo: m.tipo_consumo[i],
    };
  }

  /* Versão com IBS total (fração) — divide sozinha em mun/est. */
  function receitaIBS(cod, ano, ibsTotalFrac, seguro, adj) {
    const s = split(ibsTotalFrac);
    return receita(cod, ano, s.aliqMun, s.aliqEst, seguro, adj);
  }

  /* Série ano a ano (2013–2078) de um município para um IBS total. */
  function serie(cod, ibsTotalFrac, seguro, adjFn) {
    const s = split(ibsTotalFrac);
    return anos.map((y) => receita(cod, y, s.aliqMun, s.aliqEst, seguro, adjFn ? adjFn(y) : null));
  }

  /* Alíquota de equilíbrio (IBS total, em %) que zera a variação num ano.
     A receita é linear na alíquota, então resolve direto. */
  function equilibrio(cod, ano, seguro, adjFn) {
    const f = (r) => receitaIBS(cod, ano, r / 100, seguro, adjFn ? adjFn(ano) : null).total;
    const semRef = receitaIBS(cod, ano, 0.1, seguro, adjFn ? adjFn(ano) : null).semReforma;
    const a = f(10), b = f(20);
    const slope = (b - a) / 10;
    if (Math.abs(slope) < 1e-9) return NaN;
    const t0 = a - slope * 10;          // receita em alíquota 0
    return (semRef - t0) / slope;
  }

  /* Ranking de todos os municípios num ano / IBS total. */
  function ranking(ano, ibsTotalFrac, seguro) {
    return municipios.map((x) => {
      const r = receitaIBS(x.cod, ano, ibsTotalFrac, seguro);
      return {
        cod: x.cod, nome: x.nome,
        variacao: r.variacao,
        impacto: r.total - r.semReforma,
        total: r.total, sem: r.semReforma,
        eq: equilibrio(x.cod, ano, seguro),
        perCapita: r.perCapita,
        risco: classificar(r.variacao * 100),
      };
    });
  }

  /* Classificação de risco a partir da variação % (leitura do Guia). */
  function classificar(varPct) {
    if (varPct <= -5) return 'ALTO';
    if (varPct <= -2) return 'MÉDIO';
    if (varPct <= 1)  return 'BAIXO';
    return 'FAVORÁVEL';
  }

  /* Total agregado de SC (soma dos 295) num ano / IBS — para benchmarking. */
  function totalSC(ano, ibsTotalFrac, seguro) {
    let total = 0, sem = 0;
    municipios.forEach((x) => {
      const r = receitaIBS(x.cod, ano, ibsTotalFrac, seguro);
      total += r.total; sem += r.semReforma;
    });
    return { total, sem, impacto: total - sem, variacao: total / sem - 1 };
  }

  return {
    D, anos, sc, par, N,
    FATOR, cargaSC, REF_MUN, REF_EST,
    idxAno, parametros, municipios, mun, nome,
    split, receita, receitaIBS, serie, equilibrio, ranking, classificar, totalSC,
  };
})();
