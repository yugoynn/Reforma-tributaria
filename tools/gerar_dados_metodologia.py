#!/usr/bin/env python3
"""
Gera js/dados_metodologia.js (aba Metodologia, Dados e Legislação) a partir do pacote
`entrega_front` (v1.1.0+): global/meta.json (fluxo, premissas, limitações, fontes,
versões, metodologia, documentos) e o texto dos documentos em docs/*.md, para abrir
dentro do painel (o app roda direto do arquivo, sem servidor).

Uso:  python3 -I tools/gerar_dados_metodologia.py <pasta entrega_front> js/dados_metodologia.js
"""
import json, os, sys

src, out = sys.argv[1], sys.argv[2]
meta = json.load(open(os.path.join(src, 'global/meta.json'), encoding='utf-8'))
docs = {}
for d in meta['documentos']:
    p = os.path.join(src, d['arquivo'])
    docs[d['arquivo']] = open(p, encoding='utf-8').read() if os.path.exists(p) else None
dados = {k: meta[k] for k in ('versao_modelo', 'data_geracao', 'fluxo', 'premissas', 'limitacoes', 'fontes', 'versoes', 'metodologia', 'documentos')}
dados['textos_docs'] = docs
with open(out, 'w', encoding='utf-8') as fo:
    fo.write('/* Metodologia, dados e legislação — gerado de entrega_front v%s (%s) por tools/gerar_dados_metodologia.py. */\n'
             % (meta['versao_modelo'], meta['data_geracao']))
    fo.write('const DADOS_METODOLOGIA = '); json.dump(dados, fo, ensure_ascii=False, separators=(',', ':')); fo.write(';\n')
faltam = [k for k, v in docs.items() if v is None]
print(f"fluxo {len(meta['fluxo'])}, premissas {len(meta['premissas'])}, limitações {len(meta['limitacoes'])}, fontes {len(meta['fontes'])}, "
      f"versões {len(meta['versoes'])}, metodologia {len(meta['metodologia'])}, documentos {len(docs)}" + (f' (faltando: {faltam})' if faltam else '') + f' -> {out}')
