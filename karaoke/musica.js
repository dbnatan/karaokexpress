class Musica {
  constructor(nome, artista) {
    this.nome = nome;
    this.artista = artista;
    this.partes = [];
  }

  addParte(parte) {
    // Removi a validação rígida de "tag" porque a tag pode ser nula no banco
    if (!parte || !parte.letra || parte.tempoEspera === undefined) {
      throw new Error("Parte da Musica com problema!");
    }

    this.partes.push(parte);
  }

  getLetraInteira() {
    let letra = "";
    this.partes.forEach((parte) => {
      letra += parte.letra;
    });
    return letra;
  }
}

module.exports = { Musica };
