> **HISTÓRICO GLIP-P0-002 (não é a proveniência do candidato comercial atual).** Consulte `SOURCE_MANIFEST.json` e `CONSTRUTECH_AO01_HARDENING.md` para os hashes atuais.

# GLIP-P0-002 — aplicação e validação

## Objetivo

Tornar o frontend reproduzível em CI/Docker sem alterar comportamento funcional do produto.

## Alterações

1. adiciona `package-lock.json` canônico;
2. adiciona `.env.example` canônico;
3. mantém `env.example` temporariamente, byte-identical, apenas como compatibilidade de transição;
4. remove fallback `npm install` de Docker e CI;
5. exige `npm ci`;
6. adiciona `scripts/verify-release-contract.mjs`;
7. adiciona `scripts/release-provenance.mjs`;
8. atualiza manifests e documentação de release;
9. garante cleanup do artefato `dist/index.html` criado pelos testes de proxy.

## Evidência local realizada

```text
release_contract_verifier=PASS
node_tests=50/50 PASS
server_syntax=PASS
package_lock_sha256=f16603eac1121abd24b1c1911c8e4f95f173eed83372351c6fbb410efe210245
env_sha256=70bbf334f24206c812e0130454f5a66fade35c5ea60186a24869b3f36ea348ee
```

O `npm ci` completo não foi qualificado neste ambiente de preparação porque ele está sem
cache/registry para todas as dependências e usa Node 22, enquanto o contrato do projeto exige
Node `20.20.2` e npm `10.8.2`.

Portanto:

```text
npm_ci_networked=PENDING_GITHUB_CI
vite_build=PENDING_GITHUB_CI
production_approved=false
```

## Aplicação

Aplicar SOMENTE os arquivos contidos no PATCH ZIP V3 sobre a raiz do repositório frontend.
O diff e os materiais de auditoria são entregues separadamente e não pertencem à árvore do repositório.

Repositório:

```text
patroaiconsultech/Arquitech-Glip-Premium-frontend
```

Não alterar backend, banco ou migrations neste ciclo.

## Smoke / release gate

CI deve passar:

```bash
npm run verify:release
npm ci --no-audit --no-fund
npm test
node --check server.mjs
npm run build
npm run build:evidence
npm run release:provenance
```

Depois do deploy staging, validar:

```text
GET /health → 200
service=glip-frontend
backend_proxy_configured=true
deployment_id != null
commit != null
```

E no browser:

```text
login
GET /api/v1/me
listagem de projetos
criar 1 projeto de teste
abrir Project Hub
```

## Gate para remover `env.example`

Somente após um build Railway verde comprovando que `COPY .env.example ./.env.example`
funciona no build context, criar patch separado removendo `env.example`.

## Rollback

Restaurar os arquivos listados em `ROLLBACK_MANIFEST.json` a partir da baseline
`Arquitech-Glip-Premium-frontend-main (2)(1).zip` e remover os arquivos adicionados
por este patch.

Nenhuma migration ou alteração de dados precisa ser revertida.
