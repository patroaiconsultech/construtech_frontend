import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const api=readFileSync(new URL("../src/api.ts",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/routes/IntelligenceChat.tsx",import.meta.url),"utf8");

test("chat attachments use authenticated multipart upload, not JSON or raw public URLs",()=>{
  assert.match(api,/uploadChatAttachment/);
  assert.match(api,/new FormData\(\)/);
  assert.match(api,/credentials:"include"/);
  assert.match(api,/chatAttachments:/);
  assert.match(api,/deleteChatAttachment:/);
});
test("user must choose project and consent before sending extracted content",()=>{
  assert.match(ui,/!projectId\|\|uploadBusy/);
  assert.match(ui,/consent/);
  assert.match(ui,/attachment_ids|pendingIds/);
  assert.match(ui,/Imagens anexadas não são interpretadas visualmente/);
});
test("chat never silently forwards uploaded images into Visual AI",()=>{
  assert.match(ui,/env\.VITE_GLIP_VISUAL_AI_ENABLED/);
  assert.match(ui,/envie a imagem também no Estúdio/);
});
