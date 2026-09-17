import { describe, it, expect } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { books, bookPages, leads } from '@/db/schema'

describe('database schema', () => {
  it('inserts and reads a book, a page, and a lead', async () => {
    const [book] = await db.insert(books).values({
      title: 'Livro de Teste',
      author: 'Autor de Teste',
      synopsis: 'Uma sinopse de teste',
    }).returning()

    expect(book.status).toBe('coming_soon')
    expect(book.pageCount).toBe(0)

    const [page] = await db.insert(bookPages).values({
      bookId: book.id,
      pageNumber: 1,
      imagePath: '/media/test/page-1.jpg',
    }).returning()

    expect(page.bookId).toBe(book.id)

    const [lead] = await db.insert(leads).values({
      bookId: book.id,
      email: 'leitor@example.com',
      rating: 5,
      comment: 'Adorei a amostra!',
    }).returning()

    expect(lead.email).toBe('leitor@example.com')
    expect(lead.rating).toBe(5)

    const foundBook = await db.query.books.findFirst({ where: eq(books.id, book.id) })
    expect(foundBook?.title).toBe('Livro de Teste')

    await db.delete(leads).where(eq(leads.id, lead.id))
    await db.delete(bookPages).where(eq(bookPages.id, page.id))
    await db.delete(books).where(eq(books.id, book.id))
  })

  it('rejects a duplicate email for the same book', async () => {
    const [book] = await db.insert(books).values({
      title: 'Livro Duplicado',
      author: 'Autor',
      synopsis: '',
    }).returning()

    await db.insert(leads).values({ bookId: book.id, email: 'dup@example.com' })

    await expect(
      db.insert(leads).values({ bookId: book.id, email: 'dup@example.com' })
    ).rejects.toThrow()

    await db.delete(leads).where(eq(leads.bookId, book.id))
    await db.delete(books).where(eq(books.id, book.id))
  })
})
