const supabase = require("../supabaseClient");
const { Musica } = require("../karaoke/musica");
const { Parte } = require("../karaoke/parte");

class MusicaDAO {
  // Transforma a linha do banco no objeto da classe Musica
  _paraMusica(linha) {
    const nomeArtista = linha.artista ? linha.artista.nome : null;

    const musica = new Musica(linha.nome, nomeArtista);
    musica.id = linha.id;
    musica.capa = linha.capa_url || null;
    return musica;
  }

  // Transforma a linha do banco no objeto da classe Parte
  _paraParte(linha) {
    const parte = new Parte(linha.letra, linha.tempo_espera, linha.tag);
    parte.id = linha.id;
    parte.ordem = linha.ordem;
    return parte;
  }

  // Lista todas as músicas com o nome do artista e a capa
  async listarTodas() {
    const { data, error } = await supabase
      .from("musicas")
      .select("id, nome, capa_url, artista:artistas(nome)")
      .order("id");

    if (error) throw new Error("Erro ao listar músicas: " + error.message);

    return data.map((linha) => this._paraMusica(linha));
  }

  // Busca uma música pelo ID e já traz as partes dela
  async buscarPorId(id) {
    const { data: musicaData, error: musicaError } = await supabase
      .from("musicas")
      .select("id, nome, capa_url, artista:artistas(nome)")
      .eq("id", id)
      .maybeSingle();

    if (musicaError)
      throw new Error("Erro ao buscar música: " + musicaError.message);
    if (!musicaData) return null;

    const musica = this._paraMusica(musicaData);

    const { data: partesData, error: partesError } = await supabase
      .from("partes")
      .select("id, ordem, letra, tempo_espera, tag")
      .eq("musica_id", id)
      .order("ordem");

    if (partesError)
      throw new Error("Erro ao buscar partes: " + partesError.message);

    if (partesData) {
      musica.partes = partesData.map((linha) => this._paraParte(linha));
    }

    return musica;
  }

  // Busca ou cria o artista e devolve o id dele
  async _obterArtistaId(nomeArtista) {
    const { data: artistaExistente, error: erroBusca } = await supabase
      .from("artistas")
      .select("id")
      .eq("nome", nomeArtista)
      .maybeSingle();

    if (erroBusca)
      throw new Error("Erro ao buscar artista: " + erroBusca.message);
    if (artistaExistente) return artistaExistente.id;

    const { data: novoArtista, error: erroCriar } = await supabase
      .from("artistas")
      .insert({ nome: nomeArtista })
      .select("id")
      .single();

    if (erroCriar)
      throw new Error("Erro ao criar artista: " + erroCriar.message);
    return novoArtista.id;
  }

  // Insere uma nova música. A capa é opcional.
  async inserir(nome, nomeArtista, capa = null) {
    const artistaId = await this._obterArtistaId(nomeArtista);

    const { data: novaMusicaData, error: erroCriarMusica } = await supabase
      .from("musicas")
      .insert({ nome: nome, artista_id: artistaId, capa_url: capa || null })
      .select("id, nome, capa_url")
      .single();

    if (erroCriarMusica)
      throw new Error("Erro ao criar música: " + erroCriarMusica.message);

    const novaMusica = new Musica(novaMusicaData.nome, nomeArtista);
    novaMusica.id = novaMusicaData.id;
    novaMusica.capa = novaMusicaData.capa_url || null;

    return novaMusica;
  }

  // Adiciona uma Parte a uma música existente
  async adicionarPartes(idMusica, parte) {
    if (!(parte instanceof Parte)) return false;

    const { count, error: erroCount } = await supabase
      .from("partes")
      .select("*", { count: "exact", head: true })
      .eq("musica_id", idMusica);

    if (erroCount)
      throw new Error("Erro ao contar partes: " + erroCount.message);

    const proximaOrdem = (count || 0) + 1;

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

  // Atualiza nome, artista e capa.
  // Se "capa" vier undefined, a capa atual é mantida.
  // Se vier vazia (""), a capa é removida.
  async atualizar(id, nome, nomeArtista, capa) {
    const musica = await this.buscarPorId(id);
    if (!musica) return null;

    const artistaId = await this._obterArtistaId(nomeArtista);

    const dados = { nome: nome, artista_id: artistaId };
    if (capa !== undefined) dados.capa_url = capa || null;

    const { error: erroUpdate } = await supabase
      .from("musicas")
      .update(dados)
      .eq("id", id);

    if (erroUpdate)
      throw new Error("Erro ao atualizar música: " + erroUpdate.message);

    return await this.buscarPorId(id);
  }

  // Remove uma música pelo ID
  async remover(id) {
    const musica = await this.buscarPorId(id);
    if (!musica) return null;

    const { error } = await supabase.from("musicas").delete().eq("id", id);

    if (error) throw new Error("Erro ao remover música: " + error.message);

    return musica;
  }
}

module.exports = new MusicaDAO();
