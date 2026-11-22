export const functions = [
  'A. Golpes y patrones que organizan el pulso.',
  'B. Notas graves que sostienen la base.',
  'C. Acordes que contribuyen al acompañamiento.',
  'D. Notas sucesivas que forman una frase musical.',
  'E. Parte cantada que puede comunicar un texto.',
];

const relate = 'Relaciona cada capa con su función';
const identify = 'Identifica lo que escuchas';
const compare = 'Compara lo que cambia';
const comparisonHint = 'Describe el cambio que escuchas y relaciónalo con la función musical de esa capa.';

export const questions = [
  ...['Batería y percusión', 'Bajo', 'Acompañamiento armónico', 'Melodía instrumental', 'Voz']
    .map(title => ({ block: relate, points: 1, title, matching: true })),
  { block: identify, points: 2, title: 'Al aislar batería, ¿qué predomina?', options: ['Golpes rítmicos', 'Letra cantada', 'Acordes largos'] },
  { block: identify, points: 2, title: 'Al aislar bajo, ¿qué predomina?', options: ['Notas graves', 'Solo voz', 'Golpes agudos'] },
  { block: identify, points: 2, title: 'Al aislar voz, ¿qué predomina?', options: ['Parte cantada', 'Golpes del bombo', 'Solo acordes'] },
  { block: compare, points: 3, title: '¿Qué diferencia percibes al silenciar el bajo?', hint: comparisonHint },
  { block: compare, points: 3, title: '¿Qué diferencia percibes al silenciar la batería?', hint: comparisonHint },
  { block: 'Relaciona dos capas', points: 3, title: 'Escoge dos capas musicales y explica cómo trabajan juntas.', hint: 'Relaciona tu respuesta con el ambiente, la energía o el efecto expresivo de la canción.' },
];
