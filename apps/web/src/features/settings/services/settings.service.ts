import type { SiteSettingsInput } from '@artopus/shared';
import { apiRequest } from '../../../services/api-client';
// Populated image DTOs will be introduced alongside settings integration.
export function getSiteSettings() { return apiRequest<SiteSettingsInput>('/settings'); }
