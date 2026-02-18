(function () {
  "use strict";

  const CARDS_PER_PAGE = 9;
  const grid = document.getElementById("livros-grid");
  const btnAnterior = document.getElementById("btn-anterior");
  const btnProximos = document.getElementById("btn-proximos");
  const paginaInfo = document.getElementById("pagina-info");
  const paginacao = document.getElementById("paginacao");

  if (!grid || !btnAnterior || !btnProximos || !paginaInfo) return;

  const cards = Array.from(grid.querySelectorAll(".livro-card"));
  const totalPages = Math.ceil(cards.length / CARDS_PER_PAGE);
  let currentPage = 1;

  if (paginacao && totalPages <= 1) {
    paginacao.hidden = true;
  }

  function updateVisibility() {
    currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

    const start = (currentPage - 1) * CARDS_PER_PAGE;
    const end = start + CARDS_PER_PAGE;

    cards.forEach(function (card, fallbackIndex) {
      const rawIndex = parseInt(card.getAttribute("data-index"), 10);
      const index = Number.isNaN(rawIndex) ? fallbackIndex : rawIndex;

      if (index >= start && index < end) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });

    paginaInfo.textContent = "Página " + currentPage + " de " + (totalPages || 1);
    btnAnterior.disabled = currentPage <= 1;
    btnProximos.disabled = currentPage >= totalPages || totalPages <= 1;
  }

  btnAnterior.addEventListener("click", function () {
    if (currentPage <= 1) return;
    currentPage -= 1;
    updateVisibility();
  });

  btnProximos.addEventListener("click", function () {
    if (currentPage >= totalPages) return;
    currentPage += 1;
    updateVisibility();
  });

  updateVisibility();
})();
