/* Shared appearance only. Character settings and prompt generation stay independent. */
(function () {
  'use strict';
  var root = document.documentElement;
  /* 테마는 공방마다 따로 — 다섯 공방이 한 주소(polos0117.github.io) 아래라 localStorage 를 같이 쓴다.
     예전엔 모두 atelier_theme_v1 하나라 한 공방에서 고르면 다른 공방 테마가 바뀌거나(이름이 다르면) 기본으로 되돌아갔다(2026-10-21).
     처음 한 번만 옛 열쇠의 값이 이 공방 테마이면 옮겨 온다. 옛 열쇠는 지우지 않는다(다른 공방도 한 번씩 옮겨 간다). 밀도는 함께 쓴다 */
  var keys = { theme: 'pkm_theme_v1', density: 'atelier_density_v1' };
  var LEGACY_THEME = 'atelier_theme_v1';
  /* 테마 = 지역 아홉(세대 차례, 2026-11-12). 값은 그 지역 --deck(브라우저 머리 색). 그림은 그림 저장소 4 번의 regions/,
     pos 는 랜드마크가 보이는 background-position — 344×882 머리 창(표지판 줄 옆 · 표지판과 제목판 사이)에 맞춰 골랐다(관동은 여객선 · 등대, 가라르는 경기장).
     posWide 는 600px 이상 — 그림이 가로로 꽉 차 세로 자리가 넓으니 아래쪽을 고른 지역만 따로 */
  var themeColors = {"kanto":"#fbf4e6","johto":"#f8f5ee","hoenn":"#f1f7f6","sinnoh":"#f5f6fc","unova":"#142342","kalos":"#fbf7f2","alola":"#fbf7ec","galar":"#f3f1ec","paldea":"#fcf7ea"};
  var POS = {kanto:'70% 100%', johto:'85% 20%', hoenn:'70% 30%', sinnoh:'62% 30%', unova:'60% 30%', kalos:'60% 60%', alola:'30% 100%', galar:'75% 100%', paldea:'5% 10%'};
  var POS_WIDE = {kanto:'70% 58%', alola:'30% 60%', galar:'75% 45%'};
  var ART = 'https://polos0117.github.io/pkm-atelier-img-4/regions/';
  var regions = {};
  Object.keys(themeColors).forEach(function (key, i) {
    regions[key] = Object.freeze({gen: i + 1, art: ART + key + '.webp', thumb: ART + 'thumb/' + key + '.webp', pos: POS[key], posWide: POS_WIDE[key] || POS[key]});
  });
  /* 옛 테마 여덟 → 짝지은 지역. 저장해 둔 옛 값은 읽을 때 지역으로 고쳐 적는다 */
  var legacy = Object.freeze({midnight:'unova', daylight:'kanto', blossom:'kalos', moss:'hoenn', plum:'sinnoh', sand:'paldea', deep:'alola', ember:'johto'});
  var viewportFrame = 0;
  function fitVisibleViewport() {
    if (viewportFrame) cancelAnimationFrame(viewportFrame);
    viewportFrame = requestAnimationFrame(function () {
      viewportFrame = 0;
      var viewport = window.visualViewport;
      var height = viewport && viewport.height ? viewport.height : window.innerHeight;
      if (height) root.style.setProperty('--atelier-vh', Math.round(height * 100) / 100 + 'px');
    });
  }
  function normalize(key, value) {
    if (key === 'theme' && legacy[value]) value = legacy[value];
    return key === 'theme' ? (themeColors[value] ? value : 'kanto')
      : (value === 'relaxed' ? value : 'compact');
  }
  function apply(key, value) {
    root.dataset[key] = normalize(key, value);
    if (key === 'theme') {
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = themeColors[root.dataset.theme];
    }
  }
  function read(key) {
    var value, old;
    try {
      value = localStorage.getItem(keys[key]);
      if (value === null && key === 'theme') {
        old = localStorage.getItem(LEGACY_THEME);
        if (old && (themeColors[old] || legacy[old])) value = old;
      }
      if (key === 'theme' && value && (legacy[value] || value === old)) localStorage.setItem(keys[key], normalize(key, value));
    } catch (e) {}
    apply(key, value);
  }
  Object.keys(keys).forEach(read);
  fitVisibleViewport();
  window.addEventListener('resize', fitVisibleViewport, { passive: true });
  window.addEventListener('orientationchange', fitVisibleViewport, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitVisibleViewport, { passive: true });
    window.visualViewport.addEventListener('scroll', fitVisibleViewport, { passive: true });
  }
  window.AtelierAppearance = {
    themes: Object.freeze(Object.keys(themeColors)),
    regions: Object.freeze(regions),
    legacy: legacy,
    get: function () { return { theme: root.dataset.theme, density: root.dataset.density }; },
    set: function (key, value) {
      if (!keys[key]) return;
      apply(key, value);
      try { localStorage.setItem(keys[key], root.dataset[key]); } catch (e) {}
      window.dispatchEvent(new Event('atelier-appearance'));
    },
    travel: travel
  };
  /* 지역 옮기기 — 구름 전환(workspace.css 의 html.travelling::view-transition-*). 같은 지역이면 아무것도 안 한다.
     움직임 줄이기 · View Transitions 없음이면 바로 set. 새 머리 그림을 먼저 받아 두되(최대 0.4초) 그사이 또 부르면 마지막 것만,
     전환 중에 또 부르면 진행 중인 것을 건너뛰고(skipTransition) 새 것만. storage 사건은 여기를 거치지 않는다 */
  var seq = 0, running = null;
  function motionOn() {
    var M = window.AtelierMotion;
    return M && M.enabled ? M.enabled() : !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function travel(key) {
    var my = ++seq, to = normalize('theme', key);
    if (to === root.dataset.theme) return Promise.resolve();
    if (!document.startViewTransition || !motionOn()) { window.AtelierAppearance.set('theme', to); return Promise.resolve(); }
    var img = new Image();
    img.src = regions[to].art;
    return Promise.race([img.decode ? img.decode() : Promise.resolve(), new Promise(function (ok) { setTimeout(ok, 400); })])
      .catch(function () {})
      .then(function () {
        if (my !== seq) return;
        if (running) running.skipTransition();
        root.classList.add('travelling');
        /* 화면(Preact)은 set 이 보낸 사건으로 다음 틈에 다시 그린다 — 그 뒤 새 화면을 찍게 한 틈 기다린다 */
        var t = running = document.startViewTransition(function () {
          if (my === seq) window.AtelierAppearance.set('theme', to);   /* 그사이 다른 곳(같은 지역 포함)을 눌렀으면 옛 목적지는 버린다 */
          return new Promise(function (ok) { setTimeout(ok, 0); });
        });
        t.ready.catch(function () {});   /* 건너뛰면(다음 travel) ready 가 AbortError 로 거절된다 — 받지 않으면 "Uncaught (in promise)" */
        function done() { if (running === t) { running = null; root.classList.remove('travelling'); } }
        return t.finished.then(done, done);
      });
  }
  window.addEventListener('storage', function (event) {
    Object.keys(keys).forEach(function (key) {
      if (event.key === keys[key] || event.key === null) read(key);
    });
    window.dispatchEvent(new Event('atelier-appearance'));
  });
})();
