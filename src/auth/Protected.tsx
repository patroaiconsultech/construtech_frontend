import {ReactNode,useEffect,useState} from "react";
import {useLocation} from "react-router-dom";
import {api} from "../api";
import {beginLogin} from "./session";

export default function Protected({children}:{children:ReactNode}){
  const location=useLocation();
  const [state,setState]=useState<"checking"|"ready"|"error">("checking");
  const [error,setError]=useState("");
  useEffect(()=>{
    let active=true;
    api.me().then(()=>{
      if(active)setState("ready");
    }).catch((e:any)=>{
      if(!active)return;
      if(import.meta.env.VITE_GLIP_DEV_MODE==="true"){
        setError(e.message||"membership_required");
        setState("error");
        return;
      }
      try{
        beginLogin(location.pathname+location.search);
      }catch(loginError:any){
        setError(loginError.message||"auth_not_configured");
        setState("error");
      }
    });
    return()=>{active=false};
  },[location.pathname,location.search]);
  if(state==="checking")return <div className="center"><div className="glass auth-card">
    <div className="brand"><span className="brand-mark">G</span>GLIP</div>
    <h2>Validando acesso</h2><p>Confirmando sessão e membership do produto.</p>
  </div></div>;

  if(state==="error")return <div className="center"><div className="glass auth-card">
    <div className="brand"><span className="brand-mark">G</span>GLIP</div>
    <h2>Acesso não disponível</h2><p>{error}</p>
  </div></div>;
  return <>{children}</>;
}
