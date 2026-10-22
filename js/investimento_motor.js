/* ============================================================
   MOTOR DA CALCULADORA DE INVESTIMENTO (T3.5)
   Porte de MOTOR_DE_CALCULO.md (seções 2 e 8) do pacote entrega_front.
   Usa: DADOS_ESTRUTURA (coeficientes do motor por município/ano) e
        DADOS_INVESTIMENTO (transição, phi, w_cota_ibs, coef_retido, multiplicadores).
   Sem critérios alternativos da cota-parte (pesos constitucionais padrão).
   ============================================================ */
var INVEST_MOTOR = (function () {
  const DE = DADOS_ESTRUTURA, DI = DADOS_INVESTIMENTO;
  const C = Object.fromEntries(DI.campos.map((c, i) => [c, i]));
  const iAno = (ano) => DE.anos.indexOf(ano);
  const iTr = (ano) => DI.trans.ano.indexOf(ano);
  function k(cod, ano) {
    const m = DE.municipios[String(cod)].motor, i = iAno(ano), g = (c) => m[c][i];
    return { fixo: g('f_iss') + g('f_cota_parte_icms') + g('f_teste_cota'), fixo_p: g('fp_teste'),
      a_retido: g('a_retido'), a_cota: g('a_cota'), ap: g('ap_destino'), s0: g('s0'), s1: g('s1') };
  }
  const receitaK = (q, a, p) => q.fixo + p * q.fixo_p + a * (q.a_retido + q.a_cota) + a * p * q.ap + a * Math.max(0, q.s0 - p * q.s1);
  const seguroAtivo = (j) => (DI.trans.seguro_pct[j] > 0 && DI.trans.fase_ibs[j] > 0 ? 1 : 0);
  /* coef: linha de multiplicadores (DI.municipios[cod].set[i] ou .atv[i]); x em R$ mi de 2025 por ano */
  function delta(cod, ano, cenario, a, p, x, coef, comCota = true) {
    const PHI = DI.phi, mm = DI.municipios[String(cod)], w = mm.w;
    const g = x * coef[C.base_ibs_mult], rs = x * coef[C.receita_sem_reforma_mult];
    if (cenario === 'sem_reforma') return rs;
    if (cenario === 'so_consumo') return a * p * PHI * g + (comCota ? a * 0.25 * (1 - PHI) * w * g : 0);
    const j = iTr(ano), T = DI.trans;
    const nf = (1 - T.retencao[j]) * (1 - T.seguro_pct[j]) * T.fase_ibs[j], sa = seguroAtivo(j);
    const q = k(cod, ano);
    const dRet = T.retencao[j] * T.fase_ibs[j] * mm.cr * g, dCota = 0.25 * nf * (1 - PHI) * w * g, dAp = nf * PHI * g;
    const q2 = Object.assign({}, q, { fixo: q.fixo + T.fator_icms_iss[j] * rs, a_retido: q.a_retido + dRet, a_cota: q.a_cota + dCota,
      ap: q.ap + dAp, s0: q.s0 - sa * (dRet + dCota), s1: q.s1 + sa * dAp });
    return receitaK(q2, a, p) - receitaK(q, a, p);
  }
  /* efeitos econômicos (não dependem dos botões) */
  function efeitos(x, coef) {
    return { producao: x * coef[C.producao_local_mult], va_local: x * coef[C.va_local_mult], va_vazado: x * coef[C.va_vazado_mult],
      salarios: x * coef[C.salarios_mult], empregos: x * coef[C.empregos_por_mi], consumo: x * coef[C.consumo_familias_mult],
      mult: { producao: coef[C.producao_local_mult], va_local: coef[C.va_local_mult], va_vazado: coef[C.va_vazado_mult],
        salarios: coef[C.salarios_mult], empregos: coef[C.empregos_por_mi], consumo: coef[C.consumo_familias_mult] } };
  }
  return { delta, efeitos, campos: C };
})();
