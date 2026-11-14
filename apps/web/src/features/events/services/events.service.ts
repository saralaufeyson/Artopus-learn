import type { ArtEvent, PaginatedResult } from '@artopus/shared';
import { apiRequest } from '../../../services/api-client';
export const eventsService = {
  list: (query = '') => apiRequest<PaginatedResult<ArtEvent>>('/events' + (query ? '?' + query : '')),
  getBySlug: (slug: string) => apiRequest<ArtEvent>('/events/' + encodeURIComponent(slug)),
};
