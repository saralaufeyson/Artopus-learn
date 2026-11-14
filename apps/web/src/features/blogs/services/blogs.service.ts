import type { BlogPost, PaginatedResult } from '@artopus/shared';
import { apiRequest } from '../../../services/api-client';
export const blogsService = {
  list: (query = '') => apiRequest<PaginatedResult<BlogPost>>('/blogs' + (query ? '?' + query : '')),
  getBySlug: (slug: string) => apiRequest<BlogPost>('/blogs/' + encodeURIComponent(slug)),
};
