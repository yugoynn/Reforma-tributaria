/* Visão executiva (legado, fora do menu).
   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */
export default function Overview() {
  return (
    <section id="view-overview">
          <div>
            <div className="page-title">VISÃO EXECUTIVA</div>
            <div className="page-sub" id="ov-sub">Impacto estimado da Reforma Tributária para Criciúma - SC</div>
          </div>
    
          <div className="stats" id="sec-impacto">
            <div className="stat">
              <div className="top"><div className="k">Receita atual projetada<small>(cenário sem reforma)</small></div>
                <div className="badge b-teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></svg></div></div>
              <div className="v v-navy" id="ov-sem">R$ 388,9 mi</div>
            </div>
            <div className="stat">
              <div className="top"><div className="k">Receita com a Reforma<small>(<span className="yr">2033</span>)</small></div>
                <div className="badge b-navy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" /></svg></div></div>
              <div className="v v-navy" id="ov-com">R$ 366,4 mi</div>
            </div>
            <div className="stat">
              <div className="top"><div className="k">Impacto estimado<small>(<span className="yr">2033</span>)</small></div>
                <div className="badge b-coral" id="ov-imp-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M6 13l6 6 6-6" /></svg></div></div>
              <div className="v v-coral" id="ov-imp">- R$ 26,0 mi</div>
            </div>
            <div className="stat">
              <div className="top"><div className="k">Impacto percentual<small>(<span className="yr">2033</span>)</small></div>
                <div className="badge b-coral"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="M18 6L6 18" /></svg></div></div>
              <div className="v v-coral" id="ov-imp-pct">-6,6%</div>
            </div>
            <div className="stat">
              <div className="top"><div className="k">Alíquota de equilíbrio<small>(estimada)</small></div>
                <div className="badge b-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M6 7h12M4 11l3-4 3 4a3 3 0 01-6 0zM14 11l3-4 3 4a3 3 0 01-6 0z" /></svg></div></div>
              <div className="v v-blue" id="ov-eq">18,74%</div>
            </div>
            <div className="stat">
              <div className="top"><div className="k">Classificação de risco<small>(exposição à reforma)</small></div>
                <div className="badge b-coral"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l9 5v6c0 5-4 7-9 7s-9-2-9-7V8z" /></svg></div></div>
              <div className="tag" id="ov-risco">ALTO</div>
            </div>
            <div className="stat info">
              <div className="top"><div className="k">O que significa?</div>
                <div className="badge" style={{ background: '#e3e6ec', color: 'var(--navy)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg></div></div>
              <p id="ov-explain">A Reforma Tributária deve reduzir a receita de Criciúma em 6,6% até 2033, neste cenário. Para manter a receita do cenário-base, a alíquota de equilíbrio estimada é 18,74%.</p>
            </div>
          </div>
    
          {/* Row 2 */}
          <div className="grid g-2-1">
            <div className="card pad">
              <div className="section-head">
                <div className="section-title" id="sec-transicao">TRANSIÇÃO DA REFORMA TRIBUTÁRIA 2026–2096</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '16px' }}>
                <div>
                  <div className="legend">
                    <span><i style={{ background: 'var(--teal)' }}></i>Receita protegida (seguro-receita)</span>
                    <span><i style={{ background: 'var(--dark)' }}></i>IBS destino (partilha)</span>
                    <span><i className="line"></i>Receita total sem reforma (cenário base)</span>
                    <span><i className="line2"></i>Diferença acumulada</span>
                  </div>
                  <div className="chart-box" style={{ height: '280px' }}><canvas id="c-transicao"></canvas></div>
                </div>
                <div className="acc-box">
                  <div className="lab">Impacto acumulado<br />2026–2096</div>
                  <div className="big" id="ov-acc">- R$ 1.459,6 mi</div>
                  <p>Perda acumulada durante toda a transição, à medida que o seguro-receita reduz e o IBS passa a ser distribuído pelo destino (consumo local).</p>
                  <div className="lnk"><span className="mini-link" data-goto="simulator">Ver detalhes →</span></div>
                </div>
              </div>
            </div>
    
            <div className="card pad">
              <div className="section-head">
                <div className="section-title">SIMULADOR DE CENÁRIOS</div>
                <span className="mini-link" id="ov-sim-reset">↺ Redefinir</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600', marginBottom: '8px' }}>Parâmetros do cenário</div>
              <table className="sim-tbl">
                <thead><tr><th>Parâmetro</th><th className="r">Cenário Base</th><th className="r">Meu Cenário</th></tr></thead>
                <tbody id="ov-sim-tbody"></tbody>
              </table>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600', marginTop: '14px' }}>Resultado <span className="yr">2033</span></div>
              <div className="res-row">
                <div className="res-cell"><div className="l">Cenário Base</div><div className="n v-navy" id="ov-r-base">R$ 366,4 mi</div></div>
                <div className="res-cell"><div className="l">Meu Cenário</div><div className="n v-blue" id="ov-r-meu">R$ 366,4 mi</div></div>
                <div className="res-cell"><div className="l">Efeito</div><div className="n v-teal" id="ov-r-efeito">R$ 0,0 mi</div></div>
              </div>
              <div className="pill-row" id="ov-pills">
                <div className="pill" data-preset="conservador">Cenário Conservador</div>
                <div className="pill sel" data-preset="base">Cenário Base</div>
                <div className="pill" data-preset="otimista">Cenário Otimista</div>
              </div>
              <div className="pill-row"><div className="pill save" id="ov-save" style={{ flex: 'none', width: '100%' }}>Salvar Cenário</div></div>
            </div>
          </div>
    
          {/* Row 3 */}
          <div className="grid g-3">
            <div className="card pad">
              <div className="section-title" id="sec-aliquota">ALÍQUOTA DE EQUILÍBRIO</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '8px 0 6px' }}>Alíquota de equilíbrio estimada<br />para manter a receita do cenário-base.</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--blue)', letterSpacing: '-1px' }} id="ov-eq2">18,74%</div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '10px', color: 'var(--muted)' }}>Hipótese atual IBS</div><div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--navy)' }} id="ov-eq-ibs">17,50%</div><div style={{ fontSize: '10px', color: 'var(--coral)', fontWeight: '600' }} id="ov-eq-diff">Diferença<br />+1,29 p.p ↑</div></div>
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: '600', margin: '14px 0 4px' }}>Sensibilidade da receita à alíquota IBS (<span className="yr">2033</span>)</div>
              <div className="chart-box" style={{ height: '150px' }}><canvas id="c-aliquota"></canvas></div>
            </div>
    
            <div className="card pad">
              <div className="section-title" id="sec-mapa">MAPA DE RISCO MUNICIPAL</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '6px 0 10px' }}>Índice de Exposição à Reforma Tributária (<span className="yr">2033</span>)</div>
              <div className="map-wrap">
    <svg className="map-svg" id="risk-map" viewBox="0 0 1000 696.1" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', display: 'block' }}></svg>
    <div className="tip hidden" id="map-tip"></div>
                <div className="map-zoom"><button>+</button><button>−</button></div>
                <div className="map-legend" id="map-legend"></div>
              </div>
            </div>
    
            <div className="card pad">
              <div className="map-info" style={{ margin: '0 0 4px' }}>
                <div className="h" id="ov-map-name">Criciúma - SC</div>
                <div className="risk" id="ov-map-risk">Risco: ALTO</div>
                <div className="r"><span>Impacto <span className="yr">2033</span></span><b style={{ color: 'var(--coral)' }} id="ov-map-pct">-6,6%</b></div>
                <div className="r"><span>Impacto financeiro</span><b style={{ color: 'var(--coral)' }} id="ov-map-fin">- R$ 26,0 mi</b></div>
                <div className="r"><span>Dependência ICMS</span><b>38%</b></div>
                <div className="r"><span>Dependência ISS</span><b>22%</b></div>
                <div className="r"><span>Perfil econômico</span><b>Serviços / Indústria</b></div>
              </div>
              <div className="section-title" id="sec-setores" style={{ marginTop: '16px' }}>COMPOSIÇÃO DA RECEITA COM A REFORMA</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '6px 0 6px' }}><b id="comp-mun-lbl">—</b> · partes da receita por ano (R$ mi). A linha tracejada marca o ano-base.</div>
              <div className="legend" id="comp-cidade-leg" style={{ fontSize: '10px', gap: '10px', marginBottom: '6px' }}></div>
              <div className="chart-box" style={{ height: '190px' }}><canvas id="c-composicao"></canvas></div>
            </div>
          </div>
    
          {/* Row 4: benchmarking + plano + notas */}
          <div className="grid g-bench">
            <div className="card pad">
              <div className="section-head"><div className="section-title" id="sec-bench">BENCHMARKING MUNICIPAL (<span className="yr">2033</span>)</div><span className="mini-link">Comparar por: Impacto percentual ▾</span></div>
              <table className="bench-tbl">
                <thead><tr><th>Município</th><th>Impacto %</th><th>Impacto (R$ mi)</th><th>Alíquota de eq.</th><th>Risco</th><th>Receita per capita</th></tr></thead>
                <tbody id="bench-tbody"></tbody>
              </table>
            </div>
    
            <div className="card pad">
              <div className="section-title" id="sec-plano">PLANO DE AÇÃO MUNICIPAL</div>
              <div className="plan-grid">
                <div className="plan-risk">
                  <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l9 5v6c0 5-4 7-9 7s-9-2-9-7V8z" /></svg></div>
                  <div className="lb">RISCO DE RECEITA</div>
                  <div className="tag" id="plan-risco" style={{ margin: '8px 0' }}>ALTO</div>
                  <div className="im">Impacto estimado:<br /><b id="plan-imp">-6,6% em 2033</b><br /><span id="plan-imp2">(- R$ 26,0 milhões)</span></div>
                </div>
                <div className="plan-actions">
                  <div className="ttl"># Ações recomendadas</div>
                  <ol id="plan-list">
                    <li>Monitorar atividades econômicas de maior exposição (Indústria e Comércio representam 86% do impacto negativo).</li>
                    <li>Avaliar cenários de alíquota e propor estratégia de definição municipal.</li>
                    <li>Acompanhar evolução do consumo no destino e do perfil da economia local.</li>
                    <li>Fortalecer bases econômicas locais e setores de maior valor agregado.</li>
                    <li>Monitorar transição e reavaliar projeções com atualizações normativas.</li>
                  </ol>
                </div>
                <div className="plan-report">
                  <div className="ttl">Relatório executivo</div>
                  <p>Gera um relatório completo com os resultados e recomendações para apresentar ao prefeito, secretários e conselheiros.</p>
                  <button className="btn dark" id="btn-pdf" style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h12l4 4v12H4z" /><path d="M8 12h8M8 16h5" /></svg>Gerar relatório (PDF)</button>
                  <button className="btn" id="btn-share" style={{ width: '100%', justifyContent: 'center' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8h16v-8M12 3v13M8 7l4-4 4 4" /></svg>Compartilhar</button>
                </div>
              </div>
            </div>
    
            <div className="card pad">
              <div className="section-title">NOTAS TÉCNICAS E LEGISLAÇÃO</div>
              <div className="notes-list">
                <div className="note-item"><div className="ni-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h12l4 4v12H4z" /><path d="M8 12h8M8 16h5" /></svg></div><div><b>Notas Técnicas</b><span>Metodologia de cálculo, hipóteses e premissas utilizadas nas projeções.</span></div></div>
                <div className="note-item"><div className="ni-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M5 8l7-5 7 5" /></svg></div><div><b>Legislação aplicada</b><span>EC 132/2023, LC 214/2025 e normas complementares.</span></div></div>
                <div className="note-item"><div className="ni-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div><b>Atualizações normativas</b><span>Acompanhe mudanças que podem impactar as projeções.</span></div></div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px' }}><span className="mini-link" id="lnk-metod2">Ver todas notas e documentos →</span></div>
            </div>
          </div>
    
          {/* ===== Panorama de SC (modelo v2 — gráficos do painel) ===== */}
          <div style={{ marginTop: '20px' }} id="sec-panorama">
            <div className="section-title" style={{ fontSize: '17px', color: 'var(--navy)' }}>PANORAMA DE SANTA CATARINA <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600' }}>· modelo v2 · pela lei</span></div>
            <div className="page-sub">Os 295 municípios no ano selecionado (ano-base na barra do topo). Clique no mapa ou troque o município para ver o detalhe.</div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '12px' }}>
            <div className="card pad">
              <div className="section-title">POR PERFIL ECONÔMICO (<span className="yr">2033</span>)</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 10px' }}>Impacto % da receita somada de cada perfil.</div>
              <div id="pan-perfil"></div>
            </div>
            <div className="card pad">
              <div className="section-title">POR PORTE (<span className="yr">2033</span>)</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 10px' }}>Impacto % da receita somada por porte populacional.</div>
              <div id="pan-porte"></div>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <div className="card pad">
              <div className="section-title">MAIORES PERDAS (<span className="yr">2033</span>)</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 8px' }}>Pelo impacto % em relação à receita sem reforma.</div>
              <ol className="pan-top" id="pan-perdas"></ol>
            </div>
            <div className="card pad">
              <div className="section-title">MAIORES GANHOS (<span className="yr">2033</span>)</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 8px' }}>Pelo impacto % em relação à receita sem reforma.</div>
              <ol className="pan-top" id="pan-ganhos"></ol>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <div className="card pad">
              <div className="section-title">COMPOSIÇÃO DA RECEITA DE SC</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 2px' }}>Partes da receita com reforma, 2026→2096 (R$ bi).</div>
              <div className="legend" id="pan-comp-leg"></div>
              <div className="chart-box" style={{ height: '200px' }}><canvas id="pan-comp"></canvas></div>
            </div>
            <div className="card pad">
              <div className="section-title">DIFERENÇA ANO A ANO — SC</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 2px' }}>Impacto % da receita somada de SC.</div>
              <div className="legend" id="pan-dif-leg"></div>
              <div className="chart-box" style={{ height: '200px' }}><canvas id="pan-dif"></canvas></div>
            </div>
          </div>
        </section>
  );
}
