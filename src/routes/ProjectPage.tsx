import {useEffect,useState} from "react";
import {Link,useParams} from "react-router-dom";
import Shell from "../components/Shell";
import {api} from "../api";

const modules=[
  ["Timeline","schedule"],["Etapas","stages"],["Tarefas","tasks"],["Decisões","decisions"],
  ["Documentos","documents"],["Mídia / 3D / BIM","assets"],["Prestadores","providers"],["Orçamento","budgets"],
  ["Comunicação","communications"],["Memória","memory"],["Execuções","executions"]
];

export default function ProjectPage(){
  const {projectId=""}=useParams();
  const [p,setP]=useState<any>(),[s,setS]=useState<any>(),[ov,setOv]=useState<any>(),[memory,setMemory]=useState<any[]>([]),[executions,setExecutions]=useState<any[]>([]);
  useEffect(()=>{
    api.project(projectId).then(setP);
    api.summary(projectId).then(setS).catch(()=>{});
    api.overview(projectId).then(setOv);
    api.memory(projectId).then(setMemory);
    api.executions(projectId).then(setExecutions);
  },[projectId]);
  if(!p)return <Shell><p>Carregando…</p></Shell>;
  return <Shell>
    <div className="page-head"><div>
      <span className="section-kicker">PROJETO • CTX v{p.context_version}</span>
      <h1>{p.name}</h1><p>{p.description||"Contexto operacional GLIP."}</p>
    </div><div className="project-head-actions">
      <Link className="button ghost" to={`/app/projects/${projectId}/memory`}>Knowledge / Memory</Link>
      <Link className="button primary" to={`/app/projects/${projectId}/ghostwriter`}>HYPER SABRINA</Link>
    </div></div>

    <div className="metric-grid">
      <div className="glass metric"><small>Status</small><strong>{p.status}</strong></div>
      <div className="glass metric"><small>Pendências</small><strong>{s?.pending_items?.length??"—"}</strong></div>
      <div className="glass metric"><small>Decisões</small><strong>{ov?.counts?.decisions??"—"}</strong></div>
      <div className="glass metric"><small>Memórias ativas</small><strong>{memory.length}</strong></div>
    </div>

    <section className="module-section">
      <span className="section-kicker">PROJECT HUB</span><h2>Operação do projeto</h2>
      <div className="module-grid">
        {modules.map(([name,view])=><Link className="glass module-card" key={view}
          to={`/app/projects/${projectId}/operations?view=${view}`}>
          <small>{view.toUpperCase()}</small><strong>{name}</strong><span>Abrir →</span>
        </Link>)}
        <Link className="glass module-card" to={`/app/projects/${projectId}/artifacts`}>
          <small>ARTIFACT + BIM</small><strong>Artefatos & CAD/BIM</strong><span>Abrir →</span>
        </Link>
        <Link className="glass module-card" to={`/app/projects/${projectId}/visual-ai`}>
          <small>VISUAL AI</small><strong>Estúdio Visual IA</strong><span>Abrir →</span>
        </Link>
        <Link className="glass module-card" to="/app/approvals">
          <small>GOVERNANCE</small><strong>Aprovações</strong><span>Abrir →</span>
        </Link>
      </div>
    </section>

    <div className="project-v5-grid">
      <section className="glass panel"><span className="section-kicker">PROJECT SUMMARY</span>
        <h2>Leitura executiva</h2><p>{s?.summary||"Inteligência opcional indisponível. O projeto continua operacional."}</p>
        <h4>Próximas ações</h4><ul>{s?.next_actions?.map((x:string)=><li key={x}>{x}</li>)}</ul>
      </section>
      <section className="glass panel"><span className="section-kicker">COGNITIVE TRACE</span>
        <h2>Execuções recentes</h2>
        {executions.slice(0,5).map(x=><div className="trace-row" key={x.id}>
          <b>{x.capability_id}</b><span>{x.status}</span><small>{x.latency_ms??"—"}ms · retry {x.retry_count??0}</small>
        </div>)}
        {!executions.length&&<div className="empty">Nenhuma execução registrada.</div>}
      </section>
    </div>
  </Shell>
}
