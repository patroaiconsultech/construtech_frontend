import {useEffect,useState} from "react";
import {Link,useParams} from "react-router-dom";
import Shell from "../components/Shell";
import {api} from "../api";

const formats=["pdf","docx","pptx","xlsx"];

export default function ArtifactStudio(){
  const {projectId=""}=useParams();
  const [artifacts,setArtifacts]=useState<any[]>([]);
  const [sources,setSources]=useState<any[]>([]);
  const [artifactCaps,setArtifactCaps]=useState<any>();
  const [archCaps,setArchCaps]=useState<any>();
  const [bimJobs,setBimJobs]=useState<any[]>([]);
  const [cadJobs,setCadJobs]=useState<any[]>([]);
  const [geometryJobs,setGeometryJobs]=useState<any[]>([]);
  const [scenes,setScenes]=useState<any[]>([]);
  const [format,setFormat]=useState("pdf");
  const [filename,setFilename]=useState("entrega-glip");
  const [content,setContent]=useState("# Entrega GLIP\n\n## Escopo\n\nDescreva aqui o conteúdo do artefato.");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  async function refresh(){
    const results=await Promise.allSettled([
      api.artifacts(projectId),api.architectureSources(projectId),
      api.artifactCapabilities(projectId),api.architectureCapabilities(projectId),
      api.bimJobs(projectId),api.architectureScenes(projectId),
      api.cadJobs(projectId),api.geometryJobs(projectId)
    ]);
    if(results[0].status==="fulfilled")setArtifacts(results[0].value);
    if(results[1].status==="fulfilled")setSources(results[1].value);
    if(results[2].status==="fulfilled")setArtifactCaps(results[2].value);
    if(results[3].status==="fulfilled")setArchCaps(results[3].value);
    if(results[4].status==="fulfilled")setBimJobs(results[4].value);
    if(results[5].status==="fulfilled")setScenes(results[5].value);
    if(results[6].status==="fulfilled")setCadJobs(results[6].value);
    if(results[7].status==="fulfilled")setGeometryJobs(results[7].value);
  }

  useEffect(()=>{refresh()},[projectId]);

  async function generate(){
    setBusy(true);setMessage("");
    try{
      await api.renderArtifact(projectId,{format,filename,content,classification:"project_internal"});
      setMessage("Artefato gerado e validado.");
      await refresh();
    }catch(e:any){setMessage(e?.message||"Falha ao gerar artefato")}
    finally{setBusy(false)}
  }

  async function downloadArtifact(id:string){
    try{
      const {blob,filename:name}=await api.downloadArtifact(projectId,id);
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
      URL.revokeObjectURL(url);
    }catch(e:any){setMessage(e?.message||"Falha no download")}
  }

  async function uploadSource(file?:File){
    if(!file)return;
    setBusy(true);setMessage("");
    try{
      const result=await api.uploadArchitectureSource(projectId,file);
      setMessage(result.status==="existing"?"Arquivo já registrado neste projeto.":"Fonte arquitetônica registrada.");
      await refresh();
    }catch(e:any){setMessage(e?.message||"Falha no upload")}
    finally{setBusy(false)}
  }


  async function extractIfc(sourceId:string){
    setBusy(true);setMessage("");
    try{
      const result=await api.queueBimExtraction(projectId,sourceId);
      setMessage(`Extração BIM ${result.status}. O worker preservará o IFC como fonte semântica.`);
      await refresh();
    }catch(e:any){setMessage(e?.message||"Falha ao enfileirar extração BIM")}
    finally{setBusy(false)}
  }

  async function extractDxf(sourceId:string){
    setBusy(true);setMessage("");
    try{
      const result=await api.queueCadExtraction(projectId,sourceId);
      setMessage(`Extração CAD ${result.status}. Medidas DXF permanecem não precificáveis até mapeamento semântico.`);
      await refresh();
    }catch(e:any){setMessage(e?.message||"Falha ao enfileirar extração CAD")}
    finally{setBusy(false)}
  }

  async function buildPreview(sceneId:string){
    setBusy(true);setMessage("");
    try{
      const result=await api.queueGeometryBuild(projectId,sceneId);
      setMessage(`Preview GLB ${result.status}. Este modelo preserva linework e não representa 3D arquitetônico inferido.`);
      await refresh();
    }catch(e:any){setMessage(e?.message||"Falha ao gerar preview geométrico")}
    finally{setBusy(false)}
  }

  async function downloadModel(artifactId:string){
    try{
      const {blob,filename:name}=await api.downloadArchitectureModel(projectId,artifactId);
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
      URL.revokeObjectURL(url);
    }catch(e:any){setMessage(e?.message||"Falha no download do modelo")}
  }

  function latestJob(sourceId:string){
    return bimJobs.find(j=>j.source_id===sourceId);
  }
  function latestCadJob(sourceId:string){
    return cadJobs.find(j=>j.source_id===sourceId);
  }
  function geometryJob(sceneId:string){
    return geometryJobs.find(j=>j.scene_id===sceneId);
  }

  return <Shell>
    <div className="page-head"><div>
      <span className="section-kicker">ARTIFACT + CAD/BIM</span>
      <h1>Estúdio de Artefatos</h1>
      <p>Documentos e fontes técnicas permanecem no domínio GLIP, com billing e storage próprios.</p>
    </div><Link className="button ghost" to={`/app/projects/${projectId}`}>← Projeto</Link></div>

    <div className="metric-grid">
      <div className="glass metric"><small>Artefatos</small><strong>{artifacts.length}</strong></div>
      <div className="glass metric"><small>Fontes CAD/BIM</small><strong>{sources.length}</strong></div>
      <div className="glass metric"><small>Billing scope</small><strong>GLIP</strong></div>
      <div className="glass metric"><small>IFC</small><strong>{archCaps?.bim?.ifc_first_class?"1ª classe":"—"}</strong></div>
      <div className="glass metric"><small>Cenas semânticas</small><strong>{scenes.filter(s=>["semantic_ready","cad_semantic_ready"].includes(s.status)).length}</strong></div>
      <div className="glass metric"><small>Quantitativos</small><strong>{scenes.filter(s=>(s.scene_json?.quantity_takeoff?.statistics?.item_count||0)>0).length}</strong></div>
    </div>

    {message&&<div className="glass artifact-message">{message}</div>}

    <div className="artifact-studio-grid">
      <section className="glass panel">
        <span className="section-kicker">DOCUMENT ENGINE</span>
        <h2>Gerar documento</h2>
        <p className="muted">DOCX, PDF, PPTX e XLSX usam renderers locais do GLIP. Nenhum token Efata é consumido.</p>
        <label className="field-label">Formato</label>
        <select value={format} onChange={e=>setFormat(e.target.value)}>{formats.map(x=><option key={x}>{x}</option>)}</select>
        <label className="field-label">Nome do arquivo</label>
        <input value={filename} onChange={e=>setFilename(e.target.value)}/>
        <label className="field-label">Conteúdo estruturado</label>
        <textarea className="artifact-editor" value={content} onChange={e=>setContent(e.target.value)}/>
        <button className="button primary" disabled={busy||artifactCaps?.enabled===false} onClick={generate}>
          {busy?"Processando…":"Gerar artefato"}
        </button>
        {artifactCaps?.enabled===false&&<p className="muted">Capability desabilitada por feature flag.</p>}
      </section>

      <section className="glass panel">
        <span className="section-kicker">CAD / BIM INGESTION</span>
        <h2>Fonte arquitetônica</h2>
        <p>Formatos previstos: DWG, DXF, PDF, IFC/IFCZIP/IFCXML e GLB/glTF.</p>
        <p className="muted">IFC é preservado como fonte semântica. GLB/glTF será derivado para viewer/render.</p>
        <label className="upload-zone">
          <strong>Selecionar arquivo técnico</strong>
          <span>Upload versionado com SHA-256 e isolamento por tenant/projeto.</span>
          <input type="file" accept=".dwg,.dxf,.pdf,.ifc,.ifczip,.ifcxml,.glb,.gltf"
            disabled={busy||archCaps?.uploads_enabled===false}
            onChange={e=>uploadSource(e.target.files?.[0])}/>
        </label>
        <div className="capability-note">
          <b>BIM semantic parser:</b> {archCaps?.bim?.semantic_parser_status||"—"}<br/>
          <b>DXF semantic parser:</b> {archCaps?.cad?.dxf_semantic_parser_status||"—"}<br/>
          <b>Preview GLB:</b> {archCaps?.scene?.geometry_preview_status||"—"}<br/>
          <b>Autodesk APS:</b> {archCaps?.cad?.autodesk_aps_status||"—"}<br/>
          <b>Render worker:</b> {archCaps?.render?.status||"—"}
        </div>
      </section>
    </div>

    <section className="module-section">
      <span className="section-kicker">OUTPUTS</span><h2>Artefatos do projeto</h2>
      <div className="artifact-list">
        {artifacts.map(a=><div className="glass artifact-row" key={a.id}>
          <div><strong>{a.filename}</strong><small>{a.format?.toUpperCase()} · {a.size_bytes} bytes</small></div>
          <button className="button ghost" onClick={()=>downloadArtifact(a.id)}>Baixar</button>
        </div>)}
        {!artifacts.length&&<div className="empty">Nenhum artefato gerado.</div>}
      </div>
    </section>

    <section className="module-section">
      <span className="section-kicker">TECHNICAL SOURCES</span><h2>CAD / BIM</h2>
      <div className="artifact-list">
        {sources.map(s=>{const job=latestJob(s.id);const cad=latestCadJob(s.id);return <div className="glass artifact-row" key={s.id}>
          <div><strong>{s.original_filename}</strong>
            <small>{s.source_format?.toUpperCase()} · {s.ifc_schema||"schema n/a"} · SHA {String(s.sha256).slice(0,12)}…</small>
            {job&&<small>BIM: {job.status}{job.engine_version?` · ${job.engine} ${job.engine_version}`:""}</small>}
            {cad&&<small>CAD: {cad.status}{cad.engine_version?` · ${cad.engine} ${cad.engine_version}`:""}</small>}
          </div>
          <div>
            <span>{s.status}</span>
            {s.source_format==="ifc"&&archCaps?.bim?.semantic_parser_status==="ADAPTER_READY"&&
              <button className="button ghost" disabled={busy||job?.status==="queued"||job?.status==="processing"} onClick={()=>extractIfc(s.id)}>
                {job?.status==="completed"?"Reprocessar IFC":"Extrair semântica BIM"}
              </button>}
            {s.source_format==="dxf"&&archCaps?.cad?.dxf_semantic_parser_status==="ADAPTER_READY"&&
              <button className="button ghost" disabled={busy||cad?.status==="queued"||cad?.status==="processing"} onClick={()=>extractDxf(s.id)}>
                {cad?.status==="completed"?"Reprocessar DXF":"Extrair semântica CAD"}
              </button>}
          </div>
        </div>})}
        {!sources.length&&<div className="empty">Nenhuma fonte arquitetônica registrada.</div>}
      </div>
    </section>

    <section className="module-section">
      <span className="section-kicker">SCENE + QUANTITIES</span><h2>Cenas e quantitativos</h2>
      <p className="muted">IFC Qto é tratado como quantitativo técnico; medidas CAD sem mapeamento permanecem inelegíveis para precificação automática.</p>
      <div className="artifact-list">
        {scenes.map(scene=>{const gj=geometryJob(scene.id);const q=scene.scene_json?.quantity_takeoff;return <div className="glass artifact-row" key={scene.id}>
          <div>
            <strong>{scene.source_format?.toUpperCase()} · cena v{scene.version}</strong>
            <small>{scene.status} · {q?.statistics?.item_count||0} quantitativos · pricing {q?.pricing_readiness?.status||"não avaliado"}</small>
            {gj&&<small>GLB preview: {gj.status}{gj.engine_version?` · ${gj.engine} ${gj.engine_version}`:""}</small>}
          </div>
          <div>
            {scene.scene_json?.geometry?.paths?.length>0&&archCaps?.scene?.geometry_preview_status==="ADAPTER_READY"&&
              <button className="button ghost" disabled={busy||gj?.status==="queued"||gj?.status==="processing"} onClick={()=>buildPreview(scene.id)}>
                {gj?.status==="completed"?"Regerar preview GLB":"Gerar preview GLB"}
              </button>}
            {gj?.status==="completed"&&gj.output_artifact_id&&
              <button className="button ghost" onClick={()=>downloadModel(gj.output_artifact_id)}>Baixar GLB</button>}
          </div>
        </div>})}
        {!scenes.length&&<div className="empty">Nenhuma cena semântica disponível.</div>}
      </div>
    </section>

    <section className="glass panel">
      <span className="section-kicker">PRICING INTELLIGENCE</span>
      <h2>Agente de Precificação</h2>
      <p>Fundação de quantitativos preparada. A próxima etapa conectará duas modalidades separadas: honorários profissionais e custo estimado da obra.</p>
      <p className="muted">O modelo de IA poderá classificar e explicar; valores numéricos deverão vir de fontes versionadas e rastreáveis. Autoridade numérica por LLM: <b>não</b>.</p>
      <div className="capability-note">
        <b>Quantitativos:</b> {archCaps?.pricing?.quantity_takeoff_status||"—"}<br/>
        <b>Fontes de mercado:</b> {archCaps?.pricing?.market_price_ingestion_status||"—"}<br/>
        <b>Honorários:</b> {archCaps?.pricing?.professional_fee_mode||"—"}<br/>
        <b>Custo de obra:</b> {archCaps?.pricing?.construction_cost_mode||"—"}
      </div>
    </section>
  </Shell>
}
