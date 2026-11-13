import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL(path,import.meta.url),"utf8");

test("visual studio is reachable only inside protected app project route",()=>{
  const app=read("../src/App.tsx");
  assert.match(app,/\/app\/projects\/:projectId\/visual-ai/);
  assert.match(app,/<Protected><VisualAIStudio\/><\/Protected>/);
  const project=read("../src/routes/ProjectPage.tsx");
  assert.match(project,/Estúdio Visual IA/);
});
test("visual studio uses authenticated blob fetch, not public image links",()=>{
  const page=read("../src/routes/VisualAIStudio.tsx");
  assert.match(page,/api\.visualImageContent\(projectId,id\)/);
  assert.match(page,/URL\.revokeObjectURL/);
  assert.match(page,/consent_external_processing|allowExternal/);
  assert.match(page,/Estudo conceitual/);
});
test("CSP permits only local blob previews, not arbitrary remote image origins",()=>{
  const server=read("../server.mjs");
  assert.match(server,/img-src 'self' https: data: blob:/);
});
test("client sends explicit consent with scoped project and asset routes",()=>{
  const client=read("../src/api.ts");
  assert.match(client,/consent_external_processing:true/);
  assert.match(client,/encodeURIComponent\(p\)\}\/visual-ai\/images/);
  assert.doesNotMatch(client,/OPENAI_API_KEY/);
});
