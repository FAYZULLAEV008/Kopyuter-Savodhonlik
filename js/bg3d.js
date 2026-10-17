/* Orqa fon: 3D animatsiya (tashqi kutubxonasiz, oflayn ishlaydi).
   Aylanayotgan 3D karkas shakllar + o‘zaro bog‘langan zarralar tarmog‘i. Sichqoncha harakatiga javob beradi.
   prefers-reduced-motion yoqilgan bo‘lsa — harakatsiz bitta kadr; sahifa yashirin bo‘lsa — to‘xtaydi. */
(()=>{
const cv=document.createElement('canvas');cv.id='bg3d';cv.setAttribute('aria-hidden','true');document.body.prepend(cv);
const g=cv.getContext('2d');if(!g)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let W=0,H=0,DPR=1,F=600,dark=false,run=false,last=0,T=0;
const M={x:0,y:0,sx:0,sy:0};
const R=(a,b)=>a+Math.random()*(b-a);

/* shakllar: cube, octahedron, tetrahedron */
const SH={
 cube:{v:[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],e:[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]},
 octa:{v:[[1.3,0,0],[-1.3,0,0],[0,1.3,0],[0,-1.3,0],[0,0,1.3],[0,0,-1.3]],e:[[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[4,3],[3,5],[5,2]]},
 tetra:{v:[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]],e:[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]}
};
const COL=[[13,148,136],[37,99,235],[124,58,237]],COLD=[[45,212,191],[96,165,250],[167,139,250]];
let shapes=[],dots=[];

function build(){
 const small=innerWidth<700,ns=small?9:16,nd=small?45:85,names=Object.keys(SH);
 shapes=Array.from({length:ns},(_,i)=>({k:SH[names[i%3]],x:R(-13,13),y:R(-8,8),z:R(-8,10),s:R(.7,1.7),
  rx:R(0,6.28),ry:R(0,6.28),vx:R(-.5,.5),vy:R(-.5,.5),vz:R(-.2,.2),c:i%3,ph:R(0,6.28),sp:R(.2,.5)}));
 dots=Array.from({length:nd},()=>({x:R(-14,14),y:R(-9,9),z:R(-9,11),vx:R(-.25,.25),vy:R(-.2,.2),vz:R(-.15,.15)}));
}
function size(){
 DPR=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;
 cv.width=W*DPR;cv.height=H*DPR;g.setTransform(DPR,0,0,DPR,0,0);F=Math.min(W,H)*.95+W*.15;
 build();if(!run)draw(0);
}
function theme(){const t=document.documentElement.dataset.theme;dark=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches}

/* kamera: Y va X o‘qlari atrofida aylanish + perspektiva */
function cam(yaw,pitch){const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
 return(x,y,z)=>{let X=x*cy+z*sy,Z=-x*sy+z*cy,Y=y*cx-Z*sx;Z=y*sx+Z*cx+22;if(Z<2)return null;const k=F/Z;return[W/2+X*k,H/2+Y*k,Z,k]}}

function draw(dt){
 T+=dt;g.clearRect(0,0,W,H);
 M.sx+=(M.x-M.sx)*Math.min(1,dt*2.5);M.sy+=(M.y-M.sy)*Math.min(1,dt*2.5);
 const P=cam(T*.06+M.sx*.45,Math.sin(T*.05)*.12+M.sy*.25),pal=dark?COLD:COL,A=dark?1:.8;
 const fade=z=>Math.max(0,Math.min(1,(34-z)/22));

 /* zarralar va ular orasidagi chiziqlar */
 const pts=dots.map(d=>{d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;
  if(d.x>14||d.x<-14)d.vx*=-1;if(d.y>9||d.y<-9)d.vy*=-1;if(d.z>11||d.z<-9)d.vz*=-1;return{d,p:P(d.x,d.y,d.z)}}).filter(o=>o.p);
 g.lineWidth=1;
 for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
  const a=pts[i].d,b=pts[j].d,dx=a.x-b.x,dy=a.y-b.y,dz=a.z-b.z,q=dx*dx+dy*dy+dz*dz;
  if(q<22){const al=(1-q/22)*.32*A*Math.min(fade(pts[i].p[2]),fade(pts[j].p[2])),c=pal[0];
   g.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${al})`;g.beginPath();g.moveTo(pts[i].p[0],pts[i].p[1]);g.lineTo(pts[j].p[0],pts[j].p[1]);g.stroke()}}
 pts.forEach(({p})=>{const c=pal[1],al=.55*A*fade(p[2]);g.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${al})`;g.beginPath();g.arc(p[0],p[1],Math.max(1,p[3]*.055),0,6.283);g.fill()});

 /* aylanayotgan karkas shakllar */
 shapes.forEach(s=>{
  s.rx+=s.sp*dt;s.ry+=s.sp*.8*dt;s.x+=s.vx*dt*.4;s.y+=Math.sin(T*.6+s.ph)*dt*.35;s.z+=s.vz*dt;
  if(s.x>14||s.x<-14)s.vx*=-1;if(s.z>10||s.z<-8)s.vz*=-1;
  const cx=Math.cos(s.rx),sx=Math.sin(s.rx),cy=Math.cos(s.ry),sy=Math.sin(s.ry);
  const V=s.k.v.map(([x,y,z])=>{x*=s.s;y*=s.s;z*=s.s;let y1=y*cx-z*sx,z1=y*sx+z*cx,x1=x*cy+z1*sy;z1=-x*sy+z1*cy;return P(x1+s.x,y1+s.y,z1+s.z)});
  const zz=V.every(Boolean)?V.reduce((a,v)=>a+v[2],0)/V.length:99,al=.5*A*fade(zz),c=pal[s.c];
  if(!V.every(Boolean)||al<=.01)return;
  g.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${al})`;g.lineWidth=Math.max(.8,V[0][3]*.02);g.beginPath();
  s.k.e.forEach(([a,b])=>{g.moveTo(V[a][0],V[a][1]);g.lineTo(V[b][0],V[b][1])});g.stroke()});
}

function loop(t){if(!run)return;const dt=Math.min(.05,(t-last)/1000||0);last=t;draw(dt);requestAnimationFrame(loop)}
function start(){if(run||reduce.matches||document.hidden)return;run=true;last=performance.now();requestAnimationFrame(loop)}
function stop(){run=false}

addEventListener('resize',size);
addEventListener('pointermove',e=>{M.x=e.clientX/W-.5;M.y=e.clientY/H-.5},{passive:true});
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
reduce.addEventListener?.('change',()=>{reduce.matches?(stop(),draw(0)):start()});
new MutationObserver(()=>{theme();if(!run)draw(0)}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{theme();if(!run)draw(0)});
theme();size();if(reduce.matches)draw(0);else start();
})();
