#!/usr/bin/env python3
"""
Gera js/dados_benchmark.js (benchmarking municipal, na aba Decomposição Setorial)
a partir do pacote `entrega_front` (v1.1.0+).

Uso:  python3 -I tools/gerar_dados_benchmark.py <pasta entrega_front> js/dados_benchmark.js

Leva, para os 295 municípios e SC (cod 42 em indicadores_municipais):
  • população por ano (serie.populacao; SC = soma) — receita per capita
  • dependência do ICMS e do ISS (ano fiscal), participação de Serviços e Indústria no PIB
  • composição do PIB em 6 setores (pib_pct_*) — radar
  • lista padrão de comparação e as classes de risco (parametros.json)
As receitas com/sem reforma vêm do motor já embutido em js/dados_estrutura.js.
"""
import json, os, sys

src, out = sys.argv[1], sys.argv[2]
par = json.load(open(os.path.join(src, 'global/parametros.json'), encoding='utf-8'))
ind = {x['cod_ibge']: x for x in json.load(open(os.path.join(src, 'global/indicadores_municipais.json'), encoding='utf-8'))}
SETORES = [('Serviços', 'pib_pct_servicos'), ('Indústria', 'pib_pct_industria'), ('Comércio', 'pib_pct_comercio'),
           ('Construção', 'pib_pct_construcao'), ('Agropecuária', 'pib_pct_agropecuaria'), ('Outros', 'pib_pct_outros')]
ANO_FIM = 2078
r4 = lambda v: None if v is None else round(v, 4)

def linha(i, pop):
    return {'nome': i['nome'], 'pop': pop, 'dep_icms': r4(i['dependencia_icms']), 'dep_iss': r4(i['dependencia_iss']),
            'ano_fiscal': i['ano_dado_fiscal'], 'serv': r4(i['participacao_servicos_pib']), 'ind': r4(i['participacao_industria_pib']),
            'ano_va': i['ano_dado_va_setor'], 'pib': [r4(i[k]) for _, k in SETORES]}

mun, anos, pop_sc = {}, None, None
pasta = os.path.join(src, 'municipios')
for f in sorted(os.listdir(pasta)):
    if not f.endswith('.json'): continue
    m = json.load(open(os.path.join(pasta, f), encoding='utf-8'))
    a = m['serie']['anos']; n = a.index(ANO_FIM) + 1; anos = a[:n]
    pop = [int(v) for v in m['serie']['populacao'][:n]]
    pop_sc = pop if pop_sc is None else [x + y for x, y in zip(pop_sc, pop)]
    mun[str(m['cod_ibge'])] = linha(ind[m['cod_ibge']], pop)
sc = linha(ind[42], pop_sc)

dados = {'versao': par['versao_modelo'], 'data_geracao': par['data_geracao'], 'anos': anos,
         'setores_pib': [s for s, _ in SETORES], 'comparacao_padrao': par['padroes']['cods_comparacao'],
         'classes': [{k: c[k] for k in ('codigo', 'rotulo', 'cor', 'min', 'max', 'indice_exposicao')} for c in par['classes_risco']],
         'municipios': mun, 'sc': sc}
with open(out, 'w', encoding='utf-8') as fo:
    fo.write('/* Benchmarking municipal — gerado de entrega_front v%s (%s) por tools/gerar_dados_benchmark.py. */\n'
             % (par['versao_modelo'], par['data_geracao']))
    fo.write('const DADOS_BENCHMARK = '); json.dump(dados, fo, ensure_ascii=False, separators=(',', ':')); fo.write(';\n')
print(f'{len(mun)} municípios + SC, população {anos[0]}–{anos[-1]}; SC pop {anos[0]}: {pop_sc[0]:,} (indicadores: {ind[42]["populacao"]:,}) -> {out}')
