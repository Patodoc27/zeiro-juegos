/* ZEIRO JUEGOS · Ordenar Palabras */
(function () {
  function play(root, content, options, ctx) {
    var items = (content.items || []).filter(function (it) { return it && (it.words || []).length >= 2; });
    if (!items.length) { root.innerHTML = '<div class="vacio">El juego no tiene oraciones para ordenar.</div>'; return {}; }
    var ii = 0, correct = 0;
    var destroyed = false;

    function render() {
      if (destroyed) return;
      var it = items[ii];
      var correctas = it.words.map(function (w) { return String(w); });
      var pool = correctas.map(function (w) { return { w: w, ok: true }; });
      if (it.distractors) pool = pool.concat(it.distractors.map(function (d) { return { w: String(d), ok: false }; }));
      pool = ZU.shuffle(pool);
      var prog = Math.round(100 * ii / items.length);

      var html = '<div class="ordpal">' +
        '<div class="ordpal-prog"><div class="ordpal-progbar"><i style="width:' + prog + '%"></i></div>' +
        '<span>Oración ' + (ii + 1) + ' de ' + items.length + '</span></div>' +
        (it.hint ? '<div class="ordpal-pista">' + ZI('book') + ZU.esc(it.hint) + '</div>' : '') +
        '<div class="ordpal-bolsa" id="opbag"></div>' +
        '<div class="ordpal-linea" id="opline"><span class="muted">Tocá las palabras en orden para armar la oración</span></div>' +
        '<div class="ordpal-acciones"><button class="btn primary" id="opok" disabled>Comprobar</button></div>' +
        '<div class="ordpal-msg" id="opmsg"></div></div>';
      root.innerHTML = html;

      var bag = root.querySelector('#opbag');
      var line = root.querySelector('#opline');
      var elegido = []; /* índices del pool */

      pool.forEach(function (p, i) {
        var b = document.createElement('button');
        b.className = 'op-chip';
        b.textContent = p.w;
        b.dataset.i = i;
        b.onclick = function () { elegir(i); };
        bag.appendChild(b);
      });

      function elegir(i) {
        if (elegido.indexOf(i) !== -1) return;
        elegido.push(i);
        var b = bag.querySelector('.op-chip[data-i="' + i + '"]');
        if (b) { b.disabled = true; b.classList.add('usada'); }
        pintar();
      }
      function devolver(pos) {
        var i = elegido[pos];
        elegido.splice(pos, 1);
        var b = bag.querySelector('.op-chip[data-i="' + i + '"]');
        if (b) { b.disabled = false; b.classList.remove('usada'); }
        pintar();
      }
      function pintar() {
        line.innerHTML = '';
        if (!elegido.length) {
          line.innerHTML = '<span class="muted">Tocá las palabras en orden para armar la oración</span>';
        } else {
          elegido.forEach(function (i, pos) {
            var c = document.createElement('button');
            c.className = 'op-chip en-linea';
            c.textContent = pool[i].w;
            c.onclick = function () { devolver(pos); };
            line.appendChild(c);
          });
        }
        root.querySelector('#opok').disabled = elegido.length !== correctas.length;
        ctx.reportHeight();
      }

      root.querySelector('#opok').onclick = function () {
        var uni = elegido.map(function (i) { return ZU.norm(pool[i].w); }).join(' ');
        var cor = correctas.map(function (w) { return ZU.norm(w); }).join(' ');
        var ok = uni === cor;
        if (ok) {
          correct++;
          root.querySelector('#opmsg').innerHTML = '<span class="ok">¡Oración perfecta!</span>';
          setTimeout(function () { ii++; if (ii >= items.length) terminar(); else render(); }, 900);
        } else {
          root.querySelector('#opmsg').innerHTML = '<span class="mal">No es ese el orden. Tocá las palabras de la oración para volver a empezar.</span>';
          elegido = [];
          Array.prototype.forEach.call(bag.querySelectorAll('.op-chip'), function (c) { c.disabled = false; c.classList.remove('usada'); });
          pintar();
        }
        ctx.reportHeight();
      };
      pintar();
    }

    function terminar() {
      if (destroyed) return;
      destroyed = true;
      ctx.finish({
        score: Math.round(100 * correct / items.length),
        correct: correct, total: items.length,
        answers: [],
        message: correct + ' de ' + items.length + ' oraciones correctas'
      });
    }

    render();
    return { destroy: function () { destroyed = true; } };
  }
  ZGTYPES['ordenar-palabras'] = { play: play };
})();
