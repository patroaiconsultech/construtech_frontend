import {useEffect,useState} from "react";
import {Link,useParams,useSearchParams} from "react-router-dom";
import Shell from "../components/Shell";
import {api} from "../api";

const loaders:Record<string,(id:string)=>Promise<any[]>>={
  stages:api.stages,tasks:api.tasks,milestones:api.milestones,schedule:api.schedule,
  budgets:api.budgets,documents:api.documents,decisions:api.decisions,assets:api.assets,
  communications:api.communications,providers:api.projectProviders,memory:api.memory,executions:api.executions
};
const labels:Record<string,string>={
  stages:"Etapas",tasks:"Tarefas",milestones:"Marcos",schedule:"Timeline",
  budgets:"Orçamento",documents:"Documentos",decisions:"Decisões",assets:"Mídia / 3D / BIM",
  communications:"Comunicação",providers:"Prestadores",memory:"Memória",executions:"Execuções"
};

export default function ProjectOperations(){
  const {projectId=""}=useParams(),[q]=useSearchParams();
  const view=q.get("view")||"tasks";
  const [items,setItems]=useState<any[]>([]),[error,setError]=useState("");
  useEffect(()=>{
    const load=loaders[view];
    if(!load){setError("módulo_indisponível");return}
    setError("");load(projectId).then(setItems).catch(e=>setError(e.message));
  },[projectId,view]);
  return <Shell>
    <div className="page-head"><div>
      <span className="section-kicker">PROJECT OPERATIONS</span>
      <h1>{labels[view]||view}</h1>
      <p>Dados do domínio GLIP. Nenhuma leitura direta da Efatà.</p>
    </div><Link className="button ghost" to={`/app/projects/${projectId}`}>Voltar ao projeto</Link></div>
    {error&&<div className="notice error">{error}</div>}
    <div className="operation-list">
      {items.map((x:any)=><div className="glass operation-row" key={x.id}>
        <div><strong>{x.title||x.name||x.label||x.subject||x.summary||x.fact_key||x.capability_id||"Registro"}</strong>
        <small>{x.status||x.asset_type||x.channel||x.classification||""}</small></div>
        <code>{String(x.due_at||x.starts_at||x.created_at||x.occurred_at||"")}</code>
      </div>)}
      {!items.length&&!error&&<div className="glass empty">Nenhum registro neste módulo.</div>}
    </div>
  </Shell>
}
