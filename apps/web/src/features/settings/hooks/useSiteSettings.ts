import { useQuery } from '@tanstack/react-query';
import { settingsQuery } from '../../../services/public-queries';
export function useSiteSettings() { return useQuery(settingsQuery()); }
