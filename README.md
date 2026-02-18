# Site Livros Amazon

Landing page estática com curadoria de livros de tecnologia, cards responsivos e paginação em JavaScript.

## Tecnologias

- HTML5
- CSS3 (arquitetura modular por pastas)
- JavaScript (vanilla)

## Estrutura do projeto

```text
.
├── index.html
├── script.js
├── assets/
├── public/
└── css/
    ├── base/
    ├── components/
    └── layout/
```

## Como rodar localmente

Como o projeto é estático, basta servir os arquivos com um servidor local:

```bash
python -m http.server 4173
```

Depois abra:

```text
http://127.0.0.1:4173
```

## Principais recursos

- Layout responsivo para desktop e mobile.
- Cards com capa, título, autor e descrição.
- Botões com links de afiliado para Amazon.
- Paginação de cards no front-end.

## Customização rápida

- Conteúdo dos livros: `index.html`
- Comportamento de paginação: `script.js`
- Estilos globais e tema: `css/base/variables.css` e `css/base/base.css`
- Componentes visuais: `css/components/*.css`
- Regras responsivas: `css/layout/responsive.css`

## Deploy

Pode ser publicado em qualquer hosting estático, como:

- GitHub Pages
- Netlify
- Vercel (modo estático)

## Observação

Os links de compra usam tag de afiliado (`tag=geradoroferta-20`).

