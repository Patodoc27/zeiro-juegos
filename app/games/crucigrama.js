/* ZEIRO JUEGOS · Crucigrama (generado automáticamente) */
(function () {
  function normC(s) {
    return ZU.norm(s).toUpperCase().replace(/[^A-ZÑ]/g, '');
  }

  /* Genera la disposición (backtracking). Reglas clásicas: las letras que se
     cruzan coinciden, las palabras no se tocan en perpendicular y no hay letra
     antes del inicio ni después del final de cada palabra. */
  function generar(crucigrama) {
    var clues = (crucigrama.clues || []).map(function (c, i) {
      return { clue: c.clue || '', answer: normC(c.answer), idx: i };
    }).filter(function (c) { return c.answer.length >= 2; });
    if (!clues.length) return null;
    var orden = clues.slice().sort(function (a, b) { return b.answer.length - a.answer.length; });

    /* occ["r,c"] = { ch, ws: { wi: dir } } */
    var occ = {};
    var placed = [];
    var nodes = 0;
    var MAXNODES = 60000;

    function key(r, c) { return r + ',' + c; }
    function step(dir, j) { return dir === 0 ? { r: 0, c: j } : { r: j, c: 0 }; }

    function puede(w, r0, c0, dir) {
      var len = w.answer.length;
      var s = step(dir, 1);
      if (occ[key(r0 - s.r, c0 - s.c)]) return false;
      var lr = r0 + s.r * (len - 1), lc = c0 + s.c * (len - 1);
      if (occ[key(lr + s.r, lc + s.c)]) return false;
      var perR = dir === 0 ? 1 : 0, perC = dir === 0 ? 0 : 1;
      var perDir = dir === 0 ? 1 : 0; /* dirección de la palabra que cruza */
      for (var j = 0; j < len; j++) {
        var r = r0 + s.r * j, c = c0 + s.c * j;
        var cell = occ[key(r, c)];
        if (cell && cell.ch !== w.answer[j]) return false;
        /* vecinos perpendiculares: libres, o parte del mismo cruce */
        var n1 = occ[key(r + perR, c + perC)];
        var n2 = occ[key(r - perR, c - perC)];
        if (n1 && !(cell && tieneDir(cell, perDir) && tieneDir(n1, perDir))) return false;
        if (n2 && !(cell && tieneDir(cell, perDir) && tieneDir(n2, perDir))) return false;
      }
      return true;
    }

    function poner(w, r0, c0, dir, wi) {
      var s = step(dir, 1);
      var cells = [];
      for (var j = 0; j < w.answer.length; j++) {
        var r = r0 + s.r * j, c = c0 + s.c * j;
        var k = key(r, c);
        if (!occ[k]) occ[k] = { ch: w.answer[j], ws: {} };
        occ[k].ws[wi] = dir;
        cells.push({ r: r, c: c });
      }
      return cells;
    }
    function quitar(cells, wi) {
      cells.forEach(function (cell) {
        var k = key(cell.r, cell.c);
        var info = occ[k];
        if (!info) return;
        delete info.ws[wi];
        if (Object.keys(info.ws).length === 0) delete occ[k];
      });
    }
    function tieneDir(info, dir) {
      if (!info) return false;
      for (var wi in info.ws) if (info.ws[wi] === dir) return true;
      return false;
    }

    function candidatos() {
      var set = {}, list = [];
      Object.keys(occ).forEach(function (k) {
        var p = k.split(','); var r = Number(p[0]), c = Number(p[1]);
        for (var dr = -2; dr <= 2; dr++) for (var dc = -2; dc <= 2; dc++) {
          if (!dr && !dc) continue;
          var kk = (r + dr) + ',' + (c + dc);
          if (!occ[kk] && !set[kk]) { set[kk] = true; list.push({ r: r + dr, c: c + dc }); }
        }
      });
      return list;
    }

    function backtrack(i) {
      if (i >= orden.length) return true;
      if (++nodes > MAXNODES) return false;
      var w = orden[i];
      var cands = i === 0 ? [{ r: 0, c: 0 }] : candidatos();
      var dirs = ZU.shuffle([0, 1]);
      for (var di = 0; di < dirs.length; di++) {
        var dir = dirs[di];
        for (var ci = 0; ci < cands.length; ci++) {
          var pos = cands[ci];
          if (puede(w, pos.r, pos.c, dir)) {
            var cells = poner(w, pos.r, pos.c, dir, w.idx);
            placed.push({ wi: w.idx, clue: w.clue, answer: w.answer, dir: dir, r0: pos.r, c0: pos.c, cells: cells });
            if (backtrack(i + 1)) return true;
            placed.pop();
            quitar(cells, w.idx);
            if (nodes > MAXNODES) return false;
          }
        }
      }
      return false;
    }

    var ok = backtrack(0);
    if (!ok || !placed.length) return null;

    var minR = 1e9, maxR = -1e9, minC = 1e9, maxC = -1e9;
    Object.keys(occ).forEach(function (k) {
      var p = k.split(','); var r = Number(p[0]), c = Number(p[1]);
      minR = Math.min(minR, r); maxR = Math.max(maxR, r);
      minC = Math.min(minC, c); maxC = Math.max(maxC, c);
    });
    var offR = -minR, offC = -minC;
    var H = maxR - minR + 1, W = maxC - minC + 1;
    if (H > 24 || W > 24) return null;

    /* números de casilla */
    var nums = {};
    var num = 1;
    var keys = Object.keys(occ).map(function (k) { var p = k.split(','); return { r: Number(p[0]), c: Number(p[1]) }; });
    keys.sort(function (a, b) { return a.r - b.r || a.c - b.c; });
    keys.forEach(function (cell) {
      var k = key(cell.r, cell.c);
      var info = occ[k];
      var izq = occ[key(cell.r, cell.c - 1)];
      var arriba = occ[key(cell.r - 1, cell.c)];
      var iniH = tieneDir(info, 0) && !tieneDir(izq, 0);
      var iniV = tieneDir(info, 1) && !tieneDir(arriba, 1);
      if (iniH || iniV) nums[k] = num++;
    });

    var wordsOut = placed.map(function (pw) {
      var cells = pw.cells.map(function (cc) { return { r: cc.r + offR, c: cc.c + offC }; });
      return {
        clue: pw.clue, answer: pw.answer, dir: pw.dir === 0 ? 'h' : 'v',
        numero: nums[key(pw.r0, pw.c0)] || null,
        len: pw.answer.length, cells: cells
      };
    }).filter(function (w) { return w.numero != null; });
    wordsOut.sort(function (a, b) { return a.numero - b.numero; });

    var cellsOut = {};
    Object.keys(occ).forEach(function (k) {
      var p = k.split(',');
      cellsOut[(Number(p[0]) + offR) + ',' + (Number(p[1]) + offC)] = occ[k];
    });

    return { H: H, W: W, cells: cellsOut, nums: nums, words: wordsOut };
  }

  function play(root, content, options, ctx) {
    var crucigrama = (content.crosswords && content.crosswords.length) ? content.crosswords : [content];
    var dataIdx = 0, layout = null, destroyed = false;
    var ultimoCheck = {};

    function construir(idx) {
      dataIdx = idx;
      var cg = crucigrama[idx];
      layout = null;
      for (var intento = 0; intento < 25 && !layout; intento++) {
        layout = generar(cg);
        if (!layout) break; /* el azar ya está dentro; reintentar no cambia el orden */
      }
      /* reintentos con orden distinto */
      for (var t = 0; t < 15 && !layout; t++) {
        layout = generar({ clues: ZU.shuffle((cg.clues || []).slice()) });
      }
      if (!layout) {
        root.innerHTML = '<div class="vacio">No se pudo generar el crucigrama con esas pistas. Revisá que las respuestas tengan al menos 2 letras y que se crucen entre sí.</div>';
        return;
      }
      ultimoCheck = {};
      render();
    }

    function render() {
      if (destroyed) return;
      var cg = crucigrama[dataIdx];
      var H = layout.H, W = layout.W;
      var tabs = crucigrama.length > 1 ? '<div class="cg-tabs">' + crucigrama.map(function (c, i) {
        return '<button class="btn small ' + (i === dataIdx ? 'primary' : 'ghost') + '" data-cg="' + i + '">' + ZU.esc(c.title || ('Crucigrama ' + (i + 1))) + '</button>';
      }).join('') + '</div>' : '';

      var horiz = layout.words.filter(function (w) { return w.dir === 'h'; });
      var vert = layout.words.filter(function (w) { return w.dir === 'v'; });
      function lista(ws) {
        return ws.map(function (w) {
          return '<li><b>' + w.numero + '.</b> ' + ZU.esc(w.clue) + ' <small>(' + w.len + ')</small></li>';
        }).join('');
      }

      var table = '<table class="cg-table"><tbody>';
      for (var r = 0; r < H; r++) {
        table += '<tr>';
        for (var c = 0; c < W; c++) {
          var info = layout.cells[r + ',' + c];
          var num = layout.nums[r + ',' + c];
          if (!info) { table += '<td class="cg-vacia"></td>'; continue; }
          table += '<td class="cg-celda" data-r="' + r + '" data-c="' + c + '">' +
            (num ? '<span class="cg-num">' + num + '</span>' : '') +
            '<input type="text" maxlength="1" autocomplete="off" autocapitalize="characters" spellcheck="false"></td>';
        }
        table += '</tr>';
      }
      table += '</tbody></table>';

      root.innerHTML =
        '<div class="crucigrama">' + tabs +
        '<div class="cg-main"><div class="cg-tabla-wrap">' + table + '</div>' +
        '<div class="cg-pistas"><div class="cg-pistas-col"><h4>Horizontal</h4><ul>' + (horiz.length ? lista(horiz) : '<li class="muted">—</li>') + '</ul></div>' +
        '<div class="cg-pistas-col"><h4>Vertical</h4><ul>' + (vert.length ? lista(vert) : '<li class="muted">—</li>') + '</ul></div></div></div>' +
        '<div class="cg-acciones"><button class="btn primary" id="cgcheck">Comprobar</button>' +
        '<button class="btn ghost" id="cgregen">' + ZI('refresh') + 'Regenerar</button>' +
        '<button class="btn ghost" id="cgfin">Terminar</button></div>' +
        '<div class="cg-resultado" id="cgresult"></div></div>';

      var inputs = Array.prototype.slice.call(root.querySelectorAll('.cg-celda input'));
      inputs.forEach(function (inp, i) {
        inp.addEventListener('input', function () {
          var v = inp.value.toUpperCase().replace(/[^A-ZÑ]/g, '');
          inp.value = v ? v.charAt(v.length - 1) : '';
          if (inp.value && i + 1 < inputs.length) inputs[i + 1].focus();
        });
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); if (i + 1 < inputs.length) inputs[i + 1].focus(); }
          if (e.key === 'Backspace' && !inp.value && i > 0) { e.preventDefault(); inputs[i - 1].focus(); }
        });
      });

      root.querySelectorAll('.cg-tabs .btn').forEach(function (b) {
        b.onclick = function () { if (!destroyed) construir(Number(b.dataset.cg)); };
      });
      root.querySelector('#cgcheck').onclick = comprobar;
      root.querySelector('#cgregen').onclick = function () { if (!destroyed) construir(dataIdx); };
      root.querySelector('#cgfin').onclick = terminar;
      ctx.reportHeight();
    }

    function leer() {
      var out = {};
      layout.words.forEach(function (w) {
        w.cells.forEach(function (cell, i) {
          var inp = root.querySelector('.cg-celda[data-r="' + cell.r + '"][data-c="' + cell.c + '"] input');
          out[w.numero + ':' + i] = normC(inp.value);
        });
      });
      return out;
    }

    function evaluar() {
      var vals = leer();
      var correctas = 0;
      layout.words.forEach(function (w) {
        var ok = true;
        w.cells.forEach(function (cell, i) {
          if (vals[w.numero + ':' + i] !== w.answer[i]) ok = false;
        });
        if (ok) correctas++;
        ultimoCheck[w.numero] = ok;
      });
      return correctas;
    }

    function comprobar() {
      var correctas = evaluar();
      layout.words.forEach(function (w) {
        w.cells.forEach(function (cell, i) {
          var inp = root.querySelector('.cg-celda[data-r="' + cell.r + '"][data-c="' + cell.c + '"] input');
          var td = inp.closest('.cg-celda');
          td.classList.remove('ok', 'mal');
          var val = normC(inp.value);
          if (val && val === w.answer[i]) td.classList.add('ok');
          else if (val) td.classList.add('mal');
        });
      });
      var res = root.querySelector('#cgresult');
      res.innerHTML = '<div class="cg-msg ' + (correctas === layout.words.length ? 'ok' : '') + '">' +
        'Palabras completas correctas: <b>' + correctas + '</b> de ' + layout.words.length + '</div>';
      ctx.reportHeight();
    }

    function terminar() {
      if (destroyed) return;
      destroyed = true;
      var correctas = evaluar();
      var answers = layout.words.map(function (w) { return { n: w.numero, ok: !!ultimoCheck[w.numero] }; });
      ctx.finish({
        score: Math.round(100 * correctas / layout.words.length),
        correct: correctas, total: layout.words.length,
        answers: answers,
        message: correctas + ' de ' + layout.words.length + ' palabras completas'
      });
    }

    construir(0);
    return { destroy: function () { destroyed = true; } };
  }
  ZGTYPES.crucigrama = { play: play };
})();
