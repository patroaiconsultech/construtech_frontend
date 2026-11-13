import {cases,caseAsset} from "./cases";

export default function CaseReel(){
  return <section id="cases-v5" className="section cases-v5 v5-lazy-section">
    <div className="cases-v5-head">
      <div><div className="section-kicker">PROJETOS GLIP</div><h2>Espaços que carregam<br/>marca, função e intenção.</h2></div>
      <p>Na V5, a tecnologia não ocupa o lugar da arquitetura. Ela aparece como uma camada invisível de continuidade entre briefing, projeto, obra, fornecedores e decisões.</p>
    </div>
    <div className="case-reel-v5">
      {cases.map((item,index)=><article className="case-v5" key={item.slug}>
        <img src={caseAsset(item)} loading={index===0?"eager":"lazy"} decoding="async" alt={`${item.title} — projeto GLIP`}/>
        <div className="case-v5-shade"/>
        <div className="case-v5-index">{String(index+1).padStart(2,"0")}</div>
        <div className="case-v5-copy"><small>{item.category.toUpperCase()}</small><h3>{item.title}</h3><p>{item.statement}</p></div>
      </article>)}
    </div>
  </section>
}
