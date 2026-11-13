import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,statSync} from "node:fs";
const landing=readFileSync("src/routes/Landing.tsx","utf8");
test("G2 commercial journey is conversational and consented",()=>{
  for(const part of ['starters.map','sendMessage','onSubmit={sendMessage}', 'checked={consent}',
                     'Nova conversa','A IA é opcional','role="dialog"']) {
    assert.ok(landing.includes(part),part);
  }
  assert.doesNotMatch(landing,/setStep\(|QUESTIONS\.map|onClick=\{choose\}/);
});
test("G2 is explicit about live backend, not fake lead capture",()=>{
  assert.match(landing,/Agente temporariamente indisponível/);
  assert.match(landing,/Nenhum contato foi registrado ou enviado/);
  assert.match(landing,/não gera lead nem contato comercial/);
});
test("video remains local, accessible and loops in all playback modes",()=>{
  assert.match(landing,/construtech-hero\.mp4/);
  assert.match(landing,/prefers-reduced-motion/);
  assert.match(landing,/autoPlay=\{!reducedMotion\}/);
  assert.match(landing,/muted loop controls=\{videoPlayingByChoice\}/);
  assert.ok(statSync("public/construtech-hero.mp4").size>1e6);
});
