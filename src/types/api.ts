export interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
  timestamp: string
  path: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}
