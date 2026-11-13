import {useEffect,useState} from "react";
import {useParams} from "react-router-dom";
import Shell from "../components/Shell";
import {api} from "../api";

export default function MemoryCenter(){
  const {projectId=""}=useParams();
  const [memory,setMemory]=useState<any[]>([]),[knowledge,setKnowledge]=useState<any[]>([]),[candidates,setCandidates]=useState<any[]>([]);
  const [key,setKey]=useState(""),[value,setValue]=useState(""),[candidate,setCandidate]=useState("");
  const load=()=>Promise.all([api.memory(projectId),api.knowledge(projectId),api.memoryCandidates(projectId)]).then(([m,k,c])=>{setMemory(m);setKnowledge(k);setCandidates(c)});
  useEffect(()=>{load()},[projectId]);
  const promote=async()=>{
    if(!candidate||!key.trim()||!value.trim())return;
    await api.promoteMemory(projectId,candidate,{fact_key:key,fact_value:value});
    setKey("");setValue("");setCandidate("");load();
  };
  return <Shell>
    <div className="page-head"><div><span className="section-kicker">KNOWLEDGE / MEMORY PLANE</span><h1>Memória do projeto</h1><p>Somente fatos explicitamente promovidos por uma pessoa entram na memória ativa.</p></div></div>
    <div className="memory-dashboard-v5">
      <section className="glass panel"><h2>Memória ativa</h2>{memory.length?memory.map(x=><div className="memory-row" key={x.id}><b>{x.fact_key}</b><p>{x.fact_value}</p><small>v{x.version} · source {x.source_approved_version_id.slice(0,8)}</small></div>):<div className="empty">Nenhuma memória ativa.</div>}</section>
      <section className="glass panel"><h2>Conhecimento autorizado</h2>{knowledge.length?knowledge.map(x=><div className="memory-row" key={x.id}><b>{x.knowledge_key}</b><p>{x.summary}</p><small>{x.classification} · v{x.version}</small></div>):<div className="empty">Nenhum item de conhecimento.</div>}</section>
    </div>
    <section className="glass panel memory-promote-v5"><div><span className="section-kicker">HUMAN GATE</span><h2>Candidatos de memória</h2><p>Uma versão aprovada pode sugerir aprendizado; ela nunca se torna memória automaticamente.</p></div>
      <select value={candidate} onChange={e=>setCandidate(e.target.value)}><option value="">Selecione um candidato pendente</option>{candidates.filter(c=>c.status==="pending").map(c=><option key={c.id} value={c.id}>{c.candidate_type} · {c.source_content_sha256.slice(0,10)}</option>)}</select>
      <input value={key} onChange={e=>setKey(e.target.value)} placeholder="Chave do fato, ex.: preferred_tone"/>
      <textarea value={value} onChange={e=>setValue(e.target.value)} rows={4} placeholder="Valor aprovado que deve ser lembrado"/>
      <button className="button primary" onClick={promote}>Promover para memória</button>
    </section>
  </Shell>
}
