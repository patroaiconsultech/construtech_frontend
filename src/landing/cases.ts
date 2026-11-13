export type GlipCase = {
  slug:string;
  title:string;
  category:string;
  statement:string;
  remoteUrl:string;
  localUrl:string;
};

export const cases:GlipCase[]=[
  {
    slug:"raro-odontologia",
    title:"Raro Odontologia",
    category:"Médico",
    statement:"Precisão técnica com presença de marca.",
    remoteUrl:"https://static.wixstatic.com/media/609e1c_1d86d0680a524d4788419bb5cfd97e24~mv2.jpg/v1/fill/w_768%2Ch_576%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/609e1c_1d86d0680a524d4788419bb5cfd97e24~mv2.jpg",
    localUrl:"/media/cases/raro-odontologia.jpg"
  },
  {
    slug:"consultorio-psiquiatria",
    title:"Consultório Psiquiatria",
    category:"Médico",
    statement:"Acolhimento, materialidade e conforto.",
    remoteUrl:"https://static.wixstatic.com/media/609e1c_bc2679d723ad4765ab4b3a305bae574c~mv2.jpg/v1/crop/x_0%2Cy_306%2Cw_1200%2Ch_988/fill/w_305%2Ch_251%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/6d4d2170-dd8c-448d-bb78-14596153ab37.jpg",
    localUrl:"/media/cases/consultorio-psiquiatria.jpg"
  },
  {
    slug:"multiverso-experience",
    title:"Multiverso Experience",
    category:"Experiência",
    statement:"Arquitetura encontra narrativa imersiva.",
    remoteUrl:"https://static.wixstatic.com/media/609e1c_03c6c8c4f37f4c8d8aa1aa39b246da40~mv2.jpg/v1/crop/x_0%2Cy_64%2Cw_720%2Ch_593/fill/w_305%2Ch_251%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/9a941452-440d-4bed-98e5-ae94e3b5d270.jpg",
    localUrl:"/media/cases/multiverso-experience.jpg"
  },
  {
    slug:"milkymoo-bourbon-ipiranga",
    title:"Milkymoo · Bourbon Ipiranga",
    category:"Comercial",
    statement:"Marca e operação condensadas em poucos metros.",
    remoteUrl:"https://static.wixstatic.com/media/609e1c_bcd71634cccf45ea9c46a8cc4cf10430~mv2.jpg/v1/crop/x_0%2Cy_306%2Cw_1200%2Ch_988/fill/w_305%2Ch_251%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/111521ed-3607-44e3-97da-db4158a7f0de.jpg",
    localUrl:"/media/cases/milkymoo-bourbon-ipiranga.jpg"
  }
];

export function caseAsset(item:GlipCase){
  return import.meta.env.VITE_GLIP_CASE_ASSET_MODE==="local" ? item.localUrl : item.remoteUrl;
}
