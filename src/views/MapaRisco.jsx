/* Visão Geral — mapa de risco de SC.
   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */
export default function MapaRisco() {
  return (
    <section id="view-mapa" className="hidden">
          <div>
            <div className="page-title">VISÃO GERAL · <span id="rm-escopo">SANTA CATARINA</span></div>
            <div className="page-sub">Mapa de risco municipal · Índice de Exposição à Reforma Tributária (<span className="yr">2033</span>) · <span id="rm-cen-lbl">cenário Base</span></div>
          </div>
    
          {/* Linha 1: indicadores do município selecionado */}
          <div className="rm-stats">
            <div className="rm-stat" style={{ '--c': '#33363d' }}>
              <div className="top"><div className="k">Receita atual projetada<small>(cenário sem reforma)</small></div>
                <div className="badge b-teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></svg></div></div>
              <div className="v v-navy" id="rm-s-sem">—</div>
              <div className="n">cota-parte do ICMS + ISS</div>
            </div>
            <div className="rm-stat" style={{ '--c': '#2f4566' }}>
              <div className="top"><div className="k">Receita com a Reforma<small>(<span className="yr">2033</span>)</small></div>
                <div className="badge b-navy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" /></svg></div></div>
              <div className="v v-blue" id="rm-s-com">—</div>
              <div className="n">pela lei, com seguro-receita</div>
            </div>
            <div className="rm-stat" style={{ '--c': '#7a3b35' }}>
              <div className="top"><div className="k">Impacto estimado<small>(<span className="yr">2033</span>)</small></div>
                <div className="badge b-coral" id="rm-s-imp-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M6 13l6 6 6-6" /></svg></div></div>
              <div className="v v-coral" id="rm-s-imp">—</div>
              <div className="n">com reforma − sem reforma</div>
            </div>
            <div className="rm-stat" style={{ '--c': '#7a5a2e' }}>
              <div className="top"><div className="k">Impacto percentual<small>(<span className="yr">2033</span>)</small></div>
                <div className="badge b-coral" id="rm-s-pct-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="M18 6L6 18" /></svg></div></div>
              <div className="v v-coral" id="rm-s-pct">—</div>
              <div className="n" id="rm-s-pct-n"></div>
            </div>
            <div className="rm-stat" style={{ '--c': '#3d5a45' }}>
              <div className="top"><div className="k">Alíquota de equilíbrio<small>(estimada · <span className="yr">2033</span>)</small></div>
                <div className="badge b-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M6 7h12M4 11l3-4 3 4a3 3 0 01-6 0zM14 11l3-4 3 4a3 3 0 01-6 0z" /></svg></div></div>
              <div className="v v-green" id="rm-s-eq">—</div>
              <div className="n" id="rm-s-eq-n"></div>
            </div>
            <div className="rm-stat" style={{ '--c': '#4b3a6b' }}>
              <div className="top"><div className="k">Classificação de risco<small>(exposição à reforma)</small></div>
                <div className="badge b-purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l9 5v6c0 5-4 7-9 7s-9-2-9-7V8z" /></svg></div></div>
              <div className="v"><span className="rm-tag" id="rm-s-risco">—</span></div>
              <div className="n" id="rm-s-risco-n"></div>
            </div>
          </div>
    
          {/* Linha 2: mapa (esquerda) + ranking e distribuição (direita) */}
          <div className="rm-main">
            <div className="card pad rm-mapcard">
              <div className="rm-map-grid">
                <div className="rm-map-side">
                  <div className="rm-title">Índice de risco por município</div>
                  <p className="rm-sub">Classificação baseada no impacto percentual estimado da reforma em <span className="yr">2033</span>.</p>
                  <div className="rm-legend" id="rm-legend"></div>
                  <button className="btn rm-entenda" id="rm-entenda" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>Entenda o índice</button>
                </div>
                <div className="rm-map-wrap" id="rm-map-wrap">
                  <svg id="rm-map" viewBox="0 0 1000 696.1" preserveAspectRatio="xMidYMid meet" aria-label="Mapa de risco dos municípios de Santa Catarina"></svg>
                  <div className="rm-tip hidden" id="rm-tip"></div>
                  <div className="rm-ctrl">
                    <button type="button" data-z="home" title="Ver SC inteiro"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7M5 10v10h14V10" /></svg></button>
                    <button type="button" data-z="in" title="Aproximar">+</button>
                    <button type="button" data-z="out" title="Afastar">−</button>
                    <button type="button" data-z="sel" title="Centralizar no município selecionado"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></svg></button>
                  </div>
                </div>
              </div>
              <div className="rm-map-foot"><span id="rm-fonte">Fonte: modelo v2 (dados_reforma_v2) · 2033</span><span>Clique em um município para ver os detalhes.</span></div>
            </div>
    
            <div className="rm-side">
              <div className="card pad rm-rank">
                <div className="rm-title">Ranking de impacto percentual (<span className="yr">2033</span>)</div>
                <div className="rm-tabs" id="rm-tabs">
                  <button type="button" data-t="perdas" className="on">Maiores perdas</button>
                  <button type="button" data-t="ganhos">Maiores ganhos</button>
                </div>
                <ol className="rm-rank-list" id="rm-rank-list"></ol>
                <button className="btn rm-foot-btn" id="rm-rank-more" type="button">Ver ranking completo →</button>
              </div>
    
              <div className="card pad rm-dist">
                <div className="rm-title">Distribuição dos municípios por classe de risco</div>
                <p className="rm-sub">Número de municípios por classificação de risco.</p>
                <div className="rm-dist-body">
                  <div className="rm-donut"><canvas id="rm-donut"></canvas><div className="rm-donut-c"><b id="rm-donut-n">295</b><span>municípios</span></div></div>
                  <div className="rm-dist-leg" id="rm-dist-leg"></div>
                </div>
                <button className="btn rm-foot-btn" id="rm-dist-metod" type="button">Ver metodologia do índice →</button>
              </div>
            </div>
          </div>
    
        </section>
  );
}
