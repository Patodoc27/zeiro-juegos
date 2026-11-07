/* ZEIRO JUEGOS · Mapa Interactivo */
(function () {
  function play(root, content, options, ctx) {
    var points = (content.points || []).filter(function (p) { return p && p.q; });
    if (!points.length) { root.innerHTML = '<div class="vacio">El mapa no tiene puntos.</div>'; return {}; }
    var mode = content.mode || 'jugar'; /* jugar | explorar | explorar-jugar */
    var written = !!content.written;
    var destroyed = false;
    var estado = points.map(function () { return { visto: false, ok: false }; });
    var panelAbierto = null;

    root.innerHTML = '<div class="mapa">' +
      '<div class="map-instr">' + ZU.esc(content.instructions || (mode === 'explorar' ? 'Explorá el mapa tocando los puntos.' : 'Tocá los puntos del mapa y respondé.')) + '</div>' +
      '<div class="map-wrap" id="mapwrap">' +
      '<img src="' + ZU.esc(content.image || '') + '" alt="Mapa" class="map-img" id="mapimg">' +
      '<div class="map-puntos" id="mappuntos"></div>' +
      '</div>' +
      '<div class="map-panel oculto" id="mappanel"></div>' +
      '<div class="map-acciones"><button class="btn primary" id="mapfin">Terminar</button></div></div>';

    var puntosEl = root.querySelector('#mappuntos');
    points.forEach(function (p, i) {
      var b = document.createElement('button');
      b.className = 'map-point';
      b.style.left = (p.x || 0) + '%';
      b.style.top = (p.y || 0) + '%';
      b.dataset.i = i;
      b.innerHTML = '<span class="map-dot"></span><span class="map-num oculto"></span>';
      b.onclick = function () { abrir(i); };
      puntosEl.appendChild(b);
    });

    function marcar(i, ok) {
      estado[i].visto = true;
      if (ok) estado[i].ok = true;
      var b = puntosEl.querySelector('.map-point[data-i="' + i + '"]');
      if (b) {
        b.classList.add('visto');
        if (ok) b.classList.add('ok');
        var num = b.querySelector('.map-num');
        num.textContent = String(i + 1);
        num.classList.remove('oculto');
      }
    }

    function abrir(i) {
      if (destroyed) return;
      panelAbierto = i;
      var p = points[i];
      var panel = root.querySelector('#mappanel');
      panel.classList.remove('oculto');
      var esExplorar = mode === 'explorar';
      var html = '<div class="map-panel-card">' +
        '<button class="btn ghost small map-cerrar" id="mapclose">' + ZI('x') + '</button>' +
        '<h4>Punto ' + (i + 1) + '</h4>' +
        '<div class="map-q">' + ZU.esc(p.q) + '</div>';
      if (esExplorar) {
        html += '<div class="map-info">' + ZU.esc(p.info || p.explanation || 'Sin información adicional.') + '</div>' +
          '<button class="btn primary" id="mapok">Entendido</button>';
      } else if (written) {
        html += '<input type="text" id="mapinp" class="input" placeholder="Escribí tu respuesta" autocomplete="off">' +
          '<button class="btn primary" id="mapok">Comprobar</button>' +
          '<div class="map-msg" id="mapmsg"></div>';
      } else {
        var ops = (p.options && p.options.length ? p.options : (p.answers || []));
        html += '<div class="map-opciones">' + ops.map(function (o, oi) {
          return '<button class="btn opt-btn" data-oi="' + oi + '">' + ZU.esc(o) + '</button>';
        }).join('') + '</div><div class="map-msg" id="mapmsg"></div>';
      }
      html += '</div>';
      panel.innerHTML = html;
      panel.querySelector('#mapclose').onclick = function () { panel.classList.add('oculto'); };
      if (esExplorar) {
        panel.querySelector('#mapok').onclick = function () { marcar(i, true); panel.classList.add('oculto'); };
      } else if (written) {
        var inp = panel.querySelector('#mapinp');
        inp.focus();
        function responder() {
          var ok = ZU.respOK(inp.value, p.answers || [], { unaLetra: true });
          marcar(i, ok);
          var msg = panel.querySelector('#mapmsg');
          if (ok) {
            msg.innerHTML = '<span class="ok">¡Correcto!</span>';
            setTimeout(function () { panel.classList.add('oculto'); }, 800);
          } else {
            msg.innerHTML = '<span class="mal">Incorrecto. ' + (p.explanation ? ZU.esc(p.explanation) : 'Probá de nuevo.') + '</span>';
            inp.value = '';
          }
        }
        panel.querySelector('#mapok').onclick = responder;
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') responder(); });
      } else {
        var correctIdx = p.correct != null ? p.correct : (p.answers || []).indexOf((p.options || [])[0]);
        /* si no hay correct explícito, la primera opción que coincide con answers */
        if (correctIdx == null || correctIdx < 0) {
          correctIdx = 0;
          (p.options || []).forEach(function (o, oi) { if ((p.answers || []).some(function (a) { return ZU.norm(a) === ZU.norm(o); })) correctIdx = oi; });
        }
        Array.prototype.forEach.call(panel.querySelectorAll('.opt-btn'), function (b) {
          b.onclick = function () {
            var oi = Number(b.dataset.oi);
            var ok = oi === correctIdx;
            marcar(i, ok);
            Array.prototype.forEach.call(panel.querySelectorAll('.opt-btn'), function (x) { x.disabled = true; });
            if (ok) b.classList.add('bien');
            else {
              b.classList.add('mal');
              panel.querySelectorAll('.opt-btn')[correctIdx].classList.add('bien');
            }
            var msg = panel.querySelector('#mapmsg');
            if (ok) {
              msg.innerHTML = '<span class="ok">¡Correcto!</span>';
              setTimeout(function () { panel.classList.add('oculto'); }, 900);
            } else {
              msg.innerHTML = '<span class="mal">' + (p.explanation ? ZU.esc(p.explanation) : 'Respuesta incorrecta.') + '</span>' +
                '<button class="btn ghost small" id="mapretry">Reintentar</button>';
              panel.querySelector('#mapretry').onclick = function () { abrir(i); };
            }
          };
        });
      }
      ctx.reportHeight();
    }

    root.querySelector('#mapfin').onclick = function () {
      if (destroyed) return;
      destroyed = true;
      var vistos = estado.filter(function (e) { return e.visto; }).length;
      var oks = estado.filter(function (e) { return e.ok; }).length;
      var esExplorar = mode === 'explorar';
      ctx.finish({
        score: Math.round(100 * oks / points.length),
        correct: esExplorar ? vistos : oks,
        total: points.length,
        answers: estado.map(function (e, i) { return { i: i, ok: e.ok }; }),
        message: esExplorar ? 'Exploraste ' + vistos + ' de ' + points.length + ' puntos' : oks + ' de ' + points.length + ' respuestas correctas'
      });
    };

    /* ajustar puntos cuando carga la imagen */
    var img = root.querySelector('#mapimg');
    if (img) img.onload = function () { ctx.reportHeight(); };
    return { destroy: function () { destroyed = true; } };
  }
  ZGTYPES.mapa = { play: play };
})();
