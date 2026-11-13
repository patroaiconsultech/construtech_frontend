import {useEffect,useState} from "react";
import Shell from "../components/Shell";
import {api} from "../api";

export default function Providers(){
  const [items,setItems]=useState<any[]>([]),[name,setName]=useState(""),[specialty,setSpecialty]=useState(""),[email,setEmail]=useState(""),[error,setError]=useState("");
  const load=()=>api.providers().then(setItems).catch(e=>setError(e.message));
  useEffect(load,[]);
  async function create(e:React.FormEvent){
    e.preventDefault(); if(!name.trim())return;
    try{await api.createProvider({name,specialty:specialty||null,email:email||null});setName("");setSpecialty("");setEmail("");load()}
    catch(e:any){setError(e.message)}
  }
  return <Shell>
    <div className="page-head"><div><span className="section-kicker">PRESTADORES</span><h1>Rede técnica do projeto.</h1><p>Fornecedores e especialistas permanecem no domínio GLIP.</p></div></div>
    {error&&<div className="notice error">{error}</div>}
    <form className="entity-form glass" onSubmit={create}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome"/>
      <input value={specialty} onChange={e=>setSpecialty(e.target.value)} placeholder="Especialidade"/>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail"/>
      <button className="button primary">Adicionar prestador</button>
    </form>
    <div className="entity-grid">{items.map(x=><div className="glass entity-card" key={x.id}>
      <span className="section-kicker">{x.specialty||"PRESTADOR"}</span><h3>{x.name}</h3><p>{x.email||"Sem e-mail"}</p><small>{x.active===false?"Inativo":"Ativo"}</small>
    </div>)}</div>
  </Shell>
}
