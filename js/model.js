/* ============================================================
   MODELO DE CENÁRIOS — agora sobre dados REAIS (dados_reforma.json)
   ------------------------------------------------------------
   O simulador de cenários (sliders) virou uma camada de PREMISSAS
   sobre a série real do município selecionado:
     • O cálculo da reforma usa o fator_base e as fórmulas oficiais
       (ver reforma.js / Guia PDF) — nada de coeficiente chumbado.
     • Os sliders de crescimento (econômico, consumo, população) e a
       participação do consumo local funcionam como DESVIOS sobre a
       trajetória projetada no JSON. No "Cenário Base" o desvio é zero
       e os números batem exatamente com o Simulador Oficial.
     • A alíquota do slider é o IBS TOTAL (%); é dividida em 17%
       municipal / 83% estadual automaticamente.
   O contexto (município, ano-base, seguro-receita) é global: mude o
   município na topbar e todo o painel recalcula.
   ============================================================ */

const HIST0   = 2013;
const ANCHOR  = 2023;                       // último ano histórico
const ANO_FIM = 2077;

/* Contexto global — controlado pela topbar */
let CTX = { cod: 4204608, ano: 2033, seguro: false };   // Criciúma, 2033

/* anos amostrados p/ gráficos de longo prazo (2026 -> 2077) */
const CHART_YEARS = (function () { var a = []; for (var y = 2026; y <= ANO_FIM; y += 3) a.push(y); if (a[a.length - 1] !== ANO_FIM) a.push(ANO_FIM); return a; })();
const YEARS = CHART_YEARS;
const ACC_YEARS = (function () { var a = []; for (var y = 2026; y <= ANO_FIM; y++) a.push(y); return a; })();

/* Decomposição setorial (ilustrativa — escala com o impacto total) */
const SETORES = [
  ['Indústria',   0.52],
  ['Comércio',    0.34],
  ['Construção',  0.13],
  ['Agronegócio', 0.10],
  ['Serviços',   -0.06],
  ['Turismo',    -0.02],
  ['Tecnologia', -0.01],
];

/* Cenários pré-definidos — ibs = IBS TOTAL (%) */
const PRESETS = {
  conservador: { eco: 1.5, cons: 2.0, pop: 0.8, ibs: 17.5, loc: 98 },
  base:        { eco: 2.5, cons: 3.1, pop: 1.2, ibs: 18.7, loc: 100 },
  otimista:    { eco: 3.5, cons: 4.0, pop: 1.5, ibs: 20.0, loc: 102 },
};

/* Referência do overlay: no Cenário Base o desvio é zero */
const G_BASE   = 0.45 * PRESETS.base.eco / 100 + 0.55 * PRESETS.base.cons / 100;
const POP_BASE = PRESETS.base.pop / 100;
const LOC_BASE = PRESETS.base.loc;

/* Fatores de desvio (=1 no cenário base) */
function growthFactor(p, t) {
  if (t <= ANCHOR) return 1;
  var g = 0.45 * p.eco / 100 + 0.55 * p.cons / 100;
  var f = Math.pow(1 + (g - G_BASE), t - ANCHOR);
  return f < 0.05 ? 0.05 : f;
}
function popFactor(p, t) {
  if (t <= ANCHOR) return 1;
  var f = Math.pow(1 + (p.pop / 100 - POP_BASE), t - ANCHOR);
  return f < 0.05 ? 0.05 : f;
}
/* adj(t) para a engine: base (consumo local), sem (legado), pop (cota) */
function adjFor(p) {
  return function (t) {
    return {
      base: growthFactor(p, t) * (p.loc / LOC_BASE),
      sem:  growthFactor(p, t),
      pop:  popFactor(p, t),
    };
  };
}

/* Projeta a trajetória completa (2013 -> 2077) para um cenário p */
function projetar(p) {
  var adj = adjFor(p);
  var comSeg = REFORMA.serie(CTX.cod, p.ibs / 100, true,  adj);   // realista (c/ seguro)
  var pleno  = REFORMA.serie(CTX.cod, p.ibs / 100, false, adj);   // sem seguro
  var serie = {};
  comSeg.forEach(function (r, i) {
    var y = r.ano;
    if (y > ANO_FIM) return;
    serie[y] = {
      consumo: r.base_destino, base: r.base_destino, pop: r.populacao,
      sem: r.semReforma,
      com: pleno[i].total,          // sem seguro
      comSeguro: r.total,           // com seguro
      legado: r.legado, historica: r.historica, destino: r.destino,
      destinoPleno: pleno[i].destino,
      T: r.T, ret: r.ret, seg: r.seg, mantido: r.mantido,
      hist: y <= ANCHOR,
    };
  });
  return serie;
}

/* IBS total (%) que zera o impacto no ano-base (regime escolhido) */
function aliquotaEquilibrio(p) {
  var y = CTX.ano;
  var mk = function (r) {
    var s = projetar(Object.assign({}, p, { ibs: r }));
    return { com: CTX.seguro ? s[y].comSeguro : s[y].com, sem: s[y].sem };
  };
  var A = mk(10), B = mk(20);
  var slope = (B.com - A.com) / 10;
  if (Math.abs(slope) < 1e-9) return NaN;
  var t0 = A.com - slope * 10;
  return (A.sem - t0) / slope;
}

/* Métricas-resumo de um cenário (KPIs no ano-base = CTX.ano) */
function calcular(p) {
  var s = projetar(p);
  var y = CTX.ano;
  var sem = s[y].sem;
  var com = CTX.seguro ? s[y].comSeguro : s[y].com;
  var impacto = com - sem;
  var impactoPct = sem ? impacto / sem * 100 : 0;
  var eq = aliquotaEquilibrio(p);

  var acumulado = 0;
  ACC_YEARS.forEach(function (t) { if (s[t]) acumulado += s[t].comSeguro - s[t].sem; });

  var risco = REFORMA.classificar(impactoPct);
  var decomp = SETORES.map(function (x) { return [x[0], x[1] * impacto]; });
  var pc = com / s[y].pop;

  return {
    serie: s, sem33: sem, com33: com, impacto: impacto, impactoPct: impactoPct,
    eq: eq, acumulado: acumulado, risco: risco, decomp: decomp, perCapita: pc,
    legado: s[y].legado, historica: s[y].historica, destino: CTX.seguro ? s[y].destino : s[y].destinoPleno,
    params: p,
  };
}

/* Sensibilidade da receita (ano-base) à variação (±%) de cada parâmetro */
function sensibilidade(p) {
  var vars = [-10, -5, 0, 5, 10];
  var linha = function (campo) {
    return vars.map(function (v) {
      var q = Object.assign({}, p); q[campo] = p[campo] * (1 + v / 100);
      return calcular(q).com33 / 1e6;
    });
  };
  return { eco: linha('eco'), cons: linha('cons'), ibs: linha('ibs') };
}

/* Curva receita (ano-base) × alíquota IBS total */
function curvaAliquota(p, rates) {
  return rates.map(function (r) { var q = Object.assign({}, p); q.ibs = r; return calcular(q).com33 / 1e6; });
}
