/* ============================================================
   ENGINE v2 — Reforma Tributária / IBS (dados_reforma_v2.json)
   ------------------------------------------------------------
   Porte fiel do "Guia de cálculo" (implementação de referência em R/JS).
   Com os parâmetros padrão reproduz gabarito_base.receita_com em todos os
   municípios e anos de 2026 a 2096 (erro < 0,0015%).
   3 cenários econômicos (conservador / base / otimista), anos 2015–2096.
   Usada na tela de COMPARAÇÃO DE CENÁRIOS.
   ------------------------------------------------------------
   Conceitos-chave (ver guia):
     a  = alíquota total de referência do IBS (padrão 0,175)
     α  = parte municipal (padrão meta.alfa_mun ≈ 0,152259)
     β  = base efetiva = T_br(2026) / (0,175 × consumo_br(2026)) ≈ 0,719825 (CONSTANTE)
     L  = consumo local (0,8–1,2)
     f  = ICMS/ISS ainda existente ; r = retenção histórica ; σ = seguro
   ============================================================ */
const REFORMA2 = (function () {
  const D    = DADOS_REFORMA_V2;
  const meta = D.meta;
  const anos = meta.anos;                     // 2015..2096
  const CEN  = meta.cenarios;                 // ['conservador','base','otimista']
  const i26  = anos.indexOf(2026);

  const municipios = Object.keys(D.municipios)
    .map((cod) => ({ cod: +cod, nome: D.municipios[cod].nome, grupo: D.municipios[cod].grupo }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  function mun(cod) { return D.municipios[String(cod)]; }
  function nome(cod) { const m = mun(cod); return m ? m.nome : String(cod); }
  const LABEL = { conservador: 'Conservador', base: 'Base', otimista: 'Otimista' };
  function cenLabel(c) { return LABEL[c] || c; }

  /* fatores da lei por ano (neutros antes de 2026) */
  const _porAno = new Map();
  D.parametros_legais.ano.forEach((ano, j) => _porAno.set(ano, {
    f: D.parametros_legais.fator_icms_iss[j],
    r: D.parametros_legais.ret[j],
    sg: D.parametros_legais.seguro[j],
    tp: D.parametros_legais.parcela_ibs_teste[j],
    am: D.parametros_legais.aliq_mun_teste[j],
    ae: D.parametros_legais.aliq_est_teste[j],
  }));
  const _neutro = { f: 1, r: 0, sg: 0, tp: 0, am: 0, ae: 0 };
  function leiAno(ano) { return _porAno.get(ano) || _neutro; }

  /* parâmetros padrão (β calculado no cenário BASE, como exige o guia) */
  function parametrosPadrao(over) {
    const n = D.nacional.base;
    const p = {
      cenario: 'base',            // conservador | base | otimista
      projecao: 'tendencia',      // tendencia | brasil
      comparacao: 'lei',          // lei | final
      aliquota: 0.175,            // a
      parteMunicipal: meta.alfa_mun,                     // α
      baseEfetiva: n.T_br[i26] / (0.175 * n.consumo_br[i26]), // β ≈ 0,719825
      consumoLocal: 1.0,          // L
      cotaParte: meta.cota_parte_ibs,                    // 0,25
    };
    return Object.assign(p, over || {});
  }

  /* Cálculo de um município (todas as parcelas, ano a ano) */
  function calcularMunicipio(cod, p) {
    p = p || parametrosPadrao();
    const nac = D.nacional[p.cenario];
    const m = mun(cod), ser = m.series[p.cenario];
    const a = p.aliquota, al = p.parteMunicipal, b = p.baseEfetiva, L = p.consumoLocal, c = p.cotaParte;
    return anos.map((ano, i) => {
      if (ser.cp_icms[i] == null || ser.iss[i] == null) return { ano, semDado: true };
      const { f, r, sg, tp, am, ae } = leiAno(ano);
      const sem = (p.projecao === 'brasil' && ano > 2026)
        ? (ser.cp_icms[i26] + ser.iss[i26]) * nac.T_br[i] / nac.T_br[i26]
        : ser.cp_icms[i] + ser.iss[i];                                        // passo 1
      const rem = f * sem;                                                    // passo 2
      const pIdx = m.p_ipm_ibs[i] == null ? 0 : m.p_ipm_ibs[i];
      const sRel = m.seguro_rel[i] == null ? 0 : m.seguro_rel[i];
      const ibsProprio = ser.consumo[i] * L * b * a * al;                     // passo 3
      const ibsCota = nac.consumo_sc[i] * b * a * (1 - al) * c * pIdx;
      const ibsConsumo = ibsProprio + ibsCota;                               // D
      const ibsBrasil = nac.consumo_br[i] * b * a;                            // passo 4 (B)
      const ibsMedia = m.coef_nacional * ibsBrasil;                           // H
      const teste = tp * (am * ser.consumo[i] * L * b + c * ae * nac.consumo_sc[i] * b * pIdx); // passo 5
      const seguroRecebido = sRel * (1 - f) * ibsBrasil;                      // passo 6
      const parteMedia = (1 - f) * r * ibsMedia;
      const parteConsumo = (1 - f) * (1 - r) * (1 - sg) * ibsConsumo + teste;
      return {
        ano, f, r, sg, sem, rem, ibsProprio, ibsCota, ibsConsumo, ibsBrasil, ibsMedia, teste, seguroRecebido,
        parteMedia, parteConsumo,
        lei: rem + parteMedia + parteConsumo + seguroRecebido,                // passo 7
        final: rem + (1 - f) * ibsConsumo + teste,                           // passo 8
        efeitoMedia: (1 - f) * r * (ibsMedia - sem),
        efeitoConsumo: (1 - f) * (1 - r) * (ibsConsumo - sem) + teste,
        efeitoContribSeguro: -(1 - f) * (1 - r) * sg * ibsConsumo,
        efeitoSeguroRecebido: seguroRecebido,
        efeitoConsumoFinal: (1 - f) * (ibsConsumo - sem) + teste,
        fatia: sem / nac.T_br[i], fatiaGarantida: m.coef_nacional,
        populacao: m.populacao[i], consumo: ser.consumo[i],
      };
    });
  }

  /* indicadores de uma linha (cenario = 'lei' | 'final') */
  function indicadores(linha, comparacao, aliquota) {
    const com = linha[comparacao], dif = com - linha.sem;
    const ibs = com - linha.rem - linha.teste;
    return {
      com, sem: linha.sem, dif, impacto: linha.sem ? dif / linha.sem : 0,
      aliqEquilibrio: (linha.ano >= 2029 && ibs > 0) ? aliquota * (linha.sem - linha.rem - linha.teste) / ibs : null,
      classe: classeRisco(linha.sem ? dif / linha.sem : 0),
    };
  }

  function classeRisco(x) {
    if (x <= -0.10) return 'Crítico';
    if (x <= -0.03) return 'Atenção';
    if (x < 0.03)  return 'Neutro';
    if (x < 0.10)  return 'Favorável';
    return 'Muito favorável';
  }
  function porte(pop2025) {
    if (pop2025 <= 20000) return 'Pequeno porte I';
    if (pop2025 <= 50000) return 'Pequeno porte II';
    if (pop2025 <= 100000) return 'Médio porte';
    return 'Grande porte';
  }

  /* trajetória até 2096 (a partir de 2029) */
  function trajetoria(linhas, comparacao) {
    const v = linhas.filter((l) => !l.semDado && l.ano >= 2029);
    if (!v.length) return { ganhaNoFim: true, desde: 2029, sempre: true };
    const fim = v[v.length - 1][comparacao] >= v[v.length - 1].sem;
    let desde = v[v.length - 1].ano;
    for (let k = v.length - 1; k >= 0; k--) {
      if ((v[k][comparacao] >= v[k].sem) !== fim) break;
      desde = v[k].ano;
    }
    return { ganhaNoFim: fim, desde, sempre: desde === 2029 };
  }
  function trajetoriaTexto(linhas, comparacao) {
    const t = trajetoria(linhas, comparacao);
    if (t.sempre) return t.ganhaNoFim ? 'ganha sempre' : 'perde sempre';
    return (t.ganhaNoFim ? 'ganha a partir de ' : 'perde a partir de ') + t.desde;
  }

  /* saldo acumulado (2026..t) */
  function acumulado(linhas, comparacao) {
    let s = 0;
    return linhas.filter((l) => !l.semDado).map((l) => {
      if (l.ano >= 2026) s += l[comparacao] - l.sem;
      return { ano: l.ano, saldo: s };
    });
  }

  /* total de um recorte (SC ou filtro) — soma parcelas, recalcula % depois */
  const CAMPOS_SOMA = ['sem', 'rem', 'ibsConsumo', 'ibsMedia', 'teste', 'seguroRecebido', 'parteMedia', 'parteConsumo',
    'lei', 'final', 'efeitoMedia', 'efeitoConsumo', 'efeitoContribSeguro', 'efeitoSeguroRecebido', 'efeitoConsumoFinal',
    'fatia', 'fatiaGarantida', 'populacao', 'consumo'];
  function calcularTotal(p, filtro) {
    filtro = filtro || (() => true);
    const porAno = new Map();
    for (const cod of Object.keys(D.municipios)) {
      if (!filtro(D.municipios[cod], cod)) continue;
      for (const l of calcularMunicipio(cod, p)) {
        if (l.semDado) continue;
        const t = porAno.get(l.ano) || Object.fromEntries(CAMPOS_SOMA.map((cc) => [cc, 0]));
        for (const cc of CAMPOS_SOMA) t[cc] += l[cc] || 0;
        porAno.set(l.ano, t);
      }
    }
    return [...porAno.entries()].sort((x, y) => x[0] - y[0]).map(([ano, t]) => Object.assign({ ano }, t));
  }

  const idxAno = {}; anos.forEach((y, i) => (idxAno[y] = i));
  function linhaAno(linhas, ano) { return linhas.find((l) => l.ano === ano); }

  /* Compara os 3 cenários econômicos para um município num ano.
     Retorna, por cenário: séries completas + indicadores no ano. */
  function compararCenarios(cod, ano, over) {
    return CEN.map((c) => {
      const p = parametrosPadrao(Object.assign({}, over, { cenario: c }));
      const linhas = calcularMunicipio(cod, p);
      const l = linhaAno(linhas, ano);
      const ind = l && !l.semDado ? indicadores(l, p.comparacao, p.aliquota) : null;
      const acc = acumulado(linhas, p.comparacao);
      const accAno = acc.find((x) => x.ano === ano);
      return {
        cen: c, label: cenLabel(c), params: p, linhas, linha: l,
        sem: l ? l.sem : null,
        com: l ? l[p.comparacao] : null,
        lei: l ? l.lei : null, final: l ? l.final : null,
        impacto: ind ? ind.dif : null,
        impactoPct: ind ? ind.impacto : null,
        aliqEquilibrio: ind ? ind.aliqEquilibrio : null,
        classe: ind ? ind.classe : null,
        saldoAcum: accAno ? accAno.saldo : null,
        trajetoria: trajetoriaTexto(linhas, p.comparacao),
        efeitos: l ? {
          media: l.efeitoMedia, consumo: l.efeitoConsumo,
          contrib: l.efeitoContribSeguro, recebido: l.efeitoSeguroRecebido,
        } : null,
      };
    });
  }

  return {
    D, meta, anos, CEN, i26, municipios, mun, nome, cenLabel,
    parametrosPadrao, calcularMunicipio, indicadores, classeRisco, porte,
    trajetoria, trajetoriaTexto, acumulado, calcularTotal, linhaAno, compararCenarios,
    idxAno,
  };
})();
