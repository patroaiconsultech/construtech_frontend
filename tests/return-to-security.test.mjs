import test from "node:test";
import assert from "node:assert/strict";
import {safeReturnTo} from "../src/auth/returnTo.mjs";
import fs from "node:fs";

test("valid internal application paths remain functional", () => {
  for (const input of ["/app", "/app/today", "/app/projects/abc?tab=costs#summary", "/app?filter=a%20b"]) {
    assert.equal(safeReturnTo(input), input);
  }
});

test("protocol-relative, backslash, traversal and external redirects are rejected", () => {
  for (const input of [
    null, undefined, "", "https://evil.example", "//evil.example",
    "/\\evil.example", "/app\\evil.example", "/app/%5c%5cevil.example",
    "/app/%2f%2fevil.example", "/app/%252f%252fevil.example",
    "/app/../../evil", "/app/../login", "/other", "/app@evil.example",
    "/app\u0000evil", "/app\n/evil", " /app",
    "/app/" + "x".repeat(2050)
  ]) {
    assert.equal(safeReturnTo(input), "/app", JSON.stringify(input));
  }
});

test("rejects traversal before URL normalization, including encoded dot segments", () => {
  for (const input of [
    "/app/../app/today",
    "/app/%2e%2e/app",
    "/app/%2e%2e/app/today",
    "/app/%2e%2e/login",
    "/app/.%2e/today",
    "/app/%2E./today",
    "/app/%2E%2e/today",
  ]) {
    assert.equal(safeReturnTo(input), "/app", JSON.stringify(input));
  }
  // A query value is not a path segment; legitimate internal navigation remains valid.
  assert.equal(safeReturnTo("/app/today?note=../demo"), "/app/today?note=../demo");
});

test("both login entry points consume the common return-path guard", () => {
  const login=fs.readFileSync(new URL("../src/routes/Login.tsx", import.meta.url), "utf8");
  const session=fs.readFileSync(new URL("../src/auth/session.ts", import.meta.url), "utf8");
  assert.match(login, /import \{safeReturnTo\} from "\.\.\/auth\/returnTo\.mjs"/);
  assert.match(session, /import \{safeReturnTo\} from "\.\/returnTo\.mjs"/);
  assert.match(login, /nav\(returnTo,\{replace:true\}\)/);
  assert.match(session, /encodeURIComponent\(target\)/);
});
