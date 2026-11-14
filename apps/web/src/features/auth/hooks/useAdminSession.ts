import { useQuery } from '@tanstack/react-query';
import { getAdminSession } from '../services/auth.service';
export function useAdminSession() {
  return useQuery({ queryKey: ['admin-session'], queryFn: getAdminSession, retry: false });
}
