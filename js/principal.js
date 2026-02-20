import { inicializarPaginacao } from './modulos/paginacao.js';
import { inicializarFundoOndas } from './modulos/fundo-ondas.js';
import { inicializarSuperficieVidro } from './modulos/superficie-vidro.js';
import { renderizarLivros } from './modulos/renderizar-livros.js';
import { LIVROS_RECOMENDADOS } from './constantes/livros.js';
import { CONFIGURACAO_FUNDO_ONDAS, CONFIGURACAO_PAGINACAO, SELETORES } from './constantes/configuracoes.js';

const FUNCAO_VAZIA = () => {};

function registrarLimpeza(lista, funcao) {
  if (typeof funcao === 'function') {
    lista.push(funcao);
  }
}

const inicializarAplicacao = () => {
  const limpezas = [];
  const alvoGradeLivros = document.querySelector(SELETORES.gradeLivros);
  renderizarLivros({ alvo: alvoGradeLivros, livros: LIVROS_RECOMENDADOS });

  registrarLimpeza(limpezas, inicializarFundoOndas({
    alvo: document.querySelector(SELETORES.alvoFundo),
    ...CONFIGURACAO_FUNDO_ONDAS
  }));

  registrarLimpeza(limpezas, inicializarSuperficieVidro());
  registrarLimpeza(limpezas, inicializarPaginacao(CONFIGURACAO_PAGINACAO));

  return () => {
    while (limpezas.length > 0) {
      const limpar = limpezas.pop() || FUNCAO_VAZIA;
      limpar();
    }
  };
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const limparAplicacao = inicializarAplicacao();
    window.addEventListener('pagehide', limparAplicacao, { once: true });
  }, { once: true });
} else {
  const limparAplicacao = inicializarAplicacao();
  window.addEventListener('pagehide', limparAplicacao, { once: true });
}
