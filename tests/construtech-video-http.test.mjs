import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";
import {once} from "node:events";

test("MP4 supports MIME, byte ranges, HEAD, 416, and short cache", async () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"ct-video-"));
  const dist=path.join(dir,"dist");
  fs.mkdirSync(dist);
  fs.copyFileSync("server.mjs",path.join(dir,"server.mjs"));
  fs.writeFileSync(path.join(dir,"package.json"),'{"type":"module"}');
  fs.writeFileSync(path.join(dist,"index.html"),"<html>test</html>");
  const sample=Buffer.from("0123456789abcdef");
  fs.writeFileSync(path.join(dist,"test.mp4"),sample);
  const net=await import("node:net");
  const probe=net.createServer();
  probe.listen(0,"127.0.0.1");
  await once(probe,"listening");
  const port=probe.address().port;
  await new Promise((r)=>probe.close(r));
  const child=spawn(process.execPath,["server.mjs"],{cwd:dir,env:{...process.env,PORT:String(port)},stdio:["ignore","pipe","pipe"]});
  try {
    let ready=false;
    for(let i=0;i<50;i++){
      if(child.exitCode!==null) throw Error("server terminated unexpectedly");
      try {const r=await fetch(`http://127.0.0.1:${port}/health`);ready=r.ok;if(ready)break;}
      catch {}
      await new Promise(r=>setTimeout(r,100));
    }
    assert.ok(ready,"server started");
    const url=`http://127.0.0.1:${port}/test.mp4`;
    const full=await fetch(url);
    assert.equal(full.status,200);
    assert.match(full.headers.get("content-type"),/^video\/mp4/);
    assert.equal(full.headers.get("accept-ranges"),"bytes");
    assert.equal(full.headers.get("content-length"),"16");
    assert.match(full.headers.get("cache-control"),/max-age=3600/);
    assert.deepEqual(Buffer.from(await full.arrayBuffer()),sample);
    const part=await fetch(url,{headers:{Range:"bytes=0-3"}});
    assert.equal(part.status,206);
    assert.equal(part.headers.get("content-range"),"bytes 0-3/16");
    assert.equal(await part.text(),"0123");
    const suffix=await fetch(url,{headers:{Range:"bytes=-4"}});
    assert.equal(suffix.status,206);
    assert.equal(await suffix.text(),"cdef");
    const invalid=await fetch(url,{headers:{Range:"bytes=99-"}});
    assert.equal(invalid.status,416);
    assert.equal(invalid.headers.get("content-range"),"bytes */16");
    const head=await fetch(url,{method:"HEAD",headers:{Range:"bytes=0-3"}});
    assert.equal(head.status,206);
    assert.equal(head.headers.get("content-length"),"4");
    assert.equal(await head.text(),"");
  } finally {
    child.kill();
    if(child.exitCode===null)await Promise.race([once(child,"exit"),new Promise(r=>setTimeout(r,1500))]);
    fs.rmSync(dir,{recursive:true,force:true});
  }
});
