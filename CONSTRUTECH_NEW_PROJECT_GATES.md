# CONSTRUTECH | G1 concluído somente em fonte — novo produto independente

Data de corte: 2026-11-12. Identidade CONSTRUTECH é provisória.

## Regra obrigatória
Os repositórios `patroaiconsultech/Arquitech-Glip-Premium-frontend` e
`patroaiconsultech/Arquitech-Glip-Premium-backend` são BASELINES históricas de
código. **Não são destinos GitHub.** Não fazer push, fork com segredos,
merge ou deploy para os repositórios, PostgreSQL e serviços GLIP existentes.

## Estado do projeto novo
- Repositórios frontend/backend CONSTRUTECH: AINDA NÃO CRIADOS.
- Projeto Railway separado, frontend, backend, banco novo: NÃO CRIADOS.
- HEAD/commit/árvore de destino: NÃO PROVADOS.
- Credenciais/URLs/domínios: NÃO DEFINIDOS.
- GO arquitetural AO-01: SIM, APENAS DESENHO/PREPARAÇÃO.
- GO de criação de infraestrutura, push, deploy, migration, produção: NÃO.

## Controles de origem do código
- Este material deriva dos ZIPs completos recebidos, cujos hashes constam do
  handoff `G1_HANDOFF_AO01.md` do pacote exterior.
- O frontend inclui `public/construtech-hero.mp4` com SHA256:
  `694abd2b9013996d6785f64ee682b7ceb74fbbbea6c3677f1a48627091fd0f0e`.
- O patch G1 corrige a regex de Content-Length no proxy, remove o destino
  GLIP antigo do exemplo de ambiente e impede proveniência GitHub falsa.
- Não usar o ZIP *leve* sem MP4 como artefato implantável.

## Nomes e variáveis legados
`GLIP_*`, `glip` em namespaces internos e nomes de pacotes são herança técnica.
Eles não provam dependência operacional se configurados exclusivamente para
CONSTRUTECH, mas exigem mapeamento de cada recurso antes de habilitar o serviço.
O backend GLIP legado jamais pode ser utilizado como URL de `GLIP_BACKEND_URL`.
Após G1, o exemplo frontend mantém `GLIP_BACKEND_URL=` VAZIO.

## Antes do primeiro deploy de staging (somente planejamento)
1. Aprovar nomes dos **novos** repositórios, criar projetos Git independentes e
   preservar hashes dos arquivos.
2. Revisar secret scanning, permissões de CI, RBAC do Railway, variáveis e
   configurações resolvidas; jamais copiar `.env` de produção.
3. Criar novo projeto Railway e PostgreSQL exclusivos; fixar o banco por
   identidade do serviço/instância, não por semelhança de nome.
4. Determinar URL privada do novo backend. Configurá-la somente no servidor
   frontend como `GLIP_BACKEND_URL`; não usar VITE_* para segredos.
5. Backend staging exige `GLIP_ENVIRONMENT=staging`,
   `GLIP_DATABASE_URL=<CONSTRUTECH_POSTGRES_URL_NOVA>`,
   `GLIP_REQUIRE_MIGRATION_HEAD=true`, `GLIP_AUTH_MODE=native_session`,
   segredos NOVOS para `GLIP_AUTH_SESSION_SECRET` e
   `GLIP_AUTH_PASSWORD_PEPPER` (>=32 caracteres), e `GLIP_CORS_ORIGINS`
   com a origem real do novo frontend.
6. Preservar `GLIP_ORKIO_MODE=disabled`,
   `GLIP_COMMERCIAL_ASSESSMENT_ENABLED=false` e demais capacidades
   perigosas OFF até gates específicos.
7. Revisar migrations Alembic (HEAD da fonte: `0012_glip_invitation_access`),
   upgrade/downgrade, locks/backfill e um rehearsal num PostgreSQL NOVO.
   NÃO executar `alembic upgrade head` no GLIP atual e NÃO ativar predeploy
   automático sem gate.
8. Executar CI frontend (`npm ci`, testes, Vite build) com
   Node 20.20.2/npm 10.8.2 para reprodução congelada (Node 20 é legado;
   modernização de runtime terá gate distinto); backend com Python 3.12,
   PostgreSQL CI e migrations novas.
9. Rodar smoke E2E em Microsoft Edge real: vídeo, reduced-motion, mobile,
   sete perguntas, consentimento, TXT, orientação desabilitada = 503.
   Ativação comercial depende de proteção contra abuso distribuído, decisão
   independente AO-01 e privacidade.
10. Pinagem Git HEAD -> build/image -> Railway deployment source commit ->
    configuração -> runtime antes de declarar sucesso.

## Restrições
- Não há agente LLM conectado, canal de contato efetivo ou CRM.
- Endpoint comercial é público e determinístico. Origem e consentimento
  NÃO substituem rate limit no edge. Manter flag OFF no primeiro deploy.
- Padrão `docker-compose.yml` herdado da baseline contém portas e senha DEV.
  NÃO usar como Compose de produção CONSTRUTECH.
- O `RAILWAY_DEPLOYMENT.md` herdado do backend cita migração histórica 0010;
  este texto NÃO representa o head atual nem permite executar migrations.
- Direitos comerciais de utilização do vídeo: PENDENTES.
- No-GO para GitHub write, merge e Railway até autorização humana específica.

## Rollback
Neste gate, descartar somente cópias locais G1 ou reverter o diff G1 nos
novos repositórios, após comparar hashes; nunca tocar GLIP Premium.
Depois de staging: rollback de imagem/feature flag separado de rollback
de dados; migration downgrade somente com aprovação e verificação.
