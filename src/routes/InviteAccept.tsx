import {FormEvent,useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {api} from "../api";
import "../admin.css";

export default function InviteAccept(){
  // Put bearer token in a URL fragment, not query/path, to avoid sending it to the web server.
  const [token]=useState(()=>{
    const hash=new URLSearchParams(window.location.hash.slice(1));
    return hash.get("token")||"";
  });
  const [password,setPassword]=useState("");
  const [confirmation,setConfirmation]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [tenant,setTenant]=useState("");
  useEffect(()=>{if(window.location.hash)history.replaceState(null,"",window.location.pathname);},[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    if(busy)return;
    if(password.length<12||password!==confirmation){
      setError("Use ao menos 12 caracteres e confirme a mesma senha.");return;
    }
    setBusy(true);setError("");
    try{
      const result=await api.acceptInvitation(token,password);
      setTenant(result.tenant_id);setPassword("");setConfirmation("");
    }catch{
      setPassword("");setConfirmation("");
      setError("Convite inválido, expirado ou já utilizado. Peça um novo convite ao proprietário.");
    }finally{setBusy(false);}
  }
  if(tenant)return <main className="aec-accept"><div className="aec-admin-card">
    <h1>Conta ativada</h1><p>Agora entre com seu e-mail e a senha definida.</p>
    <Link to={`/login?tenant=${encodeURIComponent(tenant)}`} className="button primary">Ir para o login</Link>
  </div></main>;
  return <main className="aec-accept"><div className="aec-admin-card">
    <span className="aec-admin-eyebrow">CONVITE · ACESSO SEGURO</span>
    <h1>Ative sua conta</h1>
    <p>Escolha sua própria senha. O convite é pessoal e só pode ser utilizado uma vez.</p>
    {!token?<p role="alert">Link de convite ausente.</p>:<form onSubmit={submit}>
      <label htmlFor="new-password">Nova senha</label>
      <input id="new-password" type="password" autoComplete="new-password"
        minLength={12} required value={password} onChange={e=>setPassword(e.target.value)}
        disabled={busy}/>
      <label htmlFor="confirm-password">Confirmar senha</label>
      <input id="confirm-password" type="password" autoComplete="new-password"
        minLength={12} required value={confirmation} onChange={e=>setConfirmation(e.target.value)}
        disabled={busy}/>
      {error&&<p role="alert" className="aec-admin-error">{error}</p>}
      <button className="button primary" disabled={busy}>{busy?"Ativando…":"Ativar acesso"}</button>
    </form>}
    <Link to="/login">Voltar para o login</Link>
  </div></main>;
}
