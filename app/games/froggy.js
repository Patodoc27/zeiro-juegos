/* ZEIRO JUEGOS · Froggy Jumps (saltar el río respondiendo) */
(function () {
  var FROG = '<svg viewBox="0 0 64 64" class="frog-svg"><ellipse cx="32" cy="40" rx="20" ry="16" fill="#22C55E"/><circle cx="22" cy="24" r="8" fill="#22C55E"/><circle cx="42" cy="24" r="8" fill="#22C55E"/><circle cx="22" cy="23" r="3.4" fill="#fff"/><circle cx="42" cy="23" r="3.4" fill="#fff"/><circle cx="22" cy="23" r="1.6" fill="#1E293B"/><circle cx="42" cy="23" r="1.6" fill="#1E293B"/><path d="M24 36q8 6 16 0" stroke="#14532D" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="32" cy="48" rx="9" ry="5" fill="#4ADE80"/></svg>';

  function play(root, content, options, ctx) {
    var all = (content.questions || []).filter(function (q) { return q && q.q && (q.options || []).length >= 2; });
    if (!all.length) { root.innerHTML = '<div class="vacio">El juego no tiene preguntas.</div>'; return {}; }
    var lives = content.lives ? parseInt(content.lives, 10) : 5;
    var tPer = content.timePerQuestion ? parseInt(content.timePerQuestion, 10) : 20;
    var count = content.count ? parseInt(content.count, 10) : 0;
    var questions = content.order === 'secuencial' ? all.slice() : ZU.shuffle(all);
    if (count > 0 && questions.length > count) questions = questions.slice(0, count);

    var qi = 0, correct = 0, answered = 0, livesLeft = lives;
    var timer = null, destroyed = false;

    function q() { return questions[qi]; }

    function scene() {
      var pads = '';
      var n = Math.min(questions.length + 1, 10);
      for (var i = 0; i < n; i++) {
        pads += '<div class="pad" style="left:' + (6 + i * (88 / Math.max(n - 1, 1))) + '%"><i></i></div>';
      }
      return '<div class="frog-scene"><div class="frog-water"></div>' + pads +
        '<div class="frog" id="frog">' + FROG + '</div></div>';
    }

    function render() {
      if (destroyed) return;
      if (timer) { timer.stop(); timer = null; }
      if (qi >= questions.length || livesLeft <= 0) { terminar(); return; }
      var qq = q();
      var prog = Math.round(100 * qi / questions.length);
      var optsHTML = '';
      var mapping = qq.options.map(function (_, i) { return i; });
      if (content.shuffleOptions !== false) mapping = ZU.shuffle(mapping);
      mapping.forEach(function (orig, pos) {
        optsHTML += '<button class="btn opt-btn" data-i="' + orig + '">' + ZU.esc(qq.options[orig]) + '</button>';
      });
      var hearts = '';
      for (var i = 0; i < lives; i++) hearts += '<span class="vida ' + (i < livesLeft ? 'on' : '') + '">' + ZI('heart') + '</span>';
      root.innerHTML =
        '<div class="froggy">' +
        '<div class="fbar"><div class="fbar-prog"><i style="width:' + prog + '%"></i></div>' +
        '<div class="fbar-vidas">' + hearts + '</div></div>' +
        scene() +
        '<div class="fq"><div class="fq-pregunta">' + ZU.esc(qq.q) + '</div>' +
        '<div class="fq-timer" id="ftimer">' + tPer + '</div>' +
        '<div class="fq-opciones">' + optsHTML + '</div>' +
        '<div class="fq-feedback" id="ffb"></div></div>' +
        '</div>';
      ctx.reportHeight();

      var answeredOnce = false;
      function responder(origIdx) {
        if (answeredOnce) return;
        answeredOnce = true;
        if (timer) { timer.stop(); timer = null; }
        answered++;
        var ok = origIdx === qq.correct;
        if (ok) correct++;
        if (!ok) livesLeft--;
        Array.prototype.forEach.call(root.querySelectorAll('.opt-btn'), function (b) {
          b.disabled = true;
          if (Number(b.dataset.i) === qq.correct) b.classList.add('bien');
          else if (Number(b.dataset.i) === origIdx) b.classList.add('mal');
        });
        var ffb = root.querySelector('#ffb');
        if (ffb) {
          ffb.innerHTML = (ok ? '<span class="ok">¡Correcto!</span>' : '<span class="mal">Incorrecto</span>') +
            (qq.explanation ? '<div class="fq-exp">' + ZU.esc(qq.explanation) + '</div>' : '');
        }
        var frog = root.querySelector('#frog');
        if (frog) {
          if (ok) frog.classList.add('salta');
          else frog.classList.add('cae');
        }
        setTimeout(function () { qi++; render(); }, ok ? 900 : 1400);
      }
      Array.prototype.forEach.call(root.querySelectorAll('.opt-btn'), function (b) {
        b.onclick = function () { responder(Number(b.dataset.i)); };
      });

      if (tPer > 0) {
        var tEl = root.querySelector('#ftimer');
        var left = tPer;
        timer = ZG.temporizador(tPer, function (l) {
          left = l;
          if (tEl) {
            tEl.textContent = l + ' s';
            tEl.className = 'fq-timer ' + (l <= 5 ? 'urgente' : '');
          }
        }, function () {
          /* timeout = respuesta incorrecta */
          answeredOnce = true;
          answered++;
          livesLeft--;
          Array.prototype.forEach.call(root.querySelectorAll('.opt-btn'), function (b) {
            b.disabled = true;
            if (Number(b.dataset.i) === qq.correct) b.classList.add('bien');
          });
          var ffb2 = root.querySelector('#ffb');
          if (ffb2) ffb2.innerHTML = '<span class="mal">¡Se acabó el tiempo!</span>';
          var frog2 = root.querySelector('#frog');
          if (frog2) frog2.classList.add('cae');
          setTimeout(function () { qi++; render(); }, 1400);
        });
      }
    }

    function terminar() {
      if (timer) { timer.stop(); timer = null; }
      ctx.finish({
        score: answered ? Math.round(100 * correct / answered) : 0,
        correct: correct,
        total: answered,
        answers: [],
        message: livesLeft <= 0 ? 'Te quedaste sin vidas' : '¡Llegaste a la meta!'
      });
    }

    render();
    return {
      destroy: function () { destroyed = true; if (timer) timer.stop(); }
    };
  }
  ZGTYPES.froggy = { play: play };
})();
