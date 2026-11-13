import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import Shell from "../components/Shell";
import {api} from "../api";

export default function Workspace(){
  const [projects,setProjects]=useState<any[]>([]);
  const [name,setName]=useState("");
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [creating,setCreating]=useState(false);

  async function load(){
    try{
      const items=await api.projects();
      setProjects(items);
      setError("");
    }catch(e:any){
      setError(e?.message||"Não foi possível carregar os projetos.");
    }
  }

  useEffect(()=>{
    void load();
  },[]);

  async function create(e:React.FormEvent){
    e.preventDefault();
    const projectName=name.trim();
    if(!projectName||creating)return;

    setCreating(true);
    setError("");
    setSuccess("");

    try{
      const created=await api.createProject(projectName);
      setName("");

      if(created?.id){
        setProjects(current=>{
          const withoutDuplicate=current.filter(p=>p.id!==created.id);
          return [created,...withoutDuplicate];
        });
      }else{
        await load();
      }

      setSuccess(`Projeto "${created?.name||projectName}" criado com sucesso.`);
    }catch(e:any){
      setError(e?.message||"Não foi possível criar o projeto.");
    }finally{
      setCreating(false);
    }
  }

  return <Shell>
    <div className="page-head">
      <div>
        <span className="section-kicker">WORKSPACE</span>
        <h1>Projetos</h1>
        <p>Contexto operacional, inteligência e decisões em um único fluxo.</p>
      </div>
      <Link className="button ghost" to="/app/approvals">Central de aprovações</Link>
    </div>

    {error&&<div className="notice error">{error}</div>}
    {success&&<div className="notice">{success}</div>}

    <form className="new-project" onSubmit={create}>
      <input
        value={name}
        onChange={e=>setName(e.target.value)}
        placeholder="Nome do novo projeto"
        disabled={creating}
      />
      <button className="button primary" disabled={creating||!name.trim()}>
        {creating?"Criando...":"Criar projeto"}
      </button>
    </form>

    <div className="project-grid">
      {projects.map(p=>
        <Link key={p.id} to={`/app/projects/${p.id}`} className="glass project-card">
          <div>
            <span className="pill">{p.status}</span>
            <small>CTX v{p.context_version}</small>
          </div>
          <h3>{p.name}</h3>
          <p>{p.description||"Pronto para receber contexto, tarefas e inteligência."}</p>
          <b>Abrir projeto →</b>
        </Link>
      )}
    </div>
  </Shell>
}
