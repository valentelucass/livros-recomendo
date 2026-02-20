export const SELETORES = {
  alvoFundo: '[data-fundo-animado]',
  gradeLivros: '#grade-livros',
  botaoAnterior: '#botao-anterior',
  botaoProximos: '#botao-proximos',
  informacaoPagina: '#informacao-pagina',
  paginacao: '#paginacao'
};

export const CONFIGURACAO_FUNDO_ONDAS = {
  cores: ['#ff5c7a', '#8a5cff', '#00ffd1'],
  rotacao: 0,
  velocidade: 0.2,
  escala: 1,
  frequencia: 1,
  forcaWarp: 1,
  influenciaMouse: 1,
  paralaxe: 0.5,
  ruido: 0.1,
  autoRotacao: 0,
  transparente: true
};

export const CONFIGURACAO_PAGINACAO = {
  itensPorPagina: 9,
  seletores: {
    gradeLivros: SELETORES.gradeLivros,
    botaoAnterior: SELETORES.botaoAnterior,
    botaoProximos: SELETORES.botaoProximos,
    informacaoPagina: SELETORES.informacaoPagina,
    paginacao: SELETORES.paginacao
  }
};
