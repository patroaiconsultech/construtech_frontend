/** Public qualification contract v1. No PII persistence or CRM handoff. */
export const QUESTIONS = [
  {id:"perfil",label:"Qual perfil melhor descreve sua empresa?",options:["Incorporadora","Loteadora","Construtora","Investidora ou gestora","Outro"]},
  {id:"portfolio",label:"Quantos empreendimentos você acompanha atualmente?",options:["1","2 a 5","6 a 20","Mais de 20","Ainda em planejamento"]},
  {id:"fase",label:"Em qual etapa está seu principal empreendimento?",options:["Originação e terreno","Estudo de viabilidade","Projetos e aprovações","Execução","Comercialização ou capital"]},
  {id:"desafio",label:"Qual é o maior desafio hoje?",options:["Viabilidade financeira","Premissas e versões","Documentos e aprovações","Visibilidade gerencial","Coordenação entre áreas"]},
  {id:"dados",label:"Como as informações são organizadas atualmente?",options:["Planilhas dispersas","Pastas e documentos","Sistema especializado","Várias ferramentas","Estamos estruturando"]},
  {id:"prioridade",label:"O que seria mais útil conhecer em uma demonstração?",options:["Cenários de viabilidade","Gestão de premissas","Organização documental","Visão integrada","Assistente de decisão"]},
  {id:"momento",label:"Quando gostaria de avaliar um piloto ou demonstração?",options:["Nesta semana","Nos próximos 30 dias","Nos próximos 90 dias","Somente conhecer a proposta","Ainda sem previsão"]},
] as const;
export type CommercialAnswers = Record<string,string>;
export function validateAnswers(answers:CommercialAnswers):boolean {
  return QUESTIONS.every(q=>q.options.some(option=>option===answers[q.id]));
}
export function summaryText(answers:CommercialAnswers):string {
  if(!validateAnswers(answers)) throw new Error("Diagnóstico incompleto");
  return ["CONSTRUTECH — Pré-diagnóstico comercial","Nome do produto provisório.","Arquivo gerado localmente. Não é enviado automaticamente ao CRM. A orientação opcional, se autorizada, envia as sete escolhas ao backend.","",...QUESTIONS.map((q,i)=>`${i+1}. ${q.label}\n${answers[q.id]}`)].join("\n");
}
