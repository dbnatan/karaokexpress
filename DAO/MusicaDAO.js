const { Musica } = require('../karaoke/musica');
const { Parte } = require('../karaoke/parte');

class MusicaDAO {
    constructor() {
        // "banco de dados" em memória — array de objetos Musica
        this.musicas = [];
        this.proximoId = 0;

        this._carregarDadosIniciais();
    }

    // Retorna todas as músicas
    listarTodas() {
        return this.musicas;
    }

    // Busca uma música pelo ID
    buscarPorId(id) {
        return this.musicas.find(m => m.id === id) || null;
    }

    // Insere uma nova música e retorna o objeto criado (com ID)
    inserir(nome, artista) {
        const novaMusica = new Musica(nome, artista);
        novaMusica.id = this.proximoId++;
        this.musicas.push(novaMusica);
        return novaMusica;
    }

    // Adiciona uma Parte a uma música existente
    adicionarPartes(idMusica, parte) {
        if (parte instanceof Parte) {
            const musica = this.buscarPorId(idMusica);

            if (musica != null) {
                musica.addParte(parte);
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    // Atualiza nome e artista de uma música existente
    atualizar(id, nome, artista) {
        const musica = this.buscarPorId(id);

        if (!musica) return null;

        musica.nome = nome;
        musica.artista = artista;

        return musica;
    }

    // Remove uma música pelo ID
    remover(id) {
        const indice = this.musicas.findIndex(m => m.id === id);

        if (indice === -1) return null;

        return this.musicas.splice(indice, 1)[0];
    }

    // Carrega os dados iniciais
    _carregarDadosIniciais() {
        const myHero = this.inserir('My Hero', 'Foo Fighters');

        myHero.addParte(new Parte(
            'Too alarmin now to talk about\nTake your pictures down and shake it out',
            11000,
            'verso1'
        ));

        myHero.addParte(new Parte(
            'Truth or consequence, say it aloud\nUse that evidence, race it around',
            10000,
            'verso2'
        ));

        myHero.addParte(new Parte(
            'There goes my hero',
            4000,
            'refrão1'
        ));

        myHero.addParte(new Parte(
            'Watch him as he goes',
            4000,
            'refrão2'
        ));

        myHero.addParte(new Parte(
            "He's ordinary",
            5000,
            'refrão3'
        ));

        myHero.addParte(new Parte(
            "Don't the best of them bleed it out",
            5000,
            'verso3'
        ));

        myHero.addParte(new Parte(
            'While the rest of them peter out?',
            5000,
            'verso4'
        ));

        myHero.addParte(new Parte(
            'Kudos, my hero\nLeavin all the best',
            6000,
            'refrão4'
        ));

        myHero.addParte(new Parte(
            'You know my hero\nThe one thats on',
            6000,
            'refrão5'
        ));

        
        const decida = this.inserir('Decida', 'Milionário & José Rico');

        decida.addParte(new Parte( //tive que modificar essa parte que estava no antigo karaokê para se encaixar no DAO
            'Sente aqui comigo no sofá e vamos conversar \nÉ hora de abrir o jogo',
            8000,
            'verso1'
        ));

        decida.addParte(new Parte(
            'Nosso amor está indo água abaixo \nSe deixar, vira relaxo \nTemporal apaga o fogo',
            7000,
            'verso2'
        ));

        decida.addParte(new Parte(
            'Por que você não olha nos meus olhos? \nSeu beijo não tem o mesmo sabor',
            4000,
            'verso3'
        ));

        decida.addParte(new Parte(
            'O seu carinho não me faz dormir \nNem sua quando a gente faz amor',
            7000,
            'verso4'
        ));

        decida.addParte(new Parte(
            'Você só vai tomar banho sozinha \nNa hora do jantar, me diz que já comeu',
            7000,
            'verso5'
        ));

        decida.addParte(new Parte(
            'Não vê novelas e nem liga o som \nDiz que não tem nada bom que satisfaça o ego seu',
            8000,
            'verso6'
        ));

        decida.addParte(new Parte(
            'Você se esqueceu \nQue dentro desta casa eu existo',
            8000,
            'verso7'
        ));

        decida.addParte(new Parte(
            'Que em 82 casou comigo \nPor isso exijo uma explicação',
            6000,
            'verso8'
        ));

        decida.addParte(new Parte(
            'Se sou eu que te incomoda \nPra te fazer feliz, fiz o que pude',
            6000,
            'verso9'
        ));

        decida.addParte(new Parte(
            'Mas o incomodado é que se mude \nVocê quem vai tomar a decisão',
            7000,
            'verso10'
        ));

        decida.addParte(new Parte(
            'Decida \nSe vai embora ou ficar comigo',
            7000,
            'refrao1'
        ));

        decida.addParte(new Parte(
            'Se vai me respeitar como marido \nPois desse jeito não estou aguentando',
            7000,
            'refrao2'
        ));

        decida.addParte(new Parte(
            'Decida \nOu pare de uma vez com esse delírio',
            7000,
            'refrao3'
        ));

        decida.addParte(new Parte(
            'Talvez você precise usar colírio \nPra enxergar o quanto ainda te amo',
            7000,
            'refrao4'
        ));
    }
}

// Exporta uma INSTÂNCIA única (Singleton)
module.exports = new MusicaDAO();
