import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import net from "node:net";
import {spawn} from "node:child_process";
import {once} from "node:events";

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

async function getUnusedPort() {
  const probe = net.createServer();
  const port = await listen(probe);
  await new Promise(resolve => probe.close(resolve));
  return port;
}

async function request(port, body) {
  return await new Promise((resolve, reject) => {
    const req = http.request({
      hostname:"127.0.0.1", port,
      path:"/api/v1/public/commercial/assessment",method:"POST",
      headers:{
        "content-type":"application/json",
        "origin":"https://construtech.example",
        "content-length":Buffer.byteLength(body)
      },
    }, res => {
      const chunks=[];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end",()=>resolve({status:res.statusCode,body:Buffer.concat(chunks).toString("utf8")}));
      res.on("error",reject);
    });
    req.on("error",reject);
    req.end(body);
  });
}

test("public commercial proxy permits valid Content-Length and refuses > 4096 bytes", async () => {
  let upstreamCalls=0;
  const mock=http.createServer((req,res)=>{
    upstreamCalls++;
    const chunks=[];
    req.on("data",chunk=>chunks.push(chunk));
    req.on("end",()=>{
      res.writeHead(200,{"Content-Type":"application/json"});
      res.end(JSON.stringify({received:Buffer.concat(chunks).toString("utf8")}));
    });
  });
  const backendPort=await listen(mock);
  const frontendPort=await getUnusedPort();
  const child=spawn(process.execPath,["server.mjs"],{
    cwd:process.cwd(),
    env:{...process.env,PORT:String(frontendPort),GLIP_BACKEND_URL:`http://127.0.0.1:${backendPort}`},
    stdio:["ignore","pipe","pipe"],
  });
  let stderr="";
  child.stderr.on("data",chunk=>stderr+=chunk.toString());
  try {
    let ready=false;
    for(let i=0;i<60;i++){
      if(child.exitCode!==null)break;
      try{
        const r=await fetch(`http://127.0.0.1:${frontendPort}/health`);
        if(r.status===200){ready=true;break;}
      }catch{}
      await new Promise(resolve=>setTimeout(resolve,30));
    }
    assert.ok(ready,`frontend proxy did not boot: ${stderr}`);
    const goodBody=JSON.stringify({consent_to_process:true,answers:{perfil:"Incorporadora"}});
    const good=await request(frontendPort,goodBody);
    assert.equal(good.status,200,good.body);
    assert.deepEqual(JSON.parse(good.body),{received:goodBody});
    assert.equal(upstreamCalls,1);
    const oversize=await request(frontendPort,"x".repeat(4097));
    assert.equal(oversize.status,413,oversize.body);
    assert.equal(upstreamCalls,1,"oversized request must not reach backend");
  } finally {
    child.kill();
    await new Promise(resolve=>mock.close(resolve));
    if(child.exitCode===null && child.signalCode===null){
      await Promise.race([once(child,"exit"),new Promise(resolve=>setTimeout(resolve,3000))]);
      if(child.exitCode===null)child.kill("SIGKILL");
    }
  }
});
