# Calculadora de Aproveitamento — Design

## Objetivo

Criar site estático para estudantes brasileiros calcularem aproveitamento escolar por três trimestres, incluindo E.A.C., média ponderada, situação de aprovação e nota necessária. Interface seguirá visual e conteúdo do anexo fornecido, sem depender do runtime proprietário `support.js`.

## Escopo

- Seis campos: nota e E.A.C. para cada trimestre.
- Pesos fixos `3`, `3` e `4`.
- Média mínima fixa `6,0`.
- E.A.C. soma à nota do trimestre, com limite de `10,0`.
- Campos vazios contam como zero na projeção.
- Atualização imediata de resultado, fórmula, status, progresso e previsão.
- Explicação expansível e limpeza dos campos.
- Site responsivo, acessível e publicado como repositório público `michelbonazza/calculadora-aproveitamento` no GitHub Pages.

## Arquitetura

Aplicação estática em HTML, CSS e JavaScript puro. `index.html` contém estrutura semântica. `assets/css/styles.css` concentra tokens, layout, estados e responsividade. `assets/js/calculator.js` expõe funções puras de domínio. `assets/js/app.js` controla DOM, eventos e renderização. Testes usam executor nativo do Node.js, sem dependências de produção.

Estrutura:

```text
index.html
assets/css/styles.css
assets/js/calculator.js
assets/js/app.js
tests/calculator.test.js
README.md
```

## Direção visual

Identidade de boletim acadêmico editorial. Fundo `#F5F3EE`, texto `#1A1917`, superfícies claras e divisores cinza quente. Coral `#D2543F`, azul `#2F5FA8` e verde `#2E7355` identificam os trimestres sem dominar a página.

Tipografia usa IBM Plex Serif para títulos, IBM Plex Sans para interface e IBM Plex Mono para notas, fórmulas e labels. Desktop apresenta entrada à esquerda e resultado sticky à direita. Mobile usa fluxo vertical. Números `01`, `02`, `03` e fórmula colorida formam assinatura visual.

Sem gradientes, glassmorphism, sombras fortes, cards excessivos ou ícones decorativos. Transições ficam entre 150 e 250 ms e são removidas com `prefers-reduced-motion`.

## Regras de cálculo

Cada campo aceita vazio ou número decimal de `0` a `10`, com vírgula ou ponto. Ao fim de cada trimestre, resultado efetivo soma nota e E.A.C., limitado a `10,0`; se ambos vazios, trimestre permanece sem nota.

```text
aproveitamento = (3 × T1 + 3 × T2 + 4 × T3) ÷ 10
```

Trimestre vazio usa zero nessa projeção. Aprovação ocorre quando aproveitamento é maior ou igual a `6,0`.

Para previsão, aplicação identifica último trimestre vazio e divide pontos ponderados ainda necessários pelo peso desse trimestre. Se resultado ultrapassar `10`, informa impossibilidade de atingir média apenas nessa avaliação. Sem trimestre vazio, informa diferença final para média. Com média já atingida, informa aprovação garantida.

## Estados

- Inicial: nenhum valor; resultado e parcelas aparecem como traços.
- Parcial: projeção baseada em valores preenchidos; campos vazios valem zero.
- Abaixo da média: mostra distância, nota necessária ou impossibilidade.
- Aprovado: mostra média atingida, com mensagem adequada para dados parciais ou completos.
- Inválido: mensagem discreta associada ao trimestre; valor inválido não entra no cálculo.

## Interação e acessibilidade

Labels permanecem visíveis. Inputs têm altura mínima de 48 px, foco evidente, `inputmode="decimal"` e navegação por teclado. Mensagens usam `aria-describedby`; resultado dinâmico usa região `aria-live`. Status não depende apenas de cor. Botão de explicação mantém `aria-expanded`. Contraste deve cumprir WCAG AA.

Botão “Limpar campos” restaura valores e estado visual inicial. Explicação abre e fecha sem alterar cálculo. Toda atualização ocorre localmente, sem rede ou armazenamento de dados.

## Responsividade

- Acima de 900 px: duas colunas; resultado sticky.
- Até 900 px: coluna única; resultado após entradas.
- Até 560 px: cada trimestre reorganiza campos sem rolagem horizontal.

## Tratamento de erros

Entrada é normalizada durante leitura, não destruída durante digitação. Texto inválido, número negativo ou valor acima de `10` produz “Use um valor entre 0,0 e 10,0.” O restante da calculadora continua funcionando. Falha no carregamento de fonte mantém pilhas de fontes locais compatíveis.

## Testes e verificação

Testes unitários cobrem normalização decimal, soma de nota e E.A.C., teto de `10,0`, média ponderada, campos vazios, aprovação, nota necessária e impossibilidade matemática. Verificação final inclui testes automatizados, inspeção de console, teclado, viewport desktop e mobile, além de comparação visual com anexo.

## Publicação

GitHub Pages servirá branch `main` pela raiz. Repositório público terá README com descrição, execução local, regras e URL publicada. Publicação depende de autenticação válida da conta GitHub `michelbonazza`.
