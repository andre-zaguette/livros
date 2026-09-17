# Livros

A book-sample platform built with Next.js and PostgreSQL.

## Desenvolvimento local

1. `cp .env.example .env` e ajuste os valores.
2. `docker compose up -d db`
3. `npm install`
4. `npm run db:migrate`
5. `npm run dev` (app em http://localhost:3000, health check em /api/health)
6. `npm test` para rodar os testes (requer o banco do passo 2 no ar)

## Docker (produção)

`docker compose up -d --build` sobe a aplicação e o banco juntos.
