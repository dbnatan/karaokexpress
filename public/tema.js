// Alternância de tema claro/escuro
(function () {
  var raiz = document.documentElement;
  var botao = document.getElementById("btnTema");
  if (!botao) return;

  function atualizarBotao() {
    var escuro = raiz.getAttribute("data-theme") === "dark";
    botao.setAttribute("aria-pressed", String(escuro));
    botao.setAttribute(
      "aria-label",
      escuro ? "Ativar modo claro" : "Ativar modo escuro",
    );
  }

  botao.addEventListener("click", function () {
    var novo = raiz.getAttribute("data-theme") === "dark" ? "light" : "dark";
    raiz.setAttribute("data-theme", novo);
    try {
      localStorage.setItem("tema", novo);
    } catch (e) {}
    atualizarBotao();
  });

  atualizarBotao();
})();
