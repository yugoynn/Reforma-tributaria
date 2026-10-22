#!/usr/bin/env python3
"""
Gera js/dados_estrutura.js a partir do pacote `entrega_front` (versão 1.1.0+).

Uso:  python3 -I tools/gerar_dados_estrutura.py <pasta entrega_front> js/dados_estrutura.js

Leva só o que a tela "Estrutura Produtiva e Encadeamentos" usa:
  • economia.kpis, economia.va_setor            (T3.1, T3.2)
  • mip: centro, fornecedores, clientes, fonte   (T3.3)
  • serie.motor + receita sem reforma            (T3.4, sensibilidade à alíquota)
e confere o motor: recalcula a receita "pela lei" na alíquota padrão para os
295 municípios x todos os anos e compara com padrao.lei do próprio pacote.
"""
import json, os, sys

src, out = sys.argv[1], sys.argv[2]
par = json.load(open(os.path.join(src, 'global/parametros.json'), encoding='utf-8'))
txt = json.load(open(os.path.join(src, 'docs/textos.json'), encoding='utf-8'))
a0 = par['padroes']['aliquota_ibs']; p0 = par['padroes']['consumo_local']

def r4(v): return None if v is None else round(v, 4)
CAMPOS = ['f_iss', 'f_cota_parte_icms', 'f_teste_cota', 'fp_teste', 'a_retido', 'a_cota', 'ap_destino', 's0', 's1']

mun, anos, pior = {}, None, 0.0
pasta = os.path.join(src, 'municipios')
for f in sorted(os.listdir(pasta)):
    if not f.endswith('.json'): continue
    m = json.load(open(os.path.join(pasta, f), encoding='utf-8'))
    s = m['serie']; anos = anos or s['anos']
    mo = s['motor']; sem = s['sem_reforma']['receita_sem_reforma_real_mi']
    lei = s['padrao']['lei']['receita_com_reforma_real_mi']
    # conferência do motor (MOTOR_DE_CALCULO.md, seção 1)
    for i in range(len(anos)):
        fixo = mo['f_iss'][i] + mo['f_cota_parte_icms'][i] + mo['f_teste_cota'][i]
        rec = fixo + p0 * mo['fp_teste'][i] + a0 * (mo['a_retido'][i] + mo['a_cota'][i]) + a0 * p0 * mo['ap_destino'][i] \
              + a0 * max(0.0, mo['s0'][i] - p0 * mo['s1'][i])
        pior = max(pior, abs(rec - lei[i]))
    e, mip = m['economia'], m['mip']
    mun[str(m['cod_ibge'])] = {
        'nome': m['nome'],
        'perfil': m['perfil'].get('perfil_economico'),
        'kpis': e['kpis'],
        'va': [[x['setor'], r4(x['participacao'])] for x in e['va_setor']],
        'mip': {
            'fonte': mip['mip_fonte'], 'referencia': mip['mip_referencia'],
            'ano_mip': mip['ano_dado_mip'], 'ano_reg': mip['ano_dado_regionalizacao'],
            'centro': mip['centro'],
            'forn': [[x['setor'], r4(x['valor_mi']), x['fonte']] for x in mip['fornecedores']],
            'cli': [[x['setor'], r4(x['valor_mi']), x['fonte']] for x in mip['clientes']],
        },
        'motor': dict({'sem': [r4(v) for v in sem]}, **{k: [r4(v) for v in mo[k]] for k in CAMPOS}),
    }

# ---------------- Santa Catarina (soma dos 295) ----------------
# PIB, VA, empregos e empresas: soma; variações recalculadas pela soma do ano anterior.
# VA por setor: soma de participação x VA de cada município.
# Encadeamento e retenção: média dos municípios ponderada pelo VA (não é a MIP de SC).
# Motor: soma dos coeficientes; com p = 1 o seguro de SC é a * soma(max(0, s0 - s1)) — exato.
# Fluxos intersetoriais: não somados (a MIP é municipal).
series = {}
for f in sorted(os.listdir(pasta)):
    if not f.endswith('.json'): continue
    m = json.load(open(os.path.join(pasta, f), encoding='utf-8'))
    series[str(m['cod_ibge'])] = m['economia']['serie']
def soma_ano(campo, ano):
    t = 0.0
    for sr in series.values():
        for r in sr:
            if r['ano'] == ano and r.get(campo) is not None: t += r[campo]
    return t
k0 = next(iter(mun.values()))['kpis']
ap, av, ar = k0['ano_pib'], k0['ano_va'], k0['ano_rais']
va_tot = sum(x['kpis']['va_corrente_mi'] or 0 for x in mun.values())
pesos = {c: (x['kpis']['va_corrente_mi'] or 0) / va_tot for c, x in mun.items()}
setores = [s_ for s_, _ in next(iter(mun.values()))['va']]
va_set = {s_: sum((dict(x['va']).get(s_) or 0) * (x['kpis']['va_corrente_mi'] or 0) for x in mun.values()) for s_ in setores}
pib, pib0 = soma_ano('pib_corrente_mi', ap), soma_ano('pib_corrente_mi', ap - 1)
emp, emp0 = soma_ano('empregos_formais', ar), soma_ano('empregos_formais', ar - 1)
eps, eps0 = soma_ano('empresas_ativas', ar), soma_ano('empresas_ativas', ar - 1)
enc = sum(pesos[c] * (x['kpis']['indice_encadeamento'] or 0) for c, x in mun.items())
ret = sum(pesos[c] * (x['kpis']['retencao_valor'] or 0) for c, x in mun.items())
n = len(anos)
mot = {k: [round(sum(x['motor'][k][i] for x in mun.values()), 4) for i in range(n)] for k in ['sem'] + CAMPOS if k not in ('s0', 's1')}
mot['s0'] = [round(sum(max(0.0, x['motor']['s0'][i] - x['motor']['s1'][i]) for x in mun.values()), 4) for i in range(n)]
mot['s1'] = [0.0] * n
sc = {
    'nome': 'Santa Catarina', 'perfil': None,
    'kpis': {'pib_corrente_mi': round(pib, 3), 'var_pib_nominal': round(pib / pib0 - 1, 5), 'ano_pib': ap,
             'va_corrente_mi': round(va_tot, 3), 'va_sobre_pib': round(va_tot / soma_ano('pib_corrente_mi', av), 6), 'ano_va': av,
             'empregos_formais': int(emp), 'var_empregos': round(emp / emp0 - 1, 5),
             'empresas_ativas': int(eps), 'var_empresas': round(eps / eps0 - 1, 5), 'ano_rais': ar,
             'indice_encadeamento': round(enc, 4), 'rotulo_encadeamento': None,
             'retencao_valor': round(ret, 6), 'rotulo_retencao': None, 'agregado': True},
    'va': [[s_, round(va_set[s_] / va_tot, 6)] for s_ in setores],
    'mip': None,
    'motor': mot,
}
# conferência: receita de SC = soma das receitas municipais (alíquota padrão, p = 1)
for i in range(n):
    rsc = (mot['f_iss'][i] + mot['f_cota_parte_icms'][i] + mot['f_teste_cota'][i] + p0 * mot['fp_teste'][i]
           + a0 * (mot['a_retido'][i] + mot['a_cota'][i]) + a0 * p0 * mot['ap_destino'][i] + a0 * mot['s0'][i])
    rm = 0.0
    for x in mun.values():
        q = x['motor']
        rm += (q['f_iss'][i] + q['f_cota_parte_icms'][i] + q['f_teste_cota'][i] + p0 * q['fp_teste'][i]
               + a0 * (q['a_retido'][i] + q['a_cota'][i]) + a0 * p0 * q['ap_destino'][i] + a0 * max(0.0, q['s0'][i] - p0 * q['s1'][i]))
    pior = max(pior, abs(rsc - rm) / 10)   # tolerância proporcional ao tamanho (soma de 295 arredondamentos)

if pior > 0.01:
    sys.exit(f'ERRO: motor não confere com padrao.lei (diferença máx. {pior:.4f} R$ mi)')

dados = {
    'versao': par['versao_modelo'], 'data_geracao': par['data_geracao'], 'anos': anos,
    'aliquota': {k: par['sliders']['aliquota_ibs'][k] for k in ('min', 'max', 'padrao', 'referencia_externa')},
    'consumo_local': par['padroes']['consumo_local'],
    'aliquota_equilibrio_max': par['aliquota_equilibrio_max'],
    'textos': {k: txt[k] for k in ('mip_fonte', 'valores', 'rodape_fonte', 'aliquota_equilibrio', 'aliquota_ibs', 'receita')},
    'municipios': mun,
    'sc': sc,
}
with open(out, 'w', encoding='utf-8') as fo:
    fo.write('/* Estrutura produtiva, MIP e motor de receita por município — gerado de entrega_front v%s (%s)\n'
             '   por tools/gerar_dados_estrutura.py. Não editar à mão: regere quando o pacote mudar. */\n'
             % (par['versao_modelo'], par['data_geracao']))
    fo.write('const DADOS_ESTRUTURA = ')
    json.dump(dados, fo, ensure_ascii=False, separators=(',', ':'))
    fo.write(';\n')
print(f'{len(mun)} municípios, {len(anos)} anos ({anos[0]}–{anos[-1]}); motor confere (dif. máx. {pior:.6f} R$ mi) -> {out}')
