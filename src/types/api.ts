export interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
  timestamp: string
  path: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
