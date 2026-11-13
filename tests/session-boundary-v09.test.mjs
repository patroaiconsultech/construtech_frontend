import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("all app routes are protected by membership boundary",()=>{
  const app=fs.readFileSync("src/App.tsx","utf8");
  const appRoutes=[...app.matchAll(/<Route path="(\/app[^"]*)"/g)].map(x=>x[1]);
  assert.ok(appRoutes.length>=8);
  for(const route of appRoutes){
    const escaped=route.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const line=app.split("\n").find(x=>x.includes(`path="${route}"`))||"";
    assert.match(line,/<Protected>/,route);
  }
});
test("protected boundary proves api.me before rendering",()=>{
  const source=fs.readFileSync("src/auth/Protected.tsx","utf8");
  assert.match(source,/api\.me\(\)/);
  assert.match(source,/beginLogin/);
});
test("session frontend persists no access refresh or m2m token",()=>{
  const source=[
    fs.readFileSync("src/auth/Protected.tsx","utf8"),
    fs.readFileSync("src/auth/session.ts","utf8"),
    fs.readFileSync("src/api.ts","utf8"),
  ].join("\n");
  assert.equal(/localStorage|sessionStorage/.test(source),false);
  assert.equal(/refresh_token|access_token|m2m_token|client_secret/i.test(source),false);
});
test("return path forbids protocol-relative redirect",()=>{
  const source=fs.readFileSync("src/auth/session.ts","utf8");
  assert.match(source, /safeReturnTo\(returnTo\)/);
  const guard = fs.readFileSync("src/auth/returnTo.mjs", "utf8");
  assert.match(guard, /url\.origin !== RETURN_BASE/);
  assert.match(guard, /url\.pathname/);
});
