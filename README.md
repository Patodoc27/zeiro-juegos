# Zeiro Juegos

Plataforma original de actividades educativas para el aula: los docentes crean juegos, los estudiantes juegan con un código de clase (sin registro) y los resultados se ven en informes en vivo.

## Publicación

Sitio estático (GitHub Pages): `https://patodoc27.github.io/zeiro-juegos/`

## Funcionalidades

- **14 tipos de juego**: Test, Froggy Jumps, Sopa de Letras, Crucigrama (generado solo), Relacionar Columnas, Memoria, Completar Frases, Ordenar Palabras, Sí o No, Ordenar Letras, Ruleta de Palabras, Relacionar Grupos, Filas, Mapa Interactivo.
- **Docente**: editor visual por tipo de juego, duplicar actividades, clases con código y lista de estudiantes (identificación tolerante de nombres), asignación de actividades a clases, informes con ranking por aciertos, porcentaje, nota estimada y exportación CSV.
- **Estudiante**: entra con código de clase + nombre (o enlace directo), juega en celu/tablet/PC.
- **Embeber**: cada actividad tiene enlace iframe listo para pegar en aulas virtuales; la app avisa al aula con `postMessage` cuando termina la partida y reporta su altura.
- **PWA**: funciona offline después de la primera carga.

## Modo demo y Supabase

Por defecto la app funciona en **modo demo** (localStorage) con datos de ejemplo: clase `3° A · Biología`, código `K7M2QX` y 14 actividades de muestra.

Para producción con rankings en vivo entre dispositivos:

1. Crear un proyecto en [supabase.com](https://supabase.com) (plan gratis).
2. En el SQL Editor ejecutar `db/schema.sql` y `db/policies.sql`.
3. En `app/config.js` pegar `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
4. Volver a desplegar (subir el commit a `main`).

## Estructura

```
index.html          entrada (carga scripts en orden)
theme.css           estilos (tema claro, paleta Zeiro)
app/config.js       CONFIG (Supabase)
app/utils.js        helpers (norm, shuffle, matchStudent, CSV…)
app/icons.js        íconos SVG propios
app/voz.js          lectura en voz alta es-AR
app/seed.js         datos de ejemplo del modo demo
app/db.js           capa de datos (demo localStorage / Supabase)
app/engine.js       motor de juegos (puntaje, intentos, embed, anti-trampa)
app/games/*.js      un archivo por tipo de juego
app/editor.js       editor de actividades del docente
app/views.js        vistas (landing, docente, clases, informes, jugador)
app/app.js          router
db/schema.sql       tablas y funciones RPC
db/policies.sql     RLS
sw.js               service worker (PWA)
```

## Reglas de puntaje

Cada actividad puntúa sobre 100. Los informes acumulan **aciertos** de todas las partidas por alumno y calculan una **nota estimada** (1-10) a partir del porcentaje de aciertos.
