/* Decomposição setorial do impacto.
   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */
export default function Setorial() {
  return (
    <section id="view-setorial" className="hidden">
          <div className="ds-top">
            <div>
              <div className="page-title">DECOMPOSIÇÃO SETORIAL DO IMPACTO (<span className="yr">2033</span>)</div>
              <div className="page-sub">Entenda quais setores econômicos explicam o ganho ou a perda de receita com a Reforma Tributária · <b id="ds-escopo">—</b></div>
              <div className="ano-aviso hidden" id="ds-ano-aviso"></div>
            </div>
            <label className="ds-ver">Ver por
              <select id="ds-modo">
                <option value="rs">Impacto financeiro (R$)</option>
                <option value="pp">Contribuição em p.p. do impacto %</option>
              </select>
            </label>
          </div>
    
          <div className="ds-row1">
            <div className="card pad ds-card">
              <div className="rm-title">Contribuição setorial para o impacto (<span className="yr">2033</span>)</div>
              <p className="rm-sub" id="ds-wf-sub">Impacto financeiro de cada setor na arrecadação · R$ milhões de 2025.</p>
              <div className="legend tr-legend sm"><span><i style={{ background: '#7a3b35' }}></i>Perda</span><span><i style={{ background: '#3d5a45' }}></i>Ganho</span><span><i style={{ background: '#33363d' }}></i>Total</span></div>
              <div className="chart-box ds-wf-box"><canvas id="ds-wf"></canvas></div>
            </div>
            <div className="card pad ds-card">
              <div className="rm-title">Impacto por setor (<span className="yr">2033</span>)</div>
              <p className="rm-sub">Receita sem e com a reforma (pela lei), por setor econômico · R$ milhões de 2025.</p>
              <div className="ds-tbl-wrap"><table className="ds-tbl"><thead><tr><th>Setor econômico</th><th>Sem reforma<br /><small><span className="yr">2033</span></small></th><th>Com reforma<br /><small><span className="yr">2033</span></small></th><th className="c">Impacto financeiro (R$ mi)</th><th>Impacto %</th></tr></thead><tbody id="ds-tbody"></tbody></table></div>
            </div>
          </div>
    
          <div className="ds-row2">
            <div className="card pad ds-card">
              <div className="rm-title">Participação dos setores na receita (<span className="yr">2033</span>)</div>
              <p className="rm-sub">Composição da arrecadação com a reforma, por setor.</p>
              <div className="ds-donut-body">
                <div className="rm-donut ds-donut"><canvas id="ds-donut"></canvas><div className="rm-donut-c"><b id="ds-donut-tot">—</b><span>Receita com reforma</span><span id="ds-donut-ano">—</span></div></div>
                <div className="rm-dist-leg ds-leg" id="ds-leg"></div>
              </div>
            </div>
            <div className="card pad ds-card">
              <div className="es-head">
                <div>
                  <div className="rm-title">Evolução do impacto por setor</div>
                  <p className="rm-sub" id="ds-evo-sub">Contribuição de cada setor para o impacto, ano a ano · R$ milhões de 2025.</p>
                </div>
                <div className="legend tr-legend sm" id="ds-evo-leg"></div>
              </div>
              <div className="chart-box ds-evo-box"><canvas id="ds-evo"></canvas></div>
            </div>
          </div>
          <div className="es-foot" id="ds-foot"></div>
    
        </section>
  );
}
