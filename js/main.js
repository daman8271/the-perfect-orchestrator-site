/* The Perfect Orchestrator — interactions. Vanilla, dependency-free, defer-loaded. */
(function () {
  'use strict';

  var doc = document;
  var reduced = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* default: motion on */ }

  /* ---------------------------------------------------------------- helpers */

  function ready(fn) {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function guard(fn) {
    try { fn(); } catch (e) { /* one feature failing never kills the rest */ }
  }

  /* ----------------------------------------------------- 1. nav scroll state */

  function initNav() {
    var nav = doc.getElementById('nav');
    if (!nav) return;
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || doc.documentElement.scrollTop || 0;
      nav.classList.toggle('scrolled', y > 40);
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------- 2. reveal system (+ triggers) */

  function initReveals() {
    var targets = doc.querySelectorAll('.reveal, .reveal-stagger, .m-line, [data-count], [data-typed], .typed');

    if (reduced || !('IntersectionObserver' in window)) {
      // Static fallback: show everything, render final numbers, leave terminal text as shipped.
      for (var i = 0; i < targets.length; i++) targets[i].classList.add('in');
      guard(function () { startCounts(doc); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (!entry.isIntersecting) continue;
        var el = entry.target;
        io.unobserve(el);
        el.classList.add('in');
        guard(function () { startCounts(el); });
        if (el.hasAttribute('data-typed')) {
          guard(function () { startTyping(el); }); // reserved: #demo-terminal
        } else if (el.classList.contains('typed')) {
          guard(function () { startTypedText(el); }); // hero overline et al.
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
  }

  /* --------------------------------------------------- 3. typed terminal(s) */

  function startTyping(host) {
    if (host.getAttribute('data-typed-done')) return; // run once
    host.setAttribute('data-typed-done', '1');
    if (reduced) return; // static full text already in DOM

    var caret = doc.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');

    // Lines are .t-line children (W1 contract); fall back to direct children.
    var body = host.querySelector('.term-body') || host;
    var lineEls = [];
    var tl = body.querySelectorAll('.t-line');
    if (tl.length) {
      for (var i = 0; i < tl.length; i++) lineEls.push(tl[i]);
    } else {
      for (var j2 = 0; j2 < body.children.length; j2++) lineEls.push(body.children[j2]);
    }

    // No line elements at all → treat as a single typed text block.
    if (!lineEls.length) {
      typeSingle(host, caret);
      return;
    }

    // Terminal mode: hide shipped lines, replay them. Any throw → restore everything.
    var saved = [];
    for (var k = 0; k < lineEls.length; k++) {
      saved.push({ el: lineEls[k], html: lineEls[k].innerHTML, text: lineEls[k].textContent });
    }

    var restored = false;
    function restore() {
      if (restored) return;
      restored = true;
      try { body.removeAttribute('aria-hidden'); } catch (e) { /* ignore */ }
      for (var r = 0; r < saved.length; r++) {
        saved[r].el.style.display = '';
        saved[r].el.style.opacity = '';
        saved[r].el.style.transition = '';
        saved[r].el.innerHTML = saved[r].html;
      }
    }

    try {
      // Visual-only replay: hide the transcript from AT while lines are missing/partial.
      body.setAttribute('aria-hidden', 'true');
      for (var h = 0; h < saved.length; h++) saved[h].el.style.display = 'none';

      var idx = 0;

      var nextLine = function () {
        try {
          if (restored) return;
          if (idx >= saved.length) {
            body.removeAttribute('aria-hidden'); // replay complete — full transcript back for AT
            return; // caret stays blinking on last line
          }
          var line = saved[idx++];
          var isPrompt = /^\s*\$/.test(line.text);
          line.el.style.display = '';

          if (isPrompt) {
            // Type prompt lines char-by-char (~24ms), then restore styled markup.
            var chars = line.text.replace(/\s+/g, ' ').trim();
            line.el.textContent = '';
            var tn = doc.createTextNode('');
            line.el.appendChild(tn);
            line.el.appendChild(caret);
            var c = 0;
            var tick = function () {
              try {
                if (restored) return;
                if (c < chars.length) {
                  tn.data += chars.charAt(c++);
                  window.setTimeout(tick, 24);
                } else {
                  line.el.innerHTML = line.html; // bring back $ coloring etc.
                  line.el.appendChild(caret);
                  window.setTimeout(nextLine, 360); // beat: "command runs"
                }
              } catch (e) { restore(); }
            };
            tick();
          } else {
            // Output lines appear whole with a quick fade.
            line.el.style.opacity = '0';
            line.el.style.transition = 'opacity 80ms linear';
            line.el.appendChild(caret);
            window.requestAnimationFrame(function () {
              line.el.style.opacity = '1';
            });
            window.setTimeout(nextLine, 150);
          }
        } catch (e) { restore(); }
      };

      nextLine();
    } catch (e) {
      restore();
    }
  }

  // Hero overline: class .typed, ships its own <span class="caret"> (W1 contract).
  function startTypedText(el) {
    if (el.getAttribute('data-typed-done')) return; // run once
    el.setAttribute('data-typed-done', '1');
    if (reduced) return; // leave shipped static text + caret as-is
    var caret = el.querySelector('.caret');
    if (!caret) {
      caret = doc.createElement('span');
      caret.className = 'caret';
      caret.setAttribute('aria-hidden', 'true');
    }
    typeSingle(el, caret);
  }

  function typeSingle(el, caret) {
    var html = el.innerHTML;
    try {
      // Collect text excluding the caret span itself.
      var text = '';
      for (var n = el.firstChild; n; n = n.nextSibling) {
        if (n !== caret) text += n.textContent;
      }
      text = text.replace(/\s+/g, ' ').trim();
      el.textContent = '';
      var tn = doc.createTextNode('');
      el.appendChild(tn);
      el.appendChild(caret);
      var c = 0;
      var tick = function () {
        try {
          if (c < text.length) {
            tn.data += text.charAt(c++);
            window.setTimeout(tick, 24);
          }
          // done: leave text + blinking caret in place
        } catch (e) { el.innerHTML = html; }
      };
      tick();
    } catch (e) {
      el.innerHTML = html;
    }
  }

  /* -------------------------------------------------------- 4. copy buttons */

  var liveRegion = null;

  function announce(msg) {
    try {
      if (!liveRegion) {
        liveRegion = doc.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.style.cssText =
          'position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;' +
          'clip:rect(0 0 0 0);white-space:nowrap;border:0;padding:0;';
        doc.body.appendChild(liveRegion);
      }
      liveRegion.textContent = msg;
      // Clear after a beat so repeated copies re-announce reliably.
      window.setTimeout(function () {
        try { if (liveRegion.textContent === msg) liveRegion.textContent = ''; } catch (e2) { /* ignore */ }
      }, 2000);
    } catch (e) { /* announcement is best-effort */ }
  }

  function copyText(text) {
    return new Promise(function (resolve) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { resolve(true); },
          function () { resolve(copyFallback(text)); }
        );
      } else {
        resolve(copyFallback(text));
      }
    });
  }

  function copyFallback(text) {
    try {
      var ta = doc.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
      doc.body.appendChild(ta);
      ta.select();
      var ok = doc.execCommand('copy');
      doc.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function initCopy() {
    var buttons = doc.querySelectorAll('[data-copy]');
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        var timer = null;
        btn.addEventListener('click', function () {
          var attr = btn.getAttribute('data-copy');
          var box = btn.closest ? btn.closest('.cmd-copy') : null;
          var src = box && (box.querySelector('code') || box.querySelector('pre'));
          var text = (attr && attr.trim()) ||
                     (src && src.textContent.trim()) ||
                     (box && box.textContent.trim()) ||
                     btn.textContent.trim();
          if (!text) return;
          copyText(text).then(function (ok) {
            if (!ok) return;
            announce('Copied to clipboard');
            if (!btn.getAttribute('data-copy-label')) {
              btn.setAttribute('data-copy-label', btn.innerHTML);
            }
            btn.innerHTML = 'copied ✓';
            if (timer) window.clearTimeout(timer);
            timer = window.setTimeout(function () {
              btn.innerHTML = btn.getAttribute('data-copy-label');
              btn.removeAttribute('data-copy-label');
              timer = null;
            }, 1200);
          });
        });
      })(buttons[i]);
    }
  }

  /* ------------------------------------------------------------ 5. count-up */

  function startCounts(root) {
    var nodes;
    if (root.nodeType === 1 && root.hasAttribute('data-count')) {
      nodes = [root];
    } else {
      nodes = root.querySelectorAll ? root.querySelectorAll('[data-count]') : [];
    }
    for (var i = 0; i < nodes.length; i++) {
      (function (el) {
        if (el.getAttribute('data-counted')) return;
        el.setAttribute('data-counted', '1');
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) target = parseInt(el.textContent, 10) || 0;
        if (reduced || target === 0) {
          el.textContent = String(target);
          return;
        }
        // AT always reads the final value; the animated number is decorative.
        try {
          var sr = doc.createElement('span');
          sr.className = 'sr-only';
          sr.textContent = String(target);
          el.parentNode.insertBefore(sr, el);
          el.setAttribute('aria-hidden', 'true');
        } catch (e) { /* enhancement */ }
        var dur = 900;
        var t0 = null;
        function frame(now) {
          try {
            if (t0 === null) t0 = now;
            var t = Math.min(1, (now - t0) / dur);
            var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
            el.textContent = String(Math.round(eased * target));
            if (t < 1) window.requestAnimationFrame(frame);
          } catch (e) { el.textContent = String(target); }
        }
        el.textContent = '0';
        window.requestAnimationFrame(frame);
      })(nodes[i]);
    }
  }

  /* --------------------------------------------------------- 6. lazy videos */

  function initVideos() {
    var hosts = doc.querySelectorAll('[data-video-lazy]');
    if (!hosts.length) return;

    function videoOf(host) {
      return host.tagName === 'VIDEO' ? host : host.querySelector('video');
    }

    function isAmbient(v) {
      return v.muted || v.hasAttribute('muted');
    }

    function load(v, host) {
      if (v.getAttribute('data-video-loaded')) return;
      // Ambient loops: skip the download for reduced-motion or Save-Data — poster stays.
      var conn = navigator.connection;
      if (isAmbient(v) && (reduced || (conn && conn.saveData))) return;
      v.setAttribute('data-video-loaded', '1');
      var changed = false;
      var src = v.getAttribute('data-src') || host.getAttribute('data-src');
      if (src && !v.getAttribute('src')) {
        v.src = src;
        changed = true;
      }
      var sources = v.querySelectorAll('source[data-src]');
      for (var i = 0; i < sources.length; i++) {
        sources[i].src = sources[i].getAttribute('data-src');
        changed = true;
      }
      if (changed) v.load();
    }

    function eager() {
      for (var i = 0; i < hosts.length; i++) {
        var v = videoOf(hosts[i]);
        if (v) load(v, hosts[i]);
      }
    }

    if (!('IntersectionObserver' in window)) {
      eager();
      return;
    }

    var userPaused = false; // WCAG 2.2.2: one choice governs all ambient loops
    var toggles = [];

    function maybePlay(v) {
      if (isAmbient(v) && !reduced && !userPaused) {
        var p = v.play();
        if (p && p.catch) p.catch(function () { /* autoplay blocked — poster stays */ });
      }
    }

    function startWhenIdle(fn) {
      // Don't compete with LCP-path fetches: in-view-at-boot videos wait for window load.
      if (doc.readyState === 'complete') { fn(); return; }
      window.addEventListener('load', fn, { once: true });
    }

    function addToggle(host, v) {
      if (!isAmbient(v)) return;
      try {
        var btn = doc.createElement('button');
        btn.className = 'vid-toggle';
        btn.setAttribute('aria-label', 'Pause background video');
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = '❚❚';
        // Never inside an aria-hidden wrapper: hero gets it on the section, figures on the figure.
        var home = host.closest('#hero') || host.closest('figure') || host.parentNode;
        if (!home) return;
        home.appendChild(btn);
        toggles.push({ btn: btn });
        btn.addEventListener('click', function () {
          userPaused = !userPaused;
          var vids = doc.querySelectorAll('[data-video-lazy]');
          for (var i = 0; i < vids.length; i++) {
            var vv = videoOf(vids[i]);
            if (!vv || !isAmbient(vv)) continue;
            if (userPaused) { try { vv.pause(); } catch (e) { /* ignore */ } }
            else { maybePlay(vv); }
          }
          for (var t = 0; t < toggles.length; t++) {
            toggles[t].btn.setAttribute('aria-pressed', String(userPaused));
            toggles[t].btn.setAttribute('aria-label',
              userPaused ? 'Play background video' : 'Pause background video');
            toggles[t].btn.textContent = userPaused ? '▶' : '❚❚';
          }
        });
      } catch (e) { /* toggle is enhancement */ }
    }

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var host = entry.target;
        var v = videoOf(host);
        if (!v) continue;
        if (entry.isIntersecting) {
          (function (vv, hh) {
            startWhenIdle(function () {
              load(vv, hh);
              maybePlay(vv);
            });
          })(v, host);
        } else if (entry.intersectionRatio === 0) {
          if (!v.paused) {
            try { v.pause(); } catch (e) { /* ignore */ }
          }
        }
      }
    }, { rootMargin: '200px 0px 200px 0px', threshold: 0 });

    for (var j = 0; j < hosts.length; j++) {
      io.observe(hosts[j]);
      var jv = videoOf(hosts[j]);
      if (jv) addToggle(hosts[j], jv);
    }
  }

  /* ------------------------------------------------- 7. smooth anchor scroll */

  function initAnchors() {
    var nav = doc.getElementById('nav');
    if (!nav) return;
    nav.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = doc.getElementById(id);
      if (!target) return;
      e.preventDefault(); // we own the scroll — no CSS/native double-handling
      var top = target.getBoundingClientRect().top + (window.scrollY || 0) - 72;
      window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
      try { history.pushState(null, '', '#' + id); } catch (err) { /* ignore */ }
      // WCAG 2.4.3: move sequential focus to the target, not just the viewport.
      try {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      } catch (err) { /* focus is best-effort */ }
    });
  }

  /* --------------------------------------------------------------- boot ---- */

  ready(function () {
    guard(function () { announce(''); }); // create the live region BEFORE first use (WCAG 4.1.3)
    guard(initNav);
    guard(initReveals); // also drives count-up + typed terminal + .m-line stagger
    guard(initCopy);
    guard(initVideos);
    guard(initAnchors);
  });
})();
