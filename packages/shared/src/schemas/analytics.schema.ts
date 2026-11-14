import { z } from 'zod';
export const pageViewInputSchema = z.object({
  path: z.string().max(169).regex(/^(?:\/|\/(?:about|contact|blog|events|classes)|\/(?:blog|events|classes)\/[a-z0-9]+(?:-[a-z0-9]+)*)$/, 'Use a public page path without a query or fragment.'),
}).strict();
export type PageViewInput = z.infer<typeof pageViewInputSchema>;
export interface PageViewTotal { total: number }
export interface PageViewSummary extends PageViewTotal {
  pages: { path: string; views: number }[];
}
