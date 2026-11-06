(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // Right-click and drag are switched off on images (Hernan, Nov 6). A deterrent only: it doesn't stop screenshots.
  document.addEventListener('contextmenu', function (e) {
    if (e.target.closest && e.target.closest('img, a.lb')) e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    if (e.target.closest && e.target.closest('img, a.lb')) e.preventDefault();
  });

  // Email: assembled here so the address never appears as plain text in the HTML.
  var addr = ['booking', ['arrecifephotography', 'com'].join('.')].join('@');
  document.querySelectorAll('.js-email').forEach(function (a) {
    var s = a.getAttribute('data-subject');
    a.href = 'mailto:' + addr + (s ? '?subject=' + encodeURIComponent(s) : '');
  });
  document.querySelectorAll('.js-email-text').forEach(function (el) { el.textContent = addr; });

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle'), nav = document.getElementById('site-nav');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
  }

  // Click-to-load YouTube: nothing loads from YouTube until the visitor presses play.
  document.querySelectorAll('a.yt[data-id]').forEach(function (a) {
    if (a.hasAttribute('data-external')) return;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + a.getAttribute('data-id') + '?autoplay=1&rel=0';
      f.title = a.getAttribute('data-title') || 'YouTube video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allowFullscreen = true;
      f.className = 'yt-frame';
      a.replaceWith(f);
      f.focus();
    });
  });

  // Video filters
  var filters = document.querySelector('.filters');
  if (filters) {
    filters.hidden = false;
    var items = document.querySelectorAll('.video[data-cat]');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var cat = b.getAttribute('data-filter');
      filters.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      items.forEach(function (v) { v.hidden = cat !== 'all' && v.getAttribute('data-cat') !== cat; });
    });
  }

  // Lightbox for galleries and case-study images
  var groups = document.querySelectorAll('[data-lightbox]');
  if (!groups.length || typeof HTMLDialogElement !== 'function') return;
  var dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Image viewer');
  dlg.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lb-close" type="button" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" type="button" aria-label="Previous image">&lsaquo;</button>' +
    '<button class="lb-next" type="button" aria-label="Next image">&rsaquo;</button>';
  document.body.appendChild(dlg);
  var big = dlg.querySelector('img'), cap = dlg.querySelector('figcaption'), list = [], i = 0, opener = null;

  function show(k) {
    i = (k + list.length) % list.length;
    var a = list[i], t = a.querySelector('img'), alt = t ? t.alt : '';
    big.src = a.href;
    big.alt = alt;
    // data-caption carries the source credit where an image includes someone else's work
    cap.textContent = (a.getAttribute('data-caption') || alt) +
      (list.length > 1 ? '  (' + (i + 1) + ' / ' + list.length + ')' : '');
    if (list.length > 1) {
      new Image().src = list[(i + 1) % list.length].href;
      new Image().src = list[(i - 1 + list.length) % list.length].href;
    }
  }
  groups.forEach(function (g) {
    var links = Array.prototype.slice.call(g.querySelectorAll('a.lb'));
    links.forEach(function (a, k) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        list = links;
        opener = a;
        dlg.classList.toggle('single', links.length < 2);
        show(k);
        dlg.showModal();
      });
    });
  });
  dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
  dlg.querySelector('.lb-prev').addEventListener('click', function () { show(i - 1); });
  dlg.querySelector('.lb-next').addEventListener('click', function () { show(i + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.tagName === 'FIGURE') dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
  var x0 = null;
  dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50 && list.length > 1) show(dx < 0 ? i + 1 : i - 1);
    x0 = null;
  });
  dlg.addEventListener('close', function () {
    big.removeAttribute('src');
    if (opener) opener.focus();
  });
})();
