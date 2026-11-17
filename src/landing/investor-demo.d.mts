export type DemoScenario = "conservador" | "base" | "otimista";
export const scenarios: Readonly<Record<DemoScenario,Readonly<{label:string;units:number;ticket:number;cost:number}>>>;
export function calculateDemo(key:DemoScenario): {units:number;ticket:number;cost:number;vgv:number;balance:number;margin:number};
