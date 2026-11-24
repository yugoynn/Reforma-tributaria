import { memo, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Overview from './views/Overview.jsx';
import MapaRisco from './views/MapaRisco.jsx';
import Transicao from './views/Transicao.jsx';
import Estrutura from './views/Estrutura.jsx';
import Setorial from './views/Setorial.jsx';
import Benchmark from './views/Benchmark.jsx';
import Investimento from './views/Investimento.jsx';
import Metodologia from './views/Metodologia.jsx';
import Simulador from './views/Simulador.jsx';
import Oficial from './views/Oficial.jsx';
import Comparacao from './views/Comparacao.jsx';
import ModalMetodologia from './views/ModalMetodologia.jsx';
import ASSOCIACOES from './data/associacoes.js';
import loadLegacy from './legacy/loadLegacy.js';
import { aplicarAssociacao, instalarGanchos } from './legacy/associacao.js';

/* Corpo estático (menu + telas). memo: nunca re-renderiza, para não disputar o DOM
   com os motores legados, que preenchem gráficos, tabelas e mapas por id. */
const Corpo = memo(function Corpo() {
  return (
    <>
      <div className="below">
        <Sidebar />
        <main className="content">
          <Overview />
          <Estrutura />
          <Setorial />
          <Investimento />
          <Benchmark />
          <Metodologia />
          <Transicao />
          <MapaRisco />
          <Simulador />
          <Oficial />
          <Comparacao />
        </main>
      </div>
      <ModalMetodologia />
    </>
  );
});

export default function App() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(null);
  const [associacao, setAssociacao] = useState('');

  useEffect(() => {
    loadLegacy()
      .then(() => {
        instalarGanchos(() => setAssociacao(''));
        setPronto(true);
      })
      .catch((e) => setErro(e.message));
  }, []);

  useEffect(() => {
    if (!pronto) return;
    aplicarAssociacao(ASSOCIACOES.find((a) => a.sigla === associacao) || null);
  }, [pronto, associacao]);

  return (
    <>
      <Header associacao={associacao} onAssociacao={setAssociacao} />
      <Corpo />
      {!pronto && (
        <div className={'carregando' + (erro ? ' erro' : '')}>
          <img src="favicon.png" alt="" />
          {erro ? `Erro ao carregar o simulador: ${erro}` : 'Carregando dados dos 295 municípios…'}
        </div>
      )}
    </>
  );
}
