import type { ClassOffering, PaginatedResult } from '@artopus/shared';
import { apiRequest } from '../../../services/api-client';
export const classesService = {
  list: (query = '') => apiRequest<PaginatedResult<ClassOffering>>('/classes' + (query ? '?' + query : '')),
  getBySlug: (slug: string) => apiRequest<ClassOffering>('/classes/' + encodeURIComponent(slug)),
};
