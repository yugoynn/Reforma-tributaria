/* Transição 2026–2096.
   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */
export default function Transicao() {
  return (
    <section id="view-transicao" className="hidden">
          <div>
            <div className="page-title">TRANSIÇÃO DA REFORMA TRIBUTÁRIA 2026–2096</div>
            <div className="page-sub">Evolução anual da arrecadação e composição dos tributos durante o período de transição · <span id="tr-sub">—</span></div>
          </div>
    
          {/* indicadores */}
          <div className="rm-stats tr-stats">
            <div className="rm-stat" style={{ '--c': '#33363d' }}>
              <div className="top"><div className="k">Receita total 2026<small id="tr-k1-s">cenário Base</small></div>
                <div className="badge b-navy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8M12 16v1.5" /></svg></div></div>
              <div className="v v-navy" id="tr-k1">—</div><div className="n" id="tr-k1-n"></div>
            </div>
            <div className="rm-stat" style={{ '--c': '#2f4566' }}>
              <div className="top"><div className="k">Receita total 2096<small id="tr-k2-s">cenário Base</small></div>
                <div className="badge b-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></svg></div></div>
              <div className="v v-blue" id="tr-k2">—</div><div className="n" id="tr-k2-n"></div>
            </div>
            <div className="rm-stat" style={{ '--c': '#3d5a45' }}>
              <div className="top"><div className="k">Variação 2026–2096<small>receita com reforma</small></div>
                <div className="badge b-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V14M9 20V10M14 20V12M19 20V6" /><path d="M4 10l5-4 5 3 6-5" /></svg></div></div>
              <div className="v v-green" id="tr-k3">—</div><div className="n" id="tr-k3-n"></div>
            </div>
            <div className="rm-stat" style={{ '--c': '#7a3b35' }}>
              <div className="top"><div className="k">Impacto acumulado no período<small>com reforma − sem reforma</small></div>
                <div className="badge b-coral" id="tr-k4-b"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l7 7 3-3 6 6" /><path d="M20 11v5h-5" /></svg></div></div>
              <div className="v v-coral" id="tr-k4">—</div><div className="n" id="tr-k4-n"></div>
            </div>
            <div className="rm-stat" style={{ '--c': '#4b3a6b' }}>
              <div className="top"><div className="k">Ano de equilíbrio (receita)<small>com reforma = sem reforma</small></div>
                <div className="badge b-purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M6 7h12M4 11l3-4 3 4a3 3 0 01-6 0zM14 11l3-4 3 4a3 3 0 01-6 0zM8 21h8" /></svg></div></div>
              <div className="v" id="tr-k5" style={{ color: '#4b3a6b' }}>—</div><div className="n" id="tr-k5-n"></div>
            </div>
          </div>
    
          {/* linha principal: gráficos (esquerda) + parâmetros do cenário (direita) */}
          <div className="tr2-main">
            <div className="tr2-left">
              <div className="card pad tr-chartcard">
                <div className="tr-chart-head">
                  <div className="rm-title" id="tr-chart-title">Arrecadação total e composição por tributo</div>
                  <span className="mini-link" id="tr-metod">Metodologia da transição →</span>
                </div>
                <div className="legend tr-legend" id="tr-legend"></div>
                <div className="tr-unit-lbl" id="tr-unit-lbl">R$ milhões</div>
                <div className="chart-box tr-box" id="tr-box"><canvas id="tr-chart"></canvas></div>
                <div className="tr-table-wrap hidden" id="tr-table-wrap">
                  <table className="of-tbl tr-table"><thead><tr><th>Ano</th><th>ICMS + ISS</th><th>IBS</th><th>Com reforma</th><th>Sem reforma</th><th>Diferença</th><th>Dif. %</th><th>Acumulado</th></tr></thead><tbody id="tr-table"></tbody></table>
                </div>
              </div>
    
              <div className="tr-bl">
                <div className="card pad">
                  <div className="rm-title">Diferença acumulada em relação ao cenário-base</div>
                  <div className="tr-unit-lbl" id="tr-acc-unit">R$ milhões</div>
                  <div className="chart-box tr-acc-box"><canvas id="tr-acc"></canvas></div>
                  <div className="legend tr-legend sm"><span><i style={{ background: '#e3cdc9', boxShadow: 'inset 0 0 0 1px #7a3b35' }}></i>Diferença acumulada (com reforma − sem reforma)</span></div>
                </div>
                <div className="card pad">
                  <div className="rm-title">Indicadores da transição</div>
                  <div className="tr-ind" id="tr-ind"></div>
                </div>
              </div>
            </div>
    
            <div className="card pad tr-params">
              <div className="tr-params-head">
                <div className="section-title">PARÂMETROS DO CENÁRIO</div>
                <button className="btn" id="tr-reset" type="button">↺ Redefinir para o cenário base</button>
              </div>
              <div className="tr-params-grid">
                <div className="tr-sliders">
                  <div className="param tr-param">
                    <div className="head"><span className="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg></span>Crescimento econômico anual</div>
                    <div className="value" data-trv="eco">—</div>
                    <input className="range tr-range" type="range" min="-1" max="6" step="0.1" data-k="eco" aria-label="Crescimento econômico anual" />
                    <div className="ticks"><span>-1%</span><span>0%</span><span>2%</span><span>4%</span><span>6%</span></div>
                  </div>
                  <div className="param tr-param">
                    <div className="head"><span className="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6h15l-1.5 9H8L6 3H3" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg></span>Crescimento do consumo anual</div>
                    <div className="value" data-trv="cons">—</div>
                    <input className="range tr-range" type="range" min="-1" max="6" step="0.1" data-k="cons" aria-label="Crescimento do consumo anual" />
                    <div className="ticks"><span>-1%</span><span>0%</span><span>2%</span><span>4%</span><span>6%</span></div>
                  </div>
                  <div className="param tr-param">
                    <div className="head"><span className="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="3" /><path d="M2 21v-2a5 5 0 015-5h4a5 5 0 015 5v2M17 8a3 3 0 100-6" /></svg></span>Crescimento populacional anual</div>
                    <div className="value" data-trv="pop">—</div>
                    <input className="range tr-range" type="range" min="-1" max="3" step="0.1" data-k="pop" aria-label="Crescimento populacional anual" />
                    <div className="ticks"><span>-1%</span><span>0%</span><span>1%</span><span>2%</span><span>3%</span></div>
                  </div>
                  <div className="param tr-param">
                    <div className="head"><span className="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="M18 6L6 18" /></svg></span>Alíquota de IBS total (hipótese)</div>
                    <div className="value" data-trv="ibs">—</div>
                    <input className="range tr-range" type="range" min="10" max="25" step="0.1" data-k="ibs" aria-label="Alíquota de IBS total (hipótese)" />
                    <div className="ticks"><span>10%</span><span>15%</span><span>18,7%</span><span>20%</span><span>25%</span></div>
                  </div>
                </div>
                <div className="tr-side2">
                  <div className="scenarios" id="tr-scen">
                    <div className="scen-card" data-preset="conservador">
                      <div className="ic" style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l9 5v6c0 5-4 7-9 7s-9-2-9-7V8z" /></svg></div>
                      <div className="nm">Cenário Conservador</div>
                      <div className="ds">Menor crescimento econômico e de consumo.</div>
                      <div className="ib">IBS total: 17,5%</div>
                    </div>
                    <div className="scen-card" data-preset="base">
                      <div className="ic" style={{ background: '#e8eaef', color: 'var(--blue)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 8-8" /></svg></div>
                      <div className="nm">Cenário Base</div>
                      <div className="ds">Parâmetros médios de crescimento.</div>
                      <div className="ib">IBS total: 18,7%</div>
                    </div>
                    <div className="scen-card" data-preset="otimista">
                      <div className="ic" style={{ background: '#ebe8f0', color: 'var(--purple)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z" /></svg></div>
                      <div className="nm">Cenário Otimista</div>
                      <div className="ds">Maior crescimento econômico e de consumo.</div>
                      <div className="ib">IBS total: 20,0%</div>
                    </div>
                  </div>
                  <div className="tr-view">
                    <div className="tr-view-lbl">Visualização do gráfico</div>
                    <div className="tr-vtabs" id="tr-tabs">
                      <button data-t="evo" className="on">Evolução anual (valores)</button>
                      <button data-t="comp">Composição (%)</button>
                      <button data-t="dif">Diferença para cenário-base</button>
                      <button data-t="tab">Tabela detalhada</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="tr-params-foot"><span className="mini-link" id="tr-prem">Como os parâmetros entram no cálculo →</span></div>
            </div>
          </div>
        </section>
  );
}
