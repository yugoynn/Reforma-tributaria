/* Simulador de cenários (legado, fora do menu).
   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */
export default function Simulador() {
  return (
    <section id="view-simulator" className="hidden">
          <div>
            <div className="page-title">SIMULADOR DE CENÁRIOS</div>
            <div className="page-sub">Altere os parâmetros abaixo e veja o impacto estimado da Reforma Tributária até <span className="yr">2033</span>.</div>
          </div>
    
          <div className="sim-layout">
            <div className="sim-left">
            {/* params */}
            <div className="card pad">
              <div className="section-head">
                <div className="section-title">PARÂMETROS DO CENÁRIO</div>
                <span className="mini-link">Entenda os parâmetros ⓘ</span>
              </div>
              <div className="params-grid">
                <div className="param">
                  <div className="head"><span className="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg></span>Crescimento econômico anual<span className="q">ⓘ</span></div>
                  <div className="value" data-out="eco">2,5%</div>
                  <input className="range" type="range" min="-1" max="6" step="0.1" defaultValue="2.5" data-fill data-out-target="eco" data-suffix="%" data-key="eco" />
                  <div className="ticks"><span>-1%</span><span>0%</span><span>2%</span><span>4%</span><span>6%</span></div>
                </div>
                <div className="param">
                  <div className="head"><span className="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6h15l-1.5 9H8L6 3H3" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg></span>Crescimento do consumo anual<span className="q">ⓘ</span></div>
                  <div className="value" data-out="cons">3,1%</div>
                  <input className="range" type="range" min="-1" max="6" step="0.1" defaultValue="3.1" data-fill data-out-target="cons" data-suffix="%" data-key="cons" />
                  <div className="ticks"><span>-1%</span><span>0%</span><span>2%</span><span>4%</span><span>6%</span></div>
                </div>
                <div className="param">
                  <div className="head"><span className="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="3" /><path d="M2 21v-2a5 5 0 015-5h4a5 5 0 015 5v2M17 8a3 3 0 100-6" /></svg></span>Crescimento populacional anual<span className="q">ⓘ</span></div>
                  <div className="value" data-out="pop">1,2%</div>
                  <input className="range" type="range" min="-1" max="3" step="0.1" defaultValue="1.2" data-fill data-out-target="pop" data-suffix="%" data-key="pop" />
                  <div className="ticks"><span>-1%</span><span>0%</span><span>1%</span><span>2%</span><span>3%</span></div>
                </div>
                <div className="param">
                  <div className="head"><span className="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="M18 6L6 18" /></svg></span>Alíquota de IBS total (hipótese)<span className="q">ⓘ</span></div>
                  <div className="value" data-out="ibs">18,70%</div>
                  <input className="range" type="range" min="10" max="25" step="0.1" defaultValue="18.7" data-fill data-out-target="ibs" data-suffix="%" data-key="ibs" />
                  <div className="ticks"><span>10%</span><span>15%</span><span>18,7%</span><span>20%</span><span>25%</span></div>
                </div>
                <div className="param">
                  <div className="head"><span className="pic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-7-10a7 7 0 0114 0c0 5.5-7 10-7 10z" /><circle cx="12" cy="11" r="2.5" /></svg></span>Participação do consumo local<span className="q">ⓘ</span></div>
                  <div className="value" data-out="loc">100%</div>
                  <input className="range" type="range" min="80" max="120" step="1" defaultValue="100" data-fill data-out-target="loc" data-suffix="%" data-int data-key="loc" />
                  <div className="ticks"><span>80%</span><span>90%</span><span>100%</span><span>110%</span><span>120%</span></div>
                </div>
              </div>
              <div className="params-actions">
                <span className="more"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></svg>Parâmetros adicionais <span style={{ color: 'var(--muted-2)', fontWeight: '400' }}>Setores, elasticidades e premissas detalhadas ▾</span></span>
                <div className="spacer"></div>
                <button className="btn" id="sim-reset">↺ Redefinir para o cenário base</button>
                <button className="btn dark" id="sim-update">⟳ Atualizar simulação</button>
              </div>
            </div>
    
            <div className="card pad">
            <div className="section-title" style={{ marginBottom: '12px' }}>RESULTADO DA SIMULAÇÃO – <span className="yr">2033</span></div>
            <div className="res-stats">
              <div className="res-stat"><div className="top"><div className="k">Receita projetada <span className="yr">2033</span><small>(com reforma)</small></div><div className="badge b-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V10l7-5 7 5v11" /></svg></div></div><div className="v v-blue" id="sim-com">R$ 366,4 mi</div></div>
              <div className="res-stat"><div className="top"><div className="k">Receita base <span className="yr">2033</span><small>(sem reforma)</small></div><div className="badge b-navy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" /></svg></div></div><div className="v v-navy" id="sim-sem">R$ 388,9 mi</div></div>
              <div className="res-stat"><div className="top"><div className="k">Impacto financeiro<small>(<span className="yr">2033</span>)</small></div><div className="badge b-coral" id="sim-imp-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 17l6-6 4 4 6-8" /></svg></div></div><div className="v v-coral" id="sim-imp">- R$ 26,0 mi</div></div>
              <div className="res-stat"><div className="top"><div className="k">Impacto percentual<small>(<span className="yr">2033</span>)</small></div><div className="badge b-coral"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="M6 18L18 6" /></svg></div></div><div className="v v-coral" id="sim-imp-pct">- 6,6%</div></div>
              <div className="res-stat"><div className="top"><div className="k">Alíquota de equilíbrio<small>(estimada)</small></div><div className="badge b-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M6 7h12M4 11l3-4 3 4a3 3 0 01-6 0zM14 11l3-4 3 4a3 3 0 01-6 0z" /></svg></div></div><div className="v v-blue" id="sim-eq">18,74%</div></div>
              <div className="res-stat"><div className="top"><div className="k">Classificação de risco<small>(exposição à reforma)</small></div><div className="badge b-coral"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l9 5v6c0 5-4 7-9 7s-9-2-9-7V8z" /></svg></div></div><div className="tag" id="sim-risco" style={{ marginTop: '10px' }}>ALTO</div></div>
            </div>
          </div>
            </div>{/* /sim-left */}
    
            {/* scenarios */}
            <div className="card pad">
              <div className="scen-title">CENÁRIOS PRÉ-DEFINIDOS</div>
              <div className="scenarios" id="scen-cards">
                <div className="scen-card" data-preset="conservador">
                  <div className="ic" style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l9 5v6c0 5-4 7-9 7s-9-2-9-7V8z" /></svg></div>
                  <div className="nm">Cenário Conservador</div>
                  <div className="ds">Menor crescimento econômico e de consumo.</div>
                  <div className="ib">IBS total: 17,5%</div>
                </div>
                <div className="scen-card sel" data-preset="base">
                  <div className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5 9-11" /></svg></div>
                  <div className="ic" style={{ background: '#e8eaef', color: 'var(--blue)' }}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 8-8" /></svg></div>
                  <div className="nm">Cenário Base</div>
                  <div className="ds">Parâmetros médios de crescimento.</div>
                  <div className="ib">IBS total: 18,7%</div>
                </div>
                <div className="scen-card" data-preset="otimista">
                  <div className="ic" style={{ background: '#ebe8f0', color: 'var(--purple)' }}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z" /></svg></div>
                  <div className="nm">Cenário Otimista</div>
                  <div className="ds">Maior crescimento econômico e de consumo.</div>
                  <div className="ib">IBS total: 20,0%</div>
                </div>
                <div className="scen-new" id="scen-new">+ Criar meu cenário</div>
              </div>
            </div>
          </div>
    
          {/* evolution + tables */}
          <div className="big-grid">
            <div className="card pad">
              <div className="section-title">EVOLUÇÃO DA RECEITA TOTAL – COMPARATIVO DE CENÁRIOS</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 10px' }}>Valores nominais (R$ milhões)</div>
              <div className="legend">
                <span><i className="line" style={{ borderTopColor: '#7a5a2e' }}></i>Cenário Conservador</span>
                <span><i className="solid" style={{ background: '#2f4566' }}></i>Meu Cenário (atual)</span>
                <span><i className="line" style={{ borderTopColor: '#4b3a6b' }}></i>Cenário Otimista</span>
                <span><i className="line" style={{ borderTopColor: '#64748b' }}></i>Sem reforma (cenário base)</span>
              </div>
              <div className="chart-box" style={{ height: '330px' }}><canvas id="c-evolucao"></canvas></div>
              <div className="note"><span>ⓘ</span>Os resultados são projeções e podem variar conforme mudanças na legislação, na economia e nas bases de dados.</div>
            </div>
    
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="card pad">
                <div className="section-title">COMPARAÇÃO DOS CENÁRIOS – <span className="yr">2033</span></div>
                <table className="cmp-tbl" style={{ marginTop: '10px' }}>
                  <thead><tr><th>Cenário</th><th>Receita <span className="yr">2033</span> (R$ mi)</th><th>Impacto (R$ mi)</th><th>Impacto (%)</th></tr></thead>
                  <tbody id="cmp-tbody"></tbody>
                </table>
              </div>
              <div className="card pad">
                <div className="section-title">SENSIBILIDADE DA RECEITA (<span className="yr">2033</span>)</div>
                <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 8px' }}>Variação da receita total em relação ao cenário atual (R$ milhões)</div>
                <table className="sens-tbl">
                  <thead><tr><th>Variação do parâmetro</th><th>-10%</th><th>-5%</th><th>Base</th><th>+5%</th><th>+10%</th></tr></thead>
                  <tbody id="sens-tbody"></tbody>
                </table>
                <div className="tbl-foot"><span className="mini-link">Ver análise de sensibilidade completa →</span></div>
              </div>
            </div>
          </div>
    
          {/* saved scenarios */}
          <div className="card pad" style={{ marginTop: '16px' }}>
            <div className="section-head"><div className="section-title">MEUS CENÁRIOS SALVOS</div><span className="mini-link">Ver todos →</span></div>
            <div className="saved" id="saved-list"></div>
          </div>
        </section>
  );
}
