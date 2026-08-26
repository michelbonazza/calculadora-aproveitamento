import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateReport,
  createViewModel,
  effectiveGrade,
  formatGrade,
  parseGrade,
} from '../assets/js/calculator.js';

test('parseGrade accepts comma, point and empty values', () => {
  assert.deepEqual(parseGrade('7,5'), { value: 7.5, valid: true, empty: false });
  assert.deepEqual(parseGrade('8.25'), { value: 8.25, valid: true, empty: false });
  assert.deepEqual(parseGrade(''), { value: null, valid: true, empty: true });
});

test('parseGrade rejects text and values outside zero to ten', () => {
  assert.equal(parseGrade('abc').valid, false);
  assert.equal(parseGrade('-1').valid, false);
  assert.equal(parseGrade('10,1').valid, false);
});

test('effectiveGrade uses the larger note or EAC', () => {
  assert.deepEqual(effectiveGrade('6,5', '8'), { score: 8, invalid: false });
  assert.deepEqual(effectiveGrade('', ''), { score: null, invalid: false });
});

test('calculateReport computes weighted score and approval', () => {
  const report = calculateReport([
    { note: '7,5', eac: '' },
    { note: '8', eac: '' },
    { note: '6,5', eac: '' },
  ]);
  assert.equal(report.score, 7.25);
  assert.equal(report.status, 'approved');
  assert.equal(report.complete, true);
});

test('calculateReport treats blanks as zero in partial projection', () => {
  const report = calculateReport([
    { note: '8', eac: '' },
    { note: '', eac: '' },
    { note: '', eac: '' },
  ]);
  assert.equal(report.score, 2.4);
  assert.equal(report.status, 'below');
  assert.equal(report.complete, false);
});

test('calculateReport returns required grade for the last blank trimester', () => {
  const report = calculateReport([
    { note: '7', eac: '' },
    { note: '6', eac: '' },
    { note: '', eac: '' },
  ]);
  assert.equal(report.required.trimesterIndex, 2);
  assert.equal(report.required.grade, 5.25);
  assert.equal(report.required.possible, true);
});

test('calculateReport flags mathematically impossible required grade', () => {
  const report = calculateReport([
    { note: '1', eac: '' },
    { note: '1', eac: '' },
    { note: '', eac: '' },
  ]);
  assert.equal(report.required.grade, 13.5);
  assert.equal(report.required.possible, false);
});

test('calculateReport always uses fixed minimum six', () => {
  const report = calculateReport([
    { note: '6', eac: '' },
    { note: '6', eac: '' },
    { note: '6', eac: '' },
  ], 7);
  assert.equal(report.minimum, 6);
  assert.equal(report.status, 'approved');
});

test('formatGrade uses Brazilian decimal punctuation', () => {
  assert.equal(formatGrade(7.25), '7,25');
  assert.equal(formatGrade(null), '—');
});

test('createViewModel describes initial state', () => {
  const report = calculateReport([
    { note: '', eac: '' },
    { note: '', eac: '' },
    { note: '', eac: '' },
  ]);
  const view = createViewModel(report);
  assert.equal(view.scoreLabel, '—');
  assert.equal(view.statusLabel, 'Aguardando notas');
  assert.equal(view.formulaResult, '');
  assert.equal(view.forecastLabel, 'Informe as notas para ver a previsão.');
  assert.equal(view.requiredValue, '');
  assert.equal(view.requiredTail, '');
});

test('createViewModel describes impossible approval requirement', () => {
  const report = calculateReport([
    { note: '1', eac: '' },
    { note: '1', eac: '' },
    { note: '', eac: '' },
  ]);
  const view = createViewModel(report);
  assert.equal(view.requiredValue, '13,5');
  assert.match(view.requiredTail, /acima da pontuação máxima/);
  assert.equal(view.tone, 'warning');
});
