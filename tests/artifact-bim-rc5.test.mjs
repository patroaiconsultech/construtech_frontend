import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const api=fs.readFileSync(new URL("../src/api.ts",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../src/App.tsx",import.meta.url),"utf8");
const page=fs.readFileSync(new URL("../src/routes/ArtifactStudio.tsx",import.meta.url),"utf8");
const project=fs.readFileSync(new URL("../src/routes/ProjectPage.tsx",import.meta.url),"utf8");

test("RC5 exposes a project-scoped artifact/BIM studio",()=>{
  assert.match(app,/projects\/:projectId\/artifacts/);
  assert.match(project,/Artefatos & CAD\/BIM/);
  assert.match(page,/billing e storage próprios/i);
});

test("artifact and architecture APIs remain project scoped",()=>{
  assert.match(api,/projects\/\$\{p\}\/artifacts/);
  assert.match(api,/projects\/\$\{p\}\/architecture\/sources/);
  assert.match(api,/uploadArchitectureSource/);
  assert.match(api,/downloadArtifact/);
});

test("browser never receives Efata or provider credential fields",()=>{
  const combined=api+page;
  assert.doesNotMatch(combined,/EFATA_DATABASE_URL/);
  assert.doesNotMatch(combined,/OPENAI_API_KEY/);
  assert.doesNotMatch(combined,/artifact_storage_secret_access_key/i);
  assert.doesNotMatch(combined,/m2m_token/i);
});

test("IFC is visible as first-class source while future gates remain honest",()=>{
  assert.match(page,/IFC é preservado como fonte semântica/);
  assert.match(page,/BIM semantic parser/);
  assert.match(page,/Autodesk APS/);
  assert.match(page,/Render worker/);
});
