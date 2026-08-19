const menu=document.querySelector('.menu'),nav=document.querySelector('.header nav');
menu?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.header nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const phone='5527998860938';
document.querySelectorAll('[data-msg]').forEach(el=>el.addEventListener('click',()=>{const t=encodeURIComponent(el.dataset.msg);window.open('https://wa.me/'+phone+'?text='+t,'_blank')}));
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(e=>obs.observe(e));

// Background photo scale-in (Sobre / Consultoria / Depoimentos sections)
const sobreObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('inView')}),{threshold:.08});
document.querySelectorAll('.sobreSection').forEach(e=>sobreObs.observe(e));

// ===== Texto revelado palavra por palavra =====
function wrapWords(node){
  Array.from(node.childNodes).forEach(child=>{
    if(child.nodeType===3){
      const parts=child.textContent.split(/(\s+)/);
      const frag=document.createDocumentFragment();
      parts.forEach(part=>{
        if(part.trim()===''){ frag.appendChild(document.createTextNode(part)); return; }
        const mask=document.createElement('span');
        mask.className='wword-mask';
        const w=document.createElement('span');
        w.className='wword';
        w.textContent=part;
        mask.appendChild(w);
        frag.appendChild(mask);
      });
      child.replaceWith(frag);
    } else if(child.nodeType===1 && child.tagName!=='BR'){
      wrapWords(child);
    }
  });
}
const wordEls=document.querySelectorAll('.wordReveal');
wordEls.forEach(el=>{
  wrapWords(el);
  let i=0;
  el.querySelectorAll('.wword').forEach(w=>{ w.style.transitionDelay=(i*45)+'ms'; i++; });
});
const wordObs=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){ e.target.classList.add('wordsIn'); wordObs.unobserve(e.target); }
}),{threshold:.35});
wordEls.forEach(el=>wordObs.observe(el));

// ===== Tilt 3D nos cards =====
function attachTilt(selector,intensity){
  document.querySelectorAll(selector).forEach(card=>{
    let raf=null;
    card.addEventListener('mousemove',e=>{
      const rect=card.getBoundingClientRect();
      const px=(e.clientX-rect.left)/rect.width-.5;
      const py=(e.clientY-rect.top)/rect.height-.5;
      if(raf)cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        card.style.transform=`perspective(800px) rotateX(${(-py*intensity).toFixed(2)}deg) rotateY(${(px*intensity).toFixed(2)}deg) translateY(-4px)`;
      });
    });
    card.addEventListener('mouseleave',()=>{
      if(raf)cancelAnimationFrame(raf);
      card.style.transform='perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}
attachTilt('.pillCards article',7);
attachTilt('.timelineH article',5);
attachTilt('.testimonialCard',4);

// ===== Parallax leve =====
const parallaxEls=[
  {el:document.querySelector('.blueGlow'),speed:.06},
  ...Array.from(document.querySelectorAll('.phoneGlow')).map(el=>({el,speed:.05})),
  ...Array.from(document.querySelectorAll('.sobreBg')).map(el=>({el,speed:.04}))
].filter(p=>p.el);
let ticking=false;
function updateParallax(){
  const y=window.scrollY;
  parallaxEls.forEach(p=>{
    const rect=p.el.parentElement.getBoundingClientRect();
    const offset=(rect.top)*p.speed;
    if(p.el.classList.contains('sobreBg')){
      const inView=p.el.parentElement.classList.contains('inView');
      const scale=inView?1:1.12;
      p.el.style.transform=`translateY(${offset}px) scale(${scale})`;
    } else {
      p.el.style.transform=`translateY(${offset}px)`;
    }
  });
  ticking=false;
}
window.addEventListener('scroll',()=>{
  if(!ticking){ requestAnimationFrame(updateParallax); ticking=true; }
},{passive:true});
updateParallax();

// Carrossel de fotos do hero
(function(){
  const carousel=document.getElementById('heroCarousel');
  if(!carousel)return;
  const slides=carousel.querySelectorAll('.hc-slide');
  const dots=carousel.querySelectorAll('.hc-dot');
  let idx=0,timer=null;
  function show(i){
    slides.forEach((s,n)=>s.classList.toggle('active',n===i));
    dots.forEach((d,n)=>d.classList.toggle('active',n===i));
    idx=i;
  }
  function next(){ show((idx+1)%slides.length); }
  function startAuto(){ clearInterval(timer); timer=setInterval(next,4200); }
  dots.forEach(d=>d.addEventListener('click',()=>{ show(parseInt(d.dataset.i)); startAuto(); }));
  startAuto();
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
  let dragging=false;
  function start(e){dragging=true;move(e);}
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

  let played=false;
  function playIntro(){
    if(played)return;
    played=true;
    setFullWidth();
    const start=5,endv=50,dur=1200;let t0=null;
    function ease(x){return 1-Math.pow(1-x,3);}
    function step(ts){
      if(!t0)t0=ts;
      const p=Math.min(1,(ts-t0)/dur);
      setPos(start+(endv-start)*ease(p));
      if(p<1)requestAnimationFrame(step);
    }
    setPos(start);
    requestAnimationFrame(step);
  }
  setFullWidth();
  setPos(50);
  const baObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)playIntro();}),{threshold:.3});
  baObs.observe(wrap);
});

// Depoimento expansível (SAIBA MAIS)
document.querySelectorAll('.testimonialToggle').forEach(function(btn){
  const full=btn.nextElementSibling;
  btn.addEventListener('click',function(){
    const isOpen=full.classList.toggle('open');
    btn.textContent=isOpen?'VER MENOS ←':'SAIBA MAIS →';
  });
});
