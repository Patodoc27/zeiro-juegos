/* ZEIRO JUEGOS · Vistas (landing, docente, clases, informes, jugador) */
(function () {
  function tipoInfo(type) {
    for (var i = 0; i < ZED.list.length; i++) if (ZED.list[i][0] === type) return { name: ZED.list[i][1], desc: ZED.list[i][2] };
    return { name: type, desc: '' };
  }
  function pct(correct, total) { return total ? Math.round(100 * correct / total) : 0; }
  var ACC = { test: '#7C3AED', froggy: '#22C55E', sopa: '#0EA5E9', crucigrama: '#F59E0B', columnas: '#EC4899', memory: '#8B5CF6', completar: '#14B8A6', 'ordenar-palabras': '#F97316', 'si-o-no': '#EF4444', 'ordenar-letras': '#6366F1', ruleta: '#EAB308', grupos: '#10B981', filas: '#0EA5E9', mapa: '#84CC16' };

  /* ---------------- LANDING ---------------- */
  function landing(root) {
    ZDB.games.list().then(function (games) {
      var destacados = games.slice(0, 6);
      root.innerHTML =
        '<div class="hero">' +
        '<span class="blob b1"></span><span class="blob b2"></span>' +
        '<span class="eyebrow" style="color:#5EEAD4">Plataforma de juegos para el aula</span>' +
        '<h1>Jugá, creá y <em>compartí</em> actividades educativas.</h1>' +
        '<p>Tests, sopas de letras, crucigramas, memoria y 10 juegos más. Los estudiantes entran con un código, sin registrarse, y vos ves los resultados en vivo.</p>' +
        '<div class="acciones">' +
        '<a class="btn blanco" href="#/docente">' + ZI('edit') + 'Soy docente</a>' +
        '<a class="btn fantasma" href="#/entrar">' + ZI('play') + 'Soy estudiante</a>' +
        '</div><div class="marca-hero">Zeiro Juegos</div></div>' +
        '<div class="seccion-tit"><h2>Actividades destacadas</h2><span class="badge">' + games.length + ' juegos</span></div>' +
        '<div class="grid cols-3">' + destacados.map(function (gm) {
          var t = tipoInfo(gm.type);
          return '<div class="card juego-card"><div class="juego-portada" style="--acc:' + ACC[gm.type] + '">' + (gm.image ? '<img src="' + ZU.esc(gm.image) + '">' : ZGICON(gm.type)) + '</div>' +
            '<h3>' + ZU.esc(gm.title) + '</h3>' +
            '<div class="meta">' + ZU.esc(t.name) + (gm.subject ? ' · ' + ZU.esc(gm.subject) : '') + '</div>' +
            '<div class="acc"><a class="btn primary small" href="#/juego/' + gm.id + '">' + ZI('play') + 'Jugar</a></div></div>';
        }).join('') + '</div>' +
        '<div class="seccion-tit"><h2>¿Cómo funciona?</h2></div>' +
        '<div class="grid cols-3">' +
        '<div class="card"><h3>1. Creás la actividad</h3><p class="muted">Elegís el tipo de juego, cargás las preguntas o palabras y publicás. También podés partir de una actividad existente.</p></div>' +
        '<div class="card"><h3>2. Compartís el código</h3><p class="muted">Cada clase tiene un código. Los estudiantes entran con su nombre y juegan desde el celular, la tablet o la compu, también embebido en el aula virtual.</p></div>' +
        '<div class="card"><h3>3. Ves los informes</h3><p class="muted"> rankings por aciertos, porcentajes, notas estimadas y exportación a planilla, en tiempo real.</p></div>' +
        '</div>';
    });
  }

  /* ---------------- ENTRAR (estudiante con código de clase) ---------------- */
  function entrar(root, q) {
    root.innerHTML = '<div class="login-card"><div class="card">' +
      '<h2>Entrar a mi clase</h2>' +
      '<p class="muted">Ingresá el código de tu clase y tu nombre.</p>' +
      '<label class="campo">Código de clase</label><input class="input" id="entcode" placeholder="Ej: K7M2QX" style="text-transform:uppercase">' +
      '<button class="btn primary mt" id="entbtn" style="width:100%">Continuar</button>' +
      '<div id="entmsg"></div></div></div>';
    root.querySelector('#entcode').focus();
    function ir() {
      var code = root.querySelector('#entcode').value.trim().toUpperCase();
      if (!code) { ZU.toast('Escribí el código de tu clase', 'mal'); return; }
      location.hash = '#/clase/' + encodeURIComponent(code);
    }
    root.querySelector('#entbtn').onclick = ir;
    root.querySelector('#entcode').addEventListener('keydown', function (e) { if (e.key === 'Enter') ir(); });
  }

  /* ---------------- LOBBY DE CLASE (estudiante) ---------------- */
  function lobby(root, code) {
    ZDB.classes.getByCode(code).then(function (cls) {
      if (!cls) { root.innerHTML = '<div class="vacio">No existe una clase con el código <b>' + ZU.esc(code) + '</b>. Revisá el código con tu docente.</div>'; return; }
      ZDB.assign.forClass(cls.id).then(function (games) {
        root.innerHTML = '<div class="doc-hero"><div><h1>' + ZI('users') + ' ' + ZU.esc(cls.name) + '</h1>' +
          '<div class="sub">Elegí tu nombre y después la actividad para jugar.</div></div></div>' +
          '<div id="lobbynombre"></div>' +
          '<div class="seccion-tit" style="margin-top:20px"><h2>Actividades</h2></div>' +
          '<div class="grid cols-3">' + (games.length ? games.map(function (gm) {
            return '<div class="card juego-card"><div class="juego-portada" style="--acc:' + ACC[gm.type] + '">' + (gm.image ? '<img src="' + ZU.esc(gm.image) + '">' : ZGICON(gm.type)) + '</div>' +
              '<h3>' + ZU.esc(gm.title) + '</h3><div class="meta">' + ZU.esc(tipoInfo(gm.type).name) + '</div>' +
              '<div class="acc"><a class="btn primary small" href="#/jugar?juego=' + gm.id + '&clase=' + cls.code + '">' + ZI('play') + 'Jugar</a></div></div>';
          }).join('') : '<div class="vacio">Todavía no hay actividades en esta clase. Pedile a tu docente que comparta alguna.</div>') + '</div>';
        pintarNombre(root, cls);
      });
    });
  }

  function pintarNombre(root, cls) {
    var box = root.querySelector('#lobbynombre');
    box.innerHTML = '<div class="card login-card" style="margin:0 auto 10px"><label class="campo">¿Cómo te llamás?</label>' +
      '<div class="flex"><input class="input" id="lonnombre" placeholder="Tu nombre y apellido" style="flex:1">' +
      '<button class="btn primary" id="lonbtn">Entrar</button></div><div id="lonmsg"></div></div>';
    var inp = box.querySelector('#lonnombre');
    inp.focus();
    function entrar() {
      var nombre = inp.value.trim();
      if (!nombre) { ZU.toast('Escribí tu nombre', 'mal'); return; }
      var roster = cls.roster || [];
      var m = ZU.matchStudent(nombre, roster);
      if (m.status === 'ok' || (m.status === 'nuevo' && !roster.length)) {
        sessionStorage.setItem('zj_student_' + cls.code, JSON.stringify({ name: m.status === 'ok' ? m.name : nombre }));
        ZU.toast('¡Hola, ' + (m.status === 'ok' ? m.name : nombre) + '!');
        box.querySelector('#lonmsg').innerHTML = '<div class="login-ok" style="margin-top:10px"><span class="ok">' + ZI('check') + ' Listo, ya podés elegir una actividad abajo.</span></div>';
      } else if (m.status === 'candidatos') {
        box.querySelector('#lonmsg').innerHTML = '<div class="login-cands"><div class="muted">Encontré varios nombres parecidos, ¿cuál sos?</div><div class="cand-btns">' +
          m.candidates.map(function (c) {
            return '<button class="btn" data-cand="' + ZU.esc(c) + '">' + ZU.esc(c) + '</button>';
          }).join('') + '</div></div>';
        box.querySelectorAll('[data-cand]').forEach(function (b) {
          b.onclick = function () {
            sessionStorage.setItem('zj_student_' + cls.code, JSON.stringify({ name: b.dataset.cand }));
            ZU.toast('¡Hola, ' + b.dataset.cand + '!');
            box.querySelector('#lonmsg').innerHTML = '<div class="login-ok"><span class="ok">' + ZI('check') + ' Listo.</span></div>';
          };
        });
      } else {
        /* nuevo con roster: confirmar */
        box.querySelector('#lonmsg').innerHTML = '<div class="login-cands"><div class="muted">No encontré tu nombre en la lista. ¿Jugás como <b>' + ZU.esc(nombre) + '</b>?</div>' +
          '<div class="cand-btns"><button class="btn primary" id="lonconfirm">Sí, ese soy yo</button><button class="btn ghost" id="lonretry">Revisar</button></div></div>';
        box.querySelector('#lonconfirm').onclick = function () {
          sessionStorage.setItem('zj_student_' + cls.code, JSON.stringify({ name: nombre }));
          ZU.toast('¡Hola, ' + nombre + '!');
          box.querySelector('#lonmsg').innerHTML = '<div class="login-ok"><span class="ok">' + ZI('check') + ' Listo.</span></div>';
        };
        box.querySelector('#lonretry').onclick = function () { inp.value = ''; inp.focus(); };
      }
    }
    box.querySelector('#lonbtn').onclick = entrar;
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') entrar(); });
  }

  /* ---------------- JUGADOR ---------------- */
  function jugador(root, q, embed) {
    var gameId = q.juego || '';
    var classCode = (q.clase || '').toUpperCase();
    if (embed) document.body.classList.add('embed');
    ZDB.games.get(gameId).then(function (game) {
      if (!game) { root.innerHTML = '<div class="vacio">Esta actividad no existe o fue eliminada.</div>'; return; }
      var t = tipoInfo(game.type);
      if (embed) {
        root.innerHTML = '<div class="wrap"><div class="game-wrap" id="gplay"></div></div>';
        pedirNombreYJugar(root.querySelector('#gplay'), game, classCode, true, null);
        return;
      }
      root.innerHTML = '<div class="doc-hero"><div><h1>' + ZGICON(game.type) + ' ' + ZU.esc(game.title) + '</h1>' +
        '<div class="sub">' + ZU.esc(t.name) + (game.subject ? ' · ' + ZU.esc(game.subject) : '') + '</div></div>' +
        '<div class="acc"><a class="btn ghost" href="javascript:history.back()">' + ZI('back') + ' Volver</a></div></div>' +
        '<div class="wrap"><div class="game-wrap" id="gplay"></div></div>';
      pedirNombreYJugar(root.querySelector('#gplay'), game, classCode, false, function () { location.hash = '#/'; });
    });
  }

  function pedirNombreYJugar(box, game, classCode, embed, onExit) {
    var cls = null;
    function lanzar(student) {
      box.innerHTML = '<div class="game-wrap" id="gplay2"></div>';
      ZG.start(box.querySelector('#gplay2'), game, {
        student: student, classCode: classCode, embed: embed,
        onExit: function () { if (onExit) onExit(); else location.hash = '#/'; }
      });
      ZG.embedMsg('listo', {});
    }
    if (classCode) {
      ZDB.classes.getByCode(classCode).then(function (c) {
        cls = c;
        formNombre(box, cls, lanzar);
      });
    } else {
      formNombre(box, null, lanzar);
    }
  }

  function formNombre(box, cls, lanzar) {
    var roster = cls ? (cls.roster || []) : [];
    var guardado = null;
    if (cls) { try { guardado = JSON.parse(sessionStorage.getItem('zj_student_' + cls.code) || 'null'); } catch (e) {} }
    box.innerHTML = '<div class="login-card"><div class="card">' +
      '<h2>' + (cls ? ZU.esc(cls.name) : '¿Cómo te llamás?') + '</h2>' +
      '<p class="muted">' + (cls && roster.length ? 'Tu nombre tiene que estar en la lista de la clase.' : 'Escribí tu nombre para empezar.') + '</p>' +
      '<label class="campo">Nombre y apellido</label>' +
      '<div class="flex"><input class="input" id="pname" placeholder="Ej: Pérez Juan" value="' + ZU.esc(guardado ? guardado.name : '') + '">' +
      '<button class="btn primary" id="pbtn">Jugar</button></div>' +
      '<div id="pmsg"></div></div></div>';
    var inp = box.querySelector('#pname');
    inp.focus();
    function ir() {
      var nombre = inp.value.trim();
      if (!nombre) { ZU.toast('Escribí tu nombre', 'mal'); return; }
      var m = ZU.matchStudent(nombre, roster);
      if (m.status === 'ok' || (m.status === 'nuevo' && !roster.length)) {
        lanzar({ name: m.status === 'ok' ? m.name : nombre });
      } else if (m.status === 'candidatos') {
        box.querySelector('#pmsg').innerHTML = '<div class="login-cands"><div class="muted">¿Cuál de estos nombres es el tuyo?</div><div class="cand-btns">' +
          m.candidates.map(function (c) { return '<button class="btn" data-cand="' + ZU.esc(c) + '">' + ZU.esc(c) + '</button>'; }).join('') + '</div></div>';
        box.querySelectorAll('[data-cand]').forEach(function (b) { b.onclick = function () { lanzar({ name: b.dataset.cand }); }; });
      } else {
        box.querySelector('#pmsg').innerHTML = '<div class="login-cands"><div class="muted">No encontré tu nombre en la lista. ¿Jugás como <b>' + ZU.esc(nombre) + '</b>?</div>' +
          '<div class="cand-btns"><button class="btn primary" id="pconfirm">Sí, ese soy yo</button></div></div>';
        box.querySelector('#pconfirm').onclick = function () { lanzar({ name: nombre }); };
      }
    }
    box.querySelector('#pbtn').onclick = ir;
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') ir(); });
  }

  /* ---------------- DOCENTE ---------------- */
  function docente(root, sub) {
    var t = ZDB.teacher();
    if (!t.name) {
      root.innerHTML = '<div class="login-card"><div class="card"><h2>¡Hola! Contame tu nombre</h2>' +
        '<p class="muted">Así firmás tus actividades y aparecen en los informes.</p>' +
        '<div class="flex"><input class="input" id="tname" placeholder="Tu nombre y apellido">' +
        '<button class="btn primary" id="tsave">Guardar</button></div></div></div>';
      root.querySelector('#tsave').onclick = function () {
        var n = root.querySelector('#tname').value.trim();
        if (n) { ZDB.setTeacherName(n); docente(root, sub); }
      };
      return;
    }
    if (sub === 'juegos' || !sub) panelJuegos(root, t);
    else if (sub === 'nuevo') selectorTipo(root);
    else if (sub && sub.indexOf('juego/') === 0) editorJuego(root, sub.slice(6), t);
    else if (sub === 'clases') panelClases(root, t);
    else if (sub && sub.indexOf('clase/') === 0) editorClase(root, sub.slice(6), t);
    else if (sub === 'informes') panelInformes(root, t);
    else root.innerHTML = '<div class="vacio">Sección no encontrada</div>';
  }

  function panelJuegos(root, t) {
    ZDB.games.mine().then(function (games) {
      ZDB.classes.mine().then(function (classes) {
        root.innerHTML =
          '<div class="doc-hero"><div><h1>' + ZI('edit') + ' Mis actividades</h1>' +
          '<div class="sub">Hola ' + ZU.esc(t.name) + ' · ' + games.length + ' actividades · ' + classes.length + ' clases</div></div>' +
          '<div class="acc"><a class="btn primary" href="#/docente/nuevo">' + ZI('plus') + 'Nueva actividad</a>' +
          '<a class="btn ghost" href="#/docente/clases">' + ZI('users') + 'Mis clases</a>' +
          '<a class="btn ghost" href="#/docente/informes">' + ZI('search') + 'Informes</a></div></div>' +
          (games.length ? '<div class="grid cols-3">' + games.map(function (gm) {
            var ti = tipoInfo(gm.type);
            return '<div class="card juego-card"><div class="juego-portada" style="--acc:' + ACC[gm.type] + '">' + (gm.image ? '<img src="' + ZU.esc(gm.image) + '">' : ZGICON(gm.type)) + '</div>' +
              '<h3>' + ZU.esc(gm.title) + '</h3><div class="meta">' + ZU.esc(ti.name) + (gm.subject ? ' · ' + ZU.esc(gm.subject) : '') + '</div>' +
              '<div class="juego-admin"><div class="acciones">' +
              '<a class="btn small primary" href="#/docente/juego/' + gm.id + '">' + ZI('edit') + 'Editar</a>' +
              '<a class="btn small ghost" href="#/jugar?juego=' + gm.id + '">' + ZI('eye') + 'Probar</a>' +
              '<button class="btn small ghost" data-share="' + gm.id + '">' + ZI('link') + 'Compartir</button>' +
              '<button class="btn small danger" data-del="' + gm.id + '">' + ZI('trash') + '</button>' +
              '</div><div class="share-zone" id="share-' + gm.id + '"></div></div></div>';
          }).join('') + '</div>' : '<div class="card vacio">Todavía no creaste actividades. <a href="#/docente/nuevo">Creá la primera</a>.</div>');
        root.querySelectorAll('[data-del]').forEach(function (b) {
          b.onclick = function () {
            if (!confirm('¿Eliminar esta actividad? Se perderán sus resultados.')) return;
            ZDB.games.remove(b.dataset.del).then(function () { ZU.toast('Actividad eliminada'); panelJuegos(root, t); });
          };
        });
        root.querySelectorAll('[data-share]').forEach(function (b) {
          b.onclick = function () { shareDialog(root, b.dataset.share, classes); };
        });
      });
    });
  }

  function shareDialog(root, gameId, classes) {
    ZDB.games.get(gameId).then(function (gm) {
      if (!gm) return;
      var zone = root.querySelector('#share-' + gameId);
      var base = location.origin + location.pathname;
      var link = base + '?juego=' + gm.id;
      var cls = classes[0];
      var linkClase = cls ? base + '#/jugar?juego=' + gm.id + '&clase=' + cls.code : link;
      var iframe = '<iframe src="' + base + '?embed=1&juego=' + gm.id + (cls ? '&clase=' + cls.code : '') + '" style="width:100%;height:640px;border:0;border-radius:12px" allow="autoplay"></iframe>';
      zone.innerHTML = '<div class="share-box">' +
        '<b>Enlace directo:</b><br><code>' + linkClase + '</code><br><br>' +
        '<b>Para embeber en el aula virtual (iframe):</b><br><code>' + iframe.replace(/</g, '&lt;') + '</code>' +
        '<div class="copy-row"><button class="btn small turquesa" data-copy="' + ZU.esc(linkClase) + '">' + ZI('copy') + 'Copiar enlace</button>' +
        '<button class="btn small" data-copy="' + ZU.esc(iframe) + '">' + ZI('copy') + 'Copiar iframe</button></div></div>';
      zone.querySelectorAll('[data-copy]').forEach(function (b) {
        b.onclick = function () {
          var txt = b.dataset.copy;
          if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { ZU.toast('Copiado'); });
          else {
            var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); ZU.toast('Copiado');
          }
        };
      });
      zone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  function selectorTipo(root) {
    root.innerHTML = '<div class="doc-hero"><h1>' + ZI('plus') + ' Nueva actividad</h1>' +
      '<div class="sub">Elegí el tipo de juego</div></div>' +
      '<div class="grid cols-3">' + ZED.list.map(function (tl) {
        return '<a class="chip-tipo" href="#/docente/juego/nuevo?tipo=' + tl[0] + '">' + ZGICON(tl[0]) +
          '<span><b>' + ZU.esc(tl[1]) + '</b><small>' + ZU.esc(tl[2]) + '</small></span></a>';
      }).join('') + '</div>';
  }

  function editorJuego(root, id, t) {
    var q = ZU.query();
    var tipo = id === 'nuevo' ? (q.tipo || 'test') : null;
    function pintar(game) {
      if (game && game.type && !tipo) tipo = game.type;
      var ti = tipoInfo(tipo);
      root.innerHTML =
        '<div class="doc-hero"><div class="ed-tipo-header">' + ZGICON(tipo) +
        '<div><h1>' + ZI('edit') + ' ' + (game ? ZU.esc(game.title) : 'Nueva actividad') + '</h1>' +
        '<div class="sub">' + ZU.esc(ti.name) + ' · ' + ZU.esc(ti.desc) + '</div></div></div>' +
        '<div class="acc"><a class="btn ghost" href="#/docente/juegos">' + ZI('back') + ' Mis actividades</a></div></div>' +
        '<div class="wrap"><div class="card">' +
        '<div class="grid cols-2">' +
        '<div><label class="campo">Título *</label><input class="input" id="etitle" value="' + ZU.esc(game ? game.title : '') + '" placeholder="Ej: La célula eucariota"></div>' +
        '<div><label class="campo">Materia</label><input class="input" id="esubject" value="' + ZU.esc(game ? game.subject : '') + '" placeholder="Ej: Biología"></div>' +
        '<div><label class="campo">Nivel / curso</label><input class="input" id="elevel" value="' + ZU.esc(game ? game.level : '') + '" placeholder="Ej: 1° año"></div>' +
        '<div><label class="campo">Imagen de portada (URL, opcional)</label><input class="input" id="eimage" value="' + ZU.esc(game ? game.image : '') + '" placeholder="https://…"></div>' +
        '</div>' +
        '<label class="campo mt">Consigna para los estudiantes</label><textarea class="input" id="einstr" rows="2">' + ZU.esc(game ? game.instructions : '') + '</textarea>' +
        '<h3 class="mt">Contenido del juego</h3><div id="econtent"></div>' +
        '<h3 class="mt">Opciones</h3>' +
        '<div class="ed-checks">' +
        '<label><input type="checkbox" id="eantitrampa"' + (game && game.options && game.options.antiTrampa ? ' checked' : '') + '> Anti-trampa (bloquea copiar/pegar y avisa si cambian de ventana)</label>' +
        (tipo === 'test' || tipo === 'froggy' ? '<label>Explicaciones <select class="input" id="eexpl" style="width:auto;display:inline-block">' +
          ['alFallar', 'siempre', 'nunca'].map(function (v) { var cur = game && game.options && game.options.mostrarExplicaciones || 'alFallar'; return '<option value="' + v + '"' + (cur === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></label>' : '') +
        '</div>' +
        '<div class="flex mt"><button class="btn primary" id="esave">' + ZI('check') + ' Guardar actividad</button>' +
        (id !== 'nuevo' ? '<button class="btn ghost" id="edup">' + ZI('copy') + ' Duplicar</button>' : '') + '</div>' +
        '<div id="emsg"></div></div></div>';
      var ed = ZED.get(tipo);
      var contentHolder = { get: null };
      if (ed) {
        var mount = ZED.mount(root.querySelector('#econtent'), tipo, game ? game.content : {});
        contentHolder.get = mount.getContent;
      }
      root.querySelector('#esave').onclick = function () { guardar(game); };
      var dup = root.querySelector('#edup');
      if (dup) dup.onclick = function () {
        guardar(game, true);
      };
      function guardar(g, esCopia) {
        var title = root.querySelector('#etitle').value.trim();
        if (!title) { ZU.toast('Poné un título', 'mal'); return; }
        var content = contentHolder.get ? contentHolder.get() : {};
        var options = {};
        if (root.querySelector('#eantitrampa') && root.querySelector('#eantitrampa').checked) options.antiTrampa = true;
        var expl = root.querySelector('#eexpl');
        if (expl) options.mostrarExplicaciones = expl.value;
        var nuevo = {
          id: (g && !esCopia) ? g.id : null,
          type: tipo, title: title,
          subject: root.querySelector('#esubject').value.trim(),
          level: root.querySelector('#elevel').value.trim(),
          instructions: root.querySelector('#einstr').value.trim(),
          image: root.querySelector('#eimage').value.trim(),
          content: content, options: options
        };
        if (esCopia) nuevo.title = title + ' (copia)';
        ZDB.games.save(nuevo).then(function (saved) {
          ZU.toast('Actividad guardada');
          location.hash = '#/docente/juegos';
        }).catch(function (err) { ZU.toast(err.message || 'Error al guardar', 'mal'); });
      }
    }
    if (id === 'nuevo') pintar(null);
    else ZDB.games.get(id).then(function (game) {
      if (!game) { root.innerHTML = '<div class="vacio">Actividad no encontrada</div>'; return; }
      pintar(game);
    });
  }

  /* ---------------- CLASES ---------------- */
  function panelClases(root, t) {
    ZDB.classes.mine().then(function (classes) {
      root.innerHTML =
        '<div class="doc-hero"><div><h1>' + ZI('users') + ' Mis clases</h1><div class="sub">' + classes.length + ' clases</div></div>' +
        '<div class="acc"><a class="btn primary" href="#/docente/clase/nueva">' + ZI('plus') + 'Nueva clase</a>' +
        '<a class="btn ghost" href="#/docente/juegos">' + ZI('back') + ' Mis actividades</a></div></div>' +
        (classes.length ? '<div class="grid cols-2">' + classes.map(function (c) {
          return '<div class="card"><h3>' + ZU.esc(c.name) + '</h3>' +
            '<div class="codigo-grande">' + ZU.esc(c.code) + '</div>' +
            '<p class="muted">' + (c.roster || []).length + ' estudiantes en la lista</p>' +
            '<div class="flex"><a class="btn small primary" href="#/docente/clase/' + c.id + '">' + ZI('edit') + 'Editar y asignar</a>' +
            '<button class="btn small danger" data-del="' + c.id + '">' + ZI('trash') + '</button></div></div>';
        }).join('') + '</div>' : '<div class="card vacio">Todavía no creaste clases. <a href="#/docente/clase/nueva">Creá la primera</a>.</div>');
      root.querySelectorAll('[data-del]').forEach(function (b) {
        b.onclick = function () {
          if (!confirm('¿Eliminar esta clase?')) return;
          ZDB.classes.remove(b.dataset.del).then(function () { ZU.toast('Clase eliminada'); panelClases(root, t); });
        };
      });
    });
  }

  function editorClase(root, id, t) {
    function pintar(cls) {
      var esNueva = id === 'nueva';
      root.innerHTML =
        '<div class="doc-hero"><h1>' + ZI('users') + ' ' + (esNueva ? 'Nueva clase' : ZU.esc(cls.name)) + '</h1>' +
        '<div class="acc"><a class="btn ghost" href="#/docente/clases">' + ZI('back') + ' Mis clases</a></div></div>' +
        '<div class="wrap"><div class="card">' +
        '<div class="grid cols-2"><div><label class="campo">Nombre de la clase *</label><input class="input" id="ecname" value="' + ZU.esc(cls ? cls.name : '') + '" placeholder="Ej: 3° A · Biología"></div>' +
        (esNueva ? '' : '<div><label class="campo">Código para los estudiantes</label><div class="codigo-grande">' + ZU.esc(cls.code) + '</div></div>') + '</div>' +
        '<label class="campo mt">Lista de estudiantes (uno por línea; podés pegar desde una planilla)</label>' +
        '<textarea class="input" id="ecroster" rows="8" placeholder="Pérez Juan&#10;Gómez Ana&#10;…">' + ZU.esc(cls ? (cls.roster || []).join('\n') : '') + '</textarea>' +
        '<div class="ayuda">Con la lista cargada, cada estudiante entra con su nombre (se toleran tildes, mayúsculas, apellidos y una letra cambiada). Si la lista está vacía, entra cualquier nombre como invitado.</div>' +
        '<div class="flex mt"><button class="btn primary" id="ecsave">' + ZI('check') + ' Guardar clase</button></div>' +
        '<div id="ecmsg"></div>' +
        (!esNueva ? '<h3 class="mt">Actividades de la clase</h3><div id="ecassign"></div>' : '') +
        '</div></div>';
      root.querySelector('#ecsave').onclick = function () {
        var name = root.querySelector('#ecname').value.trim();
        if (!name) { ZU.toast('Poné un nombre a la clase', 'mal'); return; }
        var roster = root.querySelector('#ecroster').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        ZDB.classes.save({ id: esNueva ? null : cls.id, name: name, roster: roster }).then(function (saved) {
          ZU.toast('Clase guardada');
          location.hash = '#/docente/clase/' + saved.id;
        }).catch(function (e) { ZU.toast(e.message || 'Error', 'mal'); });
      };
      if (!esNueva) cargarAsignaciones(root, cls);
    }
    function cargarAsignaciones(root, cls) {
      Promise.all([ZDB.games.mine(), ZDB.assign.forClass(cls.id)]).then(function (res) {
        var mine = res[0], asignados = res[1];
        var box = root.querySelector('#ecassign');
        box.innerHTML = mine.length ? mine.map(function (gm) {
          var esta = asignados.some(function (a) { return a.id === gm.id; });
          return '<label class="fila-edit" style="display:flex;gap:10px;align-items:center"><input type="checkbox" data-assign="' + gm.id + '"' + (esta ? ' checked' : '') + '>' +
            '<span style="flex:1">' + ZGICON(gm.type) + ' ' + ZU.esc(gm.title) + '</span></label>';
        }).join('') : '<div class="muted">Primero creá actividades para asignarlas a la clase.</div>';
        box.querySelectorAll('[data-assign]').forEach(function (cb) {
          cb.onchange = function () {
            if (cb.checked) ZDB.assign.add(cls.id, cb.dataset.assign);
            else ZDB.assign.remove(cls.id, cb.dataset.assign);
          };
        });
      });
    }
    if (id === 'nueva') pintar(null);
    else ZDB.classes.mine().then(function (classes) {
      var cls = classes.filter(function (c) { return c.id === id; })[0];
      if (!cls) { root.innerHTML = '<div class="vacio">Clase no encontrada</div>'; return; }
      pintar(cls);
    });
  }

  /* ---------------- INFORMES ---------------- */
  function panelInformes(root, t) {
    ZDB.classes.mine().then(function (classes) {
      if (!classes.length) {
        root.innerHTML = '<div class="doc-hero"><h1>' + ZI('search') + ' Informes</h1></div><div class="card vacio">Necesitás una clase con código para ver informes. <a href="#/docente/clase/nueva">Crear clase</a></div>';
        return;
      }
      ZDB.games.mine().then(function (games) {
        root.innerHTML = '<div class="doc-hero"><h1>' + ZI('search') + ' Informes</h1>' +
          '<div class="sub">Resultados de tus estudiantes, en vivo</div></div>' +
          '<div class="wrap"><div class="card">' +
          '<div class="inf-tabs"><label class="campo" style="margin:0">Clase</label><select class="input" id="infclass" style="width:auto">' +
          classes.map(function (c) { return '<option value="' + c.code + '">' + ZU.esc(c.name) + ' (' + c.code + ')</option>'; }).join('') + '</select>' +
          '<label class="campo" style="margin:0">Actividad</label><select class="input" id="infgame" style="width:auto"><option value="">Todas las actividades</option>' +
          games.map(function (gm) { return '<option value="' + gm.id + '">' + ZU.esc(gm.title) + '</option>'; }).join('') + '</select>' +
          '</div><div id="infreport"></div></div></div>';
        function cargar() {
          var code = root.querySelector('#infclass').value;
          var gid = root.querySelector('#infgame').value;
          ZDB.attempts.forClass(code).then(function (atts) {
            if (gid) atts = atts.filter(function (a) { return a.game_id === gid; });
            pintarInforme(root, atts, gid);
          });
        }
        root.querySelector('#infclass').onchange = cargar;
        root.querySelector('#infgame').onchange = cargar;
        cargar();
      });
    });
  }

  function pintarInforme(root, atts, gid) {
    var box = root.querySelector('#infreport');
    if (!atts.length) { box.innerHTML = '<div class="vacio">Todavía no hay resultados para esta selección.</div>'; return; }
    /* agregar por alumno */
    var agg = {};
    atts.forEach(function (a) {
      if (!agg[a.student_name]) agg[a.student_name] = { name: a.student_name, partidas: 0, aciertos: 0, total: 0, mejor: 0, sumaScore: 0, ultima: '' };
      var g = agg[a.student_name];
      g.partidas++; g.aciertos += a.correct || 0; g.total += a.total || 0;
      g.mejor = Math.max(g.mejor, a.score || 0);
      g.sumaScore += a.score || 0;
      if (a.created_at > g.ultima) g.ultima = a.created_at;
    });
    var filasArr = Object.keys(agg).map(function (k) { return agg[k]; })
      .sort(function (a, b) { return b.aciertos - a.aciertos || b.mejor - a.mejor; });
    var html = '<div class="flex mb"><button class="btn small turquesa" id="infcsv">' + ZI('download') + ' Exportar CSV</button>' +
      '<span class="muted">' + atts.length + ' partidas · ' + filasArr.length + ' alumnos</span></div>' +
      '<table class="tabla"><thead><tr><th>#</th><th>Alumno</th><th>Partidas</th><th>Aciertos</th><th>Total</th><th>%</th><th>Nota</th><th>Mejor puntaje</th><th>Última vez</th></tr></thead><tbody>';
    filasArr.forEach(function (g, i) {
      var p = pct(g.aciertos, g.total);
      var nota = g.total ? Math.max(1, Math.min(10, Math.round(p / 10))) : 0;
      html += '<tr><td class="rank-num">' + (i + 1) + '</td><td><b>' + ZU.esc(g.name) + '</b></td><td>' + g.partidas + '</td>' +
        '<td>' + g.aciertos + '</td><td>' + g.total + '</td>' +
        '<td><div class="flex" style="gap:8px"><div class="pct-bar" style="flex:1"><i style="width:' + p + '%"></i></div><b>' + p + '%</b></div></td>' +
        '<td><b>' + nota + '</b></td><td>' + g.mejor + '</td><td class="muted">' + ZU.fmtFecha(g.ultima) + '</td></tr>';
    });
    html += '</tbody></table>';
    /* detalle de partidas recientes */
    html += '<h3 class="mt">Partidas recientes</h3><table class="tabla"><thead><tr><th>Fecha</th><th>Alumno</th><th>Actividad</th><th>Puntaje</th><th>Aciertos</th><th>Tiempo</th></tr></thead><tbody>';
    atts.slice(0, 25).forEach(function (a) {
      html += '<tr><td class="muted">' + ZU.fmtFecha(a.created_at) + '</td><td><b>' + ZU.esc(a.student_name) + '</b></td>' +
        '<td>' + ZU.esc(a.game_title || '') + '</td><td><b>' + (a.score || 0) + '</b></td>' +
        '<td>' + (a.correct || 0) + ' / ' + (a.total || 0) + '</td><td class="muted">' + ZU.fmtTime(a.time_ms || 0) + '</td></tr>';
    });
    html += '</tbody></table>';
    box.innerHTML = html;
    box.querySelector('#infcsv').onclick = function () {
      var filasCSV = [['#', 'Alumno', 'Partidas', 'Aciertos', 'Total', '%', 'Nota', 'Mejor puntaje', 'Última vez']];
      filasArr.forEach(function (g, i) {
        var p = pct(g.aciertos, g.total);
        var nota = g.total ? Math.max(1, Math.min(10, Math.round(p / 10))) : 0;
        filasCSV.push([i + 1, g.name, g.partidas, g.aciertos, g.total, p + '%', nota, g.mejor, ZU.fmtFecha(g.ultima)]);
      });
      ZU.downloadCSV('informe-zeiro-juegos.csv', filasCSV);
    };
  }

  window.ZVIEWS = {
    landing: landing, entrar: entrar, lobby: lobby, jugador: jugador,
    docente: docente, panelJuegos: panelJuegos, panelClases: panelClases,
    editorClase: editorClase, panelInformes: panelInformes, editorJuego: editorJuego
  };
})();
