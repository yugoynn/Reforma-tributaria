/* Benchmarking municipal.
   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */
export default function Benchmark() {
  return (
    <section id="view-benchmark" className="hidden">
          <div>
            <div className="page-title">BENCHMARKING MUNICIPAL (<span className="yr">2033</span>)</div>
            <div className="page-sub">Compare o impacto da reforma e o perfil econômico entre municípios de Santa Catarina.</div>
            <div className="ano-aviso hidden" id="bm-ano-aviso"></div>
          </div>
          <div className="bm-row1">
            <div className="card pad ds-card">
              <div className="rm-title">Comparativo de indicadores-chave (<span className="yr">2033</span>)</div>
              <p className="rm-sub">Receitas pela lei na alíquota padrão do modelo · R$ milhões de 2025. Clique no nome de um município para selecioná-lo.</p>
              <div className="ds-tbl-wrap"><table className="bm-tbl" id="bm-tbl"></table></div>
            </div>
            <div className="card pad ds-card">
              <div className="rm-title">Perfil econômico comparativo</div>
              <p className="rm-sub" id="bm-radar-sub">Composição do PIB (%) por setor.</p>
              <div className="bm-pick">
                <label><span className="bm-dot" style={{ background: '#2f4566' }}></span><select id="bm-a"></select></label>
                <span className="bm-vs">×</span>
                <label><span className="bm-dot" style={{ background: '#7a5a2e' }}></span><select id="bm-b"></select></label>
              </div>
              <div className="chart-box bm-radar-box"><canvas id="bm-radar"></canvas></div>
              <div className="legend tr-legend sm bm-radar-leg" id="bm-radar-leg"></div>
            </div>
          </div>
          <div className="bm-row2">
            <div className="card pad ds-card">
              <div className="rm-title">Municípios mais afetados (<span className="yr">2033</span>)</div>
              <div className="rm-tabs" id="bm-tabs">
                <button type="button" data-t="perdas" className="on">Maiores perdas</button>
                <button type="button" data-t="ganhos">Maiores ganhos</button>
              </div>
              <ol className="rm-rank-list bm-list" id="bm-mais"></ol>
              <button className="btn rm-foot-btn" id="bm-mais-more" type="button">Ver ranking completo →</button>
            </div>
            <div className="card pad ds-card">
              <div className="rm-title">Municípios menos afetados (<span className="yr">2033</span>)</div>
              <p className="rm-sub">Menor impacto percentual, para mais ou para menos.</p>
              <ol className="rm-rank-list bm-list" id="bm-menos"></ol>
              <button className="btn rm-foot-btn" id="bm-menos-more" type="button">Ver ranking completo →</button>
            </div>
          </div>
          <div className="es-foot" id="bm-foot"></div>
        </section>
  );
}
