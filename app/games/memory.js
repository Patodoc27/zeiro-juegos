/* ZEIRO JUEGOS · Memoria (pares de cartas) */
(function () {
  function play(root, content, options, ctx) {
    var pairs = (content.pairs || []).filter(function (p) { return p && p.a; });
    if (!pairs.length) { root.innerHTML = '<div class="vacio">El juego no tiene pares.</div>'; return {}; }
    var identical = !!content.identical;

    var cards = [];
    pairs.forEach(function (p, i) {
      if (identical) {
        cards.push({ pair: i, text: p.a, img: p.imgA || p.img });
        cards.push({ pair: i, text: p.a, img: p.imgA || p.img });
      } else {
        cards.push({ pair: i, text: p.a, img: p.imgA || p.img });
        cards.push({ pair: i, text: p.b, img: p.imgB || p.img });
      }
    });
    cards = ZU.shuffle(cards);
    var total = pairs.length;
    var matched = 0, moves = 0, first = null, lock = false;
    var destroyed = false;

    root.innerHTML = '<div class="memory">' +
      '<div class="mem-bar"><span class="mem-movs">Movidas: <b id="memoves">0</b></span>' +
      '<span class="mem-pares">Pares: <b id="mepares">0</b>/' + total + '</span></div>' +
      '<div class="mem-grid" id="megrid"></div></div>';

    var grid = root.querySelector('#megrid');
    cards.forEach(function (card, i) {
      var el = document.createElement('button');
      el.className = 'mem-card';
      el.dataset.i = i;
      el.innerHTML = '<div class="mem-inner"><div class="mem-front"><span>' + ZI('star') + '</span></div>' +
        '<div class="mem-back">' + (card.img ? '<img src="' + ZU.esc(card.img) + '" alt="">' : '<span>' + ZU.esc(card.text) + '</span>') + '</div></div>';
      el.onclick = function () { voltear(el, card); };
      grid.appendChild(el);
    });

    function voltear(el, card) {
      if (destroyed || lock) return;
      if (el.classList.contains('up') || el.classList.contains('done')) return;
      el.classList.add('up');
      if (!first) { first = { el: el, card: card }; return; }
      moves++;
      root.querySelector('#memoves').textContent = moves;
      var f = first; first = null;
      if (f.card.pair === card.pair) {
        f.el.classList.add('done');
        el.classList.add('done');
        matched++;
        root.querySelector('#mepares').textContent = matched;
        ZU.toast('¡Par encontrado!');
        if (matched === total) {
          setTimeout(function () {
            ctx.finish({
              score: Math.max(0, Math.round(100 * total / moves)),
              correct: total, total: total,
              answers: [],
              message: 'Lo lograste en ' + moves + ' movidas'
            });
          }, 700);
        }
      } else {
        lock = true;
        setTimeout(function () {
          f.el.classList.remove('up');
          el.classList.remove('up');
          lock = false;
        }, 850);
      }
      ctx.reportHeight();
    }

    return { destroy: function () { destroyed = true; } };
  }
  ZGTYPES.memory = { play: play };
})();
