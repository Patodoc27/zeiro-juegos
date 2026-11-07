/* ZEIRO JUEGOS · Íconos SVG propios (sin emojis del sistema).
   Uso: ZI('home') devuelve '<span class="ic">…svg…</span>'. */
(function () {
  var P = {
    home: '<path d="M3 11.5 12 4l9 7.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 21v-6h5v6" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 7.5h8M8 11h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    edit: '<path d="m14.5 5.5 4 4L8 20H4v-4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m12.5 7.5 4 4" stroke="currentColor" stroke-width="1.8"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2m-8 0 .8 13a1.5 1.5 0 0 0 1.5 1.4h7.4a1.5 1.5 0 0 0 1.5-1.4L18 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    check: '<path d="m4.5 12.5 5 5L19.5 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    x: '<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    clock: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12l3.2 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    users: '<circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="17" cy="9" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 14.4a5.5 5.5 0 0 1 4.5 5.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    play: '<path d="M7 4.8v14.4L19 12z" fill="currentColor"/>',
    eye: '<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    send: '<path d="m3.5 11 17-7-5.5 17-3-7.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    chev: '<path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    print: '<path d="M7 8V3.5h10V8" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="8" width="16" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 14h10v6.5H7z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    download: '<path d="M12 4v9.5m0 0L8 9.5m4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 16v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    warn: '<path d="M12 3.5 22 20H2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="17.3" r="1.1" fill="currentColor"/>',
    search: '<circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15.3 15.3 4.7 4.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/>',
    mic: '<rect x="9" y="2.5" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    speaker: '<path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor"/><path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 6H4.5a3.5 3.5 0 0 0 3.6 3.5M16 6h3.5a3.5 3.5 0 0 1-3.6 3.5M12 13v3m-3.5 5h7l-1-5h-5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="13" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="13" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    puzzle: '<path d="M9 4h3a2 2 0 1 1 4 0h3v3a2 2 0 1 0 0 4v3h-3a2 2 0 1 0-4 0H9V4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" transform="translate(1 1) scale(0.92)"/>',
    heart: '<path d="M12 20s-7.5-4.6-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 11c-1.8 4.4-9.3 9-9.3 9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    link: '<path d="M9.5 14.5 14.5 9.5M8 11 5.5 13.5a3.54 3.54 0 0 0 5 5L13 16m-2-5 2.5-2.5a3.54 3.54 0 0 1 5 5L16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    dots: '<circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 3v4h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  /* íconos de cada tipo de juego */
  var GAME_ICONS = {
    test: 'quiz', froggy: 'play', sopa: 'grid', crucigrama: 'puzzle', columnas: 'link',
    memory: 'heart', completar: 'edit', 'ordenar-palabras': 'book', 'si-o-no': 'check',
    'ordenar-letras': 'refresh', ruleta: 'star', grupos: 'users', filas: 'chev', mapa: 'search'
  };
  window.ZI = function (name, cls) {
    return '<span class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><svg viewBox="0 0 24 24">' + (P[name] || P.book) + '</svg></span>';
  };
  window.ZGICON = function (type, cls) { return ZI(GAME_ICONS[type] || 'book', cls); };
})();
