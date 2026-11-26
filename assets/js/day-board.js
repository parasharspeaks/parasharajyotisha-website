(function(){
'use strict';
const $=id=>document.getElementById(id),hi=document.documentElement.lang.startsWith('hi'),L=(e,h)=>hi?h:e;
if(!$('day-board'))return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api='https://vedic-horoscope-api-production.up.railway.app/api/v1/panchanga/daily';
const labels={tithi:L('Tithi','तिथि'),nakshatra:L('Nakshatra','नक्षत्र'),yoga:L('Yoga','योग'),karana:L('Karana','करण'),sun:L('Sun','सूर्य'),rahu:L('Rahu Kaal','राहु काल'),yama:L('Yamaganda','यमगंड'),gulika:L('Gulika','गुलिक काल')};
const trans={};
function names(en,h){en.split('|').forEach((n,i)=>trans[n]=h.split('|')[i]);}
names('Pratipada|Dwitiya|Tritiya|Chaturthi|Panchami|Shashthi|Saptami|Ashtami|Navami|Dashami|Ekadashi|Dwadashi|Trayodashi|Chaturdashi|Purnima|Amavasya','प्रतिपदा|द्वितीया|तृतीया|चतुर्थी|पंचमी|षष्ठी|सप्तमी|अष्टमी|नवमी|दशमी|एकादशी|द्वादशी|त्रयोदशी|चतुर्दशी|पूर्णिमा|अमावस्या');
names('Ashwini|Bharani|Krittika|Rohini|Mrigashira|Ardra|Punarvasu|Pushya|Ashlesha|Magha|Purva Phalguni|Uttara Phalguni|Hasta|Chitra|Swati|Vishakha|Anuradha|Jyeshtha|Mula|Purva Ashadha|Uttara Ashadha|Shravana|Dhanishtha|Shatabhisha|Purva Bhadrapada|Uttara Bhadrapada|Revati','अश्विनी|भरणी|कृत्तिका|रोहिणी|मृगशिरा|आर्द्रा|पुनर्वसु|पुष्य|आश्लेषा|मघा|पूर्व फाल्गुनी|उत्तर फाल्गुनी|हस्त|चित्रा|स्वाती|विशाखा|अनुराधा|ज्येष्ठा|मूल|पूर्वाषाढ़ा|उत्तराषाढ़ा|श्रवण|धनिष्ठा|शतभिषा|पूर्वभाद्रपदा|उत्तरभाद्रपदा|रेवती');
names('Vishkambha|Priti|Ayushman|Saubhagya|Shobhana|Atiganda|Sukarma|Dhriti|Shula|Ganda|Vriddhi|Dhruva|Vyaghata|Harshana|Vajra|Siddhi|Vyatipata|Variyana|Parigha|Shiva|Siddha|Sadhya|Shubha|Shukla|Brahma|Indra|Vaidhriti','विष्कंभ|प्रीति|आयुष्मान|सौभाग्य|शोभन|अतिगंड|सुकर्मा|धृति|शूल|गंड|वृद्धि|ध्रुव|व्याघात|हर्षण|वज्र|सिद्धि|व्यतीपात|वरीयान|परिघ|शिव|सिद्ध|साध्य|शुभ|शुक्ल|ब्रह्म|इंद्र|वैधृति');
names('Bava|Balava|Kaulava|Taitila|Garija|Gara|Vanija|Vishti|Shakuni|Chatushpada|Naga|Kimstughna|Krishna|Shukla','बव|बालव|कौलव|तैतिल|गरज|गर|वणिज|विष्टि|शकुनि|चतुष्पद|नाग|किंस्तुघ्न|कृष्ण|शुक्ल');
const name=n=>hi?(trans[n]||n):n;
let model=null,events=[],serial=0,controller=null,zone='Asia/Kolkata',selected='',clock='12',view='simple';
const iso=d=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const shift=(s,n)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
function time(v){const d=new Date(v);if(!Number.isFinite(+d))return '—';const t=new Intl.DateTimeFormat(hi?'hi-IN':'en-IN',{timeZone:zone,hour:'2-digit',minute:'2-digit',hour12:clock==='12'}).format(d);return t+(iso(d)>selected?' '+L('(next day)','(अगला दिन)'):iso(d)<selected?' '+L('(previous day)','(पिछला दिन)'):'');}
function interval(o,key,n){const a=Date.parse(o?.start_time),b=Date.parse(o?.end_time);return Number.isFinite(a)&&Number.isFinite(b)&&b>a?{a,b,key,n:name(n||o.name),raw:o}:null;}
function create(data,next){
 zone=data.location?.timezone||'Asia/Kolkata';new Intl.DateTimeFormat('en',{timeZone:zone});
 const start=Date.parse(data.sun_moon?.sunrise_iso),end=Date.parse(next?.sun_moon?.sunrise_iso),sunset=Date.parse(data.sun_moon?.sunset_iso);
 if(!Number.isFinite(start)||!data.panchanga)throw Error('Incomplete Panchang');
 const rows={tithi:[],nakshatra:[],yoga:[],karana:[],rahu:[],yama:[],gulika:[]};
 for(const d of [data,next].filter(Boolean)){
  const p=d.panchanga||{};
  for(const k of ['tithi','nakshatra','yoga']){const v=interval(p[k],k);if(v)rows[k].push(v);}
  for(const v of Object.values(p.karana||{})){const i=interval(v,'karana');if(i)rows.karana.push(i);}
 }
 const bad=data.inauspicious_periods||{};
 for(const [k,field] of [['rahu','rahu_kalam'],['yama','yamagandam'],['gulika','gulikai_kalam']]){const v=interval(bad[field],k,labels[k]);if(v)rows[k].push(v);}
 for(const k in rows)rows[k]=rows[k].filter((x,i,a)=>a.findIndex(y=>y.a===x.a&&y.b===x.b&&y.n===x.n)===i).sort((a,b)=>a.a-b.a);
 return {data,next,start,end,sunset,rows};
}
function render(){
 if(!model)return;$('day-detail').hidden=true;const m=model,p=m.data.panchanga,validEnd=Number.isFinite(m.end)&&m.end>m.start,now=Date.now(),today=iso(new Date())===selected;
 const dateLabel=new Intl.DateTimeFormat(hi?'hi-IN':'en-IN',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(selected+'T12:00:00Z'));
 const place=m.data.location?.city||$('day-city').value;
 let html=`<header class="day-summary"><div><strong>${esc(place)}</strong><h3>${esc(dateLabel)}</h3><p>${esc(name(p.tithi?.name||'—'))} · ${esc(name(p.tithi?.paksha||''))} ${L('Paksha','पक्ष')} · ${esc(zone)}</p></div><div><span>${L('Sunrise','सूर्योदय')}</span><strong>${time(m.start)}</strong><span>${L('Sunset','सूर्यास्त')}</span><strong>${time(m.sunset)}</strong></div></header>`;
 // Show only events with actual service-provided transition boundaries.
 const upcoming=[];
 for(const k of ['tithi','nakshatra','yoga','karana'])for(const x of m.rows[k])if(x.b>=(today?now:m.start)&&(!validEnd||x.b<=m.end))upcoming.push({at:x.b,label:labels[k]+' · '+x.n+' '+L('ends','समाप्त')});
 for(const [at,label] of [[m.sunset,L('Sunset','सूर्यास्त')],[m.end,L('Next sunrise','अगला सूर्योदय')]])if(Number.isFinite(at)&&at>(today?now:m.start))upcoming.push({at,label});
 upcoming.sort((a,b)=>a.at-b.at);
 html+=`<h3 class="day-subhead">${today?L('What changes next?','अब आगे क्या बदलेगा?'):L('Transitions on this day','इस दिन के बदलाव')}</h3><div class="day-next-cards">`+upcoming.slice(0,3).map(x=>`<article><span>${esc(x.label)}</span><strong>${time(x.at)}</strong></article>`).join('')+'</div>';
 const r=m.rows.rahu[0];if(r){const state=today?(now<r.a?L('Upcoming','आने वाला'):now<r.b?L('Ongoing now','अभी चल रहा है'):L('Finished','समाप्त')):L('Selected day','चयनित दिन');html+=`<p class="day-rahu"><strong>${labels.rahu}: ${time(r.a)} – ${time(r.b)}</strong><span>${state}</span></p>`;}
 html+=`<h3 class="day-subhead">${L('Sunrise to next sunrise','सूर्योदय से अगले सूर्योदय तक')}</h3><p>${L('Tap any named period for exact timings. Striped gaps mean transition data is unavailable. Plain space outside a caution window is not a recommendation of an auspicious time.','सटीक समय देखने के लिए किसी अवधि को चुनें। धारीदार भाग में बदलाव की जानकारी उपलब्ध नहीं है। सावधानी अवधि के बाहर का सादा भाग शुभ मुहूर्त की सलाह नहीं है।')}</p>`;
 events=[];
 const keys=view==='detail'?['sun','tithi','nakshatra','yoga','karana','rahu','yama','gulika']:['sun','tithi','nakshatra','rahu'];
 m.rows.sun=[];if(Number.isFinite(m.sunset)&&m.sunset>m.start)m.rows.sun.push({a:m.start,b:m.sunset,key:'sun',n:L('Daylight','दिन का प्रकाश')});if(validEnd&&m.end>m.sunset)m.rows.sun.push({a:m.sunset,b:m.end,key:'sun',n:L('Night','रात्रि')});
 if(validEnd){html+=`<div class="day-axis"><span>${time(m.start)}</span><span>${time(m.end)}</span></div>`;}
 for(const k of keys){const narrow=[];html+=`<div class="day-row"><strong>${labels[k]}</strong><div class="day-track ${['rahu','yama','gulika'].includes(k)&&m.rows[k].length?'day-caution-track':''} ${validEnd?'':'day-no-axis'}">`;
 for(const x of m.rows[k]){if(x.b<=m.start||(validEnd&&x.a>=m.end))continue;const idx=events.push(x)-1;const left=validEnd?Math.max(0,(x.a-m.start)/(m.end-m.start)*100):0,width=validEnd?(Math.min(x.b,m.end)-Math.max(x.a,m.start))/(m.end-m.start)*100:100;
 if(validEnd&&width<9)narrow.push({x,idx});
 html+=`<button type="button" class="day-period ${validEnd&&width<9?'day-narrow':''} ${['rahu','yama','gulika'].includes(k)?'caution':''}" data-event="${idx}" style="--left:${left}%;--width:${width}%" title="${esc(x.n)}: ${time(x.a)} – ${time(x.b)}"><span>${esc(x.n)}</span><small>${time(x.a)} – ${time(x.b)}</small></button>`;}
 if(validEnd&&today&&now>=m.start&&now<m.end)html+=`<span class="day-now" style="left:${(now-m.start)/(m.end-m.start)*100}%" title="${L('Now','अभी')}"></span>`;
 html+='</div>';if(narrow.length)html+='<div class="day-narrow-list">'+narrow.map(({x,idx})=>`<button type="button" data-event="${idx}">${esc(x.n)} · ${time(x.a)} – ${time(x.b)}</button>`).join('')+'</div>';if(!m.rows[k].length)html+=`<p class="day-missing">${L('Timing unavailable','समय उपलब्ध नहीं')}</p>`;html+='</div>';}
 html+=`<p class="day-footnote">${L('Times are local to the selected city. Traditional timing guidance is not a guarantee. Some transition data can be incomplete.','समय चयनित शहर का स्थानीय समय है। पारंपरिक समय मार्गदर्शन परिणाम की गारंटी नहीं है। कुछ बदलावों की जानकारी अधूरी हो सकती है।')}</p>`;
 $('day-output').innerHTML=html;
 $('day-output').querySelectorAll('[data-event]').forEach(b=>b.addEventListener('click',()=>{const x=events[+b.dataset.event],box=$('day-detail');box.hidden=false;box.innerHTML=`<strong>${labels[x.key]} · ${esc(x.n)}</strong><p>${L('Starts','आरंभ')}: ${time(x.a)}<br>${L('Ends','समाप्त')}: ${time(x.b)}</p><p>${L('The timeline clips the period at sunrise boundaries. These are its full available start and end times.','समयरेखा सूर्योदय की सीमा पर अवधि काटती है। यहाँ उपलब्ध पूरा आरंभ और समाप्ति समय है।')}</p>`;box.focus();}));
}
async function fetchDay(date,city,signal){const r=await fetch(api+'?'+new URLSearchParams({date,city}),{signal});if(!r.ok)throw Error('API');const j=await r.json();if(j.status!=='success'||j.data?.gregorian_date!==date)throw Error('Date mismatch');return j.data;}
async function load(){
 if(!$('day-form').reportValidity())return;const id=++serial;controller?.abort();controller=new AbortController();const currentController=controller,signal=currentController.signal,timer=setTimeout(()=>currentController.abort(),45000);const city=$('day-city').value.trim(),date=$('day-date').value;
 $('day-output').replaceChildren();$('day-detail').hidden=true;$('day-status').textContent=L('Loading local timings…','स्थानीय समय लोड हो रहा है…');$('day-submit').disabled=true;model=null;
 document.dispatchEvent(new CustomEvent('pj-day-loading'));
 try{const [a,b]=await Promise.allSettled([fetchDay(date,city,signal),fetchDay(shift(date,1),city,signal)]);if(id!==serial)return;if(a.status!=='fulfilled')throw Error('Unavailable');selected=date;model=create(a.value,b.status==='fulfilled'?b.value:null);render();$('day-status').textContent=b.status==='fulfilled'?L('Local timings loaded. Select Detailed to see all rows.','स्थानीय समय उपलब्ध है। सभी पंक्तियों के लिए विस्तृत दृश्य चुनें।'):L('Partial data: next sunrise unavailable. Showing known intervals only.','आंशिक जानकारी: अगला सूर्योदय उपलब्ध नहीं। केवल ज्ञात अवधियाँ दिखाई गई हैं।');
 $('day-full').href=(hi?'/hi':'')+'/panchang.html?'+new URLSearchParams({city,date});try{localStorage.setItem('pj-panchang-city',city);}catch(_){}
 document.dispatchEvent(new CustomEvent('pj-day-selected',{detail:{city,date,time:a.value.sun_moon.sunrise,zone}}));
 }catch(e){if(id!==serial)return;$('day-status').textContent=L('Timings could not be loaded. Check the city/date and try again.','समय लोड नहीं हो सका। शहर और तारीख जाँचकर फिर प्रयास करें।');}finally{clearTimeout(timer);if(id===serial)$('day-submit').disabled=false;}
}
try{$('day-city').value=localStorage.getItem('pj-panchang-city')||'Dehradun';clock=localStorage.getItem('pj-day-clock')==='24'?'24':'12';}catch(_){}
$('day-date').value=iso(new Date());$('day-clock').value=clock;
$('day-form').addEventListener('submit',e=>{e.preventDefault();load();});
for(const [id,n] of [['day-prev',-1],['day-next',1]])$(id).addEventListener('click',()=>{$('day-date').value=shift($('day-date').value||iso(new Date()),n);load();});
$('day-today').addEventListener('click',()=>{$('day-date').value=iso(new Date());load();});
$('day-clock').addEventListener('change',()=>{clock=$('day-clock').value;try{localStorage.setItem('pj-day-clock',clock);}catch(_){}render();});$('day-view').addEventListener('change',()=>{view=$('day-view').value;render();});
setInterval(()=>{if(model&&!document.hidden)render();},60000);load();
})();
