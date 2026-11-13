import {useEffect,useState} from "react";import {Link} from "react-router-dom";import Shell from "../components/Shell";import {api} from "../api";
export default function Approvals(){const [items,setItems]=useState<any[]>([]);useEffect(()=>{api.approvals().then(setItems)},[]);return <Shell>
<div className="page-head"><div><span className="section-kicker">GOVERNANÇA</span><h1>Central de aprovações</h1><p>Nada sai da GLIP sem decisão humana vinculada à versão correta.</p></div></div>
<div className="approval-list">{items.length?items.map(a=><Link className="glass approval-item" key={a.id} to={`/app/projects/${a.project_id}/ghostwriter`}><div><span className="pill">aguardando aprovação</span>
<h3>Draft {a.draft_id.slice(0,8)}</h3><small>SHA {a.requested_content_sha256.slice(0,12)}…</small></div><b>Revisar →</b></Link>):<div className="glass panel empty">Nenhuma aprovação pendente.</div>}</div></Shell>}
