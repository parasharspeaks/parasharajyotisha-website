(function(){
'use strict';
const player=document.getElementById('school-player');
const title=document.getElementById('school-title');
const external=document.getElementById('school-youtube');
const status=document.getElementById('school-status');
if(!player)return;
function select(id,name,announce){
 if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
 title.textContent=name;external.href='https://www.youtube.com/watch?v='+id;
 const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Play '+name);
 const img=document.createElement('img');img.src='https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';img.alt='';img.width=480;img.height=360;
 const label=document.createElement('span');label.className='school-play';label.textContent='▶ Play lesson';button.append(img,label);player.replaceChildren(button);
 button.addEventListener('click',function(){const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';frame.title=name;frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';player.replaceChildren(frame);frame.focus();});
 document.querySelectorAll('.school-lesson').forEach(a=>{if(a.dataset.video===id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
 if(announce)status.textContent=name+' selected. Press Play lesson to begin.';
}
document.querySelectorAll('.school-lesson').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();select(a.dataset.video,a.dataset.title,true);player.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});player.querySelector('button').focus({preventScroll:true});}));
select('pwjTdotP2z0','Ashwini Nakshatra Ep1',false);
})();
