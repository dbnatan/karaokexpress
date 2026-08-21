# Parte 1 - Revisão Técnica do Servidor

## 1.1 Status Codes HTTP

- 200 OK: utilizado quando uma requisição é realizada com sucesso, como nos GETs e em atualizações.
- 201 Created: utilizado quando uma nova música ou parte é criada com sucesso.
- 400 Bad Request: utilizado quando os dados enviados pelo cliente estão incompletos ou inválidos.
- 404 Not Found: utilizado quando a música solicitada não existe.
- 500 Internal Server Error: utilizado quando ocorre um erro inesperado no servidor, como uma exceção não tratada.

## 1.2 Content-Type

- O que é o cabeçalho Content-Type e por que ele é relevante?

O Content-Type é um cabeçalho HTTP que informa qual é o tipo de conteúdo que está sendo enviado na resposta. Ele é importante porque permite que o cliente saiba como interpretar os dados recebidos.

- Quando usamos res.send() com uma string HTML, qual ContentType o Express define?

Quando usamos res.send() enviando uma string HTML, o Express define o Content-Type como text/html; charset=utf-8.

- Qual a diferença prática entre res.json() e res.send() em termos de Content-Type?

A diferença prática é que res.json() é próprio para enviar dados no formato JSON, enquanto res.send() pode enviar diferentes tipos de conteúdo, como HTML ou texto, dependendo do que for passado para ele.

## 1.3 Tratamento de Erros

- O que acontece se o cliente enviar um body que não é JSON válido?

Quando o cliente envia um JSON inválido, o express.json() identifica o erro e a requisição resulta em 400 Bad Request. A mensagem informa que o JSON enviado é inválido.

- O que acontece se o servidor lançar uma exceção não tratada dentro de uma rota? O cliente recebe alguma mensagem útil?

Se o servidor lançar uma exceção não tratada dentro de uma rota, o middleware de tratamento de erros será acionado. O cliente receberá uma resposta 500 Internal Server Error com a mensagem "Erro interno do servidor", enquanto o erro detalhado será exibido no console do servidor.

- Tarefa prática: Foi enviada uma requisição POST para /api/musicas contendo um JSON inválido. O servidor retornou 400 Bad Request e a mensagem: "JSON inválido no corpo da requisição". Isso confirma que o middleware identifica o erro de JSON malformado como um erro 400, pois o problema está nos dados enviados pelo cliente.


# Parte 4 - Testes HTTP

## 4.3 Teste 1 — Debugger na rota GET /api/musicas

Coloquei um breakpoint na linha const musicas = musicaDAO.listarTodas(); e enviei a requisição GET /api/musicas.

O programa parou no breakpoint e foi possível observar as variáveis req e res. A variável this apareceu como undefined.

Ao pressionar F10, o código avançou linha por linha. Depois, ao pressionar F5, o programa continuou normalmente.

## 4.3 Teste 2 — Debugger na rota GET /api/musicas/:id

Coloquei um breakpoint na linha const id = Number(req.params.id); e enviei uma requisição para buscar a música de id 0.

O debugger mostrou o parâmetro id recebido pela URL e permitiu acompanhar sua conversão para número. Com o F10, acompanhei a execução linha por linha e, com o F5, continuei a execução normalmente.


# Parte 5 - Perguntas para Responder

## 1 Status Codes

- Liste os 5 status codes HTTP mais comuns em APIs REST e dê um exemplo de quando cada um é usado.

200 OK: Indica que a requisição foi realizada com sucesso. Exemplo: quando fazemos um GET para buscar uma música existente.
201 Created: Indica que um novo recurso foi criado com sucesso. Exemplo: quando fazemos um POST para cadastrar uma nova música.
400 Bad Request: Indica que a requisição enviada pelo cliente possui algum problema. Exemplo: quando o cliente envia um JSON inválido ou deixa campos obrigatórios faltando.
404 Not Found: Indica que o recurso solicitado não foi encontrado. Exemplo: quando tentamos buscar uma música com um ID que não existe.
500 Internal Server Error: Indica que ocorreu um erro inesperado no servidor. Exemplo: quando acontece uma exceção não tratada durante o processamento de uma requisição.

## 2 Content-Type

- Qual a diferença entre enviar uma resposta com Content-Type: application/json e Content-Type: text/html? Por que o cliente (navegador, REST Client) precisa dessa informação?

O Content-Type: application/json indica que a resposta contém dados no formato JSON, enquanto Content-Type: text/html indica que a resposta contém HTML. Essa informação é importante porque permite que o cliente saiba como interpretar o conteúdo recebido.

## 3 DAO e Persistência

- Explique com suas palavras o que é o padrão DAO. Qual problema ele resolve?

O DAO (Data Access Object) é um padrão que separa o código responsável pelo acesso e manipulação dos dados do restante da aplicação. Ele facilita a organização do código e permite que as rotas não precisem conhecer diretamente como os dados são armazenados.

- O que acontece com os dados quando reiniciamos o servidor?

Os dados são perdidos, porque o nosso DAO atualmente mantém as músicas em memória. Quando o servidor é encerrado, os dados que estavam na memória são apagados.

- O que precisaríamos mudar no DAO para os dados sobreviverem a uma reinicialização?

Seria necessário utilizar uma forma de armazenamento permanente, como um arquivo, banco de dados ou outro sistema de persistência. O DAO precisaria salvar os dados nesse armazenamento e carregá-los novamente quando o servidor fosse iniciado.

## 4 Singleton

- No musicaDAO.js , exportamos new MusicaDAO() em vez de exportar a classe. O que aconteceria se exportássemos a classe e cada arquivo que importasse criasse seu próprio new MusicaDAO()?

No musicaDAO.js, exportamos new MusicaDAO() para que os arquivos que importam o DAO utilizem a mesma instância e compartilhem os mesmos dados. Se exportássemos apenas a classe e cada arquivo criasse seu próprio new MusicaDAO(), cada instância teria seus próprios dados. Assim, uma parte da aplicação poderia não enxergar as alterações feitas por outra.

## 5 PUT vs POST

- Qual a diferença semântica entre PUT e POST? Se quisermos apenas alterar o artista de uma música (sem enviar o nome novamente), qual verbo HTTP seria mais adequado?

POST é utilizado principalmente para criar novos recursos ou realizar operações em que o servidor determina o recurso criado. PUT é utilizado para atualizar ou substituir um recurso existente. Se quisermos alterar apenas o artista de uma música sem enviar novamente o nome, o verbo mais adequado seria PATCH, pois ele é utilizado para realizar uma alteração parcial em um recurso.

## 6 Erro do cliente vs erro do servidor

- Por que um JSON mal-formado enviado pelo cliente deve retornar 400 e não 500? Explique a diferença entre as famílias de status 4xx e 5xx usando o middleware da Parte 1.3 como exemplo.

Um JSON malformado enviado pelo cliente deve retornar 400 porque o problema está na requisição enviada pelo cliente, e não no funcionamento do servidor. Os códigos da família 4xx representam erros causados pela requisição do cliente. Já os códigos da família 5xx representam erros que acontecem no servidor. No nosso middleware, um JSON malformado possui err.status = 400, então retornamos 400 Bad Request. Já um erro inesperado que não possui esse status é tratado como 500 Internal Server Error.

## 7 Front e API

- No player que vocês vão construir (Partes 6 e 7), quando o usuário clica em Tocar, nenhuma requisição é feita ao servidor. Por
quê? Onde os dados da música já estavam?

Quando o usuário clica em "Tocar", nenhuma requisição é feita porque os dados da música já foram buscados anteriormente pela API, quando o usuário selecionou a música. A música escolhida e suas partes ficam armazenadas na variável musicaAtual no navegador. Assim, o player apenas percorre essas partes e utiliza tempoEspera, sem precisar consultar o servidor novamente.