import { describe, it, expect } from 'vitest'
import { bookStatusLabel } from '@/lib/book-status'

describe('bookStatusLabel', () => {
  it('translates each status to Portuguese', () => {
    expect(bookStatusLabel('coming_soon')).toBe('Em breve')
    expect(bookStatusLabel('sample_available')).toBe('Amostra disponível')
    expect(bookStatusLabel('launched')).toBe('Lançado')
  })
})
