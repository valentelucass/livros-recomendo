const FUNCAO_NULA = () => {};

const SVG_NS = 'http://www.w3.org/2000/svg';

const CONFIG_PADRAO = {
  larguraBorda: 0.07,
  brilho: 50,
  opacidade: 0.93,
  desfoque: 11,
  deslocamento: 0,
  opacidadeFundo: 0,
  saturacao: 1,
  escalaDistorcao: -110,
  deslocamentoVermelho: 0,
  deslocamentoVerde: 8,
  deslocamentoAzul: 16,
  canalX: 'R',
  canalY: 'G',
  modoMistura: 'difference'
};

const PERFIS_PADRAO = {
  barra: {
    opacidadeFundo: 0.08,
    saturacao: 1.08,
    deslocamento: 0.2,
    escalaDistorcao: -82,
    deslocamentoVerde: 6,
    deslocamentoAzul: 12,
    modoMistura: 'screen'
  },
  cartao: {
    opacidadeFundo: 0.06,
    saturacao: 1.05,
    deslocamento: 0.24,
    escalaDistorcao: -90,
    deslocamentoVerde: 6,
    deslocamentoAzul: 12,
    modoMistura: 'screen'
  },
  botao: {
    opacidadeFundo: 0.1,
    saturacao: 1.18,
    deslocamento: 0.38,
    desfoque: 10,
    escalaDistorcao: -108,
    deslocamentoVerde: 8,
    deslocamentoAzul: 16,
    modoMistura: 'screen'
  }
};

const MODOS_MISTURA_VALIDOS = new Set([
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity'
]);

const CANAIS_VALIDOS = new Set(['R', 'G', 'B', 'A']);

let contadorFiltros = 0;

function paraNumero(valor, padrao) {
  const convertido = Number.parseFloat(`${valor ?? ''}`);
  return Number.isFinite(convertido) ? convertido : padrao;
}

function limitar(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function lerNumeroDataset(elemento, chave, padrao) {
  return paraNumero(elemento.dataset[chave], padrao);
}

function lerTextoDataset(elemento, chave, padrao) {
  const valor = `${elemento.dataset[chave] ?? ''}`.trim();
  return valor || padrao;
}

function normalizarCanal(canal) {
  const valor = `${canal || ''}`.trim().toUpperCase();
  return CANAIS_VALIDOS.has(valor) ? valor : 'R';
}

function normalizarModoMistura(modo) {
  const valor = `${modo || ''}`.trim().toLowerCase();
  return MODOS_MISTURA_VALIDOS.has(valor) ? valor : 'difference';
}

function obterPerfil(elemento) {
  if (elemento.classList.contains('superficie-vidro--barra')) {
    return PERFIS_PADRAO.barra;
  }

  if (elemento.classList.contains('superficie-vidro--cartao')) {
    return PERFIS_PADRAO.cartao;
  }

  if (elemento.classList.contains('superficie-vidro--botao')) {
    return PERFIS_PADRAO.botao;
  }

  return {};
}

function obterRaioDeBorda(elemento, padrao = 20) {
  const raioComputado = getComputedStyle(elemento).borderRadius;
  const primeiroValor = `${raioComputado || ''}`
    .split(' ')[0]
    .split('/')[0]
    .replace('px', '')
    .trim();

  return paraNumero(primeiroValor, padrao);
}

function obterConfiguracao(elemento) {
  const perfil = obterPerfil(elemento);
  const base = { ...CONFIG_PADRAO, ...perfil };

  const configuracao = {
    larguraBorda: lerNumeroDataset(elemento, 'vidroLarguraBorda', base.larguraBorda),
    brilho: lerNumeroDataset(elemento, 'vidroBrilho', base.brilho),
    opacidade: lerNumeroDataset(elemento, 'vidroOpacidade', base.opacidade),
    desfoque: lerNumeroDataset(elemento, 'vidroDesfoque', base.desfoque),
    deslocamento: lerNumeroDataset(elemento, 'vidroDeslocamento', base.deslocamento),
    opacidadeFundo: lerNumeroDataset(elemento, 'vidroOpacidadeFundo', base.opacidadeFundo),
    saturacao: lerNumeroDataset(elemento, 'vidroSaturacao', base.saturacao),
    escalaDistorcao: lerNumeroDataset(elemento, 'vidroEscalaDistorcao', base.escalaDistorcao),
    deslocamentoVermelho: lerNumeroDataset(
      elemento,
      'vidroDeslocamentoVermelho',
      base.deslocamentoVermelho
    ),
    deslocamentoVerde: lerNumeroDataset(elemento, 'vidroDeslocamentoVerde', base.deslocamentoVerde),
    deslocamentoAzul: lerNumeroDataset(elemento, 'vidroDeslocamentoAzul', base.deslocamentoAzul),
    canalX: normalizarCanal(lerTextoDataset(elemento, 'vidroCanalX', base.canalX)),
    canalY: normalizarCanal(lerTextoDataset(elemento, 'vidroCanalY', base.canalY)),
    modoMistura: normalizarModoMistura(lerTextoDataset(elemento, 'vidroModoMistura', base.modoMistura))
  };

  return configuracao;
}

function criarNoSvg(documento, nome, atributos = {}) {
  const no = documento.createElementNS(SVG_NS, nome);
  Object.entries(atributos).forEach(([chave, valor]) => {
    no.setAttribute(chave, `${valor}`);
  });
  return no;
}

function obterEstruturaDefs(documento) {
  let svg = documento.getElementById('superficie-vidro-defs');
  let defs;

  if (!svg) {
    svg = criarNoSvg(documento, 'svg', {
      id: 'superficie-vidro-defs',
      class: 'superficie-vidro__defs',
      'aria-hidden': 'true',
      focusable: 'false'
    });
    defs = criarNoSvg(documento, 'defs');
    svg.appendChild(defs);
    documento.body.appendChild(svg);
  } else {
    defs = svg.querySelector('defs');
  }

  return { svg, defs };
}

function limparEstruturaDefs(documento) {
  const svg = documento.getElementById('superficie-vidro-defs');
  if (svg && svg.parentNode) {
    svg.parentNode.removeChild(svg);
  }
}

function suportaFiltrosSvgBackdrop() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const agente = navigator.userAgent;
  const ehWebkit = /Safari/.test(agente) && !/Chrome|Chromium|CriOS/.test(agente);
  const ehFirefox = /Firefox/.test(agente);

  if (ehWebkit || ehFirefox) {
    return false;
  }

  const div = document.createElement('div');
  div.style.backdropFilter = 'url(#teste-filtro-vidro)';
  return div.style.backdropFilter !== '';
}

function gerarMapaDeslocamento(elemento, ids, config) {
  const retangulo = elemento.getBoundingClientRect();
  const largura = Math.max(1, Math.round(retangulo.width || elemento.offsetWidth || 400));
  const altura = Math.max(1, Math.round(retangulo.height || elemento.offsetHeight || 200));
  const raio = obterRaioDeBorda(elemento, 20);
  const tamanhoBorda = Math.min(largura, altura) * (config.larguraBorda * 0.5);

  const larguraInterna = Math.max(1, largura - tamanhoBorda * 2);
  const alturaInterna = Math.max(1, altura - tamanhoBorda * 2);

  const conteudoSvg = `
    <svg viewBox="0 0 ${largura} ${altura}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${ids.gradienteVermelho}" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="${ids.gradienteAzul}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${largura}" height="${altura}" fill="black"></rect>
      <rect x="0" y="0" width="${largura}" height="${altura}" rx="${raio}" fill="url(#${ids.gradienteVermelho})" />
      <rect x="0" y="0" width="${largura}" height="${altura}" rx="${raio}" fill="url(#${ids.gradienteAzul})" style="mix-blend-mode: ${config.modoMistura}" />
      <rect x="${tamanhoBorda}" y="${tamanhoBorda}" width="${larguraInterna}" height="${alturaInterna}" rx="${raio}" fill="hsl(0 0% ${config.brilho}% / ${config.opacidade})" style="filter: blur(${config.desfoque}px)" />
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(conteudoSvg)}`;
}

function atualizarFiltro(instancia) {
  const { elemento, ids, config, refs } = instancia;
  refs.feImage.setAttribute('href', gerarMapaDeslocamento(elemento, ids, config));

  const configuracoesCanais = [
    { ref: refs.deslocamentoVermelho, deslocamento: config.deslocamentoVermelho },
    { ref: refs.deslocamentoVerde, deslocamento: config.deslocamentoVerde },
    { ref: refs.deslocamentoAzul, deslocamento: config.deslocamentoAzul }
  ];

  configuracoesCanais.forEach(({ ref, deslocamento }) => {
    const escalaAplicada = limitar(config.escalaDistorcao + deslocamento, -120, 120);
    ref.setAttribute('scale', `${escalaAplicada}`);
    ref.setAttribute('xChannelSelector', config.canalX);
    ref.setAttribute('yChannelSelector', config.canalY);
  });

  refs.desfoqueGaussiano.setAttribute('stdDeviation', `${limitar(config.deslocamento, 0, 2)}`);
  elemento.style.setProperty('--superficie-vidro-fundo', `${config.opacidadeFundo}`);
  elemento.style.setProperty('--superficie-vidro-saturacao', `${config.saturacao}`);
  elemento.style.setProperty('--superficie-vidro-filtro', `url(#${ids.filtro})`);
}

function criarFiltroPorElemento(documento, defs, elemento) {
  contadorFiltros += 1;
  const sufixo = `${contadorFiltros}`;

  const ids = {
    filtro: `filtro-superficie-vidro-${sufixo}`,
    gradienteVermelho: `gradiente-vidro-vermelho-${sufixo}`,
    gradienteAzul: `gradiente-vidro-azul-${sufixo}`
  };

  const filtro = criarNoSvg(documento, 'filter', {
    id: ids.filtro,
    colorInterpolationFilters: 'sRGB',
    x: '-22%',
    y: '-22%',
    width: '144%',
    height: '144%'
  });

  const feImage = criarNoSvg(documento, 'feImage', {
    x: '0',
    y: '0',
    width: '100%',
    height: '100%',
    preserveAspectRatio: 'none',
    result: 'mapa'
  });

  const deslocamentoVermelho = criarNoSvg(documento, 'feDisplacementMap', {
    in: 'SourceGraphic',
    in2: 'mapa',
    result: 'dispRed'
  });

  const matrizVermelho = criarNoSvg(documento, 'feColorMatrix', {
    in: 'dispRed',
    type: 'matrix',
    values: `1 0 0 0 0
             0 0 0 0 0
             0 0 0 0 0
             0 0 0 1 0`,
    result: 'vermelho'
  });

  const deslocamentoVerde = criarNoSvg(documento, 'feDisplacementMap', {
    in: 'SourceGraphic',
    in2: 'mapa',
    result: 'dispGreen'
  });

  const matrizVerde = criarNoSvg(documento, 'feColorMatrix', {
    in: 'dispGreen',
    type: 'matrix',
    values: `0 0 0 0 0
             0 1 0 0 0
             0 0 0 0 0
             0 0 0 1 0`,
    result: 'verde'
  });

  const deslocamentoAzul = criarNoSvg(documento, 'feDisplacementMap', {
    in: 'SourceGraphic',
    in2: 'mapa',
    result: 'dispBlue'
  });

  const matrizAzul = criarNoSvg(documento, 'feColorMatrix', {
    in: 'dispBlue',
    type: 'matrix',
    values: `0 0 0 0 0
             0 0 0 0 0
             0 0 1 0 0
             0 0 0 1 0`,
    result: 'azul'
  });

  const blendRg = criarNoSvg(documento, 'feBlend', {
    in: 'vermelho',
    in2: 'verde',
    mode: 'screen',
    result: 'rg'
  });

  const blendRgb = criarNoSvg(documento, 'feBlend', {
    in: 'rg',
    in2: 'azul',
    mode: 'screen',
    result: 'saida'
  });

  const desfoqueGaussiano = criarNoSvg(documento, 'feGaussianBlur', {
    in: 'saida',
    stdDeviation: '0.7'
  });

  filtro.appendChild(feImage);
  filtro.appendChild(deslocamentoVermelho);
  filtro.appendChild(matrizVermelho);
  filtro.appendChild(deslocamentoVerde);
  filtro.appendChild(matrizVerde);
  filtro.appendChild(deslocamentoAzul);
  filtro.appendChild(matrizAzul);
  filtro.appendChild(blendRg);
  filtro.appendChild(blendRgb);
  filtro.appendChild(desfoqueGaussiano);

  defs.appendChild(filtro);

  return {
    elemento,
    ids,
    config: obterConfiguracao(elemento),
    filtro,
    refs: {
      feImage,
      deslocamentoVermelho,
      deslocamentoVerde,
      deslocamentoAzul,
      desfoqueGaussiano
    }
  };
}

function aplicarClasseDeSuporte(elemento, temSuporte) {
  elemento.classList.remove('superficie-vidro--svg', 'superficie-vidro--fallback');
  elemento.classList.add(temSuporte ? 'superficie-vidro--svg' : 'superficie-vidro--fallback');
}

export function inicializarSuperficieVidro(raiz = document) {
  if (!raiz) {
    return FUNCAO_NULA;
  }

  const documento = raiz.ownerDocument || raiz;
  const escopo = typeof raiz.querySelectorAll === 'function' ? raiz : documento;
  const elementos = Array.from(escopo.querySelectorAll('.superficie-vidro'));
  if (raiz instanceof Element && raiz.matches('.superficie-vidro')) {
    elementos.unshift(raiz);
  }

  if (elementos.length === 0) {
    return FUNCAO_NULA;
  }

  const temSuporte = suportaFiltrosSvgBackdrop();

  const limpezas = [];

  if (!temSuporte) {
    limparEstruturaDefs(documento);

    elementos.forEach((elemento) => {
      const config = obterConfiguracao(elemento);
      elemento.style.setProperty('--superficie-vidro-fundo', `${config.opacidadeFundo}`);
      elemento.style.setProperty('--superficie-vidro-saturacao', `${config.saturacao}`);
      elemento.style.removeProperty('--superficie-vidro-filtro');
      aplicarClasseDeSuporte(elemento, false);
    });

    return FUNCAO_NULA;
  }

  limparEstruturaDefs(documento);
  contadorFiltros = 0;
  const { svg, defs } = obterEstruturaDefs(documento);

  elementos.forEach((elemento) => {
    aplicarClasseDeSuporte(elemento, true);

    const instancia = criarFiltroPorElemento(documento, defs, elemento);
    atualizarFiltro(instancia);

    if ('ResizeObserver' in window) {
      const observador = new ResizeObserver(() => {
        requestAnimationFrame(() => atualizarFiltro(instancia));
      });
      observador.observe(elemento);
      limpezas.push(() => observador.disconnect());
    } else {
      const aoRedimensionar = () => atualizarFiltro(instancia);
      window.addEventListener('resize', aoRedimensionar);
      limpezas.push(() => window.removeEventListener('resize', aoRedimensionar));
    }

    limpezas.push(() => {
      if (instancia.filtro.parentNode) {
        instancia.filtro.parentNode.removeChild(instancia.filtro);
      }
      elemento.style.removeProperty('--superficie-vidro-filtro');
      elemento.style.removeProperty('--superficie-vidro-fundo');
      elemento.style.removeProperty('--superficie-vidro-saturacao');
    });
  });

  return () => {
    limpezas.forEach((limpar) => limpar());
    if (defs.childElementCount === 0 && svg.parentNode) {
      svg.parentNode.removeChild(svg);
    }
  };
}
