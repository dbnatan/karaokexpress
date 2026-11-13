const supabase = require("../supabaseClient");
const { Musica } = require("../karaoke/musica");
const { Parte } = require("../karaoke/parte");

class MusicaDAO {
  // Transforma a linha do banco no objeto da classe Musica
  _paraMusica(linha) {
    // Se o Supabase trouxe o artista aninhado, pegamos o nome dele
    const nomeArtista = linha.artista ? linha.artista.nome : null;

    const musica = new Musica(linha.nome, nomeArtista);
    musica.id = linha.id;
    return musica;
  }

  // Transforma a linha do banco no objeto da classe Parte
  _paraParte(linha) {
    const parte = new Parte(linha.letra, linha.tempo_espera, linha.tag);
    parte.id = linha.id;
    parte.ordem = linha.ordem;
    return parte;
  }

  // Lista todas as músicas com o nome do artista
  async listarTodas() {
    const { data, error } = await supabase
      .from("musicas")
      .select("id, nome, artista:artistas(nome)")
      .order("id");

    if (error) throw new Error("Erro ao listar músicas: " + error.message);

    return data.map((linha) => this._paraMusica(linha));
  }

  // Busca uma música pelo ID e já traz as partes dela
  async buscarPorId(id) {
    // 1. Busca a música
    const { data: musicaData, error: musicaError } = await supabase
      .from("musicas")
      .select("id, nome, artista:artistas(nome)")
      .eq("id", id)
      .maybeSingle(); // Retorna null se não achar, em vez de array vazio

    if (musicaError)
      throw new Error("Erro ao buscar música: " + musicaError.message);
    if (!musicaData) return null; // Não achou a música

    const musica = this._paraMusica(musicaData);

    // 2. Busca as partes dessa música
    const { data: partesData, error: partesError } = await supabase
      .from("partes")
      .select("id, ordem, letra, tempo_espera, tag")
      .eq("musica_id", id)
      .order("ordem"); // Importante: ordem certa!

    if (partesError)
      throw new Error("Erro ao buscar partes: " + partesError.message);

    // Adiciona as partes na música
    if (partesData) {
      musica.partes = partesData.map((linha) => this._paraParte(linha));
    }

    return musica;
  }

  // Insere uma nova música
  async inserir(nome, nomeArtista) {
    // 1. Verifica se o artista já existe (buscarOuCriar)
    let artistaId;
    const { data: artistaExistente, error: erroBuscaArtista } = await supabase
      .from("artistas")
      .select("id")
      .eq("nome", nomeArtista)
      .maybeSingle();

    if (erroBuscaArtista)
      throw new Error("Erro ao buscar artista: " + erroBuscaArtista.message);

    if (artistaExistente) {
      artistaId = artistaExistente.id;
    } else {
      // Se não existe, cria o artista
      const { data: novoArtista, error: erroCriarArtista } = await supabase
        .from("artistas")
        .insert({ nome: nomeArtista })
        .select("id")
        .single();

      if (erroCriarArtista)
        throw new Error("Erro ao criar artista: " + erroCriarArtista.message);
      artistaId = novoArtista.id;
    }

    // 2. Insere a música
    const { data: novaMusicaData, error: erroCriarMusica } = await supabase
      .from("musicas")
      .insert({ nome: nome, artista_id: artistaId })
      .select("id, nome")
      .single();

    if (erroCriarMusica)
      throw new Error("Erro ao criar música: " + erroCriarMusica.message);

    const novaMusica = new Musica(novaMusicaData.nome, nomeArtista);
    novaMusica.id = novaMusicaData.id;

    return novaMusica;
  }

  // Adiciona uma Parte a uma música existente
  async adicionarPartes(idMusica, parte) {
    if (!(parte instanceof Parte)) return false;

    // Descobre qual é a próxima "ordem" (se já tem 3 partes, a nova será a 4)
    const { count, error: erroCount } = await supabase
      .from("partes")
      .select("*", { count: "exact", head: true })
      .eq("musica_id", idMusica);

    if (erroCount)
      throw new Error("Erro ao contar partes: " + erroCount.message);

    const proximaOrdem = (count || 0) + 1;

    // Insere no banco
    const { error: erroInsert } = await supabase.from("partes").insert({
      musica_id: idMusica,
      ordem: proximaOrdem,
      letra: parte.letra,
      tempo_espera: parte.tempoEspera,
      tag: parte.tag,
    });

    if (erroInsert)
      throw new Error("Erro ao adicionar parte: " + erroInsert.message);

    return true;
  }

  // Atualiza nome e artista de uma música existente
  async atualizar(id, nome, nomeArtista) {
    // 1. Busca a música para ver se existe
    const musica = await this.buscarPorId(id);
    if (!musica) return null;

    // 2. Gerencia o artista (mesma lógica do inserir)
    let artistaId;
    const { data: artistaExistente } = await supabase
      .from("artistas")
      .select("id")
      .eq("nome", nomeArtista)
      .maybeSingle();

    if (artistaExistente) {
      artistaId = artistaExistente.id;
    } else {
      const { data: novoArtista, error: erroCriarArtista } = await supabase
        .from("artistas")
        .insert({ nome: nomeArtista })
        .select("id")
        .single();
      if (erroCriarArtista)
        throw new Error("Erro ao criar artista: " + erroCriarArtista.message);
      artistaId = novoArtista.id;
    }

    // 3. Atualiza a música
    const { error: erroUpdate } = await supabase
      .from("musicas")
      .update({ nome: nome, artista_id: artistaId })
      .eq("id", id);

    if (erroUpdate)
      throw new Error("Erro ao atualizar música: " + erroUpdate.message);

    return await this.buscarPorId(id); // Retorna a música atualizada
  }

  // Remove uma música pelo ID
  async remover(id) {
    // Busca antes para retornar o objeto removido (se o seu app.js usa isso)
    const musica = await this.buscarPorId(id);
    if (!musica) return null;

    // O "on delete cascade" no banco vai apagar as partes automaticamente
    const { error } = await supabase.from("musicas").delete().eq("id", id);

    if (error) throw new Error("Erro ao remover música: " + error.message);

    return musica;
  }
}

// Exporta uma INSTÂNCIA única (Singleton)
module.exports = new MusicaDAO();
