// Illustrative arithmetic only — not a validated financial engine.
export const scenarios = Object.freeze({
  conservador: Object.freeze({label:"Conservador",units:120,ticket:450000,cost:48000000}),
  base: Object.freeze({label:"Base",units:120,ticket:500000,cost:44000000}),
  otimista: Object.freeze({label:"Otimista",units:120,ticket:550000,cost:40000000}),
});
export function calculateDemo(key){
  if(!Object.hasOwn(scenarios,key)) throw new RangeError("unknown_demo_scenario");
  const {units,ticket,cost}=scenarios[key];
  const vgv=units*ticket;
  const balance=vgv-cost;
  return {units,ticket,cost,vgv,balance,margin:balance/vgv*100};
}
