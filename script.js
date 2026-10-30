/* =====================================================================
   Bruno Personal — interações + motion (GSAP, ScrollTrigger, SplitText, Lenis)
   Estrutura:
   1. Funções básicas (funcionam mesmo sem GSAP)
   2. Camada de motion (só com GSAP carregado e sem "reduzir movimento")
   ===================================================================== */
(function(){
const root=document.documentElement;
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
const hasGSAP=!!(window.gsap&&window.ScrollTrigger&&window.SplitText);
const motionOn=hasGSAP&&!reduceMotion;

// ===== 1. Básico =====
const menu=document.querySelector('.menu'),nav=document.querySelector('.header nav');
menu?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.header nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const phone='5527998860938';
document.querySelectorAll('[data-msg]').forEach(el=>el.addEventListener('click',()=>{const t=encodeURIComponent(el.dataset.msg);window.open('https://wa.me/'+phone+'?text='+t,'_blank')}));

// Carrossel de fotos do hero (o autoplay começa depois da entrada do hero)
const carousel=(function(){
  const el=document.getElementById('heroCarousel');
  if(!el)return {start(){}};
  const slides=el.querySelectorAll('.hc-slide');
  const dots=el.querySelectorAll('.hc-dot');
  const total=slides.length;
  let idx=0,timer=null,started=false;
  function show(i){
    const prev=(i-1+total)%total;
    const nxt=(i+1)%total;
    slides.forEach((s,n)=>{
      s.classList.remove('active','prev','next');
      if(n===i)s.classList.add('active');
      else if(n===prev)s.classList.add('prev');
      else if(n===nxt)s.classList.add('next');
    });
    dots.forEach((d,n)=>d.classList.toggle('active',n===i));
    idx=i;
  }
  function next(){ show((idx+1)%total); }
  function startAuto(){ if(reduceMotion||!started)return; clearInterval(timer); timer=setInterval(next,2600); }
  dots.forEach(d=>d.addEventListener('click',()=>{ show(parseInt(d.dataset.i)); startAuto(); }));
  slides.forEach((s,n)=>s.addEventListener('click',()=>{
    if(!s.classList.contains('active')){ show(n); startAuto(); }
  }));
  show(0);
  return {start(){ started=true; startAuto(); }};
})();

// Comparativo antes/depois (suporta múltiplos na página)
document.querySelectorAll('.ba-wrap').forEach(function(wrap){
  const clip=wrap.querySelector('.ba-after-clip');
  const handle=wrap.querySelector('.ba-handle');
  const afterImg=wrap.querySelector('.ba-after-img');

  function setFullWidth(){
    afterImg.style.setProperty('--full-w',wrap.offsetWidth+'px');
    afterImg.style.width=wrap.offsetWidth+'px';
  }
  function setPos(pct){
    pct=Math.max(2,Math.min(98,pct));
    clip.style.width=pct+'%';
    handle.style.left=pct+'%';
  }
  function updateFromClientX(clientX){
    const rect=wrap.getBoundingClientRect();
    setPos(((clientX-rect.left)/rect.width)*100);
  }
  let dragging=false,intro=null;
  function start(e){dragging=true;intro&&intro.kill();move(e);}
  function move(e){
    if(!dragging)return;
    const clientX=e.touches?e.touches[0].clientX:e.clientX;
    updateFromClientX(clientX);
    e.preventDefault();
  }
  function end(){dragging=false;}
  handle.addEventListener('mousedown',start);
  wrap.addEventListener('mousedown',start);
  window.addEventListener('mousemove',move);
  window.addEventListener('mouseup',end);
  handle.addEventListener('touchstart',start,{passive:false});
  wrap.addEventListener('touchstart',start,{passive:false});
  window.addEventListener('touchmove',move,{passive:false});
  window.addEventListener('touchend',end);
  window.addEventListener('resize',setFullWidth);

  // Ao entrar na tela, o divisor "mostra" o antes e o depois sozinho
  let played=false;
  function playIntro(){
    if(played||reduceMotion)return;
    played=true;
    setFullWidth();
    if(hasGSAP){
      const p={v:8};
      setPos(p.v);
      intro=gsap.timeline({onUpdate:()=>setPos(p.v)})
        .to(p,{v:86,duration:1.1,ease:'power2.inOut'})
        .to(p,{v:50,duration:.9,ease:'power3.out'});
      return;
    }
    const s=5,e=50,dur=1200;let t0=null;
    const ease=x=>1-Math.pow(1-x,3);
    (function step(ts){
      if(!t0)t0=ts;
      const k=Math.min(1,(ts-t0)/dur);
      setPos(s+(e-s)*ease(k));
      if(k<1)requestAnimationFrame(step);
    })(performance.now());
  }
  setFullWidth();
  setPos(50);
  const baObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){playIntro();baObs.disconnect();}}),{threshold:.45});
  baObs.observe(wrap);
});

// Método: holofote seguindo o cursor
const metodoSection=document.querySelector('.metodoSection');
if(metodoSection){
  metodoSection.addEventListener('mousemove',e=>{
    const r=metodoSection.getBoundingClientRect();
    metodoSection.style.setProperty('--sx',((e.clientX-r.left)/r.width*100)+'%');
    metodoSection.style.setProperty('--sy',((e.clientY-r.top)/r.height*100)+'%');
  });
}

// Depoimento expansível (SAIBA MAIS) — altura animada quando o GSAP existe
document.querySelectorAll('.testimonialToggle').forEach(function(btn){
  const full=btn.nextElementSibling;
  btn.setAttribute('aria-expanded','false');
  btn.addEventListener('click',function(){
    const opening=!full.classList.contains('open');
    btn.textContent=opening?'VER MENOS ←':'SAIBA MAIS →';
    btn.setAttribute('aria-expanded',String(opening));
    if(!motionOn){ full.classList.toggle('open',opening); return; }
    const refresh=()=>ScrollTrigger.refresh();
    if(opening){
      full.classList.add('open');
      gsap.fromTo(full,{height:0},{height:'auto',duration:.65,ease:'power3.inOut',onComplete:refresh});
      gsap.from(full.children,{y:18,opacity:0,duration:.55,stagger:.08,delay:.15,ease:'power3.out'});
    }else{
      gsap.to(full,{height:0,duration:.5,ease:'power3.inOut',onComplete(){full.classList.remove('open');gsap.set(full,{clearProps:'height'});refresh();}});
    }
  });
});

// Sem GSAP (CDN falhou) ou com "reduzir movimento": conteúdo visível e estático
if(!motionOn){
  root.classList.remove('js-motion');
  document.querySelector('.preloader')?.remove();
  carousel.start();
  return;
}

// ===== 2. Camada de motion =====
gsap.registerPlugin(ScrollTrigger,SplitText);
if(window.ScrambleTextPlugin)gsap.registerPlugin(ScrambleTextPlugin);
const canScramble=!!window.ScrambleTextPlugin;
root.classList.add('has-motion');
gsap.defaults({ease:'power3.out',duration:.8});
const mm=gsap.matchMedia();
const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>gsap.utils.toArray(s,c);

// Smooth scroll (Lenis) no mesmo loop do GSAP
let lenis=null;
if(window.Lenis){
  lenis=new Lenis({duration:1.15,smoothWheel:true});
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href');
  if(id.length<2)return;
  const target=document.querySelector(id);
  if(!target)return;
  e.preventDefault();
  if(lenis)lenis.scrollTo(target,{offset:-70,duration:1.4});
  else target.scrollIntoView({behavior:'smooth'});
}));

function scramble(el,opts){
  if(!canScramble)return gsap.from(el,{opacity:0,duration:.5});
  const text=el.dataset.text||(el.dataset.text=el.textContent);
  return gsap.to(el,Object.assign({duration:1.1,ease:'none',scrambleText:{text,chars:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',speed:.55,revealDelay:.15}},opts));
}

// Prepara traços SVG para "desenhar" (stroke-dashoffset)
function prepStroke(el){
  const len=el.getTotalLength?el.getTotalLength():1000;
  gsap.set(el,{strokeDasharray:len,strokeDashoffset:len});
  return el;
}

// ---------- Cabeçalho, barra de progresso, cursor ----------
const header=$('.header');
let headerHidden=false;
ScrollTrigger.create({
  start:0,end:'max',
  onUpdate(self){
    const y=self.scroll();
    header.classList.toggle('scrolled',y>40);
    if(nav.classList.contains('open')||root.classList.contains('is-loading'))return;
    const hide=self.direction===1&&y>320;
    if(hide!==headerHidden){
      headerHidden=hide;
      gsap.to(header,{yPercent:hide?-100:0,duration:.5,ease:'power3.inOut',overwrite:'auto'});
    }
  }
});
gsap.to('.scrollProgress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});

if(finePointer){
  root.classList.add('cursor-on');
  const cur=$('.cursor'),dot=$('.cursorDot'),ring=$('.cursorRing');
  const dx=gsap.quickTo(dot,'x',{duration:.08,ease:'power3'}),dy=gsap.quickTo(dot,'y',{duration:.08,ease:'power3'});
  const rx=gsap.quickTo(ring,'x',{duration:.45,ease:'power3'}),ry=gsap.quickTo(ring,'y',{duration:.45,ease:'power3'});
  window.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;
    cur.classList.add('visible');
    dx(e.clientX);dy(e.clientY);rx(e.clientX);ry(e.clientY);
  },{passive:true});
  document.addEventListener('mouseleave',()=>cur.classList.remove('visible'));
  document.addEventListener('pointerover',e=>{
    const t=e.target;
    const drag=!!t.closest('.ba-wrap');
    cur.classList.toggle('is-drag',drag);
    cur.classList.toggle('is-hover',!drag&&!!t.closest('a,button,[data-msg],.hc-slide.prev,.hc-slide.next'));
  });
  window.addEventListener('pointerdown',()=>cur.classList.add('is-down'));
  window.addEventListener('pointerup',()=>cur.classList.remove('is-down'));

  // Botões magnéticos
  $$('.btn,.navbtn,.footerSocial a').forEach(el=>{
    el.classList.add('magnetic');
    gsap.set(el,{x:0,y:0});
    const xTo=gsap.quickTo(el,'x',{duration:.6,ease:'elastic.out(1,.45)'}),yTo=gsap.quickTo(el,'y',{duration:.6,ease:'elastic.out(1,.45)'});
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      xTo((e.clientX-r.left-r.width/2)*.3);
      yTo((e.clientY-r.top-r.height/2)*.4);
    });
    el.addEventListener('pointerleave',()=>{xTo(0);yTo(0);});
  });

  // Tilt 3D nos cards
  const tilt=(sel,k)=>$$(sel).forEach(card=>{
    gsap.set(card,{transformPerspective:900});
    const tx=gsap.quickTo(card,'rotationX',{duration:.6,ease:'power3'}),ty=gsap.quickTo(card,'rotationY',{duration:.6,ease:'power3'});
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      tx(-((e.clientY-r.top)/r.height-.5)*k);
      ty(((e.clientX-r.left)/r.width-.5)*k);
    });
    card.addEventListener('pointerleave',()=>{tx(0);ty(0);});
  });
  tilt('.pillCards article',6);
  tilt('.pillarCard',8);
  tilt('.testimonialCard',4);
}

// ---------- Hero ----------
const hero=$('.hero');
const heroTitle=$('.heroTitle');
let heroSplit=null;
function positionScribble(){
  // O SplitText pode duplicar o <span class="accent">; mede o que tem conteúdo
  const wrap=$('.heroTitleWrap'),svg=$('.heroScribble');
  const acc=$$('.accent',heroTitle).find(a=>a.getBoundingClientRect().width>0);
  if(!wrap||!acc||!svg)return;
  const w=wrap.getBoundingClientRect(),a=acc.getBoundingClientRect();
  gsap.set(svg,{left:a.left-w.left,top:a.bottom-w.top-a.height*.16,width:a.width,height:Math.max(14,a.height*.32)});
}
function buildHeroIntro(){
  heroSplit=SplitText.create(heroTitle,{type:'lines,chars',mask:'lines',linesClass:'st-line'});
  positionScribble();
  const scribble=$$('.heroScribble path').map(prepStroke);
  const eyebrow=$('.hero .eyebrow');
  const badgeNum=$('.badge b'),count={v:0};
  badgeNum.textContent='0';

  const tl=gsap.timeline({paused:true,defaults:{ease:'power4.out'},onComplete:()=>carousel.start()});
  tl.from(header,{yPercent:-100,duration:1,ease:'expo.out'},0)
    .from('.blueGlow',{scale:.2,opacity:0,duration:1.8,ease:'expo.out'},0)
    .from(eyebrow,{opacity:0,duration:.3},.05)
    .add(scramble(eyebrow,{duration:1.2}),.05)
    .from(heroSplit.chars,{yPercent:118,rotate:9,duration:1.15,stagger:.026},.1)
    .to(scribble,{strokeDashoffset:0,duration:.9,ease:'power2.inOut',stagger:.18},.85)
    .from('.hero h2',{y:30,opacity:0,duration:.9},.6)
    .from('.heroText>p:not(.eyebrow)',{y:24,opacity:0,duration:.9},.72)
    .from('.hero .actions .btn',{y:26,opacity:0,scale:.9,duration:.8,stagger:.09,ease:'back.out(1.7)'},.85)
    .from('.logoStack',{y:90,opacity:0,duration:1.4,ease:'expo.out'},.15)
    .fromTo('.hc-slide.active img',{clipPath:'inset(100% 0% 0% 0%)',scale:1.35},{clipPath:'inset(0% 0% 0% 0%)',scale:1,duration:1.5,ease:'expo.out'},.25)
    .from('.badge',{y:34,opacity:0,duration:.9},.9)
    .to(count,{v:26,duration:1.6,ease:'power2.out',onUpdate:()=>{badgeNum.textContent=Math.round(count.v)}},.95)
    .from('.heroPulse',{opacity:0,duration:1.4,ease:'power2.out'},.5)
    .from('.scrollCue',{y:20,opacity:0,duration:.8},1.3);
  return tl;
}

// Movimento do mouse: carrossel em 3D + brilho que segue o cursor
if(finePointer){
  gsap.set('.heroCarousel',{transformPerspective:1000});
  const cx=gsap.quickTo('.heroCarousel','rotationY',{duration:.9,ease:'power3'}),cy=gsap.quickTo('.heroCarousel','rotationX',{duration:.9,ease:'power3'});
  const gx=gsap.quickTo('.blueGlow','x',{duration:1.4,ease:'power3'}),gy=gsap.quickTo('.blueGlow','y',{duration:1.4,ease:'power3'});
  hero.addEventListener('pointermove',e=>{
    const r=hero.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    cx(px*12);cy(-py*9);gx(px*90);gy(py*70);
  });
  hero.addEventListener('pointerleave',()=>{cx(0);cy(0);gx(0);gy(0);});
}
// Ao rolar, o hero se afasta em camadas
const heroOut={trigger:hero,start:'top top',end:'bottom top',scrub:true};
gsap.to('.heroText',{yPercent:-22,opacity:.15,ease:'none',scrollTrigger:heroOut});
gsap.to('.heroLogo',{yPercent:14,scale:.92,ease:'none',scrollTrigger:heroOut});
gsap.to('.heroPulse',{yPercent:-120,opacity:0,ease:'none',scrollTrigger:heroOut});

// Cenas de rolagem: criadas depois que a fonte carrega, na ordem da página
function buildScenes(){
// ---------- Manifesto: palavras acendem com a rolagem ----------
const mText=$('.manifestoText');
if(mText){
  const mSplit=SplitText.create(mText,{type:'words'});
  gsap.set(mSplit.words,{opacity:.12});
  const ems=$$('em',mText);
  mm.add('(min-width: 851px)',()=>{
    const tl=gsap.timeline({scrollTrigger:{trigger:'.manifesto',start:'top top',end:'+=150%',pin:true,scrub:.6}});
    tl.to(mSplit.words,{opacity:1,duration:.3,stagger:.1,ease:'none'})
      .fromTo('.manifestoGlow',{scale:.45,opacity:.2},{scale:1.15,opacity:1,ease:'none',duration:tl.duration()},0)
      .to(ems,{textShadow:'0 0 40px rgba(255,90,31,.55)',duration:.4},'-=.4');
  });
  mm.add('(max-width: 850px)',()=>{
    gsap.to(mSplit.words,{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:mText,start:'top 80%',end:'bottom 45%',scrub:.5}});
  });
}

// ---------- Fita: acelera e inclina com a velocidade da rolagem ----------
const tapeTweens=$$('.tapeTrack').map((track,i)=>{
  const tw=i%2
    ?gsap.fromTo(track,{xPercent:-50},{xPercent:0,duration:38,ease:'none',repeat:-1,paused:true})
    :gsap.fromTo(track,{xPercent:0},{xPercent:-50,duration:30,ease:'none',repeat:-1,paused:true});
  tw.totalTime(tw.duration()*500); // folga para tocar ao contrário quando a rolagem sobe
  return tw;
});
if(tapeTweens.length){
  const skewSet=gsap.quickSetter('.tapeTrack','skewX','deg');
  const clampSkew=gsap.utils.clamp(-14,14);
  const proxy={skew:0};
  ScrollTrigger.create({
    trigger:'.tape',start:'top bottom',end:'bottom top',
    onToggle:self=>tapeTweens.forEach(t=>t.paused(!self.isActive)),
    onUpdate(self){
      const v=self.getVelocity(),dir=self.direction;
      const boost=gsap.utils.clamp(1,7,1+Math.abs(v)/350);
      tapeTweens.forEach(t=>{t.timeScale(boost*dir);gsap.to(t,{timeScale:dir,duration:1,ease:'power2.out',overwrite:true});});
      const skew=clampSkew(v/-260);
      if(Math.abs(skew)>Math.abs(proxy.skew)){
        proxy.skew=skew;
        gsap.to(proxy,{skew:0,duration:.9,ease:'power3',overwrite:true,onUpdate:()=>skewSet(proxy.skew)});
      }
    }
  });
  const tapeScrub={trigger:'.tape',start:'top bottom',end:'bottom top',scrub:true};
  gsap.fromTo('.tapeBand--accent',{rotate:-8,xPercent:-5},{rotate:-1.5,xPercent:3,ease:'none',scrollTrigger:tapeScrub});
  gsap.fromTo('.tapeBand--dark',{rotate:7,xPercent:4},{rotate:1,xPercent:-3,ease:'none',scrollTrigger:tapeScrub});
}

// ---------- Títulos, eyebrows e textos de apoio ----------
$$('.wordReveal').forEach(el=>{
  SplitText.create(el,{type:'lines,words',mask:'lines',linesClass:'st-line',autoSplit:true,onSplit(self){
    return gsap.from(self.words,{yPercent:115,duration:1.05,ease:'power4.out',stagger:.055,scrollTrigger:{trigger:el,start:'top 86%',toggleActions:'play none none none'}});
  }});
});
$$('.eyebrow').filter(el=>!el.closest('.hero')).forEach(el=>{
  gsap.set(el,{opacity:0});
  let done=false;
  ScrollTrigger.create({trigger:el,start:'top 90%',onEnter(){if(done)return;done=true;gsap.to(el,{opacity:1,duration:.3});scramble(el);}});
});
$$('.lead').filter(el=>!el.closest('.hero')).forEach(el=>{
  gsap.from(el,{y:26,opacity:0,duration:1,scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none none'}});
});
$$('.actions').filter(el=>!el.closest('.hero')).forEach(el=>{
  // fromTo: sem o cursor magnético, .btn tem transition de transform no CSS e o from() leria o valor no meio dela
  gsap.fromTo(el.children,{y:24,opacity:0},{y:0,opacity:1,stagger:.1,duration:.8,ease:'back.out(1.6)',scrollTrigger:{trigger:el,start:'top 90%',toggleActions:'play none none none'}});
});

// ---------- Método ----------
gsap.from('.pillarCard',{y:100,rotationX:-30,opacity:0,transformPerspective:900,transformOrigin:'50% 100%',duration:1.2,ease:'power4.out',stagger:.15,scrollTrigger:{trigger:'.timelineH',start:'top 84%',toggleActions:'play none none none'}});
$$('.pillarCard').forEach((card,i)=>{
  const shapes=$$('.pillarIcon svg path, .pillarIcon svg circle, .pillarIcon svg rect',card);
  const strokes=shapes.filter(s=>!s.getAttribute('fill')).map(prepStroke);
  const fills=shapes.filter(s=>s.getAttribute('fill'));
  const tl=gsap.timeline({scrollTrigger:{trigger:card,start:'top 80%',toggleActions:'play none none none'},delay:.35+i*.15})
    .to(strokes,{strokeDashoffset:0,duration:1.1,ease:'power2.inOut',stagger:.12})
    .fromTo($('.pillarNum',card),{opacity:0,x:20},{opacity:1,x:0,duration:.7},0);
  if(fills.length){
    gsap.set(fills,{scale:0,transformOrigin:'50% 50%'});
    tl.to(fills,{scale:1,duration:.5,ease:'back.out(3)'},'-=.3');
  }
});
mm.add('(min-width: 851px)',()=>{
  const conn=$('.connector');
  if(!conn)return;
  const nodes=$$('.connectorNode',conn),cards=$$('.pillarCard');
  let stops=[];
  const measure=()=>{stops=nodes.map(n=>(n.offsetLeft+n.offsetWidth/2)/conn.offsetWidth);};
  measure();
  gsap.timeline({
    // Usa o progresso da timeline (com o atraso do scrub) para o nó acender quando o ponto chega nele
    onUpdate(){
      const p=this.progress();
      nodes.forEach((n,i)=>{
        n.classList.toggle('lit',p>=stops[i]);
        cards[i].classList.toggle('lit',p>=stops[i]);
      });
    },
    scrollTrigger:{trigger:conn,start:'top 88%',end:'top 38%',scrub:.6,invalidateOnRefresh:true,onRefresh:measure}
  })
    .fromTo('.connectorFill',{scaleX:0},{scaleX:1,ease:'none'})
    .fromTo('.connectorDot',{x:0,opacity:1},{x:()=>conn.offsetWidth,ease:'none',immediateRender:false},0);
  return ()=>[...nodes,...cards].forEach(el=>el.classList.remove('lit'));
});

// ---------- Sobre: linha do tempo que se preenche ----------
$$('.sobreBg').forEach(img=>{
  gsap.fromTo(img,{yPercent:-7,scale:1.2},{yPercent:7,scale:1.04,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
});
if($('.timeline')){
  gsap.fromTo('.timelineFill',{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{trigger:'.timeline',start:'top 62%',end:'bottom 62%',scrub:.5}});
  $$('.timeline article').forEach(a=>{
    gsap.from(a,{x:-46,opacity:0,duration:1,ease:'power4.out',scrollTrigger:{trigger:a,start:'top 86%',toggleActions:'play none none none'}});
    ScrollTrigger.create({trigger:a,start:'top 62%',onEnter:()=>a.classList.add('lit'),onLeaveBack:()=>a.classList.remove('lit')});
  });
}

// ---------- Presencial ----------
$$('.pillCards article').forEach((c,i)=>{
  gsap.timeline({scrollTrigger:{trigger:c,start:'top 90%',toggleActions:'play none none none'}})
    .from(c,{x:i%2?90:-90,opacity:0,duration:1.1,ease:'expo.out'})
    .fromTo($$('.pillPeople i',c),{scale:0},{scale:1,duration:.5,stagger:.08,ease:'back.out(3)',clearProps:'transform'},'-=.6')
    .add(canScramble?scramble($('.pillNum',c),{duration:.8,scrambleText:{text:$('.pillNum',c).textContent,chars:'0123456789',speed:.8}}):gsap.from($('.pillNum',c),{opacity:0}),'<');
});

// ---------- Consultoria ----------
if($('.featureList')){
  gsap.fromTo('.featureList div',{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.1,ease:'power3.inOut',stagger:.12,scrollTrigger:{trigger:'.featureList',start:'top 82%',toggleActions:'play none none none'}});
  $$('.featureList b').forEach((b,i)=>{
    gsap.from(b,{opacity:0,scale:.4,duration:.6,ease:'back.out(3)',delay:.25+i*.12,scrollTrigger:{trigger:'.featureList',start:'top 82%',toggleActions:'play none none none'}});
  });
}

// ---------- Aplicativos: celulares sobem girando com a rolagem ----------
$$('.phoneRow').forEach((row,i)=>{
  gsap.fromTo($('.phoneMock',row),{rotation:i?14:-14,scale:.55,opacity:.2},{rotation:0,scale:1,opacity:1,ease:'none',scrollTrigger:{trigger:row,start:'top bottom',end:'top 45%',scrub:.8}});
  gsap.fromTo($$('.phoneText>.btn',row),{y:30,opacity:0,scale:.9},{y:0,opacity:1,scale:1,duration:.9,ease:'back.out(1.7)',scrollTrigger:{trigger:row,start:'top 70%',toggleActions:'play none none none'}});
});

// ---------- Depoimentos ----------
$$('.ba-wrap').forEach(w=>{
  gsap.fromTo(w,{clipPath:'inset(18% 14% 18% 14% round 40px)',scale:.92,opacity:0},{clipPath:'inset(0% 0% 0% 0% round 26px)',scale:1,opacity:1,duration:1.3,ease:'expo.out',scrollTrigger:{trigger:w,start:'top 85%',toggleActions:'play none none none'}});
});
$$('.ba-hint').forEach(h=>gsap.from(h,{opacity:0,y:12,duration:.8,scrollTrigger:{trigger:h,start:'top 95%',toggleActions:'play none none none'}}));
$$('.testimonialCard').forEach(card=>{
  gsap.from(card,{y:70,opacity:0,duration:1.1,ease:'power4.out',scrollTrigger:{trigger:card,start:'top 88%',toggleActions:'play none none none'}});
  gsap.from($('.quoteMark',card),{scale:0,rotate:-60,duration:.8,ease:'back.out(2.5)',scrollTrigger:{trigger:card,start:'top 80%',toggleActions:'play none none none'}});
  const q=$('.testimonialQuote',card);
  const qs=SplitText.create(q,{type:'words'});
  gsap.fromTo(qs.words,{color:'#3b3e44'},{color:'#f5f2ec',stagger:.1,ease:'none',scrollTrigger:{trigger:q,start:'top 85%',end:'top 45%',scrub:true}});
});

// ---------- Contato + rodapé ----------
gsap.from('.contactList>*',{x:50,opacity:0,duration:1,ease:'power4.out',stagger:.12,scrollTrigger:{trigger:'.contactList',start:'top 85%',toggleActions:'play none none none'}});
gsap.fromTo('.contactList .socialIcon',{scale:0,rotate:-120},{scale:1,rotate:0,duration:.8,ease:'back.out(2.2)',stagger:.12,delay:.2,clearProps:'transform',scrollTrigger:{trigger:'.contactList',start:'top 85%',toggleActions:'play none none none'}});
const giant=$('.footerGiant span');
if(giant){
  const gs=SplitText.create(giant,{type:'chars',charsClass:'char'});
  gsap.from(gs.chars,{yPercent:105,duration:1.1,ease:'power4.out',stagger:.035,scrollTrigger:{trigger:'.footerGiant',start:'top 96%',toggleActions:'play none none none'}});
  gsap.to(gs.chars,{color:'#ff5a1f',stagger:.08,ease:'none',scrollTrigger:{trigger:'.footerGiant',start:'top 85%',end:'bottom bottom',scrub:true}});
}
}

// ---------- Intro (preloader) ----------
function runIntro(heroTl){
  const pre=$('.preloader');
  gsap.set(hero,{opacity:1});
  hero.style.animation='none';
  const seen=root.classList.contains('intro-seen');
  if(seen||!pre||getComputedStyle(pre).display==='none'){
    pre&&pre.remove();
    heroTl.play();
    return;
  }
  try{sessionStorage.setItem('bp-intro','1');}catch(e){}
  pre.style.animation='none';
  root.classList.add('is-loading');
  lenis&&lenis.stop();
  const num=$('.plNum',pre),c={v:0};
  gsap.set('.plPanel--accent',{yPercent:101,y:0});
  gsap.timeline({onComplete(){
      pre.remove();
      root.classList.remove('is-loading');
      lenis&&lenis.start();
      ScrollTrigger.refresh();
    }})
    .from('.plCenter',{opacity:0,y:24,duration:.6})
    .to(c,{v:26,duration:1.5,ease:'power2.inOut',onUpdate:()=>{num.textContent=String(Math.round(c.v)).padStart(2,'0')}},'<.1')
    .to('.plBar i',{scaleX:1,duration:1.5,ease:'power2.inOut'},'<')
    .add(scramble($('.plTag',pre),{duration:1.3}),'<')
    .to('.plCenter',{y:-40,opacity:0,duration:.45,ease:'power2.in'},'+=.2')
    .to('.plPanel--accent',{yPercent:0,duration:.6,ease:'power4.inOut'},'<.1')
    .set('.plPanel--dark',{autoAlpha:0})
    .to('.plPanel--accent',{yPercent:-101,duration:.85,ease:'power4.inOut'})
    .add(()=>heroTl.play(),'<.2');
}

// Espera a fonte Anton (para o SplitText quebrar as linhas certo) e dispara a intro
const fontsReady=document.fonts?Promise.race([document.fonts.load('400 1em Anton').then(()=>document.fonts.ready),new Promise(r=>setTimeout(r,1500))]):Promise.resolve();
fontsReady.then(()=>{
  const heroTl=buildHeroIntro();
  buildScenes();
  runIntro(heroTl);
  ScrollTrigger.refresh();
}).catch(e=>console.error(e&&e.stack||e));
let resizeT;
window.addEventListener('resize',()=>{clearTimeout(resizeT);resizeT=setTimeout(positionScribble,150);});
window.addEventListener('load',()=>{ScrollTrigger.refresh();positionScribble();});
})();
