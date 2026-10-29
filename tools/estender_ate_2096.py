#!/usr/bin/env python3
"""
Estende até 2096 os arquivos de dados que terminavam antes disso:

  js/dados_reforma.js + js/dados_reforma.json   (v1, 2013–2078 -> 2013–2096)
  js/data.js                                    (Criciúma, 2013–2077 -> 2013–2096; não usado pelas telas)
  js/dados_setorial.js                          (2026–2078 -> 2026–2096)
  js/dados_benchmark.js                         (população 2026–2078 -> 2026–2096)

Uso:  python3 -I tools/estender_ate_2096.py js

Os anos novos são ESTIMATIVAS feitas com dados que o próprio projeto já tem até 2096:

  • Parâmetros da lei 2079–2096 (seguro-receita 4,5% -> 0,25%, retenção 0, ICMS/ISS 0):
    reais, de dados_reforma_v2.js -> parametros_legais.
  • v1 (dados_reforma): cada série municipal continua a partir do seu valor de 2078 com o
    crescimento ano a ano do mesmo município no v2, cenário base (consumo -> consumo da
    residência e base de destino; cota-parte ICMS + ISS -> receita sem reforma; população ->
    população). Consumo de SC e do Brasil seguem o crescimento de v2.nacional.base. As
    identidades do v1 continuam valendo: consumo_sc = soma das bases = soma do consumo da
    residência; população e receita de SC = soma dos 295; shares, consumo per capita e
    receita/consumo recalculados.
  • Setorial: os TOTAIS de cada município (receita sem reforma, parcela fixa, coeficiente da
    alíquota e seguro-receita) vêm de dados_estrutura.js, que é do mesmo pacote e tem dados
    até 2097 — são exatos. Só a divisão entre os 8 setores é estimada: mantém a participação
    de cada setor em 2078 (último ano do pacote). SC = soma dos 295.
  • Benchmarking: população pela regra do próprio pacote (dados_metodologia: "depois de 2070,
    taxa de -0,15% a.a. convergindo a zero em 2097"): a taxa de cada município em 2078
    diminui em linha reta até zero em 2097 — taxa(y) = taxa(2078) × (2097 − y) / 19. A regra
    reproduz 2071–2078 do pacote com erro de no máximo ~4 pessoas por ano.

Quando o pacote entrega_front estiver disponível, prefira regerar dados_setorial.js e
dados_benchmark.js com tools/gerar_dados_setorial.py e tools/gerar_dados_benchmark.py
(ANO_FIM = 2096): eles trazem a divisão setorial e a população reais.
O script é idempotente: se um arquivo já vai até 2096, ele não é alterado.
"""
import json, os, sys

PASTA = sys.argv[1] if len(sys.argv) > 1 else 'js'
FIM = 2096
NOTA = ('Anos {a}–{b} estendidos por tools/estender_ate_2096.py (estimativa a partir de '
        'dados do próprio projeto; ver o cabeçalho do script).')


def ler(nome):
    s = open(os.path.join(PASTA, nome), encoding='utf-8').read()
    i = s.index('=', s.index('const ')) + 1
    j = s.rindex('}') + 1
    return s[:i], json.loads(s[i:j]), s[j:]


def gravar(nome, cab, obj, rab, compacto=True):
    sep = (',', ':') if compacto else (', ', ': ')
    with open(os.path.join(PASTA, nome), 'w', encoding='utf-8') as f:
        f.write(cab + ' ' + json.dumps(obj, ensure_ascii=False, separators=sep) + rab)


r2 = lambda v: round(v, 2)
r3 = lambda v: round(v, 3)
r9 = lambda v: round(v, 9)

_, V2, _ = ler('dados_reforma_v2.js')
A2 = V2['meta']['anos']
i2 = {y: k for k, y in enumerate(A2)}
NAC = V2['nacional']['base']
PL = V2['parametros_legais']
ipl = {y: k for k, y in enumerate(PL['ano'])}


def g_v2(serie, y):
    """crescimento de y-1 para y numa série do v2 (lista alinhada a A2)"""
    a, b = serie[i2[y - 1]], serie[i2[y]]
    return b / a if a else 1.0


def sem_v2(m):
    s = m['series']['base']
    return [None if (c is None or i is None) else c + i for c, i in zip(s['cp_icms'], s['iss'])]


# ======================================================================
# 1. dados_reforma.js / dados_reforma.json  (v1)
# ======================================================================
cab, V1, rab = ler('dados_reforma.js')
ult = V1['anos'][-1]
if ult < FIM:
    novos = list(range(ult + 1, FIM + 1))
    sc = V1['sc']
    MUN = V1['municipios']
    sem2 = {c: sem_v2(V2['municipios'][c]) for c in MUN}
    for y in novos:
        V1['anos'].append(y)
        # SC / Brasil
        sc['ano'].append(y)
        sc['consumo_br'].append(r2(sc['consumo_br'][-1] * g_v2(NAC['consumo_br'], y)))
        cons_sc = sc['consumo_sc'][-1] * g_v2(NAC['consumo_sc'], y)
        # municípios: crescimento do v2, depois normaliza para fechar com o consumo de SC
        prev = {}
        for c, m in MUN.items():
            v = V2['municipios'][c]
            gc = g_v2(v['series']['base']['consumo'], y)
            prev[c] = (m['consumo_residencia'][-1] * gc, m['base_destino'][-1] * gc,
                       m['receita_sem_reforma'][-1] * g_v2(sem2[c], y),
                       m['populacao'][-1] * g_v2(v['populacao'], y))
        k_res = cons_sc / sum(p[0] for p in prev.values())
        k_dst = cons_sc / sum(p[1] for p in prev.values())
        for c, m in MUN.items():
            cres, cdst, sem, pop = prev[c]
            cres, cdst = cres * k_res, cdst * k_dst
            m['populacao'].append(r2(pop))
            m['tipo_pop'].append('PROJECAO')
            m['cluster'].append(m['cluster'][-1])
            m['share_residencia'].append(r9(cres / cons_sc))
            m['consumo_residencia'].append(r2(cres))
            m['share_destino'].append(r9(cdst / cons_sc))
            m['base_destino'].append(r2(cdst))
            m['consumo_pc'].append(r2(cres / pop))
            m['receita_sem_reforma'].append(r2(sem))
            m['tipo_receita'].append('PROJECAO')
            m['receita_sobre_consumo'].append(r9(sem / cdst))
            m['tipo_consumo'].append('PROJECAO')
        sc['consumo_sc'].append(r2(cons_sc))
        sc['populacao_sc'].append(r2(sum(m['populacao'][-1] for m in MUN.values())))
        sc['receita_sc'].append(r2(sum(m['receita_sem_reforma'][-1] for m in MUN.values())))
        sc['base_destino_sc'].append(r2(sum(m['base_destino'][-1] for m in MUN.values())))
        # parâmetros da lei (reais, do v2)
        P, k = V1['parametros'], ipl[y]
        ret, seg = PL['ret'][k], PL['seguro'][k]
        P['ano'].append(y)
        P['icms_iss_mantido'].append(PL['fator_icms_iss'][k])
        P['retencao_historica'].append(ret)
        P['seguro_receita'].append(seg)
        P['peso_destino_sem_seguro'].append(round(1 - ret, 6))
        P['peso_destino_com_seguro'].append(round((1 - ret) * (1 - seg), 6))
        P['cota_parte_ibs_estadual'].append(V2['meta']['cota_parte_ibs'])
    V1['anos_estimados'] = novos
    V1['nota_extensao'] = NOTA.format(a=novos[0], b=novos[-1])
    cab = cab.replace('2013–2078', '2013–2096 (2079–2096 estendidos por tools/estender_ate_2096.py)')
    gravar('dados_reforma.js', cab, V1, rab)
    with open(os.path.join(PASTA, 'dados_reforma.json'), 'w', encoding='utf-8') as f:
        json.dump(V1, f, ensure_ascii=False, separators=(',', ':'))
    print(f'dados_reforma: {novos[0]}–{novos[-1]} acrescentados ({len(V1["anos"])} anos)')
else:
    print('dados_reforma: já vai até', ult)

# ======================================================================
# 2. data.js (Criciúma, Dados_Danilo.xlsx) — não é usado pelas telas
# ======================================================================
cab, DJ, rab = ler('data.js')
ult = max(int(y) for y in DJ['consumo'])
if ult < FIM:
    v = V2['municipios'][str(DJ['cod_ibge'])]
    s2 = sem_v2(v)
    for y in range(ult + 1, FIM + 1):
        DJ['consumo'][str(y)] = r2(DJ['consumo'][str(y - 1)] * g_v2(v['series']['base']['consumo'], y))
        DJ['icms_iss'][str(y)] = r2(DJ['icms_iss'][str(y - 1)] * g_v2(s2, y))
        DJ['populacao'][str(y)] = round(DJ['populacao'][str(y - 1)] * g_v2(v['populacao'], y))
        DJ['tipo'][str(y)] = 'PROJECAO'
    DJ['nota_extensao'] = NOTA.format(a=ult + 1, b=FIM)
    cab = cab.replace('Série completa 2013–2077.', f'Série completa 2013–{FIM} ({ult + 1}–{FIM} estendidos por tools/estender_ate_2096.py).')
    gravar('data.js', cab, DJ, rab, compacto=False)
    print(f'data.js: {ult + 1}–{FIM} acrescentados')
else:
    print('data.js: já vai até', ult)

# ======================================================================
# 3. dados_setorial.js — totais de dados_estrutura.js, divisão setorial de 2078
# ======================================================================
_, ES, _ = ler('dados_estrutura.js')
ie = {y: k for k, y in enumerate(ES['anos'])}
cab, DS, rab = ler('dados_setorial.js')
ult = DS['anos'][-1]
if ult < FIM:
    novos = list(range(ult + 1, FIM + 1))
    p = DS['consumo_local']

    def totais(mo, y):
        k = ie[y]
        fixo = mo['f_iss'][k] + mo['f_cota_parte_icms'][k] + mo['f_teste_cota'][k] + p * mo['fp_teste'][k]
        a = mo['a_retido'][k] + mo['a_cota'][k] + p * mo['ap_destino'][k]
        return mo['sem'][k], fixo, a, max(0.0, mo['s0'][k] - p * mo['s1'][k])

    def partes(vals):
        t = sum(vals)
        return [v / t for v in vals] if abs(t) > 1e-12 else None

    pior = 0.0
    for c, X in DS['municipios'].items():
        mo = ES['municipios'][c]['motor']
        sem_t, fixo_t, a_t, _ = totais(mo, ult)
        # confere: soma dos setores em 2078 = totais do motor
        pior = max(pior, abs(sum(r[2][-1] for r in X['set']) - sem_t), abs(sum(r[4][-1] for r in X['set']) - a_t))
        sh_sem = partes([r[2][-1] for r in X['set']])
        sh_a = partes([r[4][-1] for r in X['set']]) or sh_sem
        sh_fixo = partes([r[3][-1] for r in X['set']]) or sh_sem
        n = len(X['set'])
        for y in novos:
            sem, fixo, a, seg = totais(mo, y)
            for j, r in enumerate(X['set']):
                r[2].append(r3(sem * sh_sem[j]) if sh_sem else 0.0)
                r[3].append(r3(fixo * sh_fixo[j]) if sh_fixo else r3(fixo / n))
                r[4].append(r3(a * sh_a[j]) if sh_a else r3(a / n))
            X['segbase'].append(r3(seg))
    if pior > 0.05:
        sys.exit(f'ERRO: setorial 2078 não fecha com dados_estrutura (dif. {pior:.4f} R$ mi)')
    # Santa Catarina = soma dos 295
    S = DS['sc']
    for j, r in enumerate(S['set']):
        for q in (2, 3, 4):
            for t, y in enumerate(novos):
                r[q].append(r3(sum(X['set'][j][q][len(DS['anos']) + t] for X in DS['municipios'].values())))
    for t, y in enumerate(novos):
        S['segbase'].append(r3(sum(X['segbase'][len(DS['anos']) + t] for X in DS['municipios'].values())))
    DS['anos'] += novos
    DS['anos_estimados'] = novos
    DS['nota_extensao'] = (f'{novos[0]}–{novos[-1]}: totais por município de dados_estrutura.js (exatos); '
                           f'divisão entre setores mantida igual à de {ult} (estimativa).')
    gravar('dados_setorial.js', cab, DS, rab)
    print(f'dados_setorial: {novos[0]}–{novos[-1]} acrescentados (conferência 2078: dif. máx. {pior:.4f} R$ mi)')
else:
    print('dados_setorial: já vai até', ult)

# ======================================================================
# 4. dados_benchmark.js — população pela regra do pacote (taxa converge a zero em 2097)
# ======================================================================
ZERO = 2097
cab, DB, rab = ler('dados_benchmark.js')
ult = DB['anos'][-1]
if ult < FIM:
    novos = list(range(ult + 1, FIM + 1))
    for c, b in DB['municipios'].items():
        taxa = b['pop'][-1] / b['pop'][-2] - 1          # taxa de 2078
        p = float(b['pop'][-1])
        for y in novos:
            p *= 1 + taxa * (ZERO - y) / (ZERO - ult)
            b['pop'].append(int(round(p)))
    for t in range(len(novos)):
        DB['sc']['pop'].append(sum(b['pop'][len(DB['anos']) + t] for b in DB['municipios'].values()))
    DB['anos'] += novos
    DB['anos_estimados'] = novos
    DB['nota_extensao'] = (f'{novos[0]}–{novos[-1]}: população pela regra do pacote — taxa anual de {ult} de cada município '
                           f'convergindo em linha reta a zero em {ZERO} (estimativa).')
    gravar('dados_benchmark.js', cab, DB, rab)
    print(f'dados_benchmark: população {novos[0]}–{novos[-1]} acrescentada')
else:
    print('dados_benchmark: já vai até', ult)
