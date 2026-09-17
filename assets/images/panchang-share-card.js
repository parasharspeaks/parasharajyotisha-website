/* PJ_PANCHANG_SHARE_CARD_V1_START */
(function () {
  "use strict";

  var isHi = String(document.documentElement.lang || "").toLowerCase().indexOf("hi") === 0;
  var L = isHi ? {
    title: "आज का पंचांग कार्ड",
    sub: "अपने शहर और चुनी हुई तारीख के पंचांग को सुंदर चित्र के रूप में साझा करें।",
    post: "पोस्ट 4:5",
    story: "स्टोरी 9:16",
    share: "चित्र साझा करें",
    save: "PNG सेव करें",
    copy: "कैप्शन कॉपी करें",
    close: "बंद करें",
    noData: "पहले पंचांग लोड करें, फिर शेयर कार्ड बनाएँ।",
    creating: "चित्र तैयार हो रहा है…",
    shared: "शेयर शीट खुल गई। Instagram उपलब्ध हो तो वहीं से चुनें।",
    saved: "PNG सेव कर दिया गया।",
    copied: "कैप्शन कॉपी हो गया।",
    fallback: "इस ब्राउज़र में चित्र सीधे साझा नहीं हो सकता। PNG सेव करें और Instagram/Facebook/X में अपलोड करें।",
    fresh: "हर दिन और हर शहर के लिए नया कार्ड — कल फिर लौटें।",
    daily: "दैनिक वैदिक पंचांग",
    timingMap: "आज का समय-मानचित्र",
    tithi: "तिथि", nak: "नक्षत्र", yoga: "योग", karana: "करण", vara: "वार",
    paksha: "पक्ष", moon: "चंद्र राशि", sunrise: "सूर्योदय", sunset: "सूर्यास्त",
    abhijit: "अभिजित मुहूर्त", rahu: "राहु काल", brahma: "ब्रह्म मुहूर्त",
    note: "सामान्य पारंपरिक समय-संदर्भ • व्यक्तिगत मुहूर्त भिन्न हो सकता है",
    read: "पूरा पंचांग पढ़ें",
    brand: "पराशर ज्योतिष"
  } : {
    title: "Today's Panchang Card",
    sub: "Turn the Panchang for your selected city and date into a beautiful shareable image.",
    post: "Post 4:5",
    story: "Story 9:16",
    share: "Share image",
    save: "Save PNG",
    copy: "Copy caption",
    close: "Close",
    noData: "Load the Panchang first, then create a share card.",
    creating: "Creating image…",
    shared: "Share sheet opened. Choose Instagram there when it is available.",
    saved: "PNG saved.",
    copied: "Caption copied.",
    fallback: "This browser cannot share image files directly. Save the PNG and upload it to Instagram, Facebook or X.",
    fresh: "A fresh card for every day and city — come back tomorrow.",
    daily: "DAILY VEDIC PANCHANG",
    timingMap: "TODAY'S TIMING MAP",
    tithi: "TITHI", nak: "NAKSHATRA", yoga: "YOGA", karana: "KARANA", vara: "VARA",
    paksha: "PAKSHA", moon: "MOON SIGN", sunrise: "SUNRISE", sunset: "SUNSET",
    abhijit: "ABHIJIT MUHURTA", rahu: "RAHU KAAL", brahma: "BRAHMA MUHURTA",
    note: "General traditional timing context • Personal Muhurta may differ",
    read: "Read the full Panchang",
    brand: "PARASHAR JYOTISHA"
  };

  function q(s, root) { return (root || document).querySelector(s); }
  function txt(v, fallback) {
    v = String(v == null ? "" : v).replace(/\s+/g, " ").trim();
    return v || (fallback || "—");
  }
  function short(v, n) {
    v = txt(v, "—");
    return v.length > n ? v.slice(0, n - 1).trim() + "…" : v;
  }
  function safeName(v) {
    return txt(v, "panchang").replace(/[^a-z0-9_-]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "panchang";
  }
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function fillRounded(ctx, x, y, w, h, r, fill, stroke) {
    roundRect(ctx, x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  function wrapLines(ctx, text, maxWidth, maxLines) {
    var words = txt(text, "—").split(" ");
    var lines = [], line = "";
    words.forEach(function (word) {
      var test = line ? line + " " + word : word;
      if (ctx.measureText(test).width <= maxWidth || !line) line = test;
      else { lines.push(line); line = word; }
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      var last = lines[maxLines - 1];
      while (ctx.measureText(last + "…").width > maxWidth && last.length > 1) last = last.slice(0, -1);
      lines[maxLines - 1] = last.trim() + "…";
    }
    return lines;
  }
  function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    var lines = wrapLines(ctx, text, maxWidth, maxLines);
    lines.forEach(function (line, i) { ctx.fillText(line, x, y + i * lineHeight); });
    return lines.length;
  }
  function font(weight, size, serif) {
    if (isHi) return weight + " " + size + "px 'Noto Sans Devanagari','Nirmala UI','Mangal',sans-serif";
    return weight + " " + size + "px " + (serif ? "Georgia,'Times New Roman',serif" : "system-ui,-apple-system,'Segoe UI',sans-serif");
  }
  function hexAlpha(hex, alpha) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map(function(c){return c+c;}).join("");
    var n = parseInt(h, 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
  }

  var css = document.createElement("style");
  css.id = "pj-panchang-share-card-v1-style";
  css.textContent = [
    ".pj-card-backdrop{position:fixed;inset:0;z-index:2147482500;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(31,18,14,.68);backdrop-filter:blur(6px)}",
    ".pj-card-backdrop.open{display:flex}",
    ".pj-card-shell{width:min(920px,100%);max-height:94vh;overflow:auto;background:#fff9ef;color:#3b2922;border:1px solid rgba(151,103,55,.24);border-radius:24px;box-shadow:0 28px 90px rgba(24,12,8,.35);padding:20px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}",
    ".pj-card-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:14px}",
    ".pj-card-title{font:700 24px/1.12 Georgia,serif;color:#821f31;margin:0 0 5px}",
    ".pj-card-sub{margin:0;color:#745e53;font-size:13px;line-height:1.5}",
    ".pj-card-close{border:0;background:transparent;color:#735d53;font-size:28px;line-height:1;cursor:pointer;padding:2px 6px}",
    ".pj-card-layout{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:20px;align-items:start}",
    ".pj-card-preview{display:flex;justify-content:center;align-items:flex-start;background:linear-gradient(145deg,#f4e8d4,#fffaf1);border:1px solid rgba(151,103,55,.15);border-radius:20px;padding:16px;min-height:420px}",
    ".pj-card-preview canvas{display:block;max-width:100%;width:auto;height:auto;max-height:64vh;border-radius:14px;box-shadow:0 14px 38px rgba(64,35,24,.18)}",
    ".pj-card-controls{display:flex;flex-direction:column;gap:11px}",
    ".pj-card-format{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    ".pj-card-format button,.pj-card-action{border:1px solid rgba(151,103,55,.20);border-radius:13px;background:#fff;color:#3e2c25;min-height:46px;padding:10px 12px;font:750 13px/1.25 system-ui,-apple-system,'Segoe UI',sans-serif;cursor:pointer}",
    ".pj-card-format button.active{background:#87243a;color:#fff;border-color:#87243a}",
    ".pj-card-action.primary{background:linear-gradient(135deg,#9b2638,#b23945);color:#fff;border-color:#9b2638}",
    ".pj-card-action:hover,.pj-card-format button:hover{transform:translateY(-1px)}",
    ".pj-card-hint{font-size:12px;line-height:1.48;color:#806c62;padding:11px 12px;border-radius:12px;background:#fff4e4;border:1px solid rgba(180,119,56,.14)}",
    ".pj-card-status{min-height:19px;font-size:12px;line-height:1.4;color:#28724b}",
    ".pj-card-fresh{font-size:11.5px;color:#8d6d55;text-align:center;margin-top:2px}",
    "html[data-theme='dark'] .pj-card-shell{background:#18151a;color:#f6eee5;border-color:rgba(228,181,102,.22)}",
    "html[data-theme='dark'] .pj-card-title{color:#efc46e}",
    "html[data-theme='dark'] .pj-card-sub,html[data-theme='dark'] .pj-card-hint,html[data-theme='dark'] .pj-card-fresh{color:#c8b9ad}",
    "html[data-theme='dark'] .pj-card-preview{background:linear-gradient(145deg,#211b22,#15131a);border-color:rgba(228,181,102,.16)}",
    "html[data-theme='dark'] .pj-card-format button,html[data-theme='dark'] .pj-card-action{background:#27222a;color:#f5ece4;border-color:rgba(228,181,102,.16)}",
    "html[data-theme='dark'] .pj-card-format button.active,html[data-theme='dark'] .pj-card-action.primary{background:#9b2638;color:#fff;border-color:#9b2638}",
    "html[data-theme='dark'] .pj-card-hint{background:#252027;border-color:rgba(228,181,102,.14)}",
    "@media(max-width:760px){.pj-card-backdrop{align-items:flex-end;padding:8px}.pj-card-shell{border-radius:22px 22px 12px 12px;padding:16px;max-height:96vh}.pj-card-layout{grid-template-columns:1fr}.pj-card-controls{display:grid;grid-template-columns:1fr 1fr}.pj-card-format,.pj-card-hint,.pj-card-status,.pj-card-fresh{grid-column:1/-1}.pj-card-preview canvas{max-height:54vh}.pj-card-title{font-size:21px}}",
    "@media print{.pj-card-backdrop{display:none!important}}"
  ].join("");
  document.head.appendChild(css);

  var backdrop = document.createElement("div");
  backdrop.className = "pj-card-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.innerHTML = '' +
    '<section class="pj-card-shell" role="dialog" aria-modal="true" aria-labelledby="pjCardTitle">' +
      '<div class="pj-card-head"><div><h2 class="pj-card-title" id="pjCardTitle">' + L.title + '</h2><p class="pj-card-sub">' + L.sub + '</p></div><button type="button" class="pj-card-close" aria-label="' + L.close + '">×</button></div>' +
      '<div class="pj-card-layout">' +
        '<div class="pj-card-preview"><canvas id="pjPanchangShareCanvas" width="1080" height="1350"></canvas></div>' +
        '<div class="pj-card-controls">' +
          '<div class="pj-card-format"><button type="button" class="active" data-format="post">' + L.post + '</button><button type="button" data-format="story">' + L.story + '</button></div>' +
          '<button type="button" class="pj-card-action primary" data-card-action="share">↗ ' + L.share + '</button>' +
          '<button type="button" class="pj-card-action" data-card-action="save">⇩ ' + L.save + '</button>' +
          '<button type="button" class="pj-card-action" data-card-action="copy">⧉ ' + L.copy + '</button>' +
          '<div class="pj-card-hint">' + (isHi ? 'Instagram हर ब्राउज़र से सामान्य वेबसाइट लिंक को चित्र पोस्ट के रूप में स्वीकार नहीं करता। मोबाइल पर <b>' + L.share + '</b> दबाएँ और उपलब्ध होने पर Instagram चुनें।' : 'Instagram does not accept ordinary website links as image posts from every browser. On mobile, <b>' + L.share + '</b> uses the device share sheet; choose Instagram when offered.') + '</div>' +
          '<div class="pj-card-status" role="status" aria-live="polite"></div>' +
          '<div class="pj-card-fresh">✦ ' + L.fresh + '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  document.body.appendChild(backdrop);

  var canvas = q("#pjPanchangShareCanvas", backdrop);
  var ctx = canvas.getContext("2d");
  var status = q(".pj-card-status", backdrop);
  var currentFormat = "post";
  var lastFocus = null;

  function norm(v) {
    return String(v || "").replace(/\s+/g, " ").trim().toLowerCase();
  }
  function childValue(selector, labelSelectors, valueSelector, names) {
    var items = document.querySelectorAll(selector);
    var wanted = names.map(norm);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var label = "";
      for (var j = 0; j < labelSelectors.length; j++) {
        var el = item.querySelector(labelSelectors[j]);
        if (el && el.textContent) { label = norm(el.textContent); break; }
      }
      if (wanted.indexOf(label) !== -1) {
        var value = item.querySelector(valueSelector);
        return value ? txt(value.textContent) : "—";
      }
    }
    return "—";
  }
  function collectData() {
    var result = document.getElementById("pj-result");
    if (!result || !result.querySelector(".pj-result-hero h3")) return null;

    var dateEl = result.querySelector(".pj-result-hero h3");
    var overline = result.querySelector(".pj-result-overline");
    var cityInput = document.getElementById("pj-city");
    var dateInput = document.getElementById("pj-date");
    var city = cityInput ? txt(cityInput.value, "") : "";
    if (overline && overline.textContent) {
      var ov = txt(overline.textContent, "");
      var dot = ov.indexOf("·");
      if (dot !== -1) city = txt(ov.slice(dot + 1), city);
    }

    var d = {
      lang: isHi ? "hi" : "en",
      city: city || "—",
      date: txt(dateEl && dateEl.textContent),
      isoDate: dateInput ? txt(dateInput.value, "") : "",
      tithi: childValue("#pj-result .pj-limb", [".label"], "strong", ["Tithi","तिथि"]),
      nakshatra: childValue("#pj-result .pj-limb", [".label"], "strong", ["Nakshatra","नक्षत्र"]),
      yoga: childValue("#pj-result .pj-limb", [".label"], "strong", ["Yoga","योग"]),
      karana: childValue("#pj-result .pj-limb", [".label"], "strong", ["Karana","करण"]),
      vara: childValue("#pj-result .pj-limb", [".label"], "strong", ["Vara","वार"]),
      paksha: childValue("#pj-result .pj-stat", ["small"], "strong", ["Paksha","पक्ष"]),
      moonSign: childValue("#pj-result .pj-stat", ["small"], "strong", ["Moon Sign","चंद्र राशि"]),
      sunSign: childValue("#pj-result .pj-stat", ["small"], "strong", ["Sun Sign","सूर्य राशि"]),
      sunrise: childValue("#pj-result .pj-time", ["b"], "strong", ["🌅 Sunrise","Sunrise","🌅 सूर्योदय","सूर्योदय"]),
      sunset: childValue("#pj-result .pj-time", ["b"], "strong", ["🌇 Sunset","Sunset","🌇 सूर्यास्त","सूर्यास्त"]),
      moonrise: childValue("#pj-result .pj-time", ["b"], "strong", ["🌙 Moonrise","Moonrise","🌙 चंद्रोदय","चंद्रोदय"]),
      moonset: childValue("#pj-result .pj-time", ["b"], "strong", ["☽ Moonset","Moonset","☽ चंद्रास्त","चंद्रास्त"]),
      brahma: childValue("#pj-result .pj-time", ["b"], "strong", ["🕉️ Brahma Muhurta","Brahma Muhurta","🕉️ ब्रह्म मुहूर्त","ब्रह्म मुहूर्त"]),
      abhijit: childValue("#pj-result .pj-time", ["b"], "strong", ["✨ Abhijit Muhurta","Abhijit Muhurta","✨ अभिजित मुहूर्त","अभिजित मुहूर्त"]),
      rahu: childValue("#pj-result .pj-time", ["b"], "strong", ["⚠️ Rahu Kaal","Rahu Kaal","⚠️ राहु काल","राहु काल"]),
      gulika: childValue("#pj-result .pj-time", ["b"], "strong", ["♄ Gulika Kaal","Gulika Kaal","♄ गुलिक काल","गुलिक काल"]),
      yamaganda: childValue("#pj-result .pj-time", ["b"], "strong", ["⛔ Yamaganda","Yamaganda","⛔ यमगण्ड","यमगण्ड"]),
      disha: childValue("#pj-result .pj-time", ["b"], "strong", ["🧭 Disha Shool","Disha Shool","🧭 दिशा शूल","दिशा शूल"]),
      url: location.href
    };
    return d;
  }
  function data() { return collectData(); }
  function setStatus(s, bad) { status.textContent = s || ""; status.style.color = bad ? "#a72d3a" : "#28724b"; }
  function cardUrl(d) { return txt(d && d.url, location.origin + location.pathname); }
  function caption(d) {
    if (isHi) return "आज का पंचांग — " + txt(d.city) + " · " + txt(d.date) + "\nतिथि: " + txt(d.tithi) + " · नक्षत्र: " + txt(d.nakshatra) + "\nपूरा पंचांग: " + cardUrl(d) + "\n#Panchang #Jyotisha #VedicAstrology";
    return "Today's Panchang — " + txt(d.city) + " · " + txt(d.date) + "\nTithi: " + txt(d.tithi) + " · Nakshatra: " + txt(d.nakshatra) + "\nFull Panchang: " + cardUrl(d) + "\n#Panchang #Jyotisha #VedicAstrology";
  }

  function drawBackground(w, h) {
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#fff8ec"); g.addColorStop(.48, "#f8ecd8"); g.addColorStop(1, "#f2dec0");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    // Soft celestial glows.
    var rg = ctx.createRadialGradient(w * .86, h * .11, 0, w * .86, h * .11, w * .32);
    rg.addColorStop(0, "rgba(226,157,52,.28)"); rg.addColorStop(1, "rgba(226,157,52,0)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    var rg2 = ctx.createRadialGradient(w * .08, h * .78, 0, w * .08, h * .78, w * .38);
    rg2.addColorStop(0, "rgba(134,36,58,.12)"); rg2.addColorStop(1, "rgba(134,36,58,0)");
    ctx.fillStyle = rg2; ctx.fillRect(0, 0, w, h);

    // Subtle orbit motif.
    ctx.save();
    ctx.translate(w * .83, h * .18);
    ctx.strokeStyle = "rgba(133,39,57,.12)"; ctx.lineWidth = 2;
    [110, 170, 235].forEach(function(r){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();});
    ctx.fillStyle = "rgba(197,132,35,.70)"; ctx.beginPath(); ctx.arc(0,0,32,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(133,39,57,.72)"; ctx.beginPath(); ctx.arc(-145,88,11,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(75,63,100,.50)"; ctx.beginPath(); ctx.arc(72,-210,8,0,Math.PI*2); ctx.fill();
    ctx.restore();

    // Fine border.
    ctx.strokeStyle = "rgba(126,73,44,.24)"; ctx.lineWidth = 3;
    roundRect(ctx, 26, 26, w - 52, h - 52, 28); ctx.stroke();
  }

  function drawLabelValue(x, y, w, label, value, accent, dense) {
    fillRounded(ctx, x, y, w, dense ? 126 : 150, 22, "rgba(255,255,255,.64)", "rgba(123,77,48,.13)");
    ctx.fillStyle = accent || "#8c2639";
    ctx.font = font(800, dense ? 22 : 24, false);
    ctx.textBaseline = "top";
    ctx.fillText(label, x + 22, y + 18);
    ctx.fillStyle = "#35251f";
    ctx.font = font(700, dense ? 31 : 35, true);
    drawWrapped(ctx, short(value, dense ? 24 : 28), x + 22, y + (dense ? 53 : 59), w - 44, dense ? 34 : 38, 2);
  }

  function drawPill(x, y, w, label, value, accent) {
    fillRounded(ctx, x, y, w, 92, 18, "rgba(255,255,255,.54)", "rgba(123,77,48,.12)");
    ctx.fillStyle = "#7f685b"; ctx.font = font(800, 19, false); ctx.textBaseline = "top"; ctx.fillText(label, x + 18, y + 15);
    ctx.fillStyle = accent || "#7e2134"; ctx.font = font(750, 25, false); drawWrapped(ctx, short(value, 31), x + 18, y + 45, w - 36, 28, 1);
  }

  function drawCard() {
    var d = data();
    if (!d) return;
    var story = currentFormat === "story";
    var w = 1080, h = story ? 1920 : 1350;
    canvas.width = w; canvas.height = h;
    drawBackground(w, h);

    var margin = 78;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#8b263a"; ctx.font = font(900, 24, false); ctx.fillText(L.brand, margin, 72);
    ctx.fillStyle = "#9c6b2d"; ctx.font = font(800, 21, false); ctx.fillText(L.daily, margin, 116);

    ctx.fillStyle = "#35251f"; ctx.font = font(700, story ? 68 : 62, true);
    drawWrapped(ctx, txt(d.date), margin, 172, story ? 790 : 770, story ? 76 : 70, 2);
    ctx.fillStyle = "#735e52"; ctx.font = font(650, 30, false); ctx.fillText("⌖ " + txt(d.city), margin, story ? 330 : 306);

    // Gold rule and tiny sun/moon motif.
    ctx.fillStyle = "#c98d28"; ctx.fillRect(margin, story ? 392 : 364, 210, 5);
    ctx.fillStyle = "#8b263a"; ctx.beginPath(); ctx.arc(w - margin - 30, story ? 350 : 324, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f7e7c7"; ctx.beginPath(); ctx.arc(w - margin - 20, story ? 342 : 316, 20, 0, Math.PI * 2); ctx.fill();

    var top = story ? 460 : 418;
    var gap = 18;
    var col = (w - margin * 2 - gap * 2) / 3;
    drawLabelValue(margin, top, col, L.tithi, d.tithi, "#8b263a", false);
    drawLabelValue(margin + col + gap, top, col, L.nak, d.nakshatra, "#9a6b27", false);
    drawLabelValue(margin + (col + gap) * 2, top, col, L.vara, d.vara, "#5c526f", false);

    var second = top + 170;
    var half = (w - margin * 2 - gap) / 2;
    drawLabelValue(margin, second, half, L.yoga, d.yoga, "#8b263a", true);
    drawLabelValue(margin + half + gap, second, half, L.karana, d.karana, "#9a6b27", true);

    var metaY = second + 150;
    drawPill(margin, metaY, half, L.paksha, d.paksha, "#8b263a");
    drawPill(margin + half + gap, metaY, half, L.moon, d.moonSign, "#5c526f");

    var timeY = metaY + 132;
    ctx.fillStyle = "#8b263a"; ctx.font = font(900, 21, false); ctx.fillText(L.timingMap, margin, timeY);
    timeY += 42;
    var tw = (w - margin * 2 - gap) / 2;
    var timings = [
      [L.sunrise, d.sunrise, "#a66d16"], [L.sunset, d.sunset, "#8b263a"],
      [L.abhijit, d.abhijit, "#4d7a5c"], [L.rahu, d.rahu, "#a33745"]
    ];
    if (story && txt(d.brahma, "") !== "—") timings.push([L.brahma, d.brahma, "#5b5272"]);
    timings.forEach(function(it, i){
      var row = Math.floor(i / 2), c = i % 2;
      drawPill(margin + c * (tw + gap), timeY + row * 112, tw, it[0], it[1], it[2]);
    });

    var footerY = story ? h - 350 : h - 245;
    fillRounded(ctx, margin, footerY, w - margin * 2, story ? 164 : 138, 24, "rgba(132,36,55,.92)", null);
    ctx.fillStyle = "#fff7ea"; ctx.font = font(750, story ? 28 : 25, false); ctx.fillText(L.read + " →", margin + 28, footerY + 24);
    ctx.font = font(650, story ? 25 : 22, false); ctx.fillText("parasharajyotisha.com", margin + 28, footerY + (story ? 68 : 62));
    ctx.fillStyle = "rgba(255,247,234,.78)"; ctx.font = font(500, story ? 20 : 18, false);
    drawWrapped(ctx, L.note, margin + 28, footerY + (story ? 108 : 96), w - margin * 2 - 56, story ? 27 : 24, 2);

    if (story) {
      ctx.fillStyle = "#806b5e"; ctx.font = font(650, 19, false); ctx.textAlign = "center";
      ctx.fillText(isHi ? "शहर-आधारित गणना • चयनित तारीख" : "City-aware calculation • Selected date", w / 2, h - 120);
      ctx.textAlign = "left";
    }
  }

  function open() {
    if (!data()) {
      var st = document.getElementById("pj-status");
      if (st) st.textContent = L.noData;
      return;
    }
    lastFocus = document.activeElement;
    setStatus("");
    backdrop.classList.add("open"); backdrop.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    drawCard();
    q(".pj-card-close", backdrop).focus();
  }
  function close() {
    backdrop.classList.remove("open"); backdrop.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }
  function blobFromCanvas() {
    return new Promise(function(resolve, reject){
      canvas.toBlob(function(blob){ if (blob) resolve(blob); else reject(new Error("PNG_FAILED")); }, "image/png", 0.95);
    });
  }
  async function shareImage() {
    var d = data(); if (!d) return;
    setStatus(L.creating);
    try {
      var blob = await blobFromCanvas();
      var name = "Parashar-Panchang-" + safeName(d.city) + "-" + safeName(d.isoDate || d.date) + (currentFormat === "story" ? "-story" : "-post") + ".png";
      var file = new File([blob], name, {type:"image/png"});
      if (navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))) {
        await navigator.share({title: document.title, text: caption(d), url: cardUrl(d), files:[file]});
        setStatus(L.shared);
      } else {
        setStatus(L.fallback, true);
      }
    } catch (e) {
      if (e && e.name === "AbortError") { setStatus(""); return; }
      setStatus(L.fallback, true);
    }
  }
  async function saveImage() {
    var d = data(); if (!d) return;
    setStatus(L.creating);
    try {
      var blob = await blobFromCanvas();
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "Parashar-Panchang-" + safeName(d.city) + "-" + safeName(d.isoDate || d.date) + (currentFormat === "story" ? "-story" : "-post") + ".png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){URL.revokeObjectURL(a.href);}, 1500);
      setStatus(L.saved);
    } catch (_) { setStatus(L.fallback, true); }
  }
  async function copyCaption() {
    var c = caption(data());
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(c);
      else {
        var ta=document.createElement("textarea"); ta.value=c; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      setStatus(L.copied);
    } catch (_) { setStatus(c, true); }
  }

  function installTrigger() {
    var actions = document.querySelector("#pj-result .pj-result-actions");
    if (!actions || document.getElementById("pj-share-card")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "pj-share-card";
    btn.className = "pj-mini-btn";
    btn.textContent = isHi ? "✨ शेयर कार्ड बनाएँ" : "✨ Create share card";
    var shareLink = document.getElementById("pj-share");
    if (shareLink && shareLink.parentNode === actions) actions.insertBefore(btn, shareLink);
    else actions.insertBefore(btn, actions.firstChild);
  }
  installTrigger();
  var resultHost = document.getElementById("pj-result");
  if (resultHost && window.MutationObserver) {
    new MutationObserver(function(){ installTrigger(); }).observe(resultHost, {childList:true, subtree:true});
  }

  document.addEventListener("click", function(e){
    var trigger = e.target.closest && e.target.closest("#pj-share-card");
    if (trigger) { e.preventDefault(); open(); return; }
    var fmt = e.target.closest && e.target.closest("[data-format]");
    if (fmt && backdrop.contains(fmt)) {
      currentFormat = fmt.getAttribute("data-format") === "story" ? "story" : "post";
      backdrop.querySelectorAll("[data-format]").forEach(function(b){b.classList.toggle("active", b === fmt);});
      drawCard(); setStatus(""); return;
    }
    var act = e.target.closest && e.target.closest("[data-card-action]");
    if (act && backdrop.contains(act)) {
      var type = act.getAttribute("data-card-action");
      if (type === "share") shareImage();
      else if (type === "save") saveImage();
      else if (type === "copy") copyCaption();
    }
  });
  q(".pj-card-close", backdrop).addEventListener("click", close);
  backdrop.addEventListener("click", function(e){ if (e.target === backdrop) close(); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && backdrop.classList.contains("open")) close(); });

  window.PJ_PanchangShareCard = {open: open, redraw: drawCard};
})();
/* PJ_PANCHANG_SHARE_CARD_V1_END */
