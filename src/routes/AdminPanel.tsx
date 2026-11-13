import {FormEvent,useEffect,useState} from "react";
import {Link} from "react-router-dom";
import Shell from "../components/Shell";
import {api,AdminUser,AdminInvitation} from "../api";
import "../admin.css";

export default function AdminPanel(){
  const [authorized,setAuthorized]=useState<boolean|null>(null);
  const [users,setUsers]=useState<AdminUser[]>([]);
  const [invites,setInvites]=useState<AdminInvitation[]>([]);
  const [email,setEmail]=useState("");
  const [displayName,setDisplayName]=useState("");
  const [link,setLink]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");

  async function refresh(){
    const [foundUsers,foundInvites]=await Promise.all([api.adminUsers(),api.adminInvitations()]);
    setUsers(foundUsers);setInvites(foundInvites);
  }
  useEffect(()=>{
    let alive=true;
    void api.me().then(async me=>{
      if(!alive)return;
      if(me.role!=="owner"){setAuthorized(false);return;}
      setAuthorized(true);
      await refresh();
    }).catch(()=>{
      if(alive){setAuthorized(false);setError("Não foi possível carregar a administração.");}
    });
    return ()=>{alive=false;};
  },[]);

  async function invite(e:FormEvent){
    e.preventDefault();
    if(busy)return;
    setBusy(true);setError("");setNotice("");setLink("");
    try{
      const created=await api.adminInvite(email.trim(),displayName.trim());
      const activationUrl=`${window.location.origin}/invite/accept#token=${encodeURIComponent(created.activation_token)}`;
      setLink(activationUrl);
      setNotice("Convite criado. Copie o link agora: ele não será recuperável depois.");
      setEmail("");setDisplayName("");
      await refresh();
    }catch(err){
      const code=err instanceof Error?err.message:"erro";
      setError(code==="invitation_already_pending"?
        "Já existe um convite pendente para esse e-mail.":
        code==="user_already_exists"?"Esse usuário já possui credencial nesse workspace.":
        "Não foi possível criar o convite. Confira os dados e as permissões.");
    }finally{setBusy(false);}
  }
  async function revoke(id:string){
    if(busy)return;
    setBusy(true);setError("");setNotice("");setLink("");
    try{
      await api.adminRevokeInvite(id);
      setNotice("Convite revogado.");await refresh();
    }catch{setError("Não foi possível revogar o convite.");}
    finally{setBusy(false);}
  }

  if(authorized===null)return <main className="admin-state">Verificando autorização…</main>;
  if(authorized===false)return <main className="admin-state">
    <h1>Acesso restrito</h1><p>Somente proprietários podem administrar a equipe.</p>
    <Link to="/app">Voltar</Link>
  </main>;
  return <Shell>
    <div className="aec-admin">
      <header className="aec-admin-header">
        <div><span className="aec-admin-eyebrow">WORKSPACE · GOVERNANÇA</span>
          <h1>Administração</h1><p>Equipe, convites e acessos.</p>
        </div>
        <Link to="/app">Voltar aos projetos</Link>
      </header>
      {error&&<p className="aec-admin-error" role="alert">{error}</p>}
      {notice&&<p className="aec-admin-note" role="status">{notice}</p>}
      <div className="aec-admin-grid">
        <section className="aec-admin-card">
          <h2>Convidar colaborador</h2>
          <p>Envie um convite para definir a própria senha. Acesso inicial: <b>Membro</b>.</p>
          <form onSubmit={invite}>
            <label htmlFor="invite-email">E-mail</label>
            <input id="invite-email" required type="email" autoComplete="off"
              value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="nome@escritorio.com" disabled={busy}/>
            <label htmlFor="invite-name">Nome</label>
            <input id="invite-name" value={displayName} onChange={e=>setDisplayName(e.target.value)}
              maxLength={200} placeholder="Nome da pessoa" disabled={busy}/>
            <button type="submit" className="button primary" disabled={busy||!email.trim()}>
              {busy?"Processando…":"Gerar convite"}
            </button>
          </form>
          {link&&<div className="aec-admin-link">
            <p>Compartilhe somente com a pessoa convidada, por canal privado. Expira em 48 horas.</p>
            <input aria-label="Link de ativação" readOnly value={link}/>
            <button className="button" onClick={()=>void navigator.clipboard.writeText(link)}>Copiar link</button>
            <p>Este piloto não envia e-mails automaticamente.</p>
          </div>}
        </section>
        <section className="aec-admin-card">
          <h2>Equipe</h2>
          {users.length===0?<p>Nenhum usuário encontrado.</p>:<div className="aec-admin-stack">
            {users.map(u=><article key={u.id} className="aec-admin-entry">
              <div><strong>{u.display_name||u.email||"Membro"}</strong>
                <small>{u.email||"Sem e-mail nativo"}</small></div>
              <span>{u.role} · {u.active?"Ativo":"Inativo"}</span>
            </article>)}
          </div>}
        </section>
      </div>
      <section className="aec-admin-card">
        <h2>Convites</h2>
        {invites.length===0?<p>Ainda não há convites.</p>:<div className="aec-admin-stack">
          {invites.map(inv=><article className="aec-admin-entry" key={inv.id}>
            <div><strong>{inv.email}</strong>
              <small>{inv.role} · {inv.status} · validade {new Date(inv.expires_at).toLocaleString("pt-BR")}</small>
            </div>
            {inv.status==="pending"&&<button className="button ghost"
              disabled={busy} onClick={()=>void revoke(inv.id)}>Revogar</button>}
          </article>)}
        </div>}
      </section>
      <p className="aec-admin-disclaimer">
        Convite criado não comprova recebimento. Para outros papéis, sessões ou suspensão de usuários,
        será necessária uma etapa adicional de governança.
      </p>
    </div>
  </Shell>;
}
