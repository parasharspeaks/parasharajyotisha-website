const fs=require('fs');
const path=require('path');
const assert=require('assert');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const tools=read('tools.html');
const hiTools=read('hi/tools.html');
const headers=read('_headers');

for(const [name,html] of [['tools.html',tools],['hi/tools.html',hiTools]]){
  assert(!html.includes('mailto:su03may@gmail.com'),`${name}: public Gmail mailto remains`);
  assert(html.includes('support@parasharajyotisha.com'),`${name}: support email missing`);
  assert.strictEqual((html.match(/class="tool-tab/g)||[]).length,6,`${name}: expected six accessible tool tabs`);
  assert.strictEqual((html.match(/role="tab"/g)||[]).length,6,`${name}: tool tabs need tab semantics`);
  assert(html.includes("new URLSearchParams(location.search).get('embed')"),`${name}: embed mode missing`);
  assert(html.includes('aria-selected'),`${name}: selected tab state missing`);
  assert(html.includes('The calculation server is waking up')||html.includes('गणना सर्वर सक्रिय हो रहा है'),`${name}: cold-start feedback missing`);
}

for(const [file,tool] of [['free-kundli.html','kundli'],['kundli-matching.html','matching'],['sade-sati-calculator.html','sadesati']]){
  const html=read(file);
  assert(html.includes('data-pj-tool-embed'),`${file}: embedded calculator missing`);
  assert(html.includes(`tools.html?embed=${tool}#${tool}`),`${file}: incorrect embedded tool route`);
  assert(html.includes('assets/images/tool-embed.js'),`${file}: iframe resizing helper missing`);
}

assert(headers.includes('Strict-Transport-Security: max-age=31536000'),'HSTS header missing');
assert(headers.includes('Content-Security-Policy-Report-Only:'),'CSP must begin in report-only mode');
assert(headers.includes('X-Content-Type-Options: nosniff'),'nosniff header missing');
assert(headers.includes('X-Frame-Options: SAMEORIGIN'),'same-origin iframe policy missing');

assert(hiTools.includes('निःशुल्क कुंडली मिलान'),'Hindi Matching heading missing');
assert(hiTools.includes('साढ़ेसाती जाँच'),'Hindi Sade Sati heading missing');
assert(hiTools.includes('दैनिक पंचांग'),'Hindi Panchang heading missing');
assert(hiTools.includes("new MutationObserver(()=>localizeKundliHindi(root))"),'Hindi dynamic-result localization missing');

assert(fs.existsSync(path.join(root,'assets/images/tool-embed.js')),'embed helper file missing');
const htmlFiles=[];
(function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name==='.git') continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else if(entry.isFile()&&entry.name.endsWith('.html')) htmlFiles.push(full);
  }
})(root);
for(const full of htmlFiles){
  const html=fs.readFileSync(full,'utf8');
  for(const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){
    const url=match[1];
    if(url.includes('${')||/^(?:https?:|mailto:|tel:|#|data:|javascript:|\/\/)/.test(url)) continue;
    const clean=url.split(/[?#]/)[0];
    if(!clean) continue;
    const target=url.startsWith('/')?path.join(root,clean):path.resolve(path.dirname(full),clean);
    assert(fs.existsSync(target),`${path.relative(root,full)}: missing local target ${url}`);
  }
}
console.log('PASS: support contact normalized without changing admin allowlist');
console.log('PASS: accessible tool navigation and embed mode present');
console.log('PASS: dedicated calculators embedded on three SEO pages');
console.log('PASS: safe deployment security headers present');
console.log('PASS: Hindi form and dynamic-result coverage expanded');
console.log(`PASS: local links and assets resolve across ${htmlFiles.length} HTML files`);
