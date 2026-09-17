export type BookStatus = 'coming_soon' | 'sample_available' | 'launched'

const LABELS: Record<BookStatus, string> = {
  coming_soon: 'Em breve',
  sample_available: 'Amostra disponível',
  launched: 'Lançado',
}

export function bookStatusLabel(status: BookStatus): string {
  return LABELS[status]
}
