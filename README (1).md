# GLIP Platform Frontend RC4 — Native Auth Candidate

Standalone frontend for the GLIP architecture/project platform.

## Auth
Human authentication is GLIP-native:
- local `/login`;
- explicit tenant + email + password;
- same-origin backend request;
- HttpOnly session cookie;
- `/api/v1/me` membership boundary;
- no browser access/refresh/M2M token;
- no OIDC/JWKS/external auth callback.

## Workspace
Hoje, projects, clients, providers, timeline/stages/tasks, decisions, documents,
media/3D/BIM, budget, communication, approvals, project memory and intelligence status.

## Efatà boundary
Realtime, voice and avatar remain `pending_external`.
The browser never calls Efatà directly.

## Release gate
`package-lock.json` + clean `npm ci` + Vite build and local optimized case assets
remain required before production approval.
