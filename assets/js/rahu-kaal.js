(() => {
  const PAGE_KEY = "rahu";
  const PAGE_SHORT = "Rahu Kaal Today";
  const API = 'https://vedic-horoscope-api-production.up.railway.app/api/v1';
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const first = v => Array.isArray(v) ? v[0] : v;
  const text = v => { v=first(v); if(v===null||v===undefined||v==='') return ''; if(['string','number','boolean'].includes(typeof v)) return String(v); if(typeof v==='object') return v.name||v.name_en||v.title||v.label||v.value||v.formatted||v.display||v.time||v.city||v.city_name||''; return ''; };
  const nested = (o,p)=>p.split('.').reduce((a,k)=>(a&&typeof a==='object')?a[k]:undefined,o);
  const pick = (o,keys)=>{for(const k of keys){const v=nested(o,k);if(v!==undefined&&v!==null&&v!=='')return v;}return '';};
  const pickText=(o,keys)=>text(pick(o,keys));
  function to12(hm){const m=String(hm||'').match(/^(\d{1,2}):(\d{2})/);if(!m)return hm||'';let h=+m[1];const ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${m[2]} ${ap}`;}
  function cleanTime(v){if(!v)return '';const s=String(v).trim();let m=s.match(/T(\d{2}):(\d{2})/);if(m)return to12(`${m[1]}:${m[2]}`);m=s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);if(m)return to12(`${m[1]}:${m[2]}`);return s.replace(/\+05:?30/g,' IST').replace(/\.\d+/g,'');}
  function range(v){v=first(v);if(!v)return '';if(typeof v==='string')return v;if(typeof v==='object'){const a=cleanTime(v.start||v.from||v.start_time||'');const b=cleanTime(v.end||v.to||v.end_time||'');return [a,b].filter(Boolean).join(' – ')||text(v);}return text(v);}
  function subText(v){v=first(v);if(!v||typeof v!=='object')return '';const end=v.end_time||v.end||v.until||v.ends_at||'';const extra=v.paksha||v.nature||v.quality||'';return [extra,end?'until '+cleanTime(end):''].filter(Boolean).join(' · ');}
  function locationText(v,fallback){if(!v)return fallback;if(typeof v==='string'||typeof v==='number')return String(v);v=first(v);if(!v||typeof v!=='object')return fallback;const a=[v.city||v.city_name||v.name||v.place||v.locality,v.state||v.state_name||v.region,v.country||v.country_name].filter(Boolean);return [...new Set(a.map(String))].join(', ')||fallback;}
  function localIsoDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function displayDate(s){const d=/^\d{4}-\d{2}-\d{2}$/.test(s||'')?new Date(s+'T00:00:00'):new Date();return d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
  async function getJson(path){const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),25000);try{const r=await fetch(API+path,{headers:{Accept:'application/json'},signal:ctl.signal});let j={};try{j=await r.json()}catch(_){throw new Error('The Panchang service returned an unreadable response.');}if(!r.ok||j.status==='error')throw new Error(j.detail||j.message||`Panchang service error (${r.status})`);return j.data||j;}finally{clearTimeout(tm);}}
  const metric=(label,value)=>`<div class="metric"><small>${esc(label)}</small><strong>${esc(value||'—')}</strong></div>`;
  function render(data,ctx){
    const p=data.panchanga||data.panchang||data.daily_panchanga||data;
    const timings=data.sun_moon||data.timings||data.times||p;
    const bad=data.inauspicious_periods||data.inauspicious||data.ashubh||data.caution||p;
    const good=data.auspicious_periods||data.auspicious||data.shubh||data.muhurta||p;
    const loc=locationText(data.location_used||data.location||data.city,ctx.city);
    const apiDate=pickText(data,['date_iso','iso_date','gregorian_date','local_date','date'])||pickText(p,['date_iso','iso_date','gregorian_date','local_date','date'])||ctx.date;
    const shown=/^\d{4}-\d{2}-\d{2}$/.test(apiDate)?apiDate:ctx.date, dateText=displayDate(shown);
    const tithi=pick(p,['tithi','tithi_at_sunrise','tithi_name']), nak=pick(p,['nakshatra','nakshatra_at_sunrise']);
    const paksha=pickText(p,['paksha'])||text(first(tithi)?.paksha)||'';
    const moonSign=pickText(p,['moon_sign','chandra_rashi','moon_rashi']);
    const sunrise=cleanTime(pick(timings,['sunrise','sunrise_time'])), sunset=cleanTime(pick(timings,['sunset','sunset_time']));
    const rahu=range(pick(bad,['rahu_kalam','rahu_kaal','rahukalam']))||range(pick(p,['rahu_kalam','rahu_kaal']));
    const gulika=range(pick(bad,['gulikai_kalam','gulika_kalam','gulika_kaal','gulikakalam']))||range(pick(p,['gulika_kalam','gulika_kaal']));
    const yama=range(pick(bad,['yamaganda','yamagandam']))||range(pick(p,['yamaganda','yamagandam']));
    const brahma=range(pick(good,['brahma_muhurat','brahma_muhurta']))||range(pick(p,['brahma_muhurat','brahma_muhurta']));
    const abhijit=range(pick(good,['abhijeet_muhurat','abhijit_muhurta','abhijit_muhurat']))||range(pick(p,['abhijeet_muhurat','abhijit_muhurta','abhijit_muhurat']));
    if(!rahu) throw new Error('Rahu Kaal timing was not returned for this location. Please try another city or date.');
    let main='', sub='', metrics=[], note='';
    if(PAGE_KEY==='tithi'){main=text(tithi)||'—';sub=subText(tithi)||paksha||'Current lunar day';metrics=[['Paksha',paksha],['Nakshatra',text(nak)],['Sunrise',sunrise],['City',loc]];note='Tithi can change during the civil day. Use the transition shown by the Panchang engine when available.';}
    if(PAGE_KEY==='nakshatra'){main=text(nak)||'—';sub=subText(nak)||'Moon’s current Nakshatra';metrics=[['Moon Sign',moonSign],['Tithi',text(tithi)],['Sunrise',sunrise],['City',loc]];note='The Moon can cross into the next Nakshatra during the day; the transition information matters when timing an activity.';}
    if(PAGE_KEY==='rahu'){main=rahu||'—';sub='Rahu Kaal / Rahu Kalam';metrics=[['Sunrise',sunrise],['Sunset',sunset],['Yamaganda',yama],['Gulika Kaal',gulika]];note='Traditionally used cautiously for fresh beginnings. Routine work and broader practical context should be distinguished from a new undertaking.';}
    if(PAGE_KEY==='abhijit'){main=abhijit||'—';sub='Abhijit Muhurta';metrics=[['Sunrise',sunrise],['Sunset',sunset],['Tithi',text(tithi)],['Nakshatra',text(nak)]];note='A general daily auspicious window is not the same as a full personal Muhurta calculation.';}
    if(PAGE_KEY==='brahma'){main=brahma||'—';sub='Brahma Muhurta';metrics=[['Sunrise',sunrise],['Tithi',text(tithi)],['Nakshatra',text(nak)],['City',loc]];note='Traditionally associated with quiet spiritual practice. Use it in a way that preserves adequate sleep and health.';}
    $('result').innerHTML=`<div class="focus-result"><div class="focus-head"><small>${esc(loc)} · ${esc(dateText)}</small><p class="result-label">${esc(sub)}</p><h3>${esc(main)}</h3></div><div class="metric-grid">${metrics.map(x=>metric(x[0],x[1])).join('')}</div><div class="focus-note">${esc(note)} <a href="panchang.html?city=${encodeURIComponent(ctx.city)}&date=${encodeURIComponent(ctx.date)}">View full Panchang →</a></div></div>`;
    addDetails(data,p,bad,ctx,loc);$('live-title').textContent='Rahu Kaal for your selected day';$('status').textContent=`Live timing loaded for ${loc}.`;$('status').className='status good';
    const q=new URLSearchParams({city:ctx.city,date:ctx.date});history.replaceState(null,'',`${location.pathname}?${q.toString()}`);
  }

  function addDetails(data,p,bad,ctx,loc){
    const sun=data.sun_moon||{},r=bad.rahu_kalam||bad.rahu_kaal||{};
    const seconds=v=>{const m=String(v||'').match(/(?:T|^)(\d{2}):(\d{2})(?::(\d{2}))?/);return m?+m[1]*3600 + +m[2]*60 + +(m[3]||0):NaN;};
    const rise=seconds(sun.sunrise),set=seconds(sun.sunset),start=seconds(r.start_time||r.start),end=seconds(r.end_time||r.end);
    const duration=n=>Number.isFinite(n)&&n>0?Math.floor(n/3600)+'h '+Math.round(n%3600/60)+'m':'Not available';
    const zone=data.location?.timezone||'Local time';
    const grid=document.createElement('div');grid.className='rahu-details';
    grid.innerHTML=`${metric('Rahu Kaal duration',duration(end-start))}${metric('Daylight duration',duration(set-rise))}${metric('Time zone',zone)}${metric('Tithi',text(p.tithi?.full_name||p.tithi))}${metric('Nakshatra',text(p.nakshatra))}${metric('Weekday',text(p.vaara?.english))}`;
    $('result').append(grid);
    if([rise,set,start,end].every(Number.isFinite)&&set>rise&&start>=rise&&end<=set&&end>start){
      const timeline=document.createElement('div');timeline.className='daylight';
      const left=(start-rise)/(set-rise)*100,width=(end-start)/(set-rise)*100;
      timeline.innerHTML=`<h3>Your daylight at a glance</h3><p>The highlighted portion is Rahu Kaal. Other portions are not automatically auspicious.</p><div class="daylight-track" role="img" aria-label="Rahu Kaal ${esc(range(r))}, between sunrise ${esc(cleanTime(sun.sunrise))} and sunset ${esc(cleanTime(sun.sunset))}"><span style="left:${left}%;width:${width}%"></span></div><div class="daylight-labels"><span>Sunrise ${esc(cleanTime(sun.sunrise))}</span><span>Sunset ${esc(cleanTime(sun.sunset))}</span></div><p class="timing-note">All times are local to ${esc(loc)} (${esc(zone)}). Displayed to the minute; duration uses available seconds.</p>`;
      $('result').append(timeline);
    }
  }
  async function load(){const city=$('city').value.trim()||'Dehradun',date=$('date').value||localIsoDate();$('submit').disabled=true;$('submit').textContent='Loading…';$('status').textContent='Calculating…';$('status').className='status';$('result').innerHTML='<div class="placeholder">Calculating local timings…</div>';try{const data=await getJson(`/panchanga/daily?date=${encodeURIComponent(date)}&city=${encodeURIComponent(city)}`);render(data,{city,date});}catch(e){console.error(e);$('status').textContent=e.name==='AbortError'?'The Panchang service took too long. Please try again.':(e.message||'Could not load this timing.');$('status').className='status bad';$('result').innerHTML='<div class="placeholder"><strong>Could not load this timing.</strong><span>Check the city spelling, or open the full Daily Panchang.</span><a class="btn secondary" href="panchang.html">Open Daily Panchang</a></div>';}finally{$('submit').disabled=false;$('submit').textContent='Check Now';}}
  $('form').addEventListener('submit',e=>{e.preventDefault();load();});const params=new URLSearchParams(location.search);$('date').value=params.get('date')||localIsoDate();$('city').value=params.get('city')||'Dehradun';load();
})();
