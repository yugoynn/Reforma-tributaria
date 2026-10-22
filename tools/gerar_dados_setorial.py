#!/usr/bin/env python3
"""
Gera js/dados_setorial.js (Tela 4 — Decomposição setorial do impacto) a partir do
pacote `entrega_front` (v1.1.0+), campo municipios/<cod>.json -> impacto_setorial.

Uso:  python3 -I tools/gerar_dados_setorial.py <pasta entrega_front> js/dados_setorial.js

Fórmula do setor (GUIA_FRONT_END / MOTOR_DE_CALCULO, cenário "lei"):
  setor_s = coef_fixo + p*coef_fixo_p + a*coef_a + a*p*coef_ap + recebe_seguro * a*max(0, s0 - p*s1)
O painel usa o consumo local padrão (p = 1), então guardamos só:
  fixo = coef_fixo + coef_fixo_p ;  a = coef_a + coef_ap ;  seg = max(0, s0 - s1) (só no setor que recebe o seguro)
e a receita sem reforma do setor. Anos 2026–2078 (os do seletor "Ano-base").
Conferências: soma dos setores = receita total pela lei, e setor = receita_com_reforma_setor (ponto padrão).
Santa Catarina = soma dos 295 (exata com p = 1).
"""
import json, os, sys

src, out = sys.argv[1], sys.argv[2]
par = json.load(open(os.path.join(src, 'global/parametros.json'), encoding='utf-8'))
a0, p0 = par['padroes']['aliquota_ibs'], par['padroes']['consumo_local']
ANO_FIM = 2078
r3 = lambda v: round(v, 3)

mun, setores, anos, pior_tot, pior_set = {}, None, None, 0.0, 0.0
pasta = os.path.join(src, 'municipios')
for f in sorted(os.listdir(pasta)):
    if not f.endswith('.json'): continue
    m = json.load(open(os.path.join(pasta, f), encoding='utf-8'))
    s = m['serie']; anos_all = s['anos']; n = anos_all.index(ANO_FIM) + 1; anos = anos_all[:n]
    mo = s['motor']; lei = s['padrao']['lei']['receita_com_reforma_real_mi']
    seg = [max(0.0, mo['s0'][i] - p0 * mo['s1'][i]) for i in range(n)]
    st = m['impacto_setorial']; setores = setores or st['setores']
    por = {r['setor']: r for r in st['lei']}
    linhas = []
    for nome in setores:
        r = por[nome]
        fixo = [r['coef_fixo'][i] + p0 * r['coef_fixo_p'][i] for i in range(n)]
        aa = [r['coef_a'][i] + p0 * r['coef_ap'][i] for i in range(n)]
        com = [fixo[i] + a0 * aa[i] + r['recebe_seguro'] * a0 * seg[i] for i in range(n)]
        pior_set = max(pior_set, max(abs(com[i] - r['receita_com_reforma_setor_real_mi'][i]) for i in range(n)))
        linhas.append({'s': nome, 'seg': r['recebe_seguro'], 'sem': [r3(v) for v in r['receita_sem_reforma_setor_real_mi'][:n]],
                       'fixo': [r3(v) for v in fixo], 'a': [r3(v) for v in aa], '_com': com})
    for i in range(n):
        pior_tot = max(pior_tot, abs(sum(l['_com'][i] for l in linhas) - lei[i]))
    for l in linhas: del l['_com']
    mun[str(m['cod_ibge'])] = {'nome': m['nome'], 'setores': linhas, 'segbase': [r3(v) for v in seg]}

if pior_tot > 0.05 or pior_set > 0.05:
    sys.exit(f'ERRO: setores não conferem (total {pior_tot:.4f}, setor {pior_set:.4f} R$ mi)')

# Santa Catarina: soma dos 295
n = len(anos)
sc_set = []
for j, nome in enumerate(setores):
    sc_set.append({'s': nome, 'seg': next(iter(mun.values()))['setores'][j]['seg'],
                   'sem': [r3(sum(x['setores'][j]['sem'][i] for x in mun.values())) for i in range(n)],
                   'fixo': [r3(sum(x['setores'][j]['fixo'][i] for x in mun.values())) for i in range(n)],
                   'a': [r3(sum(x['setores'][j]['a'][i] for x in mun.values())) for i in range(n)]})
sc = {'nome': 'Santa Catarina', 'setores': sc_set, 'segbase': [r3(sum(x['segbase'][i] for x in mun.values())) for i in range(n)]}

# setores: listas de valores por índice -> formato compacto [nome, seg, sem, fixo, a]
def compacto(x): return {'nome': x['nome'], 'segbase': x['segbase'], 'set': [[l['s'], l['seg'], l['sem'], l['fixo'], l['a']] for l in x['setores']]}
dados = {'versao': par['versao_modelo'], 'data_geracao': par['data_geracao'], 'anos': anos, 'setores': setores,
         'aliquota_padrao': a0, 'consumo_local': p0,
         'municipios': {c: compacto(x) for c, x in mun.items()}, 'sc': compacto(sc)}
with open(out, 'w', encoding='utf-8') as fo:
    fo.write('/* Receita por setor (Tela 4) — gerado de entrega_front v%s (%s) por tools/gerar_dados_setorial.py.\n'
             '   Formato por setor: [nome, recebe_seguro, sem_reforma[], fixo[], coef_a[]] (R$ mi de 2025, p = 1). */\n'
             % (par['versao_modelo'], par['data_geracao']))
    fo.write('const DADOS_SETORIAL = '); json.dump(dados, fo, ensure_ascii=False, separators=(',', ':')); fo.write(';\n')
print(f'{len(mun)} municípios + SC, {len(setores)} setores, {anos[0]}–{anos[-1]}; '
      f'soma dos setores = total (dif. máx. {pior_tot:.4f}), setor confere (dif. máx. {pior_set:.4f} R$ mi) -> {out}')
