const REL_LINK_EXTERNO = 'sponsored noopener noreferrer';
const CLASSES_CARTAO =
  'cartao-livro superficie-vidro superficie-vidro--cartao';
const CLASSES_BOTAO =
  'botao-afiliado botao-vidro superficie-vidro superficie-vidro--botao';

function escaparHtml(valor) {
  return `${valor ?? ''}`
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function gerarCartaoLivro(livro) {
  const titulo = escaparHtml(livro.titulo);
  const autor = escaparHtml(livro.autor);
  const descricao = escaparHtml(livro.descricao);
  const imagem = escaparHtml(livro.imagem);
  const link = escaparHtml(livro.link);
  const alt = escaparHtml(livro.alt || `Capa do livro ${livro.titulo}`);

  return `
    <article class="${CLASSES_CARTAO}">
      <div class="cartao-livro-capa">
        <img src="${imagem}" alt="${alt}" loading="lazy" decoding="async">
      </div>
      <div class="cartao-livro-conteudo">
        <h3>${titulo}</h3>
        <p class="livro-autor">${autor}</p>
        <p class="livro-descricao">${descricao}</p>
        <a href="${link}" target="_blank" rel="${REL_LINK_EXTERNO}" class="${CLASSES_BOTAO}">Ver na Amazon</a>
      </div>
    </article>
  `;
}

export function renderizarLivros({ alvo, livros }) {
  if (!alvo) {
    return 0;
  }

  const lista = Array.isArray(livros) ? livros : [];
  if (lista.length === 0) {
    alvo.innerHTML = '';
    return 0;
  }

  const html = lista.map(gerarCartaoLivro).join('');
  alvo.innerHTML = html;
  return lista.length;
}
