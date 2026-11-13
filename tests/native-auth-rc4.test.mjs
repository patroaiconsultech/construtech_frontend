import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync("src/App.tsx","utf8");
const login=fs.readFileSync("src/routes/Login.tsx","utf8");
const session=fs.readFileSync("src/auth/session.ts","utf8");
const api=fs.readFileSync("src/api.ts","utf8");
const shell=fs.readFileSync("src/components/Shell.tsx","utf8");

test("native login route exists and oidc callback is removed",()=>{
  assert.match(app,/path="\/login"/);
  assert.equal(/auth\/callback/.test(app),false);
  assert.equal(fs.existsSync("src/routes/AuthCallback.tsx"),false);
});

test("native login requires explicit tenant email and password",()=>{
  assert.match(login,/tenant/);
  assert.match(login,/type="email"/);
  assert.match(login,/type="password"/);
  assert.match(login,/api\.nativeLogin/);
});

test("login errors are intentionally uniform to user",()=>{
  assert.match(login,/Não foi possível entrar com esses dados\./);
});

test("protected flow redirects locally, not to external identity provider",()=>{
  assert.match(session,/\/login\?return_to=/);
  assert.equal(/authorization|jwks|oidc|client_secret/i.test(session),false);
});

test("browser keeps session cookie model and no token storage",()=>{
  assert.match(api,/credentials:"include"/);
  assert.equal(/localStorage|sessionStorage/.test(api+session+login),false);
  assert.equal(/access_token|refresh_token|client_secret|m2m_token/i.test(api+session+login),false);
});

test("logout is available through same-origin backend",()=>{
  assert.match(api,/\/api\/v1\/auth\/logout/);
  assert.match(shell,/api\.logout/);
});
