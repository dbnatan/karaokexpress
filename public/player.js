// ==========================================
// REFERÊNCIAS AOS ELEMENTOS
// ==========================================
// Player
const listaEl = document.getElementById("listaMusicas");
const nomeEl = document.getElementById("nomeMusica");
const artistaEl = document.getElementById("artista");
const tagEl = document.getElementById("tag");
const letraEl = document.getElementById("letra");
const contadorEl = document.getElementById("contador");
const btnTocar = document.getElementById("btnTocar");

// Admin
const formMusica = document.getElementById("formMusica");
const inputId = document.getElementById("inputId");
const inputNome = document.getElementById("inputNome");
const inputArtista = document.getElementById("inputArtista");
const btnSalvar = document.getElementById("btnSalvar");
const btnNovo = document.getElementById("btnNovo");
const btnExcluir = document.getElementById("btnExcluir");
const mensagemEl = document.getElementById("mensagem");

// Estado
let musicaAtual = null;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================
function mostrarMensagem(texto, tipo) {
  mensagemEl.textContent = texto;
  mensagemEl.style.color = tipo === "erro" ? "#ff6b6b" : "#1db954";
  setTimeout(() => {
    mensagemEl.textContent = "";
  }, 3000);
}

// ==========================================
// R1 - LISTAR MÚSICAS
// ==========================================
async function carregarPlaylist() {
  try {
    const resposta = await fetch("/api/musicas");
    if (!resposta.ok) throw new Error("Falha ao carregar a lista");

    const musicas = await resposta.json();
    listaEl.innerHTML = ""; // Limpa a lista antes de recarregar

    for (const musica of musicas) {
      const item = document.createElement("li");
      // IMPORTANTE: artista agora é um objeto! Temos que acessar .nome
      const nomeArtista = musica.artista ? musica.artista : "Desconhecido";

      item.textContent = `${musica.nome} — ${nomeArtista}`;
      item.style.cursor = "pointer";

      item.addEventListener("click", () => {
        // Quando clica, carrega no player E preenche o formulário de admin
        escolherMusica(musica.id);
        preencherFormulario(musica);
      });

      listaEl.appendChild(item);
    }
  } catch (erro) {
    mostrarMensagem("Erro de conexão ao carregar a lista.", "erro");
  }
}

// ==========================================
// R6 - SELECIONAR E TOCAR
// ==========================================
async function escolherMusica(id) {
  try {
    const resposta = await fetch("/api/musicas/" + id);
    if (!resposta.ok) throw new Error("Música não encontrada");

    const musica = await resposta.json();
    musicaAtual = musica;

    nomeEl.textContent = musica.nome;
    artistaEl.textContent = musica.artista ? musica.artista : "Desconhecido";

    // Habilita o botão de tocar
    btnTocar.disabled = false;

    // Se não tiver partes, avisa
    if (!musica.partes || musica.partes.length === 0) {
      tagEl.textContent = "";
      letraEl.textContent = "Esta música não tem partes cadastradas.";
      contadorEl.textContent = "";
      btnTocar.disabled = true; // Regra R6: Tocar indisponível se não tem partes
    } else {
      tagEl.textContent = "";
      letraEl.textContent = "Pronto para tocar!";
      contadorEl.textContent = "";
    }
  } catch (erro) {
    mostrarMensagem("Erro ao buscar detalhes da música.", "erro");
  }
}

async function tocar() {
  if (!musicaAtual || !musicaAtual.partes || musicaAtual.partes.length === 0)
    return;

  btnTocar.disabled = true;

  for (let i = 0; i < musicaAtual.partes.length; i++) {
    const parte = musicaAtual.partes[i];
    tagEl.textContent = parte.tag;
    letraEl.textContent = parte.letra;
    contadorEl.textContent =
      "Parte " + (i + 1) + " de " + musicaAtual.partes.length;
    await sleep(parte.tempoEspera);
  }

  tagEl.textContent = "";
  letraEl.textContent = "🎤 Fim! Escolha outra música.";
  contadorEl.textContent = "";
  btnTocar.disabled = false;
}
btnTocar.addEventListener("click", tocar);

// ==========================================
// R2, R3, R4 e R5 - CRUD E VALIDAÇÃO
// ==========================================
function preencherFormulario(musica) {
  inputId.value = musica.id;
  inputNome.value = musica.nome;
  // Se o artista vier como objeto, pegamos o nome. Se vier string, usamos direto.
  inputArtista.value = musica.artista
    ? musica.artista.nome || musica.artista
    : "";

  btnExcluir.disabled = false; // Habilita a exclusão
  btnSalvar.textContent = "Atualizar"; // Muda o texto do botão
}

function limparFormulario() {
  inputId.value = "";
  inputNome.value = "";
  inputArtista.value = "";
  btnExcluir.disabled = true;
  btnSalvar.textContent = "Salvar";
  inputNome.focus();
}
btnNovo.addEventListener("click", limparFormulario);

formMusica.addEventListener("submit", async (e) => {
  e.preventDefault(); // Impede a página de recarregar

  const id = inputId.value;
  const nome = inputNome.value.trim();
  const artista = inputArtista.value.trim();

  // R5 - Validação de campos vazios
  if (!nome || !artista) {
    mostrarMensagem("Preencha todos os campos!", "erro");
    return;
  }

  const dados = { nome, artista };

  try {
    let resposta;
    if (id) {
      // R3 - Editar (PUT)
      resposta = await fetch("/api/musicas/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
    } else {
      // R2 - Cadastrar (POST)
      resposta = await fetch("/api/musicas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
    }

    if (!resposta.ok) throw new Error("Erro na operação");

    mostrarMensagem(
      id ? "Música atualizada!" : "Música cadastrada!",
      "sucesso",
    );
    limparFormulario();
    carregarPlaylist(); // Atualiza a lista na tela
  } catch (erro) {
    mostrarMensagem("Falha de conexão com a API.", "erro");
  }
});

btnExcluir.addEventListener("click", async () => {
  const id = inputId.value;
  if (!id) return;

  // R4 - Pedir confirmação
  const confirmou = confirm("Tem certeza que deseja excluir esta música?");
  if (!confirmou) return;

  try {
    const resposta = await fetch("/api/musicas/" + id, {
      method: "DELETE",
    });

    if (!resposta.ok) throw new Error("Erro ao excluir");

    mostrarMensagem("Música excluída!", "sucesso");
    limparFormulario();
    carregarPlaylist();
  } catch (erro) {
    mostrarMensagem("Erro ao excluir a música.", "erro");
  }
});

// Inicia a página
carregarPlaylist();
