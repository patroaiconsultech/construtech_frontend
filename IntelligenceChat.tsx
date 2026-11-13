import {useEffect,useMemo,useRef,useState} from "react";
import {Link} from "react-router-dom";
import Shell from "../components/Shell";
import {api,type ChatAttachment} from "../api";

export default function IntelligenceChat(){
  const [threads,setThreads]=useState<any[]>([]);
  const [messages,setMessages]=useState<any[]>([]);
  const [projects,setProjects]=useState<any[]>([]);
  const [threadId,setThreadId]=useState("");
  const [projectId,setProjectId]=useState("");
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [status,setStatus]=useState<any>();
  const [attachments,setAttachments]=useState<ChatAttachment[]>([]);
  const [pendingIds,setPendingIds]=useState<string[]>([]);
  const [uploadBusy,setUploadBusy]=useState(false);
  const [consent,setConsent]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);
  const attachmentsOn=Boolean(status?.attachments_enabled);
  const imageEditorOn=import.meta.env.VITE_GLIP_VISUAL_AI_ENABLED==="true";
  const extractionLabel=(value:string)=>({
    ready:"Texto extraído — poderá ser citado",
    image_not_analyzed:"Imagem armazenada — ainda sem interpretação visual no chat",
    no_extractable_text:"Sem texto pesquisável (pode ser PDF digitalizado)",
    page_limit_exceeded:"PDF extenso — sem leitura automática",
    extraction_failed:"Não foi possível extrair texto",
    extraction_limits_exceeded:"Documento excede o limite de extração"
  } as Record<string,string>)[value]||"Aguardando validação";
  async function loadAttachments(id:string){
    if(!attachmentsOn)return;
    const rows=await api.chatAttachments(id);
    setAttachments(rows);
    setPendingIds(rows.filter(a=>!a.linked_message_id).map(a=>a.id));
  }

  async function refresh(){
    const [ts,ps,st]=await Promise.all([api.chatThreads(),api.projects(),api.chatStatus()]);
    setThreads(ts);setProjects(ps);setStatus(st);
    if(!threadId && ts[0]?.id){
      setThreadId(ts[0].id);
      setMessages(await api.chatMessages(ts[0].id));
      if(st.attachments_enabled){
        const assets=await api.chatAttachments(ts[0].id).catch(()=>[]);
        setAttachments(assets);
        setPendingIds(assets.filter((a:ChatAttachment)=>!a.linked_message_id).map((a:ChatAttachment)=>a.id));
      }
    }
  }

  useEffect(()=>{refresh().catch(e=>setError(e.message))},[]);

  async function choose(id:string){
    setThreadId(id);setError("");
    setMessages(await api.chatMessages(id));
    if(attachmentsOn) await loadAttachments(id);
    else {setAttachments([]);setPendingIds([])}
    setConsent(false);
    const t=threads.find(x=>x.id===id);
    setProjectId(t?.project_id||"");
  }

  async function newThread(){
    setError("");
    const t=await api.createChatThread({project_id:projectId||null});
    setThreads(x=>[t,...x]);
    setThreadId(t.id);
    setMessages([]);setAttachments([]);setPendingIds([]);setConsent(false);
  }

  async function addAttachment(file:File){
    if(!projectId||uploadBusy||busy)return;
    setUploadBusy(true);setError("");
    try{
      let id=threadId;
      if(!id){
        const t=await api.createChatThread({project_id:projectId||null});
        setThreads(x=>[t,...x]);setThreadId(t.id);id=t.id;
        setMessages([]);setAttachments([]);setPendingIds([]);
      }
      const added=await api.uploadChatAttachment(id,file);
      setAttachments(x=>[...x,added]);
      setPendingIds(x=>[...x,added.id]);
    }catch(e:any){
      setError(e.message||"upload_failed");
    }finally{setUploadBusy(false)}
  }

  async function deleteAttachment(id:string){
    if(!threadId||busy||uploadBusy)return;
    try{
      await api.deleteChatAttachment(threadId,id);
      setAttachments(x=>x.filter(a=>a.id!==id));
      setPendingIds(x=>x.filter(a=>a!==id));
    }catch(e:any){setError(e.message||"attachment_delete_failed")}
  }

  async function downloadAttachment(id:string){
    try{
      if(!threadId)return;
      const {blob,filename}=await api.downloadChatAttachment(threadId,id);
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(e:any){setError(e.message||"download_failed")}
  }

  async function send(){
    const text=input.trim();
    if(!text||busy||uploadBusy)return;
    if(pendingIds.length&&!consent){
      setError("Confirme o envio do texto extraído ao provedor de IA.");return;
    }
    setBusy(true);setError("");
    let activeThreadId=threadId;
    try{
      let id=threadId;
      if(!id){
        const t=await api.createChatThread({project_id:projectId||null});
        setThreads(x=>[t,...x]);setThreadId(t.id);id=t.id;
      }
      activeThreadId=id;
      setInput("");
      const out=await api.sendChatMessage(id,text,pendingIds,consent);
      setMessages(x=>[...x,out.user_message,out.assistant_message]);
      setPendingIds([]);setConsent(false);
      const ts=await api.chatThreads();setThreads(ts);
      if(attachmentsOn)await loadAttachments(id);
    }catch(e:any){
      setError(e.message||"chat_error");
      // A 503 pode ocorrer APÓS a gravação da mensagem no backend.
      // Recarregamos o histórico antes de permitir outra tentativa.
      if(activeThreadId){
        const recent=await api.chatMessages(activeThreadId).catch(()=>null);
        if(recent){
          setMessages(recent);
          const persisted=recent.at(-1)?.role==="user"&&recent.at(-1)?.content===text;
          if(!persisted)setInput(text);
          if(attachmentsOn)await loadAttachments(activeThreadId).catch(()=>{});
        }else setInput(text);
      }else setInput(text);
    }finally{setBusy(false)}
  }

  const projectName=useMemo(
    ()=>projects.find(x=>x.id===projectId)?.name||"Contexto geral",
    [projects,projectId]
  );

  return <Shell>
    <div className="page-head">
      <div>
        <span className="section-kicker">GLIP INTELLIGENCE</span>
        <h1>Converse com o seu projeto.</h1>
        <p>Chat interno, persistente e contextualizado pelos dados autorizados do GLIP.</p>
      </div>
      <Link className="button ghost" to="/app/status">Status técnico</Link>
    </div>

    {error&&<div className="notice error" style={{marginBottom:14}}>{error}</div>}

    <div style={{display:"grid",gridTemplateColumns:"280px minmax(0,1fr)",gap:16,alignItems:"stretch"}}>
      <aside className="glass panel" style={{minHeight:"68vh",padding:18}}>
        <small style={{color:"#777"}}>CONTEXTO</small>
        <select
          value={projectId}
          onChange={e=>{
            setProjectId(e.target.value);setThreadId("");setMessages([]);
            setAttachments([]);setPendingIds([]);setConsent(false);setError("");
          }}
          style={{width:"100%",margin:"12px 0",padding:12,borderRadius:12,background:"#0d0d0f",color:"#eee",border:"1px solid var(--line)"}}
        >
          <option value="">Geral do tenant</option>
          {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button className="button primary wide" onClick={newThread}>Nova conversa</button>

        <div style={{display:"grid",gap:8,marginTop:18}}>
          {threads.map(t=><button
            key={t.id}
            onClick={()=>choose(t.id)}
            style={{
              textAlign:"left",padding:12,borderRadius:12,cursor:"pointer",
              border:"1px solid var(--line)",color:t.id===threadId?"#fff":"#8f8a81",
              background:t.id===threadId?"#ffffff0d":"transparent"
            }}
          >
            <strong style={{display:"block",fontSize:12,fontWeight:600}}>{t.title}</strong>
            <small style={{color:"#666"}}>{projects.find(p=>p.id===t.project_id)?.name||"Geral"}</small>
          </button>)}
          {!threads.length&&<div className="empty">Nenhuma conversa ainda.</div>}
        </div>
      </aside>

      <section className="glass panel" style={{minHeight:"68vh",display:"grid",gridTemplateRows:"auto 1fr auto",padding:0,overflow:"hidden"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid var(--line)",display:"flex",justifyContent:"space-between"}}>
          <div><strong>GLIP Intelligence</strong><small style={{display:"block",color:"#777",marginTop:4}}>{projectName}</small></div>
          <span className="pill">{status?.configured?"IA disponível":"Configuração pendente"}</span>
        </div>

        <div style={{padding:22,overflowY:"auto",display:"flex",flexDirection:"column",gap:14}}>
          {!messages.length&&<div className="empty">
            <p>Comece perguntando sobre prioridades, tarefas, prazos, memória ou riscos do projeto.</p>
          </div>}
          {messages.map(m=><div key={m.id} style={{
            maxWidth:"82%",alignSelf:m.role==="user"?"flex-end":"flex-start",
            padding:"14px 16px",borderRadius:16,lineHeight:1.65,whiteSpace:"pre-wrap",
            background:m.role==="user"?"rgba(232,197,126,.12)":"#ffffff09",
            border:m.role==="user"?"1px solid rgba(232,197,126,.24)":"1px solid var(--line)"
          }}>
            <small style={{display:"block",color:m.role==="user"?"var(--gold)":"#73e6a5",marginBottom:6}}>
              {m.role==="user"?"Você":"GLIP Intelligence"}
            </small>
            {m.content}
            {attachments.filter(a=>a.linked_message_id===m.id).map(a=>
              <div key={a.id} style={{marginTop:10,fontSize:12,color:"#9bc8f0"}}>
                📎 {a.filename} <small>({extractionLabel(a.extraction_status)})</small>
              </div>
            )}
          </div>)}
          {busy&&<div style={{color:"#777",padding:10}}>GLIP está analisando…</div>}
        </div>

        <div style={{padding:18,borderTop:"1px solid var(--line)"}}>
          {attachmentsOn&&<div style={{display:"grid",gap:8,marginBottom:12}}>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.docx,.png,.jpg,.jpeg,.webp" hidden
              onChange={e=>{const f=e.currentTarget.files?.[0];if(f)void addAttachment(f);e.currentTarget.value="";}}/>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <button className="button ghost" type="button"
                onClick={()=>fileRef.current?.click()}
                disabled={!projectId||busy||uploadBusy}>
                {uploadBusy?"Enviando…":"📎 Anexar documento ou imagem"}
              </button>
              <small style={{color:"#8b8b8b"}}>
                {!projectId?"Selecione um projeto para anexar.":"PDF, DOCX, TXT, MD ou imagens · até 8 MB"}
              </small>
            </div>
            {attachments.filter(a=>pendingIds.includes(a.id)).map(a=>
              <div key={a.id} style={{padding:"9px 11px",border:"1px solid var(--line)",
                borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div style={{minWidth:0}}>
                  <strong style={{fontSize:12,overflowWrap:"anywhere"}}>📎 {a.filename}</strong>
                  <small style={{display:"block",color:"#888"}}>{extractionLabel(a.extraction_status)}</small>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button type="button" className="button ghost" onClick={()=>void downloadAttachment(a.id)}>Baixar</button>
                  <button type="button" className="button ghost" onClick={()=>void deleteAttachment(a.id)}
                    title="Excluir anexo ainda não enviado">Excluir</button>
                </div>
              </div>
            )}
            {!!pendingIds.length&&<label style={{display:"flex",gap:8,fontSize:12,lineHeight:1.5,color:"#ddd"}}>
              <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>
              Autorizo o envio dos trechos de texto extraídos destes arquivos ao provedor de IA.
              Imagens anexadas não são interpretadas visualmente pelo chat nesta versão.
            </label>}
            {imageEditorOn&&projectId&&attachments.some(a=>a.mime_type.startsWith("image/"))&&
              <Link className="button ghost" to={`/app/projects/${encodeURIComponent(projectId)}/visual-ai`}>
                Abrir Estúdio Visual IA (envie a imagem também no Estúdio)
              </Link>}
          </div>}
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}}
            placeholder="Pergunte ao GLIP…"
            rows={3}
            style={{width:"100%",resize:"vertical",border:"1px solid var(--line)",borderRadius:14,background:"#0d0d0f",color:"#eee",padding:14,outline:"none"}}
          />
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
            <small style={{color:"#666"}}>Enter envia · Shift+Enter quebra linha · Documentos citados somente com texto extraído</small>
            <button className="button primary" disabled={busy||uploadBusy||!input.trim()||(pendingIds.length>0&&!consent)} onClick={send}>
              {busy?"Pensando…":"Enviar"}
            </button>
          </div>
        </div>
      </section>
    </div>
  </Shell>
}
