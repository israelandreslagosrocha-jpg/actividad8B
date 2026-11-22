import('./mixer.js').catch(() => {
  document.querySelector('#play').disabled = true;
  document.querySelector('#audio-status').textContent = 'No se pudieron cargar las capas del mezclador. Recarga la página para volver a intentar.';
});
import { questions, functions } from './questions.js';

const key = 'blinding-lights-8b-v2';
const form = document.querySelector('#evaluation');
const status = document.querySelector('#form-status');
const review = document.querySelector('#review');
const questionsContainer = document.querySelector('#questions');
let currentBlock;
const fields = questions.map(({ block, points, title, options, hint, matching }, index) => {
  if (block !== currentBlock) {
    const heading = document.createElement('h3');
    const total = questions.filter(question => question.block === block).reduce((sum, question) => sum + question.points, 0);
    heading.textContent = `${block} · ${total} puntos`;
    questionsContainer.append(heading);
    currentBlock = block;
  }
  const id = `P${index + 1}`;
  const group = document.createElement('fieldset');
  group.className = 'question';
  group.innerHTML = `<legend><span class="points">${id} · ${points} ${points === 1 ? 'punto' : 'puntos'}</span>
    <span id="${id}-title">${title}</span></legend><div class="question-content"></div>`;
  const content = group.querySelector('.question-content');
  if (matching) {
    const select = document.createElement('select');
    select.name = id;
    select.required = true;
    select.setAttribute('aria-labelledby', `${id}-title`);
    select.add(new Option('Elige una función', ''));
    // Present choices in an order independent of the row order.
    for (const index of [2, 4, 1, 3, 0]) select.add(new Option(functions[index], functions[index]));
    content.append(select);
  } else if (options) {
    options.forEach(option => {
      const label = document.createElement('label');
      label.className = 'choice';
      const radio = document.createElement('input');
      Object.assign(radio, { type: 'radio', name: id, value: option, required: true });
      label.append(radio, document.createTextNode(option));
      content.append(label);
    });
  } else {
    content.innerHTML = `<p class="hint" id="${id}-hint">${hint}</p>
      <textarea name="${id}" required maxlength="1500" aria-labelledby="${id}-title" aria-describedby="${id}-hint"></textarea>`;
  }
  questionsContainer.append(group);
  return { id, title };
});

let canSave = true;
try {
  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  for (const control of form.querySelectorAll('[name]')) {
    const value = saved.answers?.[control.name];
    if (typeof value === 'string') {
      if (control.type === 'radio') control.checked = control.value === value;
      else control.value = value;
    }
  }
} catch {
  canSave = false;
}

function answers() {
  return Object.fromEntries([...new FormData(form)].map(([name, value]) => [name, value.trim()]));
}

function renderProgress(data = answers()) {
  const count = fields.filter(({ id }) => data[id]).length;
  document.querySelector('#progress').value = count;
  document.querySelector('#progress-label').textContent = `${count} de ${fields.length} respuestas`;
}

function save(data) {
  try {
    localStorage.setItem(key, JSON.stringify({ answers: data }));
    canSave = true;
  } catch {
    canSave = false;
  }
}

function showStatus() {
  status.textContent = canSave ? 'Tu borrador se guarda en este navegador.' : 'Este navegador no pudo guardar el borrador. Descarga una copia si necesitas salir.';
}

form.addEventListener('input', () => {
  review.hidden = true;
  const data = answers();
  renderProgress(data);
  save(data);
  showStatus();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = answers();
  const empty = ['Nombre', 'Curso', ...fields.map(({ id }) => id)].find(name => !data[name]);
  if (empty) {
    status.textContent = 'Completa la respuesta marcada antes de revisar.';
    form.querySelector(`[name="${empty}"]`).focus();
    return;
  }
  document.querySelector('#review-student').textContent = `Estudiante: ${data.Nombre} · Curso: ${data.Curso}`;
  const items = fields.map(({ id, title }) => {
    const item = document.createElement('li');
    const question = document.createElement('strong');
    question.textContent = title;
    const answer = document.createElement('p');
    answer.textContent = data[id];
    item.append(question, answer);
    return item;
  });
  document.querySelector('#review-answers').replaceChildren(...items);
  review.hidden = false;
  document.querySelector('#review-title').focus();
});

document.querySelector('#print').addEventListener('click', () => window.print());

document.querySelector('#video-play').addEventListener('click', event => {
  document.dispatchEvent(new Event('official-video'));
  const video = document.createElement('iframe');
  video.src = 'https://www.youtube-nocookie.com/embed/4NRXx6U8ABQ?autoplay=1';
  video.title = 'Blinding Lights · Video oficial de The Weeknd';
  video.allow = 'autoplay; encrypted-media; picture-in-picture';
  video.allowFullscreen = true;
  event.currentTarget.replaceWith(video);
});

document.querySelector('#download').addEventListener('click', () => {
  const data = answers();
  const text = [
    'Blinding Lights · Laboratorio de escucha · 8.º básico',
    `Nombre: ${data.Nombre || 'Sin completar'}`,
    `Curso: ${data.Curso || 'Sin completar'}`,
    'Copia de tus respuestas',
    ...fields.map(({ id, title }) => `\n${id}. ${title}\n${data[id] || 'Sin responder'}`),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mis-respuestas-blinding-lights.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

renderProgress();
showStatus();
