/* Panchakosha AI — interactions: copy, nav, progress, reveal, scrollspy */
(function () {
  "use strict";

  /* ---- copy-to-clipboard on every code block ---- */
  document.querySelectorAll(".code").forEach(function (block) {
    var pre = block.querySelector("pre");
    if (!pre) return;
    var btn = block.querySelector(".code__copy");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var text = pre.innerText;
      navigator.clipboard.writeText(text).then(function () {
        var old = btn.textContent;
        btn.textContent = "copied ✓";
        btn.classList.add("copied");
        setTimeout(function () { btn.textContent = old; btn.classList.remove("copied"); }, 1600);
      }).catch(function () {
        btn.textContent = "press ⌘/Ctrl+C";
      });
    });
  });

  /* ---- mobile nav ---- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- progress: mark lesson complete + reflect on home ring / dots ----
     Storage key: pk:progress -> { "1": ["01","02"], "2": [...] }         */
  var KEY = "pk:progress";
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  window.PK = {
    complete: function (level, lesson) {
      var o = load(); o[level] = o[level] || [];
      if (o[level].indexOf(lesson) === -1) o[level].push(lesson);
      save(o); return o;
    },
    get: load
  };

  /* lesson "mark complete" button */
  var mc = document.querySelector("[data-complete]");
  if (mc) {
    var lv = mc.getAttribute("data-level"), ls = mc.getAttribute("data-lesson");
    var done = (load()[lv] || []).indexOf(ls) !== -1;
    function paint() {
      mc.textContent = done ? "✓ Completed — nicely done" : "Mark this lesson complete";
      mc.classList.toggle("btn--solid", !done);
      mc.classList.toggle("btn--ghost", done);
    }
    paint();
    mc.addEventListener("click", function () {
      if (!done) { window.PK.complete(lv, ls); done = true; paint(); }
    });
  }

  /* reflect completed count into any [data-level-progress] dot rows + ring */
  var prog = load();
  document.querySelectorAll("[data-level-progress]").forEach(function (row) {
    var lv = row.getAttribute("data-level-progress");
    var total = parseInt(row.getAttribute("data-total") || "0", 10);
    var done = (prog[lv] || []).length;
    row.querySelectorAll("i").forEach(function (dot, idx) { if (idx < done) dot.classList.add("on"); });
    var label = row.querySelector("[data-count]");
    if (label) label.textContent = done + "/" + total;
  });
  // fill the home concentric ring for any level with >=1 lesson done
  Object.keys(prog).forEach(function (lv) {
    if ((prog[lv] || []).length) {
      var r = document.querySelector('.kosha-ring [data-ring="' + lv + '"] .ring');
      if (r) r.style.opacity = "1";
    }
  });

  /* ---- scrollspy for the lesson rail ---- */
  var railLinks = document.querySelectorAll(".rail a[href^='#']");
  if (railLinks.length && "IntersectionObserver" in window) {
    var map = {};
    railLinks.forEach(function (a) { var id = a.getAttribute("href").slice(1); if (id) map[id] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          railLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
          if (map[e.target.id]) map[e.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---- current year ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
