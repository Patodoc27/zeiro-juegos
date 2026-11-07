/* ZEIRO JUEGOS · Froggy Jumps (v2)
   Escena de río con ranita, pads interactivos, HUD y timer circular. */
(function () {
  function svgRana() {
    return '<svg class="frog-svg" viewBox="0 0 120 110" aria-hidden="true">' +
      '<ellipse cx="60" cy="72" rx="42" ry="30" fill="#4ADE80" stroke="#16A34A" stroke-width="3"/>' +
      '<ellipse cx="60" cy="82" rx="26" ry="17" fill="#BBF7D0"/>' +
      '<circle cx="38" cy="42" r="17" fill="#4ADE80" stroke="#16A34A" stroke-width="3"/>' +
      '<circle cx="82" cy="42" r="17" fill="#4ADE80" stroke="#16A34A" stroke-width="3"/>' +
      '<circle cx="38" cy="40" r="9" fill="#fff" stroke="#16A34A" stroke-width="2.5"/>' +
      '<circle cx="82" cy="40" r="9" fill="#fff" stroke="#16A34A" stroke-width="2.5"/>' +
      '<circle cx="40" cy="41" r="4.5" fill="#19102B"/>' +
      '<circle cx="80" cy="41" r="4.5" fill="#19102B"/>' +
      '<circle cx="41.5" cy="39.5" r="1.5" fill="#fff"/>' +
      '<circle cx="81.5" cy="39.5" r="1.5" fill="#fff"/>' +
      '<path d="M48 62 Q60 74 72 62" fill="none" stroke="#14532D" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle cx="24" cy="66" r="5" fill="#FB7185" opacity=".55"/>' +
      '<circle cx="96" cy="66" r="5" fill="#FB7185" opacity=".55"/>' +
      '<ellipse cx="60" cy="100" rx="30" ry="6" fill="#22C55E" stroke="#16A34A" stroke-width="3"/>' +
      '</svg>';
  }

  window.ZGTYPES.froggy = {
    play: function (body, content, options, ctx) {
      var c = content || {};
      var questions = (c.questions || []).slice();
      var lives = c.lives || 5;
      var tPQ = c.timePerQuestion || 20;
      var count = c.count || 0;
      var order = c.order || 'random';
      if (order === 'random') questions = ZU.shuffle(questions);
      if (count > 0 && questions.length > count) questions = questions.slice(0, count);

      var state = { idx: 0, lives: lives, aciertos: 0, answers: [], lock: false, timeLeft: tPQ, timer: null, frogPos: 12 };

      body.innerHTML =
        '<div class="frog2">' +
        '<div class="fj-hud">' +
        '<div class="fj-vidas" id="fj-vidas"></div>' +
        '<div class="fj-titulo">' + ZU.esc(ctx.game.title) + '</div>' +
        '<div class="fj-puntos" id="fj-puntos">' + ZI('star') + ' 0</div>' +
        '</div>' +
        '<div class="fj-qbox" id="fj-qbox"></div>' +
        '<div class="fj-opciones" id="fj-ops"></div>' +
        '<div class="fj-scene" id="fj-scene">' +
        '<div class="fj-water"></div>' +
        '<div class="fj-ripples"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
        '<div class="fj-frog" id="fj-frog">' + svgRana() + '</div>' +
        '<div class="fj-padbase"></div>' +
        '<div class="fj-timer" id="fj-timer"><div class="fj-ring" id="fj-ring"><span id="fj-secs">' + tPQ + '</span></div></div>' +
        '<div class="fj-tools">' +
        '<button class="fj-tool" id="fj-voz" title="Escuchar">' + ZI('speaker') + '</button>' +
        '<button class="fj-tool" id="fj-full" title="Pantalla completa"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>' +
        '</div>' +
        '<div class="fj-feedback" id="fj-feedback"></div>' +
        '</div></div>';

      var els = {
        vidas: body.querySelector('#fj-vidas'), puntos: body.querySelector('#fj-puntos'),
        qbox: body.querySelector('#fj-qbox'), ops: body.querySelector('#fj-ops'),
        frog: body.querySelector('#fj-frog'), timer: body.querySelector('#fj-timer'),
        ring: body.querySelector('#fj-ring'), secs: body.querySelector('#fj-secs'),
        feedback: body.querySelector('#fj-feedback')
      };

      function pintarVidas() {
        var h = '';
        for (var i = 0; i < lives; i++) h += '<span class="fj-vida' + (i < state.lives ? ' on' : '') + '">' + ZI('heart') + '</span>';
        els.vidas.innerHTML = h;
      }
      function pintarPuntos() {
        els.puntos.innerHTML = ZI('star') + ' ' + (state.aciertos * 100);
      }

      function iniciarTimer() {
        clearInterval(state.timer);
        state.timeLeft = tPQ;
        pintarTimer();
        state.timer = setInterval(function () {
          state.timeLeft -= 0.25;
          if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            responder(-1, true);
            return;
          }
          pintarTimer();
        }, 250);
      }
      function pintarTimer() {
        var pct = Math.max(0, Math.min(1, state.timeLeft / tPQ));
        var deg = Math.round(pct * 360);
        els.ring.style.background = 'conic-gradient(#16A34A ' + deg + 'deg, #E5E7EB ' + deg + 'deg)';
        els.secs.textContent = Math.ceil(state.timeLeft);
        els.timer.classList.toggle('urgente', state.timeLeft <= 5);
      }

      function mostrarPregunta() {
        state.lock = false;
        var q = questions[state.idx];
        if (!q) { terminar(); return; }
        els.qbox.innerHTML = '<div class="fj-q">' + ZU.esc(q.q) + '</div>';
        els.ops.innerHTML = '';
        (q.options || []).forEach(function (op, i) {
          var b = document.createElement('button');
          b.className = 'fj-pad';
          b.innerHTML = '<span class="fj-pad-letra">' + 'ABC'[i] + '</span><span class="fj-pad-texto">' + ZU.esc(op) + '</span>';
          b.onclick = function () { if (!state.lock) responder(i, false); };
          els.ops.appendChild(b);
        });
        els.feedback.innerHTML = '';
        saltarRana();
        iniciarTimer();
        ZV.hablar(q.q);
      }

      function saltarRana() {
        state.frogPos = 8 + Math.random() * 78;
        els.frog.style.left = state.frogPos + '%';
        els.frog.classList.remove('salta');
        void els.frog.offsetWidth;
        els.frog.classList.add('salta');
      }

      function responder(i, timeout) {
        if (state.lock) return;
        state.lock = true;
        clearInterval(state.timer);
        var q = questions[state.idx];
        var ok = !timeout && i === q.correct;
        var pads = els.ops.querySelectorAll('.fj-pad');
        if (timeout) {
          if (q.correct != null && pads[q.correct]) pads[q.correct].classList.add('bien');
        } else {
          if (ok) { if (pads[i]) pads[i].classList.add('bien'); }
          else if (q.correct != null && pads[q.correct]) pads[q.correct].classList.add('bien');
          if (pads[i] && !ok) pads[i].classList.add('mal');
        }
        state.answers.push({ q: q.q, ok: ok, elegida: timeout ? null : i });
        if (ok) {
          state.aciertos++;
          pintarPuntos();
          els.feedback.innerHTML = '<span class="ok">¡Correcto!</span>' + (options.mostrarExplicaciones !== 'nunca' && q.explanation ? '<div class="fj-exp">' + ZU.esc(q.explanation) + '</div>' : '');
          els.frog.classList.remove('cae');
          saltarRana();
        } else {
          state.lives--;
          pintarVidas();
          els.frog.classList.add('cae');
          setTimeout(function () { els.frog.classList.remove('cae'); }, 600);
          els.feedback.innerHTML = '<span class="mal">' + (timeout ? 'Se acabó el tiempo.' : 'Incorrecto.') + '</span>' +
            (options.mostrarExplicaciones !== 'nunca' && q.explanation ? '<div class="fj-exp">' + ZU.esc(q.explanation) + '</div>' : '');
        }
        setTimeout(function () {
          state.idx++;
          if (state.lives <= 0 || state.idx >= questions.length) terminar();
          else mostrarPregunta();
        }, ok ? 1100 : 1700);
      }

      function terminar() {
        clearInterval(state.timer);
        ctx.finish({ correct: state.aciertos, total: questions.length, answers: state.answers });
      }

      body.querySelector('#fj-voz').onclick = function () {
        var q = questions[state.idx];
        if (q) ZV.hablar(q.q + '. ' + (q.options || []).join('. '));
      };
      body.querySelector('#fj-full').onclick = function () {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
      };

      pintarVidas(); pintarPuntos(); pintarTimer();
      mostrarPregunta();
    }
  };
})();
