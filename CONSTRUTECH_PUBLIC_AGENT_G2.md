# CONSTRUTECH PUBLIC AGENT G2 — CONTRATO E GATES

`GET /api/v1/public/agent/status` devolve `available`, `kind`, `generative_ai`, `persisted:false`, `crm_integration:false` (habilitação configurada não garante conectividade real).

`POST /api/v1/public/agent/chat`, `Content-Type: application/json` e `Origin` pertencente à allowlist do backend:
```
{"consent":true,"message":"Tenho um terreno. Por onde começo?","history":[]}
```
Mensagens livres (1 a 1.200 caracteres), até 6 entradas anteriores, corpo total de até 8.192 bytes. Sem identificação de tenant/browser, sem cookies, sem escrita, sem CRM, sem envio de email ou contato. Respostas 200:
```
{"kind":"public_consultative_chat_v1","reply":"...","persisted":false,"crm_sent":false,"lead_created":false}
```
Falhas: 403 consent/origin, 415 content-type, 413 body, 422 schema, 503 flag/provedor. `Cache-Control:no-store`. Não inclua essa rota em políticas que exigem sessão do app protegido.

Feature OFF por padrão. Configurar exclusivamente no backend:
- `CONSTRUTECH_AGENT_ENABLED`
- `CONSTRUTECH_AGENT_OPENAI_API_KEY`
- `CONSTRUTECH_AGENT_MODEL`
- `CONSTRUTECH_AGENT_EXTERNAL_ABUSE_PROTECTION_VERIFIED`

Em staging/produção, o backend não ativa sem atestação explícita de antiabuso externo. Esse booleano **não implementa rate limiter**, e não substitui evidência WAF/quotas/orçamento. SEM controle real = NO-GO.

API OpenAI `/v1/responses` (HTTPS), chave apenas server-side, `store:false`, sem tools, máximo de 750 tokens de saída e timeout 25s. Histórico enviado somente quando o usuário consente. Sem transcrição persistida pelo app; ver política do provedor para retenção/abuso. Os tokens e dados **não devem aparecer no Git ou frontend**.

`GLIP_COMMERCIAL_ASSESSMENT_ENABLED=false` é o legado das 7 perguntas; manter OFF. Os módulos GLIP herdados continuam protegidos por suas próprias rotas/autorização; agente público não é substituto.

Testes locais não provam a integração externa, banco, repositórios, Railway, browser ou autorização para produção.
