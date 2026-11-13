import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const css=readFileSync(new URL("../src/intelligence-workspace.css",import.meta.url),"utf8");
const global=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8");

test("P0.4: immersive app grid beats global .app-shell at any CSS load order",()=>{
  assert.match(global,/\.app-shell\s*\{display:grid;grid-template-columns:240px 1fr/);
  assert.match(css,/\.app-shell\.app-shell--intelligence\s*\{[\s\S]*?grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css,/\.app-shell\.app-shell--intelligence\s*>\s*\.shell-focus-header\s*\{[\s\S]*?grid-column:1;[\s\S]*?grid-row:1/);
  assert.match(css,/\.app-shell\.app-shell--intelligence\s*>\s*main\.workspace\s*\{[\s\S]*?grid-column:1;[\s\S]*?grid-row:2/);
  assert.match(css,/\.intel-chat\s*\{[\s\S]*?grid-template-rows:auto minmax\(0,1fr\) auto/);
  assert.match(css,/\.intel-message-scroll\s*\{min-height:0;overflow-y:auto/);
  assert.match(css,/\.intel-composer\s*\{[\s\S]*?border-top:/);
});
