(function(){
'use strict';
const $=id=>document.getElementById(id), signs=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const short={Sun:'Su',Moon:'Mo',Mars:'Ma',Mercury:'Me',Jupiter:'Ju',Venus:'Ve',Saturn:'Sa',Rahu:'Ra',Ketu:'Ke'};
const escape=s=>String(s??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let chartData=null,style='north',zone='Asia/Kolkata',request=0,controller,lastCity='Dehradun, Uttarakhand, India';
const sign=n=>Math.floor(((n%360)+360)%360/30);
function degree(n){let t=Math.round((((n%30)+30)%30)*3600);if(t>=108000)t=107999;return `${Math.floor(t/3600)}° ${String(Math.floor(t%3600/60)).padStart(2,'0')}′ ${String(t%60).padStart(2,'0')}″`;}
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function setNow(){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(p=>[p.type,p.value]));$('date').value=`${parts.year}-${parts.month}-${parts.day}`;$('time').value=`${parts.hour}:${parts.minute}`;}
function setTheme(t){document.documentElement.dataset.theme=t;$('theme').textContent=t==='dark'?'Light theme':'Dark theme';try{localStorage.setItem('pj-theme',t);}catch(_){}}
try{setTheme(localStorage.getItem('pj-theme')==='dark'?'dark':'light');}catch(_){setTheme('light');}
$('theme').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
function chart(){
 if(!chartData)return;const lag=sign(chartData.lagna.degree),planets=chartData.planets;
 const positions=[[300,150],[150,49],[49,150],[150,300],[49,450],[150,530],[300,450],[450,530],[551,450],[450,300],[551,150],[450,49]];
 const cells=[[12,0,0],[1,0,1],[2,0,2],[3,0,3],[11,1,0],[4,1,3],[10,2,0],[5,2,3],[9,3,0],[8,3,1],[7,3,2],[6,3,3]];
 let s='<svg viewBox="0 0 600 600" role="img" aria-label="Rashi chart of the calculated moment"><title>Planetary positions — '+escape(style)+' Indian chart</title>';
 if(style==='north')s+='<path d="M300 0 L450 150 L300 300 L150 150 Z" fill="var(--tint)"/><path class="chart-line" d="M300 0 L600 300 L300 600 L0 300 Z M0 0 L600 600 M600 0 L0 600"/>';
 for(let i=0;i<12;i++){
  let r,x,y;if(style==='north'){r=(lag+i)%12;[x,y]=positions[i];}else{const cell=cells[i];r=cell[0]-1;x=cell[2]*150+75;y=cell[1]*150+40;s+=`<rect x="${cell[2]*150}" y="${cell[1]*150}" width="150" height="150" fill="${r===lag?'var(--tint)':'none'}" stroke="var(--gold)"/>`;}
  const pp=planets.filter(p=>sign(p.longitude)===r),groups=[];for(let n=0;n<pp.length;n+=2)groups.push(pp.slice(n,n+2).map(p=>short[p.name]+(p.is_retrograde?'ᴿ':'')).join(' · '));
  s+=`<g><title>${escape(signs[r]+': '+pp.map(p=>p.name).join(', '))}</title><text class="sign" x="${x}" y="${y-12}" text-anchor="middle">${style==='north'?r+1:signs[r]}</text>${r===lag?`<text class="lag" x="${x}" y="${y+6}" text-anchor="middle">Lagna</text>`:''}`;
  groups.forEach((g,n)=>s+=`<text class="planet" x="${x}" y="${y+26+n*18}" text-anchor="middle">${escape(g)}</text>`);s+='</g>';
 }
 if(style==='south')s+='<text class="sign" x="300" y="280" text-anchor="middle">Rashi chart</text><text class="lag" x="300" y="310" text-anchor="middle">Fixed signs · Lahiri</text>';
 $('chart').innerHTML=s+'</svg>';$('chart-help').textContent=style==='north'?'North Indian: houses stay fixed. The top diamond is Lagna; digits are sign numbers, not house numbers. R means retrograde.':'South Indian: signs stay fixed. The highlighted cell contains Lagna. R means retrograde.';
}
function render(d){
 chartData=d;const b=d.birth_info,lag=sign(d.lagna.degree),moon=d.planets.find(p=>p.name==='Moon'),sun=d.planets.find(p=>p.name==='Sun');
 zone=b.timezone;$('zone').textContent='Local time zone: '+zone;$('moment').textContent=b.date_of_birth+' · '+b.time_of_birth;$('place').textContent=b.city+' · '+zone+' · '+b.latitude+'°, '+b.longitude+'°';
 const stats=[['Lagna',signs[lag]],['Moon sign',signs[sign(moon.longitude)]],['Sun sign',signs[sign(sun.longitude)]],['Retrograde',d.planets.filter(p=>p.is_retrograde).length+' of 9 grahas']];
 $('stats').innerHTML=stats.map(([k,v])=>`<div class="stat"><small>${escape(k)}</small><strong>${escape(v)}</strong></div>`).join('');
 const rows=[{name:'Lagna',longitude:d.lagna.degree,nakshatra:d.lagna.nakshatra,nakshatra_pada:d.lagna.nakshatra_pada},...d.planets];
 $('positions').innerHTML=rows.map(p=>{const r=sign(p.longitude);return '<tr>'+[p.name,signs[r],degree(p.longitude),p.nakshatra,p.nakshatra_pada,(r-lag+12)%12+1,p.name==='Lagna'?'—':p.is_retrograde?'Retrograde':'Direct',p.longitude.toFixed(4)+'°'].map(v=>'<td>'+escape(v)+'</td>').join('')+'</tr>';}).join('');
 $('method').textContent='Lahiri ayanamsa: '+b.ayanamsa_value+'°. Positions supplied by the Parashar Jyotisha calculation API. Values are rounded to the precision returned by the service.';
 $('next').disabled=$('date').value>=today();$('results').hidden=false;chart();
}
async function calculate(){
 $('date').max=today();if(!$('controls').reportValidity())return;
 const token=++request;if(controller)controller.abort();controller=new AbortController();const active=controller;const timer=setTimeout(()=>active.abort(),45000);
 $('calculate').disabled=true;$('results').hidden=true;$('status').textContent='Calculating positions for your selected moment…';
 const q=new URLSearchParams({dob:$('date').value,tob:$('time').value,city:$('city').value.trim()});
 try{const r=await fetch('https://vedic-horoscope-api-production.up.railway.app/api/v1/kundli/birth-chart?'+q,{signal:active.signal});if(!r.ok)throw Error('The calculation service could not resolve this request. Use today or a past date and check the city and time, then try again.');const j=await r.json();const d=j.data;
 if(!d||!d.birth_info||!d.birth_info.timezone||!Number.isFinite(d.lagna?.degree)||!Array.isArray(d.planets)||!Object.keys(short).every(n=>d.planets.some(p=>p.name===n&&Number.isFinite(p.longitude))))throw Error('The service returned incomplete positions. Please try again.');
 if(token!==request)return;d.planets=d.planets.filter(p=>Object.hasOwn(short,p.name));render(d);lastCity=$('city').value.trim();$('status').textContent='Chart updated. Check the resolved city and timezone below.';
 }catch(e){if(token===request)$('status').textContent=e.name==='AbortError'?'The calculation took too long. Please try again.':e.message;}finally{clearTimeout(timer);if(token===request)$('calculate').disabled=false;}
}
$('controls').onsubmit=e=>{e.preventDefault();calculate();};
// Hide the previous result immediately when its input moment is edited.
$('controls').addEventListener('input',()=>{request++;controller?.abort();$('calculate').disabled=false;$('results').hidden=true;$('status').textContent='Inputs changed. Select Update chart to calculate this moment.';});
for(const name of ['north','south'])$(name).onclick=()=>{style=name;for(const n of ['north','south'])$(n).setAttribute('aria-pressed',String(n===name));chart();};
function shift(days){if(!$('date').value)return;const d=new Date($('date').value+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);const value=d.toISOString().slice(0,10);if(value>today()){$('status').textContent='Future dates are not yet supported by the calculation service.';return;}$('date').value=value;calculate();}
$('previous').onclick=()=>shift(-1);$('next').onclick=()=>shift(1);
$('now').onclick=async()=>{if($('city').value.trim()!==lastCity){await calculate();if($('results').hidden)return;}setNow();calculate();};$('now').title='Set the current date and time in the selected city’s timezone.';
$('print').onclick=()=>window.print();setNow();calculate();
})();
