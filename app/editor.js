/* ZEIRO JUEGOS · Editor de actividades (docente) */
(function () {
  function esc(s) { return ZU.esc(s); }

  /* helpers de filas dinámicas */
  function filas(items, cols, addLabel) {
    var h = '<div class="ed-filas">';
    items.forEach(function (it, i) {
      h += '<div class="fila-edit"><div class="fila-head"><span>#' + (i + 1) + '</span>' +
        '<button type="button" class="btn danger small" data-del>Quitar</button></div>' +
        '<div class="mini-grid">' + cols.map(function (c) {
          return '<div>' + (c.label ? '<label class="campo">' + c.label + '</label>' : '') +
            (c.type === 'textarea' ? '<textarea class="input" rows="2" data-k="' + c.k + '">' + esc(it[c.k] || '') + '</textarea>'
              : '<input class="input" data-k="' + c.k + '" value="' + esc(it[c.k] || '') + '" placeholder="' + esc(c.ph || '') + '">') + '</div>';
        }).join('') + '</div></div>';
    });
    h += '</div>';
    return h;
  }
  function leerFilas(root) {
    var out = [];
    root.querySelectorAll('.fila-edit').forEach(function (f) {
      var o = {};
      f.querySelectorAll('[data-k]').forEach(function (el) { o[el.dataset.k] = el.value; });
      out.push(o);
    });
    return out;
  }
  function bindFilas(root, cols, addLabel, onChange) {
    function re() {
      var wrap = root.querySelector('.ed-filas');
      if (!wrap) return;
      wrap.querySelectorAll('[data-del]').forEach(function (b) {
        b.onclick = function () { b.closest('.fila-edit').remove(); if (onChange) onChange(); };
      });
      var add = wrap.querySelector('[data-add]');
      if (add) add.onclick = function () {
        var vacio = {};
        cols.forEach(function (c) { vacio[c.k] = ''; });
        var tmp = document.createElement('div');
        tmp.innerHTML = filas([vacio], cols, addLabel);
        var nw = tmp.querySelector('.fila-edit');
        wrap.insertBefore(nw, add);
        bindFilas(root, cols, addLabel, onChange);
        if (onChange) onChange();
      };
    }
    re();
  }

  /* columnas de preguntas tipo test */
  var COL_PREG = [
    { k: 'q', label: 'Pregunta', type: 'textarea' },
    { k: 'type', label: 'Tipo', ph: 'mcq / multi / write' },
    { k: 'options', label: 'Opciones (una por línea)', type: 'textarea' },
    { k: 'correct', label: 'Correcta(s): índice(s) 1-based, o respuestas si es escrita' },
    { k: 'explanation', label: 'Explicación (opcional)' }
  ];

  var EDITORS = {
    test: {
      name: 'Test', desc: 'Cuestionario con corrección instantánea o al final',
      html: function (c) {
        return '<div class="ed-cfg"><label class="campo">Modo</label><select class="input" data-k="mode">' +
          '<option value="instant"' + (c.mode !== 'examen' ? ' selected' : '') + '>Instantánea (feedback al instante)</option>' +
          '<option value="examen"' + (c.mode === 'examen' ? ' selected' : '') + '>Examen (corrección al final)</option></select>' +
          '<div class="ayuda">Para cada pregunta: tipo <code>mcq</code> (una correcta), <code>multi</code> (varias) o <code>write</code> (escrita). En «Correcta(s)» poné el número de opción (1, 2…) o las respuestas aceptadas separadas por coma si es escrita.</div>' +
          '<div class="ed-filas" data-filas="questions">' + filas(c.questions || [], COL_PREG, 'Agregar pregunta').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
          '<button type="button" class="btn ghost" data-add="questions">' + ZI('plus') + 'Agregar pregunta</button></div>';
      },
      collect: function (root) {
        var mode = root.querySelector('[data-k="mode"]').value;
        var questions = leerFilas(root.querySelector('[data-filas="questions"]')).map(function (f) {
          var type = (f.type || 'mcq').trim().toLowerCase();
          var options = (f.options || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
          var q = { q: f.q, type: type, explanation: f.explanation || '' };
          if (type === 'write') {
            q.answers = f.correct.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
          } else {
            q.options = options;
            q.correct = f.correct.split(',').map(function (s) { return parseInt(s.trim(), 10) - 1; }).filter(function (n) { return !isNaN(n); });
            if (type !== 'multi') q.correct = q.correct[0];
          }
          return q;
        }).filter(function (q) { return q.q && (q.type === 'write' ? q.answers.length : (q.options || []).length && q.correct != null); });
        return { mode: mode, questions: questions };
      }
    },

    froggy: {
      name: 'Froggy Jumps', desc: 'Saltar el río respondiendo con vidas y tiempo',
      html: function (c) {
        return '<div class="ed-cfg"><div class="mini-grid">' +
          '<div><label class="campo">Vidas</label><input class="input" type="number" min="1" max="9" data-k="lives" value="' + esc(c.lives || 5) + '"></div>' +
          '<div><label class="campo">Segundos por pregunta</label><input class="input" type="number" min="5" max="120" data-k="timePerQuestion" value="' + esc(c.timePerQuestion || 20) + '"></div>' +
          '<div><label class="campo">Preguntas por partida (0 = todas)</label><input class="input" type="number" min="0" max="50" data-k="count" value="' + esc(c.count || 0) + '"></div>' +
          '</div><div class="ayuda">Cada pregunta tiene 3 opciones; «Correcta» es el número (1, 2 o 3).</div>' +
          '<div class="ed-filas" data-filas="questions">' + filas((c.questions || []).map(function (q) {
            return { q: q.q, op1: (q.options || [])[0] || '', op2: (q.options || [])[1] || '', op3: (q.options || [])[2] || '', correct: q.correct != null ? q.correct + 1 : '', explanation: q.explanation || '' };
          }), [
            { k: 'q', label: 'Pregunta', type: 'textarea' },
            { k: 'op1', label: 'Opción 1' }, { k: 'op2', label: 'Opción 2' }, { k: 'op3', label: 'Opción 3' },
            { k: 'correct', label: 'Correcta (1-3)' }, { k: 'explanation', label: 'Explicación' }
          ], 'Agregar pregunta').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
          '<button type="button" class="btn ghost" data-add="questions">' + ZI('plus') + 'Agregar pregunta</button></div>';
      },
      collect: function (root) {
        var questions = leerFilas(root.querySelector('[data-filas="questions"]')).map(function (f) {
          var correct = parseInt(f.correct, 10) - 1;
          if (isNaN(correct) || correct < 0 || correct > 2) return null;
          return { q: f.q, options: [f.op1, f.op2, f.op3], correct: correct, explanation: f.explanation || '' };
        }).filter(function (q) { return q && q.q && q.options.every(function (o) { return o; }); });
        return {
          lives: parseInt(root.querySelector('[data-k="lives"]').value, 10) || 5,
          timePerQuestion: parseInt(root.querySelector('[data-k="timePerQuestion"]').value, 10) || 20,
          count: parseInt(root.querySelector('[data-k="count"]').value, 10) || 0,
          order: 'random',
          questions: questions
        };
      }
    },

    sopa: {
      name: 'Sopa de Letras', desc: 'Encontrá las palabras escondidas en la grilla',
      html: function (c) {
        return '<div class="ed-cfg"><div class="mini-grid">' +
          '<div><label class="campo">Tamaño de grilla (vacío = automático)</label><input class="input" type="number" min="8" max="20" data-k="size" value="' + esc(c.size || '') + '"></div>' +
          '<div><label class="campo">Tiempo límite (seg, 0 = sin límite)</label><input class="input" type="number" min="0" max="600" data-k="timeLimit" value="' + esc(c.timeLimit || 0) + '"></div>' +
          '<div><label class="campo">Vidas (0 = sin vidas)</label><input class="input" type="number" min="0" max="9" data-k="lives" value="' + esc(c.lives || 0) + '"></div>' +
          '</div><label class="campo mt"><input type="checkbox" data-k="showBank"' + (c.showBank !== false ? ' checked' : '') + '> Mostrar lista de palabras</label>' +
          '<div class="ed-filas" data-filas="words">' + filas((c.words || []).map(function (w) {
            return { word: typeof w === 'string' ? w : w.word, clue: typeof w === 'string' ? '' : (w.clue || '') };
          }), [{ k: 'word', label: 'Palabra' }, { k: 'clue', label: 'Pista (opcional)', type: 'textarea' }], 'Agregar palabra').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
          '<button type="button" class="btn ghost" data-add="words">' + ZI('plus') + 'Agregar palabra</button></div>';
      },
      collect: function (root) {
        return {
          size: parseInt(root.querySelector('[data-k="size"]').value, 10) || 0,
          timeLimit: parseInt(root.querySelector('[data-k="timeLimit"]').value, 10) || 0,
          lives: parseInt(root.querySelector('[data-k="lives"]').value, 10) || 0,
          showBank: root.querySelector('[data-k="showBank"]').checked,
          words: leerFilas(root.querySelector('[data-filas="words"]')).filter(function (w) { return w.word.trim(); })
            .map(function (w) { return { word: w.word.trim().toUpperCase(), clue: w.clue || '' }; })
        };
      }
    },

    crucigrama: {
      name: 'Crucigrama', desc: 'Se genera solo a partir de las pistas',
      html: function (c) {
        var cws = (c.crosswords && c.crosswords.length) ? c.crosswords : [{ title: '', clues: c.clues || [] }];
        var h = '<div class="ed-cfg"><div class="ayuda">Escribí cada pista con su respuesta. Las palabras se ubican solas y se pueden regenerar. Ideal que compartan letras para que crucen bien.</div>';
        cws.forEach(function (cw, i) {
          h += '<div class="fila-edit cw"><div class="fila-head"><span>Crucigrama ' + (i + 1) + '</span>' + (cws.length > 1 ? '<button type="button" class="btn danger small" data-delcw>Quitar</button>' : '') + '</div>' +
            '<label class="campo">Título</label><input class="input" data-cwtitle value="' + esc(cw.title || '') + '">' +
            '<div class="ed-filas" data-filas="clues">' + filas(cw.clues || [], [
              { k: 'clue', label: 'Pista', type: 'textarea' }, { k: 'answer', label: 'Respuesta' }
            ], 'Agregar pista').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
            '<button type="button" class="btn ghost" data-addclues>Agregar pista</button></div>';
        });
        h += '<button type="button" class="btn ghost" data-addcw>' + ZI('plus') + 'Agregar otro crucigrama</button></div>';
        return h;
      },
      collect: function (root) {
        var cws = [];
        root.querySelectorAll('.cw').forEach(function (cw) {
          var clues = leerFilas(cw.querySelector('[data-filas="clues"]')).filter(function (c) { return c.answer.trim(); })
            .map(function (c) { return { clue: c.clue || '', answer: c.answer.trim().toUpperCase() }; });
          if (clues.length) cws.push({ title: cw.querySelector('[data-cwtitle]').value, clues: clues });
        });
        return { crosswords: cws };
      }
    },

    columnas: {
      name: 'Relacionar Columnas', desc: 'Unir tarjetas de dos columnas',
      html: function (c) {
        return '<div class="ed-cfg"><div class="ayuda">Cada fila es una relación correcta. Las «tarjetas de más» (opcionales) se escriben separadas por coma.</div>' +
          '<label class="campo">Pares correctos</label>' +
          '<div class="ed-filas" data-filas="pairs">' + filas(c.pairs || [], [
            { k: 'left', label: 'Izquierda' }, { k: 'right', label: 'Derecha' }
          ], 'Agregar par').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
          '<button type="button" class="btn ghost" data-add="pairs">' + ZI('plus') + 'Agregar par</button>' +
          '<label class="campo mt">Tarjetas de más (izquierda, coma)</label><input class="input" data-k="extraLeft" value="' + esc((c.extraLeft || []).join(', ')) + '">' +
          '<label class="campo">Tarjetas de más (derecha, coma)</label><input class="input" data-k="extraRight" value="' + esc((c.extraRight || []).join(', ')) + '"></div>';
      },
      collect: function (root) {
        var pairs = leerFilas(root.querySelector('[data-filas="pairs"]')).filter(function (p) { return p.left.trim() && p.right.trim(); });
        function csv(k) { return root.querySelector('[data-k="' + k + '"]').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean); }
        return { pairs: pairs, extraLeft: csv('extraLeft'), extraRight: csv('extraRight') };
      }
    },

    memory: {
      name: 'Memoria', desc: 'Encontrar los pares de cartas',
      html: function (c) {
        return '<div class="ed-cfg"><label class="campo mt"><input type="checkbox" data-k="identical"' + (c.identical ? ' checked' : '') + '> Pares idénticos (misma carta dos veces)</label>' +
          '<div class="ed-filas" data-filas="pairs">' + filas(c.pairs || [], [
            { k: 'a', label: 'Carta A' }, { k: 'b', label: 'Carta B (su pareja)' }
          ], 'Agregar par').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
          '<button type="button" class="btn ghost" data-add="pairs">' + ZI('plus') + 'Agregar par</button></div>';
      },
      collect: function (root) {
        return {
          identical: root.querySelector('[data-k="identical"]').checked,
          pairs: leerFilas(root.querySelector('[data-filas="pairs"]')).filter(function (p) { return p.a.trim() && (root.querySelector('[data-k="identical"]').checked || p.b.trim()); })
        };
      }
    },

    completar: {
      name: 'Completar Frases', desc: 'Completar espacios en oraciones',
      html: function (c) {
        var mode = c.mode === 'write' ? 'write' : 'select';
        var h = '<div class="ed-cfg"><label class="campo">Modo</label><select class="input" data-k="mode">' +
          '<option value="select"' + (mode === 'select' ? ' selected' : '') + '>Seleccionar (el alumno elige)</option>' +
          '<option value="write"' + (mode === 'write' ? ' selected' : '') + '>Escribir (el alumno escribe)</option></select>' +
          '<div class="ayuda">Usá <code>{{1}}</code>, <code>{{2}}</code>… para marcar cada espacio. En «Respuestas» poné las aceptadas separadas por coma; en «Opciones» las que ve el alumno (si las dejás vacías se usan las respuestas).</div>';
        (c.blocks || []).forEach(function (b, i) {
          h += '<div class="fila-edit" data-block><div class="fila-head"><span>Frase ' + (i + 1) + '</span><button type="button" class="btn danger small" data-delblock>Quitar</button></div>' +
            '<label class="campo">Texto con espacios</label><textarea class="input" rows="2" data-btext>' + esc(b.text || '') + '</textarea>' +
            '<div class="ed-blanks">' + (function () {
              var max = 0, m;
              var re = /\{\{(\d+)\}\}/g;
              while ((m = re.exec(b.text || '')) !== null) max = Math.max(max, parseInt(m[1], 10));
              var hs = '';
              for (var n = 1; n <= max; n++) {
                var blank = (b.blanks || [])[n - 1] || { answers: [], options: [] };
                hs += '<div class="mini-grid" style="margin-top:8px"><div><label class="campo">Espacio ' + n + ' · Respuestas (coma)</label><input class="input" data-answers value="' + esc((blank.answers || []).join(', ')) + '"></div>' +
                  '<div><label class="campo">Opciones (coma, opcional)</label><input class="input" data-options value="' + esc((blank.options || []).join(', ')) + '"></div></div>';
              }
              return hs || '<div class="muted">Escribí la frase con {{1}} para ver los espacios.</div>';
            })() + '</div></div>';
        });
        h += '<button type="button" class="btn ghost" data-addblock>' + ZI('plus') + 'Agregar frase</button></div>';
        return h;
      },
      collect: function (root) {
        var blocks = [];
        root.querySelectorAll('[data-block]').forEach(function (f) {
          var text = f.querySelector('[data-btext]').value;
          var max = 0, m;
          var re = /\{\{(\d+)\}\}/g;
          while ((m = re.exec(text)) !== null) max = Math.max(max, parseInt(m[1], 10));
          var blanks = [];
          for (var n = 1; n <= max; n++) {
            var ansEl = f.querySelectorAll('[data-answers]')[n - 1];
            var optEl = f.querySelectorAll('[data-options]')[n - 1];
            var answers = ansEl ? ansEl.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
            var options = optEl ? optEl.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
            blanks.push({ answers: answers, options: options.length ? options : answers });
          }
          if (text.trim()) blocks.push({ text: text, blanks: blanks });
        });
        return { mode: root.querySelector('[data-k="mode"]').value, blocks: blocks };
      }
    },

    'ordenar-palabras': {
      name: 'Ordenar Palabras', desc: 'Armar oraciones ordenando palabras',
      html: function (c) {
        return '<div class="ed-cfg"><div class="ayuda">«Palabras en orden» separadas por coma, en el orden correcto. «Distractores» (opcional) son palabras que no van.</div>' +
          '<div class="ed-filas" data-filas="items">' + filas(c.items || [], [
            { k: 'hint', label: 'Pista (opcional)' },
            { k: 'words', label: 'Palabras en orden (coma)', type: 'textarea' },
            { k: 'distractors', label: 'Distractores (coma, opcional)' }
          ], 'Agregar oración').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
          '<button type="button" class="btn ghost" data-add="items">' + ZI('plus') + 'Agregar oración</button></div>';
      },
      collect: function (root) {
        function csv(s) { return s.split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
        return { items: leerFilas(root.querySelector('[data-filas="items"]')).filter(function (it) { return it.words.trim(); }).map(function (it) {
          return { hint: it.hint || '', words: csv(it.words), distractors: csv(it.distractors || '') };
        }) };
      }
    },

    'si-o-no': {
      name: 'Sí o No', desc: 'Responder si las afirmaciones son correctas',
      html: function (c) {
        return '<div class="ed-cfg"><div class="ed-filas" data-filas="items">' + filas(c.items || [], [
          { k: 'text', label: 'Afirmación', type: 'textarea' },
          { k: 'answer', label: 'Respuesta' },
          { k: 'explanation', label: 'Explicación (opcional)' }
        ], 'Agregar afirmación').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
          '<button type="button" class="btn ghost" data-add="items">' + ZI('plus') + 'Agregar afirmación</button>' +
          '<div class="ayuda">En «Respuesta» escribí: <code>si</code>, <code>no</code> o <code>ambas</code>.</div></div>';
      },
      collect: function (root) {
        return { items: leerFilas(root.querySelector('[data-filas="items"]')).filter(function (it) { return it.text.trim(); }).map(function (it) {
          var a = (it.answer || 'si').trim().toLowerCase();
          return { text: it.text.trim(), answer: a === 'no' ? 'no' : (a === 'ambas' ? 'ambas' : 'si'), explanation: it.explanation || '' };
        }) };
      }
    },

    'ordenar-letras': {
      name: 'Ordenar Letras', desc: 'Descifrar palabras desordenadas',
      html: function (c) {
        return '<div class="ed-cfg"><div class="ed-filas" data-filas="items">' + filas(c.items || [], [
          { k: 'word', label: 'Palabra correcta' },
          { k: 'clue', label: 'Pista', type: 'textarea' },
          { k: 'image', label: 'URL de imagen (opcional)' }
        ], 'Agregar palabra').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
          '<button type="button" class="btn ghost" data-add="items">' + ZI('plus') + 'Agregar palabra</button></div>';
      },
      collect: function (root) {
        return { items: leerFilas(root.querySelector('[data-filas="items"]')).filter(function (it) { return it.word.trim(); })
          .map(function (it) { return { word: it.word.trim(), clue: it.clue || '', image: it.image || '' }; }) };
      }
    },

    ruleta: {
      name: 'Ruleta de Palabras', desc: 'Escribir palabras por letra en rondas',
      html: function (c) {
        return '<div class="ed-cfg"><div class="mini-grid">' +
          '<div><label class="campo">Modo</label><select class="input" data-k="mode">' +
          '<option value="empieza"' + (c.mode !== 'contiene' ? ' selected' : '') + '>Empieza por la letra</option>' +
          '<option value="contiene"' + (c.mode === 'contiene' ? ' selected' : '') + '>Contiene la letra</option></select></div>' +
          '<div><label class="campo">Segundos por ronda</label><input class="input" type="number" min="15" max="300" data-k="timePerRound" value="' + esc(c.timePerRound || 60) + '"></div>' +
          '<div><label class="campo">Rondas</label><input class="input" type="number" min="1" max="10" data-k="rounds" value="' + esc(c.rounds || 3) + '"></div>' +
          '</div><label class="campo mt">Lista de palabras válidas (una por línea)</label>' +
          '<textarea class="input" rows="7" data-k="words">' + esc((c.words || []).join('\n')) + '</textarea>' +
          '<div class="ayuda">Solo cuentan las palabras de esta lista. Si dejás la lista vacía no hay ronda posible: cargá palabras del tema.</div></div>';
      },
      collect: function (root) {
        return {
          mode: root.querySelector('[data-k="mode"]').value,
          timePerRound: parseInt(root.querySelector('[data-k="timePerRound"]').value, 10) || 60,
          rounds: parseInt(root.querySelector('[data-k="rounds"]').value, 10) || 3,
          words: root.querySelector('[data-k="words"]').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean)
        };
      }
    },

    grupos: {
      name: 'Relacionar Grupos', desc: 'Clasificar tarjetas en grupos',
      html: function (c) {
        return '<div class="ed-cfg"><label class="campo">Grupos</label>' +
          '<div class="ed-filas" data-filas="groups">' + filas(c.groups || [], [{ k: 'name', label: 'Nombre del grupo' }], 'Agregar grupo').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
          '<button type="button" class="btn ghost" data-add="groups">' + ZI('plus') + 'Agregar grupo</button>' +
          '<label class="campo mt">Tarjetas (en «Grupos» los números de grupo separados por coma, 1-based; vacío = distractor)</label>' +
          '<div class="ed-filas" data-filas="cards">' + filas(c.cards || [], [
            { k: 'text', label: 'Tarjeta' }, { k: 'groups', label: 'Grupos (coma)' }
          ], 'Agregar tarjeta').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
          '<button type="button" class="btn ghost" data-add="cards">' + ZI('plus') + 'Agregar tarjeta</button></div>';
      },
      collect: function (root) {
        var groups = leerFilas(root.querySelector('[data-filas="groups"]')).filter(function (g) { return g.name.trim(); });
        var cards = leerFilas(root.querySelector('[data-filas="cards"]')).filter(function (c) { return c.text.trim(); }).map(function (c) {
          return { text: c.text.trim(), groups: (c.groups || '').split(',').map(function (s) { return parseInt(s.trim(), 10) - 1; }).filter(function (n) { return !isNaN(n) && n >= 0 && n < groups.length; }) };
        });
        return { groups: groups, cards: cards };
      }
    },

    filas: {
      name: 'Filas', desc: 'Ordenar tarjetas por criterio',
      html: function (c) {
        var h = '<div class="ed-cfg"><div class="ayuda">Cada fila se ordena de menor a mayor (o al revés) según el «valor» numérico o fecha de cada tarjeta.</div>';
        var lists = (c.lists && c.lists.length) ? c.lists : [{}];
        lists.forEach(function (l, i) {
          h += '<div class="fila-edit fl"><div class="fila-head"><span>Fila ' + (i + 1) + '</span>' + (lists.length > 1 ? '<button type="button" class="btn danger small" data-delfl>Quitar</button>' : '') + '</div>' +
            '<div class="mini-grid"><div><label class="campo">Título</label><input class="input" data-fltitle value="' + esc(l.title || '') + '"></div>' +
            '<div><label class="campo">Criterio</label><select class="input" data-fldir><option value="asc"' + (l.direction !== 'desc' ? ' selected' : '') + '>De menor a mayor</option><option value="desc"' + (l.direction === 'desc' ? ' selected' : '') + '>De mayor a menor</option></select></div></div>' +
            '<label class="campo mt">Tarjetas (texto y valor separados por |, una por línea; ej: Revolución de Mayo | 1810)</label>' +
            '<textarea class="input" rows="5" data-flitems>' + esc((l.items || []).map(function (it) { return it.text + ' | ' + (it.value != null ? it.value : ''); }).join('\n')) + '</textarea></div>';
        });
        h += '<button type="button" class="btn ghost" data-addfl>' + ZI('plus') + 'Agregar fila</button></div>';
        return h;
      },
      collect: function (root) {
        var lists = [];
        root.querySelectorAll('.fl').forEach(function (f) {
          var items = f.querySelector('[data-flitems]').value.split('\n').map(function (line) {
            var parts = line.split('|');
            if (!parts[0] || !parts[0].trim()) return null;
            var val = parts[1] != null ? parts[1].trim() : '';
            var num = parseFloat(val);
            return { text: parts[0].trim(), value: isNaN(num) || val === '' ? (Date.parse(val) || val) : num };
          }).filter(Boolean);
          if (items.length) lists.push({ title: f.querySelector('[data-fltitle]').value, direction: f.querySelector('[data-fldir]').value, items: items });
        });
        return { lists: lists };
      }
    },

    mapa: {
      name: 'Mapa Interactivo', desc: 'Puntos interactivos sobre una imagen',
      html: function (c) {
        return '<div class="ed-cfg"><div class="mini-grid">' +
          '<div><label class="campo">Imagen (URL o subí archivo)</label><input class="input" data-k="image" value="' + esc(c.image || '') + '"></div>' +
          '<div><label class="campo">Modo</label><select class="input" data-k="mode">' +
          '<option value="jugar"' + (c.mode !== 'explorar' && c.mode !== 'explorar-jugar' ? ' selected' : '') + '>Jugar (preguntas)</option>' +
          '<option value="explorar"' + (c.mode === 'explorar' ? ' selected' : '') + '>Explorar (solo información)</option>' +
          '<option value="explorar-jugar"' + (c.mode === 'explorar-jugar' ? ' selected' : '') + '>Explorar y jugar</option></select></div>' +
          '<div><label class="campo">Respuestas</label><select class="input" data-k="written"><option value="0"' + (!c.written ? ' selected' : '') + '>Opción múltiple</option><option value="1"' + (c.written ? ' selected' : '') + '>Escrita</option></select></div>' +
          '</div>' +
          '<div class="ayuda">Las coordenadas X e Y van de 0 a 100 (porcentaje de la imagen). En modo exploración usá el campo «Info»; en preguntas con opciones, «Correcta» es el número (1-based).</div>' +
          '<div class="ed-filas" data-filas="points">' + filas(c.points || [], [
            { k: 'x', label: 'X (0-100)' }, { k: 'y', label: 'Y (0-100)' },
            { k: 'q', label: 'Pregunta', type: 'textarea' },
            { k: 'options', label: 'Opciones (coma) o respuestas si es escrita' },
            { k: 'correct', label: 'Correcta (número)' },
            { k: 'info', label: 'Info (modo explorar)' },
            { k: 'explanation', label: 'Explicación' }
          ], 'Agregar punto').replace(/^<div class="ed-filas">|<\/div>$/g, '') + '</div>' +
          '<button type="button" class="btn ghost" data-add="points">' + ZI('plus') + 'Agregar punto</button>' +
          '<label class="campo mt">Subir imagen desde tu PC</label><input type="file" accept="image/*" data-fileimg>' +
          '<div class="muted" data-imgpreview></div></div>';
      },
      collect: function (root) {
        var written = root.querySelector('[data-k="written"]').value === '1';
        var points = leerFilas(root.querySelector('[data-filas="points"]')).map(function (p) {
          var options = (p.options || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
          var point = {
            x: parseFloat(p.x) || 0, y: parseFloat(p.y) || 0,
            q: p.q || '', info: p.info || '', explanation: p.explanation || ''
          };
          if (written) point.answers = options;
          else {
            point.options = options;
            var ci = parseInt(p.correct, 10) - 1;
            point.correct = isNaN(ci) ? 0 : ci;
          }
          return point;
        }).filter(function (p) { return p.q.trim(); });
        return {
          mode: root.querySelector('[data-k="mode"]').value,
          written: written,
          image: root.querySelector('[data-k="image"]').value,
          points: points
        };
      }
    }
  };

  /* tipo -> metadatos para el selector */
  var TYPE_LIST = [
    ['test', 'Test', 'Cuestionario con corrección'],
    ['froggy', 'Froggy Jumps', 'Saltar el río respondiendo'],
    ['sopa', 'Sopa de Letras', 'Palabras escondidas en la grilla'],
    ['crucigrama', 'Crucigrama', 'Generado desde las pistas'],
    ['columnas', 'Relacionar Columnas', 'Unir tarjetas de dos columnas'],
    ['memory', 'Memoria', 'Pares de cartas'],
    ['completar', 'Completar Frases', 'Espacios en oraciones'],
    ['ordenar-palabras', 'Ordenar Palabras', 'Armar oraciones'],
    ['si-o-no', 'Sí o No', 'Afirmaciones correctas o no'],
    ['ordenar-letras', 'Ordenar Letras', 'Descifrar palabras'],
    ['ruleta', 'Ruleta de Palabras', 'Palabras por letra y rondas'],
    ['grupos', 'Relacionar Grupos', 'Clasificar tarjetas'],
    ['filas', 'Filas', 'Ordenar por criterio'],
    ['mapa', 'Mapa Interactivo', 'Puntos sobre una imagen']
  ];

  window.ZED = {
    list: TYPE_LIST,
    get: function (type) { return EDITORS[type] || null; },
    /* monta el editor de contenido dentro de root; devuelve {getContent()} */
    mount: function (root, type, content) {
      var ed = EDITORS[type];
      if (!ed) { root.innerHTML = '<div class="vacio">Tipo desconocido</div>'; return { getContent: function () { return {}; } }; }
      root.innerHTML = ed.html(content || {});
      /* delegación: agregar/quitar filas dinámicas */
      root.addEventListener('click', function (e) {
        var del = e.target.closest ? e.target.closest('[data-del]') : null;
        if (del) { var f = del.closest('.fila-edit'); if (f) f.remove(); return; }
        var add = e.target.closest ? e.target.closest('[data-add]') : null;
        if (!add) return;
        var key = add.dataset.add;
        var cont = root.querySelector('[data-filas="' + key + '"]');
        if (!cont) return;
        var last = cont.querySelector('.fila-edit');
        var cols = [];
        if (last) last.querySelectorAll('[data-k]').forEach(function (el) { cols.push({ k: el.dataset.k, label: '', type: el.tagName === 'TEXTAREA' ? 'textarea' : 'input' }); });
        var vacio = {};
        cols.forEach(function (c) { vacio[c.k] = ''; });
        var tmp = document.createElement('div');
        tmp.innerHTML = filas([vacio], cols, 'x');
        cont.appendChild(tmp.querySelector('.fila-edit'));
      });
      /* crucigrama: agregar/quitar secciones y pistas */
      var addcw = root.querySelector('[data-addcw]');
      if (addcw) addcw.onclick = function () {
        /* duplicar estructura del último crucigrama vacío */
        var cws = root.querySelectorAll('.cw');
        var last = cws[cws.length - 1];
        if (!last) return;
        var clone = last.cloneNode(true);
        clone.querySelectorAll('input,textarea').forEach(function (el) { el.value = ''; });
        clone.querySelector('[data-delcw]') && clone.querySelector('[data-delcw]').classList.remove('oculto');
        last.parentNode.insertBefore(clone, addcw);
        bindCrucigrama(root);
      };
      var addblock = root.querySelector('[data-addblock]');
      if (addblock) addblock.onclick = function () {
        var blocks = root.querySelectorAll('[data-block]');
        var last = blocks[blocks.length - 1];
        if (!last) return;
        var clone = last.cloneNode(true);
        clone.querySelectorAll('input,textarea').forEach(function (el) { el.value = ''; });
        clone.querySelector('.ed-blanks').innerHTML = '<div class="muted">Escribí la frase con {{1}} para ver los espacios.</div>';
        addblock.parentNode.insertBefore(clone, addblock);
      };
      var addfl = root.querySelector('[data-addfl]');
      if (addfl) addfl.onclick = function () {
        var fls = root.querySelectorAll('.fl');
        var last = fls[fls.length - 1];
        if (!last) return;
        var clone = last.cloneNode(true);
        clone.querySelectorAll('input,textarea,select').forEach(function (el) { if (el.tagName !== 'SELECT') el.value = ''; });
        addfl.parentNode.insertBefore(clone, addfl);
      };
      /* upload de imagen del mapa */
      var fileimg = root.querySelector('[data-fileimg]');
      if (fileimg) fileimg.onchange = function () {
        var f = fileimg.files[0];
        if (!f) return;
        if (f.size > 1500000) { ZU.toast('Imagen muy grande (máx 1.5 MB). Usá una URL.', 'mal'); return; }
        var r = new FileReader();
        r.onload = function () {
          root.querySelector('[data-k="image"]').value = r.result;
          root.querySelector('[data-imgpreview]').innerHTML = '<img src="' + r.result + '" style="max-width:220px;border-radius:10px;margin-top:8px">';
        };
        r.readAsDataURL(f);
      };
      function bindCrucigrama(rt) {
        rt.querySelectorAll('[data-delcw]').forEach(function (b) { b.onclick = function () { b.closest('.cw').remove(); }; });
        rt.querySelectorAll('[data-addclues]').forEach(function (b) {
          b.onclick = function () {
            var filasWrap = b.parentNode.querySelector('[data-filas="clues"]');
            if (!filasWrap) return;
            var vacio = { clue: '', answer: '' };
            var tmp = document.createElement('div');
            tmp.innerHTML = filas([vacio], [{ k: 'clue' }, { k: 'answer' }], 'x');
            filasWrap.appendChild(tmp.querySelector('.fila-edit'));
            bindFilas(rt, [{ k: 'clue' }, { k: 'answer' }], 'x', null);
          };
        });
      }
      bindCrucigrama(root);
      /* binds genéricos de filas estáticas */
      function bindAll(rt) {
        /* noop: los data-add de arriba ya agregan; las filas existentes usan leerFilas */
      }
      /* eliminación de filas sueltas */
      root.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { b.closest('.fila-edit').remove(); }; });
      root.querySelectorAll('[data-delblock]').forEach(function (b) { b.onclick = function () { b.closest('[data-block]').remove(); }; });
      root.querySelectorAll('[data-delfl]').forEach(function (b) { b.onclick = function () { b.closest('.fl').remove(); }; });

      return {
        getContent: function () { return ed.collect(root); }
      };
    }
  };
})();
