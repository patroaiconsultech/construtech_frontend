import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const landing=fs.readFileSync(new URL("../src/routes/Landing.tsx",import.meta.url),"utf8");
const login=fs.readFileSync(new URL("../src/routes/Login.tsx",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../src/ux01.css",import.meta.url),"utf8");
const env=fs.readFileSync(new URL("../.env.example",import.meta.url),"utf8");

test("UX-01 landing sends the primary entry CTA explicitly to login with return_to",()=>{
  assert.match(landing,/to="\/login\?return_to=\/app"/);
  assert.doesNotMatch(landing,/to="\/register"/);
  assert.doesNotMatch(landing,/to="\/activate"/);
  assert.doesNotMatch(landing,/forgot-password/);
});

test("UX-01 login preserves tenant_id auth contract behind workspace language",()=>{
  assert.match(login,/Espaço de trabalho/);
  assert.match(login,/api\.nativeLogin\(tenant\.trim\(\),email\.trim\(\),password\)/);
  assert.match(login,/safeReturnTo/);
  assert.match(login,/nav\(returnTo,\{replace:true\}\)/);
});

test("UX-01 login keeps a uniform public auth failure and double-submit guard",()=>{
  assert.match(login,/Não foi possível entrar com esses dados\./);
  assert.match(login,/disabled=\{busy\}/);
  assert.match(login,/aria-busy=\{busy\}/);
  assert.match(login,/aria-live="polite"/);
});

test("UX-01 does not hardcode public signup/invite/password-reset links",()=>{
  for(const source of [landing,login]){
    assert.doesNotMatch(source,/href="\/register"|to="\/register"/);
    assert.doesNotMatch(source,/href="\/activate"|to="\/activate"/);
    assert.doesNotMatch(source,/forgot-password/);
  }
});

test("UX-01 CSS has mobile and reduced-motion contracts",()=>{
  assert.match(css,/@media\(max-width:560px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.ux01-auth\{min-height:100svh/);
});

test("canonical env template does not embed a production default tenant",()=>{
  assert.match(env,/VITE_GLIP_DEFAULT_TENANT_ID=\s*(?:\r?\n|$)/);
});
