(function(){
  var root=document.documentElement;
  function setTheme(theme){
    var value=theme==='dark'?'dark':'light';
    root.setAttribute('data-theme',value);
    root.style.colorScheme=value;
    document.querySelectorAll('[data-theme-toggle]').forEach(function(button){
      button.textContent=value==='dark'?'☀ Light':'☾ Dark';
      button.setAttribute('aria-label',value==='dark'?'Switch to light theme':'Switch to dark theme');
    });
  }
  try{setTheme(localStorage.getItem('pj-theme')||'light')}catch(error){setTheme('light')}
  document.addEventListener('click',function(event){
    var button=event.target.closest('[data-theme-toggle]');
    if(!button)return;
    var next=root.getAttribute('data-theme')==='dark'?'light':'dark';
    try{localStorage.setItem('pj-theme',next)}catch(error){}
    setTheme(next);
  });
})();
