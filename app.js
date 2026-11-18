require("dotenv").config({ quiet: true }); // Carrega o .env no topo
const express = require("express");
const path = require("path");
const app = express();

// Importa o DAO (Singleton) e a classe Parte
const musicaDAO = require("./DAO/MusicaDAO");
const { Parte } = require("./karaoke/parte");

// Permite que o Express entenda JSON no corpo das requisições
app.use(express.json());

// Serve os arquivos da pasta 'public' (HTML, CSS, JS do player)
app.use(express.static(path.join(__dirname, "public")));

// A capa é opcional: aceita vazio, ausente ou uma URL http(s)
function capaValida(capa) {
  if (capa === undefined || capa === null || capa === "") return true;
  if (typeof capa !== "string") return false;
  try {
    const url = new URL(capa);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// 1. Listar todas as músicas
app.get("/api/musicas", async (req, res, next) => {
  try {
    const musicas = await musicaDAO.listarTodas();
    res.json(musicas);
  } catch (err) {
    next(err);
  }
});

// 2. Buscar uma música específica (com suas partes)
app.get("/api/musicas/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const musica = await musicaDAO.buscarPorId(id);

    if (!musica) {
      return res.status(404).json({ erro: "Música não encontrada" });
    }

    res.json(musica);
  } catch (err) {
    next(err);
  }
});

// 3. Criar uma nova música
app.post("/api/musicas", async (req, res, next) => {
  try {
    const { nome, artista, capa } = req.body;

    if (!nome || !artista) {
      return res.status(400).json({ erro: "Nome e artista são obrigatórios" });
    }
    if (!capaValida(capa)) {
      return res
        .status(400)
        .json({ erro: "Capa deve ser uma URL http(s) válida" });
    }

    const novaMusica = await musicaDAO.inserir(nome, artista, capa);
    res.status(201).json(novaMusica);
  } catch (err) {
    next(err);
  }
});

// 4. Atualizar nome e artista de uma música
app.put("/api/musicas/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nome, artista, capa } = req.body;

    if (!nome || !artista) {
      return res.status(400).json({ erro: "Nome e artista são obrigatórios" });
    }
    if (!capaValida(capa)) {
      return res
        .status(400)
        .json({ erro: "Capa deve ser uma URL http(s) válida" });
    }

    const musicaAtualizada = await musicaDAO.atualizar(id, nome, artista, capa);

    if (!musicaAtualizada) {
      return res.status(404).json({ erro: "Música não encontrada" });
    }

    res.json(musicaAtualizada);
  } catch (err) {
    next(err);
  }
});

// 5. Deletar uma música (o banco apaga as partes sozinho por causa do cascade)
app.delete("/api/musicas/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const musicaRemovida = await musicaDAO.remover(id);

    if (!musicaRemovida) {
      return res.status(404).json({ erro: "Música não encontrada" });
    }

    res.json({
      mensagem: "Música removida com sucesso",
      musica: musicaRemovida,
    });
  } catch (err) {
    next(err);
  }
});

// 6. Adicionar uma parte (verso) a uma música
app.post("/api/musicas/:id/partes", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { letra, tempoEspera, tag } = req.body;

    if (!letra || !tempoEspera) {
      return res
        .status(400)
        .json({ erro: "Letra e tempoEspera são obrigatórios" });
    }

    // Cria o objeto Parte usando a classe do seu projeto
    const novaParte = new Parte(letra, tempoEspera, tag);

    const sucesso = await musicaDAO.adicionarPartes(id, novaParte);

    if (!sucesso) {
      return res.status(400).json({ erro: "Erro ao adicionar a parte" });
    }

    res.status(201).json({ mensagem: "Parte adicionada com sucesso" });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error("Erro na API:", err.message); // Vai aparecer no terminal e nos logs da Render
  res.status(500).json({ erro: "Erro interno no servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
