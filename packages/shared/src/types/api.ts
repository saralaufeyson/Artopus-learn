export interface ApiSuccess<T> { data: T }
export interface ApiErrorBody { error: { code: string; message: string; details?: unknown } }
export interface PaginatedResult<T> { items: T[]; page: number; limit: number; total: number }
export interface RecordMetadata { id: string; createdAt: string; updatedAt: string }
export interface AdminSession { id: string; name: string; email: string; role: 'admin' | 'editor' }
