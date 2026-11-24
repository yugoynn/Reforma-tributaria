/* Simulador oficial IBS (legado, fora do menu).
   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */
export default function Oficial() {
  return (
    <section id="view-oficial" className="hidden">
          <div>
            <div className="page-title">SIMULADOR OFICIAL (IBS)</div>
            <div className="page-sub">Cálculo de referência do <b>Guia do dados_reforma.json</b> — reproduz a tabela de conferência para qualquer um dos 295 municípios de SC, de 2013 a 2096 (2079–2096 estendidos a partir do modelo v2).</div>
          </div>
    
          <div className="of-grid">
            {/* Entradas */}
            <div className="card pad">
              <div className="section-title">ENTRADAS DO SIMULADOR</div>
              <div className="of-inputs">
                <div className="of-in"><label>Município</label><div className="of-static" id="of-mun">—</div></div>
                <div className="of-in"><label>Ano</label><div className="of-static" id="of-ano">—</div></div>
                <div className="of-in wide">
                  <label>Alíquota do IBS total <span className="q" title="A alíquota-cheia do IBS. O Comitê Gestor estima ~18,7%.">ⓘ</span></label>
                  <div className="of-ibs">
                    <input type="range" id="of-ibs" className="range" min="10" max="25" step="0.1" defaultValue="18.7" data-fill />
                    <div className="of-ibs-val"><b id="of-ibs-val">18,7</b>%</div>
                  </div>
                  <div className="ticks"><span>10%</span><span>15%</span><span>18,7%</span><span>20%</span><span>25%</span></div>
                </div>
                <div className="of-in wide">
                  <div className="of-split">
                    <div><span>Municipal (17%)</span><b id="of-am">3,18%</b></div>
                    <div><span>Estadual (83%)</span><b id="of-ae">15,52%</b></div>
                    <label className="of-manual"><input type="checkbox" id="of-manual" /> Ajustar alíquotas manualmente</label>
                  </div>
                  <div className="of-manual-box hidden" id="of-manual-box">
                    <div className="of-in"><label>Alíquota municipal (%)</label><input type="number" id="of-am-in" step="0.01" defaultValue="3.18" /></div>
                    <div className="of-in"><label>Alíquota estadual (%)</label><input type="number" id="of-ae-in" step="0.01" defaultValue="15.52" /></div>
                  </div>
                </div>
                <div className="of-in wide">
                  <label className="of-seg-inline"><input type="checkbox" id="of-seguro" /> Seguro-receita ligado <span className="q" title="Desconta os 5% do IBS-destino que vão para o fundo do seguro-receita.">ⓘ</span></label>
                </div>
              </div>
              <div className="of-hint">A base de cálculo (<b>fator_base</b>), as regras de transição e a receita sem reforma vêm do JSON. As alíquotas são as suas hipóteses. <a href="#" id="of-metod">Ver metodologia →</a></div>
            </div>
    
            {/* Resultado */}
            <div className="card pad">
              <div className="section-title">RESULTADO</div>
              <div className="of-kpis">
                <div className="of-kpi"><div className="k">Receita COM reforma</div><div className="v v-blue" id="of-com">—</div></div>
                <div className="of-kpi"><div className="k">Receita SEM reforma</div><div className="v v-navy" id="of-sem">—</div></div>
                <div className="of-kpi"><div className="k">Variação</div><div className="v" id="of-var">—</div></div>
                <div className="of-kpi"><div className="k">Alíquota de equilíbrio</div><div className="v v-blue" id="of-eq">—</div></div>
                <div className="of-kpi"><div className="k">Receita per capita</div><div className="v" id="of-pc">—</div></div>
                <div className="of-kpi"><div className="k">Risco</div><div className="tag" id="of-risco" style={{ marginTop: '8px' }}>—</div></div>
              </div>
              <div className="of-note" id="of-tipo"></div>
            </div>
          </div>
    
          {/* parcelas + intermediários */}
          <div className="of-grid">
            <div className="card pad">
              <div className="section-title">AS TRÊS PARCELAS DA RECEITA</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 10px' }}>Legado + Histórica + Destino = receita com reforma (R$ milhões)</div>
              <div className="of-bar" id="of-bar"></div>
              <table className="of-tbl" style={{ marginTop: '12px' }}>
                <tbody id="of-parcelas"></tbody>
              </table>
            </div>
            <div className="card pad">
              <div className="section-title">VALORES INTERMEDIÁRIOS (PASSO A PASSO)</div>
              <table className="of-tbl" style={{ marginTop: '10px' }}><tbody id="of-inter"></tbody></table>
            </div>
          </div>
    
          {/* trajetória */}
          <div className="card pad">
            <div className="section-title">TRAJETÓRIA DA RECEITA 2013–2096</div>
            <div className="legend" style={{ marginTop: '8px' }}>
              <span><i className="line" style={{ borderTopColor: '#64748b' }}></i>Sem reforma</span>
              <span><i className="solid" style={{ background: '#2f4566' }}></i>Com reforma (com seguro)</span>
              <span><i className="line" style={{ borderTopColor: '#3d5a45' }}></i>Com reforma (sem seguro / destino pleno)</span>
            </div>
            <div className="chart-box" style={{ height: '320px' }}><canvas id="of-chart"></canvas></div>
            <div className="note"><span>ⓘ</span>Valores nominais (o JSON cresce ~2% real + 3,5% de IPCA ao ano). As alíquotas de referência ficam fixas; mudar o IBS não altera o fator_base.</div>
          </div>
    
          {/* conferência */}
          <div className="card pad">
            <div className="section-head"><div className="section-title">TABELA DE CONFERÊNCIA</div><span className="mini-link" id="of-conf-mun">—</span></div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 8px' }}>Receita para 3 alíquotas × 3 anos, como na seção 7 do Guia (R$ milhões).</div>
            <table className="of-tbl conf"><thead><tr><th>IBS total</th><th>Mun / Est</th><th>Ano</th><th>Sem reforma</th><th>Com reforma</th><th>Variação</th><th>Com seguro</th></tr></thead><tbody id="of-conf"></tbody></table>
          </div>
    
          {/* ranking */}
          <div className="card pad">
            <div className="section-head"><div className="section-title">RANKING DOS 295 MUNICÍPIOS</div>
              <div className="of-rank-ctl">
                <input type="text" id="of-search" placeholder="Buscar município…" />
                <select id="of-sort"><option value="var-desc">Maior variação %</option><option value="var-asc">Menor variação %</option><option value="imp-desc">Maior impacto R$</option><option value="imp-asc">Menor impacto R$</option><option value="nome">Nome (A–Z)</option></select>
              </div>
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 8px' }}>Para o ano e o IBS selecionados acima. <b id="of-sc-total"></b></div>
            <table className="of-tbl rank"><thead><tr><th>#</th><th>Município</th><th>Sem reforma (mi)</th><th>Com reforma (mi)</th><th>Impacto (mi)</th><th>Variação</th><th>Risco</th><th>Alíq. eq.</th></tr></thead><tbody id="of-rank"></tbody></table>
            <div className="tbl-foot"><span className="mini-link" id="of-rank-more">Mostrar todos os 295 →</span></div>
          </div>
        </section>
  );
}
