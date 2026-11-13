import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import {spawn} from "node:child_process";

function listen(server){
  return new Promise(resolve=>server.listen(0,"127.0.0.1",()=>resolve(server.address().port)));
}
function request(port,path,options={}){
  return new Promise((resolve,reject)=>{
    const req=http.request({host:"127.0.0.1",port,path,method:options.method||"GET",headers:options.headers||{}},res=>{
      const chunks=[];res.on("data",c=>chunks.push(c));res.on("end",()=>resolve({
        status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks).toString("utf8")
      }));
    });
    req.on("error",reject);
    if(options.body)req.write(options.body);
    req.end();
  });
}

function prepareTestDist(t){
  const dir="dist";
  const file="dist/index.html";
  const hadDir=fs.existsSync(dir);
  const hadFile=fs.existsSync(file);
  const previous=hadFile?fs.readFileSync(file):null;

  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(file,"<html>GLIP</html>");

  t.after(()=>{
    if(hadFile && previous!==null){
      fs.writeFileSync(file,previous);
    }else{
      fs.rmSync(file,{force:true});
    }
    if(!hadDir){
      fs.rmSync(dir,{recursive:true,force:true});
    }
  });
}

async function waitHealth(port){
  for(let i=0;i<40;i++){
    try{const r=await request(port,"/health");if(r.status===200)return}catch{}
    await new Promise(r=>setTimeout(r,50));
  }
  throw new Error("frontend did not start");
}

test("runtime proxy preserves request body cookie redirect and set-cookie",async(t)=>{
  prepareTestDist(t);

  const seen={};
  const backend=http.createServer((req,res)=>{
    const chunks=[];req.on("data",c=>chunks.push(c));req.on("end",()=>{
      seen.body=Buffer.concat(chunks).toString("utf8");
      seen.cookie=req.headers.cookie;
      seen.forwardedHost=req.headers["x-forwarded-host"];
      res.statusCode=302;
      res.setHeader("Location","/app");
      res.setHeader("Set-Cookie","glip_session=test; HttpOnly; Path=/");
      res.end();
    });
  });
  const backendPort=await listen(backend);
  t.after(()=>backend.close());

  const probe=http.createServer(); const frontendPort=await listen(probe); probe.close();
  const child=spawn(process.execPath,["server.mjs"],{
    env:{...process.env,PORT:String(frontendPort),GLIP_BACKEND_URL:`http://127.0.0.1:${backendPort}`},
    stdio:"ignore"
  });
  t.after(()=>child.kill());
  await waitHealth(frontendPort);

  const r=await request(frontendPort,"/api/v1/test",{
    method:"POST",
    headers:{
      "content-type":"application/json",
      "cookie":"glip_auth_state=abc",
      "x-forwarded-proto":"https",
      "x-forwarded-host":"glip.example"
    },
    body:'{"ok":true}'
  });

  assert.equal(r.status,302);
  assert.equal(r.headers.location,"/app");
  assert.match(String(r.headers["set-cookie"]),/glip_session=test/);
  assert.equal(seen.body,'{"ok":true}');
  assert.equal(seen.cookie,"glip_auth_state=abc");
  assert.equal(seen.forwardedHost,"glip.example");
});

test("runtime health exposes no backend url or secrets",async(t)=>{
  prepareTestDist(t);

  const probe=http.createServer(); const frontendPort=await listen(probe); probe.close();
  const child=spawn(process.execPath,["server.mjs"],{
    env:{...process.env,PORT:String(frontendPort),GLIP_BACKEND_URL:"http://private.example:9999",GLIP_RELEASE_ID:"1.0.0rc3"},
    stdio:"ignore"
  });
  t.after(()=>child.kill());
  await waitHealth(frontendPort);
  const r=await request(frontendPort,"/health");
  assert.equal(r.status,200);
  const body=JSON.parse(r.body);
  assert.equal(body.version,"1.0.0rc3");
  assert.equal(body.backend_proxy_configured,true);
  assert.equal(r.body.includes("private.example"),false);
});
