import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const source=fs.readFileSync("src/routes/Landing.tsx","utf8");
const css=fs.readFileSync("src/construtech.css","utf8");
test("image-led gallery serves all original concept assets locally below the hero",()=>{
  const names=["incorporadoras","construtoras","arquitetura","loteadoras","investidores","terreno","viabilidade","projetos","inteligencia","capital","studio","cidade"];
  for(const name of names){
    const path=`public/landing-premium/${name}.webp`;
    const bytes=fs.readFileSync(path);
    assert.equal(bytes.toString("ascii",0,4),"RIFF",path);
    assert.equal(bytes.toString("ascii",8,12),"WEBP",path);
    assert.ok(bytes.length<100000,path);
    assert.ok(source.includes(`"${name}"`),name);
  }
  const size=names.reduce((sum,n)=>sum+fs.statSync(`public/landing-premium/${n}.webp`).size,0);
  assert.ok(size<300000);
  assert.ok(source.includes('src={`/landing-premium/${name}.webp`}'));
  assert.match(source,/loading="lazy" decoding="async"/);
  assert.match(source,/Imagens conceituais geradas por IA/);
});
test("audience cards use existing consented chat and no fake provider response",()=>{
  for(const name of ["Incorporadoras","Construtoras","Escritórios de arquitetura","Loteadoras","Investidores"]) assert.ok(source.includes(name));
  assert.match(source,/id="setores"/);
  assert.match(source,/onClick=\{\(\)=>showTopic\(topic\)\}/);
  assert.match(source,/function showTopic\(topic:string\)\{setDraft\(topic\);showAgent\(\);\}/);
  assert.match(source,/if\(!consent\|\|!available\|\|sending/);
  assert.match(source,/Você consente e confirma o envio no chat real/);
});
test("gallery and journey keep responsive single- or multi-column rules",()=>{
  assert.match(css,/\.ct-sector-grid\{display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css,/\.ct-sector-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.ct-journey-grid\{grid-template-columns:1fr\}/);
});
