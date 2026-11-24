/* Comparação de cenários (legado, fora do menu).
   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */
export default function Comparacao() {
  return (
    <section id="view-comparacao" className="hidden">
          <div>
            <div className="page-title">COMPARAÇÃO DE CENÁRIOS</div>
            <div className="page-sub">Como <b id="cp-mun">—</b> se sai nos cenários econômicos <b>Conservador</b>, <b>Base</b> e <b>Otimista</b>, pelo modelo v2 (dados 2015–2096). Troque o município na barra do topo.</div>
          </div>
    
          {/* controles */}
          <div className="card pad cp-controls">
            <div className="cp-ctl">
              <label>Ano da análise</label>
              <div className="cp-chips" id="cp-years"></div>
            </div>
            <div className="cp-ctl">
              <label>Comparar a receita com</label>
              <div className="cp-seg" id="cp-comp">
                <button data-v="lei" className="on">Pela lei</button>
                <button data-v="final">Regra final (só consumo)</button>
              </div>
            </div>
            <div className="cp-ctl">
              <label>Projeção sem reforma</label>
              <div className="cp-seg" id="cp-proj">
                <button data-v="tendencia" className="on">Tendência</button>
                <button data-v="brasil">Ritmo do Brasil</button>
              </div>
            </div>
            <div className="cp-ctl grow">
              <label>Alíquota de referência do IBS — <b id="cp-aliq-val">17,5%</b></label>
              <input type="range" id="cp-aliq" className="range" min="15" max="22" step="0.1" defaultValue="17.5" />
            </div>
            <div className="cp-ctl grow">
              <label>Consumo local — <b id="cp-loc-val">100%</b></label>
              <input type="range" id="cp-loc" className="range" min="80" max="120" step="1" defaultValue="100" />
            </div>
            <div className="cp-ctl">
              <label>Gráficos até</label>
              <div className="cp-seg" id="cp-horizon">
                <button data-v="2050">2050</button>
                <button data-v="2096" className="on">2096</button>
              </div>
            </div>
            <button className="btn" id="cp-reset" style={{ alignSelf: 'flex-end' }}>↺ Padrão</button>
          </div>
    
          {/* 3 cards de cenário */}
          <div className="cp-scen-cards" id="cp-cards"></div>
    
          {/* trajetória */}
          <div className="card pad">
            <div className="section-title">RECEITA COM A REFORMA — 3 CENÁRIOS (<span className="cp-metric">pela lei</span>)</div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 2px' }}>Receita municipal projetada, R$ milhões. Linha tracejada = sem reforma (cenário base).</div>
            <div className="legend" id="cp-legend"></div>
            <div className="chart-box" style={{ height: '340px' }}><canvas id="cp-chart-traj"></canvas></div>
          </div>
    
          <div className="of-grid">
            {/* 4 efeitos */}
            <div className="card pad">
              <div className="section-title">O QUE EXPLICA A DIFERENÇA — CENÁRIO <span id="cp-ef-cen">BASE</span> (<span className="cp-yr-lbl">2033</span>)</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 10px' }}>Os quatro efeitos somam a diferença total entre com e sem reforma (R$ milhões).</div>
              <div id="cp-efeitos"></div>
            </div>
            {/* impacto por cenario ao longo do tempo */}
            <div className="card pad">
              <div className="section-title">IMPACTO % AO LONGO DO TEMPO</div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 2px' }}>Impacto da reforma sobre a receita, por cenário (%).</div>
              <div className="chart-box" style={{ height: '300px' }}><canvas id="cp-chart-imp"></canvas></div>
            </div>
          </div>
    
          {/* tabela anos-chave */}
          <div className="card pad">
            <div className="section-title">ANOS-CHAVE — IMPACTO POR CENÁRIO</div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '4px 0 8px' }}>Receita com reforma (R$ mi) e variação vs. sem reforma, em cada cenário.</div>
            <table className="of-tbl cp-table"><thead><tr><th>Ano</th>
              <th>Conservador</th><th>Var.</th>
              <th>Base</th><th>Var.</th>
              <th>Otimista</th><th>Var.</th></tr></thead>
              <tbody id="cp-table"></tbody></table>
          </div>
        </section>
  );
}
