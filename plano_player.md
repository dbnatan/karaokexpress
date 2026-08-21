# Plano do Player de Karaokê

## 1 Elementos da tela

- Um título indicando que a página é um player de karaokê.
- Uma lista mostrando todas as músicas disponíveis.
- O nome da música selecionada.
- O nome do artista.
- Um espaço para mostrar a letra de cada parte da música.
- Um espaço para mostrar a tag da parte atual.
- Um botão "Tocar".
- Um contador ou indicação do andamento da música.

## 2 Rotas consumidas

- GET /api/musicas — será usada quando a página carregar para buscar a lista de músicas disponíveis.
- GET /api/musicas/:id — será usada quando uma música for escolhida para buscar seus dados e suas partes.

## 3 Fluxo

1. O usuário abre a página do player.
2. O player faz uma requisição para buscar todas as músicas.
3. As músicas recebidas são mostradas na lista.
4. O usuário escolhe uma música.
5. O player busca os dados da música escolhida, incluindo suas partes.
6. O nome da música e o artista são mostrados na tela.
7. O botão "Tocar" é habilitado.
8. Quando o usuário clicar em "Tocar", a primeira parte da música aparece na tela.
9. O player espera o tempo definido em tempoEspera.
10. Depois, a próxima parte aparece.
11. Esse processo continua até todas as partes da música serem exibidas.
12. Quando a última parte terminar, a reprodução chega ao final.

## 4 Assíncrono

- Será usado async/await nas requisições feitas à API, porque é necessário esperar o servidor responder antes de utilizar os dados recebidos.
- Também será necessário aguardar o tempoEspera de cada parte antes de mostrar a próxima.
- Dessa forma, as partes aparecem na ordem e no tempo definido para cada uma.


# O que foi diferente

- No plano, eu imaginei que a música seria carregada de uma forma mais direta, mas durante a implementação ela passou a ser carregada pelo DAO e pela API.

- Eu não tinha previsto que seria necessário adaptar a música que eu já tinha feito anteriormente para a estrutura do novo projeto.

- A reprodução da música foi mais simples do que eu imaginava, pois depois que a música completa é recebida pela API, o navegador consegue percorrer as partes usando o tempo de espera de cada uma.

- Também foi necessário adaptar as partes da música para o formato utilizado pelo novo player, mantendo a letra, a tag e o tempo de espera.