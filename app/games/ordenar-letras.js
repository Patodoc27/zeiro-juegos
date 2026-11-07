/* ZEIRO JUEGOS · Ordenar Letras (anagrama) */
(function () {
  function play(root, content, options, ctx) {
    var items = (content.items || []).filter(function (it) { return it && it.word; });
    if (!items.length) { root.innerHTML = '<div class="vacio">El juego no tiene palabras.</div>'; return {}; }
    var ii = 0, correct = 0;
    var destroyed = false;

    function scramble(word) {
      var letters = word.split('');
      var s = ZU.shuffle(letters).join('');
      /* evitar que salga ordenada */
      var intentos = 0;
      while (s === word && intentos < 10) { s = ZU.shuffle(letters).join(''); intentos++; }
      return s;
    }

    function render() {
      if (destroyed) return;
      var it = items[ii];
      var word = ZU.norm(it.word).toUpperCase();
      var prog = Math.round(100 * ii / items.length);
      var scr = it.scrambled ? it.scrambled.toUpperCase() : scramble(word);
      var chips = scr.split('').map(function (ch) { return '<span class="ol-letra">' + ZU.esc(ch) + '</span>'; }).join('');

      root.innerHTML = '<div class="ordlet">' +
        '<div class="ordlet-prog"><div class="ordlet-progbar"><i style="width:' + prog + '%"></i></div>' +
        '<span>Palabra ' + (ii + 1) + ' de ' + items.length + '</span></div>' +
        (it.image ? '<img class="ordlet-img" src="' + ZU.esc(it.image) + '" alt="">' : '') +
        (it.clue ? '<div class="ordlet-clue">' + ZU.esc(it.clue) + '</div>' : '') +
        '<div class="ordlet-scrambled">' + chips + '</div>' +
        '<div class="ordlet-input"><input type="text" id="olinp" class="input" placeholder="Escribí la palabra" autocomplete="off" autocapitalize="characters">' +
        '<button class="btn ghost" id="olborrar" title="Borrar">⌫</button></div>' +
        '<div class="ordlet-acciones"><button class="btn primary" id="olok">Comprobar</button></div>' +
        '<div class="ordlet-msg" id="olmsg"></div></div>';

      var inp = root.querySelector('#olinp');
      inp.focus();
      root.querySelector('#olborrar').onclick = function () { inp.value = inp.value.slice(0, -1); inp.focus(); };

      function responder() {
        var val = inp.value;
        var ok = ZU.respOK(val, [it.word], { unaLetra: true, parcial: false });
        if (ok) {
          correct++;
          root.querySelector('#olmsg').innerHTML = '<span class="ok">¡Correcto!</span>';
          inp.disabled = true;
          root.querySelector('#olok').disabled = true;
          setTimeout(function () { ii++; if (ii >= items.length) terminar(); else render(); }, 900);
        } else {
          root.querySelector('#olmsg').innerHTML = '<span class="mal">No es esa palabra. Fijate las letras y probá de nuevo.</span>';
          inp.value = '';
          inp.focus();
        }
        ctx.reportHeight();
      }
      root.querySelector('#olok').onclick = responder;
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') responder(); });
      ctx.reportHeight();
    }

    function terminar() {
      if (destroyed) return;
      destroyed = true;
      ctx.finish({
        score: Math.round(100 * correct / items.length),
        correct: correct, total: items.length,
        answers: [],
        message: correct + ' de ' + items.length + ' palabras correctas'
      });
    }

    render();
    return { destroy: function () { destroyed = true; } };
  }
  ZGTYPES['ordenar-letras'] = { play: play };
})();
