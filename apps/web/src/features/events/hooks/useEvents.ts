import { useQuery } from '@tanstack/react-query';
import { eventsService } from '../services/events.service';
export function useEvents(query = '') {
  return useQuery({ queryKey: ['events', query], queryFn: () => eventsService.list(query) });
}
