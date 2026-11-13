> **HISTÓRICO GLIP-P0-002 (não é a proveniência do candidato comercial atual).** Consulte `SOURCE_MANIFEST.json` e `CONSTRUTECH_AO01_HARDENING.md` para os hashes atuais.

# GLIP frontend — deterministic lockfile gate

Status do candidato P0-002: **LOCKFILE MATERIALIZADO / QUALIFICAÇÃO CI PENDENTE**

## Contrato canônico

- Node: `20.20.2`
- npm: `10.8.2`
- package-lock: lockfile v3
- package-lock SHA-256: `f16603eac1121abd24b1c1911c8e4f95f173eed83372351c6fbb410efe210245`
- ambiente público de referência: Railway
- arquivo público de configuração de exemplo: `.env.example`

O `package-lock.json` foi recuperado do artifact real `glip-frontend-build-evidence.zip`,
originado no GitHub Actions run `36164632260`, commit
`059eca2c257ac8e40b8ae49d92d9e81f91fda761`, tree
`92f8d6b29b7343bea141c3f3217cfcb3401c29c6`.

A raiz do lock foi comparada com o `package.json` desta baseline e possui os mesmos:
nome, versão, engines, dependencies e devDependencies.

## Gate obrigatório

Um release somente pode ser qualificado depois de:

```bash
npm run verify:release
npm ci --no-audit --no-fund
npm test
node --check server.mjs
npm run build
npm run build:evidence
npm run release:provenance
```

## Regra

- `npm install` como fallback em CI/Docker: **proibido**.
- ausência de `package-lock.json`: **NO-GO**.
- divergência `package.json` ↔ lock: **NO-GO**.
- `.env.example` ausente do build context: **NO-GO**.
- `env.example`, enquanto existir como mirror de transição, deve ser byte-identical ao `.env.example`.
- produção permanece **NO-GO** até CI networked + Railway runtime provenance passarem.
