import {useEffect,useState} from "react";
import {Link,useParams} from "react-router-dom";
import Shell from "../components/Shell";
import {api,type VisualAICapabilities,type VisualImage,type VisualJob} from "../api";
import "../visual-ai.css";

function VisualPreview({projectId,id}:{projectId:string;id:string}){
  const [url,setUrl]=useState<string>();
  const [error,setError]=useState(false);
  useEffect(()=>{
    let alive=true;
    let objectUrl:string|undefined;
    setError(false);setUrl(undefined);
    void api.visualImageContent(projectId,id).then(({blob})=>{
      if(!alive)return;
      objectUrl=URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(()=>{if(alive)setError(true);});
    return ()=>{alive=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[projectId,id]);
  if(error)return <div className="visual-ai-no-preview">Não foi possível abrir a imagem.</div>;
  if(!url)return <div className="visual-ai-no-preview">Carregando imagem…</div>;
  return <img src={url} alt="Estudo visual do projeto" loading="lazy"/>;
}

export default function VisualAIStudio(){
  const {projectId=""}=useParams();
  const [cap,setCap]=useState<VisualAICapabilities>();
  const [images,setImages]=useState<VisualImage[]>([]);
  const [jobs,setJobs]=useState<VisualJob[]>([]);
  const [selected,setSelected]=useState("");
  const [prompt,setPrompt]=useState("Mantenha o enquadramento e a volumetria da fachada. Apresente uma alternativa de revestimento com madeira natural.");
  const [allowExternal,setAllowExternal]=useState(false);
  const [classification,setClassification]=useState("project_internal");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [role,setRole]=useState("");
  const refresh=async()=>{
    const [imgs,js]=await Promise.all([api.visualImages(projectId),api.visualJobs(projectId)]);
    setImages(imgs);setJobs(js);
    setSelected(previous=>previous&&imgs.some(i=>i.id===previous)?previous:(imgs[0]?.id||""));
  };
  useEffect(()=>{
    let active=true;
    void api.visualCapabilities(projectId).then(v=>{if(active)setCap(v);}).catch(e=>{if(active)setError(e?.message||"Falha ao consultar capacidades");});
    void api.me().then(v=>{if(active)setRole(v.role||"");}).catch(()=>{});
    return ()=>{active=false;};
  },[projectId]);
  useEffect(()=>{
    if(!cap?.enabled)return;
    void refresh().catch(e=>setError(e?.message||"Não foi possível atualizar o estúdio"));
    const timer=window.setInterval(()=>{void refresh().catch(()=>{});},8000);
    return ()=>window.clearInterval(timer);
  },[projectId,cap?.enabled]);
  async function upload(file?:File){
    if(!file)return;
    setBusy(true);setError("");setMessage("");
    try{
      if(cap&&file.size>cap.max_upload_bytes)throw new Error("Imagem acima do limite permitido.");
      await api.visualUpload(projectId,file,classification);
      setMessage("Original preservado e vinculado ao projeto.");
      await refresh();
    }catch(e:any){setError(e?.message||"Falha no upload");}
    finally{setBusy(false);}
  }
  async function requestEdit(){
    if(!selected)return;
    setBusy(true);setError("");setMessage("");
    try{
      await api.visualRequestEdit(projectId,selected,prompt);
      setMessage("Edição enfileirada. Acompanhe o status abaixo; o original permanece intacto.");
      setAllowExternal(false);await refresh();
    }catch(e:any){setError(e?.message||"Falha ao solicitar edição");}
    finally{setBusy(false);}
  }
  async function decide(id:string,decision:"approved"|"rejected"){
    setBusy(true);setError("");setMessage("");
    try{
      await api.visualDecision(projectId,id,decision);
      setMessage(decision==="approved"?"Estudo visual aprovado.":"Estudo visual rejeitado.");
      await refresh();
    }catch(e:any){setError(e?.message||"Falha ao avaliar imagem");}
    finally{setBusy(false);}
  }
  async function saveImage(id:string){
    try{
      const {blob,filename}=await api.visualImageContent(projectId,id);
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=filename||"estudo-visual.png";
      document.body.appendChild(a);a.click();a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(e:any){setError(e?.message||"Falha no download");}
  }
  const canReview=["owner","admin","architect"].includes(role);
  const selectedImage=images.find(i=>i.id===selected);
  const queued=jobs.filter(j=>["queued","processing"].includes(j.status));
  return <Shell>
    <header className="page-head">
      <div>
        <span className="section-kicker">ARCHITECH · VISUAL AI · PILOTO</span>
        <h1>Estúdio Visual IA</h1>
        <p>Estudos arquitetônicos com histórico, revisão humana e original preservado.</p>
      </div>
      <Link className="button ghost" to={`/app/projects/${projectId}`}>← Projeto</Link>
    </header>
    <div className="visual-ai-notice">
      <strong>Estudo conceitual, não documentação técnica.</strong> Imagens geradas podem alterar geometria,
      proporções e materiais. Faça a conferência técnica antes de utilizar comercialmente.
    </div>
    {error&&<p className="visual-ai-alert" role="alert">{error}</p>}
    {message&&<p className="visual-ai-feedback" role="status">{message}</p>}
    {cap&&!cap.enabled&&<section className="glass panel">
      <h2>Módulo indisponível</h2>
      <p>O Visual AI ainda não foi habilitado para este ambiente. Seus outros módulos continuam funcionando.</p>
    </section>}
    {cap?.enabled&&<>
      <div className="visual-ai-layout">
        <section className="glass panel visual-ai-editor">
          <span className="section-kicker">ORIGINAIS</span>
          <h2>1. Adicionar renderização</h2>
          <p className="muted">PNG, JPG ou WEBP · até {(cap.max_upload_bytes/1_000_000).toFixed(0)} MB.</p>
          <label className="field-label" htmlFor="visual-classification">Classificação</label>
          <select id="visual-classification" value={classification} onChange={e=>setClassification(e.target.value)}>
            <option value="project_internal">Interno ao projeto</option>
            <option value="confidential">Confidencial</option>
          </select>
          <label className="upload-zone">
            <strong>Selecionar imagem</strong>
            <span>A imagem original não será sobrescrita.</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy}
              onChange={e=>{void upload(e.target.files?.[0]);e.target.value="";}}/>
          </label>
          <hr className="visual-ai-rule"/>
          <span className="section-kicker">EDIÇÃO ASSISTIDA</span>
          <h2>2. Solicitar alteração</h2>
          <label className="field-label" htmlFor="visual-image">Imagem de referência</label>
          <select id="visual-image" value={selected} onChange={e=>setSelected(e.target.value)}>
            {!images.length&&<option value="">Nenhuma imagem cadastrada</option>}
            {images.map(i=><option key={i.id} value={i.id}>{i.filename} · {i.kind==="original"?"original":"estudo"}</option>)}
          </select>
          <label className="field-label" htmlFor="visual-prompt">Instruções ao agente</label>
          <textarea id="visual-prompt" className="visual-ai-prompt" maxLength={1500}
            value={prompt} onChange={e=>setPrompt(e.target.value)}/>
          <label className="visual-ai-consent">
            <input type="checkbox" checked={allowExternal} onChange={e=>setAllowExternal(e.target.checked)}/>
            <span>Confirmo autorização para enviar esta imagem e as instruções ao provedor externo de IA.</span>
          </label>
          <button className="button primary visual-ai-action" disabled={busy||!selected||!cap.editing_available||!allowExternal||prompt.trim().length<10}
            onClick={()=>{void requestEdit();}}>{busy?"Processando…":"Gerar estudo visual"}</button>
          {!cap.editing_available&&<p className="muted">Edição por IA não configurada. Upload e histórico continuam disponíveis.</p>}
          <p className="muted">Limite de segurança: {cap.max_daily_edits} solicitações por organização em 24 horas.</p>
        </section>
        <section className="glass panel visual-ai-preview">
          <span className="section-kicker">COMPARAÇÃO</span>
          <h2>3. Conferir estudos</h2>
          {selectedImage?<div className="visual-ai-large-preview">
            <VisualPreview projectId={projectId} id={selectedImage.id}/>
            <div className="visual-ai-caption"><strong>{selectedImage.filename}</strong>
              <small>{selectedImage.kind==="original"?"Original":"Derivada"} · {selectedImage.approval_status||"Não avaliada"}</small>
            </div>
          </div>:<div className="visual-ai-no-preview">Envie uma imagem para iniciar.</div>}
          {queued.length>0&&<p className="visual-ai-pending">{queued.length} edição(ões) em processamento.</p>}
          <div className="visual-ai-gallery">
            {images.map(i=><article key={i.id} className={`visual-ai-tile ${selected===i.id?"selected":""}`}>
              <button type="button" className="visual-ai-tile-select" onClick={()=>setSelected(i.id)} aria-label={`Visualizar ${i.filename}`}>
                <VisualPreview projectId={projectId} id={i.id}/>
                <strong>{i.kind==="original"?"Original":"Estudo IA"}</strong>
                <small>{i.approval_status||"sem aprovação"}</small>
              </button>
              <div className="visual-ai-tile-actions">
                <button className="button ghost" onClick={()=>{void saveImage(i.id);}}>Baixar</button>
                {canReview&&i.kind==="derived"&&i.approval_status==="pending_review"&&<>
                  <button className="button ghost" disabled={busy} onClick={()=>{void decide(i.id,"approved");}}>Aprovar</button>
                  <button className="button ghost" disabled={busy} onClick={()=>{void decide(i.id,"rejected");}}>Rejeitar</button>
                </>}
              </div>
            </article>)}
          </div>
        </section>
      </div>
      <section className="glass panel visual-ai-jobs">
        <span className="section-kicker">OBSERVABILIDADE</span>
        <h2>Histórico de processamento</h2>
        {!jobs.length&&<p className="muted">Nenhuma edição solicitada.</p>}
        {jobs.map(j=><div className="visual-ai-job" key={j.id}>
          <span>{j.status==="completed"?"Concluído":j.status==="failed"?"Falhou":j.status==="processing"?"Em processamento":"Na fila"}</span>
          <small>{new Date(j.created_at).toLocaleString("pt-BR")}</small>
          {j.error_code&&<small>Erro: {j.error_code}</small>}
        </div>)}
      </section>
    </>}
  </Shell>;
}
