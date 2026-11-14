import { useQuery } from '@tanstack/react-query';
import { classesService } from '../services/classes.service';
export function useClasses(query = '') {
  return useQuery({ queryKey: ['classes', query], queryFn: () => classesService.list(query) });
}
