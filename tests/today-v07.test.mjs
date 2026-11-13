import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Today dashboard is wired only through GLIP API",()=>{
  const api=fs.readFileSync("src/api.ts","utf8");
  const today=fs.readFileSync("src/routes/Today.tsx","utf8");
  assert.match(api,/\/api\/v1\/dashboard\/today/);
  assert.match(today,/api\.today\(\)/);
  assert.equal(/VITE_(EFATA|ORKIO)_/.test(today),false);
});
test("Today exposes operational attention buckets",()=>{
  const today=fs.readFileSync("src/routes/Today.tsx","utf8");
  for(const label of ["ATRASOS","DECISÕES ABERTAS","AGUARDANDO APROVAÇÃO","PRÓXIMOS PRAZOS","PROJETOS EM RISCO"]){
    assert.ok(today.includes(label),label);
  }
});
test("Project hub now includes providers",()=>{
  const p=fs.readFileSync("src/routes/ProjectPage.tsx","utf8");
  const ops=fs.readFileSync("src/routes/ProjectOperations.tsx","utf8");
  assert.match(p,/Prestadores/);
  assert.match(ops,/projectProviders/);
});
