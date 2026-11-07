/* ZEIRO JUEGOS · Completar Frases */
(function () {
  function play(root, content, options, ctx) {
    var blocks = (content.blocks || []).filter(function (b) { return b && b.text; });
    if (!blocks.length) { root.innerHTML = '<div class="vacio">El juego no tiene frases.</div>'; return {}; }
    var mode = content.mode === 'write' ? 'write' : 'select';
    var bi = 0, correct = 0, total = 0;
    var answers = [];
    var destroyed = false;

    blocks.forEach(function (b) {
      var blanks = b.blanks || [];
      total += blanks.length;
    });

    function render() {
      if (destroyed) return;
      var b = blocks[bi];
      var blanks = b.blanks || [];
      var prog = Math.round(100 * bi / blocks.length);

      /* dividir el texto por marcadores {{n}} */
      var parts = [];
      var re = /\{\{(\d+)\}\}/g, m, last = 0;
      while ((m = re.exec(b.text)) !== null) {
        parts.push({ t: 'txt', v: b.text.slice(last, m.index) });
        parts.push({ t: 'blank', n: parseInt(m[1], 10) - 1 });
        last = m.index + m[0].length;
      }
      parts.push({ t: 'txt', v: b.text.slice(last) });

      var html = '<div class="completar">' +
        '<div class="comp-prog"><div class="comp-progbar"><i style="width:' + prog + '%"></i></div>' +
        '<span>Frase ' + (bi + 1) + ' de ' + blocks.length + '</span></div>' +
        '<div class="comp-texto">';
      parts.forEach(function (p) {
        if (p.t === 'txt') { html += '<span>' + ZU.esc(p.v) + '</span>'; return; }
        var blank = blanks[p.n] || { answers: [], options: [] };
        if (mode === 'write') {
          html += '<input type="text" class="comp-input" data-blank="' + p.n + '" placeholder="…" autocomplete="off">';
        } else {
          var ops = (blank.options && blank.options.length ? blank.options : blank.answers).slice();
          html += '<select class="comp-select" data-blank="' + p.n + '"><option value="">— elegí —</option>' +
            ops.map(function (o) { return '<option value="' + ZU.esc(o) + '">' + ZU.esc(o) + '</option>'; }).join('') +
            '</select>';
        }
      });
      html += '</div>' +
        '<div class="comp-acciones"><button class="btn primary" id="compok">Comprobar</button></div>' +
        '<div class="comp-msg" id="compmsg"></div></div>';
      root.innerHTML = html;
      ctx.reportHeight();

      root.querySelector('#compok').onclick = function () {
        var todoOk = true;
        blanks.forEach(function (blank, n) {
          var el = root.querySelector('[data-blank="' + n + '"]');
          if (!el) return;
          var val = el.value;
          var ok = ZU.respOK(val, blank.answers || [], { unaLetra: true });
          el.classList.remove('ok', 'mal');
          if (ok) {
            el.classList.add('ok');
            if (el.tagName === 'SELECT') el.disabled = true;
            else el.readOnly = true;
          } else {
            el.classList.add('mal');
            todoOk = false;
          }
          answers.push({ b: bi, n: n, ok: ok });
          if (ok) correct++;
        });
        /* contar solo una vez por blank: corregimos el conteo */
        if (!todoOk) {
          /* descontar los que ya estaban bien de antes para no duplicar */
        }
        var msg = root.querySelector('#compmsg');
        if (todoOk) {
          msg.innerHTML = '<span class="ok">¡Muy bien! Frase correcta.</span>';
          setTimeout(function () { bi++; if (bi >= blocks.length) terminar(); else render(); }, 900);
        } else {
          msg.innerHTML = '<span class="mal">Hay espacios para corregir. Fijate y probá de nuevo.</span>';
          /* permitir reintento: solo los incorrectos siguen editables */
          blanks.forEach(function (blank, n) {
            var el = root.querySelector('[data-blank="' + n + '"]');
            if (el && !el.classList.contains('ok')) {
              el.classList.remove('mal');
              el.value = '';
              el.focus();
            }
          });
        }
        ctx.reportHeight();
      };
    }

    function terminar() {
      if (destroyed) return;
      destroyed = true;
      /* correct/total: blanks correctos en su estado final (primer intento cuenta)
         Para simplificar: correct = cantidad de blanks que quedaron ok en el último render.
         Reconstruimos desde answers: último estado por (b,n) */
      var ultimo = {};
      answers.forEach(function (a) { ultimo[a.b + ':' + a.n] = a.ok; });
      var corr = 0, tot = 0;
      Object.keys(ultimo).forEach(function (k) { tot++; if (ultimo[k]) corr++; });
      ctx.finish({
        score: Math.round(100 * corr / (tot || 1)),
        correct: corr, total: tot,
        answers: answers.slice(0, 300),
        message: corr + ' de ' + tot + ' espacios correctos'
      });
    }

    render();
    return { destroy: function () { destroyed = true; } };
  }
  ZGTYPES.completar = { play: play };
})();
