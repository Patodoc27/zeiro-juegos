/* ZEIRO JUEGOS · Lectura en voz alta (es-AR, una sola voz) */
(function () {
  var synthOK = 'speechSynthesis' in window;
  function vozEs() {
    if (!synthOK) return null;
    var vs = speechSynthesis.getVoices();
    var i, mejor = null;
    for (i = 0; i < vs.length; i++) {
      var v = vs[i];
      if (/^es[-_]AR/i.test(v.lang)) { mejor = v; break; }
      if (/^es[-_]/i.test(v.lang) && !mejor) mejor = v;
    }
    return mejor || (vs.length ? vs[0] : null);
  }
  if (synthOK) {
    try { speechSynthesis.getVoices(); } catch (e) {}
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = function () { vozEs(); };
    }
  }
  window.ZV = {
    ok: synthOK,
    hablar: function (texto) {
      if (!synthOK) return false;
      try {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(texto);
        u.lang = 'es-AR';
        var v = vozEs();
        if (v) { u.voice = v; u.lang = v.lang; }
        u.rate = 0.95;
        speechSynthesis.speak(u);
        return true;
      } catch (e) { return false; }
    },
    parar: function () { if (synthOK) { try { speechSynthesis.cancel(); } catch (e) {} } },
    boton: function (texto, cls) {
      if (!synthOK) return '';
      return '<button type="button" class="btn vozbtn ' + (cls || 'ghost') + '" data-voz="' + ZU.esc(texto).replace(/"/g, '&quot;') + '" title="Escuchar">' + ZI('speaker') + '<span>Escuchar</span></button>';
    }
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-voz]') : null;
    if (!b) return;
    ZV.hablar(b.getAttribute('data-voz') || '');
  });
})();
