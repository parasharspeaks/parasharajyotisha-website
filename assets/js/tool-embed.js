(function(){
  'use strict';

  function connect(frame){
    var scheduled=false;
    var resizeObserver=null;

    function fit(){
      scheduled=false;
      try{
        var doc=frame.contentDocument;
        if(!doc) return;
        var body=doc.body;
        var root=doc.documentElement;
        var height=Math.max(
          body ? body.scrollHeight : 0,
          body ? body.offsetHeight : 0,
          root ? root.scrollHeight : 0,
          640
        );
        frame.style.height=Math.ceil(height+8)+'px';
        frame.dataset.loaded='true';
      }catch(_){
        frame.style.height='900px';
      }
    }

    function schedule(){
      if(scheduled) return;
      scheduled=true;
      requestAnimationFrame(fit);
    }

    frame.addEventListener('load',function(){
      schedule();
      try{
        var doc=frame.contentDocument;
        if(!doc) return;
        new MutationObserver(schedule).observe(doc.body,{childList:true,subtree:true});
        if('ResizeObserver' in window){
          resizeObserver=new ResizeObserver(schedule);
          resizeObserver.observe(doc.body);
        }
        doc.addEventListener('transitionend',schedule,true);
      }catch(_){ /* The full-page fallback link remains available. */ }
    });

    window.addEventListener('resize',schedule,{passive:true});
  }

  document.querySelectorAll('iframe[data-pj-tool-embed]').forEach(connect);
})();
