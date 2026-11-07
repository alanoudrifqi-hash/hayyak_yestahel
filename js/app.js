/* =====================================================================
   حيّك يستاهل — app.js
   التنقل بين الشاشات، الحركات، السلايدر، مؤقت الخمول، ولوحة المتطوع.
   المحتوى كله (صور، مشاكل، حلول، توقيتات) في js/data.js
   ===================================================================== */
(() => {
  'use strict';

  const DATA = self.HAYYAK;
  const T = DATA.timing;
  const SCREENS = ['welcome', 'choose', 'analyze', 'solutions', 'compare', 'end'];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- الحالة العامة ---------- */
  const state = {
    screen: 'welcome',
    place: null,   // المكان المختار
    idx: 0,        // رقم الحل المختار (0 أو 1)
    locked: false  // يمنع اللمس المزدوج أثناء الانتقال
  };

  /* =====================================================================
     الأيقونات (SVG خطية مضمّنة)
     ===================================================================== */
  const ICONS = {
    pin:     '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    scan:    '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M4 12h16"/>',
    spark:   '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    drag:    '<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>',
    image:   '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-9 9"/>',
    erosion: '<path d="M3 20h18"/><path d="M3 20l7-11 4 5 3-3 4 9"/><path d="M7 3.5v2M11 2.5v2M15 3.5v2"/>',
    view:    '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
    sun:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    night:   '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    walk:    '<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6-2.5-2.5L11 8l3 2.5 3 .5"/><path d="M14 21l-1.5-5M9.5 12.5L7 14"/>',
    wall:    '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/>',
    land:    '<path d="M3 18c3-2 6-2 9 0s6 2 9 0"/><path d="M12 15V8"/><path d="M12 8c0-2.5 2-4 4.5-4 0 2.5-2 4-4.5 4zM12 10.5c0-2-1.6-3.5-3.8-3.5 0 2 1.6 3.5 3.8 3.5z"/>',
    gather:  '<circle cx="6.5" cy="9" r="2.2"/><circle cx="17.5" cy="9" r="2.2"/><circle cx="12" cy="6.5" r="2.2"/><path d="M2.5 19c0-3 1.8-5 4-5s4 2 4 5M13.5 19c0-3 1.8-5 4-5s4 2 4 5"/>',
    steps:   '<path d="M3 20h5v-4h5v-4h5V8h3"/>',
    bench:   '<path d="M4 10h16M4 14h16M6 14v5M18 14v5M6 10V7M18 10V7"/>',
    tree:    '<path d="M12 21v-6"/><path d="M12 3c3.3 0 6 2.6 6 5.8 0 3.3-2.7 6.2-6 6.2s-6-2.9-6-6.2C6 5.6 8.7 3 12 3z"/><path d="M8 21h8"/>',
    path:    '<path d="M8 3L5 21M16 3l3 18M12 4v2M12 10v3M12 17v3"/>',
    flower:  '<circle cx="12" cy="9" r="2.2"/><path d="M12 6.8c0-2.2 1-3.8 2.6-3.8 1.4 0 2.2 1.2 1.8 2.6M14.2 9c2.2 0 3.8 1 3.8 2.6 0 1.4-1.2 2.2-2.6 1.8M12 11.2c0 2.2-1 3.8-2.6 3.8-1.4 0-2.2-1.2-1.8-2.6M9.8 9C7.6 9 6 8 6 6.4 6 5 7.2 4.2 8.6 4.6"/><path d="M12 11.2V21M12 17c-2-.3-3.5-1.4-4-3M12 18.5c1.8-.2 3.2-1.2 3.8-2.8"/>',
    drop:    '<path d="M12 3s-6 6.6-6 11a6 6 0 0 0 12 0c0-4.4-6-11-6-11z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
    paint:   '<path d="M4 4h12v5H4z"/><path d="M16 6.5h3v5l-7 1.5v3"/><rect x="10.5" y="16" width="3" height="5" rx="1"/>',
    crossing:'<path d="M3 20h18M3 4h18"/><path d="M6 8v8M10 8v8M14 8v8M18 8v8"/>'
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.spark}</svg>`;

  /* =====================================================================
     مؤقتات خاصة بكل شاشة — تنلغي تلقائياً عند الانتقال
     ===================================================================== */
  const timers = new Set();
  let token = 0; // يتغير مع كل انتقال؛ الحركات القديمة توقف نفسها

  function later(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
    return id;
  }
  function clearScreenTimers() {
    timers.forEach(clearTimeout);
    timers.clear();
  }

  /* =====================================================================
     الصور: تحميل مسبق + معرفة الناقص منها
     ===================================================================== */
  const probes = new Map();
  function probe(src) {
    if (!src) return Promise.resolve({ ok: false });
    if (!probes.has(src)) {
      probes.set(src, new Promise((resolve) => {
        const im = new Image();
        im.onload = () => resolve({ ok: true, w: im.naturalWidth || 4, h: im.naturalHeight || 3 });
        im.onerror = () => resolve({ ok: false });
        im.src = src;
      }));
    }
    return probes.get(src);
  }

  function preloadAll() {
    probe(DATA.brand.wordmark);
    probe(DATA.brand.emblem);
    DATA.places.forEach((p) => {
      probe(p.image);
      p.problems.forEach((pr) => probe(pr.after));
    });
  }

  /* بطاقة «الصورة قيد التجهيز» */
  function pendingEl(over) {
    const d = document.createElement('div');
    d.className = 'pending' + (over ? ' pending--over' : '');
    d.innerHTML = `${icon('image')}<span>الصورة لسه تتجهّز</span>`;
    return d;
  }

  /* يحط صورة داخل إطار ويضبط نسبة أبعاده على أبعاد الصورة الحقيقية */
  async function fillFrame(frame, src) {
    const img = $('.frame__img', frame);
    frame.querySelectorAll(':scope > .pending').forEach((n) => n.remove());
    const info = await probe(src);
    if (info.ok) {
      img.src = src;
      img.hidden = false;
      frame.style.setProperty('--ar', (info.w / info.h).toFixed(4));
    } else {
      img.removeAttribute('src');
      img.hidden = true;
      frame.style.setProperty('--ar', '1.5');
      frame.prepend(pendingEl(false));
    }
    return info;
  }

  /* مربع رصد بالنسب المئوية من data.js */
  function makeBox(pr, i) {
    const b = document.createElement('div');
    const { x, y, w, h } = pr.box;
    b.className = 'box' + (y < 12 ? ' box--label-in' : '');
    b.dataset.idx = i;
    b.style.left = x + '%';
    b.style.top = y + '%';
    b.style.width = w + '%';
    b.style.height = h + '%';
    b.innerHTML = `<span class="box__label"><span class="en">0${i + 1}</span>${pr.tag || 'مشكلة'}</span>`;
    return b;
  }

  /* =====================================================================
     التنقل بين الشاشات
     ===================================================================== */
  const enter = {};

  function go(name) {
    if (name === state.screen) return;
    clearScreenTimers();
    token++;

    const from = $(`.screen[data-screen="${state.screen}"]`);
    const to = $(`.screen[data-screen="${name}"]`);

    from.classList.remove('is-active');
    from.classList.add('is-leaving');
    setTimeout(() => from.classList.remove('is-leaving'), 450);

    to.classList.remove('is-leaving');
    state.screen = name;
    state.locked = false;
    document.body.dataset.screen = name;

    if (enter[name]) enter[name]();
    requestAnimationFrame(() => to.classList.add('is-active'));

    updateProgress();
    resetIdle();
  }

  function updateProgress() {
    const step = SCREENS.indexOf(state.screen) - 1; // الشاشة 2 = النقطة الأولى
    $$('.progress__dot').forEach((d, i) => {
      d.classList.toggle('is-done', i < step);
      d.classList.toggle('is-current', i === step);
    });
  }

  /* =====================================================================
     [1] الترحيب
     ===================================================================== */
  enter.welcome = () => {
    state.place = null;
    state.idx = 0;
    playIntro();
  };

  /* ---------------------------------------------------------------------
     حركة ظهور الشعار النصي:
     نقرأ صورة الشعار مرة وحدة ونفصل كل «نقطة» من نقاط الرمز (الأجزاء
     المنفصلة يمين emblemFrom) عن النص. نرسم النقاط وحدة ورا الثانية
     ثم النص على canvas، وبعدها نرجع للصورة الأصلية كما هي (شفافية كاملة).
     --------------------------------------------------------------------- */
  const intro = { ready: null, run: 0 };

  function analyzeWordmark() {
    if (intro.ready) return intro.ready;
    intro.ready = new Promise((resolve) => {
      const im = new Image();
      im.onerror = () => resolve(null);
      im.onload = () => {
        try {
          const W = im.naturalWidth, H = im.naturalHeight;
          const c = document.createElement('canvas');
          c.width = W; c.height = H;
          const cx = c.getContext('2d');
          cx.drawImage(im, 0, 0);
          const px = cx.getImageData(0, 0, W, H).data; // يفشل من file:// ← بديل بسيط
          const split = Math.round(W * (DATA.brand.emblemFrom || 0.75));
          const lab = new Uint8Array(W * H);
          const stack = new Int32Array(W * H);
          const comps = [];

          // تجميع البكسلات المتصلة (كل نقطة من الرمز = جزء منفصل)
          for (let i = 0; i < W * H; i++) {
            if (lab[i] || px[i * 4 + 3] === 0) continue;
            const members = [];
            let sp = 0, minX = W, minY = H, maxX = 0, maxY = 0, sx = 0, sy = 0;
            stack[sp++] = i; lab[i] = 1;
            while (sp) {
              const p = stack[--sp];
              const x = p % W, y = (p - x) / W;
              members.push(p); sx += x; sy += y;
              if (x < minX) minX = x; if (x > maxX) maxX = x;
              if (y < minY) minY = y; if (y > maxY) maxY = y;
              const nb = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1];
              for (const q of nb) {
                if (q >= 0 && !lab[q] && px[q * 4 + 3] !== 0) { lab[q] = 1; stack[sp++] = q; }
              }
            }
            comps.push({ members, minX, minY, maxX, maxY, cx: sx / members.length, cy: sy / members.length });
          }

          // يرسم مجموعة بكسلات على canvas خاص فيها
          const layer = (list, x0, y0, w, h) => {
            const cv = document.createElement('canvas');
            cv.width = w; cv.height = h;
            const g = cv.getContext('2d');
            const out = g.createImageData(w, h);
            for (const m of list) {
              for (const p of m.members) {
                const x = p % W, y = (p - x) / W;
                const o = ((y - y0) * w + (x - x0)) * 4, s = p * 4;
                out.data[o] = px[s]; out.data[o + 1] = px[s + 1]; out.data[o + 2] = px[s + 2]; out.data[o + 3] = px[s + 3];
              }
            }
            g.putImageData(out, 0, 0);
            return cv;
          };

          const isDot = (m) => m.minX >= split && m.members.length > 40;
          const dots = comps.filter(isDot)
            .sort((a, b) => (a.cx - a.cy) - (b.cx - b.cy)) // من أسفل اليسار إلى أعلى اليمين
            .map((m) => ({
              ...m,
              canvas: layer([m], m.minX, m.minY, m.maxX - m.minX + 1, m.maxY - m.minY + 1)
            }));
          const text = layer(comps.filter((m) => !isDot(m)), 0, 0, W, H);
          resolve(dots.length ? { W, H, dots, text } : null);
        } catch (_) {
          resolve(null);
        }
      };
      im.src = DATA.brand.wordmark;
    });
    return intro.ready;
  }

  function playIntro() {
    const wrap = $('#heroLogo');
    if (!wrap) return;
    const cv = $('.hero-logo__canvas', wrap);
    const run = ++intro.run;
    wrap.classList.remove('is-fading');
    wrap.classList.add('is-animating'); // نخفي الصورة فوراً عشان ما تومض

    analyzeWordmark().then((P) => {
      if (run !== intro.run) return;
      const img = $('.hero-logo__img', wrap);
      if (!P || !img || !img.offsetWidth) {
        // بديل: ظهور هادئ للشعار كامل
        wrap.classList.remove('is-animating');
        void wrap.offsetWidth;
        wrap.classList.add('is-fading');
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(img.offsetWidth * dpr);
      cv.height = Math.round(img.offsetHeight * dpr);
      const ctx = cv.getContext('2d');
      const k = cv.width / P.W; // نفس النسبة بالضبط — بدون تمديد

      const START = 250, STEP = 150, DUR = 600, TEXT_DUR = 900;
      const textAt = START + (P.dots.length - 1) * STEP + DUR * 0.6;
      const total = textAt + TEXT_DUR;
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const backOut = (t) => { const s = 1.4; t -= 1; return t * t * ((s + 1) * t + s) + 1; };
      const t0 = performance.now();

      const frame = (now) => {
        if (run !== intro.run) return;
        if (state.screen !== 'welcome') { wrap.classList.remove('is-animating'); return; }
        const t = now - t0;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.setTransform(k, 0, 0, k, 0, 0);

        // نقاط الرمز: وحدة ورا الثانية (ظهور + تكبير متناسق من المركز)
        P.dots.forEach((d, i) => {
          const p = Math.min(1, Math.max(0, (t - START - i * STEP) / DUR));
          if (p <= 0) return;
          const s = 0.35 + 0.65 * backOut(p);
          ctx.globalAlpha = Math.min(1, p * 1.8);
          ctx.save();
          ctx.translate(d.cx, d.cy);
          ctx.scale(s, s);
          ctx.drawImage(d.canvas, d.minX - d.cx, d.minY - d.cy);
          ctx.restore();
        });

        // النص بعدها: ظهور هادئ مع انزلاق بسيط
        const q = Math.min(1, Math.max(0, (t - textAt) / TEXT_DUR));
        if (q > 0) {
          const e = easeOut(q);
          ctx.globalAlpha = e;
          ctx.drawImage(P.text, (1 - e) * 30, 0);
        }
        ctx.globalAlpha = 1;

        if (t < total) requestAnimationFrame(frame);
        else wrap.classList.remove('is-animating'); // يستقر: الصورة الأصلية بشفافية كاملة
      };
      requestAnimationFrame(frame);
    });
  }

  /* =====================================================================
     [2] اختيار الصورة
     ===================================================================== */
  function buildPlaces() {
    const wrap = $('#places');
    wrap.innerHTML = '';
    DATA.places.forEach((p, i) => {
      const card = document.createElement('button');
      card.className = 'place';
      card.innerHTML = `
        <img class="place__img" alt="">
        <span class="place__num en">${p.id}</span>
        <span class="place__meta">
          <span class="place__district">${p.district}</span>
          <span class="place__title">${p.title}</span>
        </span>`;
      const img = $('img', card);
      probe(p.image).then((r) => {
        if (r.ok) img.src = p.image;
        else { img.remove(); card.prepend(pendingEl(false)); }
      });
      card.addEventListener('click', () => pickPlace(i, card));
      wrap.appendChild(card);
    });
  }

  function pickPlace(i, card) {
    if (state.locked || state.screen !== 'choose') return;
    state.locked = true;
    card.classList.add('is-picked');
    $('#places').classList.add('has-pick');
    later(() => {
      state.place = DATA.places[i];
      go('analyze');
    }, T.pick);
  }

  enter.choose = () => {
    $('#places').classList.remove('has-pick');
    $$('.place').forEach((c) => c.classList.remove('is-picked'));
  };

  /* =====================================================================
     [3] الذكاء الاصطناعي يحلل الصورة
     ===================================================================== */
  const STATUSES = [
    'أقرأ تفاصيل الشارع...',
    'أدوّر على المشاكل...',
    'أفكر زي مخطط المدن...',
    'أجهّز الحلول...'
  ];

  function setStatus(text, instant) {
    const el = $('#statusText');
    if (instant) { el.textContent = text; el.classList.remove('is-swapping'); return; }
    el.classList.add('is-swapping');
    later(() => { el.textContent = text; el.classList.remove('is-swapping'); }, 300);
  }

  enter.analyze = () => {
    const p = state.place;
    const tok = token;
    const frame = $('#analyzeFrame');

    $('#analyzeTitle').textContent = `${p.title} · ${p.district}`;
    frame.classList.remove('is-scanning');
    $$('.box', frame).forEach((b) => b.remove());
    fillFrame(frame, p.image);
    const boxes = p.problems.map((pr, i) => frame.appendChild(makeBox(pr, i)));

    // نصوص الحالة
    const step = T.analysis / STATUSES.length;
    setStatus(STATUSES[0], true);
    STATUSES.forEach((s, i) => { if (i) later(() => setStatus(s), step * i); });

    // المسح + مربعات الرصد واحد ورا الثاني
    later(() => frame.classList.add('is-scanning'), 250);
    later(() => boxes[0] && boxes[0].classList.add('is-on'), step + 150);
    later(() => boxes[1] && boxes[1].classList.add('is-on'), step + 1150);

    // شريط التقدم
    const fill = $('#meterFill');
    fill.style.transition = 'none';
    fill.style.width = '0%';
    void fill.offsetWidth;
    fill.style.transition = `width ${T.analysis}ms linear`;
    fill.style.width = '100%';

    // قراءة إحداثيات متغيرة في الزاوية
    const hud = $('#hud');
    const t0 = performance.now();
    const tick = () => {
      if (tok !== token) return;
      const pct = Math.min(100, Math.round((performance.now() - t0) / T.analysis * 100));
      const rx = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      const ry = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      hud.textContent = `SCAN ${String(pct).padStart(3, '0')}%  ·  X ${rx}  Y ${ry}`;
      later(tick, 140);
    };
    tick();

    later(() => go('solutions'), T.analysis);
  };

  /* =====================================================================
     [4] المشاكل والحلول
     ===================================================================== */
  function typewrite(el, text, tok, done) {
    const chars = Array.from(text);
    const speed = Math.max(24, Math.min(48, 1600 / chars.length));
    let i = 0;
    el.textContent = '';
    el.classList.add('is-typing');
    const tick = () => {
      if (tok !== token) return;
      i++;
      el.textContent = chars.slice(0, i).join('');
      if (i < chars.length) later(tick, speed);
      else { el.classList.remove('is-typing'); if (done) done(); }
    };
    tick();
  }

  function linkCard(i) {
    $$('.sol-card').forEach((c) => c.classList.toggle('is-linked', +c.dataset.idx === i));
    $$('#thumbFrame .box').forEach((b) => {
      b.classList.toggle('is-linked', +b.dataset.idx === i);
      b.classList.toggle('is-dim', +b.dataset.idx !== i);
    });
  }

  enter.solutions = () => {
    const p = state.place;
    const tok = token;

    // الصورة الصغيرة مع مربعات الرصد
    const thumb = $('#thumbFrame');
    $$('.box', thumb).forEach((b) => b.remove());
    fillFrame(thumb, p.image);
    p.problems.forEach((pr, i) => {
      const b = makeBox(pr, i);
      b.classList.add('is-on');
      thumb.appendChild(b);
    });
    $('#thumbCaption').textContent = `${p.title} · ${p.district}`;

    // البطاقتين
    const cards = $$('.sol-card');
    cards.forEach((card, i) => {
      const pr = p.problems[i];
      card.classList.remove('is-in', 'is-linked');
      card.innerHTML = `
        <div class="sol-card__top">
          <span class="sol-card__icon">${icon(pr.icon)}</span>
          <span class="sol-card__num en">0${i + 1}</span>
        </div>
        <p class="sol-card__label">المشكلة</p>
        <p class="sol-card__problem"></p>
        <div class="sol-card__solution">
          <p class="sol-card__label">الحل اللي أقترحه</p>
          <p>${pr.solution}</p>
        </div>
        <button class="btn btn--primary" data-choose="${i}">اختار هذا الحل</button>`;
    });

    // تظهر وحدة ورا الثانية: البطاقة ← كتابة المشكلة ← الحل ← الزر
    const run = (i) => {
      if (i >= cards.length) return;
      const card = cards[i];
      card.classList.add('is-in');
      later(() => {
        typewrite($('.sol-card__problem', card), p.problems[i].problem, tok, () => {
          $('.sol-card__solution', card).classList.add('is-in');
          later(() => $('.btn', card).classList.add('is-in'), 250);
          later(() => run(i + 1), 450);
        });
      }, 350);
    };
    later(() => run(0), 200);
  };

  /* =====================================================================
     [5] قبل وبعد — سلايدر المقارنة
     ===================================================================== */
  const cmp = $('#cmp');
  let pos = 50;
  let dragging = false;
  let demoId = 0;

  function setPos(v) {
    pos = Math.max(0, Math.min(100, v));
    cmp.style.setProperty('--pos', pos + '%');
  }

  /* يرسم صورة داخل طبقة، أو بطاقة «قيد التجهيز» */
  function paintLayer(wrap, src, overlay) {
    wrap.querySelectorAll('.pending').forEach((n) => n.remove());
    const img = $('img', wrap);
    if (src) { img.src = src; img.hidden = false; }
    else { img.removeAttribute('src'); img.hidden = true; }
    if (!src) wrap.appendChild(pendingEl(false));
    else if (overlay) wrap.appendChild(pendingEl(true));
  }

  async function renderCompare(animated) {
    const p = state.place;
    const pr = p.problems[state.idx];
    const afterW = $('.cmp__after', cmp);
    const beforeW = $('.cmp__before', cmp);
    const summary = $('#cmpSummary');

    const apply = async () => {
      const [bi, ai] = await Promise.all([probe(p.image), probe(pr.after)]);
      const ref = bi.ok ? bi : (ai.ok ? ai : null);
      const ar = ref ? ref.w / ref.h : 1.5;
      cmp.style.setProperty('--ar', ar.toFixed(4));
      // صورة طولية (مثل 06): السلايدر بجنب والملخص والأزرار بجنب، بدل مساحة فاضية
      $('.screen.compare').classList.toggle('is-portrait', ar < 0.95);
      paintLayer(beforeW, bi.ok ? p.image : null, false);
      // صورة «بعد» ناقصة ← نعرض «قبل» مع طبقة شفافة ونص
      if (ai.ok) paintLayer(afterW, pr.after, false);
      else paintLayer(afterW, bi.ok ? p.image : null, true);
      summary.innerHTML = `<small>${pr.solution}</small>${pr.summary}`;
    };

    if (!animated) return apply();
    afterW.classList.add('is-fading');
    summary.classList.add('is-swapping');
    later(async () => {
      await apply();
      afterW.classList.remove('is-fading');
      summary.classList.remove('is-swapping');
    }, 420);
  }

  /* حركة تعريفية: من الوسط لليمين ثم لليسار ثم يرجع للوسط */
  function demo() {
    const id = ++demoId;
    const keys = [50, 80, 20, 50];
    const durs = [900, 1400, 900];
    let seg = 0;
    let t0 = performance.now();
    const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
    const step = (now) => {
      if (id !== demoId || state.screen !== 'compare') return;
      const k = Math.min(1, (now - t0) / durs[seg]);
      setPos(keys[seg] + (keys[seg + 1] - keys[seg]) * ease(k));
      if (k >= 1) {
        seg++;
        t0 = now;
        if (seg >= durs.length) return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const stopDemo = () => { demoId++; };

  function dragTo(e) {
    const r = cmp.getBoundingClientRect();
    setPos(((e.clientX - r.left) / r.width) * 100);
  }
  cmp.addEventListener('pointerdown', (e) => {
    dragging = true;
    stopDemo();
    try { cmp.setPointerCapture(e.pointerId); } catch (_) { /* لا شيء */ }
    dragTo(e);
  });
  cmp.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dragTo(e);
    resetIdle();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) =>
    cmp.addEventListener(ev, () => { dragging = false; }));

  enter.compare = () => {
    stopDemo();
    setPos(50);
    renderCompare(false);
    later(demo, 700);
  };

  /* =====================================================================
     [6] الختام
     ===================================================================== */
  enter.end = () => {
    const ring = $('#ring');
    const num = $('#ringNum');
    let left = Math.round(T.endReturn / 1000);
    ring.style.setProperty('--ring-ms', T.endReturn + 'ms');
    ring.classList.remove('is-running');
    void ring.offsetWidth;
    ring.classList.add('is-running');
    num.textContent = left;
    const tick = () => {
      left--;
      num.textContent = Math.max(0, left);
      if (left > 0) later(tick, 1000);
    };
    later(tick, 1000);
    later(() => go('welcome'), T.endReturn);
  };

  /* =====================================================================
     مؤقت الخمول (Kiosk)
     ===================================================================== */
  const IDLE_SCREENS = new Set(['choose', 'solutions', 'compare']); // عدا التحليل، والترحيب والختام لهم سلوكهم
  const idleEl = $('#idle');
  let idleWarnT = 0, idleGoT = 0, idleCountT = 0;

  function hideIdle() {
    idleEl.classList.remove('is-shown');
    clearInterval(idleCountT);
  }
  function showIdle() {
    let s = Math.round(T.idleWarn / 1000);
    const c = $('#idleCount');
    c.textContent = `(${s})`;
    idleEl.classList.add('is-shown');
    clearInterval(idleCountT);
    idleCountT = setInterval(() => {
      s--;
      c.textContent = `(${Math.max(0, s)})`;
      if (s <= 0) clearInterval(idleCountT);
    }, 1000);
  }
  function resetIdle() {
    clearTimeout(idleWarnT);
    clearTimeout(idleGoT);
    hideIdle();
    if (!IDLE_SCREENS.has(state.screen) || adminOpen) return;
    idleWarnT = setTimeout(showIdle, T.idle - T.idleWarn);
    idleGoT = setTimeout(() => { hideIdle(); go('welcome'); }, T.idle);
  }
  document.addEventListener('pointerdown', resetIdle, true);

  /* =====================================================================
     الإحصائيات + لوحة المتطوع (لمس الشعار 5 مرات)
     ===================================================================== */
  const STORE = 'hayyak.stats.v1';

  function loadStats() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE));
      if (s && typeof s === 'object') return { sessions: s.sessions || 0, picks: s.picks || {} };
    } catch (_) { /* لا شيء */ }
    return { sessions: 0, picks: {} };
  }
  function saveStats(s) {
    try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (_) { /* لا شيء */ }
  }
  function bump(fn) {
    const s = loadStats();
    fn(s);
    saveStats(s);
  }

  function describePick(key) {
    const [pid, k] = key.split('-');
    const place = DATA.places.find((p) => p.id === pid);
    const pr = place && place.problems.find((x) => x.key === k);
    return place && pr ? `${place.title} — ${pr.tag || pr.solution}` : key;
  }

  let adminOpen = false;
  const adminEl = $('#admin');
  const resetBtn = $('[data-action="reset-stats"]');

  function renderAdmin() {
    const s = loadStats();
    const sorted = Object.entries(s.picks).sort((a, b) => b[1] - a[1]);
    $('#statSessions').textContent = s.sessions;
    $('#statTop').textContent = sorted.length ? describePick(sorted[0][0]) : '—';
    $('#statList').innerHTML = sorted.slice(0, 5)
      .map(([k, n]) => `<li><span>${describePick(k)}</span><b>${n}</b></li>`).join('');
  }
  function openAdmin() {
    adminOpen = true;
    resetBtn.classList.remove('is-armed');
    resetBtn.textContent = 'تصفير';
    renderAdmin();
    adminEl.classList.add('is-shown');
    resetIdle();
  }
  function closeAdmin() {
    adminOpen = false;
    adminEl.classList.remove('is-shown');
    resetIdle();
  }

  let taps = 0, tapT = 0;
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.logo-tap')) return; // أي شعار: الهيدر، الترحيب، أو الختام
    taps++;
    clearTimeout(tapT);
    tapT = setTimeout(() => { taps = 0; }, 1500);
    if (taps >= 5) { taps = 0; openAdmin(); }
  });

  /* =====================================================================
     الأزرار (تفويض أحداث)
     ===================================================================== */
  document.addEventListener('click', (e) => {
    const choose = e.target.closest('[data-choose]');
    if (choose && state.screen === 'solutions' && !state.locked) {
      state.locked = true;
      state.idx = +choose.dataset.choose;
      const key = `${state.place.id}-${state.place.problems[state.idx].key}`;
      bump((s) => { s.picks[key] = (s.picks[key] || 0) + 1; });
      go('compare');
      return;
    }

    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    switch (btn.dataset.action) {
      case 'start':
        bump((s) => { s.sessions++; });
        go('choose');
        break;
      case 'back':
        go('welcome');
        break;
      case 'other-solution':
        state.idx = 1 - state.idx;
        renderCompare(true);
        break;
      case 'other-place':
        go('choose');
        break;
      case 'finish':
        go('end');
        break;
      case 'stay':
        resetIdle();
        break;
      case 'close-admin':
        closeAdmin();
        break;
      case 'reset-stats':
        if (!btn.classList.contains('is-armed')) {
          btn.classList.add('is-armed');
          btn.textContent = 'متأكد؟ اضغط مرة ثانية';
        } else {
          saveStats({ sessions: 0, picks: {} });
          btn.classList.remove('is-armed');
          btn.textContent = 'تصفير';
          renderAdmin();
        }
        break;
    }
  });

  // لمس بطاقة مشكلة ← يتوهج مربعها في الصورة الصغيرة
  $('.sol').addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.sol-card');
    if (card) linkCard(+card.dataset.idx);
  });

  /* =====================================================================
     حماية وضع المعرض: لا تكبير، لا قائمة ضغط مطوّل، لا تحديد
     ===================================================================== */
  ['gesturestart', 'gesturechange', 'contextmenu', 'selectstart', 'dragstart', 'dblclick']
    .forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault()));
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  /* =====================================================================
     خلفية المدينة الحية (canvas)
     شبكة شوارع رفيعة ونقاط مضيئة تتحرك عليها ببطء
     ===================================================================== */
  function startCity() {
    const cv = $('#city');
    const ctx = cv.getContext('2d');
    const rnd = (a, b) => a + Math.random() * (b - a);
    let W = 0, H = 0, roads = [], dots = [], pulses = [];
    let lastDraw = 0;

    const mk = (x1, y1, x2, y2, major) =>
      ({ x1, y1, x2, y2, major: !!major, len: Math.hypot(x2 - x1, y2 - y1) || 1 });
    const newDot = () => ({
      r: roads[(Math.random() * roads.length) | 0],
      p: Math.random(),
      v: rnd(10, 30) * (Math.random() < 0.5 ? -1 : 1), // بكسل/ثانية
      s: rnd(1, 2.2)
    });

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const M = 60;
      roads = [];
      for (let x = rnd(-20, 40); x < W + M; x += rnd(70, 170)) roads.push(mk(x, -M, x + rnd(-30, 30), H + M, Math.random() < 0.15));
      for (let y = rnd(-20, 40); y < H + M; y += rnd(60, 150)) roads.push(mk(-M, y, W + M, y + rnd(-24, 24), Math.random() < 0.15));
      roads.push(mk(-M, H * 0.92, W * 0.7, -M, true));   // شوارع قطرية رئيسية
      roads.push(mk(W * 0.3, H + M, W + M, H * 0.12, true));
      dots = Array.from({ length: Math.round((W * H) / 20000) }, newDot);
      pulses = [];
    }

    function draw(now, dt) {
      const ox = Math.sin(now / 21000) * 18;
      const oy = Math.cos(now / 27000) * 12;
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(ox, oy);

      for (const r of roads) {
        ctx.strokeStyle = r.major ? 'rgba(88,112,156,0.34)' : 'rgba(88,112,156,0.16)';
        ctx.lineWidth = r.major ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(r.x1, r.y1);
        ctx.lineTo(r.x2, r.y2);
        ctx.stroke();
      }

      for (const d of dots) {
        d.p += (d.v * dt) / d.r.len;
        if (d.p > 1 || d.p < 0) {
          Object.assign(d, newDot());
          d.p = d.v > 0 ? 0 : 1;
        }
        const x = d.r.x1 + (d.r.x2 - d.r.x1) * d.p;
        const y = d.r.y1 + (d.r.y2 - d.r.y1) * d.p;
        ctx.fillStyle = 'rgba(212,218,250,0.10)';
        ctx.beginPath(); ctx.arc(x, y, d.s * 4.5, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(212,218,250,0.85)';
        ctx.beginPath(); ctx.arc(x, y, d.s, 0, 6.283); ctx.fill();
      }

      // نبضات هادئة على تقاطعات عشوائية
      if (Math.random() < dt * 0.6 && roads.length > 1) {
        const a = roads[(Math.random() * roads.length) | 0];
        const k = Math.random();
        pulses.push({ x: a.x1 + (a.x2 - a.x1) * k, y: a.y1 + (a.y2 - a.y1) * k, t: 0 });
      }
      pulses = pulses.filter((p) => (p.t += dt) < 3);
      for (const p of pulses) {
        const k = p.t / 3;
        ctx.strokeStyle = `rgba(212,218,250,${(0.35 * (1 - k)).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3 + k * 42, 0, 6.283); ctx.stroke();
      }
      ctx.restore();
    }

    function loop(now) {
      // ~30 إطار بالثانية يكفي ويريح بطارية الآيباد
      if (!document.hidden && now - lastDraw > 32) {
        draw(now, Math.min(0.1, (now - lastDraw) / 1000));
        lastDraw = now;
      }
      requestAnimationFrame(loop);
    }

    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
    build();
    requestAnimationFrame(loop);
  }

  /* =====================================================================
     التشغيل
     ===================================================================== */
  /* كل <img data-logo="wordmark|emblem"> ياخذ مساره من data.js */
  function initLogos() {
    $$('[data-logo]').forEach((img) => {
      const kind = img.dataset.logo;
      const src = DATA.brand[kind];
      probe(src).then((r) => {
        if (r.ok) { img.src = src; return; }
        if (kind === 'wordmark') {
          const s = document.createElement('span');
          s.className = 'brand__text';
          s.textContent = DATA.brand.fallbackText;
          img.replaceWith(s);
        } else {
          img.remove(); // الرمز في شاشة التحليل اختياري
        }
      });
    });
  }

  function init() {
    preloadAll();
    initLogos();
    $$('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
    buildPlaces();
    updateProgress();
    startCity();
    playIntro();

    // العمل بدون إنترنت (يشتغل فقط من http/https، مو من file://)
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => { /* لا شيء */ });
      });
    }
  }

  init();
})();
