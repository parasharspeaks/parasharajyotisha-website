(function () {
  'use strict';
  const root = document.getElementById('upcoming-events');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const hi = document.documentElement.lang.startsWith('hi');
  const L = (en, hindi) => hi ? hindi : en;
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const API = 'https://vedic-horoscope-api-production.up.railway.app/api/v1/';
  const planets = ['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu'];
  const planetHi = ['सूर्य','चंद्र','मंगल','बुध','गुरु','शुक्र','शनि','राहु','केतु'];
  const signs = ['Mesha','Vrishabha','Mithuna','Karkataka','Simha','Kanya','Tula','Vrischika','Dhanus','Makara','Kumbha','Meena'];
  const signHi = ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'];
  const lunarHi = {Ekadashi:'एकादशी',Trayodashi:'त्रयोदशी',Purnima:'पूर्णिमा',Amavasya:'अमावस्या'};
  const cache = new Map();
  let selection = null, visible = false, serial = 0, controller = null, events = [], filter = 'all', limit = 6;
  let failures = 0, completed = 0, total = 0, loading = false;
  const shift = (s,n) => {const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
  const planetName = p => hi ? (planetHi[planets.indexOf(p.toLowerCase())] || p) : p;
  const signName = s => hi ? (signHi[signs.indexOf(s)] || s) : s;
  const dateInZone = t => new Intl.DateTimeFormat('en-CA',{timeZone:selection.zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t));
  const dateText = d => new Intl.DateTimeFormat(hi?'hi-IN':'en-IN',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'}).format(new Date(d+'T12:00:00Z'));
  const momentText = t => new Intl.DateTimeFormat(hi?'hi-IN':'en-IN',{timeZone:selection.zone,day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(t));
  function lunarEvents(data) {
    const result = [];
    for (const day of data.days) {
      const t = day.panchanga?.tithi;
      if (!t || !Object.hasOwn(lunarHi,t.name)) continue;
      const start=Date.parse(t.start_time), end=Date.parse(t.end_time);
      if (!Number.isFinite(start)||!Number.isFinite(end)||end<=start) continue;
      const paksha=hi?(t.paksha==='Krishna'?'कृष्ण':'शुक्ल'):t.paksha;
      result.push({kind:'lunar',start,end,title:paksha+' '+(hi?lunarHi[t.name]:t.name),key:t.paksha+'-'+t.name});
    }
    return result;
  }
  function transitEvents(data) {
    return data.transits.flatMap(t => {
      const start=Date.parse(t.datetime_iso);
      if (!Number.isFinite(start)||!t.planet||!t.from_rashi||!t.to_rashi) return [];
      return [{kind:'transit',start,end:start+60000,key:t.planet+'-'+t.datetime_iso,title:hi?planetName(t.planet)+' का '+signName(t.to_rashi)+' में प्रवेश':t.planet+' enters '+t.to_rashi,from:signName(t.from_rashi),to:signName(t.to_rashi),retro:t.is_retrograde===true}];
    });
  }
  function merge(items) {
    const until=shift(selection.date,29);
    const result=[];
    for (const x of items.sort((a,b)=>a.start-b.start)) {
      if (dateInZone(x.start)>until || (x.kind==='lunar'?dateInZone(x.end)<selection.date:dateInZone(x.start)<selection.date)) continue;
      if (result.some(y=>y.kind===x.kind&&y.key===x.key&&(x.kind==='transit'||(x.start<y.end&&x.end>y.start)))) continue;
      result.push(x);
    }
    return result;
  }
  function render() {
    const shown=events.filter(x=>filter==='all'||x.kind===filter);
    $('upcoming-count').textContent=loading?L(`Loading ${completed} of ${total} sources…`,`${total} में से ${completed} स्रोत लोड…`):failures?L(`Partial results · ${failures} sources unavailable. Retry to check the missing events.`,`आंशिक परिणाम · ${failures} स्रोत अनुपलब्ध। छूटे कार्यक्रमों के लिए फिर प्रयास करें।`):L(`${events.length} events found in this 30-day window.`, `इन 30 दिनों में ${events.length} घटनाएँ मिलीं।`);
    $('upcoming-retry').hidden=loading||!failures;
    $('upcoming-more').hidden=shown.length<=limit;
    $('upcoming-list').innerHTML=shown.slice(0,limit).map(x=>{
      const i=events.indexOf(x),d=dateInZone(x.start),delta=Math.round((Date.parse(d+'T12:00:00Z')-Date.parse(selection.date+'T12:00:00Z'))/86400000);
      const badge=delta<0?L('Already started','पहले से जारी'):delta===0?L('Selected day','चयनित दिन'):L(`Day +${delta}`,`${delta} दिन बाद`);
      const kind=x.kind==='lunar'?L('Lunar date','चंद्र तिथि'):L('Planetary ingress','ग्रह राशि प्रवेश');
      const note=x.kind==='lunar'?L('Tithi window, not a confirmed fasting date.','तिथि की अवधि; व्रत की निश्चित तारीख नहीं।'):x.from+' → '+x.to+' · '+(x.retro?L('Retrograde','वक्री'):L('Direct','मार्गी'));
      const link=x.kind==='lunar'?(hi?'/hi/panchang.html':'/panchang.html')+'?'+new URLSearchParams({city:selection.city,date:d}):'/planets-today.html';
      return `<article class="upcoming-card ${x.kind}"><div class="upcoming-card-top"><span class="upcoming-kind">${kind}</span><span>${badge}</span></div><time datetime="${d}">${dateText(d)}</time><h3>${escape(x.title)}</h3><p class="upcoming-time">${momentText(x.start)}${x.kind==='lunar'?' – '+momentText(x.end):''}</p><p>${escape(note)}</p><div class="upcoming-actions"><button type="button" data-calendar="${i}">${L('Save to calendar','कैलेंडर में सहेजें')}</button><a href="${escape(link)}">${x.kind==='lunar'?L('View Panchang','पंचांग देखें'):L('Explore planets','ग्रह देखें')}</a></div></article>`;
    }).join('') || `<p class="upcoming-empty">${loading?L('Checking events for your selected date…','चयनित तारीख की घटनाएँ खोजी जा रही हैं…'):failures?L('No matching events in the available results. Some sources could not be loaded.','उपलब्ध परिणामों में कोई घटना नहीं। कुछ स्रोत लोड नहीं हुए।'):L('No matching events in this date range.','इस अवधि में इस श्रेणी की कोई घटना नहीं मिली।')}</p>`;
    root.querySelectorAll('[data-calendar]').forEach(b=>b.addEventListener('click',()=>download(events[Number(b.dataset.calendar)])));
  }
  function calendar(event) {
    const utc=t=>new Date(t).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const clean=s=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
    const detail=event.kind==='lunar'?'Calculated tithi window. Confirm local fasting and festival rules separately.':'Calculated Lahiri sidereal sign ingress. One-minute marker for the transition instant.';
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Parashar Jyotisha//Upcoming Events//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+event.kind+'-'+event.start+'-'+encodeURIComponent(event.key)+'@parasharajyotisha.com','DTSTAMP:'+utc(Date.now()),'DTSTART:'+utc(event.start),'DTEND:'+utc(event.end),'SUMMARY:'+clean(event.title),'DESCRIPTION:'+clean(detail+' Location: '+selection.city+'. Display timezone: '+selection.zone+'.'),'END:VEVENT','END:VCALENDAR'];
    // RFC 5545: fold long lines without splitting UTF-8 characters.
    return lines.map(line=>{let output='',segment='',bytes=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(bytes+n>73){output+=segment+'\r\n ';segment='';bytes=1;}segment+=c;bytes+=n;}return output+segment;}).join('\r\n')+'\r\n';
  }
  function download(event) {
    const url=URL.createObjectURL(new Blob([calendar(event)],{type:'text/calendar;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='parashar-event-'+dateInZone(event.start)+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('upcoming-download').textContent=L('Calendar file prepared. Open it in your calendar app to add the event.','कैलेंडर फ़ाइल तैयार है। घटना जोड़ने के लिए इसे अपने कैलेंडर ऐप में खोलें।');
  }
  async function fetchData(path,signal) {
    const hit=cache.get(path);if(hit&&Date.now()-hit.at<3600000)return hit.data;
    const res=await fetch(API+path,{signal});if(!res.ok)throw Error('Unavailable');const json=await res.json();if(json.status!=='success'||!json.data)throw Error('Invalid data');
    if(cache.size>=20)cache.delete(cache.keys().next().value);cache.set(path,{at:Date.now(),data:json.data});return json.data;
  }
  async function load() {
    if(!selection||!visible)return;
    controller?.abort();const id=++serial;controller=new AbortController();const signal=controller.signal;
    const active=controller,timer=setTimeout(()=>active.abort(),90000);
    events=[];failures=0;completed=0;limit=6;loading=true;
    const end=shift(selection.date,29),months=[...new Set(Array.from({length:30},(_,i)=>shift(selection.date,i).slice(0,7)))];
    const tasks=months.map(month=>async()=>{const [year,m]=month.split('-');const d=await fetchData('panchanga/monthly?'+new URLSearchParams({year,month:Number(m),city:selection.city,language:'en'}),signal);if(Number(d.year)!==Number(year)||Number(d.month)!==Number(m)||!Array.isArray(d.days))throw Error('Invalid month');return lunarEvents(d);});
    for(const planet of planets)tasks.push(async()=>{const d=await fetchData('transits/planet/'+planet+'?'+new URLSearchParams({from_date:selection.date,to_date:end,timezone:selection.zone,ayanamsa:'lahiri'}),signal);if(d.from_date!==selection.date||d.to_date!==end||!Array.isArray(d.transits))throw Error('Invalid range');return transitEvents(d);});
    total=tasks.length;render();let cursor=0;
    async function worker(){while(cursor<tasks.length&&id===serial&&!signal.aborted){const task=tasks[cursor++];try{const found=await task();if(id!==serial)return;events=merge([...events,...found]);}catch(_){if(id!==serial)return;failures++;}completed++;render();}}
    try{await Promise.all([worker(),worker(),worker()]);if(id!==serial)return;if(signal.aborted)failures+=total-completed;loading=false;render();}finally{clearTimeout(timer);}
  }
  function clear() {serial++;controller?.abort();selection=null;events=[];loading=false;$('upcoming-list').replaceChildren();$('upcoming-context').textContent=L('Follows the city and date selected above.','ऊपर चुने गए शहर और तारीख के अनुसार।');$('upcoming-count').textContent=L('Waiting for your selected day…','चयनित दिन की प्रतीक्षा…');$('upcoming-more').hidden=true;$('upcoming-retry').hidden=true;$('upcoming-download').textContent='';}
  document.addEventListener('pj-day-loading',clear);
  document.addEventListener('pj-day-selected',e=>{selection={...e.detail};$('upcoming-context').textContent=selection.city+' · '+dateText(selection.date)+' – '+dateText(shift(selection.date,29))+' · '+selection.zone;load();});
  root.querySelectorAll('[data-event-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.eventFilter;limit=6;root.querySelectorAll('[data-event-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(selection)render();}));
  $('upcoming-more').addEventListener('click',()=>{limit+=6;render();});$('upcoming-retry').addEventListener('click',load);
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){visible=true;observer.disconnect();load();}},{rootMargin:'250px'});observer.observe(root);}else visible=true;
})();
