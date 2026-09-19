(function(){
  'use strict';
  var root=document.documentElement;
  var button=document.querySelector('[data-pj-page-theme]');
  var frame=document.querySelector('iframe[data-pj-tool-embed]');

  function current(){ return root.getAttribute('data-theme')==='dark'?'dark':'light'; }

  function syncFrame(theme){
    try{
      if(frame&&frame.contentDocument){
        frame.contentDocument.documentElement.setAttribute('data-theme',theme);
        frame.contentDocument.documentElement.style.colorScheme=theme;
      }
    }catch(_){ /* Same-origin calculator normally handles its own saved theme. */ }
  }

  function apply(theme,persist){
    theme=theme==='dark'?'dark':'light';
    root.setAttribute('data-theme',theme);
    root.style.colorScheme=theme;
    if(persist){ try{ localStorage.setItem('pj-theme',theme); }catch(_){} }
    if(button){
      button.innerHTML=theme==='dark'?'☀ <span>Light</span>':'☾ <span>Dark</span>';
      button.setAttribute('aria-label',theme==='dark'?'Switch to light theme':'Switch to dark theme');
      button.setAttribute('aria-pressed',theme==='dark'?'true':'false');
      button.title=button.getAttribute('aria-label');
    }
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content',theme==='dark'?'#0A0A0F':'#FBF5E9');
    syncFrame(theme);
  }

  if(button) button.addEventListener('click',function(){ apply(current()==='dark'?'light':'dark',true); });
  if(frame) frame.addEventListener('load',function(){ syncFrame(current()); });
  window.addEventListener('storage',function(event){ if(event.key==='pj-theme')apply(event.newValue,false); });
  apply(current(),false);
})();
