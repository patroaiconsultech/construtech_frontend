import {useEffect,useRef,useState,type FormEvent} from "react";
import {Link} from "react-router-dom";

import "../construtech.css";
import { scenarios, calculateDemo, type DemoScenario } from "../landing/investor-demo.mjs";

const tracks=[
  ["01","Originação","Terreno, vocação, premissas e mercado em contexto."],
  ["02","Viabilidade","VGV, custos, fluxo mensal e cenários auditáveis — em validação."],
  ["03","Projetos","Arquitetura, revisões, licenças e decisões organizadas."],
  ["04","Inteligência","Contexto, perguntas e orientação consultiva por IA."],
  ["05","Capital","Organização de informações para análise e decisão."],
];
const audiences=[
  ["incorporadoras","Incorporadoras","Viabilidade e estruturação de oportunidades.","Quero estruturar uma incorporação. Como a CONSTRUTECH pode ajudar?"],
  ["construtoras","Construtoras","Planejamento, projetos e contexto de custos.","Como a CONSTRUTECH pode apoiar uma construtora?"],
  ["arquitetura","Escritórios de arquitetura","Concepção, estudos e documentação de projetos.","Tenho um escritório de arquitetura. Como a plataforma poderia apoiar nossos projetos?"],
  ["loteadoras","Loteadoras","Potencial de glebas e premissas de desenvolvimento.","Quero desenvolver um loteamento. Por onde começo?"],
  ["investidores","Investidores","Premissas, cenários e análise de oportunidades.","Que informações devo avaliar antes de investir em um empreendimento?"],
] as const;
const journeyImages=["terreno","viabilidade","projetos","inteligencia","capital"] as const;
function ConceptImage({name,alt,className}: {name:string;alt:string;className?:string}){
  return <img className={className} src={`/landing-premium/${name}.webp`} alt={alt} loading="lazy" decoding="async"/>;
}
type ChatMessage={role:"user"|"assistant";content:string};
type AgentStatus={available:boolean;kind:"public_consultative_chat_v1"};
type AgentReply={kind:"public_consultative_chat_v1";reply:string;persisted:false;crm_sent:false;lead_created:false};
const starters=[
  "Tenho um terreno e quero entender a viabilidade.",
  "Como a CONSTRUTECH pode organizar projetos e documentos?",
  "Quero comparar cenários de um empreendimento.",
  "Tenho um escritório de arquitetura. Como a plataforma poderia apoiar nossos projetos?",
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
  const [videoPaused,setVideoPaused]=useState(true);
  const [scenario,setScenario]=useState<DemoScenario>("base");
  const demo=calculateDemo(scenario);
  const money=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(v);
  const millions=(v:number)=>`R$ ${(v/1e6).toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1})} mi`;
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
  function showTopic(topic:string){setDraft(topic);showAgent();}
  function showDemo(){showTopic("Gostaria de entender a demonstração da CONSTRUTECH e conhecer as funcionalidades disponíveis.");}
  function toggleHero(){const video=heroVideo.current;if(!video)return;if(video.paused)video.play().catch(()=>{});else video.pause();}
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
  return <div className="ct-root ct-investor-premium" id="top">
    <header className="ct-header">
      <a className="ct-brand" href="#top" aria-label="CONSTRUTECH início"><svg className="ct-logo-symbol" viewBox="0 0 44 44" fill="none" aria-hidden="true"><path d="M5 39V25l10-6v20M15 39V12l12-7v34M27 39V20l12-7v26M3 39h38" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg><span>CONSTRU<span className="ct-word-accent">TECH</span><small>BY PATROAI CONSULTECH</small></span></a>
      <nav aria-label="Navegação principal"><a href="#plataforma">Plataforma</a><a href="#viabilidade">Viabilidade</a><a href="#arquitetura">Arquitetura</a><a href="#documentos">Data Room</a><a href="#investidores">Investidores</a></nav>
      <div className="ct-header-actions"><Link className="ct-outline ct-login-link" to="/login?return_to=/app">Entrar</Link><button className="ct-outline" onClick={showAgent}>Falar com a IA ↗</button></div>
    </header>
    <main>
      <section className="ct-hero">
        <div className="ct-hero-copy">
          <div className="ct-eyebrow">PROPTECH <span>·</span> VIABILIDADE <span>·</span> PROJETOS <span>·</span> CAPITAL</div>
          <h1>A inteligência de todo o <em>empreendimento.</em></h1>
          <p>Do terreno ao capital. Conecte estudos, projetos, documentação e inteligência econômica para orientar decisões de desenvolvimento imobiliário.</p>
          <p className="ct-audience">Para <strong>incorporadoras, loteadoras, construtoras, escritórios de arquitetura e investidores</strong> que buscam clareza em decisões de alto valor.</p>
          <div className="ct-buttons"><button className="ct-primary ct-gold" onClick={showDemo}>Solicitar demonstração ↗</button><a className="ct-outline ct-explore" href="#plataforma">Explorar plataforma ↓</a><button className="ct-primary ct-live-cta" onClick={showAgent}>✦ Falar com a IA ↗</button></div>
          <small className="ct-demo-note">Demonstração via chat, sem agendamento ou registro de lead.</small>
          <small className="ct-disclaimer">PRÉVIA COMERCIAL • MÓDULOS SUJEITOS À HOMOLOGAÇÃO</small>
        </div>
        <div className={"ct-hero-art"+(videoPlayingByChoice?" ct-hero-art--playing":"")}>
          <span className="ct-art-caption">● VISÃO 360° / EMPREENDIMENTO</span>
          <img className="ct-hero-poster" src="/construtech-hero-poster.webp" alt="" aria-hidden="true" decoding="async"/>
          <video ref={heroVideo} autoPlay={!reducedMotion} muted loop controls={videoPlayingByChoice} playsInline onPlay={()=>setVideoPaused(false)} onPause={()=>setVideoPaused(true)} preload="metadata" poster="/construtech-hero-poster.webp" aria-label="Vídeo conceitual de empreendimento imobiliário"><source src="/construtech-hero.mp4" type="video/mp4"/>Seu navegador não suporta vídeo.</video>
          {reducedMotion&&!videoPlayingByChoice&&<button type="button" className="ct-video-play" onClick={playHeroVideo}>▶ Reproduzir vídeo</button>}
          {!reducedMotion&&<button type="button" className="ct-hero-toggle" onClick={toggleHero}>{videoPaused?"▶ Reproduzir vídeo":"Ⅱ Pausar vídeo"}</button>}
          <span className="ct-art-footer">VISUAL CONCEITUAL • ARQUITETURA</span>
        </div>
      </section>
      <section className="ct-sector-section" id="setores" aria-labelledby="ct-sector-title">
        <div className="ct-sector-title"><span className="ct-eyebrow">ECOSSISTEMA</span><h2 id="ct-sector-title">Para quem é a <em>CONSTRUTECH.</em></h2><p>Explore o potencial para o seu negócio.</p></div>
        <div className="ct-sector-grid">{audiences.map(([image,title,description,topic])=><article className="ct-sector-card" key={image}>
          <ConceptImage name={image} alt=""/>
          <div><h3>{title}</h3><p>{description}</p><button type="button" onClick={()=>showTopic(topic)} aria-label={`Explorar soluções para ${title}`}>Explorar ↗</button></div>
        </article>)}</div>
        <small className="ct-concept-label">Imagens conceituais geradas por IA; não representam clientes, projetos reais ou funcionalidades homologadas.</small>
      </section>
      <section className="ct-journey" id="plataforma">
        <div className="ct-journey-title"><span className="ct-eyebrow">VISÃO INTEGRADA</span><h2>Do terreno ao <em>capital.</em></h2><p>Uma jornada integrada, da oportunidade à análise de investimento.</p></div>
        <div className="ct-journey-grid">{tracks.map(([n,title,desc],index)=><article key={n}><small>{n} /</small><h3>{title}</h3><p>{desc}</p><ConceptImage name={journeyImages[index]} alt=""/></article>)}</div>
      </section>
      <section className="ct-section ct-architecture" id="arquitetura">
        <div className="ct-arch-visual">
          <ConceptImage name="studio" alt="Ilustração de uma equipe de arquitetura estudando plantas ao lado de um modelo digital de edifício"/>
<span>ARQUITETURA / ESTUDOS E MODELO CONCEITUAL</span>
        </div>
        <div><span className="ct-eyebrow">02 / PARA ESCRITÓRIOS DE ARQUITETURA</span><h2>Também para <em>escritórios de arquitetura.</em></h2><p>A CONSTRUTECH também é pensada para arquitetos e equipes de projeto que precisam conectar estudos preliminares, premissas de viabilidade, versões e documentação à jornada de seus clientes.</p>
          <div className="ct-arch-points"><div><b>01</b><span><strong>Concepção e potencial</strong><small>Contexto do terreno, necessidades do cliente e estudos preliminares.</small></span></div><div><b>02</b><span><strong>Projetos e revisões</strong><small>Jornada prevista para documentação, PDF, IFC e DWG.</small></span></div><div><b>03</b><span><strong>Colaboração e apresentação</strong><small>Visão compartilhada de decisões e materiais para clientes e incorporadores.</small></span></div></div>
          <button className="ct-outline" onClick={()=>showTopic("Tenho um escritório de arquitetura. Como a CONSTRUTECH poderia apoiar estudos preliminares, projetos e apresentações aos clientes?")}>Explorar para meu escritório ↗</button>
          <small className="ct-demo-note">Capacidades operacionais em validação; a IA pública não recebe arquivos de projeto.</small>
        </div>
      </section>
      <section className="ct-section ct-showcase" id="viabilidade">
        <div className="ct-section-head"><div><span className="ct-eyebrow">03 / INTELIGÊNCIA FINANCEIRA</span><h2>Antes de investir,<br/><em>compreenda os cenários.</em></h2></div><p>Uma visão demonstrativa de como informações de projeto e premissas econômicas podem apoiar a decisão. Experimente três conjuntos de premissas fictícias.</p></div>
        <div className="ct-showcase-grid">
          <div className="ct-finance ct-dashboard">
            <div className="ct-dash-top"><div><small>CONSTRUTECH / VIABILIDADE</small><h3>Residencial Horizonte</h3><span>Empreendimento fictício · 120 unidades</span></div><span className="ct-demo-label">SIMULAÇÃO ILUSTRATIVA</span></div>
            <div className="ct-scenario" role="group" aria-label="Cenário demonstrativo">{(Object.keys(scenarios) as DemoScenario[]).map(key=><button type="button" key={key} aria-pressed={scenario===key} onClick={()=>setScenario(key)}>{scenarios[key].label}</button>)}</div>
            <div className="ct-dash-kpis" aria-live="polite">
              <div><small>VGV</small><strong>{millions(demo.vgv)}</strong></div>
              <div><small>Custo ilustrativo</small><strong>{millions(demo.cost)}</strong></div>
              <div><small>Saldo simples</small><strong>{millions(demo.balance)}</strong></div>
              <div><small>Margem simples</small><strong>{demo.margin.toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1})}%</strong></div>
            </div>
            <div className="ct-dash-lower">
              <div className="ct-dash-comparison"><h4>Composição nominal do cenário</h4>
                <div className="ct-dash-bar-label"><span>Receita bruta potencial</span><b>{millions(demo.vgv)}</b></div>
                <div className="ct-dash-bar"><span style={{width:"100%"}}/></div>
                <div className="ct-dash-bar-label"><span>Custos assumidos</span><b>{millions(demo.cost)}</b></div>
                <div className="ct-dash-bar ct-dash-bar--cost"><span style={{width:`${demo.cost/demo.vgv*100}%`}}/></div>
                <div className="ct-dash-bar-label"><span>Saldo simples</span><b>{millions(demo.balance)}</b></div>
                <div className="ct-dash-bar ct-dash-bar--balance"><span style={{width:`${demo.margin}%`}}/></div>
              </div>
              <div className="ct-dash-assumptions"><h4>Premissas do exemplo</h4><dl><dt>Unidades</dt><dd>{demo.units}</dd><dt>Ticket médio</dt><dd>{money(demo.ticket)}</dd><dt>Custo total assumido</dt><dd>{millions(demo.cost)}</dd></dl><p>VGV = unidades × ticket; saldo = VGV − custos; margem = saldo ÷ VGV.</p></div>
            </div>
            <small className="ct-dash-note">Dados fictícios. Não inclui tributos, financiamento, cronograma ou desconto a valor presente. Não representa retorno líquido, TIR ou recomendação de investimento. Motor completo em validação.</small>
          </div>
          <aside className="ct-showcase-aside ct-agent-preview" aria-labelledby="ct-preview-agent">
            <div className="ct-preview-agent-top"><span className="ct-feature-icon" aria-hidden="true">✦</span><div><small className="ct-eyebrow">ATENDIMENTO CONSULTIVO</small><h3 id="ct-preview-agent">Assistente CONSTRUTECH IA</h3></div></div>
            <div className="ct-preview-chat" aria-label="Convite para conversa">
              <div className="ct-preview-bubble"><b>Olá! Como posso ajudar?</b><p>Explore dúvidas sobre terrenos, empreendimentos, arquitetura ou viabilidade. Inicie uma conversa para consultar a IA.</p></div>
              <span className="ct-eyebrow">SUGESTÕES DE PERGUNTAS</span>
              <div className="ct-topic-list">{starters.slice(0,3).map(topic=><button type="button" key={topic} onClick={()=>showTopic(topic)}>{topic}<span aria-hidden="true">↗</span></button>)}</div>
            </div>
            <button type="button" className="ct-primary ct-preview-start" onClick={showAgent}>Conversar com a IA ↗</button>
            <small className="ct-demo-note">A abertura não envia mensagens. Você consente e confirma o envio no chat real. Disponibilidade consultada ao abrir.</small>
          </aside>
        </div>
      </section>
      <section className="ct-section ct-docs" id="documentos"><span className="ct-eyebrow">04 / DATA ROOM & GOVERNANÇA</span><h2>O documento certo.<br/><em>Na versão que importa.</em></h2><p>Visão de dossiês por empreendimento para conectar estudos, projetos, licenças, contratos e aprovações. Capacidade em evolução e sujeita à homologação.</p><div className="ct-grid">{rooms.map(([n,title,desc],index)=><article key={n}><ConceptImage name={["terreno","viabilidade","projetos","capital"][index]} alt=""/><div><small>{n}</small><h3>{title}</h3><p>{desc}</p></div></article>)}</div></section>
      <section className="ct-section ct-feature ct-ai-section" id="inteligencia"><div><span className="ct-eyebrow">05 / INTELIGÊNCIA APLICADA</span><h2>Um assistente para <em>orientar o próximo passo.</em></h2><p>Converse livremente sobre um terreno, um projeto arquitetônico ou as premissas de um empreendimento. O agente consultivo não acessa projetos privados, não substitui profissionais e não realiza cálculos financeiros homologados.</p><button className="ct-primary" onClick={showAgent}>Falar com a IA ↗</button></div><div className="ct-conversation"><span className="ct-eyebrow">✦ ASSISTENTE CONSTRUTECH</span><h3>O que você gostaria de explorar?</h3><p>Escolha um assunto para iniciar uma conversa real. Você revisa a mensagem e consente antes de enviar.</p><div className="ct-topic-list">{starters.map(topic=><button type="button" key={topic} onClick={()=>showTopic(topic)}>{topic}<span aria-hidden="true">↗</span></button>)}</div><small className="ct-demo-note">Sem mensagens automáticas, sem CRM.</small></div></section>
      <section className="ct-section ct-investors" id="investidores"><ConceptImage name="cidade" alt="" className="ct-city-panorama"/><div><span className="ct-eyebrow">06 / PARA INVESTIDORES</span><h2>Inteligência para decisões <em>de alto valor.</em></h2><p>Nosso objetivo é dar visibilidade às premissas, aos riscos e à evolução de cada empreendimento, conectando quem projeta, quem desenvolve e quem investe.</p></div><div className="ct-investor-grid"><article><small>01</small><h3>Clareza econômica</h3><p>Visão integrada de premissas e cenários.</p></article><article><small>02</small><h3>Rastreabilidade</h3><p>Decisões, versões e evidências em contexto.</p></article><article><small>03</small><h3>Capital informado</h3><p>Preparação de informações para análise independente.</p></article></div><small className="ct-demo-note">Proposta de valor; não há garantia de retorno, captação, contratos ou redução de riscos.</small></section>
      <section className="ct-cta"><span className="ct-eyebrow">CONSTRUTECH / PRÓXIMO PASSO</span><h2>O futuro do empreendimento<br/><em>começa com uma boa decisão.</em></h2><p>A IA é opcional. Explore a proposta da CONSTRUTECH para o seu negócio; não integra CRM, não agenda reuniões e não cadastra leads nesta prévia.</p><button className="ct-primary ct-gold" onClick={showDemo}>Solicitar demonstração ↗</button> <button className="ct-outline" onClick={showAgent}>Falar com a IA ↗</button></section>
    </main>
    <footer className="ct-footer"><span><b>CONSTRUTECH</b> · Uma solução criada por PATROAI CONSULTECH</span><span>Prévia comercial · Nome provisório · 2026</span><a href="#top">Voltar ao topo ↑</a><Link to="/login?return_to=/app">Acesso à plataforma</Link></footer>
    {open && <div className="ct-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closeAgent();}}>
      <div className="ct-modal ct-modal--chat" role="dialog" aria-modal="true" aria-labelledby="ct-dialog-title" ref={modal} tabIndex={-1} onKeyDown={e=>{if(e.key==="Escape")closeAgent();}}>
        <div className="ct-modal-head">
          <span id="ct-dialog-title">✦ CONSTRUTECH • Assistente de IA</span>
          <div className="ct-chat-actions">
            <button type="button" className="ct-chat-reset" onClick={newConversation}>Nova conversa</button>
            <button type="button" onClick={closeAgent} aria-label="Fechar atendimento">✕</button>
          </div>
        </div>
        <p className="ct-modal-info">Converse sobre seu empreendimento, escritório de arquitetura, viabilidade, documentos e decisões. Sou um assistente de IA, não um consultor financeiro ou jurídico.</p>
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
