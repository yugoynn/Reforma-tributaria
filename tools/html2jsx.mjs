// Converte as <section id="view-*"> e o modal do index.html original em componentes React (JSX).
// Uso: node tools/html2jsx.mjs <index.html original> <pasta src/views>
// Gerado uma vez na migração; depois disso os componentes em src/views são a fonte.
import fs from 'node:fs';
import path from 'node:path';

const [, , htmlPath, outDir] = process.argv;
const html = fs.readFileSync(htmlPath, 'utf8');

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const ATTR = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', crossorigin: 'crossOrigin' };
const VOID = ['input', 'img', 'br', 'hr', 'meta', 'link'];

function styleToObj(css) {
  const parts = css.split(';').map((s) => s.trim()).filter(Boolean).map((decl) => {
    const i = decl.indexOf(':');
    const k = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim().replace(/'/g, "\\'");
    const key = k.startsWith('--') ? `'${k}'` : camel(k);
    return `${key}: '${v}'`;
  });
  return `{{ ${parts.join(', ')} }}`;
}

function convertTag(tag) {
  // tag = conteúdo de uma abertura <...>
  const m = tag.match(/^<([a-zA-Z][\w-]*)([\s\S]*?)(\/?)>$/);
  if (!m) return tag;
  const [, name, rawAttrs, slash] = m;
  const attrs = [];
  const re = /([:\w-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|[^\s>]+))?/g;
  let a;
  while ((a = re.exec(rawAttrs))) {
    let [, key, , dq, sq] = a;
    let val = dq ?? sq;
    if (val === undefined && a[2]) val = a[2];
    if (key === 'style' && val !== undefined) { attrs.push(`style=${styleToObj(val)}`); continue; }
    if (ATTR[key]) key = ATTR[key];
    else if (!key.startsWith('data-') && !key.startsWith('aria-') && key.includes('-')) key = camel(key);
    if (name === 'input' && key === 'value') key = 'defaultValue';
    if (name === 'input' && key === 'checked') key = 'defaultChecked';
    attrs.push(val === undefined ? key : `${key}="${val}"`);
  }
  const selfClose = slash || VOID.includes(name.toLowerCase()) ? " /" : "";
  return `<${name}${attrs.length ? ' ' + attrs.join(' ') : ''}${selfClose}>`;
}

function toJsx(fragment) {
  let s = fragment.replace(/<!--([\s\S]*?)-->/g, (_, c) => `{/* ${c.trim()} */}`);
  s = s.replace(/<[a-zA-Z][^<>]*>/g, convertTag);
  // texto com chaves literais não é esperado; protege se houver
  s = s.replace(/>([^<]*)</g, (all, txt) => (/[{}]/.test(txt) && !/^\s*\{\/\*/.test(txt) ? `>${txt.replace(/\{/g, "{'{'}").replace(/\}/g, "{'}'}")}<` : all));
  return s;
}

function grabSection(id) {
  const start = html.indexOf(`<section id="${id}"`);
  if (start < 0) throw new Error('seção não encontrada: ' + id);
  const end = html.indexOf('</section>', start) + '</section>'.length;
  return html.slice(start, end);
}

const views = [
  ['view-overview', 'Overview', 'Visão executiva (legado, fora do menu)'],
  ['view-mapa', 'MapaRisco', 'Visão Geral — mapa de risco de SC'],
  ['view-transicao', 'Transicao', 'Transição 2026–2096'],
  ['view-estrutura', 'Estrutura', 'Estrutura produtiva e encadeamentos'],
  ['view-setorial', 'Setorial', 'Decomposição setorial do impacto'],
  ['view-benchmark', 'Benchmark', 'Benchmarking municipal'],
  ['view-investimento', 'Investimento', 'Simulador de impulsionamento'],
  ['view-metodologia', 'Metodologia', 'Metodologia, dados e legislação'],
  ['view-simulator', 'Simulador', 'Simulador de cenários (legado, fora do menu)'],
  ['view-oficial', 'Oficial', 'Simulador oficial IBS (legado, fora do menu)'],
  ['view-comparacao', 'Comparacao', 'Comparação de cenários (legado, fora do menu)'],
];

fs.mkdirSync(outDir, { recursive: true });
for (const [id, comp, desc] of views) {
  const jsx = toJsx(grabSection(id));
  const body = jsx.split('\n').map((l) => '    ' + l).join('\n');
  fs.writeFileSync(path.join(outDir, comp + '.jsx'),
    `/* ${desc}.\n   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */\nexport default function ${comp}() {\n  return (\n${body}\n  );\n}\n`);
}

// modal de metodologia
const mStart = html.indexOf('<div class="modal-bg');
const mEnd = html.indexOf('<script', mStart);
const modal = toJsx(html.slice(mStart, mEnd).trim());
fs.writeFileSync(path.join(outDir, 'ModalMetodologia.jsx'),
  `export default function ModalMetodologia() {\n  return (\n${modal.split('\n').map((l) => '    ' + l).join('\n')}\n  );\n}\n`);
console.log('ok:', views.map((v) => v[1]).join(', '), '+ ModalMetodologia');
