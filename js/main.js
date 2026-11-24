(function () {
  'use strict';

  document.documentElement.classList.add('js-ready');

  // Sticky header shadow/opacity once page scrolls past hero top
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    if (window.scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll-triggered reveal with light stagger per section
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var counters = new WeakMap();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var parent = el.closest('section, footer') || document.body;
        var index = counters.get(parent) || 0;
        el.style.transitionDelay = Math.min(index * 80, 320) + 'ms';
        counters.set(parent, index + 1);
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
  // 首頁橫額：每 5 秒自動切換；滑鼠停留、鍵盤 focus、分頁隱藏時暫停
  var track = document.querySelector('[data-banner-carousel]');
  if (track) {
    var slides = track.querySelectorAll('.banner-slide');
    var dots = track.querySelectorAll('.banner-dot');
    var current = 0, timer = null, paused = false, INTERVAL = 5000;
    var show = function (i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        var on = n === current;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (s.tagName === 'A') { s.tabIndex = on ? 0 : -1; }
      });
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === current);
        if (n === current) { d.setAttribute('aria-current', 'true'); } else { d.removeAttribute('aria-current'); }
      });
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var start = function () {
      stop();
      if (!paused && !document.hidden && slides.length > 1) {
        timer = setInterval(function () { show(current + 1); }, INTERVAL);
      }
    };
    dots.forEach(function (d, n) {
      d.addEventListener('click', function () { show(n); start(); });
    });
    track.addEventListener('mouseenter', function () { paused = true; stop(); });
    track.addEventListener('mouseleave', function () { paused = false; start(); });
    track.addEventListener('focusin', function () { paused = true; stop(); });
    track.addEventListener('focusout', function () { paused = false; start(); });
    document.addEventListener('visibilitychange', start);
    // 手機左右掃
    var x0 = null;
    track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (x0 === null) { return; }
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { show(current + (dx < 0 ? 1 : -1)); start(); }
    }, { passive: true });
    show(0);
    start();
  }
})();
