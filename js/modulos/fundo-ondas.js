const MAXIMO_CORES = 8;

const SHADER_VERTICE = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = (aPosition + 1.0) * 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const SHADER_FRAGMENTO = `
precision highp float;
#define MAX_COLORS ${MAXIMO_CORES}

uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
varying vec2 vUv;

float random(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / max(uCanvas.y, 1.0)), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

  vec3 col = vec3(0.0);
  float a = 1.0;

  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float cover = 0.0;

    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-6.0 / exp(6.0 * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }

    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  } else {
    vec2 s = q;
    for (int k = 0; k < 3; ++k) {
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float m = mix(m0, m1, kMix);
      col[k] = 1.0 - exp(-6.0 / exp(6.0 * m));
    }

    a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
  }

  if (uNoise > 0.0001) {
    float n = random(gl_FragCoord.xy + vec2(uTime));
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }

  vec3 rgb = (uTransparent > 0) ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}
`;

const FUNCAO_VAZIA = () => {};

function limitar(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function compilarShader(gl, tipo, codigoFonte) {
  const shader = gl.createShader(tipo);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, codigoFonte);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || 'sem detalhes';
    const tipoLegivel = tipo === gl.VERTEX_SHADER ? 'vertice' : 'fragmento';
    console.error(`[fundo-ondas] erro ao compilar shader (${tipoLegivel}): ${log}`);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function criarPrograma(gl) {
  const shaderVertice = compilarShader(gl, gl.VERTEX_SHADER, SHADER_VERTICE);
  const shaderFragmento = compilarShader(gl, gl.FRAGMENT_SHADER, SHADER_FRAGMENTO);

  if (!shaderVertice || !shaderFragmento) {
    if (shaderVertice) gl.deleteShader(shaderVertice);
    if (shaderFragmento) gl.deleteShader(shaderFragmento);
    return null;
  }

  const programa = gl.createProgram();
  if (!programa) {
    gl.deleteShader(shaderVertice);
    gl.deleteShader(shaderFragmento);
    return null;
  }

  gl.attachShader(programa, shaderVertice);
  gl.attachShader(programa, shaderFragmento);
  gl.linkProgram(programa);

  gl.deleteShader(shaderVertice);
  gl.deleteShader(shaderFragmento);

  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(programa) || 'sem detalhes';
    console.error(`[fundo-ondas] erro ao linkar programa: ${log}`);
    gl.deleteProgram(programa);
    return null;
  }

  return programa;
}

function hexParaRgbNormalizado(hex) {
  const limpo = hex.replace('#', '').trim();
  const tripla =
    limpo.length === 3
      ? limpo
          .split('')
          .map((caractere) => caractere + caractere)
          .join('')
      : limpo;

  const valido = /^[a-fA-F0-9]{6}$/.test(tripla);
  if (!valido) {
    return [0, 0, 0];
  }

  return [
    Number.parseInt(tripla.slice(0, 2), 16) / 255,
    Number.parseInt(tripla.slice(2, 4), 16) / 255,
    Number.parseInt(tripla.slice(4, 6), 16) / 255
  ];
}

function obterCoresPadrao() {
  const estilo = getComputedStyle(document.documentElement);
  const variaveisCores = ['--fundo-cor-1', '--fundo-cor-2', '--fundo-cor-3', '--fundo-cor-4']
    .map((nome) => estilo.getPropertyValue(nome).trim())
    .filter(Boolean);

  return variaveisCores.length > 0 ? variaveisCores : ['#ff5c7a', '#8a5cff', '#00ffd1'];
}

export function inicializarFundoOndas(opcoes = {}) {
  const alvo = opcoes.alvo;
  if (!alvo) {
    return FUNCAO_VAZIA;
  }

  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ponteiroGrosso = window.matchMedia('(pointer: coarse)').matches;

  const config = {
    cores: opcoes.cores || obterCoresPadrao(),
    rotacao: Number.isFinite(opcoes.rotacao) ? opcoes.rotacao : 0,
    velocidade: Number.isFinite(opcoes.velocidade) ? opcoes.velocidade : 0.2,
    escala: Number.isFinite(opcoes.escala) ? opcoes.escala : 1,
    frequencia: Number.isFinite(opcoes.frequencia) ? opcoes.frequencia : 1,
    forcaWarp: Number.isFinite(opcoes.forcaWarp) ? opcoes.forcaWarp : 1,
    influenciaMouse: Number.isFinite(opcoes.influenciaMouse) ? opcoes.influenciaMouse : 1,
    paralaxe: Number.isFinite(opcoes.paralaxe) ? opcoes.paralaxe : 0.5,
    ruido: Number.isFinite(opcoes.ruido) ? opcoes.ruido : 0.1,
    autoRotacao: Number.isFinite(opcoes.autoRotacao) ? opcoes.autoRotacao : 0,
    transparente: opcoes.transparente !== false
  };

  if (ponteiroGrosso) {
    config.influenciaMouse *= 0.35;
    config.paralaxe *= 0.45;
    config.ruido *= 0.75;
  }

  if (reduzMovimento) {
    config.velocidade = 0.04;
    config.autoRotacao = 0;
  }

  const tela = document.createElement('canvas');
  tela.className = 'fundo-animado__canvas';
  alvo.appendChild(tela);

  const gl = tela.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance'
  });

  if (!gl) {
    alvo.classList.add('fundo-animado--fallback');
    return () => {
      tela.remove();
    };
  }

  const programa = criarPrograma(gl);
  if (!programa) {
    alvo.classList.add('fundo-animado--fallback');
    tela.remove();
    return FUNCAO_VAZIA;
  }

  const quad = gl.createBuffer();
  if (!quad) {
    gl.deleteProgram(programa);
    alvo.classList.add('fundo-animado--fallback');
    tela.remove();
    return FUNCAO_VAZIA;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  gl.useProgram(programa);

  const localizacaoPosicao = gl.getAttribLocation(programa, 'aPosition');
  gl.enableVertexAttribArray(localizacaoPosicao);
  gl.vertexAttribPointer(localizacaoPosicao, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    canvas: gl.getUniformLocation(programa, 'uCanvas'),
    tempo: gl.getUniformLocation(programa, 'uTime'),
    velocidade: gl.getUniformLocation(programa, 'uSpeed'),
    rotacao: gl.getUniformLocation(programa, 'uRot'),
    totalCores: gl.getUniformLocation(programa, 'uColorCount'),
    cores: gl.getUniformLocation(programa, 'uColors'),
    transparente: gl.getUniformLocation(programa, 'uTransparent'),
    escala: gl.getUniformLocation(programa, 'uScale'),
    frequencia: gl.getUniformLocation(programa, 'uFrequency'),
    forcaWarp: gl.getUniformLocation(programa, 'uWarpStrength'),
    ponteiro: gl.getUniformLocation(programa, 'uPointer'),
    influenciaMouse: gl.getUniformLocation(programa, 'uMouseInfluence'),
    paralaxe: gl.getUniformLocation(programa, 'uParallax'),
    ruido: gl.getUniformLocation(programa, 'uNoise')
  };

  const bufferCores = new Float32Array(MAXIMO_CORES * 3);
  const cores = config.cores.slice(0, MAXIMO_CORES);
  cores.forEach((hex, indice) => {
    const deslocamento = indice * 3;
    const [r, g, b] = hexParaRgbNormalizado(hex);
    bufferCores[deslocamento] = r;
    bufferCores[deslocamento + 1] = g;
    bufferCores[deslocamento + 2] = b;
  });

  const totalCores = Math.max(1, cores.length);
  gl.uniform1i(uniforms.totalCores, totalCores);
  gl.uniform3fv(uniforms.cores, bufferCores);
  gl.uniform1i(uniforms.transparente, config.transparente ? 1 : 0);
  gl.uniform1f(uniforms.velocidade, config.velocidade);
  gl.uniform1f(uniforms.escala, config.escala);
  gl.uniform1f(uniforms.frequencia, config.frequencia);
  gl.uniform1f(uniforms.forcaWarp, config.forcaWarp);
  gl.uniform1f(uniforms.influenciaMouse, config.influenciaMouse);
  gl.uniform1f(uniforms.paralaxe, config.paralaxe);
  gl.uniform1f(uniforms.ruido, config.ruido);
  gl.uniform2f(uniforms.ponteiro, 0, 0);

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, config.transparente ? 0 : 1);

  const ponteiroAlvo = { x: 0, y: 0 };
  const ponteiroAtual = { x: 0, y: 0 };
  const suavizacaoPonteiro = 8;

  const atualizarPonteiro = (evento) => {
    const largura = window.innerWidth || 1;
    const altura = window.innerHeight || 1;
    ponteiroAlvo.x = limitar((evento.clientX / largura) * 2 - 1, -1, 1);
    ponteiroAlvo.y = limitar(-((evento.clientY / altura) * 2 - 1), -1, 1);
  };

  const resetarPonteiro = () => {
    ponteiroAlvo.x = 0;
    ponteiroAlvo.y = 0;
  };

  window.addEventListener('pointermove', atualizarPonteiro, { passive: true });
  window.addEventListener('pointercancel', resetarPonteiro);
  window.addEventListener('blur', resetarPonteiro);

  const ajustarTamanho = () => {
    const largura = window.innerWidth || 1;
    const altura = window.innerHeight || 1;
    const maximoDpr = ponteiroGrosso ? 1.5 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, maximoDpr);
    tela.width = Math.max(1, Math.floor(largura * dpr));
    tela.height = Math.max(1, Math.floor(altura * dpr));
    gl.viewport(0, 0, tela.width, tela.height);
    gl.uniform2f(uniforms.canvas, largura, altura);
  };

  ajustarTamanho();
  window.addEventListener('resize', ajustarTamanho);
  window.addEventListener('orientationchange', ajustarTamanho);

  let idAnimacao = 0;
  let anterior = performance.now();
  const inicio = anterior;
  let abaVisivel = !document.hidden;

  const atualizarVisibilidadeAba = () => {
    abaVisivel = !document.hidden;
    if (abaVisivel) {
      anterior = performance.now();
    }
  };

  document.addEventListener('visibilitychange', atualizarVisibilidadeAba, { passive: true });

  const renderizar = (agora) => {
    if (!abaVisivel) {
      idAnimacao = requestAnimationFrame(renderizar);
      return;
    }

    const tempoDecorrido = (agora - inicio) / 1000;
    const delta = Math.min((agora - anterior) / 1000, 0.2);
    anterior = agora;

    const taxa = Math.min(1, delta * suavizacaoPonteiro);
    ponteiroAtual.x += (ponteiroAlvo.x - ponteiroAtual.x) * taxa;
    ponteiroAtual.y += (ponteiroAlvo.y - ponteiroAtual.y) * taxa;

    const graus = (config.rotacao % 360) + config.autoRotacao * tempoDecorrido;
    const radianos = (graus * Math.PI) / 180;

    gl.uniform1f(uniforms.tempo, tempoDecorrido);
    gl.uniform2f(uniforms.rotacao, Math.cos(radianos), Math.sin(radianos));
    gl.uniform2f(uniforms.ponteiro, ponteiroAtual.x, ponteiroAtual.y);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    idAnimacao = requestAnimationFrame(renderizar);
  };

  idAnimacao = requestAnimationFrame(renderizar);

  return () => {
    cancelAnimationFrame(idAnimacao);
    window.removeEventListener('pointermove', atualizarPonteiro);
    window.removeEventListener('pointercancel', resetarPonteiro);
    window.removeEventListener('blur', resetarPonteiro);
    window.removeEventListener('resize', ajustarTamanho);
    window.removeEventListener('orientationchange', ajustarTamanho);
    document.removeEventListener('visibilitychange', atualizarVisibilidadeAba);
    gl.deleteBuffer(quad);
    gl.deleteProgram(programa);
    tela.remove();
  };
}
