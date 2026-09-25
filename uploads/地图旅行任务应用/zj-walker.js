// <zj-walker> — tangram-style figure walking in place, leaving footprints behind.
// Attributes: ink (color), speed (cycles/sec, default .9), trail ("on"|"off")
(function(){
  if (customElements.get('zj-walker')) return;
  const D = Math.PI/180;
  const P = (x,y)=>x.toFixed(1)+','+y.toFixed(1);
  const rot = (x,y,a)=>[x*Math.cos(a)-y*Math.sin(a), x*Math.sin(a)+y*Math.cos(a)];
  function square(cx,cy,s,a){ const h=s/2; return [[-h,-h],[h,-h],[h,h],[-h,h]].map(([x,y])=>{const r=rot(x,y,a);return P(cx+r[0],cy+r[1]);}).join(' '); }
  // tangram limb: parallelogram from A to B, width w, ends sheared
  function limb(A,B,w,shear){ const dx=B[0]-A[0], dy=B[1]-A[1], L=Math.hypot(dx,dy)||1; const ux=dx/L, uy=dy/L, nx=-uy, ny=ux; const s=shear*w;
    return [P(A[0]+nx*w/2, A[1]+ny*w/2), P(A[0]-nx*w/2+ux*s, A[1]-ny*w/2+uy*s), P(B[0]-nx*w/2, B[1]-ny*w/2), P(B[0]+nx*w/2-ux*s, B[1]+ny*w/2-uy*s)].join(' '); }
  function tri(pts){ return pts.map(p=>P(p[0],p[1])).join(' '); }
  class ZjWalker extends HTMLElement {
    connectedCallback(){
      const ink=this.getAttribute('ink')||'#201e1d';
      this.style.display='block';
      this.innerHTML=`<svg viewBox="0 0 200 140" width="100%" height="100%" style="display:block;overflow:visible" aria-hidden="true">
        <g class="trail"></g>
        <g fill="${ink}">
          <polygon class="legB"></polygon><polygon class="footB"></polygon><polygon class="armB"></polygon>
          <polygon class="torso"></polygon><polygon class="hip"></polygon>
          <polygon class="legF"></polygon><polygon class="footF"></polygon><polygon class="armF"></polygon>
          <polygon class="head"></polygon>
        </g>
        <line x1="10" y1="131" x2="190" y2="131" stroke="${ink}" stroke-width="1.5" stroke-dasharray="2 6" stroke-linecap="round" opacity=".35"></line>
      </svg>`;
      this.q=s=>this.querySelector(s);
      this.marks=[]; this.lastPlant=[null,null]; this.t0=performance.now(); this.prev=this.t0;
      this.ink=ink;
      const tick=()=>{ this.frame(); };
      this.timer=setInterval(tick, 33); this.frame();
    }
    disconnectedCallback(){ clearInterval(this.timer); }
    frame(){
      const now=performance.now(); const dt=Math.min(.1,(now-this.prev)/1000); this.prev=now;
      const speed=parseFloat(this.getAttribute('speed')||'.9');
      const ph=((now-this.t0)/1000)*speed*Math.PI*2;
      const hipX=100, hipY=76+Math.abs(Math.cos(ph))*-3;
      const TH=26, SH=26;
      const leg=(p)=>{ const th=34*Math.sin(p)*D; const kn=Math.max(0, 58*Math.sin(p+Math.PI*0.55))*D;
        const K=[hipX-Math.sin(th)*TH, hipY+Math.cos(th)*TH]; const sa=th+kn; const A=[K[0]-Math.sin(sa)*SH, K[1]+Math.cos(sa)*SH]; return {K,A,sa}; };
      // mirror so the figure walks to the right

      const F=leg(ph), B=leg(ph+Math.PI);
      const lean=10*D;
      const sh=[hipX+Math.sin(lean)*40, hipY-Math.cos(lean)*40];
      // torso: inverted triangle, apex at hip
      const tw=28; const tL=rot(-tw,0,lean), tR=rot(tw,0,lean);
      this.q('.torso').setAttribute('points', tri([[sh[0]+tL[0],sh[1]+tL[1]],[sh[0]+tR[0],sh[1]+tR[1]],[hipX+2,hipY+2]]));
      // hip: small square-ish block
      this.q('.hip').setAttribute('points', square(hipX,hipY+1,15,45*D+lean));
      const foot=(A,sa)=>{ const a=sa*0.4; const p1=rot(0,0,-a), p2=rot(22,0,-a), p3=rot(0,-13,-a); return tri([[A[0]+p1[0]-3,A[1]+p1[1]],[A[0]+p2[0]-3,A[1]+p2[1]],[A[0]+p3[0]-3,A[1]+p3[1]]]); };
      this.q('.legF').setAttribute('points', limb([hipX,hipY],F.K,11,.5)+' '+limb(F.K,F.A,10,.5).split(' ').slice(0,0).join(''));
      // draw thigh+shin as one polygon chain for crisp tangram joints
      this.q('.legF').setAttribute('points', this.chain([hipX,hipY],F.K,F.A,15));
      this.q('.legB').setAttribute('points', this.chain([hipX,hipY],B.K,B.A,15));
      this.q('.footF').setAttribute('points', foot(F.A,F.sa));
      this.q('.footB').setAttribute('points', foot(B.A,B.sa));
      // arms: triangles swinging opposite to legs
      const arm=(p,side)=>{ const a=(-30*Math.sin(p))*D+lean; const base=[sh[0]+side*6, sh[1]+4]; const tip=rot(0,32,a); const w=rot(12,0,a); return tri([[base[0]-w[0],base[1]-w[1]],[base[0]+w[0],base[1]+w[1]],[base[0]+tip[0],base[1]+tip[1]]]); };
      this.q('.armF').setAttribute('points', arm(ph+Math.PI, 1));
      this.q('.armB').setAttribute('points', arm(ph, -1));
      const hb=Math.sin(ph*2)*4*D;
      this.q('.head').setAttribute('points', square(sh[0]+9, sh[1]-19, 21, 18*D+hb));
      // footprints: when a foot is lowest & moving back, plant a mark; marks drift left
      if (this.getAttribute('trail')!=='off'){
        const g=this.q('.trail'); const drift=speed*Math.PI*2*28*Math.cos(0)*0.55;
        [F,B].forEach((L,i)=>{ const low=L.A[1]>hipY+TH+SH-3; if(low && !this.lastPlant[i]){ this.marks.push({x:L.A[0]+2,y:131,age:0,alt:i}); } this.lastPlant[i]=low; });
        this.marks.forEach(m=>{ m.x-=drift*dt; m.age+=dt; });
        this.marks=this.marks.filter(m=>m.x>6 && m.age<3.2);
        g.innerHTML=this.marks.map(m=>{ const o=Math.max(0,1-m.age/3.2)*.85; return `<polygon points="${tri([[m.x-6,m.y-1],[m.x+6,m.y-1],[m.x,m.y-6]])}" fill="${this.ink}" opacity="${o.toFixed(2)}"></polygon>`; }).join('');
      }
    }
    chain(H,K,A,w){ // thigh parallelogram + shin parallelogram joined at knee
      const seg=(P1,P2)=>{ const dx=P2[0]-P1[0], dy=P2[1]-P1[1], L=Math.hypot(dx,dy)||1; return [-dy/L*w/2, dx/L*w/2]; };
      const n1=seg(H,K), n2=seg(K,A);
      return [P(H[0]+n1[0],H[1]+n1[1]),P(K[0]+n1[0],K[1]+n1[1]),P(K[0]+n2[0],K[1]+n2[1]),P(A[0]+n2[0],A[1]+n2[1]),P(A[0]-n2[0],A[1]-n2[1]),P(K[0]-n2[0],K[1]-n2[1]),P(K[0]-n1[0],K[1]-n1[1]),P(H[0]-n1[0],H[1]-n1[1])].join(' ');
    }
  }
  customElements.define('zj-walker', ZjWalker);
})();
