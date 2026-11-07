/* ZEIRO JUEGOS · Relacionar Grupos (clasificar tarjetas) */
(function () {
  var COLORES = ['#7C3AED', '#0891B2', '#16A34A', '#DC2626', '#D97706', '#DB2777', '#4F46E5', '#0D9488'];

  function play(root, content, options, ctx) {
    var groups = (content.groups || []).filter(function (g) { return g && g.name; });
    var cards = (content.cards || []).filter(function (c) { return c && c.text; });
    if (!groups.length || !cards.length) { root.innerHTML = '<div class="vacio">El juego necesita grupos y tarjetas.</div>'; return {}; }
    var destroyed = false;
    var asignadas = {}; /* cardIdx -> [groupIdx...] */
    var selCard = null;

    cards.forEach(function (c, i) { asignadas[i] = []; });

    function color(i) { return COLORES[i % COLORES.length]; }

    root.innerHTML = '<div class="grupos">' +
      '<div class="gru-instr">Tocá una tarjeta y después el grupo al que pertenece. Una tarjeta puede ir a varios grupos.</div>' +
      '<div class="gru-grupos" id="grugroups"></div>' +
      '<div class="gru-cartas" id="grucards"></div>' +
      '<div class="gru-acciones"><button class="btn primary" id="gruchk" disabled>Comprobar</button></div>' +
      '<div class="gru-msg" id="grumsg"></div></div>';

    var groupsEl = root.querySelector('#grugroups');
    var cardsEl = root.querySelector('#grucards');

    groups.forEach(function (g, gi) {
      var zone = document.createElement('div');
      zone.className = 'gru-zone';
      zone.style.borderColor = color(gi);
      zone.innerHTML = '<h4 style="color:' + color(gi) + '">' + ZU.esc(g.name) + '</h4><div class="gru-zone-items" data-g="' + gi + '"></div>';
      zone.onclick = function (e) {
        if (e.target.closest('.gru-chip')) return; /* click en chip = quitar */
        if (selCard === null) { ZU.toast('Primero elegí una tarjeta'); return; }
        asignar(selCard, gi);
      };
      groupsEl.appendChild(zone);
    });
    cards.forEach(function (c, ci) {
      var b = document.createElement('button');
      b.className = 'gru-card';
      b.textContent = c.text;
      b.dataset.i = ci;
      b.onclick = function () {
        if (selCard === ci) { selCard = null; b.classList.remove('sel'); return; }
        selCard = ci;
        Array.prototype.forEach.call(cardsEl.querySelectorAll('.gru-card'), function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
        /* mostrar a qué grupos ya pertenece */
        ZU.toast('Tarjeta elegida: tocá el grupo');
      };
      cardsEl.appendChild(b);
    });

    function asignar(ci, gi) {
      var arr = asignadas[ci];
      var pos = arr.indexOf(gi);
      if (pos === -1) arr.push(gi); else arr.splice(pos, 1);
      renderChips();
      root.querySelector('#gruchk').disabled = false;
      ctx.reportHeight();
    }
    function renderChips() {
      /* limpiar zonas */
      groupsEl.querySelectorAll('.gru-zone-items').forEach(function (z) { z.innerHTML = ''; });
      cards.forEach(function (c, ci) {
        asignadas[ci].forEach(function (gi) {
          var zone = groupsEl.querySelector('.gru-zone-items[data-g="' + gi + '"]');
          if (!zone) return;
          var chip = document.createElement('button');
          chip.className = 'gru-chip';
          chip.style.background = color(gi);
          chip.textContent = c.text;
          chip.onclick = function (e) {
            e.stopPropagation();
            asignadas[ci] = asignadas[ci].filter(function (x) { return x !== gi; });
            renderChips();
          };
          zone.appendChild(chip);
        });
      });
    }

    root.querySelector('#gruchk').onclick = function () {
      var correctas = 0;
      cards.forEach(function (c, ci) {
        var esperado = (c.groups || []).slice().sort();
        var actual = asignadas[ci].slice().sort();
        var ok = esperado.length === actual.length && esperado.every(function (g, i) { return g === actual[i]; });
        if (ok) correctas++;
        var cardEl = cardsEl.querySelector('.gru-card[data-i="' + ci + '"]');
        if (cardEl) cardEl.classList.toggle('ok', ok);
      });
      var msg = root.querySelector('#grumsg');
      msg.innerHTML = '<span class="' + (correctas === cards.length ? 'ok' : 'mal') + '">Clasificaste bien ' + correctas + ' de ' + cards.length + ' tarjetas</span>';
      ctx.reportHeight();
      if (correctas === cards.length) {
        setTimeout(function () {
          ctx.finish({
            score: 100, correct: correctas, total: cards.length,
            answers: [],
            message: '¡Clasificación perfecta!'
          });
        }, 1200);
      }
    };

    renderChips();
    return { destroy: function () { destroyed = true; } };
  }
  ZGTYPES.grupos = { play: play };
})();
