import {ReactNode,useEffect,useRef,useState} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import {api} from "../api";

export default function Shell({children,immersive=false}:{children:ReactNode;immersive?:boolean}){
  const location=useLocation();
  const navigate=useNavigate();
  const [owner,setOwner]=useState(false);
  const [navOpen,setNavOpen]=useState(false);
  const menuButton=useRef<HTMLButtonElement>(null);
  const closeButton=useRef<HTMLButtonElement>(null);

  useEffect(()=>{
    let active=true;
    void api.me().then(m=>{if(active)setOwner(m.role==="owner");}).catch(()=>{});
    return ()=>{active=false;};
  },[]);

  useEffect(()=>{
    if(!navOpen || !immersive)return;
    closeButton.current?.focus();
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){
        setNavOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown",onKeyDown);
    return ()=>document.removeEventListener("keydown",onKeyDown);
  },[navOpen,immersive]);

  async function logout(){
    try{await api.logout()}finally{navigate("/login",{replace:true})}
  }

  const sidebar=<aside
    id={immersive?"shell-main-navigation":undefined}
    className={`sidebar${immersive?" sidebar--drawer":""}`}
    aria-label="Navegação principal"
  >
    {immersive&&<div className="shell-drawer-top">
      <strong>Áreas da plataforma</strong>
      <button ref={closeButton} className="shell-menu-close" type="button"
        onClick={()=>{setNavOpen(false);menuButton.current?.focus();}}
        aria-label="Fechar menu principal">✕</button>
    </div>}
    <Link className="brand" to="/app"><span className="brand-mark">G</span><span>GLIP</span></Link>
    <nav aria-label="Seções da plataforma">
      <Link className={location.pathname==="/app/today"?"active":""} to="/app/today">Hoje</Link>
      <Link className={location.pathname==="/app"?"active":""} to="/app">Projetos</Link>
      <Link className={location.pathname==="/app/clients"?"active":""} to="/app/clients">Clientes</Link>
      <Link className={location.pathname==="/app/providers"?"active":""} to="/app/providers">Prestadores</Link>
      <Link className={location.pathname.includes("approvals")?"active":""} to="/app/approvals">Aprovações</Link>
      <Link className={location.pathname.includes("/intelligence")?"active":""} to="/app/intelligence">Inteligência</Link>
      {owner&&<Link className={location.pathname==="/app/admin"?"active":""} to="/app/admin">Administração</Link>}
    </nav>
    <div className="sidebar-foot">
      <span><span className="status-dot"/>GLIP domain plane</span>
      <button className="button ghost" onClick={logout}>Sair</button>
    </div>
  </aside>;

  return <div className={`app-shell${immersive?" app-shell--intelligence":""}`}>
    {immersive&&<header className="shell-focus-header">
      <button ref={menuButton} type="button" className="shell-menu-trigger"
        onClick={()=>setNavOpen(true)}
        aria-label="Abrir menu principal"
        aria-controls="shell-main-navigation"
        aria-expanded={navOpen}>
        <span aria-hidden="true">☰</span> Menu
      </button>
      <span className="shell-focus-brand"><span className="brand-mark">G</span><strong>GLIP</strong> <span> / Inteligência</span></span>
      <Link to="/app" className="shell-focus-return">Voltar aos projetos</Link>
    </header>}
    {immersive ? (navOpen&&<>
      <button className="shell-drawer-overlay" type="button" aria-label="Fechar navegação"
        onClick={()=>{setNavOpen(false);menuButton.current?.focus();}}/>
      {sidebar}
    </>) : sidebar}
    <main className="workspace">{children}</main>
  </div>;
}
