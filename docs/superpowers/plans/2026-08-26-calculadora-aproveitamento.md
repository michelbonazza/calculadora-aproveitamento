# Calculadora de Aproveitamento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir, testar e publicar uma calculadora escolar estática fiel ao anexo em `michelbonazza/calculadora-aproveitamento`.

**Architecture:** HTML semântico define interface; CSS concentra sistema visual e responsividade; JavaScript puro separa regras de domínio da manipulação do DOM. Funções puras são cobertas pelo executor nativo do Node.js, enquanto testes estruturais e QA no navegador validam integração, acessibilidade e layout.

**Tech Stack:** HTML5, CSS3, JavaScript ES modules, Node.js `node:test`, Git, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-26-calculadora-aproveitamento-design.md`

## Global Constraints

- Repositório público: `michelbonazza/calculadora-aproveitamento`.
- GitHub Pages serve branch `main` pela raiz.
- Média mínima fixa: `6,0`.
- Pesos fixos: `3`, `3`, `4`.
- E.A.C. soma à nota do trimestre, com limite de `10,0`.
- Campos vazios contam como zero somente na projeção.
- Entradas aceitam vírgula ou ponto, entre `0` e `10`.
- Sem framework ou dependência de produção.
- Interface segue anexo; contraste WCAG AA; teclado e leitores de tela suportados.
- Transições duram 150–250 ms e respeitam `prefers-reduced-motion`.

---

## File Map

- `package.json`: scripts e modo ES module.
- `assets/js/calculator.js`: parsing, cálculo, estados e view model; nenhuma dependência de DOM.
- `tests/calculator.test.js`: testes unitários do domínio.
- `index.html`: estrutura semântica e pontos de renderização.
- `tests/structure.test.js`: contrato estrutural do documento.
- `assets/css/styles.css`: tokens, tipografia, layout, estados, foco e responsividade.
- `assets/js/app.js`: coleta inputs, chama domínio e atualiza DOM.
- `README.md`: uso, regras, testes e publicação.

### Task 1: Motor de cálculo testado

**Files:**
- Create: `package.json`
- Create: `tests/calculator.test.js`
- Create: `assets/js/calculator.js`

**Interfaces:**
- Consumes: objetos `{ note: string, eac: string }` para três trimestres.
- Produces: `parseGrade(raw)`, `effectiveGrade(noteRaw, eacRaw)`, `calculateReport(entries, minimum = 6)`, `formatGrade(value, digits = 2)`.

- [ ] **Step 1: Criar configuração mínima de testes**

```json
{
  "name": "calculadora-aproveitamento",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Escrever testes inicialmente falhos**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateReport,
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

test('effectiveGrade adds EAC to the trimester grade', () => {
  assert.deepEqual(effectiveGrade('5', '1'), { score: 6, invalid: false });
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

test('formatGrade uses Brazilian decimal punctuation', () => {
  assert.equal(formatGrade(7.25), '7,25');
  assert.equal(formatGrade(null), '—');
});
```

- [ ] **Step 3: Executar testes e confirmar RED**

Run: `npm test`

Expected: FAIL com `ERR_MODULE_NOT_FOUND` para `assets/js/calculator.js`.

- [ ] **Step 4: Implementar domínio mínimo**

Implementar constantes `WEIGHTS = [3, 3, 4]` e `MAX_GRADE = 10`. `parseGrade` deve usar regex decimal estrita, normalizar vírgula e retornar `{ value, valid, empty }`. `effectiveGrade` deve ignorar vazio, rejeitar qualquer entrada inválida e escolher `Math.max` dos valores válidos.

`calculateReport` deve produzir:

```js
{
  trimesters: [{ score, invalid }, { score, invalid }, { score, invalid }],
  score: 7.25,
  empty: false,
  complete: true,
  status: 'initial' | 'approved' | 'below',
  minimum: 6,
  required: null | {
    trimesterIndex: 2,
    grade: 5.25,
    possible: true,
  },
}
```

Calcular `points = Σ(score ?? 0) × weight`, `score = points / 10`, último trimestre vazio e `grade = (minimum × 10 - points) / weight`. Arredondar resultados derivados com `Math.round(value * 100) / 100`.

- [ ] **Step 5: Executar testes e confirmar GREEN**

Run: `npm test`

Expected: 8 testes aprovados; 0 falhas.

- [ ] **Step 6: Commit**

```bash
git add package.json assets/js/calculator.js tests/calculator.test.js
git commit -m "feat: add tested grade calculation engine"
```

### Task 2: Estrutura semântica da interface

**Files:**
- Create: `tests/structure.test.js`
- Create: `index.html`

**Interfaces:**
- Consumes: IDs esperados por `assets/js/app.js`.
- Produces: formulário `#grades-form`, inputs `#n1`, `#e1`, `#n2`, `#e2`, `#n3`, `#e3`, erros `#err1`–`#err3`, saída `#score`, status `#status`, fórmula `#formula`, previsão `#required`, progresso `#progress`, botões `#clear` e `#explanation-toggle`.

- [ ] **Step 1: Escrever teste estrutural inicialmente falho**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('page exposes calculator controls and accessible live results', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['n1', 'e1', 'n2', 'e2', 'n3', 'e3']) {
    assert.match(html, new RegExp(`id="${id}"`));
    assert.match(html, new RegExp(`for="${id}"`));
  }
  assert.match(html, /id="score"[^>]*aria-live="polite"/);
  assert.match(html, /id="explanation-toggle"[^>]*aria-expanded="false"/);
  assert.match(html, /<script type="module" src="\.\/assets\/js\/app\.js"><\/script>/);
});
```

- [ ] **Step 2: Executar teste e confirmar RED**

Run: `node --test tests/structure.test.js`

Expected: FAIL com `ENOENT` para `index.html`.

- [ ] **Step 3: Criar HTML semântico fiel ao anexo**

Criar `header`, `main`, formulário com três `section`, coluna `aside` de resultado e rodapé discreto. Manter textos aprovados na especificação. Cada input usa `type="text"`, `inputmode="decimal"`, `autocomplete="off"`, `placeholder="0,0"`, `aria-describedby="errN"` e `maxlength="5"`. Erros usam `role="status"`. Resultado usa `aria-live="polite"`. Explicação usa `hidden` e botão com `aria-controls="explanation"`.

Carregar Google Fonts, `./assets/css/styles.css` e módulo `./assets/js/app.js`. Não incluir `support.js`, React, templates `{{ }}` ou estilos inline.

- [ ] **Step 4: Executar teste e confirmar GREEN**

Run: `node --test tests/structure.test.js`

Expected: 1 teste aprovado; 0 falhas.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/structure.test.js
git commit -m "feat: add semantic calculator page"
```

### Task 3: Sistema visual responsivo

**Files:**
- Create: `assets/css/styles.css`
- Modify: `tests/structure.test.js`

**Interfaces:**
- Consumes: classes semânticas do `index.html`.
- Produces: tokens CSS, grid desktop, fluxo mobile, estados de status e foco.

- [ ] **Step 1: Adicionar teste inicialmente falho para contrato visual**

Adicionar ao `tests/structure.test.js`:

```js
test('stylesheet contains visual tokens and responsive safeguards', async () => {
  const css = await readFile(new URL('../assets/css/styles.css', import.meta.url), 'utf8');
  assert.match(css, /--color-coral:\s*#d2543f/i);
  assert.match(css, /--color-blue:\s*#2f5fa8/i);
  assert.match(css, /--color-green:\s*#2e7355/i);
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
});
```

- [ ] **Step 2: Executar teste e confirmar RED**

Run: `node --test tests/structure.test.js`

Expected: FAIL com `ENOENT` para `assets/css/styles.css`.

- [ ] **Step 3: Implementar CSS conforme direção aprovada**

Definir tokens `--color-paper: #f5f3ee`, `--color-ink: #1a1917`, `--color-coral: #d2543f`, `--color-blue: #2f5fa8`, `--color-green: #2e7355`, `--color-approved: #1f5c3d`, `--color-warning: #a33a2a`, bordas e superfícies quentes.

Construir largura máxima `1240px`, grid desktop `minmax(0, 1.25fr) minmax(320px, 1fr)`, espaço fluido e resultado sticky. Usar linhas editoriais, cantos de 4 px, números tabulares, inputs de 48 px e foco com anel da cor do trimestre. Status usa cor, ponto e texto. Barra mantém marcador da meta em 60%.

Em `max-width: 900px`, usar coluna única e remover sticky. Em `max-width: 560px`, reorganizar trimestre em duas linhas, preservar inputs sem overflow e manter alvos de toque. Em `prefers-reduced-motion: reduce`, remover animações e transições.

- [ ] **Step 4: Executar teste e confirmar GREEN**

Run: `node --test tests/structure.test.js`

Expected: 2 testes aprovados; 0 falhas.

- [ ] **Step 5: Commit**

```bash
git add assets/css/styles.css tests/structure.test.js
git commit -m "feat: recreate editorial responsive design"
```

### Task 4: Integração DOM e estados dinâmicos

**Files:**
- Modify: `assets/js/calculator.js`
- Modify: `tests/calculator.test.js`
- Create: `assets/js/app.js`

**Interfaces:**
- Consumes: `calculateReport(entries, minimum)` e IDs definidos em `index.html`.
- Produces: `createViewModel(report)` e renderização da interface.

- [ ] **Step 1: Escrever testes inicialmente falhos do view model**

Adicionar a importação de `createViewModel` e testes:

```js
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
```

- [ ] **Step 2: Executar testes e confirmar RED**

Run: `node --test tests/calculator.test.js`

Expected: FAIL porque `createViewModel` não é exportada.

- [ ] **Step 3: Implementar `createViewModel`**

Retornar labels em português para estados inicial, parcial, completo abaixo da média e aprovado. Incluir parcelas formatadas, resultado da fórmula, percentual da barra limitado entre 0 e 100, meta `60`, mensagens de previsão e `tone` entre `neutral`, `warning` e `approved`.

- [ ] **Step 4: Executar testes e confirmar GREEN**

Run: `node --test tests/calculator.test.js`

Expected: 10 testes aprovados; 0 falhas.

- [ ] **Step 5: Criar controlador DOM fino**

Em `assets/js/app.js`, importar `calculateReport` e `createViewModel`. Mapear seis inputs. No evento `input`, montar três objetos, calcular relatório e atualizar textos, classes `data-tone`, larguras, `aria-valuenow`, fórmula e erros. Valor inválido deve escrever “Use um valor entre 0,0 e 10,0.” no erro correspondente e definir `aria-invalid="true"` nos dois campos daquele trimestre.

Botão `#clear` usa `form.reset()`, limpa `aria-invalid` e renderiza estado inicial. Botão `#explanation-toggle` alterna `hidden`, `aria-expanded` e texto entre “Como esse cálculo funciona?” e “Fechar explicação”. Renderizar uma vez após registrar listeners.

- [ ] **Step 6: Executar suíte completa**

Run: `npm test`

Expected: 12 testes aprovados; 0 falhas.

- [ ] **Step 7: Commit**

```bash
git add assets/js/calculator.js assets/js/app.js tests/calculator.test.js
git commit -m "feat: connect live calculator interactions"
```

### Task 5: Documentação e QA visual

**Files:**
- Create: `README.md`
- Modify: `index.html` somente se QA revelar defeito comprovado.
- Modify: `assets/css/styles.css` somente se QA revelar defeito comprovado.
- Modify: `assets/js/app.js` somente após teste reproduzir defeito de comportamento.

**Interfaces:**
- Consumes: site concluído e comandos do projeto.
- Produces: instruções verificáveis e interface aprovada em navegador.

- [ ] **Step 1: Criar README completo**

Documentar objetivo, fórmula, E.A.C., estrutura, execução local com `python -m http.server 4173`, testes com `npm test`, acessibilidade, URL esperada `https://michelbonazza.github.io/calculadora-aproveitamento/` e licença não declarada.

- [ ] **Step 2: Executar servidor local**

Run: `python -m http.server 4173`

Expected: servidor HTTP local sem erro e `index.html` carregando por URL HTTP.

- [ ] **Step 3: Fazer QA em desktop**

Abrir viewport aproximado `1440 × 1000`. Confirmar comparação com anexo: cabeçalho editorial, três linhas de trimestre, coluna direita sticky, fórmula, status, previsão e barra. Digitar `7,5`, `8`, `6,5`; confirmar `7,25`, “Aprovado” e fórmula com mesmos valores.

- [ ] **Step 4: Fazer QA em mobile e teclado**

Abrir viewport aproximado `390 × 844`. Confirmar ausência de rolagem horizontal, ordem título/notas/resultado, inputs com 48 px e textos legíveis. Navegar somente com Tab; confirmar foco visível, ordem lógica, expansão acessível e limpeza.

- [ ] **Step 5: Validar estados e console**

Testar inicial, parcial, aprovado, abaixo da média, impossível e inválido. Confirmar console sem erros. Se defeito surgir, adicionar teste falho correspondente antes de corrigir JavaScript; repetir `npm test`.

- [ ] **Step 6: Executar verificação final local**

Run: `npm test`

Expected: todos os testes aprovados; 0 falhas.

- [ ] **Step 7: Commit**

```bash
git add README.md index.html assets/css/styles.css assets/js/app.js tests
git commit -m "docs: add usage and complete browser QA"
```

### Task 6: Publicação no GitHub Pages

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: branch local `main`, autenticação GitHub válida.
- Produces: repositório público e site publicado.

- [ ] **Step 1: Reautenticar GitHub CLI**

Run: `gh auth login -h github.com -w`

Expected: conta `michelbonazza` autenticada. Confirmar com `gh auth status`.

- [ ] **Step 2: Criar repositório e enviar branch**

Run: `gh repo create michelbonazza/calculadora-aproveitamento --public --source=. --remote=origin --push`

Expected: repositório criado, remote `origin` definido, branch `main` enviada.

- [ ] **Step 3: Ativar GitHub Pages**

Run: `gh api --method POST repos/michelbonazza/calculadora-aproveitamento/pages -f 'source[branch]=main' -f 'source[path]=/'`

Expected: resposta `201 Created` com URL do Pages. Se Pages já estiver ativo, consultar `gh api repos/michelbonazza/calculadora-aproveitamento/pages` e confirmar branch `main`, path `/`.

- [ ] **Step 4: Aguardar implantação e verificar URL pública**

Run: `gh api repos/michelbonazza/calculadora-aproveitamento/pages/builds/latest --jq '.status'`

Expected: saída `built`. Confirmar `html_url` com `gh api repos/michelbonazza/calculadora-aproveitamento/pages --jq '.html_url'`, igual a `https://michelbonazza.github.io/calculadora-aproveitamento/`.

Abrir URL pública e repetir fluxo `7,5`, `8`, `6,5`; confirmar resultado `7,25` e ausência de erro no console.

- [ ] **Step 5: Entrega**

Fornecer links do repositório e site publicado, commit final, total de testes aprovados e qualquer limitação observada.
