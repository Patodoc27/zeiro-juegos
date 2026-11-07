/* ZEIRO JUEGOS · Ruleta de Palabras */
(function () {
  function normW(w) { return ZU.norm(w); }

  function play(root, content, options, ctx) {
    var mode = content.mode === 'contiene' ? 'contiene' : 'empieza';
    var words = (content.words || []).map(function (w) { return normW(typeof w === 'string' ? w : w.word); })
      .filter(function (w) { return w.length >= (mode === 'contiene' ? 4 : 3); });
    if (!words.length) { root.innerHTML = '<div class="vacio">La ruleta no tiene palabras.</div>'; return {}; }
    words = Array.from(new Set(words));
    var timePerRound = content.timePerRound ? parseInt(content.timePerRound, 10) : 60;
    var rounds = content.rounds ? parseInt(content.rounds, 10) : 3;

    /* letras candidatas */
    var freq = {};
    words.forEach(function (w) {
      var letras = mode === 'empieza' ? [w.charAt(0)] : w.split('');
      letras.forEach(function (l) { freq[l] = (freq[l] || 0) + 1; });
    });
    var letters = Object.keys(freq).filter(function (l) { return freq[l] >= (mode === 'empieza' ? 1 : 2); });
    if (!letters.length) letters = Object.keys(freq);

    var ronda = 0, letra = '', objetivo = {}, encontradas = {}, totalEncontradas = 0, totalPosibles = 0;
    var timer = null, destroyed = false;

    function elegirLetra() {
      /* letra con palabras suficientes, sin repetir si se puede */
      var opts = letters.slice();
      var posibles = opts.filter(function (l) {
        return words.filter(function (w) { return mode === 'empieza' ? w.indexOf(l) === 0 : w.indexOf(l) !== -1; }).length > 0;
      });
      letra = ZU.pick(posibles.length ? posibles : opts);
      objetivo = {};
      encontradas = {};
      words.forEach(function (w) {
        var ok = mode === 'empieza' ? w.indexOf(letra) === 0 : w.indexOf(letra) !== -1;
        if (ok) { objetivo[w] = true; totalPosibles++; }
      });
    }

    function render() {
      if (destroyed) return;
      if (timer) { timer.stop(); timer = null; }
      if (ronda >= rounds) { terminar(); return; }
      elegirLetra();
      var encontradasArr = Object.keys(encontradas);
      var html = '<div class="ruleta">' +
        '<div class="rul-prog"><span>Ronda ' + (ronda + 1) + ' de ' + rounds + '</span>' +
        '<div class="rul-bar"><i style="width:' + Math.round(100 * ronda / rounds) + '%"></i></div></div>' +
        '<div class="rul-rueda-wrap"><svg class="rul-rueda" viewBox="0 0 200 200">' +
        '<circle cx="100" cy="100" r="92" fill="#4C1D95"/>' +
        '<circle cx="100" cy="100" r="70" fill="#7C3AED"/>' +
        '<circle cx="100" cy="100" r="34" fill="#F6F7FB"/>' +
        '<text x="100" y="112" text-anchor="middle" font-size="34" font-weight="800" fill="#4C1D95">' + ZU.esc(letra.toUpperCase()) + '</text>' +
        '</svg><div class="rul-pointer"></div></div>' +
        '<div class="rul-consigna">Escribí palabras que <b>' + (mode === 'empieza' ? 'empiecen con' : 'contengan la letra') + '</b> ' + ZU.esc(letra.toUpperCase()) + '</div>' +
        '<div class="rul-input"><input type="text" id="rulinp" class="input" placeholder="Escribí una palabra y dale a Agregar" autocomplete="off">' +
        '<button class="btn primary" id="ruladd">Agregar</button></div>' +
        '<div class="rul-msg" id="rulmsg"></div>' +
        '<div class="rul-lista"><h4>Ya encontraste (' + encontradasArr.length + ')</h4><ul id="rullist">' +
        encontradasArr.map(function (w) { return '<li>' + ZU.esc(w) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="rul-acciones"><button class="btn primary" id="rulnext">Siguiente ronda</button>' +
        '<span class="rul-tiempo" id="rultime"></span></div></div>';
      root.innerHTML = html;

      var inp = root.querySelector('#rulinp');
      var tEl = root.querySelector('#rultime');
      var left = timePerRound;
      function agregar() {
        var w = normW(inp.value);
        inp.value = '';
        if (!w) return;
        if (encontradas[w] || !objetivo[w]) {
          root.querySelector('#rulmsg').innerHTML = '<span class="mal">Esa palabra no empieza con / no contiene la letra, o ya la pusiste.</span>';
          ctx.reportHeight();
          return;
        }
        encontradas[w] = true;
        totalEncontradas++;
        root.querySelector('#rulmsg').innerHTML = '<span class="ok">¡Sumaste una!</span>';
        var li = document.createElement('li');
        li.textContent = w;
        root.querySelector('#rullist').appendChild(li);
        inp.focus();
        ctx.reportHeight();
      }
      root.querySelector('#ruladd').onclick = agregar;
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') agregar(); });
      inp.focus();

      /* la siguiente ronda se habilita siempre (el tiempo es orientativo) */
      root.querySelector('#rulnext').onclick = function () { ronda++; render(); };

      if (timePerRound > 0) {
        timer = ZG.temporizador(timePerRound, function (l) {
          left = l;
          if (tEl) {
            tEl.textContent = '⏱ ' + l + ' s';
            tEl.className = 'rul-tiempo ' + (l <= 10 ? 'urgente' : '');
          }
        }, function () {
          /* tiempo agotado: pasar de ronda */
          ronda++;
          render();
        });
      }
      ctx.reportHeight();
    }

    function terminar() {
      if (destroyed) return;
      destroyed = true;
      ctx.finish({
        score: Math.round(100 * totalEncontradas / (totalPosibles || 1)),
        correct: totalEncontradas, total: totalPosibles,
        answers: [],
        message: 'Encontraste ' + totalEncontradas + ' palabras en ' + rounds + ' rondas'
      });
    }

    render();
    return { destroy: function () { destroyed = true; if (timer) timer.stop(); } };
  }
  ZGTYPES.ruleta = { play: play };
})();
