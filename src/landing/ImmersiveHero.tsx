import {Link} from "react-router-dom";
import CognitiveCanvas from "../components/CognitiveCanvas";
import {cases,caseAsset} from "./cases";

export default function ImmersiveHero(){
  const heroCase=cases[0];
  return <section className="hero-v5">
    <CognitiveCanvas/>
    <div className="v5-grid"/>
    <div className="v5-hero-image" style={{backgroundImage:`linear-gradient(90deg,rgba(11,15,20,.98) 0%,rgba(11,15,20,.88) 38%,rgba(11,15,20,.18) 75%),url("${caseAsset(heroCase)}")`}}/>
    <div className="hero-v5-copy">
      <div className="eyebrow">GLIP • PROJECT INTELLIGENCE EXPERIENCE</div>
      <h1>Projetar é imaginar.<br/><span>Gerenciar é lembrar.</span><br/><em>Decidir é compreender.</em></h1>
      <p>A GLIP transforma cada projeto em um contexto vivo: pessoas, documentos, etapas, decisões, riscos e comunicação — conectados à inteligência governada Efatà 777.</p>
      <div className="hero-cta-row">
        <Link className="button primary" to="/app">Entrar na GLIP</Link>
        <a className="button ghost" href="#cases-v5">Percorrer projetos</a>
      </div>
      <div className="hero-v5-proof">
        <span><i/> domínio GLIP isolado</span>
        <span><i/> memória por projeto</span>
        <span><i/> aprovação humana</span>
      </div>
    </div>
    <div className="hero-v5-core" aria-hidden="true">
      <div className="v5-core-orb"><strong>GLIP</strong><small>PROJECT<br/>CONTEXT</small></div>
      <div className="v5-orbit o1"><b>MEMORY</b></div>
      <div className="v5-orbit o2"><b>EFATÀ</b></div>
      <div className="v5-orbit o3"><b>APPROVAL</b></div>
    </div>
    <div className="hero-v5-caption">
      <span>CASE / {heroCase.title.toUpperCase()}</span>
      <small>imagem de referência publicada pela GLIP</small>
    </div>
  </section>
}
