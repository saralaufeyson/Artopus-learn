import { useQuery } from '@tanstack/react-query';
import { blogsService } from '../services/blogs.service';
export function useBlogs(query = '') {
  return useQuery({ queryKey: ['blogs', query], queryFn: () => blogsService.list(query) });
}
