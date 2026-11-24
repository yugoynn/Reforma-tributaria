/* Estrutura produtiva e encadeamentos.
   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */
export default function Estrutura() {
  return (
    <section id="view-estrutura" className="hidden">
          <div>
            <div className="page-title">ESTRUTURA PRODUTIVA E ENCADEAMENTOS</div>
            <div className="page-sub">Como os setores da economia de <b id="es-mun">—</b> se conectam, geram valor e respondem à alíquota do IBS.</div>
          </div>
    
          <div className="rm-stats es-stats" id="es-stats">
            <div className="rm-stat" style={{ '--c': '#33363d' }}>
              <div className="top"><div className="k">PIB (nominal)<small id="es-k1-s"></small></div>
                <div className="badge b-navy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></svg></div></div>
              <div className="v" id="es-k1">—</div><div className="n" id="es-k1-n"></div>
            </div>
            <div className="rm-stat" style={{ '--c': '#2f4566' }}>
              <div className="top"><div className="k">Valor adicionado (VA)<small id="es-k2-s"></small></div>
                <div className="badge b-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" /></svg></div></div>
              <div className="v" id="es-k2">—</div><div className="n" id="es-k2-n"></div>
            </div>
            <div className="rm-stat" style={{ '--c': '#3d5a45' }}>
              <div className="top"><div className="k">Empregos formais<small id="es-k3-s"></small></div>
                <div className="badge b-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="3" /><path d="M2 21v-2a5 5 0 015-5h4a5 5 0 015 5v2M17 8a3 3 0 100-6M22 21v-2a4 4 0 00-3-3.9" /></svg></div></div>
              <div className="v" id="es-k3">—</div><div className="n" id="es-k3-n"></div>
            </div>
            <div className="rm-stat" style={{ '--c': '#7a5a2e' }}>
              <div className="top"><div className="k">Empresas ativas<small id="es-k4-s"></small></div>
                <div className="badge b-amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18" /></svg></div></div>
              <div className="v" id="es-k4">—</div><div className="n" id="es-k4-n"></div>
            </div>
            <div className="rm-stat" style={{ '--c': '#4b3a6b' }}>
              <div className="top"><div className="k">Índice de encadeamento<small id="es-k5-s"></small></div>
                <div className="badge b-purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></svg></div></div>
              <div className="v" id="es-k5">—</div><div className="n" id="es-k5-n"></div>
            </div>
            <div className="rm-stat" style={{ '--c': '#2f5d57' }}>
              <div className="top"><div className="k">Retenção de valor<small id="es-k6-s"></small></div>
                <div className="badge b-teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg></div></div>
              <div className="v" id="es-k6">—</div><div className="n" id="es-k6-n"></div>
            </div>
          </div>
    
          <div className="es-row">
            <div className="card pad es-flux">
              <div className="es-head">
                <div>
                  <div className="rm-title">Fluxos intersetoriais (compras e vendas entre setores)</div>
                  <p className="rm-sub" id="es-flux-sub">Valores em R$ milhões · compras (para trás) e vendas (para frente) entre os setores.</p>
                </div>
                <span className="es-selo" id="es-selo">—</span>
              </div>
              <div className="es-sankey-wrap" id="es-sankey-wrap">
                <svg id="es-sankey" preserveAspectRatio="xMidYMid meet" aria-label="Fluxos intersetoriais do município"></svg>
                <div className="es-flux-msg hidden" id="es-flux-msg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-7-10a7 7 0 0114 0c0 5.5-7 10-7 10z" /><circle cx="12" cy="11" r="2.5" /></svg>
                  <b>Os fluxos entre setores são calculados por município</b>
                  <span>A matriz insumo-produto é regionalizada para cada um dos 295 municípios; somá-las não representa os fluxos de Santa Catarina. Escolha um município no seletor <b>Município</b> do topo para ver os fornecedores e clientes de cada setor.</span>
                </div>
                <div className="rm-tip hidden" id="es-tip"></div>
              </div>
            </div>
    
            <div className="card pad es-va">
              <div className="rm-title">Distribuição do valor adicionado por setor</div>
              <p className="rm-sub" id="es-va-sub">Participação de cada setor no valor adicionado total do município.</p>
              <div className="es-va-body">
                <div className="rm-donut es-donut"><canvas id="es-donut"></canvas><div className="rm-donut-c"><span>Total</span><b id="es-donut-tot">—</b><span id="es-donut-ano">—</span></div></div>
                <div className="rm-dist-leg es-va-leg" id="es-va-leg"></div>
              </div>
            </div>
          </div>
    
          <div className="card pad es-sens">
            <div className="es-head">
              <div>
                <div className="rm-title">Sensibilidade da receita à alíquota do IBS (<span id="es-sens-ano">2033</span>)</div>
                <p className="rm-sub">Receita com a reforma (pela lei) conforme a alíquota total do IBS · R$ milhões de 2025.</p>
              </div>
              <div className="legend tr-legend sm" id="es-sens-leg"></div>
            </div>
            <div className="es-sens-grid">
              <div className="chart-box es-sens-box"><canvas id="es-sens"></canvas></div>
              <div className="es-figs" id="es-figs"></div>
            </div>
            <div className="es-note" id="es-sens-note"></div>
          </div>
          <div className="es-foot" id="es-foot"></div>
        </section>
  );
}
