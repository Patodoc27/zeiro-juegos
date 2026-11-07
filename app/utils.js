/* ZEIRO JUEGOS · Utilidades generales */
var ZU = (function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* normaliza para comparar nombres/textos: minúsculas, sin tildes, sin espacios extra */
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9ñ ]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function shuffle(arr, rand) {
    var a = arr.slice();
    rand = rand || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function uid(p) {
    return (p || 'x') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }
  function storeGet(k, dflt) {
    try { var v = localStorage.getItem(k); return v == null ? dflt : JSON.parse(v); } catch (e) { return dflt; }
  }
  function storeSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function fmtTime(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    var m = Math.floor(s / 60), r = s % 60;
    return m > 0 ? m + ' min ' + r + ' s' : r + ' s';
  }
  function fmtFecha(iso) {
    try { var d = new Date(iso); return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  }
  function csvEsc(s) {
    s = String(s == null ? '' : s);
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function downloadCSV(nombre, filas) {
    var txt = filas.map(function (f) { return f.map(csvEsc).join(';'); }).join('\r\n');
    var blob = new Blob(['\ufeff' + txt], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function toast(msg, tipo) {
    var t = document.createElement('div');
    t.className = 'toast ' + (tipo || '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('on'); }, 10);
    setTimeout(function () { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 400); }, 2600);
  }
  /* comparación tolerante de respuestas escritas */
  function respOK(respuesta, correctas, opts) {
    opts = opts || {};
    var r = norm(respuesta);
    if (!r) return false;
    for (var i = 0; i < correctas.length; i++) {
      var c = norm(correctas[i]);
      if (!c) continue;
      if (r === c) return true;
      if (opts.parcial && (r.indexOf(c) === 0 || c.indexOf(r) === 0) && Math.abs(r.length - c.length) <= 2) return true;
      if (opts.unaLetra) {
        /* una letra cambiada/faltante: misma longitud (±1) y a lo sumo 1 diferencia */
        if (Math.abs(r.length - c.length) <= 1 && dist1(r, c) <= 1) return true;
      }
    }
    return false;
  }
  function dist1(a, b) {
    if (a === b) return 0;
    var i = 0, j = 0, dif = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      dif++;
      if (dif > 1) return 2;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else { i++; j++; }
    }
    dif += (a.length - i) + (b.length - j);
    return dif;
  }
  /* identifica a un alumno contra la lista de la clase (tolerante) */
  function matchStudent(input, roster) {
    var q = norm(input);
    if (!q) return { status: 'vacio' };
    var qw = q.split(' ').filter(Boolean);
    var scored = [];
    roster.forEach(function (full) {
      var fw = norm(full).split(' ').filter(Boolean);
      if (!fw.length) return;
      /* todos los tokens del ingreso deben estar en el nombre completo */
      var ok = qw.every(function (t) { return fw.indexOf(t) !== -1 || fw.some(function (x) { return x.indexOf(t) === 0 || t.indexOf(x) === 0; }); });
      if (!ok) return;
      var missing = fw.filter(function (x) { return !qw.some(function (t) { return x === t || x.indexOf(t) === 0 || t.indexOf(x) === 0; }); });
      scored.push({ name: full, missing: missing.length, exact: norm(full) === q });
    });
    if (!scored.length) return { status: 'nuevo', name: input.trim() };
    scored.sort(function (a, b) { return (a.exact ? -1 : 0) - (b.exact ? -1 : 0) || a.missing - b.missing; });
    if (scored.length === 1 || scored[0].exact || (scored.length > 1 && scored[0].missing === 0 && scored[1].missing > 0)) {
      return { status: 'ok', name: scored[0].name };
    }
    return { status: 'candidatos', candidates: scored.slice(0, 4).map(function (s) { return s.name; }) };
  }
  function query() {
    var out = {};
    try {
      var s = location.search.replace(/^\?/, '');
      s.split('&').forEach(function (kv) {
        if (!kv) return;
        var p = kv.split('=');
        out[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' '));
      });
    } catch (e) {}
    return out;
  }
  return {
    esc: esc, norm: norm, shuffle: shuffle, randInt: randInt, pick: pick, uid: uid,
    storeGet: storeGet, storeSet: storeSet, fmtTime: fmtTime, fmtFecha: fmtFecha,
    csvEsc: csvEsc, downloadCSV: downloadCSV, toast: toast, respOK: respOK,
    matchStudent: matchStudent, query: query, dist1: dist1
  };
})();
