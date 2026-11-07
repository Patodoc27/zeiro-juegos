/* ZEIRO JUEGOS · Relacionar Columnas */
(function () {
  function play(root, content, options, ctx) {
    var screens = (content.screens && content.screens.length) ? content.screens : [{
      pairs: content.pairs || [], extraLeft: content.extraLeft || [], extraRight: content.extraRight || []
    }];
    screens = screens.filter(function (s) { return (s.pairs || []).length; });
    if (!screens.length) { root.innerHTML = '<div class="vacio">El juego no tiene pares para relacionar.</div>'; return {}; }

    var si = 0;
    var totalPairs = 0, totalOk = 0;
    var matches = {};
    var destroyed = false;
    var fase = 'jugar'; /* jugar | visto */
    screens.forEach(function (s) { totalPairs += s.pairs.length; });

    function screen() { return screens[si]; }

    function render() {
      if (destroyed) return;
      var s = screen();
      matches = {};
      fase = 'jugar';
      var lefts = s.pairs.map(function (p, i) { return { text: p.left, idx: i }; })
        .concat((s.extraLeft || []).map(function (t, i) { return { text: t, idx: 1000 + i }; }));
      var rights = s.pairs.map(function (p, i) { return { text: p.right, idx: i }; })
        .concat((s.extraRight || []).map(function (t, i) { return { text: t, idx: 1000 + i }; }));
      lefts = ZU.shuffle(lefts);
      rights = ZU.shuffle(rights);

      var esUltima = si === screens.length - 1;
      root.innerHTML = '<div class="columnas">' +
        '<div class="col-prog"><div class="col-progbar"><i style="width:' + Math.round(100 * si / screens.length) + '%"></i></div>' +
        '<span>Pantalla ' + (si + 1) + ' de ' + screens.length + '</span></div>' +
        '<div class="col-instr">Tocá una tarjeta de la izquierda y después su pareja de la derecha.</div>' +
        '<div class="col-tabla" id="coltab">' +
        '<div class="col-col" id="colL"></div>' +
        '<div class="col-col" id="colR"></div>' +
        '<svg class="col-svg" id="colsvg"></svg>' +
        '</div>' +
        '<div class="col-acciones"><button class="btn primary" id="colcheck" disabled>Comprobar</button></div>' +
        '<div class="col-msg" id="colmsg"></div></div>';

      var colL = root.querySelector('#colL');
      var colR = root.querySelector('#colR');
      var selL = null;

      lefts.forEach(function (item) {
        var b = document.createElement('button');
        b.className = 'col-card';
        b.textContent = item.text;
        b.dataset.idx = item.idx;
        b.onclick = function () {
          if (matches[item.idx] !== undefined) { quitar(item.idx); return; }
          Array.prototype.forEach.call(colL.querySelectorAll('.col-card'), function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
          selL = item.idx;
        };
        colL.appendChild(b);
      });
      rights.forEach(function (item) {
        var b = document.createElement('button');
        b.className = 'col-card';
        b.textContent = item.text;
        b.dataset.idx = item.idx;
        b.onclick = function () {
          if (selL === null || selL === undefined) { ZU.toast('Primero elegí del lado izquierdo'); return; }
          conectar(selL, item.idx);
        };
        colR.appendChild(b);
      });

      function conectar(li, ri) {
        var ok = false;
        s.pairs.forEach(function (p, i) { if (i === li && ri === i) ok = true; });
        /* si ya había una conexión con ese right, liberarla */
        Object.keys(matches).forEach(function (k) { if (matches[k] === ri) delete matches[k]; });
        matches[li] = ri;
        dibujar();
        Array.prototype.forEach.call(colL.querySelectorAll('.col-card'), function (x) { x.classList.remove('sel'); });
        selL = null;
        var lb = colL.querySelector('.col-card[data-idx="' + li + '"]');
        var rb = colR.querySelector('.col-card[data-idx="' + ri + '"]');
        if (lb) lb.classList.toggle('ok', ok);
        if (rb) rb.classList.toggle('ok', ok);
        if (!ok) {
          if (lb) lb.classList.add('flash');
          if (rb) rb.classList.add('flash');
          setTimeout(function () {
            if (lb) { lb.classList.remove('ok', 'flash'); }
            if (rb) { rb.classList.remove('ok', 'flash'); }
            if (matches[li] === ri) delete matches[li];
            dibujar();
            actualizarBotones();
          }, 600);
        } else {
          actualizarBotones();
        }
        ctx.reportHeight();
      }
      function quitar(li) {
        delete matches[li];
        var lb = colL.querySelector('.col-card[data-idx="' + li + '"]');
        if (lb) lb.classList.remove('ok');
        /* limpiar rights huérfanos visualmente */
        dibujar();
        actualizarBotones();
      }
      function dibujar() {
        var svg = root.querySelector('#colsvg');
        var tab = root.querySelector('#coltab');
        if (!svg || !tab) return;
        var rect = tab.getBoundingClientRect();
        if (!rect.width) return;
        svg.setAttribute('width', rect.width);
        svg.setAttribute('height', rect.height);
        svg.setAttribute('viewBox', '0 0 ' + rect.width + ' ' + rect.height);
        var html = '';
        Object.keys(matches).forEach(function (li) {
          var ri = matches[li];
          var lb = colL.querySelector('.col-card[data-idx="' + li + '"]');
          var rb = colR.querySelector('.col-card[data-idx="' + ri + '"]');
          if (!lb || !rb) return;
          var l = lb.getBoundingClientRect(), r = rb.getBoundingClientRect();
          var x1 = l.right - rect.left, y1 = l.top + l.height / 2 - rect.top;
          var x2 = r.left - rect.left, y2 = r.top + r.height / 2 - rect.top;
          var mx = (x1 + x2) / 2;
          var ok = false;
          s.pairs.forEach(function (p, i) { if (i === Number(li) && ri === i) ok = true; });
          html += '<path d="M' + x1 + ' ' + y1 + ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2 + '" fill="none" stroke="' + (ok ? '#16A34A' : '#DC2626') + '" stroke-width="3"/>';
        });
        svg.innerHTML = html;
      }
      function actualizarBotones() {
        var n = Object.keys(matches).length;
        var check = root.querySelector('#colcheck');
        if (check) check.disabled = n < s.pairs.length;
      }

      root.querySelector('#colcheck').onclick = function () {
        var okCount = 0;
        s.pairs.forEach(function (p, i) { if (matches[i] === i) okCount++; });
        totalOk += okCount;
        var esUltima = si === screens.length - 1;
        var btn = root.querySelector('#colcheck');
        btn.disabled = true;
        btn.textContent = esUltima ? 'Ver resultados' : 'Siguiente';
        btn.onclick = function () {
          if (esUltima) {
            terminar(totalOk);
          } else {
            si++;
            render();
          }
        };
        root.querySelector('#colmsg').innerHTML =
          '<span class="' + (okCount === s.pairs.length ? 'ok' : 'mal') + '">Acertaste ' + okCount + ' de ' + s.pairs.length + ' relaciones en esta pantalla</span>';
        ctx.reportHeight();
      };

      setTimeout(dibujar, 60);
      var resizeH = function () { dibujar(); };
      window.addEventListener('resize', resizeH);
      ctx.reportHeight();
    }

    function terminar(finalOk) {
      if (destroyed) return;
      destroyed = true;
      ctx.finish({
        score: Math.round(100 * finalOk / totalPairs),
        correct: finalOk, total: totalPairs,
        answers: [],
        message: finalOk + ' de ' + totalPairs + ' relaciones correctas'
      });
    }

    render();
    return { destroy: function () { destroyed = true; } };
  }
  ZGTYPES.columnas = { play: play };
})();
