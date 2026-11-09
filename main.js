// Logo: turn the white background of the supplied PNG transparent and trim it
(function(){
  const imgs=[...document.querySelectorAll('img[data-logo]')];if(!imgs.length)return;
  const KEY='ph-logo-v1';
  const apply=url=>imgs.forEach(i=>{i.src=url;i.classList.add('logo-ready')});
  const fallback=()=>imgs.forEach(i=>{i.removeAttribute('crossorigin');i.classList.add('logo-ready','logo-fallback')});
  try{const c=sessionStorage.getItem(KEY);if(c){apply(c);return}}catch(e){}
  const src=imgs[0].src;const im=new Image();im.crossOrigin='anonymous';
  im.onload=()=>{try{
    const W=im.naturalWidth,H=im.naturalHeight,cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const x=cv.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,W,H),p=d.data;
    const mint=[0,229,161],blue=[55,167,231],col=[];let last=mint;
    for(let cx=0;cx<W;cx++){let bs=0,best=null;for(let y=0;y<H;y++){const k=(y*W+cx)*4,s=Math.max(p[k],p[k+1],p[k+2])-Math.min(p[k],p[k+1],p[k+2]);if(s>bs){bs=s;best=[p[k],p[k+1],p[k+2]]}}if(bs>60)last=best[2]>best[1]?blue:mint;col.push(last)}
    let x0=W,x1=0,y0=H,y1=0;
    for(let y=0;y<H;y++)for(let cx=0;cx<W;cx++){const k=(y*W+cx)*4,t=col[cx],a=Math.max(0,Math.min(1,(255-p[k])/(255-t[0])));p[k]=t[0];p[k+1]=t[1];p[k+2]=t[2];p[k+3]=Math.round(a*255);if(a>.05){x0=Math.min(x0,cx);x1=Math.max(x1,cx);y0=Math.min(y0,y);y1=Math.max(y1,y)}}
    x.putImageData(d,0,0);const pad=2,w=x1-x0+1+pad*2,h=y1-y0+1+pad*2,c2=document.createElement('canvas');c2.width=w;c2.height=h;
    c2.getContext('2d').drawImage(cv,x0-pad,y0-pad,w,h,0,0,w,h);const url=c2.toDataURL('image/png');
    try{sessionStorage.setItem(KEY,url)}catch(e){}apply(url);
  }catch(e){fallback()}};
  im.onerror=fallback;im.src=src;
  setTimeout(()=>imgs.forEach(i=>{if(!i.classList.contains('logo-ready'))fallback()}),2500);
})();

// Mobile menu
const header=document.querySelector('.site-header');
document.querySelector('.menu-btn')?.addEventListener('click',()=>{
  const open=header.classList.toggle('menu-open');
  document.querySelector('.menu-btn').setAttribute('aria-expanded',open);
  document.body.classList.toggle('no-scroll',open);
});

// Scroll reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Inquiry forms: open the visitor's mail app addressed to the team
document.querySelectorAll('form.form').forEach(f=>{
  f.addEventListener('submit',e=>{
    e.preventDefault();
    const d=new FormData(f);
    const name=`${d.get('first')||''} ${d.get('last')||''}`.trim();
    const body=`Name: ${name}\nTitle: ${d.get('title')||''}\nEmail: ${d.get('email')||''}\n\n${d.get('message')||''}`;
    window.location.href=`mailto:Info@potomacharbor.com?subject=${encodeURIComponent((f.classList.contains('is-demo')?'Book a demo: ':'Inquiry from ')+name)}&body=${encodeURIComponent(body)}`;
    f.classList.add('sent');
  });
});

// Events: sort into upcoming and past by date
const list=document.querySelector('[data-events]');
if(list){
  const today=new Date();today.setHours(0,0,0,0);
  const up=document.querySelector('[data-upcoming]'),past=document.querySelector('[data-past]');
  const items=[...list.querySelectorAll('.event')];
  items.sort((a,b)=>new Date(a.dataset.date)-new Date(b.dataset.date));
  items.forEach(ev=>{
    const isPast=new Date(ev.dataset.date+'T23:59:59')<today;
    (isPast?past:up).querySelector('.ev-list').appendChild(ev);
  });
  const pastList=[...past.querySelectorAll('.event')].reverse();
  pastList.forEach(ev=>past.querySelector('.ev-list').appendChild(ev));
  if(!past.querySelector('.event'))past.remove();
  const n=up.querySelectorAll('.event').length;
  const c=document.querySelector('[data-count]');if(c)c.textContent=String(n).padStart(2,'0');
  list.remove();
}

// ===================== Motion & effects =====================
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

// Split headline words for staggered rise
document.querySelectorAll('.split-words').forEach(h=>{
  let i=0;const base=parseInt(h.dataset.delay||150);
  [...h.childNodes].forEach(n=>{
    const make=(content,isEl)=>{const w=document.createElement('span');w.className='w';const s=document.createElement('span');s.style.setProperty('--d',(base+i++*90)+'ms');isEl?s.appendChild(content):s.textContent=content;w.appendChild(s);return w};
    if(n.nodeType===3){
      const frag=document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t))frag.appendChild(document.createTextNode(' '));else frag.appendChild(make(t,false))});
      n.replaceWith(frag);
    }else if(n.nodeType===1){n.replaceWith(make(n.cloneNode(true),true))}
  });
});

// Auto-stagger grouped reveals that have no delay set
document.querySelectorAll('.offer-grid,.team-grid,.findings,.fourS,.post-grid,.board-grid,.resources,.hub-cards,.ev-list').forEach(g=>{
  [...g.querySelectorAll(':scope>.reveal')].forEach((el,i)=>{if(!el.style.getPropertyValue('--d'))el.style.setProperty('--d',(i*110)+'ms')});
});
document.querySelectorAll('.fourS').forEach(f=>io.observe(f));
// Clip-path hides the element from IntersectionObserver, so watch its parent instead
const wio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll(':scope>.img-wipe').forEach(w=>w.classList.add('in'));wio.unobserve(e.target)}}),{threshold:.15});
new Set([...document.querySelectorAll('.img-wipe')].map(el=>el.parentElement)).forEach(p=>wio.observe(p));

// Count-up numbers
const cio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;cio.unobserve(e.target);
  const el=e.target,end=+el.dataset.count;if(reduce){el.textContent=end;return}
  const t0=performance.now(),dur=1600;
  const tick=t=>{const p=Math.min((t-t0)/dur,1);el.textContent=Math.round(end*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick)};
  el.textContent='0';requestAnimationFrame(tick);
}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));

// Header shrink + scroll progress + parallax
const bar=document.createElement('div');bar.className='progress';document.body.appendChild(bar);
const px=[...document.querySelectorAll('.parallax')];
let ticking=false;
const onScroll=()=>{
  const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
  header.classList.toggle('scrolled',y>20);
  bar.style.transform=`scaleX(${h>0?y/h:0})`;
  if(!reduce)px.forEach(el=>{const r=el.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;el.style.transform=`translate3d(0,${(r.top)*-(+el.dataset.speed||.1)}px,0) scale(1.08)`});
  ticking=false;
};
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(onScroll);ticking=true}},{passive:true});
onScroll();

// Cursor glow inside dark sections
document.querySelectorAll('.glow').forEach(g=>{
  const host=g.parentElement;
  host.addEventListener('mousemove',e=>{const r=host.getBoundingClientRect();g.style.setProperty('--mx',(e.clientX-r.left)+'px');g.style.setProperty('--my',(e.clientY-r.top)+'px')});
});

// Subtle 3D tilt on cards
if(!reduce&&matchMedia('(hover:hover)').matches){
  document.querySelectorAll('.member-card,.post-card,.finding,.hev,.callout').forEach(c=>{
    c.classList.add('tilt');
    c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(900px) rotateX(${-y*5}deg) rotateY(${x*6}deg) translateY(-4px)`});
    c.addEventListener('mouseleave',()=>{c.style.transform=''});
  });
}

// Home: show the next two upcoming events (falls back to most recent)
const he=document.querySelector('[data-home-events]');
if(he){
  const today=new Date();today.setHours(0,0,0,0);
  const all=[...he.querySelectorAll('.hev')];
  const up=all.filter(e=>new Date(e.dataset.date+'T23:59:59')>=today).sort((a,b)=>new Date(a.dataset.date)-new Date(b.dataset.date));
  const past=all.filter(e=>!up.includes(e)).sort((a,b)=>new Date(b.dataset.date)-new Date(a.dataset.date));
  const show=[...up,...past].slice(0,2);
  all.forEach(e=>{if(!show.includes(e))e.remove()});
  show.forEach((e,i)=>{he.appendChild(e);e.style.setProperty('--d',(i*140)+'ms')});
}

// Home hero video: pick size by screen, respect reduced motion, pause toggle
const hv=document.querySelector('.hv-video');
if(hv){
  const sec=hv.closest('.hero-video'),btn=sec.querySelector('.hv-toggle');
  if(reduce){sec.classList.add('paused');btn.setAttribute('aria-label','Play background video')}
  else{hv.src=innerWidth<768?hv.dataset.srcMobile:hv.dataset.srcDesktop;hv.play().catch(()=>{})}
  btn.addEventListener('click',()=>{
    if(!hv.src)hv.src=innerWidth<768?hv.dataset.srcMobile:hv.dataset.srcDesktop;
    if(hv.paused){hv.play();sec.classList.remove('paused');btn.setAttribute('aria-label','Pause background video')}
    else{hv.pause();sec.classList.add('paused');btn.setAttribute('aria-label','Play background video')}
  });
  new IntersectionObserver(([e])=>{if(sec.classList.contains('paused'))return;e.isIntersecting?hv.play().catch(()=>{}):hv.pause()}).observe(sec);
}

// Back to top
document.querySelector('.to-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduce?'auto':'smooth'}));

// Book a Demo: prefill the inquiry form when arriving from a demo link
if(new URLSearchParams(location.search).get('topic')==='demo'){
  document.querySelectorAll('form.form').forEach(f=>{
    f.classList.add('is-demo');
    const b=document.createElement('p');b.className='demo-banner';b.textContent='Book a Demo';f.prepend(b);
    const m=f.querySelector('[name=message]');if(m&&!m.value)m.value="I'd like to book a demo of PotomacHarbor.";
  });
}

// Close the mobile menu when a link is tapped or the screen widens
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>{header.classList.remove('menu-open');document.body.classList.remove('no-scroll')}));
addEventListener('resize',()=>{if(innerWidth>900&&header.classList.contains('menu-open')){header.classList.remove('menu-open');document.body.classList.remove('no-scroll')}});
