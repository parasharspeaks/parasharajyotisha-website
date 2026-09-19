/* PJ_SOCIAL_SHARE_V1_START
   Reusable public-page share control for Parashar Jyotisha.
   Shares only the canonical/public page URL and public meta description.
   It never reads Kundli form values, birth details, Firebase data or account data.
*/
(function () {
  "use strict";

  if (window.__pjSocialShareV1Loaded) return;
  window.__pjSocialShareV1Loaded = true;

  var path = String(location.pathname || "").toLowerCase();
  var params;
  try { params = new URLSearchParams(location.search || ""); } catch (_) { params = {get:function(){return null;}}; }

  // Never show on known private/admin pages. tools.html?account=1 is a private account workflow.
  if (path.indexOf("my-kundli") !== -1 || path.indexOf("admin-") !== -1 || params.get("account") === "1") return;

  var lang = String(document.documentElement.lang || "en").toLowerCase();
  var hi = lang.indexOf("hi") === 0;
  var labels = hi ? {
    launcher: "साझा करें",
    title: "यह पेज साझा करें",
    sub: "Parashar Jyotisha का यह सार्वजनिक पेज साझा करें। निजी कुंडली या अकाउंट डेटा साझा नहीं होता।",
    device: "फ़ोन / ऐप से साझा करें",
    facebook: "Facebook",
    x: "X",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    instagramHint: "मोबाइल पर Share खोलकर Instagram चुनें।",
    copy: "लिंक कॉपी करें",
    copied: "लिंक कॉपी हो गया ✓",
    close: "बंद करें",
    nativeUnavailable: "इस ब्राउज़र में ऐप-शेयर उपलब्ध नहीं है। लिंक कॉपी करें या Facebook / X / WhatsApp चुनें।"
  } : {
    launcher: "Share",
    title: "Share this page",
    sub: "Share this public Parashar Jyotisha page. Your private Kundli and account data are never included.",
    device: "Share to phone / apps",
    facebook: "Facebook",
    x: "X",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    instagramHint: "On mobile, open Share and choose Instagram if it is installed.",
    copy: "Copy link",
    copied: "Link copied ✓",
    close: "Close",
    nativeUnavailable: "App sharing is not available in this browser. Use Copy link, Facebook, X or WhatsApp instead."
  };

  function q(sel) { return document.querySelector(sel); }
  function meta(name, prop) {
    var el = prop ? q('meta[property="' + name + '"]') : q('meta[name="' + name + '"]');
    return el ? String(el.getAttribute("content") || "").trim() : "";
  }
  function canonicalUrl() {
    var c = q('link[rel="canonical"]');
    var raw = c && c.href ? c.href : (location.origin + location.pathname);
    try {
      var u = new URL(raw, location.origin);
      u.hash = "";
      // Public share URLs should not carry account/session-like query parameters.
      u.search = "";
      return u.toString();
    } catch (_) {
      return location.origin + location.pathname;
    }
  }
  function cleanText(v, max) {
    v = String(v || "").replace(/\s+/g, " ").trim();
    return v.length > max ? v.slice(0, max - 1).trim() + "…" : v;
  }

  var shareUrl = canonicalUrl();
  var shareTitle = cleanText(meta("og:title", true) || document.title || "Parashar Jyotisha", 100);
  var shareText = cleanText(meta("og:description", true) || meta("description", false) || shareTitle, 190);

  var css = document.createElement("style");
  css.id = "pj-social-share-v1-style";
  css.textContent = [
    ".pj-share-launch{position:fixed;right:18px;bottom:18px;z-index:2147482000;display:flex;align-items:center;gap:8px;border:1px solid rgba(144,35,48,.28);border-radius:999px;padding:11px 16px;background:#9b2638;color:#fff;font:700 14px/1.1 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 10px 28px rgba(70,24,30,.22);cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}",
    ".pj-share-launch:hover{transform:translateY(-1px);box-shadow:0 13px 32px rgba(70,24,30,.28)}",
    ".pj-share-launch:focus-visible,.pj-share-btn:focus-visible,.pj-share-close:focus-visible{outline:3px solid rgba(190,125,36,.38);outline-offset:2px}",
    ".pj-share-icon{font-size:17px;line-height:1}",
    ".pj-share-backdrop{position:fixed;inset:0;z-index:2147482100;display:none;align-items:flex-end;justify-content:center;padding:20px;background:rgba(20,12,10,.42);backdrop-filter:blur(2px)}",
    ".pj-share-backdrop.open{display:flex}",
    ".pj-share-card{width:min(520px,100%);background:#fffaf2;color:#34241f;border:1px solid rgba(151,103,55,.24);border-radius:22px;padding:20px;box-shadow:0 26px 70px rgba(31,18,14,.25);font-family:system-ui,-apple-system,Segoe UI,sans-serif}",
    ".pj-share-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:6px}",
    ".pj-share-title{font:800 20px/1.2 Georgia,serif;color:#7f1f30}",
    ".pj-share-sub{font-size:13px;line-height:1.5;color:#705d53;margin:0 0 14px}",
    ".pj-share-close{border:0;background:transparent;color:#705d53;font-size:24px;line-height:1;cursor:pointer;padding:0 3px}",
    ".pj-share-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}",
    ".pj-share-btn{min-height:48px;border:1px solid rgba(151,103,55,.20);border-radius:13px;background:#fff;color:#3e2c25;padding:10px 12px;font:750 13px/1.25 system-ui,-apple-system,Segoe UI,sans-serif;cursor:pointer;display:flex;align-items:center;gap:9px;justify-content:flex-start}",
    ".pj-share-btn:hover{background:#fff4e5}",
    ".pj-share-btn.primary{grid-column:1/-1;background:#9b2638;color:#fff;border-color:#9b2638;justify-content:center}",
    ".pj-share-logo{display:inline-grid;place-items:center;min-width:25px;height:25px;border-radius:8px;background:rgba(155,38,56,.08);font-weight:900;color:#9b2638}",
    ".pj-share-btn.primary .pj-share-logo{background:rgba(255,255,255,.17);color:#fff}",
    ".pj-share-note{margin:12px 2px 0;font-size:12px;line-height:1.45;color:#7b685e;min-height:18px}",
    ".pj-share-url{margin-top:12px;padding-top:11px;border-top:1px solid rgba(151,103,55,.16);font-size:11px;color:#8b776d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "html[data-theme='dark'] .pj-share-card{background:#17151a;color:#f6eee5;border-color:rgba(228,181,102,.22)}",
    "html[data-theme='dark'] .pj-share-title{color:#f1c56e}",
    "html[data-theme='dark'] .pj-share-sub,html[data-theme='dark'] .pj-share-note,html[data-theme='dark'] .pj-share-url{color:#c7b9ad}",
    "html[data-theme='dark'] .pj-share-close{color:#d4c4b8}",
    "html[data-theme='dark'] .pj-share-btn{background:#242029;color:#f8eee4;border-color:rgba(228,181,102,.18)}",
    "html[data-theme='dark'] .pj-share-btn:hover{background:#2e2832}",
    "@media(max-width:520px){.pj-share-launch{right:12px;bottom:12px;padding:10px 13px}.pj-share-backdrop{padding:10px}.pj-share-card{border-radius:19px;padding:17px}.pj-share-grid{grid-template-columns:1fr 1fr}.pj-share-btn{min-height:46px;padding:9px}.pj-share-title{font-size:19px}}",
    "@media print{.pj-share-launch,.pj-share-backdrop{display:none!important}}"
  ].join("");
  document.head.appendChild(css);

  var launch = document.createElement("button");
  launch.type = "button";
  launch.className = "pj-share-launch";
  launch.setAttribute("aria-label", labels.launcher);
  launch.innerHTML = '<span class="pj-share-icon" aria-hidden="true">↗</span><span>' + labels.launcher + '</span>';

  var backdrop = document.createElement("div");
  backdrop.className = "pj-share-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.innerHTML = '' +
    '<section class="pj-share-card" role="dialog" aria-modal="true" aria-labelledby="pjShareTitle">' +
      '<div class="pj-share-head"><div id="pjShareTitle" class="pj-share-title"></div><button type="button" class="pj-share-close" aria-label="' + labels.close + '">×</button></div>' +
      '<p class="pj-share-sub"></p>' +
      '<div class="pj-share-grid">' +
        '<button type="button" class="pj-share-btn primary" data-share="native"><span class="pj-share-logo">↗</span><span>' + labels.device + '</span></button>' +
        '<button type="button" class="pj-share-btn" data-share="facebook"><span class="pj-share-logo">f</span><span>' + labels.facebook + '</span></button>' +
        '<button type="button" class="pj-share-btn" data-share="x"><span class="pj-share-logo">𝕏</span><span>' + labels.x + '</span></button>' +
        '<button type="button" class="pj-share-btn" data-share="whatsapp"><span class="pj-share-logo">◉</span><span>' + labels.whatsapp + '</span></button>' +
        '<button type="button" class="pj-share-btn" data-share="instagram"><span class="pj-share-logo">◎</span><span>' + labels.instagram + '</span></button>' +
        '<button type="button" class="pj-share-btn" data-share="copy"><span class="pj-share-logo">⧉</span><span>' + labels.copy + '</span></button>' +
      '</div>' +
      '<div class="pj-share-note" role="status" aria-live="polite"></div>' +
      '<div class="pj-share-url"></div>' +
    '</section>';

  document.body.appendChild(launch);
  document.body.appendChild(backdrop);
  backdrop.querySelector("#pjShareTitle").textContent = labels.title;
  backdrop.querySelector(".pj-share-sub").textContent = labels.sub;
  backdrop.querySelector(".pj-share-url").textContent = shareUrl;

  var note = backdrop.querySelector(".pj-share-note");
  var closeBtn = backdrop.querySelector(".pj-share-close");
  var lastFocus = null;

  function setNote(s) { note.textContent = s || ""; }
  function openModal() {
    lastFocus = document.activeElement;
    setNote("");
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    closeBtn.focus();
  }
  function closeModal() {
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }
  function popup(url) {
    var w = window.open(url, "pjShareWindow", "noopener,noreferrer,width=720,height=620");
    if (w) try { w.opener = null; } catch (_) {}
  }
  async function nativeShare(instagramMode) {
    if (navigator.share) {
      try {
        await navigator.share({title: shareTitle, text: shareText, url: shareUrl});
        setNote("");
        return true;
      } catch (e) {
        if (e && e.name === "AbortError") return false;
      }
    }
    setNote(instagramMode ? labels.instagramHint : labels.nativeUnavailable);
    return false;
  }
  async function copyLink() {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(shareUrl);
      else {
        var ta = document.createElement("textarea");
        ta.value = shareUrl; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      setNote(labels.copied);
    } catch (_) { setNote(shareUrl); }
  }

  launch.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && backdrop.classList.contains("open")) closeModal(); });

  backdrop.querySelectorAll("[data-share]").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      var type = btn.getAttribute("data-share");
      var encodedUrl = encodeURIComponent(shareUrl);
      var encodedText = encodeURIComponent(shareTitle + " — " + shareText);
      if (type === "native") { await nativeShare(false); return; }
      if (type === "instagram") { await nativeShare(true); return; }
      if (type === "copy") { await copyLink(); return; }
      if (type === "facebook") { popup("https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl); return; }
      if (type === "x") { popup("https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareTitle) + "&url=" + encodedUrl); return; }
      if (type === "whatsapp") { popup("https://wa.me/?text=" + encodedText + "%20" + encodedUrl); }
    });
  });
})();
/* PJ_SOCIAL_SHARE_V1_END */
