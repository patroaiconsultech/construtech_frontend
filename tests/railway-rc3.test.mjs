import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const server=fs.readFileSync("server.mjs","utf8");
const session=fs.readFileSync("src/auth/session.ts","utf8");
const api=fs.readFileSync("src/api.ts","utf8");
const docker=fs.readFileSync("Dockerfile","utf8");

test("browser login uses local native login route",()=>{
  assert.match(session,/\/login\?return_to=/);
  assert.equal(/https?:\/\//.test(session),false);
});

test("frontend server proxies api only to server-side backend url",()=>{
  assert.match(server,/GLIP_BACKEND_URL/);
  assert.match(server,/u\.pathname\.startsWith\("\/api\/"\)/);
  assert.equal(/VITE_GLIP_BACKEND_URL/.test(server),false);
});

test("proxy preserves auth redirects and cookies",()=>{
  assert.match(server,/Set-Cookie/);
  assert.match(server,/Location/);
  assert.match(server,/redirect:"manual"/);
});

test("frontend health and security headers exist",()=>{
  assert.match(server,/u\.pathname==="\/health"/);
  assert.match(server,/Content-Security-Policy/);
  assert.match(server,/X-Content-Type-Options/);
  assert.match(server,/Permissions-Policy/);
});

test("browser still persists no bearer or m2m credential",()=>{
  const source=api+session;
  assert.equal(/localStorage|sessionStorage/.test(source),false);
  assert.equal(/m2m_token|client_secret|refresh_token|access_token/i.test(source),false);
});

test("docker build prefers npm ci whenever a lock is present",()=>{
  assert.match(docker,/npm ci/);
  assert.match(docker,/package-lock\.json/);
});
