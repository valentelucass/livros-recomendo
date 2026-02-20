const FUNCAO_VAZIA = () => {};
const SELETORES_PADRAO = {
  gradeLivros: '#grade-livros',
  botaoAnterior: '#botao-anterior',
  botaoProximos: '#botao-proximos',
  informacaoPagina: '#informacao-pagina',
  paginacao: '#paginacao'
};

function limitar(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

export function inicializarPaginacao(opcoes = {}) {
  const itensPorPagina = Number.isFinite(opcoes.itensPorPagina) ? opcoes.itensPorPagina : 9;
  const seletores = { ...SELETORES_PADRAO, ...(opcoes.seletores || {}) };
  const gradeLivros = document.querySelector(seletores.gradeLivros);
  const botaoAnterior = document.querySelector(seletores.botaoAnterior);
  const botaoProximos = document.querySelector(seletores.botaoProximos);
  const informacaoPagina = document.querySelector(seletores.informacaoPagina);
  const paginacao = document.querySelector(seletores.paginacao);

  if (!gradeLivros || !botaoAnterior || !botaoProximos || !informacaoPagina || itensPorPagina <= 0) {
    return FUNCAO_VAZIA;
  }

  const cartoes = Array.from(gradeLivros.querySelectorAll('.cartao-livro'));
  if (cartoes.length === 0) {
    if (paginacao) paginacao.hidden = true;
    return FUNCAO_VAZIA;
  }

  const totalPaginas = Math.max(1, Math.ceil(cartoes.length / itensPorPagina));
  let paginaAtual = 1;

  const atualizarVisibilidade = () => {
    paginaAtual = limitar(paginaAtual, 1, totalPaginas);

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;

    cartoes.forEach((cartao, indice) => {
      cartao.hidden = indice < inicio || indice >= fim;
    });

    informacaoPagina.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
    botaoAnterior.disabled = paginaAtual <= 1;
    botaoProximos.disabled = paginaAtual >= totalPaginas;
    botaoAnterior.setAttribute('aria-disabled', `${botaoAnterior.disabled}`);
    botaoProximos.setAttribute('aria-disabled', `${botaoProximos.disabled}`);

    if (paginacao) {
      paginacao.hidden = totalPaginas <= 1;
    }
  };

  const aoClicarAnterior = () => {
    if (paginaAtual <= 1) {
      return;
    }

    paginaAtual -= 1;
    atualizarVisibilidade();
  };

  const aoClicarProximos = () => {
    if (paginaAtual >= totalPaginas) {
      return;
    }

    paginaAtual += 1;
    atualizarVisibilidade();
  };

  botaoAnterior.addEventListener('click', aoClicarAnterior);
  botaoProximos.addEventListener('click', aoClicarProximos);

  atualizarVisibilidade();

  return () => {
    botaoAnterior.removeEventListener('click', aoClicarAnterior);
    botaoProximos.removeEventListener('click', aoClicarProximos);
  };
}
