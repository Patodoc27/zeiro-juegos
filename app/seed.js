/* ZEIRO JUEGOS · Datos de ejemplo para el modo demo.
   Se cargan la primera vez que la app arranca sin Supabase. */
window.ZSEED = (function () {
  var OWNER = 'demo-teacher';
  function g(id, type, title, subject, level, instructions, content, options, image) {
    return {
      id: id, type: type, title: title, subject: subject, level: level,
      instructions: instructions || '', content: content, options: options || {}, image: image || '',
      owner_token: OWNER, owner_name: 'Docente Demo',
      created_at: '2026-11-01T10:00:00.000Z', updated_at: '2026-11-01T10:00:00.000Z'
    };
  }

  /* imagen SVG de una célula para el juego de mapa */
  var CELULA_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">' +
    '<rect x="30" y="30" width="740" height="460" rx="60" fill="#E0F2FE" stroke="#0284C7" stroke-width="10"/>' +
    '<rect x="60" y="60" width="680" height="400" rx="45" fill="#F0F9FF" stroke="#7DD3FC" stroke-width="4"/>' +
    '<ellipse cx="250" cy="180" rx="70" ry="55" fill="#FDE68A" stroke="#D97706" stroke-width="5"/>' +
    '<circle cx="250" cy="180" r="22" fill="#92400E"/>' +
    '<text x="250" y="300" text-anchor="middle" font-size="22" fill="#78350F" font-family="sans-serif">Núcleo</text>' +
    '<ellipse cx="520" cy="140" rx="55" ry="34" fill="#FDA4AF" stroke="#E11D48" stroke-width="5" transform="rotate(-20 520 140)"/>' +
    '<text x="520" y="210" text-anchor="middle" font-size="20" fill="#9F1239" font-family="sans-serif">Mitocondria</text>' +
    '<ellipse cx="600" cy="330" rx="55" ry="34" fill="#FDA4AF" stroke="#E11D48" stroke-width="5" transform="rotate(15 600 330)"/>' +
    '<ellipse cx="380" cy="400" rx="60" ry="30" fill="#86EFAC" stroke="#16A34A" stroke-width="5"/>' +
    '<circle cx="430" cy="430" r="7" fill="#16A34A"/><circle cx="450" cy="415" r="7" fill="#16A34A"/><circle cx="410" cy="415" r="7" fill="#16A34A"/>' +
    '<text x="380" y="480" text-anchor="middle" font-size="18" fill="#14532D" font-family="sans-serif">Cloroplastos</text>' +
    '<circle cx="700" cy="120" r="10" fill="#6366F1"/><circle cx="720" cy="160" r="10" fill="#6366F1"/>' +
    '<circle cx="680" cy="200" r="10" fill="#6366F1"/><circle cx="710" cy="230" r="10" fill="#6366F1"/>' +
    '<text x="700" y="280" text-anchor="middle" font-size="18" fill="#3730A3" font-family="sans-serif">Ribosomas</text>' +
    '<rect x="60" y="60" width="680" height="400" rx="45" fill="none" stroke="#0284C7" stroke-width="3" stroke-dasharray="10 8"/>' +
    '</svg>'
  );

  function build() {
    var games = [
      g('g-test', 'test', 'La célula eucariota', 'Biología', '1° año',
        'Leé cada pregunta y elegí la respuesta correcta.',
        {
          mode: 'instant',
          questions: [
            { q: '¿Qué organela es conocida como la «central energética» de la célula?', type: 'mcq', options: ['Núcleo', 'Mitocondria', 'Ribosoma', 'Cloroplasto'], correct: 1, explanation: 'La mitocondria produce la energía (ATP) que la célula necesita.' },
            { q: '¿Qué estructura contiene el material genético (ADN)?', type: 'mcq', options: ['Membrana celular', 'Pared celular', 'Núcleo', 'Vacuola'], correct: 2 },
            { q: 'Las células vegetales tienen una estructura que las células animales no tienen. ¿Cuál es?', type: 'mcq', options: ['Mitocondrias', 'Núcleo', 'Cloroplastos', 'Ribosomas'], correct: 2 },
            { q: '¿Cuál de estas estructuras NO forma parte de una célula animal?', type: 'mcq', options: ['Pared celular', 'Membrana celular', 'Citoplasma', 'Núcleo'], correct: 0 },
            { q: '¿Qué orgánulo se encarga de fabricar proteínas?', type: 'mcq', options: ['Lisosoma', 'Ribosoma', 'Aparato de Golgi', 'Peroxisoma'], correct: 1 },
            { q: 'La fotosíntesis ocurre en las células…', type: 'mcq', options: ['animales', 'vegetales', 'bacterias', 'hongos'], correct: 1 },
            { q: '¿Qué es la membrana celular?', type: 'write', answers: ['membrana', 'la membrana', 'barrera'], explanation: 'Es la envoltura que rodea la célula y controla lo que entra y sale.' }
          ]
        },
        { shuffleQuestions: true, shuffleOptions: true, mostrarExplicaciones: 'alFallar' }),

      g('g-froggy', 'froggy', 'Capitales del mundo', 'Geografía', '2° año',
        'Respondé antes de que se acabe el tiempo. Cada error te hace perder una vida.',
        {
          lives: 5, timePerQuestion: 20, count: 8, order: 'random',
          questions: [
            { q: '¿Cuál es la capital de Argentina?', options: ['Córdoba', 'Buenos Aires', 'Rosario'], correct: 1 },
            { q: '¿Cuál es la capital de Chile?', options: ['Santiago', 'Valparaíso', 'Lima'], correct: 0 },
            { q: '¿Cuál es la capital de Uruguay?', options: ['Salto', 'Colonia', 'Montevideo'], correct: 2 },
            { q: '¿Cuál es la capital de Brasil?', options: ['Río de Janeiro', 'Brasilia', 'São Paulo'], correct: 1 },
            { q: '¿Cuál es la capital de Perú?', options: ['Lima', 'Cusco', 'Arequipa'], correct: 0 },
            { q: '¿Cuál es la capital de Bolivia?', options: ['Sucre', 'La Paz', 'Potosí'], correct: 1 },
            { q: '¿Cuál es la capital de Paraguay?', options: ['Asunción', 'Encarnación', 'Cnel. Oviedo'], correct: 0 },
            { q: '¿Cuál es la capital de España?', options: ['Barcelona', 'Sevilla', 'Madrid'], correct: 2 },
            { q: '¿Cuál es la capital de Francia?', options: ['Lyon', 'París', 'Marsella'], correct: 1 },
            { q: '¿Cuál es la capital de Italia?', options: ['Milán', 'Nápoles', 'Roma'], correct: 2 }
          ]
        }, {}),

      g('g-sopa', 'sopa', 'Sopa: La fotosíntesis', 'Biología', '1° año',
        'Encontrá todas las palabras de la lista. Arrastrá o tocá dos letras para seleccionar.',
        {
          showBank: true, timeLimit: 0, lives: 0,
          words: [
            { word: 'FOTOSINTESIS', clue: 'Proceso con el que las plantas fabrican su alimento' },
            { word: 'CLOROFILA', clue: 'Pigmento verde que captura la luz' },
            { word: 'LIMON', clue: 'Citrico amarillo' },
            { word: 'AGUA', clue: 'H2O' },
            { word: 'OXIGENO', clue: 'Gas que liberan las plantas' },
            { word: 'GLUCOSA', clue: 'Azúcar que produce la fotosíntesis' },
            { word: 'CLOROPLASTO', clue: 'Orgánulo donde ocurre la fotosíntesis' },
            { word: 'ESTOMA', clue: 'Poro de la hoja por donde entra el CO2' }
          ]
        }, {}),

      g('g-cruci', 'crucigrama', 'Crucigrama: El sistema solar', 'Astronomía', '2° año',
        'Completá el crucigrama. Las palabras se generan automáticamente; podés regenerar la disposición.',
        {
          crosswords: [{
            title: 'Planetas',
            clues: [
              { clue: 'Estrella del sistema solar', answer: 'SOL' },
              { clue: 'Satélite natural de la Tierra', answer: 'LUNA' },
              { clue: 'Planeta rojo', answer: 'MARTE' },
              { clue: 'Planeta más grande', answer: 'JUPITER' },
              { clue: 'Planeta con anillos', answer: 'SATURNO' },
              { clue: 'Planeta más cercano al Sol', answer: 'MERCURIO' },
              { clue: 'Nuestro planeta', answer: 'TIERRA' },
              { clue: 'Planeta más caliente', answer: 'VENUS' }
            ]
          }]
        }, {}),

      g('g-colum', 'columnas', 'Relacionar: Países y capitales', 'Geografía', '2° año',
        'Uní cada país con su capital. Hay tarjetas de más.',
        {
          pairs: [
            { left: 'Argentina', right: 'Buenos Aires' },
            { left: 'Chile', right: 'Santiago' },
            { left: 'Brasil', right: 'Brasilia' },
            { left: 'Perú', right: 'Lima' },
            { left: 'Uruguay', right: 'Montevideo' },
            { left: 'Paraguay', right: 'Asunción' }
          ],
          extraLeft: ['Ecuador', 'Colombia'],
          extraRight: ['Quito', 'Bogotá']
        }, {}),

      g('g-mem', 'memory', 'Memoria: Organelas y funciones', 'Biología', '1° año',
        'Encontrá los pares: cada organela con su función.',
        {
          identical: false,
          pairs: [
            { a: 'Núcleo', b: 'Contiene el ADN' },
            { a: 'Mitocondria', b: 'Produce energía' },
            { a: 'Ribosoma', b: ' Fabrica proteínas' },
            { a: 'Cloroplasto', b: 'Fotosíntesis' },
            { a: 'Membrana', b: 'Controla entradas y salidas' },
            { a: 'Vacuola', b: 'Almacena agua y nutrientes' }
          ]
        }, {}),

      g('g-comp', 'completar', 'Completar: La fotosíntesis', 'Biología', '1° año',
        'Completá los espacios con la palabra correcta.',
        {
          mode: 'select',
          blocks: [
            { text: 'La fotosíntesis ocurre en los {{1}} de las plantas.', blanks: [{ answers: ['cloroplastos'], options: ['cloroplastos', 'ribosomas', 'lisosomas', 'mitocondrias'] }] },
            { text: 'Las plantas necesitan {{1}} y {{2}} para hacer fotosíntesis.', blanks: [{ answers: ['luz'], options: ['luz', 'oscuridad', 'sal', 'arcilla'] }, { answers: ['agua'], options: ['agua', 'petróleo', 'arena', 'hierro'] }] },
            { text: 'El gas que liberan las plantas durante la fotosíntesis es el {{1}}.', blanks: [{ answers: ['oxigeno', 'oxígeno'], options: ['oxigeno', 'dióxido de carbono', 'nitrógeno', 'helio'] }] },
            { text: 'La glucosa es el {{1}} que fabrican las plantas.', blanks: [{ answers: ['alimento', 'azúcar'], options: ['alimento', 'veneno', 'desperdicio', 'colorante'] }] }
          ]
        }, {}),

      g('g-ordp', 'ordenar-palabras', 'Ordenar: El ciclo del agua', 'Geografía', '1° año',
        'Ordená las palabras de cada oración para que tenga sentido.',
        {
          items: [
            { hint: 'Evaporación', words: ['El', 'sol', 'calienta', 'el', 'agua', 'de', 'los', 'océanos'], distractors: ['nieve', 'roble'] },
            { hint: 'Condensación y precipitación', words: ['El', 'vapor', 'sube', 'y', 'forma', 'las', 'nubes'] },
            { hint: 'Escurrimiento', words: ['El', 'agua', 'cae', 'como', 'lluvia', 'y', 'vuelve', 'al', 'mar'] }
          ]
        }, {}),

      g('g-sino', 'si-o-no', '¿Mito o realidad?', 'Ciencias', '1° año',
        'Respondé si la afirmación es correcta, incorrecta o si ambas cosas pueden ser ciertas.',
        {
          items: [
            { text: 'Las plantas hacen fotosíntesis.', answer: 'si' },
            { text: 'La célula animal tiene pared celular.', answer: 'no' },
            { text: 'El agua puede estar en estado sólido, líquido o gaseoso.', answer: 'si' },
            { text: 'Los seres vivos no necesitan energía.', answer: 'no' },
            { text: 'La luz solar es una forma de energía.', answer: 'si' },
            { text: 'Los hongos son plantas.', answer: 'no', explanation: 'Los hongos son un reino aparte: no hacen fotosíntesis.' },
            { text: 'El oxígeno es un gas que respiramos.', answer: 'si' },
            { text: 'El hielo flota en el agua.', answer: 'si' }
          ]
        }, {}),

      g('g-ordl', 'ordenar-letras', 'Ordenar letras: Cuerpo humano', 'Biología', '1° año',
        'Descifrá las palabras con las pistas.',
        {
          items: [
            { word: 'MUSULO', clue: 'Tejido que permite el movimiento' },
            { word: 'HUESO', clue: 'Estructura rígida del esqueleto' },
            { word: 'NEURONA', clue: 'Célula del sistema nervioso' },
            { word: 'CORAZON', clue: 'Órgano que bombea la sangre' },
            { word: 'PULMON', clue: 'Órgano de la respiración' },
            { word: 'SANGRE', clue: 'Tejido líquido que transporta oxígeno' }
          ]
        }, {}),

      g('g-ruleta', 'ruleta', 'Ruleta: Palabras de ciencia', 'Ciencias', '1° año',
        'Escribí palabras que empiecen con la letra de cada ronda antes de que se acabe el tiempo.',
        {
          mode: 'empieza', timePerRound: 45, rounds: 3,
          words: ['sol', 'savia', 'serpiente', 'selva', 'sangre', 'suelo', 'semilla', 'simio', 'sabana', 'sello',
            'luna', 'lago', 'luz', 'leche', 'lento', 'limón', 'libro', 'lluvia', 'lobo', 'lomo',
            'roca', 'río', 'roble', 'rana', 'rayo', 'reloj', 'rojo', 'rulo', 'rama', 'rosa',
            'mar', 'montaña', 'mesa', 'mano', 'mariposa', 'mapa', 'mate', 'miel', 'mina', 'moto']
        }, {}),

      g('g-grupo', 'grupos', 'Relacionar grupos: Seres vivos', 'Biología', '1° año',
        'Clasificá cada ser vivo en el o los grupos que correspondan.',
        {
          groups: [
            { name: 'Productores' }, { name: 'Consumidores' }, { name: 'Descomponedores' }
          ],
          cards: [
            { text: 'Planta', groups: [0] },
            { text: 'Árbol', groups: [0] },
            { text: 'Algas', groups: [0] },
            { text: 'Vaca', groups: [1] },
            { text: 'León', groups: [1] },
            { text: 'Hongo', groups: [2] },
            { text: 'Bacteria', groups: [2, 1] },
            { text: 'Ser humano', groups: [1] }
          ]
        }, {}),

      g('g-filas', 'filas', 'Filas: Ordená la historia', 'Historia', '2° año',
        'Ordená cada fila según el criterio indicado.',
        {
          lists: [
            { title: 'Momentos de la independencia', direction: 'asc', items: [
              { text: 'Batalla de Ayacucho', value: 1824 },
              { text: 'Independencia de Argentina', value: 1816 },
              { text: 'Revolución de Mayo', value: 1810 },
              { text: 'Batalla de Salta', value: 1813 }
            ] },
            { title: 'De menor a mayor', direction: 'asc', items: [
              { text: '5', value: 5 }, { text: '12', value: 12 }, { text: '3', value: 3 }, { text: '9', value: 9 }
            ] }
          ]
        }, {}),

      g('g-mapa', 'mapa', 'Mapa: La célula', 'Biología', '1° año',
        'Tocá cada punto del dibujo y respondé la pregunta.',
        {
          mode: 'jugar', written: false, instructions: 'Tocá los puntos numerados del dibujo de la célula.',
          image: CELULA_SVG,
          points: [
            { x: 32, y: 35, q: '¿Qué organela es esta? (elipse amarilla central)', options: ['Núcleo', 'Mitocondria', 'Ribosoma'], correct: 0 },
            { x: 65, y: 27, q: '¿Qué organela es esta? (estructura alargada rosada)', options: ['Cloroplasto', 'Mitocondria', 'Lisosoma'], correct: 1 },
            { x: 75, y: 63, q: '¿Qué son estos puntos violetas?', options: ['Núcleos', 'Ribosomas', 'Vacunas'], correct: 1 },
            { x: 47, y: 77, q: '¿Qué organela es esta? (estructura verde)', options: ['Mitocondria', 'Pared celular', 'Cloroplasto'], correct: 2 },
            { x: 8, y: 11, q: '¿Qué hay en esta zona punteada?', options: ['El citoplasma', 'El ADN', 'La membrana'], correct: 0 }
          ]
        }, {})
    ];

    var roster = ['Álvarez Sofía', 'Benítez Lucas', 'Castro Martina', 'Díaz Joaquín', 'Espínola Valentina', 'Flores Thiago', 'Giménez Camila', 'Herrera Bautista'];
    var classes = [{
      id: 'c-demo-3a', name: '3° A · Biología', code: 'K7M2QX',
      owner_token: OWNER, owner_name: 'Docente Demo', roster: roster,
      created_at: '2026-11-01T10:00:00.000Z'
    }];
    var class_games = games.map(function (gm) { return { id: 'cg-' + gm.id, class_id: 'c-demo-3a', game_id: gm.id, created_at: '2026-11-01T10:00:00.000Z' }; });

    /* intentos de ejemplo para que los informes se vean con datos */
    var attempts = [];
    var now = Date.now();
    function att(gameId, student, score, correct, total, minsAgo, answers) {
      attempts.push({
        id: 'a-' + attempts.length, game_id: gameId, class_code: 'K7M2QX', student_name: student,
        score: score, correct: correct, total: total, time_ms: minsAgo * 60000,
        answers: answers || [], game_title: games.filter(function (x) { return x.id === gameId; })[0].title,
        game_type: games.filter(function (x) { return x.id === gameId; })[0].type,
        created_at: new Date(now - minsAgo * 60000).toISOString()
      });
    }
    var datos = [
      ['Álvarez Sofía', 92, 6, 7], ['Benítez Lucas', 85, 6, 7], ['Castro Martina', 100, 7, 7], ['Díaz Joaquín', 71, 5, 7],
      ['Espínola Valentina', 85, 6, 7], ['Flores Thiago', 57, 4, 7], ['Giménez Camila', 100, 7, 7], ['Herrera Bautista', 71, 5, 7]
    ];
    datos.forEach(function (d, i) {
      att('g-test', d[0], d[1], d[2], d[3], 60 * (8 - i));
    });
    att('g-sopa', 'Álvarez Sofía', 87, 7, 8, 300);
    att('g-sopa', 'Benítez Lucas', 75, 6, 8, 280);
    att('g-sopa', 'Castro Martina', 100, 8, 8, 250);
    att('g-mem', 'Álvarez Sofía', 66, 6, 6, 200);
    att('g-mem', 'Díaz Joaquín', 50, 6, 6, 190);
    att('g-colum', 'Espínola Valentina', 100, 6, 6, 150);
    att('g-froggy', 'Giménez Camila', 88, 7, 8, 120);
    att('g-froggy', 'Flores Thiago', 50, 4, 8, 100);

    return { games: games, classes: classes, class_games: class_games, attempts: attempts };
  }

  return { build: build };
})();
