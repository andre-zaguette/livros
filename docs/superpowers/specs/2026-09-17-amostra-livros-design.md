# Livros — Amostras gratuitas de livros com captura de leads

Data: 2026-09-17

## Objetivo

Plataforma web onde o autor publica amostras gratuitas de livros (capítulos de
degustação), visitantes leem a amostra online sem poder baixá-la, e quem
quiser saber mais deixa nome/e-mail para ser avisado quando o livro for
lançado.

## Escopo

Inclui:

- Painel admin (usuário único) para cadastrar livros e subir o PDF de
  amostra.
- Conversão automática do PDF em páginas-imagem.
- Leitor de amostra tipo "flipbook" no site público, sem opção de download.
- Formulário de captura de lead (nome + e-mail) por livro.
- Lista de leads por livro no admin, com exportação em CSV.

Não inclui (fora do MVP):

- Múltiplos usuários admin / multi-tenant.
- Envio automático de e-mail ou integração com ferramenta de e-mail
  marketing.
- Venda ou distribuição do livro completo.
- Proteção contra print/screenshot (fora do alcance de qualquer solução
  web).

## Arquitetura

- **Aplicação**: Next.js (App Router), servindo tanto o site público quanto
  o painel admin e as rotas de API.
- **Banco de dados**: PostgreSQL.
- **Conversão de PDF**: `poppler-utils` (`pdftoppm`) instalado na imagem
  Docker da aplicação, invocado via `child_process` a partir de uma rota de
  API quando um PDF é enviado pelo admin.
- **Armazenamento de arquivos**: volume Docker montado no container da
  aplicação, guardando o PDF original (não servido publicamente) e as
  imagens de página geradas.
- **Deploy**: tudo em containers Docker no próprio servidor/VPS do autor,
  orquestrado via `docker-compose` (serviço da aplicação + serviço do
  Postgres).

Nenhum serviço externo é necessário para rodar a plataforma.

## Modelo de dados

### `books`

| campo         | tipo        | notas                                                   |
|---------------|-------------|----------------------------------------------------------|
| id            | uuid pk     |                                                            |
| title         | text        |                                                            |
| author        | text        |                                                            |
| synopsis      | text        |                                                            |
| cover_path    | text        | caminho do arquivo de capa no volume                      |
| status        | enum        | `coming_soon` \| `sample_available` \| `launched`          |
| page_count    | int         | nº de páginas da amostra convertida (0 se ainda não subiu) |
| created_at    | timestamptz |                                                            |
| updated_at    | timestamptz |                                                            |

### `book_pages`

| campo      | tipo    | notas                                  |
|------------|---------|------------------------------------------|
| id         | uuid pk |                                            |
| book_id    | uuid fk | referencia `books`                        |
| page_number| int     | 1-indexado                                |
| image_path | text    | caminho do arquivo de imagem no volume    |

### `leads`

| campo      | tipo        | notas                                                |
|------------|-------------|-------------------------------------------------------|
| id         | uuid pk     |                                                         |
| book_id    | uuid fk     | referencia `books`                                     |
| name       | text        | opcional                                               |
| email      | text        | obrigatório, validado                                  |
| created_at | timestamptz |                                                         |

Constraint: `unique (book_id, email)` — o mesmo e-mail não se cadastra duas
vezes para o mesmo livro, mas pode se cadastrar em livros diferentes.

Sessão do admin não usa tabela: autenticação por senha única (variável de
ambiente) + cookie de sessão assinado (ex.: `iron-session`).

## Fluxo: upload e conversão de amostra

1. Admin cria/edita um livro e envia um PDF pelo formulário de upload.
2. A rota de API salva o PDF no volume (fora da pasta pública), enfileira a
   conversão.
3. `pdftoppm` gera uma imagem JPEG por página no volume.
4. Uma linha é criada em `book_pages` por página gerada; `books.page_count`
   é atualizado.
5. Se a conversão falhar (PDF corrompido, timeout), o admin vê um erro
   claro e pode tentar novamente; nenhuma página parcial fica visível
   publicamente até a conversão terminar com sucesso.

## Leitor de amostra (site público)

- Uma página por vez (double-page em telas largas), navegação por clique
  nas bordas / setas do teclado.
- Cada imagem de página é servida por uma rota de API própria (não um
  caminho estático previsível), carregada via `<canvas>` em vez de
  `<img src>` — dificulta "salvar imagem como" pelo menu do navegador.
- Sem botão de download; menu de clique-direito (`contextmenu`) desabilitado
  na área do leitor.
- Isso cobre o caso comum de alguém tentar baixar/imprimir a amostra
  inteira; não impede screenshot manual, o que é aceito como limitação de
  qualquer solução baseada em navegador.
- Se o livro não tem amostra publicada (`page_count = 0` ou status
  `coming_soon`), a página do livro mostra só sinopse + formulário de
  aviso, sem o botão "Ler amostra".

## Painel admin

- Login único (formulário de senha, comparada com variável de ambiente;
  em caso de sucesso, cookie de sessão assinado).
- CRUD de livros (título, autor, sinopse, capa, status).
- Upload de PDF de amostra por livro (ver fluxo de conversão acima).
- Lista de leads por livro (nome, e-mail, data), com botão de exportação em
  CSV.

## Site público

- Página inicial: grade de livros publicados, com capa, título e status.
- Página de cada livro: sinopse, botão "Ler amostra" (quando disponível) e
  formulário "Avise-me quando lançar" (nome opcional + e-mail obrigatório).
- Envio do formulário grava um `lead`; se o e-mail já existe para aquele
  livro, mostra mensagem "você já está na lista" em vez de erro.

## Testes

- Testes de integração para as rotas de API mais fáceis de quebrar
  silenciosamente:
  - upload de PDF → geração correta de `book_pages` e `page_count`.
  - submissão de lead: validação de e-mail, constraint de duplicidade.
- Sem suíte E2E completa no MVP.

## Deploy

- `docker-compose.yml` com dois serviços: `app` (Next.js + poppler-utils) e
  `db` (Postgres), mais um volume nomeado para os arquivos de mídia.
- Variáveis de ambiente: string de conexão do Postgres, senha do admin,
  segredo de assinatura de sessão.
