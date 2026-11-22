const response = await fetch('./tracks.json');
if (!response.ok) throw new Error('No se pudo leer la configuración de pistas');
const layers = await response.json();
const play = document.querySelector('#play');
const seek = document.querySelector('#seek');
const status = document.querySelector('#audio-status');
const files = document.querySelector('#files');
const local = files.closest('details');
const AudioEngine = window.AudioContext || window.webkitAudioContext;
let context, master, sources = [], buffers, timer, selectedFiles;
let offset = 0, startAt = 0, duration = 0, playing = false;

const tracks = layers.map(({ id: key, title, color, file }) => {
  const row = document.createElement('div');
  row.className = 'track';
  row.style.setProperty('--track', color);
  row.innerHTML = `<span class="track-title">${title}</span><canvas class="wave" width="280" height="50" aria-hidden="true"></canvas>
    <input type="range" min="0" max="1" step=".01" value=".8" aria-label="Volumen de ${title}">
    <button type="button" aria-label="Solo: ${title}" aria-pressed="false">Solo</button>
    <button type="button" aria-label="Silenciar: ${title}" aria-pressed="false">Silenciar</button>`;
  document.querySelector('#tracks').append(row);
  const [volume, solo, mute] = row.querySelectorAll('input, button');
  for (const button of [solo, mute]) {
    button.addEventListener('click', () => {
      button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') === 'false');
      updateMix();
    });
  }
  volume.addEventListener('input', updateMix);
  return { key, file, row, volume, solo, mute, canvas: row.querySelector('canvas'), color };
});

function isPressed(button) {
  return button.getAttribute('aria-pressed') === 'true';
}

function updateMix() {
  const anySolo = tracks.some(track => isPressed(track.solo));
  tracks.forEach((track, index) => {
    const off = isPressed(track.mute) || (anySolo && !isPressed(track.solo));
    track.row.dataset.off = off;
    sources[index]?.gain.gain.setTargetAtTime(off ? 0 : +track.volume.value, context.currentTime, .015);
  });
}

function drawWave(track, buffer) {
  const { canvas, color } = track;
  const brush = canvas.getContext('2d');
  const data = buffer.getChannelData(0);
  const step = data.length / 70;
  brush.clearRect(0, 0, canvas.width, canvas.height);
  brush.fillStyle = color;
  for (let bar = 0; bar < 70; bar++) {
    let peak = 0;
    for (let i = Math.floor(bar * step); i < Math.min(data.length, (bar + 1) * step); i += 24) {
      peak = Math.max(peak, Math.abs(data[i]));
    }
    const height = Math.max(2, Math.sqrt(peak) * 44);
    brush.fillRect(bar * 4, (50 - height) / 2, 2, height);
  }
}

async function load() {
  const decoder = new OfflineAudioContext(1, 1, 24000);
  const loaded = [];
  for (const [index, track] of tracks.entries()) {
    status.textContent = `Cargando pistas… ${index + 1} de ${tracks.length}`;
    let bytes;
    if (selectedFiles) {
      bytes = await selectedFiles[index].arrayBuffer();
    } else {
      const response = await fetch(track.file);
      if (!response.ok) throw new Error('Pista no disponible');
      bytes = await response.arrayBuffer();
    }
    loaded.push(await decoder.decodeAudioData(bytes));
  }
  if (Math.max(...loaded.map(buffer => buffer.duration)) - Math.min(...loaded.map(buffer => buffer.duration)) > .1) {
    throw new Error('Las pistas tienen distinta duración');
  }
  buffers = loaded;
  duration = Math.min(...loaded.map(buffer => buffer.duration));
  seek.max = duration;
  seek.disabled = false;
  tracks.forEach((track, index) => drawWave(track, loaded[index]));
}

function format(seconds) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function position() {
  return Math.min(duration, offset + (playing ? Math.max(0, context.currentTime - startAt) : 0));
}

function renderTime(current = position()) {
  seek.value = current;
  seek.setAttribute('aria-valuetext', format(current));
  document.querySelector('#time').textContent = `${format(current)} / ${duration ? format(duration) : '—'}`;
}

function pause() {
  offset = position();
  playing = false;
  cancelAnimationFrame(timer);
  for (const { source, gain } of sources) {
    source.stop();
    source.disconnect();
    gain.disconnect();
  }
  sources = [];
  play.textContent = '▶ Reproducir';
  renderTime();
}

function tick() {
  if (position() >= duration) {
    pause();
    return;
  }
  renderTime();
  timer = requestAnimationFrame(tick);
}

function start() {
  if (offset >= duration) offset = 0;
  startAt = context.currentTime + .06;
  sources = buffers.map(buffer => {
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.connect(gain).connect(master);
    source.start(startAt, offset, duration - offset);
    return { source, gain };
  });
  playing = true;
  updateMix();
  play.textContent = 'Ⅱ Pausar';
  tick();
}

play.addEventListener('click', async () => {
  if (playing) {
    pause();
    return;
  }
  play.disabled = files.disabled = true;
  try {
    if (!context) {
      context = new AudioEngine();
      const limiter = context.createDynamicsCompressor();
      master = context.createGain();
      master.gain.value = .65;
      master.connect(limiter).connect(context.destination);
    }
    await context.resume();
    if (!buffers) await load();
    start();
    status.textContent = 'Prueba Solo, Silenciar y el volumen de cada pista.';
  } catch {
    local.open = true;
    status.textContent = 'No se pudieron reproducir las pistas. Prueba seleccionando los seis MP3 en «Cargar mis archivos de audio».';
  } finally {
    play.disabled = files.disabled = false;
  }
});

seek.addEventListener('input', () => {
  const target = +seek.value;
  const resume = playing;
  if (resume) pause();
  offset = target;
  if (resume && target < duration) start();
  else renderTime();
});

document.querySelector('#reset').addEventListener('click', () => {
  tracks.forEach(track => {
    track.solo.setAttribute('aria-pressed', false);
    track.mute.setAttribute('aria-pressed', false);
    track.volume.value = .8;
  });
  updateMix();
  status.textContent = 'Mezcla restablecida.';
});

files.addEventListener('change', () => {
  const selection = [...files.files];
  if (!selection.length) return;
  const match = tracks.map(({ key }) => selection.find(file =>
    new RegExp(`(^|-)${key}(\\.|-)`, 'i').test(file.name)));
  if (selection.length !== tracks.length || match.some(file => !file) || new Set(match).size !== tracks.length) {
    status.textContent = 'Selecciona un MP3 de cada capa con su nombre original: Drums, Bass, Keys, Vocals, Guitars y Other.';
    files.value = '';
    return;
  }
  if (playing) pause();
  selectedFiles = match;
  buffers = undefined;
  offset = duration = 0;
  seek.disabled = true;
  renderTime();
  for (const { canvas } of tracks) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  status.textContent = 'Seis pistas seleccionadas. Pulsa Reproducir para cargarlas.';
});

document.querySelectorAll('.listen a').forEach(link => link.addEventListener('click', () => {
  if (playing) pause();
}));

document.addEventListener('official-video', () => { if (playing) pause(); });
