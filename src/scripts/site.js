/* LoyalEdge careers page — progressive enhancement only.
   Everything here degrades gracefully: with JS off the roles stay collapsed
   but the form still submits natively and all content remains in the DOM. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- sticky header shadow ---------- */
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    header.classList.toggle('is-stuck', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Reset the menu when we cross back to desktop so nothing is left stranded.
  var desktop = window.matchMedia('(min-width: 861px)');
  var onBreakpoint = function (e) { if (e.matches) setMenu(false); };
  if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  else desktop.addListener(onBreakpoint);

  /* ---------- role accordions ---------- */
  var EASE = 'height .3s cubic-bezier(.22,.61,.36,1)';

  Array.prototype.forEach.call(document.querySelectorAll('.role-toggle'), function (btn) {
    var role = btn.closest('.role');
    var body = document.getElementById(btn.getAttribute('aria-controls'));
    var pending = null;
    var timer = null;

    function settle() {
      if (pending) body.removeEventListener('transitionend', pending);
      if (timer) clearTimeout(timer);
      pending = null;
      timer = null;
      body.style.transition = '';
      body.style.height = '';
    }

    // transitionend bubbles, so a descendant's hover transition (the apply
    // button) would otherwise end the animation early. Only react to this
    // element's own height transition, and re-check state before hiding so a
    // rapid re-open can't be undone by the previous close's handler.
    //
    // transitionend is also not guaranteed to fire — a backgrounded tab or a
    // renderer that isn't producing frames will leave it pending forever, which
    // would strand the panel at its start height. The timer guarantees we settle
    // either way; whichever arrives first wins and cancels the other.
    function animate(to, thenHide) {
      settle();

      function finish() {
        var stillClosed = btn.getAttribute('aria-expanded') !== 'true';
        settle();
        if (thenHide && stillClosed) body.hidden = true;
      }

      body.style.transition = EASE;
      pending = function (e) {
        if (e.target !== body || e.propertyName !== 'height') return;
        finish();
      };
      body.addEventListener('transitionend', pending);
      timer = setTimeout(finish, 400);
      body.style.height = to + 'px';
    }

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      role.classList.toggle('is-open', !open);

      if (reduceMotion) {
        settle();
        body.hidden = open;
        return;
      }

      if (open) {
        body.style.height = body.scrollHeight + 'px';
        void body.offsetHeight; // flush the from-value so the transition runs
        animate(0, true);
      } else {
        body.hidden = false;
        var target = body.scrollHeight;
        body.style.height = '0px';
        void body.offsetHeight;
        animate(target, false);
      }
    });
  });

  /* ---------- "Apply for this role" preselects the right option ---------- */
  var roleSelect = document.getElementById('role');
  Array.prototype.forEach.call(document.querySelectorAll('[data-apply]'), function (link) {
    link.addEventListener('click', function () {
      var id = link.getAttribute('data-apply');
      if (roleSelect && roleSelect.querySelector('option[value="' + id + '"]')) {
        roleSelect.value = id;
      }
    });
  });

  /* ---------- scroll reveal (staggered per sibling group) ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-in'); });
  } else {
    // Stagger by position among reveal siblings, not by observer callback order —
    // the callback batches whatever crossed the line in one frame, so its index
    // is not the visual order the reader actually scans.
    Array.prototype.forEach.call(revealables, function (el) {
      var group = Array.prototype.filter.call(el.parentNode.children, function (n) {
        return n.classList && n.classList.contains('reveal');
      });
      var i = group.indexOf(el);
      el.style.setProperty('--d', (i > 0 ? Math.min(i, 5) * 80 : 0) + 'ms');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });

    // Failsafe: reveal content is invisible until .is-in lands. If the observer
    // never fires (JS error elsewhere, an environment that doesn't paint), the
    // page must not be left blank — force everything visible after a grace period.
    setTimeout(function () {
      Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-in'); });
    }, 2600);
  }

  /* ---------- scroll progress rail ---------- */
  var rail = document.createElement('div');
  rail.className = 'scroll-progress';
  var railFill = document.createElement('i');
  rail.appendChild(railFill);
  rail.setAttribute('aria-hidden', 'true');
  document.body.appendChild(rail);

  /* ---------- nav scrollspy ---------- */
  var spyLinks = {};
  Array.prototype.forEach.call(document.querySelectorAll('.nav > a[href^="#"]'), function (a) {
    var id = a.getAttribute('href').slice(1);
    if (document.getElementById(id)) spyLinks[id] = a;
  });
  var spyIds = Object.keys(spyLinks);
  var activeId = null;

  function setActive(id) {
    if (id === activeId) return;
    if (activeId && spyLinks[activeId]) spyLinks[activeId].classList.remove('is-active');
    if (id && spyLinks[id]) spyLinks[id].classList.add('is-active');
    activeId = id;
  }

  /* ---------- image parallax ---------- */
  /* Drives the --par custom property consumed by .hero-media img and
     .malta-media img. The CSS over-scales those images so the drift never
     exposes an edge. Skipped entirely under reduced motion. */
  var parallaxImgs = reduceMotion
    ? []
    : Array.prototype.slice.call(document.querySelectorAll('.hero-media img, .malta-media img'));

  function parallax() {
    var vh = window.innerHeight;
    parallaxImgs.forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var offset = r.top + r.height / 2 - vh / 2;
      var y = Math.max(-26, Math.min(26, -offset * 0.055));
      img.style.setProperty('--par', y.toFixed(1) + 'px');
    });
  }

  /* One rAF-throttled scroll pass drives the rail, the spy and the parallax. */
  var ticking = false;
  function frame() {
    ticking = false;
    parallax();
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    railFill.style.transform = 'scaleX(' + p + ')';

    // active = last section whose top has passed the header line
    var line = 140;
    var current = null;
    for (var i = 0; i < spyIds.length; i++) {
      var sec = document.getElementById(spyIds[i]);
      if (sec.getBoundingClientRect().top <= line) current = spyIds[i];
    }
    // pin the final section once we hit the bottom, which short sections never reach
    if (max - window.scrollY < 4 && spyIds.length) current = spyIds[spyIds.length - 1];
    setActive(current);
  }
  function requestFrame() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(frame);
  }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);
  frame();

  /* ---------- trust counters ---------- */
  /* Only animates values that are actually numeric ("200+", "100%").
     Non-numeric labels like "Multi" and "Full" are left exactly as authored. */
  Array.prototype.forEach.call(document.querySelectorAll('.trust strong'), function (el) {
    var parsed = /^(\d+)(\D*)$/.exec(el.textContent.trim());
    if (!parsed || reduceMotion) return;

    var target = parseInt(parsed[1], 10);
    var suffix = parsed[2] || '';
    var finalText = el.textContent;

    // Reserve the settled width so counting up can't reflow the row.
    el.style.display = 'inline-block';
    el.style.minWidth = el.getBoundingClientRect().width + 'px';

    // The real figure stays in the DOM for assistive tech (aria-label on a
    // non-interactive element is not reliably announced); only the ticking
    // copy is hidden from it.
    var truth = document.createElement('span');
    truth.className = 'sr-only';
    truth.textContent = finalText;

    var span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.textContent = '0' + suffix;

    el.textContent = '';
    el.appendChild(truth);
    el.appendChild(span);

    var start = null;
    var done = false;
    var DUR = 1100;

    // A throttled or frame-starved renderer would otherwise strand this at "0+",
    // which reads as real content. Always land on the true value.
    function land() {
      if (done) return;
      done = true;
      span.textContent = finalText;
    }

    function step(ts) {
      if (done) return;
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / DUR);
      span.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix;
      if (t < 1) window.requestAnimationFrame(step);
      else land();
    }

    var started = false;
    function run() {
      if (started) return;
      started = true;
      window.requestAnimationFrame(step);
      setTimeout(land, DUR + 400);
    }

    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        cio.disconnect();
        run();
      }, { threshold: 0.5 });
      cio.observe(el);
      // Same failsafe as the reveals: never leave a counter stranded at "0".
      setTimeout(function () { cio.disconnect(); run(); }, 2600);
    } else {
      run();
    }
  });

})();
