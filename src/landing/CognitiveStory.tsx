const layers=[
 ["PROJECT CONTEXT","O que está acontecendo agora, no projeto certo."],
 ["KNOWLEDGE","Decisões e fontes aprovadas, versionadas e rastreáveis."],
 ["MEMORY","Aprendizado local somente após aprovação humana."],
 ["CAPABILITY","Uma tarefa cognitiva explícita, com versão e política."],
 ["EFATÀ 777","Inteligência compartilhada sem assumir domínio GLIP."],
 ["APPROVAL","A autoridade volta para a pessoa antes de virar ação."]
];

export default function CognitiveStory(){
  return <section id="kernel-v5" className="section cognitive-story-v5 v5-lazy-section">
    <div className="cognitive-sticky-v5">
      <div className="section-kicker">COGNITIVE KERNEL V1</div><span className="visually-hidden">Efatà intelligence plane</span>
      <h2>O projeto não conversa<br/>com uma IA genérica.</h2>
      <p>Ele conversa através de um perfil cognitivo lógico que sabe qual é o tenant, qual é o projeto, quais fontes estão autorizadas e quais decisões já foram aprovadas.</p>
      <div className="cognitive-equation-v5"><span>1 runtime</span><b>+</b><span>N contextos isolados</span><b>=</b><strong>escala governada</strong></div>
    </div>
    <div className="cognitive-layers-v5">
      {layers.map(([title,desc],i)=><article className="glass cognitive-layer-v5" key={title}>
        <span>{String(i+1).padStart(2,"0")}</span><h3>{title}</h3><p>{desc}</p>
        <div className="layer-signal"/>
      </article>)}
    </div>
  </section>
}
