import {useEffect,useState} from "react";
import Shell from "../components/Shell";
import {api} from "../api";

export default function Clients(){
  const [items,setItems]=useState<any[]>([]),[name,setName]=useState(""),[email,setEmail]=useState(""),[phone,setPhone]=useState(""),[error,setError]=useState("");
  const load=()=>api.clients().then(setItems).catch(e=>setError(e.message));
  useEffect(load,[]);
  async function create(e:React.FormEvent){
    e.preventDefault(); if(!name.trim())return;
    try{await api.createClient({name,email:email||null,phone:phone||null});setName("");setEmail("");setPhone("");load()}
    catch(e:any){setError(e.message)}
  }
  return <Shell>
    <div className="page-head"><div><span className="section-kicker">CLIENTES</span><h1>Relacionamentos do escritório.</h1><p>Cadastro próprio do GLIP, isolado por tenant.</p></div></div>
    {error&&<div className="notice error">{error}</div>}
    <form className="entity-form glass" onSubmit={create}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do cliente"/>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail"/>
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Telefone"/>
      <button className="button primary">Adicionar cliente</button>
    </form>
    <div className="entity-grid">{items.map(x=><div className="glass entity-card" key={x.id}>
      <span className="section-kicker">CLIENTE</span><h3>{x.name}</h3><p>{x.email||"Sem e-mail"}</p><small>{x.phone||"Sem telefone"}</small>
    </div>)}</div>
  </Shell>
}
