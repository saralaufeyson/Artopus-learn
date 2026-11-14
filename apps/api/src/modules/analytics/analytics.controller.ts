import type { RequestHandler } from 'express';
import { analyticsService } from './analytics.service.js';
export const analyticsController = {
  total: (async (_request, response) => { response.json({ data: await analyticsService.total() }); }) satisfies RequestHandler,
  record: (async (request, response) => { response.json({ data: await analyticsService.record(request.body) }); }) satisfies RequestHandler,
};
