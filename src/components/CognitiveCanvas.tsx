import {useEffect,useRef} from "react";

export default function CognitiveCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas?.getContext("2d");
    if(!canvas||!ctx)return;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse=matchMedia("(pointer: coarse)").matches;
    const lowPower=reduced||coarse||window.innerWidth<760;
    let raf=0,w=0,h=0,nodes:{x:number;y:number;vx:number;vy:number}[]=[];
    let running=!lowPower;

    const resize=()=>{
      const d=Math.min(devicePixelRatio||1,1.5);
      w=canvas.clientWidth;h=canvas.clientHeight;
      canvas.width=Math.max(1,Math.floor(w*d));canvas.height=Math.max(1,Math.floor(h*d));
      ctx.setTransform(d,0,0,d,0,0);
      const count=lowPower?12:26;
      nodes=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.15,vy:(Math.random()-.5)*.15}));
    };
    const draw=()=>{
      ctx.clearRect(0,0,w,h);
      ctx.strokeStyle="rgba(55,197,255,.13)";
      ctx.fillStyle="rgba(246,196,83,.62)";
      nodes.forEach((a,i)=>{
        if(running){a.x+=a.vx;a.y+=a.vy;if(a.x<0||a.x>w)a.vx*=-1;if(a.y<0||a.y>h)a.vy*=-1}
        ctx.beginPath();ctx.arc(a.x,a.y,1.15,0,Math.PI*2);ctx.fill();
        for(let j=i+1;j<nodes.length;j++){
          const b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y);
          if(d<145){ctx.globalAlpha=1-d/145;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
        }
      });
      ctx.globalAlpha=1;
      if(running&&!document.hidden)raf=requestAnimationFrame(draw);
    };
    const visibility=()=>{
      cancelAnimationFrame(raf);
      running=!lowPower&&!document.hidden;
      draw();
    };
    resize();draw();
    addEventListener("resize",resize);
    document.addEventListener("visibilitychange",visibility);
    return()=>{cancelAnimationFrame(raf);removeEventListener("resize",resize);document.removeEventListener("visibilitychange",visibility)};
  },[]);
  return <canvas ref={ref} className="cognitive-canvas" aria-hidden="true"/>;
}
