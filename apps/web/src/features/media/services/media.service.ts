import type { MediaAsset, PaginatedResult } from '@artopus/shared';
import { apiRequest } from '../../../services/api-client';
export function listMedia() { return apiRequest<PaginatedResult<MediaAsset>>('/admin/media'); }
