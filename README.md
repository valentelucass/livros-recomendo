<!-- PORTFOLIO-FEATURED
title: Livros que Recomendo — Amazon
description: Landing page responsiva com curadoria pessoal de livros de tecnologia, paginação de cartões e links de afiliado da Amazon.
technologies: HTML5, CSS3, JavaScript (Vanilla)
demo: https://livros-recomendo.vercel.app/
highlight: true
image: public/foto.png
-->

<p align="center">
  <img src="public/foto.png" alt="Capa do projeto Livros que Recomendo" width="1200">
</p>

# Site Livros Amazon

Landing page estática com curadoria de livros de tecnologia, cartões responsivos e paginação em JavaScript.

## Tecnologias

- HTML5
- CSS3 (arquitetura modular por pastas)
- JavaScript (vanilla)

## Estrutura do projeto

```text
.
├── index.html
├── js/
│   ├── constantes/
│   ├── principal.js
│   └── modulos/
├── assets/
├── public/
└── css/
    ├── base/
    ├── components/
    ├── efeitos/
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
- Cartões com capa, título, autor e descrição.
- Botões com links de afiliado para Amazon.
- Paginação de cartões no front-end.
- Fundo animado em WebGL (vanilla) com efeito líquido.

## Customização rápida

- Conteúdo dos livros: `js/constantes/livros.js`
- Configurações globais de JS: `js/constantes/configuracoes.js`
- Comportamentos JS: `js/principal.js` e `js/modulos/*.js`
- Estilos globais e tema: `css/base/variaveis.css` e `css/base/base.css`
- Componentes visuais: `css/components/*.css`
- Efeitos visuais: `css/efeitos/*.css` (fundo + superficie-vidro)
- Regras responsivas: `css/layout/responsivo.css`

## Deploy

Pode ser publicado em qualquer hosting estático, como:

- GitHub Pages
- Netlify
- Vercel (modo estático)

Para Vercel, o projeto já inclui `vercel.json` com headers de segurança e cache de assets para produção.

## Observação

Os links de compra usam tag de afiliado (`tag=geradoroferta-20`).

