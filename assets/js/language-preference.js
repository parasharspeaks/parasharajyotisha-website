/* Parashar Jyotisha language preference — no forced redirects. */
(function(){
  'use strict';
  var KEY='pj-language';
  function valid(v){return v==='en'||v==='hi';}
  function save(v){try{if(valid(v))localStorage.setItem(KEY,v);}catch(e){}}
  function load(){try{var v=localStorage.getItem(KEY);return valid(v)?v:null;}catch(e){return null;}}
  var current=(document.documentElement.lang||'en').toLowerCase().indexOf('hi')===0?'hi':'en';
  document.documentElement.setAttribute('data-pj-language',current);
  var preferred=load();
  if(preferred)document.documentElement.setAttribute('data-pj-preferred-language',preferred);
  document.addEventListener('click',function(e){
    var el=e.target.closest&&e.target.closest('[data-pj-lang]');
    if(!el)return;
    var v=el.getAttribute('data-pj-lang');
    if(valid(v))save(v);
  });
})();
