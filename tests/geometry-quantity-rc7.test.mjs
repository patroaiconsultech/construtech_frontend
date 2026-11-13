
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const api=fs.readFileSync(new URL("../src/api.ts",import.meta.url),"utf8");
const page=fs.readFileSync(new URL("../src/routes/ArtifactStudio.tsx",import.meta.url),"utf8");

test("RC7 exposes CAD and geometry job APIs",()=>{
  assert.match(api,/architecture\/cad-jobs/);
  assert.match(api,/cad-extractions/);
  assert.match(api,/architecture\/geometry-jobs/);
  assert.match(api,/geometry-builds/);
  assert.match(api,/downloadArchitectureModel/);
});

test("RC7 UI preserves the distinction between source preview and authoritative 3D",()=>{
  assert.match(page,/não representa 3D arquitetônico inferido/);
  assert.match(page,/preview GLB/i);
  assert.match(page,/IFC Qto é tratado como quantitativo técnico/);
});

test("RC7 UI exposes pricing foundation without making the LLM a numeric authority",()=>{
  assert.match(page,/Agente de Precificação/);
  assert.match(page,/honorários profissionais/);
  assert.match(page,/custo estimado da obra/);
  assert.match(page,/Autoridade numérica por LLM/);
});

test("RC7 browser bundle contains no provider or storage secrets",()=>{
  const combined=api+page;
  assert.doesNotMatch(combined,/AWS_SECRET_ACCESS_KEY/i);
  assert.doesNotMatch(combined,/OPENAI_API_KEY/i);
  assert.doesNotMatch(combined,/AUTODESK_CLIENT_SECRET/i);
  assert.doesNotMatch(combined,/IFCOPENSHELL_TOKEN/i);
});
