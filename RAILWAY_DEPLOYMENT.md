> **CONSTRUTECH G1 / PROJETO INDEPENDENTE — NO-GO DE IMPLANTAÇÃO**  
> Este documento contém referências HISTÓRICAS do GLIP Premium e NÃO é uma receita autorizada para Railway CONSTRUTECH.  
> Consulte `CONSTRUTECH_NEW_PROJECT_GATES.md` antes de qualquer preparação. NÃO reutilizar projetos, serviços, bancos, credenciais ou URLs do GLIP.

---

# CONSTRUTECH (nome provisório) — Contrato Railway do frontend GLIP

Serviço: frontend comercial CONSTRUTECH sobre aplicação GLIP existente. O nome de serviço efetivo no Railway deve ser verificado.

O browser deve falar apenas com o frontend. `server.mjs` faz proxy de `/api/*`
para o backend configurado exclusivamente no servidor via `GLIP_BACKEND_URL`.

## Variáveis

Obrigatória no servidor:

```text
GLIP_BACKEND_URL=<backend GLIP autorizado para o ambiente>
```

Variáveis `VITE_*` são públicas por definição e não podem conter segredo.

O contrato de exemplo canônico é:

```text
.env.example
```

`env.example` permanece apenas como mirror transitório idêntico durante este gate e deve ser
removido em patch posterior depois que um build Railway provar que `.env.example` está presente
no build context.

## Health / provenance

`GET /health` deve retornar, sem segredo:

- `status`
- `service`
- `version`
- `backend_proxy_configured`
- `deployment_id`
- `commit`

Após cada deploy candidato, registrar:

```text
Git commit
Git tree
GitHub Actions run
Railway deployment id
Railway commit
/health response
deployment timestamp
```

GitHub, ZIP, build artifact e Railway não devem ser presumidos equivalentes.

## Release gate P0-002

O source agora exige:

```bash
npm run verify:release
npm ci --no-audit --no-fund
npm test
node --check server.mjs
npm run build
npm run build:evidence
npm run release:provenance
```

Docker e GitHub Actions usam `npm ci` sem fallback para `npm install`.

Package lock esperado neste candidato:

```text
SHA256 216986763aa493ecdb95e43984564e61ebedae14b6717fd2eed4c5b211e8f2f3
```

## Estado de aprovação

```text
source_contract_local=PASS
source_tests_local=PENDING_POST_HARDENING_VALIDATION
server_syntax_local=PENDING_POST_HARDENING_VALIDATION
npm_ci_networked=PENDING_CI
vite_build_networked=PENDING_CI
railway_runtime_provenance=PENDING_DEPLOY
production_approved=false
human_approval_required=true
```

## Escopo comercial 12/11/2026

A landing abre pré-diagnóstico local de sete perguntas; **não capta leads, não envia dados ao CRM e não solicita demonstração efetivamente**. O vídeo `/construtech-hero.mp4` é servido com `video/mp4`, byte range e cache de uma hora. O build, E2E de navegador, homologação Railway, direitos sobre o vídeo e origem do HEAD devem ser comprovados separadamente. **Merge/deploy/produção: NO-GO** até autorização específica.

## Candidata incremental — agente consultivo v1 (12/11/2026)

Esta candidata adiciona orientação determinística após as sete perguntas, apenas
com autorização adicional e sem CRM/LLM. `/api/v1/public/commercial/assessment`
é encaminhado pelo proxy existente ao backend. No backend a flag
`GLIP_COMMERCIAL_ASSESSMENT_ENABLED=false` é o padrão seguro.

O build demonstrado em Windows do frontend AO-01 anterior não qualifica este
novo diff. Repetir `npm ci`, testes, verificador, `npm run build` e navegador
para este candidato antes de PR/merge/deploy. `GITHUB_HEAD=NOT_PROVEN`,
`RAILWAY_RUNTIME=NOT_PROVEN`, `PRODUCTION=NO_GO`.
