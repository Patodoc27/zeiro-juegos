/* ZEIRO JUEGOS · Router y arranque */
(function () {
  var root = document.getElementById('root');

  function limpiar() { root.innerHTML = ''; }

  function ruta() {
    var h0 = location.hash || '#/';
    var navKey = h0.indexOf('docente') !== -1 ? 'docente' : (h0.indexOf('entrar') !== -1 ? 'entrar' : 'home');
    var nav = document.querySelector('.topbar nav');
    if (nav) nav.querySelectorAll('a').forEach(function (a) { a.classList.toggle('activa', a.dataset.nav === navKey); });
    var hash = location.hash.replace(/^#/, '');
    var q = ZU.query();
    /* modo embed: siempre directo al juego */
    if (q.embed === '1' && q.juego) {
      limpiar();
      ZVIEWS.jugador(root, { juego: q.juego, clase: q.clase || '' }, true);
      return;
    }
    if (!hash || hash === '/') { limpiar(); ZVIEWS.landing(root); return; }
    var parts = hash.split('/').filter(Boolean);
    var p0 = parts[0];
    limpiar();
    if (p0 === 'entrar') { ZVIEWS.entrar(root, q); return; }
    if (p0 === 'clase' && parts[1]) { ZVIEWS.lobby(root, decodeURIComponent(parts[1]).toUpperCase()); return; }
    if (p0 === 'jugar') {
      var qq = ZU.query();
      /* la info puede venir en el hash tipo #/jugar?juego=..&clase=.. o en search */
      var hq = {};
      var idx = hash.indexOf('?');
      if (idx !== -1) {
        hash.split('?')[1].split('&').forEach(function (kv) {
          var p = kv.split('='); hq[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
        });
      }
      ZVIEWS.jugador(root, { juego: hq.juego || qq.juego || '', clase: (hq.clase || qq.clase || '').toUpperCase() }, false);
      return;
    }
    if (p0 === 'juego' && parts[1]) { ZVIEWS.jugador(root, { juego: parts[1], clase: '' }, false); return; }
    if (p0 === 'docente') {
      var sub = parts.slice(1).join('/');
      if (sub.indexOf('juego/') === 0) sub = 'juego/' + sub.slice(6);
      ZVIEWS.docente(root, sub);
      return;
    }
    root.innerHTML = '<div class="vacio">Página no encontrada. <a href="#/">Volver al inicio</a></div>';
  }

  window.addEventListener('hashchange', ruta);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
  ruta();
})();
