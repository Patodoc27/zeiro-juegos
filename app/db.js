/* ZEIRO JUEGOS · Capa de datos.
   Una sola interfaz (ZDB) con dos backends:
   - DEMO: JSON en localStorage (sin servidor; ideal para probar).
   - SUPABASE: Postgres vía supabase-js cuando CONFIG está completo.
   Todos los métodos devuelven Promesas. */
(function () {
  var LS = CONFIG.LS_DEMO;
  var sb = null;
  var useDemo = !CONFIG.SUPABASE_URL;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function now() { return new Date().toISOString(); }
  function sbClient() {
    if (!sb && window.supabase && CONFIG.SUPABASE_URL) {
      sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
    return sb;
  }

  /* ---------------- DOCENTE (token local) ---------------- */
  function teacher() {
    var t = ZU.storeGet(CONFIG.LS_TEACHER, null);
    if (!t || !t.token) {
      t = useDemo ? { token: 'demo-teacher', name: 'Docente Demo' } : { token: ZU.uid('t'), name: '' };
      ZU.storeSet(CONFIG.LS_TEACHER, t);
    }
    return t;
  }
  function setTeacherName(name) {
    var t = teacher(); t.name = name; ZU.storeSet(CONFIG.LS_TEACHER, t);
  }

  /* ---------------- DEMO STORE ---------------- */
  function loadDemo() {
    var d = ZU.storeGet(LS, null);
    if (!d || !d.meta) {
      d = { games: [], classes: [], class_games: [], attempts: [], meta: { seq: 0 } };
      if (window.ZSEED) {
        var s = ZSEED.build();
        d.games = s.games; d.classes = s.classes; d.class_games = s.class_games; d.attempts = s.attempts;
      }
      saveDemo(d);
    }
    return d;
  }
  function saveDemo(d) { ZU.storeSet(LS, d); }
  function dfind(d, t, id) {
    var arr = d[t] || [];
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }

  var ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  function genCode(len) {
    var s = '';
    for (var i = 0; i < (len || 6); i++) s += ALPH[Math.floor(Math.random() * ALPH.length)];
    return s;
  }
  function codeFree(d, code) {
    return !(d.classes || []).some(function (c) { return c.code === code; });
  }

  /* ================= SUPABASE ================= */
  function sbGames() { return sbClient().from('zj_games'); }
  function sbClasses() { return sbClient().from('zj_classes'); }
  function sbClassGames() { return sbClient().from('zj_class_games'); }
  function sbAttempts() { return sbClient().from('zj_attempts'); }

  function mapGame(r) {
    return { id: r.id, type: r.type, title: r.title, subject: r.subject || '', level: r.level || '',
      instructions: r.instructions || '', content: r.content || {}, options: r.options || {},
      image: r.image || '', owner_token: r.owner_token, owner_name: r.owner_name || '',
      created_at: r.created_at, updated_at: r.updated_at };
  }
  function mapClass(r) {
    return { id: r.id, name: r.name, code: r.code, owner_token: r.owner_token, owner_name: r.owner_name || '',
      roster: r.roster || [], created_at: r.created_at };
  }
  function mapAttempt(r) {
    return { id: r.id, game_id: r.game_id, class_code: r.class_code || '', student_name: r.student_name,
      score: r.score, correct: r.correct, total: r.total, time_ms: r.time_ms || 0,
      answers: r.answers || [], game_title: r.game_title || '', game_type: r.game_type || '', created_at: r.created_at };
  }

  var api = {
    demo: useDemo,
    teacher: teacher,
    setTeacherName: setTeacherName,

    /* ---------- JUEGOS ---------- */
    games: {
      list: function () {
        if (useDemo) return Promise.resolve(clone(loadDemo().games));
        return sbGames().select('*').order('created_at', { ascending: false }).then(function (r) {
          if (r.error) throw r.error; return (r.data || []).map(mapGame);
        });
      },
      get: function (id) {
        if (useDemo) { var g = dfind(loadDemo(), 'games', id); return Promise.resolve(g ? clone(g) : null); }
        return sbGames().select('*').eq('id', id).single().then(function (r) {
          if (r.error) { if (r.error.code === 'PGRST116') return null; throw r.error; }
          return mapGame(r.data);
        });
      },
      mine: function () {
        var tok = teacher().token;
        if (useDemo) return Promise.resolve(clone(loadDemo().games.filter(function (g) { return g.owner_token === tok; })));
        return sbGames().select('*').eq('owner_token', tok).order('created_at', { ascending: false }).then(function (r) {
          if (r.error) throw r.error; return (r.data || []).map(mapGame);
        });
      },
      save: function (game) {
        var t = teacher();
        var g = clone(game);
        g.owner_token = t.token; g.owner_name = t.name || '';
        if (useDemo) {
          var d = loadDemo();
          if (g.id && dfind(d, 'games', g.id)) {
            var old = dfind(d, 'games', g.id);
            if (old.owner_token !== t.token) return Promise.reject(new Error('No podés editar este juego'));
            g.created_at = old.created_at; g.updated_at = now();
            d.games = d.games.map(function (x) { return x.id === g.id ? g : x; });
          } else {
            if (!g.id) g.id = 'g-' + genCode(8);
            g.created_at = now(); g.updated_at = g.created_at;
            d.games.push(g);
          }
          saveDemo(d);
          return Promise.resolve(clone(g));
        }
        if (g.id) {
          return sbClient().rpc('zj_save_game', { p_id: g.id, p_owner_token: t.token, p_data: {
            type: g.type, title: g.title, subject: g.subject, level: g.level, instructions: g.instructions,
            content: g.content, options: g.options, image: g.image, owner_name: g.owner_name
          } }).then(function (r) {
            if (r.error) throw r.error; return g;
          });
        }
        return sbGames().insert({
          type: g.type, title: g.title, subject: g.subject, level: g.level, instructions: g.instructions,
          content: g.content, options: g.options, image: g.image, owner_token: t.token, owner_name: g.owner_name
        }).select().single().then(function (r) {
          if (r.error) throw r.error; return mapGame(r.data);
        });
      },
      remove: function (id) {
        var tok = teacher().token;
        if (useDemo) {
          var d = loadDemo();
          var g = dfind(d, 'games', id);
          if (g && g.owner_token !== tok) return Promise.reject(new Error('No podés borrar este juego'));
          d.games = d.games.filter(function (x) { return x.id !== id; });
          d.class_games = (d.class_games || []).filter(function (cg) { return cg.game_id !== id; });
          saveDemo(d);
          return Promise.resolve(true);
        }
        return sbClient().rpc('zj_delete_game', { p_id: id, p_owner_token: tok }).then(function (r) {
          if (r.error) throw r.error; return true;
        });
      }
    },

    /* ---------- CLASES ---------- */
    classes: {
      list: function () {
        if (useDemo) return Promise.resolve(clone(loadDemo().classes));
        return sbClasses().select('*').order('created_at', { ascending: false }).then(function (r) {
          if (r.error) throw r.error; return (r.data || []).map(mapClass);
        });
      },
      mine: function () {
        var tok = teacher().token;
        if (useDemo) return Promise.resolve(clone(loadDemo().classes.filter(function (c) { return c.owner_token === tok; })));
        return sbClasses().select('*').eq('owner_token', tok).order('created_at', { ascending: false }).then(function (r) {
          if (r.error) throw r.error; return (r.data || []).map(mapClass);
        });
      },
      getByCode: function (code) {
        if (useDemo) {
          var d = loadDemo();
          var c = null;
          (d.classes || []).forEach(function (x) { if (x.code === code) c = x; });
          return Promise.resolve(c ? clone(c) : null);
        }
        return sbClasses().select('*').eq('code', code).maybeSingle().then(function (r) {
          if (r.error) throw r.error; return r.data ? mapClass(r.data) : null;
        });
      },
      save: function (cls) {
        var t = teacher();
        var c = clone(cls);
        c.owner_token = t.token; c.owner_name = t.name || '';
        if (useDemo) {
          var d = loadDemo();
          if (c.id && dfind(d, 'classes', c.id)) {
            var old = dfind(d, 'classes', c.id);
            if (old.owner_token !== t.token) return Promise.reject(new Error('No podés editar esta clase'));
            c.created_at = old.created_at;
            d.classes = d.classes.map(function (x) { return x.id === c.id ? c : x; });
          } else {
            if (!c.id) {
              c.id = 'c-' + genCode(8);
              var code;
              do { code = genCode(6); } while (!codeFree(d, code));
              c.code = code;
            }
            if (!c.roster) c.roster = [];
            c.created_at = now();
            d.classes.push(c);
          }
          saveDemo(d);
          return Promise.resolve(clone(c));
        }
        if (c.id) {
          return sbClient().rpc('zj_save_class', { p_id: c.id, p_owner_token: t.token, p_data: {
            name: c.name, roster: c.roster || [], owner_name: c.owner_name
          } }).then(function (r) {
            if (r.error) throw r.error; return c;
          });
        }
        var code2, tries = 0;
        function tryInsert() {
          return sbClasses().insert({
            name: c.name, roster: c.roster || [], owner_token: t.token, owner_name: c.owner_name, code: c.code || genCode(6)
          }).select().single().then(function (r) {
            if (r.error) {
              if (r.error.code === '23505' && tries < 5) { tries++; return tryInsert(); }
              throw r.error;
            }
            return mapClass(r.data);
          });
        }
        return tryInsert();
      },
      remove: function (id) {
        var tok = teacher().token;
        if (useDemo) {
          var d = loadDemo();
          var c = dfind(d, 'classes', id);
          if (c && c.owner_token !== tok) return Promise.reject(new Error('No podés borrar esta clase'));
          d.classes = d.classes.filter(function (x) { return x.id !== id; });
          d.class_games = (d.class_games || []).filter(function (cg) { return cg.class_id !== id; });
          saveDemo(d);
          return Promise.resolve(true);
        }
        return sbClient().rpc('zj_delete_class', { p_id: id, p_owner_token: tok }).then(function (r) {
          if (r.error) throw r.error; return true;
        });
      }
    },

    /* ---------- ASIGNACIONES juego↔clase ---------- */
    assign: {
      add: function (classId, gameId) {
        if (useDemo) {
          var d = loadDemo();
          var ex = (d.class_games || []).some(function (x) { return x.class_id === classId && x.game_id === gameId; });
          if (!ex) d.class_games.push({ id: 'cg-' + genCode(8), class_id: classId, game_id: gameId, created_at: now() });
          saveDemo(d);
          return Promise.resolve(true);
        }
        return sbClassGames().upsert({ class_id: classId, game_id: gameId }, { onConflict: 'class_id,game_id', ignoreDuplicates: true })
          .then(function (r) { if (r.error) throw r.error; return true; });
      },
      remove: function (classId, gameId) {
        if (useDemo) {
          var d = loadDemo();
          d.class_games = (d.class_games || []).filter(function (x) { return !(x.class_id === classId && x.game_id === gameId); });
          saveDemo(d);
          return Promise.resolve(true);
        }
        return sbClassGames().delete().eq('class_id', classId).eq('game_id', gameId)
          .then(function (r) { if (r.error) throw r.error; return true; });
      },
      forClass: function (classId) {
        if (useDemo) {
          var d = loadDemo();
          var ids = (d.class_games || []).filter(function (x) { return x.class_id === classId; }).map(function (x) { return x.game_id; });
          return Promise.resolve(clone(d.games.filter(function (g) { return ids.indexOf(g.id) !== -1; })));
        }
        return sbClassGames().select('game_id').eq('class_id', classId).then(function (r) {
          if (r.error) throw r.error;
          var ids = (r.data || []).map(function (x) { return x.game_id; });
          if (!ids.length) return [];
          return sbGames().select('*').in('id', ids).then(function (r2) {
            if (r2.error) throw r2.error; return (r2.data || []).map(mapGame);
          });
        });
      }
    },

    /* ---------- INTENTOS ---------- */
    attempts: {
      add: function (att) {
        var a = clone(att);
        a.id = a.id || ZU.uid('a');
        a.created_at = now();
        if (useDemo) {
          var d = loadDemo();
          d.attempts.push(a);
          saveDemo(d);
          return Promise.resolve(clone(a));
        }
        return sbAttempts().insert({
          id: a.id, game_id: a.game_id, class_code: a.class_code || '', student_name: a.student_name,
          score: a.score, correct: a.correct, total: a.total, time_ms: a.time_ms || 0,
          answers: a.answers || [], game_title: a.game_title || '', game_type: a.game_type || ''
        }).select().single().then(function (r) {
          if (r.error) throw r.error; return mapAttempt(r.data);
        });
      },
      forGame: function (gameId) {
        if (useDemo) {
          return Promise.resolve(clone(loadDemo().attempts.filter(function (a) { return a.game_id === gameId; })
            .sort(function (x, y) { return x.created_at < y.created_at ? 1 : -1; })));
        }
        return sbAttempts().select('*').eq('game_id', gameId).order('created_at', { ascending: false }).then(function (r) {
          if (r.error) throw r.error; return (r.data || []).map(mapAttempt);
        });
      },
      forClass: function (code) {
        if (useDemo) {
          return Promise.resolve(clone(loadDemo().attempts.filter(function (a) { return a.class_code === code; })
            .sort(function (x, y) { return x.created_at < y.created_at ? 1 : -1; })));
        }
        return sbAttempts().select('*').eq('class_code', code).order('created_at', { ascending: false }).then(function (r) {
          if (r.error) throw r.error; return (r.data || []).map(mapAttempt);
        });
      },
      forClassGame: function (code, gameId) {
        return api.attempts.forClass(code).then(function (all) {
          return all.filter(function (a) { return a.game_id === gameId; });
        });
      }
    }
  };

  window.ZDB = api;
})();
