import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const api=fs.readFileSync(new URL("../src/api.ts",import.meta.url),"utf8");
const page=fs.readFileSync(new URL("../src/routes/ArtifactStudio.tsx",import.meta.url),"utf8");

test("RC6 exposes project-scoped BIM semantic job APIs",()=>{
  assert.match(api,/architecture\/bim-jobs/);
  assert.match(api,/semantic-extractions/);
  assert.match(api,/queueBimExtraction/);
});

test("RC6 UI queues semantic extraction only for IFC",()=>{
  assert.match(page,/source_format==="ifc"/);
  assert.match(page,/Extrair semântica BIM/);
  assert.match(page,/preservará o IFC como fonte semântica/);
});

test("RC6 keeps BIM semantics project-scoped and credential-free in browser",()=>{
  const combined=api+page;
  assert.doesNotMatch(combined,/IFCOPENSHELL_TOKEN/i);
  assert.doesNotMatch(combined,/AWS_SECRET_ACCESS_KEY/i);
  assert.doesNotMatch(combined,/OPENAI_API_KEY/i);
});
