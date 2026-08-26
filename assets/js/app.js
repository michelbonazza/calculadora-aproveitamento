import { calculateReport, createViewModel } from './calculator.js';

const form = document.querySelector('#grades-form');
const fields = [1, 2, 3].map((trimester) => ({
  note: document.querySelector(`#n${trimester}`),
  eac: document.querySelector(`#e${trimester}`),
  error: document.querySelector(`#err${trimester}`),
}));
const score = document.querySelector('#score');
const status = document.querySelector('#status');
const formula = document.querySelector('#formula');
const progress = document.querySelector('#progress');
const required = document.querySelector('#required');
const clear = document.querySelector('#clear');
const explanationToggle = document.querySelector('#explanation-toggle');
const explanation = document.querySelector('#explanation');
const calculatorLayout = document.querySelector('.calculator-layout');
const resultPanel = document.querySelector('.result-panel');
const mobileLayoutQuery = window.matchMedia('(max-width: 900px)');

function syncPanelOrder() {
  if (mobileLayoutQuery.matches) calculatorLayout.prepend(resultPanel);
  else calculatorLayout.append(resultPanel);
}

function render() {
  const entries = fields.map(({ note, eac }) => ({
    note: note.value,
    eac: eac.value,
  }));
  const report = calculateReport(entries);
  const view = createViewModel(report);

  score.textContent = view.scoreLabel;
  status.textContent = view.statusLabel;
  status.dataset.tone = view.tone;
  status.dataset.status = view.tone === 'warning' ? 'below' : view.tone;
  formula.textContent = `(3 × ${view.formulaParts[0]} + 3 × ${view.formulaParts[1]} + 4 × ${view.formulaParts[2]}) ÷ 10 ${view.formulaResult}`.trim();
  progress.value = view.progressValue;
  progress.textContent = String(view.progressValue);
  progress.setAttribute('aria-valuenow', String(view.progressValue));
  progress.dataset.percent = String(view.progressPercent);
  progress.dataset.goal = String(view.goal);
  required.textContent = view.forecastLabel;
  required.dataset.tone = view.tone;

  fields.forEach(({ note, eac, error }, index) => {
    const invalid = report.trimesters[index].invalid;
    error.textContent = invalid ? 'Use um valor entre 0,0 e 10,0.' : '';
    for (const input of [note, eac]) {
      if (invalid) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  });
}

form.addEventListener('input', render);

clear.addEventListener('click', () => {
  form.reset();
  fields.flatMap(({ note, eac }) => [note, eac]).forEach((input) => {
    input.removeAttribute('aria-invalid');
  });
  render();
});

explanationToggle.textContent = 'Como esse cálculo funciona?';
explanationToggle.addEventListener('click', () => {
  const expanded = explanation.hidden;
  explanation.hidden = !expanded;
  explanationToggle.setAttribute('aria-expanded', String(expanded));
  explanationToggle.textContent = expanded
    ? 'Fechar explicação'
    : 'Como esse cálculo funciona?';
});

mobileLayoutQuery.addEventListener('change', syncPanelOrder);
syncPanelOrder();
render();
