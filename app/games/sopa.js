/* ZEIRO JUEGOS · Sopa de Letras */
(function () {
  var DIRS = [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 0], [0, -1], [-1, -1], [-1, 1]];
  var LETRAS = 'AAAAABCDEEEEEEEEIIIIIIILMMMMNNNNNÑOOOOOOORRRRRRSSSSSSTTTTTTUUUUUULL';

  function normW(w) { return ZU.norm(w).toUpperCase().replace(/[^A-ZÑ]/g, ''); }

  function generar(words, size) {
    words = words.map(function (w) { return normW(w); }).filter(function (w) { return w.length >= 2; });
    var n = size || 12;
    var grid, placed;
    var intentos = 0;
    do {
      grid = [];
      for (var i = 0; i < n; i++) { grid.push(new Array(n).fill('')); }
      placed = [];
      var orden = ZU.shuffle(words);
      var okAll = true;
      for (var k = 0; k < orden.length; k++) {
        var w = orden[k];
        var ok = false;
        for (var t = 0; t < 300 && !ok; t++) {
          var d = DIRS[Math.floor(Math.random() * DIRS.length)];
          var maxR = d[1] === 0 ? n - 1 : (d[1] > 0 ? n - w.length : w.length - 1);
          var r = d[1] > 0 ? Math.floor(Math.random() * (n - w.length + 1)) : Math.floor(Math.random() * (n - w.length + 1));
          var c = d[0] > 0 ? Math.floor(Math.random() * (n - w.length + 1)) : Math.floor(Math.random() * (n - w.length + 1));
          if (d[0] < 0) c = n - w.length - c;
          if (d[1] < 0) r = n - w.length - r;
          if (r < 0 || c < 0 || r + d[1] * (w.length - 1) < 0 || r + d[1] * (w.length - 1) >= n ||
              c + d[0] * (w.length - 1) < 0 || c + d[0] * (w.length - 1) >= n) continue;
          var libre = true;
          for (var j = 0; j < w.length; j++) {
            var rr = r + d[1] * j, cc = c + d[0] * j;
            if (grid[rr][cc] && grid[rr][cc] !== w[j]) { libre = false; break; }
          }
          if (!libre) continue;
          for (var j2 = 0; j2 < w.length; j2++) grid[r + d[1] * j2][c + d[0] * j2] = w[j2];
          placed.push({ word: w, r: r, c: c, d: d });
          ok = true;
        }
        if (!ok) { okAll = false; break; }
      }
      intentos++;
      if (!okAll && intentos > 60) break;
    } while (!okAll && intentos < 60);
    /* rellenar huecos */
    for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) {
      if (!grid[a][b]) grid[a][b] = LETRAS[Math.floor(Math.random() * LETRAS.length)];
    }
    return { grid: grid, n: n, placed: placed };
  }

  function play(root, content, options, ctx) {
    var items = (content.words || []).map(function (w) {
      return typeof w === 'string' ? { word: w } : w;
    }).filter(function (w) { return w && w.word; });
    if (!items.length) { root.innerHTML = '<div class="vacio">La sopa no tiene palabras.</div>'; return {}; }
    var words = items.map(function (it) { return { orig: it.word, norm: normW(it.word), clue: it.clue || '' }; });
    var maxLen = 0;
    words.forEach(function (w) { if (w.norm.length > maxLen) maxLen = w.norm.length; });
    var size = content.size ? parseInt(content.size, 10) : Math.max(10, Math.min(16, maxLen + 6));
    var data = generar(words.map(function (w) { return w.norm; }), size);
    var n = data.n;
    var grid = data.grid;
    var showBank = content.showBank !== false;
    var lives = content.lives ? parseInt(content.lives, 10) : 0;
    var timeLimit = content.timeLimit ? parseInt(content.timeLimit, 10) : 0;

    var found = {};
    var livesLeft = lives;
    var timer = null;
    var destroyed = false;
    var answers = [];

    function quedan() { return words.filter(function (w) { return !found[w.norm]; }); }

    root.innerHTML =
      '<div class="sopa">' +
      '<div class="sopa-bar">' +
      '<div class="sopa-prog"><i id="sprog" style="width:0%"></i></div>' +
      '<span class="sopa-cont" id="scont">0 / ' + words.length + '</span>' +
      (lives ? '<span class="sopa-vidas" id="svidas"></span>' : '') +
      (timeLimit ? '<span class="sopa-tiempo" id="stiem"></span>' : '') +
      '<button class="btn ghost small" id="stoggle">' + (showBank ? 'Ocultar lista' : 'Ver lista') + '</button>' +
      '<button class="btn ghost small" id="sterminar">Terminar</button>' +
      '</div>' +
      '<div class="sopa-main">' +
      '<div class="sopa-gridwrap"><div class="sopa-grid" id="sgrid" style="grid-template-columns:repeat(' + n + ',1fr)"></div>' +
      '<div class="sopa-seleccion" id="ssel"></div></div>' +
      (showBank ? '<div class="sopa-bank" id="sbank"><h4>Palabras</h4><ul id="sbanklist"></ul></div>' : '<div class="sopa-bank oculto" id="sbank"><h4>Palabras</h4><ul id="sbanklist"></ul></div>') +
      '</div></div>';

    var gridEl = root.querySelector('#sgrid');
    var cellEls = [];
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        var d = document.createElement('div');
        d.className = 'scell';
        d.textContent = grid[r][c];
        d.dataset.r = r; d.dataset.c = c;
        gridEl.appendChild(d);
        cellEls.push(d);
      }
    }
    function cellAt(r, c) { return gridEl.querySelector('.scell[data-r="' + r + '"][data-c="' + c + '"]'); }

    /* banco de palabras */
    var bankList = root.querySelector('#sbanklist');
    words.forEach(function (w) {
      var li = document.createElement('li');
      li.dataset.w = w.norm;
      li.innerHTML = '<span>' + ZU.esc(w.orig) + '</span>' + (w.clue ? '<small>' + ZU.esc(w.clue) + '</small>' : '');
      bankList.appendChild(li);
    });

    function pintarProgreso() {
      var f = words.length - quedan().length;
      root.querySelector('#sprog').style.width = Math.round(100 * f / words.length) + '%';
      root.querySelector('#scont').textContent = f + ' / ' + words.length;
      if (lives) {
        var v = '';
        for (var i = 0; i < lives; i++) v += '<span class="vida ' + (i < livesLeft ? 'on' : '') + '">' + ZI('heart') + '</span>';
        root.querySelector('#svidas').innerHTML = v;
      }
      ctx.reportHeight();
    }
    pintarProgreso();

    root.querySelector('#stoggle').onclick = function () {
      var b = root.querySelector('#sbank');
      b.classList.toggle('oculto');
      this.textContent = b.classList.contains('oculto') ? 'Ver lista' : 'Ocultar lista';
    };
    root.querySelector('#sterminar').onclick = function () { terminar(); };

    /* selección con mouse/touch */
    var startCell = null, curCell = null, dragging = false, moved = false;
    function posDe(e) {
      var rect = gridEl.getBoundingClientRect();
      var x = (e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0)) - rect.left;
      var y = (e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0)) - rect.top;
      var cw = rect.width / n, ch = rect.height / n;
      var c = Math.floor(x / cw), r = Math.floor(y / ch);
      if (r < 0 || c < 0 || r >= n || c >= n) return null;
      return { r: r, c: c };
    }
    function linea(a, b) {
      var dr = b.r - a.r, dc = b.c - a.c;
      if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
      var cells = [];
      var steps = Math.max(Math.abs(dr), Math.abs(dc));
      var sr = dr === 0 ? 0 : (dr > 0 ? 1 : -1);
      var sc = dc === 0 ? 0 : (dc > 0 ? 1 : -1);
      for (var i = 0; i <= steps; i++) cells.push({ r: a.r + sr * i, c: a.c + sc * i });
      return cells;
    }
    function pintarSel(cells) {
      Array.prototype.forEach.call(gridEl.querySelectorAll('.scell'), function (el) { el.classList.remove('sel'); });
      (cells || []).forEach(function (p) { var el = cellAt(p.r, p.c); if (el) el.classList.add('sel'); });
    }
    function evaluar(cells) {
      if (!cells || cells.length < 2) { pintarSel(null); return; }
      var str = cells.map(function (p) { return grid[p.r][p.c]; }).join('');
      var rev = str.split('').reverse().join('');
      var hit = null;
      quedan().forEach(function (w) {
        if (!hit && (w.norm === str || w.norm === rev)) hit = w;
      });
      if (hit) {
        found[hit.norm] = true;
        answers.push({ w: hit.norm, ok: true });
        cells.forEach(function (p) { var el = cellAt(p.r, p.c); if (el) el.classList.add('found'); });
        var li = bankList.querySelector('li[data-w="' + hit.norm + '"]');
        if (li) li.classList.add('found');
        ZU.toast('¡Encontraste: ' + hit.orig + '!');
        pintarProgreso();
        if (!quedan().length) { setTimeout(terminar, 600); }
      } else {
        answers.push({ w: str, ok: false });
        cells.forEach(function (p) { var el = cellAt(p.r, p.c); if (el) { el.classList.add('miss'); setTimeout(function () { el.classList.remove('miss'); }, 350); } });
        if (lives) {
          livesLeft--;
          pintarProgreso();
          if (livesLeft <= 0) { setTimeout(terminar, 500); return; }
        }
      }
      pintarSel(null);
    }

    function onDown(e) {
      var p = posDe(e);
      if (!p) return;
      dragging = true; moved = false;
      startCell = p; curCell = p;
      pintarSel([p]);
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      var p = posDe(e);
      if (!p) return;
      curCell = p;
      var cells = linea(startCell, p);
      if (cells && cells.length > 1) moved = true;
      pintarSel(cells || [startCell]);
      e.preventDefault();
    }
    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      var p = posDe(e) || curCell;
      if (!moved) {
        /* modo clic-clic */
        var pend = gridEl.getAttribute('data-pend');
        if (!pend) {
          gridEl.setAttribute('data-pend', p.r + ',' + p.c);
          pintarSel([{ r: p.r, c: p.c }]);
          var el = cellAt(p.r, p.c); if (el) el.classList.add('pend');
          return;
        } else {
          var parts = pend.split(',');
          var a = { r: Number(parts[0]), c: Number(parts[1]) };
          gridEl.removeAttribute('data-pend');
          Array.prototype.forEach.call(gridEl.querySelectorAll('.scell.pend'), function (el) { el.classList.remove('pend'); });
          var cells2 = linea(a, p);
          evaluar(cells2 && cells2.length > 1 ? cells2 : null);
          return;
        }
      }
      var cells = linea(startCell, p);
      evaluar(cells);
    }
    gridEl.addEventListener('mousedown', onDown);
    gridEl.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    gridEl.addEventListener('touchstart', onDown, { passive: false });
    gridEl.addEventListener('touchmove', onMove, { passive: false });
    gridEl.addEventListener('touchend', onUp);

    if (timeLimit > 0) {
      var tEl = root.querySelector('#stiem');
      timer = ZG.temporizador(timeLimit, function (l) {
        if (tEl) {
          tEl.textContent = '⏱ ' + ZU.fmtTime(l * 1000);
          tEl.className = 'sopa-tiempo ' + (l <= 10 ? 'urgente' : '');
        }
      }, function () { terminar(); });
    }

    function terminar() {
      if (destroyed) return;
      destroyed = true;
      if (timer) { timer.stop(); timer = null; }
      var f = words.length - quedan().length;
      ctx.finish({
        score: Math.round(100 * f / words.length),
        correct: f, total: words.length,
        timeMs: undefined,
        answers: answers.slice(0, 300),
        message: f === words.length ? '¡Las encontraste todas!' : 'Encontraste ' + f + ' de ' + words.length
      });
    }

    return {
      destroy: function () {
        destroyed = true;
        if (timer) timer.stop();
        gridEl.removeEventListener('mousedown', onDown);
        gridEl.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        gridEl.removeEventListener('touchstart', onDown);
        gridEl.removeEventListener('touchmove', onMove);
        gridEl.removeEventListener('touchend', onUp);
      }
    };
  }
  ZGTYPES.sopa = { play: play };
})();
