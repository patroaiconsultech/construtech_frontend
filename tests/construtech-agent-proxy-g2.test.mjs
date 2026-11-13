import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import net from "node:net";
import {spawn} from "node:child_process";
import {once} from "node:events";

async function freePort() {
  const socket=net.createServer();
  await new Promise(resolve=>socket.listen(0,"127.0.0.1",resolve));
  const port=socket.address().port;
  await new Promise(resolve=>socket.close(resolve));
  return port;
}
async function request(port,size) {
  const body=size?Buffer.alloc(size,0x41):Buffer.from(JSON.stringify({
    consent:true,message:"Um terreno com dúvidas",history:[]
  }));
  return await new Promise((resolve,reject)=>{
    const req=http.request({hostname:"127.0.0.1",port,path:"/api/v1/public/agent/chat",method:"POST",
      headers:{"content-type":"application/json","origin":"http://localhost:5174",
               "content-length":body.length}},res=>{
        const chunks=[];
        res.on("data",data=>chunks.push(data));
        res.on("end",()=>resolve({status:res.statusCode,body:Buffer.concat(chunks).toString()}));
        res.on("error",reject);
      });
    req.on("error",reject);
    req.end(body);
  });
}
test("G2 public agent proxy passes a consented request and rejects >8192 bytes",async()=>{
  let count=0;
  const upstream=http.createServer((req,res)=>{
    count++;
    const chunks=[];
    req.on("data",x=>chunks.push(x));
    req.on("end",()=>{
      res.writeHead(200,{"content-type":"application/json"});
      res.end(JSON.stringify({path:req.url,body:Buffer.concat(chunks).toString()}));
    });
  });
  await new Promise(resolve=>upstream.listen(0,"127.0.0.1",resolve));
  const backend=upstream.address().port;
  const port=await freePort();
  const child=spawn(process.execPath,["server.mjs"],{
    cwd:process.cwd(),env:{...process.env,PORT:String(port),GLIP_BACKEND_URL:`http://127.0.0.1:${backend}`},
    stdio:["ignore","pipe","pipe"],
  });
  let err="";
  child.stderr.on("data",x=>err+=x.toString());
  try{
    let ready=false;
    for(let i=0;i<70;i++){
      if(child.exitCode!==null)break;
      try{if((await fetch(`http://127.0.0.1:${port}/health`)).ok){ready=true;break;}}catch{}
      await new Promise(r=>setTimeout(r,30));
    }
    assert.ok(ready,err);
    const ok=await request(port,0);
    assert.equal(ok.status,200,ok.body);
    assert.equal(JSON.parse(ok.body).path,"/api/v1/public/agent/chat");
    assert.equal(count,1);
    const large=await request(port,8193);
    assert.equal(large.status,413,large.body);
    assert.equal(count,1);
  }finally{
    child.kill();
    await new Promise(resolve=>upstream.close(resolve));
    if(child.exitCode===null && child.signalCode===null){
      await Promise.race([once(child,"exit"),new Promise(r=>setTimeout(r,3000))]);
      if(child.exitCode===null)child.kill("SIGKILL");
    }
  }
});
