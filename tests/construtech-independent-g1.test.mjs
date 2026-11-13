import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,mkdtempSync,copyFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {spawnSync} from "node:child_process";

test("independent project does not inherit GLIP Premium backend target",()=>{
  const env = readFileSync(".env.example","utf8");
  assert.match(env,/^GLIP_BACKEND_URL=\s*$/m);
  assert.ok(!env.includes("glip-backend.railway.internal"));
  const server=readFileSync("server.mjs","utf8");
  assert.match(server,/process\.env\.GLIP_BACKEND_URL \|\| ""/);
});

test("release provenance uses actual independent repository identity or remains unknown",()=>{
  const script=resolve("scripts/release-provenance.mjs");
  const temp=mkdtempSync(join(tmpdir(),"ct-g1-provenance-"));
  const dst=join(temp,"release-provenance.mjs");
  copyFileSync(script,dst);
  try{
    let run=spawnSync(process.execPath,[dst],{
      cwd:temp,encoding:"utf8",env:{
        ...process.env,
        GITHUB_REPOSITORY:"patroaiconsultech/construtech-future-frontend",
        CONSTRUTECH_SOURCE_REPOSITORY:"",
        GLIP_PROVENANCE_COMMIT_SHA:"",
      }
    });
    assert.equal(run.status,0,run.stderr);
    let evidence=JSON.parse(readFileSync(join(temp,"RELEASE_PROVENANCE.json"),"utf8"));
    assert.equal(evidence.repository,"patroaiconsultech/construtech-future-frontend");
    assert.equal(evidence.repository_provenance,"GITHUB_REPOSITORY_ENV");
    assert.ok(!JSON.stringify(evidence).includes("Arquitech-Glip-Premium"));
  }finally{
    // Cleanup only the temporary directory this test created.
    rmSync(temp,{recursive:true,force:true});
  }
});
