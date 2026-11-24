/* Ponte entre o filtro "Associação" (React) e os motores legados.
   • Filtra o seletor de Município (esconde os que não são da associação).
   • Esmaece no mapa os municípios fora da associação.
   • Se o usuário escolher no mapa/ranking um município de fora, avisa o React
     para voltar a "Todas", sem perder a escolha. */

let membros = null; // Set de códigos (string) da associação ativa, ou null = todas
let aoSairDaAssociacao = () => {};

const $ = (id) => document.getElementById(id);

function decorarMapas() {
  document.querySelectorAll('svg path.m[data-cod]').forEach((p) => {
    p.classList.toggle('fora-assoc', !!membros && !membros.has(p.dataset.cod));
  });
  document.querySelectorAll('svg.map-svg, svg#rm-map, svg.rm-map').forEach((svg) => {
    svg.classList.toggle('assoc-on', !!membros);
  });
}

function conferirSelecao() {
  const ms = $('mun-select');
  if (!ms || !membros) return;
  const opt = ms.options[ms.selectedIndex];
  if (opt && opt.hidden) aoSairDaAssociacao();
}

function depoisDeRenderizar() {
  decorarMapas();
  conferirSelecao();
}

/* Envolve as funções globais de renderização para reaplicar o filtro depois de cada desenho. */
export function instalarGanchos(onSair) {
  aoSairDaAssociacao = onSair;
  ['render', 'renderMapaRisco'].forEach((nome) => {
    const f = window[nome];
    if (typeof f !== 'function' || f.__assoc) return;
    const g = function (...args) {
      const r = f.apply(this, args);
      depoisDeRenderizar();
      return r;
    };
    g.__assoc = true;
    window[nome] = g;
  });
}

/* assoc = { sigla, nome, municipios:[cod] } ou null (todas). */
export function aplicarAssociacao(assoc) {
  const ms = $('mun-select');
  if (!ms) return;
  membros = assoc ? new Set(assoc.municipios.map(String)) : null;

  let primeiro = null;
  [...ms.options].forEach((o) => {
    const visivel = !membros || membros.has(o.value);
    o.hidden = !visivel;
    if (visivel && !primeiro) primeiro = o;
  });

  const atual = ms.options[ms.selectedIndex];
  if (membros && (!atual || atual.hidden) && primeiro) {
    // município atual (ou "Santa Catarina") fora da associação → seleciona o 1º da lista
    ms.value = primeiro.value;
    ms.dispatchEvent(new Event('change'));
  }
  decorarMapas();
}
