import { pgTable, uuid, text, integer, smallint, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core'

export const bookStatusEnum = pgEnum('book_status', ['coming_soon', 'sample_available', 'launched'])

export const books = pgTable('books', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  synopsis: text('synopsis').notNull().default(''),
  coverPath: text('cover_path'),
  status: bookStatusEnum('status').notNull().default('coming_soon'),
  pageCount: integer('page_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const bookPages = pgTable('book_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookId: uuid('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  pageNumber: integer('page_number').notNull(),
  imagePath: text('image_path').notNull(),
})

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookId: uuid('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  name: text('name'),
  email: text('email').notNull(),
  rating: smallint('rating'),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  bookEmailUnique: unique('leads_book_id_email_unique').on(table.bookId, table.email),
}))
