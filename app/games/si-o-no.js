/* ZEIRO JUEGOS · Sí o No (también "Ambas") */
(function () {
  function play(root, content, options, ctx) {
    var items = (content.items || []).filter(function (it) { return it && it.text; });
    if (!items.length) { root.innerHTML = '<div class="vacio">El juego no tiene afirmaciones.</div>'; return {}; }
    var idx = 0, correct = 0, answered = 0;
    var destroyed = false;

    function render() {
      if (destroyed) return;
      if (idx >= items.length) { terminar(); return; }
      var it = items[idx];
      var prog = Math.round(100 * idx / items.length);
      var resp = it.answer || 'si';
      root.innerHTML = '<div class="siono">' +
        '<div class="siono-prog"><div class="siono-progbar"><i style="width:' + prog + '%"></i></div>' +
        '<span>' + (idx + 1) + ' / ' + items.length + '</span></div>' +
        '<div class="siono-pregunta">' + ZU.esc(it.text) + '</div>' +
        '<div class="siono-botones">' +
        '<button class="btn si" data-a="si">Sí</button>' +
        '<button class="btn no" data-a="no">No</button>' +
        '<button class="btn ambas" data-a="ambas">Ambas</button>' +
        '</div>' +
        '<div class="siono-exp" id="sinexp"></div></div>';

      var buttons = root.querySelectorAll('.siono-botones .btn');
      Array.prototype.forEach.call(buttons, function (b) {
        b.onclick = function () {
          var elegido = b.dataset.a;
          answered++;
          var ok = elegido === resp;
          if (ok) correct++;
          Array.prototype.forEach.call(buttons, function (x) { x.disabled = true; });
          b.classList.add(ok ? 'bien' : 'mal');
          if (elegido !== resp) {
            var correcto = Array.prototype.slice.call(buttons).filter(function (x) { return x.dataset.a === resp; })[0];
            if (correcto) correcto.classList.add('bien');
          }
          var exp = root.querySelector('#sinexp');
          if (it.explanation) exp.innerHTML = '<div class="siono-explanation">' + ZU.esc(it.explanation) + '</div>';
          exp.innerHTML += '<button class="btn primary" id="sinext">' + (idx === items.length - 1 ? 'Ver resultados' : 'Siguiente') + '</button>';
          root.querySelector('#sinext').onclick = function () { idx++; render(); };
          ctx.reportHeight();
        };
      });
      ctx.reportHeight();
    }

    function terminar() {
      if (destroyed) return;
      destroyed = true;
      ctx.finish({
        score: Math.round(100 * correct / items.length),
        correct: correct, total: items.length,
        answers: [],
        message: correct + ' de ' + items.length + ' correctas'
      });
    }

    render();
    return { destroy: function () { destroyed = true; } };
  }
  ZGTYPES['si-o-no'] = { play: play };
})();
