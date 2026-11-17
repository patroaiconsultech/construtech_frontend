import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calculateDemo,scenarios} from "../src/landing/investor-demo.mjs";
const source=readFileSync("src/routes/Landing.tsx","utf8");
const css=readFileSync("src/construtech.css","utf8");

test("three illustrative scenarios reconcile from units, prices and costs",()=>{
  const expected={conservador:[54000000,48000000,6000000],base:[60000000,44000000,16000000],otimista:[66000000,40000000,26000000]};
  for(const key of Object.keys(scenarios)){
    const r=calculateDemo(key);
    assert.deepEqual([r.vgv,r.cost,r.balance],expected[key]);
    assert.equal(r.vgv,r.units*r.ticket);
    assert.equal(r.balance,r.vgv-r.cost);
    assert.equal(r.margin,r.balance/r.vgv*100);
  }
  assert.throws(()=>calculateDemo("unknown"),RangeError);
});
test("architecture is a first-class audience with honest scope and user-chosen chat topic",()=>{
  for(const term of ["escritórios de arquitetura",'id="arquitetura"',"IFC e DWG","Capacidades operacionais em validação","Explorar para meu escritório","a IA pública não recebe arquivos de projeto"]){
    assert.ok(source.includes(term),term);
  }
  assert.match(source,/function showTopic\(topic:string\)\{setDraft\(topic\);showAgent\(\);\}/);
  assert.match(source,/!consent\|\|!available/);
});
test("investor showcase explicitly labels fictional metrics and planned capabilities",()=>{
  for(const term of ['id="investidores"',"SIMULAÇÃO ILUSTRATIVA","Empreendimento fictício","Dados fictícios","Não inclui tributos","Não representa retorno líquido, TIR ou recomendação de investimento","Motor completo em validação","não agenda reuniões"]){
    assert.ok(source.includes(term),term);
  }
  assert.match(source,/aria-pressed=\{scenario===key\}/);
  assert.match(source,/className="ct-root ct-investor-premium"/);
  assert.match(css,/\.ct-investor-premium/);
});
test("autoplay retains reduced-motion behavior and explicit pause control",()=>{
  assert.match(source,/autoPlay=\{!reducedMotion\} muted loop/);
  assert.match(source,/!reducedMotion&&<button type="button" className="ct-hero-toggle"/);
  assert.match(source,/else video\.pause\(\)/);
});
