import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("frontend architecture explicitly forbids direct Efata browser calls",()=>{
  const arch=fs.readFileSync("ARCHITECTURE.md","utf8");
  assert.match(arch,/browser never calls Efatà directly/i);
  assert.match(arch,/GLIP Backend → ORKIO Integration Adapter → Efatà\/ORKIO/);
});
test("frontend routes include status and project operations",()=>{
  const app=fs.readFileSync("src/App.tsx","utf8");
  assert.match(app,/\/app\/status/);
  assert.match(app,/\/app\/projects\/:projectId\/operations/);
});
