/* Simulador de impulsionamento.
   Marcação estática; o conteúdo é preenchido pelos motores em public/legacy/js. */
export default function Investimento() {
  return (
    <section id="view-investimento" className="hidden">
          <div>
            <div className="page-title">SIMULADOR DE IMPULSIONAMENTO</div>
            <div className="page-sub">Se <b id="iv-mun">—</b> atrair um investimento em um setor, quanto volta de receita para a prefeitura — sem reforma, pela lei e só pelo consumo?</div>
          </div>
    
          <div className="iv-row1">
            <div className="rm-stat iv-ctrl" style={{ '--c': '#2c0e5e' }}>
              <div className="top"><div className="k" style={{ color: '#2c0e5e' }}>Simule o impulsionamento<small>Vendas finais novas, mantidas todos os anos</small></div>
                <div className="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5h3.75a1.75 1.75 0 010 3.5h-2.5a1.75 1.75 0 000 3.5H15" /></svg></div></div>
              <div className="iv-f iv-f-mun hidden" id="iv-mun-wrap"><label htmlFor="iv-mun-sel">Município</label><select id="iv-mun-sel"></select></div>
              <div className="iv-f">
                <div className="iv-lab-row"><label id="iv-alvo-lab">Setor</label><div className="cp-seg iv-seg" id="iv-nivel"><button data-n="set" className="on">Setor (6)</button><button data-n="atv">Atividade (67)</button></div></div>
                <div className="iv-boxes" id="iv-boxes" role="radiogroup" aria-labelledby="iv-alvo-lab"></div>
                <select id="iv-alvo" className="hidden" aria-labelledby="iv-alvo-lab"></select>
              </div>
              <div className="iv-f">
                <label htmlFor="iv-x">Impulsionamento <span id="iv-x-alvo">no setor</span> <small>(R$ milhões por ano)</small></label>
                <div className="iv-x-row"><input type="range" id="iv-x-range" /><div className="iv-x-num"><span>R$</span><input type="number" id="iv-x" /><span>mi</span></div></div>
              </div>
              <div className="iv-f iv-f-ano"><label htmlFor="iv-ini">A partir do ano</label><select id="iv-ini"></select></div>
            </div>
            <div className="rm-stat iv-rec" style={{ '--c': '#5b6270' }}>
              <div className="top"><div className="k" style={{ color: '#5b6270' }}>Sem reforma<small>Receita adicional em <span className="yr">2033</span></small></div><div className="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></svg></div></div>
              <div className="v" id="iv-sem">—</div>
              <div className="n" id="iv-sem-pct"></div>
              <div className="iv-cmpv" id="iv-sem-cmp"></div>
              <div className="iv-bars" id="iv-sem-bars"></div>
              <div className="iv-acc" id="iv-sem-acc"></div>
            </div>
            <div className="rm-stat iv-rec" style={{ '--c': '#2c0e5e' }}>
              <div className="top"><div className="k" style={{ color: '#2c0e5e' }}>Pela lei<small>Receita adicional em <span className="yr">2033</span></small></div><div className="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M5 7h14M5 7l-3 7a3 3 0 006 0zM19 7l-3 7a3 3 0 006 0zM8 21h8" /></svg></div></div>
              <div className="v" id="iv-lei">—</div>
              <div className="n" id="iv-lei-pct"></div>
              <div className="iv-cmpv" id="iv-lei-cmp"></div>
              <div className="iv-bars" id="iv-lei-bars"></div>
              <div className="iv-acc" id="iv-lei-acc"></div>
            </div>
            <div className="rm-stat iv-rec" style={{ '--c': '#2f5d57' }}>
              <div className="top"><div className="k" style={{ color: '#2f5d57' }}>Só pelo consumo<small>Receita adicional em <span className="yr">2033</span></small></div><div className="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" /></svg></div></div>
              <div className="v" id="iv-cs">—</div>
              <div className="n" id="iv-cs-pct"></div>
              <div className="iv-cmpv" id="iv-cs-cmp"></div>
              <div className="iv-bars" id="iv-cs-bars"></div>
              <div className="iv-acc" id="iv-cs-acc"></div>
            </div>
          </div>
    
          <div className="iv-row2">
            <div className="card pad iv-card">
              <div className="es-head">
                <div>
                  <div className="rm-title">Receita adicional por ano</div>
                  <p className="rm-sub" id="iv-evo-sub">—</p>
                </div>
                <div className="legend tr-legend sm"><span><i className="dash" style={{ borderTopColor: '#9aa6b2' }}></i>Sem reforma</span><span><i style={{ background: '#2c0e5e' }}></i>Pela lei</span><span><i style={{ background: '#2f5d57' }}></i>Só pelo consumo</span></div>
              </div>
              <div className="chart-box iv-evo-box"><canvas id="iv-evo"></canvas></div>
              <div className="iv-note" id="iv-evo-note"></div>
            </div>
            <div className="iv-efx">
              <div className="rm-stat iv-stat" style={{ '--c': '#33363d' }}>
                <div className="top"><div className="k">Produção local</div><div className="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V10l5 3V10l5 3V10l5 3V4h3v17z" /></svg></div></div>
                <div className="v" id="iv-prod">—</div><div className="n" id="iv-prod-n"></div>
              </div>
              <div className="rm-stat iv-stat" style={{ '--c': '#3d5a45' }}>
                <div className="top"><div className="k">Valor adicionado local</div><div className="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg></div></div>
                <div className="v" id="iv-va">—</div><div className="n" id="iv-va-n"></div>
              </div>
              <div className="rm-stat iv-stat" style={{ '--c': '#7a3b35' }}>
                <div className="top"><div className="k">VA que sai do município</div><div className="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" /></svg></div></div>
                <div className="v" id="iv-out">—</div><div className="n" id="iv-out-n"></div>
              </div>
              <div className="rm-stat iv-stat" style={{ '--c': '#4b3a6b' }}>
                <div className="top"><div className="k">Salários</div><div className="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 10v4M18 10v4" /></svg></div></div>
                <div className="v" id="iv-sal">—</div><div className="n" id="iv-sal-n"></div>
              </div>
              <div className="rm-stat iv-stat" style={{ '--c': '#2f4566' }}>
                <div className="top"><div className="k">Empregos</div><div className="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 010 7M18.5 14.8c1.7.8 2.7 2.5 3 5.2" /></svg></div></div>
                <div className="v" id="iv-emp">—</div><div className="n" id="iv-emp-n"></div>
              </div>
              <div className="rm-stat iv-stat" style={{ '--c': '#7a5a2e' }}>
                <div className="top"><div className="k">Consumo das famílias</div><div className="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6h15l-1.5 9H8L6 3H3" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg></div></div>
                <div className="v" id="iv-cons">—</div><div className="n" id="iv-cons-n"></div>
              </div>
            </div>
          </div>
    
          <div className="iv-row3">
            <div className="card pad iv-card">
              <div className="rm-title">Valor adicionado por setor</div>
              <p className="rm-sub" id="iv-va-sub">—</p>
              <div className="iv-va-body">
                <div className="rm-donut iv-donut"><canvas id="iv-donut"></canvas><div className="rm-donut-c"><b id="iv-donut-pct">—</b><span id="iv-donut-lab">—</span></div></div>
                <div className="rm-dist-leg iv-leg" id="iv-va-leg"></div>
              </div>
            </div>
            <div className="card pad iv-card">
              <div className="es-head">
                <div>
                  <div className="rm-title">Qual setor devolve mais receita? (<span className="yr"></span>)</div>
                  <p className="rm-sub" id="iv-cmp-sub">—</p>
                </div>
                <div className="legend tr-legend sm"><span><i style={{ background: '#c3cad3' }}></i>Sem reforma</span><span><i style={{ background: '#2c0e5e' }}></i>Pela lei</span><span><i style={{ background: '#2f5d57' }}></i>Só pelo consumo</span></div>
              </div>
              <div className="chart-box iv-cmp-box"><canvas id="iv-cmp"></canvas></div>
            </div>
          </div>
          <div className="es-foot" id="iv-foot"></div>
        </section>
  );
}
