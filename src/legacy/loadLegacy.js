/* Carrega os motores de cálculo e de tela originais (JS puro, em public/legacy/js),
   na mesma ordem do index.html original. Eles compartilham variáveis globais entre si
   (REFORMA, CTX, render, charts...), por isso são scripts clássicos e não módulos.
   Precisam rodar DEPOIS que o React montou a marcação, porque procuram os elementos por id. */

const SCRIPTS = [
  'chart.umd.js',
  'data.js',
  'dados_reforma.js',
  'reforma.js',
  'dados_reforma_v2.js',
  'reforma_v2.js',
  'malha_sc.js',
  'model.js',
  'app.js',
  'mapa_risco.js',
  'transicao.js',
  'dados_estrutura.js',
  'estrutura.js',
  'dados_setorial.js',
  'setorial.js',
  'dados_benchmark.js',
  'benchmark.js',
  'dados_metodologia.js',
  'metodologia.js',
  'dados_investimento.js',
  'investimento_motor.js',
  'investimento.js',
  'play.js',
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Falha ao carregar ' + src));
    document.body.appendChild(s);
  });
}

let loading = null;

export default function loadLegacy() {
  if (!loading) {
    const base = import.meta.env.BASE_URL + 'legacy/js/';
    loading = SCRIPTS.reduce((p, f) => p.then(() => loadScript(base + f)), Promise.resolve());
  }
  return loading;
}
