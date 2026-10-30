/* Physeia Data Labs site behaviour.
   Motion stack: GSAP + ScrollTrigger + CustomEase, Lenis as the single smooth-scroll engine.
   Everything renders complete without JavaScript or with reduced motion. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motionOn = !reduce && hasGsap;
  var lenis = null;

  /* Year */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* Mobile menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    if (open) { var first = menu.querySelector('a'); if (first) first.focus({ preventScroll: true }); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); } });
  }

  /* Smooth scroll and anchor links */
  if (motionOn && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.1, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    window.gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -96 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', id);
    if (id === '#main' || id === '#contact') { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  });

  /* Current section in nav */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (l) { l.setAttribute('aria-current', String(l.getAttribute('href') === '#' + en.target.id)); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (l) { var s = document.querySelector(l.getAttribute('href')); if (s) io.observe(s); });
  }

  /* Plate cursor: additive pointer readout, fine pointers only */
  Array.prototype.forEach.call(document.querySelectorAll('.plate[data-seconds]'), function (plate) {
    var cursor = plate.querySelector('.cursor');
    var label = cursor && cursor.querySelector('span');
    var secs = parseFloat(plate.getAttribute('data-seconds')) || 10;
    var pending = false, lastX = 0;
    if (!cursor || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    plate.addEventListener('pointermove', function (e) {
      lastX = e.clientX;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        var r = plate.getBoundingClientRect();
        var x = Math.max(0, Math.min(r.width, lastX - r.left));
        cursor.style.transform = 'translateX(' + x + 'px)';
        var gutter = r.width * 0.09;
        var t = Math.max(0, (x - gutter) / (r.width - gutter)) * secs;
        if (label) label.textContent = t.toFixed(2) + ' s';
      });
    });
  });

  /* Form */
  var form = document.getElementById('brief');
  if (form) {
    var ENDPOINT = form.getAttribute('data-endpoint');
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn.querySelector('.label');
    var success = document.getElementById('brief-success');
    function showSuccess(animate) {
      var reveal = function () {
        form.hidden = true; form.classList.remove('leaving');
        success.classList.add('show');
        success.focus({ preventScroll: true });
        // Keep the thank you card in view below the floating header
        var top = success.getBoundingClientRect().top + window.pageYOffset - 120;
        if (success.getBoundingClientRect().top < 100) {
          if (lenis) lenis.scrollTo(top); else window.scrollTo({ top: top, behavior: motionOn ? 'smooth' : 'auto' });
        }
      };
      if (animate && motionOn) { form.classList.add('leaving'); setTimeout(reveal, 300); } else reveal();
    }
    if (/[?&]sent=1/.test(location.search)) {
      showSuccess(false);
      if (history.replaceState) history.replaceState(null, '', location.pathname + '#contact');
    }
    var rules = {
      name: function (v) { return v.trim() ? '' : 'Please add your name.'; },
      email: function (v) {
        if (!v.trim()) return 'Please add your work email.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That email looks incomplete. Check the part after the @.';
      }
    };
    function check(name) {
      var input = form.elements[name];
      var msg = rules[name](input.value);
      var err = document.getElementById(name + '-err');
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      err.textContent = msg; err.classList.toggle('show', !!msg);
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      form.elements[n].addEventListener('blur', function (e) { if (e.relatedTarget === btn) return; if (form.elements[n].value) check(n); });
      form.elements[n].addEventListener('input', function () { if (form.elements[n].getAttribute('aria-invalid') === 'true') check(n); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = Object.keys(rules).map(check).every(Boolean);
      if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }
      if (form.elements.botcheck.checked) return;
      btn.disabled = true; btnLabel.textContent = 'Sending your brief';
      status.className = 'form-status'; status.textContent = '';
      var f = form.elements;
      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: f.access_key.value,
          subject: 'Physeia Data Labs feasibility request: ' + (f.company.value || f.name.value),
          from_name: f.from_name.value, replyto: f.email.value,
          name: f.name.value, email: f.email.value, company: f.company.value, country: f.country.value,
          data_type: f.modality.value, intended_use: f.use.value, engagement: f.engagement.value,
          standards: f.standard.value, brief: f.brief.value
        })
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (!d.success) throw new Error(d.message || 'rejected');
        showSuccess(true);
      }).catch(function (err) {
        if (window.console) console.error('Form submit failed:', err);
        var why = err && err.message && err.message !== 'rejected' && !/fetch|network|json/i.test(err.message) ? ' (' + err.message + ')' : '';
        status.className = 'form-status error';
        status.textContent = 'We could not send your brief. Please try again, or email hello@physeiadatalab.com.' + why;
      }).finally(function () { btn.disabled = false; btnLabel.textContent = 'Request a feasibility review'; });
    });
  }

  if (!motionOn) return;

  /* ---------- Motion ---------- */
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  var ease = 'power4.out';
  if (window.CustomEase) { gsap.registerPlugin(window.CustomEase); window.CustomEase.create('fluid', '0.32,0.72,0,1'); ease = 'fluid'; }
  doc.classList.add('motion');

  /* Split headline words; keep an unsplit accessible copy */
  function split(el) {
    var text = el.textContent.trim().replace(/\s+/g, ' ');
    var sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = text;
    var vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    var html = el.innerHTML;
    // preserve explicit line breaks
    var lines = html.split(/<br\s*\/?>/i).map(function (l) { var d = document.createElement('div'); d.innerHTML = l; return d.textContent.trim(); });
    lines.forEach(function (line, li) {
      line.split(' ').forEach(function (w, wi, arr) {
        var s = document.createElement('span'); s.className = 'w'; s.textContent = w;
        vis.appendChild(s); if (wi < arr.length - 1) vis.appendChild(document.createTextNode(' '));
      });
      if (li < lines.length - 1) vis.appendChild(document.createElement('br'));
    });
    el.textContent = ''; el.appendChild(sr); el.appendChild(vis);
    return vis.querySelectorAll('.w');
  }

  /* Hero intro: content is readable immediately; motion is a short settle */
  var h1 = document.querySelector('.hero h1');
  var words = h1 ? split(h1) : [];
  /* Gradient text cannot span transformed words, so give each word its own slice of the same gradient */
  function paintWords() {
    if (!h1) return;
    var w = h1.getBoundingClientRect().width;
    Array.prototype.forEach.call(words, function (el) {
      el.style.backgroundImage = 'linear-gradient(90deg, #0e2a47 0%, #4a6585 100%)';
      el.style.backgroundSize = w + 'px 100%';
      el.style.backgroundPosition = -el.offsetLeft + 'px 0';
      el.style.webkitBackgroundClip = 'text'; el.style.backgroundClip = 'text';
      el.style.color = 'transparent';
    });
  }
  if (h1) { h1.classList.add('split'); paintWords(); window.addEventListener('resize', paintWords); if (document.fonts) document.fonts.ready.then(paintWords); }
  var tl = gsap.timeline({ defaults: { ease: ease } });
  tl.from(words, { yPercent: 40, opacity: 0, filter: 'blur(8px)', duration: 1.1, stagger: 0.05 })
    .from('.hero [data-hero]', { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, '-=0.8');

  var plate = document.querySelector('.hero .plate');
  if (plate) {
    var traces = plate.querySelectorAll('.trace');
    traces.forEach(function (p) { var len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
    tl.from(plate, { y: 32, opacity: 0, duration: 1.2 }, 0.2)
      .to(traces, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: 0.06 }, 0.5)
      .from(plate.querySelectorAll('.mark'), { scaleX: 0, transformOrigin: 'left center', opacity: 0, duration: 1, stagger: 0.15 }, 2.1)
      .from(plate.querySelectorAll('.tag'), { y: 8, opacity: 0, duration: 0.8, stagger: 0.15 }, 2.4);
  }

  /* Section reveals */
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: ease,
      delay: parseFloat(el.getAttribute('data-delay') || 0),
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* Annotation plate draws when it arrives */
  var plate2 = document.querySelector('#annotation .plate');
  if (plate2) {
    var t2 = plate2.querySelectorAll('.trace');
    t2.forEach(function (p) { var len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
    gsap.timeline({ defaults: { ease: ease }, scrollTrigger: { trigger: plate2, start: 'top 75%', once: true } })
      .to(t2, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
      .from(plate2.querySelectorAll('.mark'), { scaleX: 0, transformOrigin: 'left center', opacity: 0, duration: 0.9, stagger: 0.12 }, 1.2)
      .from(plate2.querySelectorAll('.tag'), { y: 8, opacity: 0, duration: 0.7, stagger: 0.08 }, 1.4);
  }

  /* Tagline: each word moves from muted to full ink in reading order */
  var tag = document.querySelector('.tagline p');
  if (tag) {
    var tw = split(tag);
    Array.prototype.forEach.call(tw, function (w) { w.classList.add('tw'); w.style.opacity = 0.28; });
    window.ScrollTrigger.create({
      trigger: tag, start: 'top 80%', end: 'bottom 45%',
      onUpdate: function (self) {
        var lit = Math.round(self.progress * tw.length);
        for (var i = 0; i < tw.length; i++) tw[i].style.opacity = i < lit ? 1 : 0.28;
      }
    });
  }

  /* Keep measurements correct after fonts and layout settle */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { window.ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
})();
