// player.js — o cérebro do player no navegador
// Completem os TODOs seguindo o roteiro da Parte 7 do enunciado.
// (Antes de mexer aqui, o plano_player.md já deve estar commitado!)

// --- Referências aos elementos da página (index.html) ---
const listaEl = document.getElementById('listaMusicas');
const nomeEl = document.getElementById('nomeMusica');
const artistaEl = document.getElementById('artista');
const tagEl = document.getElementById('tag');
const letraEl = document.getElementById('letra');
const contadorEl = document.getElementById('contador');
const btnTocar = document.getElementById('btnTocar');

// --- Estado do player ---
// Guarda a música escolhida (objeto completo, com as partes)
let musicaAtual = null;

// O mesmo sleep do karaokê no terminal, agora no navegador
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Passo 2 (roteiro 7.3) — busca GET /api/musicas e monta a playlist
async function carregarPlaylist() {
    const resposta = await fetch('/api/musicas');
    const musicas = await resposta.json();

    for (const musica of musicas) {
        const item = document.createElement('li');

        item.textContent = musica.nome + ' — ' + musica.artista;
        item.addEventListener('click', () => escolherMusica(musica.id));
        listaEl.appendChild(item);
    }
}

// Passo 3 (roteiro 7.4) — busca GET /api/musicas/:id e prepara o palco
async function escolherMusica(id) {
    const resposta = await fetch('/api/musicas/' + id);
    const musica = await resposta.json();

    musicaAtual = musica;

    nomeEl.textContent = musica.nome;
    artistaEl.textContent = musica.artista;

    btnTocar.disabled = false;
}

// Passo 4 (roteiro 7.5) — percorre as partes com await sleep até o final
async function tocar() {
    btnTocar.disabled = true;

    for (let i = 0; i < musicaAtual.partes.length; i++) {
        const parte = musicaAtual.partes[i];

        tagEl.textContent = parte.tag;
        letraEl.textContent = parte.letra;
        contadorEl.textContent = 'Parte ' + (i + 1) + ' de ' + musicaAtual.partes.length;

        await sleep(parte.tempoEspera);
    }

    tagEl.textContent = '';
    letraEl.textContent = '🎤 Fim! Escolha outra música.';
    contadorEl.textContent = '';

    btnTocar.disabled = false;
}

btnTocar.addEventListener('click', tocar);

// Ponto de partida: quando a página carrega, monta a playlist
carregarPlaylist();
