import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("client and provider directories use GLIP API only",()=>{
  const api=fs.readFileSync("src/api.ts","utf8");
  const clients=fs.readFileSync("src/routes/Clients.tsx","utf8");
  const providers=fs.readFileSync("src/routes/Providers.tsx","utf8");
  assert.match(api,/\/api\/v1\/clients/);
  assert.match(api,/\/api\/v1\/providers/);
  assert.match(clients,/api\.clients\(\)/);
  assert.match(providers,/api\.providers\(\)/);
  assert.equal(/VITE_(EFATA|ORKIO)_/.test(clients+providers),false);
});
test("standalone navigation exposes domain directories",()=>{
  const shell=fs.readFileSync("src/components/Shell.tsx","utf8");
  assert.match(shell,/Clientes/);assert.match(shell,/Prestadores/);
});
test("directories never carry m2m or client secret",()=>{
  const source=fs.readFileSync("src/routes/Clients.tsx","utf8")+fs.readFileSync("src/routes/Providers.tsx","utf8");
  assert.equal(/m2m|client_secret/i.test(source),false);
});
