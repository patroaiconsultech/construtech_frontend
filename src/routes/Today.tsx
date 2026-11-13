import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import Shell from "../components/Shell";
import {api} from "../api";

function Rows({title,items,keyName="title"}:{title:string,items:any[],keyName?:string}){
  return <section className="glass panel today-panel"><span className="section-kicker">{title}</span>
    {items?.length?items.slice(0,8).map((x:any)=><div className="today-row" key={x.id}>
      <div><strong>{x[keyName]||x.name||"Registro"}</strong><small>{x.status||x.type||""}</small></div>
      {x.project_id&&<Link to={`/app/projects/${x.project_id}`}>Abrir projeto →</Link>}
    </div>):<div className="empty">Nada pendente aqui.</div>}
  </section>
}

export default function Today(){
  const [data,setData]=useState<any>(),[error,setError]=useState("");
  useEffect(()=>{api.today().then(setData).catch(e=>setError(e.message))},[]);
  return <Shell>
    <div className="page-head"><div>
      <span className="section-kicker">HOJE</span>
      <h1>O que precisa de atenção.</h1>
      <p>Pendências, decisões, aprovações e próximos prazos em uma visão operacional.</p>
    </div></div>
    {error&&<div className="notice error">{error}</div>}
    <div className="metric-grid">
      <div className="glass metric"><small>Projetos</small><strong>{data?.counts?.projects??"—"}</strong></div>
      <div className="glass metric"><small>Tarefas pendentes</small><strong>{data?.counts?.pending_tasks??"—"}</strong></div>
      <div className="glass metric"><small>Decisões abertas</small><strong>{data?.counts?.open_decisions??"—"}</strong></div>
      <div className="glass metric"><small>Aprovações</small><strong>{data?.counts?.awaiting_approvals??"—"}</strong></div>
    </div>
    <div className="today-grid">
      <Rows title="ATRASOS" items={data?.overdue_tasks||[]}/>
      <Rows title="DECISÕES ABERTAS" items={data?.open_decisions||[]}/>
      <Rows title="AGUARDANDO APROVAÇÃO" items={data?.awaiting_approvals||[]} keyName="draft_id"/>
      <Rows title="PRÓXIMOS PRAZOS" items={data?.next_deadlines||[]}/>
    </div>
    <section className="glass panel risk-projects">
      <span className="section-kicker">PROJETOS EM RISCO</span>
      <div className="project-grid">{(data?.risk_projects||[]).map((x:any)=>
        <Link className="glass project-card" key={x.id} to={`/app/projects/${x.id}`}>
          <span className="pill">{x.status}</span><h3>{x.name}</h3><p>{x.current_stage||"Etapa não informada"}</p>
        </Link>)}</div>
      {!data?.risk_projects?.length&&<div className="empty">Nenhum risco explícito ou atraso detectado.</div>}
    </section>
  </Shell>
}
