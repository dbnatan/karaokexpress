// Barra inferior + busca. Não altera o player.js: só observa e reage ao que ele já faz.
(function () {
  var nome = document.getElementById("nomeMusica");
  var artista = document.getElementById("artista");
  var btnTocar = document.getElementById("btnTocar");
  var barraNome = document.getElementById("barraNome");
  var barraArtista = document.getElementById("barraArtista");
  var barraTocar = document.getElementById("barraTocar");
  var busca = document.getElementById("busca");
  var lista = document.getElementById("listaMusicas");

  // --- Barra inferior espelha o palco ---
  function sincronizar() {
    barraNome.textContent = nome.textContent;
    barraArtista.textContent = artista.textContent;
    barraTocar.disabled = btnTocar.disabled;
  }

  var opcoes = { childList: true, characterData: true, subtree: true };
  new MutationObserver(sincronizar).observe(nome, opcoes);
  new MutationObserver(sincronizar).observe(artista, opcoes);
  new MutationObserver(sincronizar).observe(btnTocar, {
    attributes: true,
    attributeFilter: ["disabled"],
  });

  // o botão da barra apenas "aperta" o botão principal
  barraTocar.addEventListener("click", function () {
    btnTocar.click();
  });

  sincronizar();

  // --- Busca: filtra os itens da playlist pelo texto ---
  function filtrar() {
    var termo = busca.value.trim().toLowerCase();
    Array.prototype.forEach.call(lista.children, function (li) {
      li.hidden =
        termo !== "" && li.textContent.toLowerCase().indexOf(termo) === -1;
    });
  }

  busca.addEventListener("input", filtrar);
  // se o player.js redesenhar a lista, reaplica o filtro
  new MutationObserver(filtrar).observe(lista, { childList: true });
})();
