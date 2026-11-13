import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const api=fs.readFileSync("src/api.ts","utf8");
const auth=fs.readFileSync("src/auth/session.ts","utf8");
const landing=fs.readFileSync("src/routes/Landing.tsx","utf8");
const ghost=fs.readFileSync("src/routes/Ghostwriter.tsx","utf8");
const hero=fs.readFileSync("src/landing/ImmersiveHero.tsx","utf8");
const story=fs.readFileSync("src/landing/CognitiveStory.tsx","utf8");

test("browser API targets only GLIP backend contract",()=>{
  assert.equal(/VITE_(EFATA|ORKIO)_/i.test(api),false);
  assert.equal(new RegExp("https?://[^\\s]+(efata|orkio)","i").test(api),false);
  assert.match(api,/VITE_GLIP_API_BASE_URL/);
});
test("frontend carries no client secret or M2M token",()=>{
  const source=api+auth+fs.readFileSync(".env.example","utf8");
  assert.equal(/client_secret/i.test(source),false);
  assert.equal(/m2m.*token/i.test(source),false);
});
test("production auth is native same-origin session and stores no access token",()=>{
  assert.match(api,/credentials:"include"/);
  assert.equal(/sessionStorage.*access_token/.test(api+auth),false);
  assert.match(auth,/\/login\?return_to=/);
  assert.equal(/https?:\/\//.test(auth),false);
});
test("explicit dev identity remains feature gated",()=>assert.match(api,/VITE_GLIP_DEV_MODE/));
test("landing declares Efata intelligence boundary",()=>assert.match(landing+hero+story,/Efatà.*intelligence plane/i));
test("ghostwriter remains draft only",()=>{
  assert.match(ghost,/DRAFT ONLY/);
  assert.match(ghost,/pending_external/);
});
test("no external send or publish api",()=>{
  assert.equal(/\/send\b/.test(api),false);
  assert.equal(/\/publish\b/.test(api),false);
});
test("intelligence status treats realtime voice avatar as optional",()=>{
  const status=fs.readFileSync("src/routes/IntelligenceStatus.tsx","utf8");
  assert.match(status,/Realtime/);assert.match(status,/Voz/);assert.match(status,/Avatar/);
  assert.match(status,/não bloqueiam o núcleo/i);
});
test("project hub exposes standalone operational modules",()=>{
  const project=fs.readFileSync("src/routes/ProjectPage.tsx","utf8");
  for(const label of ["Timeline","Etapas","Tarefas","Decisões","Documentos","Mídia / 3D / BIM","Orçamento","Comunicação","Memória"]){
    assert.ok(project.includes(label),label);
  }
});
test("CONSTRUTECH public landing retains protected login and describes stage honestly",()=>{
  assert.match(landing,/import "\.\.\/construtech\.css"/);
  for(const section of ["plataforma","viabilidade","documentos","inteligencia"]){
    assert.match(landing,new RegExp(`id="${section}"`));
  }
  assert.match(landing,/\/login\?return_to=\/app/);
  assert.match(landing,/CONSTRUTECH/);
  assert.match(landing,/homologaç|HOMOLOGAÇÃO/i);
  assert.match(landing,/não gera lead nem contato comercial/);
});
test("canvas retains explicit low-power budget",()=>{
  const canvas=fs.readFileSync("src/components/CognitiveCanvas.tsx","utf8");
  assert.match(canvas,/count=lowPower\?12:26/);
  assert.match(canvas,/pointer: coarse/);
  assert.match(canvas,/visibilitychange/);
});
test("case media remains lazy below hero and supports local production mode",()=>{
  const reel=fs.readFileSync("src/landing/CaseReel.tsx","utf8");
  const cases=fs.readFileSync("src/landing/cases.ts","utf8");
  assert.match(reel,/loading=\{index===0\?"eager":"lazy"\}/);
  assert.match(cases,/VITE_GLIP_CASE_ASSET_MODE/);assert.match(cases,/localUrl/);
});
test("governed project memory remains exposed without send/publish",()=>{
  assert.match(api,/memoryCandidates/);assert.match(api,/promoteMemory/);assert.match(api,/approvedVersions/);
  assert.equal(/\/send\b/.test(api),false);assert.equal(/\/publish\b/.test(api),false);
});
