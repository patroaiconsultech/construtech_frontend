import {useEffect,useRef,useState,type FormEvent} from "react";
import {Link} from "react-router-dom";

import "../construtech.css";

const tracks=[
  ["01","Originação","Terreno, vocação, premissas e mercado em contexto."],
  ["02","Viabilidade","VGV, custos, fluxo mensal e cenários auditáveis — em validação."],
  ["03","Projetos","Arquitetura, revisões, licenças e decisões organizadas."],
  ["04","Capital","Informações estruturadas para análise e decisão."],
];
type ChatMessage={role:"user"|"assistant";content:string};
type AgentStatus={available:boolean;kind:"public_consultative_chat_v1"};
type AgentReply={kind:"public_consultative_chat_v1";reply:string;persisted:false;crm_sent:false;lead_created:false};
const starters=[
  "Tenho um terreno e quero entender a viabilidade.",
  "Como a CONSTRUTECH pode organizar projetos e documentos?",
  "Quero comparar cenários de um empreendimento.",
];
const rooms=[
  ["01","Terreno e regularidade","Matrículas, certidões e garantias."],
  ["02","Viabilidade e cenários","Premissas, versões e projeções."],
  ["03","Projetos e licenças","PDF, IFC, DWG e revisões."],
  ["04","Execução e capital","Orçamentos, marcos e dossiês."],
];
export default function Landing(){
  const [open,setOpen]=useState(false);
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [draft,setDraft]=useState("");
  const [consent,setConsent]=useState(false);
  const [available,setAvailable]=useState(false);
  const [checking,setChecking]=useState(false);
  const [sending,setSending]=useState(false);
  const [agentError,setAgentError]=useState("");
  const chatController=useRef<AbortController|null>(null);
  const modal=useRef<HTMLDivElement>(null);
  const chatEnd=useRef<HTMLDivElement>(null);
  const heroVideo=useRef<HTMLVideoElement>(null);
  const [reducedMotion,setReducedMotion]=useState(
    ()=>typeof window!=="undefined"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [videoPlayingByChoice,setVideoPlayingByChoice]=useState(false);
  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    function sync(){
      setReducedMotion(media.matches);
      setVideoPlayingByChoice(false);
      if(media.matches)heroVideo.current?.pause();
      else heroVideo.current?.play().catch(()=>{});
    }
    sync();media.addEventListener?.("change",sync);
    return ()=>media.removeEventListener?.("change",sync);
  },[]);
  function playHeroVideo(){
    const video=heroVideo.current;
    if(!video)return;
    video.play().then(()=>setVideoPlayingByChoice(true)).catch(()=>{});
  }
  function closeAgent(){
    chatController.current?.abort();
    setSending(false);
    setOpen(false);
  }
  function showAgent(){setOpen(true);requestAnimationFrame(()=>modal.current?.focus());}
  useEffect(()=>{
    if(!open)return;
    const controller=new AbortController();
    setChecking(true);setAvailable(false);setAgentError("");
    fetch("/api/v1/public/agent/status",{credentials:"omit",cache:"no-store",signal:controller.signal})
      .then(async r=>{
        if(!r.ok)throw new Error("agent_status_unavailable");
        return r.json() as Promise<AgentStatus>;
      })
      .then(data=>{if(!controller.signal.aborted)setAvailable(data.available===true&&data.kind==="public_consultative_chat_v1");})
      .catch(()=>{if(!controller.signal.aborted)setAvailable(false);})
      .finally(()=>{if(!controller.signal.aborted)setChecking(false);});
    return ()=>controller.abort();
  },[open]);
  useEffect(()=>{chatEnd.current?.scrollIntoView({block:"end",behavior:reducedMotion?"auto":"smooth"});},[messages,sending,reducedMotion]);
  useEffect(()=>()=>chatController.current?.abort(),[]);
  async function sendMessage(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const message=draft.trim();
    if(!consent||!available||sending||!message||message.length>1200)return;
    const history=messages.slice(-6);
    setMessages(prev=>[...prev,{role:"user",content:message}]);
    setDraft("");setSending(true);setAgentError("");
    const controller=new AbortController();
    chatController.current=controller;
    try{
      const result=await fetch("/api/v1/public/agent/chat",{
        method:"POST",credentials:"omit",cache:"no-store",signal:controller.signal,
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({consent:true,message,history}),
      });
      if(!result.ok)throw new Error(`agent_http_${result.status}`);
      const data=await result.json() as AgentReply;
      if(data.kind!=="public_consultative_chat_v1"||typeof data.reply!=="string"||
          !data.reply.trim()||data.persisted!==false||data.crm_sent!==false||
          data.lead_created!==false)throw new Error("agent_invalid_reply");
      if(!controller.signal.aborted)setMessages(prev=>[...prev,{role:"assistant",content:data.reply}]);
    }catch{
      if(!controller.signal.aborted)setAgentError("Não foi possível obter resposta do agente. Nenhum contato foi registrado ou enviado.");
    }finally{
      if(chatController.current===controller){chatController.current=null;setSending(false);}
    }
  }
  function newConversation(){
    chatController.current?.abort();
    setSending(false);setMessages([]);setDraft("");setAgentError("");
  }
  return <div className="ct-root" id="top">
    <header className="ct-header">
      <a className="ct-brand" href="#top" aria-label="CONSTRUTECH início"><span className="ct-mark">▥</span><span>CONSTRUTECH<small>BY PATROAI CONSULTECH</small></span></a>
      <nav aria-label="Navegação principal"><a href="#plataforma">A plataforma</a><a href="#viabilidade">Viabilidade</a><a href="#documentos">Documentos</a><a href="#inteligencia">Inteligência</a></nav>
      <button className="ct-outline" onClick={showAgent}>Conversar com a IA ↗</button>
    </header>
    <main>
      <section className="ct-hero">
        <div className="ct-hero-copy">
          <div className="ct-eyebrow">● PLATAFORMA INTELIGENTE PARA O MERCADO IMOBILIÁRIO</div>
          <h1>A inteligência de <em>todo o empreendimento.</em></h1>
          <p>Do terreno à decisão. Viabilidade, documentos, projetos e informações econômicas conectados em uma jornada rastreável.</p>
          <p className="ct-audience">Para incorporadoras, loteadoras e construtoras que precisam organizar a viabilidade e as decisões dos seus empreendimentos.</p>
          <div className="ct-buttons"><button className="ct-primary" onClick={showAgent}>Conversar com a IA ↗</button><a className="ct-link" href="#plataforma">Explorar a plataforma ↓</a></div>
          <small className="ct-disclaimer">DEMONSTRAÇÃO CONCEITUAL • MÓDULOS SUJEITOS À HOMOLOGAÇÃO</small>
        </div>
        <div className={"ct-hero-art"+(videoPlayingByChoice?" ct-hero-art--playing":"")}>
          <span className="ct-art-caption">● VISÃO 360° / EMPREENDIMENTO</span>
          <img className="ct-hero-poster" src="/construtech-hero-poster.webp" alt="" aria-hidden="true" decoding="async"/>
          <video ref={heroVideo} autoPlay={!reducedMotion} muted loop controls={videoPlayingByChoice} playsInline preload="metadata" poster="/construtech-hero-poster.webp" aria-label="Vídeo conceitual de empreendimento imobiliário"><source src="/construtech-hero.mp4" type="video/mp4"/>Seu navegador não suporta vídeo.</video>
          {reducedMotion&&!videoPlayingByChoice&&<button type="button" className="ct-video-play" onClick={playHeroVideo}>▶ Reproduzir vídeo</button>}
          <span className="ct-art-footer">DADOS + DECISÕES • UMA FONTE CONFIÁVEL</span>
        </div>
      </section>
      <section className="ct-section" id="plataforma">
        <div className="ct-section-head"><div><span className="ct-eyebrow">01 / VISÃO INTEGRADA</span><h2>Um empreendimento.<br/><em>Todas as decisões conectadas.</em></h2></div><p>Não substituímos o conhecimento de quem constrói. Organizamos o contexto técnico e econômico para decisões mais claras, com evidências, versões e responsabilidades.</p></div>
        <div className="ct-grid">{tracks.map(([n,title,desc])=><article key={n}><small>{n}</small><h3>{title}</h3><p>{desc}</p></article>)}</div>
      </section>
      <section className="ct-section ct-feature" id="viabilidade">
        <div><span className="ct-eyebrow">02 / FOCO PRINCIPAL</span><h2>Viabilidade que nasce das <em>premissas certas.</em></h2><p>Uma proposta de motor de cálculo determinístico para estruturar cenários de incorporação, preservar versões e explicar o resultado com rastreabilidade.</p><div className="ct-tags"><span>VGV</span><span>FLUXO DE CAIXA</span><span>VPL & TIR</span><span>EXPOSIÇÃO</span></div><small className="ct-muted">Motor em validação. Valores ilustrativos; não constituem recomendação de investimento.</small></div>
        <div className="ct-finance"><div className="ct-finance-head">ESTUDO DE VIABILIDADE <span>VISUAL CONCEITUAL</span></div><small>CENÁRIO BASE • EXEMPLO FICTÍCIO</small><strong>R$ 12,40 mi</strong><small>VGV ILUSTRATIVO</small><div className="ct-chart" aria-hidden="true"><svg viewBox="0 0 420 90" preserveAspectRatio="none"><path d="M0 80 L70 63 L135 70 L198 34 L258 49 L335 16 L420 38 L420 90 L0 90 Z" fill="#65c9b5" fillOpacity=".17"/><path d="M0 80 L70 63 L135 70 L198 34 L258 49 L335 16 L420 38" fill="none" stroke="#7bd5c2" strokeWidth="2"/></svg></div><div className="ct-finance-kpis"><div>CUSTO ESTIMADO<strong>R$ 8,1 mi</strong></div><div>CENÁRIOS<strong>03</strong></div></div><small className="ct-muted">Dados fictícios para ilustrar a interface, não resultados reais de clientes.</small></div>
      </section>
      <section className="ct-section ct-docs" id="documentos"><span className="ct-eyebrow">03 / DATA ROOM</span><h2>O documento certo.<br/><em>Na versão que importa.</em></h2><p>Estruture dossiês por empreendimento, conectando projetos, licenças, contratos, custos e aprovações com acesso controlado. Capacidade em evolução e sujeita à homologação.</p><div className="ct-grid">{rooms.map(([n,title,desc])=><article key={n}><small>{n}</small><h3>{title}</h3><p>{desc}</p></article>)}</div></section>
      <section className="ct-section ct-feature" id="inteligencia"><div><span className="ct-eyebrow">04 / INTELIGÊNCIA APLICADA</span><h2>Uma conversa para <em>avançar sua decisão.</em></h2><p>Nosso atendimento demonstra como a plataforma poderá orientar incorporadoras, loteadoras e parceiros. A conversa é livre e consultiva, sem questionário obrigatório. O agente não realiza decisões financeiras nem acessa informações privadas de empreendimentos.</p><button className="ct-primary" onClick={showAgent}>Explorar com o assistente ↗</button></div><div className="ct-conversation"><span className="ct-eyebrow">● ASSISTENTE COMERCIAL • PRÉVIA</span><div>Qual desafio merece prioridade no próximo empreendimento?</div><div className="ct-bubble">Comparar cenários de viabilidade.</div><div>Vamos começar pelas premissas, pelo fluxo de caixa e pelos critérios de decisão.</div></div></section>
      <section className="ct-cta"><span className="ct-eyebrow">05 / PRÓXIMO PASSO</span><h2>A próxima decisão começa com<br/><em>uma boa visão.</em></h2><p>Converse livremente sobre terreno, viabilidade, documentos ou gestão. A IA é opcional e não substitui análises profissionais; não cadastramos leads nem integramos um CRM nesta prévia.</p><button className="ct-primary" onClick={showAgent}>Conversar com o assistente ↗</button></section>
    </main>
    <footer className="ct-footer"><span><b>CONSTRUTECH</b> BY PATROAI CONSULTECH</span><span>Protótipo de apresentação • Nome provisório • 2026</span><a href="#top">Voltar ao topo ↑</a><Link to="/login?return_to=/app">Acesso à plataforma</Link></footer>
    {open && <div className="ct-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closeAgent();}}>
      <div className="ct-modal ct-modal--chat" role="dialog" aria-modal="true" aria-labelledby="ct-dialog-title" ref={modal} tabIndex={-1} onKeyDown={e=>{if(e.key==="Escape")closeAgent();}}>
        <div className="ct-modal-head">
          <span id="ct-dialog-title">✦ CONSTRUTECH • Assistente de IA</span>
          <div className="ct-chat-actions">
            <button type="button" className="ct-chat-reset" onClick={newConversation}>Nova conversa</button>
            <button type="button" onClick={closeAgent} aria-label="Fechar atendimento">✕</button>
          </div>
        </div>
        <p className="ct-modal-info">Converse sobre seu empreendimento, viabilidade, documentos e decisões. Sou um assistente de IA, não um consultor financeiro ou jurídico.</p>
        <p className="ct-chat-disclosure">Mensagens são enviadas a um provedor externo de IA somente após seu consentimento. Não envie senhas, informações sensíveis nem documentos confidenciais. Esta conversa não é salva pela CONSTRUTECH e não gera lead nem contato comercial.</p>
        <label className="ct-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Concordo com o processamento das minhas mensagens pelo provedor de IA para esta conversa.</label>
        <div className="ct-chat-status" role="status">
          {checking?"Verificando disponibilidade do agente…":available?"● Atendimento por IA habilitado; conexão validada ao enviar":"Agente temporariamente indisponível. A plataforma ainda não possui uma conexão ativa com o provedor."}
        </div>
        <div className="ct-chat-messages" aria-live="polite" aria-label="Conversa">
          <div className="ct-chat-bubble ct-chat-bubble--assistant">Olá! Posso conversar sobre como organizar as decisões do seu empreendimento. O que você gostaria de explorar?</div>
          {messages.map((item,i)=><div key={i} className={"ct-chat-bubble ct-chat-bubble--"+item.role}>{item.content}</div>)}
          {sending&&<div className="ct-chat-bubble ct-chat-bubble--assistant">Analisando sua pergunta…</div>}
          <div ref={chatEnd}/>
        </div>
        {messages.length===0&&<div className="ct-chat-starters" aria-label="Sugestões de assunto">
          {starters.map(text=><button type="button" key={text} onClick={()=>setDraft(text)}>{text}</button>)}
        </div>}
        {agentError&&<p className="ct-chat-error" role="alert">{agentError}</p>}
        <form className="ct-chat-form" onSubmit={sendMessage}>
          <label htmlFor="ct-chat-input">Sua mensagem</label>
          <textarea id="ct-chat-input" rows={3} maxLength={1200} value={draft} onChange={e=>setDraft(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();e.currentTarget.form?.requestSubmit();}}}
            placeholder="Conte um pouco do seu empreendimento ou faça uma pergunta…"/>
          <button className="ct-primary" type="submit" disabled={!available||!consent||sending||!draft.trim()}>{sending?"Consultando…":"Enviar mensagem ↗"}</button>
        </form>
        <small className="ct-chat-footnote">Sem acesso a projetos privados • Sem CRM • Sem proposta vinculante • Sem cálculos financeiros homologados</small>
      </div>
    </div>}
  </div>;
}
