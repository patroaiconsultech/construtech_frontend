import {useEffect,useMemo,useRef,useState} from "react";
import {Link} from "react-router-dom";
import Shell from "../components/Shell";
import "../intelligence-workspace.css";
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
  const [threadsOpen,setThreadsOpen]=useState(false);
  const messageScrollRef=useRef<HTMLDivElement>(null);
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
      setProjectId(ts[0].project_id||"");
      setMessages(await api.chatMessages(ts[0].id));
      if(st.attachments_enabled){
        const assets=await api.chatAttachments(ts[0].id).catch(()=>[]);
        setAttachments(assets);
        setPendingIds(assets.filter((a:ChatAttachment)=>!a.linked_message_id).map((a:ChatAttachment)=>a.id));
      }
    }
  }

  useEffect(()=>{refresh().catch(e=>setError(e.message))},[]);
  useEffect(()=>{
    const scroll=messageScrollRef.current;
    if(scroll)scroll.scrollTop=scroll.scrollHeight;
  },[messages,threadId,busy]);

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

  const attachmentHint= !status
    ? "Verificando anexos…"
    : !attachmentsOn
      ? "Anexos não habilitados neste ambiente. É necessário ativar o backend e o armazenamento privado."
      : !projectId
        ? "Selecione um projeto para anexar arquivos."
        : "PDF, DOCX, TXT, MD e imagens · até 8 MB";
  const canUpload=attachmentsOn&&Boolean(projectId)&&!busy&&!uploadBusy;

  function changeProject(nextId:string){
    setProjectId(nextId);setThreadId("");setMessages([]);
    setAttachments([]);setPendingIds([]);setConsent(false);setError("");
  }

  return <Shell immersive>
    <div className="intel-workspace">
      <header className="intel-toolbar">
        <div className="intel-toolbar-primary">
          <button type="button" className="intel-threads-toggle"
            onClick={()=>setThreadsOpen(x=>!x)}
            aria-controls="intel-thread-panel" aria-expanded={threadsOpen}
            aria-label={threadsOpen?"Ocultar conversas":"Mostrar conversas"}>
            <span aria-hidden="true">☷</span> Conversas
          </button>
          <button type="button" className="intel-new-thread" disabled={busy||uploadBusy}
            onClick={async()=>{
              try{await newThread();}
              catch(e:any){setError(e.message||"thread_creation_failed")}
            }}>+ Nova conversa</button>
          <div className="intel-toolbar-title">
            <strong>Inteligência</strong>
            <span>Converse com seus projetos e documentos autorizados</span>
          </div>
        </div>
        <div className="intel-toolbar-actions">
          <label className="intel-context-label" htmlFor="intel-project-select">Projeto
            <select id="intel-project-select" value={projectId}
              onChange={e=>changeProject(e.target.value)}
              disabled={busy||uploadBusy}>
              <option value="">Geral do tenant</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <Link className="intel-status-link" to="/app/status">Status técnico</Link>
        </div>
      </header>

      {error&&<div className="intel-error notice error" role="alert">{error}</div>}

      <div className={`intel-layout${threadsOpen?" intel-layout--threads-open":""}`}>
        {threadsOpen&&<button type="button" className="intel-threads-overlay"
          onClick={()=>setThreadsOpen(false)} aria-label="Fechar lista de conversas"/>}
        <aside id="intel-thread-panel" className="intel-threads" hidden={!threadsOpen}
          aria-label="Histórico de conversas">
          <div className="intel-threads-head">
            <strong>Conversas</strong>
            <button type="button" className="intel-threads-close"
              onClick={()=>setThreadsOpen(false)} aria-label="Ocultar conversas">✕</button>
          </div>
          <button className="button primary wide" type="button" onClick={async()=>{
            try{await newThread();setThreadsOpen(false);}
            catch(e:any){setError(e.message||"thread_creation_failed")}
          }} disabled={busy||uploadBusy}>+ Nova conversa</button>
          <div className="intel-threads-list">
            {threads.map(t=><button key={t.id} type="button"
              className={`intel-thread-item${t.id===threadId?" is-selected":""}`}
              aria-current={t.id===threadId?"true":undefined}
              onClick={async()=>{
                try{await choose(t.id);setThreadsOpen(false);}
                catch(e:any){setError(e.message||"thread_load_failed")}
              }}>
              <strong>{t.title||"Conversa sem título"}</strong>
              <small>{projects.find(p=>p.id===t.project_id)?.name||"Geral"}</small>
            </button>)}
            {!threads.length&&<p className="intel-muted">Nenhuma conversa ainda.</p>}
          </div>
        </aside>

        <section className="intel-chat" aria-label="Conversa com GLIP Intelligence">
          <div className="intel-chat-header">
            <div><strong>GLIP Intelligence</strong>
              <span>{projectName}</span>
            </div>
            <span className="pill">{status?.configured?"IA disponível":"Configuração pendente"}</span>
          </div>

          <div className="intel-message-scroll" ref={messageScrollRef}
            role="log" aria-label="Mensagens da conversa">
            <div className="intel-message-column">
              {!messages.length&&<div className="intel-empty">
                <strong>Seu espaço de trabalho com IA</strong>
                <p>Pergunte sobre prioridades, tarefas, prazos e riscos. Selecione um projeto para anexar documentos.</p>
                <button className="intel-inline-action" type="button" onClick={()=>setThreadsOpen(true)}>
                  Ver conversas anteriores
                </button>
              </div>}
              {messages.map(m=><div key={m.id}
                className={`intel-message ${m.role==="user"?"intel-message--user":"intel-message--assistant"}`}>
                <small>{m.role==="user"?"Você":"GLIP Intelligence"}</small>
                <div className="intel-message-content">{m.content}</div>
                {attachments.filter(a=>a.linked_message_id===m.id).map(a=>
                  <div key={a.id} className="intel-message-asset">
                    📎 {a.filename} <small>({extractionLabel(a.extraction_status)})</small>
                  </div>
                )}
              </div>)}
              {busy&&<div className="intel-muted" role="status">GLIP está analisando…</div>}
            </div>
          </div>

          <div className="intel-composer">
            <div className="intel-composer-inner">
              <input ref={fileRef} type="file"
                accept=".pdf,.txt,.md,.docx,.png,.jpg,.jpeg,.webp"
                className="intel-hidden-input"
                aria-label="Selecionar documento ou imagem"
                onChange={e=>{
                  const file=e.currentTarget.files?.[0];
                  if(file)void addAttachment(file);
                  e.currentTarget.value="";
                }}/>

              {!!pendingIds.length&&<div className="intel-attachment-list" aria-label="Anexos pendentes">
                {attachments.filter(a=>pendingIds.includes(a.id)).map(a=>
                  <div key={a.id} className="intel-attachment-item">
                    <div><strong>📎 {a.filename}</strong>
                      <small>{extractionLabel(a.extraction_status)}</small>
                    </div>
                    <div className="intel-attachment-actions">
                      <button type="button" onClick={()=>void downloadAttachment(a.id)}>Baixar</button>
                      <button type="button" onClick={()=>void deleteAttachment(a.id)}
                        disabled={busy||uploadBusy}>Excluir</button>
                    </div>
                  </div>
                )}
                <label className="intel-consent">
                  <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>
                  Autorizo o envio dos trechos de texto extraídos destes arquivos ao provedor de IA.
                  Imagens anexadas não são interpretadas visualmente pelo chat nesta versão.
                </label>
              </div>}

              {imageEditorOn&&projectId&&attachments.some(a=>a.mime_type.startsWith("image/"))&&
                <Link className="intel-editor-link" to={`/app/projects/${encodeURIComponent(projectId)}/visual-ai`}>
                  Abrir Estúdio Visual IA (envie a imagem também no Estúdio)
                </Link>}

              <div className="intel-compose-box">
                <button className="intel-attach-trigger" type="button"
                  aria-label="Anexar documento ou imagem"
                  title={attachmentHint} disabled={!canUpload}
                  onClick={()=>fileRef.current?.click()}>
                  <span aria-hidden="true">📎</span><span className="intel-attach-label">Anexar</span>
                </button>
                <textarea value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){
                    e.preventDefault();void send();
                  }}}
                  placeholder="Pergunte ao GLIP ou descreva o que deseja analisar…"
                  aria-label="Mensagem para o GLIP" rows={2}/>
                <button className="intel-send" type="button"
                  disabled={busy||uploadBusy||!input.trim()||(pendingIds.length>0&&!consent)}
                  onClick={()=>void send()}>{busy?"Pensando…":"Enviar"}</button>
              </div>
              <div className="intel-composer-foot">
                <span className={!attachmentsOn?"intel-attachment-unavailable":""}
                  role={!attachmentsOn?"status":undefined}>{attachmentHint}</span>
                <span>Enter envia · Shift+Enter nova linha</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </Shell>;
}
