(function(){
'use strict';
if(!document.body.hasAttribute('data-home-refresh'))return;
const $=id=>document.getElementById(id),hi=document.documentElement.lang.startsWith('hi');
const signs=hi?['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन']:['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const short=hi?{Sun:'सू',Moon:'चं',Mars:'मं',Mercury:'बु',Jupiter:'गु',Venus:'शु',Saturn:'श',Rahu:'रा',Ketu:'के'}:{Sun:'Su',Moon:'Mo',Mars:'Ma',Mercury:'Me',Jupiter:'Ju',Venus:'Ve',Saturn:'Sa',Rahu:'Ra',Ketu:'Ke'};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sign=n=>Math.floor(((n%360)+360)%360/30);
let chartData=null,style='north',busy=false;
try{style=localStorage.getItem('pj-home-chart')==='south'?'south':'north';}catch(_){}
function chart(){
 if(!chartData)return;const lag=sign(chartData.lagna.degree),planets=chartData.planets;
 const positions=[[300,150],[150,49],[49,150],[150,300],[49,450],[150,530],[300,450],[450,530],[551,450],[450,300],[551,150],[450,49]];
 const cells=[[12,0,0],[1,0,1],[2,0,2],[3,0,3],[11,1,0],[4,1,3],[10,2,0],[5,2,3],[9,3,0],[8,3,1],[7,3,2],[6,3,3]];
 let s='<svg viewBox="0 0 600 600" role="img" aria-label="Rashi chart of the calculated moment"><title>Planetary positions — '+escape(style)+' Indian chart</title>';
 if(style==='north')s+='<path d="M300 0 L450 150 L300 300 L150 150 Z" fill="var(--tint)"/><path class="chart-line" d="M300 0 L600 300 L300 600 L0 300 Z M0 0 L600 600 M600 0 L0 600"/>';
 for(let i=0;i<12;i++){
  let r,x,y;if(style==='north'){r=(lag+i)%12;[x,y]=positions[i];}else{const cell=cells[i];r=cell[0]-1;x=cell[2]*150+75;y=cell[1]*150+40;s+=`<rect x="${cell[2]*150}" y="${cell[1]*150}" width="150" height="150" fill="${r===lag?'var(--tint)':'none'}" stroke="var(--gold)"/>`;}
  const pp=planets.filter(p=>sign(p.longitude)===r),groups=[];for(let n=0;n<pp.length;n+=2)groups.push(pp.slice(n,n+2).map(p=>short[p.name]+(p.is_retrograde?(hi?' व':'ᴿ'):'')).join(' · '));
  s+=`<g><title>${escape(signs[r]+': '+pp.map(p=>p.name).join(', '))}</title><text class="sign" x="${x}" y="${y-12}" text-anchor="middle">${style==='north'?r+1:signs[r]}</text>${r===lag?`<text class="lag" x="${x}" y="${y+6}" text-anchor="middle">${hi?'लग्न':'Lagna'}</text>`:''}`;
  groups.forEach((g,n)=>s+=`<text class="planet" x="${x}" y="${y+26+n*18}" text-anchor="middle">${escape(g)}</text>`);s+='</g>';
 }
 if(style==='south')s+=`<text class="sign" x="300" y="280" text-anchor="middle">${hi?'राशि कुंडली':'Rashi chart'}</text><text class="lag" x="300" y="310" text-anchor="middle">${hi?'लाहिड़ी':'Lahiri'}</text>`;
 $('home-sky-chart').innerHTML=s+'</svg>';
}

function buttons(){document.querySelectorAll('[data-home-chart]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.homeChart===style)));}
document.querySelectorAll('[data-home-chart]').forEach(b=>b.addEventListener('click',()=>{style=b.dataset.homeChart;try{localStorage.setItem('pj-home-chart',style);}catch(_){}buttons();chart();}));buttons();
async function loadSky(){
 if(busy)return;busy=true;$('home-sky-refresh').disabled=true;chartData=null;$('home-sky-chart').replaceChildren();$('home-sky-moment').textContent='';
 $('home-sky-status').textContent=hi?'ग्रह स्थिति की गणना हो रही है…':'Calculating current positions…';
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
 const query=new URLSearchParams({dob:`${parts.year}-${parts.month}-${parts.day}`,tob:`${parts.hour}:${parts.minute}`,city:'Dehradun, Uttarakhand, India'});
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
 try{
  const response=await fetch('https://vedic-horoscope-api-production.up.railway.app/api/v1/kundli/birth-chart?'+query,{signal:controller.signal});
  if(!response.ok)throw Error('API unavailable');const json=await response.json(),d=json.data;
  if(!d||!Number.isFinite(d.lagna?.degree)||!d.birth_info?.timezone||!Array.isArray(d.planets)||!Object.keys(short).every(n=>d.planets.some(p=>p.name===n&&Number.isFinite(p.longitude))))throw Error('Incomplete positions');
  d.planets=d.planets.filter(p=>Object.hasOwn(short,p.name));chartData=d;chart();
  const b=d.birth_info;$('home-sky-moment').textContent=(hi?'देहरादून':'Dehradun')+' · '+b.date_of_birth+' · '+b.time_of_birth+' · '+b.timezone;
  $('home-sky-status').textContent=hi?'गणना पूर्ण। नवीनतम समय के लिए फिर देखें दबाएँ।':'Chart ready. Select Refresh for the latest moment.';
 }catch(_){$('home-sky-status').textContent=hi?'अभी ग्रह स्थिति नहीं मिल सकी। फिर देखें दबाएँ या पूरा टूल खोलें।':'Positions are unavailable right now. Retry or open the full tool.';}
 finally{clearTimeout(timer);busy=false;$('home-sky-refresh').disabled=false;}
}
$('home-sky-refresh').addEventListener('click',loadSky);
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();loadSky();}},{rootMargin:'150px'});observer.observe($('home-planets'));}else loadSky();
// Desktop hover is optional; click and keyboard behavior remain available.
document.querySelectorAll('.pj-nav-menu').forEach(menu=>{
 let timer;
 menu.addEventListener('pointerenter',e=>{if(e.pointerType==='touch'||!matchMedia('(min-width:769px) and (hover:hover)').matches)return;clearTimeout(timer);timer=setTimeout(()=>{menu.classList.add('open');menu.querySelector('button')?.setAttribute('aria-expanded','true');},160);});
 menu.addEventListener('pointerleave',()=>{clearTimeout(timer);timer=setTimeout(()=>{if(menu.contains(document.activeElement))return;menu.classList.remove('open');menu.querySelector('button')?.setAttribute('aria-expanded','false');},200);});
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.pj-nav-menu.open').forEach(menu=>{menu.classList.remove('open');const button=menu.querySelector('button');button?.setAttribute('aria-expanded','false');button?.focus();});});
const mobileNav=$('pj-mobile-nav');
if(mobileNav){[3,4].forEach((index)=>{const old=mobileNav.children[index],a=document.createElement('a');a.href=index===3?'#contact':(hi?'/hi/my-kundli.html':'/my-kundli.html');a.textContent=index===3?(hi?'परामर्श':'Guidance'):(hi?'मेरा खाता':'Account');old.replaceWith(a);});}
// Store only clicked public tool paths. Never store forms, birth data or account identifiers.
const shortcuts=[...document.querySelectorAll('.home-shortcut')],allowed=new Map(shortcuts.map(a=>[new URL(a.href).pathname+new URL(a.href).hash,a]));
let recent=[];try{const stored=JSON.parse(localStorage.getItem('pj-home-recent')||'[]');if(Array.isArray(stored))recent=stored.filter(x=>typeof x==='string'&&allowed.has(x)).slice(0,4);}catch(_){}
const region=$('home-recent');if(recent.length){region.hidden=false;const label=document.createElement('strong');label.textContent=hi?'हाल ही में खोले गए टूल:':'Recently opened on this device:';region.append(label);recent.forEach(path=>{const a=document.createElement('a');a.href=path;a.textContent=allowed.get(path).querySelector('strong').textContent;region.append(a);});const clear=document.createElement('button');clear.type='button';clear.textContent=hi?'मिटाएँ':'Clear';clear.addEventListener('click',()=>{recent=[];try{localStorage.removeItem('pj-home-recent');}catch(_){}region.hidden=true;});region.append(clear);}
shortcuts.forEach(a=>a.addEventListener('click',()=>{const url=new URL(a.href),path=url.pathname+url.hash;try{localStorage.setItem('pj-home-recent',JSON.stringify([path,...recent.filter(p=>p!==path)].slice(0,4)));}catch(_){}}));
})();
