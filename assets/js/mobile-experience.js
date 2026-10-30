/* No tracking or birth-data storage. Preferences stay on this device. */
(function () {
 'use strict';
 if(document.getElementById('pj-mobile-nav') || window.self!==window.top || new URLSearchParams(location.search).has('embed')) return;
 var hi=document.documentElement.lang.toLowerCase().indexOf('hi')===0 || location.pathname.indexOf('/hi/')===0;
 var prefix=hi?'/hi/':'/';
 var t=hi?{home:'मुखपृष्ठ',daily:'पंचांग',kundli:'कुंडली',saved:'पसंदीदा',all:'सभी टूल',close:'बंद करें',search:'टूल खोजें',hint:'जैसे पंचांग, मिलान, dasha…',empty:'कोई टूल नहीं मिला। दूसरा शब्द खोजें।',none:'अभी कोई पसंदीदा नहीं है। सभी टूल में ☆ दबाकर जोड़ें।',add:'पसंदीदा में जोड़ें',remove:'पसंदीदा से हटाएँ',added:'पसंदीदा में जोड़ा गया।',removed:'पसंदीदा से हटाया गया।',local:'पसंदीदा और पंचांग का शहर केवल इस ब्राउज़र में रहते हैं। जन्म विवरण यहाँ सेव नहीं होते।',share:'पेज साझा करें',copied:'पेज का लिंक कॉपी हो गया।',failed:'लिंक कॉपी नहीं हुआ। ब्राउज़र से पेज साझा करें।',clear:'सेव की गई पसंद मिटाएँ',cleared:'पसंदीदा और पंचांग का शहर मिटा दिया गया।',storage:'ब्राउज़र में सेव नहीं हो सका। इस बार की पसंद यहीं उपलब्ध है।',today:'आज के लिए उपयोगी',intro:'अपने शहर का पंचांग देखें या कोई टूल खोलें।',contact:'संपर्क',learn:'सीखें'}:{home:'Home',daily:'Panchang',kundli:'Kundli',saved:'Saved',all:'All tools',close:'Close',search:'Find a tool',hint:'Try Panchang, matching, dasha…',empty:'No tools found. Try another word.',none:'No favourites yet. Tap ☆ in All tools to save one.',add:'Save favourite',remove:'Remove favourite',added:'Saved to favourites.',removed:'Removed from favourites.',local:'Favourites and your Panchang city stay in this browser. Birth details are not saved here.',share:'Share this page',copied:'Page link copied.',failed:'Could not copy. Use your browser’s Share option.',clear:'Clear saved preferences',cleared:'Favourites and Panchang city cleared.',storage:'Browser storage is unavailable. Your selection works for this visit.',today:'Useful today',intro:'Check your city’s Panchang or jump into a tool.',contact:'Contact',learn:'Learn'};
 var catalog=[
 ['panchang','Panchang today','आज का पंचांग',prefix+'panchang.html','daily tithi nakshatra दैनिक तिथि नक्षत्र'],
 ['kundli','Birth chart / Kundli','जन्म कुंडली',prefix+'tools.html#kundli','horoscope जन्म राशि'],
 ['matching','Kundli matching','कुंडली मिलान',prefix+'kundli-matching.html','marriage guna विवाह गुण'],
 ['sade','Sade Sati','साढ़ेसाती',hi?'/hi/sade-sati.html':'/sade-sati-calculator.html','saturn shani शनि'],
 ['rahu','Rahu Kaal','राहु काल',prefix+'rahu-kaal.html','timing समय'],
 ['dasha','Vimshottari Dasha','विंशोत्तरी दशा',hi?'/hi/tools.html#kundli':'/vimshottari-dasha.html','mahadasha महादशा'],
 ['transits','Planetary transits','ग्रह गोचर',prefix+'tools.html#transits','gochar ग्रह'],
 ['numerology','Numerology','अंक ज्योतिष',prefix+'tools.html#numerology','number अंक'],
 ['tithi','Today’s Tithi','आज की तिथि (English)','/today-tithi.html','lunar day तिथि'],
 ['nakshatra','Nakshatra today','आज का नक्षत्र (English)','/nakshatra-today.html','star नक्षत्र'],
 ['abhijit','Abhijit Muhurta','अभिजीत मुहूर्त (English)','/abhijit-muhurta.html','auspicious शुभ समय'],
 ['brahma','Brahma Muhurta','ब्रह्म मुहूर्त (English)','/brahma-muhurta.html','morning meditation ध्यान सुबह']
 ];
 function get(key,fallback){try{var v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v);}catch(e){return fallback;}}
 function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){return false;}}
 var saved=get('pj-mobile-favourites',[]);
 if(!Array.isArray(saved))saved=[];
 saved=saved.filter(function(id){return catalog.some(function(x){return x[0]===id;});});
 function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
 function href(item){var url=item[3];if(item[0]==='panchang'){try{var city=localStorage.getItem('pj-panchang-city');if(city&&city.length<=120)url+='?city='+encodeURIComponent(city);}catch(e){}url+='#daily-panchang';}return url;}
 function label(item){return item[hi?2:1];}
 var nav=el('nav','pj-mobile-nav');nav.id='pj-mobile-nav';nav.setAttribute('aria-label',hi?'मुख्य नेविगेशन':'Main navigation');
 var paths=['M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9','M5 5h14v16H5zM8 3v4m8-4v4M5 10h14','M12 2 22 12 12 22 2 12zM2 12h20M12 2v20','m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z','M4 6h16M4 12h16M4 18h16'];
 var entries=[[t.home,prefix],[t.daily,href(catalog[0])],[t.kundli,prefix+'tools.html#kundli'],[t.saved,null],[t.all,null]];
 entries.forEach(function(item,i){var n=el(item[1]?'a':'button');if(item[1])n.href=item[1];else{n.type='button';n.setAttribute('aria-haspopup','dialog');n.setAttribute('aria-expanded','false');n.setAttribute('aria-controls','pj-mobile-menu');n.addEventListener('click',function(){openMenu(i===3,n);});}n.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+paths[i]+'"/></svg>';n.appendChild(el('span','',item[0]));nav.appendChild(n);});
 document.body.appendChild(nav);document.body.classList.add('pj-mobile-ready');nav.children[1].addEventListener('click',function(){this.href=href(catalog[0]);});
 function active(){var p=location.pathname,h=location.hash;Array.from(nav.children).forEach(function(n){n.removeAttribute('aria-current');});var i=-1;if(p===prefix||p===prefix+'index.html')i=0;else if(p===prefix+'panchang.html')i=1;else if(p===prefix+'free-kundli.html'||(p===prefix+'tools.html'&&(!h||h==='#kundli')))i=2;if(i>=0)nav.children[i].setAttribute('aria-current','page');}
 active();window.addEventListener('hashchange',active);document.addEventListener('click',function(e){if(e.target.closest('.tool-tab'))setTimeout(active,0);});
 var dialog=el('dialog','pj-mobile-menu');dialog.id='pj-mobile-menu';dialog.setAttribute('aria-labelledby','pj-mobile-title');
 var head=el('div','pj-mobile-menu-head'),title=el('h2','',t.all);title.id='pj-mobile-title';head.appendChild(title);
 var close=el('button','',t.close);close.type='button';close.addEventListener('click',function(){dialog.close();});head.appendChild(close);dialog.appendChild(head);
 var lab=el('label','',t.search);lab.htmlFor='pj-mobile-search';dialog.appendChild(lab);
 var search=el('input');search.id='pj-mobile-search';search.type='search';search.placeholder=t.hint;search.autocomplete='off';dialog.appendChild(search);
 var list=el('div');dialog.appendChild(list);
 var status=el('p','pj-mobile-status');status.setAttribute('role','status');dialog.appendChild(status);
 var options=el('div','pj-mobile-options');
 var toggle=el('button');toggle.type='button';options.appendChild(toggle);
 var share=el('button','',t.share);share.type='button';options.appendChild(share);
 [[t.contact,'/contact-us.html'],[t.learn,'/learn.html'],[hi?'English':'हिन्दी',hi?'/':'/hi/']].forEach(function(x){var a=el('a','',x[0]);a.href=x[1];options.appendChild(a);});
 dialog.appendChild(options);dialog.appendChild(el('p','',t.local));var clear=el('button','',t.clear);clear.type='button';dialog.appendChild(clear);document.body.appendChild(dialog);
 var onlySaved=false,opener=null,previousOverflow='';
 function render(){list.replaceChildren();title.textContent=onlySaved?t.saved:t.all;toggle.textContent=onlySaved?t.all:t.saved;var q=search.value.trim().toLowerCase();var found=catalog.filter(function(x){return (!onlySaved||saved.indexOf(x[0])!==-1)&&[x[1],x[2],x[4]].join(' ').toLowerCase().indexOf(q)!==-1;});if(!found.length)list.appendChild(el('p','',onlySaved&&!q?t.none:t.empty));found.forEach(function(x){var row=el('div','pj-mobile-tool-row'),a=el('a','',label(x)),b=el('button');a.href=href(x);b.type='button';var yes=saved.indexOf(x[0])!==-1;b.textContent=yes?'★':'☆';b.setAttribute('aria-pressed',String(yes));b.setAttribute('aria-label',(yes?t.remove:t.add)+': '+label(x));b.addEventListener('click',function(){if(yes)saved=saved.filter(function(id){return id!==x[0];});else saved.push(x[0]);var ok=write('pj-mobile-favourites',saved);render();status.textContent=ok?(yes?t.removed:t.added):t.storage;var buttons=Array.from(list.querySelectorAll('button'));var target=buttons.find(function(btn){return btn.getAttribute('aria-label').endsWith(': '+label(x));});(target||search).focus();});row.append(a,b);list.appendChild(row);});}
 function openMenu(favourites,button){onlySaved=favourites;opener=button;search.value='';status.textContent='';render();if(typeof dialog.showModal!=='function'){location.href=prefix+'tools.html';return;}previousOverflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';button.setAttribute('aria-expanded','true');close.focus();}
 document.addEventListener('click',function(e){var button=e.target.closest('.hamburger');if(button&&window.matchMedia('(max-width:768px)').matches){e.preventDefault();e.stopImmediatePropagation();button.setAttribute('aria-controls',dialog.id);button.setAttribute('aria-haspopup','dialog');openMenu(false,button);}},true);
 dialog.addEventListener('close',function(){document.body.style.overflow=previousOverflow;if(opener){opener.setAttribute('aria-expanded','false');opener.focus();}});
 dialog.addEventListener('click',function(e){if(e.target===dialog){var r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 search.addEventListener('input',render);toggle.addEventListener('click',function(){onlySaved=!onlySaved;search.value='';render();});
 clear.addEventListener('click',function(){saved=[];var ok=true;try{localStorage.removeItem('pj-mobile-favourites');localStorage.removeItem('pj-panchang-city');}catch(e){ok=false;}render();nav.children[1].href=href(catalog[0]);status.textContent=ok?t.cleared:t.storage;});
 share.addEventListener('click',async function(){var url=location.origin+location.pathname+location.hash;try{if(navigator.share){await navigator.share({title:document.title,url:url});}else{await navigator.clipboard.writeText(url);status.textContent=t.copied;}}catch(e){if(e.name!=='AbortError')status.textContent=t.failed;}});
 if(location.pathname===prefix||location.pathname===prefix+'index.html'){var hero=document.querySelector('.hero');if(hero){var daily=el('section','pj-mobile-daily');daily.setAttribute('aria-label',t.today);daily.append(el('h2','',t.today),el('p','',t.intro));var links=el('div','pj-mobile-daily-links');[catalog[0],catalog[4],catalog[1],catalog[2]].forEach(function(x){var a=el('a','',label(x));a.href=href(x);links.appendChild(a);});daily.appendChild(links);hero.insertAdjacentElement('afterend',daily);}}
 // Tables scroll within their own region instead of widening the entire page.
 document.querySelectorAll('table').forEach(function(table){if(table.closest('.pj-mobile-table')||table.parentElement.matches('.table-wrap,.table-responsive'))return;var wrapper=el('div','pj-mobile-table');wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label',hi?'तालिका — क्षैतिज स्क्रॉल करें':'Table — scroll horizontally');table.before(wrapper);wrapper.appendChild(table);});
 if(window.visualViewport){window.visualViewport.addEventListener('resize',function(){var input=document.activeElement;document.body.classList.toggle('pj-mobile-keyboard',window.visualViewport.height<window.innerHeight*.75&&!!input&&/INPUT|TEXTAREA|SELECT/.test(input.tagName));});}
})();
