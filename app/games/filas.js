/* ZEIRO JUEGOS · Filas (ordenar tarjetas por criterio) */
(function () {
  function play(root, content, options, ctx) {
    var lists = (content.lists || []).filter(function (l) { return l && (l.items || []).length >= 2; });
    if (!lists.length) { root.innerHTML = '<div class="vacio">El juego no tiene filas para ordenar.</div>'; return {}; }
    var destroyed = false;
    var totalItems = 0;
    lists.forEach(function (l) { totalItems += l.items.length; });

    /* estado por lista: orden actual de índices */
    var orden = lists.map(function (l) {
      return l.items.map(function (_, i) { return i; });
    });

    function valorDe(item) {
      var v = item.value;
      if (v == null) return 0;
      if (typeof v === 'number') return v;
      var n = parseFloat(v);
      if (!isNaN(n) && String(v).trim() !== '') return n;
      var t = Date.parse(v);
      if (!isNaN(t)) return t;
      return 0;
    }
    function ordenCorrecto(l) {
      var dir = l.direction === 'desc' ? -1 : 1;
      return l.items.map(function (_, i) { return i; }).sort(function (a, b) {
        return (valorDe(l.items[a]) - valorDe(l.items[b])) * dir;
      });
    }

    root.innerHTML = '<div class="filas">' +
      '<div class="fil-instr">Arrastrá las tarjetas (o usá las flechas) para ordenarlas según el criterio de cada fila.</div>' +
      '<div id="filaswrap"></div>' +
      '<div class="fil-acciones"><button class="btn primary" id="filchk">Comprobar</button></div>' +
      '<div class="fil-msg" id="filmsg"></div></div>';

    var wrap = root.querySelector('#filaswrap');

    lists.forEach(function (l, li) {
      var sec = document.createElement('div');
      sec.className = 'fil-lista';
      var titulo = l.title || ('Fila ' + (li + 1));
      var crit = l.direction === 'desc' ? 'de mayor a menor' : 'de menor a mayor';
      sec.innerHTML = '<h4>' + ZU.esc(titulo) + ' <small>(' + crit + ')</small></h4><div class="fil-cards" data-li="' + li + '"></div>';
      wrap.appendChild(sec);
      pintarLista(li);
    });

    function pintarLista(li) {
      var cont = wrap.querySelector('.fil-cards[data-li="' + li + '"]');
      cont.innerHTML = '';
      orden[li].forEach(function (itemIdx, pos) {
        var item = lists[li].items[itemIdx];
        var card = document.createElement('div');
        card.className = 'fil-card';
        card.draggable = true;
        card.dataset.pos = pos;
        card.innerHTML = '<span class="fil-grip">' + ZI('drag') + '</span><span class="fil-texto">' + ZU.esc(item.text) + '</span>' +
          '<span class="fil-flechas"><button class="btn ghost small" data-mv="-1" title="Subir">↑</button>' +
          '<button class="btn ghost small" data-mv="1" title="Bajar">↓</button></span>';
        /* drag & drop */
        card.addEventListener('dragstart', function (e) {
          e.dataTransfer.setData('text/plain', li + ':' + pos);
          e.dataTransfer.effectAllowed = 'move';
          card.classList.add('dragging');
        });
        card.addEventListener('dragend', function () { card.classList.remove('dragging'); });
        card.addEventListener('dragover', function (e) { e.preventDefault(); card.classList.add('over'); });
        card.addEventListener('dragleave', function () { card.classList.remove('over'); });
        card.addEventListener('drop', function (e) {
          e.preventDefault();
          card.classList.remove('over');
          var data = e.dataTransfer.getData('text/plain');
          var parts = data.split(':');
          var fromLi = Number(parts[0]), fromPos = Number(parts[1]);
          if (fromLi !== li) return;
          mover(li, fromPos, pos);
        });
        /* flechas */
        card.querySelectorAll('.fil-flechas button').forEach(function (b) {
          b.onclick = function () {
            var mv = Number(b.dataset.mv);
            mover(li, pos, pos + mv);
          };
        });
        cont.appendChild(card);
      });
    }

    function mover(li, from, to) {
      if (to < 0 || to >= orden[li].length || from === to) return;
      var arr = orden[li].slice();
      var item = arr.splice(from, 1)[0];
      arr.splice(to, 0, item);
      orden[li] = arr;
      pintarLista(li);
    }

    root.querySelector('#filchk').onclick = function () {
      var correctas = 0;
      lists.forEach(function (l, li) {
        var correcto = ordenCorrecto(l);
        orden[li].forEach(function (itemIdx, pos) {
          if (itemIdx === correcto[pos]) correctas++;
        });
      });
      var msg = root.querySelector('#filmsg');
      msg.innerHTML = '<span class="' + (correctas === totalItems ? 'ok' : 'mal') + '">Posiciones correctas: <b>' + correctas + '</b> de ' + totalItems + '</span>';
      ctx.reportHeight();
      if (correctas === totalItems) {
        setTimeout(function () {
          ctx.finish({
            score: 100, correct: correctas, total: totalItems,
            answers: [],
            message: '¡Ordenaste todo perfecto!'
          });
        }, 1200);
      }
    };

    return { destroy: function () { destroyed = true; } };
  }
  ZGTYPES.filas = { play: play };
})();
