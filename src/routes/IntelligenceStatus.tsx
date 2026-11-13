import {useEffect,useState} from "react";
import Shell from "../components/Shell";
import {api} from "../api";

function label(mode:string){
  if(mode==="enabled"||mode==="connected")return "Disponível";
  if(mode==="pending_external")return "Em preparação";
  if(mode==="probe")return "Sonda ativa";
  if(mode==="capability_v1")return "Capability v1";
  if(mode==="disabled")return "Desativado";
  return mode||"Indisponível";
}

export default function IntelligenceStatus(){
  const [system,setSystem]=useState<any>(),[orkio,setOrkio]=useState<any>(),[error,setError]=useState("");
  useEffect(()=>{
    Promise.all([api.systemStatus(),api.orkioStatus()])
      .then(([s,o])=>{setSystem(s);setOrkio(o)})
      .catch(e=>setError(e.message));
  },[]);
  const items=[
    ["Inteligência ORKIO",orkio?.status||system?.intelligence?.mode],
    ["Realtime",system?.realtime?.mode],
    ["Voz",system?.voice?.mode],
    ["Avatar",system?.avatar?.mode],
  ];
  return <Shell>
    <div className="page-head"><div>
      <span className="section-kicker">INTELLIGENCE STATUS</span>
      <h1>Integrações sob controle.</h1>
      <p>O GLIP continua operacional mesmo quando recursos externos estão em evolução.</p>
    </div></div>
    {error&&<div className="notice error">{error}</div>}
    <div className="integration-grid">
      {items.map(([name,mode])=><div className="glass integration-card" key={name}>
        <small>{name}</small><strong>{label(String(mode||""))}</strong>
        <code>{String(mode||"não comprovado")}</code>
      </div>)}
    </div>
    <section className="glass panel status-note">
      <span className="section-kicker">ARQUITETURA</span>
      <h2>Realtime, voz e avatar não bloqueiam o núcleo.</h2>
      <p>Projetos, tarefas, cronograma, documentos, orçamento, decisões, comunicação,
      aprovações e memória continuam no banco próprio do GLIP. Quando a Efatà estabilizar
      os contratos externos, estes recursos serão ativados por feature flag e contrato versionado.</p>
    </section>
  </Shell>
}
