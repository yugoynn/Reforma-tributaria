#!/usr/bin/env python3
"""
Gera js/dados_investimento.js (aba Simulador de Investimento — calculadora T3.5)
a partir do pacote `entrega_front` (v1.1.0+).

Uso:  python3 -I tools/gerar_dados_investimento.py <pasta entrega_front> js/dados_investimento.js

Leva:
  • parametros.param_transicao (retenção, seguro, fase do IBS, fator ICMS/ISS por ano),
    fracao_municipal (phi) e os padrões do slider de investimento
  • motor_cenarios.json: w_cota_ibs e coef_retido de cada município
  • municipios/<cod>.json -> investimento: coeficientes por R$ 1 dos 6 setores e 67 atividades
As receitas base (coeficientes do motor) já estão em js/dados_estrutura.js.
"""
import json, os, sys

src, out = sys.argv[1], sys.argv[2]
par = json.load(open(os.path.join(src, 'global/parametros.json'), encoding='utf-8'))
mc = json.load(open(os.path.join(src, 'global/motor_cenarios.json'), encoding='utf-8'))
por_cod = {m['cod_ibge']: m for m in mc['municipios']}
CAMPOS = ['producao_local_mult', 'va_local_mult', 'va_vazado_mult', 'salarios_mult', 'empregos_por_mi',
          'consumo_familias_mult', 'base_ibs_mult', 'receita_sem_reforma_mult']
pt = par['param_transicao']
trans = {k: [r[k] for r in pt] for k in ('ano', 'retencao', 'seguro_pct', 'fase_ibs', 'fator_icms_iss')}

mun, setores_meta, atv_meta = {}, None, None
pasta = os.path.join(src, 'municipios')
for f in sorted(os.listdir(pasta)):
    if not f.endswith('.json'): continue
    m = json.load(open(os.path.join(pasta, f), encoding='utf-8'))
    inv = m['investimento']
    if setores_meta is None:
        setores_meta = [[s['codigo'], s['descricao'], s['setor6']] for s in inv['setores']]
        atv_meta = [[a['codigo'], a['descricao'], a['setor6']] for a in inv['atividades']]
    assert [s['codigo'] for s in inv['setores']] == [x[0] for x in setores_meta]
    assert [a['codigo'] for a in inv['atividades']] == [x[0] for x in atv_meta]
    g = por_cod[m['cod_ibge']]
    mun[str(m['cod_ibge'])] = {
        'iss': inv['aliquota_iss_efetiva'], 'w': g['w_cota_ibs'], 'cr': g['coef_retido'],
        'set': [[s[c] for c in CAMPOS] for s in inv['setores']],
        'atv': [[a[c] for c in CAMPOS] for a in inv['atividades']],
    }
tx = json.load(open(os.path.join(src, 'docs/textos.json'), encoding='utf-8')).get('investimento', {})
dados = {'texto': tx.get('texto'), 'versao': par['versao_modelo'], 'data_geracao': par['data_geracao'], 'campos': CAMPOS, 'phi': par['fracao_municipal'],
         'aliquota_padrao': par['padroes']['aliquota_ibs'], 'consumo_local': par['padroes']['consumo_local'],
         'slider_x': par['investimento']['slider_x'], 'nota_comercio': par['investimento'].get('nota_comercio'),
         'propensao_consumo': par['investimento'].get('propensao_consumo'),
         'trans': trans, 'setores': setores_meta, 'atividades': atv_meta, 'municipios': mun}
with open(out, 'w', encoding='utf-8') as fo:
    fo.write('/* Calculadora de investimento — gerado de entrega_front v%s (%s) por tools/gerar_dados_investimento.py. */\n'
             % (par['versao_modelo'], par['data_geracao']))
    fo.write('const DADOS_INVESTIMENTO = '); json.dump(dados, fo, ensure_ascii=False, separators=(',', ':')); fo.write(';\n')
print(f'{len(mun)} municípios, {len(setores_meta)} setores, {len(atv_meta)} atividades, transição {trans["ano"][0]}–{trans["ano"][-1]} -> {out}')
