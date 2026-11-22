# Blinding Lights · Laboratorio de escucha de 8.º básico

Borrador de la actividad individual de Música para el Colegio Metodista de Temuco, vinculada a MU08 OA 02. El estudiante aprende cinco conceptos, compara dos versiones oficiales, explora seis capas y responde una evaluación de 20 puntos (5 + 6 + 6 + 3).

La carpeta recibida contenía los seis MP3 y su ZIP. El remoto de GitHub no tenía ramas. Los dos PDF originales se incorporaron desde la carpeta de trabajo y sirvieron para reproducir las preguntas y puntajes de la evaluación original. El prototipo y los cuatro documentos de especificación todavía no estaban disponibles para cotejar esta implementación.

## Probar en el computador

Desde la raíz:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abre [el laboratorio local](http://127.0.0.1:8000/). El sitio carga los MP3 preparados en `sitio/assets/audio/` cuando están disponibles. También admite los seis MP3 originales en **Cargar mis archivos de audio**. Escoge todos juntos y luego pulsa **Reproducir**.

`sitio/tracks.json` declara las capas reales. Los seis originales tienen el mismo inicio de contenedor MP3 y la misma duración (203,267 s). Las copias locales para el navegador se convirtieron a mono, 24 kHz y 64 kbps para reducir la descarga y el uso de memoria. Las formas de onda se dibujan con los archivos decodificados. La separación puede contener filtraciones de instrumentos entre pistas.

## Revisar y entregar

El borrador se guarda en el navegador y se recupera al recargar. Cuando estén completas las once respuestas, **Revisar y preparar entrega** muestra la hoja de entrega. Usa **Guardar respuestas como PDF** o **Descargar copia TXT** y comparte el archivo por el canal del colegio. El sitio no utiliza cuentas ni transmite el formulario. El reproductor oficial de YouTube se carga al acercarse a la sección Escuchar y se inicia al pulsar Reproducir.

Los materiales para el estudiante están en [guía de apoyo](sitio/guia_apoyo.pdf) y [evaluación imprimible](sitio/evaluacion_imprimible.pdf).

## Publicar y retirar

[Actividad publicada en GitHub Pages](https://israelandreslagosrocha-jpg.github.io/actividad8B/). La guía de apoyo incluye este enlace y su QR.

1. La versión pública puede funcionar con YouTube e importación local. La configuración de Git excluye los originales, las copias MP3 y `docente_privado/`. Confirma la autorización antes de distribuir las pistas desde el sitio.
2. Si se confirma la autorización, prepara las pistas para el alojamiento acordado. Si van en GitHub Pages, habilita el seguimiento de las seis copias MP3 expresamente. Si van en otro alojamiento autorizado, actualiza las URLs de `tracks.json` y habilita CORS para el dominio de la actividad.
3. Sube los archivos a `main` del repositorio temporal. En **Settings → Pages**, selecciona **Deploy from a branch → main → / (root)**. La portada de la raíz redirige a `sitio/`. Ambas páginas solicitan no indexación. GitHub Pages es accesible a quien tenga el enlace.
4. Abre la URL publicada y prueba video, reproducción de las seis pistas, acceso a los PDF, formulario y exportación. Si cambia la dirección, actualiza el enlace y el QR de la guía.
5. Para retirar la actividad, despublica Pages en **Settings → Pages** y confirma que la URL ya no sirve el sitio. Si se alojaron las pistas en otro servicio, retíralas también. Para retirar cualquier copia pública del repositorio temporal, elimina el repositorio cuando ya no se necesite.

## Alcance de la prueba

Chrome con ventanas de 320, 375, 390, 768, 1024 y 1440 px comprueba el flujo local. Queda pendiente una prueba física en iOS y Android. Si falla el alojamiento de las pistas, el mezclador ofrece importarlas desde el dispositivo. Cuando falla la lectura de `tracks.json`, la evaluación sigue disponible.
