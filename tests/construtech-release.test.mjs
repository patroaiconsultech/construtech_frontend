import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";

test("commercial candidate release lock hash is not stale",()=>{
  const m=JSON.parse(fs.readFileSync("SOURCE_MANIFEST.json","utf8"));
  const expected=crypto.createHash("sha256").update(fs.readFileSync("package-lock.json")).digest("hex");
  assert.equal(m.release_contract.package_lock_sha256,expected);
  assert.equal(m.production_approved,false);
  assert.match(m.candidate_label,/CONSTRUTECH_PUBLIC_AGENT_G2_CANDIDATE/);
  assert.match(m.source_hardening_baseline_sha256,/^[a-f0-9]{64}$/);
  assert.equal(m.commercial_agent_v1.no_crm,true);
  assert.equal(m.commercial_agent_v1.no_llm,true);
  assert.match(fs.readFileSync("RAILWAY_DEPLOYMENT.md","utf8"),new RegExp(expected));
});
test("CTA matches implemented local diagnostic, not lead submission",()=>{
  const landing=fs.readFileSync("src/routes/Landing.tsx","utf8");
  assert.doesNotMatch(landing,/Solicitar (uma )?demonstração/);
  assert.match(landing,/Conversar com a IA/);
  assert.match(landing,/não gera lead nem contato comercial/);
});
