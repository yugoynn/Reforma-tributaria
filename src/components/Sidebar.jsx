/* Menu lateral. A troca de tela é feita pelo motor legado (setView em app.js),
   que escuta os cliques em .nav-item[data-view]. */
const ICONES = {
  mapa: <><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>,
  transicao: <><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></>,
  estrutura: <><path d="M3 21V10l5 3V10l5 3V10l5 3V4h3v17z" /><path d="M7 17h2M12 17h2M17 17h2" /></>,
  setorial: <><path d="M21 12A9 9 0 1112 3v9z" /><path d="M15 3.5A9 9 0 0120.5 9H15z" /></>,
  benchmark: <path d="M4 20V8M10 20V4M16 20v-8M22 20H2" />,
  investimento: <><circle cx="9" cy="9" r="6" /><path d="M9 6.5v5M7 8h3a1 1 0 010 2H8a1 1 0 000 2h3" /><path d="M15.5 13.5L21 8M17 8h4v4" /><path d="M3 21h18" /></>,
  metodologia: <><path d="M4 5h12l4 4v10H4z" /><path d="M8 3v4M8 12h8M8 16h5" /></>,
};

const ITENS = [
  ['mapa', 'Visão Geral', 'Mapa de risco de SC'],
  ['transicao', 'Transição 2026–2096', 'Evolução anual'],
  ['estrutura', 'Estrutura Produtiva', 'Setores, encadeamentos e alíquota'],
  ['setorial', 'Decomposição Setorial', 'Impacto por setor econômico'],
  ['benchmark', 'Benchmarking Municipal', 'Compare municípios'],
  ['investimento', 'Simulador de Impulsionamento', 'Quanto volta de receita por setor'],
  ['metodologia', 'Metodologia e Legislação', 'Bases, premissas e normas'],
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav id="nav">
        {ITENS.map(([view, titulo, sub], i) => (
          <div key={view} className={'nav-item' + (i === 0 ? ' active' : '')} data-view={view}>
            <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{ICONES[view]}</svg></div>
            <div className="txt"><b>{titulo}</b><span>{sub}</span></div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
