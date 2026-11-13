import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const shell=readFileSync(new URL("../src/components/Shell.tsx",import.meta.url),"utf8");
const chat=readFileSync(new URL("../src/routes/IntelligenceChat.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/intelligence-workspace.css",import.meta.url),"utf8");

test("immersive navigation applies only to Intelligence and preserves other routes",()=>{
  assert.match(shell,/immersive=false/);
  assert.match(chat,/<Shell immersive>/);
  assert.match(shell,/app-shell--intelligence/);
  assert.match(shell,/aria-label="Abrir menu principal"/);
  assert.match(shell,/aria-label="Fechar menu principal"/);
  assert.match(shell,/event\.key==="Escape"/);
  assert.match(shell,/to="\/app"/);
  assert.match(shell,/owner&&<Link/);
});
test("chat takes viewport height, keeps composer visible and allows threads to collapse",()=>{
  assert.match(css,/height:100dvh/);
  assert.match(css,/grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css,/grid-template-rows:auto minmax\(0,1fr\) auto/);
  assert.match(css,/\.intel-message-scroll\{min-height:0;overflow-y:auto/);
  assert.match(chat,/const \[threadsOpen,setThreadsOpen\]=useState\(false\)/);
  assert.match(chat,/aria-controls="intel-thread-panel"/);
  assert.match(chat,/aria-expanded=\{threadsOpen\}/);
  assert.match(css,/@media\(max-width:900px\)/);
});
test("attachment action remains visible while server status controls capability",()=>{
  assert.match(chat,/aria-label="Anexar documento ou imagem"/);
  assert.match(chat,/disabled=\{!canUpload\}/);
  assert.match(chat,/!attachmentsOn\s*\? "Anexos não habilitados neste ambiente/);
  assert.match(chat,/canUpload=attachmentsOn&&Boolean\(projectId\)/);
  assert.match(chat,/api\.uploadChatAttachment/);
  assert.match(chat,/pendingIds\.length>0&&!consent/);
});
test("existing private attachment lifecycle and non-visual image handling are retained",()=>{
  assert.match(chat,/api\.downloadChatAttachment/);
  assert.match(chat,/api\.deleteChatAttachment/);
  assert.match(chat,/api\.sendChatMessage\(id,text,pendingIds,consent\)/);
  assert.match(chat,/Imagens anexadas não são interpretadas visualmente/);
  assert.match(chat,/Abrir Estúdio Visual IA/);
});
