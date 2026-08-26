# Calculadora de Aproveitamento

Calculadora web estática para acompanhar a média escolar ponderada de três trimestres. A interface mostra a média atual, o estado de aprovação e uma previsão da nota necessária quando ainda há trimestre em aberto.

## Cálculo

Os trimestres têm pesos 3, 3 e 4. A média é calculada por:

```text
(3 × 1º trimestre + 3 × 2º trimestre + 4 × 3º trimestre) ÷ 10
```

A média mínima fixa é `6,0`. Em cada trimestre, a calculadora usa a maior nota entre a avaliação regular e a **E.A.C.** (estratégia de recuperação). Notas aceitas ficam entre `0,0` e `10,0`, com vírgula ou ponto decimal.

## Estrutura

```text
.
├── index.html                 # estrutura e conteúdo da página
├── assets/
│   ├── css/styles.css         # layout responsivo e estados visuais
│   └── js/
│       ├── app.js             # interação com o DOM
│       └── calculator.js      # regras de cálculo e apresentação
└── tests/                     # testes de regras, estrutura e acessibilidade
```

## Executar localmente

Requer Python 3. Na raiz do projeto:

```bash
python -m http.server 4173
```

Abra `http://localhost:4173/` no navegador.

## Testes

Requer Node.js. Na raiz do projeto:

```bash
npm test
```

## Acessibilidade

- Estrutura semântica com títulos e regiões identificadas.
- Resultados atualizados em região viva para tecnologias assistivas.
- Erros associados aos campos com `aria-describedby` e `aria-invalid`.
- Navegação completa por teclado, foco visível e alvos de entrada de 48 px.
- Explicação expansível com `aria-expanded` e `aria-controls`.
- Layout responsivo sem rolagem horizontal nos tamanhos suportados.
- Animações reduzidas quando `prefers-reduced-motion` está ativo.

## Publicação

URL esperada do GitHub Pages:

<https://michelbonazza.github.io/calculadora-aproveitamento/>

## Licença

Nenhuma licença foi declarada para este projeto.
