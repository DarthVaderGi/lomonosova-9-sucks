(function () {
  'use strict';

  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INK = '#2a2118';
  var ST = '#e6dcc4';
  var STK = ' stroke="#2a2118" stroke-width="1"';

  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; }
    },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  var fmt = function (n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + '\u00a0₽';
  };

  function R(x, y, w, h, f, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"' + (extra || '') + '/>';
  }
  function P(d, f, extra) {
    return '<path d="' + d + '" fill="' + f + '"' + (extra || '') + '/>';
  }
  function person(x, y, c, hat) {
    return '<g transform="translate(' + x + ' ' + y + ')" fill="' + c + '"><circle cx="0" cy="-17" r="3.4"/><path d="M-4.6 0L-3.6 -12Q0 -14.5 3.6 -12L4.6 0Z"/>' +
      (hat ? '<rect x="-3.4" y="-26" width="6.8" height="6"/><rect x="-5.4" y="-21" width="10.8" height="1.8"/>' : '') + '</g>';
  }
  var PEOPLE = [INK, '#1d3a63', '#9d4630', '#4d6b50', '#6b4a7a'];

  var nav = $('#nav');
  var burger = $('#burger');
  var links = $('#links');
  function onScroll() {
    nav.classList.toggle('solid', (window.scrollY || doc.documentElement.scrollTop) > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('a', links).forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  var sections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          $$('a', links).forEach(function (a) {
            a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  var rvEls = $$('.head,.ctrl,.panels,.wipe,.wrange,.wcap,.balance,.moves-head,.move,.notes,.bigsum,.stack,.bud-grid,.lines,.team article,.peer,.idcard');
  rvEls.forEach(function (e) { e.classList.add('rv'); });
  if ('IntersectionObserver' in window && !reduce) {
    var rio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    rvEls.forEach(function (e) { rio.observe(e); });
  } else {
    rvEls.forEach(function (e) { e.classList.add('in'); });
  }

  function buildHero() {
    var o = [];
    var gl = [];
    var W = [96, 166, 236, 306, 376];
    var WR = W.map(function (x) { return 1200 - x; }).reverse();
    var wings = W.concat(WR);

    function surround(cx, y, w, h, pad) {
      var r = w / 2 + pad;
      return 'M' + (cx - r) + ' ' + (y + h + pad) + ' V' + (y + w / 2) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + (y + w / 2) + ' V' + (y + h + pad) + ' Z';
    }
    function arch(cx, y, w, h, ped, floor) {
      var s = '';
      if (ped === 'tri') {
        s += P('M' + (cx - w / 2 - 13) + ' ' + (y - 7) + ' L' + cx + ' ' + (y - 29) + ' L' + (cx + w / 2 + 13) + ' ' + (y - 7) + ' Z', ST, STK);
        s += R(cx - w / 2 - 14, y - 9, w + 28, 4, ST, STK);
      } else if (ped === 'seg') {
        s += P('M' + (cx - w / 2 - 13) + ' ' + (y - 7) + ' Q' + cx + ' ' + (y - 34) + ' ' + (cx + w / 2 + 13) + ' ' + (y - 7) + ' Z', ST, STK);
        s += R(cx - w / 2 - 14, y - 9, w + 28, 4, ST, STK);
      }
      s += P(surround(cx, y, w, h, 5), ST, STK);
      s += P(surround(cx, y, w, h, 0), '#46606f', STK);
      s += '<path d="M' + cx + ' ' + (y + 2) + ' V' + (y + h) + ' M' + (cx - w / 2) + ' ' + (y + h * 0.42) + ' H' + (cx + w / 2) + '" stroke="#e6dcc4" stroke-width="2.4" fill="none"/>';
      s += R(cx - w / 2 - 9, y + h + 5, w + 18, 5, ST, STK);
      gl.push({ cx: cx, y: y, w: w, h: h, k: 'arch', floor: floor });
      return s;
    }
    function seg(cx, y, w, h) {
      var x1 = cx - w / 2;
      var x2 = cx + w / 2;
      var s = P('M' + (x1 - 4) + ' ' + (y + h + 4) + ' V' + (y + 6) + ' Q' + cx + ' ' + (y - 8) + ' ' + (x2 + 4) + ' ' + (y + 6) + ' V' + (y + h + 4) + ' Z', ST, STK);
      s += P('M' + x1 + ' ' + (y + h) + ' V' + (y + 8) + ' Q' + cx + ' ' + (y - 2) + ' ' + x2 + ' ' + (y + 8) + ' V' + (y + h) + ' Z', '#46606f', STK);
      var bars = '';
      for (var b = x1 + 7; b < x2 - 3; b += 7) bars += 'M' + b + ' ' + (y + 4) + ' V' + (y + h) + ' ';
      s += '<path d="' + bars + '" stroke="#1e1b18" stroke-width="1.6" fill="none"/>';
      s += R(cx - 4, y - 9, 8, 9, ST, STK);
      gl.push({ cx: cx, y: y, w: w, h: h, k: 'seg', floor: 1 });
      return s;
    }
    function sq(cx, y, w) {
      var s = R(cx - w / 2 - 4, y - 4, w + 8, w + 8, ST, STK);
      s += R(cx - w / 2, y, w, w, '#46606f', STK);
      s += '<path d="M' + cx + ' ' + y + ' V' + (y + w) + '" stroke="#e6dcc4" stroke-width="2"/>';
      gl.push({ cx: cx, y: y, w: w, h: w, k: 'sq', floor: 4 });
      return s;
    }
    function quoins(xs, dir) {
      var s = '';
      for (var y = 128, i = 0; y < 366; y += 24, i++) {
        var w = i % 2 ? 20 : 32;
        var x = dir === 'c' ? xs - w / 2 : dir === 'l' ? xs : xs - w;
        s += R(x, y, w, 12, ST, STK);
      }
      return s;
    }

    o.push('<svg viewBox="0 0 1200 540" role="img" aria-label="Elevation of the street facade of Lomonosova 9 in four states" data-s="0" id="heroSvg">');
    o.push(R(0, 0, 1200, 540, '#8a6f4f', ' class="vis s1" opacity=".3"'));

    o.push('<g class="vis s0">' + P('M70 86 L140 50 L1060 50 L1130 86 Z', '#4e4a45', STK) +
      '<path d="M104 62H1096M88 74H1112" stroke="#3a3733" stroke-width="1.4"/></g>');
    var glassRoof = P('M70 86 L140 50 L1060 50 L1130 86 Z', 'url(#glassG)', STK + ' opacity=".95"');
    for (var gx = 140; gx <= 1060; gx += 46) glassRoof += '<path d="M' + gx + ' 50 L' + (gx + (gx < 600 ? -12 : 12)) + ' 86" stroke="#4a5a63" stroke-width="1.2"/>';
    o.push('<g class="vis s3">' + glassRoof + '<path d="M104 68H1096" stroke="#4a5a63" stroke-width="1.2"/></g>');

    o.push('<g class="vis s1 s2">' + R(790, 36, 210, 52, '#2a2420', '') +
      '<path d="M840 86L884 38M900 86L934 50M942 86L956 58M818 86L826 60" stroke="#8a6a41" stroke-width="4" fill="none"/>' +
      P('M70 86 L140 50 L790 50 L801 66 L815 56 L826 76 L838 86 Z', '#4e4a45', STK) +
      P('M1130 86 L1060 50 L1000 50 L990 64 L976 56 L962 78 L950 86 Z', '#4e4a45', STK) + '</g>');
    o.push('<g class="vis s2">' + P('M798 84 Q892 26 998 82 L1000 88 L796 88 Z', 'url(#tarpP)', STK) +
      '<path d="M830 70L826 88M880 52L880 88M930 52L936 88M975 70L982 88" stroke="#2a2118" stroke-width="1.4"/></g>');

    o.push(R(222, 18, 22, 40, 'url(#brickP)', STK) + R(218, 14, 30, 6, ST, STK));
    o.push(R(1052, 18, 22, 40, 'url(#brickP)', STK) + R(1048, 14, 30, 6, ST, STK));

    o.push(R(60, 96, 1080, 374, 'url(#brickP)', STK));
    o.push(R(440, 100, 320, 370, 'url(#brickP)', STK));
    o.push(R(60, 380, 1080, 90, 'url(#rustP)', STK));
    o.push(R(440, 380, 320, 90, 'url(#rustP)', STK));

    o.push(quoins(440, 'c') + quoins(760, 'c') + quoins(60, 'l') + quoins(1140, 'r'));

    o.push(R(56, 372, 1088, 12, ST, STK) + R(56, 384, 1088, 3, 'rgba(0,0,0,.18)', ''));
    o.push(R(60, 266, 1080, 8, ST, STK) + R(60, 166, 1080, 8, ST, STK));
    o.push(R(50, 104, 1100, 6, ST, STK) + R(50, 110, 1100, 8, 'url(#dentP)', STK) + R(50, 118, 1100, 4, ST, STK));

    var bal = R(56, 78, 372, 6, ST, STK) + R(56, 84, 372, 20, 'url(#balP)', STK) + R(772, 78, 372, 6, ST, STK) + R(772, 84, 372, 20, 'url(#balP)', STK);
    for (var pi = 80; pi < 428; pi += 62) bal += R(pi, 80, 10, 24, ST, STK) + R(1190 - pi - 10 - 0, 80, 10, 24, ST, STK);
    o.push(bal);

    o.push(P('M428 104 L600 36 L772 104 Z', ST, STK));
    o.push(P('M452 100 L600 48 L748 100 Z', '#d9ceb2', STK));
    o.push('<circle cx="600" cy="82" r="15" fill="#efe7d1"' + STK + '/><circle cx="600" cy="82" r="10" fill="#46606f"' + STK + '/><path d="M600 82V74M600 82L606 85" stroke="#efe7d1" stroke-width="1.6"/>');
    o.push('<path d="M470 98L600 54L730 98" stroke="#a09070" stroke-width="1.2" fill="none"/>');

    var winCx = wings.slice();
    winCx.forEach(function (cx) {
      o.push(sq(cx, 138, 20));
      o.push(arch(cx, 190, 34, 56, null, 3));
      o.push(arch(cx, 294, 40, 68, ((cx / 70) | 0) % 2 ? 'tri' : 'seg', 2));
      o.push(seg(cx, 402, 38, 40));
    });
    [500, 600, 700].forEach(function (cx) {
      o.push(sq(cx, 138, 20));
      o.push(arch(cx, 190, 38, 58, null, 3));
    });
    [500, 700].forEach(function (cx) {
      o.push(arch(cx, 294, 42, 68, 'tri', 2));
    });
    o.push(arch(600, 290, 54, 76, 'seg', 2));
    o.push(R(552, 366, 96, 6, ST, STK) + R(552, 348, 96, 18, 'url(#balP)', STK) + R(548, 344, 104, 5, ST, STK));
    [480, 720].forEach(function (cx) { o.push(seg(cx, 402, 38, 40)); });

    o.push(P('M562 470 V430 A38 38 0 0 1 638 430 V470 Z', '#d3c7aa', STK));
    o.push(P('M572 470 V432 A28 28 0 0 1 628 432 V470 Z', '#2a2d33', STK));
    o.push(R(574, 436, 25, 34, '#5a4630', STK) + R(601, 436, 25, 34, '#5a4630', STK));
    o.push('<path d="M586 440V466M613 440V466M576 452H624" stroke="#3a2c1c" stroke-width="1.6"/>');
    o.push(R(580, 440, 8, 10, '#46606f', '') + R(612, 440, 8, 10, '#46606f', ''));
    o.push(R(554, 458, 92, 6, ST, STK) + R(546, 464, 108, 6, ST, STK));

    o.push('<g class="vis s1 s2 s3">' + R(512, 388, 48, 26, '#173a63', ' stroke="#f4efe0" stroke-width="1.4"') +
      '<text x="536" y="398" text-anchor="middle" font-family="PT Sans Narrow, Arial Narrow, sans-serif" font-size="6.6" fill="#fff" font-weight="700">УЛ. ЛОМОНОСОВА</text>' +
      '<text x="536" y="410" text-anchor="middle" font-family="PT Sans Narrow, Arial Narrow, sans-serif" font-size="11" fill="#fff" font-weight="700">Д. 9</text>' +
      R(644, 386, 44, 28, '#173a63', ' stroke="#f4efe0" stroke-width="1.4"') +
      '<text x="666" y="405" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-size="12" fill="#fff" font-weight="700">ИТМО</text></g>');

    var gb = '';
    var dk = '';
    var lt = '';
    var bd = '';
    gl.forEach(function (g, i) {
      var d = g.k === 'arch' ? surround(g.cx, g.y, g.w, g.h, 0) :
        g.k === 'seg' ? 'M' + (g.cx - g.w / 2) + ' ' + (g.y + g.h) + ' V' + (g.y + 8) + ' Q' + g.cx + ' ' + (g.y - 2) + ' ' + (g.cx + g.w / 2) + ' ' + (g.y + 8) + ' V' + (g.y + g.h) + ' Z' :
        'M' + (g.cx - g.w / 2) + ' ' + g.y + ' h' + g.w + ' v' + g.h + ' h-' + g.w + ' Z';
      if (g.cx > 760 || i % 4 === 1) dk += '<path d="' + d + '" fill="#161c21" opacity=".82"/>';
      if ((i * 7) % 5 < 3 && g.k !== 'sq') lt += '<path d="' + d + '" fill="#f6dc92" opacity="' + (0.55 + ((i * 3) % 4) * 0.12) + '"/>';
      if (g.cx > 760 && (g.floor === 1 || g.floor === 2) && g.k !== 'sq') {
        var sd = g.k === 'arch' ? surround(g.cx, g.y, g.w, g.h, 5) : 'M' + (g.cx - g.w / 2 - 4) + ' ' + (g.y + g.h + 4) + ' V' + (g.y + 6) + ' Q' + g.cx + ' ' + (g.y - 8) + ' ' + (g.cx + g.w / 2 + 4) + ' ' + (g.y + 6) + ' V' + (g.y + g.h + 4) + ' Z';
        bd += '<path d="' + sd + '" fill="url(#woodP)" stroke="#2a2118" stroke-width="1"/><path d="M' + (g.cx - g.w / 2 - 4) + ' ' + (g.y + g.h * 0.35) + ' H' + (g.cx + g.w / 2 + 4) + ' M' + (g.cx - g.w / 2 - 4) + ' ' + (g.y + g.h * 0.75) + ' H' + (g.cx + g.w / 2 + 4) + '" stroke="#3a2c1c" stroke-width="2"/>';
      }
    });
    o.push('<g class="vis s1 s2">' + dk + '</g>');
    o.push('<g class="vis s3">' + lt + '</g>');
    o.push('<g class="vis s2">' + bd + '</g>');
    o.push(R(60, 96, 1080, 374, '#fff', ' class="vis s3" opacity=".07"'));

    o.push('<g class="vis s1 s2 crk"><path class="crack" d="M884 124L880 150L890 168L879 192L893 216L884 240L897 264L888 292L902 314L891 342L897 368" fill="none" stroke="#2a2118" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path class="crack" d="M170 178L177 204L167 224L175 248L168 268" fill="none" stroke="#2a2118" stroke-width="2" stroke-linejoin="round"/>' +
      '<path class="crack" d="M1062 128L1056 156L1066 180L1058 206" fill="none" stroke="#2a2118" stroke-width="2" stroke-linejoin="round"/></g>');

    var fence = '<path d="M30 442H548M652 442H1170M30 462H548M652 462H1170" stroke="#1e1b18" stroke-width="3" fill="none"/>';
    for (var fx = 40; fx <= 1160; fx += 26) {
      if (fx > 540 && fx < 660) continue;
      fence += '<path d="M' + fx + ' 470V428" stroke="#1e1b18" stroke-width="2.4"/><path d="M' + (fx - 3.4) + ' 428L' + fx + ' 418L' + (fx + 3.4) + ' 428Z" fill="#1e1b18"/>';
    }
    o.push(fence);
    o.push(R(546, 416, 14, 56, ST, STK) + R(540, 410, 26, 8, ST, STK) + R(640, 416, 14, 56, ST, STK) + R(634, 410, 26, 8, ST, STK));

    o.push(R(0, 470, 1200, 44, 'url(#paveP)', '') + R(0, 512, 1200, 8, ST, STK) + R(0, 520, 1200, 20, '#8d8577', ''));
    o.push('<path d="M0 470H1200" stroke="#2a2118" stroke-width="1.6"/>');

    [330, 870].forEach(function (lx) {
      o.push('<path d="M' + lx + ' 500V380" stroke="#1e1b18" stroke-width="4"/><path d="M' + (lx - 8) + ' 380H' + (lx + 8) + 'L' + (lx + 5) + ' 362H' + (lx - 5) + 'Z" fill="#1e1b18"/><rect x="' + (lx - 4) + '" y="366" width="8" height="12" fill="#f6dc92" class="lampG"/>' + R(lx - 7, 496, 14, 6, '#1e1b18', ''));
    });

    var p0 = '';
    [[200, 'top'], [260, 'top'], [980, 'top']].forEach(function (a, i) { p0 += person(a[0], 504, INK, true); });
    o.push('<g class="vis s0">' + p0 + '</g>');

    var p1 = '';
    [250, 266, 284, 300, 318, 338, 352, 372, 392].forEach(function (x, i) { p1 += person(x, 504 + (i % 3) * 3, PEOPLE[i % 5], false); });
    o.push('<g class="vis s1">' + p1 + '</g>');

    o.push('<g class="vis s2"><rect x="768" y="404" width="384" height="66" fill="url(#meshP)" opacity=".6"' + STK + '/>' + R(768, 400, 384, 6, 'url(#hazP)', STK) +
      R(760, 478, 62, 22, 'url(#hazP)', STK) + R(840, 478, 62, 22, 'url(#hazP)', STK) + R(920, 478, 62, 22, 'url(#hazP)', STK) + R(1000, 478, 62, 22, 'url(#hazP)', STK) + R(1080, 478, 62, 22, 'url(#hazP)', STK) +
      P('M796 398L820 440H772Z', '#f0b81c', STK) + '<text x="796" y="434" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="22" fill="#1c1916">!</text></g>');

    o.push('<g class="vis s3">' +
      P('M400 470L400 458L480 440L480 470Z', '#cbbfa4', STK) +
      '<path d="M400 420L480 402" stroke="#1e1b18" stroke-width="2.4"/><path d="M400 420V458M440 411V449M480 402V440" stroke="#1e1b18" stroke-width="2"/>' +
      '</g>');

    var pt = '';
    [[120, 3], [180, 0], [300, 1], [430, 4], [770, 2], [850, 0], [1010, 3], [1080, 1]].forEach(function (a) { pt += person(a[0], 506, PEOPLE[a[1]], false); });
    var tr = '';
    [[60, 504], [1140, 504]].forEach(function (t) {
      tr += R(t[0] - 3, t[1] - 54, 6, 54, '#5a4630', '') + '<circle cx="' + t[0] + '" cy="' + (t[1] - 66) + '" r="26" fill="#5b8a4e"/><circle cx="' + (t[0] - 14) + '" cy="' + (t[1] - 54) + '" r="17" fill="#6c9d5c"/><circle cx="' + (t[0] + 15) + '" cy="' + (t[1] - 56) + '" r="16" fill="#4d7a42"/>';
    });
    o.push('<g class="vis s3">' + pt + tr + '</g>');

    o.push('<g class="vis s0"><text x="600" y="30" text-anchor="middle" font-family="Spectral, Georgia, serif" font-style="italic" font-size="15" fill="#2a2118" opacity=".7">Commercial School</text></g>');

    o.push('<g class="dustG vis s1">' +
      '<circle cx="880" cy="40" r="56" fill="#e0d5bc" filter="url(#blurS)"/><circle cx="930" cy="14" r="64" fill="#e0d5bc" filter="url(#blurS)"/><circle cx="840" cy="6" r="46" fill="#e0d5bc" filter="url(#blurS)"/><circle cx="990" cy="40" r="50" fill="#e0d5bc" filter="url(#blurS)"/></g>');

    o.push('</svg>');
    return o.join('');
  }

  var heroCaps = [
    '1869–1871. The Commercial School, designed by Mikhail Makarov.',
    '16 February 2019. Roof and floors of an inner block come down. Everyone is evacuated.',
    'Today. Restoration talks and court appeals. Nothing is settled.',
    'After. The street facade stays. Everything behind it is new, and safe.'
  ];

  var heroArt = $('#heroArt');
  heroArt.innerHTML = buildHero();
  var heroSvg = $('#heroSvg');
  var scrubBtns = $$('#scrub button');
  var heroCap = $('#heroCap');
  var heroTimer = null;

  function setHero(n) {
    heroSvg.setAttribute('data-s', String(n));
    scrubBtns.forEach(function (b) { b.classList.toggle('on', parseInt(b.getAttribute('data-s'), 10) === n); });
    heroCap.textContent = heroCaps[n];
    heroArt.setAttribute('data-s', String(n));
  }
  function stopHero() { if (heroTimer) { clearInterval(heroTimer); heroTimer = null; } }
  function playHero() {
    stopHero();
    var n = 0;
    setHero(0);
    if (reduce) return;
    heroTimer = setInterval(function () {
      n++;
      if (n > 3) { stopHero(); return; }
      setHero(n);
    }, 2800);
  }
  scrubBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      stopHero();
      setHero(parseInt(b.getAttribute('data-s'), 10));
    });
  });
  $('#play').addEventListener('click', playHero);
  setHero(0);
  if ('IntersectionObserver' in window) {
    var hio = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { setTimeout(playHero, 600); hio.disconnect(); }
    }, { threshold: 0.45 });
    hio.observe(heroArt);
  }

  function slabD(x1, x2, y, t, s) {
    var m = (x1 + x2) / 2;
    return 'M' + x1 + ' ' + y + ' Q' + m + ' ' + (y + 2 * s) + ' ' + x2 + ' ' + y + ' L' + x2 + ' ' + (y + t) + ' Q' + m + ' ' + (y + t + 2 * s) + ' ' + x1 + ' ' + (y + t) + ' Z';
  }

  function addMarkers(stage, list, cb, aspectW, aspectH) {
    list.forEach(function (m) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'hs ' + (m.side || '');
      b.style.left = (m.x) + '%';
      b.style.top = (m.y) + '%';
      b.setAttribute('aria-label', m.t);
      b.setAttribute('data-x', m.x);
      b.setAttribute('data-side', m.side || '');
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        $$('.hs', stage).forEach(function (o) { o.classList.remove('active'); });
        b.classList.add('active');
        cb(m);
      });
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      stage.appendChild(b);
    });
  }

  function Panel(kind, stage, statusEl, capEl) {
    var old = kind === 'old';
    var SAG = old ? 21 : 1.3;
    var K = [1.15, 1, 0.8];
    var Y = [290, 200, 110];
    var th = old ? 13 : 15;
    var o = [];
    o.push('<svg viewBox="0 0 600 440" role="img" aria-label="' + (old ? 'Cross-section of the existing timber-floored interior' : 'Cross-section of the new interior behind the retained facade') + '">');
    o.push(R(0, 0, 600, 440, old ? '#2b2823' : '#252d30', ''));
    o.push(R(0, 380, 600, 60, old ? '#4a4034' : '#3a423f', '') + '<path d="M0 380H600" stroke="#8a826f" stroke-width="2"/>');
    for (var hx = -40; hx < 600; hx += 26) o.push('<path d="M' + hx + ' 440L' + (hx + 40) + ' 384" stroke="rgba(255,255,255,.07)" stroke-width="1.4"/>');
    o.push(R(40, 56, 40, 326, 'url(#brickP)', STK));
    o.push(R(520, 56, 40, 326, 'url(#brickP)', STK));
    o.push(R(34, 50, 52, 8, ST, STK) + R(514, 50, 52, 8, ST, STK));
    if (old) {
      o.push(R(292, 70, 16, 312, 'url(#brickP)', STK));
      o.push(P('M30 56L300 6L570 56Z', '#4e4a45', STK));
      o.push('<path d="M70 52L300 20L530 52M110 50L300 34L490 50M300 6V56" stroke="#8a6a41" stroke-width="3" fill="none"/>');
      o.push('<path d="M300 56L300 110" stroke="#8a6a41" stroke-width="3"/>');
    } else {
      o.push(P('M30 56L300 6L570 56Z', '#4e4a45', STK));
      o.push('<path d="M70 52L300 20L530 52M110 50L300 34L490 50M300 6V56" stroke="#8fb0c0" stroke-width="3" fill="none"/>');
      o.push(R(293, 62, 14, 320, 'url(#concP)', STK));
      o.push(R(179, 62, 14, 320, 'url(#concP)', STK));
      o.push(R(407, 62, 14, 320, 'url(#concP)', STK));
      o.push(R(448, 62, 56, 320, 'url(#glassG)', STK));
      o.push(R(458, 190, 36, 56, '#173a63', STK) + '<path d="M476 62V190" stroke="#173a63" stroke-width="2" stroke-dasharray="4 4"/>');
      o.push('<path d="M92 380L168 300M92 290L168 210M92 200L168 120" stroke="#8fb0c0" stroke-width="5" stroke-dasharray="3 7" fill="none"/>');
    }
    o.push(R(80, 372, 440, 10, old ? '#7a6b55' : 'url(#concP)', STK));
    var slabs = '';
    for (var i = 0; i < 3; i++) {
      slabs += '<g class="slab" id="' + kind + 'S' + i + '"><path class="sp" d="" fill="' + (old ? 'url(#woodP)' : 'url(#concP)') + '"' + STK + '/><g class="ppl"></g>' +
        (old ? '' : '<rect x="80" y="' + (Y[i] + 2) + '" width="12" height="9" fill="#2a2d33"/><rect x="508" y="' + (Y[i] + 2) + '" width="12" height="9" fill="#2a2d33"/>') + '</g>';
    }
    o.push('<g id="' + kind + 'G0" class="ppl0"></g>');
    o.push(slabs);
    if (old) {
      o.push('<g id="oldCracks" fill="none" stroke="#ff5a3c" stroke-width="2.6" stroke-linejoin="round">' +
        '<path data-t=".25" d="M186 296L190 306L184 316L189 326"/>' +
        '<path data-t=".4" d="M410 206L414 216L408 226L412 234"/>' +
        '<path data-t=".3" d="M46 140L54 156L47 172L57 188L50 204"/>' +
        '<path data-t=".5" d="M298 150L302 170L296 190L301 212"/>' +
        '<path data-t=".55" d="M552 250L546 268L554 286"/>' +
        '<path data-t=".7" d="M240 118L246 128L238 138"/></g>');
      o.push('<g id="oldDebris" class="debris">' +
        P('M84 380L110 356L132 370L160 346L196 368L226 350L262 372L290 380Z', '#7a6b55', STK) +
        P('M310 380L340 354L372 372L402 348L440 370L476 356L516 380Z', '#6b5d4a', STK) +
        R(130, 360, 30, 12, 'url(#woodP)', ' transform="rotate(-18 145 366)"') + R(380, 356, 36, 12, 'url(#woodP)', ' transform="rotate(14 398 362)"') +
        '</g>');
      o.push('<g id="oldDust" class="dustS">' +
        '<circle cx="200" cy="340" r="64" fill="#cfc2a6" filter="url(#blurS)"/><circle cx="330" cy="310" r="80" fill="#cfc2a6" filter="url(#blurS)"/><circle cx="450" cy="340" r="64" fill="#cfc2a6" filter="url(#blurS)"/><circle cx="300" cy="240" r="70" fill="#cfc2a6" filter="url(#blurS)"/></g>');
    }
    o.push('</svg>');
    stage.innerHTML = o.join('');

    var slabEls = [0, 1, 2].map(function (i) { return $('#' + kind + 'S' + i); });
    var g0 = $('#' + kind + 'G0');
    var cracks = old ? $$('#oldCracks path') : [];
    var failed = false;
    var last = 0;

    function crowd(x1, x2, ys, s, n, seed) {
      var out = '';
      for (var k = 0; k < n; k++) {
        var u = (k + 0.5) / n;
        var x = x1 + 14 + u * (x2 - x1 - 28);
        var uu = (x - x1) / (x2 - x1);
        var y = ys + 4 * s * uu * (1 - uu);
        out += person(x.toFixed(1), y.toFixed(1), PEOPLE[(k + seed) % 5], false);
      }
      return out;
    }

    function status(L) {
      var t = 'Holding';
      var c = 'ok';
      if (old) {
        if (failed) { t = 'Failed'; c = 'bad blink'; }
        else if (L > 0.7) { t = 'Cracking'; c = 'bad'; }
        else if (L > 0.35) { t = 'Creaking'; c = 'warn'; }
      }
      statusEl.textContent = t;
      statusEl.className = 'chip ' + c;
    }

    this.update = function (L) {
      last = L;
      var n = Math.round(L * 4) + (L > 0 ? 1 : 0);
      slabEls.forEach(function (g, i) {
        var s = SAG * Math.pow(L, 1.5) * K[i];
        var d = slabD(80, old ? 292 : 292, Y[i], th, s) + ' ' + slabD(308, 520, Y[i], th, s);
        $('.sp', g).setAttribute('d', d);
        $('.ppl', g).innerHTML = crowd(80, 292, Y[i], s, n, i) + crowd(308, 520, Y[i], s, n, i + 2);
      });
      g0.innerHTML = crowd(80, 292, 380, 0, n, 4) + crowd(308, 520, 380, 0, n, 1);
      cracks.forEach(function (c) {
        var t = parseFloat(c.getAttribute('data-t'));
        c.style.opacity = Math.max(0, Math.min(1, (L - t) / 0.15));
      });
      stage.classList.toggle('tremble', old && !failed && L > 0.55);
      status(L);
    };

    this.fail = function () {
      if (!old || failed) return;
      failed = true;
      var dy = [74, 152, 230];
      var rot = [-4, 3, -6];
      slabEls.forEach(function (g, i) {
        var idx = 2 - i;
        g.style.transitionDelay = (idx * 0.18) + 's';
        g.style.transform = 'translate(0px,' + dy[i] + 'px) rotate(' + rot[i] + 'deg)';
        $('.ppl', g).style.opacity = 0;
      });
      g0.style.opacity = 0;
      stage.classList.remove('tremble');
      stage.classList.add('boom', 'failed');
      setTimeout(function () { stage.classList.remove('boom'); }, 900);
      status(last);
    };

    this.reset = function () {
      failed = false;
      slabEls.forEach(function (g) {
        g.style.transitionDelay = '0s';
        g.style.transform = '';
        $('.ppl', g).style.opacity = 1;
      });
      g0.style.opacity = 1;
      stage.classList.remove('boom', 'failed', 'tremble');
      this.update(0);
    };

    this.isFailed = function () { return failed; };

    this.update(0);
  }

  var oldStage = $('#oldStage');
  var newStage = $('#newStage');
  var oldP = new Panel('old', oldStage, $('#oldStatus'), $('#oldCap'));
  var newP = new Panel('new', newStage, $('#newStatus'), $('#newCap'));

  addMarkers(oldStage, [
    { x: 31, y: 64, t: 'Timber floors', d: 'Aged wooden floors carry every student. This is the heart of our safety concern. Inspection reports are still to be verified.' },
    { x: 50, y: 40, t: 'Bearing wall', d: 'Original load-bearing masonry. Option A keeps it. Whether it can be made safe is the open question.' },
    { x: 50, y: 7, t: 'Roof', d: 'In 2019 the roof and floors of an inner block collapsed. Everyone was evacuated.' }
  ], function (m) { $('#oldCap').innerHTML = '<b>' + m.t + '.</b> ' + m.d; });
  addMarkers(newStage, [
    { x: 31, y: 64, t: 'Concrete slabs', d: 'Rigid slabs stay flat under the same load.' },
    { x: 50, y: 40, t: 'New frame', d: 'A new frame carries the floors, so the old walls no longer have to. Our proposal, to be verified.' },
    { x: 13, y: 52, t: 'Facade ties', d: 'The retained facade is tied back to the new frame. Facade-retention calculations are still to be verified.' },
    { x: 82, y: 56, t: 'Elevator', d: 'Elevator and an accessible route to every floor.' }
  ], function (m) { $('#newCap').innerHTML = '<b>' + m.t + '.</b> ' + m.d; });

  var load = $('#load');
  var loadOut = $('#loadOut');
  var loadAnim = null;
  function setLoad(v) {
    load.value = String(Math.round(v));
    loadOut.textContent = Math.round(v) + '%';
    load.style.setProperty('--p', Math.round(v) + '%');
    oldP.update(v / 100);
    newP.update(v / 100);
    if (v >= 100) oldP.fail();
  }
  load.addEventListener('input', function () {
    if (loadAnim) cancelAnimationFrame(loadAnim);
    var v = parseFloat(load.value);
    if (oldP.isFailed() && v < 100) {
      oldP.reset();
    }
    setLoad(v);
  });
  $('#over').addEventListener('click', function () {
    if (loadAnim) cancelAnimationFrame(loadAnim);
    if (oldP.isFailed()) { oldP.reset(); setLoad(0); }
    var from = parseFloat(load.value);
    var t0 = null;
    var dur = reduce ? 1 : 2600 * ((100 - from) / 100) + 400;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      setLoad(from + (100 - from) * p);
      if (p < 1) loadAnim = requestAnimationFrame(step);
    }
    loadAnim = requestAnimationFrame(step);
  });
  $('#loadReset').addEventListener('click', function () {
    if (loadAnim) cancelAnimationFrame(loadAnim);
    oldP.reset();
    setLoad(0);
  });

  function brickWall(x, y, w, h) { return R(x, y, w, h, 'url(#brickP)', STK); }

  function wipeToday() {
    var o = [];
    o.push('<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Cross-section of the complex today">');
    o.push(R(0, 0, 1000, 560, '#d3c9b2', ''));
    o.push(R(0, 470, 1000, 90, '#6b5d4a', '') + R(0, 470, 50, 10, 'url(#paveP)', '') + R(590, 470, 140, 10, 'url(#paveP)', ''));
    o.push(brickWall(50, 100, 46, 370));
    o.push(R(40, 90, 66, 10, ST, STK) + R(40, 100, 66, 6, 'url(#dentP)', STK));
    [404, 300, 200].forEach(function (y, i) {
      var h = i === 0 ? 66 : 58;
      o.push(R(50, y, 46, h, '#9d927a', '') + R(50, y, 46, h, '#1a2026', ' opacity=".5"') + '<path d="M73 ' + y + 'V' + (y + h) + 'M50 ' + (y + h * 0.4) + 'H96" stroke="#e6dcc4" stroke-width="3"/>');
    });
    o.push(brickWall(570, 126, 20, 344));
    o.push(brickWall(330, 140, 16, 330));
    o.push(P('M84 124L340 54L600 124Z', '#4e4a45', STK));
    o.push('<path d="M120 118L340 70L560 118M340 54V124" stroke="#8a6a41" stroke-width="3" fill="none"/>');
    o.push(P('M440 92L520 106L566 122L460 122Z', 'url(#tarpP)', STK));
    [[372, 6], [274, 9], [176, 7]].forEach(function (a) {
      o.push(P(slabD(96, 330, a[0], 11, a[1]) + ' ' + slabD(346, 570, a[0], 11, a[1]), 'url(#woodP)', STK));
    });
    [[212, 390, 80], [458, 390, 80], [212, 292, 80], [458, 292, 80]].forEach(function (p) {
      o.push(R(p[0], p[1], 8, p[2], '#8a6a41', STK) + R(p[0] - 6, p[1] - 4, 20, 5, '#6b4f2f', STK));
    });
    o.push('<g fill="none" stroke="#c4351d" stroke-width="2.6" stroke-linejoin="round"><path d="M210 384L214 394L208 404"/><path d="M450 286L454 296L448 306L452 316"/><path d="M60 330L72 346L64 362L76 378"/><path d="M335 180L339 204L333 228L338 254L334 280"/><path d="M580 200L574 224L582 248"/><path d="M262 170L268 180L260 190"/></g>');

    o.push(P('M730 470V226L742 216L736 200L754 194V470Z', 'url(#brickP)', STK));
    o.push(brickWall(906, 100, 24, 370));
    [390, 310, 230, 150].forEach(function (y, i) {
      o.push(R(830, y, 76, 10, 'url(#woodP)', STK));
      if (i > 1) o.push(P('M830 ' + y + ' L' + (800 - i * 4) + ' ' + (y + 40 + i * 14) + ' L' + (806 - i * 4) + ' ' + (y + 52 + i * 14) + ' L830 ' + (y + 10) + ' Z', 'url(#woodP)', STK));
    });
    o.push(P('M756 470L772 438L796 452L820 420L850 446L870 470Z', '#8c7a62', STK));
    o.push(R(780, 448, 30, 10, 'url(#woodP)', ' transform="rotate(-20 795 453)"') + R(830, 440, 26, 9, 'url(#woodP)', ' transform="rotate(16 843 444)"'));
    o.push(P('M946 100L826 100L812 114L822 126L810 138L936 138Z', '#4e4a45', STK));
    o.push('<path d="M826 100L800 70L860 90" stroke="#8a6a41" stroke-width="4" fill="none"/>');
    o.push('<g fill="none" stroke="#c4351d" stroke-width="2.6" stroke-linejoin="round"><path d="M880 156L884 176L877 196L883 216"/><path d="M866 320L872 338L864 356"/></g>');

    o.push('<rect x="612" y="416" width="112" height="54" fill="url(#meshP)" opacity=".6"' + STK + '/>' + R(612, 410, 112, 7, 'url(#hazP)', STK));
    o.push(P('M668 352L692 396H644Z', '#f0b81c', STK) + '<text x="668" y="388" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="22" fill="#1c1916">!</text>');
    o.push('<g class="dustS"><circle cx="790" cy="350" r="70" fill="#e4dac4" opacity=".8" filter="url(#blurS)"/><circle cx="770" cy="290" r="54" fill="#e4dac4" opacity=".8" filter="url(#blurS)"/><circle cx="830" cy="250" r="48" fill="#e4dac4" opacity=".7" filter="url(#blurS)"/></g>');
    o.push('</svg>');
    return o.join('');
  }

  function wipeAfter() {
    var o = [];
    o.push('<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Cross-section of the complex after our proposal">');
    o.push(R(0, 0, 1000, 560, '#d9e6e7', '') + '<circle cx="880" cy="70" r="30" fill="#f6e7b4"/>');
    o.push(R(0, 470, 1000, 90, '#6b5d4a', '') + R(0, 470, 1000, 10, 'url(#paveP)', ''));
    o.push(brickWall(50, 100, 46, 370));
    o.push(R(40, 90, 66, 10, ST, STK) + R(40, 100, 66, 6, 'url(#dentP)', STK));
    [300, 200].forEach(function (y) {
      o.push(R(50, y, 46, 58, 'url(#glassG)', '') + '<path d="M73 ' + y + 'V' + (y + 58) + 'M50 ' + (y + 23) + 'H96" stroke="#e6dcc4" stroke-width="3"/>');
    });
    o.push(R(50, 404, 46, 66, '#5a4630', '') + '<path d="M73 404V470" stroke="#3a2c1c" stroke-width="2"/>' + R(56, 430, 8, 4, '#d3c7aa', '') + R(82, 430, 8, 4, '#d3c7aa', ''));
    o.push(P('M0 470V458L50 446V470Z', '#cbbfa4', STK) + '<path d="M0 424L50 412M0 424V458M25 418V452M50 412V446" stroke="#1e1b18" stroke-width="2.2" fill="none"/>');
    o.push(R(6, 392, 18, 18, '#173a63', '') + '<circle cx="13" cy="397" r="1.8" fill="#fff"/><path d="M13 399V404H17M10 402H15" stroke="#fff" stroke-width="1.4" fill="none"/>');

    o.push(brickWall(570, 126, 20, 344));
    var rooms = [[372, 470], [274, 372], [176, 274]];
    rooms.forEach(function (r, i) {
      o.push(R(110, r[0] + 12, 460, r[1] - r[0] - 12, '#f5e6b8', ' opacity=".55"'));
      for (var lx = 250; lx < 560; lx += 100) {
        if (lx > 420 && lx < 500) continue;
        o.push('<path d="M' + lx + ' ' + (r[0] + 12) + 'V' + (r[0] + 22) + '" stroke="#2a2118" stroke-width="1.4"/>' + R(lx - 10, r[0] + 22, 20, 4, '#fff4cc', ''));
        o.push(R(lx - 22, r[1] - 18, 44, 4, '#6a5a44', '') + R(lx - 20, r[1] - 14, 3, 14, '#6a5a44', '') + R(lx + 17, r[1] - 14, 3, 14, '#6a5a44', ''));
        o.push(R(lx - 10, r[1] - 32, 14, 11, '#173a63', ''));
        o.push(person(lx + 12, r[1] - 1, PEOPLE[(i + lx / 100) % 5 | 0], false));
      }
    });
    [372, 274, 176].forEach(function (y) {
      o.push(R(110, y, 460, 12, 'url(#concP)', STK));
      o.push(R(96, y + 2, 16, 8, '#2a2d33', '') + '<circle cx="103" cy="' + (y + 6) + '" r="1.6" fill="#8fb0c0"/>');
    });
    o.push(R(216, 128, 14, 342, 'url(#concP)', STK) + R(330, 128, 14, 342, 'url(#concP)', STK));
    o.push(R(500, 130, 56, 340, 'url(#glassG)', STK) + R(510, 290, 36, 62, '#173a63', STK) + '<path d="M528 130V290" stroke="#173a63" stroke-width="2" stroke-dasharray="4 4"/>');
    o.push('<path d="M118 468L196 384M118 370L196 286M118 272L196 188" stroke="#7a8a94" stroke-width="5" stroke-dasharray="3 7" fill="none"/>');
    o.push(P('M84 124L340 54L600 124Z', 'url(#glassG)', STK + ' opacity=".9"') + '<path d="M340 54V124M200 90V124M470 90V124M120 116L340 54L560 116" stroke="#4a5a63" stroke-width="1.6" fill="none"/>');

    o.push(P('M730 470V100H930V470Z', '#f5e6b8', ' opacity=".5"'));
    [390, 310, 230, 150].forEach(function (y, i) {
      o.push(R(754, y, 152, 10, 'url(#concP)', STK));
      o.push(R(780, y - 16, 40, 4, '#6a5a44', '') + R(784, y - 12, 3, 12, '#6a5a44', '') + R(814, y - 12, 3, 12, '#6a5a44', '') + R(790, y - 28, 14, 11, '#173a63', ''));
      o.push(person(850 + (i % 2) * 18, y - 1, PEOPLE[(i + 1) % 5], false) + person(880, y - 1, PEOPLE[(i + 3) % 5], false));
      o.push('<path d="M840 ' + (y - 80) + 'V' + (y - 70) + '" stroke="#2a2118" stroke-width="1.4"/>' + R(830, y - 70, 20, 4, '#fff4cc', ''));
    });
    o.push(R(730, 100, 24, 370, 'url(#glassG)', STK) + R(906, 100, 24, 370, 'url(#glassG)', STK));
    o.push('<path d="M730 190H754M730 280H754M730 370H754M906 190H930M906 280H930M906 370H930" stroke="#4a5a63" stroke-width="1.6"/>');
    o.push(R(724, 90, 212, 10, '#4e4a45', STK));

    [[640, 470], [690, 470]].forEach(function (t, i) {
      o.push(R(t[0] - 3, t[1] - 50, 6, 50, '#5a4630', '') + '<circle cx="' + t[0] + '" cy="' + (t[1] - 66) + '" r="26" fill="#5b8a4e"/><circle cx="' + (t[0] - 14) + '" cy="' + (t[1] - 52) + '" r="17" fill="#6c9d5c"/><circle cx="' + (t[0] + 15) + '" cy="' + (t[1] - 54) + '" r="16" fill="#4d7a42"/>');
    });
    o.push(R(608, 448, 36, 4, '#6a5a44', '') + R(612, 452, 3, 18, '#6a5a44', '') + R(637, 452, 3, 18, '#6a5a44', ''));
    o.push(person(668, 470, PEOPLE[2], false) + person(712, 470, PEOPLE[0], false) + person(30, 470, PEOPLE[3], false));
    o.push('<path d="M714 470V396" stroke="#1e1b18" stroke-width="4"/><rect x="709" y="388" width="10" height="14" fill="#f6dc92"/>');
    o.push('</svg>');
    return o.join('');
  }

  var wipe = $('#wipe');
  $('#wipeA').innerHTML = wipeToday();
  $('#wipeB').innerHTML = wipeAfter();
  var wr = $('#wr');
  var wpos = 50;
  var wanim = null;

  var wmarkers = [
    { x: 28, y: 64, side: 'a', t: 'Sagging floors', d: 'Timber floors, propped and cracked.' },
    { x: 80, y: 47, side: 'a', t: 'The 2019 void', d: 'The roof and floors of an inner block came down. Everyone was evacuated.' },
    { x: 69, y: 76, side: 'a', t: 'The standoff', d: 'Restoration talks and court appeals. Nothing built, nothing settled.' },
    { x: 9, y: 50, side: 'both', t: 'The street facade', d: 'The part everyone wants to keep. In our proposal it stays.' },
    { x: 33, y: 55, side: 'b', t: 'New frame', d: 'A new structure behind the facade. Safe to fill with people.' },
    { x: 53, y: 62, side: 'b', t: 'Elevator and stairs', d: 'Every floor reachable by everyone.' },
    { x: 35, y: 17, side: 'b', t: 'Glass roof', d: 'Daylight from above, a new roof over the old walls.' },
    { x: 84, y: 40, side: 'b', t: 'Rebuilt inner block', d: 'Where the void was, a full-height safe block again.' },
    { x: 66, y: 74, side: 'b', t: 'Courtyard', d: 'Open to the public. Trees, benches, a way through.' },
    { x: 2.4, y: 82, side: 'both', t: 'Accessible entrance', d: 'Ramp and level door. Budgeted at 12 000 000 ₽.' }
  ];
  addMarkers(wipe, wmarkers, function (m) {
    $('#wcT').textContent = m.t;
    $('#wcD').textContent = m.d;
  });
  var wHs = $$('.hs', wipe);

  function setWipe(p) {
    wpos = Math.max(0, Math.min(100, p));
    wipe.style.setProperty('--pos', wpos + '%');
    wr.value = String(Math.round(wpos));
    wHs.forEach(function (h) {
      var side = h.getAttribute('data-side');
      var x = parseFloat(h.getAttribute('data-x'));
      var off = (side === 'a' && x > wpos - 1) || (side === 'b' && x < wpos + 1);
      h.classList.toggle('off', off);
      h.tabIndex = off ? -1 : 0;
    });
  }
  var wdrag = false;
  function wfrom(e) {
    var r = wipe.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 100;
  }
  wipe.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.hs')) return;
    wdrag = true;
    if (wanim) cancelAnimationFrame(wanim);
    try { wipe.setPointerCapture(e.pointerId); } catch (err) {}
    setWipe(wfrom(e));
  });
  wipe.addEventListener('pointermove', function (e) { if (wdrag) setWipe(wfrom(e)); });
  wipe.addEventListener('pointerup', function () { wdrag = false; });
  wipe.addEventListener('pointercancel', function () { wdrag = false; });
  wr.addEventListener('input', function () {
    if (wanim) cancelAnimationFrame(wanim);
    setWipe(parseFloat(wr.value));
  });
  setWipe(50);
  if ('IntersectionObserver' in window && !reduce) {
    var wio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      wio.disconnect();
      var t0 = null;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = (t - t0) / 2600;
        if (p >= 1) { setWipe(50); return; }
        setWipe(50 + Math.sin(p * Math.PI * 2) * 36 * (1 - p));
        wanim = requestAnimationFrame(step);
      }
      wanim = requestAnimationFrame(step);
    }, { threshold: 0.5 });
    wio.observe(wipe);
  }

  function buildBalance() {
    var o = [];
    o.push('<svg viewBox="0 0 700 380" role="img" aria-label="A balance with the historic facade on one side and a hard hat on the other">');
    o.push(R(0, 356, 700, 24, '#c7b99a', '') + '<path d="M0 356H700" stroke="#2a2118" stroke-width="2"/>');
    o.push(P('M310 356L390 356L364 118L336 118Z', '#2a2118', ''));
    o.push(R(290, 344, 120, 14, '#2a2118', ''));
    o.push('<g id="beam" style="transform-origin:350px 110px"><rect x="86" y="103" width="528" height="14" fill="#2a2118"/><circle cx="86" cy="110" r="7" fill="#2a2118"/><circle cx="614" cy="110" r="7" fill="#2a2118"/></g>');
    o.push('<circle cx="350" cy="110" r="14" fill="#f0b81c" stroke="#2a2118" stroke-width="3"/>');

    var fac = R(-58, 22, 116, 78, 'url(#brickP)', STK) + R(-64, 16, 128, 8, ST, STK) + R(-64, 24, 128, 5, 'url(#dentP)', '') + P('M-30 16L0 -2L30 16Z', ST, STK);
    [-38, -10, 18].forEach(function (x) {
      fac += P('M' + x + ' 54 V44 A10 10 0 0 1 ' + (x + 20) + ' 44 V54 Z', '#46606f', STK) + P('M' + x + ' 92 V80 A10 10 0 0 1 ' + (x + 20) + ' 80 V92 Z', '#46606f', STK);
    });
    var hat = P('M-38 100Q-38 40 0 40Q38 40 38 100Z', '#f0b81c', STK) + R(-48, 96, 96, 8, '#e0a600', STK) + R(-5, 40, 10, 58, '#f6cf55', '') + person(-60, 100, '#2a2118', false) + person(60, 100, '#1d3a63', false);
    var pan = function (id, inner) {
      return '<g id="' + id + '" class="pan"><path d="M0 0L-76 104M0 0L76 104" stroke="#2a2118" stroke-width="1.6" fill="none"/><circle cx="0" cy="0" r="5" fill="#2a2118"/>' +
        '<g transform="translate(0 0)">' + inner + '</g>' +
        P('M-84 104H84Q74 134 0 138Q-74 134 -84 104Z', '#c7b99a', ' stroke="#2a2118" stroke-width="2"') + '</g>';
    };
    o.push(pan('panL', fac));
    o.push(pan('panR', hat));
    o.push('</svg>');
    return o.join('');
  }

  var balArt = $('#balArt');
  balArt.innerHTML = buildBalance();
  var bal = $('#bal');
  var balOut = $('#balOut');
  var beam = $('#beam');
  var panL = $('#panL');
  var panR = $('#panR');
  var balTexts = [
    [-60, 'Heritage first. Keep every original wall and live with the structural doubt.'],
    [-20, 'Leaning towards heritage.'],
    [20, 'Torn. That is the whole debate.'],
    [60, 'Leaning towards safety.'],
    [101, 'Safety first. Replace the unsafe interior and keep the street facade.']
  ];
  function setBal(v, save) {
    var a = v / 100 * 9;
    var rad = a * Math.PI / 180;
    var L = 264;
    beam.style.transform = 'rotate(' + a + 'deg)';
    panR.style.transform = 'translate(' + (350 + L * Math.cos(rad)) + 'px,' + (110 + L * Math.sin(rad)) + 'px)';
    panL.style.transform = 'translate(' + (350 - L * Math.cos(rad)) + 'px,' + (110 - L * Math.sin(rad)) + 'px)';
    var t = balTexts.filter(function (b) { return v < b[0]; })[0][1];
    balOut.textContent = t;
    if (save) store.set('ls-bal', v);
  }
  var savedBal = store.get('ls-bal', null);
  if (savedBal !== null) bal.value = String(savedBal);
  setBal(parseFloat(bal.value), false);
  bal.addEventListener('input', function () { setBal(parseFloat(bal.value), true); });

  var moves = $$('.move');
  moves.forEach(function (m) {
    var head = $('.move-h', m);
    head.addEventListener('click', function () {
      var open = m.classList.toggle('open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  moves[0].classList.add('open');

  $$('.fl').forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      $$('.fl').forEach(function (o) { o.classList.toggle('on', o === c); });
      moves.forEach(function (m) {
        m.classList.toggle('hide', f !== 'all' && m.getAttribute('data-basis') !== f);
      });
    });
  });

  var reviews = store.get('ls-review', {});
  function renderReviews() {
    var agree = 0;
    var chal = 0;
    moves.forEach(function (m) {
      var i = m.getAttribute('data-i');
      var r = reviews[i];
      var ta = $('textarea', m);
      m.classList.remove('agree', 'challenge');
      $$('.rev-btns button', m).forEach(function (b) {
        b.classList.toggle('on', !!r && b.getAttribute('data-s') === r.stance);
      });
      if (r) {
        m.classList.add(r.stance);
        ta.classList.add('show');
        if (doc.activeElement !== ta) ta.value = r.note || '';
        if (r.stance === 'agree') agree++; else chal++;
      } else {
        ta.classList.remove('show');
        ta.value = '';
      }
    });
    $('#revSum').textContent = (!agree && !chal) ? 'No moves reviewed yet.' : 'Agreed with ' + agree + ', challenged ' + chal + ' of 6.';
  }
  moves.forEach(function (m) {
    var i = m.getAttribute('data-i');
    $$('.rev-btns button', m).forEach(function (b) {
      b.addEventListener('click', function () {
        var s = b.getAttribute('data-s');
        var cur = reviews[i];
        if (cur && cur.stance === s) delete reviews[i];
        else reviews[i] = { stance: s, note: cur ? cur.note : '' };
        store.set('ls-review', reviews);
        renderReviews();
        if (reviews[i]) $('textarea', m).focus();
      });
    });
    $('textarea', m).addEventListener('input', function (e) {
      if (reviews[i]) { reviews[i].note = e.target.value; store.set('ls-review', reviews); }
    });
  });
  renderReviews();

  $('#dl').addEventListener('click', function () {
    var qs = $$('.move .q').map(function (q) { return q.textContent; });
    var lines = ['Lomonosova Sucks · my notes', ''];
    var bv = parseFloat(bal.value);
    lines.push('Beam position: ' + (bv === 0 ? 'undecided' : bv < 0 ? 'heritage ' + Math.abs(bv) + '%' : 'safety ' + bv + '%'));
    lines.push('');
    moves.forEach(function (m, idx) {
      var r = reviews[m.getAttribute('data-i')];
      lines.push((idx + 1) + '. ' + qs[idx]);
      lines.push('   ' + (r ? r.stance.toUpperCase() : 'no stance'));
      if (r && r.note) lines.push('   ' + r.note);
      lines.push('');
    });
    var blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = doc.createElement('a');
    a.href = url;
    a.download = 'lomonosova-my-notes.txt';
    doc.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  });
  $('#reset').addEventListener('click', function () {
    reviews = {};
    store.del('ls-review');
    store.del('ls-bal');
    bal.value = '0';
    setBal(0, false);
    renderReviews();
  });

  var items = [
    { name: 'Survey / due diligence', qty: 1, unit: 'service', rate: 1500000, color: '#f4efe0', src: 'Independent structural and KGIOP heritage survey (Oct 2026)' },
    { name: 'Construction / adaptation', qty: 1, unit: 'package', rate: 180000000, color: '#e8b53f', src: 'Internal demolition, facade retention, and new structure (Oct 2026)' },
    { name: 'Accessibility and public space', qty: 1, unit: 'package', rate: 12000000, color: '#9fc4d6', src: 'Safe entrances, elevators, and courtyard access (Oct 2026)' },
    { name: 'Website and consultation', qty: 1, unit: 'package', rate: 600000, color: '#d97a5f', src: 'Public website, student polls, and expert hearings (Oct 2026)' }
  ];
  var OPS = 15000000;
  var FUND = 250000000;
  var base = items.reduce(function (s, i) { return s + i.qty * i.rate; }, 0);

  $('#rows').innerHTML = items.map(function (i) {
    return '<tr><td><b><i style="background:' + i.color + '"></i>' + i.name + '</b><small>Assumption · ' + i.src + '</small></td><td>' + i.qty + ' ' + i.unit + '</td><td>' + fmt(i.rate) + '</td><td>' + fmt(i.qty * i.rate) + '</td></tr>';
  }).join('');

  var cont = $('#cont');
  var stack = $('#stack');
  var legend = $('#stackLegend');
  var shown = 0;
  var tween = null;
  function tweenTot(target) {
    if (tween) cancelAnimationFrame(tween);
    var from = shown;
    if (reduce) { shown = target; $('#bigTot').textContent = fmt(target); return; }
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / 450, 1);
      shown = from + (target - from) * (1 - Math.pow(1 - p, 3));
      $('#bigTot').textContent = fmt(shown);
      if (p < 1) tween = requestAnimationFrame(step);
    }
    tween = requestAnimationFrame(step);
  }

  function renderBudget() {
    var pct = parseFloat(cont.value);
    var c = base * pct / 100;
    var tot = base + c + OPS;
    var gap = Math.max(0, tot - FUND);
    var head = FUND - tot;
    $('#sBase').textContent = fmt(base);
    $('#sCont').textContent = fmt(c);
    $('#cPct').textContent = pct + '%';
    $('#cOut').textContent = pct + '%';
    $('#sOps').textContent = fmt(OPS);
    $('#sTot').textContent = fmt(tot);
    $('#sFund').textContent = fmt(FUND);
    $('#sGap').textContent = fmt(gap);
    $('#gapRow').classList.toggle('bad', gap > 0);
    var maxPct = Math.floor(((FUND - OPS - base) / base) * 1000) / 10;
    $('#cNote').textContent = gap > 0
      ? 'Over by ' + fmt(gap) + '.'
      : 'Headroom ' + fmt(head) + '. Funding holds up to ' + maxPct.toFixed(1) + '%.';
    tweenTot(tot);

    var parts = items.map(function (i) { return { name: i.name, v: i.qty * i.rate, color: i.color }; });
    parts.push({ name: 'Contingency', v: c, color: '#ff7b5c' });
    parts.push({ name: 'First-year operation', v: OPS, color: '#b7d49a' });
    if (!stack.children.length) {
      stack.innerHTML = parts.map(function () { return '<i></i>'; }).join('');
      legend.innerHTML = parts.map(function (p) {
        return '<span><i style="background:' + p.color + '"></i>' + p.name + '</span>';
      }).join('');
    }
    parts.forEach(function (p, idx) {
      var e = stack.children[idx];
      e.style.background = p.color;
      e.title = p.name + ': ' + fmt(p.v);
      e.style.width = (p.v / tot * 100) + '%';
    });
    var scale = Math.max(tot, FUND);
    var meter = $('#meter');
    meter.style.width = (tot / scale * 100) + '%';
    meter.classList.toggle('bad', gap > 0);
    $('#meterMark').style.left = (FUND / scale * 100) + '%';
    $('#meterCap').textContent = 'Requirement against ' + fmt(FUND) + ' funding';
  }
  cont.addEventListener('input', renderBudget);
  renderBudget();
}());
