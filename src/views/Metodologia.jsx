/* Metodologia, dados e legislação.
   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */
export default function Metodologia() {
  return (
    <section id="view-metodologia" className="hidden">
          <div>
            <div className="page-title">METODOLOGIA, DADOS E LEGISLAÇÃO</div>
            <div className="page-sub">Entenda como os cálculos são feitos, quais dados são utilizados e a base legal da Reforma Tributária.</div>
          </div>
    
          <div className="mt-full">
            <div className="card pad mt-card">
              <div className="rm-title">Como funciona o simulador</div>
              <p className="rm-sub">Fluxo simplificado do cálculo do impacto da Reforma Tributária.</p>
              <div className="mt-fluxo" id="mt-fluxo"></div>
            </div>
          </div>
          <div className="mt-row3">
            <div className="card pad mt-card">
              <div className="rm-title">Premissas gerais utilizadas</div>
              <ul className="mt-lista" id="mt-premissas"></ul>
              <button className="btn rm-foot-btn" id="mt-premissas-more" type="button">Ver todas as premissas →</button>
            </div>
            <div className="card pad mt-card">
              <div className="rm-title">Limitações do modelo</div>
              <ul className="mt-lista lim" id="mt-limitacoes"></ul>
              <button className="btn rm-foot-btn" id="mt-limitacoes-more" type="button">Entenda as limitações →</button>
            </div>
            <div className="card pad mt-card">
              <div className="rm-title">Histórico de versões do modelo</div>
              <p className="rm-sub">Acompanhe as versões e melhorias.</p>
              <div className="mt-versoes" id="mt-versoes"></div>
            </div>
          </div>
          <div className="mt-row2">
            <div className="card pad mt-card">
              <div className="rm-title">Bases de dados utilizadas</div>
              <p className="rm-sub">Principais bases públicas integradas ao modelo.</p>
              <div className="ds-tbl-wrap"><table className="mt-fontes"><thead><tr><th>Fonte</th><th>Descrição</th><th>Período de referência</th><th>Atualização</th><th>Cobertura</th><th></th></tr></thead><tbody id="mt-fontes"></tbody></table></div>
            </div>
            <div className="card pad mt-card">
              <div className="rm-title">Documentos e publicações</div>
              <p className="rm-sub">Documentos técnicos e notas metodológicas do modelo. Clique para ler.</p>
              <div className="mt-docs" id="mt-docs"></div>
            </div>
          </div>
          <div className="mt-full">
            <div className="card pad mt-card">
              <div className="rm-title">Metodologia de cálculo</div>
              <p className="rm-sub">O modelo segue as etapas abaixo para estimar o impacto da Reforma Tributária.</p>
              <div className="mt-etapas" id="mt-etapas"></div>
              <button className="btn rm-foot-btn" id="mt-metod-doc" type="button">Ver metodologia completa (documento técnico) →</button>
            </div>
          </div>
    
          <div className="mt-aviso"><span className="ni">ⓘ</span><span>Este simulador é uma ferramenta de apoio à gestão fiscal e ao planejamento estratégico dos municípios. As projeções não substituem o planejamento fiscal municipal.</span><span className="mt-ver" id="mt-ver"></span></div>
        </section>
  );
}
