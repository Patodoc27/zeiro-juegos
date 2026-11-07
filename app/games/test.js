/* ZEIRO JUEGOS · Test (cuestionario con corrección instantánea o al final) */
(function () {
  function play(root, content, options, ctx) {
    var preguntas = (content.questions || []).filter(function (q) { return q && q.q; });
    if (!preguntas.length) { root.innerHTML = '<div class="vacio">El juego no tiene preguntas.</div>'; return {}; }
    var mode = content.mode === 'examen' ? 'examen' : 'instant';
    var opts = {
      shuffleQuestions: !!(options.shuffleQuestions !== false),
      shuffleOptions: !!(options.shuffleOptions !== false),
      penalizeWrong: !!options.penalizeWrong,
      timePerQuestion: options.timePerQuestion ? parseInt(options.timePerQuestion, 10) : 0
    };
    if (opts.shuffleQuestions) preguntas = ZU.shuffle(preguntas);

    var idx = 0;
    var results = []; // {ok, answered}
    var penalties = 0;
    var timer = null;
    var tiempoInicio = Date.now();

    function actual() { return preguntas[idx]; }

    function render() {
      if (timer) { timer.stop(); timer = null; }
      var q = actual();
      var prog = Math.round(100 * idx / preguntas.length);
      var body = '<div class="quiz">' +
        '<div class="quiz-prog"><div class="quiz-progbar"><i style="width:' + prog + '%"></i></div>' +
        '<span>' + (idx + 1) + ' / ' + preguntas.length + '</span></div>' +
        '<div class="quiz-pregunta">' + ZU.esc(q.q) + '</div>' +
        (q.image ? '<img class="quiz-img" src="' + ZU.esc(q.image) + '" alt="">' : '') +
        '<div class="quiz-opciones" id="qopts"></div>' +
        '<div class="quiz-accion"></div>' +
        '</div>';
      root.innerHTML = body;
      var box = root.querySelector('#qopts');
      var accion = root.querySelector('.quiz-accion');
      var type = q.type || 'mcq';

      if (type === 'write') {
        box.innerHTML = '<input type="text" id="qw" class="input" placeholder="Escribí tu respuesta" autocomplete="off">';
        accion.innerHTML = '<button class="btn primary" id="qok">Comprobar</button>';
        var inp = box.querySelector('#qw');
        inp.focus();
        function responder() {
          var val = inp.value;
          var ok = ZU.respOK(val, q.answers || [], { unaLetra: true });
          if (mode === 'instant') {
            results.push({ ok: ok, q: q.q, given: val });
            if (!ok) penalties++;
            mostrarFeedback(ok, q);
          } else {
            results.push({ ok: ok, q: q.q, given: val });
            siguiente();
          }
        }
        accion.querySelector('#qok').onclick = responder;
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') responder(); });
      } else {
        var ops = (q.options || []).slice();
        var correctIdx = type === 'multi' ? (Array.isArray(q.correct) ? q.correct.slice() : [q.correct]) : [q.correct];
        var mapping = ops.map(function (_, i) { return i; });
        if (opts.shuffleOptions) mapping = ZU.shuffle(mapping);
        var sel = {};
        mapping.forEach(function (origIdx, pos) {
          var b = document.createElement('button');
          b.className = 'qopt';
          b.innerHTML = '<span class="qopt-letter">' + String.fromCharCode(65 + pos) + '</span><span>' + ZU.esc(ops[origIdx]) + '</span>';
          b.dataset.orig = origIdx;
          b.onclick = function () {
            if (mode === 'instant' && type !== 'multi') {
              var ok = correctIdx.indexOf(origIdx) !== -1;
              results.push({ ok: ok, q: q.q, given: ops[origIdx] });
              if (!ok) penalties++;
              marcar(b);
              mostrarFeedback(ok, q);
            } else if (type === 'multi') {
              if (sel[origIdx]) { delete sel[origIdx]; b.classList.remove('sel'); }
              else { sel[origIdx] = true; b.classList.add('sel'); }
            }
          };
          box.appendChild(b);
        });
        if (type === 'multi') {
          accion.innerHTML = '<button class="btn primary" id="qok">Comprobar</button>';
          accion.querySelector('#qok').onclick = function () {
            var elegidas = Object.keys(sel).map(Number);
            var ok = elegidas.length === correctIdx.length && elegidas.every(function (x) { return correctIdx.indexOf(x) !== -1; });
            results.push({ ok: ok, q: q.q, given: elegidas.map(function (x) { return ops[x]; }).join(' / ') });
            if (!ok) penalties++;
            if (mode === 'instant') mostrarFeedback(ok, q); else siguiente();
          };
        }
      }

      function marcar(btn) {
        var orig = Number(btn.dataset.orig);
        var ok = correctIdx.indexOf(orig) !== -1;
        Array.prototype.forEach.call(box.querySelectorAll('.qopt'), function (b) {
          b.disabled = true;
          var o = Number(b.dataset.orig);
          if (correctIdx.indexOf(o) !== -1) b.classList.add('bien');
        });
        if (!ok) btn.classList.add('mal');
      }
      function mostrarFeedback(ok, qq) {
        var expl = '';
        if (qq.explanation && options.mostrarExplicaciones !== 'nunca') expl = '<div class="quiz-exp ' + (ok ? 'ok' : 'mal') + '">' + ZU.esc(qq.explanation) + '</div>';
        accion.innerHTML = (expl ? expl : '') + '<button class="btn primary" id="qnext">' + (idx === preguntas.length - 1 ? 'Ver resultados' : 'Siguiente') + '</button>';
        accion.querySelector('#qnext').onclick = siguiente;
        ctx.reportHeight();
      }
      function siguiente() {
        idx++;
        if (idx >= preguntas.length) terminar(); else render();
      }

      if (opts.timePerQuestion > 0) {
        var tleft = opts.timePerQuestion;
        var tEl = document.createElement('div');
        tEl.className = 'quiz-timer';
        root.querySelector('.quiz').insertBefore(tEl, root.querySelector('.quiz-pregunta'));
        timer = ZG.temporizador(opts.timePerQuestion, function (l) {
          tleft = l;
          tEl.textContent = '⏱ ' + l + ' s';
          tEl.className = 'quiz-timer ' + (l <= 5 ? 'urgente' : '');
        }, function () {
          /* se acabó el tiempo: cuenta como error */
          results.push({ ok: false, q: q.q, given: '(sin responder)' });
          if (mode === 'instant') { mostrarFeedback(false, q); } else { siguiente(); }
        });
      }
      ctx.reportHeight();
    }

    function terminar() {
      if (timer) { timer.stop(); timer = null; }
      var correct = results.filter(function (r) { return r.ok; }).length;
      var total = results.length;
      var wrong = total - correct;
      /* en modo examen, mostrar repaso antes de cerrar */
      if (mode === 'examen') {
        var html = '<div class="quiz-fin-repaso"><h3>Repaso de respuestas</h3><div class="repaso-lista">';
        results.forEach(function (r, i) {
          var qq = preguntas[i];
          html += '<div class="repaso-item ' + (r.ok ? 'ok' : 'mal') + '">' +
            '<div class="repaso-q"><b>' + (i + 1) + '.</b> ' + ZU.esc(r.q) + '</div>' +
            '<div class="repaso-r">Tu respuesta: ' + ZU.esc(r.given || '—') + '</div>' +
            (!r.ok && qq ? '<div class="repaso-c">Correcta: ' + ZU.esc(respuestaCorrecta(qq)) + '</div>' : '') +
            (!r.ok && qq && qq.explanation && options.mostrarExplicaciones !== 'nunca' ? '<div class="repaso-e">' + ZU.esc(qq.explanation) + '</div>' : '') +
            '</div>';
        });
        html += '</div><button class="btn primary" id="qfinish">Ver puntaje</button></div>';
        root.innerHTML = html;
        root.querySelector('#qfinish').onclick = function () {
          ctx.finish({
            score: Math.max(0, Math.round(100 * correct / total) - (opts.penalizeWrong ? wrong : 0)),
            correct: correct, total: total,
            answers: results.map(function (r, i) { return { i: i, ok: r.ok }; }),
            message: correct + ' de ' + total + ' correctas'
          });
        };
        ctx.reportHeight();
        return;
      }
      ctx.finish({
        score: Math.max(0, Math.round(100 * correct / total) - (opts.penalizeWrong ? wrong : 0)),
        correct: correct, total: total,
        answers: results.map(function (r, i) { return { i: i, ok: r.ok }; }),
        message: correct + ' de ' + total + ' correctas'
      });
    }

    function respuestaCorrecta(qq) {
      if (qq.type === 'write') return (qq.answers || []).join(' / ');
      if (qq.type === 'multi') return (Array.isArray(qq.correct) ? qq.correct : [qq.correct]).map(function (i) { return (qq.options || [])[i]; }).join(' / ');
      return (qq.options || [])[qq.correct];
    }

    render();
    return { destroy: function () { if (timer) timer.stop(); } };
  }
  ZGTYPES.test = { play: play };
})();
