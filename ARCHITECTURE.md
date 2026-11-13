# GLIP Platform Frontend RC4 — Standalone Native Auth

```text
Browser
  ↓
GLIP Frontend
  ↓ same-origin /api/*
GLIP Backend
  ↓
GLIP PostgreSQL

GLIP Backend → ORKIO Integration Adapter → Efatà/ORKIO
```

The browser never calls Efatà directly and never carries an M2M secret.

## Native auth

```text
/login
→ tenant + email + password
→ POST /api/v1/auth/login
→ GLIP backend
→ HttpOnly/Secure/SameSite=Strict session cookie
→ /api/v1/me
```

No OIDC callback, JWKS, browser access token, refresh token or external auth client secret is used.
Every `/app` route is protected by `/api/v1/me`.

## Project workspace
Projects, timeline, stages, tasks, decisions, documents, media/3D/BIM, budget,
communication, approvals, memory and execution trace.

## External capabilities
Realtime, voice and avatar remain optional `pending_external` capabilities while Efatà/Fatar
stabilizes them. They do not block GLIP core readiness.

## Release boundaries
- frontend `package-lock.json` is still required before release approval;
- production case assets must satisfy `PERFORMANCE_BUDGET.md`;
- ORKIO remains disabled on the first standalone smoke.
