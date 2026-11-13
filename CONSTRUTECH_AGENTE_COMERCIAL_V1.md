# CONSTRUTECH — ligação consultiva ao backend (candidata de PR, 12/11/2026)

Este repositório preserva a landing, o vídeo Luma e as sete perguntas originais.
Agora, depois das sete respostas, o visitante **pode optar** por enviar SOMENTE
as sete escolhas enumeradas ao backend para orientação automatizada **determinística**.

- Sem consentimento separado, as respostas ficam exclusivamente no navegador.
- O resumo `.txt` continua local e não depende do servidor.
- A orientação não é IA generativa, não é análise de investimento e não cria lead.
- Não há persistência ou integração CRM nesta candidata.
- O backend **inicia com a função desabilitada** e exige `GLIP_COMMERCIAL_ASSESSMENT_ENABLED=true`
  e `GLIP_CORS_ORIGINS` contendo a origem pública exata do frontend. Uma alteração de flag
  exige gate operacional/auditoria antes de uso público.
- A API é same-origin `/api/v1/public/commercial/assessment`, via proxy de `server.mjs`
  e `GLIP_BACKEND_URL`, nunca acessando provedor externo no navegador.

## Aceite local / para PR

```
node --version         # esperado v20.20.2
npm --version          # esperado 10.8.2
npm ci --no-audit --no-fund
npm test
npm run verify:release
node --check server.mjs
npm run build
```

Testes do frontend nesta candidata: 81/81 PASS_LOCAL com Node 22.16.0
(sem dependências instaladas). O build positivo de 12/11/2026 no Windows
refere-se à pré-imagem *anterior*, não a este novo candidato.
Um build do novo candidato em Node 20.20.2 e teste de navegador real
continuam OBRIGATÓRIOS antes de merge/deploy.

O vídeo não foi alterado. Direitos comerciais continuam a exigir verificação.

## Rollback

Restaurar a fonte do frontend ZIP AO-01 de SHA-256
`41580e2ecfd5441542ad5981acf2fb7bec14021bb8f8e466b5a3dc821cbabb2f`
em seu branch de origem, após verificar pré-imagem e sem trocar branches produtivas
automaticamente. Remover apenas arquivos desta candidata.
