// 1. Importar o Express
const express = require("express");

// importação da Parte
const { Parte } = require("./karaoke/parte");

// importação do DAO de músicas
const musicaDAO = require("./DAO/MusicaDAO");

// 2. Criar a aplicação
const app = express();

// 3. Configurar middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3.1 Rotas public
app.use(express.static("public"));

// 4. Definir rotas

app.get("/", (req, res) => {
  res.send("Olá, cliente!");
});

app.get("/api/musicas", (req, res) => {
  const musicas = musicaDAO.listarTodas();

  const resumo = [];

  for (let i = 0; i < musicas.length; i++) {
    const m = musicas[i];

    resumo.push({
      id: m.id,
      nome: m.nome,
      artista: m.artista,
      totalPartes: m.partes.length,
    });
  }

  res.json(resumo);
});

app.get("/api/musicas/:id", (req, res) => {
  const id = Number(req.params.id);

  const musica = musicaDAO.buscarPorId(id);

  if (!musica) {
    return res.status(404).json({
      erro: `Música com id ${id} não encontrada`,
    });
  }

  res.json(musica);
});

app.post("/api/musicas", (req, res) => {
  const { nome, artista } = req.body;

  if (!nome || !artista) {
    return res.status(400).json({
      erro: "Campos obrigatórios: nome, artista",
    });
  }

  const novaMusica = musicaDAO.inserir(nome, artista);

  res.status(201).json(novaMusica);
});

app.put("/api/musicas/:id", (req, res) => {
  const id = Number(req.params.id);
  const { nome, artista } = req.body;

  if (!nome || !artista) {
    return res.status(400).json({
      erro: "Campos obrigatórios: nome, artista",
    });
  }

  const musicaAtualizada = musicaDAO.atualizar(id, nome, artista);

  if (!musicaAtualizada) {
    return res.status(404).json({
      erro: `Música com id ${id} não encontrada`,
    });
  }

  res.status(200).json(musicaAtualizada);
});

app.delete("/api/musicas/:id", (req, res) => {
  const id = Number(req.params.id);

  const musicaRemovida = musicaDAO.remover(id);

  if (!musicaRemovida) {
    return res.status(404).json({
      erro: `Música com id ${id} não encontrada`,
    });
  }

  res.status(200).json(musicaRemovida);
});

app.post("/api/musicas/:id/partes", (req, res) => {
  const id = Number(req.params.id);
  const { letra, tempoEspera, tag } = req.body;

  if (!letra || !tempoEspera || !tag) {
    return res.status(400).json({
      erro: "Campos obrigatórios: letra, tempoEspera, tag",
    });
  }

  const musica = musicaDAO.buscarPorId(id);

  if (!musica) {
    return res.status(404).json({
      erro: `Música com id ${id} não encontrada`,
    });
  }

  const parte = new Parte(letra, tempoEspera, tag);

  const adicionada = musicaDAO.adicionarPartes(id, parte);

  if (!adicionada) {
    return res.status(404).json({
      erro: `Música com id ${id} não encontrada`,
    });
  }

  res.status(201).json(musica);
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro no servidor:", err.message);

  if (err.status === 400) {
    return res.status(400).json({
      erro: "JSON inválido no corpo da requisição",
    });
  }

  res.status(500).json({
    erro: "Erro interno do servidor",
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});
