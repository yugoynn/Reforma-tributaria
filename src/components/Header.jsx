import ASSOCIACOES from '../data/associacoes.js';

/* Barra do topo. Município, ano-base e cenário são preenchidos/controlados pelo motor legado
   (app.js); a Associação é estado do React e filtra o seletor de Município. */
export default function Header({ associacao, onAssociacao }) {
  const ativa = ASSOCIACOES.find((a) => a.sigla === associacao);

  return (
    <div className="topbar">
      <div className="logopng">
        <img className="logogo" src="img/logo-inteligencia-fiscal-branco.png" alt="Inteligência Fiscal de Santa Catarina" />
      </div>
      <div className="filters" id="filters-main">
        <label className={'select real assoc-sel' + (ativa ? ' ativo' : '')} title={ativa ? `${ativa.sigla} — ${ativa.nome}` : 'Filtrar municípios por associação'}>
          <div className="lab">
            Associação
            {ativa && <span className="assoc-qtd">{ativa.municipios.length} municípios</span>}
          </div>
          <select className="val" id="assoc-select" value={associacao} onChange={(e) => onAssociacao(e.target.value)}>
            <option value="">Todas (SC)</option>
            {ASSOCIACOES.map((a) => (
              <option key={a.sigla} value={a.sigla}>
                {a.sigla} — {a.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="select real"><div className="lab">Município</div><select className="val" id="mun-select"></select></label>
        <label className="select real"><div className="lab">Ano-base</div><select className="val" id="ano-select"></select></label>
        <label className="select real" id="scen-wrap"><div className="lab">Cenário</div>
          <select className="val" id="tb-scen-select" defaultValue="conservador">
            <option value="conservador">Cenário Conservador</option>
            <option value="base">Cenário Base</option>
            <option value="otimista">Cenário Otimista</option>
            <option value="custom">Meu Cenário</option>
          </select>
        </label>
        <button className="btn play-btn" id="btn-play" type="button" title="Avança o ano-base a cada segundo para ver os gráficos mudarem">
          <svg className="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 001.5.86l12-7.5a1 1 0 000-1.72l-12-7.5A1 1 0 007 4.5z" /></svg>
          <svg className="i-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4.5" height="16" rx="1.2" /><rect x="13.5" y="4" width="4.5" height="16" rx="1.2" /></svg>
          <span id="btn-play-lbl">Avançar</span>
        </button>
      </div>
      <div className="topbar-actions">
        <img className="tb-logo" src="img/logo-observatorio.png" alt="Observatório de Desenvolvimento Socioeconômico e Inovação — UNESC" />
      </div>
    </div>
  );
}
