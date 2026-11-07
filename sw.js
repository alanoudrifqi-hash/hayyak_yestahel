/* =====================================================================
   sw.js — العمل بدون إنترنت
   بعد أول فتح للموقع، كل الملفات والصور تنحفظ في الجهاز.
   ⚠️ إذا عدّلت أي ملف أو بدّلت صور: زِد رقم VERSION عشان الآيباد ياخذ النسخة الجديدة.
   ===================================================================== */

const VERSION = 'hayyak-v7';

// قائمة الصور تنقرأ تلقائياً من data.js — ما تحتاج تكتبها هنا
importScripts('js/data.js');

const CORE = [
  './',
  'index.html',
  'manifest.json',
  'css/tokens.css',
  'css/base.css',
  'css/screens.css',
  'js/data.js',
  'js/app.js',
  'assets/brand/rowad-wordmark.png',
  'assets/brand/rowad-emblem.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&family=Outfit:wght@400;700&display=swap'
];

function mediaList() {
  const D = self.HAYYAK || { places: [], brand: {} };
  const list = [
    D.brand.wordmark,
    D.brand.emblem,
    'assets/fonts/Gilroy-Regular.woff2',
    'assets/fonts/Gilroy-Bold.woff2'
  ];
  D.places.forEach((p) => {
    list.push(p.image);
    p.problems.forEach((pr) => list.push(pr.after));
  });
  return list.filter(Boolean);
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // كل ملف لحاله — الملفات الناقصة (صورة ما انحطت بعد) ما توقف الباقي
    await Promise.all([...CORE, ...mediaList()].map((url) =>
      cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
    if (cached) return cached;
    try {
      const res = await fetch(req);
      // نحفظ أي ملف ناجح (ومنها ملفات خطوط Google) للمرة الجاية
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === 'navigate') {
        const page = await cache.match('index.html');
        if (page) return page;
      }
      return Response.error();
    }
  })());
});
