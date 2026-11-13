# Trabalho Integrador - Karaokê com Banco de Dados

Disciplina: Programação III - IFSul Campus Passo Fundo
Integrantes: Natan Dias Barbosa, Samara Koike Bessegatto e Sarah Schuster de Brum

## URL Pública

https://karaokexpress.onrender.com

## Como instalar e executar localmente

1. Clone o repositório.
2. Instale as dependências executando: `npm install`
3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (sem valores reais):
   SUPABASE_URL=sua_url_aqui
   SUPABASE_SECRET_KEY=sua_chave_aqui
4. Execute o projeto com: `node app.js`
5. Acesse no navegador: `http://localhost:3000`

## Decisão da dupla

Optamos por manter a lógica de manipulação das tabelas `musicas`, `artistas` e `partes` centralizada dentro do próprio `MusicaDAO`. Isso simplificou a comunicação com o banco de dados e permitiu implementar a regra de negócio de "buscar ou criar artista" no momento do cadastro de uma nova música, sem a necessidade de criar arquivos DAO adicionais.

## Uso de IA

Ferramenta utilizada: DeepSeek.
Em que ajudou: A IA foi utilizada para auxiliar na migração do DAO que usava array em memória para a integração com o Supabase, além de apoiar na correção de erros de configuração de variáveis de ambiente e publicação na Render.
Como conferimos: Todo o código gerado com apoio da IA foi testado pela dupla localmente e na URL pública, validando o CRUD completo, a persistência dos dados após reinício e o funcionamento do player.

## Registro de Marcos

(Data: [30/10]): Lista de músicas vinda da API funcionando e banco de dados configurado no Supabase.
(Data: [30/10]): Cadastro de música pela tela funcionando e teste de persistência local confirmado após reiniciar o servidor.
(Data: [13/11]): Edição, exclusão, validação de campos vazios e player conferidos e funcionando.
(Data: [13/11]): Publicação na Render concluída, persistência na URL pública testada e README finalizado.
