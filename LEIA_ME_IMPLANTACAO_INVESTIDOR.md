# CONSTRUTECH G2 — Landing para apresentação a investidor

Data de preparação: 2026-11-13
Status: CANDIDATO DE PREVIEW PÚBLICA — não homologado como produção.

## O que você recebe
- Código completo do frontend G2 CONSTRUTECH, com React/Vite e servidor Node `server.mjs`
- `Dockerfile` na raiz (build inclui testes, versão Node 20.20.2 pinada)
- `public/construtech-hero.mp4` e poster WebP, preservados da candidata G2
- Interface pública do agente conversacional; **não responde sem um backend real conectado**
- Arquivo `.dockerignore` para não enviar dados locais ao Docker build

## Como publicar sem o backend (somente apresentação)

1. Baixe `CONSTRUTECH_FRONTEND_G2_GITHUB_RAILWAY_INVESTIDOR.zip`.
2. **Extraia o ZIP** para uma pasta no computador; NÃO envie o ZIP como único arquivo ao GitHub.
3. Crie **um NOVO repositório privado, vazio**, por exemplo `construtech-frontend-preview`, na organização correta.
   NÃO use nenhum repositório GLIP Premium ou EFATÀ.
4. No GitHub, selecione `Add file` > `Upload files` e envie **o conteúdo extraído na raiz**.
   Confira que `Dockerfile`, `package.json`, `package-lock.json`, `.env.example`, `server.mjs`,
   `.github/`, `src/` e `public/` estão presentes. Se a interface não enviar pastas corretamente,
   use Git local, sem copiar segredos.
   O MP4 tem cerca de 15,4 MB, então é especialmente importante conferir que foi enviado.
5. Confirme o commit do novo repositório, e verifique a execução da GitHub Actions CI.
6. No Railway, crie **um NOVO projeto** dedicado a esta prévia e escolha
   `Deploy from GitHub repo`. Selecione o novo repositório.
   Use o `Dockerfile` da raiz (Railway deve detectá-lo; ver logs do build).
   Não configure nenhuma URL de backend legado.
7. Para a apresentação sem backend, mantenha `GLIP_BACKEND_URL` **não definida**
   (ou vazia). **Nunca** aponte para GLIP Premium. Não crie banco, não execute migration
   e não adicione chaves de IA a este frontend.
8. Em `Settings` do serviço Railway, configure o healthcheck em `/health`.
   O servidor lê `PORT` automaticamente, escuta `0.0.0.0` e responde `GET /health`.
   O Dockerfile tem CMD `node server.mjs`: não é necessário iniciar `vite preview`.
9. Em `Settings` > `Networking` > `Public Networking`, use `Generate Domain`.
   Abra o domínio gerado em HTTPS num navegador externo.
10. **Antes de enviar ao investidor** confira:
   - `/` retorna a landing CONSTRUTECH, com aparência e seções esperadas
   - `/construtech-hero.mp4` toca diretamente, e o vídeo da landing aparece
     (autoplay/loop se o visitante permitir movimento)
   - `/construtech-hero-poster.webp` carrega
   - `/health` retorna `status:"ok"` e `backend_proxy_configured:false`
   - botão de agente abre a interface, mas exibe indisponibilidade sem backend
   - navegação funciona no celular e sem dados/segredos reais
   - resultado foi revisado por AO-01 antes de alegar homologação de produção

## Limites muito importantes
- Esta é **prévia pública conceitual**, não MVP implantado.
- Nenhuma conversa é gerada por IA real quando o backend não está configurado.
  Não alegue 'agente funcionando' ao investidor.
- Acesso à plataforma, login, projetos, APIs, persistência e CRM
  requerem o backend e serviços próprios, que **não estão incluídos neste pacote**.
- A URL gerada pelo Railway é **pública**, mesmo com repositório privado.
  Não publique dados reais, informações confidenciais ou segredos.
- Material audiovisual: validar direitos comerciais de uso antes de
  divulgação ampla.
- A candidata foi testada em Windows usando Node 20.20.2, que está fora
  do ciclo de suporte; modernização de runtime e homologação são gates
  posteriores. Testes locais não provam build Docker ou Railway.
- Não habilite o endpoint público de IA sem defesa real contra abuso,
  limites de custo, consentimento e aprovação independente.
- Nomes `GLIP_*` são legados técnicos. Eles **não autorizam** reconexão
  com infraestrutura GLIP Premium.

## Em caso de falha de implantação
1. Verifique o log Railway: se identificou o `Dockerfile` na raiz,
   se rodou `npm ci`, `npm test`, `npm run build`, e se iniciou `server.mjs`.
2. Se faltar o vídeo, confira `public/construtech-hero.mp4` no GitHub.
3. Se `/health` não funcionar, verifique logs/porta de serviço (usar `PORT` do Railway).
4. Se landing aparecer mas o agente estiver indisponível, isso é ESPERADO
   sem backend, não sinal de falha do frontend.
5. Não altere GLIP Premium para corrigir uma falha da prévia.
6. Rollback: no Railway, reverta ao deployment/commit anterior, ou exclua
   somente o novo serviço de prévia após verificar que é realmente isolado.

## Evidências
- G2 em Windows reportado pelo operador: 87/87 testes, release_contract_ok,
  Vite build PASS e 58 módulos; evidência não equivale a prova de deploy.
- `G2_EDGE=NOT_PROVEN` (a versão G2 não abriu na prévia local do operador).
- `G2_OPENAI_REAL=NOT_PROVEN`.
- `RAILWAY=NOT_DEPLOYED_BY_DG01`.
- `AO01_APPROVAL=STILL_REQUIRED_FOR_PRODUCTION`.

## Referências do Railway
- https://docs.railway.com/builds/dockerfiles
- https://docs.railway.com/services
- https://docs.railway.com/deployments/healthchecks
- https://docs.railway.com/networking/domains/working-with-domains
- https://docs.railway.com/config-as-code (config as code legado descontinuado)
