import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const landing=readFileSync("src/routes/Landing.tsx","utf8");
const server=readFileSync("server.mjs","utf8");

test("G2 landing has free conversation, not mandatory seven-question funnel",()=>{
  assert.match(landing,/Conversar com a IA/);
  assert.match(landing,/construtech-hero\.mp4/);
  assert.match(landing,/ct-chat-messages/);
  assert.match(landing,/ct-chat-input/);
  assert.doesNotMatch(landing,/QUESTIONS\.length|summaryText\(answers\)|Sete perguntas para entender/);
});
test("G2 consent, no CRM and no browser secrets",()=>{
  for(const s of ["consent:true","credentials:\"omit\"","/api/v1/public/agent/chat",
                   "/api/v1/public/agent/status", "data.crm_sent!==false","data.persisted!==false"]){
    assert.ok(landing.includes(s),s);
  }
  assert.ok(!landing.includes("OPENAI_API_KEY"));
  assert.ok(!landing.includes("localStorage.setItem"));
  assert.ok(!landing.includes("sessionStorage.setItem"));
});
test("G2 chat request size protected at frontend proxy",()=>{
  assert.match(server,/target\.pathname === "\/api\/v1\/public\/agent\/chat"/);
  assert.match(server,/\? 8192 : 4096/);
  assert.match(server,/bodySize > commercialBodyLimit/);
  assert.match(server,/u\.pathname\.startsWith\("\/api\/"\)/);
});
