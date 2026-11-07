/* ZEIRO JUEGOS · Motor de juegos.
   Cada tipo de juego (app/games/*.js) se registra en ZGTYPES y expone
   play(root, content, options, ctx) → controlador {destroy()}.
   El motor se encarga de: encabezado, progreso, anti-trampa, cronómetro,
   pantalla de resultados, guardado del intento y mensajes al iframe. */
(function () {
  var ZGTYPES = {};
  window.ZGTYPES = ZGTYPES;

  function embedMsg(type, data) {
    try {
      if (window.parent && window.parent !== window) {
        var msg = { source: 'zeirojuegos', type: type };
        if (data) { for (var k in data) if (data.hasOwnProperty(k)) msg[k] = data[k]; }
        window.parent.postMessage(msg, '*');
      }
    } catch (e) {}
  }
  function reportHeight() {
    try { embedMsg('height', { h: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) }); } catch (e) {}
  }

  /* nota 1-10 a partir del porcentaje de aciertos */
  function nota(pct) {
    if (pct <= 0) return 0;
    return Math.max(1, Math.min(10, Math.round(pct / 10)));
  }

  /* anti-trampa: bloquear copiar/pegar/cortar y avisar si se minimiza */
  function armarAntiTrampa(root, onOcultar) {
    var handlers = [];
    function add(el, ev, fn, opt) { el.addEventListener(ev, fn, opt); handlers.push([el, ev, fn, opt]); }
    ['copy', 'cut', 'paste', 'contextmenu'].forEach(function (ev) {
      add(root, ev, function (e) { e.preventDefault(); e.stopPropagation(); });
    });
    function vis() {
      if (document.hidden) {
        if (onOcultar) onOcultar();
      }
    }
    add(document, 'visibilitychange', vis);
    return {
      destroy: function () {
        handlers.forEach(function (h) { h[0].removeEventListener(h[1], h[2], h[3]); });
      }
    };
  }

  /* cronómetro simple: llama onTick(segRest) cada segundo; onEnd al llegar a 0 */
  function temporizador(seg, onTick, onEnd) {
    var left = seg;
    var iv = setInterval(function () {
      left--;
      if (onTick) onTick(left);
      if (left <= 0) { clearInterval(iv); if (onEnd) onEnd(); }
    }, 1000);
    return {
      stop: function () { clearInterval(iv); },
      left: function () { return left; }
    };
  }

  function headerHTML(game, ctx) {
    var html = '<div class="ghead">' +
      '<div class="ghead-titulo">' + ZGICON(game.type) + '<div><h2>' + ZU.esc(game.title) + '</h2>' +
      (game.subject ? '<span class="ghead-mat">' + ZU.esc(game.subject) + '</span>' : '') + '</div></div>' +
      '<div class="ghead-meta"><span class="ghead-alumno">' + ZI('users') + ZU.esc(ctx.student && ctx.student.name ? ctx.student.name : '') + '</span></div>' +
      '</div>';
    return html;
  }

  /* pantalla de resultados + guardado del intento */
  function finish(ctx, res) {
    var game = ctx.game;
    var pct = res.total > 0 ? Math.round(100 * res.correct / res.total) : (res.score || 0);
    var notaN = nota(pct);
    var att = {
      game_id: game.id,
      class_code: ctx.classCode || '',
      student_name: ctx.student && ctx.student.name ? ctx.student.name : 'Invitado',
      score: Math.max(0, Math.min(100, res.score != null ? res.score : pct)),
      correct: res.correct || 0,
      total: res.total || 0,
      time_ms: res.timeMs || 0,
      answers: (res.answers || []).slice(0, 400),
      game_title: game.title,
      game_type: game.type
    };
    ZDB.attempts.add(att).then(function () {
      mostrarFin(ctx, att, pct, notaN, res);
    }).catch(function () {
      mostrarFin(ctx, att, pct, notaN, res);
    });
  }

  function mostrarFin(ctx, att, pct, notaN, res) {
    var game = ctx.game;
    var msgExtra = res && res.message ? '<p class="fin-msg">' + ZU.esc(res.message) + '</p>' : '';
    var html = '<div class="fin">' +
      '<div class="fin-emoji">' + ZI(pct >= 60 ? 'trophy' : 'star') + '</div>' +
      '<h2>¡Terminaste!</h2>' +
      '<div class="fin-puntaje"><span>' + att.score + '</span><small>puntos</small></div>' +
      '<div class="fin-detalle">' +
      '<div><b>' + att.correct + '</b><span>aciertos</span></div>' +
      '<div><b>' + att.total + '</b><span>total</span></div>' +
      '<div><b>' + pct + '%</b><span>porcentaje</span></div>' +
      '<div><b>' + notaN + '</b><span>nota estimada</span></div>' +
      (att.time_ms ? '<div><b>' + ZU.fmtTime(att.time_ms) + '</b><span>tiempo</span></div>' : '') +
      '</div>' + msgExtra +
      '<div class="fin-acciones">' +
      '<button class="btn primary" id="fin-retry">' + ZI('refresh') + 'Jugar de nuevo</button>' +
      '<button class="btn ghost" id="fin-back">Volver</button>' +
      '</div>' +
      (ctx.embed ? '<p class="fin-embed">Los resultados ya se enviaron al aula.</p>' : '') +
      '</div>';
    ctx.root.innerHTML = html;
    reportHeight();
    embedMsg('fin', { score: att.score, correct: att.correct, total: att.total, student: att.student_name, game: game.title });
    var retry = ctx.root.querySelector('#fin-retry');
    var back = ctx.root.querySelector('#fin-back');
    if (retry) retry.onclick = function () { location.reload(); };
    if (back) back.onclick = function () { if (ctx.onExit) ctx.onExit(); else history.back(); };
  }

  /* Punto de entrada: renderiza el juego dentro de root */
  function start(root, game, ctx) {
    ctx = ctx || {};
    ctx.game = game;
    ctx.root = root;
    ctx.finish = function (res) { finish(ctx, res); };
    ctx.reportHeight = reportHeight;
    ctx.embed = !!ctx.embed;
    var type = ZGTYPES[game.type];
    root.innerHTML = '<div class="game-wrap">' + headerHTML(game, ctx) + '<div class="game-body" id="game-body"></div></div>';
    reportHeight();
    if (!type) {
      root.querySelector('#game-body').innerHTML = '<div class="vacio">Este tipo de juego no está disponible.</div>';
      return;
    }
    var body = root.querySelector('#game-body');
    var startTime = Date.now();
    var controller = null;
    try {
      controller = type.play(body, game.content || {}, game.options || {}, {
        game: game,
        student: ctx.student,
        classCode: ctx.classCode,
        embed: ctx.embed,
        finish: function (res) {
          res = res || {};
          if (res.timeMs == null) res.timeMs = Date.now() - startTime;
          finish(ctx, res);
        },
        reportHeight: reportHeight
      });
    } catch (e) {
      console.error(e);
      body.innerHTML = '<div class="vacio">Hubo un problema al cargar el juego. <button class="btn" onclick="location.reload()">Reintentar</button></div>';
      return;
    }
    /* anti-trampa a nivel juego (opción del docente) */
    var anti = null;
    if (game.options && game.options.antiTrampa) {
      anti = armarAntiTrampa(root, function () {
        ZU.toast('La partida está en pausa: no cambies de ventana', 'warn');
      });
    }
    /* reportar altura ante cambios de tamaño */
    var ro = null;
    if (window.ResizeObserver) {
      try {
        ro = new ResizeObserver(function () { reportHeight(); });
        ro.observe(document.body);
      } catch (e) {}
    }
    window.addEventListener('resize', reportHeight);
    var oldDestroy = controller && controller.destroy ? controller.destroy.bind(controller) : null;
    controller = controller || {};
    controller.destroy = function () {
      if (oldDestroy) oldDestroy();
      if (anti) anti.destroy();
      if (ro) ro.disconnect();
      window.removeEventListener('resize', reportHeight);
    };
  }

  window.ZG = {
    start: start,
    finish: finish,
    nota: nota,
    temporizador: temporizador,
    embedMsg: embedMsg,
    reportHeight: reportHeight,
    types: ZGTYPES
  };
})();
