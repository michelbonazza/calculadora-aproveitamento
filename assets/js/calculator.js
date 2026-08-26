export const WEIGHTS = [3, 3, 4];
export const MAX_GRADE = 10;

const round = (value) => Math.round(value * 100) / 100;

export function parseGrade(raw) {
  const text = raw == null ? '' : String(raw).trim();
  if (text === '') return { value: null, valid: true, empty: true };
  if (!/^\d+(?:[.,]\d+)?$/.test(text)) {
    return { value: null, valid: false, empty: false };
  }
  const value = Number(text.replace(',', '.'));
  if (!Number.isFinite(value) || value < 0 || value > MAX_GRADE) {
    return { value: null, valid: false, empty: false };
  }
  return { value, valid: true, empty: false };
}

export function effectiveGrade(noteRaw, eacRaw) {
  const note = parseGrade(noteRaw);
  const eac = parseGrade(eacRaw);
  if (!note.valid || !eac.valid) return { score: null, invalid: true };
  const values = [note.value, eac.value].filter((value) => value !== null);
  return { score: values.length ? Math.max(...values) : null, invalid: false };
}

export function calculateReport(entries) {
  const minimum = 6;
  const trimesters = WEIGHTS.map((_, index) =>
    effectiveGrade(entries?.[index]?.note ?? '', entries?.[index]?.eac ?? ''),
  );
  const points = trimesters.reduce(
    (sum, trimester, index) => sum + (trimester.score ?? 0) * WEIGHTS[index],
    0,
  );
  const score = round(points / 10);
  const empty = trimesters.every(({ score: value }) => value === null);
  const complete = trimesters.every(({ score: value, invalid }) => value !== null && !invalid);
  const status = empty ? 'initial' : score >= minimum ? 'approved' : 'below';
  const blankIndexes = trimesters
    .map((trimester, index) => (trimester.score === null && !trimester.invalid ? index : -1))
    .filter((index) => index >= 0);
  let required = null;
  if (blankIndexes.length) {
    const trimesterIndex = blankIndexes[blankIndexes.length - 1];
    const grade = round((minimum * 10 - points) / WEIGHTS[trimesterIndex]);
    required = { trimesterIndex, grade, possible: grade >= 0 && grade <= MAX_GRADE };
  }
  return { trimesters, score, empty, complete, status, minimum, required };
}

export function formatGrade(value, digits = 2) {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toFixed(digits).replace('.', ',');
}

const formatCompactGrade = (value) =>
  formatGrade(value).replace(/,(\d)0$/, ',$1');

export function createViewModel(report) {
  const formulaParts = report.trimesters.map(({ score }) => formatCompactGrade(score));
  const progressValue = Math.min(MAX_GRADE, Math.max(0, report.score));
  const progressPercent = Math.min(100, Math.max(0, report.score * 10));
  const initial = report.empty;
  const approved = report.status === 'approved';
  const partial = !initial && !report.complete;
  const impossible = report.required && !report.required.possible;

  let statusLabel = 'Abaixo da média';
  let tone = 'warning';
  if (initial) {
    statusLabel = 'Aguardando notas';
    tone = 'neutral';
  } else if (approved) {
    statusLabel = 'Aprovado';
    tone = 'approved';
  } else if (partial) {
    statusLabel = 'Cálculo parcial';
    tone = impossible ? 'warning' : 'neutral';
  }

  let requiredValue = '';
  let requiredTail = '';
  let forecastLabel = 'Informe as notas para ver a previsão.';
  if (approved) {
    forecastLabel = 'Você já alcançou a média 6,0.';
  } else if (!initial && report.required) {
    requiredValue = formatCompactGrade(report.required.grade);
    const trimester = `${report.required.trimesterIndex + 1}º trimestre`;
    requiredTail = report.required.possible
      ? `no ${trimester} para alcançar a média 6,0.`
      : `no ${trimester}, acima da pontuação máxima de 10,0.`;
    forecastLabel = `Você precisaria de ${requiredValue} ${requiredTail}`;
  } else if (!initial) {
    forecastLabel = 'Sua média ficou abaixo de 6,0.';
  }

  return {
    scoreLabel: initial ? '—' : formatGrade(report.score),
    statusLabel,
    formulaParts,
    formulaResult: initial ? '' : `= ${formatGrade(report.score)}`,
    progressValue,
    progressPercent,
    goal: 60,
    requiredValue,
    requiredTail,
    forecastLabel,
    tone,
  };
}
