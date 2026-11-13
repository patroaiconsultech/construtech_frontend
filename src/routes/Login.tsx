import {FormEvent,useEffect,useState} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import {api} from "../api";
import "../ux01.css";
import {safeReturnTo} from "../auth/returnTo.mjs";

export default function Login(){
  const nav=useNavigate();
  const location=useLocation();
  const q=new URLSearchParams(location.search);
  const returnTo=safeReturnTo(q.get("return_to"));
  const [tenant,setTenant]=useState(q.get("tenant")||import.meta.env.VITE_GLIP_DEFAULT_TENANT_ID||"");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    api.me().then(()=>nav(returnTo,{replace:true})).catch(()=>{});
  },[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!tenant.trim()||!email.trim()||!password){
      setError("Preencha espaço de trabalho, e-mail e senha.");
      return;
    }

    setBusy(true);
    setError("");
    try{
      await api.nativeLogin(tenant.trim(),email.trim(),password);
      await api.me();
      nav(returnTo,{replace:true});
    }catch{
      setPassword("");
      setError("Não foi possível entrar com esses dados.");
    }finally{
      setBusy(false);
    }
  }

  return <main className="ux01-auth">
    <section className="ux01-auth-story" aria-label="GLIP">
      <Link className="ux01-brand" to="/" aria-label="Voltar para a página inicial">
        <span className="ux01-brand-mark">G</span><span>GLIP</span>
      </Link>
      <div className="ux01-auth-story-copy">
        <span className="ux01-kicker">PROJECT INTELLIGENCE FOR ARCHITECTURE</span>
        <h1>Projetos com continuidade.<br/><em>Inteligência com contexto.</em></h1>
        <p>Entre no seu espaço de trabalho para acessar projetos, operação e GLIP Intelligence com o contexto certo.</p>
      </div>
      <div className="ux01-auth-trust" aria-label="Princípios de acesso">
        <span>Contexto isolado por workspace</span>
        <span>Sessão protegida</span>
        <span>Autoridade humana</span>
      </div>
    </section>

    <section className="ux01-auth-panel">
      <form className="ux01-auth-card" onSubmit={submit} aria-busy={busy}>
        <div className="ux01-auth-mobile-brand">
          <Link className="ux01-brand" to="/"><span className="ux01-brand-mark">G</span><span>GLIP</span></Link>
        </div>
        <span className="ux01-kicker">ACESSO À PLATAFORMA</span>
        <h2>Bem-vindo de volta.</h2>
        <p className="ux01-auth-intro">Use as credenciais do seu espaço de trabalho GLIP.</p>

        {!(q.get("tenant")||import.meta.env.VITE_GLIP_DEFAULT_TENANT_ID)&&<>
          <label htmlFor="workspace">Espaço de trabalho</label>
          <input id="workspace" autoComplete="organization" value={tenant}
            onChange={e=>setTenant(e.target.value)} placeholder="identificador do escritório"
            disabled={busy} required/>
          <small className="ux01-field-help">Identificador do seu escritório na GLIP.</small>
        </>}

        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="voce@empresa.com"
          disabled={busy}
          required
        />

        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          disabled={busy}
          required
        />

        <div className="ux01-auth-message" role="status" aria-live="polite">
          {error&&<div className="notice error">{error}</div>}
        </div>

        <button type="submit" className="button primary wide" disabled={busy}>
          {busy?"Entrando…":"Entrar"}
        </button>

        <div className="ux01-auth-note">Acesso restrito a usuários autorizados do workspace.</div>
      </form>
    </section>
  </main>;
}
